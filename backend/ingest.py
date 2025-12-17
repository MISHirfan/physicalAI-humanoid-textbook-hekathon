import os
import glob
from pathlib import Path
from typing import List, Dict
import requests
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import hashlib
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.2-3b-instruct:free")
EMBEDDING_MODEL = os.getenv("OPENROUTER_EMBEDDING_MODEL", "openai/text-embedding-3-small")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = "physical_ai_textbook"
DOCS_DIR = "../textbook/docs"

# Initialize clients
qdrant_client = None
if QDRANT_URL and QDRANT_API_KEY:
    qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

def get_embedding(text: str) -> List[float]:
    """Generate embedding for text using OpenRouter"""
    if not OPENROUTER_API_KEY:
        print("Warning: No OpenRouter API key, using mock embeddings")
        return [0.0] * 1536
    
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

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
    """Split text into overlapping chunks"""
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = ' '.join(words[i:i + chunk_size])
        if len(chunk.strip()) > 50:  # Minimum chunk size
            chunks.append(chunk)
    
    return chunks

def extract_metadata(filepath: str, content: str) -> Dict:
    """Extract metadata from markdown file"""
    filename = os.path.basename(filepath)
    
    # Extract chapter number and title
    if filename.startswith('chapter-'):
        parts = filename.replace('.md', '').split('-')
        chapter_num = parts[1] if len(parts) > 1 else '0'
        title = ' '.join(parts[2:]).title() if len(parts) > 2 else 'Unknown'
    elif filename == 'intro.md':
        chapter_num = '0'
        title = 'Introduction'
    else:
        chapter_num = '99'
        title = filename.replace('.md', '').replace('-', ' ').title()
    
    # Extract first heading as section
    lines = content.split('\n')
    section = 'General'
    for line in lines:
        if line.startswith('##'):
            section = line.replace('#', '').strip()
            break
    
    return {
        'filename': filename,
        'chapter': chapter_num,
        'title': title,
        'section': section,
        'filepath': filepath
    }

def process_markdown_file(filepath: str) -> List[Dict]:
    """Process a single markdown file into chunks with metadata"""
    print(f"Processing: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove frontmatter
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            content = parts[2]
    
    # Extract metadata
    metadata = extract_metadata(filepath, content)
    
    # Chunk the content
    chunks = chunk_text(content)
    
    # Create documents
    documents = []
    for i, chunk in enumerate(chunks):
        doc_id = hashlib.md5(f"{filepath}_{i}".encode()).hexdigest()
        documents.append({
            'id': doc_id,
            'text': chunk,
            'metadata': {
                **metadata,
                'chunk_index': i,
                'total_chunks': len(chunks)
            }
        })
    
    return documents

def create_collection():
    """Create or recreate Qdrant collection"""
    if not qdrant_client:
        print("Error: Qdrant client not initialized")
        return False
    
    try:
        # Delete existing collection
        try:
            qdrant_client.delete_collection(COLLECTION_NAME)
            print(f"Deleted existing collection: {COLLECTION_NAME}")
        except:
            pass
        
        # Create new collection
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
        )
        print(f"Created collection: {COLLECTION_NAME}")
        return True
    
    except Exception as e:
        print(f"Error creating collection: {e}")
        return False

def ingest_documents():
    """Main ingestion function"""
    print("=" * 60)
    print("Starting document ingestion...")
    print("=" * 60)
    
    # Find all markdown files
    docs_path = Path(DOCS_DIR)
    if not docs_path.exists():
        print(f"Error: Docs directory not found: {DOCS_DIR}")
        return
    
    md_files = list(docs_path.glob("*.md"))
    print(f"\nFound {len(md_files)} markdown files")
    
    # Process all files
    all_documents = []
    for filepath in md_files:
        docs = process_markdown_file(str(filepath))
        all_documents.extend(docs)
    
    print(f"\nTotal chunks created: {len(all_documents)}")
    
    # Create collection
    if not create_collection():
        return
    
    # Generate embeddings and upload
    print("\nGenerating embeddings and uploading to Qdrant...")
    points = []
    
    for i, doc in enumerate(all_documents):
        if i % 10 == 0:
            print(f"Processing {i}/{len(all_documents)}...")
        
        embedding = get_embedding(doc['text'])
        
        point = PointStruct(
            id=doc['id'],
            vector=embedding,
            payload={
                'text': doc['text'],
                **doc['metadata']
            }
        )
        points.append(point)
        
        # Upload in batches of 100
        if len(points) >= 100:
            qdrant_client.upsert(
                collection_name=COLLECTION_NAME,
                points=points
            )
            points = []
    
    # Upload remaining points
    if points:
        qdrant_client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
    
    print("\n" + "=" * 60)
    print("✅ Ingestion complete!")
    print(f"Total documents indexed: {len(all_documents)}")
    print("=" * 60)

if __name__ == "__main__":
    ingest_documents()
