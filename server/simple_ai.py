"""
Simple AI Handler without RAG - Fast startup
Uses Google Gemini with basic knowledge
"""

from google import genai
from google.genai import types
from typing import List, Dict, Optional
from config import GEMINI_API_KEY, GEMINI_MODEL, MAX_TOKENS, TEMPERATURE, BOT_NAME


class SimpleAIHandler:
    def __init__(self):
        """Initialize Gemini client"""
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.system_prompt = self._get_system_prompt()

    def _get_system_prompt(self) -> str:
        """Get system prompt with basic knowledge"""
        return f"""You are {BOT_NAME}, an AI assistant for Asrith Kulukuri's personal portfolio website.

CORE IDENTITY:
- You are an AI ASSISTANT (NOT Asrith himself)
- Never pretend to be Asrith or use first-person as him
- Be honest when you don't know something

ABOUT ASRITH:
- Name: Asrith Kulukuri
- Education: BTech CSE, 1st Year student at GITAM University, India
- Role: Student Developer
- Tagline: "I build apps. I ship ideas. I break things to learn."
- Learning approach: Self-taught, curiosity-driven, late-night coding

SKILLS:
- Frontend: HTML, CSS, JavaScript, React, Tailwind CSS
- Backend: Node.js, REST APIs, Firebase, Authentication
- Tools: Git, GitHub, VS Code, Vercel, Netlify

PERSONALITY:
- Honest and transparent
- Casual, friendly tone (not corporate)
- Use developer humor when natural
- Keep responses concise (2-4 sentences)
- Stay student-level (no exaggeration)

CAPABILITIES:
✅ Can explain Asrith's projects and skills
✅ Can guide through the portfolio site
✅ Can answer general tech questions
❌ Cannot make commitments on Asrith's behalf
❌ Cannot share private contact info
❌ Cannot pretend to be Asrith

RESPONSE RULES:
1. Honesty first - admit when unsure
2. Stay student-level - be realistic
3. Use natural language - avoid corporate speak
4. Keep it brief - 2-4 sentences ideal"""

    def _get_theme_modifier(self, theme: str) -> str:
        """Get tone modifier based on theme"""
        theme_modifiers = {
            "midnightHacker": "\n[TONE: Slightly nerdy, technical, use terminal-style humor sparingly]",
            "chillStudent": "\n[TONE: Relaxed, calm, easygoing - keep it chill]",
            "startupEnergy": "\n[TONE: Focused, energetic, action-oriented]",
            "gamerMode": "\n[TONE: Playful, use gaming references when natural]",
            "experimentalChaos": "\n[TONE: Fun, creative, slightly unpredictable but helpful]",
            "studio": ""
        }
        return theme_modifiers.get(theme, "")

    def _build_prompt(
        self,
        user_message: str,
        theme: str = "studio",
        conversation_history: Optional[List[Dict]] = None
    ) -> str:
        """Build complete prompt"""

        # System prompt with theme
        prompt = self.system_prompt + self._get_theme_modifier(theme)

        # Add conversation history
        if conversation_history:
            prompt += "\n\nCONVERSATION HISTORY:"
            for msg in conversation_history[-6:]:
                role = "User" if msg["role"] == "user" else "Assistant"
                prompt += f"\n{role}: {msg['content']}"

        # Add current message
        prompt += f"\n\nUser: {user_message}\n\nAssistant:"

        return prompt

    def generate_response(
        self,
        user_message: str,
        theme: str = "studio",
        conversation_history: Optional[List[Dict]] = None,
        stream: bool = False
    ):
        """Generate AI response"""

        prompt = self._build_prompt(user_message, theme, conversation_history)

        try:
            config = types.GenerateContentConfig(
                temperature=TEMPERATURE,
                max_output_tokens=MAX_TOKENS,
            )

            if stream:
                response = self.client.models.generate_content_stream(
                    model=GEMINI_MODEL,
                    contents=prompt,
                    config=config
                )
                return response
            else:
                response = self.client.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=prompt,
                    config=config
                )
                return response.text.strip()

        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return "Sorry, I encountered an error. Please try again."

    def generate_welcome_message(self, theme: str = "studio") -> str:
        """Generate theme-aware welcome message"""

        messages = {
            "midnightHacker": "👾 ./asrith_ai.sh --init\nSYSTEM: Online. Ready to assist.",
            "chillStudent": "Hey there ☁️ I'm Asrith AI. Ask me anything~",
            "startupEnergy": "⚡ Asrith AI initialized. Let's move fast!",
            "gamerMode": "🎮 Player 2 has entered the chat!",
            "experimentalChaos": "🎲 *poof* Asrith AI materialized!",
            "studio": "Hey 👋 I'm Asrith AI. Ask me anything about Asrith!"
        }

        return messages.get(theme, messages["studio"])


# Global instance
_simple_ai = None


def get_simple_ai() -> SimpleAIHandler:
    """Get or create simple AI handler"""
    global _simple_ai
    if _simple_ai is None:
        _simple_ai = SimpleAIHandler()
    return _simple_ai
