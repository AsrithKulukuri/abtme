/*
  Asrith AI Chat Widget
  Theme-aware floating chat with streaming responses
*/

(function () {
    const API_BASE_URL = window.__ASRITH_AI_API_URL || window.location.origin;
    const MAX_HISTORY = 10;  // Max messages to keep in memory

    let conversationHistory = [];
    let currentTheme = 'studio';
    let isOpen = false;
    let isTyping = false;

    // ===== Initialize Chat Widget =====

    function initChatWidget() {
        // Prevent duplicate initialization
        if (window._asrithAIInitialized) {
            console.log('🤖 Chat widget already initialized');
            return;
        }
        window._asrithAIInitialized = true;

        // Clean up any existing duplicate widgets
        const existingWidgets = document.querySelectorAll('#chatWidget');
        if (existingWidgets.length > 1) {
            console.log(`🧹 Removing ${existingWidgets.length - 1} duplicate chat widget(s)`);
            for (let i = 1; i < existingWidgets.length; i++) {
                existingWidgets[i].remove();
            }
        }

        // Listen for theme changes
        window.addEventListener('themeChanged', (e) => {
            currentTheme = e.detail.theme;
            updateChatTheme();
        });

        // Get current theme
        if (window.themesEngine) {
            currentTheme = window.themesEngine.getCurrentTheme();
        }

        // Create chat container
        createChatUI();

        // Bind events
        bindChatEvents();

        // Load welcome message
        loadWelcomeMessage();

        console.log('🤖 Asrith AI initialized');
    }

    // ===== UI Creation =====

    function createChatUI() {
        // Check if chat widget already exists
        if (document.getElementById('chatWidget')) {
            console.log('🤖 Chat widget already exists, skipping creation');
            return;
        }

        const chatHTML = `
            <div id="chatWidget" class="chat-widget">
                <!-- Chat Button -->
                <button id="chatToggle" class="chat-toggle" aria-label="Toggle chat" title="Chat with Asrith AI">
                    <span class="chat-toggle-icon">🤖</span>
                    <span class="chat-toggle-pulse"></span>
                </button>

                <!-- Chat Window -->
                <div id="chatWindow" class="chat-window" role="dialog" aria-labelledby="chatHeader">
                    <!-- Header -->
                    <div id="chatHeader" class="chat-header">
                        <div class="chat-header-info">
                            <span class="chat-header-icon">🤖</span>
                            <div>
                                <h3 class="chat-header-title">Asrith AI</h3>
                                <p class="chat-header-status">
                                    <span class="status-dot"></span> Online
                                </p>
                            </div>
                        </div>
                        <button id="chatClose" class="chat-close-btn" aria-label="Close chat">✕</button>
                    </div>

                    <!-- Messages Container -->
                    <div id="chatMessages" class="chat-messages" role="log" aria-live="polite">
                        <!-- Messages will be inserted here -->
                    </div>

                    <!-- Typing Indicator -->
                    <div id="typingIndicator" class="typing-indicator" style="display: none;">
                        <div class="typing-dots">
                            <span></span><span></span><span></span>
                        </div>
                        <span class="typing-text">Asrith AI is thinking...</span>
                    </div>

                    <!-- Input Area -->
                    <div class="chat-input-area">
                        <textarea 
                            id="chatInput" 
                            class="chat-input" 
                            placeholder="Ask about Asrith or anything tech..."
                            rows="1"
                            maxlength="500"
                        ></textarea>
                        <button id="chatSend" class="chat-send-btn" aria-label="Send message">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 10l16-8-8 8m0 0l-8 8m8-8v10"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Footer -->
                    <div class="chat-footer">
                        <span class="chat-footer-text">Theme: <span id="chatThemeLabel">Studio</span></span>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    // ===== Event Binding =====

    function bindChatEvents() {
        const toggle = document.getElementById('chatToggle');
        const close = document.getElementById('chatClose');
        const send = document.getElementById('chatSend');
        const input = document.getElementById('chatInput');

        // Toggle chat
        toggle.addEventListener('click', toggleChat);
        close.addEventListener('click', closeChat);

        // Send message
        send.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        });
    }

    // ===== Chat Actions =====

    function toggleChat() {
        isOpen = !isOpen;
        const chatWindow = document.getElementById('chatWindow');
        const chatToggle = document.getElementById('chatToggle');

        if (isOpen) {
            chatWindow.classList.add('open');
            chatToggle.classList.add('hidden');
            document.getElementById('chatInput').focus();
        } else {
            chatWindow.classList.remove('open');
            chatToggle.classList.remove('hidden');
        }
    }

    function closeChat() {
        isOpen = false;
        document.getElementById('chatWindow').classList.remove('open');
        document.getElementById('chatToggle').classList.remove('hidden');
    }

    // ===== Message Handling =====

    async function sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message || isTyping) return;

        // Add user message
        addMessage(message, 'user');
        input.value = '';
        input.style.height = 'auto';

        // Show typing indicator
        showTyping();

        try {
            // Call API
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    theme: currentTheme,
                    conversation_history: conversationHistory.slice(-6),  // Last 6 messages
                    stream: false
                })
            });

            hideTyping();

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Request failed');
            }

            const data = await response.json();

            // Add bot response
            addMessage(data.response, 'bot');

            // Update history
            conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: data.response }
            );

            // Trim history
            if (conversationHistory.length > MAX_HISTORY * 2) {
                conversationHistory = conversationHistory.slice(-MAX_HISTORY * 2);
            }

        } catch (error) {
            hideTyping();
            addMessage(`⚠️ ${error.message}. Please try again.`, 'error');
            console.error('Chat error:', error);
        }
    }

    function addMessage(content, type = 'bot') {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message chat-message-${type}`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'chat-message-bubble';
        bubbleDiv.textContent = content;

        messageDiv.appendChild(bubbleDiv);
        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTyping() {
        isTyping = true;
        document.getElementById('typingIndicator').style.display = 'flex';
        document.getElementById('chatSend').disabled = true;
    }

    function hideTyping() {
        isTyping = false;
        document.getElementById('typingIndicator').style.display = 'none';
        document.getElementById('chatSend').disabled = false;
    }

    // ===== Welcome Message =====

    async function loadWelcomeMessage() {
        try {
            const response = await fetch(`${API_BASE_URL}/welcome`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ theme: currentTheme })
            });

            if (response.ok) {
                const data = await response.json();
                setTimeout(() => {
                    addMessage(data.message, 'bot');
                }, 500);
            }
        } catch (error) {
            console.error('Failed to load welcome message:', error);
            addMessage("Hey 👋 I'm Asrith AI. Ask me anything!", 'bot');
        }
    }

    // ===== Theme Integration =====

    function updateChatTheme() {
        const themeLabel = document.getElementById('chatThemeLabel');
        if (themeLabel && window.themesEngine) {
            const themeConfig = window.themesEngine.getTheme(currentTheme);
            if (themeConfig) {
                themeLabel.textContent = themeConfig.name;
            }
        }
    }

    // ===== Initialize on DOM Ready =====

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatWidget);
    } else {
        initChatWidget();
    }

    // Expose API for debugging
    window.asrithAI = {
        open: () => { isOpen = false; toggleChat(); },
        close: closeChat,
        clear: () => {
            conversationHistory = [];
            document.getElementById('chatMessages').innerHTML = '';
            loadWelcomeMessage();
        }
    };

})();
