import { useState } from 'react';
import { Calendar, Zap, Check, Lightbulb } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import { askGeminiJSON } from '../api/gemini.js';

const SYSTEM = 'You are a study planner AI. Return ONLY valid JSON — no markdown, no explanation.';

const TYPE_COLOR = {
  reading:  'var(--accent)',
  practice: 'var(--purple)',
  review:   'var(--amber)',
  test:     'var(--red)',
  watch:    '#4a9eff',
};

export default function PlannerPage() {
  const [subject,  setSubject]  = useState('');
  const [examDate, setExamDate] = useState('');
  const [hpd,      setHpd]      = useState('2');
  const [level,    setLevel]    = useState('beginner');

  const [plan,     setPlan]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(new Set());

  /* ── Generate plan ── */
  const generate = async () => {
    const daysAway = examDate
      ? Math.max(1, Math.ceil((new Date(examDate) - Date.now()) / 86400000))
      : 14;

    const prompt = `Create a ${Math.min(daysAway, 7)}-day study plan for:
Subject: "${subject}"
Days until exam/goal: ${daysAway}
Hours per day available: ${hpd}
Student level: ${level}

Return a JSON array of day objects:
[
  {
    "day": "Day 1 — Monday, May 19",
    "focus": "Short focus area title",
    "tasks": [
      {
        "time": "9:00 AM",
        "topic": "Specific topic to study",
        "duration": "1 hour",
        "type": "reading"
      }
    ],
    "tip": "One helpful motivational or study tip for this day"
  }
]

Rules:
- Create ${Math.min(daysAway, 7)} days
- Each day has 2-4 tasks fitting within ${hpd} hours total
- task type must be one of: reading, practice, review, test, watch
- topics must be specific (e.g. "Chapter 3: Derivatives" not just "Math")
- Return ONLY the JSON array.`;

    setLoading(true);
    setPlan(null);
    setDone(new Set());

    const raw = await askGeminiJSON(prompt, SYSTEM);
    try {
      const match = raw.match(/\[[\s\S]*\]/);
      setPlan(JSON.parse(match ? match[0] : raw));
    } catch {
      setPlan([{
        day: `Day 1 — Study ${subject}`,
        focus: subject,
        tasks: [
          { time: 'Morning',   topic: `Introduction to ${subject}`,  duration: `${Math.floor(+hpd / 2)} hr`, type: 'reading' },
          { time: 'Afternoon', topic: 'Practice problems',           duration: `${Math.ceil(+hpd / 2)} hr`,  type: 'practice' },
        ],
        tip: 'Stay consistent! Even 30 minutes a day compounds over time.',
      }]);
    }
    setLoading(false);
  };

  const totalTasks = plan?.reduce((n, d) => n + d.tasks.length, 0) ?? 0;
  const doneCount  = done.size;
  const pct        = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0;

  const toggleDone = (key) =>
    setDone((prev) => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; });

  return (
    <div className="page fade-up">
      <TopBar title="Study Planner" subtitle="AI-generated personalized exam preparation schedule" />
      <div className="mt-6">

        {/* Config card */}
        <div className="card mb-6">
          <h3 className="font-semibold mb-4" style={{ fontSize: 15 }}>Generate Your Study Plan</h3>
          <div className="grid-4 mb-4">
            <div style={{ gridColumn: 'span 2' }}>
              <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>Subject / Topic *</label>
              <input className="input" placeholder="e.g. Calculus, Data Structures, The French Revolution…"
                value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>Exam / Goal Date</label>
              <input type="date" className="input" value={examDate}
                onChange={(e) => setExamDate(e.target.value)} style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>Hours / Day</label>
              <select className="select" value={hpd} onChange={(e) => setHpd(e.target.value)}>
                {['1', '2', '3', '4', '5', '6'].map((h) => (
                  <option key={h} value={h}>{h} hour{+h > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-center gap-4 mb-4">
            <div>
              <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>Your Level</label>
              <div className="tabs">
                {['beginner', 'intermediate', 'advanced'].map((l) => (
                  <button key={l} className={`tab${level === l ? ' active' : ''}`}
                    style={{ textTransform: 'capitalize' }} onClick={() => setLevel(l)}>{l}</button>
                ))}
              </div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={generate} disabled={!subject || loading}>
            {loading
              ? <><div className="spinner" /> Generating Plan…</>
              : <><Calendar size={14} /> Generate Study Plan</>
            }
          </button>
        </div>

        {/* Plan output */}
        {plan && (
          <div className="fade-up">
            {/* Overall progress */}
            <div className="card mb-5">
              <div className="flex-between mb-2">
                <span className="font-semibold" style={{ fontSize: 13.5 }}>Overall Progress</span>
                <span className="text-accent font-semibold" style={{ fontSize: 13.5 }}>
                  {doneCount} / {totalTasks} tasks
                </span>
              </div>
              <div className="progress" style={{ height: 8, marginBottom: 8 }}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-xs text-muted">{pct}% complete{pct === 100 ? ' 🎉 Plan finished!' : ''}</div>
            </div>

            {/* Day cards */}
            {plan.map((day, di) => (
              <div key={di} className="card mb-4">
                <div className="flex-between mb-3">
                  <div>
                    <div className="font-semibold" style={{ fontSize: 14 }}>{day.day}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--accent)' }}>{day.focus}</div>
                  </div>
                  <span className="badge badge-cyan">{day.tasks.length} tasks</span>
                </div>

                {/* Tasks */}
                {day.tasks.map((task, ti) => {
                  const key = `${di}-${ti}`;
                  const isDone = done.has(key);
                  return (
                    <div key={ti} className="plan-task">
                      <div className={`task-check${isDone ? ' done' : ''}`} onClick={() => toggleDone(key)}>
                        {isDone && <Check size={9} color="#05101e" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="font-medium" style={{
                          fontSize: 13.5,
                          textDecoration: isDone ? 'line-through' : 'none',
                          color: isDone ? 'var(--text2)' : 'var(--text)',
                        }}>
                          {task.topic}
                        </div>
                        <div className="text-xs text-muted mt-1">
                          🕐 {task.time} &nbsp;·&nbsp; ⏱ {task.duration}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 5, flexShrink: 0,
                        background: (TYPE_COLOR[task.type] ?? 'var(--accent)') + '1a',
                        color: TYPE_COLOR[task.type] ?? 'var(--accent)',
                        border: `1px solid ${(TYPE_COLOR[task.type] ?? 'var(--accent)') + '30'}`,
                        textTransform: 'capitalize',
                      }}>
                        {task.type}
                      </span>
                    </div>
                  );
                })}

                {/* Daily tip */}
                {day.tip && (
                  <div className="flex-center gap-2 mt-3" style={{
                    padding: '8px 12px', background: 'var(--accent-d)',
                    borderRadius: 8, fontSize: 12.5, color: 'var(--accent)',
                  }}>
                    <Lightbulb size={12} style={{ flexShrink: 0 }} />
                    {day.tip}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
