import * as newsService from "../services/newsService.js";

export const getNews = async (req, res) => {
  try {
    const category = req.query.category || "";
    const page = req.query.page || "";

    const result = await newsService.getNews(category, page);

    res.json({
      success: true,
      articles: result.articles,
      nextPage: result.nextPage,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch news",
    });
  }
};

export const searchNews = async (req, res) => {
  try {
    const { q, page } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const result = await newsService.searchNews(q, page || "");

    res.json({
      success: true,
      articles: result.articles,
      nextPage: result.nextPage,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to search news",
    });
  }
};

export const getCategoryNews = async (req, res) => {
  try {
    const { category } = req.params;
    const page = req.query.page || "";

    const result = await newsService.getNewsByCategory(category, page);

    res.json({
      success: true,
      articles: result.articles,
      nextPage: result.nextPage,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch category news",
    });
  }
};

export const getCountryNews = async (req, res) => {
  try {
    const { country } = req.params;
    const page = req.query.page || "";

    const result = await newsService.getNewsByCountry(country, page);

    res.json({
      success: true,
      articles: result.articles,
      nextPage: result.nextPage,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch country news",
    });
  }
};

export const getLanguageNews = async (req, res) => {
  try {
    const { language } = req.params;
    const page = req.query.page || "";

    const result = await newsService.getNewsByLanguage(language, page);

    res.json({
      success: true,
      articles: result.articles,
      nextPage: result.nextPage,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch language news",
    });
  }
};