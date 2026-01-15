import { useState, useCallback, useMemo } from 'react';
import { 
  Node, 
  Edge, 
  addEdge, 
  Connection, 
  useNodesState, 
  useEdgesState,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges
} from 'reactflow';
import { WorkflowNode, WorkflowNodeData, NodeConfig, WorkflowValidation } from './types';
import { Service } from '../../lib/api';

interface UseAreaBuilderOptions {
  initialNodes?: WorkflowNode[];
  initialEdges?: Edge[];
}

export function useAreaBuilder({ initialNodes = [], initialEdges = [] }: UseAreaBuilderOptions = {}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  // Gérer les changements de nœuds
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
    
    // Détecter la sélection d'un nœud
    const selectChange = changes.find(c => c.type === 'select');
    if (selectChange && selectChange.type === 'select') {
      const node = nodes.find(n => n.id === selectChange.id);
      setSelectedNode(selectChange.selected ? (node || null) : null);
    }
  }, [nodes, setNodes]);

  // Gérer les changements de connexions
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, [setEdges]);

  // Ajouter une connexion
  const onConnect = useCallback((connection: Connection) => {
    // Vérifier que la connexion est valide (action → réaction)
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    
    if (!sourceNode || !targetNode) return;
    
    const sourceType = sourceNode.data.type;
    const targetType = targetNode.data.type;
    
    // Valider : action → réaction uniquement
    if (sourceType === 'action' && targetType === 'reaction') {
      setEdges((eds) => addEdge(connection, eds));
    }
  }, [nodes, setEdges]);

  // Ajouter un nœud depuis la palette
  const addNode = useCallback((
    type: 'action' | 'reaction',
    service: Service,
    action?: any,
    reaction?: any,
    position: { x: number; y: number } = { x: 250, y: 250 },
    onDelete?: (id: string) => void
  ) => {
    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type: type === 'action' ? 'actionNode' : 'reactionNode',
      position,
      data: {
        type,
        config: null,
        service,
        action,
        reaction,
        isConfigured: false,
        onDelete,
        onConfigChange: () => {},
      },
    };

    setNodes((nds) => [...nds, newNode]);
    return newNode;
  }, [setNodes]);

  // Mettre à jour la configuration d'un nœud
  const updateNodeConfig = useCallback((nodeId: string, config: NodeConfig) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // Vérifier si tous les paramètres requis sont remplis
          const params = node.data.action?.service_action_params || node.data.reaction?.service_reaction_params || [];
          const allRequiredFilled = params.every(param => {
            if (!param.required) return true;
            return config.paramValues && config.paramValues[param.name] !== undefined && 
                   config.paramValues[param.name] !== null && 
                   String(config.paramValues[param.name]).trim() !== '';
          });

          return {
            ...node,
            data: {
              ...node.data,
              config,
              isConfigured: allRequiredFilled && !!config.userServiceId,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Supprimer un nœud
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [setNodes, setEdges, selectedNode]);

  // Valider le workflow
  const validateWorkflow = useCallback((): WorkflowValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const actionNodes = nodes.filter(n => n.data.type === 'action');
    const reactionNodes = nodes.filter(n => n.data.type === 'reaction');

    // Vérifier qu'il y a au moins une action
    if (actionNodes.length === 0) {
      errors.push('Au moins une action est requise');
    }

    // Vérifier qu'il y a au moins une réaction
    if (reactionNodes.length === 0) {
      errors.push('Au moins une réaction est requise');
    }

    // Vérifier que tous les nœuds sont configurés
    const unconfiguredNodes = nodes.filter(n => !n.data.isConfigured);
    if (unconfiguredNodes.length > 0) {
      errors.push(`${unconfiguredNodes.length} nœud(s) non configuré(s)`);
    }

    // Vérifier les connexions
    if (edges.length === 0 && actionNodes.length > 0 && reactionNodes.length > 0) {
      warnings.push('Aucune connexion entre les actions et les réactions');
    }

    // Vérifier que chaque action a au moins une connexion
    actionNodes.forEach(actionNode => {
      const hasConnection = edges.some(e => e.source === actionNode.id);
      if (!hasConnection) {
        warnings.push(`L'action "${actionNode.data.action?.display_name || actionNode.id}" n'est connectée à aucune réaction`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [nodes, edges]);

  // Réinitialiser le workflow
  const resetWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  return {
    nodes,
    edges,
    selectedNode,
    onNodesChange: handleNodesChange,
    onEdgesChange: handleEdgesChange,
    onConnect,
    addNode,
    updateNodeConfig,
    deleteNode,
    validateWorkflow,
    resetWorkflow,
    setSelectedNode,
  };
}

