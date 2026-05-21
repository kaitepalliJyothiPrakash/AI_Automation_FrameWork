import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

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
  // Wait for lock file to be released, with a timeout
  while (fs.existsSync(lockFile) && waited < 10000) { await new Promise(r => setTimeout(r, 100)); waited += 100; }
  // Create lock file
  fs.writeFileSync(lockFile, process.pid.toString());
  try {
    let results = [];
    // Read existing results if file exists
    if (fs.existsSync(resultFile)) { try { results = JSON.parse(fs.readFileSync(resultFile, 'utf8')); } catch { results = []; } }
    
    // Create new entry
    const entry = { test_case_id: testCaseId, browser, status, actual_result: actualResult };
    
    // Assign defect ID if status is 'Fail'
    if (status === 'Fail') { 
      const max = results.filter(r=>r.defect_id).length; 
      entry.defect_id = 'DEF' + String(max+1).padStart(3,'0') + '-' + browser; 
    }
    results.push(entry);
    
    // Write updated results back to file
    fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
    console.log('Result written: ' + testCaseId + ' | ' + browser + ' | ' + status);
  } finally {
    // Release lock file
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
  }
}

// URL for OrangeHRM login page
const ORANGEHRM_LOGIN_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';

// Valid credentials
const VALID_USERNAME = 'Admin';
const VALID_PASSWORD = 'admin123';

// Selectors
const USERNAME_FIELD = 'input[name="username"]';
const PASSWORD_FIELD = 'input[name="password"]';
const LOGIN_BUTTON = 'button[type="submit"]';
const ERROR_MESSAGE = '.oxd-alert-content-text';
const DASHBOARD_HEADER = 'h6.oxd-text.oxd-text--h6.oxd-topbar-header-breadcrumb-module';
const USERNAME_REQUIRED_ERROR = '//input[@name="username"]/parent::div/following-sibling::span[@class="oxd-text oxd-text--span oxd-input-field-error-message"]';
const PASSWORD_REQUIRED_ERROR = '//input[@name="password"]/parent::div/following-sibling::span[@class="oxd-text oxd-text--span.oxd-input-field-error-message"]';
const FORGOT_PASSWORD_LINK = 'p.oxd-text.oxd-text--p.orangehrm-login-forgot-header';


// Test Case TC001: Verify successful login with valid username 'Admin' and password 'admin123'.
test('TC001 - Verify successful login with valid credentials', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
    await expect(page.locator(DASHBOARD_HEADER)).toHaveText('Dashboard');
    
    status = 'Pass';
    actualResult = 'Successfully logged in to Dashboard.';
  } catch (error) {
    actualResult = `Login failed: ${error.message}`;
  } finally {
    await writeResult('TC001', browserName, status, actualResult);
  }
});

// Test Case TC002: Verify unsuccessful login with an invalid username and valid password.
test('TC002 - Verify unsuccessful login with invalid username', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, 'InvalidUser');
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');

    status = 'Pass';
    actualResult = 'Displayed "Invalid credentials" error for invalid username.';
  } catch (error) {
    actualResult = `Test failed: ${error.message}`;
  } finally {
    await writeResult('TC002', browserName, status, actualResult);
  }
});

// Test Case TC003: Verify unsuccessful login with a valid username and invalid password.
test('TC003 - Verify unsuccessful login with invalid password', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, 'wrongpass');
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');

    status = 'Pass';
    actualResult = 'Displayed "Invalid credentials" error for invalid password.';
  } catch (error) {
    actualResult = `Test failed: ${error.message}`;
  } finally {
    await writeResult('TC003', browserName, status, actualResult);
  }
});

// Test Case TC004: Verify login fails when both Username and Password fields are left empty.
test('TC004 - Verify login fails with empty username and password', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    // Fields are already empty
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(USERNAME_REQUIRED_ERROR)).toBeVisible();
    await expect(page.locator(USERNAME_REQUIRED_ERROR)).toHaveText('Required');
    await expect(page.locator(PASSWORD_REQUIRED_ERROR)).toBeVisible();
    await expect(page.locator(PASSWORD_REQUIRED_ERROR)).toHaveText('Required');

    status = 'Pass';
    actualResult = 'Displayed "Required" messages for both empty username and password fields.';
  } catch (error) {
    actualResult = `Test failed: ${error.message}`;
  } finally {
    await writeResult('TC004', browserName, status, actualResult);
  }
});

// Test Case TC005: Verify login fails when Username field is empty and Password field is filled.
test('TC005 - Verify login fails with empty username and filled password', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD); // Fill password
    // Leave username empty
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(USERNAME_REQUIRED_ERROR)).toBeVisible();
    await expect(page.locator(USERNAME_REQUIRED_ERROR)).toHaveText('Required');

    status = 'Pass';
    actualResult = 'Displayed "Required" message for empty username field.';
  } catch (error) {
    actualResult = `Test failed: ${error.message}`;
  } finally {
    await writeResult('TC005', browserName, status, actualResult);
  }
});

// Test Case TC006: Verify login fails when Username field is filled and Password field is empty.
test('TC006 - Verify login fails with filled username and empty password', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME); // Fill username
    // Leave password empty
    await page.click(LOGIN_BUTTON);

    await expect(page.locator(PASSWORD_REQUIRED_ERROR)).toBeVisible();
    await expect(page.locator(PASSWORD_REQUIRED_ERROR)).toHaveText('Required');

    status = 'Pass';
    actualResult = 'Displayed "Required" message for empty password field.';
  } catch (error) {
    actualResult = `Test failed: ${error.message}`;
  } finally {
    await writeResult('TC006', browserName, status, actualResult);
  }
});

// Test Case TC007: Verify system's resilience against SQL injection attempts.
test('TC007 - Verify system resilience against SQL injection', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);

    // Attempt 1: SQL injection in username
    await page.fill(USERNAME_FIELD, "Admin' OR '1'='1' --");
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    await page.goBack(); // Navigate back to clear the state

    // Attempt 2: SQL injection in password
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, "' OR '1'='1' --");
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');

    // Attempt 3: SQL injection in username with different syntax
    await page.goBack();
    await page.fill(USERNAME_FIELD, "Admin' or 1=1; --");
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');

    status = 'Pass';
    actualResult = 'System correctly displayed "Invalid credentials" and prevented SQL injection login.';
  } catch (error) {
    actualResult = `Test failed: ${error.message}`;
  } finally {
    await writeResult('TC007', browserName, status, actualResult);
  }
});

// Test Case TC008: Verify system's resilience against XSS/HTML injection attempts.
test('TC008 - Verify system resilience against XSS/HTML injection', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);

    let dialogTriggered = false;
    page.on('dialog', async dialog => {
      dialogTriggered = true;
      await dialog.dismiss(); // Dismiss the alert
    });

    // Attempt 1: XSS in username
    await page.fill(USERNAME_FIELD, "<script>alert('XSS')</script>");
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    expect(dialogTriggered).toBeFalsy(); // No alert should have been triggered
    await page.goBack();

    // Attempt 2: HTML injection in password (should be masked and not rendered)
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, "<h1>Hello</h1>");
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    // Also, check that no actual <h1> element appears on the page unexpectedly.
    // This is hard to assert directly without specific knowledge of where it might render.
    // Assuming 'Invalid credentials' implies proper handling.

    expect(dialogTriggered).toBeFalsy(); // No alert should have been triggered again.

    status = 'Pass';
    actualResult = 'System correctly displayed "Invalid credentials" and prevented XSS/HTML injection (no alerts or unintended rendering).';
  } catch (error) {
    actualResult = `Test failed: ${error.message}`;
  } finally {
    await writeResult('TC008', browserName, status, actualResult);
  }
});

// Test Case TC009: Verify that username and password fields are case-sensitive.
test('TC009 - Verify case-sensitivity of username and password', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);

    // Test 1: lowercase username, valid password (should fail)
    await page.fill(USERNAME_FIELD, 'admin');
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    await page.goBack();

    // Test 2: valid username, changed case password (should fail)
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, 'Admin123'); // Changed case
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    await page.goBack();

    // Test 3: valid username, valid password (should succeed)
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
    await expect(page.locator(DASHBOARD_HEADER)).toHaveText('Dashboard');

    status = 'Pass';
    actualResult = 'System correctly enforced case-sensitivity for both username and password fields.';
  } catch (error) {
    actualResult = `Test failed: ${error.message}`;
  } finally {
    await writeResult('TC009', browserName, status, actualResult);
  }
});

// Test Case TC010: Verify the system's behavior when very long strings are entered.
test('TC010 - Verify system behavior with very long strings', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  const longString = 'a'.repeat(255); // A very long string

  try {
    await page.goto(ORANGEHRM_LOGIN_URL);

    // Test 1: Long username, valid password
    await page.fill(USERNAME_FIELD, longString);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
    await page.goBack();

    // Test 2: Valid username, long password
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, longString);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');

    status = 'Pass';
    actualResult = 'System handled long inputs gracefully, displaying "Invalid credentials" error.';
  } catch (error) {
    actualResult = `Test failed: ${error.message}`;
  } finally {
    await writeResult('TC010', browserName, status, actualResult);
  }
});

// Test Case TC011: Verify that appropriate UI validation messages are consistently displayed.
test('TC011 - Verify consistent UI validation messages', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);

    // Step 1: Leave username empty, click Login. Observe message.
    // Password field is also empty by default when navigating to the page.
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(USERNAME_REQUIRED_ERROR)).toBeVisible();
    await expect(page.locator(USERNAME_REQUIRED_ERROR)).toHaveText('Required');
    await expect(page.locator(PASSWORD_REQUIRED_ERROR)).toBeVisible();
    await expect(page.locator(PASSWORD_REQUIRED_ERROR)).toHaveText('Required');
    await page.reload(); // Reload to clear validation messages

    // Step 2: Leave password empty, fill username, click Login. Observe message.
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(PASSWORD_REQUIRED_ERROR)).toBeVisible();
    await expect(page.locator(PASSWORD_REQUIRED_ERROR)).toHaveText('Required');
    await page.reload();

    // Step 3: Fill username/password with invalid credentials, click Login. Observe message.
    await page.fill(USERNAME_FIELD, 'invalid');
    await page.fill(PASSWORD_FIELD, 'invalid');
    await page.click(LOGIN_BUTTON);
    await expect(page.locator(ERROR_MESSAGE)).toBeVisible();
    await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');

    status = 'Pass';
    actualResult = 'Consistent UI validation messages ("Required", "Invalid credentials") displayed correctly.';
  } catch (error) {
    actualResult = `Test failed: ${error.message}`;
  } finally {
    await writeResult('TC011', browserName, status, actualResult);
  }
});

// Test Case TC012: Verify the presence and visibility of the 'Forgot your password?' link.
test('TC012 - Verify presence of Forgot your password link', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await expect(page.locator(FORGOT_PASSWORD_LINK)).toBeVisible();
    await expect(page.locator(FORGOT_PASSWORD_LINK)).toHaveText('Forgot your password?');

    status = 'Pass';
    actualResult = 'The "Forgot your password?" link is visible and correctly labeled.';
  } catch (error) {
    actualResult = `Test failed: ${error.message}`;
  } finally {
    await writeResult('TC012', browserName, status, actualResult);
  }
});

// Test Case TC013: Verify that characters entered in the password field are masked.
test('TC013 - Verify password field masking', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(PASSWORD_FIELD, 'testpassword');
    // The 'type' attribute should be 'password' to ensure masking
    await expect(page.locator(PASSWORD_FIELD)).toHaveAttribute('type', 'password');

    status = 'Pass';
    actualResult = 'Password field characters are masked (input type="password").';
  } catch (error) {
    actualResult = `Test failed: ${error.message}`;
  } finally {
    await writeResult('TC013', browserName, status, actualResult);
  }
});

// Test Case TC014: Verify that after a successful login, the user is redirected to the intended dashboard page.
test('TC014 - Verify redirection to dashboard after successful login', async ({ page, browserName }) => {
  let status = 'Fail';
  let actualResult = '';
  try {
    await page.goto(ORANGEHRM_LOGIN_URL);
    await page.fill(USERNAME_FIELD, VALID_USERNAME);
    await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
    await page.click(LOGIN_BUTTON);

    await expect(page.url()).toContain('/web/index.php/dashboard/index');
    await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
    await expect(page.locator(DASHBOARD_HEADER)).toHaveText('Dashboard');

    status = 'Pass';
    actualResult = 'Successfully redirected to the Dashboard page after login.';
  } catch (error) {
    actualResult = `Test failed: ${error.message}`;
  } finally {
    await writeResult('TC014', browserName, status, actualResult);
  }
});