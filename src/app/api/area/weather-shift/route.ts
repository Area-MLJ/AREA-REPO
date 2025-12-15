import { weatherShiftTrigger } from "@/area/triggers/weatherShift.trigger";
import { notifyWeatherShiftAction } from "@/area/actions/notifyWeatherShift.action";

export async function POST() {
  try {
    const result = await weatherShiftTrigger();

    await notifyWeatherShiftAction(result);

    return Response.json({
      success: true,
      triggered: result.triggered,
    });
  } catch (error) {
    console.error("AREA météo shift error:", error);
    return Response.json(
      { success: false, error: "Erreur AREA météo shift" },
      { status: 500 }
    );
  }
}
