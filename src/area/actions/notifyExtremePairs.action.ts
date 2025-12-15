import { ExchangeRateService } from "@/services/exchangeRate.service";
import { sendSMS } from "@/services/twilio.service";

export async function notifyExtremePairs() {
  const popularCurrencies = ["USD","EUR","GBP","JPY","CHF","CAD","AUD","NZD","CNY","INR"];
  
  const rates = await ExchangeRateService.getRates("EUR"); // maintenant ça marche

  let maxPair = { from: "", to: "", rate: 0 };
  let minPair = { from: "", to: "", rate: Infinity };

  for (const from of popularCurrencies) {
    for (const to of popularCurrencies) {
      if (from === to) continue;
      const rate = rates[to] / rates[from];
      if (rate > maxPair.rate) maxPair = { from, to, rate };
      if (rate < minPair.rate) minPair = { from, to, rate };
    }
  }

  const message = `
💱 Analyse des devises (top 10)

↗️ Plus fort: ${maxPair.from} → ${maxPair.to} = ${maxPair.rate.toFixed(4)}
↘️ Plus faible: ${minPair.from} → ${minPair.to} = ${minPair.rate.toFixed(4)}
`;

  await sendSMS(message, process.env.PHONE_TO!);
}
