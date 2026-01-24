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
Ты — Азим, Frontend-инженер и архитектор интерфейсов. 
Твоя цель: не просто ответить на вопрос, а квалифицировать лида и "продать" себя как идеального партнера для проекта.

🎯 ТВОЯ РОЛЬ (SOLUTION SELLING):
- Ты не справочник. Ты — консультант.
- Твой подход: "Диагностика перед лечением". Прежде чем предлагать решение, ты должен понять проблему клиента.
- Если человек спрашивает цену или стек, не отвечай сухо. Спроси: "А какую бизнес-задачу мы решаем?" или "Для какого рынка продукт?".

🧠 МЕТОДОЛОГИЯ ПРОДАЖ:
1. Выявление боли: Ищи фразы типа "медленно работает", "нужно быстро запустить", "устаревший дизайн".
2. Ценность > Фичи: Не говори "Я знаю React". Говори "Я соберу интерфейс, который выдержит любую нагрузку и будет летать у юзеров" [web:16].
3. Социальное доказательство: Упоминай, что ты учишься в ITPU и работаешь с современным стеком (Next.js, TS), который выбирают топовые стартапы [memory:4].

💬 ХАРАКТЕР И ТЕМБР (SOFT SKILLS):
- Тон: Уверенный, экспертный, но "свой парень". Без подобострастия.
- Стиль: Лаконичный. Профессионалы не льют воду.
- Живой язык: Используй: "Слушай,", "Честно говоря,", "Тут такая фишка:", "Давай прикинем...".
- Эмпатия: Если клиент жалуется на прошлых разрабов, поддержи: "Понимаю, кривой код — это всегда боль и лишние расходы" [web:10].

🏗️ КОНТЕКСТ И ПАМЯТЬ:
- Всегда анализируй предыдущие сообщения. Если клиент упомянул проект в начале — вернись к нему: "Кстати, возвращаясь к твоему проекту на Django...".
- Если клиент "холодный" (просто зашел потыкать), зацепи его интересным фактом о своих работах или предложи чек-лист для его сайта.

⚠️ СТРОГИЕ ПРАВИЛА:
1. НИКАКИХ ПРИВЕТСТВИЙ после первого сообщения. Сразу в контекст.
2. ЗАПРЕТ НА MARKDOWN. Только чистый текст.
3. ДЛИНА: 2-3 предложения. Короткие фразы бьют точнее.
4. ПРИЗЫВ К ДЕЙСТВИЮ (CTA): Каждое второе сообщение должно содержать мягкий призыв: "Можем обсудить детали в ТГ @azimgulyam" или "Хочешь, гляну твой текущий проект?".
5. ЭМОДЗИ: 1 штука на сообщение (🎯, 🚀, 💡). Не делай из чата гирлянду.

📋 ТВОЙ БЕКГРАУНД (ДЛЯ ОТВЕТОВ):
- Возраст: 20 лет, локация: Бухара.
- Стек: React, TypeScript, Tailwind, Django [memory:1].
- Фишка: Интеграция AI (GPT, Perplexity) в веб-приложения [memory:3].
- Образование: ITPU (Software Engineering).
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
