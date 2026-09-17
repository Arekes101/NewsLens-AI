import {
  createInteraction,
  getUserInteractions,
} from "../services/interactionService.js";

export const recordInteraction = async (req, res) => {
  try {
    const {
      userId = "demo-user",
      articleId,
      event,
      duration = 0,
    } = req.body;

    if (!articleId || !event) {
      return res.status(400).json({
        success: false,
        message: "articleId and event are required",
      });
    }

    const interaction = await createInteraction({
      userId,
      articleId,
      event,
      duration,
    });

    res.status(201).json({
      success: true,
      interaction,
    });
  } catch (error) {
    console.error("Interaction error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to record interaction",
    });
  }
};

export const getInteractions = async (req, res) => {
  try {
    const { userId } = req.params;

    const interactions = await getUserInteractions(userId);

    res.json({
      success: true,
      interactions,
    });
  } catch (error) {
    console.error("Get interactions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get interactions",
    });
  }
};