import { fetchNews } from "../providers/newsDataProvider.js";
import { mapArticle } from "../mappers/articleMapper.js";

export const getNews = async (category) => {
  const articles = await fetchNews(category);

  return articles.map(mapArticle);
};