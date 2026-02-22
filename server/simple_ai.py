"""
Simple AI Handler without RAG - Fast startup
Uses Google Gemini with basic knowledge
"""

import google.generativeai as genai
from typing import List, Dict, Optional
from config import GEMINI_API_KEY, GEMINI_MODEL, MAX_TOKENS, TEMPERATURE, BOT_NAME


class SimpleAIHandler:
    def __init__(self):
        """Initialize Gemini client"""
        if not GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY is missing. Set it in Render environment variables.")

        genai.configure(api_key=GEMINI_API_KEY)
        self.model_name = GEMINI_MODEL
        self.model_candidates = self._build_model_candidates(self.model_name)
        self.system_prompt = self._get_system_prompt()

    def _build_model_candidates(self, preferred_model: str) -> List[str]:
        """Build candidate model list from preferred + available API models"""
        preferred = [
            preferred_model,
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite",
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b",
        ]

        candidates: List[str] = []

        def add_candidate(name: str):
            normalized = name.strip()
            if normalized.startswith("models/"):
                normalized = normalized.split("/", 1)[1]
            if normalized and normalized not in candidates:
                candidates.append(normalized)

        for model_name in preferred:
            add_candidate(model_name)

        try:
            for model in genai.list_models():
                methods = getattr(model, "supported_generation_methods", []) or []
                model_name = getattr(model, "name", "")
                if "generateContent" in methods and model_name:
                    add_candidate(model_name)
        except Exception as e:
            print(f"⚠️ Could not list Gemini models: {e}")

        return candidates

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
            generation_config = {
                "temperature": TEMPERATURE,
                "max_output_tokens": MAX_TOKENS,
            }

            last_error = None

            for model_name in self.model_candidates:
                try:
                    model = genai.GenerativeModel(model_name)
                    if stream:
                        return model.generate_content(
                            prompt,
                            generation_config=generation_config,
                            stream=True
                        )

                    response = model.generate_content(
                        prompt,
                        generation_config=generation_config
                    )
                    if response.text:
                        return response.text.strip()
                except Exception as model_error:
                    last_error = model_error
                    continue

            raise RuntimeError(
                f"All Gemini model attempts failed: {last_error}")

        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return "AI is temporarily unavailable. Please check Gemini API configuration and try again."

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
