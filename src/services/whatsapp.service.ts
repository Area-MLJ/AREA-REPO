import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendWhatsApp(message: string) {
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_WHATSAPP_FROM!, // whatsapp:+14155238886
    to: process.env.PHONE_TO!,               // whatsapp:+33xxxxxxxxx
  });
}
