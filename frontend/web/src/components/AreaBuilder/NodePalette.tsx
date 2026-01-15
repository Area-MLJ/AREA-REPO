import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Service, ServiceAction, ServiceReaction } from '../../lib/api';
import { Card } from '../../DesignSystem/components/Card';
import { Input } from '../../DesignSystem/components/Input';
import { Badge } from '../../DesignSystem/components/Badge';

interface NodePaletteProps {
  services: Array<Service & { actions?: ServiceAction[]; reactions?: ServiceReaction[] }>;
  onDragStart: (event: React.DragEvent, nodeType: 'action' | 'reaction', service: Service, action?: ServiceAction, reaction?: ServiceReaction) => void;
  onDragEnd: () => void;
}

export function NodePalette({ services, onDragStart, onDragEnd }: NodePaletteProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'actions' | 'reactions'>('all');

  // Debug: log services
  console.log('NodePalette - services:', services);
  console.log('NodePalette - services count:', services.length);
  services.forEach((s, i) => {
    console.log(`Service ${i}:`, {
      id: s.id,
      name: s.name,
      actions: s.actions?.length || 0,
      reactions: s.reactions?.length || 0,
    });
  });

  const filteredServices = services.filter(service => {
    const displayName = (service as any).displayName || (service as any).display_name || service.name;
    const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'actions') {
      return matchesSearch && service.actions && service.actions.length > 0;
    }
    if (selectedCategory === 'reactions') {
      return matchesSearch && service.reactions && service.reactions.length > 0;
    }
    return matchesSearch;
  });

  const handleDragStart = (
    event: React.DragEvent,
    nodeType: 'action' | 'reaction',
    service: Service,
    action?: ServiceAction,
    reaction?: ServiceReaction
  ) => {
    onDragStart(event, nodeType, service, action, reaction);
  };

  return (
    <Card variant="elevated" className="w-64 p-4 h-full overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[#1A1A18] mb-3">
          {t('builder.palette.title')}
        </h3>
        
        <Input
          type="text"
          placeholder={t('builder.palette.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
        />

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 py-1 text-xs rounded ${
              selectedCategory === 'all'
                ? 'bg-[#0a4a0e] text-white'
                : 'bg-[#E8E6E1] text-[#1A1A18]'
            }`}
          >
            {t('builder.palette.all')}
          </button>
          <button
            onClick={() => setSelectedCategory('actions')}
            className={`px-2 py-1 text-xs rounded ${
              selectedCategory === 'actions'
                ? 'bg-[#0a4a0e] text-white'
                : 'bg-[#E8E6E1] text-[#1A1A18]'
            }`}
          >
            {t('builder.palette.actions')}
          </button>
          <button
            onClick={() => setSelectedCategory('reactions')}
            className={`px-2 py-1 text-xs rounded ${
              selectedCategory === 'reactions'
                ? 'bg-[#0a4a0e] text-white'
                : 'bg-[#E8E6E1] text-[#1A1A18]'
            }`}
          >
            {t('builder.palette.reactions')}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredServices.length === 0 ? (
          <div className="text-sm text-[#4D4C47] text-center py-4">
            {t('builder.palette.noServices')}
          </div>
        ) : (
          filteredServices.map((service) => (
            <div key={service.id} className="space-y-2">
              <div className="flex items-center gap-2">
                {service.iconUrl && (
                  <img src={service.iconUrl} alt={service.name} className="w-5 h-5 rounded" />
                )}
                <div className="font-medium text-sm text-[#1A1A18]">
                  {(service as any).displayName || (service as any).display_name || service.name}
                </div>
              </div>

              {/* Actions */}
              {service.actions && service.actions.length > 0 && 
               (selectedCategory === 'all' || selectedCategory === 'actions') && (
                <div className="ml-2 space-y-1">
                  {service.actions.map((action) => (
                    <div
                      key={action.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'action', service, action)}
                      onDragEnd={onDragEnd}
                      className="p-2 bg-[#f0f9f4] rounded border border-[#E8E6E1] cursor-move hover:border-[#0a4a0e] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#1A1A18]">
                          {action.display_name}
                        </span>
                        <Badge variant="primary" size="sm">{t('builder.palette.action')}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Réactions */}
              {service.reactions && service.reactions.length > 0 && 
               (selectedCategory === 'all' || selectedCategory === 'reactions') && (
                <div className="ml-2 space-y-1">
                  {service.reactions.map((reaction) => (
                    <div
                      key={reaction.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'reaction', service, undefined, reaction)}
                      onDragEnd={onDragEnd}
                      className="p-2 bg-[#f0f9f4] rounded border border-[#E8E6E1] cursor-move hover:border-[#0a4a0e] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#1A1A18]">
                          {reaction.display_name}
                        </span>
                        <Badge variant="primary" size="sm">{t('builder.palette.reaction')}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

