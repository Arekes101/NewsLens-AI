import os
import sys
import numpy as np
from datetime import datetime, timezone
from dotenv import load_dotenv
from pymongo import MongoClient
from qdrant_client import QdrantClient

from qdrant_utils import article_id_to_point_id

load_dotenv()

# -----------------------------
# User ID
# -----------------------------

USER_ID = sys.argv[1] if len(sys.argv) > 1 else "demo-user"

# -----------------------------
# MongoDB
# -----------------------------

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

mongo_client = MongoClient(MONGO_URI)

db = mongo_client[MONGO_DB_NAME]

interactions_collection = db["interactions"]

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

# -----------------------------
# Interaction weights
# -----------------------------

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

# -----------------------------
# Get interactions
# -----------------------------

interactions = list(
    interactions_collection.find({
        "userId": USER_ID
    })
)

print(
    f"Found {len(interactions)} interactions"
)

weighted_vectors = []
weights = []

# -----------------------------
# Get article vectors
# -----------------------------

for interaction in interactions:

    article_id = interaction.get("articleId")
    event = interaction.get("event")

    weight = EVENT_WEIGHTS.get(event, 0)

    if weight <= 0:
        continue

    point_id = article_id_to_point_id(article_id)

    results = qdrant_client.retrieve(
        collection_name=COLLECTION_NAME,
        ids=[point_id],
        with_vectors=True,
    )

    if not results:
        print(
            f"Skipping: no vector for {article_id}"
        )
        continue

    vector = np.array(results[0].vector)

    weighted_vectors.append(
        vector * weight
    )

    weights.append(weight)

    print(
        f"Using: {article_id} | "
        f"{event} | weight={weight}"
    )

# -----------------------------
# Calculate user vector
# -----------------------------

if not weighted_vectors:

    print(
        "No valid interactions found."
    )

    mongo_client.close()
    exit()

user_vector = (
    np.sum(weighted_vectors, axis=0)
    / sum(weights)
)

# Normalize the vector

norm = np.linalg.norm(user_vector)

if norm > 0:
    user_vector = user_vector / norm

print("\nUser vector generated!")

print(
    "Vector size:",
    len(user_vector)
)

print(
    "First 5 values:",
    user_vector[:5]
)

print(
    "Total interaction weight:",
    sum(weights)
)

# -----------------------------
# Save user vector to MongoDB
# -----------------------------

user_profiles_collection = db["userprofiles"]

user_profiles_collection.update_one(
    {
        "userId": USER_ID
    },
    {
        "$set": {
            "preferenceVector":
                user_vector.tolist(),

            "vectorUpdatedAt":
                datetime.now(timezone.utc),
        }
    },
    upsert=True,
)

print(
    "User vector saved to MongoDB!"
)

mongo_client.close()