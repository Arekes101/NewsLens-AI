export const summaryPrompt = (text) => `
You are an expert news analyst.

Summarize this news article.

Return ONLY valid JSON.

{
  "summary":[
    "...",
    "...",
    "...",
    "..."
  ]
}

Article:

${text}
`;

export const explainPrompt = (text) => `
Explain this news article to someone with no technical background.

Return ONLY valid JSON.

{
  "explanation":"..."
}

Article:

${text}
`;

export const keypointsPrompt = (text) => `
Extract the most important points.

Return ONLY valid JSON.

{
  "keypoints":[
    "...",
    "...",
    "...",
    "..."
  ]
}

Article:

${text}
`;

export const sentimentPrompt = (text) => `
Analyze the sentiment.

Return ONLY valid JSON.

{
  "sentiment":"Positive | Negative | Neutral",

  "reason":"..."
}

Article:

${text}
`;

export const chatPrompt = (text, question) => `
Answer ONLY using the information inside the article.

Return ONLY valid JSON.

{
  "answer":"..."
}

Article:

${text}

Question:

${question}
`;

export const dailyBriefPrompt = (articles) => `
Summarize today's news.

Return ONLY valid JSON.

{
 "brief":"..."
}

Articles:

${articles}
`;