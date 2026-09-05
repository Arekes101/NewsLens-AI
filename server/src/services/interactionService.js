import Interaction from "../models/interactionModel.js";
import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pythonPath = path.join(
  __dirname,
  "../../../ml/venv/Scripts/python.exe"
);

const scriptPath = path.join(
  __dirname,
  "../../../ml/user_representation.py"
);

const VECTOR_UPDATE_EVENTS = new Set([
  "like",
  "save",
  "share",
  "ai_summary",
  "ai_chat",
]);

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

  return interaction;
};

export const getUserInteractions = async (userId) => {

  return await Interaction.find({ userId })
    .sort({ createdAt: -1 });

};