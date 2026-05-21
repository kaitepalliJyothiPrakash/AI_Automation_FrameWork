/**
 * Run: node utils/debugLocator.js
 * This logs the actual page URL and all buttons after Login & Security click
 */

require('dotenv').config();
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.amazon.in');

  // Login
  await page.locator('#nav-link-accountList').click();
  await page.locator('#ap_email_login').fill(process.env.AMAZON_EMAIL);
  await page.locator('#continue').click();
  await page.locator('#ap_password').fill(process.env.AMAZON_PASSWORD);
  await page.locator('#signInSubmit').click();
  await page.waitForSelector('#nav-link-accountList-nav-line-1', { timeout: 90000 });

  // Go to Account
  await page.locator('#nav-link-accountList-nav-line-1').click();
  await page.locator('text=Login & security').click();
  await page.waitForLoadState('networkidle', { timeout: 30000 });

  console.log('\n📍 Current URL:', page.url());

  // Log all buttons and inputs on the page
  const buttons = await page.locator('input[type="submit"], button, a[id*="NAME"], [id*="NAME"]').all();
  console.log(`\n🔍 Found ${buttons.length} elements:`);
  for (const btn of buttons) {
    const id = await btn.getAttribute('id');
    const name = await btn.getAttribute('name');
    const text = await btn.innerText().catch(() => '');
    const ariaLabel = await btn.getAttribute('aria-label');
    const type = await btn.getAttribute('type');
    console.log(`  id="${id}" name="${name}" type="${type}" aria-label="${ariaLabel}" text="${text.trim().substring(0, 50)}"`);
  }

  console.log('\n✅ Check the browser — find the Edit button next to Name section');
  console.log('Press Ctrl+C to exit\n');

  await page.waitForTimeout(60000);
  await browser.close();
})();
