# VoltGrid Backend - Smart Grid & EV Charging Management Server

Full-featured Express & SQLite backend server designed to power the **VoltGrid** frontend application (`grid-dashboard`).

## 🚀 Features
- **Live SCADA Telemetry Engine**: Continuous simulated grid telemetry (Voltage, Current, Transformer Temperature, Frequency, Transformer Utilization).
- **AI Grid Load Balancer**: Automatic dynamic load shedding and EV power throttling during peak demand or operator-triggered stress tests.
- **Station & Bay Management**: Manage charging stations (CyberHub, Metro Tech Park, Aerocity, Downtown) with real-time bay availability and vehicle allocation.
- **EV Priority Queue**: Manage vehicle priority tiers (`URGENT`, `HIGH`, `NORMAL`, `FLEXIBLE`) with deadline-aware power control.
- **Session History & Billing**: Track active charging sessions and completed billing logs.
- **SCADA Event Logging**: System and operator action logging.

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Seeding (Optional - happens automatically on start)
```bash
npm run seed
```

### 3. Start Server
```bash
npm start
```
*The server listens by default on port `8000` (SCADA Telemetry Node) with fallback support on port `5000`.*

---

## 📡 Key API Endpoints

### Telemetry & Grid Stress
- `GET /api/telemetry` - Live grid telemetry payload
- `POST /api/telemetry/stress` - Toggle grid overload / stress mode
- `GET /api/telemetry/history` - Telemetry voltage and load trends

### Charging Stations
- `GET /api/stations` - All stations with live bay statuses
- `GET /api/stations/:id` - Details for a specific station
- `POST /api/stations/:id/slots/:slotId/session` - Start EV charging session
- `POST /api/stations/:id/slots/:slotId/stop` - Stop EV charging session

### EV Queue & AI Management
- `GET /api/ev-queue` - Get active EV charging queue
- `POST /api/ev-queue/throttle` - Issue AI load shedding commands

### Session History & Events
- `GET /api/sessions/history` - User charging history
- `POST /api/sessions/history` - Add completed session
- `GET /api/events` - System & SCADA events log

---

## 🧪 Testing
Run the automated test suite:
```bash
npm test
```
