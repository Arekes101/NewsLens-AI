import os
import sys
import json
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

USER_ID = sys.argv[1]
OFFSET = int(sys.argv[2]) if len(sys.argv) > 2 else 0
LIMIT = int(sys.argv[3]) if len(sys.argv) > 3 else 10

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

user_profiles = db["userprofiles"]


# =============================
# GET USER VECTOR
# =============================

profile = user_profiles.find_one({
    "userId": USER_ID
})

if not profile or not profile.get("preferenceVector"):
    # Dynamically generate user profile vector from interactions
    user_rep_script = os.path.join(os.path.dirname(__file__), "user_representation.py")
    os.system(f'"{sys.executable}" "{user_rep_script}" "{USER_ID}"')
    profile = user_profiles.find_one({"userId": USER_ID})

if not profile or not profile.get("preferenceVector"):
    # If user still has 0 valid interactions, return friendly message
    print(json.dumps({
        "success": True,
        "recommendations": [],
        "message": "No recommendations available yet. Interact with a few articles first!"
    }))
    sys.exit(0)

user_vector = profile.get("preferenceVector", [])

if len(user_vector) != 384:

    print(json.dumps({
        "success": False,
        "message": "Invalid user vector"
    }))

    sys.exit(1)


# =============================
# CALCULATE USER INTERESTS
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

    created_at = interaction.get(
        "createdAt"
    )

    if not created_at:
        continue

    # MongoDB datetime
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
        60 * 60 * 24
    )

    # Same decay as interestService.js
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
    key=lambda item: item[1],
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


# =============================
# INTEREST SCORE
# =============================

def get_interest_score(category):

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

def get_recency_score(published_at):

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
# QDRANT
# =============================

qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)


results = qdrant_client.query_points(
    collection_name=COLLECTION_NAME,
    query=user_vector,
    limit=OFFSET + LIMIT + 20,
).points


# =============================
# RANK RESULTS
# =============================

ranked = []


for result in results:

    payload = result.payload

    semantic_score = result.score

    article_id = payload.get("articleId")

    article_doc = articles_collection.find_one({"articleId": article_id}) if article_id else None

    category = payload.get("category") or (article_doc.get("category") if article_doc else "")

    published_at = payload.get("publishedAt") or (article_doc.get("publishedAt") if article_doc else "")

    interest_score = get_interest_score(category)

    recency_score = get_recency_score(published_at)

    # Sprint 8 ranking formula
    final_score = (
        0.60 * semantic_score
        + 0.25 * interest_score
        + 0.15 * recency_score
    )

    image = (article_doc.get("image") if article_doc else "") or payload.get("image") or ""
    description = (article_doc.get("description") if article_doc else "") or payload.get("description") or ""
    url = (article_doc.get("url") if article_doc else "") or payload.get("url") or ""
    title = payload.get("title") or (article_doc.get("title") if article_doc else "")
    source = payload.get("source") or (article_doc.get("source") if article_doc else "")

    ranked.append({
        "articleId": article_id,
        "title": title,
        "description": description,
        "image": image,
        "url": url,
        "category": category,
        "source": source,
        "publishedAt": published_at,
        "score": final_score,
        "semanticScore": semantic_score,
        "interestScore": interest_score,
        "recencyScore": recency_score
    })


# =============================
# SORT & PAGINATE
# =============================

ranked.sort(
    key=lambda article:
        article["score"],
    reverse=True
)

paginated_ranked = ranked[OFFSET:OFFSET + LIMIT]


# =============================
# RESPONSE
# =============================

print(json.dumps({

    "success": True,

    "userId": USER_ID,

    "recommendations": paginated_ranked

}))