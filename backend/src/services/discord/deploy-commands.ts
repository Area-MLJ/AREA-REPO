/**
 * Discord Commands Deployment
 * Script pour déployer les slash commands Discord
 */

import { REST, Routes } from 'discord.js'
import { Logger } from '@/lib/logger'
import { DISCORD_CONFIG, SLASH_COMMANDS } from './config'

export class CommandDeployer {
  private rest: REST

  constructor() {
    if (!DISCORD_CONFIG.token) {
      throw new Error('DISCORD_TOKEN is required for command deployment')
    }

    this.rest = new REST({ version: '10' }).setToken(DISCORD_CONFIG.token)
  }

  /**
   * Déploie les slash commands globalement
   */
  public async deployGlobalCommands(): Promise<void> {
    try {
      Logger.info('Starting Discord command deployment', {
        commandCount: SLASH_COMMANDS.length,
        applicationId: DISCORD_CONFIG.applicationId
      })

      const data = await this.rest.put(
        Routes.applicationCommands(DISCORD_CONFIG.applicationId),
        { body: SLASH_COMMANDS }
      ) as any[]

      Logger.info('Discord commands deployed successfully', {
        deployedCount: data.length,
        commands: data.map(cmd => cmd.name)
      })

    } catch (error) {
      Logger.error('Failed to deploy Discord commands', { error })
      throw error
    }
  }

  /**
   * Déploie les slash commands pour une guilde spécifique (développement)
   */
  public async deployGuildCommands(guildId: string): Promise<void> {
    try {
      Logger.info('Starting guild-specific command deployment', {
        commandCount: SLASH_COMMANDS.length,
        applicationId: DISCORD_CONFIG.applicationId,
        guildId
      })

      const data = await this.rest.put(
        Routes.applicationGuildCommands(DISCORD_CONFIG.applicationId, guildId),
        { body: SLASH_COMMANDS }
      ) as any[]

      Logger.info('Guild commands deployed successfully', {
        deployedCount: data.length,
        commands: data.map(cmd => cmd.name),
        guildId
      })

    } catch (error) {
      Logger.error('Failed to deploy guild commands', { error, guildId })
      throw error
    }
  }

  /**
   * Supprime tous les slash commands
   */
  public async clearCommands(): Promise<void> {
    try {
      Logger.info('Clearing all Discord commands')

      await this.rest.put(
        Routes.applicationCommands(DISCORD_CONFIG.applicationId),
        { body: [] }
      )

      Logger.info('All Discord commands cleared successfully')

    } catch (error) {
      Logger.error('Failed to clear Discord commands', { error })
      throw error
    }
  }

  /**
   * Liste les commandes actuellement déployées
   */
  public async listCommands(): Promise<any[]> {
    try {
      const commands = await this.rest.get(
        Routes.applicationCommands(DISCORD_CONFIG.applicationId)
      ) as any[]

      Logger.info('Current Discord commands', {
        commandCount: commands.length,
        commands: commands.map(cmd => ({ id: cmd.id, name: cmd.name }))
      })

      return commands

    } catch (error) {
      Logger.error('Failed to list Discord commands', { error })
      throw error
    }
  }
}

/**
 * Script CLI pour déployer les commandes
 */
if (require.main === module) {
  const deployer = new CommandDeployer()
  
  const command = process.argv[2] || 'deploy'
  const guildId = process.argv[3]

  switch (command) {
    case 'deploy':
      if (guildId) {
        deployer.deployGuildCommands(guildId)
          .then(() => process.exit(0))
          .catch(() => process.exit(1))
      } else {
        deployer.deployGlobalCommands()
          .then(() => process.exit(0))
          .catch(() => process.exit(1))
      }
      break

    case 'clear':
      deployer.clearCommands()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break

    case 'list':
      deployer.listCommands()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break

    default:
      console.log('Usage:')
      console.log('  npm run deploy-discord-commands')
      console.log('  npm run deploy-discord-commands deploy <guild-id>')
      console.log('  npm run deploy-discord-commands clear')
      console.log('  npm run deploy-discord-commands list')
      process.exit(1)
  }
}