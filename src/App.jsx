import { useState, useEffect } from 'react';
import Sidebar        from './components/Sidebar.jsx';
import HomePage       from './pages/HomePage.jsx';
import UploadPage     from './pages/UploadPage.jsx';
import ChatPage       from './pages/ChatPage.jsx';
import QuizPage       from './pages/QuizPage.jsx';
import FlashcardsPage from './pages/FlashcardsPage.jsx';
import AnalyticsPage  from './pages/AnalyticsPage.jsx';
import PlannerPage    from './pages/PlannerPage.jsx';
import SettingsPage   from './pages/SettingsPage.jsx';
import LoginPage      from './pages/LoginPage.jsx';
import AdminPage      from './pages/AdminPage.jsx';
import { getMe }      from './api/authApi.js';

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

export default function App() {
  // ── Auth state ─────────────────────────────────────────────
  const [token,   setToken]   = useState(() => localStorage.getItem('sm_token') || '');
  const [user,    setUser]    = useState(() => load('sm_user', null));
  const [authChk, setAuthChk] = useState(true); // checking token validity on load

  // ── App state ──────────────────────────────────────────────
  const [page,         setPage]         = useState('home');
  const [documents,    setDocuments]    = useState(() => load('sm_docs',  []));
  const [chatMessages, setChatMessages] = useState(() => load('sm_chat',  [
    { role:'assistant', content:'👋 Hello! I\'m StudyMind AI.\n\nUpload a document or ask me anything to get started!' },
  ]));
  const [activeDoc,     setActiveDoc]     = useState(null);
  const [flashcardData, setFlashcardData] = useState(() => load('sm_cards', []));
  const [stats,         setStats]         = useState(() => load('sm_stats', {
    quizzesTaken:0, avgScore:0, studyTime:127, streak:5,
  }));

  // ── Verify token on load ────────────────────────────────────
  useEffect(() => {
    if (!token) { setAuthChk(false); return; }
    getMe(token)
      .then(({ user }) => { setUser(user); save('sm_user', user); })
      .catch(() => { logout(); })
      .finally(() => setAuthChk(false));
  }, []);

  // ── Persist state ───────────────────────────────────────────
  useEffect(() => { save('sm_docs',  documents);     }, [documents]);
  useEffect(() => { save('sm_chat',  chatMessages);  }, [chatMessages]);
  useEffect(() => { save('sm_cards', flashcardData); }, [flashcardData]);
  useEffect(() => { save('sm_stats', stats);         }, [stats]);

  // ── Study timer (1 min tick) ────────────────────────────────
  useEffect(() => {
    const id = setInterval(() =>
      setStats((p) => ({ ...p, studyTime: p.studyTime + 1 })), 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Auth handlers ───────────────────────────────────────────
  const onAuth = (tok, usr) => {
    setToken(tok);
    setUser(usr);
    setPage('home');
  };

  const logout = () => {
    localStorage.removeItem('sm_token');
    localStorage.removeItem('sm_user');
    setToken('');
    setUser(null);
    setPage('home');
  };

  // ── Loading screen while checking token ────────────────────
  if (authChk) {
    return (
      <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex',
        alignItems:'center', justifyContent:'center' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  // ── Not logged in → show login page ────────────────────────
  if (!token || !user) {
    return <LoginPage onAuth={onAuth} />;
  }

  // ── Render pages ────────────────────────────────────────────
  const shared = { documents, setDocuments, chatMessages, setChatMessages,
    activeDoc, setActiveDoc, flashcardData, setFlashcardData,
    stats, setStats, setPage };

  const renderPage = () => {
    switch (page) {
      case 'home':       return <HomePage      {...shared} />;
      case 'upload':     return <UploadPage    {...shared} />;
      case 'chat':       return <ChatPage      messages={chatMessages} setMessages={setChatMessages} documents={documents} activeDoc={activeDoc} setActiveDoc={setActiveDoc} />;
      case 'quiz':       return <QuizPage      documents={documents} setStats={setStats} />;
      case 'flashcards': return <FlashcardsPage documents={documents} flashcardData={flashcardData} setFlashcardData={setFlashcardData} />;
      case 'analytics':  return <AnalyticsPage stats={stats} />;
      case 'planner':    return <PlannerPage />;
      case 'settings':   return <SettingsPage />;
      case 'admin':      return user.role === 'admin' ? <AdminPage token={token} /> : <HomePage {...shared} />;
      default:           return <HomePage {...shared} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} user={user} onLogout={logout} />
      <main className="app-main">{renderPage()}</main>
    </div>
  );
}
