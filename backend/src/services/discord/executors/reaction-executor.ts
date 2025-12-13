/**
 * Reaction Executor
 * Exécution des réactions des AREAs
 */

import { Logger } from '@/lib/logger'
import { DiscordEventData, ReactionExecutionResult } from '../types'

export class ReactionExecutor {
  
  /**
   * Exécute une réaction
   */
  public async executeReaction(
    reaction: any,
    eventData: DiscordEventData,
    executionId: string
  ): Promise<ReactionExecutionResult> {
    const startTime = Date.now()
    
    try {
      const serviceName = reaction.service_reactions?.services?.name
      const reactionName = reaction.service_reactions?.name

      Logger.info('Executing reaction', {
        executionId,
        serviceName,
        reactionName,
        reactionId: reaction.id
      })

      switch (serviceName) {
        case 'Email':
        case 'Resend':
          return await this.executeEmailReaction(reaction, eventData, executionId)
        
        case 'Discord':
          return await this.executeDiscordReaction(reaction, eventData, executionId)
        
        case 'Webhook':
          return await this.executeWebhookReaction(reaction, eventData, executionId)
        
        default:
          Logger.warn('Unsupported reaction service', { 
            executionId, 
            serviceName, 
            reactionName 
          })
          return {
            success: false,
            message: `Unsupported reaction service: ${serviceName}`,
            executionTime: Date.now() - startTime
          }
      }

    } catch (error) {
      Logger.error('Reaction execution failed', {
        executionId,
        reactionId: reaction.id,
        error
      })
      
      return {
        success: false,
        message: 'Reaction execution failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      }
    }
  }

  /**
   * Exécute une réaction Email/Resend
   */
  private async executeEmailReaction(
    reaction: any,
    eventData: DiscordEventData,
    executionId: string
  ): Promise<ReactionExecutionResult> {
    try {
      // Import Resend seulement si nécessaire
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY not configured')
      }

      // Récupérer les paramètres de la réaction
      const params = await this.getReactionParams(reaction.id)
      const emailTo = params.to || process.env.EMAIL_TO
      const emailSubject = params.subject || `[AREA] Discord Event - ${eventData.author || 'Unknown'}`
      
      // Construire le contenu de l'email
      const emailContent = this.buildEmailContent(eventData, reaction)

      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: emailTo,
        subject: emailSubject,
        html: emailContent,
      })

      if (result.error) {
        throw new Error(result.error.message || 'Email sending failed')
      }

      Logger.info('Email sent successfully', {
        executionId,
        emailId: result.data?.id,
        to: emailTo
      })

      return {
        success: true,
        message: 'Email sent successfully',
        data: { emailId: result.data?.id, to: emailTo }
      }

    } catch (error) {
      throw new Error(`Email execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Exécute une réaction Discord
   */
  private async executeDiscordReaction(
    reaction: any,
    eventData: DiscordEventData,
    executionId: string
  ): Promise<ReactionExecutionResult> {
    try {
      // Import Discord client seulement si nécessaire
      const { DiscordClientManager } = await import('../client')
      const clientManager = DiscordClientManager.getInstance()
      const client = clientManager.getClient()

      if (!client || !clientManager.isReady()) {
        throw new Error('Discord client not ready')
      }

      // Récupérer les paramètres de la réaction
      const params = await this.getReactionParams(reaction.id)
      const channelId = params.channel_id || eventData.channelId
      const message = params.message || this.buildDiscordMessage(eventData)

      if (!channelId) {
        throw new Error('No channel specified for Discord reaction')
      }

      const channel = await client.channels.fetch(channelId)
      if (!channel || !('send' in channel)) {
        throw new Error(`Cannot send message to channel ${channelId}`)
      }

      const sentMessage = await channel.send(message)

      Logger.info('Discord message sent successfully', {
        executionId,
        messageId: sentMessage.id,
        channelId
      })

      return {
        success: true,
        message: 'Discord message sent successfully',
        data: { messageId: sentMessage.id, channelId }
      }

    } catch (error) {
      throw new Error(`Discord reaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Exécute une réaction Webhook
   */
  private async executeWebhookReaction(
    reaction: any,
    eventData: DiscordEventData,
    executionId: string
  ): Promise<ReactionExecutionResult> {
    try {
      // Récupérer les paramètres de la réaction
      const params = await this.getReactionParams(reaction.id)
      const webhookUrl = params.webhook_url

      if (!webhookUrl) {
        throw new Error('No webhook URL specified')
      }

      const payload = {
        event: 'discord_area_triggered',
        data: eventData,
        reaction: {
          id: reaction.id,
          name: reaction.service_reactions?.name
        },
        timestamp: new Date().toISOString(),
        executionId
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AREA-Discord-Bot/1.0'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${response.statusText}`)
      }

      Logger.info('Webhook called successfully', {
        executionId,
        webhookUrl: webhookUrl.replace(/\/\/.*@/, '//***@'), // Hide credentials
        statusCode: response.status
      })

      return {
        success: true,
        message: 'Webhook called successfully',
        data: { statusCode: response.status }
      }

    } catch (error) {
      throw new Error(`Webhook reaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Récupère les paramètres d'une réaction
   */
  private async getReactionParams(reactionId: string): Promise<Record<string, any>> {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data: paramValues, error } = await supabase
        .from('area_reaction_param_values')
        .select(`
          *,
          service_reaction_params (name, data_type)
        `)
        .eq('area_reaction_id', reactionId)

      if (error) {
        Logger.warn('Failed to fetch reaction params', { reactionId, error })
        return {}
      }

      const params: Record<string, any> = {}
      paramValues?.forEach(paramValue => {
        const paramName = paramValue.service_reaction_params?.name
        if (paramName) {
          params[paramName] = paramValue.value_text || paramValue.value_json
        }
      })

      return params

    } catch (error) {
      Logger.warn('Error getting reaction params', { reactionId, error })
      return {}
    }
  }

  /**
   * Construit le contenu de l'email
   */
  private buildEmailContent(eventData: DiscordEventData, reaction: any): string {
    const reactionName = reaction.service_reactions?.name || 'Discord Event'
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>AREA Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #7289da; color: white; padding: 15px; border-radius: 5px 5px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; }
            .footer { margin-top: 20px; font-size: 12px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🤖 AREA Discord Notification</h2>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">Réaction:</span> ${reactionName}
              </div>
              ${eventData.message ? `
                <div class="field">
                  <span class="label">Message:</span> ${eventData.message}
                </div>
              ` : ''}
              ${eventData.author ? `
                <div class="field">
                  <span class="label">Auteur:</span> ${eventData.author}
                </div>
              ` : ''}
              ${eventData.channel ? `
                <div class="field">
                  <span class="label">Canal:</span> ${eventData.channel}
                </div>
              ` : ''}
              ${eventData.guild ? `
                <div class="field">
                  <span class="label">Serveur:</span> ${eventData.guild}
                </div>
              ` : ''}
              <div class="field">
                <span class="label">Timestamp:</span> ${new Date().toLocaleString('fr-FR')}
              </div>
            </div>
            <div class="footer">
              <p>Cette notification a été générée automatiquement par votre AREA.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Construit le message Discord
   */
  private buildDiscordMessage(eventData: DiscordEventData): string {
    let message = '🤖 **AREA Triggered**\n\n'
    
    if (eventData.message) {
      message += `📝 **Message:** ${eventData.message}\n`
    }
    if (eventData.author) {
      message += `👤 **Author:** ${eventData.author}\n`
    }
    if (eventData.channel) {
      message += `📺 **Channel:** ${eventData.channel}\n`
    }
    if (eventData.guild) {
      message += `🏠 **Server:** ${eventData.guild}\n`
    }
    
    message += `\n⏰ **Time:** ${new Date().toLocaleString('fr-FR')}`
    
    return message
  }
}