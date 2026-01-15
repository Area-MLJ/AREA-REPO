/**
 * DashboardPage.tsx
 * Page principale avec vue d'ensemble des AREAs
 */

import { useTranslation } from 'react-i18next';
import { useAreas, useAuth } from '../../temp-shared';
import { Card } from '../../DesignSystem/components/Card';
import { Button } from '../../DesignSystem/components/Button';
import { Badge } from '../../DesignSystem/components/Badge';
import { apiClient } from '../../lib/api';

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { areas, loading, error } = useAreas();
  const { user } = useAuth();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#1A1A18]">{t('dashboard.title')}</h1>
          <p className="text-sm md:text-base text-[#6B6962] mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <Button onClick={() => window.location.href = '/area/create'} size="md" className="w-full sm:w-auto">
          + {t('dashboard.createArea')}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card variant="outlined" padding="sm" className="md:p-6">
          <div className="text-[#6B6962] text-xs sm:text-sm mb-1">{t('dashboard.total')}</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#0a4a0e]">{areas.length}</div>
        </Card>
        <Card variant="outlined" padding="sm" className="md:p-6">
          <div className="text-[#6B6962] text-xs sm:text-sm mb-1">{t('dashboard.active')}</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#10B981]">
            {areas.filter(a => a.isActive).length}
          </div>
        </Card>
        <Card variant="outlined" padding="sm" className="md:p-6">
          <div className="text-[#6B6962] text-xs sm:text-sm mb-1">{t('dashboard.inactive')}</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#8B8980]">
            {areas.filter(a => !a.isActive).length}
          </div>
        </Card>
      </div>

      <div className="space-y-3 md:space-y-4">
        <h2 className="text-lg md:text-xl font-semibold text-[#1A1A18]">{t('dashboard.myAreas')}</h2>

        {areas.length === 0 ? (
          <Card variant="outlined" className="text-center py-8 md:py-12">
            <div className="text-4xl md:text-6xl mb-3 md:mb-4">🤖</div>
            <h3 className="text-lg md:text-xl font-semibold text-[#1A1A18] mb-2">
              {t('dashboard.noAreas.title')}
            </h3>
            <p className="text-sm md:text-base text-[#6B6962] mb-4 md:mb-6 px-4">
              {t('dashboard.noAreas.description')}
            </p>
            <Button onClick={() => window.location.href = '/area/create'} className="w-full max-w-xs mx-auto">
              {t('dashboard.noAreas.button')}
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {areas.map((area) => (
              <Card key={area.id} variant="elevated" padding="sm" className="md:p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-base md:text-lg font-semibold text-[#1A1A18]">
                        {area.name}
                      </h3>
                      {area.isBuiltin && (
                        <Badge variant="info" size="sm">
                          {t('dashboard.builtin')}
                        </Badge>
                      )}
                      <Badge variant={area.isActive ? 'success' : 'neutral'} size="sm">
                        {area.isActive ? t('dashboard.active') : t('dashboard.inactive')}
                      </Badge>
                    </div>
                    <p className="text-[#6B6962] text-xs md:text-sm mb-3">
                      {area.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs md:text-sm">
                      <span className="font-medium text-[#0a4a0e] truncate max-w-[120px] sm:max-w-none">
                        {area.actionService}
                      </span>
                      <span className="text-[#8B8980]">→</span>
                      <span className="font-medium text-[#0a4a0e] truncate max-w-[120px] sm:max-w-none">
                        {area.reactionService}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-left sm:text-right text-xs md:text-sm text-[#8B8980]">
                      <div className="hidden sm:block">{t('dashboard.createdOn')} {formatDate(area.createdAt)}</div>
                      <div className="sm:hidden">{formatDate(area.createdAt)}</div>
                      {area.lastTriggered && (
                        <div className="mt-1 hidden sm:block">
                          {t('dashboard.lastTriggered')} {formatDate(area.lastTriggered)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant={area.isActive ? "outlined" : "primary"}
                        onClick={async () => {
                          try {
                            const response = await apiClient.updateArea(area.id, { enabled: !area.isActive });
                            if (response.success) {
                              window.location.reload();
                            }
                          } catch (error) {
                            console.error('Error updating area:', error);
                          }
                        }}
                      >
                        {area.isActive ? t('dashboard.deactivate') : t('dashboard.activate')}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outlined"
                        onClick={() => window.location.href = `/area/${area.id}`}
                      >
                        {t('dashboard.configure')}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
