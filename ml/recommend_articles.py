import os

from dotenv import load_dotenv
from pymongo import MongoClient
from qdrant_client import QdrantClient

load_dotenv()

# -----------------------------
# MongoDB
# -----------------------------

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

mongo_client = MongoClient(MONGO_URI)

db = mongo_client[MONGO_DB_NAME]

user_profiles = db["userprofiles"]

# -----------------------------
# Qdrant
# -----------------------------

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)

COLLECTION_NAME = "article_embeddings"

USER_ID = "demo-user"

# -----------------------------
# Get user vector
# -----------------------------

profile = user_profiles.find_one({
    "userId": USER_ID
})

if not profile:
    print("User profile not found.")
    mongo_client.close()
    exit()

user_vector = profile.get("preferenceVector", [])

if len(user_vector) != 384:
    print(
        f"Invalid user vector size: {len(user_vector)}"
    )
    mongo_client.close()
    exit()

print("User vector loaded!")
print("Vector size:", len(user_vector))

# -----------------------------
# Search Qdrant
# -----------------------------

results = qdrant_client.query_points(
    collection_name=COLLECTION_NAME,
    query=user_vector,
    limit=10,
).points

print("\nPersonalized recommendations:\n")

for index, result in enumerate(results, start=1):

    payload = result.payload

    print(
        f"{index}. "
        f"Score: {result.score:.4f} | "
        f"Category: {payload.get('category')} | "
        f"Title: {payload.get('title')}"
    )

mongo_client.close()