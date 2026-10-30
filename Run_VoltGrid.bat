@echo off
title VoltGrid Full Project Launcher
echo ====================================================
echo 🚀 STARTING VOLTGRID FULL PROJECT (BACKEND + FRONTEND)
echo ====================================================

:: Set Paths
set BACKEND_DIR=%~dp0backend
set FRONTEND_DIR=%~dp0frontend

:: 1. Launch Backend Server (Port 8000)
echo 📡 Launching SCADA Telemetry & Express Backend Server...Fix the AI Dynamic Load Management header layout in the existing VoltGrid dashboard. The latest attempt made the title fit on one line, but the badge, description, and action buttons are crowded and overlapping.

Do not redesign the card or change its functionality.

### Required layout
At the reference desktop viewport, arrange the header cleanly in one horizontal row:

1. Icon
2. Title and description grouped together
3. SCADA Rule Node badge
4. Simulate Stress / Reset Grid button
5. Policy Details action

### Specific fixes
- Keep "AI Dynamic Load Management" on one line.
- Place the description directly below the title if necessary, but ensure it is readable and not accidentally clipped to "p...".
- Keep the SCADA Rule Node badge fully visible, with clear spacing from the title.
- Ensure the action button does not overlap or cover the badge or description.
- Keep Policy Details fully visible and clickable.
- Use a properly structured flex/grid layout with explicit gaps, sensible minimum widths, and controlled flex shrinking. Do not use negative margins or absolute positioning as a workaround.
- Allocate sufficient space to the title and action controls before shrinking the description.
- If the entire header cannot fit at a given viewport width, use a deliberate responsive breakpoint to rearrange the description while preserving the one-line title and keeping all controls accessible.
- Preserve the existing normal-state colors and the red/pink stress-state styling.
- Do not change stress simulation, load-management logic, telemetry, or other dashboard components.

Inspect the current component and its parent container widths before editing. After the change, verify both normal and stress states at the reference desktop viewport and at a narrower viewport. Run the production build and report the actual result.
start "VoltGrid Backend Server (Port 8000)" cmd /k "cd /d %BACKEND_DIR% && node server.js"

:: 2. Wait 2 seconds for DB & Server init
timeout /t 2 /nobreak >nul

:: 3. Launch Frontend Server (Port 5173)
echo ⚡ Launching VoltGrid React + Vite Frontend...
start "VoltGrid Frontend (Port 5173)" cmd /k "cd /d %FRONTEND_DIR% && npm run dev -- --host --port 5173"

:: 4. Wait 2 seconds and open browser
timeout /t 2 /nobreak >nul
echo 🌐 Opening VoltGrid Dashboard in default web browser...
start http://localhost:5173/

echo ====================================================
echo ✅ VoltGrid Backend & Frontend servers are running!
echo 🔗 Frontend: http://localhost:5173/
echo 🔗 Backend SCADA: http://localhost:8000/api/telemetry
echo ====================================================
pause
