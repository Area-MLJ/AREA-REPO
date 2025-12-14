import { NewsService, NewsArticle } from "@/services/news.service";
import { MailService } from "@/services/mail.service";

export async function sendMailAction() {
  try {
    const article: NewsArticle | undefined = await NewsService.fetchTopArticle();
    if (!article) {
      console.log("Aucun article à envoyer");
      return;
    }

    await MailService.sendNewsEmail(article);
    console.log("Email envoyé avec succès !");
  } catch (err) {
    console.error("sendMailAction a échoué:", err);
  }
}
