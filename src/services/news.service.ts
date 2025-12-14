import axios from "axios";
import { Resend } from "resend";

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: {
    name: string;
  };
}

export class NewsService {
  private static API_URL = "https://eventregistry.org/api/v1/article/getArticles";

  static async fetchTopArticle(): Promise<NewsArticle> {
    if (!process.env.NEWS_API_KEY) {
      throw new Error("NEWS_API_KEY non défini dans .env.local");
    }

    const requestBody = {
      action: "getArticles",
      keyword: "technologie",
      lang: ["fra"],
      articlesPage: 1,
      articlesCount: 1,
      articlesSortBy: "date",
      articlesSortByAsc: false,
      dataType: ["news"],
      forceMaxDataTimeWindow: 31,
      resultType: "articles",
      apiKey: process.env.NEWS_API_KEY
    };

    const response = await axios.post(this.API_URL, requestBody, {
      headers: { "Content-Type": "application/json" },
    });

    const articles = response.data?.articles?.results;
    if (!articles || !articles.length) {
      throw new Error("Aucun article trouvé");
    }

    const article = articles[0];

    return {
      title: article.title,
      description: article.body,
      url: article.url,
      source: { name: article.source.title },
    };
  }
}
