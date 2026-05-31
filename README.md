# Azim — Portfolio (RU/UZ)

Minimalist single-page portfolio with Russian and Uzbek language toggle, responsive layout, scroll interactions, and **AI-powered chat assistant**.

## Features

- 🤖 **AI Chat Widget** — Talk to Virtual Azim powered by Groq AI
- 🌐 RU/UZ language switcher
- 🎨 Minimalist grayscale design
- ✨ Scroll reveal animations and progress bar
- 📱 Responsive layout for mobile and desktop

## Tech Stack

- **Frontend:** HTML, CSS (Vanilla), JavaScript
- **Backend:** Node.js + Express
- **AI:** Groq API (`llama-3.3-70b-versatile`)
- **Deployment:** Digital Ocean App Platform

## Run locally

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file and add your Groq API key:
```
GROQ_API_KEY=your_groq_key_here
```

3. Start the server:
```bash
npm start
```

4. Open `http://localhost:3000` in your browser.

## Deployment

See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions to Digital Ocean.
