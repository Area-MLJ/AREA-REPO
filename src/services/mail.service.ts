import { Resend } from "resend";

export class MailService {
  private static resend = new Resend(process.env.RESEND_API_KEY!);

  static async sendNewsEmail(article: NewsArticle): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1 style="color: #1a73e8;">📰 ${article.title}</h1>
        <p style="font-size: 14px; color: #555;"><strong>Source :</strong> ${article.source.name}</p>
        <p style="font-size: 16px; line-height: 1.5;">${article.description ?? "Pas de description disponible."}</p>
        <a href="${article.url}" target="_blank" style="display: inline-block; padding: 10px 15px; background-color: #1a73e8; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Lire l'article complet
        </a>
      </div>
    `;

    await this.resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: process.env.EMAIL_TO!,
      subject: `📰 ${article.title}`,
      html,
    });
  }
}
