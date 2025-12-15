import axios from "axios";

const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

export class ExchangeRateService {
  static async getRates(base: string) {
    const res = await axios.get(`https://open.er-api.com/v6/latest/${base}`);
    return res.data.rates; // objet { USD: 1.12, GBP: 0.88, ... }
  }
}