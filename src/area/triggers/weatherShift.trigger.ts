import { WeatherService } from "@/services/weather.service";

export async function weatherShiftTrigger() {
  const current = await WeatherService.getCurrentWeather();
  const yesterdayTemp = await WeatherService.getYesterdayTemperature();

  const diff = Math.abs(current.main.temp - yesterdayTemp);

  return {
    triggered: diff > 10,
    diff,
    currentTemp: current.main.temp,
    yesterdayTemp,
  };
}
