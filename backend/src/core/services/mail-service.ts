/**
 * Service pour envoyer des emails
 * Utilise Resend API
 */
import httpClient from '@/lib/http-client';
import { logger } from '@/lib/logger';
import { NewsArticle } from './news-service';

export class MailService {
  private static RESEND_API_URL = 'https://api.resend.com/emails';

  /**
   * Envoie un email avec un article de news
   */
  static async sendNewsEmail(article: NewsArticle, to: string): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || 'noreply@area.com';

    if (!apiKey) {
      throw new Error('RESEND_API_KEY non défini dans les variables d\'environnement');
    }

    if (!to) {
      throw new Error('Adresse email destinataire requise');
    }

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1 style="color: #1a73e8;">📰 ${article.title}</h1>
        <p style="font-size: 14px; color: #555;"><strong>Source :</strong> ${article.source.name}</p>
        <p style="font-size: 16px; line-height: 1.5;">${article.description || 'Pas de description disponible.'}</p>
        <a href="${article.url}" target="_blank" style="display: inline-block; padding: 10px 15px; background-color: #1a73e8; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Lire l'article complet
        </a>
      </div>
    `;

    try {
      await httpClient.post(
        this.RESEND_API_URL,
        {
          from,
          to,
          subject: `📰 ${article.title}`,
          html,
        },
        {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      );

      logger.info(`Email sent successfully to ${to} with article: ${article.title}`);
    } catch (error: any) {
      logger.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Envoie un email générique
   */
  static async sendEmail(to: string, subject: string, body: string, html?: string): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || 'noreply@area.com';

    if (!apiKey) {
      throw new Error('RESEND_API_KEY non défini dans les variables d\'environnement');
    }

    try {
      await httpClient.post(
        this.RESEND_API_URL,
        {
          from,
          to,
          subject,
          text: body,
          html: html || body,
        },
        {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      );

      logger.info(`Email sent successfully to ${to} with subject: ${subject}`);
    } catch (error: any) {
      logger.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}

