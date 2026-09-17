import Interaction from "../models/interactionModel.js";
import SavedArticle from "../models/savedArticleModel.js";
import { fetchNews } from "../providers/newsDataProvider.js";
import { mapArticle } from "../mappers/articleMapper.js";
import { rankAndExplainCandidates } from "./aiService.js";

export const getPersonalizedRecommendations = async (userId) => {
    try {
        // 1. Fetch user's recent interactions & saved articles
        const recentInteractions = await Interaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
            .catch(() => []);

        const savedArticles = await SavedArticle.find({ userId })
            .sort({ savedAt: -1 })
            .limit(10)
            .lean()
            .catch(() => []);

        const userInteractions = [
            ...savedArticles.map((s) => ({ title: s.title, category: "saved" })),
            ...recentInteractions.map((i) => ({ title: i.articleId, category: i.event })),
        ].slice(0, 10);

        // 2. Multi-Category Candidate Pooling
        const categories = ["technology", "business", "sports", "science", "world"];
        const candidatePromises = categories.map((cat) =>
            fetchNews({ category: cat })
                .then((res) => res.results || [])
                .catch(() => [])
        );

        const poolResults = await Promise.all(candidatePromises);
        const rawCandidates = poolResults.flat();

        // 3. Deduplicate candidate pool
        const seenIds = new Set();
        const candidatePool = [];

        for (const raw of rawCandidates) {
            const mapped = mapArticle(raw);
            if (mapped.id && !seenIds.has(mapped.id)) {
                seenIds.add(mapped.id);
                candidatePool.push(mapped);
            }
            if (candidatePool.length >= 25) break; // Limit pool size for fast inference
        }

        if (candidatePool.length === 0) {
            return [];
        }

        // 4. Zero-Shot LLM Reranking & XAI Generation via Gemini
        const evaluations = await rankAndExplainCandidates(candidatePool, userInteractions);

        // 5. Merge scores and explanations
        const scoredCandidates = candidatePool.map((article, idx) => {
            const evalItem = evaluations.find((e) => e.index === idx);
            return {
                ...article,
                score: evalItem && typeof evalItem.score === "number" ? evalItem.score : 70,
                aiReason:
                    evalItem && evalItem.reason
                        ? evalItem.reason
                        : "Recommended based on overall popular interest.",
            };
        });

        // 6. Filter score >= 60 & sort high to low
        const filtered = scoredCandidates
            .filter((art) => art.score >= 60)
            .sort((a, b) => b.score - a.score);

        const finalResults = filtered.length > 0 ? filtered : candidatePool.slice(0, 10);

        // Terminal Logging
        console.log("\n==============================================================");
        console.log(`🎯 REAL-TIME USER INTEREST PROFILE & HISTORY (User: "${userId}")`);
        console.log("--------------------------------------------------------------");
        if (savedArticles.length > 0) {
            console.log(`📌 Saved Articles (${savedArticles.length}):`);
            savedArticles.forEach((s, idx) => console.log(`   ${idx + 1}. "${s.title}"`));
        }
        if (recentInteractions.length > 0) {
            console.log(`📌 Recent Interactions (${recentInteractions.length}):`);
            recentInteractions.forEach((i, idx) => console.log(`   ${idx + 1}. Event: [${i.event}] | Article: "${i.articleId}"`));
        }
        if (savedArticles.length === 0 && recentInteractions.length === 0) {
            console.log("ℹ️ No interaction history recorded yet. Using cold-start defaults.");
        }

        console.log("\n🤖 GEMINI RERANKED & SCORED RECOMMENDATIONS:");
        console.log("--------------------------------------------------------------");
        finalResults.slice(0, 5).forEach((art, idx) => {
            console.log(`   ${idx + 1}. [${art.score}% Match] "${art.title}"`);
            console.log(`      💡 Why: ${art.aiReason}`);
        });
        console.log("==============================================================\n");

        return finalResults;
    } catch (error) {
        console.error("getPersonalizedRecommendations error:", error.message);
        throw error;
    }
};
