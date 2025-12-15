import { sendSMS } from "@/services/twilio.service";

export async function notifyExchangeAlertAction(message: string) {
  await sendSMS(message, process.env.PHONE_TO!);
}
