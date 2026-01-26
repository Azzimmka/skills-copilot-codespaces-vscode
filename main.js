// Lenis smooth scroll
const lenis = new Lenis({
	duration: 1.2,
	easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
	orientation: 'vertical',
	gestureOrientation: 'vertical',
	smoothWheel: true,
	wheelMultiplier: 0.8,
	touchMultiplier: 1.5,
	infinite: false,
});

function raf(time) {
	lenis.raf(time);
	requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

const translations = {
	ru: {
		nav_about: "Обо мне",
		nav_projects: "Проекты",
		nav_skills: "Навыки",
		nav_contact: "Контакты",
		hero_greeting: "Привет, меня зовут",
		hero_name: "Азим",
		hero_desc: "Мне 20 лет. Уже 2 года изучаю фронтенд и создаю чистые, современные интерфейсы.",
		hero_cta_tg: "Написать в Telegram",
		hero_cta_contact: "Контакты",
		section_about: "Обо мне",
		section_projects: "Проекты",
		section_skills: "Навыки",
		about_text_1: "Меня зовут Азим. Мне 20 лет, и последние два года я активно изучаю фронтенд-разработку. Мне нравится создавать минималистичные, чистые интерфейсы с фокусом на пользовательский опыт.",
		about_text_2: "Сейчас развиваю навыки в React и современных UI-библиотеках. Открыт к новым проектам и сотрудничеству.",
		section_contact: "Контакты",
		contact_desc: "Хотите обсудить проект или просто пообщаться? Свяжитесь со мной любым удобным способом.",
		footer_text: "© 2026 Азим. Сделано с любовью.",
		modal_title: "Есть идея? Давайте обсудим!",
		modal_desc: "Напишите мне, и мы вместе воплотим вашу идею в жизнь",
		modal_btn: "Написать в Telegram",
		chat_online: "В сети",
		chat_welcome: "Привет! Я виртуальный клон Азима. Спроси меня о чем угодно!",
		chat_placeholder: "Ваше сообщение...",
		suggest_1: "У меня проблемы с ...",
		suggest_2: "Почему ты грубый?",
		suggest_3: "Твои проекты",
		onboarding_title: "Встречайте Виртуального Азима! 🤖",
		onboarding_text: "Теперь вы можете пообщаться с моим ИИ-клоном. Он ответит на любые вопросы о моих проектах и навыках в реальном времени.",
		onboarding_btn: "Понятно!",
	},
	uz: {
		nav_about: "Men haqimda",
		nav_projects: "Loyihalar",
		nav_skills: "Ko'nikmalar",
		nav_contact: "Kontaktlar",
		hero_greeting: "Salom, mening ismim",
		hero_name: "Azim",
		hero_desc: "20 yoshdaman. 2 yildan beri frontendni o'rganaman va toza, zamonaviy interfeyslar yarataman.",
		hero_cta_tg: "Telegramda yozish",
		hero_cta_contact: "Kontaktlar",
		section_about: "Men haqimda",
		section_projects: "Loyihalar",
		section_skills: "Ko‘nikmalar",
		about_text_1: "Mening ismim Azim. 20 yoshdaman va oxirgi ikki yil davomida frontend-dasturlashni faol o'rganaman. Foydalanuvchi tajribasiga e'tibor qaratgan minimalistik, toza interfeyslar yaratishni yoqtiraman. ",
		about_text_2: "Hozir React va zamonaviy UI kutubxonalari bo'yicha ko'nikmalarimni rivojlantiryapman. Yangi loyihalar va hamkorlikka ochiqman.",
		section_contact: "Kontaktlar",
		section_skills: "Ko'nikmalar",
		contact_desc: "Loyihani muhokama qilmoqchimisiz yoki shunchaki gaplashmoqchimisiz? Men bilan qulay usulda bog'laning.",
		footer_text: "© 2026 Azim. Mehr bilan yaratilgan.",
		modal_title: "Fikringiz bormi? Keling, muhokama qilamiz!",
		modal_desc: "Menga yozing va biz birgalikda g'oyangizni amalga oshiramiz",
		modal_btn: "Telegramda yozish",
		chat_online: "Onlayn",
		chat_welcome: "Salom! Men Azimning virtual kloniman. Mendan loyihalar yoki ko'nikmalar haqida so'rang!",
		chat_placeholder: "Xabaringзи yozing...",
		suggest_1: "Menga veb-sayt yarating",
		suggest_2: "Qanday ko'nikmalar?",
		suggest_3: "Sening loyihalaring",
		onboarding_title: "Azimning Virtual Kloni bilan tanishing! 🤖",
		onboarding_text: "Endi siz mening AI klonim bilan gaplashishingiz mumkin. U mening loyihalarim va ko'nikmalarim haqidagi har qanday savollarga real vaqt rejimida javob beradi.",
		onboarding_btn: "Tushunarli!",
	},
};

const langButtons = document.querySelectorAll("[data-lang-btn]");
const langBlocks = document.querySelectorAll(".lang-block");
const i18nElements = document.querySelectorAll("[data-i18n]");
const progressBar = document.getElementById("progressBar");

const setLanguage = (lang) => {
	localStorage.setItem("preferred-lang", lang);
	document.documentElement.setAttribute("lang", lang);

	langButtons.forEach((btn) => {
		const isActive = btn.dataset.langBtn === lang;
		btn.setAttribute("aria-pressed", String(isActive));
	});

	i18nElements.forEach((el) => {
		const key = el.dataset.i18n;
		const value = translations[lang]?.[key];
		if (value) {
			// Add a small fade effect when switching
			el.style.opacity = 0;
			setTimeout(() => {
				el.textContent = value;
				el.style.opacity = 1;
			}, 150);
		}
	});

	// Handle placeholders
	const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
	placeholders.forEach((el) => {
		const key = el.dataset.i18nPlaceholder;
		const value = translations[lang]?.[key];
		if (value) {
			el.placeholder = value;
		}
	});
};


langButtons.forEach((btn) => {
	btn.addEventListener("click", () => {
		const lang = btn.dataset.langBtn;
		setLanguage(lang);
	});
});

// Плавный скролл для навигационных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	anchor.addEventListener('click', (e) => {
		const href = anchor.getAttribute('href');
		if (href === '#') return;

		const target = document.querySelector(href);
		if (target) {
			e.preventDefault();
			lenis.scrollTo(target, {
				offset: -80, // отступ от верха (высота header)
				duration: 1.2
			});
		}
	});
});

const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			}
		});
	},
	{ threshold: 0.2 }
);

revealElements.forEach((el) => observer.observe(el));

const updateProgress = () => {
	const scrollTop = window.scrollY;
	const docHeight = document.documentElement.scrollHeight - window.innerHeight;
	const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
	progressBar.style.width = `${progress}%`;
};

window.addEventListener("scroll", updateProgress);
window.addEventListener("resize", updateProgress);

const savedLang = localStorage.getItem("preferred-lang") || "ru";
setLanguage(savedLang);
updateProgress();

// High-performance Canvas Cursor
const canvas = document.getElementById('cursorCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

const resizeCanvas = () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.size = Math.random() * 6 + 2;
		this.speedX = Math.random() * 1 - 0.5;
		this.speedY = Math.random() * 1 - 0.5;
		this.life = 1;
		this.decay = Math.random() * 0.02 + 0.01;
	}

	update() {
		this.x += this.speedX;
		this.y += this.speedY;
		this.life -= this.decay;
		if (this.size > 0.1) this.size -= 0.05;
	}

	draw() {
		const color = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#171717';
		ctx.fillStyle = color;
		ctx.globalAlpha = Math.max(0, this.life * 0.5);
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.fill();
	}
}

const animateParticles = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < particles.length; i++) {
		particles[i].update();
		particles[i].draw();
		if (particles[i].life <= 0) {
			particles.splice(i, 1);
			i--;
		}
	}
	requestAnimationFrame(animateParticles);
};

animateParticles();

let lastMouseX = 0;
let lastMouseY = 0;

document.addEventListener('mousemove', (e) => {
	const dx = e.clientX - lastMouseX;
	const dy = e.clientY - lastMouseY;
	const distance = Math.sqrt(dx * dx + dy * dy);

	if (distance > 10) {
		particles.push(new Particle(e.clientX, e.clientY));
		lastMouseX = e.clientX;
		lastMouseY = e.clientY;
	}
});


// Contact Modal - появляется через 6 секунд
const contactModal = document.getElementById('contactModal');
const modalClose = document.getElementById('modalClose');
const modalBackdrop = contactModal?.querySelector('.modal__backdrop');

let chatWasOpened = false; // Флаг: открывал ли пользователь чат

const showModal = () => {
	if (!contactModal || chatWasOpened) return; // Не показываем, если чат был открыт
	contactModal.classList.add('is-active');
	document.body.style.overflow = 'hidden';
};

const hideModal = () => {
	if (!contactModal) return;
	contactModal.classList.remove('is-active');
	document.body.style.overflow = '';
};

// Всегда показываем модалку через 6 секунд
setTimeout(showModal, 7000);

// Закрытие по кнопке
modalClose?.addEventListener('click', hideModal);

// Закрытие по клику на фон
modalBackdrop?.addEventListener('click', hideModal);

// Закрытие по Escape
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') hideModal();
});

// AI Chat Widget Logic
const chatToggle = document.getElementById('chatToggle');
const chatWindow = document.getElementById('chatWindow');
const chatClose = document.getElementById('chatClose');
const chatClear = document.getElementById('chatClear'); // Clear button
const chatExpand = document.getElementById('chatExpand'); // New expand button
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

// Load chat history from localStorage
let chatHistory = JSON.parse(localStorage.getItem('azim_chat_history')) || [];

const saveChat = () => {
	localStorage.setItem('azim_chat_history', JSON.stringify(chatHistory));
};

const syncChatHeight = () => {
	const isMobile = window.innerWidth <= 480;
	if (window.visualViewport && chatWindow.classList.contains('is-active') && isMobile) {
		// Force the chat window to match the actual visible area
		const vh = window.visualViewport.height;
		const offset = window.visualViewport.offsetTop;

		chatWindow.style.height = `${vh}px`;
		chatWindow.style.top = `${offset}px`;

		// Ensure message area is scrolled to bottom if keyboard just appeared
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}
};

const toggleChat = () => {
	const isActive = chatWindow.classList.contains('is-active');
	if (isActive) {
		closeChat();
	} else {
		openChat();
	}
};

const openChat = () => {
	chatWindow.classList.add('is-active');
	chatWasOpened = true;
	chatInput.focus();
	chatToggle.style.opacity = '0';
	chatToggle.style.pointerEvents = 'none';

	if (window.innerWidth <= 480) {
		document.body.style.overflow = 'hidden';
		syncChatHeight();
	}

	if (contactModal?.classList.contains('is-active')) {
		hideModal();
	}
};

const closeChat = () => {
	chatWindow.classList.remove('is-active');
	chatWindow.classList.remove('is-expanded');
	chatToggle.style.opacity = '1';
	chatToggle.style.pointerEvents = 'all';

	// GUARANTEED SCROLL RESTORE
	document.body.style.overflow = '';
	document.body.classList.remove('is-blurred');

	if (window.innerWidth <= 480) {
		chatWindow.style.height = '';
		chatWindow.style.top = '';
	}
};

// Listeners
chatToggle?.addEventListener('click', toggleChat);
chatClose?.addEventListener('click', closeChat);

const appendMessage = (role, text, isHistory = false) => {
	const bubble = document.createElement('div');
	bubble.className = `chat-bubble chat-bubble--${role}`;
	bubble.textContent = text;
	chatMessages.appendChild(bubble);

	// Production-grade auto-scroll
	if (!isHistory) {
		setTimeout(() => {
			chatMessages.scrollTo({
				top: chatMessages.scrollHeight,
				behavior: 'smooth'
			});
		}, 50);
	}
};

// Initial load of history
const loadHistory = () => {
	chatHistory.forEach(msg => {
		const role = msg.role === 'user' ? 'user' : 'ai';
		appendMessage(role, msg.content, true);
	});
	chatMessages.scrollTop = chatMessages.scrollHeight;
};

// Client-side rate limit tracker
const DAILY_LIMIT = 1000;

const getRateLimitData = () => {
	const stored = localStorage.getItem('azim_rate_limit');
	if (!stored) return null;
	const data = JSON.parse(stored);
	const today = new Date().toDateString();
	if (data.date !== today) return null;
	return data;
};

const saveRateLimitData = (used) => {
	const today = new Date().toDateString();
	localStorage.setItem('azim_rate_limit', JSON.stringify({ date: today, used }));
};

const updateRateLimitDisplay = () => {
	const rateLimitEl = document.getElementById('rateLimitCounter');
	if (!rateLimitEl) return;

	let data = getRateLimitData();
	if (!data) {
		data = { used: 0 };
		saveRateLimitData(0);
	}

	const remaining = DAILY_LIMIT - data.used;
	rateLimitEl.textContent = `${remaining}`;

	if (remaining < 100) rateLimitEl.classList.add('warning');
	else rateLimitEl.classList.remove('warning');
};

const incrementRequestCount = () => {
	let data = getRateLimitData();
	const used = data ? data.used + 1 : 1;
	saveRateLimitData(used);
	updateRateLimitDisplay();
};

// Initial calls
loadHistory();
updateRateLimitDisplay();

// Prevent scroll event bubbling
chatMessages?.addEventListener('wheel', (e) => {
	const scrollTop = chatMessages.scrollTop;
	const scrollHeight = chatMessages.scrollHeight;
	const height = chatMessages.offsetHeight;
	const delta = e.deltaY;

	if ((delta > 0 && scrollTop + height >= scrollHeight) || (delta < 0 && scrollTop <= 0)) {
		e.preventDefault();
	}
}, { passive: false });

const showTyping = () => {
	const typing = document.createElement('div');
	typing.className = 'chat-bubble chat-bubble--ai chat-bubble--typing';
	typing.id = 'typingIndicator';
	const loadingImg = document.createElement('img');
	loadingImg.src = 'icons8-loading.gif';
	loadingImg.alt = 'Thinking...';
	loadingImg.style.width = '30px';
	loadingImg.style.display = 'block';
	typing.appendChild(loadingImg);
	chatMessages.appendChild(typing);
	chatMessages.scrollTop = chatMessages.scrollHeight;
};

const hideTyping = () => {
	const typing = document.getElementById('typingIndicator');
	if (typing) typing.remove();
};

// Expand/Collapse Logic
chatExpand?.addEventListener('click', (e) => {
	e.stopPropagation();
	chatWindow.classList.toggle('is-expanded');

	// Toggle Icon (Maximize vs Minimize)
	const icon = chatExpand.querySelector('svg');
	if (chatWindow.classList.contains('is-expanded')) {
		// Minimize icon SVG
		icon.innerHTML = '<path d="M8 3v5H3M16 21v-5h5M16 8l5-5M3 21l5-5" />';
	} else {
		// Maximize icon SVG
		icon.innerHTML = '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />';
	}
});

// Configure Marked with PrismJS highlighting
const renderer = new marked.Renderer();

// Custom code block renderer with copy button (Notion-style)
renderer.code = (code, lang) => {
	const language = lang || 'plaintext';
	let highlighted;

	try {
		highlighted = Prism.highlight(code, Prism.languages[language] || Prism.languages.javascript, language);
	} catch (e) {
		highlighted = code;
	}

	return `
        <div class="code-block" data-lang="${language}">
            <div class="code-block__header">
                <span class="code-block__lang">${language}</span>
                <button class="code-block__copy" onclick="copyCode(this)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    </svg>
                    <span>Copy</span>
                </button>
            </div>
            <pre class="language-${language}"><code>${highlighted}</code></pre>
        </div>`;
};

marked.setOptions({
	renderer: renderer,
	breaks: true,
	gfm: true
});

const markdownToHTML = (text) => {
	// Handle unclosed triple backticks for live streaming
	let processedText = text;
	const backtickCount = (processedText.match(/```/g) || []).length;
	if (backtickCount % 2 !== 0) {
		processedText += '\n```';
	}
	return marked.parse(processedText);
};

// Global copy function
window.copyCode = (btn) => {
	const pre = btn.closest('.code-block').querySelector('code');
	const text = pre.innerText;
	navigator.clipboard.writeText(text).then(() => {
		const span = btn.querySelector('span');
		const originalText = span.textContent;
		span.textContent = 'Copied!';
		btn.classList.add('is-copied');
		setTimeout(() => {
			span.textContent = originalText;
			btn.classList.remove('is-copied');
		}, 2000);
	});
};

// Clear Chat Logic
chatClear?.addEventListener('click', () => {
	if (chatHistory.length === 0) return;

	// Clear immediately without browser alert for better UX
	chatHistory = [];
	localStorage.removeItem('azim_chat_history');
	const lang = document.documentElement.lang || 'ru';
	const welcomeMsg = translations[lang]?.chat_welcome || "Привет!";
	chatMessages.innerHTML = `<div class="chat-bubble chat-bubble--ai">${welcomeMsg}</div>`;
});

const typeWriter = (element, text, speed = 20) => {
	let i = 0;
	element.textContent = '';
	return new Promise((resolve) => {
		const type = () => {
			if (i < text.length) {
				element.textContent += text.charAt(i);
				i++;
				chatMessages.scrollTop = chatMessages.scrollHeight;
				setTimeout(type, speed);
			} else {
				resolve();
			}
		};
		type();
	});
};

// Unified Send Message Logic
const sendMessage = async (text) => {
	if (chatForm.dataset.loading === 'true') return;
	chatForm.dataset.loading = 'true';

	// Optimistic UI Update
	appendMessage('user', text);
	chatInput.value = '';

	// Add to history
	chatHistory.push({ role: 'user', content: text });
	saveChat();
	showTyping();

	try {
		// Optimize context: send only last 12 messages
		const recentHistory = chatHistory.slice(-12);

		const response = await fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messages: recentHistory })
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Server Error');
		}

		// Create AI Bubble immediately
		const aiBubble = document.createElement('div');
		aiBubble.className = 'chat-bubble chat-bubble--ai';
		// Add a placeholder/cursor if desired, or just start empty
		chatMessages.appendChild(aiBubble);
		hideTyping(); // Remove the generic spinner

		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let buffer = ''; // Buffer for partial lines
		let fullText = '';
		let loop = true;

		while (loop) {
			const { done, value } = await reader.read();
			if (done) break;

			// Decode chunk and add to buffer
			const chunk = decoder.decode(value, { stream: true });
			buffer += chunk;

			// Process complete lines only
			const lines = buffer.split('\n');
			// Keep the last part (potential partial line) in buffer
			buffer = lines.pop();

			for (const line of lines) {
				const trimmedLine = line.trim();
				if (trimmedLine.startsWith('data: ') && !trimmedLine.includes('[DONE]')) {
					try {
						const data = JSON.parse(trimmedLine.slice(6));
						const content = data.choices[0]?.delta?.content || "";
						if (content) {
							fullText += content;

							// Clean citations like [1], [1, 2] on the fly
							const cleanText = fullText
								.replace(/\[\d+(?:,\s*\d+)*\]/g, '')
								.replace(/\[\d+\]/g, '');                            // Render Markdown immediately
							if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
								aiBubble.innerHTML = marked.parse(cleanText);
							} else {
								aiBubble.textContent = cleanText; // Fallback
							}

							// Highlight code blocks
							if (window.Prism) {
								aiBubble.querySelectorAll('pre code').forEach((block) => {
									Prism.highlightElement(block);
								});
							}

							// Auto-scroll to bottom as text grows
							chatMessages.scrollTop = chatMessages.scrollHeight;
						}
					} catch (e) {
						// Should not happen often with buffering, but safe to ignore
					}
				}
			}
		}

		chatForm.dataset.loading = 'false';

		// Final save to history (using clean text)
		const finalCleanText = fullText.replace(/\[\d+(?:,\s*\d+)*\]/g, '').replace(/\[\d+\]/g, '');
		chatHistory.push({ role: 'assistant', content: finalCleanText });
		saveChat();

	} catch (error) {
		throw new Error(data.error);
	}

	if (data.choices && data.choices[0]) {
		let aiMessage = data.choices[0].message.content;

		const bubble = document.createElement('div');
		bubble.className = 'chat-bubble chat-bubble--ai';
		// Render Markdown HTML
		bubble.innerHTML = markdownToHTML(aiMessage);
		hideTyping();
		chatForm.dataset.loading = 'false';
		console.error('Chat Error:', error);

		// ROLLBACK: Remove the failed user message so they can try again
		chatHistory.pop();
		saveChat();
		appendMessage('ai', 'Ошибка: не удалось связаться с сервером. Попробуйте еще раз.');
	}
};

// Textarea Auto-Resize
const adjustTextareaHeight = () => {
	chatInput.style.height = 'auto';
	chatInput.style.height = chatInput.scrollHeight + 'px';
};

chatInput?.addEventListener('input', adjustTextareaHeight);

// Handle Enter to Send, Shift+Enter for newline
chatInput?.addEventListener('keydown', (e) => {
	if (e.key === 'Enter' && !e.shiftKey) {
		e.preventDefault(); // Prevent default newline
		chatForm.dispatchEvent(new Event('submit'));
	}
});

chatForm?.addEventListener('submit', async (e) => {
	e.preventDefault();
	const message = chatInput.value.trim();
	if (!message) return;

	// Reset height before sending
	chatInput.style.height = 'auto';
	await sendMessage(message);

	// Ensure height is reset after message is cleared (sendMessage clears value)
	chatInput.style.height = 'auto';
});

// Handle Chat Suggestions
const chatSuggestions = document.getElementById('chatSuggestions');

chatSuggestions?.addEventListener('click', (e) => {
	if (e.target.classList.contains('chat-suggestion')) {
		const text = e.target.textContent;
		sendMessage(text);
	}
});


document.addEventListener('DOMContentLoaded', () => {
	// init functions here
});
