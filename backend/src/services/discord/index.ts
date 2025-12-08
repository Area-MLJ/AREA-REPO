/**
 * Discord Service Main Export
 * Point d'entrée principal pour le service Discord
 */

export { DiscordClientManager } from './client'
export { AreaExecutor } from './executors/area-executor'
export { ReactionExecutor } from './executors/reaction-executor'
export { EventHandler } from './handlers/event-handler'
export { CommandHandler } from './handlers/command-handler'
export { CommandDeployer } from './deploy-commands'
export { DISCORD_CONFIG, SLASH_COMMANDS, ACTION_MAPPINGS } from './config'
export * from './types'

/**
 * Service Discord - Fonctions utilitaires
 */
import { DiscordClientManager } from './client'
import { Logger } from '@/lib/logger'

/**
 * Initialise le service Discord
 */
export async function initializeDiscordService(): Promise<void> {
  try {
    const clientManager = DiscordClientManager.getInstance()
    await clientManager.initialize()
    Logger.info('Discord service initialized successfully')
  } catch (error) {
    Logger.error('Failed to initialize Discord service', { error })
    throw error
  }
}

/**
 * Déclenche les AREAs Discord
 */
export async function triggerDiscordAreas(eventType: string, eventData: any): Promise<void> {
  const clientManager = DiscordClientManager.getInstance()
  return clientManager.triggerAreas(eventType as any, eventData)
}

/**
 * Exécute une AREA spécifique
 */
export async function executeDiscordArea(areaId: string, eventData: any = {}): Promise<any> {
  const clientManager = DiscordClientManager.getInstance()
  return clientManager.executeArea(areaId, eventData)
}

/**
 * Vérifie si le service Discord est prêt
 */
export function isDiscordServiceReady(): boolean {
  const clientManager = DiscordClientManager.getInstance()
  return clientManager.isReady()
}

/**
 * Arrête le service Discord
 */
export async function stopDiscordService(): Promise<void> {
  const clientManager = DiscordClientManager.getInstance()
  await clientManager.disconnect()
  Logger.info('Discord service stopped')
}

/**
 * Status de santé du service Discord
 */
export function getDiscordServiceHealth(): {
  status: 'healthy' | 'unhealthy' | 'starting'
  ready: boolean
  uptime?: number
} {
  const clientManager = DiscordClientManager.getInstance()
  const client = clientManager.getClient()
  
  return {
    status: clientManager.isReady() ? 'healthy' : 'unhealthy',
    ready: clientManager.isReady(),
    uptime: client?.uptime || undefined
  }
}