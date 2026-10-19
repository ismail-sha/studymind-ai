// ═══════════════════════════════════════════════════════════════
//  StudyMind AI  —  Universal API Helper
//  Supports: Ollama (local/unlimited) · Multi-key Gemini · Groq
// ═══════════════════════════════════════════════════════════════
//
//  Set VITE_PROVIDER in your .env to choose:
//    VITE_PROVIDER=ollama   → Local AI, truly unlimited, free
//    VITE_PROVIDER=gemini   → Multi-key rotation, free
//    VITE_PROVIDER=groq     → Groq API, 14400 req/day free
//
// ═══════════════════════════════════════════════════════════════

const PROVIDER = import.meta.env.VITE_PROVIDER || 'gemini';

// ── Gemini: collect all keys from .env ────────────────────────
const GEMINI_KEYS = [
  import.meta.env.VITE_GEMINI_KEY_1,
  import.meta.env.VITE_GEMINI_KEY_2,
  import.meta.env.VITE_GEMINI_KEY_3,
  import.meta.env.VITE_GEMINI_KEY_4,
  import.meta.env.VITE_GEMINI_KEY_5,
  // legacy single-key support
  import.meta.env.VITE_GEMINI_API_KEY,
].filter(Boolean); // removes undefined/empty entries

const GEMINI_MODEL = 'gemini-3.6-flash';
const GEMINI_BASE  = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── Groq config ────────────────────────────────────────────────
const GROQ_KEY   = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_BASE  = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // best free model on Groq

// ── Ollama config ──────────────────────────────────────────────
const OLLAMA_URL   = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2';

// ── Key rotation state ─────────────────────────────────────────
let geminiKeyIndex = 0;
const getNextGeminiKey = () => {
  const key = GEMINI_KEYS[geminiKeyIndex % GEMINI_KEYS.length];
  geminiKeyIndex++;
  return key;
};

// ── Helpers ────────────────────────────────────────────────────
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ═══════════════════════════════════════════════════════════════
//  PROVIDER 1 — Ollama  (Local AI, truly unlimited)
// ═══════════════════════════════════════════════════════════════
async function callOllama(userMessage, systemPrompt, history) {
  const messages = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  for (const msg of history) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: 'user', content: userMessage });

  try {
    const res = await fetch(`${OLLAMA_URL}/v1/chat/completions`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        model:    OLLAMA_MODEL,
        messages,
        stream:   false,
        options:  { temperature: 0.7, num_predict: 2048 },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      if (res.status === 404) {
        return `⚠️  Ollama model "${OLLAMA_MODEL}" not found.\n\nRun this in your terminal:\n  ollama pull ${OLLAMA_MODEL}\n\nThen try again.`;
      }
      return `⚠️  Ollama error: ${txt}`;
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? '⚠️  No response from Ollama.';

  } catch (err) {
    if (err.message?.includes('fetch') || err.message?.includes('connect')) {
      return [
        '⚠️  Cannot connect to Ollama.',
        '',
        'Make sure Ollama is running:',
        '  1. Open a terminal (not VS Code)',
        '  2. Run:  ollama serve',
        '  3. Try your request again',
        '',
        `  URL tried: ${OLLAMA_URL}`,
      ].join('\n');
    }
    return `⚠️  Ollama error: ${err.message}`;
  }
}

// ═══════════════════════════════════════════════════════════════
//  PROVIDER 2 — Gemini with multi-key rotation
// ═══════════════════════════════════════════════════════════════
async function callGemini(userMessage, systemPrompt, history, attempt = 1) {
  if (GEMINI_KEYS.length === 0) {
    return [
      '⚠️  No Gemini API keys found.',
      '',
      'Add to your .env file:',
      '  VITE_GEMINI_KEY_1=AIzaSyD_your_key_1',
      '  VITE_GEMINI_KEY_2=AIzaSyD_your_key_2',
      '',
      'Get free keys at: https://aistudio.google.com/app/apikey',
    ].join('\n');
  }

  const apiKey  = getNextGeminiKey();
  const contents = [];

  for (const msg of history) {
    if (msg.role !== 'user' && msg.role !== 'assistant') continue;
    contents.push({
      role:  msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }

  const fullMessage = systemPrompt
    ? `[INSTRUCTIONS]:\n${systemPrompt}\n\n[USER]:\n${userMessage}`
    : userMessage;

  contents.push({ role: 'user', parts: [{ text: fullMessage }] });

  try {
    const res = await fetch(`${GEMINI_BASE}?key=${apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192, topP: 0.95 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      }),
    });

    // Rate limited on this key → try next key automatically
    if (res.status === 429) {
      if (attempt <= GEMINI_KEYS.length * 2) {
        await delay(1000);
        return callGemini(userMessage, systemPrompt, history, attempt + 1);
      }
      return [
        '⏳  All keys are rate-limited right now.',
        '',
        `  Keys in rotation: ${GEMINI_KEYS.length}`,
        '  Each allows 15 requests/min.',
        '',
        'Solutions:',
        '  • Add more keys to .env (VITE_GEMINI_KEY_3=...)',
        '  • Wait 60 seconds',
        '  • Switch to Ollama (unlimited): set VITE_PROVIDER=ollama',
      ].join('\n');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return `⚠️  Gemini error: ${err?.error?.message || `HTTP ${res.status}`}`;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return '⚠️  Empty response. Please try again.';
    return text;

  } catch (err) {
    return `⚠️  Network error: ${err.message}`;
  }
}

// ═══════════════════════════════════════════════════════════════
//  PROVIDER 3 — Groq  (30 req/min, 14,400/day free)
// ═══════════════════════════════════════════════════════════════
async function callGroq(userMessage, systemPrompt, history) {
  if (!GROQ_KEY) {
    return [
      '⚠️  Groq API key not set.',
      '',
      'Steps:',
      '  1. Sign up free at https://console.groq.com',
      '  2. Create an API key',
      '  3. Add to .env:  VITE_GROQ_API_KEY=gsk_your_key',
      '  4. Restart  npm run dev',
    ].join('\n');
  }

  const messages = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  for (const msg of history) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: 'user', content: userMessage });

  try {
    const res = await fetch(GROQ_BASE, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        messages,
        max_tokens:  2048,
        temperature: 0.7,
      }),
    });

    if (res.status === 429) {
      const retryAfter = res.headers.get('retry-after') || 10;
      await delay(retryAfter * 1000);
      return callGroq(userMessage, systemPrompt, history);
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return `⚠️  Groq error: ${err?.error?.message || `HTTP ${res.status}`}`;
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? '⚠️  No response from Groq.';

  } catch (err) {
    return `⚠️  Groq network error: ${err.message}`;
  }
}

// ═══════════════════════════════════════════════════════════════
//  Main exported function  (auto-routes to chosen provider)
// ═══════════════════════════════════════════════════════════════
export async function askGemini(userMessage, systemPrompt = '', history = []) {
  switch (PROVIDER) {
    case 'ollama':
      return callOllama(userMessage, systemPrompt, history);

    case 'groq':
      return callGroq(userMessage, systemPrompt, history);

    case 'gemini':
    default:
      return callGemini(userMessage, systemPrompt, history);
  }
}

// JSON helper — strips markdown fences Gemini/Groq sometimes add
export async function askGeminiJSON(prompt, systemPrompt = '') {
  const raw = await askGemini(prompt, systemPrompt);
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}
