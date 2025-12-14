import { Resend } from "resend";

export class MailService {
  private static resend = new Resend(process.env.RESEND_API_KEY!);

  static async sendCatEmail(imageUrl: string): Promise<void> {
    await this.resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: process.env.EMAIL_TO!,
      subject: "🐱 Your cat image is ready!",
      html: `
        <h1>Works ?</h1>
        <img src="${imageUrl}" alt="Cat" style="max-width:100%;" />
      `,
    });
  }
}
