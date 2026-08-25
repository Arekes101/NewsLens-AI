import os
import math

from datetime import datetime, timezone

from dotenv import load_dotenv
from pymongo import MongoClient
from qdrant_client import QdrantClient

load_dotenv()


# =============================
# CONFIG
# =============================

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

USER_ID = "demo-user"

COLLECTION_NAME = "article_embeddings"


# =============================
# EVENT WEIGHTS
# Same as interestService.js
# =============================

EVENT_WEIGHTS = {
    "view": 0,
    "click": 1,
    "read": 3,
    "like": 8,
    "save": 10,
    "share": 10,
    "ai_summary": 4,
    "ai_chat": 6,
}


# =============================
# MONGODB
# =============================

mongo_client = MongoClient(MONGO_URI)

db = mongo_client[MONGO_DB_NAME]

interactions_collection = db["interactions"]
articles_collection = db["articles"]


# =============================
# USER INTERESTS
# =============================

interactions = interactions_collection.find({
    "userId": USER_ID
})

interests = {}


for interaction in interactions:

    article = articles_collection.find_one({
        "articleId": interaction.get("articleId")
    })

    if not article:
        continue

    category = article.get("category")

    if not category:
        continue

    event = interaction.get("event")

    event_weight = EVENT_WEIGHTS.get(
        event,
        0
    )

    if event_weight == 0:
        continue

    created_at = interaction.get("createdAt")

    if not created_at:
        continue

    # MongoDB usually returns a datetime object
    if isinstance(created_at, datetime):

        interaction_time = created_at

        if interaction_time.tzinfo is None:
            interaction_time = interaction_time.replace(
                tzinfo=timezone.utc
            )

    else:

        interaction_time = datetime.fromisoformat(
            str(created_at).replace(
                "Z",
                "+00:00"
            )
        )

    now = datetime.now(timezone.utc)

    age_in_days = (
        now - interaction_time
    ).total_seconds() / (
        1000 * 60 * 60 * 24
    )

    # Same exponential decay as interestService.js
    recency_factor = math.exp(
        -0.1 * age_in_days
    )

    score = (
        event_weight
        * recency_factor
    )

    category = category.lower()

    interests[category] = (
        interests.get(category, 0)
        + score
    )


# =============================
# NORMALIZE INTERESTS
# =============================

sorted_interests = sorted(
    interests.items(),
    key=lambda x: x[1],
    reverse=True
)

total_score = sum(
    score
    for _, score in sorted_interests
)

user_interests = []

for topic, score in sorted_interests:

    percentage = (
        (score / total_score) * 100
        if total_score > 0
        else 0
    )

    user_interests.append({
        "topic": topic,
        "score": round(score, 4),
        "percentage": round(
            percentage,
            2
        )
    })


print("User interests:")

for interest in user_interests:

    print(
        f"{interest['topic']} → "
        f"{interest['percentage']}%"
    )


# =============================
# USER PROFILE
# =============================

user_profiles = db["userprofiles"]

profile = user_profiles.find_one({
    "userId": USER_ID
})

if not profile:

    print("\nUser profile not found.")
    mongo_client.close()
    exit()


user_vector = profile.get(
    "preferenceVector",
    []
)

if len(user_vector) != 384:

    print(
        "\nInvalid user vector size:",
        len(user_vector)
    )

    mongo_client.close()
    exit()


# =============================
# QDRANT
# =============================

qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY
)


results = qdrant_client.query_points(
    collection_name=COLLECTION_NAME,
    query=user_vector,
    limit=10
).points


print(
    f"\nFound {len(results)} candidates."
)


# =============================
# INTEREST SCORE
# =============================

def get_interest_score(
    category
):

    if not category:
        return 0

    category = category.lower()

    for interest in user_interests:

        if interest["topic"] == category:

            return (
                interest["percentage"]
                / 100
            )

    return 0


# =============================
# RECENCY SCORE
# =============================

def get_recency_score(
    published_at
):

    if not published_at:
        return 0

    try:

        published = datetime.strptime(
            published_at,
            "%Y-%m-%d %H:%M:%S"
        ).replace(
            tzinfo=timezone.utc
        )

        now = datetime.now(
            timezone.utc
        )

        age_hours = (
            now - published
        ).total_seconds() / 3600

        score = 1 / (
            1 + age_hours / 24
        )

        return max(
            0,
            min(1, score)
        )

    except Exception:

        return 0


# =============================
# RANK CANDIDATES
# =============================

ranked = []


for result in results:

    payload = result.payload

    semantic_score = result.score

    category = payload.get(
        "category"
    )

    published_at = payload.get(
        "publishedAt"
    )

    interest_score = (
        get_interest_score(category)
    )

    recency = get_recency_score(
        published_at
    )

    final_score = (
        0.60 * semantic_score
        + 0.25 * interest_score
        + 0.15 * recency
    )

    ranked.append({

        "articleId":
            payload.get("articleId"),

        "title":
            payload.get("title"),

        "category":
            category,

        "source":
            payload.get("source"),

        "publishedAt":
            published_at,

        "semanticScore":
            semantic_score,

        "interestScore":
            interest_score,

        "recencyScore":
            recency,

        "finalScore":
            final_score
    })


# =============================
# SORT
# =============================

ranked.sort(
    key=lambda article:
        article["finalScore"],
    reverse=True
)


# =============================
# DISPLAY
# =============================

print(
    "\nRanked recommendations:\n"
)


for index, article in enumerate(
    ranked,
    start=1
):

    print(
        f"{index}. "
        f"Final: {article['finalScore']:.4f} | "
        f"Semantic: {article['semanticScore']:.4f} | "
        f"Interest: {article['interestScore']:.4f} | "
        f"Recency: {article['recencyScore']:.4f} | "
        f"Category: {article['category']} | "
        f"{article['title']}"
    )


mongo_client.close()