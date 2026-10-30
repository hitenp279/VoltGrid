const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const telemetrySimulator = require('../services/telemetrySimulator');

// GET /api/ev-queue - Retrieve active EV priority queue items
router.get('/', (req, res) => {
  db.all('SELECT * FROM ev_queue', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const isCritical = telemetrySimulator.getTelemetry().action === 'THROTTLE_POWER';
    const queueWithThrottling = rows.map(item => {
      const isThrottled = isCritical && item.priority === 'FLEXIBLE';
      return {
        ...item,
        throttled: isThrottled ? 1 : 0,
        currentPower: isThrottled ? '0.5 kW' : item.nominalPower,
        status: isThrottled ? 'THROTTLED (GRID RELIEF)' : item.status
      };
    });

    res.json(queueWithThrottling);
  });
});

// POST /api/ev-queue/throttle - Trigger AI load shedding or priority adjustment
router.post('/throttle', (req, res) => {
  const { queueId, action } = req.body;
  if (!queueId) {
    return res.status(400).json({ error: 'queueId is required' });
  }

  const isThrottle = action === 'THROTTLE';
  const newPower = isThrottle ? '0.5 kW' : '7.2 kW';
  const newStatus = isThrottle ? 'THROTTLED (GRID RELIEF)' : 'CHARGING';

  db.run(
    `UPDATE ev_queue SET currentPower = ?, throttled = ?, status = ? WHERE id = ?`,
    [newPower, isThrottle ? 1 : 0, newStatus, queueId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      telemetrySimulator.logEvent(
        `AI Dispatcher: ${isThrottle ? 'Throttled' : 'Restored power for'} queue item ${queueId}`,
        'WARNING',
        'AI Grid Engine'
      );

      res.json({
        success: true,
        queueId,
        currentPower: newPower,
        status: newStatus
      });
    }
  );
});

module.exports = router;
