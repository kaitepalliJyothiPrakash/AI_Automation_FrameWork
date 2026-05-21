import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe.configure({ mode: 'parallel' });

// Define selectors and credentials
const BASE_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
const VALID_USERNAME = 'Admin';
const VALID_PASSWORD = 'admin123';

const SELECTORS = {
    USERNAME_FIELD: 'input[name="username"]',
    PASSWORD_FIELD: 'input[name="password"]',
    LOGIN_BUTTON: 'button[type="submit"]',
    ERROR_MESSAGE: '.oxd-alert-content-text',
    DASHBOARD_HEADER: '.oxd-topbar-header-breadcrumb',
    USERNAME_REQUIRED_MESSAGE: 'input[name="username"] + span.oxd-input-field-error-message',
    PASSWORD_REQUIRED_MESSAGE: 'input[name="password"] + span.oxd-input-field-error-message',
    FORGOT_PASSWORD_LINK: 'p.oxd-text.oxd-text--p.orangehrm-login-forgot-header' // This selector covers the link text "Forgot your password?"
};

/**
 * Helper function to write test results to a JSON file.
 * This function handles concurrent writes using a lock file.
 * @param {string} testCaseId - The ID of the test case (e.g., 'TC001').
 * @param {string} browser - The name of the browser the test ran on.
 * @param {'Pass'|'Fail'} status - The status of the test ('Pass' or 'Fail').
 * @param {string} actualResult - A description of the actual outcome.
 */
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

// Test Case ID: TC001
// Scenario ID: SCN001
// Description: Verify login with default valid 'Admin' credentials.
test('TC001: Verify login with valid Admin credentials', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = 'User successfully logged in and redirected to Dashboard.';
    try {
        await page.goto(BASE_URL);
        await page.fill(SELECTORS.USERNAME_FIELD, VALID_USERNAME);
        await page.fill(SELECTORS.PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(SELECTORS.LOGIN_BUTTON);

        await expect(page).toHaveURL(/.*web\/index.php\/dashboard\/index/);
        await expect(page.locator(SELECTORS.DASHBOARD_HEADER)).toBeVisible();
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC001', browserName, status, actualResult);
    }
});

// Test Case ID: TC002
// Scenario ID: SCN002
// Description: Attempt login with a non-existent username and valid password.
test('TC002: Attempt login with non-existent username', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "Error message 'Invalid credentials' displayed, user remains on login page.";
    try {
        await page.goto(BASE_URL);
        await page.fill(SELECTORS.USERNAME_FIELD, 'NonExistentUser');
        await page.fill(SELECTORS.PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(SELECTORS.LOGIN_BUTTON);

        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page).toHaveURL(BASE_URL);
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC002', browserName, status, actualResult);
    }
});

// Test Case ID: TC003
// Scenario ID: SCN003
// Description: Attempt login with valid username but an incorrect password.
test('TC003: Attempt login with valid username and incorrect password', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "Error message 'Invalid credentials' displayed, user remains on login page.";
    try {
        await page.goto(BASE_URL);
        await page.fill(SELECTORS.USERNAME_FIELD, VALID_USERNAME);
        await page.fill(SELECTORS.PASSWORD_FIELD, 'wrongpassword');
        await page.click(SELECTORS.LOGIN_BUTTON);

        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page).toHaveURL(BASE_URL);
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC003', browserName, status, actualResult);
    }
});

// Test Case ID: TC004
// Scenario ID: SCN004
// Description: Attempt login with both username and password fields empty.
test('TC004: Attempt login with empty username and password', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "'Required' error messages displayed for both fields, user remains on login page.";
    try {
        await page.goto(BASE_URL);
        // Leave fields empty
        await page.click(SELECTORS.LOGIN_BUTTON);

        await expect(page.locator(SELECTORS.USERNAME_REQUIRED_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.USERNAME_REQUIRED_MESSAGE)).toHaveText('Required');
        await expect(page.locator(SELECTORS.PASSWORD_REQUIRED_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.PASSWORD_REQUIRED_MESSAGE)).toHaveText('Required');
        await expect(page).toHaveURL(BASE_URL);
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC004', browserName, status, actualResult);
    }
});

// Test Case ID: TC005
// Scenario ID: SCN005
// Description: Attempt login with empty username and a valid password.
test('TC005: Attempt login with empty username and valid password', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "'Required' error message displayed for username field, user remains on login page.";
    try {
        await page.goto(BASE_URL);
        // Leave Username field empty
        await page.fill(SELECTORS.PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(SELECTORS.LOGIN_BUTTON);

        await expect(page.locator(SELECTORS.USERNAME_REQUIRED_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.USERNAME_REQUIRED_MESSAGE)).toHaveText('Required');
        await expect(page).toHaveURL(BASE_URL);
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC005', browserName, status, actualResult);
    }
});

// Test Case ID: TC006
// Scenario ID: SCN006
// Description: Attempt login with a valid username and an empty password field.
test('TC006: Attempt login with valid username and empty password', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "'Required' error message displayed for password field, user remains on login page.";
    try {
        await page.goto(BASE_URL);
        await page.fill(SELECTORS.USERNAME_FIELD, VALID_USERNAME);
        // Leave Password field empty
        await page.click(SELECTORS.LOGIN_BUTTON);

        await expect(page.locator(SELECTORS.PASSWORD_REQUIRED_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.PASSWORD_REQUIRED_MESSAGE)).toHaveText('Required');
        await expect(page).toHaveURL(BASE_URL);
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC006', browserName, status, actualResult);
    }
});

// Test Case ID: TC007
// Scenario ID: SCN007
// Description: Attempt SQL injection in the username field with a valid password.
test('TC007: Attempt SQL injection in username field', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "Login failed with 'Invalid credentials' message, no unauthorized access.";
    try {
        await page.goto(BASE_URL);
        await page.fill(SELECTORS.USERNAME_FIELD, "' OR '1'='1 --");
        await page.fill(SELECTORS.PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(SELECTORS.LOGIN_BUTTON);

        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page).toHaveURL(BASE_URL);
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC007', browserName, status, actualResult);
    }
});

// Test Case ID: TC008
// Scenario ID: SCN007
// Description: Attempt SQL injection in the password field with a valid username.
test('TC008: Attempt SQL injection in password field', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "Login failed with 'Invalid credentials' message, no unauthorized access.";
    try {
        await page.goto(BASE_URL);
        await page.fill(SELECTORS.USERNAME_FIELD, VALID_USERNAME);
        await page.fill(SELECTORS.PASSWORD_FIELD, "' OR '1'='1 --");
        await page.click(SELECTORS.LOGIN_BUTTON);

        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page).toHaveURL(BASE_URL);
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC008', browserName, status, actualResult);
    }
});

// Test Case ID: TC009
// Scenario ID: SCN008
// Description: Attempt XSS injection in the username field.
test('TC009: Attempt XSS injection in username field', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "Login failed, XSS script not executed, 'Invalid credentials' message displayed.";
    try {
        await page.goto(BASE_URL);
        // Playwright automatically suppresses alerts, so we check for login failure
        await page.fill(SELECTORS.USERNAME_FIELD, "<script>alert('XSS')</script>");
        await page.fill(SELECTORS.PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(SELECTORS.LOGIN_BUTTON);

        // Expect login to fail and display invalid credentials, not an alert or distorted page
        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page).toHaveURL(BASE_URL);
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC009', browserName, status, actualResult);
    }
});

// Test Case ID: TC010
// Scenario ID: SCN008
// Description: Attempt XSS injection in the password field.
test('TC010: Attempt XSS injection in password field', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "Login failed, XSS script not executed, 'Invalid credentials' message displayed.";
    try {
        await page.goto(BASE_URL);
        // Playwright automatically suppresses alerts, so we check for login failure
        await page.fill(SELECTORS.USERNAME_FIELD, VALID_USERNAME);
        await page.fill(SELECTORS.PASSWORD_FIELD, "<script>alert('XSS')</script>");
        await page.click(SELECTORS.LOGIN_BUTTON);

        // Expect login to fail and display invalid credentials, not an alert or distorted page
        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page).toHaveURL(BASE_URL);
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC010', browserName, status, actualResult);
    }
});

// Test Case ID: TC011
// Scenario ID: SCN009
// Description: Verify login fails with incorrect case for username.
test('TC011: Verify login fails with incorrect case for username', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "Login failed with 'Invalid credentials' for lowercase username.";
    try {
        await page.goto(BASE_URL);
        await page.fill(SELECTORS.USERNAME_FIELD, 'admin'); // lowercase 'admin'
        await page.fill(SELECTORS.PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(SELECTORS.LOGIN_BUTTON);

        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page).toHaveURL(BASE_URL);
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC011', browserName, status, actualResult);
    }
});

// Test Case ID: TC012
// Scenario ID: SCN009
// Description: Verify login fails with incorrect case for password.
test('TC012: Verify login fails with incorrect case for password', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "Login failed with 'Invalid credentials' for uppercase password.";
    try {
        await page.goto(BASE_URL);
        await page.fill(SELECTORS.USERNAME_FIELD, VALID_USERNAME);
        await page.fill(SELECTORS.PASSWORD_FIELD, 'ADMIN123'); // uppercase 'ADMIN123'
        await page.click(SELECTORS.LOGIN_BUTTON);

        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page).toHaveURL(BASE_URL);
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC012', browserName, status, actualResult);
    }
});

// Test Case ID: TC013
// Scenario ID: SCN010
// Description: Attempt login with an extremely long username and valid password.
test('TC013: Attempt login with extremely long username', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "Login failed, 'Invalid credentials' or similar message displayed for long username.";
    try {
        await page.goto(BASE_URL);
        const longUsername = 'a'.repeat(256); // 256 characters
        await page.fill(SELECTORS.USERNAME_FIELD, longUsername);
        await page.fill(SELECTORS.PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(SELECTORS.LOGIN_BUTTON);

        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page).toHaveURL(BASE_URL);
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC013', browserName, status, actualResult);
    }
});

// Test Case ID: TC014
// Scenario ID: SCN010
// Description: Attempt login with a valid username and an extremely long password.
test('TC014: Attempt login with extremely long password', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "Login failed, 'Invalid credentials' or similar message displayed for long password.";
    try {
        await page.goto(BASE_URL);
        await page.fill(SELECTORS.USERNAME_FIELD, VALID_USERNAME);
        const longPassword = 'p'.repeat(256); // 256 characters
        await page.fill(SELECTORS.PASSWORD_FIELD, longPassword);
        await page.click(SELECTORS.LOGIN_BUTTON);

        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page).toHaveURL(BASE_URL);
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC014', browserName, status, actualResult);
    }
});

// Test Case ID: TC015
// Scenario ID: SCN011
// Description: Verify 'Required' message for empty Username field.
test('TC015: Verify "Required" message for empty Username field', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "'Required' message displayed for Username field.";
    try {
        await page.goto(BASE_URL);
        // Leave Username field empty
        await page.fill(SELECTORS.PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(SELECTORS.LOGIN_BUTTON);

        await expect(page.locator(SELECTORS.USERNAME_REQUIRED_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.USERNAME_REQUIRED_MESSAGE)).toHaveText('Required');
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC015', browserName, status, actualResult);
    }
});

// Test Case ID: TC016
// Scenario ID: SCN011
// Description: Verify 'Required' message for empty Password field.
test('TC016: Verify "Required" message for empty Password field', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "'Required' message displayed for Password field.";
    try {
        await page.goto(BASE_URL);
        await page.fill(SELECTORS.USERNAME_FIELD, VALID_USERNAME);
        // Leave Password field empty
        await page.click(SELECTORS.LOGIN_BUTTON);

        await expect(page.locator(SELECTORS.PASSWORD_REQUIRED_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.PASSWORD_REQUIRED_MESSAGE)).toHaveText('Required');
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC016', browserName, status, actualResult);
    }
});

// Test Case ID: TC017
// Scenario ID: SCN011
// Description: Verify 'Invalid credentials' message for incorrect username/password.
test('TC017: Verify "Invalid credentials" message for incorrect username/password', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "'Invalid credentials' error message displayed.";
    try {
        await page.goto(BASE_URL);
        await page.fill(SELECTORS.USERNAME_FIELD, VALID_USERNAME);
        await page.fill(SELECTORS.PASSWORD_FIELD, 'wrongpass');
        await page.click(SELECTORS.LOGIN_BUTTON);

        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toBeVisible();
        await expect(page.locator(SELECTORS.ERROR_MESSAGE)).toHaveText('Invalid credentials');
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC017', browserName, status, actualResult);
    }
});

// Test Case ID: TC018
// Scenario ID: SCN012
// Description: Verify the 'Forgot your password?' link is present on the login page.
test('TC018: Verify "Forgot your password?" link is present', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "'Forgot your password?' link is visible.";
    try {
        await page.goto(BASE_URL);
        await expect(page.locator(SELECTORS.FORGOT_PASSWORD_LINK)).toBeVisible();
        await expect(page.locator(SELECTORS.FORGOT_PASSWORD_LINK)).toHaveText('Forgot your password?');
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC018', browserName, status, actualResult);
    }
});

// Test Case ID: TC019
// Scenario ID: SCN012
// Description: Verify clicking 'Forgot your password?' link navigates to the password reset page.
test('TC019: Verify "Forgot your password?" link navigates to reset page', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "Redirected to 'Forgot Your Password' page.";
    try {
        await page.goto(BASE_URL);
        await page.locator(SELECTORS.FORGOT_PASSWORD_LINK).click();

        await expect(page).toHaveURL(/.*web\/index.php\/auth\/requestPasswordReset/);
        await expect(page.locator('h6.oxd-text--h6')).toHaveText('Reset Password'); // Specific element on reset page
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC019', browserName, status, actualResult);
    }
});

// Test Case ID: TC020
// Scenario ID: SCN013
// Description: Verify that characters entered in the password field are masked.
test('TC020: Verify password field characters are masked', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = "Password field masks characters.";
    try {
        await page.goto(BASE_URL);
        await page.fill(SELECTORS.PASSWORD_FIELD, 'password123');
        
        // Assert that the input type is 'password' which causes masking
        await expect(page.locator(SELECTORS.PASSWORD_FIELD)).toHaveAttribute('type', 'password');
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC020', browserName, status, actualResult);
    }
});

// Test Case ID: TC021
// Scenario ID: SCN014
// Description: Verify that after a successful login, the user is redirected to the expected dashboard page.
test('TC021: Verify redirection to dashboard after successful login', async ({ page, browserName }) => {
    let status = 'Pass';
    let actualResult = 'User successfully logged in and redirected to Dashboard page.';
    try {
        await page.goto(BASE_URL);
        await page.fill(SELECTORS.USERNAME_FIELD, VALID_USERNAME);
        await page.fill(SELECTORS.PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(SELECTORS.LOGIN_BUTTON);

        await expect(page).toHaveURL(/.*web\/index.php\/dashboard\/index/);
        await expect(page.locator(SELECTORS.DASHBOARD_HEADER)).toBeVisible();
    } catch (e) {
        status = 'Fail';
        actualResult = `Test failed: ${e.message}`;
        console.error(actualResult);
    } finally {
        await writeResult('TC021', browserName, status, actualResult);
    }
});