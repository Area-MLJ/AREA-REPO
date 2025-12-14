import { NewsService } from "@/services/news.service";
import { AreaTriggerResult } from "@/types/area";

export async function newsTrigger(): Promise<AreaTriggerResult> {
  const article = await NewsService.fetchTopArticle();

  return {
    title: article.title,
    description: article.description,
    url: article.url,
    source: article.source.name,
  };
}
