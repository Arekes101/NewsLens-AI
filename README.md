# NewsLens_AI - Software_Engineering_VIT-26(BCSE301L)

**An AI-Driven, Database-Backed News Intelligence Platform**
**Inspired by:** Inshorts & The Sun's concise news format  
**Core Innovation:** Agentic AI pipeline that transforms raw news into structured intelligence
---
## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [AI Pipeline](#ai-pipeline)
- [Database Design](#database-design)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Module Completion Status](#module-completion-status)
- [Current Focus Areas](#current-focus-areas)
- [Future Enhancements](#future-enhancements)
- [Team](#team)
- [Faculty Mentor](#faculty-mentor)

---

## Project Overview

**NewsLens AI** is a full-stack news intelligence platform that fetches live BBC RSS feeds, processes them through an **agentic AI pipeline**, and delivers personalized, AI-generated summaries. The system uses **Ollama with Llama 3.2** locally for AI inference, ensuring privacy and zero API costs.
**Target Users:** Busy professionals, researchers, media literacy educators, and general readers looking for quick and unbiased news insights.

### Why NewsLens AI?
- **Brevity without losing context** → Inspired by Inshorts' concise news format
- **Trusted sources only** → BBC RSS provides credible and reliable reporting
- **Actionable intelligence** → AI Assistant answers natural language queries about news

## Context Diagram 
<img width="1097" height="680" alt="image" src="https://github.com/user-attachments/assets/0a6917e1-45bd-4b73-b09d-6f6d7174748a" />

## SECTION – EXPLANATION
THIS CONTEXT DIAGRAM SHOWS THE **WORLD IN BRIEF SYSTEM** AS A SINGLE CENTRALIZED PROCESS (**BUBBLE 0**), INTERACTING WITH THREE EXTERNAL ENTITIES: **READER**, **ADMIN**, AND **NEWS SOURCE**.
THE **READER** PROVIDES REGISTRATION, LOGIN, PREFERENCES, AND FEEDBACK, WHILE THE SYSTEM RETURNS **PERSONALIZED AI-GENERATED NEWS SUMMARIES** AND **NOTIFICATION ALERTS**.
THE **ADMIN** MANAGES CONTENT AND USER ACCOUNTS, RECEIVING **REPORTS** AND **FEEDBACK LOGS** FROM THE SYSTEM.
THE **NEWS SOURCE** ACTS AS AN EXTERNAL DATA PROVIDER, SUPPLYING **RAW NEWS CONTENT** INTO THE SYSTEM.
THIS DIAGRAM ESTABLISHES THE OVERALL **SYSTEM BOUNDARY**, SHOWING THAT NO INTERNAL PROCESSES OR DATA STORES ARE EXPOSED AT THIS LEVEL.

1. **User** → Provides natural language queries; receives AI-generated news intelligence.
2. **BBC RSS** → External data provider; the system consumes but doesn't modify it.
The system boundary hides all internal complexity at this level.

# Decomposed Data-Flow Diagram
<img width="975" height="563" alt="image" src="https://github.com/user-attachments/assets/05503d05-ab1e-4788-ab6f-823cac3b9f52" />

## SECTION – EXPLANATION
## LEVEL 1 DFD – EXPLANATION
THE LEVEL 1 DFD DECOMPOSES THE MAIN PROCESS (**BUBBLE 0**) INTO FOUR KEY SUB-PROCESSES:
1. **USER AUTHENTICATION & PREFERENCE MANAGEMENT**
2. **AI NEWS FETCHING & SUMMARIZATION**
3. **PERSONALIZED FEED GENERATION**
4. **FEEDBACK & REPORTING MODULE**
IT ALSO INTRODUCES INTERNAL DATA STORES SUCH AS **USER PROFILE DB**, **ARTICLE REPOSITORY**, AND **FEEDBACK LOGS**.
DATA FLOWS BETWEEN THESE SUB-PROCESSES SHOW HOW A READER'S PREFERENCES TRIGGER THE AI TO FETCH RELEVANT NEWS, SUMMARIZE IT, AND DELIVER IT BACK TO THE USER. MEANWHILE, THE ADMIN INTERACTS WITH THE USER AND CONTENT MANAGEMENT MODULES.
THIS LEVEL ENSURES THAT ALL INTERACTIONS FROM THE CONTEXT DIAGRAM ARE PROPERLY BALANCED AND ACCOUNTED FOR.

## Key Flows
| **Component** | **Flow / Function** |
|---|---|
| **User Query** | Agent Planner analyzes intent (e.g., "summarize sports" → Action: summarize, Category: sports) |
| **Executor** | Fetches news via `newsTool.js`, crafts the AI prompt, and calls Ollama |
| **Session Memory** | Maintains conversation context across multiple turns |
| **BBC RSS** | Acts as an external data source; the system polls it on demand |

---

## Tech Stack
### Frontend
| **Technology** | **Purpose** |
|---|---|
| HTML5 | Structure |
| CSS3 | Styling with dark mode support |
| Vanilla JavaScript | API calls and DOM manipulation |
| Fetch API | Backend communication |

### Backend
| **Technology** | **Purpose** |
|---|---|
| Node.js | Runtime environment |
| Express.js | API server and routing |
| Ollama | Local LLM inference engine |
| Llama 3.2 (7B) | Language model |

### AI/ML Pipeline
| **Component** | **Role** |
|---|---|
| Agentic AI Planner | Rule-based intent classification |
| Executor | Orchestrates news fetching and LLM prompting |
| News Tool | BBC RSS fetching for General, Business, Sports, Health, and Entertainment |
| Session Memory | Temporary conversation storage |

---

## Key Features
### Original Features
| **Feature** | **Description** |
|---|---|
| Live BBC RSS News | Fetches live news from BBC RSS feeds |
| News Categories | General, Business, Sports, Health, and Entertainment |
| News Search | Search functionality for news articles |
| Dark Mode | Toggle between light and dark themes |
| Multi-Language Support | English, Hindi, Tamil, and Bengali |
| Basic Summarization | Generates concise news summaries |
| Text-to-Speech | Converts news content into speech |
| Translation | Translates news titles |

### New AI Features Added
| **Feature** | **Description** | **Why This Approach?** |
|---|---|---|
| AI News Assistant | Natural language chat panel on the homepage | No API keys; runs locally |
| Ollama Integration | Local Llama 3.2 inference | Privacy, zero cost, and offline capability |
| Agentic AI Pipeline | Planner → Executor → Tool architecture | Separates concerns and improves scalability |
| Conversation Memory | Session-based context retention | Improves user experience |
| Backend Orchestration | Express handles the AI and RSS workflow | Provides a complete full-stack architecture |

### How It Works
**User asks:** `"Recommend top headlines"`  
→ **Planner** identifies `action = recommend` and `category = general`  
→ **Executor** fetches BBC news  
→ Sends the prompt to **Ollama**  
→ Returns a structured AI-generated response.

---

## AI Pipeline & Novelty
### Why This Architecture?
#### What's New and Novel?

Most news platforms typically use one of the following approaches:

| **Approach** | **Limitation** |
|---|---|
| Rule-based RSS Readers | No AI-based intelligence |
| OpenAI API | Requires internet access, API costs, and may raise privacy concerns |
| Simple Prompt Templates | No agentic orchestration |

### NewsLens AI Combines

| **Innovation** | **Description** |
|---|---|
| Agentic AI Pipeline | Separates Planner, Executor, and Memory responsibilities |
| Local LLM | Uses Ollama for private and zero-cost inference |
| Conversational Memory | Maintains context across user interactions |
| Natural Language Interface | Allows users to interact using natural language |
| Modular Tool Design | Uses `newsTool.js` for easy extension and maintenance |

### Novelty Statement
> **NewsLens AI introduces an agentic architecture where user intent is parsed, news is fetched contextually, and AI responses are generated locally—all while maintaining session memory. This shifts from news display to news intelligence, offering proactive insights rather than passive consumption.**
---


## Project Structure
```text
NewsLens-AI/
├── frontend/
│   ├── index.html          # Main interface with AI chat panel
│   ├── app.js              # Frontend logic (API calls, dark mode, TTS)
│   └── styles.css          # Dark mode + responsive design
│
├── backend/
│   ├── server.js           # Express API gateway
│   │
│   ├── agent/
│   │   ├── agent.js        # Main agent orchestrator
│   │   ├── planner.js      # Intent classifier
│   │   ├── executor.js     # Fetches news + prompts Ollama
│   │   └── memory.js       # Session memory
│   │
│   ├── services/
│   │   └── ollama.js       # Ollama API client
│   │
│   └── tools/
│       └── newsTool.js     # BBC RSS fetcher
│
├── package.json            # Node dependencies
└── README.md               # Project documentation
```
## System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    NEWSLENS AI SYSTEM ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                              │
│                                                                         │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │
│   │ index.html  │  │   app.js    │  │ styles.css  │                   │
│   │  UI Base    │  │    Logic    │  │   Theming   │                   │
│   └─────────────┘  └─────────────┘  └─────────────┘                   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    AI Chat Panel Interface                      │   │
│   │                                                                 │   │
│   │  User Input │ AI Response │ Language Selector │ Text-to-Speech │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                               HTTP REST API
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                               │
│                                                                         │
│                    ┌─────────────────────────┐                          │
│                    │  server.js API Gateway  │                          │
│                    └─────────────────────────┘                          │
│                                                                         │
│       /news │ /summarize │ /chat │ /health │ /history                  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    AI AGENT ORCHESTRATOR                        │   │
│   │                         agent.js                                │   │
│   │                                                                 │   │
│   │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │   │
│   │   │   PLANNER    │ →  │   EXECUTOR   │ →  │    MEMORY    │     │   │
│   │   │  planner.js  │    │ executor.js  │    │  memory.js   │     │   │
│   │   └──────────────┘    └──────────────┘    └──────────────┘     │   │
│   │                                                                 │   │
│   │   Planner: Intent Classification                               │   │
│   │   Executor: Fetch News → Build Prompt → Call Ollama → Format   │   │
│   │   Memory: User Queries → AI Responses → Context                │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                         TOOLS LAYER                             │   │
│   │                                                                 │   │
│   │                        newsTool.js                              │   │
│   │                                                                 │   │
│   │       BBC RSS: General │ Business │ Sports │ Health │ Entertainment│
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                       SERVICES LAYER                            │   │
│   │                                                                 │   │
│   │                         ollama.js                               │   │
│   │                                                                 │   │
│   │   askOllama() → HTTP Client → Prompt Engineering → Responses   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                               HTTP API (Ollama)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI INFERENCE LAYER                              │
│                                                                         │
│                         OLLAMA ENGINE                                   │
│                                                                         │
│                    ┌──────────────────────────┐                         │
│                    │    Llama 3.2 (7B)        │                         │
│                    └──────────────────────────┘                         │
│                                                                         │
│   Summarization │ Q&A Response Generation │ Natural Language Understanding│
│                                                                         │
│   Local Inference: CPU/GPU │ No Internet │ Zero API Cost │ Privacy     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA SOURCE LAYER                              │
│                                                                         │
│                       EXTERNAL DATA SOURCES                             │
│                                                                         │
│                          BBC RSS FEEDS                                  │
│                                                                         │
│       General │ Business │ Sports │ Health │ Entertainment               │
└─────────────────────────────────────────────────────────────────────────┘
```
## Dataflow Sequence Diagram 
## AI Request Processing Flow

```text
┌────────┐   ┌─────────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐   ┌──────────┐
│  USER  │   │  FRONTEND   │   │ BACKEND  │   │  AGENT   │   │ PLANNER │   │ EXECUTOR │
└───┬────┘   └──────┬──────┘   └────┬─────┘   └────┬─────┘   └────┬────┘   └────┬─────┘
    │               │               │              │              │              │
    │ 1. User Query │               │              │              │              │
    │──────────────▶│               │              │              │              │
    │   "Summarize  │               │              │              │              │
    │    sports"    │               │              │              │              │
    │               │               │              │              │              │
    │               │ 2. POST /chat │              │              │              │
    │               │──────────────▶│              │              │              │
    │               │               │              │              │              │
    │               │               │ 3. Route to  │              │              │
    │               │               │    Agent     │              │              │
    │               │               │─────────────▶│              │              │
    │               │               │              │              │              │
    │               │               │              │ 4. Send      │              │
    │               │               │              │    Query     │              │
    │               │               │              │─────────────▶│              │
    │               │               │              │              │              │
    │               │               │              │              │ 5. Classify  │
    │               │               │              │              │    Intent    │
    │               │               │              │              │              │
    │               │               │              │              │ Action:      │
    │               │               │              │              │ Summarize    │
    │               │               │              │              │ Category:    │
    │               │               │              │              │ Sports      │
    │               │               │              │◀─────────────│              │
    │               │               │              │              │              │
    │               │               │              │ 6. Execute   │              │
    │               │               │              │─────────────▶│              │
    │               │               │              │              │              │
    │               │               │              │              │              │
    │               │               │              │              │   7. Fetch News
    │               │               │              │              │              │
    │               │               │              │              │              │───────▶ BBC RSS
    │               │               │              │              │              │
    │               │               │              │              │              │◀─────── News Data
    │               │               │              │              │              │
    │               │               │              │              │              │ 8. Build Prompt
    │               │               │              │              │              │
    │               │               │              │              │              │ 9. Call Ollama
    │               │               │              │              │              │───────▶ Ollama
    │               │               │              │              │              │
    │               │               │              │              │              │◀─────── AI Response
    │               │               │              │              │              │
    │               │               │              │ 10. Response │              │
    │               │               │              │◀─────────────│              │
    │               │               │              │              │              │
    │               │               │              │ 11. Save to  │              │
    │               │               │              │     Memory   │              │
    │               │               │              │              │              │
    │               │               │              │ 12. Response │              │
    │               │               │              │◀─────────────│              │
    │               │               │              │              │              │
    │               │ 13. JSON Response           │              │              │
    │               │◀──────────────│              │              │              │
    │               │               │              │              │              │
    │ 14. Display AI Answer        │              │              │              │
    │◀──────────────│               │              │              │              │
    │               │               │              │              │              │
```

## State Transition Diagram 
```text
┌─────────────┐
│    IDLE     │
│  (Waiting)  │
└──────┬──────┘
       │ User Input Received
       ▼
┌─────────────┐
│   PLANNING  │
│   (Intent   │
│   Analysis) │
└──────┬──────┘
       │ Intent Resolved
       ▼
┌─────────────┐
│   FETCHING  │
│    (News    │
│  Retrieval) │
└──────┬──────┘
       │ Data Ready
       ▼
┌─────────────┐
│  PROMPTING  │
│    (LLM     │
│ Invocation) │
└──────┬──────┘
       │ Response Received
       ▼
┌─────────────┐
│ MEMORIZING  │
│   (Context  │
│   Storage)  │
└──────┬──────┘
       │ Response Formatted
       ▼
┌─────────────┐
│ RESPONDING  │
│  (Delivery) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    IDLE     │
└─────────────┘
```

## AI Agent Processing Architecture
```text
                    ┌─────────────────────────────────────┐
                    │         USER QUERY RECEIVED         │
                    └─────────────────┬───────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────┐
                    │          PLANNER ANALYSIS           │
                    │                                     │
                    │   ┌────────────────────────────┐    │
                    │   │ Keyword Matching:          │    │
                    │   │                            │    │
                    │   │ "summarize" → Action       │    │
                    │   │ "recommend" → Action       │    │
                    │   │ "explain" → Action         │    │
                    │   │ "business" → Category      │    │
                    │   │ "sports" → Category        │    │
                    │   │ "health" → Category        │    │
                    │   └────────────────────────────┘    │
                    └─────────────────┬───────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────┐
                    │         ACTION DETERMINED           │
                    │                                     │
                    │  ┌─────────────┐  ┌─────────────┐   │
                    │  │  Summarize  │  │  Recommend  │   │
                    │  └──────┬──────┘  └──────┬──────┘   │
                    │         │                │           │
                    │         └───────┬────────┘           │
                    │                 │                    │
                    │  ┌──────────────▼─────────────────┐ │
                    │  │       Category Selected        │ │
                    │  │                                │ │
                    │  │ General / Business / Sports /  │ │
                    │  │ Health / Entertainment         │ │
                    │  └──────────────┬─────────────────┘ │
                    └─────────────────┬───────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────┐
                    │       EXECUTOR ORCHESTRATION        │
                    │                                     │
                    │  1. Fetch News via newsTool.js      │
                    │  2. Extract relevant articles       │
                    │  3. Build structured prompt         │
                    │  4. Call ollama.js service          │
                    │  5. Parse and format response       │
                    └─────────────────┬───────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────┐
                    │            MEMORY UPDATE            │
                    │                                     │
                    │   ┌──────────────────────────────┐  │
                    │   │ Session Store:               │  │
                    │   │                              │  │
                    │   │ - Query History              │  │
                    │   │ - AI Responses               │  │
                    │   │ - Conversation Context       │  │
                    │   └──────────────────────────────┘  │
                    └─────────────────┬───────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────┐
                    │         RESPONSE DELIVERY           │
                    │                                     │
                    │   ┌──────────────────────────────┐  │
                    │   │ JSON Response to Frontend    │  │
                    │   │                              │  │
                    │   │ - AI Answer                  │  │
                    │   │ - Suggested Follow-ups       │  │
                    │   │ - Source Attribution         │  │
                    │   └──────────────────────────────┘  │
                    └─────────────────────────────────────┘
```
## System Verification and Testing

```text
                    ┌─────────────────────────────────────┐
                    │         SYSTEM VERIFICATION         │
                    └─────────────────┬───────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ INPUT VALIDATION│     │ PROCESS VALID.  │     │  OUTPUT VALID.  │
│                 │     │                 │     │                 │
│ ✓ Query Syntax  │     │ ✓ RSS Fetch     │     │ ✓ AI Response   │
│ ✓ Category Map  │     │ ✓ Ollama Call   │     │ ✓ Format        │
│ ✓ Language Code │     │ ✓ Memory Store  │     │ ✓ Relevance     │
│ ✓ Session ID    │     │ ✓ Error Handle  │     │ ✓ Factual       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
          │                           │                           │
          └───────────────────────────┼───────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────┐
                    │       TEST SUITE EXECUTION          │
                    │                                     │
                    │  ┌──────────────────────────────┐  │
                    │  │ Unit Tests:                  │  │
                    │  │                              │  │
                    │  │ - Planner Classification     │  │
                    │  │ - Executor Data Flow         │  │
                    │  │ - Memory CRUD Operations     │  │
                    │  └──────────────────────────────┘  │
                    │                                     │
                    │  ┌──────────────────────────────┐  │
                    │  │ Integration Tests:           │  │
                    │  │                              │  │
                    │  │ - End-to-End Query Flow      │  │
                    │  │ - RSS Fetch + LLM Response   │  │
                    │  │ - Multi-Turn Conversation    │  │
                    │  └──────────────────────────────┘  │
                    └─────────────────────────────────────┘
```

## Component Legend

```text
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│                              COMPONENT LEGEND                                       │
│                                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   ┌───────┐ │    │   ┌───────┐ │    │   ┌───────┐ │    │   ┌───────────────┐ │  │
│  │   │  UI   │ │    │   │  API  │ │    │   │ Agent │ │    │   │   External    │ │  │
│  │   │ Layer │ │    │   │Gateway│ │    │   │ Layer │ │    │   │    Source     │ │  │
│  │   └───────┘ │    │   └───────┘ │    │   └───────┘ │    │   └───────────────┘ │  │
│  │  Frontend   │    │   Backend   │    │   AI Core   │    │   Data Provider     │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────────────┘  │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                         TECHNOLOGY COMPONENTS                               │   │
│  │                                                                              │   │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌────────┐  ┌────────┐  ┌───────┐ ┌─────┐│   │
│  │  │HTML │  │ CSS │  │ JS  │  │Node │  │Express │  │ Ollama │  │ Llama │ │ BBC ││   │
│  │  └─────┘  └─────┘  └─────┘  └─────┘  └────────┘  └────────┘  └───────┘ └─────┘│   │
│  │                                                                              │   │
│  │  Frontend          │ Backend          │ AI Layer         │ Data Source      │   │
│  │  Technologies      │ Technologies     │ Technologies     │ Technologies     │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture (V2 Roadmap)

```text
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│                      DEPLOYMENT ARCHITECTURE (V2 ROADMAP)                          │
│                                                                                     │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────────────────────┐  │
│  │             │         │             │         │                             │  │
│  │   Vercel    │────────▶│     AWS     │────────▶│       Ollama Host          │  │
│  │  (Frontend) │  HTTPS  │  (Backend)  │  HTTPS  │       (EC2/Lambda)         │  │
│  │             │         │             │         │                             │  │
│  │  Static     │         │   Express   │         │  Llama 3.2 (GPU Instance) │  │
│  │  Files      │         │   Server    │         │                             │  │
│  └─────────────┘         └─────────────┘         └─────────────────────────────┘  │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                         SUPPORTING SERVICES                                 │   │
│  │                                                                             │   │
│  │  Cache Layer:    ┌─────────────────────┐                                   │   │
│  │                  │   Redis / Elastic   │                                   │   │
│  │                  │   (Session Store)   │                                   │   │
│  │                  └─────────────────────┘                                   │   │
│  │                                                                             │   │
│  │  Database:       ┌─────────────────────┐                                   │   │
│  │                  │     PostgreSQL      │                                   │   │
│  │                  │ (User Preferences)  │                                   │   │
│  │                  └─────────────────────┘                                   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Frontend Dependencies
| **Library** | **Purpose** | **Method** |
|---|---|---|
| **RSS Parser** | Parse BBC feeds | Backend (Node.js) |
| **Ollama API** | LLM inference | HTTP client (Axios) |
| **Fetch API** | Backend calls | Browser native |

---

## Licenses

| **Component** | **License** | **Reason** |
|---|---|---|
| **Llama 3.2** | [Llama 3.2 Community License](https://llama.meta.com/llama3/license/) | Commercial-friendly, open weights |
| **Express.js** | MIT License | Permissive, allows redistribution |
| **Ollama** | MIT License | Permissive and modifiable |
| **rss-parser** | MIT License | Permissive |
| **NewsLens AI Code** | **MIT License (Recommended)** | Allows academic sharing and commercial use |

### MIT License Recommendation
**MIT License** is permissive, meets VIT project requirements, and allows others to build upon and reuse your work.

## NewsLens AI Request Flow

```text
┌────────┐     ┌─────────────┐     ┌──────────┐     ┌──────────┐     ┌─────────┐
│  User  │────▶│  Frontend   │────▶│  Backend │────▶│  Agent   │────▶│ Planner │
│        │     │             │     │          │     │          │     │         │
└────────┘     └─────────────┘     └──────────┘     └──────────┘     └────┬────┘
     ▲               │                  │                  │               │
     │               │                  │                  │◀──────────────┘
     │               │                  │                  │    Intent
     │               │                  │                  │
     │               │                  │                  ▼
     │               │                  │              ┌──────────┐
     │               │                  │              │ Executor │
     │               │                  │              └────┬─────┘
     │               │                  │                   │
     │               │                  │                   ▼
     │               │                  │              ┌────────────┐
     │               │                  │              │  newsTool  │
     │               │                  │              └────┬───────┘
     │               │                  │                   │
     │               │                  │                   ▼
     │               │                  │              ┌────────────┐
     │               │                  │              │  BBC RSS   │
     │               │                  │              └────┬───────┘
     │               │                  │                   │
     │               │                  │                   ▼
     │               │                  │              ┌────────────┐
     │               │                  │              │ ollama.js  │
     │               │                  │              └────┬───────┘
     │               │                  │                   │
     │               │                  │                   ▼
     │               │                  │              ┌────────────┐
     │               │                  │              │   Ollama   │
     │               │                  │              │ Llama 3.2  │
     │               │                  │              └────┬───────┘
     │               │                  │                   │
     │               │                  │                   ▼
     │               │                  │              ┌────────────┐
     │               │                  │              │   Memory   │
     │               │                  │              └────┬───────┘
     │               │                  │                   │
     │               │                  │◀──────────────────┘
     │               │                  │     Response
     │               │                  │
     │               │◀─────────────────┘
     │               │   JSON Response
     │               │
     │◀──────────────┘
     │ Display Response
```


## Project Novelty
## Comparison with Conventional News Platforms

| **Aspect** | **Conventional** | **NewsLens AI** |
|---|---|---|
| **News Consumption** | Click buttons to read | **Chat with AI** |
| **Architecture** | Frontend → RSS | **Frontend → Agent → Planner → Executor → Tool → RSS → LLM** |
| **Memory** | None | **Session context across queries** |
| **Privacy** | Third-party APIs | **Ollama runs locally** |
| **Cost** | OpenAI per-token | **Zero-cost inference** |


## Component Responsibility Matrix
| **Layer** | **Component** | **File** | **Primary Responsibility** |
|---|---|---|---|
| **Presentation** | Main UI | `frontend/index.html` | User interface rendering |
| **Presentation** | Frontend Logic | `frontend/app.js` | API calls, DOM manipulation, TTS, dark mode |
| **Presentation** | Styling | `frontend/styles.css` | Responsive design and dark theme |
| **Application** | API Gateway | `backend/server.js` | Route handling, request parsing, error middleware |
| **Agentic** | Orchestrator | `backend/agent/agent.js` | Coordinates Planner → Executor flow |
| **Agentic** | Planner | `backend/agent/planner.js` | Intent classification (summarize/recommend/explain) |
| **Agentic** | Executor | `backend/agent/executor.js` | Fetches news, builds prompts, calls Ollama |
| **Agentic** | Memory | `backend/agent/memory.js` | Session-based context storage |
| **Tools** | News Fetcher | `backend/tools/newsTool.js` | BBC RSS scraping across 5 categories |
| **Services** | LLM Client | `backend/services/ollama.js` | HTTP client for Ollama API |
| **Inference** | Local LLM | Ollama + Llama 3.2 | AI inference (summarization and Q&A) |
| **Data** | External Source | BBC RSS Feeds | Unidirectional news data provider |


## Data Flow Annotations
| **Arrow** | **Data Flow** | **Type** |
|---|---|---|
| **①** | User → Frontend | Text input |
| **②** | Frontend → `server.js` | HTTP POST `/chat` |
| **③** | `server.js` → Planner | Parsed request object |
| **④** | Planner → Executor | Intent + Category |
| **⑤** | Executor → `newsTool.js` | Fetch command |
| **⑥** | `newsTool.js` → BBC RSS | HTTP GET request |
| **⑦** | BBC RSS → `newsTool.js` | XML/JSON feed |
| **⑧** | `newsTool.js` → Executor | Structured news array |
| **⑨** | Executor → `ollama.js` | Prompt + Context |
| **⑩** | `ollama.js` → Ollama | HTTP POST `/api/generate` |
| **⑪** | Ollama → `ollama.js` | Generated AI response |
| **⑫** | `ollama.js` → Executor | Formatted response |
| **⑬** | Executor → Memory | Save conversation |
| **⑭** | Executor → `server.js` | Final AI response |
| **⑮** | `server.js` → Frontend | HTTP JSON response |
| **⑯** | Frontend → User | Rendered AI answer |


### Novelty Statement
> **"We introduced an agentic AI pipeline that interprets user intent, fetches news contextually, generates AI summaries locally, and maintains conversation memory—all without external API calls."**

#### Limitations & Future Work
| **Limitation** | **Future Solution** |
|---|---|
| Rule-based planner | **LLM-based tool selection** (V2) |
| Session memory only | **Persistent storage using PostgreSQL/Redis** (V2) |
| No personalization | **User preferences + recommendation engine** (V2) |
| Local only | **Deploy with Vercel + AWS for Ollama** (V2) |
| No AI-powered search | **Embedding-based semantic search** (V2) |
| No sentiment analysis | **Fine-tuned RoBERTa for bias/sentiment analysis** (V2) |

#### Comparison with Existing Projects
| **Project** | **Similarity** | **Difference** |
|---|---|---|
| **NewsLens (GitHub)** | AI news summarization | Uses cloud APIs; our system runs **locally** |
| **PerspectiveAI** | Bias detection | Uses RoBERTa; ours uses **Llama 3.2** |
| **Inshorts** | 60-word summaries | No AI; ours is **AI-generated** |
| **The Sun** | Concise news | Static; ours is **dynamic and interactive** |

## Future Roadmap 
| **Feature** | **Description** | **Priority** |
|---|---|---|
| **LLM-based Tool Selection** | Replace the rule-based planner with an LLM-based approach | High |
| **Persistent Memory** | PostgreSQL/Redis for storing user preferences and context | High |
| **AI-powered News Search** | Embedding-based semantic search | Medium |
| **Multi-language AI Responses** | Generate AI responses in Hindi, Tamil, and other languages | Medium |
| **Sentiment Analysis** | Fine-tuned RoBERTa for bias and sentiment detection | Medium |
| **Personalized Recommendations** | Recommendations based on reading history and preferences | Medium |
| **Trending Topics Dashboard** | Real-time trend detection and visualization | Low |
| **Voice Chat with AI** | Speech-to-text and text-to-speech integration | Low |
| **Export AI Summaries** | Export summaries as PDF or Word documents | Low |
| **Deployment** | Deploy using Vercel and AWS for Ollama | **Critical** |
