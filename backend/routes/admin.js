const router    = require('express').Router();
const pool      = require('../db');
const requireAuth  = require('../middleware/auth');
const requireAdmin = require('../middleware/isAdmin');

// All routes require auth + admin role
router.use(requireAuth, requireAdmin);

// ── GET /api/admin/stats ────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [total, todaySignups, activeToday, weeklySignups, topUsers] =
      await Promise.all([
        // Total non-admin users
        pool.query(
          "SELECT COUNT(*) FROM users WHERE role = 'user'"
        ),
        // Signups today
        pool.query(
          "SELECT COUNT(*) FROM users WHERE role='user' AND created_at::date = NOW()::date"
        ),
        // Active today (logged in today)
        pool.query(
          "SELECT COUNT(*) FROM users WHERE last_login::date = NOW()::date"
        ),
        // Signups per day for last 7 days
        pool.query(
          `SELECT TO_CHAR(created_at::date, 'Mon DD') AS day,
                  COUNT(*) AS count
           FROM users
           WHERE role = 'user'
             AND created_at >= NOW() - INTERVAL '7 days'
           GROUP BY created_at::date
           ORDER BY created_at::date`
        ),
        // Most active users
        pool.query(
          `SELECT name, email, login_count, last_login
           FROM users WHERE role='user'
           ORDER BY login_count DESC
           LIMIT 5`
        ),
      ]);

    res.json({
      totalUsers:    parseInt(total.rows[0].count),
      todaySignups:  parseInt(todaySignups.rows[0].count),
      activeToday:   parseInt(activeToday.rows[0].count),
      weeklySignups: weeklySignups.rows,
      topUsers:      topUsers.rows,
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ error: 'Failed to load stats.' });
  }
});

// ── GET /api/admin/users ────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, created_at, last_login, login_count
       FROM users
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load users.' });
  }
});

// ── DELETE /api/admin/users/:id ─────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting admin accounts
    const check = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (check.rows[0].role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin accounts.' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// ── PATCH /api/admin/users/:id/role ────────────────────────────
router.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be "user" or "admin".' });
  }
  try {
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role.' });
  }
});

module.exports = router;
