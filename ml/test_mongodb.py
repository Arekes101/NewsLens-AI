import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)

db = client[os.getenv("MONGO_DB_NAME")]

articles = db["articles"]

print("Connected to MongoDB!")

count = articles.count_documents({})

print("Article count:", count)

article = articles.find_one()

if article:
    print("First article:")
    print(article.get("title"))
    print(article.get("category"))