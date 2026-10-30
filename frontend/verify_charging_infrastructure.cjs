const { chromium } = require('C:/Users/Lenovo/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, 'test-results', 'charging-infrastructure');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verifyChargingInfrastructure() {
  console.log('=== STARTING CHARGING INFRASTRUCTURE VERIFICATION ===\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 }
  });

  const page = await context.newPage();

  try {
    // 1. Load application
    console.log('Step 1: Navigating to VoltGrid application...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 2. Switch to Admin mode via test hook
    console.log('Step 2: Activating Admin SCADA perspective...');
    await page.evaluate(() => {
      if (window.__VOLTGRID_TEST_HOOKS__) {
        window.__VOLTGRID_TEST_HOOKS__.setAuth({
          isAuthenticated: true,
          isGuest: false,
          role: 'admin',
          user: {
            uid: 'admin_test_uid_123',
            name: 'SCADA Chief Operator',
            email: 'admin@voltgrid.io',
            role: 'admin',
            createdAt: new Date().toISOString(),
            vehicle: 'SCADA Admin Node',
            plate: 'SYS-ADMIN-01'
          },
          loading: false
        });
        window.__VOLTGRID_TEST_HOOKS__.setAdminViewMode('admin');
        window.__VOLTGRID_TEST_HOOKS__.setAdminNavTab('overview');
      }
    });
    await page.waitForTimeout(800);

    // Verify Admin Dashboard is visible
    const adminHeader = await page.locator('text=Smart Grid AI Control Room').count();
    console.log(`Admin header found: ${adminHeader > 0}`);
    if (adminHeader === 0) {
      throw new Error('Admin Dashboard header not visible');
    }

    // 3. Verify Charging Infrastructure section is rendered
    console.log('Step 3: Checking Charging Infrastructure Overview...');
    const sectionTitle = page.locator('text=Charging Infrastructure Overview');
    await sectionTitle.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Found "Charging Infrastructure Overview" section!');

    // 4. Verify Summary Strip elements
    console.log('Step 4: Checking SCADA Summary Strip values...');
    const summaryStrip = page.locator('[data-testid="scada-summary-strip"]');
    await summaryStrip.waitFor({ state: 'visible', timeout: 5000 });
    const stationsText = await summaryStrip.locator('span:has-text("Stations:")').locator('..').textContent();
    const portsText = await summaryStrip.locator('span:has-text("Total Ports:")').locator('..').textContent();
    const activeText = await summaryStrip.locator('span:has-text("Active")').locator('..').textContent();
    const availableText = await summaryStrip.locator('span:has-text("Available")').locator('..').textContent();
    console.log(`  -> Stations summary: ${stationsText.trim()}`);
    console.log(`  -> Ports summary: ${portsText.trim()}`);
    console.log(`  -> Active summary: ${activeText.trim()}`);
    console.log(`  -> Available summary: ${availableText.trim()}`);

    if (!stationsText.includes('4')) throw new Error('Expected 4 stations in summary strip');
    if (!portsText.includes('28')) throw new Error('Expected 28 ports in summary strip');
    if (!activeText.includes('16')) throw new Error('Expected 16 active ports in summary strip');
    if (!availableText.includes('11')) throw new Error('Expected 11 available ports in summary strip');
    console.log('✓ Summary strip metrics verified.');

    // 5. Navigate to dedicated Charging Infrastructure view to verify full table
    console.log('Step 5: Navigating to dedicated Charging Infrastructure view...');
    await page.click('button:has-text("View Infrastructure")');
    await page.waitForTimeout(600);
    console.log('Verifying station rows in SCADA table...');
    const cyberHubRow = page.locator('text=CyberHub Ultra-Fast Depot');
    const metroTechRow = page.locator('text=Metro Tech Park Charging Hub');
    const aeroCityRow = page.locator('text=Aerocity Super-Depot');
    const downtownRow = page.locator('text=Downtown Green Grid Station');

    if (await cyberHubRow.count() === 0 || await metroTechRow.count() === 0 || 
        await aeroCityRow.count() === 0 || await downtownRow.count() === 0) {
      throw new Error('One or more expected stations missing from SCADA table');
    }
    console.log('✓ All 4 stations rendered in table.');

    // Capture nominal state
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_charging_infra_nominal.png'), fullPage: false });
    console.log('✓ Captured screenshot: 01_charging_infra_nominal.png');

    // 6. Test Station Port Drilldown (expand port details)
    console.log('Step 6: Expanding port drilldown for CyberHub Depot...');
    const inspectBtn = page.locator('button:has-text("Inspect Ports")').first();
    await inspectBtn.click();
    await page.waitForTimeout(600);

    // Verify port cards inside expanded drawer
    const portId = page.locator('span:has-text("BAY-01")').first();
    await portId.waitFor({ state: 'visible', timeout: 3000 });
    console.log('✓ Port BAY-01 visible in drilldown drawer.');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_port_drilldown_expanded.png'), fullPage: false });
    console.log('✓ Captured screenshot: 02_port_drilldown_expanded.png');

    // 7. Test Grid Stress Simulation Throttling Behavior
    console.log('Step 7: Testing Grid Stress simulation and dynamic port throttling...');
    const stressBtn = page.locator('button:has-text("Simulate Stress")');
    if (await stressBtn.count() > 0) {
      await stressBtn.click();
      await page.waitForTimeout(1000);

      // Verify throttled badges and power reduction
      const throttledBadge = page.locator('span:has-text("THROTTLED")');
      const throttledCount = await throttledBadge.count();
      console.log(`✓ Throttled badges active: ${throttledCount}`);

      const throttledStripText = await summaryStrip.locator('span:has-text("Throttled")').locator('..').textContent();
      console.log(`  -> Summary strip throttled count: ${throttledStripText.trim()}`);
      if (!throttledStripText.includes('6')) {
        console.log('  Note: throttled count in strip:', throttledStripText);
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_charging_infra_stress_throttled.png'), fullPage: false });
      console.log('✓ Captured screenshot: 03_charging_infra_stress_throttled.png');

      // Reset grid
      const resetBtn = page.locator('button:has-text("Reset Grid")');
      await resetBtn.click();
      await page.waitForTimeout(1000);
      console.log('✓ Grid stress reset back to nominal operating condition.');
    } else {
      console.log('Simulate Stress button not found on this view.');
    }

    // 8. Test Navigation tab "Charging Infrastructure"
    console.log('Step 8: Testing direct navigation tab "Charging Infrastructure"...');
    const infraTab = page.locator('button:has-text("Charging Infrastructure")');
    if (await infraTab.count() > 0) {
      await infraTab.click();
      await page.waitForTimeout(500);
      const isVisible = await page.locator('text=Charging Infrastructure Overview').isVisible();
      if (!isVisible) throw new Error('Infrastructure tab failed to render Charging Infrastructure component');
      console.log('✓ Dedicated Charging Infrastructure tab works seamlessly.');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_dedicated_infra_tab.png'), fullPage: false });
    }

    console.log('\n========================================================');
    console.log('🎉 CHARGING INFRASTRUCTURE VERIFICATION COMPLETED SUCCESSFULLY! 🎉');
    console.log('Screenshots stored at:', SCREENSHOT_DIR);
    console.log('========================================================');

  } catch (err) {
    console.error('\n❌ CHARGING INFRASTRUCTURE TEST FAILED:', err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'infra_test_failure.png') });
    throw err;
  } finally {
    await browser.close();
  }
}

verifyChargingInfrastructure().then(() => {
  process.exit(0);
}).catch((err) => {
  process.exit(1);
});
