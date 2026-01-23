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
		suggest_1: "Расскажи о себе",
		suggest_2: "Какие навыки?",
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
		suggest_1: "O'zing haqingda gapir",
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

// Trailing cursor effect
const createParticle = (x, y) => {
	const particle = document.createElement('div');
	particle.className = 'cursor-particle';
	const size = Math.random() * 8 + 4;
	particle.style.width = `${size}px`;
	particle.style.height = `${size}px`;
	particle.style.left = `${x}px`;
	particle.style.top = `${y}px`;
	document.body.appendChild(particle);

	setTimeout(() => particle.remove(), 600);
};

let lastX = 0;
let lastY = 0;
let throttle = false;

document.addEventListener('mousemove', (e) => {
	if (throttle) return;
	throttle = true;

	const dx = e.clientX - lastX;
	const dy = e.clientY - lastY;
	const distance = Math.sqrt(dx * dx + dy * dy);

	if (distance > 10) {
		createParticle(e.clientX, e.clientY);
		lastX = e.clientX;
		lastY = e.clientY;
	}

	setTimeout(() => throttle = false, 30);
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
const chatExpand = document.getElementById('chatExpand'); // New expand button
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

// Load chat history from localStorage
let chatHistory = JSON.parse(localStorage.getItem('azim_chat_history')) || [];

const saveChat = () => {
	localStorage.setItem('azim_chat_history', JSON.stringify(chatHistory));
};

const toggleChat = () => {
	chatWindow.classList.toggle('is-active');
	if (chatWindow.classList.contains('is-active')) {
		chatWasOpened = true;
		chatInput.focus();
		chatToggle.style.opacity = '0';
		chatToggle.style.pointerEvents = 'none';
		// Закрываем модалку, если она открыта
		if (contactModal?.classList.contains('is-active')) {
			hideModal();
		}
	} else {
		chatToggle.style.opacity = '1';
		chatToggle.style.pointerEvents = 'all';
	}
};

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

loadHistory();

// Prevent scroll event bubbling to body (double protection for Lenis)
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

chatToggle?.addEventListener('click', toggleChat);
chatClose?.addEventListener('click', () => {
	chatWindow.classList.remove('is-active');
	chatToggle.style.opacity = '1';
	chatToggle.style.pointerEvents = 'all';

	// Also reset expanded state on close for UX
	chatWindow.classList.remove('is-expanded');
});

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
		const response = await fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messages: chatHistory })
		});

		const data = await response.json();
		hideTyping();
		chatForm.dataset.loading = 'false';

		// Handle API Error Gracefully
		if (data.error) {
			throw new Error(data.error);
		}

		if (data.choices && data.choices[0]) {
			let aiMessage = data.choices[0].message.content;
			aiMessage = aiMessage.replace(/[\*#_\[\]]/g, '').trim();

			const bubble = document.createElement('div');
			bubble.className = 'chat-bubble chat-bubble--ai';
			chatMessages.appendChild(bubble);
			await typeWriter(bubble, aiMessage);

			chatHistory.push({ role: 'assistant', content: aiMessage });
			saveChat();
		} else {
			throw new Error('No response content');
		}
	} catch (error) {
		hideTyping();
		chatForm.dataset.loading = 'false';
		console.error('Chat Error:', error);

		// ROLLBACK: Remove the failed user message so they can try again
		chatHistory.pop();
		saveChat();
		appendMessage('ai', 'Ошибка: не удалось связаться с сервером. Попробуйте еще раз.');
	}
};

chatForm?.addEventListener('submit', async (e) => {
	e.preventDefault();
	const message = chatInput.value.trim();
	if (!message) return;
	await sendMessage(message);
});

// Handle Chat Suggestions
const chatSuggestions = document.getElementById('chatSuggestions');

chatSuggestions?.addEventListener('click', (e) => {
	if (e.target.classList.contains('chat-suggestion')) {
		const text = e.target.textContent;
		sendMessage(text);
	}
});

// Feature Attention Logic (Pulse + Blur + Overlay)
const initChatAttention = () => {
	const chatToggleBtn = document.getElementById('chatToggle');
	const focusOverlay = document.getElementById('focusOverlay');

	// Check if already focused/seen
	if (localStorage.getItem('azim_chat_attention_shown')) return;

	// Start pulsing and blurring after delay to catch user's eye
	setTimeout(() => {
		chatToggleBtn.classList.add('pulse');
		if (focusOverlay) {
			focusOverlay.classList.add('is-visible');
			// Adding a class to body for global blurring of main content
			document.body.classList.add('is-blurred');
			document.body.style.overflow = 'hidden';
		}
	}, 1500); // Faster delay (1.5s) for better engagement

	const dismissAttention = () => {
		chatToggleBtn.classList.remove('pulse');
		if (focusOverlay) {
			focusOverlay.classList.remove('is-visible');
			document.body.classList.remove('is-blurred');
			document.body.style.overflow = '';
		}
		localStorage.setItem('azim_chat_attention_shown', 'true');
	};

	chatToggleBtn?.addEventListener('click', dismissAttention, { once: true });

	// Allow dismissing by clicking the overlay
	focusOverlay?.addEventListener('click', dismissAttention);
};

document.addEventListener('DOMContentLoaded', () => {
	initChatAttention();
});
