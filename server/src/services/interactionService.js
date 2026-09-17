import Interaction from "../models/interactionModel.js";

export const createInteraction = async ({
  userId,
  articleId,
  event,
  duration = 0,
}) => {
  // Save interaction to MongoDB
  const interaction = await Interaction.create({
    userId,
    articleId,
    event,
    duration,
  });

  console.log(`📌 [NEW INTERACTION LOGGED] Event: "${event}" | Article ID: "${articleId}" | User: "${userId}"`);

  return interaction;
};

export const getUserInteractions = async (userId) => {

  return await Interaction.find({ userId })
    .sort({ createdAt: -1 });

};