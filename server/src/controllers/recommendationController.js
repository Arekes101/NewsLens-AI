import { getCandidateArticles } from "../services/recommendationService.js";

export const getCandidates = async (req, res) => {
  try {
    const { userId } = req.params;

    const candidates = await getCandidateArticles(userId);

    res.json({
      success: true,
      userId,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    console.error("Candidate generation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate candidate articles",
    });
  }
};