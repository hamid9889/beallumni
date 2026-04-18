from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone, timedelta

# Import local modules
from models import (
    UserCreate, UserLogin, User, UserInDB, UserProfile,
    PostCreate, Post, CommentCreate,
    ConnectionRequest, Connection,
    MessageCreate, Message,
    JobCreate, Job, JobApplicationCreate, JobApplication,
    PlacementQuestionCreate, PlacementQuestion,
    PlacementSubmissionCreate, PlacementSubmission,
    AIQuestionCreate, AIQuestion
)
from auth import verify_password, get_password_hash, create_access_token
from dependencies import get_current_user

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Utility function to serialize datetime for MongoDB
def serialize_datetime(obj):
    if isinstance(obj, dict):
        return {k: serialize_datetime(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_datetime(item) for item in obj]
    elif isinstance(obj, datetime):
        return obj.isoformat()
    return obj

# ==================== AUTH ROUTES ====================
@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.model_dump(exclude={'password'})
    user = UserInDB(
        **user_dict,
        hashed_password=hashed_password,
        is_verified=True
    )
    
    final_user_dict = serialize_datetime(user.model_dump())
    await db.users.insert_one(final_user_dict)
    
    # Create token
    token = create_access_token({"user_id": user.id, "email": user.email})
    
    return {
        "message": "User created successfully",
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_verified": user.is_verified
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    # Find user
    user_data = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(credentials.password, user_data['hashed_password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    token = create_access_token({"user_id": user_data['id'], "email": user_data['email']})
    
    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user_data['id'],
            "email": user_data['email'],
            "full_name": user_data['full_name'],
            "is_verified": user_data['is_verified']
        }
    }

@api_router.get("/auth/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    user_data = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0, "hashed_password": 0})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert ISO string timestamps back to datetime
    if isinstance(user_data.get('created_at'), str):
        user_data['created_at'] = datetime.fromisoformat(user_data['created_at'])
    
    return user_data

@api_router.put("/auth/profile")
async def update_profile(profile_data: UserProfile, current_user: dict = Depends(get_current_user)):
    update_data = profile_data.model_dump(exclude={'id', 'created_at', 'is_verified'})
    
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$set": update_data}
    )
    
    return {"message": "Profile updated successfully"}

# ==================== FEED/POSTS ROUTES ====================
@api_router.get("/posts", response_model=List[Post])
async def get_posts():
    posts = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Convert ISO strings back to datetime
    for post in posts:
        if isinstance(post.get('created_at'), str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
    
    return posts

@api_router.post("/posts", response_model=Post)
async def create_post(post_data: PostCreate, current_user: dict = Depends(get_current_user)):
    # Get user info
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    
    post = Post(
        user_id=current_user['user_id'],
        user_name=user['full_name'],
        user_profile_picture=user.get('profile_picture', ''),
        content=post_data.content,
        image_url=post_data.image_url
    )
    
    post_dict = serialize_datetime(post.model_dump())
    await db.posts.insert_one(post_dict)
    
    return post

@api_router.post("/posts/{post_id}/like")
async def like_post(post_id: str, current_user: dict = Depends(get_current_user)):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    likes = post.get('likes', [])
    
    if current_user['user_id'] in likes:
        # Unlike
        await db.posts.update_one(
            {"id": post_id},
            {"$pull": {"likes": current_user['user_id']}}
        )
        return {"message": "Post unliked", "liked": False}
    else:
        # Like
        await db.posts.update_one(
            {"id": post_id},
            {"$push": {"likes": current_user['user_id']}}
        )
        return {"message": "Post liked", "liked": True}

@api_router.post("/posts/{post_id}/comment")
async def add_comment(post_id: str, comment_data: CommentCreate, current_user: dict = Depends(get_current_user)):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Get user info
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    
    comment = {
        "user_id": current_user['user_id'],
        "user_name": user['full_name'],
        "comment": comment_data.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.posts.update_one(
        {"id": post_id},
        {"$push": {"comments": comment}}
    )
    
    return {"message": "Comment added successfully", "comment": comment}

# ==================== ALUMNI NETWORK ROUTES ====================
@api_router.get("/alumni/search")
async def search_alumni(query: str = "", current_user: dict = Depends(get_current_user)):
    if query:
        users = await db.users.find(
            {
                "id": {"$ne": current_user['user_id']},
                "$or": [
                    {"full_name": {"$regex": query, "$options": "i"}},
                    {"company": {"$regex": query, "$options": "i"}},
                    {"skills": {"$regex": query, "$options": "i"}}
                ]
            },
            {"_id": 0, "hashed_password": 0}
        ).to_list(50)
    else:
        users = await db.users.find(
            {"id": {"$ne": current_user['user_id']}},
            {"_id": 0, "hashed_password": 0}
        ).to_list(50)
    
    return users

@api_router.post("/alumni/connect")
async def send_connection_request(request_data: ConnectionRequest, current_user: dict = Depends(get_current_user)):
    # Check if connection already exists
    existing = await db.connections.find_one({
        "$or": [
            {"from_user_id": current_user['user_id'], "to_user_id": request_data.to_user_id},
            {"from_user_id": request_data.to_user_id, "to_user_id": current_user['user_id']}
        ]
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Connection request already exists")
    
    connection = Connection(
        from_user_id=current_user['user_id'],
        to_user_id=request_data.to_user_id,
        status="accepted"  # Auto-accept for simplicity
    )
    
    conn_dict = serialize_datetime(connection.model_dump())
    await db.connections.insert_one(conn_dict)
    
    return {"message": "Connected successfully", "connection": connection}

@api_router.get("/alumni/connections")
async def get_connections(current_user: dict = Depends(get_current_user)):
    connections = await db.connections.find(
        {
            "$or": [
                {"from_user_id": current_user['user_id']},
                {"to_user_id": current_user['user_id']}
            ],
            "status": "accepted"
        },
        {"_id": 0}
    ).to_list(100)
    
    # Get user details for each connection
    result = []
    for conn in connections:
        other_user_id = conn['to_user_id'] if conn['from_user_id'] == current_user['user_id'] else conn['from_user_id']
        user = await db.users.find_one({"id": other_user_id}, {"_id": 0, "hashed_password": 0})
        if user:
            result.append(user)
    
    return result

# ==================== CHAT ROUTES ====================
@api_router.post("/chat/send")
async def send_message(message_data: MessageCreate, current_user: dict = Depends(get_current_user)):
    message = Message(
        from_user_id=current_user['user_id'],
        to_user_id=message_data.to_user_id,
        message=message_data.message
    )
    
    msg_dict = serialize_datetime(message.model_dump())
    await db.messages.insert_one(msg_dict)
    
    return {"message": "Message sent", "data": message}

@api_router.get("/chat/messages/{other_user_id}")
async def get_messages(other_user_id: str, current_user: dict = Depends(get_current_user)):
    messages = await db.messages.find(
        {
            "$or": [
                {"from_user_id": current_user['user_id'], "to_user_id": other_user_id},
                {"from_user_id": other_user_id, "to_user_id": current_user['user_id']}
            ]
        },
        {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    
    # Convert ISO strings back to datetime
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    
    # Mark messages as read
    await db.messages.update_many(
        {"from_user_id": other_user_id, "to_user_id": current_user['user_id']},
        {"$set": {"is_read": True}}
    )
    
    return messages

# ==================== JOBS ROUTES ====================
@api_router.get("/jobs", response_model=List[Job])
async def get_jobs():
    jobs = await db.jobs.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for job in jobs:
        if isinstance(job.get('created_at'), str):
            job['created_at'] = datetime.fromisoformat(job['created_at'])
    
    return jobs

@api_router.post("/jobs", response_model=Job)
async def create_job(job_data: JobCreate, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    
    job = Job(
        **job_data.model_dump(),
        posted_by=current_user['user_id'],
        posted_by_name=user['full_name']
    )
    
    job_dict = serialize_datetime(job.model_dump())
    await db.jobs.insert_one(job_dict)
    
    return job

@api_router.post("/jobs/{job_id}/apply")
async def apply_job(job_id: str, application_data: JobApplicationCreate, current_user: dict = Depends(get_current_user)):
    # Check if already applied
    existing = await db.job_applications.find_one({
        "job_id": job_id,
        "user_id": current_user['user_id']
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    
    application = JobApplication(
        job_id=job_id,
        user_id=current_user['user_id'],
        user_name=user['full_name'],
        user_email=user['email'],
        cover_letter=application_data.cover_letter,
        resume_url=application_data.resume_url
    )
    
    app_dict = serialize_datetime(application.model_dump())
    await db.job_applications.insert_one(app_dict)
    
    return {"message": "Application submitted successfully", "application": application}

@api_router.get("/jobs/my-applications")
async def get_my_applications(current_user: dict = Depends(get_current_user)):
    applications = await db.job_applications.find(
        {"user_id": current_user['user_id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Get job details for each application
    result = []
    for app in applications:
        job = await db.jobs.find_one({"id": app['job_id']}, {"_id": 0})
        if job:
            app['job_details'] = job
        result.append(app)
    
    return result

# ==================== PLACEMENT ROUTES ====================
@api_router.get("/placement/questions", response_model=List[PlacementQuestion])
async def get_placement_questions(category: Optional[str] = None, company: Optional[str] = None):
    query = {}
    if category:
        query['category'] = category
    if company:
        query['company'] = {"$regex": company, "$options": "i"}
    
    questions = await db.placement_questions.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for q in questions:
        if isinstance(q.get('created_at'), str):
            q['created_at'] = datetime.fromisoformat(q['created_at'])
    
    return questions

@api_router.post("/placement/questions", response_model=PlacementQuestion)
async def create_placement_question(question_data: PlacementQuestionCreate, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    
    question = PlacementQuestion(
        **question_data.model_dump(),
        posted_by=current_user['user_id'],
        posted_by_name=user['full_name']
    )
    
    q_dict = serialize_datetime(question.model_dump())
    await db.placement_questions.insert_one(q_dict)
    
    return question

@api_router.post("/placement/questions/{question_id}/like")
async def like_question(question_id: str, current_user: dict = Depends(get_current_user)):
    question = await db.placement_questions.find_one({"id": question_id}, {"_id": 0})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    likes = question.get('likes', [])
    
    if current_user['user_id'] in likes:
        await db.placement_questions.update_one(
            {"id": question_id},
            {"$pull": {"likes": current_user['user_id']}}
        )
        return {"message": "Question unliked", "liked": False}
    else:
        await db.placement_questions.update_one(
            {"id": question_id},
            {"$push": {"likes": current_user['user_id']}}
        )
        return {"message": "Question liked", "liked": True}

@api_router.post("/placement/questions/{question_id}/save")
async def save_question(question_id: str, current_user: dict = Depends(get_current_user)):
    question = await db.placement_questions.find_one({"id": question_id}, {"_id": 0})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    saved_by = question.get('saved_by', [])
    
    if current_user['user_id'] in saved_by:
        await db.placement_questions.update_one(
            {"id": question_id},
            {"$pull": {"saved_by": current_user['user_id']}}
        )
        return {"message": "Question removed from saved", "saved": False}
    else:
        await db.placement_questions.update_one(
            {"id": question_id},
            {"$push": {"saved_by": current_user['user_id']}}
        )
        return {"message": "Question saved", "saved": True}

@api_router.get("/placement/saved-questions")
async def get_saved_questions(current_user: dict = Depends(get_current_user)):
    questions = await db.placement_questions.find(
        {"saved_by": current_user['user_id']},
        {"_id": 0}
    ).to_list(100)
    
    return questions

@api_router.post("/placement/submit", response_model=PlacementSubmission)
async def submit_placement_experience(submission_data: PlacementSubmissionCreate, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    
    submission = PlacementSubmission(
        user_id=current_user['user_id'],
        user_name=user['full_name'],
        **submission_data.model_dump()
    )
    
    sub_dict = serialize_datetime(submission.model_dump())
    await db.placement_submissions.insert_one(sub_dict)
    
    return submission

@api_router.get("/placement/submissions", response_model=List[PlacementSubmission])
async def get_placement_submissions():
    submissions = await db.placement_submissions.find(
        {"is_public": True},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    for sub in submissions:
        if isinstance(sub.get('created_at'), str):
            sub['created_at'] = datetime.fromisoformat(sub['created_at'])
    
    return submissions

# ==================== AI ASSISTANT ROUTES ====================
@api_router.post("/ai/ask")
async def ask_ai(question_data: AIQuestionCreate, current_user: dict = Depends(get_current_user)):
    try:
        q = question_data.question.lower()
        response = ""
        
        # 1. Check for Internships (more specific than jobs)
        if "intern" in q:
            items = await db.jobs.find({"$or": [{"title": {"$regex": "intern", "$options": "i"}}, {"description": {"$regex": "intern", "$options": "i"}}]}, {"_id": 0}).limit(3).to_list(3)
            if items:
                response = "I found these internship opportunities for you:\n" + "\n".join([f"• {j['title']} at {j['company']} ({j['location']})" for j in items])
            else:
                response = "I couldn't find any specific internship posts right now. Keep an eye on the Jobs section!"
        
        # 2. Check for Jobs
        elif "job" in q or "work" in q or "vacancy" in q:
            items = await db.jobs.find({"$or": [{"title": {"$regex": "job", "$options": "i"}}, {"description": {"$regex": "job", "$options": "i"}}]}, {"_id": 0}).limit(3).to_list(3)
            if items:
                response = "Here are some job openings I found:\n" + "\n".join([f"• {j['title']} at {j['company']} ({j['location']})" for j in items])
            else:
                response = "There are no new job postings at the moment. You can try searching for 'internships' too."

        # 3. Check for Alumni
        elif "alumni" in q or "senior" in q or "member" in q:
            items = await db.users.find({"company": {"$exists": True, "$ne": ""}}, {"_id": 0, "full_name": 1, "company": 1}).limit(5).to_list(5)
            if items:
                response = "Our alumni are working at great companies! Here are a few:\n" + "\n".join([f"• {u['full_name']} is at {u['company']}" for u in items])
            else:
                response = "We have a large network of alumni. You can search for them in the Alumni tab."

        # 4. Check for Placement
        elif "placement" in q or "interview" in q or "salary" in q:
            items = await db.placement_submissions.find({}, {"_id": 0}).limit(3).to_list(3)
            if items:
                response = "Check out these placement experiences shared by our community:\n" + "\n".join([f"• {p['user_name']} placed at {p['company']} ({p['salary']})" for p in items])
            else:
                response = "No placement experiences shared yet. You can check the Placement tab for interview questions!"

        # 5. Check for Posts/Feed
        elif "post" in q or "feed" in q or "news" in q:
            items = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).limit(3).to_list(3)
            if items:
                response = "Recent updates from the feed:\n" + "\n".join([f"• {p['user_name']}: {p['content'][:50]}..." for p in items])
            else:
                response = "The feed is quiet right now. Why not share something?"

        else:
            response = "I am your Alumni Assistant. You can ask me about jobs, internships, alumni members, or placement experiences! For example, try asking 'Are there any jobs?'"
        
        # Save to database
        ai_record = AIQuestion(
            user_id=current_user['user_id'],
            question=question_data.question,
            context=question_data.context,
            answer=response
        )
        
        ai_dict = serialize_datetime(ai_record.model_dump())
        await db.ai_questions.insert_one(ai_dict)
        
        return {"answer": response, "question_id": ai_record.id}
        
    except Exception as e:
        logger.error(f"AI Assistant error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@api_router.get("/ai/history")
async def get_ai_history(current_user: dict = Depends(get_current_user)):
    history = await db.ai_questions.find(
        {"user_id": current_user['user_id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return history

# ==================== ROOT ROUTE ====================
@api_router.get("/")
async def root():
    return {"message": "Alumni & Placement Platform API is running!"}

# Include router in main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
