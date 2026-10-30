const { chromium } = require('C:/Users/Lenovo/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, 'test-results', 'refinement');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runRefinementAudit() {
  console.log('=== STARTING VOLTGRID TARGETED UI REFINEMENT VERIFICATION ===\n');
  
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    console.log('Step 1: Navigating to http://localhost:5173/');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Verify hooks are available
    const hasHooks = await page.evaluate(() => typeof window !== 'undefined' && !!window.__VOLTGRID_TEST_HOOKS__);
    console.log('Step 2: Checking window.__VOLTGRID_TEST_HOOKS__:', hasHooks);
    if (!hasHooks) {
      throw new Error('Test hooks not mounted! Ensure Vite dev server is running.');
    }

    // Switch to Admin SCADA perspective
    await page.evaluate(() => {
      window.__VOLTGRID_TEST_HOOKS__.setAuth({
        isAuthenticated: true,
        isGuest: false,
        role: 'admin',
        user: {
          uid: 'admin_scada_op',
          name: 'Chief SCADA Controller',
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
    });
    await page.waitForTimeout(800);

    // Verify Admin Dashboard is visible
    const adminHeader = await page.locator('text=Smart Grid AI Control Room').count();
    if (adminHeader === 0) throw new Error('Admin Dashboard header not rendered');
    console.log('✓ Admin SCADA perspective successfully activated.\n');

    // 1. Audit Text Removals
    console.log('--- 1. Checking 4 Specified Text Removals ---');

    // Check 1: Top navigation standalone Cyber Feeder beside Substation #05
    const headerCyberFeeder = await page.locator('header span:has-text("Cyber Feeder")').count();
    console.log(`  Top Navigation 'Cyber Feeder' count: ${headerCyberFeeder} (Expected: 0)`);
    if (headerCyberFeeder > 0) throw new Error('Top Navigation Cyber Feeder still present!');

    // Check 2: Subtitle beneath Smart Grid AI Control Room
    const subtitleCount = await page.locator('text=65 MVA Core Orchestration & Automated Demand Response').count();
    console.log(`  Main heading subtitle count: ${subtitleCount} (Expected: 0)`);
    if (subtitleCount > 0) throw new Error('Main heading subtitle still present!');

    // Check 3: Small heading label CYBERHUB FEEDER
    const cyberhubFeederCount = await page.locator('text=CYBERHUB FEEDER').count();
    console.log(`  Small heading label 'CYBERHUB FEEDER' count: ${cyberhubFeederCount} (Expected: 0)`);
    if (cyberhubFeederCount > 0) throw new Error('Small heading label CYBERHUB FEEDER still present!');

    // Check 4: Grid Health card subtitle 'DLF Cyber Feeder · 50.0 Hz RMS Telemetry Stream'
    const gridHealthSubtitle = await page.locator('text=50.0 Hz RMS Telemetry Stream').count();
    console.log(`  Grid Health subtitle count: ${gridHealthSubtitle} (Expected: 0)`);
    if (gridHealthSubtitle > 0) throw new Error('Grid Health subtitle still present!');

    // Check 5: Ensure other items were NOT accidentally removed
    const substation05 = await page.locator('header span:has-text("Substation #05")').count();
    const scadaNode05 = await page.locator('text=SCADA NODE #05').count();
    const voltgridScada = await page.locator('text=VOLTGRID SCADA').count();
    const gridHealthTitle = await page.locator('h2:has-text("Grid Health")').count();
    console.log(`  Preserved labels check: Substation #05=${substation05}, SCADA NODE #05=${scadaNode05}, VOLTGRID SCADA=${voltgridScada}, Grid Health=${gridHealthTitle}`);
    if (substation05 === 0 || scadaNode05 === 0 || voltgridScada === 0 || gridHealthTitle === 0) {
      throw new Error('Preserved labels were accidentally removed!');
    }
    console.log('  ✓ All 4 redundant texts removed and required identifiers preserved.\n');

    // 2. Audit Top-bar Grid Status Box
    console.log('--- 2. Auditing Grid Status Box ---');
    const gridStatusPill = page.locator('header div.rounded-full:has-text("Grid Normal")').first();
    const boxBox = await gridStatusPill.boundingBox();
    console.log(`  Grid Status Box dimensions: Width=${boxBox.width.toFixed(1)}px, Height=${boxBox.height.toFixed(1)}px`);
    if (boxBox.width < 240) {
      throw new Error(`Grid Status Box is too narrow: ${boxBox.width}px (Expected >= 240px)`);
    }

    const gridStatusText = await gridStatusPill.innerText();
    console.log(`  Grid Status Box text: "${gridStatusText.replace(/\n/g, ' ')}"`);
    
    // Verify vertical divider exists inside the status box
    const divider = gridStatusPill.locator('span[aria-hidden="true"]');
    const dividerCount = await divider.count();
    console.log(`  Divider present: ${dividerCount > 0 ? 'Yes' : 'No'}`);
    if (dividerCount === 0) throw new Error('Subtle vertical divider missing from Grid Status Box!');
    console.log('  ✓ Grid Status Box stretched horizontally with status, divider, and readings cleanly side by side.\n');

    // 3. Audit AI Dynamic Load Management Card Header (Normal Mode at 1440px)
    console.log('--- 3. Auditing AI Dynamic Load Management Card (Normal Mode - 1440px) ---');
    const aiCard = page.locator('div:has(h3:has-text("AI Dynamic Load Management"))').first();
    const aiTitle = page.locator('h3:has-text("AI Dynamic Load Management")').first();
    const aiTitleBox = await aiTitle.boundingBox();
    console.log(`  Normal Mode AI Title: Width=${aiTitleBox.width.toFixed(1)}px, Height=${aiTitleBox.height.toFixed(1)}px`);
    
    // Single line text height for text-sm is ~20px. Wrapping produces height >= 36px.
    if (aiTitleBox.height > 25) {
      throw new Error(`Normal Mode AI Title wrapped onto two lines! Height=${aiTitleBox.height}px`);
    }
    console.log('  ✓ Normal Mode AI Title fits on ONE single line!');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_normal_mode_1440px.png') });
    console.log('  Captured screenshot: 01_normal_mode_1440px.png\n');

    // 4. Test Stress State (Overload Mode at 1440px)
    console.log('--- 4. Auditing AI Dynamic Load Management Card (Stress Mode - 1440px) ---');
    const simulateBtn = page.locator('button:has-text("Simulate Stress")').first();
    await simulateBtn.click();
    await page.waitForTimeout(600);

    // Verify stress state is active
    const resetBtn = page.locator('button:has-text("Reset Grid")').first();
    if (await resetBtn.count() === 0) throw new Error('Stress state did not activate: Reset Grid button not found');

    const stressTitleBox = await aiTitle.boundingBox();
    console.log(`  Stress Mode AI Title: Width=${stressTitleBox.width.toFixed(1)}px, Height=${stressTitleBox.height.toFixed(1)}px`);
    if (stressTitleBox.height > 25) {
      throw new Error(`Stress Mode AI Title wrapped! Height=${stressTitleBox.height}px`);
    }
    console.log('  ✓ Stress Mode AI Title fits cleanly on ONE line!');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_stress_mode_1440px.png') });
    console.log('  Captured screenshot: 02_stress_mode_1440px.png\n');

    // Reset stress state
    await resetBtn.click();
    await page.waitForTimeout(500);

    // 5. Test at Narrow Viewport (1200px & 1024px)
    console.log('--- 5. Testing Narrower Desktop Viewports ---');
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(400);
    const box1200 = await aiTitle.boundingBox();
    console.log(`  At 1200px: Title Height=${box1200.height.toFixed(1)}px, Width=${box1200.width.toFixed(1)}px`);
    if (box1200.height > 25) {
      throw new Error(`AI Title wrapped at 1200px viewport! Height=${box1200.height}px`);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_normal_mode_1200px.png') });
    console.log('  Captured screenshot: 03_normal_mode_1200px.png');

    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(400);
    const box1024 = await aiTitle.boundingBox();
    console.log(`  At 1024px: Title Height=${box1024.height.toFixed(1)}px, Width=${box1024.width.toFixed(1)}px`);
    if (box1024.height > 25) {
      throw new Error(`AI Title wrapped at 1024px viewport! Height=${box1024.height}px`);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_normal_mode_1024px.png') });
    console.log('  Captured screenshot: 04_normal_mode_1024px.png\n');

    console.log('====================================================');
    console.log('🎉 ALL TARGETED REFINEMENT ACCEPTANCE CRITERIA PASSED!');
    console.log('====================================================');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ AUDIT FAILED:', err.message);
    await browser.close();
    process.exit(1);
  }
}

runRefinementAudit();
