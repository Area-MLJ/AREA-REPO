import { ExchangeRateService } from "@/services/exchangeRate.service";

export async function exchangeAlertTrigger() {
  const rates = await ExchangeRateService.getRates();

  const EURUSD = rates["USD"];
  const BTCUSD = rates["BTC"]; // adapte si tu utilises un autre endpoint pour BTC

  const triggered = EURUSD < 1.05 || BTCUSD > 30000;

  return { triggered, EURUSD, BTCUSD };
}
