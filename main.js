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
		section_about: "Обо мне",
		section_skills: "Навыки",
		section_contact: "Контакты",
	},
	uz: {
		nav_about: "Men haqimda",
		nav_skills: "Ko‘nikmalar",
		nav_contact: "Kontaktlar",
		section_about: "Men haqimda",
		section_skills: "Ko‘nikmalar",
		section_contact: "Kontaktlar",
	},
};

const langButtons = document.querySelectorAll("[data-lang-btn]");
const langBlocks = document.querySelectorAll(".lang-block");
const i18nElements = document.querySelectorAll("[data-i18n]");
const progressBar = document.getElementById("progressBar");

const setLanguage = (lang) => {
	document.documentElement.setAttribute("lang", lang === "uz" ? "uz" : "ru");

	langButtons.forEach((btn) => {
		const isActive = btn.dataset.langBtn === lang;
		btn.setAttribute("aria-pressed", String(isActive));
	});

	langBlocks.forEach((block) => {
		const isActive = block.dataset.lang === lang;
		block.classList.toggle("is-active", isActive);
	});

	i18nElements.forEach((el) => {
		const key = el.dataset.i18n;
		const value = translations[lang]?.[key];
		if (value) {
			el.textContent = value;
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

setLanguage("ru");
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

