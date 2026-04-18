from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid

# User Models
class UserBase(BaseModel):
    email: str
    full_name: str
    bio: Optional[str] = ""
    skills: Optional[List[str]] = []
    graduation_year: Optional[int] = None
    company: Optional[str] = ""
    designation: Optional[str] = ""
    profile_picture: Optional[str] = ""
    college: Optional[str] = ""
    branch: Optional[str] = ""
    course: Optional[str] = ""
    passing_year: Optional[int] = None
    current_year: Optional[int] = None
    gender: Optional[str] = ""
    mobile_number: Optional[str] = ""

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    college: Optional[str] = ""
    branch: Optional[str] = ""
    course: Optional[str] = ""
    passing_year: Optional[int] = None
    current_year: Optional[int] = None
    gender: Optional[str] = ""
    mobile_number: Optional[str] = ""

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserInDB(User):
    hashed_password: str

class UserProfile(UserBase):
    id: str
    is_verified: bool
    created_at: datetime

# Post Models
class PostCreate(BaseModel):
    content: str
    image_url: Optional[str] = ""

class Post(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_profile_picture: Optional[str] = ""
    content: str
    image_url: Optional[str] = ""
    likes: List[str] = []  # List of user IDs who liked
    comments: List[dict] = []  # List of {user_id, user_name, comment, created_at}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CommentCreate(BaseModel):
    comment: str

# Connection Models
class ConnectionRequest(BaseModel):
    to_user_id: str

class Connection(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_user_id: str
    to_user_id: str
    status: str = "pending"  # pending, accepted, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Message Models
class MessageCreate(BaseModel):
    to_user_id: str
    message: str

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_user_id: str
    to_user_id: str
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Job Models
class JobCreate(BaseModel):
    title: str
    company: str
    location: str
    job_type: str  # Full-time, Part-time, Internship
    description: str
    requirements: List[str]
    salary_range: Optional[str] = ""

class Job(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    company: str
    location: str
    job_type: str
    description: str
    requirements: List[str]
    salary_range: Optional[str] = ""
    posted_by: str  # user_id
    posted_by_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JobApplicationCreate(BaseModel):
    job_id: str
    cover_letter: str
    resume_url: Optional[str] = ""

class JobApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    user_id: str
    user_name: str
    user_email: str
    cover_letter: str
    resume_url: Optional[str] = ""
    status: str = "pending"  # pending, reviewed, shortlisted, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Placement Models
class PlacementQuestionCreate(BaseModel):
    title: str
    description: str
    company: str
    category: str  # Technical, HR, Aptitude, etc.
    difficulty: str  # Easy, Medium, Hard

class PlacementQuestion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    company: str
    category: str
    difficulty: str
    posted_by: str  # user_id
    posted_by_name: str
    likes: List[str] = []  # List of user IDs who liked
    saved_by: List[str] = []  # List of user IDs who saved
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PlacementSubmissionCreate(BaseModel):
    company: str
    position: str
    salary: str
    experience: str
    interview_process: str
    tips: str

class PlacementSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    company: str
    position: str
    salary: str
    experience: str
    interview_process: str
    tips: str
    is_public: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# AI Assistant Models
class AIQuestionCreate(BaseModel):
    question: str
    context: Optional[str] = ""

class AIQuestion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    question: str
    context: Optional[str] = ""
    answer: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
