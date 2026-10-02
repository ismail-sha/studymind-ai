import { useState } from 'react';
import { Zap, RefreshCw, CheckCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import TopBar from '../components/TopBar.jsx';
import { askGeminiJSON } from '../api/gemini.js';

const SYSTEM = 'You are a quiz generator. Return ONLY valid JSON — no markdown, no explanation, just the raw JSON array.';

export default function QuizPage({ documents, setStats }) {
  const [topic,      setTopic]      = useState('');
  const [docId,      setDocId]      = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [qType,      setQType]      = useState('mcq');
  const [numQ,       setNumQ]       = useState(5);

  const [quiz,       setQuiz]       = useState(null);
  const [answers,    setAnswers]     = useState({});
  const [submitted,  setSubmitted]   = useState(false);
  const [loading,    setLoading]     = useState(false);
  const [currentQ,   setCurrentQ]    = useState(0);
  const [history,    setHistory]     = useState([]);

  /* ── Generate quiz via Gemini ── */
  const generate = async () => {
    const src = documents.find((d) => String(d.id) === docId);
    const context = src
      ? `Based on this document:\n${src.text.slice(0, 2500)}`
      : `Topic: ${topic || 'General Knowledge'}`;

    const typeInstruction = {
      mcq:  'multiple choice with 4 options (A, B, C, D)',
      tf:   'true/false',
      fitb: 'fill-in-the-blank (ans is the missing word/phrase)',
    }[qType];

    const prompt = `${context}

Generate exactly ${numQ} ${difficulty} difficulty ${typeInstruction} questions.

Return a JSON array only:
[
  {
    "q": "Question text?",
    "opts": ["A) Option1", "B) Option2", "C) Option3", "D) Option4"],
    "ans": 0,
    "exp": "Brief explanation of the correct answer."
  }
]

Rules:
- For true/false: opts must be ["True","False"], ans is 0 (True) or 1 (False).
- For fill-in-blank: opts must be [], ans must be the correct word/phrase as a string.
- For MCQ: ans is the index (0-3) of the correct option.
- Return ONLY the JSON array. No extra text.`;

    setLoading(true);
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setCurrentQ(0);

    const raw = await askGeminiJSON(prompt, SYSTEM);
    try {
      const match = raw.match(/\[[\s\S]*\]/);
      const parsed = JSON.parse(match ? match[0] : raw);
      setQuiz(parsed);
    } catch {
      setQuiz([{
        q: '⚠️ Failed to parse quiz. Try again or change the topic.',
        opts: ['Retry'], ans: 0,
        exp: `Raw response: ${raw.slice(0, 200)}`,
      }]);
    }
    setLoading(false);
  };

  /* ── Check answer ── */
  const isCorrect = (qi) => {
    const q = quiz[qi];
    const a = answers[qi];
    if (a === undefined) return false;
    if (typeof q.ans === 'number') return a === q.ans;
    return String(a).toLowerCase().trim() === String(q.ans).toLowerCase().trim();
  };

  /* ── Submit ── */
  const submit = () => {
    setSubmitted(true);
    const score = quiz.reduce((n, _, i) => n + (isCorrect(i) ? 1 : 0), 0);
    const pct   = Math.round((score / quiz.length) * 100);
    setHistory((prev) => [...prev, { label: `Q${prev.length + 1}`, score: pct }]);
    setStats((prev) => ({
      ...prev,
      quizzesTaken: prev.quizzesTaken + 1,
      avgScore: Math.round((prev.avgScore * prev.quizzesTaken + pct) / (prev.quizzesTaken + 1)),
    }));
  };

  const score   = quiz ? quiz.reduce((n, _, i) => n + (isCorrect(i) ? 1 : 0), 0) : 0;
  const scorePct = quiz ? Math.round((score / quiz.length) * 100) : 0;

  return (
    <div className="page fade-up">
      <TopBar title="Quiz Generator" subtitle="AI-generated quizzes from any topic or document" />
      <div className="mt-6">

        {/* Config form */}
        {!quiz && !loading && (
          <div className="card" style={{ maxWidth: 580 }}>
            <h3 className="font-semibold mb-4" style={{ fontSize: 15 }}>Configure Your Quiz</h3>

            {documents.length > 0 && (
              <div className="mb-3">
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>
                  Source Document (optional)
                </label>
                <select className="select" value={docId} onChange={(e) => { setDocId(e.target.value); if (e.target.value) setTopic(''); }}>
                  <option value="">Enter a topic manually</option>
                  {documents.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}

            {!docId && (
              <div className="mb-3">
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>Topic</label>
                <input className="input" placeholder="e.g. Photosynthesis, World War 2, Python loops…"
                  value={topic} onChange={(e) => setTopic(e.target.value)} />
              </div>
            )}

            <div className="grid-3 mb-4">
              <div>
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>Difficulty</label>
                <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>Type</label>
                <select className="select" value={qType} onChange={(e) => setQType(e.target.value)}>
                  <option value="mcq">Multiple Choice</option>
                  <option value="tf">True / False</option>
                  <option value="fitb">Fill in the Blank</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>Questions</label>
                <select className="select" value={numQ} onChange={(e) => setNumQ(+e.target.value)}>
                  {[3, 5, 7, 10].map((n) => <option key={n} value={n}>{n} questions</option>)}
                </select>
              </div>
            </div>

            <button className="btn btn-primary" onClick={generate} disabled={!topic && !docId}>
              <Zap size={14} /> Generate Quiz
            </button>

            {/* Score history chart */}
            {history.length > 0 && (
              <>
                <div className="glow-line" />
                <div className="font-semibold mb-2" style={{ fontSize: 13 }}>Quiz History</div>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={history} margin={{ top: 0, right: 0, bottom: 0, left: -28 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <Bar dataKey="score" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text2)' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text2)' }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                      formatter={(v) => [`${v}%`, 'Score']}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} />
            <div className="text-muted" style={{ fontSize: 14 }}>Generating quiz with Gemini AI…</div>
          </div>
        )}

        {/* Quiz */}
        {quiz && !loading && !submitted && (
          <div className="fade-up">
            {/* Progress */}
            <div className="flex-center gap-3 mb-4">
              <div className="progress" style={{ flex: 1, height: 5 }}>
                <div className="progress-fill" style={{ width: `${((currentQ + 1) / quiz.length) * 100}%` }} />
              </div>
              <span className="text-xs text-muted">Q {currentQ + 1} / {quiz.length}</span>
            </div>

            {/* Question */}
            <div className="card mb-3">
              <div className="font-semibold mb-4" style={{ fontSize: 15, lineHeight: 1.5 }}>
                Q{currentQ + 1}. {quiz[currentQ]?.q}
              </div>

              {/* MCQ / T-F options */}
              {quiz[currentQ]?.opts?.length > 0
                ? quiz[currentQ].opts.map((opt, oi) => (
                    <button key={oi} className={`quiz-opt${answers[currentQ] === oi ? ' chosen' : ''}`}
                      onClick={() => !submitted && setAnswers((p) => ({ ...p, [currentQ]: oi }))}>
                      {opt}
                    </button>
                  ))
                : (
                  /* Fill in the blank */
                  <input className="input" placeholder="Type your answer…"
                    value={answers[currentQ] ?? ''}
                    onChange={(e) => setAnswers((p) => ({ ...p, [currentQ]: e.target.value }))} />
                )
              }
            </div>

            {/* Navigation */}
            <div className="flex-between">
              <button className="btn btn-secondary" onClick={() => setCurrentQ((p) => Math.max(0, p - 1))} disabled={currentQ === 0}>
                ← Previous
              </button>
              <div className="flex-center gap-2">
                {quiz.map((_, i) => (
                  <button key={i} onClick={() => setCurrentQ(i)} style={{
                    width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)',
                    background: answers[i] !== undefined ? 'var(--accent)' : i === currentQ ? 'var(--card2)' : 'var(--card)',
                    color: answers[i] !== undefined ? '#05101e' : 'var(--text2)',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  }}>{i + 1}</button>
                ))}
              </div>
              {currentQ < quiz.length - 1
                ? <button className="btn btn-primary" onClick={() => setCurrentQ((p) => p + 1)}>Next →</button>
                : <button className="btn btn-purple" onClick={submit}><CheckCircle size={14} /> Submit Quiz</button>
              }
            </div>
          </div>
        )}

        {/* Results */}
        {quiz && submitted && (
          <div className="fade-up">
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <div style={{
                fontSize: 54, fontWeight: 800, fontFamily: "'Syne',sans-serif",
                color: scorePct >= 70 ? 'var(--green)' : scorePct >= 50 ? 'var(--amber)' : 'var(--red)',
              }}>
                {score}/{quiz.length}
              </div>
              <div className="text-muted mt-1" style={{ fontSize: 15 }}>
                {scorePct}% — {scorePct >= 80 ? '🎉 Excellent!' : scorePct >= 60 ? '👍 Good job!' : '💪 Keep practicing!'}
              </div>
              <button className="btn btn-primary mt-4" onClick={() => { setQuiz(null); }}>
                <RefreshCw size={13} /> New Quiz
              </button>
            </div>

            <div className="glow-line" />
            <h3 className="font-semibold mb-3" style={{ fontSize: 14 }}>Answer Review</h3>
            {quiz.map((q, i) => (
              <div key={i} className="card mb-3" style={{ borderColor: isCorrect(i) ? 'var(--green)' : 'var(--red)' }}>
                <div className="flex-center gap-2 mb-2">
                  {isCorrect(i)
                    ? <CheckCircle size={14} color="var(--green)" />
                    : <span style={{ color: 'var(--red)', fontSize: 14 }}>✗</span>
                  }
                  <span className="font-semibold" style={{ fontSize: 13.5 }}>Q{i + 1}. {q.q}</span>
                </div>
                <div className="text-sm" style={{ color: 'var(--green)' }}>
                  ✓ Correct: {typeof q.ans === 'number' ? q.opts[q.ans] : q.ans}
                </div>
                {!isCorrect(i) && answers[i] !== undefined && (
                  <div className="text-sm" style={{ color: 'var(--red)' }}>
                    ✗ Your answer: {typeof answers[i] === 'number' ? q.opts[answers[i]] : answers[i]}
                  </div>
                )}
                {q.exp && <div className="tip mt-1">{q.exp}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
