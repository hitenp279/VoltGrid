const { chromium } = require('C:/Users/Lenovo/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, 'test-results', 'driver-flow');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function captureDriverFlow() {
  console.log('=== CAPTURING EV DRIVER / USER FLOW SCREENSHOTS ===\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 }
  });

  const page = await context.newPage();

  try {
    // 1. Initial Page Load (Guest Station Discovery)
    console.log('Step 1: Navigating to VoltGrid application (Guest Mode)...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_guest_stations_discovery.png'), fullPage: false });
    console.log('✓ Captured: 01_guest_stations_discovery.png');

    // 2. Open Station Details Modal
    console.log('Step 2: Opening Station Detail modal for CyberHub Depot...');
    const selectBayBtn = page.locator('button:has-text("Select Charger Bay & Start"), button:has-text("Select Charger Bay")').first();
    if (await selectBayBtn.count() > 0) {
      await selectBayBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_station_detail_modal.png'), fullPage: false });
      console.log('✓ Captured: 02_station_detail_modal.png');

      // Close modal
      const closeBtn = page.locator('button[aria-label="Close dialog"], button:has-text("Cancel")').first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await page.waitForTimeout(400);
      }
    }
    // Guarantee modal closed
    await page.evaluate(() => {
      if (window.__VOLTGRID_TEST_HOOKS__) {
        window.__VOLTGRID_TEST_HOOKS__.setSelectedStationId(null);
      }
    });
    await page.waitForTimeout(300);

    // 3. Authenticate Driver Session via test hook
    console.log('Step 3: Setting authenticated EV Driver state...');
    await page.evaluate(() => {
      if (window.__VOLTGRID_TEST_HOOKS__) {
        window.__VOLTGRID_TEST_HOOKS__.setAuth({
          isAuthenticated: true,
          isGuest: false,
          role: 'user',
          user: {
            uid: 'driver_alex_mercer',
            name: 'Alex Mercer',
            email: 'alex.mercer@voltgrid.io',
            role: 'user',
            createdAt: new Date().toISOString(),
            vehicle: 'Tesla Model Y Dual Motor',
            plate: 'DL-01-EV-4092'
          },
          loading: false
        });
        window.__VOLTGRID_TEST_HOOKS__.setUserNavTab('overview');
      }
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_driver_overview.png'), fullPage: false });
    console.log('✓ Captured: 03_driver_overview.png');

    // 4. Active Charging Cockpit
    console.log('Step 4: Starting active charging session and capturing Cockpit...');
    await page.evaluate(() => {
      if (window.__VOLTGRID_TEST_HOOKS__) {
        window.__VOLTGRID_TEST_HOOKS__.startChargingSession(
          'cyberhub-depot',
          'ch-1',
          'Tesla Model Y Dual Motor',
          'HIGH_PRIORITY',
          '06:30 PM'
        );
        window.__VOLTGRID_TEST_HOOKS__.setUserNavTab('session');
      }
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_active_charging_cockpit.png'), fullPage: false });
    console.log('✓ Captured: 04_active_charging_cockpit.png');

    // 5. Charging History
    console.log('Step 5: Capturing Session History...');
    await page.evaluate(() => {
      if (window.__VOLTGRID_TEST_HOOKS__) {
        window.__VOLTGRID_TEST_HOOKS__.setUserNavTab('history');
      }
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_charging_session_history.png'), fullPage: false });
    console.log('✓ Captured: 05_charging_session_history.png');

    console.log('\n========================================================');
    console.log('🎉 ALL DRIVER FLOW SCREENSHOTS CAPTURED SUCCESSFULLY! 🎉');
    console.log('Screenshots stored at:', SCREENSHOT_DIR);
    console.log('========================================================');

  } catch (err) {
    console.error('Error capturing driver flow:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

captureDriverFlow().then(() => process.exit(0)).catch(() => process.exit(1));
