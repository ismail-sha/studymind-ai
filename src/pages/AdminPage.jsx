import { useEffect, useState } from 'react';
import {
  Users, UserCheck, TrendingUp, Activity,
  Trash2, Shield, RefreshCw, Search,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import TopBar    from '../components/TopBar.jsx';
import { getAdminStats, getAdminUsers, deleteUser, updateUserRole } from '../api/authApi.js';

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)',
      borderRadius:8, padding:'8px 12px', fontSize:12 }}>
      <div style={{ color:'var(--text2)', marginBottom:2 }}>{label}</div>
      <div style={{ color:'var(--accent)' }}>Signups: {payload[0].value}</div>
    </div>
  );
}

export default function AdminPage({ token }) {
  const [stats,   setStats]   = useState(null);
  const [users,   setUsers]   = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [tab,     setTab]     = useState('overview'); // 'overview' | 'users'

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, u] = await Promise.all([
        getAdminStats(token),
        getAdminUsers(token),
      ]);
      setStats(s);
      setUsers(u);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await deleteUser(token, id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setStats((prev) => prev ? { ...prev, totalUsers: prev.totalUsers - 1 } : prev);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${user.name} to "${newRole}"?`)) return;
    try {
      await updateUserRole(token, user.id, newRole);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Role update failed: ' + err.message);
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
  const fmtTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : 'Never';

  return (
    <div className="page fade-up">
      <TopBar
        title="Admin Dashboard"
        subtitle="User management and app analytics"
        actions={
          <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} /> Refresh
          </button>
        }
      />

      {error && (
        <div style={{ margin:'1rem 0', padding:'12px 16px', borderRadius:10,
          background:'var(--red-d)', border:'1px solid rgba(244,63,94,0.25)', color:'var(--red)', fontSize:13 }}>
          ⚠️ {error}
        </div>
      )}

      {loading && !stats ? (
        <div style={{ textAlign:'center', padding:'5rem', color:'var(--text2)' }}>
          <div className="spinner spinner-lg" style={{ margin:'0 auto 12px' }} />
          Loading admin data…
        </div>
      ) : (
        <div className="mt-6">
          {/* Tabs */}
          <div className="tabs mb-6">
            <button className={`tab${tab === 'overview' ? ' active' : ''}`} onClick={() => setTab('overview')}>
              Overview
            </button>
            <button className={`tab${tab === 'users' ? ' active' : ''}`} onClick={() => setTab('users')}>
              Users ({users.length})
            </button>
          </div>

          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && stats && (
            <>
              {/* KPI cards */}
              <div className="grid-4 mb-6">
                {[
                  { label:'Total Users',     value: stats.totalUsers,   icon:<Users size={17}/>,      color:'var(--accent)' },
                  { label:'Signups Today',   value: stats.todaySignups, icon:<TrendingUp size={17}/>, color:'var(--green)' },
                  { label:'Active Today',    value: stats.activeToday,  icon:<Activity size={17}/>,   color:'var(--purple)' },
                  { label:'Admin Accounts',  value: users.filter(u=>u.role==='admin').length, icon:<Shield size={17}/>, color:'var(--amber)' },
                ].map((s) => (
                  <div key={s.label} className="stat-card">
                    <div className="flex-between mb-3">
                      <span className="text-xs text-muted font-medium">{s.label}</span>
                      <span style={{ color:s.color, opacity:0.75 }}>{s.icon}</span>
                    </div>
                    <div style={{ fontSize:28, fontWeight:700, fontFamily:"'Syne',sans-serif", color:s.color }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Signups chart */}
              <div className="card mb-6">
                <h3 className="font-semibold mb-4" style={{ fontSize:14 }}>
                  New Signups — Last 7 Days
                </h3>
                {stats.weeklySignups?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={stats.weeklySignups} margin={{ top:4, right:4, bottom:0, left:-26 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="day"   tick={{ fontSize:11, fill:'var(--text2)' }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="count" tick={{ fontSize:10, fill:'var(--text2)' }} allowDecimals={false} />
                      <Tooltip content={<ChartTip />} />
                      <Bar dataKey="count" fill="var(--accent)" radius={[5,5,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-muted text-sm" style={{ textAlign:'center', padding:'2rem' }}>
                    No signups in the last 7 days yet.
                  </div>
                )}
              </div>

              {/* Top active users */}
              {stats.topUsers?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold mb-4" style={{ fontSize:14 }}>Most Active Users</h3>
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13.5 }}>
                      <thead>
                        <tr style={{ borderBottom:'1px solid var(--border)' }}>
                          {['Name','Email','Logins','Last Active'].map((h) => (
                            <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontWeight:600,
                              fontSize:12, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topUsers.map((u, i) => (
                          <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                            <td style={{ padding:'10px 12px', fontWeight:500 }}>{u.name}</td>
                            <td style={{ padding:'10px 12px', color:'var(--text2)' }}>{u.email}</td>
                            <td style={{ padding:'10px 12px' }}>
                              <span className="badge badge-cyan">{u.login_count}</span>
                            </td>
                            <td style={{ padding:'10px 12px', color:'var(--text2)', fontSize:12 }}>{fmtTime(u.last_login)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── USERS TAB ── */}
          {tab === 'users' && (
            <>
              {/* Search */}
              <div style={{ position:'relative', maxWidth:340, marginBottom:'1rem' }}>
                <Search size={14} style={{ position:'absolute', left:11, top:'50%',
                  transform:'translateY(-50%)', color:'var(--text2)' }} />
                <input
                  className="input"
                  style={{ paddingLeft:34 }}
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="card" style={{ padding:0, overflow:'hidden' }}>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13.5 }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--card2)' }}>
                        {['#','Name','Email','Role','Joined','Last Login','Logins','Actions'].map((h) => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:600,
                            fontSize:11.5, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign:'center', padding:'2rem', color:'var(--text2)' }}>
                            No users found.
                          </td>
                        </tr>
                      ) : filtered.map((u, i) => (
                        <tr key={u.id} style={{ borderBottom:'1px solid var(--border)', transition:'background 0.12s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background='var(--card2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background=''}
                        >
                          <td style={{ padding:'10px 14px', color:'var(--text2)', fontSize:12 }}>{i + 1}</td>
                          <td style={{ padding:'10px 14px', fontWeight:500 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0,
                                background:'linear-gradient(135deg,var(--accent),var(--purple))',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                fontSize:11, fontWeight:700, color:'#05101e' }}>
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              {u.name}
                            </div>
                          </td>
                          <td style={{ padding:'10px 14px', color:'var(--text2)' }}>{u.email}</td>
                          <td style={{ padding:'10px 14px' }}>
                            <span className={`badge ${u.role === 'admin' ? 'badge-amber' : 'badge-cyan'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding:'10px 14px', color:'var(--text2)', fontSize:12, whiteSpace:'nowrap' }}>{fmtDate(u.created_at)}</td>
                          <td style={{ padding:'10px 14px', color:'var(--text2)', fontSize:12, whiteSpace:'nowrap' }}>{fmtTime(u.last_login)}</td>
                          <td style={{ padding:'10px 14px' }}>
                            <span className="badge badge-purple">{u.login_count}</span>
                          </td>
                          <td style={{ padding:'10px 14px' }}>
                            <div style={{ display:'flex', gap:6 }}>
                              <button
                                className="btn btn-ghost btn-icon"
                                title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                                onClick={() => handleRoleToggle(u)}
                              >
                                <Shield size={13} color={u.role === 'admin' ? 'var(--amber)' : 'var(--text2)'} />
                              </button>
                              <button
                                className="btn btn-ghost btn-icon"
                                title="Delete user"
                                onClick={() => handleDelete(u.id, u.name)}
                              >
                                <Trash2 size={13} color="var(--red)" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="tip mt-3">
                {filtered.length} of {users.length} users shown
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
