from supabase import create_client, Client
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

class User(BaseModel):
    email: str
    password: str
    full_name: str
    gpu: str
    ros_level: str
    programming_level: str
    preferred_language: str = "en"

class UserProfile(BaseModel):
    email: str
    full_name: str
    gpu: str
    ros_level: str
    programming_level: str
    preferred_language: str = "en"

# Supabase client
supabase: Client = None

def init_supabase():
    """Initialize Supabase client"""
    global supabase
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            print("Supabase credentials not found in environment variables")
            return False
            
        supabase = create_client(supabase_url, supabase_key)
        return True
    except Exception as e:
        print(f"Error initializing Supabase: {e}")
        return False

def create_user(user: User) -> Optional[str]:
    """Create a new user with Supabase Auth and store profile data"""
    if not supabase:
        init_supabase()
    
    try:
        # Create user in Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options": {
                "data": {
                    "full_name": user.full_name
                }
            }
        })
        
        if auth_response.user is None:
            print(f"Auth signup failed: {auth_response}")
            return None
        
        user_id = auth_response.user.id
        
        # Store additional profile data in profiles table
        profile_data = {
            "id": user_id,
            "email": user.email,
            "full_name": user.full_name,
            "gpu": user.gpu,
            "ros_level": user.ros_level,
            "programming_level": user.programming_level,
            "preferred_language": user.preferred_language
        }
        
        profile_response = supabase.table("profiles").insert(profile_data).execute()
        
        if profile_response.data is None:
            print(f"Profile creation failed: {profile_response}")
            # Rollback auth user
            supabase.auth.admin.delete_user(user_id)
            return None
        
        return user_id
        
    except Exception as e:
        print(f"Error creating user: {e}")
        return None

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user with Supabase Auth"""
    if not supabase:
        init_supabase()
    
    try:
        # Sign in with Supabase Auth
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if auth_response.user is None:
            print(f"Auth signin failed: {auth_response}")
            return None
        
        user_id = auth_response.user.id
        
        # Get profile data
        profile_response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        if profile_response.data is None or len(profile_response.data) == 0:
            print(f"Profile not found for user: {user_id}")
            return None
        
        profile = profile_response.data[0]
        
        return {
            "id": profile["id"],
            "email": profile["email"],
            "full_name": profile["full_name"],
            "gpu": profile["gpu"],
            "ros_level": profile["ros_level"],
            "programming_level": profile["programming_level"],
            "preferred_language": profile["preferred_language"],
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token
        }
        
    except Exception as e:
        print(f"Error authenticating user: {e}")
        return None

def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user profile by ID"""
    if not supabase:
        init_supabase()
    
    try:
        profile_response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        if profile_response.data is None or len(profile_response.data) == 0:
            return None
        
        return profile_response.data[0]
        
    except Exception as e:
        print(f"Error getting user profile: {e}")
        return None

def update_user_profile(user_id: str, profile_data: Dict[str, Any]) -> bool:
    """Update user profile"""
    if not supabase:
        init_supabase()
    
    try:
        profile_response = supabase.table("profiles").update(profile_data).eq("id", user_id).execute()
        
        return profile_response.data is not None
        
    except Exception as e:
        print(f"Error updating user profile: {e}")
        return False

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify JWT token and get user info"""
    if not supabase:
        init_supabase()
    
    try:
        # Verify token with Supabase Auth
        user_response = supabase.auth.get_user(token)
        
        if user_response.user is None:
            return None
        
        return {
            "id": user_response.user.id,
            "email": user_response.user.email,
            "aud": user_response.user.aud
        }
        
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None

# Initialize Supabase on module import
init_supabase()
