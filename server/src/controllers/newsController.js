import * as newsService from "../services/newsService.js";

export const getNews = async (req, res) => {
  try {
    const category = req.query.category || "";

    const articles = await newsService.getNews(category);

    res.json({
      success: true,
      articles,
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
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const articles = await newsService.searchNews(q);

    res.json({
      success: true,
      articles,
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

    const articles = await newsService.getNewsByCategory(category);

    res.json({
      success: true,
      articles,
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

    const articles = await newsService.getNewsByCountry(country);

    res.json({
      success: true,
      articles,
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

    const articles = await newsService.getNewsByLanguage(language);

    res.json({
      success: true,
      articles,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch language news",
    });
  }
};