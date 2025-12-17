from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Physical AI RAG Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pydantic import BaseModel
from typing import List, Optional
from rag import search_context, generate_answer, get_embedding, personalize_text, translate_text
from translation import (
    translate_text_enhanced, 
    translate_multiple_texts, 
    get_supported_languages,
    translate_technical_content,
    translate_with_context,
    get_cache_stats,
    clear_translation_cache
)
from db import init_db, get_db_connection

# Models
class ChatRequest(BaseModel):
    query: str
    history: Optional[List[dict]] = []
    background: Optional[str] = "General" # software, hardware, etc.

@app.post("/rag/ask")
async def ask_question(request: ChatRequest):
    context = search_context(request.query)
    answer = generate_answer(request.query, context, user_background=request.background)
    return {"answer": answer, "context": context}

class SelectionRequest(BaseModel):
    query: str
    selected_text: str

@app.post("/rag/ask-selection")
async def ask_selection(request: SelectionRequest):
    context = [{"text": request.selected_text, "source": "User Selection"}]
    answer = generate_answer(request.query, context)
    return {"answer": answer, "context": context}

class PersonalizeRequest(BaseModel):
    text: str
    level: str # beginner, intermediate, expert

class TranslateRequest(BaseModel):
    text: str
    target_language: str = "Urdu"
    source_language: str = "en"

class TranslateBatchRequest(BaseModel):
    texts: List[str]
    target_language: str = "Urdu"
    source_language: str = "en"

class TranslateTechnicalRequest(BaseModel):
    text: str
    target_language: str = "Urdu"
    domain: str = "general"  # robotics, ai, programming, general

class TranslateWithContextRequest(BaseModel):
    text: str
    target_language: str = "Urdu"
    context: str = ""

@app.post("/rag/personalize")
async def personalize_content(request: PersonalizeRequest):
    personalized_text = personalize_text(request.text, request.level)
    return {
        "personalized_markdown": personalized_text,
        "meta": {"level": request.level}
    }

@app.post("/rag/translate")
async def translate_content(request: TranslateRequest):
    result = translate_text_enhanced(request.text, request.target_language, request.source_language)
    return result

@app.post("/rag/translate/batch")
async def translate_batch_content(request: TranslateBatchRequest):
    results = translate_multiple_texts(request.texts, request.target_language, request.source_language)
    return {"results": results}

@app.post("/rag/translate/technical")
async def translate_technical_content_endpoint(request: TranslateTechnicalRequest):
    result = translate_technical_content(request.text, request.target_language, request.domain)
    return result

@app.post("/rag/translate/context")
async def translate_with_context_endpoint(request: TranslateWithContextRequest):
    result = translate_with_context(request.text, request.target_language, request.context)
    return result

@app.get("/rag/translate/languages")
async def get_supported_languages_endpoint():
    return {"languages": get_supported_languages()}

@app.get("/rag/translate/cache")
async def get_cache_stats_endpoint():
    return {"stats": get_cache_stats()}

@app.delete("/rag/translate/cache")
async def clear_cache_endpoint():
    clear_translation_cache()
    return {"message": "Translation cache cleared"}

from auth import create_user, authenticate_user, User, verify_token

class SignupRequest(User):
    pass

class SigninRequest(BaseModel):
    email: str
    password: str

@app.post("/auth/signup")
async def signup(user: SignupRequest):
    user_id = create_user(user)
    if user_id:
        return {"message": "User created successfully", "user_id": user_id}
    raise HTTPException(status_code=400, detail="User creation failed")

@app.post("/auth/signin")
async def signin(creds: SigninRequest):
    user = authenticate_user(creds.email, creds.password)
    if user:
        return {
            "message": "Login successful", 
            "user": {
                "id": user['id'],
                "email": user['email'], 
                "name": user['full_name'],
                "gpu": user['gpu'],
                "ros_level": user['ros_level'],
                "programming_level": user['programming_level'],
                "preferred_language": user['preferred_language']
            },
            "tokens": {
                "access_token": user['access_token'],
                "refresh_token": user['refresh_token']
            }
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/auth/me")
async def get_current_user(authorization: str = None):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    user_data = verify_token(token)
    
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    from auth import get_user_profile
    profile = get_user_profile(user_data['id'])
    
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    return profile


