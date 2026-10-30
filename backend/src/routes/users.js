const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// Ensure users table exists dynamically
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    role TEXT,
    createdAt TEXT
  )
`);

// GET /api/users/profile/:uid - Read user profile
router.get('/profile/:uid', (req, res) => {
  const { uid } = req.params;
  db.get('SELECT * FROM users WHERE uid = ?', [uid], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json(user);
  });
});

// POST /api/users/profile - Upsert user profile
router.post('/profile', (req, res) => {
  const { uid, name, email, role = 'user' } = req.body;
  if (!uid || !email) {
    return res.status(400).json({ error: 'uid and email are required' });
  }

  const createdAt = new Date().toISOString();
  db.run(
    `INSERT INTO users (uid, name, email, role, createdAt)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(uid) DO UPDATE SET name = excluded.name, email = excluded.email, role = excluded.role`,
    [uid, name || 'EV Driver', email, role, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        success: true,
        uid,
        name: name || 'EV Driver',
        email,
        role
      });
    }
  );
});

module.exports = router;
