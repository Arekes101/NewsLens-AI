import { getPersonalizedRecommendations } from "../services/recommendationService.js";

export const getRecommendations = async (req, res) => {
    try {
        const userId = req.params.userId || "anonymous_user";
        const articles = await getPersonalizedRecommendations(userId);

        res.json({
            success: true,
            articles,
        });
    } catch (error) {
        console.error("recommendationController error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to generate personalized recommendations.",
        });
    }
};
