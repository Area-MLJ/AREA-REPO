import axios from "axios";

const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

export class ExchangeRateService {
  static async getRates() {
    const res = await axios.get("https://open.er-api.com/v6/latest/EUR", {
      headers: { "apikey": API_KEY },
    });
    return res.data.rates;
  }
}
