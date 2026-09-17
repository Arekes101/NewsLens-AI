import {
  saveArticle,
  getSavedArticles,
  unsaveArticle,
} from "../services/savedArticleService.js";

export const save = async (req, res) => {
  try {
    const {
      userId = "demo-user",
      articleId,
      title,
      description = "",
      image = "",
      url = "",
      source = "",
      publishedAt = "",
    } = req.body;

    if (!articleId || !title) {
      return res.status(400).json({
        success: false,
        message: "articleId and title are required",
      });
    }

    const article = await saveArticle({
      userId,
      articleId,
      title,
      description,
      image,
      url,
      source,
      publishedAt,
    });

    res.status(201).json({
      success: true,
      article,
    });
  } catch (error) {
    console.error("Save article error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save article",
    });
  }
};

export const getSaved = async (req, res) => {
  try {
    const { userId } = req.params;

    const articles = await getSavedArticles(userId);

    res.json({
      success: true,
      articles,
    });
  } catch (error) {
    console.error("Get saved articles error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get saved articles",
    });
  }
};

export const removeSaved = async (req, res) => {
  try {
    const { userId, articleId } = req.params;

    const article = await unsaveArticle(userId, articleId);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Saved article not found",
      });
    }

    res.json({
      success: true,
      message: "Article removed from saved articles",
    });
  } catch (error) {
    console.error("Remove saved article error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove saved article",
    });
  }
};