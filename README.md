<p align="center">
  <img src="https://github.com/user-attachments/assets/d407fb3e-8840-4707-8341-f05009c2476e" width="150"/>
</p>
<h1 align="center">🍳 SnapChef — Your AI Food & Fitness Companion</h1>


SnapChef is a smart, intuitive mobile app that helps you make better food choices, generate recipes, and track your health goals—all powered by AI and built for real life.

> **Built with**: React Native • Expo SDK 52 • Supabase • GPT-4 Vision & Chat • Google Vision API • TypeScript • Modern UI stack

---

## 🔑 Core Features

* 📷 **Food Scanner**: Click or upload a photo of your meal/ingredients and detect food with GPT or Google Vision
* 🍲 **AI Recipe Generator**: Ask what you can cook and get step-by-step recipes
* 🧠 **Smart Meal Planning**: Personalized, AI-assisted plans and calorie-aware suggestions
* 📊 **Fitness Dashboard**: Log meals, steps, and hydration manually or with suggestions
* 🌓 **Modern UI**: Dark/light theme, smooth animations, glass UI
* 👤 **Profile & Preferences**: Save dietary choices, allergies, goals, and favorites

---

## 💥 Advanced Features

* 🧠 **OpenAI GPT + Vision API**: Analyze food images and generate contextual diet guidance
* 🔍 **Google Vision AI (Backup/Secondary)**: Detect objects, logos, text in food images
* 🔐 **Supabase Auth**: Sign up, log in, and store personalized data securely
* 🧾 **Auto Nutrition**: AI detects macros and calories from your photos
* 💬 **Chat Assistant**: Ask GPT-style questions about health, food, workouts, and plans
* 🛠 **Modular AI Layer**: Easily replace OpenAI with Claude, Gemini, etc.
* 📱 **Offline UI Mode**: App structure holds when offline, resyncs automatically

---

## 🧱 Project Structure

```
SnapChef/
├── app/                  # Screens and navigation
├── assets/images/        # Images and logo
├── components/           # Reusable UI components
├── config/               # App theme & env config
├── hooks/                # Custom React hooks
├── services/             # API calls (OpenAI, Supabase, Google Vision)
├── app.json              # App manifest
├── README.md             # Project documentation
├── SUPABASE_SETUP.md     # Supabase schema/setup guide
└── tsconfig.json         # TypeScript config
```

---

## ⚙️ Setup Guide

### 📁 1. Clone the Repo

```bash
git clone https://github.com/yourusername/snapchef.git
cd snapchef
```

### 📦 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 🔐 3. Create `.env`

Copy `.env.example` and fill in your keys:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_PROJECT_ID=your_project_id
OPENAI_API_KEY=your_openai_key
GOOGLE_VISION_API_KEY=your_google_cloud_vision_key
```

### 🚀 4. Start Development Server

```bash
npx expo start
```

---

## 📄 License

MIT — © 2025 Yatharth Bhatt

---

## 💡 Built with AI, intention, and a passion for food tech 🍽
