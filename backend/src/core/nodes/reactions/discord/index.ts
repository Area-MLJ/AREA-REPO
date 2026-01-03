import { ReactionNode, ReactionResult } from '../../base';
import { NodeContext } from '../../../engine/node-context';
import userService from '../../../services/user-service';

/**
 * Réaction Discord: Envoie un message dans un channel
 * Paramètres:
 * - channel_id: ID du channel Discord
 * - message: Contenu du message
 */
export const discordSendMessage: ReactionNode = {
  type: 'reaction',
  service: 'discord',
  name: 'send_message',
  execute: async (ctx: NodeContext, params: Record<string, any>): Promise<ReactionResult> => {
    const { channel_id, message } = params;

    if (!channel_id) {
      throw new Error('channel_id parameter is required');
    }
    if (!message) {
      throw new Error('message parameter is required');
    }

    // Récupérer le user_service pour obtenir le token Discord
    const userServiceInstance = await userService.getUserServiceById(ctx.userServiceId);
    if (!userServiceInstance || !userServiceInstance.access_token) {
      throw new Error('Discord access token not found');
    }

    // Envoyer le message via l'API Discord
    try {
      const response = await ctx.httpClient.post(
        `https://discord.com/api/v10/channels/${channel_id}/messages`,
        {
          content: message,
        },
        {
          Authorization: `Bot ${userServiceInstance.access_token}`,
        }
      );

      ctx.logger.info(`Discord message sent to channel ${channel_id}`);

      return {
        success: true,
        output: {
          message_id: response.id,
          channel_id,
        },
      };
    } catch (error: any) {
      ctx.logger.error(`Failed to send Discord message: ${error.message}`);
      throw new Error(`Failed to send Discord message: ${error.message}`);
    }
  },
};

