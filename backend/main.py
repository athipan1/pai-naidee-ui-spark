"""
FastAPI backend for PaiNaiDee travel community post creation.
Includes authentication, media upload, and post management.
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
import uuid
import os
import shutil
import json
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import aiofiles
import asyncio
from PIL import Image
import io

# Initialize FastAPI app
app = FastAPI(
    title="PaiNaiDee Community API",
    description="API for travel community post creation and management",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "https://pai-naidee-ui-spark.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/mov", "video/avi"}

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/images", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/videos", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/thumbnails", exist_ok=True)

# Data Models
class LocationTag(BaseModel):
    id: str
    name: str
    province: str
    region: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None

class AccommodationTag(BaseModel):
    id: str
    name: str
    type: str = Field(..., regex="^(hotel|resort|hostel|guesthouse|homestay)$")
    location: LocationTag

class CreatePostRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    location: Optional[LocationTag] = None
    accommodation: Optional[AccommodationTag] = None
    tags: List[str] = Field(default=[], max_items=10)
    privacy: str = Field(default="public", regex="^(public|friends|private)$")
    
    @validator('content')
    def content_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Content cannot be empty')
        return v.strip()
    
    @validator('tags')
    def validate_tags(cls, v):
        if len(v) > 10:
            raise ValueError('Maximum 10 tags allowed')
        # Clean and validate tags
        cleaned_tags = []
        for tag in v:
            cleaned_tag = tag.strip().lower()
            if cleaned_tag and len(cleaned_tag) <= 50 and cleaned_tag not in cleaned_tags:
                cleaned_tags.append(cleaned_tag)
        return cleaned_tags

class PostResponse(BaseModel):
    id: str
    user_id: str
    content: str
    images: List[str] = []
    videos: List[str] = []
    location: Optional[LocationTag] = None
    accommodation: Optional[AccommodationTag] = None
    tags: List[str] = []
    privacy: str
    created_at: datetime
    updated_at: datetime

class DraftRequest(BaseModel):
    content: Optional[str] = None
    location: Optional[LocationTag] = None
    accommodation: Optional[AccommodationTag] = None
    tags: List[str] = Field(default=[])
    privacy: str = Field(default="public")

class User(BaseModel):
    id: str
    username: str
    email: str
    is_active: bool = True

# Mock user database (in production, use a real database)
fake_users_db = {
    "testuser": {
        "id": "user123",
        "username": "testuser",
        "email": "test@example.com",
        "hashed_password": pwd_context.hash("testpass123"),
        "is_active": True
    }
}

# Mock posts database (in production, use a real database)
posts_db = []
drafts_db = {}

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(username: str):
    if username in fake_users_db:
        user_dict = fake_users_db[username]
        return User(**user_dict)

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, fake_users_db[username]["hashed_password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = get_user(username=username)
    if user is None:
        raise credentials_exception
    return user

# Utility functions
def validate_file_type(file: UploadFile, allowed_types: set) -> bool:
    return file.content_type in allowed_types

def validate_file_size(file: UploadFile, max_size: int) -> bool:
    # This is a basic check - in production you'd want to stream and check size
    return True  # Simplified for demo

async def save_uploaded_file(file: UploadFile, subfolder: str) -> str:
    """Save uploaded file and return the file path"""
    file_extension = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, subfolder, unique_filename)
    
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    return f"/{subfolder}/{unique_filename}"

async def create_thumbnail(image_path: str) -> str:
    """Create a thumbnail for uploaded images"""
    try:
        full_path = os.path.join(UPLOAD_DIR, image_path.lstrip('/'))
        thumbnail_name = f"thumb_{os.path.basename(image_path)}"
        thumbnail_path = os.path.join(UPLOAD_DIR, "thumbnails", thumbnail_name)
        
        with Image.open(full_path) as img:
            img.thumbnail((300, 300), Image.Resampling.LANCZOS)
            img.save(thumbnail_path, optimize=True, quality=85)
        
        return f"/thumbnails/{thumbnail_name}"
    except Exception as e:
        print(f"Error creating thumbnail: {e}")
        return image_path  # Return original if thumbnail creation fails

# API Endpoints

@app.get("/")
async def root():
    return {
        "message": "PaiNaiDee Community API",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.post("/api/auth/login")
async def login(username: str = Form(...), password: str = Form(...)):
    """Authenticate user and return access token"""
    user = authenticate_user(username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }

@app.post("/api/media/upload")
async def upload_media(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload images and videos for posts"""
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed")
    
    uploaded_files = []
    
    for file in files:
        # Validate file size
        if not validate_file_size(file, MAX_FILE_SIZE):
            raise HTTPException(
                status_code=400, 
                detail=f"File {file.filename} is too large (max {MAX_FILE_SIZE // (1024*1024)}MB)"
            )
        
        # Determine file type and validate
        is_image = validate_file_type(file, ALLOWED_IMAGE_TYPES)
        is_video = validate_file_type(file, ALLOWED_VIDEO_TYPES)
        
        if not (is_image or is_video):
            raise HTTPException(
                status_code=400, 
                detail=f"File {file.filename} has unsupported format"
            )
        
        try:
            # Save file
            subfolder = "images" if is_image else "videos"
            file_path = await save_uploaded_file(file, subfolder)
            
            file_info = {
                "id": str(uuid.uuid4()),
                "filename": file.filename,
                "path": file_path,
                "type": "image" if is_image else "video",
                "size": len(await file.read()),
                "content_type": file.content_type
            }
            
            # Create thumbnail for images
            if is_image:
                file_info["thumbnail"] = await create_thumbnail(file_path)
            
            uploaded_files.append(file_info)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload {file.filename}: {str(e)}")
    
    return {
        "message": f"Successfully uploaded {len(uploaded_files)} files",
        "files": uploaded_files
    }

@app.post("/api/posts", response_model=PostResponse)
async def create_post(
    post_data: CreatePostRequest,
    images: Optional[List[str]] = None,
    videos: Optional[List[str]] = None,
    current_user: User = Depends(get_current_user)
):
    """Create a new travel post"""
    
    # Validate that at least content or media is provided
    if not post_data.content.strip() and not (images or videos):
        raise HTTPException(
            status_code=400,
            detail="Post must contain either content or media"
        )
    
    # Create post
    post_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    new_post = {
        "id": post_id,
        "user_id": current_user.id,
        "content": post_data.content,
        "images": images or [],
        "videos": videos or [],
        "location": post_data.location.dict() if post_data.location else None,
        "accommodation": post_data.accommodation.dict() if post_data.accommodation else None,
        "tags": post_data.tags,
        "privacy": post_data.privacy,
        "created_at": now,
        "updated_at": now,
        "likes": 0,
        "comments": 0,
        "shares": 0
    }
    
    # Save to database (in production, use a real database)
    posts_db.append(new_post)
    
    # Remove any draft for this user
    if current_user.id in drafts_db:
        del drafts_db[current_user.id]
    
    return PostResponse(**new_post)

@app.post("/api/posts/draft")
async def save_draft(
    draft_data: DraftRequest,
    current_user: User = Depends(get_current_user)
):
    """Save a post draft"""
    
    draft = {
        "user_id": current_user.id,
        "content": draft_data.content,
        "location": draft_data.location.dict() if draft_data.location else None,
        "accommodation": draft_data.accommodation.dict() if draft_data.accommodation else None,
        "tags": draft_data.tags,
        "privacy": draft_data.privacy,
        "saved_at": datetime.utcnow()
    }
    
    drafts_db[current_user.id] = draft
    
    return {
        "message": "Draft saved successfully",
        "draft_id": current_user.id,
        "saved_at": draft["saved_at"]
    }

@app.get("/api/posts/draft")
async def get_draft(current_user: User = Depends(get_current_user)):
    """Get user's saved draft"""
    
    if current_user.id not in drafts_db:
        raise HTTPException(status_code=404, detail="No draft found")
    
    draft = drafts_db[current_user.id]
    
    # Check if draft is not too old (24 hours)
    saved_at = draft["saved_at"]
    if datetime.utcnow() - saved_at > timedelta(hours=24):
        del drafts_db[current_user.id]
        raise HTTPException(status_code=404, detail="Draft has expired")
    
    return draft

@app.get("/api/posts")
async def get_posts(
    page: int = 1,
    limit: int = 20,
    privacy: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get posts feed"""
    
    # Filter posts based on privacy and user access
    filtered_posts = []
    for post in posts_db:
        if privacy and post["privacy"] != privacy:
            continue
        
        # Privacy filtering logic
        if post["privacy"] == "private" and post["user_id"] != current_user.id:
            continue
        # Add friends check here if you have a friends system
        
        filtered_posts.append(post)
    
    # Sort by creation date (newest first)
    filtered_posts.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Pagination
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_posts = filtered_posts[start_idx:end_idx]
    
    return {
        "posts": paginated_posts,
        "page": page,
        "limit": limit,
        "total": len(filtered_posts),
        "has_next": end_idx < len(filtered_posts)
    }

@app.get("/api/posts/{post_id}")
async def get_post(
    post_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific post"""
    
    post = next((p for p in posts_db if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check privacy
    if post["privacy"] == "private" and post["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return post

@app.delete("/api/posts/{post_id}")
async def delete_post(
    post_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a post"""
    
    post_index = next((i for i, p in enumerate(posts_db) if p["id"] == post_id), None)
    if post_index is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post = posts_db[post_index]
    
    # Check ownership
    if post["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own posts")
    
    # Remove post
    del posts_db[post_index]
    
    return {"message": "Post deleted successfully"}

# Health check
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)