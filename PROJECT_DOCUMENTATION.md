# 📘 NewsLens-AI — End-to-End Technical Documentation & Architecture Specification

---

## 1. System Overview

**NewsLens-AI** is a real-time personalized news aggregator designed around **Zero-Shot LLM Semantic Reranking** and **Explainable AI (XAI)**.

Unlike legacy recommendation engines that construct offline user vector embeddings or require matrix factorization across large historical user logs, NewsLens-AI synthesizes user intent on-the-fly directly from live database interactions and evaluates real-time news candidate pools using **Google Gemini 1.5 Flash**.

---

## 2. Mathematical & Technical Design Principles

### Candidate Pooling & Dual-Stage Pipeline

```
          [ Live Interaction Stream ]
                      │
                      ▼
     ┌──────────────────────────────────┐
     │ MongoDB Interaction & Saved Store │
     └──────────────────────────────────┘
                      │ (Query Recent Top 10)
                      ▼
     ┌──────────────────────────────────┐
     │ Candidate Pooling Stage          │
     │ Fetch ~25 Multi-Category News   │
     └──────────────────────────────────┘
                      │ (Deduplicated Raw Pool)
                      ▼
     ┌──────────────────────────────────┐
     │ Zero-Shot LLM Reranking (Gemini) │
     │ - Match Score S_i ∈ [0, 100]     │
     │ - XAI Explanation R_i            │
     └──────────────────────────────────┘
                      │ (Filter Score ≥ 60 & Sort Descending)
                      ▼
     ┌──────────────────────────────────┐
     │ Personalized Feed Rendering      │
     └──────────────────────────────────┘
```

### Stage 1: Candidate Pooling
1. Query MongoDB `saved_articles` (top 10 most recent) and `interactions` (top 10 most recent).
2. Concurrently request multi-category news candidate pools (`technology`, `business`, `sports`, `science`, `world`) from NewsData API.
3. Deduplicate articles by unique article ID / canonical URL into a candidate pool $C = \{c_1, c_2, \dots, c_N\}$ where $N \approx 25$.

### Stage 2: Zero-Shot LLM Reranking & XAI
1. Format user interaction history $H = \{h_1, h_2, \dots, h_K\}$ into structured text representations.
2. Formulate prompt $P(H, C)$ instructing Google Gemini to:
   - Compute semantic relevance score $S_i \in [0, 100]$ for candidate $c_i$.
   - Generate a single concise Explainable AI sentence $R_i$ starting with *"Recommended because..."*.
3. Parse structured JSON output, filter articles with score $S_i \ge 60$, and sort descending by score.

---

## 3. Data Schemas (MongoDB)

### `Interaction` Model (`server/src/models/interactionModel.js`)
Tracks implicit user reading activity:
```javascript
{
  userId: String,       // Unique user identifier
  articleId: String,    // Canonical article title or URL
  event: String,        // 'like' | 'save' | 'read' | 'ai_summary' | 'ai_chat'
  duration: Number,     // Reading duration in seconds (optional)
  createdAt: Date       // Timestamp
}
```

### `SavedArticle` Model (`server/src/models/savedArticleModel.js`)
Tracks explicit user saved reading list:
```javascript
{
  userId: String,       // Unique user identifier
  articleId: String,    // Unique hash/URL identifier
  title: String,        // Article headline
  description: String,  // Short snippet
  content: String,      // Full body text (if available)
  url: String,          // Original source link
  image: String,        // Thumbnail URL
  source: String,       // News publisher name
  publishedAt: String,  // Publication date
  savedAt: Date         // Timestamp
}
```

---

## 4. Prompt Engineering & Structured AI Outputs

### Recommendation Rerank Prompt (`server/src/prompts/prompts.js`)

```text
You are a Real-Time Explainable AI (XAI) Recommendation Reranker.

User's Recent Interaction History:
1. Title: NVIDIA Launches Next-Gen AI Chips, Category: saved
2. Title: Quantum Supremacy Milestones, Category: like

Candidate News Articles Pool:
[Index 0] Title: New Supercomputer Operational in Japan...
[Index 1] Title: Central Banks Adjust Interest Rates...

Instructions:
Evaluate each candidate article against the User's Interaction History.
Return a RAW JSON array of objects with fields "index" (integer), "score" (integer 0-100), and "reason" (1 concise sentence starting with "Recommended because...").
Do NOT include markdown formatting, backticks, or extra text.
```

---

## 5. Backend Component Breakdown

- **`server.js`**: Server entry point; initializes MongoDB connection and boots Express HTTP server on port 5000.
- **`app.js`**: Express configuration, CORS middleware, static file serving (`/frontend`), and mounting API routers.
- **`recommendationService.js`**: Core candidate pooling & zero-shot LLM recommendation engine.
- **`aiService.js`**: Integration wrapper for Google Gemini SDK (`@google/genai`).
- **`newsDataProvider.js`**: External NewsData.io HTTP provider with parameter normalization and error resilience.
- **`articleMapper.js`**: Standardizes external news payloads into unified internal article schemas.

---

## 6. Real-Time Terminal Diagnostic Log Example

When running `npm start` in `server/`, calling the `/api/recommendations/:userId` endpoint triggers clear diagnostic terminal logs:

```text
==============================================================
🎯 REAL-TIME USER INTEREST PROFILE & HISTORY (User: "demo-user")
--------------------------------------------------------------
📌 Saved Articles (2):
   1. "Quantum Computing Breakthrough in Superconductors"
   2. "NVIDIA Announces Next-Gen AI Chips"
📌 Recent Interactions (2):
   1. Event: [save] | Article: "Quantum Computing..."
   2. Event: [like] | Article: "NVIDIA Announces..."

🤖 GEMINI RERANKED & SCORED RECOMMENDATIONS:
--------------------------------------------------------------
   1. [95% Match] "New Supercomputing Cluster Unveiled"
      💡 Why: Recommended because you saved articles on GPU hardware and quantum computing.
   2. [91% Match] "AI Chipmakers Expand Manufacturing"
      💡 Why: Highly relevant to your saved interest in AI hardware policy.
==============================================================
```

---

## 7. Developer Onboarding & Running Locally

1. Install dependencies in `server/`:
   ```bash
   cd server
   npm install
   ```
2. Configure `.env`:
   ```bash
   cp .env.example .env
   ```
3. Start local MongoDB service.
4. Launch the application:
   ```bash
   npm start
   ```
5. Open browser at `http://localhost:5000`.
