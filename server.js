const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const rateLimit = require('express-rate-limit'); // Защита от спама
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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
        const response = await axios.post('https://api.perplexity.ai/chat/completions', {
            model: 'sonar',
            messages: [
                { role: 'system', content: AZIM_SYSTEM_PROMPT },
                ...messages
            ],
            temperature: 0.7, // Повышаем для живости речи
        }, {
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
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
