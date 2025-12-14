import { MailService } from "../services/mail.service";
import { AreaActionInput } from "../types/area";

export async function sendMailAction(
  input: AreaActionInput
): Promise<void> {
  await MailService.sendCatEmail(input.imageUrl);
}
