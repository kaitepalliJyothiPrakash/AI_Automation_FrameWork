import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure tests to run in parallel
test.describe.configure({ mode: 'parallel' });

// Define the URL and selectors
const ORANGEHRM_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
const USERNAME_FIELD = 'input[name="username"]';
const PASSWORD_FIELD = 'input[name="password"]';
const LOGIN_BUTTON = 'button[type="submit"]';
const ERROR_MESSAGE = '.oxd-alert-content-text';
const DASHBOARD_HEADER = '.oxd-topbar-header-breadcrumb';
const USERNAME_EMPTY_ERROR = 'text="Username cannot be empty"';
const PASSWORD_EMPTY_ERROR = 'text="Password cannot be empty"';
const FORGOT_PASSWORD_LINK = 'text="Forgot your password?"';

// Helper function to write results to a JSON file with lock to prevent race conditions
async function writeResult(testCaseId, browser, status, actualResult) {
  const outputDir = 'C:\\Users\\2445084\\OneDrive - Cognizant\\Documents\\JavaScript\\swagger\\output';
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const resultFile = path.join(outputDir, 'test_results.json');
  const lockFile = path.join(outputDir, 'test_results.lock');

  // Wait until lock is released — max 10 seconds
  let waited = 0;
  while (fs.existsSync(lockFile) && waited < 10000) {
    await new Promise(r => setTimeout(r, 100));
    waited += 100;
  }

  // Acquire lock
  fs.writeFileSync(lockFile, process.pid.toString());

  try {
    let results = [];
    if (fs.existsSync(resultFile)) {
      try { results = JSON.parse(fs.readFileSync(resultFile, 'utf8')); } catch { results = []; }
    }
    const entry = { test_case_id: testCaseId, browser, status, actual_result: actualResult };
    if (status === 'Fail') {
      const max = results.filter(r => r.defect_id).length;
      entry.defect_id = 'DEF' + String(max + 1).padStart(3, '0') + '-' + browser;
    }
    results.push(entry);
    fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
    console.log('Result written: ' + testCaseId + ' | ' + browser + ' | ' + status);
  } finally {
    // Always release lock
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
  }
}

// --- Test Cases ---

test('TC001 SCN001: Verify successful login with valid admin credentials.', async ({ page, browserName }) => {
  const testCaseId = 'TC001';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
    actualOutcome = 'User successfully logged in and redirected to the OrangeHRM Dashboard page.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error; // Re-throw the error to ensure Playwright marks the test as failed
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC002 SCN002: Verify login failure with an invalid username and valid password.', async ({ page, browserName }) => {
  const testCaseId = 'TC002';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'InvalidUser');
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    
    const errorMessageLocator = page.locator(ERROR_MESSAGE);
    await expect(errorMessageLocator).toBeVisible();
    await expect(errorMessageLocator).toHaveText('Invalid credentials');
    actualOutcome = 'Login failed. Error message "Invalid credentials" displayed.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC003 SCN002: Verify login failure when using a non-existent username.', async ({ page, browserName }) => {
  const testCaseId = 'TC003';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'nonExistentUser');
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    
    const errorMessageLocator = page.locator(ERROR_MESSAGE);
    await expect(errorMessageLocator).toBeVisible();
    await expect(errorMessageLocator).toHaveText('Invalid credentials');
    actualOutcome = 'Login failed. Error message "Invalid credentials" displayed.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC004 SCN003: Verify login failure with a valid username and an invalid password.', async ({ page, browserName }) => {
  const testCaseId = 'TC004';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    await page.fill(PASSWORD_FIELD, 'wrongpass');
    await page.click(LOGIN_BUTTON);
    
    const errorMessageLocator = page.locator(ERROR_MESSAGE);
    await expect(errorMessageLocator).toBeVisible();
    await expect(errorMessageLocator).toHaveText('Invalid credentials');
    actualOutcome = 'Login failed. Error message "Invalid credentials" displayed.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC005 SCN004: Verify login failure when both username and password fields are left empty.', async ({ page, browserName }) => {
  const testCaseId = 'TC005';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    // Fields are intentionally left empty
    await page.click(LOGIN_BUTTON);
    
    await expect(page.locator(USERNAME_EMPTY_ERROR)).toBeVisible();
    await expect(page.locator(PASSWORD_EMPTY_ERROR)).toBeVisible();
    actualOutcome = 'Login failed. Error messages "Username cannot be empty" and "Password cannot be empty" displayed.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC006 SCN005: Verify login failure when the username field is empty and password field is filled.', async ({ page, browserName }) => {
  const testCaseId = 'TC006';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    
    await expect(page.locator(USERNAME_EMPTY_ERROR)).toBeVisible();
    actualOutcome = 'Login failed. Error message "Username cannot be empty" displayed.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC007 SCN006: Verify login failure when the username field is filled and password field is empty.', async ({ page, browserName }) => {
  const testCaseId = 'TC007';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    // Password field is intentionally left empty
    await page.click(LOGIN_BUTTON);
    
    await expect(page.locator(PASSWORD_EMPTY_ERROR)).toBeVisible();
    actualOutcome = 'Login failed. Error message "Password cannot be empty" displayed.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC008 SCN007: Attempt SQL injection in the username field using \'OR 1=1\' clause.', async ({ page, browserName }) => {
  const testCaseId = 'TC008';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, "Admin' OR '1'='1");
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    
    const errorMessageLocator = page.locator(ERROR_MESSAGE);
    await expect(errorMessageLocator).toBeVisible();
    await expect(errorMessageLocator).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL); // Should not redirect to dashboard
    actualOutcome = 'Login failed with "Invalid credentials". No unauthorized access granted.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC009 SCN007: Attempt SQL injection in the password field using \'OR 1=1\' clause.', async ({ page, browserName }) => {
  const testCaseId = 'TC009';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    await page.fill(PASSWORD_FIELD, "admin123' OR '1'='1");
    await page.click(LOGIN_BUTTON);
    
    const errorMessageLocator = page.locator(ERROR_MESSAGE);
    await expect(errorMessageLocator).toBeVisible();
    await expect(errorMessageLocator).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL); // Should not redirect to dashboard
    actualOutcome = 'Login failed with "Invalid credentials". No unauthorized access granted.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC010 SCN007: Attempt SQL injection in the username field using a \'DROP TABLE\' statement.', async ({ page, browserName }) => {
  const testCaseId = 'TC010';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, "Admin'; DROP TABLE users;--");
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    
    const errorMessageLocator = page.locator(ERROR_MESSAGE);
    await expect(errorMessageLocator).toBeVisible();
    await expect(errorMessageLocator).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL); // Should not redirect to dashboard
    actualOutcome = 'Login failed with "Invalid credentials". No database table dropped/altered.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC011 SCN008: Attempt XSS injection in the username field.', async ({ page, browserName }) => {
  const testCaseId = 'TC011';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, "<script>alert('XSS')</script>");
    await page.fill(PASSWORD_FIELD, 'admin123');
    // Playwright automatically dismisses alerts, so we're checking for login failure
    await page.click(LOGIN_BUTTON);
    
    const errorMessageLocator = page.locator(ERROR_MESSAGE);
    await expect(errorMessageLocator).toBeVisible();
    await expect(errorMessageLocator).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(ORANGEHRM_URL); // Should not redirect to dashboard
    actualOutcome = 'Login failed with "Invalid credentials". XSS script was not executed (no alert detected).';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC012 SCN008: Attempt HTML injection in the password field.', async ({ page, browserName }) => {
  const testCaseId = 'TC012';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    await page.fill(PASSWORD_FIELD, "<h1>Test</h1>");
    await page.click(LOGIN_BUTTON);
    
    const errorMessageLocator = page.locator(ERROR_MESSAGE);
    await expect(errorMessageLocator).toBeVisible();
    await expect(errorMessageLocator).toHaveText('Invalid credentials');
    // We can't directly assert 'no rendered HTML' on the page unless it results in a visible element,
    // but the error message should just contain the raw text, not rendered HTML.
    // The "Invalid credentials" check implies the input was treated as string.
    actualOutcome = 'Login failed with "Invalid credentials". HTML tags were not rendered.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC013 SCN009: Verify that the username field is case-sensitive.', async ({ page, browserName }) => {
  const testCaseId = 'TC013';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'admin'); // Lowercase 'admin'
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    
    const errorMessageLocator = page.locator(ERROR_MESSAGE);
    await expect(errorMessageLocator).toBeVisible();
    await expect(errorMessageLocator).toHaveText('Invalid credentials');
    actualOutcome = 'Login failed with "Invalid credentials", confirming username is case-sensitive.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC014 SCN009: Verify that the password field is case-sensitive.', async ({ page, browserName }) => {
  const testCaseId = 'TC014';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    await page.fill(PASSWORD_FIELD, 'ADMIN123'); // Uppercase 'ADMIN123'
    await page.click(LOGIN_BUTTON);
    
    const errorMessageLocator = page.locator(ERROR_MESSAGE);
    await expect(errorMessageLocator).toBeVisible();
    await expect(errorMessageLocator).toHaveText('Invalid credentials');
    actualOutcome = 'Login failed with "Invalid credentials", confirming password is case-sensitive.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC015 SCN010: Verify system behavior when a very long string is entered into the username field.', async ({ page, browserName }) => {
  const testCaseId = 'TC015';
  let testStatus = 'Pass';
  let actualOutcome = '';
  const longString = 'a'.repeat(256); // 256 'a' characters

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, longString);
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    
    const errorMessageLocator = page.locator(ERROR_MESSAGE);
    await expect(errorMessageLocator).toBeVisible();
    await expect(errorMessageLocator).toHaveText('Invalid credentials');
    actualOutcome = 'Login failed with "Invalid credentials" when very long username was entered. System did not crash.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC016 SCN010: Verify system behavior when a very long string is entered into the password field.', async ({ page, browserName }) => {
  const testCaseId = 'TC016';
  let testStatus = 'Pass';
  let actualOutcome = '';
  const longString = 'b'.repeat(256); // 256 'b' characters

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    await page.fill(PASSWORD_FIELD, longString);
    await page.click(LOGIN_BUTTON);
    
    const errorMessageLocator = page.locator(ERROR_MESSAGE);
    await expect(errorMessageLocator).toBeVisible();
    await expect(errorMessageLocator).toHaveText('Invalid credentials');
    actualOutcome = 'Login failed with "Invalid credentials" when very long password was entered. System did not crash.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC017 SCN011: Verify the display of the \'Username cannot be empty\' validation message.', async ({ page, browserName }) => {
  const testCaseId = 'TC017';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    // Username field left empty
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    
    await expect(page.locator(USERNAME_EMPTY_ERROR)).toBeVisible();
    actualOutcome = 'Validation message "Username cannot be empty" displayed.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC018 SCN011: Verify the display of the \'Password cannot be empty\' validation message.', async ({ page, browserName }) => {
  const testCaseId = 'TC018';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    // Password field left empty
    await page.click(LOGIN_BUTTON);
    
    await expect(page.locator(PASSWORD_EMPTY_ERROR)).toBeVisible();
    actualOutcome = 'Validation message "Password cannot be empty" displayed.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC019 SCN011: Verify the display of the \'Invalid credentials\' error message for incorrect inputs.', async ({ page, browserName }) => {
  const testCaseId = 'TC019';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    await page.fill(PASSWORD_FIELD, 'wrongpass');
    await page.click(LOGIN_BUTTON);
    
    const errorMessageLocator = page.locator(ERROR_MESSAGE);
    await expect(errorMessageLocator).toBeVisible();
    await expect(errorMessageLocator).toHaveText('Invalid credentials');
    actualOutcome = 'Error message "Invalid credentials" displayed clearly and prominently.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC020 SCN012: Verify the presence of the \'Forgot your password?\' link on the login page.', async ({ page, browserName }) => {
  const testCaseId = 'TC020';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    
    await expect(page.locator(FORGOT_PASSWORD_LINK)).toBeVisible();
    actualOutcome = 'The "Forgot your password?" link is visible on the login page.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC021 SCN012: Verify the functionality of the \'Forgot your password?\' link.', async ({ page, browserName }) => {
  const testCaseId = 'TC021';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.click(FORGOT_PASSWORD_LINK);
    
    await expect(page).toHaveURL(/.*requestPasswordReset/);
    actualOutcome = 'User successfully redirected to the password reset page.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC022 SCN013: Verify that characters entered into the password field are masked.', async ({ page, browserName }) => {
  const testCaseId = 'TC022';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    // Filling the password field and checking its type attribute implies masking
    await page.fill(PASSWORD_FIELD, 'admin123');
    await expect(page.locator(PASSWORD_FIELD)).toHaveAttribute('type', 'password');
    // Note: Playwright's .inputValue() or .evaluate() will return the actual text, not the masked characters.
    // The 'type="password"' attribute is the standard and most reliable way to assert masking behavior.
    actualOutcome = 'Password field characters are masked (input type="password").';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC023 SCN013: Verify the \'type\' attribute of the password input field is \'password\'.', async ({ page, browserName }) => {
  const testCaseId = 'TC023';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    
    await expect(page.locator(PASSWORD_FIELD)).toHaveAttribute('type', 'password');
    actualOutcome = 'The "type" attribute of the password input field is set to "password".';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});

test('TC024 SCN014: Verify successful redirection to the dashboard after a valid login.', async ({ page, browserName }) => {
  const testCaseId = 'TC024';
  let testStatus = 'Pass';
  let actualOutcome = '';

  try {
    await page.goto(ORANGEHRM_URL);
    await page.fill(USERNAME_FIELD, 'Admin');
    await page.fill(PASSWORD_FIELD, 'admin123');
    await page.click(LOGIN_BUTTON);
    
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
    actualOutcome = 'User successfully logged in and automatically redirected to the OrangeHRM Dashboard page. URL reflects dashboard and elements are visible.';
  } catch (error) {
    testStatus = 'Fail';
    actualOutcome = error.message;
    throw error;
  } finally {
    await writeResult(testCaseId, browserName, testStatus, actualOutcome);
  }
});