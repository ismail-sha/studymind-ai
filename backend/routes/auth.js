const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../db');
const requireAuth = require('../middleware/auth');

// ── Helper: generate JWT ────────────────────────────────────────
const makeToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// ── POST /api/auth/signup ───────────────────────────────────────
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  try {
    // Check duplicate
    const exists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 12);

    // Admin role if email matches ADMIN_EMAIL env var
    const role = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()
      ? 'admin'
      : 'user';

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.toLowerCase(), hash, role]
    );

    const user  = result.rows[0];
    const token = makeToken(user);

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── POST /api/auth/login ────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user  = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Update last login + count
    await pool.query(
      'UPDATE users SET last_login = NOW(), login_count = login_count + 1 WHERE id = $1',
      [user.id]
    );

    // Log activity
    await pool.query(
      'INSERT INTO activity_log (user_id, action) VALUES ($1, $2)',
      [user.id, 'login']
    ).catch(() => {}); // non-critical

    const token = makeToken(user);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── GET /api/auth/me  (verify token & return user) ─────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
