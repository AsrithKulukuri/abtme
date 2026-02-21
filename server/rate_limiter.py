"""
Rate Limiter & Abuse Protection
Prevents spam, abuse, and API overuse
"""

import time
from collections import defaultdict
from typing import Dict, Tuple
from config import (
    RATE_LIMIT_PER_MINUTE,
    RATE_LIMIT_PER_DAY,
    COOLDOWN_SECONDS,
    MAX_MESSAGE_LENGTH,
    MIN_MESSAGE_LENGTH,
    BLOCKED_PATTERNS,
)


class RateLimiter:
    def __init__(self):
        # Track requests per IP
        self.minute_tracker: Dict[str, list] = defaultdict(list)
        self.day_tracker: Dict[str, list] = defaultdict(list)
        self.last_request: Dict[str, float] = {}
        self.repeat_detector: Dict[str, list] = defaultdict(list)

    def check_rate_limit(self, ip_address: str) -> Tuple[bool, str]:
        """
        Check if request is within rate limits
        Returns: (is_allowed, error_message)
        """
        current_time = time.time()

        # Clean old entries
        self._cleanup_old_entries(ip_address, current_time)

        # Check per-minute limit
        minute_requests = self.minute_tracker[ip_address]
        if len(minute_requests) >= RATE_LIMIT_PER_MINUTE:
            return False, f"⏱️ Whoa, slow down! You can send {RATE_LIMIT_PER_MINUTE} messages per minute max."

        # Check per-day limit
        day_requests = self.day_tracker[ip_address]
        if len(day_requests) >= RATE_LIMIT_PER_DAY:
            return False, f"🚫 Daily limit reached ({RATE_LIMIT_PER_DAY} messages). Try again tomorrow!"

        # Check cooldown between messages
        if ip_address in self.last_request:
            time_since_last = current_time - self.last_request[ip_address]
            if time_since_last < COOLDOWN_SECONDS:
                remaining = int(COOLDOWN_SECONDS - time_since_last)
                return False, f"⏳ Wait {remaining}s before sending another message."

        # All checks passed
        self.minute_tracker[ip_address].append(current_time)
        self.day_tracker[ip_address].append(current_time)
        self.last_request[ip_address] = current_time

        return True, ""

    def _cleanup_old_entries(self, ip_address: str, current_time: float):
        """Remove entries older than tracking windows"""
        # Remove minute-old entries
        self.minute_tracker[ip_address] = [
            t for t in self.minute_tracker[ip_address] if current_time - t < 60
        ]

        # Remove day-old entries
        self.day_tracker[ip_address] = [
            t for t in self.day_tracker[ip_address] if current_time - t < 86400
        ]

    def validate_message(self, message: str) -> Tuple[bool, str]:
        """
        Validate message content for safety
        Returns: (is_valid, error_message)
        """
        # Check length
        if len(message) < MIN_MESSAGE_LENGTH:
            return False, "❌ Message too short. Please ask a question."

        if len(message) > MAX_MESSAGE_LENGTH:
            return False, f"❌ Message too long. Keep it under {MAX_MESSAGE_LENGTH} characters."

        # Check for spam (only whitespace)
        if not message.strip():
            return False, "❌ Empty message detected."

        # Check for prompt injection attempts
        message_lower = message.lower()
        for pattern in BLOCKED_PATTERNS:
            if pattern in message_lower:
                return False, "🚨 Suspicious message detected. Please ask a genuine question."

        return True, ""

    def detect_spam(self, ip_address: str, message: str) -> Tuple[bool, str]:
        """
        Detect repeated identical messages
        Returns: (is_spam, error_message)
        """
        recent_messages = self.repeat_detector[ip_address]

        # Keep only last 5 messages
        if len(recent_messages) >= 5:
            recent_messages.pop(0)

        # Check if message was sent recently
        if recent_messages.count(message) >= 2:
            return True, "🔁 You're repeating the same message. Try asking something different!"

        recent_messages.append(message)
        return False, ""

    def get_stats(self, ip_address: str) -> dict:
        """Get usage statistics for an IP"""
        current_time = time.time()
        self._cleanup_old_entries(ip_address, current_time)

        return {
            "requests_this_minute": len(self.minute_tracker[ip_address]),
            "requests_today": len(self.day_tracker[ip_address]),
            "minute_limit": RATE_LIMIT_PER_MINUTE,
            "daily_limit": RATE_LIMIT_PER_DAY,
        }


# Global instance
rate_limiter = RateLimiter()
