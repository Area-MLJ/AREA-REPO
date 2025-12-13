/**
 * Discord Service Configuration
 */

import { GatewayIntentBits } from 'discord.js'
import { DiscordBotConfig, DiscordSlashCommand } from './types'

export const DISCORD_CONFIG: DiscordBotConfig = {
  token: process.env.DISCORD_TOKEN || '',
  applicationId: process.env.DISCORD_APPLICATION_ID || '',
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
  logLevel: (process.env.DISCORD_LOG_LEVEL as any) || 'info'
}

export const SLASH_COMMANDS: DiscordSlashCommand[] = [
  {
    name: 'areas',
    description: 'Liste toutes vos AREAs actives'
  },
  {
    name: 'area',
    description: 'Affiche les détails d\'une AREA spécifique',
    options: [
      {
        name: 'id',
        description: 'ID de l\'AREA à afficher',
        type: 3, // STRING
        required: true
      }
    ]
  },
  {
    name: 'trigger',
    description: 'Déclenche une AREA manuellement',
    options: [
      {
        name: 'id',
        description: 'ID de l\'AREA à déclencher',
        type: 3, // STRING
        required: true
      }
    ]
  },
  {
    name: 'toggle',
    description: 'Active ou désactive une AREA',
    options: [
      {
        name: 'id',
        description: 'ID de l\'AREA à activer/désactiver',
        type: 3, // STRING
        required: true
      }
    ]
  },
  {
    name: 'stats',
    description: 'Affiche les statistiques de vos AREAs'
  }
]

export const ACTION_MAPPINGS = {
  messageCreate: [
    'Nouveau message',
    'Message contenant mot-clé',
    'Message dans canal spécifique'
  ],
  guildMemberAdd: [
    'Utilisateur rejoint le serveur',
    'Nouveau membre'
  ],
  guildMemberRemove: [
    'Utilisateur quitte le serveur',
    'Membre supprimé'
  ],
  messageReactionAdd: [
    'Réaction ajoutée',
    'Emoji ajouté à message'
  ]
} as const