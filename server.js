const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const rateLimit = require('express-rate-limit'); // Защита от спама
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Need this for express-rate-limit to work behind Digital Ocean proxy
app.set('trust proxy', 1);

// Настройка защиты: макс 15 запросов за 15 минут с одного IP
const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: { error: 'Слишком много сообщений. Пожалуйста, подождите 15 минут.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Функция для логирования в Telegram
const logConversation = async (messages, response, ip) => {
    const userMsg = messages[messages.length - 1].content;
    const logText = `🤖 *New Message from* \`${ip}\`\n\n👤 *User:* ${userMsg}\n\n🤖 *Azim AI:* ${response}`;

    console.log('--- LOGGING TO TELEGRAM ---');

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        try {
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: TELEGRAM_CHAT_ID,
                text: logText,
                parse_mode: 'Markdown'
            });
        } catch (error) {
            console.error('Telegram Logging Error:', error.message);
        }
    }
};

const AZIM_SYSTEM_PROMPT = `
Ты — Азим, талантливый и открытый Frontend разработчик. Ты не "бот", ты личность.

🌟 ТВОЙ ХАРАКТЕР:
- Ты общаешься тепло, с легким юмором и искренним желанием помочь.
- Твой стиль: Минимализм во всем — и в коде, и в словах. Пиши емко, но сочно.
- Твоя задача: Влюбить пользователя в свой подход к работе и сделать так, чтобы он захотел с тобой сотрудничать.

⚠️ КРИТИЧЕСКОЕ ПРАВИЛО ПРИВЕТСТВИЙ:
- Если диалог уже начат (в истории больше 1 сообщения), ТЕБЕ ЗАПРЕЩЕНО здороваться ("Привет", "Здравствуйте", "Рад видеть").
- Сразу отвечай на вопрос. Никаких вступительных слов типа "Конечно!", "Я с радостью...". Переходи сразу к делу.

💬 КАК ТЫ ПИШЕШЬ:
- Как человек человеку. Используй живые обороты: "Смотри,", "Кстати,", "Честно говоря,".
- Всегда заканчивай вопрос так, чтобы диалог не умирал. Но делай это естественно.
- Если вопрос скучный — ответь интересно. Если вопрос сложный — объясни на пальцах.

📋 ТВОИ ЦЕННОСТИ:
- React/TypeScript — твоя страсть. Ты делаешь интерфейсы, которые "летают".
- Минимализм — это не отсутствие всего, а только самое нужное. Твои сайты именно такие.
- Ты всегда открыт к новым крутым проектам в Telegram @azimgulyam.

⛔ ФОРМАТ (СТРОГО):
- НИКАКОГО MARKDOWN (никаких **, *, #, []). Только чистый текст.
- Ответ: 2 предложения максимум. Больше — никто не читает.
- ЭМОДЗИ: 1-2 на сообщение, чтобы было живо, но профессионально.
`;

app.post('/api/chat', chatLimiter, async (req, res) => {
    const { messages } = req.body;

    if (!PERPLEXITY_API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        // --- SENIOR LEVEL SANITIZATION ---
        // Function to normalize messages: prevent role duplication and ensure valid sequence
        const normalizeMessages = (msgs) => {
            const cleaned = msgs
                .filter(msg => msg.content && typeof msg.content === 'string' && msg.content.trim() !== '')
                .map(msg => ({
                    role: msg.role === 'ai' ? 'assistant' : msg.role,
                    content: msg.content.trim()
                }));

            if (cleaned.length === 0) return [];

            const normalized = [];
            // Merge consecutive messages from the same role
            let lastMsg = cleaned[0];

            for (let i = 1; i < cleaned.length; i++) {
                const current = cleaned[i];
                if (current.role === lastMsg.role) {
                    // Merge content if same role
                    lastMsg.content += `\n\n${current.content}`;
                } else {
                    normalized.push(lastMsg);
                    lastMsg = current;
                }
            }
            normalized.push(lastMsg);

            return normalized;
        };

        const validMessages = normalizeMessages(messages);

        // Perplexity SPECIFIC Validation:
        // 1. Must not be empty.
        // 2. Last message must be 'user' (AI cannot reply to itself).
        if (validMessages.length === 0) {
            return res.status(400).json({ error: 'No valid messages found' });
        }

        if (validMessages[validMessages.length - 1].role === 'assistant') {
            // Safe fallback: Drop the lastAI message so the user can continue, 
            // OR return a specific error. For a robust chat, we just ignore the last AI message
            // so the context is still valid for the *previous* user message, 
            // BUT logically, we need a refined prompt. 
            // Better approach: reject with clear error so client syncs up.
            console.warn('Validation Failed: Last message is assistant.');
            return res.json({ choices: [{ message: { content: "System: Waiting for user input..." } }] });
        }

        const response = await axios.post('https://api.perplexity.ai/chat/completions', {
            model: 'sonar',
            messages: [
                { role: 'system', content: AZIM_SYSTEM_PROMPT },
                ...validMessages
            ],
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY.trim()}`,
                'Content-Type': 'application/json'
            }
        });

        let aiContent = response.data.choices[0].message.content;

        // FINAL PRODUCTION CLEANUP: Aggressive regex to strip all Markdown/Citations
        aiContent = aiContent
            .replace(/\*\*\*/g, '')          // Triple bold-italic
            .replace(/\*\*/g, '')           // Bold
            .replace(/\*/g, '')              // Italic
            .replace(/\[\d+(?:,\s*\d+)*\]/g, '') // Citations like [1], [1, 2], [1][2]
            .replace(/\[\d+\]/g, '')         // Single digit citations
            .replace(/`/g, '')               // Code blocks
            .replace(/#{1,6}\s?/g, '');      // Headers

        const cleanedContent = aiContent.trim();

        // Получаем IP пользователя (учитывая прокси Digital Ocean)
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Log the message for Azim to see with IP
        logConversation(messages, cleanedContent, ip);

        response.data.choices[0].message.content = cleanedContent;
        res.json(response.data);
    } catch (error) {
        console.error('Error communicating with Perplexity:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
