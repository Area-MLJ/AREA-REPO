/**
 * ServicesPage.tsx
 * Page listant les services disponibles et leur statut
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MOCK_SERVICES } from '../../temp-shared';
import { Card } from '../../DesignSystem/components/Card';
import { Button } from '../../DesignSystem/components/Button';
import { Badge } from '../../DesignSystem/components/Badge';
import { apiClient, Service, UserService } from '../../lib/api';

export default function ServicesPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState(MOCK_SERVICES);
  const [dbServices, setDbServices] = useState<Service[]>([]);
  const [userServices, setUserServices] = useState<UserService[]>([]);
  const [spotifyLoading, setSpotifyLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [servicesRes, userServicesRes] = await Promise.all([
        apiClient.getServices(),
        apiClient.getUserServices(),
      ]);

      if (servicesRes.success && servicesRes.data) {
        setDbServices(servicesRes.data);
      }
      if (userServicesRes.success && userServicesRes.data) {
        setUserServices(userServicesRes.data);
      }
    };

    load();
  }, []);

  const spotifyServiceId = useMemo(() => {
    return dbServices.find((s) => s.name === 'spotify')?.id;
  }, [dbServices]);

  const spotifyUserService = useMemo(() => {
    if (!spotifyServiceId) {
      return null;
    }
    return userServices.find((us) => us.service_id === spotifyServiceId) || null;
  }, [spotifyServiceId, userServices]);

  const handleConnectSpotify = async () => {
    setSpotifyLoading(true);
    try {
      const res = await apiClient.spotifyAuthorize();
      if (!res.success || !res.data?.url) {
        return;
      }
      window.location.href = res.data.url;
    } finally {
      setSpotifyLoading(false);
    }
  };

  const toggleConnection = (serviceId: string) => {
    setServices(services.map(s =>
      s.id === serviceId ? { ...s, isConnected: !s.isConnected } : s
    ));
  };

  const getCategoryLabel = (category: string) => {
    const key = `services.category.${category}` as keyof typeof t;
    return t(key as any) || category;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-[#1A1A18]">{t('services.title')}</h1>
        <p className="text-sm md:text-base text-[#6B6962] mt-1">
          {t('services.subtitle')}
        </p>
      </div>

      <Card variant="outlined" padding="sm" className="md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-base md:text-lg font-semibold text-[#1A1A18]">{t('services.spotify.name')}</div>
            <div className="text-xs md:text-sm text-[#6B6962]">
              {spotifyUserService
                ? t('services.spotify.connectedAs', { name: spotifyUserService.display_name || t('services.spotify.name') })
                : t('services.spotify.notConnected')}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={spotifyUserService ? 'success' : 'neutral'} size="sm">
              {spotifyUserService ? t('services.spotify.connected') : t('services.spotify.notConnected')}
            </Badge>
            <Button
              variant={spotifyUserService ? 'outline' : 'primary'}
              size="sm"
              onClick={handleConnectSpotify}
              disabled={spotifyLoading}
            >
              {spotifyUserService ? t('common.reconnect') : t('common.connect')}
            </Button>
          </div>
        </div>
      </Card>

      <Card variant="outlined" padding="sm" className="md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-base md:text-lg font-semibold text-[#1A1A18]">{t('services.twitch.name')}</div>
            <div className="text-xs md:text-sm text-[#6B6962]">
              {t('services.twitch.noConnectionRequired')}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">
              {t('services.twitch.available')}
            </Badge>
            <Button variant="outline" size="sm" disabled>
              {t('common.connected')}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} variant="outlined" padding="sm" className="md:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3 md:mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={service.iconUrl}
                  alt={service.displayName}
                  className="h-8 w-8 md:h-10 md:w-10"
                />
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-[#1A1A18]">
                    {service.name}
                  </h3>
                  <Badge size="sm" variant="neutral">
                    {getCategoryLabel(service.category)}
                  </Badge>
                </div>
              </div>
              <Badge variant={service.isConnected ? 'success' : 'neutral'} size="sm">
                {service.isConnected ? t('common.connected') : t('common.notConnected')}
              </Badge>
            </div>

            <p className="text-[#6B6962] text-xs md:text-sm mb-3 md:mb-4">
              {service.description}
            </p>

            <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
              <div>
                <div className="text-xs font-medium text-[#8B8980] mb-1">
                  {t('services.actions')} ({service.actions.length})
                </div>
                <div className="text-xs md:text-sm text-[#4D4C47] line-clamp-2">
                  {service.actions.map(a => a.name).join(', ') || t('services.none')}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-[#8B8980] mb-1">
                  {t('services.reactions')} ({service.reactions.length})
                </div>
                <div className="text-xs md:text-sm text-[#4D4C47] line-clamp-2">
                  {service.reactions.map(r => r.name).join(', ') || t('services.none')}
                </div>
              </div>
            </div>

            <Button
              variant={service.isConnected ? 'outline' : 'primary'}
              size="sm"
              fullWidth
              onClick={() => toggleConnection(service.id)}
            >
              {service.isConnected ? t('common.disconnect') : t('common.connect')}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
