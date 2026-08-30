export const summaryPrompt = (text) => `
You are an expert news analyst.

Provide a concise, well-structured summary of the following news article using clear bullet points. Do NOT return JSON or code blocks.

Article:

${text}
`;

export const explainPrompt = (text) => `
Explain this news article to someone with no technical background in clear, simple language. Do NOT return JSON or code blocks.

Article:

${text}
`;

export const keypointsPrompt = (text) => `
Extract the key take-aways from this news article as concise bullet points. Do NOT return JSON or code blocks.

Article:

${text}
`;

export const sentimentPrompt = (text) => `
Analyze the tone and sentiment of this news article.

Format your output as:
Sentiment: [Positive / Negative / Neutral]
Reasoning: [1-2 sentences explaining why]

Do NOT return JSON or code blocks.

Article:

${text}
`;

export const chatPrompt = (text, question) => `
Answer the question using ONLY the information inside the article. Be direct and clear. Do NOT return JSON or code blocks.

Article:

${text}

Question:

${question}
`;

export const dailyBriefPrompt = (articles) => {
    const text = Array.isArray(articles)
        ? articles
            .map(
                (a, i) =>
                    `${i + 1}. Title: ${a.title || "Untitled"}\nDescription: ${a.description || "No description available"
                    }`
            )
            .join("\n\n")
        : articles || "No articles provided.";

    return `
Summarize today's news articles into a clean executive daily brief with clear bullet points. Highlight key trends and major stories. Do NOT return JSON or code blocks.

Articles:

${text}
`;
};