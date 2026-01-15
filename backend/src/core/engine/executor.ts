import { getSupabaseClient } from '../services/db/client';
import { getAction, getReaction } from '../nodes/registry';
import { NodeContext } from './node-context';
import { CompiledArea, loadCompiledArea } from './compiled-area';
import { logger } from '@/lib/logger';
import httpClient from '@/lib/http-client';
import userService from '../services/user-service';
import executionService from '../services/execution-service';
import { UUID } from '@/types/database';

/**
 * Construit un NodeContext pour l'exécution d'un node
 */
function buildNodeContext(
  compiledArea: CompiledArea,
  options: {
    areaActionId?: UUID;
    areaReactionId?: UUID;
    userServiceId: UUID;
    input: any;
  }
): NodeContext {
  const supabaseClient = getSupabaseClient();

  return {
    areaId: compiledArea.id,
    areaActionId: options.areaActionId,
    areaReactionId: options.areaReactionId,
    userId: compiledArea.userId,
    userServiceId: options.userServiceId,
    input: options.input,
    logger,
    httpClient,
    supabaseClient,
  };
}

/**
 * Exécute une AREA complète
 * @param hookLogId ID du hook_log qui a déclenché cette exécution
 * @param areaActionId ID de l'area_action à exécuter
 */
export async function processAreaExecution(
  hookLogId: UUID,
  areaActionId: UUID
): Promise<void> {
  logger.info(`Processing area execution for hook_log: ${hookLogId}, area_action: ${areaActionId}`);

  // 1. Charger l'AREA compilée
  const compiledArea = await loadCompiledArea(areaActionId);

  if (!compiledArea.enabled) {
    logger.info(`Area ${compiledArea.id} is disabled, skipping execution`);
    return;
  }

  // 2. Charger le hook_log pour obtenir l'event_payload
  const { data: hookLog } = await getSupabaseClient()
    .from('hook_logs')
    .select('*')
    .eq('id', hookLogId)
    .single();

  if (!hookLog) {
    throw new Error(`Hook log not found: ${hookLogId}`);
  }

  const eventPayload = hookLog.event_payload
    ? JSON.parse(hookLog.event_payload)
    : {};

  // 3. Créer un execution_log
  const executionLog = await executionService.createExecutionLog({
    area_id: compiledArea.id,
    area_action_id: compiledArea.action.areaActionId,
    status: 'running',
    request_payload: hookLog.event_payload || null,
  });

  try {
    // 4. Charger le user_service pour l'action
    const actionUserService = await userService.getUserServiceById(
      compiledArea.action.userServiceId
    );
    if (!actionUserService) {
      throw new Error(
        `User service not found: ${compiledArea.action.userServiceId}`
      );
    }

    // 5. Exécuter l'Action
    const actionNode = getAction(compiledArea.action.nodeKey);
    if (!actionNode) {
      throw new Error(`Action node not found: ${compiledArea.action.nodeKey}`);
    }

    const actionContext = buildNodeContext(compiledArea, {
      areaActionId: compiledArea.action.areaActionId,
      userServiceId: compiledArea.action.userServiceId,
      input: eventPayload,
    });

    logger.debug(`Executing action: ${compiledArea.action.nodeKey}`);
    const actionResult = await actionNode.execute(
      actionContext,
      compiledArea.action.params
    );

    if (!actionResult.triggered) {
      logger.info(`Action ${compiledArea.action.nodeKey} did not trigger, skipping reactions`);
      await executionService.updateExecutionLog(executionLog.id, {
        status: 'skipped',
      });
      return;
    }

    // 6. Exécuter les Réactions (en parallèle)
    const enabledReactions = compiledArea.reactions.filter((r) => r.enabled);
    if (enabledReactions.length === 0) {
      logger.info(`No enabled reactions for area ${compiledArea.id}`);
      await executionService.updateExecutionLog(executionLog.id, {
        status: 'success',
        response_payload: JSON.stringify({ message: 'No reactions to execute' }),
      });
      return;
    }

    // Trier par position
    enabledReactions.sort((a, b) => a.position - b.position);

    logger.debug(
      `Executing ${enabledReactions.length} reactions for area ${compiledArea.id}`
    );

    const reactionPromises = enabledReactions.map(async (reaction) => {
      const reactionNode = getReaction(reaction.nodeKey);
      if (!reactionNode) {
        logger.error(`Reaction node not found: ${reaction.nodeKey}`);
        return {
          areaReactionId: reaction.areaReactionId,
          success: false,
          error: `Reaction node not found: ${reaction.nodeKey}`,
        };
      }

      const reactionUserService = await userService.getUserServiceById(
        reaction.userServiceId
      );
      if (!reactionUserService) {
        logger.error(`User service not found: ${reaction.userServiceId}`);
        return {
          areaReactionId: reaction.areaReactionId,
          success: false,
          error: `User service not found: ${reaction.userServiceId}`,
        };
      }

      const reactionContext = buildNodeContext(compiledArea, {
        areaActionId: compiledArea.action.areaActionId,
        areaReactionId: reaction.areaReactionId,
        userServiceId: reaction.userServiceId,
        input: actionResult.output || {},
      });

      try {
        logger.debug(`Executing reaction: ${reaction.nodeKey}`);
        const reactionResult = await reactionNode.execute(
          reactionContext,
          reaction.params
        );

        return {
          areaReactionId: reaction.areaReactionId,
          success: reactionResult.success,
          output: reactionResult.output,
        };
      } catch (error: any) {
        logger.error(`Error executing reaction ${reaction.nodeKey}:`, error);
        return {
          areaReactionId: reaction.areaReactionId,
          success: false,
          error: error.message || String(error),
        };
      }
    });

    const reactionResults = await Promise.allSettled(reactionPromises);

    // 7. Analyser les résultats
    const results = reactionResults.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: result.reason?.message || String(result.reason),
        };
      }
    });

    const hasErrors = results.some((r) => !r.success);
    const allSuccess = results.every((r) => r.success);

    const finalStatus = allSuccess
      ? 'success'
      : hasErrors && results.some((r) => r.success)
      ? 'partial_success'
      : 'failed';

    // 8. Mettre à jour l'execution_log
    await executionService.updateExecutionLog(executionLog.id, {
      status: finalStatus,
      response_payload: JSON.stringify({
        action: {
          triggered: actionResult.triggered,
          output: actionResult.output,
        },
        reactions: results,
      }),
      error_text: hasErrors
        ? results
            .filter((r) => !r.success)
            .map((r) => r.error || 'Unknown error')
            .join('; ')
        : undefined,
    });

    logger.info(
      `Area execution completed: ${compiledArea.id}, status: ${finalStatus}`
    );
  } catch (error: any) {
    logger.error(`Error processing area execution:`, error);

    await executionService.updateExecutionLog(executionLog.id, {
      status: 'failed',
      error_text: error.message || String(error),
    });

    throw error; // Laisser la queue gérer les retries
  }
}

