const { chromium } = require('C:/Users/Lenovo/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, 'test-results', 'firebase-auth');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runAuthVerification() {
  console.log('=== STARTING FIREBASE AUTH & RTDB PLAYWRIGHT VERIFICATION ===\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Track unexpected console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore known backend telemetry offline polling fallback and expected HTTP 400 from identitytoolkit on bad credential test
      if (
        !text.includes('ERR_CONNECTION_REFUSED') &&
        !text.includes('127.0.0.1:8000') &&
        !text.includes('status of 400')
      ) {
        consoleErrors.push(text);
      }
    }
  });

  try {
    // 1. Navigate to dashboard
    console.log('Step 1: Navigating to http://localhost:5173/');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_dashboard_loaded.png') });
    console.log('✓ Initial page loaded.');

    // 2. Open Auth Dialog
    console.log('\nStep 2: Opening Auth Dialog...');
    const signInBtn = page.locator('header button:has-text("Sign in"), footer button:has-text("Auth Dialog")').first();
    await signInBtn.click();
    await page.waitForSelector('text=Smart Grid & EV Charging Orchestration Platform');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_auth_modal_open.png') });
    console.log('✓ Auth Dialog opened.');

    // 3. Test Error Validation: Weak password
    console.log('\nStep 3: Testing weak password error during signup...');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(300);
    await page.fill('input[placeholder="Enter your name"]', 'Test Driver');
    await page.fill('input[placeholder="driver@example.com"]', 'test_ev_' + Date.now() + '@example.com');
    await page.fill('input[placeholder="••••••••"]', '123'); // < 6 chars
    await page.click('button:has-text("Create EV Account")');
    await page.waitForSelector('[role="alert"]');
    const weakPassMsg = await page.textContent('[role="alert"]');
    console.log('✓ Received expected error for weak password:', weakPassMsg.trim());
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_weak_password_error.png') });

    // 4. Test Error Validation: Invalid email
    console.log('\nStep 4: Testing invalid email format error...');
    await page.fill('input[placeholder="••••••••"]', 'ValidPassword123!');
    await page.fill('input[placeholder="driver@example.com"]', 'notanemail');
    // HTML5 email input might prevent form submission, so set type to text temporarily or test in login tab
    await page.evaluate(() => {
      document.querySelector('input[placeholder="driver@example.com"]').setAttribute('type', 'text');
    });
    await page.click('button:has-text("Create EV Account")');
    await page.waitForSelector('[role="alert"]');
    const invalidEmailMsg = await page.textContent('[role="alert"]');
    console.log('✓ Received expected error for invalid email:', invalidEmailMsg.trim());
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_invalid_email_error.png') });
    await page.evaluate(() => {
      document.querySelector('input[placeholder="driver@example.com"]').setAttribute('type', 'email');
    });

    // 5. Test Registration with Firebase Auth & Realtime Database
    console.log('\nStep 5: Registering a new Firebase account...');
    const uniqueEmail = `volt_driver_${Date.now()}@example.com`;
    const fullName = 'Alex Mercer';
    const strongPassword = 'StrongPassword123!';

    await page.fill('input[placeholder="Enter your name"]', fullName);
    await page.fill('input[placeholder="driver@example.com"]', uniqueEmail);
    await page.fill('input[placeholder="••••••••"]', strongPassword);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_registration_filled.png') });

    await page.click('button:has-text("Create EV Account")');

    // Wait for auth modal to close and header to reflect Alex Mercer
    await page.waitForSelector(`header:has-text("${fullName}")`, { timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_registered_and_logged_in.png') });
    console.log(`✓ Registration succeeded! Header displays: "${fullName}"`);

    // Verify user can view their dashboard
    const userOverviewText = await page.textContent('body');
    if (!userOverviewText.includes('EV Charging Dashboard')) {
      throw new Error('User dashboard not visible after registration');
    }
    console.log('✓ User dashboard visible and active.');

    // 6. Test Error Validation: Email Already in Use
    console.log('\nStep 6: Testing email already in use error...');
    // Open auth modal again via footer
    await page.click('footer button:has-text("Auth Dialog")');
    await page.waitForSelector('text=Smart Grid & EV Charging Orchestration Platform');
    await page.click('button:has-text("Create Account")');
    await page.fill('input[placeholder="Enter your name"]', 'Duplicate User');
    await page.fill('input[placeholder="driver@example.com"]', uniqueEmail);
    await page.fill('input[placeholder="••••••••"]', 'AnotherPassword123!');
    await page.click('button:has-text("Create EV Account")');
    await page.waitForSelector('[role="alert"]', { timeout: 8000 });
    const emailInUseMsg = await page.textContent('[role="alert"]');
    console.log('✓ Received expected error for duplicate email:', emailInUseMsg.trim());
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_email_already_in_use_error.png') });

    // Close modal
    await page.click('button[aria-label="Close dialog"]');
    await page.waitForTimeout(500);

    // 7. Test Logout
    console.log('\nStep 7: Testing Logout...');
    const logoutBtn = page.locator('header button[title="Log out"]');
    await logoutBtn.click();
    await page.waitForTimeout(1000);
    await page.waitForSelector('header button:has-text("Sign in")');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_logged_out.png') });
    console.log('✓ Logged out successfully. Header shows "Sign in".');

    // 8. Test Error Validation: Wrong Password on Login
    console.log('\nStep 8: Testing wrong password error during login...');
    await page.click('header button:has-text("Sign in")');
    await page.waitForSelector('text=Sign In to EV Dashboard');
    await page.fill('input[placeholder="driver@example.com"]', uniqueEmail);
    await page.fill('input[placeholder="••••••••"]', 'WrongPassword999!');
    await page.click('button:has-text("Sign In to EV Dashboard")');
    await page.waitForSelector('[role="alert"]', { timeout: 8000 });
    const wrongPassMsg = await page.textContent('[role="alert"]');
    console.log('✓ Received expected error for wrong password:', wrongPassMsg.trim());
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_wrong_password_error.png') });

    // 9. Test Login with correct credentials
    console.log('\nStep 9: Testing login with correct credentials...');
    await page.fill('input[placeholder="••••••••"]', strongPassword);
    await page.click('button:has-text("Sign In to EV Dashboard")');
    await page.waitForSelector(`header:has-text("${fullName}")`, { timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_logged_in_again.png') });
    console.log(`✓ Login succeeded! Header displays: "${fullName}"`);

    // 10. Test Page Refresh Preserves Authentication
    console.log('\nStep 10: Testing page reload preserves authentication state...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.waitForSelector(`header:has-text("${fullName}")`, { timeout: 10000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_after_refresh_authenticated.png') });
    console.log(`✓ Page refresh verified! User session for "${fullName}" was restored successfully via onAuthStateChanged.`);

    // 11. Test Guest Mode isolation
    console.log('\nStep 11: Testing Guest mode...');
    // Log out first
    await page.locator('header button[title="Log out"]').click();
    await page.waitForSelector('header button:has-text("Sign in")');
    await page.waitForTimeout(500);

    // Open auth modal and click Continue as Guest
    await page.click('header button:has-text("Sign in")');
    await page.waitForSelector('text=Continue as Guest');
    await page.click('button:has-text("Continue as Guest")');
    await page.waitForTimeout(1000);
    await page.waitForSelector('header:has-text("Guest Explorer")');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_guest_mode_active.png') });
    console.log('✓ Guest mode activated. Header shows "Guest Explorer".');

    // Refresh page in guest mode
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.waitForSelector('header:has-text("Guest Explorer")');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_guest_mode_after_refresh.png') });
    console.log('✓ Page reload preserves guest mode session.');

    // 12. Check console errors
    console.log('\nStep 12: Checking for unexpected console errors...');
    if (consoleErrors.length > 0) {
      console.warn('Console errors detected:', consoleErrors);
      throw new Error(`Unexpected console errors: ${consoleErrors.join(', ')}`);
    } else {
      console.log('✓ No unexpected console errors detected.');
    }

    console.log('\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error_state.png') });
    throw err;
  } finally {
    await browser.close();
  }
}

runAuthVerification().then(() => {
  process.exit(0);
}).catch(() => {
  process.exit(1);
});
