import { useEffect, useRef, useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import { askGemini } from '../api/gemini.js';

const MODES = {
  tutor: {
    label: '📚 Tutor',
    system: 'You are an expert AI study tutor. Explain concepts clearly with examples and analogies. Break down complex topics step by step. Be encouraging and educational.',
  },
  exam: {
    label: '🎯 Exam Mode',
    system: 'You are a strict exam-prep tutor. Give concise, exam-ready answers. Highlight key facts to memorize. Be direct.',
  },
  beginner: {
    label: '🌱 Beginner',
    system: 'You are a very patient tutor explaining to a complete beginner. Use simple everyday language. Avoid jargon or always explain it. Use real-world analogies.',
  },
  socratic: {
    label: '🤔 Socratic',
    system: 'You are a Socratic tutor. Never give direct answers. Ask guiding questions to help the student discover the answer. Be curious and encouraging.',
  },
  creative: {
    label: '🎨 Creative',
    system: 'You are a creative tutor. Explain topics through stories, metaphors, and imaginative scenarios. Make learning fun and memorable.',
  },
};

const SUGGESTIONS = [
  'Explain this concept step by step',
  'Give me an analogy for this',
  'What are the key points to remember?',
  'Why is this important?',
  'Can you give me a real-world example?',
  'Summarize this in 3 bullet points',
];

export default function ChatPage({ messages, setMessages, documents, activeDoc, setActiveDoc }) {
  const [input,   setInput]   = useState('');
  const [typing,  setTyping]  = useState(false);
  const [mode,    setMode]    = useState('tutor');
  const bottomRef = useRef();
  const textRef   = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;

    // Build system prompt (include doc context if selected)
    const docContext = activeDoc
      ? `\n\n--- DOCUMENT CONTEXT (answer questions based on this) ---\n${activeDoc.text.slice(0, 3000)}\n---`
      : '';
    const systemPrompt = MODES[mode].system + docContext;

    // Build history (only user/assistant messages, last 10)
    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-10);

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setTyping(true);

    const reply = await askGemini(text, systemPrompt, history);
    setTyping(false);
    setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
  };

  const clearChat = () =>
    setMessages([{ role: 'assistant', content: '👋 Chat cleared! How can I help you study today?' }]);

  return (
    <div className="chat-wrap">
      <TopBar
        title="AI Tutor Chat"
        subtitle={activeDoc ? `📄 Context: ${activeDoc.name}` : 'General knowledge mode — no document selected'}
        actions={
          <>
            {/* Mode selector */}
            <div className="tabs" style={{ flexWrap: 'wrap' }}>
              {Object.entries(MODES).map(([k, v]) => (
                <button key={k} className={`tab${mode === k ? ' active' : ''}`}
                  style={{ fontSize: 12, padding: '5px 10px' }}
                  onClick={() => setMode(k)}>
                  {v.label}
                </button>
              ))}
            </div>

            {/* Document selector */}
            {documents.length > 0 && (
              <select
                className="input"
                style={{ width: 'auto', padding: '5px 10px', fontSize: 12 }}
                value={activeDoc?.id ?? ''}
                onChange={(e) => {
                  const doc = documents.find((d) => String(d.id) === e.target.value);
                  setActiveDoc(doc ?? null);
                }}
              >
                <option value="">No document</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            )}

            <button className="btn btn-ghost btn-icon" title="Clear chat" onClick={clearChat}>
              <Trash2 size={14} />
            </button>
          </>
        }
      />

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className="msg">
            <div
              className="msg-avatar"
              style={{
                background: m.role === 'assistant'
                  ? 'linear-gradient(135deg, var(--accent), var(--purple))'
                  : 'rgba(168,85,247,0.18)',
                color: m.role === 'assistant' ? '#05101e' : 'var(--purple)',
              }}
            >
              {m.role === 'assistant' ? 'AI' : 'S'}
            </div>
            <div className="msg-body">
              <div className="msg-name">
                {m.role === 'assistant' ? `StudyMind AI (${MODES[mode].label})` : 'You'}
              </div>
              <div className="msg-text">{m.content}</div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="msg">
            <div className="msg-avatar" style={{ background: 'linear-gradient(135deg, var(--accent), var(--purple))', color: '#05101e' }}>
              AI
            </div>
            <div className="msg-body">
              <div className="msg-name">StudyMind AI</div>
              <div className="typing-dots">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 1.5rem', display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} className="btn btn-secondary btn-sm"
              style={{ fontSize: 12 }}
              onClick={() => { setInput(s); textRef.current?.focus(); }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="chat-input-wrap">
        <div className="chat-input-row">
          <textarea
            ref={textRef}
            className="input textarea"
            style={{ minHeight: 44, maxHeight: 130, resize: 'none' }}
            placeholder="Ask anything about your studies… (Enter to send, Shift+Enter for new line)"
            value={input}
            rows={1}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            }}
          />
          <button
            className="btn btn-primary btn-icon"
            style={{ padding: 11, flexShrink: 0 }}
            onClick={send}
            disabled={!input.trim() || typing}
          >
            {typing ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Send size={15} />}
          </button>
        </div>
        <div className="tip" style={{ textAlign: 'center', marginTop: 6 }}>
          Free tier: Gemini 1.5 Flash · 15 requests / min  ·  1M tokens / day
        </div>
      </div>
    </div>
  );
}
