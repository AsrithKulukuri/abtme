"""
Configuration for Asrith AI Chatbot
Centralized settings for API keys, rate limits, and system behavior
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ===== Google Gemini Configuration =====
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "500"))  # Keep responses concise
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))  # Balanced creativity

# ===== Rate Limiting =====
RATE_LIMIT_PER_MINUTE = 10
RATE_LIMIT_PER_DAY = 100
COOLDOWN_SECONDS = 5  # Between messages

# ===== RAG Configuration =====
CHUNK_SIZE = 400  # Characters per chunk
CHUNK_OVERLAP = 50
TOP_K_RESULTS = 3  # Number of relevant chunks to retrieve
EMBEDDING_MODEL = "models/embedding-001"  # Gemini embedding model

# ===== Security =====
MAX_MESSAGE_LENGTH = 500
MIN_MESSAGE_LENGTH = 1
BLOCKED_PATTERNS = [
    "ignore previous instructions",
    "ignore all instructions",
    "you are now",
    "new system prompt",
    "override system",
]

# ===== Server Configuration =====
HOST = "0.0.0.0"
PORT = 8000
CORS_ORIGINS = [
    "http://localhost:*",
    "http://127.0.0.1:*",
    "file://*",  # For local HTML files
]

# ===== Bot Identity =====
BOT_NAME = "Asrith AI 🤖"
BOT_VERSION = "1.0.0"
STUDENT_NAME = "Asrith Kulukuri"
UNIVERSITY = "GITAM University"
DEGREE = "BTech CSE, 1st Year"
LOCATION = "India"

# ===== Response Settings =====
TYPING_DELAY_MS = 800  # Simulate typing
STREAM_RESPONSES = True
ENABLE_THEME_AWARENESS = True
