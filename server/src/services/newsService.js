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

const processArticles = async (articles) => {
  const mappedArticles = articles.map(mapArticle);

  await saveArticles(mappedArticles);

  return mappedArticles;
};

export const getNews = async (category = "") => {
  const articles = await fetchNews({ category });

  return processArticles(articles);
};

export const searchNews = async (query) => {
  const articles = await fetchNews({ q: query });

  return processArticles(articles);
};

export const getNewsByCountry = async (country) => {
  const articles = await fetchNews({ country });

  return processArticles(articles);
};

export const getNewsByLanguage = async (language) => {
  const articles = await fetchNews({ language });

  return processArticles(articles);
};

export const getNewsByCategory = async (category) => {
  const articles = await fetchNews({ category });

  return processArticles(articles);
};