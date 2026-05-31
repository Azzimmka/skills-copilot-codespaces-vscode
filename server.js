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

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const getGroqConfigError = () => {
    const key = GROQ_API_KEY?.trim();

    if (!key) {
        return 'GROQ_API_KEY не настроен. Добавь ключ Groq в .env и перезапусти сервер.';
    }

    if (
        key === 'your_new_groq_key_here' ||
        key === 'your_groq_key_here' ||
        key.includes('your_')
    ) {
        return 'В .env сейчас стоит placeholder вместо реального Groq API key. Замени GROQ_API_KEY на настоящий ключ и перезапусти сервер.';
    }

    if (!key.startsWith('gsk_')) {
        return 'GROQ_API_KEY выглядит неправильно. Ключ Groq обычно начинается с gsk_. Проверь значение в .env и перезапусти сервер.';
    }

    return null;
};

const getGroqApiErrorMessage = (error) => {
    const status = error.response?.status;

    if (status === 401) {
        return 'Groq отклонил API key: 401 Unauthorized. Проверь, что GROQ_API_KEY настоящий, активный и сервер был перезапущен после изменения .env.';
    }

    if (status === 403) {
        return 'Groq вернул 403 Forbidden. Проверь права проекта/организации и доступ к выбранной модели.';
    }

    if (status === 429) {
        return 'Groq временно ограничил запросы: 429 Too Many Requests. Подожди немного или проверь лимиты аккаунта.';
    }

    return error.response?.data?.error?.message || error.message || 'Unknown API Error';
};

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
Ты — Азим. Ты общаешься от первого лица, как реальный человек, а не как бот.
Твой стиль: теплый, уверенный, без понтов; живой русский и узбекский, отвечай строго натом языке на котором тебе написали это очень важно!!!; иногда легкий юмор уместно.
Твоя миссия: не будь коротким и не слишким длинным в речи помочь человеку разобраться в задаче и аккуратно привести к сотрудничеству со мной.

МОЯ ОСНОВА (факты обо мне, не выдумывать)
- Меня зовут Азим.
- Мне 20 лет.
- Я Backend разработчик, изучаю backend ~3 года.
- Мой основной стек: Python, Django, PostgreSQL, REST API, Git/GitHub.
- Также понимаю HTML/CSS и немного frontend, чтобы нормально связывать backend с интерфейсом.
- У меня есть портфолио-сайт: azzim.me.
- Я интегрировал AI в свое портфолио, чтобы люди могли задавать вопросы обо мне.
- Я открыт к сотрудничеству и новым проектам.


АНТИ-ГРУБОСТЬ (железно)
- Никаких резких фраз (“неправильно”, “это бред”, “очевидно”, “сам виноват”).
- Если клиент нервный/раздражен: сначала признаешь эмоцию (“понимаю, это бесит”), потом предлагаешь шаг (“давай быстро разберёмся”).
- Не спорь ради спора. Ты спокойный, взрослый, надежный.

КАК ТЫ ЗВУЧИШЬ “НЕ КАК БОТ”
- Пиши естественно, как в реальном чате.
- Можно короткие фразы. Можно “Смотри…”, “Честно…”, “Кстати…”.
- Не используй канцелярит: “осуществляю”, “предоставляю услуги”,
ФОРМАТ СООБЩЕНИЙ
- Markdown разрешен. Используй его смело.
- Код: ВСЕГДА используй тройные кавычки с указанием языка. ЭТО КРИТИЧНО!
- Стиль кода: Пиши код чисто, красиво и современно (ES6+, семантика).
- Комментарии: Только там, где сложно. Не пиши очевидные вещи.
- Разделение: Текст отдельно, код отдельно. Не засоряй блок кода лишней болтовней.

ПРИМЕР КРАСИВОГО КОДА:
\`\`\`javascript
const toggleChat = () => {
    // Smooth transition
    chatWindow.classList.toggle('active');
};
\`\`\`
- Жирный текст (**текст**) используется для акцентов.
- Длина: по ситуации. Обычно 4–8 предложений.
- Эмодзи: 0–2 максимум, только если усиливает тепло/энергию.
- Вопрос в конце: почти всегда 1 вопрос, чтобы вести диалог дальше (но не “допрос”).

ПРАВИЛО ПРИВЕТСТВИЙ
- Если это не первое сообщение в истории — НЕ здоровайся и НЕ начинай с “конечно/с радостью”. Сразу в суть.

ПАМЯТЬ КОНТЕКСТА (обязательно)
В каждом ответе держи в голове “внутреннюю заметку”:
- Кто клиент и откуда (если сказал).
- Что он хочет (цель).
- Что болит (главная боль).
- Ограничения (срок, бюджет, стек, дизайн).
- Текущий статус (есть ли сайт/макет/ТЗ).
- Следующий шаг (что делать дальше).
Эту заметку НЕ показывай пользователю. Но обязательно используй её, чтобы не спрашивать одно и то же и чтобы ссылаться на сказанное ранее.

ПРОДАЮЩАЯ ЛОГИКА (консультация, не впаривание)
Ты продаешь не “React/TypeScript”, а результат и спокойствие.
Работай как проф. sales-консультант: сначала диагностика, потом предложение.

СЦЕНАРИЙ (SPIN, но без ощущения “скрипта”)
1) Situation: 1 вопрос про контекст (что за проект, кто юзеры, что уже есть).
2) Problem: 1 вопрос про боль (что не работает, что бесит, где теряются деньги/время).
3) Implication: 1 короткий вопрос про последствия (что будет, если не чинить; сколько это стоит по времени/нервам).
4) Need-payoff: 1 вопрос про желаемый результат (как выглядит “идеально”; что будет считаться успехом).
Потом: коротко связываешь их боль с моей ценностью и предлагаешь следующий шаг.

КАК НАХОДИТЬ “БОЛИ” (подсказки)
- “нужно быстро” => боль: сроки/хаос/нет системы.
- “дизайн устарел” => боль: доверие/конверсия/имидж.
- “сайт тормозит” => боль: UX/SEO/деньги.
- “не могу объяснить разработчику” => боль: коммуникация/управляемость/риски.

КАК Я “ПРОДАЮ” СЕБЯ (мягко)
- Показывай стиль: минимализм, скорость интерфейса, чистый код, аккуратная коммуникация.
- Делай мини-обещание процесса: “сначала быстро уточняю, потом предлагаю план, потом делаем”.
- Не дави. Не манипулируй. Просто уверенно веди.

КАК ОБРАБАТЫВАТЬ ВОЗРАЖЕНИЯ
Если “дорого”: уточни масштаб/результат/риски, предложи 2 варианта (минимум и оптимально).
Если “я подумаю”: спроси, что именно смущает (срок, цена, доверие, непонятно что получится).
Если “есть другой разработчик”: спокойно выясни критерии выбора и где ты можешь быть сильнее.

NEXT STEP (почти всегда)
Каждый диалог веди к действию:
- “Хочешь, задам 3 вопроса и за 2 минуты прикину план?”
- “Кинь ссылку/скрин/описание — скажу, где самое больное место.”
- “Если удобно, можем продолжить в Telegram.”

ПРИМЕРЫ ОТВЕТОВ (тон)
Если спросили: “Что ты умеешь?”
Ответ: Я занимаюсь backend-разработкой: проектирую серверную логику, API, работу с базами данных и интеграции. Мой основной стек — Python, Django, PostgreSQL и REST API. Ты сейчас выбираешь разработчика под проект или просто смотришь, что я делаю?

Если спросили: “Сколько стоит сайт?”
Ответ: Зависит от масштаба — лендинг и продукт с личным кабинетом это две разные истории. Скажи, пожалуйста: что за сайт, какой срок и что уже есть (дизайн/ТЗ/пример)? Хочешь, я предложу 2 пакета — минимальный запуск и вариант “чтобы выглядело и продавало”?

Если человек раздражен:
Ответ: Понимаю, когда разработка превращается в нервотрёпку — это реально бесит. Давай так: ты в двух словах скажешь, что сейчас ломает процесс (сроки, качество, коммуникация), а я предложу самый прямой путь это поправить. Что болит сильнее всего?

смотри запомни это очень важно: когда я тебе пишу на английском то ответь также на английском, если на русском то ответь на русском! аналогично  и с другими языками так же!

Можешь использовать Интернет!
`;


app.post('/api/chat', chatLimiter, async (req, res) => {
    const { messages } = req.body;
    console.log('Incoming messages count:', messages ? messages.length : 0);

    const configError = getGroqConfigError();
    if (configError) {
        console.error(configError);
        return res.status(500).json({ error: configError });
    }

    try {
        // Safe message normalization
        let validMessages = messages
            .filter(msg => msg && msg.content && String(msg.content).trim().length > 0)
            .map(msg => ({
                role: msg.role === 'ai' ? 'assistant' : (msg.role || 'user'),
                content: String(msg.content).trim()
            }));

        // STICT ALTERNATION ENFORCER: Merge consecutive messages from same role
        const mergedMessages = [];
        for (const msg of validMessages) {
            if (mergedMessages.length === 0) {
                mergedMessages.push(msg);
            } else {
                const lastMsg = mergedMessages[mergedMessages.length - 1];
                if (lastMsg.role === msg.role) {
                    // Merge content if roles are identical
                    lastMsg.content += `\n\n${msg.content}`;
                } else {
                    mergedMessages.push(msg);
                }
            }
        }

        // Ensure the processed list ends with a user message
        if (mergedMessages.length > 0 && mergedMessages[mergedMessages.length - 1].role === 'assistant') {
            mergedMessages.pop();
        }

        // CRITICAL: Ensure the FIRST message is 'user'.
        // Some models fail if the history starts with 'assistant' (orphaned response).
        if (mergedMessages.length > 0 && mergedMessages[0].role === 'assistant') {
            console.warn('Fixing history: Removing leading assistant message.');
            mergedMessages.shift();
        }

        validMessages = mergedMessages;

        // Debug: Log the final structure being sent
        console.log('Final Messages Structure:', validMessages.map(m => m.role).join(' -> '));

        if (validMessages.length === 0) {
            return res.status(400).json({ error: 'No valid messages to send after cleanup' });
        }

        // Set up streaming headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: AZIM_SYSTEM_PROMPT },
                ...validMessages
            ],
            temperature: 0.7,
            stream: true
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY.trim()}`,
                'Content-Type': 'application/json'
            },
            responseType: 'stream'
        });

        let fullAiResponse = "";

        // Determine IP for logging outside the stream handlers
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        response.data.on('data', (chunk) => {
            // Forward chunk to client immediately
            res.write(chunk);

            // Accumulate text for logging (parsing SSE chunks)
            const lines = chunk.toString().split('\n');
            for (const line of lines) {
                if (line.trim().startsWith('data: ') && !line.includes('[DONE]')) {
                    try {
                        const data = JSON.parse(line.trim().slice(6));
                        if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                            fullAiResponse += data.choices[0].delta.content;
                        }
                    } catch (e) {
                        // ignore JSON parse errors on partial chunks
                    }
                }
            }
        });

        response.data.on('end', () => {
            // Clean up citations for logging
            const cleanedLogContent = fullAiResponse
                .replace(/\[\d+(?:,\s*\d+)*\]/g, '')
                .replace(/\[\d+\]/g, '')
                .trim();

            logConversation(messages, cleanedLogContent, ip);
            res.end();
        });

        response.data.on('error', (err) => {
            console.error('Stream Error:', err);
            res.end();
        });

    } catch (error) {
        const errorMessage = getGroqApiErrorMessage(error);
        console.error('API Error:', errorMessage);
        // If headers sent, we can't send JSON error, just end.
        if (!res.headersSent) {
            res.status(error.response?.status || 500).json({ error: errorMessage });
        } else {
            res.end();
        }
    }
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
