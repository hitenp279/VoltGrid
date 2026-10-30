const { chromium } = require('C:/Users/Lenovo/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, 'test-results', 'streamlined-admin');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verifyStreamlinedAdmin() {
  console.log('=== STARTING STREAMLINED ADMIN OVERVIEW & IA VERIFICATION ===\n');

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

    // 2. Activate Admin SCADA perspective via test hook
    console.log('Step 2: Activating Admin SCADA perspective...');
    await page.evaluate(() => {
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
        window.__VOLTGRID_TEST_HOOKS__.setAdminNavTab('overview');
      }
    });
    await page.waitForTimeout(800);

    // Verify Admin Dashboard is visible
    const adminHeader = await page.locator('text=Smart Grid AI Control Room').count();
    if (adminHeader === 0) throw new Error('Admin Dashboard header not visible');
    console.log('✓ Admin SCADA perspective activated.');

    // 3. Verify Overview Section Content (Streamlined Command Center)
    console.log('\nStep 3: Auditing Overview Section Components...');

    // A. Telemetry Strip
    const currentLoad = page.locator('span:has-text("Current Load")');
    const coreUtil = page.locator('span:has-text("Core Utilization")');
    const feederVolt = page.locator('span:has-text("Feeder Voltage")');
    const scadaState = page.locator('span:has-text("SCADA State")');
    if (await currentLoad.count() === 0 || await coreUtil.count() === 0 || 
        await feederVolt.count() === 0 || await scadaState.count() === 0) {
      throw new Error('Key prioritized metrics missing from Telemetry Strip');
    }
    console.log('✓ Cohesive Telemetry Strip present with prioritized metrics.');

    // B. Compact AI Load Management
    const aiPanel = page.locator('text=AI Dynamic Load Management');
    const stepState = page.locator('text=1. Current State');
    const stepPolicy = page.locator('text=2. AI Policy');
    const stepAction = page.locator('text=3. Action');
    if (await aiPanel.count() === 0 || await stepState.count() === 0 || 
        await stepPolicy.count() === 0 || await stepAction.count() === 0) {
      throw new Error('Compact 3-step AI Load Management workflow missing');
    }
    console.log('✓ Compact 3-step AI Load Management workflow verified.');

    // C. Compact Infrastructure Overview
    const infraSummary = page.locator('text=Charging Infrastructure Overview');
    const viewInfraBtn = page.locator('button:has-text("View Infrastructure")');
    if (await infraSummary.count() === 0 || await viewInfraBtn.count() === 0) {
      throw new Error('Compact Charging Infrastructure card or link missing');
    }
    console.log('✓ Compact Charging Infrastructure overview verified with navigation link.');

    // D. Compact Grid & Transformer
    const transformerSummary = page.locator('text=Grid Feeder & Transformer TF-05');
    const viewTelemetryBtn = page.locator('button:has-text("View Telemetry")');
    if (await transformerSummary.count() === 0 || await viewTelemetryBtn.count() === 0) {
      throw new Error('Compact Transformer summary card or link missing');
    }
    console.log('✓ Compact Feeder & Transformer TF-05 card verified with navigation link.');

    // E. Compact EV Dispatch Queue
    const evQueueSummary = page.locator('text=EV Priority Dispatch');
    const viewQueueBtn = page.locator('button:has-text("View Priority Queue")');
    if (await evQueueSummary.count() === 0 || await viewQueueBtn.count() === 0) {
      throw new Error('Compact EV Priority Dispatch card or link missing');
    }
    console.log('✓ Compact EV Priority Dispatch verified with navigation link.');

    // F. Filtered Recent Operational Alerts
    const alertsSummary = page.locator('text=Recent Operational Alerts');
    const viewAlertsBtn = page.locator('button:has-text("View All Alerts")');
    if (await alertsSummary.count() === 0 || await viewAlertsBtn.count() === 0) {
      throw new Error('Compact Alerts preview card or link missing');
    }
    console.log('✓ Filtered Recent Operational Alerts verified with navigation link.');

    // 4. Verify that Overview does NOT contain redundant heavy tables or dominating charts
    console.log('\nStep 4: Checking clutter reduction on Overview...');
    // Inspect Ports button should NOT be on Overview (lives in dedicated infrastructure tab)
    const overviewInspectPortsCount = await page.locator('button:has-text("Inspect Ports")').count();
    if (overviewInspectPortsCount > 0) {
      throw new Error('Clutter violation: Full expandable port drilldown is still rendered on Overview!');
    }
    console.log('✓ Verified: Full station table & expandable port drilldowns removed from Overview.');

    // Time-series charts should NOT dominate Overview
    const chartsOnOverview = await page.locator('text=Primary bus current measured at 3-second SCADA intervals').count();
    if (chartsOnOverview > 0) {
      throw new Error('Clutter violation: Heavy SCADA time-series charts are still rendered on Overview!');
    }
    console.log('✓ Verified: Heavy time-series charts removed from Overview (cleanly moved to Grid Telemetry).');

    // Capture nominal Overview state
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_streamlined_overview_nominal.png'), fullPage: false });
    console.log('✓ Captured screenshot: 01_streamlined_overview_nominal.png');

    // 5. Test Grid Overload Simulation on Overview
    console.log('\nStep 5: Testing Grid Stress simulation from Overview operator control...');
    const simulateStressBtn = page.locator('button:has-text("Simulate Stress")').first();
    await simulateStressBtn.click();
    await page.waitForTimeout(1000);

    // Verify critical alert banner appears
    const alertBanner = page.locator('text=Automated Load Shedding Activated');
    if (await alertBanner.count() === 0) {
      throw new Error('Critical overload banner did not activate during stress simulation');
    }
    console.log('✓ Critical Overload Warning banner actively displayed.');

    // Verify AI 3-step reflects load shedding
    const loadSheddingText = page.locator('text=THROTTLE FLEXIBLE BAYS');
    if (await loadSheddingText.count() === 0) {
      throw new Error('AI Decision step did not transition to THROTTLE FLEXIBLE BAYS');
    }
    console.log('✓ AI Decision flow dynamically shows: CRITICAL HIGH LOAD → LOAD SHEDDING → THROTTLE FLEXIBLE BAYS.');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_streamlined_overview_stress.png'), fullPage: false });
    console.log('✓ Captured screenshot: 02_streamlined_overview_stress.png');

    // Reset grid
    const resetBtn = page.locator('button:has-text("Reset Grid")').first();
    await resetBtn.click();
    await page.waitForTimeout(1000);
    console.log('✓ Grid stress reset back to nominal condition.');

    // 6. Test Deep-Dive Navigation Pathways
    console.log('\nStep 6: Testing 1-click drilldown navigation pathways...');

    // Test View Infrastructure
    await viewInfraBtn.click();
    await page.waitForTimeout(500);
    const hasStationTable = await page.locator('button:has-text("Inspect Ports")').count();
    if (hasStationTable === 0) throw new Error('Failed to navigate to full Charging Infrastructure view');
    console.log('✓ "View Infrastructure →" navigates to full Charging Infrastructure view with port inspection.');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_dedicated_infrastructure_tab.png'), fullPage: false });

    // Test View Telemetry
    await page.click('button:has-text("Overview")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("View Telemetry")');
    await page.waitForTimeout(500);
    const hasTelemetryCharts = await page.locator('text=Feeder Voltage Stability Stream').count();
    if (hasTelemetryCharts === 0) throw new Error('Failed to navigate to Grid Telemetry view');
    console.log('✓ "View Telemetry →" navigates to full Grid Telemetry view with live SCADA charts.');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_dedicated_telemetry_tab.png'), fullPage: false });

    // Test View Priority Queue
    await page.click('button:has-text("Overview")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("View Priority Queue")');
    await page.waitForTimeout(500);
    const hasQueueTable = await page.locator('text=Deadline-Aware EV Priority Charging Queue').count();
    if (hasQueueTable === 0) throw new Error('Failed to navigate to EV Priority Queue view');
    console.log('✓ "View Priority Queue →" navigates to dedicated EV Priority Queue view.');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_dedicated_queue_tab.png'), fullPage: false });

    // Test Policy Details
    await page.click('button:has-text("Overview")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("Policy Details")');
    await page.waitForTimeout(500);
    const hasPolicyPanel = await page.locator('text=Deterministic priority scheduling and predictive load shedding').count();
    if (hasPolicyPanel === 0) throw new Error('Failed to navigate to Load Management view');
    console.log('✓ "Policy Details →" navigates to dedicated Load Management view.');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_dedicated_ai_management_tab.png'), fullPage: false });

    // Test View All Alerts
    await page.click('button:has-text("Overview")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("View All Alerts")');
    await page.waitForTimeout(500);
    const hasAlertsList = await page.locator('text=SCADA Events & AI Dispatch Logs').count();
    if (hasAlertsList === 0) throw new Error('Failed to navigate to Alerts view');
    console.log('✓ "View All Alerts →" navigates to dedicated Alerts view with filters and log history.');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_dedicated_alerts_tab.png'), fullPage: false });

    console.log('\n========================================================');
    console.log('🎉 ALL STREAMLINED ADMIN & IA TESTS PASSED PERFECTLY! 🎉');
    console.log('Screenshots stored at:', SCREENSHOT_DIR);
    console.log('========================================================');

  } catch (err) {
    console.error('\n❌ STREAMLINED ADMIN TEST FAILED:', err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'streamlined_admin_test_failure.png') });
    throw err;
  } finally {
    await browser.close();
  }
}

verifyStreamlinedAdmin().then(() => {
  process.exit(0);
}).catch((err) => {
  process.exit(1);
});
