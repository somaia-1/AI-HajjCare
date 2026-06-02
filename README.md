# 🕌 AI-HajjCare

> **AI-powered health companion for Hajj pilgrims** — symptom checker, medical chat, and facilities locator built with React Native & Expo.

---

## 📱 About

**AI-HajjCare** is a mobile application designed to support pilgrims during Hajj with real-time AI health assistance. It helps users identify symptoms, chat with an AI medical assistant, locate nearby Hajj medical facilities, and track their consultation history — all from their phone.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Secure login with OTP verification via Supabase |
| 🤖 **AI Chat** | Conversational AI assistant for health questions |
| 🩺 **Symptom Checker** | Input symptoms and receive AI-powered assessment |
| 📋 **Triage Results** | Severity-based triage results and recommendations |
| 🏥 **Facilities Finder** | Locate nearby Hajj medical facilities using GPS |
| 📜 **History** | Track past consultations and symptom checks |

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) ~54.0 with [Expo Router](https://expo.github.io/router/)
- **Language**: TypeScript
- **UI**: React Native 0.81 + React 19
- **Backend**: [Supabase](https://supabase.com/) (Auth + Database)
- **Navigation**: Expo Router (file-based) + React Navigation Bottom Tabs
- **Animations**: Lottie React Native + React Native Reanimated
- **Camera**: Expo Camera
- **Location**: Expo Location
- **Gestures**: React Native Gesture Handler

## 🔗 Related Repositories
 ---
| Repository | Description |
|---|---|
| [ai-hajjcare-backend](https://github.com/somaia-1/ai-hajjcare-api) | FastAPI AI backend — Random Forest triage model & Gemini NLP engine |
 
---

## 📁 Project Structure

```
ai-hajjcare/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root layout & navigation
│   ├── index.tsx               # Entry / splash
│   ├── login.tsx               # Login screen
│   ├── otp-verification.tsx    # OTP verification
│   ├── home.tsx                # Home dashboard
│   ├── chat-screen.tsx         # AI chat assistant
│   ├── symptom-screen.tsx      # Symptom input form
│   ├── result-screen.tsx       # Diagnosis results
│   ├── FacilitiesScreen.tsx    # Nearby facilities map
│   └── history.tsx             # Consultation history
├── components/
│   └── Header.tsx              # Shared header component
├── constants/
│   └── theme.ts                # Colors, fonts, spacing
├── lib/
│   └── supabase.ts             # Supabase client config
├── types/                      # TypeScript types & interfaces
├── assets/                     # Images, icons, animations
├── app.json                    # Expo configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo Go](https://expo.dev/go) app on your phone **or** Android/iOS emulator
- A [Supabase](https://supabase.com/) project

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/ai-hajjcare.git
cd ai-hajjcare

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ Never commit your `.env` file. It's already in `.gitignore`.

### Run the App

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

Scan the QR code with **Expo Go** on your phone to open the app.

---

## 📦 Update Packages (Recommended)

Some packages have newer compatible versions. Run:

```bash
npx expo install --fix
```

---

## 🔧 Scripts

| Command | Description |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run android` | Open on Android |
| `npm run ios` | Open on iOS |
| `npm run web` | Open in browser |
| `npm run lint` | Run ESLint |
| `npm run reset-project` | Reset to clean state |

---

## 📋 Requirements

- Expo SDK ~54
- React Native 0.81.5
- React 19.1.0
- Node.js ≥ 18

---

## 🤝 Contributing

1. Fork the repository
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is private and not licensed for public use.

---

<div align="center">
  Made with ❤️ to serve Hajj pilgrims
</div>
