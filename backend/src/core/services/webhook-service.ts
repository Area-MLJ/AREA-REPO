// Service pour la gestion des webhooks
// Réexport des fonctions depuis hook-service pour cohérence

export {
  getHookJobById,
  getHookJobByWebhookEndpoint,
  createHookLog,
} from './hook-service';

