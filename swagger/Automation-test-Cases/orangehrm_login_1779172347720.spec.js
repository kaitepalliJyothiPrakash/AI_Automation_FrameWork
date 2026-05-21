import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Constants for OrangeHRM login page
const ORANGEHRM_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
const VALID_USERNAME = 'Admin';
const VALID_PASSWORD = 'admin123';

// Selectors
const USERNAME_FIELD = 'input[name="username"]';
const PASSWORD_FIELD = 'input[name="password"]';
const LOGIN_BUTTON = 'button[type="submit"]';
const ERROR_MESSAGE = '.oxd-alert-content-text'; // General error message (e.g., Invalid credentials)
const DASHBOARD_HEADER = '.oxd-topbar-header-breadcrumb'; // Element on dashboard after successful login
const FIELD_ERROR_MESSAGE = '.oxd-input-field-error-message'; // Field-specific validation messages (e.g., Required)

// TC001 SCN001: Verify that a registered employee can successfully log in using valid username 'Admin' and password 'admin123'.
test('TC001 SCN001: Verify successful login with valid credentials', async ({ page, browserName }) => {
  const testCaseId = 'TC001';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
    await expect(page).toHaveURL(/web\/index.php\/dashboard\/index/);
    actualResult = 'User successfully logged in and redirected to the OrangeHRM dashboard.';
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC002 SCN002: Verify that login fails and an 'Invalid credentials' message is displayed when an incorrect username is provided.
test('TC002 SCN002: Verify login fails with incorrect username', async ({ page, browserName }) => {
  const testCaseId = 'TC002';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'InvalidUser');
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL); // Ensure user remains on login page
    actualResult = "Login failed and an 'Invalid credentials' message was displayed as expected.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC003 SCN002: Verify that login fails and an 'Invalid credentials' message is displayed when an incorrect password is provided for a valid username.
test('TC003 SCN002: Verify login fails with incorrect password for valid username', async ({ page, browserName }) => {
  const testCaseId = 'TC003';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, 'wrongpassword');
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL);
    actualResult = "Login failed and an 'Invalid credentials' message was displayed due to incorrect password.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC004 SCN002: Verify that login fails and an 'Invalid credentials' message is displayed when both an incorrect username and password are provided.
test('TC004 SCN002: Verify login fails with both incorrect username and password', async ({ page, browserName }) => {
  const testCaseId = 'TC004';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'nonexistent');
    await page.fill(PASSWORD_FIELD, 'wrongpassword');
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL);
    actualResult = "Login failed and an 'Invalid credentials' message was displayed for both incorrect username and password.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC005 SCN003: Verify login fails and appropriate validation messages are shown when both username and password fields are left empty.
test('TC005 SCN003: Verify login fails with empty username and password', async ({ page, browserName }) => {
  const testCaseId = 'TC005';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.click(LOGIN_BUTTON); // Click without filling fields

    await expect(page.locator(FIELD_ERROR_MESSAGE).nth(0)).toBeVisible();
    await expect(page.locator(FIELD_ERROR_MESSAGE).nth(0)).toHaveText('Required');
    await expect(page.locator(FIELD_ERROR_MESSAGE).nth(1)).toBeVisible();
    await expect(page.locator(FIELD_ERROR_MESSAGE).nth(1)).toHaveText('Required');
    await expect(page).toHaveURL(ORANGEHRM_URL);
    actualResult = "'Username cannot be empty' and 'Password cannot be empty' error messages were displayed.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC006 SCN003: Verify login fails and 'Username cannot be empty' validation message is shown when the username field is empty and password is provided.
test('TC006 SCN003: Verify login fails with empty username and valid password', async ({ page, browserName }) => {
  const testCaseId = 'TC006';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD); // Only fill password
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(FIELD_ERROR_MESSAGE).first()).toBeVisible();
    await expect(page.locator(FIELD_ERROR_MESSAGE).first()).toHaveText('Required');
    await expect(page).toHaveURL(ORANGEHRM_URL);
    actualResult = "'Username cannot be empty' error message was displayed.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC007 SCN003: Verify login fails and 'Password cannot be empty' validation message is shown when the password field is empty and username is provided.
test('TC007 SCN003: Verify login fails with valid username and empty password', async ({ page, browserName }) => {
  const testCaseId = 'TC007';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME); // Only fill username
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(FIELD_ERROR_MESSAGE).first()).toBeVisible();
    await expect(page.locator(FIELD_ERROR_MESSAGE).first()).toHaveText('Required');
    await expect(page).toHaveURL(ORANGEHRM_URL);
    actualResult = "'Password cannot be empty' error message was displayed.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC008 SCN004: Verify the system is resilient against SQL injection attempts in the username field.
test('TC008 SCN004: Verify system resilience against SQL injection in username', async ({ page, browserName }) => {
  const testCaseId = 'TC008';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, "' OR '1'='1");
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL);
    actualResult = "Login failed with 'Invalid credentials' for SQL injection in username, demonstrating resilience.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC009 SCN004: Verify the system is resilient against SQL injection attempts in the password field.
test('TC009 SCN004: Verify system resilience against SQL injection in password', async ({ page, browserName }) => {
  const testCaseId = 'TC009';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, "' OR '1'='1");
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL);
    actualResult = "Login failed with 'Invalid credentials' for SQL injection in password, demonstrating resilience.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC010 SCN004: Verify that the system sanitizes or encodes user input to prevent XSS/HTML injection in the username field.
test('TC010 SCN004: Verify XSS/HTML injection prevention in username field', async ({ page, browserName }) => {
  const testCaseId = 'TC010';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, "<script>alert('XSS')</script>");
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);

    // Monitor for dialogs (like alert boxes) to ensure XSS is not executed
    const dialogPromise = new Promise(resolve => page.once('dialog', dialog => {
      dialog.dismiss().catch(() => {}); // Dismiss dialog if it appears to not block test
      resolve(true);
    }));

    await page.click(LOGIN_BUTTON);

    // Give a short grace period for any potential alert to appear
    const alertAppeared = await Promise.race([dialogPromise, new Promise(resolve => setTimeout(() => resolve(false), 2000))]);

    expect(alertAppeared).toBe(false, 'An XSS alert dialog should not appear from username field.');
    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL);
    actualResult = "Login failed with 'Invalid credentials', and no XSS alert was triggered from username field.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC011 SCN004: Verify that the system sanitizes or encodes user input to prevent XSS/HTML injection in the password field.
test('TC011 SCN004: Verify XSS/HTML injection prevention in password field', async ({ page, browserName }) => {
  const testCaseId = 'TC011';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, "<img src=x onerror=alert('XSS')>");

    const dialogPromise = new Promise(resolve => page.once('dialog', dialog => {
      dialog.dismiss().catch(() => {});
      resolve(true);
    }));

    await page.click(LOGIN_BUTTON);

    const alertAppeared = await Promise.race([dialogPromise, new Promise(resolve => setTimeout(() => resolve(false), 2000))]);

    expect(alertAppeared).toBe(false, 'An XSS alert dialog should not appear from password field.');
    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL);
    actualResult = "Login failed with 'Invalid credentials', and no XSS alert was triggered from password field.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC012 SCN005: Verify that the username field is case-sensitive, rejecting logins with incorrect casing for a valid username.
test('TC012 SCN005: Verify username field is case-sensitive', async ({ page, browserName }) => {
  const testCaseId = 'TC012';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'admin'); // Lowercase 'admin'
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL);
    actualResult = 'Login failed due to case-sensitive username as expected.';
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC013 SCN005: Verify that the password field is case-sensitive, rejecting logins with incorrect casing for a valid password.
test('TC013 SCN005: Verify password field is case-sensitive', async ({ page, browserName }) => {
  const testCaseId = 'TC013';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, 'Admin123'); // Capital 'A' in password
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL);
    actualResult = 'Login failed due to case-sensitive password as expected.';
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC014 SCN005: Verify that the system handles very long usernames gracefully without crashing or unexpected behavior.
test('TC014 SCN005: Verify system handles very long usernames gracefully', async ({ page, browserName }) => {
  const testCaseId = 'TC014';
  let status = 'Pass';
  let actualResult = '';
  const longUsername = 'a'.repeat(256); // A string of 256 'a' characters

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, longUsername);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL);
    actualResult = 'Login failed gracefully with a very long username, without crashing or unexpected behavior.';
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC015 SCN005: Verify that the system handles very long passwords gracefully without crashing or unexpected behavior.
test('TC015 SCN005: Verify system handles very long passwords gracefully', async ({ page, browserName }) => {
  const testCaseId = 'TC015';
  let status = 'Pass';
  let actualResult = '';
  const longPassword = 'p'.repeat(256); // A string of 256 'p' characters

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, longPassword);
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL);
    actualResult = 'Login failed gracefully with a very long password, without crashing or unexpected behavior.';
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC016 SCN006: Verify that specific UI validation messages are displayed correctly for empty input fields and incorrect credentials.
test('TC016 SCN006: Verify UI validation messages for empty and incorrect credentials', async ({ page, browserName }) => {
  const testCaseId = 'TC016';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    // Step 2: Click Login without entering any credentials.
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(FIELD_ERROR_MESSAGE).nth(0)).toBeVisible();
    await expect(page.locator(FIELD_ERROR_MESSAGE).nth(0)).toHaveText('Required');
    await expect(page.locator(FIELD_ERROR_MESSAGE).nth(1)).toBeVisible();
    await expect(page.locator(FIELD_ERROR_MESSAGE).nth(1)).toHaveText('Required');

    // Step 3 & 4: Enter 'invalid' in both fields and click Login again.
    await page.fill(USERNAME_FIELD, 'invalid');
    await page.fill(PASSWORD_FIELD, 'invalid');
    await page.click(LOGIN_BUTTON);

    // After entering credentials and submitting, field-specific 'Required' messages should disappear
    await expect(page.locator(FIELD_ERROR_MESSAGE).nth(0)).not.toBeVisible();
    await expect(page.locator(FIELD_ERROR_MESSAGE).nth(1)).not.toBeVisible();

    // The general 'Invalid credentials' message should now be displayed
    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL);

    actualResult = "Correct validation messages displayed initially for empty fields, then replaced by 'Invalid credentials' message.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC017 SCN006: Verify that the 'Forgot your password?' link is present on the login page and redirects to the password recovery page.
test('TC017 SCN006: Verify "Forgot your password?" link redirects', async ({ page, browserName }) => {
  const testCaseId = 'TC017';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    const forgotPasswordLink = page.locator('a.orangehrm-login-forgot-link');
    await expect(forgotPasswordLink).toBeVisible();
    await expect(forgotPasswordLink).toHaveText('Forgot your password?');
    
    await forgotPasswordLink.click();

    await expect(page).toHaveURL(/web\/index.php\/auth\/requestPasswordReset/);
    await expect(page.locator('h6.orangehrm-forgot-password-title')).toBeVisible();
    await expect(page.locator('h6.orangehrm-forgot-password-title')).toHaveText('Reset Password');
    actualResult = "'Forgot your password?' link was visible, clickable, and successfully redirected to the password recovery page.";
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC018 SCN006: Verify that the password entered in the password field is masked (e.g., with asterisks or dots) for security.
test('TC018 SCN006: Verify password field input is masked', async ({ page, browserName }) => {
  const testCaseId = 'TC018';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(PASSWORD_FIELD, 'testpassword');

    await expect(page.locator(PASSWORD_FIELD)).toHaveAttribute('type', 'password');
    // Note: Playwright checks the 'type' attribute to confirm masking. It does not
    // visually inspect rendered characters for asterisks or dots.
    actualResult = 'Password field input is correctly masked (input type="password").';
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// TC019 SCN006: Verify that upon successful login, the user is correctly redirected to the expected post-login page (e.g., the dashboard).
test('TC019 SCN006: Verify correct redirection to dashboard after successful login', async ({ page, browserName }) => {
  const testCaseId = 'TC019';
  let status = 'Pass';
  let actualResult = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
    await expect(page).toHaveURL(/web\/index.php\/dashboard\/index/);

    // Verify back button behavior: should not return to login page if session is active
    await page.goBack();
    await expect(page).toHaveURL(/web\/index.php\/dashboard\/index/); // Should remain on dashboard
    await expect(page).not.toHaveURL(ORANGEHRM_URL); // Ensure it's not the login page

    actualResult = 'User successfully redirected to the dashboard, and the login page was not accessible via the browser back button.';
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`Error in ${testCaseId}: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});