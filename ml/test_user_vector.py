import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

client = MongoClient(MONGO_URI)

db = client[MONGO_DB_NAME]

user_profiles = db["userprofiles"]

USER_ID = "demo-user"

profile = user_profiles.find_one({
    "userId": USER_ID
})

if not profile:
    print("User profile not found.")
else:
    vector = profile.get("preferenceVector", [])

    print("User profile found!")
    print("User:", USER_ID)
    print("Vector size:", len(vector))
    print("First 5 values:", vector[:5])

client.close()