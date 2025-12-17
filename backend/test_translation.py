#!/usr/bin/env python3
"""
Test script for translation functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from translation import translate_text_enhanced, get_supported_languages, get_cache_stats

def test_basic_translation():
    """Test basic English to Urdu translation"""
    print("Testing basic translation...")
    
    result = translate_text_enhanced(
        "Hello, how are you today?", 
        "ur", 
        "en"
    )
    
    print(f"Success: {result['success']}")
    print(f"Translation: {result['translation']}")
    print(f"Cached: {result['cached']}")
    if result.get('error'):
        print(f"Error: {result['error']}")
    print("-" * 50)

def test_technical_translation():
    """Test technical content translation"""
    print("Testing technical translation...")
    
    result = translate_text_enhanced(
        "ROS is a middleware for robotics development", 
        "ur", 
        "en"
    )
    
    print(f"Success: {result['success']}")
    print(f"Translation: {result['translation']}")
    print(f"Cached: {result['cached']}")
    if result.get('error'):
        print(f"Error: {result['error']}")
    print("-" * 50)

def test_supported_languages():
    """Test getting supported languages"""
    print("Testing supported languages...")
    
    languages = get_supported_languages()
    print(f"Supported languages: {languages}")
    print("-" * 50)

def test_cache_stats():
    """Test cache statistics"""
    print("Testing cache stats...")
    
    stats = get_cache_stats()
    print(f"Cache stats: {stats}")
    print("-" * 50)

def test_caching():
    """Test translation caching"""
    print("Testing translation caching...")
    
    text = "This is a test message for caching"
    
    # First translation
    result1 = translate_text_enhanced(text, "ur", "en")
    print(f"First translation - Cached: {result1['cached']}")
    
    # Second translation (should be cached)
    result2 = translate_text_enhanced(text, "ur", "en")
    print(f"Second translation - Cached: {result2['cached']}")
    
    print("-" * 50)

if __name__ == "__main__":
    print("=" * 60)
    print("TRANSLATION FUNCTIONALITY TESTS")
    print("=" * 60)
    
    try:
        test_supported_languages()
        test_basic_translation()
        test_technical_translation()
        test_caching()
        test_cache_stats()
        
        print("=" * 60)
        print("TESTS COMPLETED")
        print("=" * 60)
        
    except Exception as e:
        print(f"Test failed with error: {e}")
        sys.exit(1)
