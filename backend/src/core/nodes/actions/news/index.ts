import { ActionNode, ActionResult } from '../../base';
import { NodeContext } from '../../../engine/node-context';
import { NewsService } from '../../../services/news-service';

/**
 * Action News: Déclenche quand un nouvel article de technologie est disponible
 * Paramètres:
 * - keyword: Mot-clé pour filtrer les articles (optionnel, défaut: "technologie")
 */
export const newsAction: ActionNode = {
  type: 'action',
  service: 'news',
  name: 'top_article',
  execute: async (ctx: NodeContext, params: Record<string, any>): Promise<ActionResult> => {
    const keyword = params.keyword || 'technologie';

    try {
      ctx.logger.debug(`Fetching top article for keyword: ${keyword}`);

      // Récupérer le top article
      const article = await NewsService.fetchTopArticle();

      ctx.logger.info(`News action triggered: ${article.title} from ${article.source.name}`);

      return {
        triggered: true,
        output: {
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source.name,
          keyword,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      ctx.logger.error(`Error in news action: ${error.message}`);
      // En cas d'erreur, on ne déclenche pas l'action
      return {
        triggered: false,
        output: {
          error: error.message,
        },
      };
    }
  },
};

