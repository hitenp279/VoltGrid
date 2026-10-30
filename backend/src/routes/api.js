const express = require('express');
const router = express.Router();

const telemetryRoutes = require('./telemetry');
const stationsRoutes = require('./stations');
const evQueueRoutes = require('./evQueue');
const sessionsRoutes = require('./sessions');
const eventsRoutes = require('./events');
const usersRoutes = require('./users');
const { db } = require('../database/db');

// Main Sub-Routers
router.use('/telemetry', telemetryRoutes);
router.use('/stations', stationsRoutes);
router.use('/ev-queue', evQueueRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/events', eventsRoutes);
router.use('/users', usersRoutes);

// Legacy metrics endpoint
router.get('/metrics', (req, res) => {
  db.all('SELECT * FROM telemetry ORDER BY id DESC LIMIT 10', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ metrics: rows });
  });
});

// Legacy activities endpoint
router.get('/activities', (req, res) => {
  db.all('SELECT * FROM activities ORDER BY timestamp DESC LIMIT 10', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ activities: rows });
  });
});

router.post('/activities', (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }
  db.run('INSERT INTO activities (description) VALUES (?)', [description], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, description });
  });
});

module.exports = router;
