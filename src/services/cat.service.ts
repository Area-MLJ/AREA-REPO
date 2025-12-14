import axios from "axios";

export interface CatImage {
  id: string;
  url: string;
}

export class CatService {
  private static API_URL = "https://api.thecatapi.com/v1/images/search";

  static async generateImage(): Promise<CatImage> {
    const response = await axios.get<CatImage[]>(this.API_URL, {
      headers: {
        "x-api-key": process.env.CAT_API_KEY!,
      },
    });

    if (!response.data.length) {
      throw new Error("No cat image received from API");
    }

    return response.data[0];
  }
}
