import { supabase } from '../lib/supabase'
import cron from 'node-cron'

export class HookEngine {
  private static instance: HookEngine
  private pollingJobs = new Map<string, NodeJS.Timeout>()
  private isRunning = false

  static getInstance(): HookEngine {
    if (!HookEngine.instance) {
      HookEngine.instance = new HookEngine()
    }
    return HookEngine.instance
  }

  async start() {
    if (this.isRunning) return
    
    console.log('Starting Hook Engine...')
    this.isRunning = true
    
    // Start polling scheduler - runs every minute
    cron.schedule('* * * * *', async () => {
      await this.processPollingJobs()
    })

    console.log('Hook Engine started')
  }

  async stop() {
    if (!this.isRunning) return
    
    console.log('Stopping Hook Engine...')
    this.isRunning = false
    
    // Clear all polling jobs
    this.pollingJobs.forEach(job => clearTimeout(job))
    this.pollingJobs.clear()
    
    console.log('Hook Engine stopped')
  }

  private async processPollingJobs() {
    try {
      // Get all active polling jobs
      const { data: hookJobs, error } = await supabase
        .from('hook_jobs')
        .select(`
          *,
          area_actions (
            *,
            areas (
              id,
              user_id,
              enabled
            ),
            service_actions (*),
            user_services (*)
          )
        `)
        .eq('type', 'polling')
        .eq('status', 'active')

      if (error) {
        console.error('Error fetching polling jobs:', error)
        return
      }

      for (const job of hookJobs || []) {
        await this.executePollingJob(job)
      }
    } catch (error) {
      console.error('Error processing polling jobs:', error)
    }
  }

  private async executePollingJob(job: any) {
    try {
      const now = new Date()
      const lastRun = job.last_run_at ? new Date(job.last_run_at) : new Date(0)
      const intervalMs = (job.polling_interval_seconds || 60) * 1000

      // Check if enough time has passed
      if (now.getTime() - lastRun.getTime() < intervalMs) {
        return
      }

      // Update last run time
      await supabase
        .from('hook_jobs')
        .update({ last_run_at: now.toISOString() })
        .eq('id', job.id)

      // Execute the action check based on service
      const actionResult = await this.checkAction(job.area_actions)
      
      if (actionResult.triggered) {
        await this.triggerReactions(job.area_actions.area_id, actionResult.payload)
      }

      // Log the execution
      await supabase
        .from('hook_logs')
        .insert({
          hook_job_id: job.id,
          event_payload: JSON.stringify(actionResult),
          detected_at: now.toISOString(),
          processed: actionResult.triggered
        })

    } catch (error) {
      console.error(`Error executing polling job ${job.id}:`, error)
    }
  }

  private async checkAction(areaAction: any): Promise<{ triggered: boolean; payload?: any }> {
    // This is where you'd implement specific service action checks
    // For MVP, we'll implement basic timer and mock services
    
    const serviceName = areaAction.service_actions?.services?.name
    const actionName = areaAction.service_actions?.name

    switch (serviceName) {
      case 'timer':
        return this.checkTimerAction(actionName)
      case 'mock':
        return this.checkMockAction(actionName)
      default:
        return { triggered: false }
    }
  }

  private checkTimerAction(actionName: string): { triggered: boolean; payload?: any } {
    const now = new Date()
    
    switch (actionName) {
      case 'every_minute':
        return { triggered: true, payload: { timestamp: now.toISOString() } }
      case 'every_hour':
        return { 
          triggered: now.getMinutes() === 0,
          payload: { timestamp: now.toISOString() }
        }
      default:
        return { triggered: false }
    }
  }

  private checkMockAction(actionName: string): { triggered: boolean; payload?: any } {
    // Mock service for testing - triggers randomly
    const shouldTrigger = Math.random() < 0.1 // 10% chance
    
    return {
      triggered: shouldTrigger,
      payload: { 
        action: actionName,
        timestamp: new Date().toISOString(),
        data: 'Mock action triggered'
      }
    }
  }

  private async triggerReactions(areaId: string, actionPayload: any) {
    try {
      // Get all reactions for this area
      const { data: reactions, error } = await supabase
        .from('area_reactions')
        .select(`
          *,
          service_reactions (*),
          user_services (*)
        `)
        .eq('area_id', areaId)
        .eq('enabled', true)
        .order('position')

      if (error) {
        throw error
      }

      // Execute each reaction
      for (const reaction of reactions || []) {
        await this.executeReaction(reaction, actionPayload)
      }
    } catch (error) {
      console.error(`Error triggering reactions for area ${areaId}:`, error)
    }
  }

  private async executeReaction(reaction: any, actionPayload: any) {
    try {
      const serviceName = reaction.service_reactions?.services?.name
      const reactionName = reaction.service_reactions?.name

      // Log the execution start
      const { data: executionLog } = await supabase
        .from('execution_logs')
        .insert({
          area_id: reaction.area_id,
          area_reaction_id: reaction.id,
          status: 'running',
          started_at: new Date().toISOString(),
          request_payload: JSON.stringify(actionPayload)
        })
        .select()
        .single()

      let result: any = { success: false }

      // Execute based on service
      switch (serviceName) {
        case 'logger':
          result = this.executeLoggerReaction(reactionName, actionPayload)
          break
        case 'mock':
          result = this.executeMockReaction(reactionName, actionPayload)
          break
      }

      // Update execution log
      await supabase
        .from('execution_logs')
        .update({
          status: result.success ? 'completed' : 'failed',
          finished_at: new Date().toISOString(),
          response_payload: JSON.stringify(result),
          error_text: result.error || null
        })
        .eq('id', executionLog?.id)

    } catch (error) {
      console.error(`Error executing reaction ${reaction.id}:`, error)
    }
  }

  private executeLoggerReaction(reactionName: string, payload: any): any {
    console.log(`[LOGGER REACTION] ${reactionName}:`, payload)
    return { success: true, logged: true }
  }

  private executeMockReaction(reactionName: string, payload: any): any {
    console.log(`[MOCK REACTION] ${reactionName}:`, payload)
    return { 
      success: true, 
      action: reactionName,
      processedPayload: payload,
      timestamp: new Date().toISOString()
    }
  }
}