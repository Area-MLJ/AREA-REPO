import twilio, { Twilio } from "twilio";

const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(message: string, to: string) {
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_WHATSAPP_FROM!, // whatsapp:+14155238886
    to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`, // sécurise le format
  });
}