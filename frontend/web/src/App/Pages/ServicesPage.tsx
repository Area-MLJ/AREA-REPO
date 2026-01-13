/**
 * ServicesPage.tsx
 * Page listant les services disponibles et leur statut
 */

import { useEffect, useMemo, useState } from 'react';
import { MOCK_SERVICES } from '../../temp-shared';
import { Card } from '../../DesignSystem/components/Card';
import { Button } from '../../DesignSystem/components/Button';
import { Badge } from '../../DesignSystem/components/Badge';
import { apiClient, Service, UserService } from '../../lib/api';

export default function ServicesPage() {
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

  const categoryLabels = {
    social: 'Réseaux sociaux',
    productivity: 'Productivité',
    storage: 'Stockage',
    communication: 'Communication',
    time: 'Temps',
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-[#1A1A18]">Services</h1>
        <p className="text-sm md:text-base text-[#6B6962] mt-1">
          Connectez vos services pour créer des automatisations
        </p>
      </div>

      <Card variant="outlined" padding="sm" className="md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-base md:text-lg font-semibold text-[#1A1A18]">Spotify</div>
            <div className="text-xs md:text-sm text-[#6B6962]">
              {spotifyUserService
                ? `Connecté : ${spotifyUserService.display_name || 'Compte Spotify'}`
                : 'Non connecté'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={spotifyUserService ? 'success' : 'neutral'} size="sm">
              {spotifyUserService ? 'Connecté' : 'Non connecté'}
            </Badge>
            <Button
              variant={spotifyUserService ? 'outline' : 'primary'}
              size="sm"
              onClick={handleConnectSpotify}
              disabled={spotifyLoading}
            >
              {spotifyUserService ? 'Reconnecter' : 'Connecter'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} variant="outlined" padding="sm" className="md:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3 md:mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl md:text-4xl">{service.icon}</div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-[#1A1A18]">
                    {service.name}
                  </h3>
                  <Badge size="sm" variant="neutral">
                    {categoryLabels[service.category]}
                  </Badge>
                </div>
              </div>
              <Badge variant={service.isConnected ? 'success' : 'neutral'} size="sm" className="self-start">
                {service.isConnected ? 'Connecté' : 'Non connecté'}
              </Badge>
            </div>

            <p className="text-[#6B6962] text-xs md:text-sm mb-3 md:mb-4">
              {service.description}
            </p>

            <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
              <div>
                <div className="text-xs font-medium text-[#8B8980] mb-1">
                  ACTIONS ({service.actions.length})
                </div>
                <div className="text-xs md:text-sm text-[#4D4C47] line-clamp-2">
                  {service.actions.map(a => a.name).join(', ') || 'Aucune'}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-[#8B8980] mb-1">
                  REACTIONS ({service.reactions.length})
                </div>
                <div className="text-xs md:text-sm text-[#4D4C47] line-clamp-2">
                  {service.reactions.map(r => r.name).join(', ') || 'Aucune'}
                </div>
              </div>
            </div>

            <Button
              variant={service.isConnected ? 'outline' : 'primary'}
              size="sm"
              fullWidth
              onClick={() => toggleConnection(service.id)}
            >
              {service.isConnected ? 'Déconnecter' : 'Connecter'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
