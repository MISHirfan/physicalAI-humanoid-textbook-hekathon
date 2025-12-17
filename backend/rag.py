import os
from dotenv import load_dotenv
load_dotenv()

import requests
from db import qdrant_client

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Default model - you can change this to any model available on OpenRouter
# Popular options: "meta-llama/llama-3.2-3b-instruct:free", "microsoft/phi-3-mini-128k-instruct:free", "qwen/qwen-2.5-7b-instruct:free"
DEFAULT_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.2-3b-instruct:free")
EMBEDDING_MODEL = os.getenv("OPENROUTER_EMBEDDING_MODEL", "openai/text-embedding-3-small")

COLLECTION_NAME = "physical_ai_textbook"

def call_openrouter(messages: list, model: str = None) -> str:
    """Make a chat completion request to OpenRouter API."""
    if not OPENROUTER_API_KEY:
        return "OpenRouter API Key not found. Please set OPENROUTER_API_KEY in .env."
    
    model = model or DEFAULT_MODEL
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://physical-ai-textbook.com",
        "X-Title": "Physical AI Textbook RAG"
    }
    
    payload = {
        "model": model,
        "messages": messages
    }
    
    try:
        response = requests.post(
            f"{OPENROUTER_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except requests.exceptions.HTTPError as e:
        return f"OpenRouter API error: {response.status_code} - {response.text}"
    except Exception as e:
        return f"Error calling OpenRouter: {str(e)}"

def get_embedding(text: str):
    """Get embeddings using OpenRouter's embedding endpoint."""
    if not OPENROUTER_API_KEY:
        return [0.0] * 1536  # Mock embedding if no key (1536 for OpenAI embeddings)
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://physical-ai-textbook.com",
        "X-Title": "Physical AI Textbook RAG"
    }
    
    payload = {
        "model": EMBEDDING_MODEL,
        "input": text
    }
    
    try:
        response = requests.post(
            f"{OPENROUTER_BASE_URL}/embeddings",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        return data["data"][0]["embedding"]
    except Exception as e:
        print(f"Embedding error: {e}")
        return [0.0] * 1536

def search_context(query: str, limit: int = 5):
    if not qdrant_client:
        return []
    
    # Check if collection exists
    try:
        collections = qdrant_client.get_collections()
        collection_exists = any(c.name == COLLECTION_NAME for c in collections.collections)
        if not collection_exists:
            print(f"Collection '{COLLECTION_NAME}' does not exist. Please run ingest.py first.")
            return []
    except Exception as e:
        print(f"Error checking collections: {e}")
        return []
    
    # For now, use scroll to get sample documents (simplified approach)
    # In a production system, you'd want proper vector search
    try:
        points = qdrant_client.scroll(
            collection_name=COLLECTION_NAME,
            limit=limit,
            with_payload=True
        )
        return [point.payload for point in points[0] if point.payload]
    except Exception as e:
        print(f"Error retrieving documents: {e}")
        return []

def generate_answer(query: str, context: list, user_background: str = "General"):
    context_str = "\n\n".join([c.get('text', '') for c in context])
    
    system_prompt = f"""You are an expert AI assistant for a Physical AI & Humanoid Robotics textbook. 
Use the provided context to answer the user's question. 
If the answer is not in the context, use your general knowledge but mention that it's outside the textbook scope.

User Background: {user_background}
(Tailor your answer to this background. If they are 'Software', focus on code/algorithms. If 'Hardware', focus on electronics/actuators.)"""

    messages = [
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "user",
            "content": f"""Context:
{context_str}

Question: {query}"""
        }
    ]
    
    return call_openrouter(messages)

def personalize_text(text: str, level: str):
    messages = [
        {
            "role": "system",
            "content": """You are an expert at adapting educational content for different skill levels.
            
Level Definitions:
- Beginner: Simple language, more analogies, define technical terms.
- Intermediate: Standard technical textbook style.
- Expert: Concise, focus on advanced concepts, assume prior knowledge."""
        },
        {
            "role": "user",
            "content": f"""Rewrite the following textbook content for a {level} level audience.

Content:
{text}"""
        }
    ]
    
    return call_openrouter(messages)

def translate_text(text: str, target_language: str):
    messages = [
        {
            "role": "system",
            "content": "You are an expert translator. Maintain markdown formatting exactly when translating."
        },
        {
            "role": "user",
            "content": f"""Translate the following textbook content into {target_language}.

Content:
{text}"""
        }
    ]
    
    return call_openrouter(messages)
