require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes  = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

// ── CORS ────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',   // Vite dev server
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return cb(null, true);
    if (allowedOrigins.some((o) => origin.startsWith(o))) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Body parser ─────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Routes ──────────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/admin', adminRoutes);

// ── Health check (Render pings this to keep server alive) ───────
app.get('/api/health', (req, res) => {
  res.json({
    status:  'ok',
    service: 'StudyMind AI Backend',
    time:    new Date().toISOString(),
  });
});

// ── 404 handler ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ─────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 StudyMind AI backend running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Admin email: ${process.env.ADMIN_EMAIL || '(not set)'}`);
});
