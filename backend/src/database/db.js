const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

const db = new sqlite3.Database(config.dbFile, (err) => {
  if (err) {
    console.error('❌ Failed to open SQLite database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database:', config.dbFile);
  }
});

function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Telemetry Table
      db.run(`
        CREATE TABLE IF NOT EXISTS telemetry (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          voltage REAL,
          current REAL,
          temperature REAL,
          action TEXT,
          transformerUtilization REAL,
          frequency REAL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 2. Stations Table
      db.run(`
        CREATE TABLE IF NOT EXISTS stations (
          id TEXT PRIMARY KEY,
          name TEXT,
          location TEXT,
          city TEXT,
          distanceKm REAL,
          rating REAL,
          operator TEXT,
          totalSlots INTEGER,
          availableSlots INTEGER,
          occupiedSlots INTEGER,
          maintenanceSlots INTEGER,
          maxPowerKw REAL,
          connectorTypes TEXT,
          pricingPerKwh REAL,
          status TEXT,
          substationId TEXT,
          gridZone TEXT,
          currentGridDemand TEXT,
          image TEXT
        )
      `);

      // 3. Station Slots Table
      db.run(`
        CREATE TABLE IF NOT EXISTS station_slots (
          id TEXT,
          stationId TEXT,
          connector TEXT,
          status TEXT,
          vehicle TEXT,
          battery REAL,
          allocatedPower TEXT,
          priority TEXT,
          departure TEXT,
          PRIMARY KEY (id, stationId),
          FOREIGN KEY (stationId) REFERENCES stations(id) ON DELETE CASCADE
        )
      `);

      // 4. EV Queue Table
      db.run(`
        CREATE TABLE IF NOT EXISTS ev_queue (
          id TEXT PRIMARY KEY,
          stationId TEXT,
          vehicleName TEXT,
          licensePlate TEXT,
          batteryPct REAL,
          targetPct REAL,
          departureTime TEXT,
          timeRemainingMinutes INTEGER,
          priority TEXT,
          priorityReason TEXT,
          nominalPower TEXT,
          currentPower TEXT,
          throttled INTEGER,
          status TEXT,
          connector TEXT
        )
      `);

      // 5. Session History Table
      db.run(`
        CREATE TABLE IF NOT EXISTS session_history (
          id TEXT PRIMARY KEY,
          date TEXT,
          stationName TEXT,
          bayId TEXT,
          vehicle TEXT,
          energyDeliveredKwh REAL,
          duration TEXT,
          cost TEXT,
          priorityTier TEXT,
          status TEXT,
          peakPower TEXT
        )
      `);

      // 6. Active Session Table
      db.run(`
        CREATE TABLE IF NOT EXISTS active_session (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          isActive INTEGER,
          stationId TEXT,
          stationName TEXT,
          slotId TEXT,
          vehicle TEXT,
          batteryPct REAL,
          targetPct REAL,
          energyDeliveredKwh REAL,
          nominalPowerKw REAL,
          currentPowerKw REAL,
          priority TEXT,
          departureTime TEXT,
          durationSeconds INTEGER,
          startTime TEXT,
          connector TEXT,
          estimatedMinutesRemaining INTEGER,
          status TEXT,
          costSoFar REAL
        )
      `);

      // 7. System Events Table
      db.run(`
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          timestamp TEXT,
          type TEXT,
          source TEXT,
          message TEXT
        )
      `);

      // 8. Legacy Activities Table
      db.run(`
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          description TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

module.exports = {
  db,
  initDatabase
};
