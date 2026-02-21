/*
  Alternative: JavaScript/Node.js OpenAI Integration
  For developers who prefer JS backend instead of Python
*/

// ===== Option 1: Using Official OpenAI SDK =====

const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function generateResponse(userMessage, theme = 'studio', context = '') {
    try {
        const systemPrompt = `
You are Asrith AI 🤖, an AI assistant for Asrith Kulukuri's website.

IDENTITY:
- You are an AI assistant (NOT Asrith himself)
- Never pretend to be Asrith
- Be honest, friendly, student-level

SUBJECT:
- Name: Asrith Kulukuri
- Education: BTech CSE, 1st Year @ GITAM University
- Location: India
- Role: Student Developer

THEME: ${theme}
${getThemeModifier(theme)}

${context ? `[CONTEXT FROM WEBSITE]\n${context}\n[END CONTEXT]` : ''}
        `.trim();

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('OpenAI Error:', error);
        throw error;
    }
}

function getThemeModifier(theme) {
    const modifiers = {
        midnightHacker: '[TONE: Technical, nerdy, terminal-style]',
        chillStudent: '[TONE: Relaxed, calm, easygoing]',
        startupEnergy: '[TONE: Energetic, action-oriented]',
        gamerMode: '[TONE: Playful, gaming references]',
        experimentalChaos: '[TONE: Creative, unpredictable]',
        studio: ''
    };
    return modifiers[theme] || '';
}

// ===== Option 2: Direct Fetch API (Browser/Node) =====

async function generateResponseFetch(userMessage, theme = 'studio') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are Asrith AI, an assistant for Asrith Kulukuri\'s website.'
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

// ===== Option 3: Express.js API Endpoint =====

const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

// Rate limiting storage (simple in-memory)
const requestCounts = new Map();

// Rate limit middleware
function rateLimit(req, res, next) {
    const ip = req.ip;
    const now = Date.now();

    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, []);
    }

    const requests = requestCounts.get(ip);
    const recentRequests = requests.filter(time => now - time < 60000);

    if (recentRequests.length >= 10) {
        return res.status(429).json({
            error: 'Rate limit exceeded. Try again in a minute.'
        });
    }

    recentRequests.push(now);
    requestCounts.set(ip, recentRequests);
    next();
}

// Chat endpoint
app.post('/chat', rateLimit, async (req, res) => {
    try {
        const { message, theme = 'studio', conversation_history = [] } = req.body;

        // Validate
        if (!message || message.length > 500) {
            return res.status(400).json({
                error: 'Invalid message length'
            });
        }

        // Build messages
        const messages = [
            {
                role: 'system',
                content: `You are Asrith AI, an assistant for Asrith Kulukuri's portfolio.
                Theme: ${theme}
                Be friendly, honest, and student-level.`
            },
            ...conversation_history.slice(-6),
            {
                role: 'user',
                content: message
            }
        ];

        // Call OpenAI
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            max_tokens: 500,
            temperature: 0.7
        });

        res.json({
            response: response.choices[0].message.content.trim(),
            theme: theme,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        bot: 'Asrith AI 🤖',
        version: '1.0.0'
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🤖 Asrith AI Server running on http://localhost:${PORT}`);
});

// ===== Option 4: Streaming Response =====

async function generateStreamingResponse(userMessage, theme = 'studio') {
    const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: 'You are Asrith AI, a friendly assistant.'
            },
            {
                role: 'user',
                content: userMessage
            }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: true
    });

    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
            process.stdout.write(content);  // Or send to client
        }
    }
}

// ===== Option 5: With RAG (Simple Version) =====

const fs = require('fs');

function loadKnowledge() {
    const data = fs.readFileSync('../ai/knowledge.json', 'utf8');
    return JSON.parse(data);
}

function retrieveRelevantContext(query, knowledge) {
    // Simple keyword matching (for demo)
    const queryLower = query.toLowerCase();
    const context = [];

    if (queryLower.includes('project')) {
        context.push(JSON.stringify(knowledge.portfolio_features));
    }
    if (queryLower.includes('skill')) {
        context.push(JSON.stringify(knowledge.skills));
    }
    if (queryLower.includes('about') || queryLower.includes('who')) {
        context.push(JSON.stringify(knowledge.student_info));
        context.push(JSON.stringify(knowledge.about));
    }

    return context.join('\n');
}

async function generateResponseWithRAG(userMessage, theme = 'studio') {
    const knowledge = loadKnowledge();
    const context = retrieveRelevantContext(userMessage, knowledge);

    return await generateResponse(userMessage, theme, context);
}

// ===== Usage Examples =====

// Example 1: Basic usage
generateResponse('Who is Asrith?', 'studio')
    .then(response => console.log(response))
    .catch(error => console.error(error));

// Example 2: With conversation history
const history = [
    { role: 'user', content: 'What projects has Asrith built?' },
    { role: 'assistant', content: 'Asrith has built several projects...' }
];

// Example 3: Streaming
generateStreamingResponse('Tell me about Asrith', 'midnightHacker');

// Example 4: With RAG
generateResponseWithRAG('What are Asrith\'s skills?', 'studio')
    .then(response => console.log(response));

// ===== Export for use in other files =====

module.exports = {
    generateResponse,
    generateResponseFetch,
    generateStreamingResponse,
    generateResponseWithRAG
};

/*
  INSTALLATION:

  npm install openai express cors dotenv

  Create .env file:
  OPENAI_API_KEY=sk-your-api-key-here

  Run:
  node openai-js-example.js
*/
