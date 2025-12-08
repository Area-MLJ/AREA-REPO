/**
 * Area Executor
 * Exécution des AREAs en fonction des événements Discord
 */

import { Logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { DiscordEventData, DiscordEventType, ActionExecutionContext, ReactionExecutionResult } from '../types'
import { ACTION_MAPPINGS } from '../config'
import { ReactionExecutor } from './reaction-executor'

export class AreaExecutor {
  private reactionExecutor: ReactionExecutor

  constructor() {
    this.reactionExecutor = new ReactionExecutor()
  }

  /**
   * Déclenche les AREAs correspondant à un événement Discord
   */
  public async triggerDiscordAreas(eventType: DiscordEventType, eventData: DiscordEventData): Promise<void> {
    const executionId = this.generateExecutionId()
    
    Logger.info('Discord event detected', {
      executionId,
      eventType,
      eventData: this.sanitizeEventData(eventData)
    })

    try {
      // Récupérer les AREAs actives avec Discord comme action
      const areas = await this.getMatchingAreas(eventType)
      
      if (!areas || areas.length === 0) {
        Logger.debug('No matching areas found', { executionId, eventType })
        return
      }

      Logger.info('Processing areas', { 
        executionId, 
        eventType, 
        areasCount: areas.length 
      })

      // Exécuter chaque AREA en parallèle
      const executions = areas.map(area => 
        this.executeAreaSafely({
          area,
          eventData,
          executionId: `${executionId}-${area.id}`
        })
      )

      const results = await Promise.allSettled(executions)
      
      // Logger les résultats
      results.forEach((result, index) => {
        const area = areas[index]
        if (result.status === 'fulfilled') {
          Logger.info('Area executed successfully', {
            executionId,
            areaId: area.id,
            areaName: area.name,
            result: result.value
          })
        } else {
          Logger.error('Area execution failed', {
            executionId,
            areaId: area.id,
            areaName: area.name,
            error: result.reason
          })
        }
      })

    } catch (error) {
      Logger.error('Error triggering Discord areas', { 
        executionId, 
        eventType, 
        error 
      })
    }
  }

  /**
   * Exécute une AREA spécifique par son ID
   */
  public async executeAreaById(areaId: string, eventData: DiscordEventData = {}): Promise<ReactionExecutionResult> {
    const executionId = this.generateExecutionId()

    try {
      Logger.info('Manual area execution requested', { 
        executionId, 
        areaId 
      })

      const area = await this.getAreaById(areaId)
      if (!area) {
        throw new Error(`Area with ID ${areaId} not found or inactive`)
      }

      return await this.executeArea({
        area,
        eventData,
        executionId
      })

    } catch (error) {
      Logger.error('Manual area execution failed', { 
        executionId, 
        areaId, 
        error 
      })
      return {
        success: false,
        message: 'Execution failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Récupère les AREAs correspondant à un événement Discord
   */
  private async getMatchingAreas(eventType: DiscordEventType) {
    try {
      // Récupérer les AREAs actives avec Discord comme service d'action
      const { data: areas, error } = await supabase
        .from('areas')
        .select(`
          *,
          area_actions!inner (
            *,
            service_actions!inner (
              *,
              services!inner (
                name
              )
            ),
            user_services (*)
          ),
          area_reactions (
            *,
            service_reactions (
              *,
              services (name)
            ),
            user_services (*)
          )
        `)
        .eq('enabled', true)
        .eq('area_actions.service_actions.services.name', 'Discord')

      if (error) {
        throw error
      }

      // Filtrer les AREAs selon le type d'événement
      const matchingAreas = areas?.filter(area => {
        return area.area_actions?.some((areaAction: any) => {
          const actionName = areaAction.service_actions?.name
          const mappedActions = ACTION_MAPPINGS[eventType] || []
          return mappedActions.some(mappedAction => 
            actionName?.toLowerCase().includes(mappedAction.toLowerCase())
          )
        })
      }) || []

      return matchingAreas

    } catch (error) {
      Logger.error('Error fetching matching areas', { eventType, error })
      return []
    }
  }

  /**
   * Récupère une AREA par son ID
   */
  private async getAreaById(areaId: string) {
    try {
      const { data: area, error } = await supabase
        .from('areas')
        .select(`
          *,
          area_actions (
            *,
            service_actions (
              *,
              services (name)
            ),
            user_services (*)
          ),
          area_reactions (
            *,
            service_reactions (
              *,
              services (name)
            ),
            user_services (*)
          )
        `)
        .eq('id', areaId)
        .eq('enabled', true)
        .single()

      if (error) {
        throw error
      }

      return area

    } catch (error) {
      Logger.error('Error fetching area by ID', { areaId, error })
      return null
    }
  }

  /**
   * Exécute une AREA avec gestion d'erreur
   */
  private async executeAreaSafely(context: ActionExecutionContext): Promise<ReactionExecutionResult> {
    try {
      return await this.executeArea(context)
    } catch (error) {
      Logger.error('Area execution failed', {
        executionId: context.executionId,
        areaId: context.area.id,
        error
      })
      return {
        success: false,
        message: 'Execution failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Exécute une AREA (action + réactions)
   */
  private async executeArea(context: ActionExecutionContext): Promise<ReactionExecutionResult> {
    const startTime = Date.now()
    
    try {
      // Logger le début d'exécution
      await this.logExecution(context, 'started')

      // Exécuter les réactions de l'AREA
      const results = await Promise.allSettled(
        (context.area.area_reactions || []).map(reaction => 
          this.reactionExecutor.executeReaction(reaction, context.eventData, context.executionId)
        )
      )

      const successfulReactions = results.filter(r => r.status === 'fulfilled').length
      const totalReactions = results.length

      // Mettre à jour last_evaluated_at pour les actions
      await this.updateAreaActionTimestamp(context.area.id)

      // Logger la fin d'exécution
      await this.logExecution(context, 'completed', {
        successfulReactions,
        totalReactions,
        results
      })

      return {
        success: successfulReactions > 0,
        message: `${successfulReactions}/${totalReactions} reactions executed successfully`,
        data: { successfulReactions, totalReactions },
        executionTime: Date.now() - startTime
      }

    } catch (error) {
      // Logger l'erreur
      await this.logExecution(context, 'failed', { error })
      throw error
    }
  }

  /**
   * Met à jour le timestamp de dernière évaluation de l'action
   */
  private async updateAreaActionTimestamp(areaId: string): Promise<void> {
    try {
      await supabase
        .from('area_actions')
        .update({ last_evaluated_at: new Date().toISOString() })
        .eq('area_id', areaId)
    } catch (error) {
      Logger.warn('Failed to update area action timestamp', { areaId, error })
    }
  }

  /**
   * Log l'exécution dans la base de données
   */
  private async logExecution(
    context: ActionExecutionContext, 
    status: 'started' | 'completed' | 'failed',
    metadata?: any
  ): Promise<void> {
    try {
      const logData = {
        area_id: context.area.id,
        status,
        started_at: status === 'started' ? new Date().toISOString() : undefined,
        finished_at: status !== 'started' ? new Date().toISOString() : undefined,
        request_payload: JSON.stringify(context.eventData),
        response_payload: metadata ? JSON.stringify(metadata) : undefined,
        error_text: status === 'failed' ? JSON.stringify(metadata?.error) : undefined
      }

      await supabase
        .from('execution_logs')
        .insert(logData)

    } catch (error) {
      Logger.warn('Failed to log execution', { 
        executionId: context.executionId, 
        error 
      })
    }
  }

  private generateExecutionId(): string {
    return `discord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private sanitizeEventData(eventData: DiscordEventData): Partial<DiscordEventData> {
    // Sanitize sensitive data for logging
    return {
      ...eventData,
      authorId: eventData.authorId ? '***' : undefined,
      userId: eventData.userId ? '***' : undefined,
    }
  }
}