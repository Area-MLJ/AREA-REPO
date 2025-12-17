import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendSecurityEmail(content: string) {
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_TO) {
    throw new Error("EMAIL_FROM ou EMAIL_TO manquant dans .env.local");
  }

  await resend.emails.send({
    from: `Security Alert <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_TO,
    subject: "🔐 Alerte sécurité – fuite de données détectée",
    text: content,
  });
}
