/**
 * Discord Event Handler
 * Gestion des événements Discord (messages, membres, réactions, etc.)
 */

import { Message, GuildMember, MessageReaction, User, PartialUser, PartialGuildMember, PartialMessageReaction } from 'discord.js'
import { Logger } from '@/lib/logger'
import { DiscordEventData } from '../types'
import { AreaExecutor } from '../executors/area-executor'

export class EventHandler {
  constructor(private areaExecutor: AreaExecutor) {}

  /**
   * Gère l'événement MessageCreate
   */
  public async handleMessageCreate(message: Message): Promise<void> {
    try {
      const eventData: DiscordEventData = {
        message: message.content,
        author: message.author.tag,
        authorId: message.author.id,
        channel: message.channel.type === 0 ? (message.channel as any).name : 'DM',
        channelId: message.channelId,
        guild: message.guild?.name,
        guildId: message.guild?.id,
        timestamp: message.createdAt.toISOString()
      }

      Logger.debug('Discord message created', {
        messageId: message.id,
        author: message.author.tag,
        channel: eventData.channel,
        guild: eventData.guild,
        contentLength: message.content.length
      })

      await this.areaExecutor.triggerDiscordAreas('messageCreate', eventData)

    } catch (error) {
      Logger.error('Error handling MessageCreate event', {
        messageId: message.id,
        error
      })
    }
  }

  /**
   * Gère l'événement GuildMemberAdd
   */
  public async handleGuildMemberAdd(member: GuildMember): Promise<void> {
    try {
      const eventData: DiscordEventData = {
        user: member.user.tag,
        userId: member.user.id,
        guild: member.guild.name,
        guildId: member.guild.id,
        timestamp: new Date().toISOString()
      }

      Logger.info('Discord member joined', {
        userId: member.user.id,
        userTag: member.user.tag,
        guild: member.guild.name,
        joinedAt: member.joinedAt
      })

      await this.areaExecutor.triggerDiscordAreas('guildMemberAdd', eventData)

    } catch (error) {
      Logger.error('Error handling GuildMemberAdd event', {
        userId: member.user.id,
        guildId: member.guild.id,
        error
      })
    }
  }

  /**
   * Gère l'événement GuildMemberRemove
   */
  public async handleGuildMemberRemove(member: GuildMember | PartialGuildMember): Promise<void> {
    try {
      const eventData: DiscordEventData = {
        user: member.user?.tag,
        userId: member.user?.id,
        guild: member.guild.name,
        guildId: member.guild.id,
        timestamp: new Date().toISOString()
      }

      Logger.info('Discord member left', {
        userId: member.user?.id,
        userTag: member.user?.tag,
        guild: member.guild.name
      })

      await this.areaExecutor.triggerDiscordAreas('guildMemberRemove', eventData)

    } catch (error) {
      Logger.error('Error handling GuildMemberRemove event', {
        userId: member.user?.id,
        guildId: member.guild.id,
        error
      })
    }
  }

  /**
   * Gère l'événement MessageReactionAdd
   */
  public async handleMessageReactionAdd(
    reaction: MessageReaction | PartialMessageReaction, 
    user: User | PartialUser
  ): Promise<void> {
    try {
      // Fetch full objects if partial
      if (reaction.partial) {
        try {
          reaction = await reaction.fetch()
        } catch (error) {
          Logger.warn('Failed to fetch partial reaction', { error })
          return
        }
      }

      if (user.partial) {
        try {
          user = await user.fetch()
        } catch (error) {
          Logger.warn('Failed to fetch partial user', { error })
          return
        }
      }

      // Ignorer les réactions du bot lui-même
      if (user.bot) return

      const eventData: DiscordEventData = {
        user: user.tag,
        userId: user.id,
        channel: reaction.message.channel.type === 0 ? (reaction.message.channel as any).name : 'DM',
        channelId: reaction.message.channelId,
        guild: reaction.message.guild?.name,
        guildId: reaction.message.guild?.id,
        message: `Reaction ${reaction.emoji.name} added to message`,
        timestamp: new Date().toISOString()
      }

      Logger.debug('Discord reaction added', {
        emoji: reaction.emoji.name,
        user: user.tag,
        messageId: reaction.message.id,
        channel: eventData.channel
      })

      await this.areaExecutor.triggerDiscordAreas('messageReactionAdd', eventData)

    } catch (error) {
      Logger.error('Error handling MessageReactionAdd event', {
        emoji: reaction.emoji?.name,
        userId: user.id,
        error
      })
    }
  }

  /**
   * Validate event data before processing
   */
  private validateEventData(eventData: DiscordEventData): boolean {
    // Basic validation - can be extended
    if (!eventData.timestamp) {
      Logger.warn('Event data missing timestamp')
      return false
    }

    return true
  }

  /**
   * Sanitize event data for logging
   */
  private sanitizeForLogging(eventData: DiscordEventData): Partial<DiscordEventData> {
    return {
      ...eventData,
      authorId: eventData.authorId ? '***' : undefined,
      userId: eventData.userId ? '***' : undefined,
    }
  }
}