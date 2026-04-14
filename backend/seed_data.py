import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path
from auth import get_password_hash
from datetime import datetime, timezone
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_data():
    print("Seeding database...")
    
    # Create sample users
    users_data = [
        {
            "id": str(uuid.uuid4()),
            "email": "john@example.com",
            "full_name": "John Doe",
            "hashed_password": get_password_hash("password123"),
            "bio": "Software Engineer at Google",
            "skills": ["Python", "JavaScript", "React"],
            "graduation_year": 2020,
            "company": "Google",
            "designation": "Software Engineer",
            "profile_picture": "",
            "is_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "jane@example.com",
            "full_name": "Jane Smith",
            "hashed_password": get_password_hash("password123"),
            "bio": "Product Manager at Microsoft",
            "skills": ["Product Management", "Agile", "Data Analysis"],
            "graduation_year": 2019,
            "company": "Microsoft",
            "designation": "Product Manager",
            "profile_picture": "",
            "is_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "demo@example.com",
            "full_name": "Demo User",
            "hashed_password": get_password_hash("demo123"),
            "bio": "Alumni Network Member",
            "skills": ["Full Stack Development", "Cloud Computing"],
            "graduation_year": 2021,
            "company": "Amazon",
            "designation": "Full Stack Developer",
            "profile_picture": "",
            "is_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Clear existing data
    await db.users.delete_many({})
    await db.posts.delete_many({})
    await db.jobs.delete_many({})
    await db.placement_questions.delete_many({})
    await db.placement_submissions.delete_many({})
    
    await db.users.insert_many(users_data)
    print(f"Created {len(users_data)} users")
    
    # Create sample jobs
    jobs_data = [
        {
            "id": str(uuid.uuid4()),
            "title": "Senior Software Engineer",
            "company": "Google",
            "location": "Bangalore, India",
            "job_type": "Full-time",
            "description": "Looking for an experienced software engineer to join our team working on cutting-edge cloud technologies.",
            "requirements": ["5+ years experience", "Strong Python/Java skills", "Cloud platforms experience"],
            "salary_range": "25-35 LPA",
            "posted_by": users_data[0]["id"],
            "posted_by_name": users_data[0]["full_name"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Product Manager Intern",
            "company": "Microsoft",
            "location": "Hyderabad, India",
            "job_type": "Internship",
            "description": "6-month internship program for aspiring product managers to work on real products.",
            "requirements": ["Final year student", "Good communication skills", "Passion for technology"],
            "salary_range": "50,000/month",
            "posted_by": users_data[1]["id"],
            "posted_by_name": users_data[1]["full_name"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Frontend Developer",
            "company": "Amazon",
            "location": "Mumbai, India",
            "job_type": "Full-time",
            "description": "Join our e-commerce team to build amazing user experiences.",
            "requirements": ["React expertise", "3+ years experience", "Strong CSS/HTML skills"],
            "salary_range": "15-20 LPA",
            "posted_by": users_data[2]["id"],
            "posted_by_name": users_data[2]["full_name"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.jobs.insert_many(jobs_data)
    print(f"Created {len(jobs_data)} jobs")
    
    # Create sample placement questions
    questions_data = [
        {
            "id": str(uuid.uuid4()),
            "title": "Reverse a Linked List",
            "description": "Write a function to reverse a singly linked list iteratively and recursively.",
            "company": "Google",
            "category": "Technical",
            "difficulty": "Medium",
            "posted_by": users_data[0]["id"],
            "posted_by_name": users_data[0]["full_name"],
            "likes": [],
            "saved_by": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Tell me about yourself",
            "description": "How to effectively answer this common HR interview question?",
            "company": "Microsoft",
            "category": "HR",
            "difficulty": "Easy",
            "posted_by": users_data[1]["id"],
            "posted_by_name": users_data[1]["full_name"],
            "likes": [],
            "saved_by": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "System Design: Design Instagram",
            "description": "Design a photo-sharing platform like Instagram with feed, stories, and messaging.",
            "company": "Amazon",
            "category": "Technical",
            "difficulty": "Hard",
            "posted_by": users_data[2]["id"],
            "posted_by_name": users_data[2]["full_name"],
            "likes": [],
            "saved_by": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Aptitude: Time and Work Problems",
            "description": "If A can complete a work in 10 days and B in 15 days, how many days will they take together?",
            "company": "TCS",
            "category": "Aptitude",
            "difficulty": "Easy",
            "posted_by": users_data[0]["id"],
            "posted_by_name": users_data[0]["full_name"],
            "likes": [],
            "saved_by": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.placement_questions.insert_many(questions_data)
    print(f"Created {len(questions_data)} placement questions")
    
    # Create sample placement submissions
    submissions_data = [
        {
            "id": str(uuid.uuid4()),
            "user_id": users_data[0]["id"],
            "user_name": users_data[0]["full_name"],
            "company": "Google",
            "position": "Software Engineer",
            "salary": "28 LPA",
            "experience": "The interview process was very smooth. Started with online coding test, followed by 4 technical rounds and 1 HR round.",
            "interview_process": "Round 1: DSA (2 coding questions), Round 2: System Design, Round 3: Problem Solving, Round 4: Behavioral",
            "tips": "Focus on data structures and algorithms. Practice on LeetCode. Be clear in your communication during system design rounds.",
            "is_public": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": users_data[1]["id"],
            "user_name": users_data[1]["full_name"],
            "company": "Microsoft",
            "position": "Product Manager",
            "salary": "32 LPA",
            "experience": "Great experience overall. They really focus on product sense and analytical thinking.",
            "interview_process": "Product case study, Data analysis round, Leadership principles round, Bar raiser round",
            "tips": "Read 'Cracking the PM Interview'. Practice case studies. Show your passion for products.",
            "is_public": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.placement_submissions.insert_many(submissions_data)
    print(f"Created {len(submissions_data)} placement submissions")
    
    # Create sample posts
    posts_data = [
        {
            "id": str(uuid.uuid4()),
            "user_id": users_data[0]["id"],
            "user_name": users_data[0]["full_name"],
            "user_profile_picture": "",
            "content": "Just completed 1 year at Google! It's been an amazing journey of learning and growth. Grateful to our alumni network for all the guidance!",
            "image_url": "",
            "likes": [],
            "comments": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": users_data[1]["id"],
            "user_name": users_data[1]["full_name"],
            "user_profile_picture": "",
            "content": "Excited to announce that I'll be speaking at a webinar on 'Breaking into Product Management'. DM me if you're interested!",
            "image_url": "",
            "likes": [],
            "comments": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": users_data[2]["id"],
            "user_name": users_data[2]["full_name"],
            "user_profile_picture": "",
            "content": "Pro tip for freshers: Build projects and showcase them on GitHub. It makes a huge difference in interviews!",
            "image_url": "",
            "likes": [],
            "comments": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.posts.insert_many(posts_data)
    print(f"Created {len(posts_data)} posts")
    
    print("\nDatabase seeded successfully!")
    print("\nTest Credentials:")
    print("Email: demo@example.com")
    print("Password: demo123")
    print("\nOther test users:")
    print("- john@example.com (password: password123)")
    print("- jane@example.com (password: password123)")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
