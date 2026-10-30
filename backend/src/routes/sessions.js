const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const telemetrySimulator = require('../services/telemetrySimulator');

// GET /api/sessions/history - Get completed sessions history
router.get('/history', (req, res) => {
  db.all('SELECT * FROM session_history ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/sessions/history - Add completed session record
router.post('/history', (req, res) => {
  const {
    stationName,
    bayId,
    vehicle,
    energyDeliveredKwh,
    duration,
    cost,
    priorityTier = 'NORMAL',
    status = 'COMPLETED',
    peakPower = '60 kW'
  } = req.body;

  if (!stationName || !bayId) {
    return res.status(400).json({ error: 'stationName and bayId are required' });
  }

  const id = `sess-${Math.floor(1000 + Math.random() * 9000)}`;
  const date = 'Just now';

  db.run(
    `INSERT INTO session_history (id, date, stationName, bayId, vehicle, energyDeliveredKwh, duration, cost, priorityTier, status, peakPower)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, date, stationName, bayId, vehicle, energyDeliveredKwh || 0, duration || '0 mins', cost || '₹ 0.00', priorityTier, status, peakPower],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      telemetrySimulator.logEvent(
        `Session ${id} archived for ${vehicle} at ${stationName}. Total cost: ${cost}`,
        'SUCCESS',
        'Billing Node'
      );

      res.status(201).json({
        id,
        date,
        stationName,
        bayId,
        vehicle,
        energyDeliveredKwh,
        duration,
        cost,
        priorityTier,
        status,
        peakPower
      });
    }
  );
});

// GET /api/sessions/active - Get current active charging session
router.get('/active', (req, res) => {
  db.get('SELECT * FROM active_session WHERE id = 1', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.json({ isActive: false });

    const isCritical = telemetrySimulator.getTelemetry().action === 'THROTTLE_POWER';
    const isFlexible = row.priority === 'FLEXIBLE';
    const currentPower = (isCritical && isFlexible) ? 0.5 : row.nominalPowerKw;
    const status = (isCritical && isFlexible) ? 'THROTTLED' : row.status;

    res.json({
      ...row,
      isActive: !!row.isActive,
      currentPowerKw: currentPower,
      status
    });
  });
});

// PUT /api/sessions/active - Update active session progress
router.put('/active', (req, res) => {
  const {
    batteryPct,
    energyDeliveredKwh,
    durationSeconds,
    costSoFar,
    estimatedMinutesRemaining,
    status
  } = req.body;

  db.run(
    `UPDATE active_session 
     SET batteryPct = ?, energyDeliveredKwh = ?, durationSeconds = ?, costSoFar = ?, estimatedMinutesRemaining = ?, status = ?
     WHERE id = 1`,
    [batteryPct, energyDeliveredKwh, durationSeconds, costSoFar, estimatedMinutesRemaining, status],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

module.exports = router;
