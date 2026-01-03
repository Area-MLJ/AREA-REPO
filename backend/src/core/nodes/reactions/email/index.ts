import { ReactionNode, ReactionResult } from '../../base';
import { NodeContext } from '../../../engine/node-context';

/**
 * Réaction Email: Envoie un email (via SMTP ou service externe)
 * Paramètres:
 * - to: Adresse email du destinataire
 * - subject: Sujet de l'email
 * - body: Corps de l'email
 */
export const emailSend: ReactionNode = {
  type: 'reaction',
  service: 'email',
  name: 'send_email',
  execute: async (ctx: NodeContext, params: Record<string, any>): Promise<ReactionResult> => {
    const { to, subject, body } = params;

    if (!to) {
      throw new Error('to parameter is required');
    }
    if (!subject) {
      throw new Error('subject parameter is required');
    }
    if (!body) {
      throw new Error('body parameter is required');
    }

    // Pour l'instant, on simule l'envoi d'email
    // Dans une implémentation réelle, on utiliserait un service SMTP ou un service comme SendGrid, Mailgun, etc.
    ctx.logger.info(`Email would be sent to ${to} with subject: ${subject}`);

    // TODO: Implémenter l'envoi réel d'email
    // Exemple avec un service externe:
    // await ctx.httpClient.post('https://api.sendgrid.com/v3/mail/send', {
    //   personalizations: [{ to: [{ email: to }] }],
    //   from: { email: 'noreply@area.com' },
    //   subject,
    //   content: [{ type: 'text/plain', value: body }],
    // }, {
    //   Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
    // });

    return {
      success: true,
      output: {
        to,
        subject,
        sent_at: new Date().toISOString(),
      },
    };
  },
};

