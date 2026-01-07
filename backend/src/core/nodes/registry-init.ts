// Fichier d'initialisation du registry
// Importe et enregistre tous les modules Action/Reaction

import { registerAction, registerReaction } from './registry';

// Actions
import { timerAction } from './actions/timer';
import { newsAction } from './actions/news';

// Reactions
import { discordSendMessage } from './reactions/discord';
import { emailSend } from './reactions/email';
import { mailSend } from './reactions/mail';

/**
 * Initialise le registry avec tous les modules disponibles
 * Cette fonction doit être appelée au démarrage de l'application
 */
export function initializeRegistry(): void {
  // Enregistrer les actions
  registerAction(timerAction);
  registerAction(newsAction);

  // Enregistrer les réactions
  registerReaction(discordSendMessage);
  registerReaction(emailSend);
  registerReaction(mailSend);
}

