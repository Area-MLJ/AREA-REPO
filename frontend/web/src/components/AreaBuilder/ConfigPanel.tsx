import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkflowNode, WorkflowNodeData, NodeConfig } from './types';
import { Service, ServiceAction, ServiceReaction } from '../../lib/api';
import { Card } from '../../DesignSystem/components/Card';
import { Button } from '../../DesignSystem/components/Button';
import { Input } from '../../DesignSystem/components/Input';

interface ConfigPanelProps {
  node: WorkflowNode | null;
  services: Service[];
  onSave: (nodeId: string, config: NodeConfig) => void;
  onClose: () => void;
  getUserServiceId: (serviceId: string) => Promise<string | undefined>;
}

export function ConfigPanel({ 
  node, 
  services, 
  onSave, 
  onClose,
  getUserServiceId 
}: ConfigPanelProps) {
  const { t } = useTranslation();
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [userServiceId, setUserServiceId] = useState<string | undefined>();

  const nodeData = node?.data;
  const service = nodeData?.service;
  const action = nodeData?.action;
  const reaction = nodeData?.reaction;
  const actionParams = action?.service_action_params || [];
  const reactionParams = reaction?.service_reaction_params || [];
  const params = [...actionParams, ...reactionParams] as Array<{
    id: string;
    name: string;
    display_name: string | null;
    description: string | null;
    type: string | null;
    required: boolean | null;
    default?: string;
  }>;

  useEffect(() => {
    if (node && service) {
      // Charger les valeurs existantes
      if (nodeData?.config) {
        setParamValues(nodeData.config.paramValues || {});
        setUserServiceId(nodeData.config.userServiceId);
      } else {
        // Initialiser avec les valeurs par défaut
        const defaults: Record<string, string> = {};
        params.forEach(param => {
          if (param.default) {
            defaults[param.name] = param.default;
          }
        });
        setParamValues(defaults);
      }

      // Récupérer ou créer le userService
      getUserServiceId(service.id).then(id => setUserServiceId(id));
    }
  }, [node, service, params, nodeData, getUserServiceId]);

  const handleParamChange = (paramName: string, value: string) => {
    setParamValues(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleSave = async () => {
    if (!node || !service || !userServiceId) return;

    setLoading(true);
    try {
      const config: NodeConfig = {
        serviceId: service.id,
        serviceName: service.name,
        actionId: action?.id,
        reactionId: reaction?.id,
        actionName: action?.name,
        reactionName: reaction?.name,
        paramValues,
        userServiceId
      };

      await onSave(node.id, config);
      onClose();
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    if (!userServiceId) return false;
    
    // Vérifier que tous les paramètres requis sont remplis
    return params.every(param => {
      if (!param.required) return true;
      const value = paramValues[param.name];
      return value !== undefined && value !== null && value.trim() !== '';
    });
  };

  if (!node || !service) {
    return null;
  }

  return (
    <Card variant="elevated" className="w-full max-w-md p-4 fixed right-4 top-20 bottom-4 overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#1A1A18]">
          {t('builder.config.title')}
        </h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClose}
        >
          ✕
        </Button>
      </div>

      <div className="space-y-4 mb-4">
        <div>
          <div className="text-sm font-medium text-[#1A1A18] mb-1">
            {t('builder.config.service')}
          </div>
          <div className="text-sm text-[#4D4C47]">
            {(service as any)?.displayName || (service as any)?.display_name || service?.name || 'Service'}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-[#1A1A18] mb-1">
            {nodeData?.type === 'action' ? t('builder.config.action') : t('builder.config.reaction')}
          </div>
          <div className="text-sm text-[#4D4C47]">
            {action?.display_name || reaction?.display_name}
          </div>
        </div>

        {params.length > 0 && (
          <div>
            <div className="text-sm font-medium text-[#1A1A18] mb-2">
              {t('builder.config.parameters')}
            </div>
            <div className="space-y-3">
              {params.map((param) => (
                <div key={param.id || param.name}>
                  <label className="block text-xs font-medium text-[#1A1A18] mb-1">
                    {param.display_name || param.name}
                    {param.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {param.description && (
                    <p className="text-xs text-[#4D4C47] mb-1">{param.description}</p>
                  )}
                  {param.type === 'textarea' ? (
                    <textarea
                      value={paramValues[param.name] || ''}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8E6E1] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0a4a0e]"
                      rows={3}
                      placeholder={param.default || ''}
                    />
                  ) : (
                    <Input
                      type={param.type === 'email' ? 'email' : 'text'}
                      value={paramValues[param.name] || ''}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      placeholder={param.default || ''}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-[#E8E6E1]">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          {t('builder.config.cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!isFormValid() || loading}
          className="flex-1"
        >
          {loading ? t('builder.config.saving') : t('builder.config.save')}
        </Button>
      </div>
    </Card>
  );
}

