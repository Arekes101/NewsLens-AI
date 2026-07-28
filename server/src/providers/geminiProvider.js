import { GoogleGenAI } from "@google/genai";
import { geminiConfig } from "../config/geminiConfig.js";

export const generateContent = async (prompt) => {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: geminiConfig.model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error(error);
    throw new Error("Gemini request failed");
  }
};