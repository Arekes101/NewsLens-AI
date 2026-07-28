import { fetchNews } from "../providers/newsDataProvider.js";
import { mapArticle } from "../mappers/articleMapper.js";

export const getNews = async (category = "") => {
  const articles = await fetchNews({ category });

  return articles.map(mapArticle);
};

export const searchNews = async (query) => {
  const articles = await fetchNews({ q: query });

  return articles.map(mapArticle);
};

export const getNewsByCountry = async (country) => {
  const articles = await fetchNews({ country });

  return articles.map(mapArticle);
};

export const getNewsByLanguage = async (language) => {
  const articles = await fetchNews({ language });

  return articles.map(mapArticle);
};

export const getNewsByCategory = async (category) => {
  const articles = await fetchNews({ category });

  return articles.map(mapArticle);
};