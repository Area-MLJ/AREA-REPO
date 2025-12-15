import axios from "axios";

const API_KEY = process.env.OPENWEATHER_API_KEY;
const CITY = "Strasbourg";

export class WeatherService {
  static async getCurrentWeather() {
    const res = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: CITY,
          appid: API_KEY,
          units: "metric",
        },
      }
    );

    return res.data;
  }

  static async getYesterdayTemperature() {
    const res = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      {
        params: {
          q: CITY,
          appid: API_KEY,
          units: "metric",
        },
      }
    );

    // forecast = toutes les 3h → 8 slots ≈ 24h
    const approxYesterdaySlot = res.data.list[8];

    return approxYesterdaySlot.main.temp;
  }
}
