/**
 * Discord Service Types
 * Types pour l'intégration Discord et le système Action-Réaction
 */

import { Area } from '@/types/database'

export interface DiscordEventData {
  message?: string
  author?: string
  authorId?: string
  channel?: string
  channelId?: string
  guild?: string
  guildId?: string
  user?: string
  userId?: string
  timestamp?: string
}

export interface DiscordAction {
  type: 'messageCreate' | 'guildMemberAdd' | 'guildMemberRemove' | 'messageReaction'
  pattern?: string
  channelId?: string
  guildId?: string
}

export interface ActionExecutionContext {
  area: Area
  eventData: DiscordEventData
  executionId: string
}

export interface ReactionExecutionResult {
  success: boolean
  message: string
  data?: any
  error?: string
  executionTime?: number
}

export interface DiscordBotConfig {
  token: string
  applicationId: string
  intents: number[]
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

export interface DiscordSlashCommand {
  name: string
  description: string
  options?: Array<{
    name: string
    description: string
    type: number
    required?: boolean
  }>
}

export type DiscordEventType = 
  | 'messageCreate'
  | 'guildMemberAdd'
  | 'guildMemberRemove'
  | 'messageReactionAdd'
  | 'messageReactionRemove'