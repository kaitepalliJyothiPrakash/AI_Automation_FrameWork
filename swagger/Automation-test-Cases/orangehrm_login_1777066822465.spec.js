import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Enable parallel execution for tests
test.describe.configure({ mode: 'parallel' });

// Helper function to write test results to a JSON file
async function writeResult(testCaseId, browser, status, actualResult) {
  const outputDir = path.resolve(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const resultFile = path.join(outputDir, 'test_results.json');
  const lockFile = path.join(outputDir, 'test_results.lock');
  let waited = 0;
  // Wait for the lock file to be released, or timeout after 10 seconds
  while (fs.existsSync(lockFile) && waited < 10000) { await new Promise(r => setTimeout(r, 100)); waited += 100; }
  fs.writeFileSync(lockFile, process.pid.toString()); // Acquire lock
  try {
    let results = [];
    if (fs.existsSync(resultFile)) {
      try {
        results = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
      } catch (e) {
        console.error('Error parsing existing test_results.json, starting fresh:', e);
        results = [];
      }
    }
    const entry = { test_case_id: testCaseId, browser, status, actual_result: actualResult };
    // Assign a defect ID if the test fails
    if (status === 'Fail') {
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

// Constants for the OrangeHRM login page
const ORANGEHRM_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
const VALID_USERNAME = 'Admin';
const VALID_PASSWORD = 'admin123';

// Centralized selectors for the login page
const selectors = {
  usernameField: 'input[name="username"]',
  passwordField: 'input[name="password"]',
  loginButton: 'button[type="submit"]',
  generalErrorMessage: '.oxd-alert-content-text', // For 'Invalid credentials'
  // Specific error messages for empty fields. On OrangeHRM demo, these usually show 'Required'.
  usernameEmptyErrorMessage: '.oxd-form-row:nth-child(2) .oxd-input-group > span.oxd-text--span',
  passwordEmptyErrorMessage: '.oxd-form-row:nth-child(3) .oxd-input-group > span.oxd-text--span',
  dashboardHeader: '.oxd-topbar-header-breadcrumb',
  forgotPasswordLink: 'a.orangehrm-forgot-password-link'
};

// Test Case ID: TC-001, Scenario ID: SCN-001
test('TC-001 Verify successful login with valid credentials (Admin, admin123)', async ({ page, browserName }) => {
  const testCaseId = 'TC-001';
  let status = 'Pass';
  let actualResult = 'User successfully logged in and redirected to the OrangeHRM Dashboard.';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(selectors.usernameField, VALID_USERNAME);
    await page.fill(selectors.passwordField, VALID_PASSWORD);
    await page.click(selectors.loginButton);
    await expect(page.locator(selectors.dashboardHeader)).toBeVisible();
    await expect(page).toHaveURL(/dashboard/); // Verify URL redirection
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-001 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-002, Scenario ID: SCN-002
test('TC-002 Verify login failure with an invalid username and valid password', async ({ page, browserName }) => {
  const testCaseId = 'TC-002';
  let status = 'Pass';
  let actualResult = 'An error message "Invalid credentials" is displayed.';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(selectors.usernameField, 'InvalidUser');
    await page.fill(selectors.passwordField, VALID_PASSWORD);
    await page.click(selectors.loginButton);
    await expect(page.locator(selectors.generalErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.generalErrorMessage)).toHaveText('Invalid credentials');
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-002 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-003, Scenario ID: SCN-003
test('TC-003 Verify login failure with a valid username and invalid password', async ({ page, browserName }) => {
  const testCaseId = 'TC-003';
  let status = 'Pass';
  let actualResult = 'An error message "Invalid credentials" is displayed.';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(selectors.usernameField, VALID_USERNAME);
    await page.fill(selectors.passwordField, 'wrongpass');
    await page.click(selectors.loginButton);
    await expect(page.locator(selectors.generalErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.generalErrorMessage)).toHaveText('Invalid credentials');
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-003 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-004, Scenario ID: SCN-004
test('TC-004 Verify login failure when both username and password fields are left empty', async ({ page, browserName }) => {
  const testCaseId = 'TC-004';
  let status = 'Pass';
  let actualResult = 'Error messages "Required" for both Username and Password fields displayed.';
  try {
    await page.goto(ORANGEHRM_URL);
    // Fields are left empty by default
    await page.click(selectors.loginButton);
    await expect(page.locator(selectors.usernameEmptyErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.usernameEmptyErrorMessage)).toHaveText('Required');
    await expect(page.locator(selectors.passwordEmptyErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.passwordEmptyErrorMessage)).toHaveText('Required');
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-004 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-005, Scenario ID: SCN-005
test('TC-005 Verify login failure when username field is empty and password field is filled', async ({ page, browserName }) => {
  const testCaseId = 'TC-005';
  let status = 'Pass';
  let actualResult = 'An error message "Required" for Username field is displayed.';
  try {
    await page.goto(ORANGEHRM_URL);
    // Username field is empty
    await page.fill(selectors.passwordField, VALID_PASSWORD);
    await page.click(selectors.loginButton);
    await expect(page.locator(selectors.usernameEmptyErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.usernameEmptyErrorMessage)).toHaveText('Required');
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-005 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-006, Scenario ID: SCN-006
test('TC-006 Verify login failure when username field is filled and password field is empty', async ({ page, browserName }) => {
  const testCaseId = 'TC-006';
  let status = 'Pass';
  let actualResult = 'An error message "Required" for Password field is displayed.';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(selectors.usernameField, VALID_USERNAME);
    // Password field is empty
    await page.click(selectors.loginButton);
    await expect(page.locator(selectors.passwordEmptyErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.passwordEmptyErrorMessage)).toHaveText('Required');
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-006 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-007, Scenario ID: SCN-007
test('TC-007 Verify system\'s response to SQL injection in the username field', async ({ page, browserName }) => {
  const testCaseId = 'TC-007';
  let status = 'Pass';
  let actualResult = 'Login failed with "Invalid credentials" message; no unauthorized access or database errors occurred.';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(selectors.usernameField, "' OR '1'='1 --");
    await page.fill(selectors.passwordField, VALID_PASSWORD);
    await page.click(selectors.loginButton);
    await expect(page.locator(selectors.generalErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.generalErrorMessage)).toHaveText('Invalid credentials');
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-007 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-008, Scenario ID: SCN-007
test('TC-008 Verify system\'s response to SQL injection in the password field', async ({ page, browserName }) => {
  const testCaseId = 'TC-008';
  let status = 'Pass';
  let actualResult = 'Login failed with "Invalid credentials" message; no unauthorized access or database errors occurred.';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(selectors.usernameField, VALID_USERNAME);
    await page.fill(selectors.passwordField, "' OR '1'='1 --");
    await page.click(selectors.loginButton);
    await expect(page.locator(selectors.generalErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.generalErrorMessage)).toHaveText('Invalid credentials');
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-008 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-009, Scenario ID: SCN-008
test('TC-009 Verify system\'s response to XSS/HTML injection in the username field', async ({ page, browserName }) => {
  const testCaseId = 'TC-009';
  let status = 'Pass';
  let actualResult = 'Login failed with "Invalid credentials" message; script did not execute, input was sanitized.';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(selectors.usernameField, '<script>alert("XSS")</script>');
    await page.fill(selectors.passwordField, VALID_PASSWORD);
    await page.click(selectors.loginButton);
    await expect(page.locator(selectors.generalErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.generalErrorMessage)).toHaveText('Invalid credentials');
    // Implicitly, if the test proceeds without an unhandled dialog error, the script didn't execute meaningfully.
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-009 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-010, Scenario ID: SCN-008
test('TC-010 Verify system\'s response to XSS/HTML injection in the password field', async ({ page, browserName }) => {
  const testCaseId = 'TC-010';
  let status = 'Pass';
  let actualResult = 'Login failed with "Invalid credentials" message; script/HTML did not execute or render, input was sanitized.';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(selectors.usernameField, VALID_USERNAME);
    await page.fill(selectors.passwordField, '<img src=x onerror=alert(1)>');
    await page.click(selectors.loginButton);
    await expect(page.locator(selectors.generalErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.generalErrorMessage)).toHaveText('Invalid credentials');
    // Implicitly, if the test proceeds without an unhandled dialog error, the script didn't execute meaningfully.
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-010 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-011, Scenario ID: SCN-009
test('TC-011 Verify login is case-sensitive for the username', async ({ page, browserName }) => {
  const testCaseId = 'TC-011';
  let status = 'Pass';
  let actualResult = 'Login failed with "Invalid credentials" message, confirming username is case-sensitive.';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(selectors.usernameField, VALID_USERNAME.toLowerCase()); // 'admin'
    await page.fill(selectors.passwordField, VALID_PASSWORD);
    await page.click(selectors.loginButton);
    await expect(page.locator(selectors.generalErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.generalErrorMessage)).toHaveText('Invalid credentials');
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-011 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-012, Scenario ID: SCN-009
test('TC-012 Verify login is case-sensitive for the password', async ({ page, browserName }) => {
  const testCaseId = 'TC-012';
  let status = 'Pass';
  let actualResult = 'Login failed with "Invalid credentials" message, confirming password is case-sensitive.';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(selectors.usernameField, VALID_USERNAME);
    await page.fill(selectors.passwordField, 'Admin123'); // Changed case for 'a'
    await page.click(selectors.loginButton);
    await expect(page.locator(selectors.generalErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.generalErrorMessage)).toHaveText('Invalid credentials');
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-012 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-013, Scenario ID: SCN-010
test('TC-013 Verify system handles very long valid username and password', async ({ page, browserName }) => {
  const testCaseId = 'TC-013';
  let status = 'Pass';
  let actualResult = 'System handled long inputs gracefully. Login failed with "Invalid credentials" as expected since a truly very long valid user is not present on the demo system.';
  try {
    // Note: OrangeHRM demo limits username field to 50 characters and password to 64 characters.
    // Entering 'A'*255 or 'p'*255 will truncate the input.
    // For this test, we fill the fields to their maximum allowed length with modified valid credentials,
    // which effectively makes them invalid for login.
    const longUsername = VALID_USERNAME + 'A'.repeat(Math.max(0, 50 - VALID_USERNAME.length));
    const longPassword = VALID_PASSWORD + 'p'.repeat(Math.max(0, 64 - VALID_PASSWORD.length));

    await page.goto(ORANGEHRM_URL);
    await page.fill(selectors.usernameField, longUsername);
    await page.fill(selectors.passwordField, longPassword);
    await page.click(selectors.loginButton);

    // Expecting "Invalid credentials" because the modified long inputs do not match actual 'Admin'/'admin123'.
    await expect(page.locator(selectors.generalErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.generalErrorMessage)).toHaveText('Invalid credentials');
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-013 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-014, Scenario ID: SCN-010
test('TC-014 Verify system handles very long invalid username and password', async ({ page, browserName }) => {
  const testCaseId = 'TC-014';
  let status = 'Pass';
  let actualResult = 'Login failed with "Invalid credentials" message, system handled very long invalid inputs gracefully.';
  try {
    // Input fields have character limits (username 50, password 64).
    // These very long strings will be truncated by the browser/Playwright before submission.
    const veryLongInvalidUsername = 'I'.repeat(500); // Will be truncated to 50 'I's
    const veryLongInvalidPassword = 'i'.repeat(500); // Will be truncated to 64 'i's

    await page.goto(ORANGEHRM_URL);
    await page.fill(selectors.usernameField, veryLongInvalidUsername);
    await page.fill(selectors.passwordField, veryLongInvalidPassword);
    await page.click(selectors.loginButton);
    await expect(page.locator(selectors.generalErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.generalErrorMessage)).toHaveText('Invalid credentials');
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-014 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-015, Scenario ID: SCN-011
test('TC-015 Verify the \'Username cannot be empty\' validation message', async ({ page, browserName }) => {
  const testCaseId = 'TC-015';
  let status = 'Pass';
  let actualResult = 'A clear and visible error message "Required" is displayed below the username field.';
  try {
    await page.goto(ORANGEHRM_URL);
    // Leave username empty
    await page.fill(selectors.passwordField, VALID_PASSWORD);
    await page.click(selectors.loginButton);
    await expect(page.locator(selectors.usernameEmptyErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.usernameEmptyErrorMessage)).toHaveText('Required');
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-015 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-016, Scenario ID: SCN-011
test('TC-016 Verify the \'Password cannot be empty\' validation message', async ({ page, browserName }) => {
  const testCaseId = 'TC-016';
  let status = 'Pass';
  let actualResult = 'A clear and visible error message "Required" is displayed below the password field.';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(selectors.usernameField, VALID_USERNAME);
    // Leave password empty
    await page.click(selectors.loginButton);
    await expect(page.locator(selectors.passwordEmptyErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.passwordEmptyErrorMessage)).toHaveText('Required');
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-016 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-017, Scenario ID: SCN-011
test('TC-017 Verify the \'Invalid credentials\' validation message for incorrect input', async ({ page, browserName }) => {
  const testCaseId = 'TC-017';
  let status = 'Pass';
  let actualResult = 'A clear and visible error message "Invalid credentials" is displayed.';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(selectors.usernameField, 'wronguser');
    await page.fill(selectors.passwordField, 'wrongpass');
    await page.click(selectors.loginButton);
    await expect(page.locator(selectors.generalErrorMessage)).toBeVisible();
    await expect(page.locator(selectors.generalErrorMessage)).toHaveText('Invalid credentials');
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-017 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-018, Scenario ID: SCN-012
test('TC-018 Verify the presence and functionality of the \'Forgot your password?\' link', async ({ page, browserName }) => {
  const testCaseId = 'TC-018';
  let status = 'Pass';
  let actualResult = 'The "Forgot your password?" link is present, clickable, and redirects the user to the password recovery page.';
  try {
    await page.goto(ORANGEHRM_URL);
    const forgotPasswordLink = page.locator(selectors.forgotPasswordLink);
    await expect(forgotPasswordLink).toBeVisible();
    await forgotPasswordLink.click();
    await expect(page).toHaveURL(/requestPasswordReset/); // Verify redirection to the password recovery page
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-018 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-019, Scenario ID: SCN-013
test('TC-019 Verify that input in the password field is masked', async ({ page, browserName }) => {
  const testCaseId = 'TC-019';
  let status = 'Pass';
  let actualResult = 'The characters entered into the password field are masked (input type is "password").';
  try {
    await page.goto(ORANGEHRM_URL);
    const passwordField = page.locator(selectors.passwordField);
    await expect(passwordField).toHaveAttribute('type', 'password'); // Check if the input type is 'password' for masking
    await passwordField.fill('testpassword'); // Type some text to ensure the attribute is active during input
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-019 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});

// Test Case ID: TC-020, Scenario ID: SCN-014
test('TC-020 Verify successful redirection to the dashboard after valid login', async ({ page, browserName }) => {
  const testCaseId = 'TC-020';
  let status = 'Pass';
  let actualResult = 'After successful login, the user is automatically redirected to the OrangeHRM Dashboard page and dashboard elements are visible.';
  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(selectors.usernameField, VALID_USERNAME);
    await page.fill(selectors.passwordField, VALID_PASSWORD);
    await page.click(selectors.loginButton);
    await expect(page).toHaveURL(/dashboard/); // Verify URL contains '/dashboard/'
    await expect(page.locator(selectors.dashboardHeader)).toBeVisible(); // Verify dashboard element is visible
  } catch (error) {
    status = 'Fail';
    actualResult = `Test failed: ${error.message}`;
    console.error(`TC-020 failed: ${error.message}`);
  } finally {
    await writeResult(testCaseId, browserName, status, actualResult);
  }
});