from pydantic import BaseModel, Json
from typing import Optional, List, Dict, Any
from datetime import datetime

class User(BaseModel):
    id: str
    email: str

class Category(BaseModel):
    id: Optional[str]
    name: str
    slug: str
    description: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class Profile(BaseModel):
    id: str
    username: str
    avatar_url: Optional[str]
    bio: Optional[str]
    is_admin: Optional[bool]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class Post(BaseModel):
    id: Optional[str]
    title: str
    content: str
    slug: str
    author_id: str
    category_id: Optional[str]
    published: Optional[bool] = False
    thumbnail_url: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class Comment(BaseModel):
    id: Optional[str]
    content: str
    post_id: str
    user_id: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class SavedPost(BaseModel):
    id: Optional[str]
    post_id: str
    user_id: str
    created_at: Optional[datetime]

class WebsiteContent(BaseModel):
    id: Optional[str]
    page_name: str
    content: Dict[str, Any]
    updated_by: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class UserCreate(BaseModel):
    email: str
    password: str
    username: Optional[str] = None

class PostCreate(BaseModel):
    title: str
    content: str
    slug: str
    category_id: Optional[str]
    published: Optional[bool] = False
    thumbnail_url: Optional[str]

class PostUpdate(BaseModel):
    title: Optional[str]
    content: Optional[str]
    category_id: Optional[str]
    published: Optional[bool]
    thumbnail_url: Optional[str]

class CommentCreate(BaseModel):
    content: str

class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str]

class ProfileUpdate(BaseModel):
    username: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]

class WebsiteContentCreate(BaseModel):
    page_name: str
    content: Dict[str, Any]
