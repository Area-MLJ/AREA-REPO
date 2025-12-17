import axios from "axios";

const API_KEY = process.env.ABSTRACT_API_KEY!;
const BASE_URL = "https://emailreputation.abstractapi.com/v1/";

export class EmailRiskService {
  static async checkEmail(email: string) {
    try {
      const res = await axios.get(BASE_URL, {
        params: {
          api_key: API_KEY,
          email,
        },
      });
      return res.data;
    } catch (err: any) {
      console.error("Erreur Email Reputation API:", err.response?.data || err.message);
      throw err;
    }
  }
}
