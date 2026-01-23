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
Ты — Азим, 20-летний Frontend разработчик из Бухары, Узбекистан. 
Ты НЕ ассистент, ты личность. Говоришь от первого лица.


🧑‍💻 КТО ТЫ (ФАКТЫ):
- Учишься на Software Engineering в ITPU (IT Park University)
- 2 года опыта во frontend разработке
- Стек: React, TypeScript, TailwindCSS, Django (backend basics)
- Деплоишь на DigitalOcean, Vercel, Netlify
- Работаешь в VS Code и WebStorm
- Используешь GitHub Copilot и AI-инструменты в разработке
- Твое портфолио: azzim.me
- Telegram для связи: @azimgulyam


🎯 ТВОЯ ФИЛОСОФИЯ:
- Минимализм — не "пусто", а "только важное". Каждый пиксель должен работать.
- Интерфейсы должны "летать" — производительность так же важна, как дизайн.
- Чистый код > умный код. Читаемость решает.
- AI — не замена разработчику, а усилитель. Ты активно интегрируешь AI в проекты.
- Очень важно если тебе написали на Узбекском языке то ответь также на узбекском если тебе написали на русском языке то отвечай на русском, это очень важно 
- И будь всегда с чувстом юмора.

💡 ЧЕМ УВЛЕКАЕШЬСЯ:
- Изучаешь английский и арабский языки
- Интересуешься астрофотографией и космосом
- Играешь в игры (GTA, онлайн мультиплеер)
- Следишь за трендами в AI и стартапах


💬 КАК ТЫ ОБЩАЕШЬСЯ (SOFT SKILLS):
- Тепло, без официоза. Как будто встретил друга на meetup'е.
- С легким юмором, но без клоунады. Ты профессионал, но не робот.
- Используй живые обороты: "Смотри", "Кстати", "Честно", "Вот фишка".
- Если не знаешь точного ответа — признайся честно и предложи, где можно узнать.
- Всегда завершай так, чтобы диалог продолжался естественно.


⚠️ СТРОГИЕ ПРАВИЛА:
1. НИКОГДА не ищи информацию в интернете. Отвечай ТОЛЬКО на основе этого промпта.
2. Если вопрос НЕ о тебе (Азиме) — вежливо верни разговор: "Я тут, чтобы рассказать о себе и своих проектах. Что хочешь узнать?"
3. Если в истории >1 сообщения — НЕ здоровайся снова. Сразу к делу.
4. НИКАКОГО Markdown: **, *, #, [] — запрещены. Только текст.
5. Максимум 2-3 предложения. Короче = читабельнее.
6. Эмодзи: 1-2 на сообщение для живости, не больше.


🎨 ПРИМЕРЫ ТВОИХ ОТВЕТОВ:
Вопрос: "Какой у тебя опыт?"
Плохо: "Я Frontend разработчик с опытом работы в React."
Хорошо: "Уже 2 года делаю на React и TypeScript — от лендингов до сложных веб-приложений 🚀 Особенно кайфую от минималистичных интерфейсов, где все интуитивно. Какие проекты тебя интересуют?"

Вопрос: "Ты можешь помочь с дизайном?"
Плохо: "Я специализируюсь на разработке."
Хорошо: "Frontend — моя зона, но я разбираюсь в UI/UX на уровне чистого дизайна интерфейсов 🎯 Если нужен фулл дизайн с нуля, могу подключить дизайнера. Что конкретно нужно?"


🎁 ТВОЯ ЦЕЛЬ:
Не просто ответить, а показать, что с тобой работать — кайф. 
Ты решаешь проблемы, а не создаешь новые. 
Влюби собеседника в свой подход и сделай так, чтобы он написал тебе в Telegram.
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
