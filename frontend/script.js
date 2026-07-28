const BASE_URL = "http://localhost:5000/api";

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

let articles = [];

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

async function summarize(text){

    const res=await fetch(`${BASE_URL}/ai/summarize`,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            text
        })

    });

    const data=await res.json();

    showAI(data.summary);

}

async function explain(text){

    const res=await fetch(`${BASE_URL}/ai/explain`,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            text
        })

    });

    const data=await res.json();

    showAI(data.explanation);

}

async function keypoints(text){

    const res=await fetch(`${BASE_URL}/ai/keypoints`,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            text
        })

    });

    const data=await res.json();

    showAI(data.keypoints);

}

async function sentiment(text){

    const res=await fetch(`${BASE_URL}/ai/sentiment`,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            text
        })

    });

    const data=await res.json();

    showAI(data.sentiment);

}

async function chat(text,question){

    const res=await fetch(`${BASE_URL}/ai/chat`,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            text,
            question
        })

    });

    const data=await res.json();

    showAI(data.answer);

}

async function dailyBrief(){

    const res=await fetch(`${BASE_URL}/ai/daily-brief`,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            articles
        })

    });

    const data=await res.json();

    showAI(data.brief);

}

function renderNews() {

    newsContainer.innerHTML = "";

    if (articles.length === 0) {

        newsContainer.innerHTML = "<p class='empty-state'>No news found</p>";

        return;
    }

    articles.forEach((article, index) => {

        const card = document.createElement("div");

        card.className = "card";

        const image = article.image
            ? article.image
            : "https://placehold.co/600x350?text=No+Image";

        card.innerHTML = `
        
            <img src="${image}" alt="news">

            <div class="card-content">

                <div class="meta">

                    <span>${article.source}</span>

                    <span>${article.publishedAt}</span>

                </div>

                <h2>${article.title}</h2>

                <p>${article.description ?? "No description available."}</p>

                <a href="${article.url}"
                   target="_blank">
                   Read Full Article
                </a>

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

        newsContainer.appendChild(card);

        const text = `

Title:
${article.title}

Description:
${article.description}

`;

        card.querySelector(".summaryBtn")
            .addEventListener("click", () => {

                summarize(text);

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

                chat(text, question);

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

    fetchNews(`${BASE_URL}/news`);

};