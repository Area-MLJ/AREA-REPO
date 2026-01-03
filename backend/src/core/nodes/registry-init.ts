// Fichier d'initialisation du registry
// Importe et enregistre tous les modules Action/Reaction

import { registerAction, registerReaction } from './registry';

// Actions
import { timerAction } from './actions/timer';

// Reactions
import { discordSendMessage } from './reactions/discord';
import { emailSend } from './reactions/email';

/**
 * Initialise le registry avec tous les modules disponibles
 * Cette fonction doit être appelée au démarrage de l'application
 */
export function initializeRegistry(): void {
  // Enregistrer les actions
  registerAction(timerAction);

  // Enregistrer les réactions
  registerReaction(discordSendMessage);
  registerReaction(emailSend);
}

