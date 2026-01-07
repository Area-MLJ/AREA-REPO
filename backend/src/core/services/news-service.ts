/**
 * Service pour récupérer des articles de news
 * Utilise l'API EventRegistry
 */
import httpClient from '@/lib/http-client';
import { logger } from '@/lib/logger';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: {
    name: string;
  };
}

export class NewsService {
  private static API_URL = 'https://eventregistry.org/api/v1/article/getArticles';

  /**
   * Récupère le top article de technologie
   */
  static async fetchTopArticle(): Promise<NewsArticle> {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      throw new Error('NEWS_API_KEY non défini dans les variables d\'environnement');
    }

    const requestBody = {
      action: 'getArticles',
      keyword: 'technologie',
      lang: ['fra'],
      articlesPage: 1,
      articlesCount: 1,
      articlesSortBy: 'date',
      articlesSortByAsc: false,
      dataType: ['news'],
      forceMaxDataTimeWindow: 31,
      resultType: 'articles',
      apiKey,
    };

    try {
      const response = await httpClient.post(this.API_URL, requestBody, {
        'Content-Type': 'application/json',
      });

      const articles = response.data?.articles?.results;
      if (!articles || !articles.length) {
        throw new Error('Aucun article trouvé');
      }

      const article = articles[0];

      return {
        title: article.title,
        description: article.body || article.description || '',
        url: article.url,
        source: { name: article.source?.title || 'Unknown' },
      };
    } catch (error: any) {
      logger.error('Error fetching news article:', error);
      throw new Error(`Failed to fetch news article: ${error.message}`);
    }
  }
}

