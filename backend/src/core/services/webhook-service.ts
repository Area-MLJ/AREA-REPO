// Service pour la gestion des webhooks
// Réexport des fonctions depuis hook-service pour cohérence

import hookService from './hook-service';

export const getHookJobById = (id: string) => hookService.getHookJobById(id);
export const getHookJobByWebhookEndpoint = (endpoint: string) =>
  hookService.getHookJobByWebhookEndpoint(endpoint);
export const createHookLog = (data: {
  hook_job_id: string;
  event_payload?: string;
}) => hookService.createHookLog(data);

