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