/**
 * Discord Command Handler
 * Gestion des slash commands Discord
 */

import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import { Logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { AreaExecutor } from '../executors/area-executor'

export class CommandHandler {
  constructor(private areaExecutor: AreaExecutor) {}

  /**
   * Gère les commandes slash Discord
   */
  public async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      Logger.info('Discord command received', {
        command: interaction.commandName,
        user: interaction.user.tag,
        guild: interaction.guild?.name
      })

      switch (interaction.commandName) {
        case 'areas':
          await this.handleAreasCommand(interaction)
          break
        
        case 'area':
          await this.handleAreaCommand(interaction)
          break
        
        case 'trigger':
          await this.handleTriggerCommand(interaction)
          break
        
        case 'toggle':
          await this.handleToggleCommand(interaction)
          break
        
        case 'stats':
          await this.handleStatsCommand(interaction)
          break
        
        default:
          await interaction.reply({
            content: '❌ Commande non reconnue.',
            ephemeral: true
          })
      }

    } catch (error) {
      Logger.error('Error handling Discord command', {
        command: interaction.commandName,
        user: interaction.user.tag,
        error
      })

      const errorMessage = '❌ Une erreur est survenue lors de l\'exécution de la commande.'
      
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(errorMessage)
      } else {
        await interaction.reply({
          content: errorMessage,
          ephemeral: true
        })
      }
    }
  }

  /**
   * Commande /areas - Liste toutes les AREAs
   */
  private async handleAreasCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    try {
      const { data: areas, error } = await supabase
        .from('areas')
        .select(`
          *,
          area_actions (
            service_actions (
              name,
              services (name)
            )
          ),
          area_reactions (
            service_reactions (
              name,
              services (name)
            )
          )
        `)
        .eq('enabled', true)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        throw error
      }

      if (!areas || areas.length === 0) {
        await interaction.editReply('📭 Aucune AREA active trouvée.')
        return
      }

      const embed = new EmbedBuilder()
        .setTitle('🤖 Vos AREAs Actives')
        .setColor(0x7289da)
        .setDescription(
          areas.map((area, index) => {
            const action = area.area_actions?.[0]
            const reaction = area.area_reactions?.[0]
            const actionService = action?.service_actions?.services?.name || 'Unknown'
            const actionName = action?.service_actions?.name || 'Unknown'
            const reactionService = reaction?.service_reactions?.services?.name || 'Unknown'
            const reactionName = reaction?.service_reactions?.name || 'Unknown'

            return [
              `**${index + 1}.** ${area.enabled ? '🟢' : '🔴'} **${area.name}**`,
              `   ID: \`${area.id}\``,
              `   📤 ${actionService} - ${actionName}`,
              `   📥 ${reactionService} - ${reactionName}`,
              area.description ? `   💭 ${area.description}` : '',
              ''
            ].filter(Boolean).join('\n')
          }).join('\n')
        )
        .setFooter({ 
          text: `Total: ${areas.length} AREA(s) actives`,
          iconURL: interaction.client.user?.avatarURL() || undefined
        })
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })

    } catch (error) {
      Logger.error('Error in areas command', { error })
      await interaction.editReply('❌ Erreur lors de la récupération des AREAs.')
    }
  }

  /**
   * Commande /area - Détails d'une AREA
   */
  private async handleAreaCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    const areaId = interaction.options.getString('id', true)

    try {
      const { data: area, error } = await supabase
        .from('areas')
        .select(`
          *,
          area_actions (
            *,
            service_actions (
              *,
              services (name, display_name)
            ),
            area_action_param_values (
              *,
              service_action_params (name, display_name)
            )
          ),
          area_reactions (
            *,
            service_reactions (
              *,
              services (name, display_name)
            ),
            area_reaction_param_values (
              *,
              service_reaction_params (name, display_name)
            )
          )
        `)
        .eq('id', areaId)
        .single()

      if (error || !area) {
        await interaction.editReply(`❌ AREA avec l'ID \`${areaId}\` non trouvée.`)
        return
      }

      const action = area.area_actions?.[0]
      const reaction = area.area_reactions?.[0]

      const embed = new EmbedBuilder()
        .setTitle(`🎯 AREA: ${area.name}`)
        .setColor(area.enabled ? 0x00ff00 : 0xff0000)
        .addFields(
          {
            name: '📋 Informations',
            value: [
              `**ID:** \`${area.id}\``,
              `**Statut:** ${area.enabled ? '🟢 Actif' : '🔴 Inactif'}`,
              `**Créée:** <t:${Math.floor(new Date(area.created_at).getTime() / 1000)}:F>`,
              area.description ? `**Description:** ${area.description}` : ''
            ].filter(Boolean).join('\n'),
            inline: false
          }
        )

      if (action) {
        const actionService = action.service_actions?.services?.display_name || action.service_actions?.services?.name
        const actionName = action.service_actions?.display_name || action.service_actions?.name

        embed.addFields({
          name: '📤 Action (Déclencheur)',
          value: `**Service:** ${actionService}\n**Action:** ${actionName}`,
          inline: true
        })
      }

      if (reaction) {
        const reactionService = reaction.service_reactions?.services?.display_name || reaction.service_reactions?.services?.name
        const reactionName = reaction.service_reactions?.display_name || reaction.service_reactions?.name

        embed.addFields({
          name: '📥 Réaction',
          value: `**Service:** ${reactionService}\n**Réaction:** ${reactionName}`,
          inline: true
        })
      }

      if (area.updated_at) {
        embed.setFooter({ 
          text: `Dernière modification: ${new Date(area.updated_at).toLocaleString('fr-FR')}` 
        })
      }

      embed.setTimestamp()

      await interaction.editReply({ embeds: [embed] })

    } catch (error) {
      Logger.error('Error in area command', { areaId, error })
      await interaction.editReply('❌ Erreur lors de la récupération des détails de l\'AREA.')
    }
  }

  /**
   * Commande /trigger - Déclenche une AREA
   */
  private async handleTriggerCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    const areaId = interaction.options.getString('id', true)

    try {
      const result = await this.areaExecutor.executeAreaById(areaId, {
        user: interaction.user.tag,
        userId: interaction.user.id,
        guild: interaction.guild?.name,
        guildId: interaction.guild?.id,
        timestamp: new Date().toISOString()
      })

      if (result.success) {
        const embed = new EmbedBuilder()
          .setTitle('✅ AREA Déclenchée')
          .setColor(0x00ff00)
          .setDescription(`L'AREA \`${areaId}\` a été déclenchée avec succès.`)
          .addFields({
            name: '📊 Résultat',
            value: result.message,
            inline: false
          })
          .setTimestamp()

        await interaction.editReply({ embeds: [embed] })
      } else {
        throw new Error(result.error || result.message)
      }

    } catch (error) {
      Logger.error('Error in trigger command', { areaId, error })
      
      const embed = new EmbedBuilder()
        .setTitle('❌ Échec du Déclenchement')
        .setColor(0xff0000)
        .setDescription(`Impossible de déclencher l'AREA \`${areaId}\`.`)
        .addFields({
          name: '💥 Erreur',
          value: error instanceof Error ? error.message : 'Erreur inconnue',
          inline: false
        })
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })
    }
  }

  /**
   * Commande /toggle - Active/désactive une AREA
   */
  private async handleToggleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    const areaId = interaction.options.getString('id', true)

    try {
      // Récupérer l'AREA actuelle
      const { data: area, error: fetchError } = await supabase
        .from('areas')
        .select('id, name, enabled')
        .eq('id', areaId)
        .single()

      if (fetchError || !area) {
        await interaction.editReply(`❌ AREA avec l'ID \`${areaId}\` non trouvée.`)
        return
      }

      // Toggle le statut
      const newStatus = !area.enabled
      const { error: updateError } = await supabase
        .from('areas')
        .update({ 
          enabled: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', areaId)

      if (updateError) {
        throw updateError
      }

      const embed = new EmbedBuilder()
        .setTitle('🔄 AREA Modifiée')
        .setColor(newStatus ? 0x00ff00 : 0xff9900)
        .setDescription(`L'AREA **${area.name}** a été ${newStatus ? 'activée' : 'désactivée'}.`)
        .addFields({
          name: '📊 Nouveau Statut',
          value: `${newStatus ? '🟢 Actif' : '🔴 Inactif'}`,
          inline: false
        })
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })

    } catch (error) {
      Logger.error('Error in toggle command', { areaId, error })
      await interaction.editReply('❌ Erreur lors de la modification de l\'AREA.')
    }
  }

  /**
   * Commande /stats - Statistiques des AREAs
   */
  private async handleStatsCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply()

    try {
      // Statistiques générales
      const { data: allAreas, error: allError } = await supabase
        .from('areas')
        .select('id, enabled, created_at')

      if (allError) {
        throw allError
      }

      const totalAreas = allAreas?.length || 0
      const activeAreas = allAreas?.filter(area => area.enabled).length || 0
      const inactiveAreas = totalAreas - activeAreas

      // Statistiques d'exécution récentes (7 derniers jours)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: recentLogs, error: logsError } = await supabase
        .from('execution_logs')
        .select('status, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())

      if (logsError) {
        Logger.warn('Failed to fetch execution logs', { error: logsError })
      }

      const totalExecutions = recentLogs?.length || 0
      const successfulExecutions = recentLogs?.filter(log => log.status === 'completed').length || 0
      const failedExecutions = recentLogs?.filter(log => log.status === 'failed').length || 0

      const embed = new EmbedBuilder()
        .setTitle('📊 Statistiques AREA')
        .setColor(0x7289da)
        .addFields(
          {
            name: '🎯 AREAs',
            value: [
              `**Total:** ${totalAreas}`,
              `**🟢 Actives:** ${activeAreas}`,
              `**🔴 Inactives:** ${inactiveAreas}`
            ].join('\n'),
            inline: true
          },
          {
            name: '⚡ Exécutions (7j)',
            value: [
              `**Total:** ${totalExecutions}`,
              `**✅ Succès:** ${successfulExecutions}`,
              `**❌ Échecs:** ${failedExecutions}`
            ].join('\n'),
            inline: true
          }
        )
        .setFooter({ 
          text: 'Statistiques en temps réel',
          iconURL: interaction.client.user?.avatarURL() || undefined
        })
        .setTimestamp()

      if (totalExecutions > 0) {
        const successRate = Math.round((successfulExecutions / totalExecutions) * 100)
        embed.addFields({
          name: '📈 Taux de Succès',
          value: `${successRate}%`,
          inline: true
        })
      }

      await interaction.editReply({ embeds: [embed] })

    } catch (error) {
      Logger.error('Error in stats command', { error })
      await interaction.editReply('❌ Erreur lors de la récupération des statistiques.')
    }
  }
}