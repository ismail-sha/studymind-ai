import { ChevronRight, Plus, FileText, MessageSquare, HelpCircle, Layers,
  Clock, Flame, BarChart2, Target, TrendingUp, Brain, Zap, BookOpen, Calendar } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';

export default function HomePage({ stats, setPage, documents }) {
  const quickActions = [
    { label: 'Upload Document',  icon: <FileText size={18}/>,      page: 'upload',     color: 'var(--accent)',  desc: 'Add PDFs, DOCX, TXT files' },
    { label: 'Chat with AI',     icon: <MessageSquare size={18}/>, page: 'chat',       color: 'var(--purple)', desc: 'Ask anything, get explanations' },
    { label: 'Generate Quiz',    icon: <HelpCircle size={18}/>,    page: 'quiz',       color: 'var(--amber)',  desc: 'MCQ, T/F, fill in the blanks' },
    { label: 'Study Flashcards', icon: <Layers size={18}/>,        page: 'flashcards', color: 'var(--red)',    desc: 'AI-generated flip cards' },
    { label: 'Study Planner',    icon: <Calendar size={18}/>,      page: 'planner',    color: 'var(--green)',  desc: 'Personalized exam schedule' },
    { label: 'Analytics',        icon: <BarChart2 size={18}/>,     page: 'analytics',  color: '#4a9eff',       desc: 'Track progress & weak areas' },
  ];

  const features = [
    { icon: <Brain size={16}/>,     title: 'AI Summarization',  desc: 'Concise or detailed summaries from any document',   color: 'var(--accent)' },
    { icon: <HelpCircle size={16}/>,title: 'Adaptive Quizzes',  desc: 'MCQ, True/False, Fill-in-blank with explanations',  color: 'var(--purple)' },
    { icon: <Layers size={16}/>,    title: 'Smart Flashcards',  desc: 'Auto-generated flip cards with spaced repetition',  color: 'var(--amber)' },
    { icon: <Target size={16}/>,    title: 'Weak Area Detection',desc:'AI finds knowledge gaps and reinforces them',        color: 'var(--red)' },
    { icon: <Zap size={16}/>,       title: 'Multi-Doc Chat',    desc: 'Chat with context from any uploaded document',      color: 'var(--green)' },
    { icon: <TrendingUp size={16}/>,title: 'Progress Tracking', desc: 'Charts, streaks, quiz trends and insights',         color: '#4a9eff' },
  ];

  return (
    <div className="page fade-up">
      <TopBar
        title="Dashboard"
        subtitle={`Welcome back! You're on a ${stats.streak}-day streak 🔥`}
        actions={
          <button className="btn btn-primary" onClick={() => setPage('upload')}>
            <Plus size={14} /> New Session
          </button>
        }
      />

      <div className="mt-6">
        {/* Hero banner */}
        <div className="card mb-6" style={{
          background: 'linear-gradient(135deg, rgba(6,214,200,0.08), rgba(168,85,247,0.08))',
          borderColor: 'var(--border2)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160,
            background:'var(--purple)', borderRadius:'50%', opacity:0.04, filter:'blur(40px)' }} />
          <div className="flex-center gap-4">
            <div style={{ width:52, height:52, borderRadius:14, flexShrink:0,
              background:'linear-gradient(135deg,var(--accent),var(--purple))',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Brain size={26} color="#05101e" />
            </div>
            <div style={{ flex:1 }}>
              <h2 style={{ fontSize:20, fontWeight:700 }}>
                <span className="grad-text">StudyMind AI</span> is ready
              </h2>
              <p className="text-muted mt-1" style={{ fontSize:13.5 }}>
                Upload documents · Chat with AI · Generate quizzes · Track progress — all in one app.
              </p>
            </div>
            {documents.length === 0 && (
              <button className="btn btn-primary" onClick={() => setPage('upload')}>
                Get Started <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid-4 mb-6">
          {[
            { label: 'Documents',    value: documents.length,   icon: <FileText size={17}/>,   color: 'var(--accent)' },
            { label: 'Quizzes Taken',value: stats.quizzesTaken, icon: <HelpCircle size={17}/>, color: 'var(--purple)' },
            { label: 'Study Time',   value: `${stats.studyTime}m`, icon: <Clock size={17}/>,  color: 'var(--amber)' },
            { label: 'Day Streak',   value: stats.streak,       icon: <Flame size={17}/>,      color: 'var(--red)' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="flex-between mb-3">
                <span className="text-xs text-muted font-medium">{s.label}</span>
                <span style={{ color: s.color, opacity: 0.75 }}>{s.icon}</span>
              </div>
              <div style={{ fontSize:26, fontWeight:700, fontFamily:"'Syne',sans-serif", color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid-2 mb-6">
          {/* Quick Actions */}
          <div>
            <h3 className="font-semibold mb-3" style={{ fontSize:14 }}>Quick Actions</h3>
            <div className="flex-col gap-2">
              {quickActions.map((a) => (
                <div key={a.page} className="card card-hover"
                  style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}
                  onClick={() => setPage(a.page)}>
                  <div style={{ width:36, height:36, borderRadius:9, flexShrink:0,
                    background: a.color + '1a', display:'flex', alignItems:'center',
                    justifyContent:'center', color: a.color }}>
                    {a.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <div className="font-medium" style={{ fontSize:13.5 }}>{a.label}</div>
                    <div className="text-xs text-muted">{a.desc}</div>
                  </div>
                  <ChevronRight size={14} color="var(--text2)" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent uploads */}
          <div>
            <h3 className="font-semibold mb-3" style={{ fontSize:14 }}>
              {documents.length ? 'Recent Documents' : 'Getting Started'}
            </h3>
            {documents.length > 0 ? (
              <div className="flex-col gap-2">
                {documents.slice(-5).reverse().map((doc) => (
                  <div key={doc.id} className="file-item" onClick={() => setPage('upload')}>
                    <FileText size={14} color="var(--accent)" />
                    <div style={{ flex:1 }}>
                      <div className="text-sm font-medium truncate">{doc.name}</div>
                      <div className="text-xs text-muted">{doc.size} · {doc.uploadedAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card flex-col gap-3">
                {[
                  '1. Go to Documents → Upload a PDF or TXT file',
                  '2. Visit AI Tutor Chat → Ask questions about it',
                  '3. Try Quiz Generator → Test your knowledge',
                  '4. Generate Flashcards → Review key points',
                ].map((step) => (
                  <div key={step} className="flex-center gap-3" style={{ fontSize:13 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', flexShrink:0 }} />
                    <span className="text-muted">{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Feature grid */}
        <div className="glow-line" />
        <h3 className="font-semibold mb-3" style={{ fontSize:14 }}>AI Feature Suite</h3>
        <div className="grid-3">
          {features.map((f) => (
            <div key={f.title} className="card card-hover">
              <div style={{ color: f.color, marginBottom:8 }}>{f.icon}</div>
              <div className="font-semibold mb-1" style={{ fontSize:13.5 }}>{f.title}</div>
              <div className="text-xs text-muted" style={{ lineHeight:1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
