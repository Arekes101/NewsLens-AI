import os

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)

COLLECTION_NAME = "article_embeddings"

# Create collection if it doesn't exist
existing_collections = client.get_collections().collections

collection_exists = any(
    collection.name == COLLECTION_NAME
    for collection in existing_collections
)

if not collection_exists:
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=384,
            distance=Distance.COSINE,
        ),
    )

    print(f"Created collection: {COLLECTION_NAME}")

# Load embedding model
print("Loading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Embedding model loaded!")

# Semantic search test

query = "new technology helps doctors"

query_embedding = model.encode(query).tolist()

search_results = client.query_points(
    collection_name=COLLECTION_NAME,
    query=query_embedding,
    limit=3,
).points

print("\nSemantic search results:")

for result in search_results:
    print(
        "Score:",
        result.score,
        "| Article:",
        result.payload.get("title"),
    )