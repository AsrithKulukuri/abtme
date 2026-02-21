"""Quick test of Gemini API"""
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key loaded: {api_key[:20]}..." if api_key else "No API key found")

client = genai.Client(api_key=api_key)

try:
    print("Testing Gemini API...")
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Say hello in one sentence"
    )
    print(f"✅ Success: {response.text}")
except Exception as e:
    print(f"❌ Error: {str(e)}")
