/**
 * AreaCreatorPage.tsx
 * Page de création d'AREA avec workflow visuel responsive
 */

import { useState } from 'react';
import { MOCK_SERVICES } from '../../Shared/SharedIndex';
import { Card } from '../../DesignSystem/components/Card';
import { Button } from '../../DesignSystem/components/Button';
import { Input } from '../../DesignSystem/components/Input';
import { Badge } from '../../DesignSystem/components/Badge';

export default function AreaCreatorPage() {
  const [step, setStep] = useState<'info' | 'action' | 'reaction' | 'review'>('info');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedActionService, setSelectedActionService] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedReactionService, setSelectedReactionService] = useState('');
  const [selectedReaction, setSelectedReaction] = useState('');

  const connectedServices = MOCK_SERVICES.filter(s => s.isConnected);
  const actionServices = connectedServices.filter(s => s.actions.length > 0);
  const reactionServices = connectedServices.filter(s => s.reactions.length > 0);

  const handleCreate = () => {
    alert('AREA créée avec succès !');
    window.location.href = '/dashboard';
  };

  const canProceed = () => {
    switch (step) {
      case 'info':
        return name.trim() !== '' && description.trim() !== '';
      case 'action':
        return selectedActionService !== '' && selectedAction !== '';
      case 'reaction':
        return selectedReactionService !== '' && selectedReaction !== '';
      case 'review':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-[#1A1A18]">Créer une AREA</h1>
        <p className="text-sm md:text-base text-[#6B6962] mt-1">
          Connectez une Action à une REAction
        </p>
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
            Informations générales
          </h2>
          <div className="space-y-4">
            <Input
              label="Nom de l'AREA"
              placeholder="Ex: Backup Gmail vers OneDrive"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Description"
              placeholder="Ex: Sauvegarde automatique des pièces jointes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </Card>
      )}

      {step === 'action' && (
        <Card variant="elevated" padding="md" className="md:p-8">
          <h2 className="text-lg md:text-xl font-semibold text-[#1A1A18] mb-2">
            Choisir une Action
          </h2>
          <p className="text-sm md:text-base text-[#6B6962] mb-4 md:mb-6">
            Sélectionnez le déclencheur de votre automation
          </p>

          {actionServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm md:text-base text-[#6B6962]">
                Aucun service avec Actions connecté.{' '}
                <a href="/services" className="text-[#0a4a0e] hover:underline">
                  Connecter des services
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
                    }}
                    className={`p-3 md:p-4 rounded-lg border-2 transition-colors text-left ${
                      selectedActionService === service.id
                        ? 'border-[#0a4a0e] bg-[#e6f2e7]'
                        : 'border-[#D1CFC8] hover:border-[#B3B1A8]'
                    }`}
                  >
                    <div className="text-2xl md:text-3xl mb-2">{service.icon}</div>
                    <div className="text-sm md:text-base font-medium text-[#1A1A18]">{service.name}</div>
                    <div className="text-xs md:text-sm text-[#6B6962]">
                      {service.actions.length} action(s)
                    </div>
                  </button>
                ))}
              </div>

              {selectedActionService && (
                <div className="mt-4 md:mt-6">
                  <h3 className="text-sm md:text-base font-medium text-[#1A1A18] mb-3">
                    Sélectionnez une action
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
                          <div className="text-xs md:text-sm text-[#6B6962]">
                            {action.description}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {step === 'reaction' && (
        <Card variant="elevated" padding="md" className="md:p-8">
          <h2 className="text-lg md:text-xl font-semibold text-[#1A1A18] mb-2">
            Choisir une REAction
          </h2>
          <p className="text-sm md:text-base text-[#6B6962] mb-4 md:mb-6">
            Sélectionnez l'action à exécuter
          </p>

          {reactionServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm md:text-base text-[#6B6962]">
                Aucun service avec REActions connecté.{' '}
                <a href="/services" className="text-[#0a4a0e] hover:underline">
                  Connecter des services
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
                    }}
                    className={`p-3 md:p-4 rounded-lg border-2 transition-colors text-left ${
                      selectedReactionService === service.id
                        ? 'border-[#0a4a0e] bg-[#e6f2e7]'
                        : 'border-[#D1CFC8] hover:border-[#B3B1A8]'
                    }`}
                  >
                    <div className="text-2xl md:text-3xl mb-2">{service.icon}</div>
                    <div className="text-sm md:text-base font-medium text-[#1A1A18]">{service.name}</div>
                    <div className="text-xs md:text-sm text-[#6B6962]">
                      {service.reactions.length} réaction(s)
                    </div>
                  </button>
                ))}
              </div>

              {selectedReactionService && (
                <div className="mt-4 md:mt-6">
                  <h3 className="text-sm md:text-base font-medium text-[#1A1A18] mb-3">
                    Sélectionnez une réaction
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
                          <div className="text-xs md:text-sm text-[#6B6962]">
                            {reaction.description}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {step === 'review' && (
        <Card variant="elevated" padding="md" className="md:p-8">
          <h2 className="text-lg md:text-xl font-semibold text-[#1A1A18] mb-4 md:mb-6">
            Récapitulatif
          </h2>
          <div className="space-y-4 md:space-y-6">
            <div>
              <div className="text-xs md:text-sm text-[#8B8980] mb-1">Nom</div>
              <div className="text-sm md:text-base font-medium text-[#1A1A18]">{name}</div>
            </div>
            <div>
              <div className="text-xs md:text-sm text-[#8B8980] mb-1">Description</div>
              <div className="text-sm md:text-base text-[#4D4C47]">{description}</div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 p-3 md:p-4 bg-[#E8E6E1] rounded-lg">
              <div className="flex-1 text-center w-full">
                <Badge variant="primary" size="sm">ACTION</Badge>
                <div className="mt-2 text-sm md:text-base font-medium text-[#1A1A18]">
                  {MOCK_SERVICES.find(s => s.id === selectedActionService)?.name}
                </div>
                <div className="text-xs md:text-sm text-[#6B6962] mt-1">
                  {MOCK_SERVICES.find(s => s.id === selectedActionService)
                    ?.actions.find(a => a.id === selectedAction)?.name}
                </div>
              </div>
              <div className="text-xl md:text-2xl text-[#0a4a0e] rotate-90 sm:rotate-0">→</div>
              <div className="flex-1 text-center w-full">
                <Badge variant="success" size="sm">REACTION</Badge>
                <div className="mt-2 text-sm md:text-base font-medium text-[#1A1A18]">
                  {MOCK_SERVICES.find(s => s.id === selectedReactionService)?.name}
                </div>
                <div className="text-xs md:text-sm text-[#6B6962] mt-1">
                  {MOCK_SERVICES.find(s => s.id === selectedReactionService)
                    ?.reactions.find(r => r.id === selectedReaction)?.name}
                </div>
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
          {step === 'info' ? 'Annuler' : 'Précédent'}
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
          disabled={!canProceed()}
        >
          {step === 'review' ? 'Créer l\'AREA' : 'Suivant'}
        </Button>
      </div>
    </div>
  );
}
