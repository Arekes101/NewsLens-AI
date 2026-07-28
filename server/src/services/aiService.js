import { generateContent } from "../providers/geminiProvider.js";

import {
  summaryPrompt,
  explainPrompt,
  keypointsPrompt,
  sentimentPrompt,
  chatPrompt,
  dailyBriefPrompt,
} from "../prompts/prompts.js";

export const summarize = async (text) =>
  generateContent(summaryPrompt(text));

export const explain = async (text) =>
  generateContent(explainPrompt(text));

export const keypoints = async (text) =>
  generateContent(keypointsPrompt(text));

export const sentiment = async (text) =>
  generateContent(sentimentPrompt(text));

export const chat = async (text, question) =>
  generateContent(chatPrompt(text, question));

export const dailyBrief = async (articles) =>
  generateContent(dailyBriefPrompt(articles));