import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

async def test_mongo():
    load_dotenv(Path('.') / '.env')
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    print(f"Connecting to {mongo_url}...")
    try:
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=2000)
        await client.admin.command('ping')
        print("MongoDB is running and reachable!")
        db_name = os.environ.get('DB_NAME', 'allumni_db')
        db = client[db_name]
        user = await db.users.find_one({"email": "demo@example.com"})
        if user:
            print(f"User demo@example.com found! ID: {user['id']}")
        else:
            print("User demo@example.com NOT found. Please run seed_data.py")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_mongo())
