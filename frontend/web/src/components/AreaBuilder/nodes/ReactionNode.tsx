import { Handle, Position, NodeProps } from 'reactflow';
import { useTranslation } from 'react-i18next';
import { WorkflowNodeData } from '../types';
import { Card } from '../../../DesignSystem/components/Card';
import { Badge } from '../../../DesignSystem/components/Badge';

export function ReactionNode({ data, selected, id }: NodeProps<WorkflowNodeData>) {
  const { t } = useTranslation();
  const { config, isConfigured, reaction, service, onDelete } = data;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && id) {
      onDelete(id);
    }
  };

  return (
    <div className={`reaction-node ${selected ? 'selected' : ''} ${isConfigured ? 'configured' : 'not-configured'}`}>
      <Card 
        variant="elevated" 
        className="min-w-[200px] p-3 border-2 transition-all"
        style={{
          borderColor: selected ? '#0a4a0e' : isConfigured ? '#10B981' : '#E8E6E1',
          backgroundColor: selected ? '#f0f9f4' : 'white'
        }}
      >
        <div className="flex items-start gap-2 mb-2">
          {service?.iconUrl && (
            <img 
              src={service.iconUrl} 
              alt={service.name || ''} 
              className="w-6 h-6 rounded" 
              loading="lazy"
              width={24}
              height={24}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-[#1A1A18] truncate">
              {reaction?.display_name || config?.reactionName || t('builder.nodes.reaction')}
            </div>
            <div className="text-xs text-[#4D4C47] truncate">
              {service?.displayName || service?.display_name || config?.serviceName || t('builder.nodes.service')}
            </div>
          </div>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="ml-2 p-1 rounded hover:bg-red-100 text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              aria-label={t('builder.nodes.deleteNode') || 'Supprimer le nœud'}
              title={t('builder.nodes.deleteNode') || 'Supprimer le nœud'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant={isConfigured ? 'success' : 'warning'} size="sm">
            {isConfigured ? t('builder.nodes.configured') : t('builder.nodes.toConfigure')}
          </Badge>
          <Badge variant="primary" size="sm">
            {t('builder.nodes.reaction')}
          </Badge>
        </div>
      </Card>
      
      {/* Handle d'entrée (depuis les actions) */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!bg-[#0a4a0e] !w-3 !h-3 !border-2 !border-white"
        style={{ left: -6 }}
      />
    </div>
  );
}

