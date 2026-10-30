const express = require('express');
const cors = require('cors');
const config = require('./src/config');
const { seedDatabase } = require('./src/database/seed');
const apiRoutes = require('./src/routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'VoltGrid SCADA Telemetry & EV Management Backend is running!',
    version: '1.0.0',
    telemetryEndpoint: '/api/telemetry',
    stationsEndpoint: '/api/stations',
    evQueueEndpoint: '/api/ev-queue',
    sessionsEndpoint: '/api/sessions/history',
    eventsEndpoint: '/api/events'
  });
});

// Auto-seed database and start listening
seedDatabase()
  .then(() => {
    const server = app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🚀 VOLTGRID BACKEND RUNNING ON PORT ${config.port}`);
      console.log(`📡 SCADA Telemetry Node: http://127.0.0.1:${config.port}/api/telemetry`);
      console.log(`⚡ Station API Node: http://127.0.0.1:${config.port}/api/stations`);
      console.log(`====================================================`);
    });

    // Also listen on ALT_PORT if different
    if (config.altPort && config.altPort !== config.port) {
      try {
        const altServer = app.listen(config.altPort, () => {
          console.log(`📡 Secondary Port Active: http://127.0.0.1:${config.altPort}`);
        });
      } catch (err) {
        // secondary port optional
      }
    }
  })
  .catch(err => {
    console.error('❌ Failed to initialize database:', err);
  });

module.exports = app;
