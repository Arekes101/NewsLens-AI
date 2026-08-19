import os
import hashlib

from dotenv import load_dotenv
from pymongo import MongoClient
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct
from sentence_transformers import SentenceTransformer

load_dotenv()

# -----------------------------
# MongoDB
# -----------------------------

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

mongo_client = MongoClient(MONGO_URI)
db = mongo_client[MONGO_DB_NAME]

articles_collection = db["articles"]

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
# Embedding model
# -----------------------------

print("Loading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Embedding model loaded!")

# -----------------------------
# Get articles
# -----------------------------

articles = list(articles_collection.find({}))

print(f"Found {len(articles)} articles.")

points = []

for article in articles:

    article_id = article.get("articleId")

    title = article.get("title", "")
    description = article.get("description", "")

    if not article_id:
        print("Skipping article without articleId")
        continue

    # Combine title + description
    text = f"{title}. {description}"

    # Generate embedding
    embedding = model.encode(text).tolist()

    # Qdrant point IDs must be integers or UUIDs.
    # Convert articleId into a stable UUID-like integer.
    point_id = int(
        hashlib.md5(article_id.encode()).hexdigest()[:15],
        16,
    )

    points.append(
        PointStruct(
            id=point_id,
            vector=embedding,
            payload={
                "articleId": article_id,
                "title": title,
                "category": article.get("category", ""),
                "source": article.get("source", ""),
                "publishedAt": article.get("publishedAt", ""),
            },
        )
    )

print(f"Generated {len(points)} embeddings.")

# -----------------------------
# Upload to Qdrant
# -----------------------------

if points:
    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=points,
    )

print(f"Uploaded {len(points)} articles to Qdrant!")

# -----------------------------
# Close MongoDB
# -----------------------------

mongo_client.close()

print("Done!")