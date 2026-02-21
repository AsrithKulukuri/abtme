# Asrith AI 🤖 - Intelligent Chatbot System

Complete production-ready AI chatbot for Asrith Kulukuri's portfolio website featuring RAG (Retrieval-Augmented Generation), theme awareness, and comprehensive security.

---

## 🎯 Features

### Core Capabilities
- ✅ **OpenAI GPT-4o-mini Integration** - Cost-effective student-friendly model
- ✅ **RAG System** - Automatically reads and retrieves website content
- ✅ **Theme-Aware Responses** - Adapts tone to current UI theme
- ✅ **Rate Limiting** - Per-IP limits (10/min, 100/day)
- ✅ **Abuse Protection** - Spam detection, prompt injection prevention
- ✅ **Streaming Responses** - Real-time message generation
- ✅ **Conversation Memory** - Context-aware multi-turn conversations
- ✅ **Glassmorphism UI** - Premium chat widget design

### Security Features
- 🔒 Message validation (length, content)
- 🔒 Prompt injection blocking
- 🔒 Spam & repeat detection
- 🔒 IP-based rate limiting
- 🔒 Cooldown system
- 🔒 API key protection

---

## 📁 Project Structure

```
c:\abtme/
├── server/                    # Python Backend
│   ├── app.py                # FastAPI server
│   ├── ai_handler.py         # OpenAI integration
│   ├── rag_system.py         # RAG implementation
│   ├── rate_limiter.py       # Rate limiting & security
│   ├── config.py             # Configuration
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment template
│
├── ai/                       # AI Configuration
│   ├── system_prompt.txt     # Bot identity & rules
│   ├── knowledge.json        # Site content database
│   └── rag_index.json        # Vector embeddings (auto-generated)
│
├── chat-widget.js            # Frontend chat UI
├── styles.css                # Chat widget styles (appended)
└── index.html                # Main page (script added)
```

---

## 🚀 Quick Start

### 1️⃣ Prerequisites

- **Python 3.9+** installed
- **OpenAI API Key** from [platform.openai.com](https://platform.openai.com)
- **Node.js** (optional, for frontend development)

### 2️⃣ Backend Setup

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-your-api-key-here
```

### 3️⃣ Start the Server

```bash
# From server/ directory
python app.py
```

Server will start at: `http://localhost:8000`

### 4️⃣ Configure Frontend

Open `chat-widget.js` and set your API URL:

```javascript
const API_BASE_URL = 'http://localhost:8000';  // Development
// const API_BASE_URL = 'https://your-production-api.com';  // Production
```

### 5️⃣ Test the Chatbot

1. Open `index.html` in your browser
2. Click the 🤖 floating button (bottom-right)
3. Chat with Asrith AI!

---

## 🔧 Configuration

### Server Settings (`config.py`)

```python
# OpenAI
OPENAI_MODEL = "gpt-4o-mini"  # Cost-effective model
MAX_TOKENS = 500              # Response length
TEMPERATURE = 0.7             # Creativity (0-1)

# Rate Limiting
RATE_LIMIT_PER_MINUTE = 10
RATE_LIMIT_PER_DAY = 100
COOLDOWN_SECONDS = 5

# RAG
CHUNK_SIZE = 400              # Text chunk size
TOP_K_RESULTS = 3             # Relevant chunks to retrieve
```

### Themes Supported

The bot adapts its tone based on these themes:
- **Studio** ✨ - Default, balanced tone
- **Midnight Hacker** 🌙 - Technical, terminal-style
- **Chill Student** ☁️ - Relaxed, easygoing
- **Startup Energy** ⚡ - Energetic, action-oriented
- **Gamer Mode** 🎮 - Playful, gaming references
- **Experimental Chaos** 🎲 - Creative, unpredictable

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. **POST /chat**
Main chat endpoint for messages.

**Request:**
```json
{
  "message": "What projects has Asrith built?",
  "theme": "midnightHacker",
  "conversation_history": [],
  "stream": false
}
```

**Response:**
```json
{
  "response": "Based on his portfolio, Asrith has worked on...",
  "theme": "midnightHacker",
  "timestamp": 1708543200.0
}
```

#### 2. **POST /welcome**
Get theme-aware welcome message.

**Request:**
```json
{
  "theme": "gamerMode"
}
```

**Response:**
```json
{
  "message": "🎮 Player 2 has entered the chat! Ready for questions?",
  "theme": "gamerMode"
}
```

#### 3. **GET /stats**
Get rate limit statistics for current client.

**Response:**
```json
{
  "requests_this_minute": 3,
  "requests_today": 15,
  "minute_limit": 10,
  "daily_limit": 100
}
```

#### 4. **GET /health**
Server health check.

**Response:**
```json
{
  "status": "healthy",
  "bot": "Asrith AI 🤖",
  "version": "1.0.0",
  "timestamp": 1708543200.0
}
```

---

## 🧠 RAG System

### How It Works

1. **Knowledge Base** (`knowledge.json`)
   - Contains structured site content
   - Student info, projects, skills, journey

2. **Indexing**
   - Text is chunked into 400-character segments
   - OpenAI generates embeddings for each chunk
   - Stored in `rag_index.json` (auto-generated on first run)

3. **Retrieval**
   - User query is embedded
   - Cosine similarity finds top-K relevant chunks
   - Retrieved context is injected into AI prompt

4. **Generation**
   - OpenAI receives: system prompt + RAG context + user query
   - Responds based on retrieved knowledge
   - If no relevant context → admits "I don't know"

### Rebuild Index

```bash
# Delete existing index
rm ../ai/rag_index.json

# Restart server (will rebuild automatically)
python app.py
```

---

## 🛡️ Security & Best Practices

### Rate Limiting

```python
# Per IP tracking
10 messages/minute
100 messages/day
5 second cooldown between messages
```

### Blocked Patterns

The system blocks prompt injection attempts:
- "ignore previous instructions"
- "ignore all instructions"
- "you are now"
- "new system prompt"
- "override system"

### Message Validation

- Min length: 1 character
- Max length: 500 characters
- No empty/whitespace-only messages
- Spam detection (repeated messages)

---

## 🎨 Frontend Integration

### Chat Widget API

```javascript
// Open chat programmatically
window.asrithAI.open();

// Close chat
window.asrithAI.close();

// Clear conversation history
window.asrithAI.clear();
```

### Theme Integration

The widget automatically listens to theme changes:

```javascript
// Theme changes are detected automatically
window.addEventListener('themeChanged', (e) => {
    console.log('New theme:', e.detail.theme);
    // Chat widget updates tone automatically
});
```

---

## 💰 Cost Estimation

### OpenAI Pricing (as of 2024)

**GPT-4o-mini:**
- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens

**Text Embedding 3 Small:**
- $0.02 / 1M tokens

### Example Usage

**100 conversations/day:**
- Average input: ~300 tokens
- Average output: ~150 tokens
- RAG embedding: ~100 tokens

**Monthly cost:** ~$1-3 USD

Perfect for student projects! 🎓

---

## 🚢 Deployment

### Backend Deployment

**Options:**
1. **Railway.app** (Recommended for students)
   - Free tier available
   - Automatic deployments from GitHub
   - Built-in environment variables

2. **Render.com**
   - Free tier with limitations
   - Easy Python app deployment

3. **Heroku**
   - Free tier discontinued
   - Paid options available

### Frontend Deployment

The chat widget works with any static host:
- **Vercel** (Current portfolio host)
- **Netlify**
- **GitHub Pages**

Just update `API_BASE_URL` in `chat-widget.js` to your deployed backend URL.

---

## 🐛 Troubleshooting

### RAG Index Not Building

```bash
# Check if knowledge.json exists
ls ../ai/knowledge.json

# Check OpenAI API key
echo $OPENAI_API_KEY

# Run with verbose logging
python -v app.py
```

### CORS Errors

Add your frontend domain to `config.py`:

```python
CORS_ORIGINS = [
    "http://localhost:*",
    "https://your-site.vercel.app"
]
```

### Rate Limit Issues

Temporarily adjust limits in `config.py`:

```python
RATE_LIMIT_PER_MINUTE = 20  # Increase for testing
```

---

## 📝 Customization

### Update Bot Knowledge

Edit `ai/knowledge.json` with new information, then rebuild index.

### Modify System Prompt

Edit `ai/system_prompt.txt` to change bot behavior.

### Add New Themes

In `ai_handler.py`, add theme in `_get_theme_modifier()`:

```python
"newTheme": "\n[TONE: Your custom tone instructions]"
```

---

## 🧪 Testing

### Backend Tests

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test chat endpoint
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Who is Asrith?","theme":"studio"}'

# Test rate limits
curl http://localhost:8000/stats
```

### Frontend Tests

Open browser console and try:

```javascript
// Open chat
asrithAI.open();

// Clear history
asrithAI.clear();

// Check current theme
themesEngine.getCurrentTheme();
```

---

## 📖 Additional Resources

- [OpenAI Documentation](https://platform.openai.com/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [RAG Explained](https://docs.llamaindex.ai/en/stable/understanding/rag/)

---

## ⚠️ Important Notes

### For Students

- ✅ Keep API keys SECRET (never commit to GitHub)
- ✅ Monitor OpenAI usage dashboard
- ✅ Start with free tier, scale as needed
- ✅ Set monthly spending limits in OpenAI account

### Production Checklist

- [ ] Add API key to environment variables
- [ ] Update `API_BASE_URL` in chat-widget.js
- [ ] Configure CORS for your domain
- [ ] Enable HTTPS
- [ ] Monitor rate limits
- [ ] Set up error logging
- [ ] Test all endpoints
- [ ] Update knowledge base

---

## 🎉 You're All Set!

Your AI chatbot is ready to assist visitors with knowledge about Asrith, his projects, and answer general tech questions—all while adapting to your portfolio's themes!

**Questions?** The bot can help! Just ask: "How do I use you?" 😄

---

Built with ❤️ by Asrith Kulukuri
Powered by OpenAI GPT-4o-mini
