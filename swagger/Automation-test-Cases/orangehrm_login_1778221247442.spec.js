import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import * as path from 'path';
import * as fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Enable parallel execution for test blocks
test.describe.configure({ mode: 'parallel' });

// Helper function to write test results to a JSON file
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

// Constants for OrangeHRM login page
const ORANGEHRM_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
const VALID_USERNAME = 'Admin';
const VALID_PASSWORD = 'admin123';

// Selectors
const USERNAME_FIELD = 'input[name="username"]';
const PASSWORD_FIELD = 'input[name="password"]';
const LOGIN_BUTTON = 'button[type="submit"]';
const ERROR_MESSAGE = '.oxd-alert-content-text'; // For 'Invalid credentials'
const DASHBOARD_HEADER = '.oxd-topbar-header-breadcrumb'; // To verify successful login
const REQUIRED_ERROR_MESSAGE = 'span.oxd-text.oxd-text--span.oxd-input-field-error-message.oxd-input-group__message'; // For 'Required' field validation
const FORGOT_PASSWORD_LINK = 'a.oxd-text.oxd-text--p.orangehrm-login-forgot-forgot-link'; // For 'Forgot your password?' link

// Test Case ID: TC001
// Scenario ID: SCN001
// Description: Verify that a registered employee can successfully log in with valid username and password and is redirected to the dashboard.
test('TC001 SCN001 - Valid login with Admin credentials', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
    await expect(page).toHaveURL(/web\/index.php\/dashboard/);
    status = 'Pass';
    actualResult = 'User successfully logged in and redirected to the OrangeHRM Dashboard page.';
  } catch (error) {
    actualResult = `Login failed unexpectedly: ${error.message}`;
    throw error;
  } finally {
    await writeResult('TC001', browserName, status, actualResult);
  }
});

// Test Case ID: TC002
// Scenario ID: SCN002
// Description: Verify login fails with an invalid username and a valid password.
test('TC002 SCN002 - Login with invalid username, valid password', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'InvalidUser');
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    const errorMessage = page.locator(ERROR_MESSAGE);
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page
    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" error message for invalid username.';
  } catch (error) {
    actualResult = `Test failed unexpectedly: ${error.message}`;
    throw error;
  } finally {
    await writeResult('TC002', browserName, status, actualResult);
  }
});

// Test Case ID: TC003
// Scenario ID: SCN002
// Description: Verify login fails with a valid username and an invalid password.
test('TC003 SCN002 - Login with valid username, invalid password', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, 'invalidpass');
    await page.click(LOGIN_BUTTON);
    const errorMessage = page.locator(ERROR_MESSAGE);
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page
    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" error message for invalid password.';
  } catch (error) {
    actualResult = `Test failed unexpectedly: ${error.message}`;
    throw error;
  } finally {
    await writeResult('TC003', browserName, status, actualResult);
  }
});

// Test Case ID: TC004
// Scenario ID: SCN002
// Description: Verify login fails when both username and password fields are left empty.
test('TC004 SCN002 - Login with empty username and password', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.click(LOGIN_BUTTON); // Click login without filling fields
    const usernameRequiredMessage = page.locator(`${USERNAME_FIELD} + ${REQUIRED_ERROR_MESSAGE}`);
    const passwordRequiredMessage = page.locator(`${PASSWORD_FIELD} + ${REQUIRED_ERROR_MESSAGE}`);

    await expect(usernameRequiredMessage).toBeVisible();
    await expect(usernameRequiredMessage).toHaveText('Required');
    await expect(passwordRequiredMessage).toBeVisible();
    await expect(passwordRequiredMessage).toHaveText('Required');
    await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page

    status = 'Pass';
    actualResult = 'Validation messages "Required" displayed for both username and password fields.';
  } catch (error) {
    actualResult = `Test failed unexpectedly: ${error.message}`;
    throw error;
  } finally {
    await writeResult('TC004', browserName, status, actualResult);
  }
});

// Test Case ID: TC005
// Scenario ID: SCN002
// Description: Verify login fails when username is empty and password field is filled.
test('TC005 SCN002 - Login with empty username, filled password', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    // await page.fill(USERNAME_FIELD, ''); // Explicitly leave empty
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    const usernameRequiredMessage = page.locator(`${USERNAME_FIELD} + ${REQUIRED_ERROR_MESSAGE}`);

    await expect(usernameRequiredMessage).toBeVisible();
    await expect(usernameRequiredMessage).toHaveText('Required');
    await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page

    status = 'Pass';
    actualResult = 'Validation message "Required" displayed for the username field.';
  } catch (error) {
    actualResult = `Test failed unexpectedly: ${error.message}`;
    throw error;
  } finally {
    await writeResult('TC005', browserName, status, actualResult);
  }
});

// Test Case ID: TC006
// Scenario ID: SCN002
// Description: Verify login fails when username is filled and password field is empty.
test('TC006 SCN002 - Login with filled username, empty password', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    // await page.fill(PASSWORD_FIELD, ''); // Explicitly leave empty
    await page.click(LOGIN_BUTTON);
    const passwordRequiredMessage = page.locator(`${PASSWORD_FIELD} + ${REQUIRED_ERROR_MESSAGE}`);

    await expect(passwordRequiredMessage).toBeVisible();
    await expect(passwordRequiredMessage).toHaveText('Required');
    await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page

    status = 'Pass';
    actualResult = 'Validation message "Required" displayed for the password field.';
  } catch (error) {
    actualResult = `Test failed unexpectedly: ${error.message}`;
    throw error;
  } finally {
    await writeResult('TC006', browserName, status, actualResult);
  }
});

// Test Case ID: TC007
// Scenario ID: SCN003
// Description: Verify system handles SQL injection attempts in the username field without granting unauthorized access or error.
test('TC007 SCN003 - SQL injection attempt in username field', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, "' OR '1'='1' --");
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD); // Any value for password, as per instructions
    await page.click(LOGIN_BUTTON);
    const errorMessage = page.locator(ERROR_MESSAGE);
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page

    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" error message, indicating SQL injection attempt was handled.';
  } catch (error) {
    actualResult = `Test failed unexpectedly: ${error.message}`;
    throw error;
  } finally {
    await writeResult('TC007', browserName, status, actualResult);
  }
});

// Test Case ID: TC008
// Scenario ID: SCN003
// Description: Verify system handles SQL injection attempts in the password field without granting unauthorized access or error.
test('TC008 SCN003 - SQL injection attempt in password field', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, "' OR '1'='1' --");
    await page.click(LOGIN_BUTTON);
    const errorMessage = page.locator(ERROR_MESSAGE);
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page

    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" error message, indicating SQL injection attempt was handled.';
  } catch (error) {
    actualResult = `Test failed unexpectedly: ${error.message}`;
    throw error;
  } finally {
    await writeResult('TC008', browserName, status, actualResult);
  }
});

// Test Case ID: TC009
// Scenario ID: SCN003
// Description: Verify system prevents XSS/HTML injection in the username field.
test('TC009 SCN003 - XSS/HTML injection attempt in username field', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  // Set up dialog listener BEFORE actions that might trigger an XSS alert
  page.on('dialog', async dialog => {
    actualResult = `XSS script was executed: ${dialog.message}`;
    await dialog.dismiss();
    throw new Error('XSS script was executed (unexpected dialog appeared)');
  });

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, "<script>alert('XSS')</script>");
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    const errorMessage = page.locator(ERROR_MESSAGE);
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page

    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" error. No XSS alert was triggered.';
  } catch (error) {
    actualResult = `Test failed unexpectedly: ${actualResult || error.message}`;
    throw error;
  } finally {
    await writeResult('TC009', browserName, status, actualResult);
  }
});

// Test Case ID: TC010
// Scenario ID: SCN003
// Description: Verify system prevents XSS/HTML injection in the password field.
test('TC010 SCN003 - XSS/HTML injection attempt in password field', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  // Set up dialog listener BEFORE actions that might trigger an XSS alert
  page.on('dialog', async dialog => {
    actualResult = `XSS script was executed: ${dialog.message}`;
    await dialog.dismiss();
    throw new Error('XSS script was executed (unexpected dialog appeared)');
  });

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, "<img src=x onerror=alert('XSS')>");
    await page.click(LOGIN_BUTTON);
    const errorMessage = page.locator(ERROR_MESSAGE);
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page

    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" error. No XSS alert or broken image was triggered.';
  } catch (error) {
    actualResult = `Test failed unexpectedly: ${actualResult || error.message}`;
    throw error;
  } finally {
    await writeResult('TC010', browserName, status, actualResult);
  }
});

// Test Case ID: TC011
// Scenario ID: SCN004
// Description: Verify that the username field is case-sensitive.
test('TC011 SCN004 - Username field case-sensitivity', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME.toLowerCase()); // 'admin'
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    const errorMessage = page.locator(ERROR_MESSAGE);
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page

    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" error for lowercase username, confirming case-sensitivity.';
  } catch (error) {
    actualResult = `Test failed unexpectedly: ${error.message}`;
    throw error;
  } finally {
    await writeResult('TC011', browserName, status, actualResult);
  }
});

// Test Case ID: TC012
// Scenario ID: SCN004
// Description: Verify that the password field is case-sensitive.
test('TC012 SCN004 - Password field case-sensitivity', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD.replace('a', 'A')); // 'Admin123'
    await page.click(LOGIN_BUTTON);
    const errorMessage = page.locator(ERROR_MESSAGE);
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page

    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" error for case-modified password, confirming case-sensitivity.';
  } catch (error) {
    actualResult = `Test failed unexpectedly: ${error.message}`;
    throw error;
  } finally {
    await writeResult('TC012', browserName, status, actualResult);
  }
});

// Test Case ID: TC013
// Scenario ID: SCN004
// Description: Verify system handles very long usernames without breaking UI or causing errors.
test('TC013 SCN004 - Login with very long username', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    const longUsername = 'a'.repeat(255); // 255 characters
    await page.fill(USERNAME_FIELD, longUsername);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    const errorMessage = page.locator(ERROR_MESSAGE);
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page

    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" for a very long username. UI remained stable.';
  } catch (error) {
    actualResult = `Test failed unexpectedly: ${error.message}`;
    throw error;
  } finally {
    await writeResult('TC013', browserName, status, actualResult);
  }
});

// Test Case ID: TC014
// Scenario ID: SCN004
// Description: Verify system handles very long passwords without breaking UI or causing errors.
test('TC014 SCN004 - Login with very long password', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    const longPassword = 'a'.repeat(255); // 255 characters
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, longPassword);
    await page.click(LOGIN_BUTTON);
    const errorMessage = page.locator(ERROR_MESSAGE);
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page

    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" for a very long password. UI remained stable.';
  } catch (error) {
    actualResult = `Test failed unexpectedly: ${error.message}`;
    throw error;
  } finally {
    await writeResult('TC014', browserName, status, actualResult);
  }
});

// Test Case ID: TC015
// Scenario ID: SCN004
// Description: Verify that the 'Forgot your password?' link is present on the login page.
test('TC015 SCN004 - Forgot password link presence', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    const forgotPasswordLink = page.locator(FORGOT_PASSWORD_LINK);
    await expect(forgotPasswordLink).toBeVisible();
    await expect(forgotPasswordLink).toHaveText('Forgot your password?');
    status = 'Pass';
    actualResult = "'Forgot your password?' link is visible and clickable on the login page.";
  } catch (error) {
    actualResult = `Test failed unexpectedly: ${error.message}`;
    throw error;
  } finally {
    await writeResult('TC015', browserName, status, actualResult);
  }
});

// Test Case ID: TC016
// Scenario ID: SCN004
// Description: Verify that characters entered into the password field are masked (e.g., with asterisks or dots).
test('TC016 SCN004 - Password field masking', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_URL);
    const passwordInput = page.locator(PASSWORD_FIELD);
    // The standard way to verify masking is to check the input type attribute
    await expect(passwordInput).toHaveAttribute('type', 'password');
    // Optionally, fill to ensure functionality
    await passwordInput.fill('secret123');
    status = 'Pass';
    actualResult = "Characters in the password field are masked as expected (input type='password').";
  } catch (error) {
    actualResult = `Test failed unexpectedly: ${error.message}`;
    throw error;
  } finally {
    await writeResult('TC016', browserName, status, actualResult);
  }
});