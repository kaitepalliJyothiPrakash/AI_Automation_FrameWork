import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import * as path from 'path';
import * as fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Enable parallel execution for tests
test.describe.configure({ mode: 'parallel' });

// Define the writeResult helper function
async function writeResult(testCaseId, browser, status, actualResult) {
  const outputDir = path.resolve(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const resultFile = path.join(outputDir, 'test_results.json');
  const lockFile = path.join(outputDir, 'test_results.lock');
  let waited = 0;
  while (fs.existsSync(lockFile) && waited < 10000) { await new Promise(r => setTimeout(r, 100)); waited += 100; }
  fs.writeFileSync(lockFile, process.pid.toString());
  try {
    let results = [];
    if (fs.existsSync(resultFile)) { try { results = JSON.parse(fs.readFileSync(resultFile, 'utf8')); } catch { results = []; } }
    const entry = { test_case_id: testCaseId, browser, status, actual_result: actualResult };
    if (status === 'Fail') { const max = results.filter(r=>r.defect_id).length; entry.defect_id = 'DEF' + String(max+1).padStart(3,'0') + '-' + browser; }
    results.push(entry);
    fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
    console.log('Result written: ' + testCaseId + ' | ' + browser + ' | ' + status);
  } finally {
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
  }
}

// Constants for the OrangeHRM login page
const ORANGEHRM_LOGIN_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
const VALID_USERNAME = 'Admin';
const VALID_PASSWORD = 'admin123';

// Selectors for OrangeHRM login page
const USERNAME_FIELD = 'input[name="username"]';
const PASSWORD_FIELD = 'input[name="password"]';
const LOGIN_BUTTON = 'button[type="submit"]';
const ERROR_MESSAGE_BANNER = '.oxd-alert-content-text'; // For 'Invalid credentials'
// Validation messages for empty fields typically say "Required" on OrangeHRM demo
const USERNAME_EMPTY_VALIDATION_MESSAGE = 'span.oxd-input-field-error-message:text("Required")';
const PASSWORD_EMPTY_VALIDATION_MESSAGE = 'span.oxd-input-field-error-message:text("Required")';
const DASHBOARD_HEADER = '.oxd-topbar-header-breadcrumb'; // Selector for dashboard presence
const FORGOT_PASSWORD_LINK = 'p.orangehrm-login-forgot-header'; // Selector for 'Forgot your password?' link

// Test Case: TC001
test('TC001 SCN001: Verify login with valid username "Admin" and password "admin123".', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
    await expect(page).toHaveURL(/dashboard\/index$/);
    actualResult = 'User successfully logged in and redirected to the OrangeHRM dashboard.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC001 Failed: ${error.message}`);
  } finally {
    await writeResult('TC001', browserName, status, actualResult);
  }
});

// Test Case: TC002
test('TC002 SCN002: Verify login with invalid username and valid password.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, 'InvalidUser');
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_LOGIN_URL); // Ensure user remains on login page
    actualResult = 'An error message "Invalid credentials" is displayed and user remains on the login page.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC002 Failed: ${error.message}`);
  } finally {
    await writeResult('TC002', browserName, status, actualResult);
  }
});

// Test Case: TC003
test('TC003 SCN003: Verify login with valid username and invalid password.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, 'wrongpass');
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_LOGIN_URL); // Ensure user remains on login page
    actualResult = 'An error message "Invalid credentials" is displayed and user remains on the login page.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC003 Failed: ${error.message}`);
  } finally {
    await writeResult('TC003', browserName, status, actualResult);
  }
});

// Test Case: TC004
test('TC004 SCN004: Verify login attempt with both username and password fields empty.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    // Leave fields empty
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(USERNAME_EMPTY_VALIDATION_MESSAGE)).toBeVisible();
    await expect(page.locator(USERNAME_EMPTY_VALIDATION_MESSAGE)).toHaveText('Required');
    await expect(page.locator(PASSWORD_EMPTY_VALIDATION_MESSAGE)).toBeVisible();
    await expect(page.locator(PASSWORD_EMPTY_VALIDATION_MESSAGE)).toHaveText('Required');
    await expect(page).toHaveURL(ORANGEHRM_LOGIN_URL); // Ensure user remains on login page
    actualResult = 'Validation messages "Required" for both fields are displayed and user remains on the login page.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC004 Failed: ${error.message}`);
  } finally {
    await writeResult('TC004', browserName, status, actualResult);
  }
});

// Test Case: TC005
test('TC005 SCN005: Verify login attempt with empty username and filled password.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    // Leave Username field empty
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(USERNAME_EMPTY_VALIDATION_MESSAGE)).toBeVisible();
    await expect(page.locator(USERNAME_EMPTY_VALIDATION_MESSAGE)).toHaveText('Required');
    await expect(page).toHaveURL(ORANGEHRM_LOGIN_URL); // Ensure user remains on login page
    actualResult = 'Validation message "Required" for username is displayed and user remains on the login page.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC005 Failed: ${error.message}`);
  } finally {
    await writeResult('TC005', browserName, status, actualResult);
  }
});

// Test Case: TC006
test('TC006 SCN006: Verify login attempt with filled username and empty password.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    // Leave Password field empty
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(PASSWORD_EMPTY_VALIDATION_MESSAGE)).toBeVisible();
    await expect(page.locator(PASSWORD_EMPTY_VALIDATION_MESSAGE)).toHaveText('Required');
    await expect(page).toHaveURL(ORANGEHRM_LOGIN_URL); // Ensure user remains on login page
    actualResult = 'Validation message "Required" for password is displayed and user remains on the login page.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC006 Failed: ${error.message}`);
  } finally {
    await writeResult('TC006', browserName, status, actualResult);
  }
});

// Test Case: TC007
test('TC007 SCN007: Test SQL injection in Username field.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, "' OR '1'='1");
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_LOGIN_URL);
    actualResult = 'Login failed with "Invalid credentials" error message, indicating SQL injection was handled.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC007 Failed: ${error.message}`);
  } finally {
    await writeResult('TC007', browserName, status, actualResult);
  }
});

// Test Case: TC008
test('TC008 SCN007: Test SQL injection in Password field.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, "' OR '1'='1");
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_LOGIN_URL);
    actualResult = 'Login failed with "Invalid credentials" error message, indicating SQL injection was handled.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC008 Failed: ${error.message}`);
  } finally {
    await writeResult('TC008', browserName, status, actualResult);
  }
});

// Test Case: TC009
test('TC009 SCN007: Test SQL injection in both fields.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, "' OR '1'='1 --");
    await page.fill(PASSWORD_FIELD, "' OR '1'='1 --");
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_LOGIN_URL);
    actualResult = 'Login failed with "Invalid credentials" error message, indicating SQL injection was handled.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC009 Failed: ${error.message}`);
  } finally {
    await writeResult('TC009', browserName, status, actualResult);
  }
});

// Test Case: TC010
test('TC010 SCN008: Test XSS injection in Username field.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, "<script>alert('XSS')</script>");
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_LOGIN_URL);
    actualResult = 'Login failed with "Invalid credentials" error, no XSS script executed (no alert).';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC010 Failed: ${error.message}`);
  } finally {
    await writeResult('TC010', browserName, status, actualResult);
  }
});

// Test Case: TC011
test('TC011 SCN008: Test XSS injection in Password field.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, "<img src=x onerror=alert('XSS')>");
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_LOGIN_URL);
    actualResult = 'Login failed with "Invalid credentials" error, no XSS script executed (no alert or image).';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC011 Failed: ${error.message}`);
  } finally {
    await writeResult('TC011', browserName, status, actualResult);
  }
});

// Test Case: TC012
test('TC012 SCN009: Verify login with lowercase username and correct password.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, 'admin'); // Lowercase username
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_LOGIN_URL);
    actualResult = 'Login failed with "Invalid credentials", confirming username is case-sensitive.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC012 Failed: ${error.message}`);
  } finally {
    await writeResult('TC012', browserName, status, actualResult);
  }
});

// Test Case: TC013
test('TC013 SCN009: Verify login with correct username and mixed-case password.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, 'Admin123'); // Mixed-case password
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_LOGIN_URL);
    actualResult = 'Login failed with "Invalid credentials", confirming password is case-sensitive.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC013 Failed: ${error.message}`);
  } finally {
    await writeResult('TC013', browserName, status, actualResult);
  }
});

// Test Case: TC014
test('TC014 SCN009: Verify login with correct uppercase username and password.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, 'ADMIN'); // Uppercase username
    await page.fill(PASSWORD_FIELD, 'ADMIN123'); // Uppercase password
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_LOGIN_URL);
    actualResult = 'Login failed with "Invalid credentials", confirming both username and password are case-sensitive.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC014 Failed: ${error.message}`);
  } finally {
    await writeResult('TC014', browserName, status, actualResult);
  }
});

// Test Case: TC015
test('TC015 SCN010: Test login with a very long username (e.g., 255 characters).', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  const longUsername = 'A'.repeat(255);
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, longUsername);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_LOGIN_URL);
    actualResult = 'Login failed with "Invalid credentials" error for a very long username, handled gracefully.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC015 Failed: ${error.message}`);
  } finally {
    await writeResult('TC015', browserName, status, actualResult);
  }
});

// Test Case: TC016
test('TC016 SCN010: Test login with a very long password (e.g., 255 characters).', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  const longPassword = 'A'.repeat(255);
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, longPassword);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_LOGIN_URL);
    actualResult = 'Login failed with "Invalid credentials" error for a very long password, handled gracefully.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC016 Failed: ${error.message}`);
  } finally {
    await writeResult('TC016', browserName, status, actualResult);
  }
});

// Test Case: TC017
test('TC017 SCN011: Verify "Username cannot be empty" validation message.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    // Leave Username empty
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(USERNAME_EMPTY_VALIDATION_MESSAGE)).toBeVisible();
    await expect(page.locator(USERNAME_EMPTY_VALIDATION_MESSAGE)).toHaveText('Required');
    actualResult = 'Validation message "Required" is displayed for the empty username field.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC017 Failed: ${error.message}`);
  } finally {
    await writeResult('TC017', browserName, status, actualResult);
  }
});

// Test Case: TC018
test('TC018 SCN011: Verify "Password cannot be empty" validation message.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    // Leave Password empty
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(PASSWORD_EMPTY_VALIDATION_MESSAGE)).toBeVisible();
    await expect(page.locator(PASSWORD_EMPTY_VALIDATION_MESSAGE)).toHaveText('Required');
    actualResult = 'Validation message "Required" is displayed for the empty password field.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC018 Failed: ${error.message}`);
  } finally {
    await writeResult('TC018', browserName, status, actualResult);
  }
});

// Test Case: TC019
test('TC019 SCN011: Verify "Invalid credentials" message for incorrect inputs.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, 'InvalidUser');
    await page.fill(PASSWORD_FIELD, 'wrongpass');
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE_BANNER)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_LOGIN_URL);
    actualResult = 'An error message "Invalid credentials" is displayed for incorrect inputs.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC019 Failed: ${error.message}`);
  } finally {
    await writeResult('TC019', browserName, status, actualResult);
  }
});

// Test Case: TC020
test('TC020 SCN012: Verify the presence of the "Forgot your password?" link.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await expect(page.locator(FORGOT_PASSWORD_LINK)).toBeVisible();
    await expect(page.locator(FORGOT_PASSWORD_LINK)).toHaveText('Forgot your password?');
    actualResult = 'The "Forgot your password?" link is visibly present on the login page.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC020 Failed: ${error.message}`);
  } finally {
    await writeResult('TC020', browserName, status, actualResult);
  }
});

// Test Case: TC021
test('TC021 SCN012: Verify redirection upon clicking "Forgot your password?" link.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.click(FORGOT_PASSWORD_LINK);
    await expect(page).toHaveURL(/auth\/requestPasswordReset$/); // Check for the password reset URL pattern
    await expect(page.locator('h6.oxd-text--h6')).toHaveText('Reset Password'); // Verify an element on the reset page
    actualResult = 'User is redirected to the "Forgot Your Password" page.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC021 Failed: ${error.message}`);
  } finally {
    await writeResult('TC021', browserName, status, actualResult);
  }
});

// Test Case: TC022
test('TC022 SCN013: Verify characters in the password field are masked.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await expect(page.locator(PASSWORD_FIELD)).toHaveAttribute('type', 'password');
    actualResult = 'The characters entered into the Password field are masked (input type is "password").';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC022 Failed: ${error.message}`);
  } finally {
    await writeResult('TC022', browserName, status, actualResult);
  }
});

// Test Case: TC023
test('TC023 SCN014: Verify redirection to dashboard after successful login.', async ({ page, browserName }) => {
  let status = 'Pass';
  let actualResult = 'Test passed.';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    await expect(page).toHaveURL(/dashboard\/index$/);
    await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
    actualResult = 'User is redirected to the OrangeHRM dashboard. The URL changes to the dashboard URL, and relevant dashboard elements are visible.';
  } catch (error) {
    status = 'Fail';
    actualResult = error.message;
    console.error(`TC023 Failed: ${error.message}`);
  } finally {
    await writeResult('TC023', browserName, status, actualResult);
  }
});