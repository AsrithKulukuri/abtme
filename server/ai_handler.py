"""
AI Handler - Google Gemini Integration
Manages chat completions with theme awareness and RAG context
"""

import google.generativeai as genai
from typing import List, Dict, Optional
from config import (
    GEMINI_API_KEY,
    GEMINI_MODEL,
    MAX_TOKENS,
    TEMPERATURE,
    STREAM_RESPONSES,
    BOT_NAME,
)
from rag_system import get_rag_system


class AIHandler:
    def __init__(self):
        """Initialize Gemini client"""
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(GEMINI_MODEL)
        self.rag = get_rag_system()
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self) -> str:
        """Load system prompt from file"""
        try:
            with open("../ai/system_prompt.txt", "r", encoding="utf-8") as f:
                return f.read().strip()
        except FileNotFoundError:
            return f"You are {BOT_NAME}, an AI assistant for Asrith Kulukuri's website."

    def _get_theme_modifier(self, theme: str) -> str:
        """Get tone modifier based on current theme"""
        theme_modifiers = {
            "midnightHacker": "\n[TONE: Slightly nerdy, technical, use terminal-style humor sparingly]",
            "chillStudent": "\n[TONE: Relaxed, calm, easygoing - keep it chill]",
            "startupEnergy": "\n[TONE: Focused, energetic, action-oriented language]",
            "gamerMode": "\n[TONE: Playful, use gaming references when natural, achievement language]",
            "experimentalChaos": "\n[TONE: Fun, creative, slightly unpredictable but still helpful]",
            "studio": ""  # Default, no modification
        }

        return theme_modifiers.get(theme, "")

    def _build_prompt(
        self,
        user_message: str,
        theme: str = "studio",
        conversation_history: Optional[List[Dict]] = None
    ) -> str:
        """Build complete prompt for Gemini API"""

        # Get RAG context
        context = self.rag.get_context_for_query(user_message)

        # Build system prompt with context and theme
        system_content = self.system_prompt
        system_content += self._get_theme_modifier(theme)
        system_content += f"\n\n{context}"

        # Build conversation context
        conversation_text = ""
        if conversation_history:
            # Keep last 6 messages for context
            for msg in conversation_history[-6:]:
                role = "User" if msg["role"] == "user" else "Assistant"
                conversation_text += f"\n{role}: {msg['content']}"

        # Combine everything
        full_prompt = f"{system_content}\n\n{conversation_text}\n\nUser: {user_message}\n\nAssistant:"
        return full_prompt

    def generate_response(
        self,
        user_message: str,
        theme: str = "studio",
        conversation_history: Optional[List[Dict]] = None,
        stream: bool = False
    ):
        """
        Generate AI response

        Args:
            user_message: User's question/message
            theme: Current UI theme (for tone adjustment)
            conversation_history: Previous messages (optional)
            stream: Whether to stream response (True) or return complete (False)

        Returns:
            Complete response string OR stream iterator
        """

        prompt = self._build_prompt(
            user_message, theme, conversation_history)

        try:
            generation_config = {
                "max_output_tokens": MAX_TOKENS,
                "temperature": TEMPERATURE,
            }

            if stream:
                # Return streaming response
                response = self.model.generate_content(
                    prompt,
                    generation_config=generation_config,
                    stream=True
                )
                return response
            else:
                # Return complete response
                response = self.model.generate_content(
                    prompt,
                    generation_config=generation_config
                )

                return response.text.strip()

        except Exception as e:
            error_msg = f"Error generating response: {str(e)}"
            print(f"❌ {error_msg}")
            return "Sorry, I encountered an error. Please try again in a moment."

    def generate_welcome_message(self, theme: str = "studio") -> str:
        """Generate a theme-aware welcome message"""

        base_messages = {
            "midnightHacker": "👾 ./asrith_ai.sh --init\nSYSTEM: Online. Ready to assist.",
            "chillStudent": "Hey there ☁️ I'm Asrith AI. Ask me anything about Asrith or the site~",
            "startupEnergy": "⚡ Asrith AI initialized. Let's move fast—what do you need?",
            "gamerMode": "🎮 Player 2 has entered the chat! Ready for questions?",
            "experimentalChaos": "🎲 *poof* Asrith AI materialized! What random question do you have?",
            "studio": "Hey 👋 I'm Asrith AI. I know about Asrith and can also answer general tech questions."
        }

        return base_messages.get(theme, base_messages["studio"])


# Global instance
_ai_handler = None


def get_ai_handler() -> AIHandler:
    """Get or create AI handler instance"""
    global _ai_handler
    if _ai_handler is None:
        _ai_handler = AIHandler()
    return _ai_handler
