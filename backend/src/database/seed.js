const { db, initDatabase } = require('./db');
const {
  INITIAL_STATIONS,
  INITIAL_EV_QUEUE,
  INITIAL_USER_SESSIONS_HISTORY,
  INITIAL_GRID_EVENTS
} = require('./seedData');

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function seedDatabase(force = false) {
  await initDatabase();

  if (force) {
    await runQuery('DELETE FROM stations');
    await runQuery('DELETE FROM station_slots');
    await runQuery('DELETE FROM ev_queue');
    await runQuery('DELETE FROM session_history');
    await runQuery('DELETE FROM active_session');
    await runQuery('DELETE FROM events');
  }

  // 1. Seed Stations & Slots
  const stationRow = await getQuery('SELECT COUNT(*) as count FROM stations');
  if (stationRow.count === 0) {
    console.log('🌱 Seeding initial Charging Stations & Bays...');
    for (const st of INITIAL_STATIONS) {
      await runQuery(
        `INSERT INTO stations (
          id, name, location, city, distanceKm, rating, operator, totalSlots,
          availableSlots, occupiedSlots, maintenanceSlots, maxPowerKw, connectorTypes,
          pricingPerKwh, status, substationId, gridZone, currentGridDemand, image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          st.id, st.name, st.location, st.city, st.distanceKm, st.rating, st.operator,
          st.totalSlots, st.availableSlots, st.occupiedSlots, st.maintenanceSlots,
          st.maxPowerKw, st.connectorTypes, st.pricingPerKwh, st.status, st.substationId,
          st.gridZone, st.currentGridDemand, st.image
        ]
      );

      for (const sl of st.slots) {
        await runQuery(
          `INSERT INTO station_slots (
            id, stationId, connector, status, vehicle, battery, allocatedPower, priority, departure
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sl.id, st.id, sl.connector, sl.status, sl.vehicle, sl.battery,
            sl.allocatedPower, sl.priority, sl.departure
          ]
        );
      }
    }
  }

  // 2. Seed EV Queue
  const queueRow = await getQuery('SELECT COUNT(*) as count FROM ev_queue');
  if (queueRow.count === 0) {
    console.log('🌱 Seeding EV Priority Queue...');
    for (const q of INITIAL_EV_QUEUE) {
      await runQuery(
        `INSERT INTO ev_queue (
          id, stationId, vehicleName, licensePlate, batteryPct, targetPct, departureTime,
          timeRemainingMinutes, priority, priorityReason, nominalPower, currentPower, throttled, status, connector
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          q.id, q.stationId, q.vehicleName, q.licensePlate, q.batteryPct, q.targetPct,
          q.departureTime, q.timeRemainingMinutes, q.priority, q.priorityReason,
          q.nominalPower, q.currentPower, q.throttled ? 1 : 0, q.status, q.connector
        ]
      );
    }
  }

  // 3. Seed Sessions History
  const historyRow = await getQuery('SELECT COUNT(*) as count FROM session_history');
  if (historyRow.count === 0) {
    console.log('🌱 Seeding Session History...');
    for (const s of INITIAL_USER_SESSIONS_HISTORY) {
      await runQuery(
        `INSERT INTO session_history (
          id, date, stationName, bayId, vehicle, energyDeliveredKwh, duration, cost, priorityTier, status, peakPower
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.id, s.date, s.stationName, s.bayId, s.vehicle, s.energyDeliveredKwh,
          s.duration, s.cost, s.priorityTier, s.status, s.peakPower
        ]
      );
    }
  }

  // 4. Seed Active Session
  const activeRow = await getQuery('SELECT COUNT(*) as count FROM active_session');
  if (activeRow.count === 0) {
    console.log('🌱 Seeding Active Charging Session...');
    await runQuery(`
      INSERT INTO active_session (
        id, isActive, stationId, stationName, slotId, vehicle, batteryPct, targetPct,
        energyDeliveredKwh, nominalPowerKw, currentPowerKw, priority, departureTime,
        durationSeconds, startTime, connector, estimatedMinutesRemaining, status, costSoFar
      ) VALUES (
        1, 1, 'station-01', 'CyberHub Ultra-Fast Depot', 'BAY-01', 'Tesla Model Y Dual Motor',
        74.0, 90.0, 38.6, 7.2, 7.2, 'URGENT', '06:00 AM', 1420, '11:15 PM',
        'CCS2 180kW', 18, 'CHARGING', 559.70
      )
    `);
  }

  // 5. Seed Events
  const eventsRow = await getQuery('SELECT COUNT(*) as count FROM events');
  if (eventsRow.count === 0) {
    console.log('🌱 Seeding SCADA Events...');
    for (const e of INITIAL_GRID_EVENTS) {
      await runQuery(
        `INSERT INTO events (id, timestamp, type, source, message) VALUES (?, ?, ?, ?, ?)`,
        [e.id, e.timestamp, e.type, e.source, e.message]
      );
    }
  }

  console.log('✅ Database Seeding Complete.');
}

if (require.main === module) {
  const isForce = process.argv.includes('--force') || process.argv.includes('-f');
  seedDatabase(isForce)
    .then(() => {
      console.log('Seeding finished successfully.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Database seeding failed:', err);
      process.exit(1);
    });
}

module.exports = {
  seedDatabase
};
