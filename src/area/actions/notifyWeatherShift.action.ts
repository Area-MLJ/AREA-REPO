import { sendWhatsApp } from "@/services/whatsapp.service";
import { getClothingAdvice } from "@/utils/clothingAdvice";

interface Params {
  triggered: boolean;
  diff: number;
  currentTemp: number;
  yesterdayTemp: number;
}

export async function notifyWeatherShiftAction({
  triggered,
  diff,
  currentTemp,
  yesterdayTemp,
}: Params) {
  let message = "";

  if (triggered) {
    message = `
⚠️ Changement météo brutal à Strasbourg

🌡️ Aujourd’hui : ${currentTemp}°C
🕒 Hier : ${yesterdayTemp}°C
📉 Différence : ${diff.toFixed(1)}°C

👕 Conseil :
${getClothingAdvice(currentTemp)}
`;
  } else {
    message = `
✅ Météo stable à Strasbourg

🌡️ Aujourd’hui : ${currentTemp}°C
🕒 Hier : ${yesterdayTemp}°C
📊 Différence : ${diff.toFixed(1)}°C

👉 Rien à signaler, pas de changement brutal 😄
`;
  }

  await sendWhatsApp(message);
}
