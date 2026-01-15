import { WorkflowNode, WorkflowEdge } from './types';
import { apiClient } from '../../lib/api';

interface CreateAreaRequest {
  name: string;
  description?: string;
  enabled?: boolean;
}

interface CreateAreaActionRequest {
  service_action_id: string;
  user_service_id: string;
  enabled: boolean;
  param_values?: Array<{
    service_action_param_id: string;
    value_text?: string;
    value_json?: string;
  }>;
}

interface CreateAreaReactionRequest {
  service_reaction_id: string;
  user_service_id: string;
  enabled: boolean;
  position: number;
  param_values?: Array<{
    service_reaction_param_id: string;
    value_text?: string;
    value_json?: string;
  }>;
}

/**
 * Convertit un workflow visuel en requêtes API pour créer une AREA
 */
export async function convertWorkflowToArea(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  name: string,
  description?: string
): Promise<string> {
  // Extraire les nœuds d'action et de réaction
  const actionNodes = nodes.filter(n => n.data.type === 'action' && n.data.isConfigured);
  const reactionNodes = nodes.filter(n => n.data.type === 'reaction' && n.data.isConfigured);

  if (actionNodes.length === 0) {
    throw new Error('Au moins une action configurée est requise');
  }

  if (reactionNodes.length === 0) {
    throw new Error('Au moins une réaction configurée est requise');
  }

  // Créer l'AREA
  const areaResult = await apiClient.createArea({
    name,
    description,
    enabled: true,
  });

  if (!areaResult.success || !areaResult.data) {
    throw new Error(areaResult.error || 'Échec de la création de l\'AREA');
  }

  const areaId = areaResult.data.id;

  // Créer les actions
  // Pour l'instant, on prend la première action (on peut étendre pour supporter plusieurs actions)
  const primaryActionNode = actionNodes[0];
  if (!primaryActionNode.data.config) {
    throw new Error('L\'action doit être configurée');
  }

  const actionConfig = primaryActionNode.data.config;
  const actionParams = primaryActionNode.data.action?.service_action_params || [];

  // Préparer les paramètres de l'action
  const actionParamValues = actionParams
    .filter(param => {
      const value = actionConfig.paramValues[param.name];
      return value !== undefined && value !== null && value.trim() !== '';
    })
    .map(param => ({
      service_action_param_id: param.id,
      value_text: String(actionConfig.paramValues[param.name]),
    }));

  const actionResult = await apiClient.createAreaAction(areaId, {
    service_action_id: actionConfig.actionId!,
    user_service_id: actionConfig.userServiceId!,
    enabled: true,
    param_values: actionParamValues.length > 0 ? actionParamValues : undefined,
  });

  if (!actionResult.success) {
    throw new Error(actionResult.error || 'Échec de la création de l\'action');
  }

  // Créer les réactions
  // Trier les réactions selon leur position dans le workflow (basé sur les connexions)
  const sortedReactionNodes = reactionNodes.sort((a, b) => {
    // Trouver la position basée sur les connexions
    const aEdges = edges.filter(e => e.target === a.id);
    const bEdges = edges.filter(e => e.target === b.id);
    
    // Si connectées à la même action, utiliser l'ordre des nœuds
    if (aEdges.length > 0 && bEdges.length > 0) {
      const aSource = aEdges[0].source;
      const bSource = bEdges[0].source;
      if (aSource === bSource) {
        return nodes.indexOf(a) - nodes.indexOf(b);
      }
    }
    
    return 0;
  });

  for (let i = 0; i < sortedReactionNodes.length; i++) {
    const reactionNode = sortedReactionNodes[i];
    if (!reactionNode.data.config) {
      console.warn(`Réaction ${reactionNode.id} non configurée, ignorée`);
      continue;
    }

    const reactionConfig = reactionNode.data.config;
    const reactionParams = reactionNode.data.reaction?.service_reaction_params || [];

    // Préparer les paramètres de la réaction
    const reactionParamValues = reactionParams
      .filter(param => {
        const value = reactionConfig.paramValues[param.name];
        return value !== undefined && value !== null && value.trim() !== '';
      })
      .map(param => ({
        service_reaction_param_id: param.id,
        value_text: String(reactionConfig.paramValues[param.name]),
      }));

    const reactionResult = await apiClient.createAreaReaction(areaId, {
      service_reaction_id: reactionConfig.reactionId!,
      user_service_id: reactionConfig.userServiceId!,
      enabled: true,
      position: i,
      param_values: reactionParamValues.length > 0 ? reactionParamValues : undefined,
    });

    if (!reactionResult.success) {
      console.error(`Échec de la création de la réaction ${reactionNode.id}:`, reactionResult.error);
      // Continuer avec les autres réactions
    }
  }

  return areaId;
}

