const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const news = require('../services/news');
const ollama = require('../services/ollama');

function plan(query) {
    const q = query.toLowerCase();

    const actions = ['retrieve_news'];

    if (/compare|versus|vs/.test(q)) {
        actions.push('compare');
    }

    if (/summar|brief|explain|what happened|why/.test(q)) {
        actions.push('synthesize');
    }

    if (/trend|popular|trending/.test(q)) {
        actions.push('trend_analysis');
    }

    return actions;
}

function detectCategory(query) {
    const q = query.toLowerCase();

    if (/\btechnology\b|\btech\b|\bai\b|\bartificial intelligence\b|\bsoftware\b|\bcyber\b/.test(q)) {
        return 'Technology';
    }

    if (/\bbusiness\b|\bmarket\b|\bstocks\b|\beconomy\b|\bfinance\b/.test(q)) {
        return 'Business';
    }

    if (/\bscience\b|\bclimate\b|\bspace\b|\bresearch\b/.test(q)) {
        return 'Science';
    }

    if (/\bsports?\b|\bfootball\b|\bcricket\b|\btennis\b/.test(q)) {
        return 'Sports';
    }

    if (/\bworld\b|\binternational\b|\bglobal\b/.test(q)) {
        return 'World';
    }

    return null;
}

async function run(query, userId) {
    const id = uuidv4();
    const start = Date.now();
    const actions = plan(query);

    db.prepare(`
        INSERT INTO agent_runs
        (id, user_id, query, plan, status)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        id,
        userId || null,
        query,
        JSON.stringify(actions),
        'running'
    );

    try {
        // Always attempt to refresh live news before answering a
        // current-news question.
        await news.refresh();

        const category = detectCategory(query);

        let articles;

        if (category) {
            articles = news.list({
                category,
                limit: 8
            });
        } else {
            articles = news.list({
                q: query,
                limit: 8
            });
        }

        // If category search returned nothing, fall back to the
        // latest articles rather than sending an empty context to the LLM.
        if (!articles.length) {
            articles = news.list({
                limit: 8
            });
        }

        const context = articles
            .map((a, i) => {
                return `[${i + 1}]
Title: ${a.title}
Source: ${a.source}
Published: ${a.published_at}
Category: ${a.category}
Description: ${a.description}`;
            })
            .join('\n\n');

        let answer;

        if (await ollama.available()) {
            answer = await ollama.generate(`
You are World In Brief, a news intelligence agent.

Answer the user's question ONLY using the supplied articles.

Rules:
- Do not invent facts.
- Do not use your pretrained knowledge when the articles do not support a claim.
- Clearly say when the available articles are insufficient.
- Be concise and neutral.
- Cite supporting articles using [1], [2], etc.

User query:
${query}

Retrieved articles:
${context}
            `.trim());
        } else {
            answer = articles.length
                ? `I found ${articles.length} relevant stories.\n\n` +
                  articles
                      .slice(0, 5)
                      .map(
                          (a, i) =>
                              `${i + 1}. ${a.title} — ${a.source}`
                      )
                      .join('\n')
                : 'No matching stories found. Refresh the feed and try again.';
        }

        const result = {
            answer,
            articles,
            actions
        };

        db.prepare(`
            UPDATE agent_runs
            SET result = ?, status = ?, duration_ms = ?
            WHERE id = ?
        `).run(
            JSON.stringify(result),
            'completed',
            Date.now() - start,
            id
        );

        return {
            id,
            ...result
        };

    } catch (error) {
        console.error('Agent execution error:', error);

        db.prepare(`
            UPDATE agent_runs
            SET status = ?, duration_ms = ?
            WHERE id = ?
        `).run(
            'failed',
            Date.now() - start,
            id
        );

        throw error;
    }
}

module.exports = {
    run,
    plan
};
