# 📰 NewsLens-AI — Real-Time LLM Personalization Engine & Explainable AI (XAI)

> **A Next-Generation Personalization News Platform powered by Google Gemini Zero-Shot Semantic Reranking and Transparent Explainable AI (XAI).**

---

## 🌟 Executive Summary

Traditional news recommendation systems rely on static Machine Learning pipelines (e.g., Matrix Factorization, Offline Vector Embeddings, collaborative filtering) that require heavy pre-training and struggle with **cold-start real-time news streaming**.

**NewsLens-AI** introduces a novel, production-grade architecture that replaces offline ML models with a **Real-Time Zero-Shot LLM Reranking & Explainable AI (XAI) Engine**. Powered by **Google Gemini**, NewsLens-AI dynamically synthesizes user interaction history (saves, likes, AI queries) on-the-fly to score, filter, and explain live news candidate pools in real-time.

---

## ✨ Key Features

- 🎯 **Real-Time Zero-Shot Personalization**: Dynamically scores live news candidate articles (0–100% Match) based on live user interaction history without pre-trained model weights.
- 💡 **Explainable AI (XAI)**: Every personalized article includes a human-readable explanation (*"Why For You"*) detailing why the story matches your preferences.
- ⚡ **Instant Intent Adaptation**: Save or like an article on a topic (e.g. *Quantum Computing* or *Sports*), and your **"For You"** feed instantly shifts to prioritize related news.
- 🤖 **Interactive AI Assistant**: Ask questions directly to any news article, generate instant key takeaways, perform sentiment analysis, or request clear non-technical explanations.
- 📊 **Executive Daily Brief**: Synthesizes top breaking global headlines into a concise daily brief.
- 🎨 **Quiet Luxury Design**: Clean, responsive, multi-column masonry typography interface built with custom Vanilla CSS.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([User App / Frontend]) -->|1. Live Actions / Save / Like| DB[(MongoDB)]
    User -->|2. Request 'For You' Feed| Server[Express Server Recommender]
    Server -->|3. Query Recent Interactions| DB
    Server -->|4. Multi-Category Candidate Pooling| NewsAPI[NewsData.io API]
    NewsAPI -->|Candidate Pool (25+ Articles)| Server
    Server -->|5. Zero-Shot Rerank + XAI Prompt| Gemini[Google Gemini 1.5 Flash]
    Gemini -->|Structured JSON (Scores & Reasons)| Server
    Server -->|6. Personalized Feed with XAI Badges| User
```

---

## 📁 Directory Structure

```
NewsLens-AI/
├── frontend/                   # Quiet Luxury Web Client
│   ├── index.html              # Main HTML markup with tab navigation
│   ├── style.css               # Design system, tokens, XAI badges, responsive layout
│   └── script.js               # Client controller, state management, API integration
│
├── server/                     # Express Node.js Backend API
│   ├── src/
│   │   ├── config/             # DB & API configurations
│   │   ├── controllers/        # Request handlers (News, AI, Interactions, Recommendations)
│   │   ├── mappers/            # Data transformation & normalization schema
│   │   ├── models/             # Mongoose schemas (Interaction, SavedArticle)
│   │   ├── prompts/            # Prompt engineering templates & XAI rerank prompt
│   │   ├── providers/          # External client integrations (NewsData, Gemini SDK)
│   │   ├── routes/             # RESTful API route definitions
│   │   ├── services/           # Core business logic & Candidate Pooling Engine
│   │   ├── app.js              # Express app setup & middleware
│   │   └── server.js           # HTTP Server & MongoDB listener
│   └── .env.example            # Environment variable template
│
├── ARCHITECTURE_LLM_RECOMMENDER.md  # Architectural specification & academic novelty
├── PROJECT_DOCUMENTATION.md         # Full in-depth technical documentation
└── README.md                        # Master project documentation
```

---

## 🚀 Quick Start & Installation Guide

### Prerequisites
- **Node.js** (v18.x or higher)
- **MongoDB** (Local instance running on `mongodb://localhost:27017` or MongoDB Atlas URI)
- **NewsData.io API Key** ([Get free key](https://newsdata.io/))
- **Google Gemini API Key** ([Get free key](https://aistudio.google.com/))

### 1. Environment Setup
Navigate to the `server/` directory and create your `.env` file from the provided template:

```bash
cd server
cp .env.example .env
```

Configure your `.env` keys:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/newslens
NEWSDATA_API_KEY=your_actual_newsdata_key
GEMINI_API_KEY=your_actual_gemini_key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
npm start
```
The server will start listening at `http://localhost:5000`.

### 4. Access the Application
Open your browser and navigate to:
```
http://localhost:5000
```

---

## 🔌 API Endpoint Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/news` | Fetch latest breaking news candidates |
| `GET` | `/api/news/category/:category` | Fetch news filtered by category |
| `GET` | `/api/recommendations/:userId` | **LLM Reranked "For You" Feed with XAI** |
| `POST` | `/api/interactions` | Log real-time user action (`like`, `save`, `read`, `ai_chat`) |
| `POST` | `/api/saved` | Save article to user reading list |
| `GET` | `/api/saved/:userId` | Fetch user's saved articles |
| `POST` | `/api/ai/summarize` | Generate AI summary for an article |
| `POST` | `/api/ai/explain` | Generate plain-language XAI explanation |
| `POST` | `/api/ai/chat` | Interactive AI Q&A grounded on article text |
| `GET` | `/api/ai/daily-brief` | Generate executive daily briefing |

---

## 📄 License & Attribution
This project is open-source under the MIT License. Developed as an advanced demonstration of Zero-Shot LLM Personalization and Explainable AI (XAI).
