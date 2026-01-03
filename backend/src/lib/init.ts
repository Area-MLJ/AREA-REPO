/**
 * Fichier d'initialisation globale
 * Appelé au démarrage de l'application
 */

import { initializeRegistry } from '@/core/nodes/registry-init';
import { logger } from './logger';

export function initializeApp() {
  try {
    // Initialiser le registry des modules
    initializeRegistry();
    logger.info('Application initialized successfully');
  } catch (error: any) {
    logger.error('Failed to initialize application:', error);
    throw error;
  }
}

