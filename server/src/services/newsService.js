import { fetchNews } from "../providers/newsDataProvider.js";
import { mapArticle } from "../mappers/articleMapper.js";

const processArticles = async (responseObj) => {
  const rawArticles = responseObj.results || [];
  const mappedArticles = rawArticles.map(mapArticle);

  return {
    articles: mappedArticles,
  };
};

export const getNews = async (category = "", page = "") => {
  const resData = await fetchNews({ category, page });

  return processArticles(resData);
};

export const searchNews = async (query, page = "") => {
  const resData = await fetchNews({ q: query, page });

  return processArticles(resData);
};

export const getNewsByCountry = async (country, page = "") => {
  const resData = await fetchNews({ country, page });

  return processArticles(resData);
};

export const getNewsByLanguage = async (language, page = "") => {
  const resData = await fetchNews({ language, page });

  return processArticles(resData);
};

export const getNewsByCategory = async (category, page = "") => {
  const resData = await fetchNews({ category, page });

  return processArticles(resData);
};