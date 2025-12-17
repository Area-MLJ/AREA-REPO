import Resend from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function notifySecurityRisk(email: string) {
  try {
    const message = await resend.emails.send({
      from: "no-reply@tondomaine.com",
      to: email,
      subject: "Alerte de sécurité",
      html: "<p>Un risque a été détecté sur votre compte.</p>",
    });
    console.log("Email envoyé:", message);
  } catch (err) {
    console.error("Erreur Resend:", err);
  }
}
