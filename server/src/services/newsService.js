import { fetchNews } from "../providers/newsDataProvider.js";
import { mapArticle } from "../mappers/articleMapper.js";
import Article from "../models/articleModel.js";

const saveArticles = async (articles) => {
  for (const article of articles) {
    await Article.findOneAndUpdate(
      { articleId: article.id },
      {
        articleId: article.id,
        title: article.title,
        description: article.description || "",
        image: article.image || "",
        url: article.url || "",
        source: article.source || "",
        category: article.category || "",
        country: article.country || "",
        language: article.language || "",
        publishedAt: article.publishedAt || "",
      },
      {
        upsert: true,
        new: true,
      }
    );
  }
};

const processArticles = async (responseObj) => {
  const rawArticles = responseObj.results || [];
  const nextPage = responseObj.nextPage || null;
  const mappedArticles = rawArticles.map(mapArticle);

  await saveArticles(mappedArticles);

  return {
    articles: mappedArticles,
    nextPage,
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