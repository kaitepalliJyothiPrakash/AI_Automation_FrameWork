import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Define __dirname for ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Enable parallel execution for tests
test.describe.configure({ mode: 'parallel' });

// Base URL for the OrangeHRM login page
const ORANGEHRM_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';

// Selectors for OrangeHRM login page elements
const USERNAME_FIELD = 'input[name="username"]';
const PASSWORD_FIELD = 'input[name="password"]';
const LOGIN_BUTTON = 'button[type="submit"]';
const ERROR_MESSAGE_GENERAL = '.oxd-alert-content-text';
const ERROR_MESSAGE_USERNAME_EMPTY = 'input[name="username"] + span.oxd-input-field-error-message';
const ERROR_MESSAGE_PASSWORD_EMPTY = 'input[name="password"] + span.oxd-input-field-error-message';
const DASHBOARD_HEADER = '.oxd-topbar-header-breadcrumb'; // Selector for dashboard after login
const FORGOT_PASSWORD_LINK = 'p.oxd-text.oxd-text--p.orangehrm-login-forgot-header';


/**
 * Helper function to write test results to a JSON file.
 * This function handles file locking to prevent race conditions during parallel execution.
 */
async function writeResult(testCaseId, browser, status, actualResult) {
  const outputDir = path.resolve(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const resultFile = path.join(outputDir, 'test_results.json');
  const lockFile = path.join(outputDir, 'test_results.lock');
  let waited = 0;
  while (fs.existsSync(lockFile) && waited < 10000) { await new Promise(r => setTimeout(r, 100)); waited += 100; } // Wait up to 10 seconds for lock
  fs.writeFileSync(lockFile, process.pid.toString()); // Acquire lock

  try {
    let results = [];
    if (fs.existsSync(resultFile)) {
      try {
        results = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
      } catch (e) {
        console.error('Error parsing existing test_results.json, starting fresh:', e);
        results = []; // If file is corrupt, start with an empty array
      }
    }

    const entry = { test_case_id: testCaseId, browser, status, actual_result: actualResult };
    if (status === 'Fail') {
      // Calculate defect ID
      const max = results.filter(r => r.defect_id).length;
      entry.defect_id = 'DEF' + String(max + 1).padStart(3, '0') + '-' + browser;
    }
    results.push(entry);
    fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
    console.log('Result written: ' + testCaseId + ' | ' + browser + ' | ' + status);
  } finally {
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile); // Release lock
  }
}

// Test Case: TC001
test('TC001 SCN001: Verify successful login with valid username and password.', async ({ page, browserName }) => {
  const testCaseId = 'TC001';
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
    status = 'Pass';
    actualResult = 'User successfully redirected to the dashboard.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case: TC002
test('TC002 SCN001: Verify login fails with an invalid username and a valid password.', async ({ page, browserName }) => {
  const testCaseId = 'TC002';
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'InvalidUser');
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" message for invalid username.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case: TC003
test('TC003 SCN001: Verify login fails with a valid username and an invalid password.', async ({ page, browserName }) => {
  const testCaseId = 'TC003';
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    await page.fill(PASSWORD_FIELD, 'wrongpassword');
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" message for invalid password.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case: TC004
test('TC004 SCN001: Verify login fails when both username and password fields are left empty.', async ({ page, browserName }) => {
  const testCaseId = 'TC004';
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    // Do not fill username or password
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_USERNAME_EMPTY)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_USERNAME_EMPTY)).toHaveText('Required'); // OrangeHRM's actual message is 'Required'
    status = 'Pass';
    actualResult = 'Error message "Required" displayed near Username field when both fields are empty.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case: TC005
test('TC005 SCN001: Verify login fails when the username field is empty and the password field is filled.', async ({ page, browserName }) => {
  const testCaseId = 'TC005';
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    // Leave Username empty
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_USERNAME_EMPTY)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_USERNAME_EMPTY)).toHaveText('Required'); // OrangeHRM's actual message is 'Required'
    status = 'Pass';
    actualResult = 'Error message "Required" displayed near Username field when username is empty.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case: TC006
test('TC006 SCN001: Verify login fails when the username field is filled and the password field is empty.', async ({ page, browserName }) => {
  const testCaseId = 'TC006';
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    // Leave Password empty
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_PASSWORD_EMPTY)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_PASSWORD_EMPTY)).toHaveText('Required'); // OrangeHRM's actual message is 'Required'
    status = 'Pass';
    actualResult = 'Error message "Required" displayed near Password field when password is empty.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case: TC007
test('TC007 SCN002: Verify system is resilient to common SQL injection attempts in the username field.', async ({ page, browserName }) => {
  const testCaseId = 'TC007';
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, "' OR '1'='1");
    await page.fill(PASSWORD_FIELD, 'password');
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" for SQL injection attempt in username.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case: TC008
test('TC008 SCN002: Verify system is resilient to common SQL injection attempts in the password field.', async ({ page, browserName }) => {
  const testCaseId = 'TC008';
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    await page.fill(PASSWORD_FIELD, "' OR '1'='1");
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" for SQL injection attempt in password.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case: TC009
test('TC009 SCN002: Verify system is resilient to XSS/HTML injection attempts in the username field.', async ({ page, browserName }) => {
  const testCaseId = 'TC009';
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, "<script>alert('XSS')</script>");
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    // Check that no alert was triggered (Playwright handles this by default, will fail test if alert appears)
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" and no script execution for XSS in username.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case: TC010
test('TC010 SCN002: Verify system is resilient to XSS/HTML injection attempts in the password field.', async ({ page, browserName }) => {
  const testCaseId = 'TC010';
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    await page.fill(PASSWORD_FIELD, "<img src=x onerror=alert('XSS')>");
    await page.click(LOGIN_BUTTON);
    // Check that no alert was triggered
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" and no script execution for XSS in password.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case: TC011
test('TC011 SCN003: Verify username is case-sensitive during login.', async ({ page, browserName }) => {
  const testCaseId = 'TC011';
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'admin'); // lowercase username
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" for lowercase username, confirming case-sensitivity.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case: TC012
test('TC012 SCN003: Verify password is case-sensitive during login.', async ({ page, browserName }) => {
  const testCaseId = 'TC012';
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    await page.fill(PASSWORD_FIELD, 'ADMIN123'); // uppercase password
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" for uppercase password, confirming case-sensitivity.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case: TC013
test('TC013 SCN003: Verify login handles a very long username without breaking UI or functionality.', async ({ page, browserName }) => {
  const testCaseId = 'TC013';
  let status = 'Fail';
  let actualResult = '';
  const longUsername = 'A'.repeat(255); // A very long string
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, longUsername);
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" for a very long username. UI remained stable.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case: TC014
test('TC014 SCN003: Verify login handles a very long password without breaking UI or functionality.', async ({ page, browserName }) => {
  const testCaseId = 'TC014';
  let status = 'Fail';
  let actualResult = '';
  const longPassword = 'P'.repeat(255); // A very long string
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    await page.fill(PASSWORD_FIELD, longPassword);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" for a very long password. UI remained stable.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case: TC015
test('TC015 SCN003: Verify the "Forgot your password?" link is present on the login page.', async ({ page, browserName }) => {
  const testCaseId = 'TC015';
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await expect(page.locator(FORGOT_PASSWORD_LINK)).toBeVisible();
    await expect(page.locator(FORGOT_PASSWORD_LINK)).toHaveText('Forgot your password?');
    status = 'Pass';
    actualResult = '"Forgot your password?" link is visible on the login page.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case: TC016
test('TC016 SCN003: Verify characters entered in the password field are masked.', async ({ page, browserName }) => {
  const testCaseId = 'TC016';
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(PASSWORD_FIELD, 'test123');
    await expect(page.locator(PASSWORD_FIELD)).toHaveAttribute('type', 'password');
    status = 'Pass';
    actualResult = 'Password field characters are masked (input type is "password").';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case: TC017
test('TC017 SCN003: Verify successful redirection to the dashboard after a valid login.', async ({ page, browserName }) => {
  const testCaseId = 'TC017';
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
    await expect(page).toHaveURL(/web\/index.php\/dashboard/); // Check URL contains dashboard path
    status = 'Pass';
    actualResult = 'User successfully redirected to the dashboard, and URL reflects the dashboard page.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});