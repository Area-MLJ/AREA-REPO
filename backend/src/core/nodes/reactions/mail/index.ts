import { ReactionNode, ReactionResult } from '../../base';
import { NodeContext } from '../../../engine/node-context';
import { MailService } from '../../../services/mail-service';
import { NewsArticle } from '../../../services/news-service';

/**
 * Réaction Mail: Envoie un email
 * Paramètres:
 * - to: Adresse email du destinataire (requis)
 * - subject: Sujet de l'email (optionnel, peut être généré depuis l'output de l'action)
 * - body: Corps de l'email (optionnel, peut être généré depuis l'output de l'action)
 * 
 * Si l'output de l'action contient des données d'article de news (title, description, url, source),
 * un email formaté sera envoyé automatiquement.
 */
export const mailSend: ReactionNode = {
  type: 'reaction',
  service: 'mail',
  name: 'send_email',
  execute: async (ctx: NodeContext, params: Record<string, any>): Promise<ReactionResult> => {
    const { to } = params;

    if (!to) {
      throw new Error('to parameter is required');
    }

    try {
      // Vérifier si on a des données d'article de news dans le contexte (depuis l'action précédente)
      // Le contexte peut contenir l'output de l'action dans ctx.input ou dans les paramètres
      const actionOutput = ctx.input || params;

      // Si on a les données d'un article de news, utiliser MailService.sendNewsEmail
      if (actionOutput.title && actionOutput.url && actionOutput.source) {
        const article: NewsArticle = {
          title: actionOutput.title,
          description: actionOutput.description || '',
          url: actionOutput.url,
          source: {
            name: actionOutput.source,
          },
        };

        await MailService.sendNewsEmail(article, to);

        ctx.logger.info(`News email sent to ${to} with article: ${article.title}`);

        return {
          success: true,
          output: {
            to,
            subject: `📰 ${article.title}`,
            sent_at: new Date().toISOString(),
            article_title: article.title,
          },
        };
      } else {
        // Sinon, envoyer un email générique
        const subject = params.subject || actionOutput.subject || 'Notification AREA';
        const body = params.body || actionOutput.body || actionOutput.description || 'Notification automatique depuis AREA';

        await MailService.sendEmail(to, subject, body);

        ctx.logger.info(`Email sent to ${to} with subject: ${subject}`);

        return {
          success: true,
          output: {
            to,
            subject,
            sent_at: new Date().toISOString(),
          },
        };
      }
    } catch (error: any) {
      ctx.logger.error(`Error sending email: ${error.message}`);
      throw error;
    }
  },
};

