import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ActionNode } from './nodes/ActionNode';
import { ReactionNode } from './nodes/ReactionNode';
import { NodePalette } from './NodePalette';
import { ConfigPanel } from './ConfigPanel';
import { useAreaBuilder } from './useAreaBuilder';
import { WorkflowNode, NodeConfig } from './types';
import { Service } from '../../lib/api';
import { Button } from '../../DesignSystem/components/Button';
import { apiClient } from '../../lib/api';
import './AreaBuilder.css';

const nodeTypes: NodeTypes = {
  actionNode: ActionNode,
  reactionNode: ReactionNode,
};

interface AreaBuilderProps {
  services: Array<Service & { actions?: any[]; reactions?: any[] }>;
  userServices: any[];
  name: string;
  description?: string;
  onSave: (areaId: string) => void;
  onCancel: () => void;
}

export function AreaBuilder({
  services,
  userServices,
  name,
  description,
  onSave,
  onCancel,
}: AreaBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const {
    nodes,
    edges,
    selectedNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeConfig,
    validateWorkflow,
    setSelectedNode,
  } = useAreaBuilder();

  // Gérer le drag depuis la palette
  const onDragStart = useCallback((
    event: React.DragEvent,
    nodeType: 'action' | 'reaction',
    service: Service,
    action?: any,
    reaction?: any
  ) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: nodeType,
      service,
      action,
      reaction,
    }));
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    if (!reactFlowWrapper.current) return;

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));

    const position = {
      x: event.clientX - reactFlowBounds.left - 100,
      y: event.clientY - reactFlowBounds.top - 50,
    };

    addNode(data.type, data.service, data.action, data.reaction, position);
  }, [addNode]);

  // Obtenir ou créer un userService
  const getUserServiceId = useCallback(async (serviceId: string): Promise<string | undefined> => {
    // Chercher un userService existant
    const existing = userServices.find(us => us.service_id === serviceId);
    if (existing) {
      return existing.id;
    }

    // Créer un nouveau userService
    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) return undefined;

      const result = await apiClient.createUserService({
        service_id: serviceId,
        display_name: service.display_name,
      });

      if (result.success && result.data) {
        return result.data.id;
      }
    } catch (error) {
      console.error('Error creating user service:', error);
    }

    return undefined;
  }, [services, userServices]);

  // Sauvegarder la configuration d'un nœud
  const handleSaveConfig = useCallback((nodeId: string, config: NodeConfig) => {
    updateNodeConfig(nodeId, config);
  }, [updateNodeConfig]);

  const { t } = useTranslation();

  // Validation et création
  const handleCreate = useCallback(async () => {
    const validation = validateWorkflow();
    
    if (!validation.isValid) {
      alert(`${t('builder.errors')}:\n${validation.errors.join('\n')}`);
      return;
    }

    if (validation.warnings.length > 0) {
      const proceed = confirm(
        `${t('builder.warnings')}:\n${validation.warnings.join('\n')}\n\n${t('builder.continueAnyway')}`
      );
      if (!proceed) return;
    }

    try {
      const { convertWorkflowToArea } = await import('./workflowConverter');
      const areaId = await convertWorkflowToArea(nodes, edges, name, description);
      onSave(areaId);
    } catch (error) {
      alert(`${t('builder.createError')}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }, [validateWorkflow, nodes, edges, name, description, onSave, t]);

  return (
    <div className="area-builder-container h-full flex">
      {/* Palette de nœuds */}
      <div className="w-64 border-r border-[#E8E6E1]">
        <NodePalette
          services={services}
          onDragStart={onDragStart}
          onDragEnd={() => {}}
        />
      </div>

      {/* Canvas React Flow */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[#FAF9F7]"
        >
          <Background />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              if (node.data?.type === 'action') return '#0a4a0e';
              if (node.data?.type === 'reaction') return '#2563EB';
              return '#E8E6E1';
            }}
          />
          <Panel position="top-left" className="bg-white p-2 rounded shadow">
            <div className="text-sm font-medium text-[#1A1A18]">
              {name}
            </div>
            {description && (
              <div className="text-xs text-[#6B6962]">
                {description}
              </div>
            )}
          </Panel>
          <Panel position="top-right" className="flex gap-2">
            <Button
              variant="outlined"
              size="sm"
              onClick={onCancel}
            >
              {t('builder.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
            >
              {t('builder.create')}
            </Button>
          </Panel>
        </ReactFlow>

        {/* Panneau de configuration */}
        {selectedNode && (
          <ConfigPanel
            node={selectedNode}
            services={services}
            onSave={handleSaveConfig}
            onClose={() => {
              setSelectedNode(null);
            }}
            getUserServiceId={getUserServiceId}
          />
        )}
      </div>
    </div>
  );
}

