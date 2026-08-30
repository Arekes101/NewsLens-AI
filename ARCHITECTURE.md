# NewsLens-AI Architecture

## System Overview

NewsLens-AI is a personalized news recommendation platform with AI-powered features. The system consists of:

- **Backend API** (Node.js/Express) - RESTful API server
- **ML Pipeline** (Python) - Embeddings, user representations, ranking
- **Data Stores** - MongoDB (primary), Qdrant (vectors), External APIs

---

## Architecture Diagram

```mermaid
graph TB
    subgraph Client["Client Applications"]
        UI[Frontend / Mobile App]
    end

    subgraph API["API Layer (Node.js/Express)"]
        Server[Express Server :5000]
        
        subgraph Routes["API Routes"]
            NewsRoutes["/api/news\n- GET / (latest)\n- GET /search\n- GET /category/:cat\n- GET /country/:country\n- GET /language/:lang"]
            AIRoutes["/api/ai\n- POST /summarize\n- POST /explain\n- POST /keypoints\n- POST /sentiment\n- POST /chat\n- POST /daily-brief"]
            InteractionRoutes["/api/interactions\n- POST / (record)\n- GET /:userId"]
            SavedRoutes["/api/saved\n- POST / (save)\n- GET /:userId\n- DELETE /:userId/:articleId"]
            InterestRoutes["/api/profile/interests\n- GET /:userId"]
            RecRoutes["/api/recommendations\n- GET /candidates/:userId\n- GET /personalized/:userId"]
        end
        
        subgraph Controllers["Controllers"]
            NewsCtrl[NewsController]
            AICtrl[AIController]
            InteractionCtrl[InteractionController]
            SavedCtrl[SavedArticleController]
            InterestCtrl[InterestController]
            RecCtrl[RecommendationController]
        end
        
        subgraph Services["Services"]
            NewsSvc[NewsService]
            AISvc[AIService]
            InteractionSvc[InteractionService]
            SavedSvc[SavedArticleService]
            InterestSvc[InterestService]
            RecSvc[RecommendationService]
        end
        
        subgraph Providers["External Providers"]
            NewsProvider[NewsData.io Provider]
            GeminiProvider[Google Gemini Provider]
        end
        
        subgraph Mappers["Data Mappers"]
            ArticleMapper[ArticleMapper]
        end
    end

    subgraph ML["ML Pipeline (Python)"]
        subgraph Embedding["Embedding Generation"]
            EmbedArticles[embed_articles.py]
            EmbeddingSvc[embedding_service.py]
            QdrantUtils[qdrant_utils.py]
        end
        
        subgraph UserProfile["User Representation"]
            UserRep[user_representation.py]
        end
        
        subgraph Ranking["Recommendation Ranking"]
            RankAPI[recommend_api.py]
            RankedRec[ranked_recommendations.py]
            RankCandidates[rank_candidates.py]
        end
    end

    subgraph DataStores["Data Stores"]
        subgraph MongoDB["MongoDB (Atlas)"]
            Articles[(articles\n- articleId (unique)\n- title, description\n- image, url, source\n- category, country, language\n- publishedAt\n- timestamps)]
            Interactions[(interactions\n- userId, articleId\n- event (view/click/read/like/save/share/ai_summary/ai_chat)\n- duration\n- timestamps)]
            SavedArticles[(saved_articles\n- userId, articleId (unique)\n- title, description, image\n- url, source, publishedAt\n- timestamps)]
            UserProfiles[(userprofiles\n- userId (unique)\n- preferenceVector (384-dim)\n- vectorUpdatedAt\n- timestamps)]
        end
        
        subgraph Qdrant["Qdrant Cloud (Vector DB)"]
            ArticleVectors[(article_embeddings\n- 384-dim vectors (all-MiniLM-L6-v2)\n- Payload: articleId, title, category, source, publishedAt\n- Distance: COSINE)]
        end
        
        subgraph ExternalAPIs["External APIs"]
            NewsAPI[NewsData.io\n(Latest news)]
            GeminiAPI[Google Gemini\n(AI responses)]
        end
    end

    %% Client to API
    UI --> Server
    
    %% API Routes to Controllers
    Server --> NewsRoutes
    Server --> AIRoutes
    Server --> InteractionRoutes
    Server --> SavedRoutes
    Server --> InterestRoutes
    Server --> RecRoutes
    
    NewsRoutes --> NewsCtrl
    AIRoutes --> AICtrl
    InteractionRoutes --> InteractionCtrl
    SavedRoutes --> SavedCtrl
    InterestRoutes --> InterestCtrl
    RecRoutes --> RecCtrl
    
    %% Controllers to Services
    NewsCtrl --> NewsSvc
    AICtrl --> AISvc
    InteractionCtrl --> InteractionSvc
    SavedCtrl --> SavedSvc
    InterestCtrl --> InterestSvc
    RecCtrl --> RecSvc
    
    %% Services to Providers/Models
    NewsSvc --> NewsProvider
    NewsSvc --> ArticleMapper
    NewsSvc --> Articles
    AISvc --> GeminiProvider
    AISvc --> Prompts[prompts.js]
    InteractionSvc --> Interactions
    InteractionSvc --> UserRep
    SavedSvc --> SavedArticles
    InterestSvc --> Interactions
    InterestSvc --> Articles
    RecSvc --> InterestSvc
    RecSvc --> NewsSvc
    RecCtrl --> RankAPI
    
    %% ML Pipeline connections
    EmbedArticles --> Articles
    EmbedArticles --> ArticleVectors
    EmbeddingSvc --> ArticleVectors
    UserRep --> Interactions
    UserRep --> ArticleVectors
    UserRep --> UserProfiles
    RankAPI --> UserProfiles
    RankAPI --> Interactions
    RankAPI --> Articles
    RankAPI --> ArticleVectors
    RankedRec --> UserProfiles
    RankedRec --> Interactions
    RankedRec --> Articles
    RankedRec --> ArticleVectors
    
    %% External APIs
    NewsProvider --> NewsAPI
    GeminiProvider --> GeminiAPI
    
    %% Styling
    classDef apiLayer fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef mlLayer fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef dataLayer fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef externalLayer fill:#fff3e0,stroke:#e65100,stroke-width:2px
    
    class Server,NewsRoutes,AIRoutes,InteractionRoutes,SavedRoutes,InterestRoutes,RecRoutes,NewsCtrl,AICtrl,InteractionCtrl,SavedCtrl,InterestCtrl,RecCtrl,NewsSvc,AISvc,InteractionSvc,SavedSvc,InterestSvc,RecSvc,NewsProvider,GeminiProvider,ArticleMapper apiLayer
    class EmbedArticles,EmbeddingSvc,QdrantUtils,UserRep,RankAPI,RankedRec,RankCandidates mlLayer
    class Articles,Interactions,SavedArticles,UserProfiles,ArticleVectors dataLayer
    class NewsAPI,GeminiAPI externalLayer
```

---

## Data Flow Description

### 1. News Ingestion Flow
```
NewsData.io API → NewsService.fetchNews() → ArticleMapper.mapArticle() 
→ MongoDB articles collection (upsert by articleId)
→ embed_articles.py (batch job) → Qdrant article_embeddings collection
```

### 2. User Interaction Flow
```
Client → POST /api/interactions → InteractionController.recordInteraction()
→ InteractionService.createInteraction() → MongoDB interactions collection
→ If event ∈ {like, save, share, ai_summary, ai_chat}:
   → Spawns Python user_representation.py (async)
   → Reads user interactions from MongoDB
   → Fetches article vectors from Qdrant
   → Computes weighted average (weighted by event type)
   → Normalizes → Saves to MongoDB userprofiles.preferenceVector
```

### 3. Interest Calculation Flow
```
Client → GET /api/profile/interests/:userId → InterestController.getInterests()
→ InterestService.getUserInterests() → MongoDB interactions + articles
→ Calculates category scores with:
   - Event weights (view=0, click=1, read=3, like=8, save=10, share=10, ai_summary=4, ai_chat=6)
   - Exponential decay: exp(-0.1 * age_in_days)
→ Returns sorted interests with percentages
```

### 4. Candidate Generation Flow
```
Client → GET /api/recommendations/candidates/:userId → RecommendationController.getCandidates()
→ RecommendationService.getCandidateArticles()
→ Gets top 3 user interests → Searches NewsData.io for each
→ Filters by matching category → Deduplicates → Returns candidates
```

### 5. Personalized Recommendation Flow
```
Client → GET /api/recommendations/personalized/:userId → RecommendationController.getPersonalizedRecommendations()
→ Spawns Python recommend_api.py
→ Loads user vector from MongoDB userprofiles
→ Queries Qdrant for top 10 semantic matches
→ Ranks using formula: 0.60*semantic + 0.25*interest + 0.15*recency
→ Returns ranked recommendations
```

### 6. AI Features Flow
```
Client → POST /api/ai/* → AIController → AIService → GeminiProvider → Google Gemini API
→ Returns structured JSON (summary, explanation, keypoints, sentiment, chat, daily_brief)
```

### 7. Saved Articles Flow
```
Client → POST /api/saved → SavedArticleController.save() → SavedArticleService.saveArticle()
→ MongoDB saved_articles (unique on userId+articleId)
Client → GET /api/saved/:userId → Returns user's saved articles
Client → DELETE /api/saved/:userId/:articleId → Removes saved article
```

---

## Data Storage Summary

| Collection | Database | Purpose | Key Fields |
|------------|----------|---------|------------|
| `articles` | MongoDB | News articles cache | articleId (unique), title, category, source, publishedAt |
| `interactions` | MongoDB | User behavior tracking | userId, articleId, event, duration, timestamps |
| `saved_articles` | MongoDB | User bookmarks | userId, articleId (unique), title, metadata |
| `userprofiles` | MongoDB | User preference vectors | userId (unique), preferenceVector[384], vectorUpdatedAt |
| `article_embeddings` | Qdrant | Semantic search vectors | 384-dim vector, payload: articleId, title, category, source, publishedAt |

---

## Event Weights (Shared between JS and Python)

| Event | Weight | Triggers Vector Update |
|-------|--------|------------------------|
| view | 0 | No |
| click | 1 | No |
| read | 3 | No |
| like | 8 | **Yes** |
| save | 10 | **Yes** |
| share | 10 | **Yes** |
| ai_summary | 4 | **Yes** |
| ai_chat | 6 | **Yes** |

---

## Recommendation Ranking Formula

```
final_score = 0.60 × semantic_score + 0.25 × interest_score + 0.15 × recency_score

Where:
- semantic_score: Cosine similarity from Qdrant (0-1)
- interest_score: User's category interest percentage / 100 (0-1)
- recency_score: 1 / (1 + age_hours/24) (0-1, newer = higher)
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| API Server | Node.js, Express 5, ES Modules |
| Database | MongoDB (Mongoose ODM), MongoDB Atlas |
| Vector DB | Qdrant Cloud |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2, 384-dim) |
| AI/LLM | Google Gemini (gemini-3.1-flash-lite) |
| News Source | NewsData.io API |
| Python ML | PyMongo, Qdrant Client, NumPy, sentence-transformers |

---

## Deployment Notes

- **Server**: Runs on port 5000 (`npm run dev` for development)
- **ML Scripts**: Executed via child_process from Node.js services
- **Python Environment**: Virtual environment at `ml/venv/`
- **Environment Variables**: Separate `.env` files for server and ML
- **MongoDB**: Shared connection string, database name `test`
- **Qdrant**: Cloud instance in eu-west-2