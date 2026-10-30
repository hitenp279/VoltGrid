const { db } = require('../database/db');

class TelemetrySimulator {
  constructor() {
    this.isStressSimulated = false;
    this.currentTelemetry = {
      voltage: 230.4,
      current: 14.2,
      temperature: 38.5,
      action: 'NORMAL',
      transformerUtilization: 58.4,
      frequency: 50.02,
      backendConnected: true,
      timestamp: new Date().toISOString()
    };

    this.voltageHistory = [228.4, 229.8, 230.2, 231.0, 229.5, 230.1, 230.8, 229.9, 230.4];
    this.loadHistory = [13.8, 14.1, 14.5, 13.9, 14.2, 14.8, 14.0, 14.3, 14.2];

    this.startSimulation();
  }

  setStressMode(enabled) {
    this.isStressSimulated = !!enabled;
    const msg = this.isStressSimulated
      ? 'OPERATOR TRIGGERED GRID STRESS TEST: Current surge to 34A. Impending transformer overload.'
      : 'Grid Stress Test Deactivated: Transformer load returned to normal nominal threshold.';
    
    this.logEvent(msg, this.isStressSimulated ? 'WARNING' : 'SUCCESS', 'SCADA Simulator');
    return this.isStressSimulated;
  }

  getTelemetry() {
    return {
      ...this.currentTelemetry,
      isStressSimulated: this.isStressSimulated
    };
  }

  getHistory() {
    return {
      voltageHistory: this.voltageHistory,
      loadHistory: this.loadHistory
    };
  }

  startSimulation() {
    setInterval(() => {
      const baseCurrent = this.isStressSimulated ? 34.2 : 14.2;
      const currentJitter = (Math.random() - 0.5) * (this.isStressSimulated ? 1.8 : 0.6);
      const curVal = Number((baseCurrent + currentJitter).toFixed(1));

      const baseVolt = this.isStressSimulated ? 221.5 : 230.4;
      const voltJitter = (Math.random() - 0.5) * 0.8;
      const voltVal = Number((baseVolt + voltJitter).toFixed(1));

      const baseTemp = this.isStressSimulated ? 58.2 : 39.1;
      const tempVal = Number((baseTemp + (Math.random() - 0.5) * 0.3).toFixed(1));

      const utilization = this.isStressSimulated ? 88.4 : Math.min(100, Math.round((curVal / 28) * 100));
      const currentAction = this.isStressSimulated ? 'THROTTLE_POWER' : 'NORMAL';
      const freqVal = Number((50.0 + (Math.random() - 0.5) * 0.03).toFixed(2));

      this.currentTelemetry = {
        voltage: voltVal,
        current: curVal,
        temperature: tempVal,
        action: currentAction,
        transformerUtilization: utilization,
        frequency: freqVal,
        backendConnected: true,
        timestamp: new Date().toISOString()
      };

      this.voltageHistory = [...this.voltageHistory.slice(-14), voltVal];
      this.loadHistory = [...this.loadHistory.slice(-14), curVal];

      // Save latest telemetry point to SQLite
      db.run(
        `INSERT INTO telemetry (voltage, current, temperature, action, transformerUtilization, frequency)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [voltVal, curVal, tempVal, currentAction, utilization, freqVal],
        (err) => {
          if (err) {
            // ignore silent db logging errors during rapid polling
          }
        }
      );
    }, 3000);
  }

  logEvent(message, type = 'INFO', source = 'AI Engine') {
    const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    db.run(
      `INSERT INTO events (id, timestamp, type, source, message) VALUES (?, ?, ?, ?, ?)`,
      [id, timestamp, type, source, message]
    );
  }
}

module.exports = new TelemetrySimulator();
