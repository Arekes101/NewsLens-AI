const BASE_URL = (window.location.origin && window.location.origin.startsWith("http"))
    ? window.location.origin + "/api"
    : "http://localhost:5000/api";

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
const savedTabBtn = document.getElementById("savedTabBtn");
const refreshBtn = document.getElementById("refreshBtn");
const savedState = document.getElementById("savedState");

let articles = [];
let savedArticles = [];
let savedArticleIds = new Set();

let currentLatestUrl = `${BASE_URL}/news`;
let hasLoadedLatest = false;
let hasLoadedSaved = false;

let currentView = "latest"; // "latest" | "saved"

/* ------------------------
   HELPERS
-------------------------*/

function showLoader() {
    loader.classList.remove("hidden");
}

function hideLoader() {
    loader.classList.add("hidden");
}

function formatMarkdown(text) {
    if (!text) return "";

    let content = text;

    if (typeof text === "string" && (text.trim().startsWith("{") || text.trim().startsWith("["))) {
        try {
            const parsed = JSON.parse(text);
            if (parsed.summary && Array.isArray(parsed.summary)) content = parsed.summary.map(s => `* ${s}`).join("\n");
            else if (parsed.keypoints && Array.isArray(parsed.keypoints)) content = parsed.keypoints.map(k => `* ${k}`).join("\n");
            else if (parsed.explanation) content = parsed.explanation;
            else if (parsed.sentiment) content = `**Sentiment:** ${parsed.sentiment}\n\n**Reason:** ${parsed.reason || ""}`;
            else if (parsed.answer) content = parsed.answer;
            else if (parsed.brief) content = parsed.brief;
        } catch (e) {
            // Keep original string
        }
    }

    let html = content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        // Headings (###### down to #)
        .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
        .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
        .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        // Bullet points
        .replace(/^\s*[\*\-•]\s+(.*$)/gim, '<li>$1</li>')
        // Remove orphan or trailing single asterisks
        .replace(/^\s*\*+\s*$/gim, '')
        .replace(/([a-zA-Z0-9.,!?])\*/g, '$1')
        // Line breaks & paragraphs
        .replace(/\n\n+/g, '<br><br>')
        .replace(/\n/g, '<br>');

    return html.replace(/(<li>.*?<\/li>(?:<br>)?)+/gms, (match) => {
        return `<ul>${match.replace(/<br>/g, '')}</ul>`;
    });
}

function showAI(text) {
    aiResponse.classList.remove("hidden");
    aiOutput.innerHTML = formatMarkdown(text);
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
    savedTabBtn.classList.toggle("active", view === "saved");

    controlsSection.classList.toggle("hidden", view !== "latest");

    if (view !== "saved") hideSavedState();
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
    let currentArticles = articles;
    if (currentView === "saved" && savedArticles.length > 0) {
        currentArticles = savedArticles;
    } else if (currentArticles.length === 0) {
        currentArticles = savedArticles;
    }

    if (!currentArticles || currentArticles.length === 0) {
        alert("Load some news first.");
        return;
    }

    const res = await fetch(`${BASE_URL}/ai/daily-brief`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            articles: currentArticles
        })
    });

    const data = await res.json();
    showAI(data.brief);
}

/* ------------------------
   NEWS FETCH
-------------------------*/

async function fetchNews(url, opts) {
    opts = opts || {};
    const isBackgroundRefresh = !!(opts.forceRefresh && articles.length > 0);

    currentLatestUrl = url;

    if (!isBackgroundRefresh) {
        showLoader();
        hideSavedState();
        newsContainer.innerHTML = "";
    } else {
        if (refreshBtn) refreshBtn.classList.add("refreshing");
    }

    try {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Status ${res.status}`);
        }

        const data = await res.json();
        articles = data.articles || [];
        nextPageToken = data.nextPage || null;
        hasLoadedLatest = true;
        renderNews();

    } catch (err) {
        console.error("fetchNews failed:", err);
        if (!isBackgroundRefresh) {
            newsContainer.innerHTML = `
                <div class='empty-state'>
                    <p>Failed to fetch news (${err.message || "Network Error"}).</p>
                    <p style="font-size: 0.85rem; color: #666; margin-top: 6px;">Make sure your server is running on port 5000 ('npm start' in the server folder).</p>
                    <button class="retry-btn" id="newsRetryBtn" style="margin-top: 12px;">Try Again</button>
                </div>
            `;
            const retryBtn = document.getElementById("newsRetryBtn");
            if (retryBtn) {
                retryBtn.addEventListener("click", () => fetchNews(url));
            }
        }
    } finally {
        hideLoader();
        if (refreshBtn) refreshBtn.classList.remove("refreshing");
    }
}

/* ------------------------
   CARD BUILDING
-------------------------*/

function buildCard(article) {

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

    const isInitiallySaved = savedArticleIds.has(articleId);
    const saveBtn = card.querySelector(".saveBtn");
    if (isInitiallySaved) {
        saveBtn.classList.add("active");
        saveBtn.textContent = "★ Saved";
    }

    saveBtn.addEventListener("click", async (e) => {

        const btn = e.currentTarget;
        const currentlySaved = savedArticleIds.has(articleId);

        if (currentlySaved) {
            await removeArticleFromDB(articleId);
            btn.classList.remove("active");
            btn.textContent = "☆ Save";

            if (currentView === "saved") {
                card.remove();
                savedArticles = savedArticles.filter(a => (a.articleId || a.id || a.url || a._id) !== articleId);
                if (savedArticles.length === 0) {
                    showSavedState("You haven't saved any articles yet.<br>Click Save on any article card to bookmark it here.");
                }
            }
        } else {
            await saveArticleToDB(article);
            btn.classList.add("active");
            btn.textContent = "★ Saved";
        }

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

/* ------------------------
   RENDER: LATEST NEWS
-------------------------*/

function renderNews() {
    hideSavedState();
    newsContainer.innerHTML = "";

    if (articles.length === 0) {
        newsContainer.innerHTML = "<p class='empty-state'>No news found</p>";
        return;
    }

    articles.forEach((article) => {
        const card = buildCard(article);
        newsContainer.appendChild(card);
    });
}

/* ------------------------
   TAB SWITCHING
-------------------------*/

/* ------------------------
   SAVED ARTICLES API & RENDER
-------------------------*/

async function fetchSavedArticlesList() {
    try {
        const res = await fetch(`${BASE_URL}/saved/${USER_ID}`);
        if (!res.ok) return [];
        const data = await res.json();
        const list = data.articles || [];
        savedArticles = list;
        savedArticleIds = new Set(list.map(a => a.articleId));
        return list;
    } catch (err) {
        console.error("fetchSavedArticlesList error:", err);
        return [];
    }
}

async function saveArticleToDB(article) {
    const articleId = getArticleId(article);
    if (!articleId) return;

    try {
        await fetch(`${BASE_URL}/saved`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: USER_ID,
                articleId: articleId,
                title: article.title || "Untitled",
                description: article.description || "",
                image: article.image || "",
                url: article.url || "",
                source: article.source || "",
                publishedAt: article.publishedAt || ""
            })
        });
        savedArticleIds.add(articleId);
        sendInteraction(articleId, "save");
    } catch (err) {
        console.error("saveArticleToDB error:", err);
    }
}

async function removeArticleFromDB(articleId) {
    if (!articleId) return;
    try {
        await fetch(`${BASE_URL}/saved/${USER_ID}/${encodeURIComponent(articleId)}`, {
            method: "DELETE"
        });
        savedArticleIds.delete(articleId);
    } catch (err) {
        console.error("removeArticleFromDB error:", err);
    }
}

function showSavedState(html, isError) {
    savedState.innerHTML = html;
    savedState.classList.remove("hidden");
    savedState.classList.toggle("error", !!isError);
    newsContainer.innerHTML = "";
}

function hideSavedState() {
    savedState.innerHTML = "";
    savedState.classList.add("hidden");
}

function renderSavedArticles() {
    newsContainer.innerHTML = "";

    if (savedArticles.length === 0) {
        showSavedState("You haven't saved any articles yet.<br>Click Save on any article card to bookmark it here.");
        return;
    }

    hideSavedState();

    savedArticles.forEach((art) => {
        const card = buildCard(art);
        newsContainer.appendChild(card);
    });
}

async function loadSavedArticles(opts) {
    opts = opts || {};
    const isBackgroundRefresh = !!(opts.forceRefresh && savedArticles.length > 0);

    if (!isBackgroundRefresh) {
        showLoader();
        hideSavedState();
        newsContainer.innerHTML = "";
    } else {
        if (refreshBtn) refreshBtn.classList.add("refreshing");
    }

    try {
        await fetchSavedArticlesList();
        hasLoadedSaved = true;
        renderSavedArticles();
    } catch (err) {
        if (!isBackgroundRefresh) {
            showSavedState(`Couldn't load saved articles.<br><button class="retry-btn" id="savedRetryBtn">Try again</button>`, true);
            const retryBtn = document.getElementById("savedRetryBtn");
            if (retryBtn) retryBtn.addEventListener("click", loadSavedArticles);
        }
    } finally {
        hideLoader();
        if (refreshBtn) refreshBtn.classList.remove("refreshing");
    }
}

latestTabBtn.addEventListener("click", () => {
    const wasActive = currentView === "latest";
    setActiveTab("latest");
    if (wasActive || !hasLoadedLatest || articles.length === 0) {
        fetchNews(currentLatestUrl, { forceRefresh: wasActive });
    } else {
        renderNews();
    }
});

savedTabBtn.addEventListener("click", () => {
    const wasActive = currentView === "saved";
    setActiveTab("saved");
    if (wasActive || !hasLoadedSaved) {
        loadSavedArticles({ forceRefresh: wasActive });
    } else {
        renderSavedArticles();
    }
});

if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
        if (currentView === "latest") {
            fetchNews(currentLatestUrl, { forceRefresh: true });
        } else if (currentView === "saved") {
            loadSavedArticles({ forceRefresh: true });
        }
    });
}

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

    // Fetch saved article IDs in background to mark saved cards
    fetchSavedArticlesList();

    // Fetch latest news immediately
    fetchNews(`${BASE_URL}/news`);

};