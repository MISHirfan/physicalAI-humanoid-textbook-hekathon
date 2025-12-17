import os
import json
import hashlib
from typing import Dict, Optional, List
from datetime import datetime, timedelta
import requests
from dotenv import load_dotenv

load_dotenv()

# Translation cache
TRANSLATION_CACHE = {}
CACHE_EXPIRY_HOURS = 24

# Supported languages
SUPPORTED_LANGUAGES = {
    "en": "English",
    "ur": "Urdu",
    "hi": "Hindi",
    "ar": "Arabic",
    "bn": "Bengali",
    "ta": "Tamil",
    "te": "Telugu",
    "mr": "Marathi",
    "gu": "Gujarati",
    "pa": "Punjabi"
}

# OpenRouter API
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.2-3b-instruct:free")

def get_cache_key(text: str, target_lang: str) -> str:
    """Generate cache key for translation"""
    content = f"{text}_{target_lang}"
    return hashlib.md5(content.encode()).hexdigest()

def is_cache_valid(cache_entry: Dict) -> bool:
    """Check if cache entry is still valid"""
    cached_time = datetime.fromisoformat(cache_entry.get("timestamp", "1970-01-01"))
    return datetime.now() - cached_time < timedelta(hours=CACHE_EXPIRY_HOURS)

def translate_with_openrouter(text: str, target_lang: str, source_lang: str = "en") -> Optional[str]:
    """Translate text using OpenRouter API"""
    if not OPENROUTER_API_KEY:
        return None
    
    # Check cache first
    cache_key = get_cache_key(text, target_lang)
    if cache_key in TRANSLATION_CACHE and is_cache_valid(TRANSLATION_CACHE[cache_key]):
        return TRANSLATION_CACHE[cache_key]["translation"]
    
    # Language-specific prompts
    language_prompts = {
        "ur": "Translate the following English text to Urdu. Use proper Urdu script ( nastaliq style ). Maintain technical terms where appropriate. Keep the meaning and context intact.",
        "hi": "Translate the following English text to Hindi. Use Devanagari script. Maintain technical terms where appropriate.",
        "ar": "Translate the following English text to Arabic. Use proper Arabic script. Maintain technical terms where appropriate.",
        "bn": "Translate the following English text to Bengali. Use Bengali script. Maintain technical terms where appropriate.",
        "ta": "Translate the following English text to Tamil. Use Tamil script. Maintain technical terms where appropriate.",
        "te": "Translate the following English text to Telugu. Use Telugu script. Maintain technical terms where appropriate.",
        "mr": "Translate the following English text to Marathi. Use Devanagari script. Maintain technical terms where appropriate.",
        "gu": "Translate the following English text to Gujarati. Use Gujarati script. Maintain technical terms where appropriate.",
        "pa": "Translate the following English text to Punjabi. Use Gurmukhi script. Maintain technical terms where appropriate."
    }
    
    system_prompt = language_prompts.get(target_lang, f"Translate the following text to {SUPPORTED_LANGUAGES.get(target_lang, target_lang)}.")
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://physical-ai-textbook.com",
        "X-Title": "Physical AI Textbook Translator"
    }
    
    payload = {
        "model": DEFAULT_MODEL,
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": f"Text to translate:\n\n{text}"
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{OPENROUTER_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        translation = data["choices"][0]["message"]["content"].strip()
        
        # Cache the translation
        TRANSLATION_CACHE[cache_key] = {
            "translation": translation,
            "timestamp": datetime.now().isoformat(),
            "source_lang": source_lang,
            "target_lang": target_lang
        }
        
        return translation
        
    except Exception as e:
        print(f"Translation error: {e}")
        return None

def translate_text_enhanced(text: str, target_lang: str, source_lang: str = "en") -> Dict:
    """
    Enhanced translation function with multiple fallbacks and better error handling
    """
    result = {
        "success": False,
        "translation": None,
        "source_lang": source_lang,
        "target_lang": target_lang,
        "original_text": text,
        "cached": False,
        "error": None
    }
    
    # Validate target language
    if target_lang not in SUPPORTED_LANGUAGES:
        result["error"] = f"Unsupported target language: {target_lang}. Supported: {list(SUPPORTED_LANGUAGES.keys())}"
        return result
    
    # Check cache first
    cache_key = get_cache_key(text, target_lang)
    if cache_key in TRANSLATION_CACHE and is_cache_valid(TRANSLATION_CACHE[cache_key]):
        cached_entry = TRANSLATION_CACHE[cache_key]
        result.update({
            "success": True,
            "translation": cached_entry["translation"],
            "cached": True
        })
        return result
    
    # Try translation
    translation = translate_with_openrouter(text, target_lang, source_lang)
    
    if translation:
        result.update({
            "success": True,
            "translation": translation,
            "cached": False
        })
    else:
        result["error"] = "Translation failed. Please try again later."
    
    return result

def translate_multiple_texts(texts: List[str], target_lang: str, source_lang: str = "en") -> List[Dict]:
    """Translate multiple texts in batch"""
    results = []
    for text in texts:
        result = translate_text_enhanced(text, target_lang, source_lang)
        results.append(result)
    return results

def get_supported_languages() -> Dict[str, str]:
    """Get list of supported languages"""
    return SUPPORTED_LANGUAGES.copy()

def clear_translation_cache():
    """Clear translation cache"""
    global TRANSLATION_CACHE
    TRANSLATION_CACHE.clear()

def get_cache_stats() -> Dict:
    """Get translation cache statistics"""
    valid_entries = sum(1 for entry in TRANSLATION_CACHE.values() if is_cache_valid(entry))
    return {
        "total_entries": len(TRANSLATION_CACHE),
        "valid_entries": valid_entries,
        "expired_entries": len(TRANSLATION_CACHE) - valid_entries,
        "expiry_hours": CACHE_EXPIRY_HOURS
    }

# Specialized translation functions for different content types
def translate_technical_content(text: str, target_lang: str, domain: str = "general") -> Dict:
    """Translate technical content with domain-specific terminology"""
    domain_prompts = {
        "robotics": "Translate this robotics/technical content. Keep technical terms like 'ROS', 'URDF', 'SLAM' in English if they don't have common Urdu equivalents. Use proper Urdu technical terminology where available.",
        "ai": "Translate this AI/machine learning content. Keep technical terms like 'neural networks', 'algorithms', 'models' in English if they don't have common Urdu equivalents. Use proper Urdu technical terminology where available.",
        "programming": "Translate this programming content. Keep code snippets, function names, and programming keywords in English. Translate comments and explanations to Urdu.",
        "general": "Translate this general educational content to Urdu, maintaining clarity and educational value."
    }
    
    if not OPENROUTER_API_KEY:
        return {"success": False, "error": "API key not configured"}
    
    system_prompt = domain_prompts.get(domain, domain_prompts["general"])
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://physical-ai-textbook.com",
        "X-Title": "Physical AI Technical Translator"
    }
    
    payload = {
        "model": DEFAULT_MODEL,
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": f"Text to translate:\n\n{text}"
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{OPENROUTER_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        translation = data["choices"][0]["message"]["content"].strip()
        
        return {
            "success": True,
            "translation": translation,
            "domain": domain,
            "source_lang": "en",
            "target_lang": target_lang
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Translation failed: {str(e)}"
        }

def translate_with_context(text: str, target_lang: str, context: str = "") -> Dict:
    """Translate text with additional context for better accuracy"""
    if not OPENROUTER_API_KEY:
        return {"success": False, "error": "API key not configured"}
    
    context_prompt = f"""
    Context: {context}
    
    Translate the following English text to {SUPPORTED_LANGUAGES.get(target_lang, target_lang)}.
    Use the provided context to ensure accurate translation of technical terms and concepts.
    Maintain the original formatting and structure.
    """
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://physical-ai-textbook.com",
        "X-Title": "Physical AI Context-Aware Translator"
    }
    
    payload = {
        "model": DEFAULT_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are an expert translator specializing in technical and educational content. Always consider the provided context for accurate translation."
            },
            {
                "role": "user",
                "content": context_prompt + f"\n\nText to translate:\n\n{text}"
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{OPENROUTER_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        translation = data["choices"][0]["message"]["content"].strip()
        
        return {
            "success": True,
            "translation": translation,
            "context_used": bool(context),
            "source_lang": "en",
            "target_lang": target_lang
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Translation failed: {str(e)}"
        }
