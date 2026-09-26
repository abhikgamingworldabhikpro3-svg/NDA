# NDA Current Affairs AI
> **Read. Revise. Practice. Prepare for NDA.**

NDA Current Affairs AI is a secure, full-stack, AI-powered preparation platform specifically optimized for aspirants of the **UPSC NDA/NA (National Defence Academy & Naval Academy)** entrance examinations. The application transforms daily current events and defense developments into high-yield, exam-oriented study packages, practice quizzes, and automated spaced-repetition revision cards.

---

## 🚀 Key Features

1. **Syllabus-Aligned Current Affairs**: Summarized facts, "Why it Matters for NDA" briefs, and Static GK connections (ministries, weapon specifications, geographical treaties).
2. **Multi-Mode Quiz Hub**: 
   - **Daily 10**: Fast-paced 10-question practice refreshed daily.
   - **Custom Mock Tests**: Configure test sizes (10 to 100), GAT categories, difficulty, and duration timers.
   - **Rapid-Fire**: Instant feedback and explanation for fast revision.
   - **Weak-Area Retests**: Automatically aggregates performance to target student's highest error rate points.
3. **Spaced Repetition SRE**: Automatic queueing of revision items when a user answers a question wrong in practice tests.
4. **Deep-Dive Grounded Chat**: Conversations with "NDA AI", a personal coach grounded directly on current affairs updates and defense commands to prevent hallucinations.
5. **Multilingual Interface**: Real-time toggling between English (EN), Hindi (HI), and Bengali (BN).
6. **Secure Admin Console**: Published article listings, logs audits, PIB/ISRO press-releases ingestion pipeline, and correction reports management.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React (v19), TypeScript, Vite, Tailwind CSS.
- **Backend**: Node.js & Express API endpoints.
- **Database & Identity**: Firebase Authentication (Google popup, email/password) and Cloud Firestore.
- **AI Engine**: Google Gemini API via official `@google/genai` SDK.
- **PWA Capabilities**: Installable standalone manifest, service-worker caching, and offline status indicator flags.

---

## 📂 Project Structure

```text
/
├── firebase-blueprint.json  - Firestore relational schemas IR
├── firestore.rules          - Hardened security rules with least privilege ABAC
├── server.ts                - Node/Express backend with Gemini API proxy endpoints
├── vite.config.ts           - Vite bundler with VitePWA config
├── tsconfig.json            - TypeScript compiler configuration
├── package.json             - Full dependency definitions
├── src/
│   ├── main.tsx             - Application entry point
│   ├── App.tsx              - Path router and workspace controller
│   ├── context/
│   │   └── AuthContext.tsx  - Authentication and profile syncing provider
│   ├── types/
│   │   └── index.ts         - Strong TypeScript database interfaces
│   ├── services/
│   │   └── dbServices.ts    - Abstract service module for Firestore and API
│   ├── hooks/
│   │   ├── usePWAInstall.ts - Mobile install triggers hook
│   │   └── useOnlineStatus.ts - Connection observer hook
│   ├── data/
│   │   └── seedData.ts      - Pre-populated high-yield GAT seed data seeder
│   └── components/
│       ├── Navigation.tsx   - Responsive sidebar and mobile navigation bars
│       ├── PWAInstallButton.tsx - Guided install overlay modal
│       ├── OfflineIndicator.tsx - Alert banners
│       └── Toast.tsx        - Action notifications
```

---

## 📋 Installation & Local Setup

### 1. Pre-requisites
Ensure you have **Node.js (v18+)** installed.

### 2. Environment Variables (`.env`)
Create a `.env` file in the root directory and specify the following variables:
```bash
# Gemini API Key injected by AI Studio
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# Local Server URL
APP_URL="http://localhost:3000"
```

### 3. Install Dependencies
Run the following command to populate packages:
```bash
npm install
```

### 4. Running the Development Server
Execute the compound dev script to start the Express backend on port 3001 and Vite on port 3000 simultaneously:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🛡️ Firestore Security Rules Deployment

Deploy the pre-written `firestore.rules` file to your Firebase Project using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```
The rules ensure:
- Only authorized users can modify their own bookmarks, quiz attempts, and spaced revision items.
- Only the bootstrapped administrator email `abhikgamingworldabhikpro3@gmail.com` can perform writes on articles, question lists, configurations, and inspect audit logs.

---

## 🤖 Admin Console & Seeding Content

1. Log in to the application using Google Sign-In or register with the administrator email: **`abhikgamingworldabhikpro3@gmail.com`**.
2. Tap the **Admin Console** tab on the sidebar.
3. Click **Seed Sample GK Data** to immediately populate your local Firestore database with high-value, realistic GAT current affairs and matching MCQs (Exercise Malabar, ISRO Gaganyaan TV-D2, Brazil G20 Rio Accord).
4. Paste any raw press release in the **Ingest with AI** tab to witness Gemini process summaries, quiz options, and static GK links.
