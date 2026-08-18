import { getUserInterests } from "../services/interestService.js";

export const getInterests = async (req, res) => {
  try {
    const { userId } = req.params;

    const interests = await getUserInterests(userId);

    res.json({
      success: true,
      userId,
      interests,
    });
  } catch (error) {
    console.error("Get interests error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to calculate user interests",
    });
  }
};