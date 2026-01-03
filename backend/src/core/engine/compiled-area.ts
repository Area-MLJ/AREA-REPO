import { UUID } from '@/types/database';
import areaService from '../services/area-service';
import userService from '../services/user-service';
import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/db';

/**
 * Modèle compilé d'une AREA, chargé depuis la DB
 */
export interface CompiledArea {
  id: UUID;
  userId: UUID;
  name: string;
  enabled: boolean;

  action: {
    areaActionId: UUID;
    nodeKey: string; // ex: 'twitch.live_started'
    userServiceId: UUID;
    params: Record<string, any>;
  };

  reactions: Array<{
    areaReactionId: UUID;
    nodeKey: string; // ex: 'discord.send_message'
    userServiceId: UUID;
    params: Record<string, any>;
    position: number;
    enabled: boolean;
  }>;
}

/**
 * Charge une AREA compilée depuis la DB à partir d'un area_action_id
 */
export async function loadCompiledArea(
  areaActionId: UUID
): Promise<CompiledArea> {
  logger.debug(`Loading compiled area for area_action_id: ${areaActionId}`);

  // 1. Charger l'area_action
  const areaAction = await areaService.getAreaActionById(areaActionId);
  if (!areaAction) {
    throw new Error(`Area action not found: ${areaActionId}`);
  }

  // 2. Charger l'AREA
  const area = await areaService.getAreaById(areaAction.area_id);
  if (!area) {
    throw new Error(`Area not found: ${areaAction.area_id}`);
  }

  // 3. Charger le service_action pour obtenir service.name
  const serviceAction = await areaService.getServiceActionByAreaActionId(
    areaActionId
  );
  if (!serviceAction) {
    throw new Error(`Service action not found for area_action: ${areaActionId}`);
  }

  // 4. Charger le service pour obtenir le nom
  const supabase = getSupabaseClient();
  const { data: service } = await supabase
    .from('services')
    .select('name')
    .eq('id', serviceAction.service_id)
    .single();

  if (!service) {
    throw new Error(`Service not found: ${serviceAction.service_id}`);
  }

  const actionNodeKey = `${service.name}.${serviceAction.name}`;

  // 5. Charger les paramètres de l'action
  const actionParamValues = await areaService.getAreaActionParamValues(
    areaActionId
  );

  // Charger les définitions des paramètres
  const { data: actionParams } = await supabase
    .from('service_action_params')
    .select('*')
    .in(
      'id',
      actionParamValues.map((pv) => pv.service_action_param_id)
    );

  // Construire l'objet params
  const actionParamsMap: Record<string, any> = {};
  for (const paramValue of actionParamValues) {
    const paramDef = actionParams?.find(
      (p) => p.id === paramValue.service_action_param_id
    );
    if (paramDef) {
      // Utiliser value_json si disponible, sinon value_text
      const value = paramValue.value_json
        ? JSON.parse(paramValue.value_json)
        : paramValue.value_text;
      actionParamsMap[paramDef.name] = value;
    }
  }

  // 6. Charger les area_reactions
  const areaReactions = await areaService.getAreaReactionsByAreaId(area.id);

  // 7. Construire les réactions compilées
  const compiledReactions = await Promise.all(
    areaReactions.map(async (areaReaction) => {
      const serviceReaction =
        await areaService.getServiceReactionByAreaReactionId(areaReaction.id);
      if (!serviceReaction) {
        throw new Error(
          `Service reaction not found for area_reaction: ${areaReaction.id}`
        );
      }

      // Charger le service
      const { data: reactionService } = await supabase
        .from('services')
        .select('name')
        .eq('id', serviceReaction.service_id)
        .single();

      if (!reactionService) {
        throw new Error(`Service not found: ${serviceReaction.service_id}`);
      }

      const reactionNodeKey = `${reactionService.name}.${serviceReaction.name}`;

      // Charger les paramètres de la réaction
      const reactionParamValues =
        await areaService.getAreaReactionParamValues(areaReaction.id);

      const { data: reactionParams } = await supabase
        .from('service_reaction_params')
        .select('*')
        .in(
          'id',
          reactionParamValues.map((pv) => pv.service_reaction_param_id)
        );

      const reactionParamsMap: Record<string, any> = {};
      for (const paramValue of reactionParamValues) {
        const paramDef = reactionParams?.find(
          (p) => p.id === paramValue.service_reaction_param_id
        );
        if (paramDef) {
          const value = paramValue.value_json
            ? JSON.parse(paramValue.value_json)
            : paramValue.value_text;
          reactionParamsMap[paramDef.name] = value;
        }
      }

      return {
        areaReactionId: areaReaction.id,
        nodeKey: reactionNodeKey,
        userServiceId: areaReaction.user_service_id,
        params: reactionParamsMap,
        position: areaReaction.position,
        enabled: areaReaction.enabled,
      };
    })
  );

  const compiledArea: CompiledArea = {
    id: area.id,
    userId: area.user_id,
    name: area.name,
    enabled: area.enabled,
    action: {
      areaActionId: areaAction.id,
      nodeKey: actionNodeKey,
      userServiceId: areaAction.user_service_id,
      params: actionParamsMap,
    },
    reactions: compiledReactions,
  };

  logger.debug(`Compiled area loaded: ${compiledArea.id}`, {
    action: compiledArea.action.nodeKey,
    reactionsCount: compiledArea.reactions.length,
  });

  return compiledArea;
}

