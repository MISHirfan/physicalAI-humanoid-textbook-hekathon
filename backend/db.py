import os
from dotenv import load_dotenv
load_dotenv()

from qdrant_client import QdrantClient
import psycopg2
from psycopg2.extras import RealDictCursor

# Qdrant Setup
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

qdrant_client = None
if QDRANT_URL and QDRANT_API_KEY:
    qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

# Neon Postgres Setup
DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    if not DATABASE_URL:
        return None
    try:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def init_db():
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()
            # Users table with extended profile
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    full_name VARCHAR(255),
                    gpu VARCHAR(100),
                    ros_level VARCHAR(50),
                    programming_level VARCHAR(50),
                    preferred_language VARCHAR(10) DEFAULT 'en',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            # Ingest jobs table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS ingest_jobs (
                    id SERIAL PRIMARY KEY,
                    status VARCHAR(50) NOT NULL,
                    chunks_indexed INTEGER DEFAULT 0,
                    error_message TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            conn.commit()
            cur.close()
            conn.close()
            print("Database initialized with extended schema.")
        except Exception as e:
            print(f"Error initializing database: {e}")
