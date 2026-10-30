const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const telemetrySimulator = require('../services/telemetrySimulator');

// GET /api/stations - List all stations with slots
router.get('/', (req, res) => {
  db.all('SELECT * FROM stations', [], (err, stations) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all('SELECT * FROM station_slots', [], (err, slots) => {
      if (err) return res.status(500).json({ error: err.message });

      const stationsWithSlots = stations.map(st => {
        let connectorTypes = [];
        try {
          connectorTypes = JSON.parse(st.connectorTypes);
        } catch (e) {
          connectorTypes = ['CCS2', 'Type 2'];
        }

        const stationSlots = slots.filter(sl => sl.stationId === st.id);
        return {
          ...st,
          connectorTypes,
          slots: stationSlots
        };
      });

      res.json(stationsWithSlots);
    });
  });
});

// GET /api/stations/:id - Single station detail
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM stations WHERE id = ?', [id], (err, station) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!station) return res.status(404).json({ error: 'Station not found' });

    db.all('SELECT * FROM station_slots WHERE stationId = ?', [id], (err, slots) => {
      if (err) return res.status(500).json({ error: err.message });

      let connectorTypes = [];
      try {
        connectorTypes = JSON.parse(station.connectorTypes);
      } catch (e) {
        connectorTypes = ['CCS2', 'Type 2'];
      }

      res.json({
        ...station,
        connectorTypes,
        slots
      });
    });
  });
});

// POST /api/stations/:id/slots/:slotId/session - Start charging session on slot
router.post('/:id/slots/:slotId/session', (req, res) => {
  const { id: stationId, slotId } = req.params;
  const { vehicleName = 'Tesla Model Y Dual Motor', priority = 'NORMAL', departureTime = '08:00 AM' } = req.body;

  db.get('SELECT * FROM stations WHERE id = ?', [stationId], (err, station) => {
    if (err || !station) return res.status(404).json({ error: 'Station not found' });

    const isCritical = telemetrySimulator.getTelemetry().action === 'THROTTLE_POWER';
    const initialPower = (priority === 'FLEXIBLE' && isCritical) ? '0.5 kW' : '7.2 kW';

    db.run(
      `UPDATE station_slots 
       SET status = 'OCCUPIED', vehicle = ?, battery = 52, allocatedPower = ?, priority = ?, departure = ?
       WHERE id = ? AND stationId = ?`,
      [vehicleName, initialPower, priority, departureTime, slotId, stationId],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        db.run(
          `UPDATE stations 
           SET availableSlots = MAX(0, availableSlots - 1), occupiedSlots = occupiedSlots + 1 
           WHERE id = ?`,
          [stationId]
        );

        telemetrySimulator.logEvent(
          `New EV session initialized: ${vehicleName} at ${station.name} (${slotId}) with priority ${priority}`,
          'INFO',
          'EV Dispatcher'
        );

        res.json({
          success: true,
          stationId,
          slotId,
          vehicleName,
          priority,
          allocatedPower: initialPower,
          status: 'OCCUPIED'
        });
      }
    );
  });
});

// POST /api/stations/:id/slots/:slotId/stop - Stop charging session on slot
router.post('/:id/slots/:slotId/stop', (req, res) => {
  const { id: stationId, slotId } = req.params;

  db.run(
    `UPDATE station_slots 
     SET status = 'AVAILABLE', vehicle = NULL, battery = NULL, allocatedPower = '0 kW', priority = NULL, departure = NULL
     WHERE id = ? AND stationId = ?`,
    [slotId, stationId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.run(
        `UPDATE stations 
         SET availableSlots = availableSlots + 1, occupiedSlots = MAX(0, occupiedSlots - 1) 
         WHERE id = ?`,
        [stationId]
      );

      telemetrySimulator.logEvent(
        `Charging session stopped for slot ${slotId} at station ${stationId}.`,
        'SUCCESS',
        'EV Dispatcher'
      );

      res.json({
        success: true,
        stationId,
        slotId,
        status: 'AVAILABLE'
      });
    }
  );
});

module.exports = router;
