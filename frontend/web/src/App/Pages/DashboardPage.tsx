/**
 * DashboardPage.tsx
 * Page principale avec vue d'ensemble des AREAs
 */

import { useAreas, useAuth } from '../../temp-shared';
import { Card } from '../../DesignSystem/components/Card';
import { Button } from '../../DesignSystem/components/Button';
import { Badge } from '../../DesignSystem/components/Badge';

export default function DashboardPage() {
  const { areas, loading, error } = useAreas();
  const { user } = useAuth();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#1A1A18]">Dashboard</h1>
          <p className="text-sm md:text-base text-[#6B6962] mt-1">Gérez vos automatisations</p>
        </div>
        <Button onClick={() => window.location.href = '/area/create'} size="md" className="w-full sm:w-auto">
          + Nouvelle AREA
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card variant="outlined" padding="sm" className="md:p-6">
          <div className="text-[#6B6962] text-xs sm:text-sm mb-1">Total</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#0a4a0e]">{areas.length}</div>
        </Card>
        <Card variant="outlined" padding="sm" className="md:p-6">
          <div className="text-[#6B6962] text-xs sm:text-sm mb-1">Actives</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#10B981]">
            {areas.filter(a => a.isActive).length}
          </div>
        </Card>
        <Card variant="outlined" padding="sm" className="md:p-6">
          <div className="text-[#6B6962] text-xs sm:text-sm mb-1">Inactives</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#8B8980]">
            {areas.filter(a => !a.isActive).length}
          </div>
        </Card>
      </div>

      <div className="space-y-3 md:space-y-4">
        <h2 className="text-lg md:text-xl font-semibold text-[#1A1A18]">Mes AREAs</h2>

        {areas.length === 0 ? (
          <Card variant="outlined" className="text-center py-8 md:py-12">
            <div className="text-4xl md:text-6xl mb-3 md:mb-4">🤖</div>
            <h3 className="text-lg md:text-xl font-semibold text-[#1A1A18] mb-2">
              Aucune AREA créée
            </h3>
            <p className="text-sm md:text-base text-[#6B6962] mb-4 md:mb-6 px-4">
              Commencez par créer votre première automation
            </p>
            <Button onClick={() => window.location.href = '/area/create'} className="w-full max-w-xs mx-auto">
              Créer une AREA
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
                      <Badge variant={area.isActive ? 'success' : 'neutral'} size="sm">
                        {area.isActive ? 'Active' : 'Inactive'}
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
                  <div className="text-left sm:text-right text-xs md:text-sm text-[#8B8980]">
                    <div className="hidden sm:block">Créée le {formatDate(area.createdAt)}</div>
                    <div className="sm:hidden">{formatDate(area.createdAt)}</div>
                    {area.lastTriggered && (
                      <div className="mt-1 hidden sm:block">
                        Dernière : {formatDate(area.lastTriggered)}
                      </div>
                    )}
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
