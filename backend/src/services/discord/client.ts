/**
 * Discord Client Manager
 * Gestion du client Discord et des événements
 */

import { Client, Events } from 'discord.js'
import { Logger } from '@/lib/logger'
import { DISCORD_CONFIG } from './config'
import { DiscordEventData, DiscordEventType } from './types'
import { AreaExecutor } from './executors/area-executor'
import { CommandHandler } from './handlers/command-handler'
import { EventHandler } from './handlers/event-handler'

export class DiscordClientManager {
  private static instance: DiscordClientManager
  private client: Client | null = null
  private areaExecutor: AreaExecutor
  private commandHandler: CommandHandler
  private eventHandler: EventHandler
  private isConnected = false

  private constructor() {
    this.areaExecutor = new AreaExecutor()
    this.commandHandler = new CommandHandler(this.areaExecutor)
    this.eventHandler = new EventHandler(this.areaExecutor)
  }

  public static getInstance(): DiscordClientManager {
    if (!DiscordClientManager.instance) {
      DiscordClientManager.instance = new DiscordClientManager()
    }
    return DiscordClientManager.instance
  }

  public async initialize(): Promise<void> {
    if (this.client) {
      Logger.warn('Discord client already initialized')
      return
    }

    if (!DISCORD_CONFIG.token) {
      throw new Error('DISCORD_TOKEN is required')
    }

    if (!DISCORD_CONFIG.applicationId) {
      throw new Error('DISCORD_APPLICATION_ID is required')
    }

    this.client = new Client({
      intents: DISCORD_CONFIG.intents
    })

    this.setupEventListeners()

    try {
      await this.client.login(DISCORD_CONFIG.token)
      Logger.info('Discord client initialized successfully', {
        tag: this.client.user?.tag
      })
    } catch (error) {
      Logger.error('Failed to initialize Discord client', { error })
      throw error
    }
  }

  private setupEventListeners(): void {
    if (!this.client) return

    // Client ready
    this.client.once(Events.ClientReady, () => {
      this.isConnected = true
      Logger.info('Discord bot connected', {
        tag: this.client?.user?.tag,
        guilds: this.client?.guilds.cache.size
      })
    })

    // Command interactions
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return
      await this.commandHandler.handleCommand(interaction)
    })

    // Message events
    this.client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return
      await this.eventHandler.handleMessageCreate(message)
    })

    // Member events
    this.client.on(Events.GuildMemberAdd, async (member) => {
      await this.eventHandler.handleGuildMemberAdd(member)
    })

    this.client.on(Events.GuildMemberRemove, async (member) => {
      await this.eventHandler.handleGuildMemberRemove(member)
    })

    // Reaction events
    this.client.on(Events.MessageReactionAdd, async (reaction, user) => {
      await this.eventHandler.handleMessageReactionAdd(reaction, user)
    })

    // Error handling
    this.client.on('error', (error) => {
      Logger.error('Discord client error', { error })
    })

    this.client.on('warn', (warning) => {
      Logger.warn('Discord client warning', { warning })
    })
  }

  public async triggerAreas(eventType: DiscordEventType, eventData: DiscordEventData): Promise<void> {
    try {
      await this.areaExecutor.triggerDiscordAreas(eventType, eventData)
    } catch (error) {
      Logger.error('Error triggering areas', { eventType, error })
    }
  }

  public async executeArea(areaId: string, eventData: DiscordEventData = {}): Promise<any> {
    return await this.areaExecutor.executeAreaById(areaId, eventData)
  }

  public isReady(): boolean {
    return this.isConnected && this.client?.isReady() === true
  }

  public getClient(): Client | null {
    return this.client
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      this.client.destroy()
      this.client = null
      this.isConnected = false
      Logger.info('Discord client disconnected')
    }
  }
}