import {
  Home, FileText, MessageSquare, HelpCircle, Layers,
  BarChart2, Calendar, Settings, Brain, LogOut, Shield,
} from 'lucide-react';

const NAV = [
  { id:'home',       label:'Dashboard',     icon:<Home         size={16}/> },
  { id:'upload',     label:'Documents',     icon:<FileText     size={16}/> },
  { id:'chat',       label:'AI Tutor Chat', icon:<MessageSquare size={16}/> },
  { id:'quiz',       label:'Quiz Generator',icon:<HelpCircle   size={16}/> },
  { id:'flashcards', label:'Flashcards',    icon:<Layers       size={16}/> },
  { id:'analytics',  label:'Analytics',     icon:<BarChart2    size={16}/> },
  { id:'planner',    label:'Study Planner', icon:<Calendar     size={16}/> },
  { id:'settings',   label:'Settings',      icon:<Settings     size={16}/> },
];

export default function Sidebar({ page, setPage, user, onLogout }) {
  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="flex-center gap-3">
          <div className="sidebar-logo-mark">
            <Brain size={17} color="#05101e" />
          </div>
          <span className="sidebar-logo-text">StudyMind AI</span>
        </div>
        <div className="sidebar-pill">✦ Powered by Gemini</div>
      </div>

      {/* Nav */}
      <div style={{ padding:'0.6rem 6px', flex:1 }}>
        <div className="nav-section-label">Menu</div>
        {NAV.map((item) => (
          <div key={item.id}
            className={`nav-item${page === item.id ? ' active' : ''}`}
            onClick={() => setPage(item.id)}>
            {item.icon}
            {item.label}
          </div>
        ))}

        {/* Admin link — only visible for admin users */}
        {user?.role === 'admin' && (
          <>
            <div className="nav-section-label" style={{ marginTop:12 }}>Admin</div>
            <div
              className={`nav-item${page === 'admin' ? ' active' : ''}`}
              onClick={() => setPage('admin')}
              style={{ color: page === 'admin' ? 'var(--amber)' : '',
                background: page === 'admin' ? 'var(--amber-d)' : '',
                borderColor: page === 'admin' ? 'rgba(245,158,11,0.3)' : '' }}
            >
              <Shield size={16} />
              Admin Dashboard
            </div>
          </>
        )}
      </div>

      {/* User footer with logout */}
      <div className="sidebar-footer">
        <div className="flex-between">
          <div className="flex-center gap-2">
            <div style={{
              width:28, height:28, borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg,#3b5bff,var(--purple))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, fontWeight:700, color:'white',
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth:0 }}>
              <div className="text-sm font-medium truncate" style={{ maxWidth:110 }}>
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-muted">
                {user?.role === 'admin' ? '⭐ Admin' : 'Free Plan'}
              </div>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            title="Logout"
            onClick={onLogout}
            style={{ flexShrink:0 }}
          >
            <LogOut size={14} color="var(--text2)" />
          </button>
        </div>
      </div>
    </nav>
  );
}
