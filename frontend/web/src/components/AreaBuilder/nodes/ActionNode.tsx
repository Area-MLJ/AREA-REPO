import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNodeData } from '../types';
import { Card } from '../../../DesignSystem/components/Card';
import { Badge } from '../../../DesignSystem/components/Badge';

export function ActionNode({ data, selected }: NodeProps<WorkflowNodeData>) {
  const { config, isConfigured, action, service } = data;

  return (
    <div className={`action-node ${selected ? 'selected' : ''} ${isConfigured ? 'configured' : 'not-configured'}`}>
      <Card 
        variant="elevated" 
        className="min-w-[200px] p-3 border-2 transition-all"
        style={{
          borderColor: selected ? '#0a4a0e' : isConfigured ? '#10B981' : '#E8E6E1',
          backgroundColor: selected ? '#f0f9f4' : 'white'
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          {service?.iconUrl && (
            <img src={service.iconUrl} alt={service.name} className="w-6 h-6 rounded" />
          )}
          <div className="flex-1">
            <div className="font-semibold text-sm text-[#1A1A18]">
              {action?.display_name || config?.actionName || 'Action'}
            </div>
            <div className="text-xs text-[#6B6962]">
              {service?.displayName || service?.display_name || config?.serviceName || 'Service'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant={isConfigured ? 'success' : 'warning'} size="sm">
            {isConfigured ? 'Configuré' : 'À configurer'}
          </Badge>
          <Badge variant="primary" size="sm">
            Action
          </Badge>
        </div>
      </Card>
      
      {/* Handle de sortie (vers les réactions) */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!bg-[#0a4a0e] !w-3 !h-3 !border-2 !border-white"
        style={{ right: -6 }}
      />
    </div>
  );
}

