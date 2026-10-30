const express = require('express');
const router = express.Router();
const telemetrySimulator = require('../services/telemetrySimulator');

// GET /api/telemetry - Live SCADA Telemetry payload
router.get('/', (req, res) => {
  res.json(telemetrySimulator.getTelemetry());
});

// GET /api/telemetry/history - Telemetry Trends
router.get('/history', (req, res) => {
  res.json(telemetrySimulator.getHistory());
});

// POST /api/telemetry/stress - Toggle grid stress simulation
router.post('/stress', (req, res) => {
  const { enabled } = req.body;
  const nextState = telemetrySimulator.setStressMode(enabled !== undefined ? enabled : !telemetrySimulator.isStressSimulated);
  res.json({
    success: true,
    isStressSimulated: nextState,
    message: nextState ? 'Grid stress simulation activated' : 'Grid stress simulation deactivated'
  });
});

module.exports = router;
