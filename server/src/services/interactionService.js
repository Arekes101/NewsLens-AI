import Interaction from "../models/interactionModel.js";

export const createInteraction = async ({
  userId,
  articleId,
  event,
  duration = 0,
}) => {
  const interaction = await Interaction.create({
    userId,
    articleId,
    event,
    duration,
  });

  return interaction;
};

export const getUserInteractions = async (userId) => {
  return await Interaction.find({ userId })
    .sort({ createdAt: -1 });
};