// Charger les variables d'environnement
import 'dotenv/config';

import hookService from '../services/hook-service';
import areaService from '../services/area-service';
import { getAction } from '../nodes/registry';
import { areaExecutionQueue } from '@/lib/queue';
import { getSupabaseClient } from '@/lib/db';
import { logger } from '@/lib/logger';
import userService from '../services/user-service';
import httpClient from '@/lib/http-client';
import { initializeRegistry } from '../nodes/registry-init';
import { NodeContext } from '../engine/node-context';
import { syncServices, watchServices, startPeriodicSync } from '../services/service-loader';

// Synchroniser les services depuis les fichiers JSON
syncServices()
  .then(() => {
    logger.info('Services synchronized from JSON files');
    
    // Activer le watch mode en développement
    if (process.env.NODE_ENV !== 'production') {
      watchServices();
    } else {
      // En production, synchronisation périodique
      startPeriodicSync(10); // Toutes les 10 minutes
    }
  })
  .catch((error) => {
    logger.error('Failed to sync services:', error);
  });

// Initialiser le registry
initializeRegistry();

/**
 * Boucle principale du scheduler de polling
 */
async function pollingLoop() {
  logger.info('Starting polling scheduler...');

  while (true) {
    try {
      // Récupérer tous les hook_jobs actifs de type polling
      const pollingJobs = await hookService.getActivePollingJobs();

      logger.debug(`Found ${pollingJobs.length} active polling jobs`);

      for (const hookJob of pollingJobs) {
        try {
          // Vérifier si le job doit être exécuté maintenant
          const now = new Date();
          const lastRun = hookJob.last_run_at
            ? new Date(hookJob.last_run_at)
            : null;
          const intervalSeconds = hookJob.polling_interval_seconds || 60;

          if (
            lastRun &&
            (now.getTime() - lastRun.getTime()) / 1000 < intervalSeconds
          ) {
            // Pas encore le moment d'exécuter
            continue;
          }

          // Charger l'area_action
          const areaAction = await areaService.getAreaActionById(
            hookJob.area_action_id
          );
          if (!areaAction) {
            logger.warn(
              `Area action not found for hook_job ${hookJob.id}, skipping`
            );
            continue;
          }

          // Charger l'AREA compilée (juste pour obtenir les infos nécessaires)
          const { loadCompiledArea } = await import('../engine/compiled-area');
          const compiledArea = await loadCompiledArea(areaAction.id);

          // Charger le user_service
          const actionUserService = await userService.getUserServiceById(
            compiledArea.action.userServiceId
          );
          if (!actionUserService) {
            logger.warn(
              `User service not found for area_action ${areaAction.id}, skipping`
            );
            continue;
          }

          // Récupérer le node d'action
          const actionNode = getAction(compiledArea.action.nodeKey);
          if (!actionNode) {
            logger.warn(
              `Action node not found: ${compiledArea.action.nodeKey}, skipping`
            );
            continue;
          }

          // Construire le contexte
          const supabaseClient = getSupabaseClient();
          const actionContext: NodeContext = {
            areaId: compiledArea.id,
            areaActionId: compiledArea.action.areaActionId,
            userId: compiledArea.userId,
            userServiceId: compiledArea.action.userServiceId,
            input: {},
            logger,
            httpClient,
            supabaseClient,
          };

          // Exécuter l'action en mode détection
          logger.debug(
            `Executing polling check for action ${compiledArea.action.nodeKey}`
          );
          const actionResult = await actionNode.execute(
            actionContext,
            compiledArea.action.params
          );

          // Si l'action est déclenchée, créer un hook_log et un job
          if (actionResult.triggered) {
            logger.info(
              `Action ${compiledArea.action.nodeKey} triggered, creating hook_log and job`
            );

            // Créer un hook_log
            const hookLog = await hookService.createHookLog({
              hook_job_id: hookJob.id,
              event_payload: JSON.stringify(actionResult.output || {}),
            });

            // Créer un job dans la queue
            await areaExecutionQueue.add(
              'area_execution',
              {
                hookLogId: hookLog.id,
                areaActionId: areaAction.id,
              },
              {
                jobId: `polling-${hookLog.id}`,
              }
            );
          }

          // Mettre à jour last_run_at
          await hookService.updateHookJobLastRun(
            hookJob.id,
            now.toISOString()
          );
        } catch (error: any) {
          logger.error(`Error processing polling job ${hookJob.id}:`, error);
          // Continuer avec le job suivant
        }
      }

      // Attendre avant la prochaine itération (par exemple, toutes les 30 secondes)
      await new Promise((resolve) => setTimeout(resolve, 30000));
    } catch (error: any) {
      logger.error('Error in polling loop:', error);
      // Attendre avant de réessayer
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }
}

// Démarrer le scheduler
if (require.main === module) {
  pollingLoop().catch((error) => {
    logger.error('Fatal error in polling scheduler:', error);
    process.exit(1);
  });
}

// Gestion propre de l'arrêt
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, stopping polling scheduler...');
  const { stopWatching } = await import('../services/service-loader');
  stopWatching();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, stopping polling scheduler...');
  const { stopWatching } = await import('../services/service-loader');
  stopWatching();
  process.exit(0);
});

export default pollingLoop;

