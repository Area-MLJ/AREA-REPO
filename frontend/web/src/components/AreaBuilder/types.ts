import { Node, Edge } from 'reactflow';
import { Service, ServiceAction, ServiceReaction } from '../../lib/api';

/**
 * Configuration d'un nœud (action ou réaction)
 */
export interface NodeConfig {
  serviceId: string;
  serviceName: string;
  actionId?: string;
  reactionId?: string;
  actionName?: string;
  reactionName?: string;
  paramValues: Record<string, string>;
  userServiceId?: string;
}

/**
 * Données personnalisées d'un nœud dans le workflow
 */
export interface WorkflowNodeData {
  type: 'action' | 'reaction';
  config: NodeConfig | null;
  service?: Service;
  action?: ServiceAction;
  reaction?: ServiceReaction;
  isConfigured: boolean;
}

/**
 * Nœud du workflow avec données personnalisées
 */
export type WorkflowNode = Node<WorkflowNodeData>;

/**
 * Connexion entre nœuds
 */
export type WorkflowEdge = Edge;

/**
 * Données complètes du workflow
 */
export interface WorkflowData {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  name: string;
  description?: string;
}

/**
 * Validation du workflow
 */
export interface WorkflowValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

