import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import * as path from 'path';
import * as fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure tests to run in parallel
test.describe.configure({ mode: 'parallel' });

// Define selectors and constants
const loginPageUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
const usernameFieldSelector = 'input[name="username"]';
const passwordFieldSelector = 'input[name="password"]';
const loginButtonSelector = 'button[type="submit"]';
const errorMessageSelector = '.oxd-alert-content-text';
const dashboardSelector = '.oxd-topbar-header-breadcrumb';
const requiredErrorSpanSelector = '.oxd-input-group span.oxd-input-field-error-message'; // Generic selector for "Required" message
const forgotPasswordLinkSelector = 'a[href*="requestPasswordReset"]';

// Valid credentials
const validUsername = 'Admin';
const validPassword = 'admin123';

/**
 * Helper function to write test results to a JSON file.
 * @param {string} testCaseId - The exact test case ID from the Excel sheet.
 * @param {string} browser - The browser name (e.g., 'chromium', 'msedge').
 * @param {string} status - The test status ('Pass' or 'Fail').
 * @param {string} actualResult - A description of the actual test result.
 */
async function writeResult(testCaseId, browser, status, actualResult) {
  const outputDir = path.resolve(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const resultFile = path.join(outputDir, 'test_results.json');
  let results = [];
  if (fs.existsSync(resultFile)) {
    try {
      results = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
    } catch (e) {
      console.error('Error parsing existing results file, starting fresh:', e);
      results = [];
    }
  }
  const entry = { test_case_id: testCaseId, browser, status, actual_result: actualResult };
  if (status === 'Fail') {
    const max = results.filter(r => r.defect_id).length;
    entry.defect_id = 'DEF' + String(max + 1).padStart(3, '0');
  }
  results.push(entry);
  fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
  console.log('Result written: ' + testCaseId + ' | ' + browser + ' | ' + status + ' | ' + actualResult);
}

// --- Test Cases ---

test('TC-LOGIN-001: Verify successful login with correct Admin username and admin123 password.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-001';

  try {
    await page.goto(loginPageUrl);
    await page.fill(usernameFieldSelector, validUsername);
    await page.fill(passwordFieldSelector, validPassword);
    await page.click(loginButtonSelector);

    await expect(page.locator(dashboardSelector)).toBeVisible();
    await expect(page).toHaveURL(/web\/index.php\/dashboard\/index/);
    actualResult = 'User successfully logged in and redirected to the dashboard.';
  } catch (error) {
    status = 'Fail';
    actualResult = `Login failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-002: Verify login failure with an unregistered username (InvalidUser) and valid password (admin123).', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-002';

  try {
    await page.goto(loginPageUrl);
    await page.fill(usernameFieldSelector, 'InvalidUser');
    await page.fill(passwordFieldSelector, validPassword);
    await page.click(loginButtonSelector);

    await expect(page.locator(errorMessageSelector)).toBeVisible();
    await expect(page.locator(errorMessageSelector)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(loginPageUrl);
    actualResult = "System displayed 'Invalid credentials' error and remained on login page.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-003: Verify login failure with a valid username (Admin) and an incorrect password (wrongpass).', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-003';

  try {
    await page.goto(loginPageUrl);
    await page.fill(usernameFieldSelector, validUsername);
    await page.fill(passwordFieldSelector, 'wrongpass');
    await page.click(loginButtonSelector);

    await expect(page.locator(errorMessageSelector)).toBeVisible();
    await expect(page.locator(errorMessageSelector)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(loginPageUrl);
    actualResult = "System displayed 'Invalid credentials' error and remained on login page.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-004: Verify error messages when both username and password fields are left empty.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-004';

  try {
    await page.goto(loginPageUrl);
    // Do not fill fields
    await page.click(loginButtonSelector);

    await expect(page.locator(`input[name="username"] + ${requiredErrorSpanSelector}`)).toHaveText('Required');
    await expect(page.locator(`input[name="password"] + ${requiredErrorSpanSelector}`)).toHaveText('Required');
    await expect(page).toHaveURL(loginPageUrl); // Should stay on login page
    actualResult = "System displayed 'Required' error messages for both fields.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-005: Verify error message when username field is empty but password field is filled.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-005';

  try {
    await page.goto(loginPageUrl);
    await page.fill(passwordFieldSelector, validPassword); // Fill password
    // Leave username empty
    await page.click(loginButtonSelector);

    await expect(page.locator(`input[name="username"] + ${requiredErrorSpanSelector}`)).toHaveText('Required');
    await expect(page).toHaveURL(loginPageUrl);
    actualResult = "System displayed 'Required' error message for username field.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-006: Verify error message when username field is filled but password field is empty.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-006';

  try {
    await page.goto(loginPageUrl);
    await page.fill(usernameFieldSelector, validUsername); // Fill username
    // Leave password empty
    await page.click(loginButtonSelector);

    await expect(page.locator(`input[name="password"] + ${requiredErrorSpanSelector}`)).toHaveText('Required');
    await expect(page).toHaveURL(loginPageUrl);
    actualResult = "System displayed 'Required' error message for password field.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-007: Test for SQL injection vulnerability in the username field using common payload.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-007';

  try {
    await page.goto(loginPageUrl);
    await page.fill(usernameFieldSelector, "' OR '1'='1");
    await page.fill(passwordFieldSelector, "any_password");
    await page.click(loginButtonSelector);

    await expect(page.locator(errorMessageSelector)).toBeVisible();
    await expect(page.locator(errorMessageSelector)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(loginPageUrl);
    actualResult = "Login failed with 'Invalid credentials' error, SQL injection not successful.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-008: Test for SQL injection vulnerability in the password field using common payload.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-008';

  try {
    await page.goto(loginPageUrl);
    await page.fill(usernameFieldSelector, validUsername);
    await page.fill(passwordFieldSelector, "' OR '1'='1");
    await page.click(loginButtonSelector);

    await expect(page.locator(errorMessageSelector)).toBeVisible();
    await expect(page.locator(errorMessageSelector)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(loginPageUrl);
    actualResult = "Login failed with 'Invalid credentials' error, SQL injection not successful.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-009: Test for XSS vulnerability using a simple script in the username field.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-009';

  try {
    // Listen for dialogs (alerts)
    page.on('dialog', async dialog => {
      console.log(`XSS dialog detected: ${dialog.message()}`);
      await dialog.dismiss();
      throw new Error(`XSS alert detected: ${dialog.message()}`); // Fail the test if an alert appears
    });

    await page.goto(loginPageUrl);
    await page.fill(usernameFieldSelector, `<script>alert('XSS');</script>`);
    await page.fill(passwordFieldSelector, validPassword);
    await page.click(loginButtonSelector);

    // Expect login to fail with invalid credentials, without XSS executing
    await expect(page.locator(errorMessageSelector)).toBeVisible();
    await expect(page.locator(errorMessageSelector)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(loginPageUrl);
    actualResult = "XSS script did not execute, login failed with 'Invalid credentials'.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed (possible XSS detected or unexpected behavior): ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-010: Test for HTML injection vulnerability in the username field\'s display (e.g., error messages).', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-010';

  try {
    await page.goto(loginPageUrl);
    await page.fill(usernameFieldSelector, `<b>test</b>`);
    await page.fill(passwordFieldSelector, 'invalid');
    await page.click(loginButtonSelector);

    // Expect login to fail with invalid credentials, without HTML rendering
    await expect(page.locator(errorMessageSelector)).toBeVisible();
    await expect(page.locator(errorMessageSelector)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(loginPageUrl);
    // Since OrangeHRM shows 'Invalid credentials' and doesn't reflect the input,
    // we primarily ensure no XSS/HTML rendering issues by checking for the expected error.
    actualResult = "Login failed with 'Invalid credentials', no HTML rendering observed.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-011: Verify login failure when username case is incorrect (admin) but password is correct (admin123).', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-011';

  try {
    await page.goto(loginPageUrl);
    await page.fill(usernameFieldSelector, 'admin'); // Lowercase username
    await page.fill(passwordFieldSelector, validPassword);
    await page.click(loginButtonSelector);

    await expect(page.locator(errorMessageSelector)).toBeVisible();
    await expect(page.locator(errorMessageSelector)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(loginPageUrl);
    actualResult = "Login failed with 'Invalid credentials' due to incorrect username case (expected case-sensitive).";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-012: Verify login failure when password case is incorrect (ADMIN123) but username is correct (Admin).', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-012';

  try {
    await page.goto(loginPageUrl);
    await page.fill(usernameFieldSelector, validUsername);
    await page.fill(passwordFieldSelector, 'ADMIN123'); // Uppercase password
    await page.click(loginButtonSelector);

    await expect(page.locator(errorMessageSelector)).toBeVisible();
    await expect(page.locator(errorMessageSelector)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(loginPageUrl);
    actualResult = "Login failed with 'Invalid credentials' due to incorrect password case (expected case-sensitive).";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-013: Test system response with an extremely long username (e.g., 255 characters or more).', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-013';
  const longUsername = 'a'.repeat(255);

  try {
    await page.goto(loginPageUrl);
    await page.fill(usernameFieldSelector, longUsername);
    await page.fill(passwordFieldSelector, validPassword);
    await page.click(loginButtonSelector);

    await expect(page.locator(errorMessageSelector)).toBeVisible();
    await expect(page.locator(errorMessageSelector)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(loginPageUrl);
    actualResult = "System handled long username gracefully, login failed with 'Invalid credentials'.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-014: Test system response with an extremely long password (e.g., 255 characters or more).', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-014';
  const longPassword = 'p'.repeat(255);

  try {
    await page.goto(loginPageUrl);
    await page.fill(usernameFieldSelector, validUsername);
    await page.fill(passwordFieldSelector, longPassword);
    await page.click(loginButtonSelector);

    await expect(page.locator(errorMessageSelector)).toBeVisible();
    await expect(page.locator(errorMessageSelector)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(loginPageUrl);
    actualResult = "System handled long password gracefully, login failed with 'Invalid credentials'.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-015: Verify Required message for empty username field (with filled password).', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-015';

  try {
    await page.goto(loginPageUrl);
    // Leave Username empty
    await page.fill(passwordFieldSelector, 'any_password');
    await page.click(loginButtonSelector);

    await expect(page.locator(`input[name="username"] + ${requiredErrorSpanSelector}`)).toHaveText('Required');
    actualResult = "Required message appeared for empty username field.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-016: Verify Required message for empty password field (with filled username).', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-016';

  try {
    await page.goto(loginPageUrl);
    await page.fill(usernameFieldSelector, validUsername);
    // Leave Password empty
    await page.click(loginButtonSelector);

    await expect(page.locator(`input[name="password"] + ${requiredErrorSpanSelector}`)).toHaveText('Required');
    actualResult = "Required message appeared for empty password field.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-017: Verify Invalid credentials error message for incorrect username/password combination.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-017';

  try {
    await page.goto(loginPageUrl);
    await page.fill(usernameFieldSelector, 'InvalidUser');
    await page.fill(passwordFieldSelector, 'wrongpass');
    await page.click(loginButtonSelector);

    await expect(page.locator(errorMessageSelector)).toBeVisible();
    await expect(page.locator(errorMessageSelector)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(loginPageUrl);
    actualResult = "Generic 'Invalid credentials' message displayed for incorrect combination.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-018: Verify that the Forgot your password? link is present and visible on the login page.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-018';

  try {
    await page.goto(loginPageUrl);
    await expect(page.locator(forgotPasswordLinkSelector)).toBeVisible();
    await expect(page.locator(forgotPasswordLinkSelector)).toHaveText('Forgot your password?');
    actualResult = "Forgot your password? link is present and visible.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-019: Verify clicking the Forgot your password? link redirects to the password reset page.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-019';

  try {
    await page.goto(loginPageUrl);
    await page.click(forgotPasswordLinkSelector);

    await expect(page).toHaveURL(/web\/index.php\/auth\/requestPasswordReset/);
    actualResult = "Clicked Forgot your password? link and redirected to the password reset page.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-020: Verify that characters entered in the password field are masked (e.g., with asterisks or dots).', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-020';

  try {
    await page.goto(loginPageUrl);
    await page.fill(passwordFieldSelector, 'secretpassword');

    await expect(page.locator(passwordFieldSelector)).toHaveAttribute('type', 'password');
    actualResult = "Password field characters are masked with type='password'.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

test('TC-LOGIN-021: Verify that a successful login with valid credentials redirects the user to the OrangeHRM dashboard.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = '';
  const testCaseId = 'TC-LOGIN-021';

  try {
    await page.goto(loginPageUrl);
    await page.fill(usernameFieldSelector, validUsername);
    await page.fill(passwordFieldSelector, validPassword);
    await page.click(loginButtonSelector);

    await expect(page.locator(dashboardSelector)).toBeVisible();
    await expect(page).toHaveURL(/web\/index.php\/dashboard\/index/);
    actualResult = "Successful login redirected user to OrangeHRM dashboard with correct URL.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Test ${testCaseId} failed:`, error);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});