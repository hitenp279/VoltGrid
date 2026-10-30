const { chromium } = require('C:/Users/Lenovo/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, 'test-results', 'theme-system');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verifyThemeSystem() {
  console.log('=== RUNNING COMPREHENSIVE LIGHT & DARK THEME SYSTEM VERIFICATION ===\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 }
  });

  const page = await context.newPage();

  try {
    // 1. Navigate to application
    console.log('Step 1: Navigating to VoltGrid application...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Helper to toggle theme
    const setTheme = async (themeName) => {
      await page.evaluate((t) => {
        if (window.__VOLTGRID_TEST_HOOKS__) {
          window.__VOLTGRID_TEST_HOOKS__.setTheme(t);
        }
      }, themeName);
      await page.waitForTimeout(400);
    };

    // Helper to set admin state
    const setAdminState = async (tab = 'overview') => {
      await page.evaluate((adminTab) => {
        if (window.__VOLTGRID_TEST_HOOKS__) {
          window.__VOLTGRID_TEST_HOOKS__.setAuth({
            isAuthenticated: true,
            isGuest: false,
            role: 'admin',
            user: {
              uid: 'admin_test_operator',
              name: 'SCADA Chief Controller',
              email: 'scada_admin@voltgrid.io',
              role: 'admin',
              createdAt: new Date().toISOString(),
              vehicle: 'SCADA Admin Node',
              plate: 'SYS-ADMIN-01'
            },
            loading: false
          });
          window.__VOLTGRID_TEST_HOOKS__.setAdminViewMode('admin');
          window.__VOLTGRID_TEST_HOOKS__.setAdminNavTab(adminTab);
        }
      }, tab);
      await page.waitForTimeout(600);
    };

    // Helper to set driver state
    const setDriverState = async (tab = 'overview') => {
      await page.evaluate((driverTab) => {
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
          window.__VOLTGRID_TEST_HOOKS__.setAdminViewMode('user');
          window.__VOLTGRID_TEST_HOOKS__.setUserNavTab(driverTab);
        }
      }, tab);
      await page.waitForTimeout(600);
    };

    // ==========================================
    // 1. ADMIN OVERVIEW (LIGHT & DARK)
    // ==========================================
    console.log('\n--- 1. Admin Overview (Light vs Dark) ---');
    await setAdminState('overview');
    await setTheme('light');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_admin_overview_light.png'), fullPage: false });
    console.log('✓ Captured: 01_admin_overview_light.png');

    await setTheme('dark');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_admin_overview_dark.png'), fullPage: false });
    console.log('✓ Captured: 01_admin_overview_dark.png');

    // ==========================================
    // 2. ADMIN CHARGING INFRASTRUCTURE (LIGHT & DARK)
    // ==========================================
    console.log('\n--- 2. Admin Charging Infrastructure (Light vs Dark) ---');
    await setAdminState('infrastructure');
    await setTheme('light');
    // expand first station ports
    const inspectPortsBtn = page.locator('button:has-text("Inspect Ports")').first();
    if (await inspectPortsBtn.count() > 0) {
      await inspectPortsBtn.click();
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_admin_infrastructure_light.png'), fullPage: false });
    console.log('✓ Captured: 02_admin_infrastructure_light.png');

    await setTheme('dark');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_admin_infrastructure_dark.png'), fullPage: false });
    console.log('✓ Captured: 02_admin_infrastructure_dark.png');

    // ==========================================
    // 3. ADMIN GRID TELEMETRY (LIGHT & DARK)
    // ==========================================
    console.log('\n--- 3. Admin Grid Telemetry & Charts (Light vs Dark) ---');
    await setAdminState('telemetry');
    await setTheme('light');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_admin_telemetry_light.png'), fullPage: false });
    console.log('✓ Captured: 03_admin_telemetry_light.png');

    await setTheme('dark');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_admin_telemetry_dark.png'), fullPage: false });
    console.log('✓ Captured: 03_admin_telemetry_dark.png');

    // ==========================================
    // 4. ADMIN EV PRIORITY QUEUE (LIGHT & DARK)
    // ==========================================
    console.log('\n--- 4. Admin EV Priority Queue (Light vs Dark) ---');
    await setAdminState('ev-queue');
    await setTheme('light');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_admin_ev_queue_light.png'), fullPage: false });
    console.log('✓ Captured: 04_admin_ev_queue_light.png');

    await setTheme('dark');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_admin_ev_queue_dark.png'), fullPage: false });
    console.log('✓ Captured: 04_admin_ev_queue_dark.png');

    // ==========================================
    // 5. DRIVER DISCOVERY & MODAL (LIGHT & DARK)
    // ==========================================
    console.log('\n--- 5. Driver Station Discovery & Detail Modal (Light vs Dark) ---');
    await setDriverState('stations');
    await setTheme('light');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_driver_discovery_light.png'), fullPage: false });
    console.log('✓ Captured: 05_driver_discovery_light.png');

    await setTheme('dark');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_driver_discovery_dark.png'), fullPage: false });
    console.log('✓ Captured: 05_driver_discovery_dark.png');

    // Modal
    const selectBayBtn = page.locator('button:has-text("Select Charger Bay & Start")').first();
    if (await selectBayBtn.count() > 0) {
      await selectBayBtn.click();
      await page.waitForTimeout(500);
      await setTheme('light');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_driver_station_modal_light.png'), fullPage: false });
      console.log('✓ Captured: 06_driver_station_modal_light.png');

      await setTheme('dark');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_driver_station_modal_dark.png'), fullPage: false });
      console.log('✓ Captured: 06_driver_station_modal_dark.png');

      const closeBtn = page.locator('button[aria-label="Close dialog"]').first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // ==========================================
    // 6. DRIVER ACTIVE CHARGING COCKPIT (LIGHT & DARK)
    // ==========================================
    console.log('\n--- 6. Driver Active Charging Cockpit (Light vs Dark) ---');
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
    await page.waitForTimeout(600);

    await setTheme('light');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_driver_active_cockpit_light.png'), fullPage: false });
    console.log('✓ Captured: 07_driver_active_cockpit_light.png');

    await setTheme('dark');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_driver_active_cockpit_dark.png'), fullPage: false });
    console.log('✓ Captured: 07_driver_active_cockpit_dark.png');

    // ==========================================
    // 7. LOGIN & AUTH MODAL (LIGHT & DARK)
    // ==========================================
    console.log('\n--- 7. Login / Auth Modal (Light vs Dark) ---');
    const authDialogBtn = page.locator('button:has-text("Auth Dialog")').first();
    if (await authDialogBtn.count() > 0) {
      await authDialogBtn.click();
      await page.waitForTimeout(500);

      await setTheme('light');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_auth_dialog_light.png'), fullPage: false });
      console.log('✓ Captured: 08_auth_dialog_light.png');

      await setTheme('dark');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_auth_dialog_dark.png'), fullPage: false });
      console.log('✓ Captured: 08_auth_dialog_dark.png');
    }

    // Reset back to light mode default
    await setTheme('light');

    console.log('\n========================================================');
    console.log('🎉 ALL THEME SYSTEM SCREENSHOTS CAPTURED SUCCESSFULLY! 🎉');
    console.log('Screenshots stored at:', SCREENSHOT_DIR);
    console.log('========================================================');

  } catch (err) {
    console.error('Error verifying theme system:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

verifyThemeSystem().then(() => process.exit(0)).catch(() => process.exit(1));
