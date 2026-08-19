import { getUserInterests } from "./interestService.js";
import { searchNews } from "./newsService.js";

const MAX_INTERESTS = 3;

export const getCandidateArticles = async (userId) => {
  const interests = await getUserInterests(userId);

  if (!interests.length) {
    return [];
  }

  const topInterests = interests.slice(0, MAX_INTERESTS);

  const allArticles = [];

  for (const interest of topInterests) {
    const articles = await searchNews(interest.topic);

    const matchingArticles = articles.filter((article) => {
      const category = article.category?.toLowerCase();

      return category === interest.topic.toLowerCase();
    });

    allArticles.push(...matchingArticles);
  }

  const uniqueArticles = [];
  const seenArticleIds = new Set();

  for (const article of allArticles) {
    if (seenArticleIds.has(article.id)) {
      continue;
    }

    seenArticleIds.add(article.id);
    uniqueArticles.push(article);
  }

  return uniqueArticles;
};