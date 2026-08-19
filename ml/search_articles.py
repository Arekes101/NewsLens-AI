import os

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)

model = SentenceTransformer("all-MiniLM-L6-v2")

query = "healthcare medicine medical research"

query_vector = model.encode(query).tolist()

results = client.query_points(
    collection_name="article_embeddings",
    query=query_vector,
    limit=5,
).points

print("\nTop semantic matches:\n")

for result in results:
    print(
        f"Score: {result.score:.4f} | "
        f"Category: {result.payload.get('category')} | "
        f"Title: {result.payload.get('title')}"
    )