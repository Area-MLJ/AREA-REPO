/**
 * MockData.ts
 * Données mockées pour le développement front-end
 * Simule les réponses API et les données utilisateur
 */

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'social' | 'productivity' | 'storage' | 'communication' | 'time';
  isConnected: boolean;
  actions: ServiceAction[];
  reactions: ServiceReaction[];
}

export interface ServiceAction {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

export interface ServiceReaction {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

export interface Area {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  actionService: string;
  actionName: string;
  reactionService: string;
  reactionName: string;
  createdAt: string;
  lastTriggered?: string;
}

export const MOCK_SERVICES: Service[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Gérez vos emails Gmail',
    icon: '📧',
    category: 'communication',
    isConnected: false,
    actions: [
      {
        id: 'gmail_new_email',
        serviceId: 'gmail',
        name: 'Nouvel email reçu',
        description: 'Se déclenche quand un nouvel email est reçu',
      },
      {
        id: 'gmail_email_with_attachment',
        serviceId: 'gmail',
        name: 'Email avec pièce jointe',
        description: 'Se déclenche quand un email avec pièce jointe est reçu',
      },
    ],
    reactions: [
      {
        id: 'gmail_send_email',
        serviceId: 'gmail',
        name: 'Envoyer un email',
        description: 'Envoie un email à un destinataire',
      },
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Automatisez vos workflows GitHub',
    icon: '🐙',
    category: 'productivity',
    isConnected: false,
    actions: [
      {
        id: 'github_new_issue',
        serviceId: 'github',
        name: 'Nouvelle issue créée',
        description: 'Se déclenche quand une issue est créée',
      },
      {
        id: 'github_new_pr',
        serviceId: 'github',
        name: 'Nouvelle Pull Request',
        description: 'Se déclenche quand une PR est créée',
      },
    ],
    reactions: [
      {
        id: 'github_create_issue',
        serviceId: 'github',
        name: 'Créer une issue',
        description: 'Crée une nouvelle issue',
      },
    ],
  },
  {
    id: 'timer',
    name: 'Timer',
    description: 'Déclenchez des actions selon le temps',
    icon: '⏰',
    category: 'time',
    isConnected: true,
    actions: [
      {
        id: 'timer_daily',
        serviceId: 'timer',
        name: 'Chaque jour à',
        description: 'Se déclenche chaque jour à une heure précise',
      },
      {
        id: 'timer_interval',
        serviceId: 'timer',
        name: 'Intervalle régulier',
        description: 'Se déclenche toutes les X minutes/heures',
      },
    ],
    reactions: [],
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    description: 'Gérez vos fichiers OneDrive',
    icon: '☁️',
    category: 'storage',
    isConnected: false,
    actions: [
      {
        id: 'onedrive_new_file',
        serviceId: 'onedrive',
        name: 'Nouveau fichier',
        description: 'Se déclenche quand un fichier est ajouté',
      },
    ],
    reactions: [
      {
        id: 'onedrive_upload',
        serviceId: 'onedrive',
        name: 'Uploader un fichier',
        description: 'Upload un fichier dans OneDrive',
      },
    ],
  },
];

export const MOCK_AREAS: Area[] = [
  {
    id: '1',
    name: 'Backup Gmail vers OneDrive',
    description: 'Sauvegarde automatique des pièces jointes Gmail dans OneDrive',
    isActive: true,
    actionService: 'Gmail',
    actionName: 'Email avec pièce jointe',
    reactionService: 'OneDrive',
    reactionName: 'Uploader un fichier',
    createdAt: '2024-11-15T10:00:00Z',
    lastTriggered: '2024-11-30T14:30:00Z',
  },
  {
    id: '2',
    name: 'GitHub Issues vers Gmail',
    description: 'Notification email pour chaque nouvelle issue GitHub',
    isActive: true,
    actionService: 'GitHub',
    actionName: 'Nouvelle issue créée',
    reactionService: 'Gmail',
    reactionName: 'Envoyer un email',
    createdAt: '2024-11-20T08:00:00Z',
    lastTriggered: '2024-12-01T09:15:00Z',
  },
  {
    id: '3',
    name: 'Rapport quotidien',
    description: 'Envoi d\'un email de rapport chaque jour à 18h',
    isActive: false,
    actionService: 'Timer',
    actionName: 'Chaque jour à',
    reactionService: 'Gmail',
    reactionName: 'Envoyer un email',
    createdAt: '2024-11-25T12:00:00Z',
  },
];
