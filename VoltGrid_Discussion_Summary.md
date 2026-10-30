# ⚡ VoltGrid — Project Status, Architecture & Roadmap Summary
*Generated from technical review discussion for the team*

---

## 📌 Executive Summary
**VoltGrid** is a smart grid SCADA orchestration and EV charging demand-management system designed to prevent distribution transformer overloads during peak EV charging hours. It features a dual-persona interface: a **SCADA Operator Control Room** for substation engineers and a **Consumer EV Cockpit** for drivers.

---

## 🚀 Key Strong Points of the Current Project

1. **Dual-Persona Architecture**
   - **SCADA Control Room:** Substation #05 / DLF Cyber Feeder monitoring with live voltage, current, frequency, and transformer temperature.
   - **EV Driver Experience:** Public station discovery, live charger bay statuses (`BAY-01` to `BAY-08`), connector types (CCS2, Type 2, CHAdeMO), real-time charging cockpit, and past session billing receipts.

2. **AI Dynamic Load Management & Priority Queue**
   - Implements a fair-share priority queue (`URGENT`, `HIGH`, `NORMAL`, `FLEXIBLE`).
   - When operator stress or grid overload occurs (surges to ~34A, transformer utilization > 80%), the system automatically issues a `THROTTLE_POWER` event, throttling flexible-tier vehicles to 0.5 kW while safeguarding vehicles with imminent departure deadlines.

3. **High-Fidelity SCADA UI/UX**
   - Custom SVG telemetry waveform charts with threshold warning markers.
   - Distinctive industrial color palette (warm ivory/cream with deep navy and status accents).
   - Full light/dark mode persistence across refreshes.
   - Responsive layouts verified on Desktop, Tablet, and Mobile.

4. **Fault-Tolerant Offline Resiliency**
   - If the backend server stops, the frontend automatically falls back to an internal mathematical telemetry simulation engine to prevent UI crashes, then re-syncs once the backend reconnects.

5. **Automated Verification Coverage**
   - Includes full Playwright E2E verification test suites and 18 visual snapshot captures validating every user flow.

---

## 💾 Where is the Data Stored?

| Data Layer | Technology | Location | Stored Data |
| :--- | :--- | :--- | :--- |
| **Primary Operational DB** | **SQLite** | `backend/voltgrid.db` | Grid telemetry history, stations, bay slots, EV priority queue, active charging session, billing history, and SCADA event logs. |
| **Cloud Auth & Roles** | **Firebase** | Cloud (`major-project-user`) | User credentials (Firebase Auth) & role profiles (`/users/{uid}` in Realtime Database: `'admin'` vs `'user'`). |
| **Client Preferences** | **LocalStorage** | Browser | UI theme setting (`'light'` or `'dark'`). |

> **FAQ:**
> - *Is data stored in PostgreSQL?* **No.** It currently uses local SQLite + Google Firebase.
> - *Is the app deployed online?* **No.** It runs locally on `http://localhost:5173` (Frontend) and `http://localhost:8000` (Backend).

---

## 🗺️ Recommended Next Steps & Roadmap

### Phase 1: Security & Real-Time Foundations (Short-Term)
1. **Version Control:** Initialize Git repository (`git init`) and set up proper `.gitignore`.
2. **WebSockets / SSE:** Replace the 3-second HTTP polling loop with WebSocket telemetry push for instantaneous SCADA waveform updates.
3. **Backend Route Protection:** Add Firebase ID token verification middleware on Express API endpoints (e.g. restrict `/api/telemetry/stress` strictly to verified admins).

### Phase 2: Academic & Technical Differentiators (High Scoring for Major Project)
4. **Machine Learning Load Forecasting:** Train an LSTM or XGBoost model on grid load datasets for 24-hour day-ahead demand prediction.
5. **Vehicle-to-Grid (V2G) Simulation:** Allow parked EVs with high battery charge (>80%) to feed 3–5 kW back into the feeder during peak grid strain for credits.
6. **Time-of-Use (ToU) Dynamic Tariffs:** Introduce dynamic electricity pricing that surges during peak demand to incentivize flexible off-peak charging.
7. **Interactive Map:** Embed Leaflet or Mapbox into Station Discovery with color-coded live status markers.

### Phase 3: Deliverables & Submission
8. **Mathematical Formulation & Project Report:** Formalize the multi-objective optimization problem (minimizing transformer strain vs. meeting EV charging deadlines) for the thesis / IEEE paper draft.
9. **Dockerization:** Add `docker-compose.yml` to launch both frontend and backend with a single command.
