import { useState } from 'react';
import { Brain, Eye, EyeOff, Mail, Lock, User, Zap } from 'lucide-react';
import { login, signup } from '../api/authApi.js';

export default function LoginPage({ onAuth }) {
  const [mode,     setMode]     = useState('login');   // 'login' | 'signup'
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = mode === 'login'
        ? await login(email, password)
        : await signup(name, email, password);

      // Persist token + user to localStorage
      localStorage.setItem('sm_token', data.token);
      localStorage.setItem('sm_user',  JSON.stringify(data.user));
      onAuth(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLogin  = mode === 'login';
  const btnLabel = loading ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account';

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
    }}>
      {/* Background glow orbs */}
      <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', top:-100, left:-100, width:400, height:400,
          background:'var(--accent)', borderRadius:'50%', opacity:0.04, filter:'blur(80px)' }} />
        <div style={{ position:'absolute', bottom:-100, right:-100, width:400, height:400,
          background:'var(--purple)', borderRadius:'50%', opacity:0.04, filter:'blur:80px' }} />
      </div>

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{
            width:56, height:56, borderRadius:16, margin:'0 auto 12px',
            background:'linear-gradient(135deg,var(--accent),var(--purple))',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Brain size={28} color="#05101e" />
          </div>
          <h1 style={{ fontSize:26, fontWeight:800, fontFamily:"'Syne',sans-serif" }}>
            <span className="grad-text">StudyMind AI</span>
          </h1>
          <p className="text-muted" style={{ fontSize:13.5, marginTop:4 }}>
            Your intelligent study companion
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding:'2rem', border:'1px solid var(--border2)' }}>
          {/* Mode tabs */}
          <div className="tabs" style={{ width:'100%', marginBottom:'1.5rem' }}>
            <button
              className={`tab${isLogin ? ' active' : ''}`}
              style={{ flex:1 }}
              onClick={() => { setMode('login'); setError(''); }}
            >Sign In</button>
            <button
              className={`tab${!isLogin ? ' active' : ''}`}
              style={{ flex:1 }}
              onClick={() => { setMode('signup'); setError(''); }}
            >Sign Up</button>
          </div>

          <form onSubmit={submit}>
            {/* Name field — signup only */}
            {!isLogin && (
              <div style={{ marginBottom:'1rem' }}>
                <label className="text-xs text-muted" style={{ display:'block', marginBottom:5 }}>
                  Full Name
                </label>
                <div style={{ position:'relative' }}>
                  <User size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text2)' }} />
                  <input
                    className="input"
                    style={{ paddingLeft:34 }}
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom:'1rem' }}>
              <label className="text-xs text-muted" style={{ display:'block', marginBottom:5 }}>
                Email Address
              </label>
              <div style={{ position:'relative' }}>
                <Mail size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text2)' }} />
                <input
                  className="input"
                  style={{ paddingLeft:34 }}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:'1.5rem' }}>
              <label className="text-xs text-muted" style={{ display:'block', marginBottom:5 }}>
                Password {!isLogin && <span>(min 6 characters)</span>}
              </label>
              <div style={{ position:'relative' }}>
                <Lock size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text2)' }} />
                <input
                  className="input"
                  style={{ paddingLeft:34, paddingRight:40 }}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', color:'var(--text2)', padding:2 }}
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                padding:'10px 14px', borderRadius:9, marginBottom:'1rem',
                background:'var(--red-d)', border:'1px solid rgba(244,63,94,0.25)',
                color:'var(--red)', fontSize:13,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width:'100%', justifyContent:'center', padding:'11px' }}
              disabled={loading}
            >
              {loading
                ? <><div className="spinner" style={{ width:14, height:14 }} /> {btnLabel}</>
                : <><Zap size={14} /> {btnLabel}</>
              }
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-muted" style={{ textAlign:'center', fontSize:13, marginTop:'1.25rem' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(isLogin ? 'signup' : 'login'); setError(''); }}
              style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer',
                fontSize:13, fontWeight:600, padding:0 }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-muted" style={{ textAlign:'center', fontSize:11.5, marginTop:'1rem' }}>
          Free forever · Powered by Google Gemini · No credit card needed
        </p>
      </div>
    </div>
  );
}
