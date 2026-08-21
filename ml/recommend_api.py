import os
import sys
import json

from dotenv import load_dotenv
from pymongo import MongoClient
from qdrant_client import QdrantClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

USER_ID = sys.argv[1]

mongo_client = MongoClient(MONGO_URI)
db = mongo_client[MONGO_DB_NAME]

profile = db["userprofiles"].find_one({
    "userId": USER_ID
})

if not profile:
    print(json.dumps({
        "success": False,
        "message": "User profile not found"
    }))
    sys.exit(1)

user_vector = profile.get("preferenceVector", [])

if len(user_vector) != 384:
    print(json.dumps({
        "success": False,
        "message": "Invalid user vector"
    }))
    sys.exit(1)

qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)

results = qdrant_client.query_points(
    collection_name="article_embeddings",
    query=user_vector,
    limit=10,
).points

recommendations = []

for result in results:

    payload = result.payload

    recommendations.append({
        "articleId": payload.get("articleId"),
        "title": payload.get("title"),
        "category": payload.get("category"),
        "source": payload.get("source"),
        "publishedAt": payload.get("publishedAt"),
        "score": result.score,
    })

print(json.dumps({
    "success": True,
    "userId": USER_ID,
    "recommendations": recommendations
}))