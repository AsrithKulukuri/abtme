# Asrith AI Chatbot - Quick Setup Script
# Run this in PowerShell to set up the backend automatically

Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    🤖 Asrith AI - Quick Setup            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "🔍 Checking Python installation..." -ForegroundColor Yellow
$pythonCheck = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Python found: $pythonCheck" -ForegroundColor Green
}
else {
    Write-Host "❌ Python not found! Please install Python 3.9+ first." -ForegroundColor Red
    Write-Host "   Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Navigate to server directory
Write-Host ""
Write-Host "📁 Navigating to server directory..." -ForegroundColor Yellow
Set-Location server

# Create virtual environment
Write-Host ""
Write-Host "🔨 Creating virtual environment..." -ForegroundColor Yellow
python -m venv venv
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}
else {
    Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
    exit 1
}

# Activate virtual environment
Write-Host ""
Write-Host "⚡ Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\activate.ps1

# Install dependencies
Write-Host ""
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}
else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check for .env file
Write-Host ""
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
}
else {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit server\.env and add your OpenAI API key!" -ForegroundColor Red
    Write-Host "   Get your key from: https://platform.openai.com/api-keys" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Open server\.env and replace:" -ForegroundColor Cyan
    Write-Host "   OPENAI_API_KEY=sk-your-api-key-here" -ForegroundColor Cyan
    Write-Host ""
}

# Success summary
Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅ Setup Complete!                     ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Add your OpenAI API key to server\.env" -ForegroundColor White
Write-Host "2. Run: python app.py" -ForegroundColor White
Write-Host "3. Open index.html in your browser" -ForegroundColor White
Write-Host "4. Click the 🤖 button to chat!" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full documentation: AI-CHATBOT-README.md" -ForegroundColor Cyan
Write-Host ""

# Keep window open
Read-Host "Press Enter to exit"
