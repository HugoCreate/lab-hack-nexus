from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from typing import List, Optional, Dict
from datetime import datetime
import models
from database import supabase

app = FastAPI(title="Lab Hack Nexus API")

security = HTTPBearer()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_current_user(authorization: str = Header(...)) -> models.Profile:
    try:
        token = authorization.split(" ")[1]
        user_data = supabase.auth.get_user(token)
        if not user_data or not user_data.user:
            raise HTTPException(status_code=401, detail="Invalid user data")
            
        # Get user's profile from the profiles table
        response = supabase.table("profiles").select("*").eq("id", user_data.user.id).single().execute()
        if response.error:
            raise HTTPException(status_code=404, detail="Profile not found")
            
        return response.data
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Posts endpoints
@app.get("/posts", response_model=List[models.Post])
async def list_posts(
    category: Optional[str] = None,
    published_only: bool = True,
    author_id: Optional[str] = None,
    limit: int = Query(default=10, le=50),
    offset: int = 0
):
    try:
        query = supabase.table("posts").select("*")
        
        if published_only:
            query = query.eq("published", True)
        if category:
            query = query.eq("category_id", category)
        if author_id:
            query = query.eq("author_id", author_id)

        query = query.order("created_at", desc=True).range(offset, offset + limit)
        response = query.execute()
        
        return response.data if response.data else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/posts", response_model=models.Post)
async def create_post(
    post: models.PostCreate,
    current_user = Depends(get_current_user)
):
    try:
        post_data = post.dict()
        post_data["author_id"] = current_user.id
        post_data["created_at"] = datetime.utcnow()
        post_data["updated_at"] = datetime.utcnow()
        
        response = supabase.table("posts").insert(post_data).execute()
        
        if response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/posts/{post_id}", response_model=models.Post)
async def get_post(post_id: str):
    try:
        response = supabase.table("posts").select("*").eq("id", post_id).single().execute()
        
        if response.error:
            raise HTTPException(status_code=404, detail="Post not found")
            
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/posts/{post_id}", response_model=models.Post)
async def update_post(
    post_id: str,
    post: models.PostUpdate,
    current_user = Depends(get_current_user)
):
    try:
        # Check if user owns the post
        check = supabase.table("posts").select("author_id").eq("id", post_id).single().execute()
        if check.error or not check.data:
            raise HTTPException(status_code=404, detail="Post not found")
        if check.data["author_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this post")

        post_data = post.dict(exclude_unset=True)
        post_data["updated_at"] = datetime.utcnow()
        
        response = supabase.table("posts").update(post_data).eq("id", post_id).execute()
        
        if response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    current_user = Depends(get_current_user)
):
    try:
        # Check if user owns the post
        check = supabase.table("posts").select("author_id").eq("id", post_id).single().execute()
        if check.error or not check.data:
            raise HTTPException(status_code=404, detail="Post not found")
        if check.data["author_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this post")
            
        response = supabase.table("posts").delete().eq("id", post_id).execute()
        
        if response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
            
        return {"message": "Post deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Comments endpoints
@app.get("/posts/{post_id}/comments", response_model=List[models.Comment])
async def list_comments(post_id: str):
    try:
        response = supabase.table("comments").select("*, profiles(username,avatar_url)").eq("post_id", post_id).execute()
        if response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/posts/{post_id}/comments", response_model=models.Comment)
async def create_comment(
    post_id: str,
    comment: models.CommentCreate,
    current_user = Depends(get_current_user)
):
    try:
        comment_data = {
            "content": comment.content,
            "post_id": post_id,
            "user_id": current_user.id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        response = supabase.table("comments").insert(comment_data).execute()
        if response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Categories endpoints
@app.get("/categories", response_model=List[models.Category])
async def list_categories():
    try:
        response = supabase.table("categories").select("*").execute()
        return response.data if response.data else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/categories", response_model=models.Category)
async def create_category(
    category: models.CategoryCreate,
    current_user = Depends(get_current_user)
):
    try:
        # Check if user is admin
        profile = supabase.table("profiles").select("is_admin").eq("id", current_user.id).single().execute()
        if not profile.data or not profile.data.get("is_admin"):
            raise HTTPException(status_code=403, detail="Only admins can create categories")
            
        category_data = category.dict()
        category_data["created_at"] = datetime.utcnow()
        category_data["updated_at"] = datetime.utcnow()
        
        response = supabase.table("categories").insert(category_data).execute()
        if response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Profiles endpoints
@app.get("/profiles/{user_id}", response_model=models.Profile)
async def get_profile(user_id: str):
    try:
        response = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        if response.error:
            raise HTTPException(status_code=404, detail="Profile not found")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/profiles/{user_id}", response_model=models.Profile)
async def update_profile(
    user_id: str,
    profile: models.ProfileUpdate,
    current_user = Depends(get_current_user)
):
    try:
        if user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this profile")
            
        profile_data = profile.dict(exclude_unset=True)
        profile_data["updated_at"] = datetime.utcnow()
        
        response = supabase.table("profiles").update(profile_data).eq("id", user_id).execute()
        if response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Saved Posts endpoints
@app.post("/posts/{post_id}/save")
async def save_post(
    post_id: str,
    current_user = Depends(get_current_user)
):
    try:
        saved_post_data = {
            "post_id": post_id,
            "user_id": current_user.id,
            "created_at": datetime.utcnow()
        }
        
        response = supabase.table("saved_posts").insert(saved_post_data).execute()
        if response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        return {"message": "Post saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/posts/{post_id}/unsave")
async def unsave_post(
    post_id: str,
    current_user = Depends(get_current_user)
):
    try:
        response = supabase.table("saved_posts").delete().eq("post_id", post_id).eq("user_id", current_user.id).execute()
        if response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        return {"message": "Post unsaved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/saved-posts", response_model=List[models.Post])
async def get_saved_posts(current_user = Depends(get_current_user)):
    try:
        response = supabase.table("saved_posts")\
            .select("posts(*)")\
            .eq("user_id", current_user.id)\
            .execute()
            
        if response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
            
        # Extract posts from the response
        posts = [item["posts"] for item in response.data if item.get("posts")]
        return posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Website Content endpoints
@app.get("/website-content/{page_name}", response_model=models.WebsiteContent)
async def get_website_content(page_name: str):
    try:
        response = supabase.table("website_content").select("*").eq("page_name", page_name).single().execute()
        if response.error:
            raise HTTPException(status_code=404, detail="Content not found")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/website-content", response_model=models.WebsiteContent)
async def create_website_content(
    content: models.WebsiteContentCreate,
    current_user = Depends(get_current_user)
):
    try:
        # Check if user is admin
        profile = supabase.table("profiles").select("is_admin").eq("id", current_user.id).single().execute()
        if not profile.data or not profile.data.get("is_admin"):
            raise HTTPException(status_code=403, detail="Only admins can create website content")
            
        content_data = content.dict()
        content_data["updated_by"] = current_user.id
        content_data["created_at"] = datetime.utcnow()
        content_data["updated_at"] = datetime.utcnow()
        
        response = supabase.table("website_content").insert(content_data).execute()
        if response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Auth endpoints
@app.post("/auth/register")
async def register(user: models.UserCreate):
    try:
        # Register with Supabase Auth
        try:
            auth_response = supabase.auth.sign_up({
                "email": user.email,
                "password": user.password,
                "options": {
                    "data": {
                        "username": user.username
                    }
                }
            })
            
            if not auth_response.user:
                raise HTTPException(status_code=500, detail="User creation failed")
                
            new_user = auth_response.user
        except Exception as auth_error:
            raise HTTPException(status_code=400, detail=str(auth_error))

        # Create profile
        current_time = datetime.utcnow().isoformat()
        profile_data = {
            "id": new_user.id,
            "username": user.username or user.email.split('@')[0],
            "avatar_url": None,
            "bio": None,
            "is_admin": False,
            "created_at": current_time,
            "updated_at": current_time
        }
        
        # Use admin client to bypass RLS when creating profile
        from database import supabase_admin
        
        try:
            # Create new profile
            profile_response = supabase_admin.table("profiles").insert(profile_data).execute()
            if profile_response.error:
                raise HTTPException(status_code=400, detail=str(profile_response.error))
            profile = profile_response.data[0] if profile_response.data else None
            
            if not profile:
                raise HTTPException(status_code=500, detail="Failed to create profile")
                
            return {
                "message": "User registered successfully",
                "user": {
                    "id": new_user.id,
                    "email": new_user.email
                },
                "profile": profile
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Profile error: {str(e)}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/login")
async def login(email: str, password: str):
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if hasattr(auth_response, 'error') and auth_response.error:
            raise HTTPException(status_code=400, detail=str(auth_response.error))
            
        return {
            "access_token": auth_response.session.access_token,
            "user": auth_response.user
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
