/**
 * Discord Service Startup
 * Initialisation du service Discord au démarrage du backend
 */

import { Logger } from './logger'
import { initializeDiscordService } from '@/services/discord'

let isInitialized = false
let initializationPromise: Promise<void> | null = null

/**
 * Initialise le service Discord de manière thread-safe
 */
export async function ensureDiscordInitialized(): Promise<void> {
  if (isInitialized) {
    return
  }

  if (initializationPromise) {
    return initializationPromise
  }

  initializationPromise = initializeDiscord()
  return initializationPromise
}

/**
 * Initialisation interne du service Discord
 */
async function initializeDiscord(): Promise<void> {
  try {
    // Vérifier les variables d'environnement
    if (!process.env.DISCORD_TOKEN) {
      Logger.warn('Discord service disabled: DISCORD_TOKEN not configured')
      return
    }

    if (!process.env.DISCORD_APPLICATION_ID) {
      Logger.warn('Discord service disabled: DISCORD_APPLICATION_ID not configured')
      return
    }

    Logger.info('Initializing Discord service...')
    
    await initializeDiscordService()
    
    isInitialized = true
    Logger.info('Discord service initialized successfully')

  } catch (error) {
    Logger.error('Failed to initialize Discord service', { error })
    
    // Ne pas throw l'erreur pour ne pas bloquer le démarrage du backend
    // Le service Discord sera considéré comme indisponible
    Logger.warn('Backend will continue without Discord service')
  } finally {
    initializationPromise = null
  }
}

/**
 * Vérifie si le service Discord est initialisé
 */
export function isDiscordInitialized(): boolean {
  return isInitialized
}

/**
 * Force la réinitialisation du service Discord
 */
export async function reinitializeDiscord(): Promise<void> {
  isInitialized = false
  initializationPromise = null
  return ensureDiscordInitialized()
}