import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

client = MongoClient(MONGO_URI)

db = client[MONGO_DB_NAME]

articles = db["articles"]
interactions = db["interactions"]

user_id = "demo-user"

user_interactions = list(
    interactions.find({
        "userId": user_id
    })
)

for interaction in user_interactions:

    article_id = interaction.get("articleId")

    article = articles.find_one({
        "articleId": article_id
    })

    print("\nArticle ID:", article_id)
    print("Event:", interaction.get("event"))

    if article:
        print("Article FOUND")
        print("Title:", article.get("title"))
        print("Category:", article.get("category"))
    else:
        print("Article NOT FOUND in MongoDB")

client.close()