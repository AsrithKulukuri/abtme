"""
Asrith AI Chatbot - FastAPI Server
Production-ready API with RAG, rate limiting, and theme awareness
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import uvicorn
import time
from pathlib import Path

from config import HOST, PORT, CORS_ORIGINS, BOT_NAME, BOT_VERSION
from rate_limiter import rate_limiter
# from ai_handler import get_ai_handler  # Disabled temporarily - RAG slow on first run
from simple_ai import get_simple_ai as get_ai_handler  # Fast startup without RAG


PROJECT_ROOT = Path(__file__).resolve().parent.parent
INDEX_FILE = PROJECT_ROOT / "index.html"
ALLOWED_STATIC_EXTENSIONS = {
    ".html", ".css", ".js", ".json", ".txt", ".xml", ".webmanifest",
    ".svg", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".woff", ".woff2", ".ttf", ".map"
}
BLOCKED_TOP_LEVEL_DIRS = {"server", "ai", ".git", "__pycache__"}


# ===== FastAPI App =====

app = FastAPI(
    title="Asrith AI API",
    description="AI chatbot for Asrith Kulukuri's portfolio website",
    version=BOT_VERSION
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== Request Models =====

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500,
                         description="User message")
    theme: str = Field(default="studio", description="Current UI theme")
    conversation_history: Optional[List[Dict]] = Field(
        default=None, description="Previous messages")
    stream: bool = Field(default=False, description="Stream response")

    class Config:
        json_schema_extra = {
            "example": {
                "message": "What projects has Asrith built?",
                "theme": "midnightHacker",
                "stream": False
            }
        }


class ChatResponse(BaseModel):
    response: str
    theme: str
    timestamp: float


class WelcomeRequest(BaseModel):
    theme: str = Field(default="studio", description="Current UI theme")


class StatsResponse(BaseModel):
    requests_this_minute: int
    requests_today: int
    minute_limit: int
    daily_limit: int


# ===== Helper Functions =====

def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host


# ===== API Endpoints =====

@app.get("/")
async def root():
    """Serve portfolio frontend"""
    return FileResponse(INDEX_FILE)


@app.get("/api")
async def api_info():
    """API info endpoint"""
    return {
        "bot": BOT_NAME,
        "version": BOT_VERSION,
        "status": "online",
        "endpoints": ["/chat", "/welcome", "/stats", "/health"]
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request):
    """
    Main chat endpoint
    Accepts user message, returns AI response with RAG context
    """

    ip_address = get_client_ip(req)

    # Validate message
    is_valid, error = rate_limiter.validate_message(request.message)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    # Check spam
    is_spam, error = rate_limiter.detect_spam(ip_address, request.message)
    if is_spam:
        raise HTTPException(status_code=429, detail=error)

    # Check rate limit
    is_allowed, error = rate_limiter.check_rate_limit(ip_address)
    if not is_allowed:
        raise HTTPException(status_code=429, detail=error)

    # Generate response
    try:
        ai = get_ai_handler()

        if request.stream:
            # Streaming response
            def generate():
                stream = ai.generate_response(
                    user_message=request.message,
                    theme=request.theme,
                    conversation_history=request.conversation_history,
                    stream=True
                )

                for chunk in stream:
                    if chunk.choices[0].delta.content:
                        yield chunk.choices[0].delta.content

            return StreamingResponse(generate(), media_type="text/plain")

        else:
            # Complete response
            response_text = ai.generate_response(
                user_message=request.message,
                theme=request.theme,
                conversation_history=request.conversation_history,
                stream=False
            )

            return ChatResponse(
                response=response_text,
                theme=request.theme,
                timestamp=time.time()
            )

    except Exception as e:
        print(f"❌ Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/welcome")
async def welcome(request: WelcomeRequest):
    """
    Get theme-aware welcome message
    """
    try:
        ai = get_ai_handler()
        message = ai.generate_welcome_message(request.theme)

        return {
            "message": message,
            "theme": request.theme
        }
    except Exception as e:
        print(f"❌ Error in welcome endpoint: {e}")
        return {
            "message": "Hey 👋 I'm Asrith AI. Ask me anything!",
            "theme": request.theme
        }


@app.get("/stats", response_model=StatsResponse)
async def stats(req: Request):
    """
    Get rate limit statistics for current client
    """
    ip_address = get_client_ip(req)
    stats_data = rate_limiter.get_stats(ip_address)

    return StatsResponse(**stats_data)


@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "bot": BOT_NAME,
        "version": BOT_VERSION,
        "timestamp": time.time()
    }


@app.get("/{file_path:path}")
async def static_files(file_path: str):
    """Serve static frontend assets and SPA fallback"""
    if not file_path:
        return FileResponse(INDEX_FILE)

    normalized_path = Path(file_path)
    if normalized_path.parts and normalized_path.parts[0] in BLOCKED_TOP_LEVEL_DIRS:
        raise HTTPException(status_code=404, detail="Not found")

    candidate = (PROJECT_ROOT / normalized_path).resolve()
    if PROJECT_ROOT not in candidate.parents and candidate != PROJECT_ROOT:
        raise HTTPException(status_code=404, detail="Not found")

    if candidate.is_file() and candidate.suffix.lower() in ALLOWED_STATIC_EXTENSIONS:
        return FileResponse(candidate)

    return FileResponse(INDEX_FILE)


# ===== Server Startup =====

if __name__ == "__main__":
    print(f"""
    ╔══════════════════════════════════════════╗
    ║   🤖 {BOT_NAME} - Backend Server    ║
    ╠══════════════════════════════════════════╣
    ║   Version: {BOT_VERSION}                     ║
    ║   Host: {HOST}                         ║
    ║   Port: {PORT}                            ║
    ╚══════════════════════════════════════════╝
    """)

    uvicorn.run(
        "app:app",
        host=HOST,
        port=PORT,
        reload=True,
        log_level="info"
    )
