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
	},
	uz: {
		nav_about: "Men haqimda",
		nav_skills: "Ko‘nikmalar",
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
		contact_desc: "Loyihani muhokama qilmoqchimisiz yoki shunchaki gaplashmoqchimisiz? Men bilan qulay usulda bog'laning.",
		footer_text: "© 2026 Azim. Mehr bilan yaratilgan.",
		modal_title: "Fikringiz bormi? Keling, muhokama qilamiz!",
		modal_desc: "Menga yozing va biz birgalikda g'oyangizni amalga oshiramiz",
		modal_btn: "Telegramda yozish",
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
};


langButtons.forEach((btn) => {
	btn.addEventListener("click", () => {
		const lang = btn.dataset.langBtn;
		setLanguage(lang);
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


// Contact Modal - появляется через 10 секунд
const contactModal = document.getElementById('contactModal');
const modalClose = document.getElementById('modalClose');
const modalBackdrop = contactModal?.querySelector('.modal__backdrop');

const showModal = () => {
	if (!contactModal) return;
	contactModal.classList.add('is-active');
	document.body.style.overflow = 'hidden';
};

const hideModal = () => {
	if (!contactModal) return;
	contactModal.classList.remove('is-active');
	document.body.style.overflow = '';
};

// Всегда показываем модалку через 10 секунд
setTimeout(showModal, 10000);

// Закрытие по кнопке
modalClose?.addEventListener('click', hideModal);

// Закрытие по клику на фон
modalBackdrop?.addEventListener('click', hideModal);

// Закрытие по Escape
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') hideModal();
});
