const newsService = require("../services/newsService");

const getNews = async (req, res) => {
  try {
    const category = req.query.category || "general";

    const news = await newsService.getTopHeadlines(category);

    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({
      success: false,
    message: "Unable to fetch news at the moment.",
      articles: []
    });
  }
};

module.exports = {
  getNews,
};