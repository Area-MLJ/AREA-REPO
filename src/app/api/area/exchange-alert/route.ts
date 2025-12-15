import { exchangeAlertTrigger } from "@/area/triggers/exchangeAlert.trigger";
import { notifyExchangeAlertAction } from "@/area/actions/notifyExchangeAlert.action";

export async function POST() {
  try {
    const { triggered, EURUSD, BTCUSD } = await exchangeAlertTrigger();

    const message = triggered
      ? `⚠️ Alerte taux de change : EUR/USD=${EURUSD}, BTC/EUR=${BTCUSD}`
      : `✅ Pas d'alerte, tout est stable : EUR/USD=${EURUSD}, BTC/EUR=${BTCUSD}`;

    await notifyExchangeAlertAction(message);

    return Response.json({ success: true, triggered });
  } catch (error) {
    console.error("AREA exchange alert error:", error);
    return Response.json(
      { success: false, error: "Erreur lors de l'alerte exchange" },
      { status: 500 }
    );
  }
}
