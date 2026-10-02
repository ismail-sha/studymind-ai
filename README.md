# 🧠 StudyMind AI

> An AI-powered Study Companion built with **React + Vite** and **Google Gemini API (FREE)**.

Upload documents · Chat with AI · Generate quizzes · Create flashcards · Plan your studies · Track analytics.

---

## ✅ Features

| Feature | Description |
|---|---|
| 📄 Document Upload | PDF, DOCX, TXT, MD, CSV, Images |
| 💬 AI Tutor Chat | 5 tutor modes (Tutor, Exam, Beginner, Socratic, Creative) |
| ❓ Quiz Generator | MCQ, True/False, Fill-in-blank with AI explanations |
| 🃏 Flashcards | AI-generated flip cards with favorites & shuffle |
| 📊 Analytics | Charts for study hours, quiz trends, subject mastery |
| 📅 Study Planner | Personalized AI exam preparation schedules |
| ⚙️ Settings | API config, preferences, data export |

---

## 🚀 Complete Setup Guide (VS Code)

### Prerequisites — install these first

| Tool | Download | Check installed |
|---|---|---|
| **Node.js 18+** | https://nodejs.org | `node -v` |
| **VS Code** | https://code.visualstudio.com | — |
| **Git** (optional) | https://git-scm.com | `git -v` |

---

### Step 1 — Open the project in VS Code

1. Unzip the downloaded `studymind-ai.zip` (or move the `studymind-ai` folder somewhere convenient, e.g. `Desktop`)
2. Open **VS Code**
3. Click **File → Open Folder**
4. Select the `studymind-ai` folder → click **Open**

You should see this file tree on the left:
```
studymind-ai/
├── src/
│   ├── api/          gemini.js
│   ├── components/   Sidebar.jsx  TopBar.jsx
│   ├── pages/        8 page files
│   ├── styles/       global.css
│   ├── utils/        fileParser.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── .env.example
```

---

### Step 2 — Open the integrated terminal

In VS Code press:
- **Windows/Linux:** `` Ctrl + ` ``
- **Mac:** `` Cmd + ` ``

Or click **Terminal → New Terminal** from the top menu.

---

### Step 3 — Install dependencies

In the terminal, run:

```bash
npm install
```

Wait for it to finish (downloads ~50 MB of packages into `node_modules/`).
You will see a message like `added 312 packages`.

---

### Step 4 — Get your FREE Gemini API key

1. Go to 👉 **https://aistudio.google.com/app/apikey**
2. Sign in with any Google account (Gmail works)
3. Click **"Create API Key"**
4. Copy the key — it looks like: `AIzaSyD_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

> **Free tier limits:** 15 requests/min · 1 million tokens/day · No credit card needed.

---

### Step 5 — Create the `.env` file

1. In VS Code, find the file `.env.example` in the root folder
2. Right-click it → **Copy**
3. Right-click the root folder → **Paste** → rename the copy to `.env`

   *Or in the terminal:*
   ```bash
   # Windows
   copy .env.example .env

   # Mac / Linux
   cp .env.example .env
   ```

4. Open `.env` and replace `YOUR_GEMINI_API_KEY_HERE` with your real key:

```env
VITE_GEMINI_API_KEY=AIzaSyD_your_real_key_here
```

5. **Save the file** (Ctrl+S / Cmd+S)

> ⚠️ Never share or commit your `.env` file. It is already in `.gitignore`.

---

### Step 6 — Start the development server

```bash
npm run dev
```

You will see output like:
```
  VITE v5.x  ready in 400 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

---

### Step 7 — Open the app

Open your browser and go to:
```
http://localhost:5173
```

🎉 **StudyMind AI is now running!**

---

## 📁 Project Structure Explained

```
studymind-ai/
│
├── src/
│   ├── api/
│   │   └── gemini.js          ← Gemini API calls (askGemini, askGeminiJSON)
│   │
│   ├── components/
│   │   ├── Sidebar.jsx        ← Left navigation bar
│   │   └── TopBar.jsx         ← Page header bar
│   │
│   ├── pages/
│   │   ├── HomePage.jsx       ← Dashboard with stats & quick actions
│   │   ├── UploadPage.jsx     ← File upload + AI document analysis
│   │   ├── ChatPage.jsx       ← AI tutor chat (5 modes)
│   │   ├── QuizPage.jsx       ← Quiz generator + scoring
│   │   ├── FlashcardsPage.jsx ← Flashcard generator + flip cards
│   │   ├── AnalyticsPage.jsx  ← Charts: hours, scores, topic breakdown
│   │   ├── PlannerPage.jsx    ← AI study schedule generator
│   │   └── SettingsPage.jsx   ← API key, preferences, export
│   │
│   ├── styles/
│   │   └── global.css         ← All styles (dark theme, components)
│   │
│   ├── utils/
│   │   └── fileParser.js      ← PDF / DOCX / TXT text extraction
│   │
│   ├── App.jsx                ← Root component, routing, global state
│   └── main.jsx               ← React entry point
│
├── index.html                 ← HTML template
├── package.json               ← Dependencies
├── vite.config.js             ← Vite config
├── .env.example               ← Copy this → .env and add your key
└── .env                       ← Your actual API key (DO NOT share)
```

---

## 🔨 Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder. Deploy that folder to:
- **Netlify** (drag & drop)
- **Vercel** (`vercel --prod`)
- **GitHub Pages**
- Any static file host

> **Important:** Set `VITE_GEMINI_API_KEY` as an environment variable on your hosting platform too.

---

## 🛠️ Recommended VS Code Extensions

Install these for the best development experience:

| Extension | ID | Purpose |
|---|---|---|
| **ES7+ React Snippets** | `dsznajder.es7-react-js-snippets` | React shortcuts |
| **Prettier** | `esbenp.prettier-vscode` | Code formatting |
| **ESLint** | `dbaeumer.vscode-eslint` | Error highlighting |
| **Auto Rename Tag** | `formulahendry.auto-rename-tag` | HTML/JSX tag renaming |
| **GitLens** | `eamodio.gitlens` | Git history |

Install via: **Ctrl+Shift+X** → search the extension name → Install

---

## ❓ Troubleshooting

| Problem | Fix |
|---|---|
| `npm install` fails | Make sure Node.js ≥ 18 is installed (`node -v`) |
| AI says "API key missing" | Check `.env` file exists and key is correct (no quotes) |
| AI says "Rate limit hit" | Wait 1 minute — free tier is 15 requests/min |
| PDF text not extracting | Make sure the PDF has selectable text (not a scanned image) |
| Blank screen on load | Open browser console (F12) and check for errors |
| Port 5173 in use | Run `npm run dev -- --port 3000` to use a different port |

---

## 🆓 API Limits (Free Tier)

| Limit | Value |
|---|---|
| Requests per minute | 15 |
| Tokens per day | 1,000,000 |
| Tokens per minute | 1,000,000 |
| Credit card required | ❌ No |
| Model | gemini-1.5-flash |

---

## 🧩 How to Add Features

**Add a new page:**
1. Create `src/pages/MyPage.jsx`
2. Import it in `src/App.jsx`
3. Add a case in the `renderPage()` switch
4. Add a nav item in `src/components/Sidebar.jsx`

**Change the AI model:**
Edit `src/api/gemini.js` line 7:
```js
const BASE = '...models/gemini-1.5-flash:generateContent';
//  change to:
const BASE = '...models/gemini-1.5-pro:generateContent';
```

---

## 📜 License

MIT — free for personal and commercial use.
