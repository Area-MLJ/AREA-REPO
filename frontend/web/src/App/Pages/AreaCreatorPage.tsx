/**
 * AreaCreatorPage.tsx
 * Page de création d'AREA avec workflow visuel responsive
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MOCK_SERVICES } from '../../temp-shared';
import { Card } from '../../DesignSystem/components/Card';
import { Button } from '../../DesignSystem/components/Button';
import { Input } from '../../DesignSystem/components/Input';
import { Badge } from '../../DesignSystem/components/Badge';
import { apiClient, Service, UserService } from '../../lib/api';
import { AreaBuilder } from '../../components/AreaBuilder/AreaBuilder';

export default function AreaCreatorPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'form' | 'builder'>('form');
  const [step, setStep] = useState<'info' | 'action' | 'reaction' | 'review'>('info');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedActionService, setSelectedActionService] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [twitchUserLogin, setTwitchUserLogin] = useState('');
  const [selectedReactionService, setSelectedReactionService] = useState('');
  const [selectedReaction, setSelectedReaction] = useState('');
  const [spotifyTrackUrl, setSpotifyTrackUrl] = useState('');
  const [spotifyDeviceId, setSpotifyDeviceId] = useState('');
  const [twitchBroadcasterLogin, setTwitchBroadcasterLogin] = useState('');
  const [twitchChatMessage, setTwitchChatMessage] = useState('');
  const [backendServices, setBackendServices] = useState<Service[]>([]);
  const [backendUserServices, setBackendUserServices] = useState<UserService[]>([]);
  const [creating, setCreating] = useState(false);

  const connectedServices = MOCK_SERVICES.filter(s => s.isConnected);
  const actionServices = connectedServices.filter(s => s.actions.length > 0);
  const reactionServices = connectedServices.filter(s => s.reactions.length > 0);

  useEffect(() => {
    const load = async () => {
      const [servicesRes, userServicesRes] = await Promise.all([
        apiClient.getServices(),
        apiClient.getUserServices(),
      ]);
      if (servicesRes.success && servicesRes.data) {
        setBackendServices(servicesRes.data);
      }
      if (userServicesRes.success && userServicesRes.data) {
        setBackendUserServices(userServicesRes.data);
      }
    };
    load();
  }, []);

  const twitchServiceId = useMemo(() => {
    return backendServices.find((s) => s.name === 'twitch')?.id;
  }, [backendServices]);

  const spotifyServiceId = useMemo(() => {
    return backendServices.find((s) => s.name === 'spotify')?.id;
  }, [backendServices]);

  const getOrCreateUserService = async (serviceId: string, displayName: string) => {
    const existing = backendUserServices.find((us) => us.service_id === serviceId);
    if (existing) {
      return existing;
    }

    const created = await apiClient.createUserService({
      service_id: serviceId,
      display_name: displayName,
    });
    if (!created.success || !created.data) {
      throw new Error(created.error || 'Failed to create user service');
    }
    setBackendUserServices((prev) => [...prev, created.data!]);
    return created.data;
  };

  const handleCreate = async () => {
    if (selectedAction === 'twitch_stream_online' && selectedReaction === 'spotify_play_track') {
      if (!twitchServiceId) {
        alert('Service Twitch introuvable côté backend');
        return;
      }
      if (!spotifyServiceId) {
        alert('Service Spotify introuvable côté backend');
        return;
      }
      if (!spotifyTrackUrl.trim()) {
        alert('URL du morceau Spotify requise');
        return;
      }

      setCreating(true);
      try {
        const areaRes = await apiClient.createArea({ name, description, enabled: true });
        if (!areaRes.success || !areaRes.data?.id) {
          throw new Error(areaRes.error || 'Failed to create area');
        }

        const twitchUserService = await getOrCreateUserService(twitchServiceId, 'Twitch');
        const spotifyUserService = backendUserServices.find((us) => us.service_id === spotifyServiceId);
        if (!spotifyUserService) {
          throw new Error('Spotify non connecté: connecte Spotify dans /services avant de créer cette AREA');
        }

        const [twitchActionsRes, spotifyReactionsRes] = await Promise.all([
          apiClient.getServiceActions(twitchServiceId),
          apiClient.getServiceReactions(spotifyServiceId),
        ]);

        if (!twitchActionsRes.success || !twitchActionsRes.data) {
          throw new Error(twitchActionsRes.error || 'Failed to load Twitch actions');
        }
        if (!spotifyReactionsRes.success || !spotifyReactionsRes.data) {
          throw new Error(spotifyReactionsRes.error || 'Failed to load Spotify reactions');
        }

        const twitchAction = twitchActionsRes.data.find((a) => a.name === 'stream_online');
        if (!twitchAction) {
          throw new Error('Action Twitch stream_online introuvable');
        }
        const twitchUserLoginParamId = twitchAction.service_action_params?.find((p) => p.name === 'user_login')?.id;
        if (!twitchUserLoginParamId) {
          throw new Error('Paramètre Twitch user_login introuvable');
        }

        const spotifyReaction = spotifyReactionsRes.data.find((r) => r.name === 'play_track');
        if (!spotifyReaction) {
          throw new Error('Réaction Spotify play_track introuvable');
        }
        const spotifyTrackUrlParamId = spotifyReaction.service_reaction_params?.find((p) => p.name === 'track_url')?.id;
        const spotifyDeviceIdParamId = spotifyReaction.service_reaction_params?.find((p) => p.name === 'device_id')?.id;
        if (!spotifyTrackUrlParamId) {
          throw new Error('Paramètre Spotify track_url introuvable');
        }

        const actionRes = await apiClient.createAreaAction(areaRes.data.id, {
          service_action_id: twitchAction.id,
          user_service_id: twitchUserService.id,
          enabled: true,
          param_values: [
            {
              service_action_param_id: twitchUserLoginParamId,
              value_text: twitchUserLogin.trim(),
            },
          ],
        });
        if (!actionRes.success) {
          throw new Error(actionRes.error || 'Failed to create area action');
        }

        const reactionParamValues: Array<{ service_reaction_param_id: string; value_text?: string }> = [
          {
            service_reaction_param_id: spotifyTrackUrlParamId,
            value_text: spotifyTrackUrl.trim(),
          },
        ];
        if (spotifyDeviceIdParamId && spotifyDeviceId.trim()) {
          reactionParamValues.push({
            service_reaction_param_id: spotifyDeviceIdParamId,
            value_text: spotifyDeviceId.trim(),
          });
        }

        const reactionRes = await apiClient.createAreaReaction(areaRes.data.id, {
          service_reaction_id: spotifyReaction.id,
          user_service_id: spotifyUserService.id,
          enabled: true,
          position: 0,
          param_values: reactionParamValues,
        });
        if (!reactionRes.success) {
          throw new Error(reactionRes.error || 'Failed to create area reaction');
        }

        alert(t('areas.create.success'));
        window.location.href = '/dashboard';
      } catch (e: any) {
        const errorMsg = e?.message || t('areas.create.error');
        if (errorMsg.includes('Twitch')) {
          alert(t('areas.create.twitchNotFound'));
        } else if (errorMsg.includes('Spotify')) {
          if (errorMsg.includes('connecté')) {
            alert(t('areas.create.spotifyNotConnected'));
          } else if (errorMsg.includes('URL')) {
            alert(t('areas.create.spotifyUrlRequired'));
          } else {
            alert(t('areas.create.spotifyNotFound'));
          }
        } else {
          alert(errorMsg);
        }
      } finally {
        setCreating(false);
      }
      return;
    }

    if (selectedAction === 'spotify_track_changed' && selectedReaction === 'twitch_send_chat_message') {
      if (!spotifyServiceId) {
        alert('Service Spotify introuvable côté backend');
        return;
      }
      if (!twitchServiceId) {
        alert('Service Twitch introuvable côté backend');
        return;
      }
      if (!twitchBroadcasterLogin.trim()) {
        alert('Login Twitch de la chaîne requis');
        return;
      }
      if (!twitchChatMessage.trim()) {
        alert('Message requis');
        return;
      }

      setCreating(true);
      try {
        const areaRes = await apiClient.createArea({ name, description, enabled: true });
        if (!areaRes.success || !areaRes.data?.id) {
          throw new Error(areaRes.error || 'Failed to create area');
        }

        const spotifyUserService = backendUserServices.find((us) => us.service_id === spotifyServiceId);
        if (!spotifyUserService) {
          throw new Error('Spotify non connecté: connecte Spotify dans /services avant de créer cette AREA');
        }

        const twitchUserService = await getOrCreateUserService(twitchServiceId, 'Twitch');

        const [spotifyActionsRes, twitchReactionsRes] = await Promise.all([
          apiClient.getServiceActions(spotifyServiceId),
          apiClient.getServiceReactions(twitchServiceId),
        ]);

        if (!spotifyActionsRes.success || !spotifyActionsRes.data) {
          throw new Error(spotifyActionsRes.error || 'Failed to load Spotify actions');
        }
        if (!twitchReactionsRes.success || !twitchReactionsRes.data) {
          throw new Error(twitchReactionsRes.error || 'Failed to load Twitch reactions');
        }

        const spotifyAction = spotifyActionsRes.data.find((a) => a.name === 'track_changed');
        if (!spotifyAction) {
          throw new Error('Action Spotify track_changed introuvable');
        }

        const twitchReaction = twitchReactionsRes.data.find((r) => r.name === 'send_chat_message');
        if (!twitchReaction) {
          throw new Error('Réaction Twitch send_chat_message introuvable');
        }

        const twitchBroadcasterLoginParamId = twitchReaction.service_reaction_params?.find((p) => p.name === 'broadcaster_login')?.id;
        const twitchMessageParamId = twitchReaction.service_reaction_params?.find((p) => p.name === 'message')?.id;
        if (!twitchBroadcasterLoginParamId || !twitchMessageParamId) {
          throw new Error('Paramètres Twitch broadcaster_login/message introuvables');
        }

        const actionRes = await apiClient.createAreaAction(areaRes.data.id, {
          service_action_id: spotifyAction.id,
          user_service_id: spotifyUserService.id,
          enabled: true,
        });
        if (!actionRes.success) {
          throw new Error(actionRes.error || 'Failed to create area action');
        }

        const reactionRes = await apiClient.createAreaReaction(areaRes.data.id, {
          service_reaction_id: twitchReaction.id,
          user_service_id: twitchUserService.id,
          enabled: true,
          position: 0,
          param_values: [
            {
              service_reaction_param_id: twitchBroadcasterLoginParamId,
              value_text: twitchBroadcasterLogin.trim(),
            },
            {
              service_reaction_param_id: twitchMessageParamId,
              value_text: twitchChatMessage.trim(),
            },
          ],
        });
        if (!reactionRes.success) {
          throw new Error(reactionRes.error || 'Failed to create area reaction');
        }

        alert(t('areas.create.success'));
        window.location.href = '/dashboard';
      } catch (e: any) {
        const errorMsg = e?.message || t('areas.create.error');
        if (errorMsg.includes('Twitch')) {
          alert(t('areas.create.twitchNotFound'));
        } else if (errorMsg.includes('Spotify')) {
          if (errorMsg.includes('connecté')) {
            alert(t('areas.create.spotifyNotConnected'));
          } else {
            alert(t('areas.create.spotifyNotFound'));
          }
        } else {
          alert(errorMsg);
        }
      } finally {
        setCreating(false);
      }
      return;
    }

    alert(t('areas.create.notImplemented'));
  };

  const canProceed = () => {
    switch (step) {
      case 'info':
        return name.trim() !== '' && description.trim() !== '';
      case 'action':
        if (selectedActionService === '' || selectedAction === '') {
          return false;
        }
        if (selectedAction === 'twitch_stream_online') {
          return twitchUserLogin.trim() !== '';
        }
        return true;
      case 'reaction':
        if (selectedReactionService === '' || selectedReaction === '') {
          return false;
        }
        if (selectedReaction === 'spotify_play_track') {
          return spotifyTrackUrl.trim() !== '';
        }
        if (selectedReaction === 'twitch_send_chat_message') {
          return twitchBroadcasterLogin.trim() !== '' && twitchChatMessage.trim() !== '';
        }
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleBuilderSave = (areaId: string) => {
    alert(t('areas.create.success'));
    window.location.href = '/dashboard';
  };

  const handleBuilderCancel = () => {
    window.location.href = '/dashboard';
  };

  // Charger les services avec leurs actions et réactions pour le builder
  const [servicesWithDetails, setServicesWithDetails] = useState<Service[]>([]);

  useEffect(() => {
    if (mode === 'builder' && backendServices.length > 0) {
      const loadServicesDetails = async () => {
        try {
          const servicesPromises = backendServices.map(async (service) => {
            try {
              const [actionsRes, reactionsRes] = await Promise.all([
                apiClient.getServiceActions(service.id),
                apiClient.getServiceReactions(service.id),
              ]);

              return {
                ...service,
                actions: actionsRes.success && actionsRes.data ? actionsRes.data : [],
                reactions: reactionsRes.success && reactionsRes.data ? reactionsRes.data : [],
              };
            } catch (error) {
              console.error(`Error loading details for service ${service.id}:`, error);
              return {
                ...service,
                actions: [],
                reactions: [],
              };
            }
          });

          const services = await Promise.all(servicesPromises);
          console.log('Loaded services with details:', services);
          setServicesWithDetails(services);
        } catch (error) {
          console.error('Error loading services details:', error);
        }
      };

      loadServicesDetails();
    } else if (mode === 'builder' && backendServices.length === 0) {
      // Réinitialiser si on passe en mode builder mais qu'il n'y a pas encore de services
      setServicesWithDetails([]);
    }
  }, [mode, backendServices]);

  // Si mode builder, afficher le builder
  if (mode === 'builder') {
    return (
      <div className="h-screen flex flex-col bg-[#FAF9F7]">
        <div className="p-4 border-b border-[#E8E6E1] bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#1A1A18]">{t('areas.create.title')}</h1>
              <p className="text-sm text-[#4D4C47] mt-1">
                {t('areas.create.builderMode')} - {t('builder.palette.title')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode('form')}
              >
                {t('areas.create.formMode')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setMode('builder')}
              >
                {t('areas.create.builderMode')}
              </Button>
            </div>
          </div>
        </div>
        {servicesWithDetails.length === 0 && backendServices.length > 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[#4D4C47] mb-4">{t('common.loading')}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <AreaBuilder
              services={servicesWithDetails}
              userServices={backendUserServices}
              name={name || t('areas.create.title')}
              description={description}
              onSave={handleBuilderSave}
              onCancel={handleBuilderCancel}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#1A1A18]">{t('areas.create.title')}</h1>
            <p className="text-sm md:text-base text-[#4D4C47] mt-1">
              {t('areas.create.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setMode('form')}
            >
              {t('areas.create.formMode')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode('builder')}
            >
              {t('areas.create.builderMode')}
            </Button>
          </div>
        </div>

      <div className="flex items-center gap-1 md:gap-2 mb-6 md:mb-8">
        {['info', 'action', 'reaction', 'review'].map((s, idx) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex-1 h-1.5 md:h-2 rounded-full ${
              ['info', 'action', 'reaction', 'review'].indexOf(step) >= idx
                ? 'bg-[#0a4a0e]'
                : 'bg-[#D1CFC8]'
            }`} />
          </div>
        ))}
      </div>

      {step === 'info' && (
        <Card variant="elevated" padding="md" className="md:p-8">
          <h2 className="text-lg md:text-xl font-semibold text-[#1A1A18] mb-4 md:mb-6">
            {t('areas.create.step.info')}
          </h2>
          <div className="space-y-4">
            <Input
              label={t('areas.create.name')}
              placeholder={t('areas.create.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label={t('areas.create.description')}
              placeholder={t('areas.create.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </Card>
      )}

      {step === 'action' && (
        <Card variant="elevated" padding="md" className="md:p-8">
          <h2 className="text-lg md:text-xl font-semibold text-[#1A1A18] mb-2">
            {t('areas.create.step.action')}
          </h2>
          <p className="text-sm md:text-base text-[#4D4C47] mb-4 md:mb-6">
            {t('areas.create.selectActionService')}
          </p>

          {actionServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm md:text-base text-[#4D4C47]">
                {t('services.none')} {t('services.actions')} {t('common.connected')}.{' '}
                <a href="/services" className="text-[#0a4a0e] hover:underline">
                  {t('common.connect')} {t('services.title')}
                </a>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {actionServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedActionService(service.id);
                      setSelectedAction('');
                      setTwitchUserLogin('');
                    }}
                    className={`p-3 md:p-4 rounded-lg border-2 transition-colors text-left ${
                      selectedActionService === service.id
                        ? 'border-[#0a4a0e] bg-[#e6f2e7]'
                        : 'border-[#D1CFC8] hover:border-[#B3B1A8]'
                    }`}
                  >
                    <img
                      src={service.iconUrl}
                      alt={service.displayName}
                      className="h-8 w-8 md:h-10 md:w-10 mb-2"
                    />
                    <div className="text-sm md:text-base font-medium text-[#1A1A18]">{service.name}</div>
                    <div className="text-xs md:text-sm text-[#4D4C47]">
                      {service.actions.length} {t('builder.palette.actions')}
                    </div>
                  </button>
                ))}
              </div>

              {selectedActionService && (
                <div className="mt-4 md:mt-6">
                  <h3 className="text-sm md:text-base font-medium text-[#1A1A18] mb-3">
                    {t('areas.create.selectAction')}
                  </h3>
                  <div className="space-y-2">
                    {actionServices
                      .find(s => s.id === selectedActionService)
                      ?.actions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => setSelectedAction(action.id)}
                          className={`w-full p-3 md:p-4 rounded-lg border-2 transition-colors text-left ${
                            selectedAction === action.id
                              ? 'border-[#0a4a0e] bg-[#e6f2e7]'
                              : 'border-[#D1CFC8] hover:border-[#B3B1A8]'
                          }`}
                        >
                          <div className="text-sm md:text-base font-medium text-[#1A1A18] mb-1">
                            {action.name}
                          </div>
                          <div className="text-xs md:text-sm text-[#4D4C47]">
                            {action.description}
                          </div>
                        </button>
                      ))}
                  </div>

                  {selectedAction === 'twitch_stream_online' && (
                    <div className="mt-4">
                      <Input
                        label={t('areas.create.twitchUserLogin')}
                        placeholder={t('areas.create.twitchUserLoginPlaceholder')}
                        value={twitchUserLogin}
                        onChange={(e) => setTwitchUserLogin(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {step === 'reaction' && (
        <Card variant="elevated" padding="md" className="md:p-8">
          <h2 className="text-lg md:text-xl font-semibold text-[#1A1A18] mb-2">
            {t('areas.create.step.reaction')}
          </h2>
          <p className="text-sm md:text-base text-[#4D4C47] mb-4 md:mb-6">
            {t('areas.create.selectReactionService')}
          </p>

          {reactionServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm md:text-base text-[#4D4C47]">
                {t('services.none')} {t('services.reactions')} {t('common.connected')}.{' '}
                <a href="/services" className="text-[#0a4a0e] hover:underline">
                  {t('common.connect')} {t('services.title')}
                </a>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reactionServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedReactionService(service.id);
                      setSelectedReaction('');
                      setSpotifyTrackUrl('');
                      setSpotifyDeviceId('');
                    }}
                    className={`p-3 md:p-4 rounded-lg border-2 transition-colors text-left ${
                      selectedReactionService === service.id
                        ? 'border-[#0a4a0e] bg-[#e6f2e7]'
                        : 'border-[#D1CFC8] hover:border-[#B3B1A8]'
                    }`}
                  >
                    <img
                      src={service.iconUrl}
                      alt={service.displayName}
                      className="h-8 w-8 md:h-10 md:w-10 mb-2"
                    />
                    <div className="text-sm md:text-base font-medium text-[#1A1A18]">{service.name}</div>
                    <div className="text-xs md:text-sm text-[#4D4C47]">
                      {service.reactions.length} {t('builder.palette.reactions')}
                    </div>
                  </button>
                ))}
              </div>

              {selectedReactionService && (
                <div className="mt-4 md:mt-6">
                  <h3 className="text-sm md:text-base font-medium text-[#1A1A18] mb-3">
                    {t('areas.create.selectReaction')}
                  </h3>
                  <div className="space-y-2">
                    {reactionServices
                      .find(s => s.id === selectedReactionService)
                      ?.reactions.map((reaction) => (
                        <button
                          key={reaction.id}
                          onClick={() => setSelectedReaction(reaction.id)}
                          className={`w-full p-3 md:p-4 rounded-lg border-2 transition-colors text-left ${
                            selectedReaction === reaction.id
                              ? 'border-[#0a4a0e] bg-[#e6f2e7]'
                              : 'border-[#D1CFC8] hover:border-[#B3B1A8]'
                          }`}
                        >
                          <div className="text-sm md:text-base font-medium text-[#1A1A18] mb-1">
                            {reaction.name}
                          </div>
                          <div className="text-xs md:text-sm text-[#4D4C47]">
                            {reaction.description}
                          </div>
                        </button>
                      ))}
                  </div>

                  {selectedReaction === 'spotify_play_track' && (
                    <div className="space-y-4">
                      <Input
                        label={t('areas.create.spotifyTrackUrl')}
                        placeholder={t('areas.create.spotifyTrackUrlPlaceholder')}
                        value={spotifyTrackUrl}
                        onChange={(e) => setSpotifyTrackUrl(e.target.value)}
                      />
                      <Input
                        label={t('areas.create.spotifyDeviceId')}
                        placeholder={t('areas.create.spotifyDeviceIdPlaceholder')}
                        value={spotifyDeviceId}
                        onChange={(e) => setSpotifyDeviceId(e.target.value)}
                      />
                    </div>
                  )}

                  {selectedReaction === 'twitch_send_chat_message' && (
                    <div className="space-y-4">
                      <Input
                        label="Login Twitch de la chaîne"
                        placeholder="ex: gotaga"
                        value={twitchBroadcasterLogin}
                        onChange={(e) => setTwitchBroadcasterLogin(e.target.value)}
                      />
                      <Input
                        label="Message"
                        placeholder="Now playing: {{track_name}} - {{artist_name}}"
                        value={twitchChatMessage}
                        onChange={(e) => setTwitchChatMessage(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {step === 'review' && (
        <Card variant="elevated" padding="md" className="md:p-8">
          <h2 className="text-lg md:text-xl font-semibold text-[#1A1A18] mb-4 md:mb-6">
            {t('areas.create.step.review')}
          </h2>
          <div className="space-y-4 md:space-y-6">
            <div>
              <div className="text-xs md:text-sm text-[#8B8980] mb-1">{t('areas.create.name')}</div>
              <div className="text-sm md:text-base font-medium text-[#1A1A18]">{name}</div>
            </div>
            <div>
              <div className="text-xs md:text-sm text-[#8B8980] mb-1">{t('areas.create.description')}</div>
              <div className="text-sm md:text-base text-[#4D4C47]">{description}</div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 p-3 md:p-4 bg-[#E8E6E1] rounded-lg">
              <div className="flex-1 text-center w-full">
                <Badge variant="primary" size="sm">{t('builder.nodes.action')}</Badge>
                <div className="mt-2 text-sm md:text-base font-medium text-[#1A1A18]">
                  {MOCK_SERVICES.find(s => s.id === selectedActionService)?.name}
                </div>
                <div className="text-xs md:text-sm text-[#4D4C47] mt-1">
                  {MOCK_SERVICES.find(s => s.id === selectedActionService)
                    ?.actions.find(a => a.id === selectedAction)?.name}
                </div>
                {selectedAction === 'twitch_stream_online' && (
                  <div className="text-xs md:text-sm text-[#4D4C47] mt-1">
                    Streamer : {twitchUserLogin}
                  </div>
                )}
              </div>
              <div className="text-xl md:text-2xl text-[#0a4a0e] rotate-90 sm:rotate-0">→</div>
              <div className="flex-1 text-center w-full">
                <Badge variant="success" size="sm">{t('builder.nodes.reaction')}</Badge>
                <div className="mt-2 text-sm md:text-base font-medium text-[#1A1A18]">
                  {MOCK_SERVICES.find(s => s.id === selectedReactionService)?.name}
                </div>
                <div className="text-xs md:text-sm text-[#4D4C47] mt-1">
                  {MOCK_SERVICES.find(s => s.id === selectedReactionService)
                    ?.reactions.find(r => r.id === selectedReaction)?.name}
                </div>
                {selectedReaction === 'spotify_play_track' && (
                  <div className="text-xs md:text-sm text-[#4D4C47] mt-1">
                    Morceau : {spotifyTrackUrl}
                  </div>
                )}

                {selectedReaction === 'twitch_send_chat_message' && (
                  <div className="text-xs md:text-sm text-[#4D4C47] mt-1">
                    Chaîne : {twitchBroadcasterLogin}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <Button
          variant="outline"
          className="order-2 sm:order-1 w-full sm:w-auto"
          onClick={() => {
            const steps = ['info', 'action', 'reaction', 'review'] as const;
            const currentIdx = steps.indexOf(step);
            if (currentIdx > 0) {
              setStep(steps[currentIdx - 1]);
            } else {
              window.location.href = '/dashboard';
            }
          }}
        >
          {step === 'info' ? t('common.cancel') : t('common.previous')}
        </Button>

        <Button
          className="order-1 sm:order-2 w-full sm:w-auto"
          onClick={() => {
            const steps = ['info', 'action', 'reaction', 'review'] as const;
            const currentIdx = steps.indexOf(step);
            if (step === 'review') {
              handleCreate();
            } else {
              setStep(steps[currentIdx + 1]);
            }
          }}
          disabled={!canProceed() || creating}
        >
          {step === 'review' ? t('areas.create.create') : t('common.next')}
        </Button>
      </div>
      </div>
    </div>
  );
}
