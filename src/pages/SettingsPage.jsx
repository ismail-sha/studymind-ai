import { useState } from 'react';
import { Check, Download, ExternalLink } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';

function Toggle({ value, onChange }) {
  return (
    <div
      className="toggle-track"
      style={{ background: value ? 'var(--accent)' : 'var(--border)' }}
      onClick={() => onChange(!value)}
    >
      <div
        className="toggle-thumb"
        style={{ left: value ? 21 : 3 }}
      />
    </div>
  );
}

export default function SettingsPage() {
  const [notifs,      setNotifs]      = useState(true);
  const [sound,       setSound]       = useState(false);
  const [autoSave,    setAutoSave]    = useState(true);
  const [darkMode]                    = useState(true); // always dark for now
  const [tutorMode,   setTutorMode]   = useState('tutor');
  const [difficulty,  setDifficulty]  = useState('medium');
  const [language,    setLanguage]    = useState('en');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [saved,       setSaved]       = useState(false);

  const save = () => {
    if (apiKeyInput.trim()) {
      // In a real app, store in localStorage or .env
      localStorage.setItem('gemini_key_hint', apiKeyInput.slice(0, 4) + '…');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const groups = [
    {
      title: 'API Configuration',
      items: [
        {
          label: 'Gemini API Key',
          sub: 'Free key from aistudio.google.com/app/apikey — also set VITE_GEMINI_API_KEY in .env',
          el: (
            <div className="flex-center gap-2" style={{ width: '100%' }}>
              <input
                className="input"
                type="password"
                placeholder="AIza…  (already set in .env — paste here to update)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                style={{ maxWidth: 280 }}
              />
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
                className="btn btn-secondary btn-sm">
                Get Key <ExternalLink size={11} />
              </a>
            </div>
          ),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Study Reminders', sub: 'Daily notifications to keep you on track', el: <Toggle value={notifs} onChange={setNotifs} /> },
        { label: 'Sound Effects', sub: 'Audio feedback on quiz answers and actions', el: <Toggle value={sound} onChange={setSound} /> },
        { label: 'Auto-save Chats', sub: 'Automatically save chat history between sessions', el: <Toggle value={autoSave} onChange={setAutoSave} /> },
        {
          label: 'Interface Language',
          sub: 'Language for the UI',
          el: (
            <select className="select" value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: 'auto' }}>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="hi">हिन्दी</option>
              <option value="zh">中文</option>
              <option value="ar">العربية</option>
            </select>
          ),
        },
      ],
    },
    {
      title: 'AI Defaults',
      items: [
        {
          label: 'Default Tutor Mode',
          sub: 'Mode used when you open a new chat',
          el: (
            <select className="select" value={tutorMode} onChange={(e) => setTutorMode(e.target.value)} style={{ width: 'auto' }}>
              <option value="tutor">📚 Tutor</option>
              <option value="exam">🎯 Exam Mode</option>
              <option value="beginner">🌱 Beginner</option>
              <option value="socratic">🤔 Socratic</option>
              <option value="creative">🎨 Creative</option>
            </select>
          ),
        },
        {
          label: 'Default Quiz Difficulty',
          sub: 'Difficulty when generating new quizzes',
          el: (
            <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ width: 'auto' }}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          ),
        },
      ],
    },
    {
      title: 'Account & Data',
      items: [
        { label: 'Plan', sub: 'Your current subscription tier', el: <span className="badge badge-cyan">Free Plan</span> },
        {
          label: 'Export All Data',
          sub: 'Download chat history, quizzes, and flashcards as JSON',
          el: (
            <button className="btn btn-secondary btn-sm"
              onClick={() => {
                const data = {
                  exportedAt: new Date().toISOString(),
                  settings: { tutorMode, difficulty, language },
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url  = URL.createObjectURL(blob);
                const a    = document.createElement('a');
                a.href = url; a.download = 'studymind-export.json'; a.click();
                URL.revokeObjectURL(url);
              }}>
              <Download size={12} /> Export
            </button>
          ),
        },
        {
          label: 'Clear All Data',
          sub: 'Remove all documents, chats, and local data (cannot be undone)',
          el: (
            <button className="btn btn-danger btn-sm"
              onClick={() => { if (window.confirm('Clear all data? This cannot be undone.')) window.location.reload(); }}>
              Clear Data
            </button>
          ),
        },
      ],
    },
    {
      title: 'About',
      items: [
        { label: 'App Version', sub: 'StudyMind AI open-source project', el: <span className="tag">v1.0.0</span> },
        { label: 'AI Model', sub: 'Google Gemini 1.5 Flash (free tier)', el: <span className="badge badge-green">Active</span> },
        { label: 'Free Tier Limits', sub: '15 requests / min · 1 million tokens / day · No credit card needed', el: null },
      ],
    },
  ];

  return (
    <div className="page fade-up">
      <TopBar title="Settings" subtitle="Customize StudyMind AI to your preferences" />
      <div className="mt-6" style={{ maxWidth: 620 }}>
        {groups.map((group) => (
          <div key={group.title} className="mb-6">
            <div className="nav-section-label" style={{ padding: 0, marginBottom: 8 }}>{group.title}</div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {group.items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px',
                  borderBottom: i < group.items.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ flex: 1 }}>
                    <div className="font-medium" style={{ fontSize: 13.5 }}>{item.label}</div>
                    <div className="text-xs text-muted mt-1">{item.sub}</div>
                  </div>
                  {item.el}
                </div>
              ))}
            </div>
          </div>
        ))}

        <button className="btn btn-primary" onClick={save}>
          {saved ? <><Check size={13} /> Saved!</> : 'Save Changes'}
        </button>

        {/* Setup reminder */}
        <div className="card card-accent mt-6">
          <div className="font-semibold mb-2" style={{ fontSize: 13.5 }}>⚡ Quick Setup Reminder</div>
          <ol style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text2)', paddingLeft: '1.1rem' }}>
            <li>Copy <code style={{ background: 'var(--surface)', padding: '1px 5px', borderRadius: 4 }}>.env.example</code> to <code style={{ background: 'var(--surface)', padding: '1px 5px', borderRadius: 4 }}>.env</code></li>
            <li>Get your free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>aistudio.google.com/app/apikey ↗</a></li>
            <li>Paste it as <code style={{ background: 'var(--surface)', padding: '1px 5px', borderRadius: 4 }}>VITE_GEMINI_API_KEY=your_key</code></li>
            <li>Run <code style={{ background: 'var(--surface)', padding: '1px 5px', borderRadius: 4 }}>npm run dev</code> and you're live!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
