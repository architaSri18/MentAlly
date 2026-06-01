from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/mental_health_db")
client = MongoClient(MONGO_URI)
db = client.get_default_database()

# Collections
users = db.users
mood_logs = db.mood_logs
chats = db.chats
habits = db.habits
tasks = db.tasks
assessments = db.assessments
breathing_logs = db.breathing_logs
emergency_contacts = db.emergency_contacts

def get_db():
    return db
