import Interaction from "../models/interactionModel.js";
import Article from "../models/articleModel.js";

const EVENT_WEIGHTS = {
  view: 0,
  click: 1,
  read: 3,
  like: 8,
  save: 10,
  share: 10,
  ai_summary: 4,
  ai_chat: 6,
};

const getRecencyFactor = (createdAt) => {
  const now = Date.now();
  const interactionTime = new Date(createdAt).getTime();

  const ageInDays =
    (now - interactionTime) / (1000 * 60 * 60 * 24);

  // Exponential decay.
  // Older interactions gradually become less important.
  return Math.exp(-0.1 * ageInDays);
};

export const getUserInterests = async (userId) => {
  const interactions = await Interaction.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  const interests = {};

  for (const interaction of interactions) {
    const article = await Article.findOne({
      articleId: interaction.articleId,
    }).lean();

    if (!article || !article.category) {
      continue;
    }

    const eventWeight = EVENT_WEIGHTS[interaction.event] ?? 0;

    if (eventWeight === 0) {
      continue;
    }

    const recencyFactor = getRecencyFactor(
      interaction.createdAt
    );

    const score = eventWeight * recencyFactor;

    const category = article.category.toLowerCase();

    interests[category] =
      (interests[category] || 0) + score;
  }

  const sortedInterests = Object.entries(interests)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

  const totalScore = sortedInterests.reduce(
    (sum, [, score]) => sum + score,
    0
  );

  return sortedInterests.map(([topic, score]) => ({
    topic,
    score: Number(score.toFixed(4)),
    percentage:
      totalScore > 0
        ? Number(((score / totalScore) * 100).toFixed(2))
        : 0,
  }));
};