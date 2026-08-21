const BASE_URL = "http://localhost:5000/api";

const USER_ID = "demo-user";

const newsContainer = document.getElementById("newsContainer");
const loader = document.getElementById("loader");

const aiResponse = document.getElementById("aiResponse");
const aiOutput = document.getElementById("aiOutput");
const aiCloseBtn = document.getElementById("aiCloseBtn");

aiCloseBtn.addEventListener("click", () => {
    aiResponse.classList.add("hidden");
});

const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const countrySelect = document.getElementById("countrySelect");
const languageSelect = document.getElementById("languageSelect");

const loadNewsBtn = document.getElementById("loadNewsBtn");
const searchBtn = document.getElementById("searchBtn");
const dailyBriefBtn = document.getElementById("dailyBriefBtn");

const controlsSection = document.getElementById("controlsSection");

const latestTabBtn = document.getElementById("latestTabBtn");
const forYouTabBtn = document.getElementById("forYouTabBtn");

const forYouHead = document.getElementById("forYouHead");
const forYouSubtitle = document.getElementById("forYouSubtitle");
const refreshForYouBtn = document.getElementById("refreshForYouBtn");
const forYouState = document.getElementById("forYouState");

let articles = [];
let recommendations = [];

let currentView = "latest"; // "latest" | "forYou"

/* ------------------------
   HELPERS
-------------------------*/

function showLoader() {
    loader.classList.remove("hidden");
}

function hideLoader() {
    loader.classList.add("hidden");
}

function showAI(text) {
    aiResponse.classList.remove("hidden");
    aiOutput.textContent = text;
}

// Articles from /api/news may or may not carry a stable id.
// Recommendations always carry articleId. Fall back to the url,
// and finally the title, so every card can still be tracked.
function getArticleId(article) {
    return (
        article.articleId ||
        article.id ||
        article._id ||
        article.url ||
        article.title ||
        null
    );
}

function setActiveTab(view) {
    currentView = view;

    latestTabBtn.classList.toggle("active", view === "latest");
    forYouTabBtn.classList.toggle("active", view === "forYou");

    controlsSection.classList.toggle("hidden", view !== "latest");
    forYouHead.classList.toggle("hidden", view !== "forYou");
}

/* ------------------------
   INTERACTIONS
-------------------------*/

async function sendInteraction(articleId, event, duration) {

    if (!articleId) return;

    const body = { userId: USER_ID, articleId, event };

    if (typeof duration === "number") {
        body.duration = duration;
    }

    try {

        await fetch(`${BASE_URL}/interactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

    } catch (err) {

        // Interaction tracking failing shouldn't interrupt reading.
        console.log("interaction failed:", err);

    }

}

/* ------------------------
   VIEW + READ DURATION TRACKING
-------------------------*/

const viewedArticles = new Set();
const readStartTimes = new Map();

const cardObserver = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        const card = entry.target;
        const articleId = card.dataset.articleId;

        if (!articleId) return;

        if (entry.isIntersecting) {

            if (!viewedArticles.has(articleId)) {
                viewedArticles.add(articleId);
                sendInteraction(articleId, "view");
            }

            readStartTimes.set(articleId, Date.now());

        } else {

            const startTime = readStartTimes.get(articleId);

            if (startTime) {

                const duration = Math.round((Date.now() - startTime) / 1000);

                readStartTimes.delete(articleId);

                if (duration >= 5) {
                    sendInteraction(articleId, "read", duration);
                }

            }

        }

    });

}, { threshold: 0.5 });

/* ------------------------
   AI ENDPOINTS
-------------------------*/

async function summarize(text, articleId) {

    const res = await fetch(`${BASE_URL}/ai/summarize`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            text
        })

    });

    const data = await res.json();

    showAI(data.summary);

    sendInteraction(articleId, "ai_summary");

}

async function explain(text) {

    const res = await fetch(`${BASE_URL}/ai/explain`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            text
        })

    });

    const data = await res.json();

    showAI(data.explanation);

}

async function keypoints(text) {

    const res = await fetch(`${BASE_URL}/ai/keypoints`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            text
        })

    });

    const data = await res.json();

    showAI(data.keypoints);

}

async function sentiment(text) {

    const res = await fetch(`${BASE_URL}/ai/sentiment`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            text
        })

    });

    const data = await res.json();

    showAI(data.sentiment);

}

async function chat(text, question, articleId) {

    const res = await fetch(`${BASE_URL}/ai/chat`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            text,
            question
        })

    });

    const data = await res.json();

    showAI(data.answer);

    sendInteraction(articleId, "ai_chat");

}

async function dailyBrief() {

    const res = await fetch(`${BASE_URL}/ai/daily-brief`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            articles
        })

    });

    const data = await res.json();

    showAI(data.brief);

}

/* ------------------------
   NEWS FETCH
-------------------------*/

async function fetchNews(url) {

    showLoader();

    try {

        const res = await fetch(url);

        const data = await res.json();

        articles = data.articles || [];

        renderNews();

    } catch (err) {

        alert("Failed to fetch news.");

        console.log(err);

    } finally {

        hideLoader();

    }

}

/* ------------------------
   CARD BUILDING (shared by Latest + For You)
-------------------------*/

function buildCard(article, opts) {

    const isRecommendation = !!(opts && opts.isRecommendation);

    const card = document.createElement("div");

    card.className = "card";

    const articleId = getArticleId(article);

    if (articleId) {
        card.dataset.articleId = articleId;
    }

    const image = article.image
        ? article.image
        : "https://placehold.co/600x350?text=No+Image";

    const hasUrl = !!article.url;

    card.innerHTML = `

        <img src="${image}" alt="news">

        <div class="card-content">

            <div class="meta">

                <span>${article.source ?? ""}</span>

                <span>${article.publishedAt ?? ""}</span>

            </div>

            <h2>${article.title}</h2>

            <p>${article.description ?? "No description available."}</p>

            ${hasUrl ? `
            <a href="${article.url}"
               target="_blank"
               class="readLink">
               Read Full Article
            </a>
            ` : ""}

            ${isRecommendation && typeof article.score === "number" ? `
            <div class="score-badge">Match score: ${article.score}</div>
            ` : ""}

            <div class="buttons">

                <button class="summaryBtn">
                    Summarize
                </button>

                <button class="explainBtn">
                    Explain
                </button>

                <button class="keypointsBtn">
                    Key Points
                </button>

                <button class="sentimentBtn">
                    Sentiment
                </button>

                <button class="askBtn">
                    Ask AI
                </button>

                <button class="likeBtn">
                    ♡ Like
                </button>

                <button class="saveBtn">
                    ☆ Save
                </button>

                <button class="shareBtn">
                    ↗ Share
                </button>

            </div>

            <div class="chat-box">

                <input
                    class="questionInput"
                    placeholder="Ask about this story..."
                >

                <button class="chatBtn">

                    Ask

                </button>

            </div>

        </div>

    `;

    const text = `

Title:
${article.title}

Description:
${article.description ?? ""}

`;

    card.querySelector(".summaryBtn")
        .addEventListener("click", () => {

            summarize(text, articleId);

        });

    card.querySelector(".explainBtn")
        .addEventListener("click", () => {

            explain(text);

        });

    card.querySelector(".keypointsBtn")
        .addEventListener("click", () => {

            keypoints(text);

        });

    card.querySelector(".sentimentBtn")
        .addEventListener("click", () => {

            sentiment(text);

        });

    card.querySelector(".chatBtn")
        .addEventListener("click", () => {

            const question =
                card.querySelector(".questionInput").value;

            if (!question) {

                alert("Enter a question.");

                return;
            }

            chat(text, question, articleId);

        });

    // Chat box reveals on hover for pointer devices via CSS.
    // This toggle covers touch/keyboard users who can't hover.
    card.querySelector(".askBtn")
        .addEventListener("click", () => {

            const isOpen = card.classList.toggle("chat-open");

            if (isOpen) {

                card.querySelector(".questionInput").focus();

            }

        });

    // Like

    card.querySelector(".likeBtn")
        .addEventListener("click", async (e) => {

            const btn = e.currentTarget;

            await sendInteraction(articleId, "like");

            btn.classList.add("active");
            btn.textContent = "♥ Liked";

        });

    // Save

    card.querySelector(".saveBtn")
        .addEventListener("click", async (e) => {

            const btn = e.currentTarget;

            await sendInteraction(articleId, "save");

            btn.classList.add("active");
            btn.textContent = "★ Saved";

        });

    // Share

    card.querySelector(".shareBtn")
        .addEventListener("click", async () => {

            sendInteraction(articleId, "share");

            if (navigator.share && hasUrl) {

                try {
                    await navigator.share({
                        title: article.title,
                        url: article.url
                    });
                } catch (err) {
                    // user cancelled share — nothing to do
                }

            } else if (hasUrl) {

                try {
                    await navigator.clipboard.writeText(article.url);
                    alert("Link copied to clipboard.");
                } catch (err) {
                    console.log(err);
                }

            }

        });

    // Click on "Read Full Article"

    if (hasUrl) {

        card.querySelector(".readLink")
            .addEventListener("click", () => {

                sendInteraction(articleId, "click");

            });

    }

    if (articleId) {
        cardObserver.observe(card);
    }

    return card;

}

/* ------------------------
   RENDER: LATEST NEWS
-------------------------*/

function renderNews() {

    newsContainer.innerHTML = "";

    if (articles.length === 0) {

        newsContainer.innerHTML = "<p class='empty-state'>No news found</p>";

        return;
    }

    articles.forEach((article) => {

        const card = buildCard(article, { isRecommendation: false });

        newsContainer.appendChild(card);

    });

}

/* ------------------------
   RENDER: FOR YOU
-------------------------*/

function showForYouState(html, isError) {

    forYouState.innerHTML = html;
    forYouState.classList.remove("hidden");
    forYouState.classList.toggle("error", !!isError);

    newsContainer.innerHTML = "";

}

function hideForYouState() {

    forYouState.classList.add("hidden");
    forYouState.innerHTML = "";

}

function renderRecommendations() {

    newsContainer.innerHTML = "";

    if (recommendations.length === 0) {

        showForYouState(
            "Your personalized feed is being built.<br>Read, like, or save a few articles to personalize it."
        );

        return;
    }

    hideForYouState();

    recommendations.forEach((rec) => {

        const card = buildCard(rec, { isRecommendation: true });

        newsContainer.appendChild(card);

    });

}

async function loadPersonalized() {

    showLoader();
    hideForYouState();
    newsContainer.innerHTML = "";

    try {

        const res = await fetch(
            `${BASE_URL}/recommendations/personalized/${USER_ID}`
        );

        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();

        recommendations = data.recommendations || [];

        renderRecommendations();

    } catch (err) {

        console.log(err);

        recommendations = [];

        showForYouState(
            `Couldn't load your personalized feed.<br><button class="retry-btn" id="forYouRetryBtn">Try again</button>`,
            true
        );

        const retryBtn = document.getElementById("forYouRetryBtn");

        if (retryBtn) {
            retryBtn.addEventListener("click", loadPersonalized);
        }

    } finally {

        hideLoader();

    }

}

/* ------------------------
   TAB SWITCHING
-------------------------*/

latestTabBtn.addEventListener("click", () => {

    if (currentView === "latest") return;

    setActiveTab("latest");

    hideForYouState();

    renderNews();

});

forYouTabBtn.addEventListener("click", () => {

    if (currentView === "forYou") {
        return;
    }

    setActiveTab("forYou");

    if (recommendations.length > 0) {
        renderRecommendations();
    } else {
        loadPersonalized();
    }

});

refreshForYouBtn.addEventListener("click", () => {

    loadPersonalized();

});

/* ------------------------
   BUTTON EVENTS
-------------------------*/

loadNewsBtn.addEventListener("click", () => {

    let url = `${BASE_URL}/news`;

    const category = categorySelect.value;
    const country = countrySelect.value;
    const language = languageSelect.value;

    if (category) {
        url = `${BASE_URL}/news/category/${category}`;
    }
    else if (country) {
        url = `${BASE_URL}/news/country/${country}`;
    }
    else if (language) {
        url = `${BASE_URL}/news/language/${language}`;
    }

    fetchNews(url);

});


searchBtn.addEventListener("click", () => {

    const query = searchInput.value.trim();

    if (!query) {

        alert("Enter something to search.");

        return;

    }

    fetchNews(`${BASE_URL}/news/search?q=${encodeURIComponent(query)}`);

});


dailyBriefBtn.addEventListener("click", () => {

    if (articles.length === 0) {

        alert("Load some news first.");

        return;

    }

    dailyBrief();

});


/* ------------------------
   ENTER TO SEARCH
-------------------------*/

searchInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        searchBtn.click();

    }

});


/* ------------------------
   INITIAL LOAD
-------------------------*/

window.onload = () => {

    setActiveTab("latest");

    fetchNews(`${BASE_URL}/news`);

};