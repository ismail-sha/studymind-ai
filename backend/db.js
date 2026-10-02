const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// ── Auto-create tables on first run ────────────────────────────
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id           SERIAL PRIMARY KEY,
        name         VARCHAR(100)  NOT NULL,
        email        VARCHAR(255)  UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role         VARCHAR(20)   DEFAULT 'user',
        created_at   TIMESTAMP     DEFAULT NOW(),
        last_login   TIMESTAMP,
        login_count  INT           DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS activity_log (
        id         SERIAL PRIMARY KEY,
        user_id    INT REFERENCES users(id) ON DELETE CASCADE,
        action     VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Database tables ready');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  }
};

initDB();

module.exports = pool;
