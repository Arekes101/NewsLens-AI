import * as aiService from "../services/aiService.js";

export const summarize = async (req, res) => {
  try {
    const { text } = req.body;

    const summary = await aiService.summarize(text);

    res.json({ success: true, summary });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const explain = async (req, res) => {
  try {
    const { text } = req.body;

    const explanation = await aiService.explain(text);

    res.json({
      success: true,
      explanation,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const keypoints = async (req, res) => {
  try {
    const { text } = req.body;

    const keypoints = await aiService.keypoints(text);

    res.json({
      success: true,
      keypoints,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sentiment = async (req, res) => {
  try {
    const { text } = req.body;

    const sentiment = await aiService.sentiment(text);

    res.json({
      success: true,
      sentiment,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const chat = async (req, res) => {
  try {
    const { text, question } = req.body;

    const answer = await aiService.chat(text, question);

    res.json({
      success: true,
      answer,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const dailyBrief = async (req, res) => {
  try {
    const { articles } = req.body;

    const brief = await aiService.dailyBrief(articles);

    res.json({
      success: true,
      brief,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};