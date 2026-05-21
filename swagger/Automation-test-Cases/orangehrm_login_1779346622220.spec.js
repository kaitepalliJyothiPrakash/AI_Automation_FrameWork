import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Global configuration for parallel execution
test.describe.configure({ mode: 'parallel' });

// Constants for OrangeHRM login page
const LOGIN_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
const VALID_USERNAME = 'Admin';
const VALID_PASSWORD = 'admin123';
const USERNAME_FIELD = 'input[name="username"]';
const PASSWORD_FIELD = 'input[name="password"]';
const LOGIN_BUTTON = 'button[type="submit"]';
const INVALID_CREDENTIALS_ERROR = '.oxd-alert-content-text'; // Selector for "Invalid credentials"
const DASHBOARD_HEADER = '.oxd-topbar-header-breadcrumb'; // Selector for Dashboard after login
const REQUIRED_FIELD_ERROR_CLASS = '.oxd-input-field-error-message'; // Class for "Required" field error messages

// Helper to get the "Required" error message locator for a specific field
function getRequiredErrorLocatorForField(page, fieldSelector) {
  // Finds the nearest ancestor with class "oxd-input-group" and then searches for the error message within it.
  return page.locator(fieldSelector).locator('xpath=./ancestor::div[contains(@class, "oxd-input-group")]').locator(REQUIRED_FIELD_ERROR_CLASS);
}

// Test Case ID: TC001
// Scenario ID: SCN001
// Description: Verify successful login with valid username and password.
test('TC001 - Verify successful login with valid username and password', async ({ page, browserName }) => {
  const testCaseId = 'TC001';
  let status = 'Fail';
  let actualResult = '';

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
    await expect(page.url()).toContain('/web/index.php/dashboard/index');
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).not.toBeVisible();

    status = 'Pass';
    actualResult = 'User successfully logged in and redirected to the dashboard without error messages.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC002
// Scenario ID: SCN001
// Description: Verify successful redirection to the dashboard after a valid login.
test('TC002 - Verify successful redirection to the dashboard after a valid login', async ({ page, browserName }) => {
  const testCaseId = 'TC002';
  let status = 'Fail';
  let actualResult = '';

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    await expect(page.url()).toContain('/web/index.php/dashboard/index');
    await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();

    status = 'Pass';
    actualResult = 'User was redirected to the dashboard URL and dashboard content is visible.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC003
// Scenario ID: SCN002
// Description: Verify login failure with an invalid username and valid password.
test('TC003 - Verify login failure with an invalid username and valid password', async ({ page, browserName }) => {
  const testCaseId = 'TC003';
  let status = 'Fail';
  let actualResult = '';

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, 'InvalidUser');
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toBeVisible();
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toHaveText('Invalid credentials');
    await expect(page.url()).toContain('/web/index.php/auth/login'); // Should remain on login page

    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" message and user remained on the login page.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC004
// Scenario ID: SCN002
// Description: Verify login failure with a valid username and invalid password.
test('TC004 - Verify login failure with a valid username and invalid password', async ({ page, browserName }) => {
  const testCaseId = 'TC004';
  let status = 'Fail';
  let actualResult = '';

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, 'invalidpass');
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toBeVisible();
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toHaveText('Invalid credentials');
    await expect(page.url()).toContain('/web/index.php/auth/login'); // Should remain on login page

    status = 'Pass';
    actualResult = 'Login failed with "Invalid credentials" message and user remained on the login page.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC005
// Scenario ID: SCN003
// Description: Verify login attempt with both username and password fields empty.
test('TC005 - Verify login attempt with both username and password fields empty', async ({ page, browserName }) => {
  const testCaseId = 'TC005';
  let status = 'Fail';
  let actualResult = '';

  try {
    await page.goto(LOGIN_URL);
    await page.click(LOGIN_BUTTON); // Click login with empty fields

    const usernameError = getRequiredErrorLocatorForField(page, USERNAME_FIELD);
    const passwordError = getRequiredErrorLocatorForField(page, PASSWORD_FIELD);

    await expect(usernameError).toBeVisible();
    await expect(usernameError).toHaveText('Required');
    await expect(passwordError).toBeVisible();
    await expect(passwordError).toHaveText('Required');
    await expect(page.url()).toContain('/web/index.php/auth/login'); // Should remain on login page

    status = 'Pass';
    actualResult = 'Validation messages "Required" displayed for both empty fields, and user remained on the login page.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC006
// Scenario ID: SCN003
// Description: Verify login attempt with an empty username and a filled password.
test('TC006 - Verify login attempt with an empty username and a filled password', async ({ page, browserName }) => {
  const testCaseId = 'TC006';
  let status = 'Fail';
  let actualResult = '';

  try {
    await page.goto(LOGIN_URL);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    const usernameError = getRequiredErrorLocatorForField(page, USERNAME_FIELD);
    const passwordError = getRequiredErrorLocatorForField(page, PASSWORD_FIELD); // Should not be visible

    await expect(usernameError).toBeVisible();
    await expect(usernameError).toHaveText('Required');
    await expect(passwordError).not.toBeVisible();
    await expect(page.url()).toContain('/web/index.php/auth/login'); // Should remain on login page

    status = 'Pass';
    actualResult = 'Validation message "Required" displayed for the empty username field, and user remained on the login page.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC007
// Scenario ID: SCN003
// Description: Verify login attempt with a filled username and an empty password.
test('TC007 - Verify login attempt with a filled username and an empty password', async ({ page, browserName }) => {
  const testCaseId = 'TC007';
  let status = 'Fail';
  let actualResult = '';

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.click(LOGIN_BUTTON);

    const usernameError = getRequiredErrorLocatorForField(page, USERNAME_FIELD); // Should not be visible
    const passwordError = getRequiredErrorLocatorForField(page, PASSWORD_FIELD);

    await expect(passwordError).toBeVisible();
    await expect(passwordError).toHaveText('Required');
    await expect(usernameError).not.toBeVisible();
    await expect(page.url()).toContain('/web/index.php/auth/login'); // Should remain on login page

    status = 'Pass';
    actualResult = 'Validation message "Required" displayed for the empty password field, and user remained on the login page.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC008
// Scenario ID: SCN004
// Description: Verify system's resilience to SQL injection in the username field.
test('TC008 - Verify system\'s resilience to SQL injection in the username field', async ({ page, browserName }) => {
  const testCaseId = 'TC008';
  let status = 'Fail';
  let actualResult = '';

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, "' OR 1=1 --");
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD); // Any password
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toBeVisible();
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toHaveText('Invalid credentials');
    await expect(page.url()).toContain('/web/index.php/auth/login'); // Should remain on login page

    status = 'Pass';
    actualResult = 'SQL injection attempt in username field resulted in "Invalid credentials" error, confirming resilience.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC009
// Scenario ID: SCN004
// Description: Verify system's resilience to SQL injection in the password field.
test('TC009 - Verify system\'s resilience to SQL injection in the password field', async ({ page, browserName }) => {
  const testCaseId = 'TC009';
  let status = 'Fail';
  let actualResult = '';

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, "' OR 1=1 --");
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toBeVisible();
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toHaveText('Invalid credentials');
    await expect(page.url()).toContain('/web/index.php/auth/login'); // Should remain on login page

    status = 'Pass';
    actualResult = 'SQL injection attempt in password field resulted in "Invalid credentials" error, confirming resilience.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC010
// Scenario ID: SCN004
// Description: Verify system's resilience to XSS/HTML injection in the username field.
test('TC010 - Verify system\'s resilience to XSS/HTML injection in the username field', async ({ page, browserName }) => {
  const testCaseId = 'TC010';
  let status = 'Fail';
  let actualResult = '';

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, "<script>alert('XSS');</script>");
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    // Expect no alert to appear; Playwright handles alerts by default without blocking.
    // The main assertion is that login fails with expected error message.
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toBeVisible();
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toHaveText('Invalid credentials');
    await expect(page.url()).toContain('/web/index.php/auth/login'); // Should remain on login page

    status = 'Pass';
    actualResult = 'XSS injection attempt in username field resulted in "Invalid credentials" error, no script execution observed.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC011
// Scenario ID: SCN004
// Description: Verify system's resilience to XSS/HTML injection in the password field.
test('TC011 - Verify system\'s resilience to XSS/HTML injection in the password field', async ({ page, browserName }) => {
  const testCaseId = 'TC011';
  let status = 'Fail';
  let actualResult = '';

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, "<img src=x onerror=alert('XSS')>");
    await page.click(LOGIN_BUTTON);

    // Expect no alert or broken image.
    // The main assertion is that login fails with expected error message.
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toBeVisible();
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toHaveText('Invalid credentials');
    await expect(page.url()).toContain('/web/index.php/auth/login'); // Should remain on login page

    status = 'Pass';
    actualResult = 'XSS injection attempt in password field resulted in "Invalid credentials" error, no script/image execution observed.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC012
// Scenario ID: SCN005
// Description: Verify username case sensitivity (e.g., 'admin' vs 'Admin').
test('TC012 - Verify username case sensitivity', async ({ page, browserName }) => {
  const testCaseId = 'TC012';
  let status = 'Fail';
  let actualResult = '';

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, 'admin'); // Lowercase 'a'
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toBeVisible();
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toHaveText('Invalid credentials');
    await expect(page.url()).toContain('/web/index.php/auth/login'); // Should remain on login page

    status = 'Pass';
    actualResult = 'Login failed with lowercase username, confirming username case sensitivity.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC013
// Scenario ID: SCN005
// Description: Verify password case sensitivity.
test('TC013 - Verify password case sensitivity', async ({ page, browserName }) => {
  const testCaseId = 'TC013';
  let status = 'Fail';
  let actualResult = '';

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, 'ADMIN123'); // Uppercase password
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toBeVisible();
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toHaveText('Invalid credentials');
    await expect(page.url()).toContain('/web/index.php/auth/login'); // Should remain on login page

    status = 'Pass';
    actualResult = 'Login failed with uppercase password, confirming password case sensitivity.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC014
// Scenario ID: SCN006
// Description: Verify login with a very long username using valid credentials.
test('TC014 - Verify login with a very long username using valid credentials', async ({ page, browserName }) => {
  const testCaseId = 'TC014';
  let status = 'Fail';
  let actualResult = '';
  const longUsername = VALID_USERNAME + 'a'.repeat(250); // Admin + 250 'a'

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, longUsername);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    // OrangeHRM login page typically responds with "Invalid credentials" for any invalid input,
    // including too long inputs that don't match stored user data.
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toBeVisible();
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toHaveText('Invalid credentials');
    await expect(page.url()).toContain('/web/index.php/auth/login');

    status = 'Pass';
    actualResult = 'Login failed with a very long username, resulting in "Invalid credentials" error, handled gracefully.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC015
// Scenario ID: SCN006
// Description: Verify login with a very long password using valid username.
test('TC015 - Verify login with a very long password using valid username', async ({ page, browserName }) => {
  const testCaseId = 'TC015';
  let status = 'Fail';
  let actualResult = '';
  const longPassword = VALID_PASSWORD + 'a'.repeat(250); // admin123 + 250 'a'

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, longPassword);
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toBeVisible();
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toHaveText('Invalid credentials');
    await expect(page.url()).toContain('/web/index.php/auth/login');

    status = 'Pass';
    actualResult = 'Login failed with a very long password, resulting in "Invalid credentials" error, handled gracefully.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC016
// Scenario ID: SCN006
// Description: Verify login with an excessively long invalid username.
test('TC016 - Verify login with an excessively long invalid username', async ({ page, browserName }) => {
  const testCaseId = 'TC016';
  let status = 'Fail';
  let actualResult = '';
  const excessivelyLongUsername = 'a'.repeat(500);

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, excessivelyLongUsername);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toBeVisible();
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toHaveText('Invalid credentials');
    await expect(page.url()).toContain('/web/index.php/auth/login');

    status = 'Pass';
    actualResult = 'Login failed with an excessively long invalid username, resulting in "Invalid credentials" error, handled gracefully.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC017
// Scenario ID: SCN006
// Description: Verify login with an excessively long invalid password.
test('TC017 - Verify login with an excessively long invalid password', async ({ page, browserName }) => {
  const testCaseId = 'TC017';
  let status = 'Fail';
  let actualResult = '';
  const excessivelyLongPassword = 'a'.repeat(500);

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, excessivelyLongPassword);
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toBeVisible();
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toHaveText('Invalid credentials');
    await expect(page.url()).toContain('/web/index.php/auth/login');

    status = 'Pass';
    actualResult = 'Login failed with an excessively long invalid password, resulting in "Invalid credentials" error, handled gracefully.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC018
// Scenario ID: SCN007
// Description: Verify 'Required' or 'Username cannot be empty' validation message.
test('TC018 - Verify "Required" validation message for empty username', async ({ page, browserName }) => {
  const testCaseId = 'TC018';
  let status = 'Fail';
  let actualResult = '';

  try {
    await page.goto(LOGIN_URL);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    const usernameError = getRequiredErrorLocatorForField(page, USERNAME_FIELD);

    await expect(usernameError).toBeVisible();
    await expect(usernameError).toHaveText('Required');
    await expect(page.url()).toContain('/web/index.php/auth/login');

    status = 'Pass';
    actualResult = 'Username field displayed "Required" validation message when left empty.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC019
// Scenario ID: SCN007
// Description: Verify 'Required' or 'Password cannot be empty' validation message.
test('TC019 - Verify "Required" validation message for empty password', async ({ page, browserName }) => {
  const testCaseId = 'TC019';
  let status = 'Fail';
  let actualResult = '';

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.click(LOGIN_BUTTON);

    const passwordError = getRequiredErrorLocatorForField(page, PASSWORD_FIELD);

    await expect(passwordError).toBeVisible();
    await expect(passwordError).toHaveText('Required');
    await expect(page.url()).toContain('/web/index.php/auth/login');

    status = 'Pass';
    actualResult = 'Password field displayed "Required" validation message when left empty.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC020
// Scenario ID: SCN007
// Description: Verify the 'Invalid credentials' error message for incorrect login attempts.
test('TC020 - Verify the "Invalid credentials" error message for incorrect login attempts', async ({ page, browserName }) => {
  const testCaseId = 'TC020';
  let status = 'Fail';
  let actualResult = '';

  try {
    await page.goto(LOGIN_URL);
    await page.fill(USERNAME_FIELD, 'NonExistentUser');
    await page.fill(PASSWORD_FIELD, 'IncorrectPass');
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toBeVisible();
    await expect(page.locator(INVALID_CREDENTIALS_ERROR)).toHaveText('Invalid credentials');
    await expect(page.url()).toContain('/web/index.php/auth/login');

    status = 'Pass';
    actualResult = '"Invalid credentials" error message displayed for incorrect login attempt.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC021
// Scenario ID: SCN007
// Description: Verify the presence and functionality of the 'Forgot your password?' link.
test('TC021 - Verify the presence and functionality of the "Forgot your password?" link', async ({ page, browserName }) => {
  const testCaseId = 'TC021';
  let status = 'Fail';
  let actualResult = '';
  const forgotPasswordLink = page.locator('p.oxd-text.oxd-text--p.orangehrm-login-forgot-header'); // Selector for 'Forgot your password?' link

  try {
    await page.goto(LOGIN_URL);

    await expect(forgotPasswordLink).toBeVisible();
    await expect(forgotPasswordLink).toHaveText('Forgot your password?');
    await forgotPasswordLink.click();

    await expect(page.url()).toContain('/web/index.php/auth/requestPasswordReset');
    await expect(page.locator('h6.oxd-text--h6')).toHaveText('Reset Password'); // Verify redirection to reset password page

    status = 'Pass';
    actualResult = '"Forgot your password?" link is visible, clickable, and redirects to the password reset page.';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});

// Test Case ID: TC022
// Scenario ID: SCN007
// Description: Verify password field masking.
test('TC022 - Verify password field masking', async ({ page, browserName }) => {
  const testCaseId = 'TC022';
  let status = 'Fail';
  let actualResult = '';
  const testPassword = 'mysecretpassword123';

  try {
    await page.goto(LOGIN_URL);
    await page.fill(PASSWORD_FIELD, testPassword);

    // Check the 'type' attribute of the password field
    const passwordFieldType = await page.locator(PASSWORD_FIELD).getAttribute('type');
    await expect(passwordFieldType).toBe('password');

    status = 'Pass';
    actualResult = 'Characters entered into the password field are masked (type="password").';
  } catch (error) {
    actualResult = error.message;
    await writeResult(testCaseId, browserName, 'Fail', actualResult);
    throw error;
  }
  await writeResult(testCaseId, browserName, status, actualResult);
});