import os

from dotenv import load_dotenv
from pymongo import MongoClient
from qdrant_client import QdrantClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

USER_ID = "demo-user"

mongo_client = MongoClient(MONGO_URI)
db = mongo_client[MONGO_DB_NAME]

interactions = db["interactions"]
user_profiles = db["userprofiles"]

qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)

# --------------------------------
# Get current user vector
# --------------------------------

profile = user_profiles.find_one({
    "userId": USER_ID
})

if not profile:
    print("User profile not found.")
    exit()

old_vector = profile.get(
    "preferenceVector",
    []
)

print("Current vector size:", len(old_vector))

# --------------------------------
# Get current interactions
# --------------------------------

user_interactions = list(
    interactions.find({
        "userId": USER_ID
    })
)

print(
    "Current interactions:",
    len(user_interactions)
)

# --------------------------------
# Event weights
# --------------------------------

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

# --------------------------------
# Find vectors for interactions
# --------------------------------

vectors = []
weights = []

for interaction in user_interactions:

    event = interaction.get("event")

    weight = EVENT_WEIGHTS.get(
        event,
        0
    )

    if weight == 0:
        continue

    article_id = interaction.get(
        "articleId"
    )

    if not article_id:
        continue
# Get all stored article vectors
    points = qdrant_client.scroll(
        collection_name="article_embeddings",
        limit=100,
        with_vectors=True,
        with_payload=True,
    )[0]

    vector = None

    for point in points:
        if point.payload.get("articleId") == article_id:
            vector = point.vector
            break

    if vector is None:
        print(
            "Skipping: no vector found for",
            article_id
        )
        continue

    if vector is None:
        continue

    vectors.append(vector)
    weights.append(weight)

print(
    "Valid interaction vectors:",
    len(vectors)
)

# --------------------------------
# Generate new vector
# --------------------------------

if not vectors:

    print(
        "No valid vectors found."
    )

    exit()


vector_size = len(vectors[0])

new_vector = [0.0] * vector_size

total_weight = sum(weights)

for vector, weight in zip(
    vectors,
    weights
):

    for i in range(vector_size):

        new_vector[i] += (
            vector[i] * weight
        )


for i in range(vector_size):

    new_vector[i] /= total_weight


# --------------------------------
# Compare vectors
# --------------------------------

difference = 0.0

for old, new in zip(
    old_vector,
    new_vector
):

    difference += abs(
        old - new
    )


print("\nFeedback loop test")

print(
    "Old vector first 5:",
    old_vector[:5]
)

print(
    "New vector first 5:",
    new_vector[:5]
)

print(
    "Total vector difference:",
    difference
)

if difference > 0.000001:

    print(
        "\nUser representation changed!"
    )

else:

    print(
        "\nUser representation did not change."
    )


mongo_client.close()