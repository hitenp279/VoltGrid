const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const telemetrySimulator = require('../services/telemetrySimulator');

// GET /api/events - System & SCADA Event Logs
router.get('/', (req, res) => {
  db.all('SELECT * FROM events ORDER BY id DESC LIMIT 30', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/events - Append new event
router.post('/', (req, res) => {
  const { message, type = 'INFO', source = 'AI Engine' } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  telemetrySimulator.logEvent(message, type, source);
  res.status(201).json({ success: true, message, type, source });
});

module.exports = router;
