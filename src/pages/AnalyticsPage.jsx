import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import { TrendingUp, Clock, Flame, HelpCircle, Target, BarChart2 } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';

const COLORS = ['#06d6c8', '#a855f7', '#f59e0b', '#10b981', '#f43f5e', '#4a9eff'];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      {label && <div style={{ color: 'var(--text2)', marginBottom: 3 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color ?? 'var(--accent)' }}>
          {p.name}: <strong>{p.value}{typeof p.value === 'number' && p.name?.includes('%') ? '' : ''}</strong>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage({ stats }) {
  const weeklyHours = [
    { day: 'Mon', hours: 2.5 }, { day: 'Tue', hours: 1.8 }, { day: 'Wed', hours: 3.2 },
    { day: 'Thu', hours: 2.0 }, { day: 'Fri', hours: 1.5 }, { day: 'Sat', hours: 4.1 }, { day: 'Sun', hours: 2.8 },
  ];

  const quizTrend = [
    { week: 'Wk1', score: 62 }, { week: 'Wk2', score: 71 }, { week: 'Wk3', score: 68 },
    { week: 'Wk4', score: 79 }, { week: 'Wk5', score: 83 }, { week: 'Wk6', score: stats.avgScore || 88 },
  ];

  const topicDist = [
    { name: 'Mathematics', value: 28 }, { name: 'Computer Science', value: 22 },
    { name: 'Physics', value: 18 }, { name: 'History', value: 15 }, { name: 'Other', value: 17 },
  ];

  const subjectMastery = [
    { subject: 'Math', score: 85 }, { subject: 'CS', score: 92 }, { subject: 'Physics', score: 70 },
    { subject: 'History', score: 78 }, { subject: 'English', score: 88 }, { subject: 'Biology', score: 65 },
  ];

  const insights = [
    { icon: <TrendingUp size={15}/>, title: 'Quiz Improving', desc: 'Your quiz scores improved 26% over 6 weeks. Keep it up!', color: 'var(--green)' },
    { icon: <Target size={15}/>,    title: 'Focus: Biology', desc: 'Biology is at 65% mastery. Spend extra time here this week.', color: 'var(--amber)' },
    { icon: <Flame size={15}/>,     title: 'Peak Day: Saturday', desc: 'You study 4.1h on Saturdays — schedule tough topics then.', color: 'var(--red)' },
  ];

  return (
    <div className="page fade-up">
      <TopBar title="Study Analytics" subtitle="Track learning progress, weak areas, and study habits" />
      <div className="mt-6">

        {/* KPI cards */}
        <div className="grid-4 mb-6">
          {[
            { label: 'Study Time',    value: `${stats.studyTime}m`, sub: 'This week',     icon: <Clock size={17}/>,      color: 'var(--accent)' },
            { label: 'Quizzes Taken', value: stats.quizzesTaken,    sub: 'All time',      icon: <HelpCircle size={17}/>, color: 'var(--purple)' },
            { label: 'Avg Quiz Score',value: `${stats.avgScore || 78}%`, sub: '+5% vs last week', icon: <TrendingUp size={17}/>, color: 'var(--green)' },
            { label: 'Day Streak',    value: `${stats.streak}d`,    sub: 'Keep going 🔥', icon: <Flame size={17}/>,      color: 'var(--amber)' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="flex-between mb-3">
                <span className="text-xs text-muted font-medium">{s.label}</span>
                <span style={{ color: s.color, opacity: 0.75 }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Syne',sans-serif", color: s.color }}>
                {s.value}
              </div>
              <div className="text-xs text-muted mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid-2 mb-6">
          <div className="card">
            <h3 className="font-semibold mb-4" style={{ fontSize: 13.5 }}>Weekly Study Hours</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyHours} margin={{ top: 4, right: 4, bottom: 0, left: -26 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text2)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text2)' }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="hours" name="Hours" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4" style={{ fontSize: 13.5 }}>Quiz Score Trend</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={quizTrend} margin={{ top: 4, right: 4, bottom: 0, left: -26 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text2)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: 'var(--text2)' }} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="score" name="Score %"
                  stroke="var(--purple)" strokeWidth={2.5}
                  dot={{ fill: 'var(--purple)', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid-2 mb-6">
          {/* Pie chart */}
          <div className="card">
            <h3 className="font-semibold mb-4" style={{ fontSize: 13.5 }}>Topic Distribution</h3>
            <div className="flex-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={topicDist} cx="50%" cy="50%"
                    innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                    {topicDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {topicDist.map((t, i) => (
                  <div key={t.name} className="flex-center gap-2 mb-2">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span className="text-sm" style={{ flex: 1 }}>{t.name}</span>
                    <span className="text-xs text-muted font-medium">{t.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Radar chart */}
          <div className="card">
            <h3 className="font-semibold mb-4" style={{ fontSize: 13.5 }}>Subject Mastery</h3>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={subjectMastery}>
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text2)' }} />
                <Radar name="Score" dataKey="score"
                  stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.12} strokeWidth={1.8} />
                <Tooltip content={<ChartTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="glow-line" />
        <h3 className="font-semibold mb-3" style={{ fontSize: 14 }}>AI Insights</h3>
        <div className="grid-3">
          {insights.map((ins) => (
            <div key={ins.title} className="card" style={{ borderColor: ins.color + '30' }}>
              <div style={{ color: ins.color, marginBottom: 8 }}>{ins.icon}</div>
              <div className="font-semibold mb-1" style={{ fontSize: 13.5 }}>{ins.title}</div>
              <div className="text-xs text-muted" style={{ lineHeight: 1.6 }}>{ins.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
