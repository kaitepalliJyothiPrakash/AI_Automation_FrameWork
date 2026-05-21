import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// --- Constants ---
const BASE_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
const VALID_USERNAME = 'Admin';
const VALID_PASSWORD = 'admin123';
const LONG_STRING = 'a'.repeat(256); // 256 characters for long input tests

// --- Selectors ---
const USERNAME_FIELD = 'input[name="username"]';
const PASSWORD_FIELD = 'input[name="password"]';
const LOGIN_BUTTON = 'button[type="submit"]';
const ERROR_MESSAGE = '.oxd-alert-content-text';
const DASHBOARD_HEADER = '.oxd-topbar-header-breadcrumb'; // e.g., "PIM" module header on dashboard
const USERNAME_REQUIRED_MESSAGE = '//div[label[text()="Username"]]/following-sibling::span[text()="Required"]';
const PASSWORD_REQUIRED_MESSAGE = '//div[label[text()="Password"]]/following-sibling::span[text()="Required"]';
const FORGOT_PASSWORD_LINK = '.orangehrm-login-forgot-header'; // Text: "Forgot your password?"

// --- Test Results Management ---
const outputDir = 'output';
const resultFile = path.resolve(outputDir, 'test_results.json');
let defectIdCounter = 1; // Counter for unique defect IDs

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Helper function to record test results to a JSON file.
 * @param {string} testCaseId - The unique ID for the test case (e.g., 'TC001').
 * @param {'Pass'|'Fail'} status - The outcome of the test.
 * @param {string} actualResult - A description of what actually happened.
 * @param {string|null} [defectId=null] - A unique ID for the defect if the test failed.
 */
async function recordTestResult(testCaseId, status, actualResult, defectId = null) {
    let results = [];
    if (fs.existsSync(resultFile)) {
        try {
            results = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
        } catch (e) {
            console.error(`Error reading existing test_results.json: ${e.message}. Starting with an empty results array.`);
            results = []; // If file is corrupt, start fresh
        }
    }

    const testResult = {
        test_case_id: testCaseId,
        status: status,
        actual_result: actualResult,
    };
    if (defectId) {
        testResult.defect_id = defectId;
    }

    results.push(testResult);
    fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
}

// --- Test Cases ---

test('Test Case 1: Verify login with default valid username and password.', async ({ page }) => {
    const testCaseId = 'TC001';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;

    try {
        await page.goto(BASE_URL);
        await page.fill(USERNAME_FIELD, VALID_USERNAME);
        await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(LOGIN_BUTTON);

        // Expect dashboard header to be visible after successful login
        await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
        actualResult = 'User successfully logged in and dashboard header is visible.';
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test('Test Case 2: Verify that after successful login, the user is redirected to the correct post-login page.', async ({ page }) => {
    const testCaseId = 'TC002';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;

    try {
        await page.goto(BASE_URL);
        await page.fill(USERNAME_FIELD, VALID_USERNAME);
        await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(LOGIN_BUTTON);

        // Expect URL to change to dashboard and dashboard header to be visible
        await expect(page.url()).toContain('/web/index.php/dashboard/index');
        await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
        actualResult = 'User successfully logged in, URL redirected to dashboard, and dashboard elements are visible.';
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test('Test Case 3: Verify login failure with an invalid username and correct password.', async ({ page }) => {
    const testCaseId = 'TC003';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;

    try {
        await page.goto(BASE_URL);
        await page.fill(USERNAME_FIELD, 'InvalidUser'); // Invalid username
        await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(LOGIN_BUTTON);

        // Expect error message and to remain on login page
        await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page.url()).toContain('/web/index.php/auth/login');
        actualResult = 'Login failed with invalid username; "Invalid credentials" message displayed, remained on login page.';
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test('Test Case 4: Verify login failure with a valid username and invalid password.', async ({ page }) => {
    const testCaseId = 'TC004';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;

    try {
        await page.goto(BASE_URL);
        await page.fill(USERNAME_FIELD, VALID_USERNAME);
        await page.fill(PASSWORD_FIELD, 'wrongpass'); // Invalid password
        await page.click(LOGIN_BUTTON);

        // Expect error message and to remain on login page
        await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page.url()).toContain('/web/index.php/auth/login');
        actualResult = 'Login failed with invalid password; "Invalid credentials" message displayed, remained on login page.';
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test('Test Case 5: Verify login failure with both invalid username and invalid password.', async ({ page }) => {
    const testCaseId = 'TC005';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;

    try {
        await page.goto(BASE_URL);
        await page.fill(USERNAME_FIELD, 'InvalidUser'); // Invalid username
        await page.fill(PASSWORD_FIELD, 'wrongpass'); // Invalid password
        await page.click(LOGIN_BUTTON);

        // Expect error message and to remain on login page
        await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page.url()).toContain('/web/index.php/auth/login');
        actualResult = 'Login failed with both invalid username and password; "Invalid credentials" message displayed, remained on login page.';
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test('Test Case 6: Verify that username field is case-sensitive.', async ({ page }) => {
    const testCaseId = 'TC006';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;

    try {
        await page.goto(BASE_URL);
        await page.fill(USERNAME_FIELD, 'admin'); // lowercase 'admin'
        await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(LOGIN_BUTTON);

        // Expect error message, indicating case-sensitivity, and to remain on login page
        await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page.url()).toContain('/web/index.php/auth/login');
        actualResult = 'Login failed with lowercase username, indicating case-sensitivity. "Invalid credentials" message displayed.';
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test('Test Case 7: Verify that password field is case-sensitive.', async ({ page }) => {
    const testCaseId = 'TC007';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;

    try {
        await page.goto(BASE_URL);
        await page.fill(USERNAME_FIELD, VALID_USERNAME);
        await page.fill(PASSWORD_FIELD, 'Admin123'); // changed case 'A'
        await page.click(LOGIN_BUTTON);

        // Expect error message, indicating case-sensitivity, and to remain on login page
        await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page.url()).toContain('/web/index.php/auth/login');
        actualResult = 'Login failed with changed-case password, indicating case-sensitivity. "Invalid credentials" message displayed.';
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test('Test Case 8: Verify UI validation message when both username and password fields are left empty.', async ({ page }) => {
    const testCaseId = 'TC008';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;

    try {
        await page.goto(BASE_URL);
        // Leave username and password empty
        await page.click(LOGIN_BUTTON);

        // Expect "Required" messages for both fields and to remain on login page
        await expect(page.locator(USERNAME_REQUIRED_MESSAGE)).toBeVisible();
        await expect(page.locator(PASSWORD_REQUIRED_MESSAGE)).toBeVisible();
        await expect(page.url()).toContain('/web/index.php/auth/login');
        actualResult = 'Both "Required" messages displayed for username and password fields, remained on login page.';
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test('Test Case 9: Verify UI validation message when username field is empty and password field is filled.', async ({ page }) => {
    const testCaseId = 'TC009';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;

    try {
        await page.goto(BASE_URL);
        await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(LOGIN_BUTTON);

        // Expect "Required" message for username only and to remain on login page
        await expect(page.locator(USERNAME_REQUIRED_MESSAGE)).toBeVisible();
        await expect(page.locator(PASSWORD_REQUIRED_MESSAGE)).not.toBeVisible();
        await expect(page.url()).toContain('/web/index.php/auth/login');
        actualResult = '"Required" message displayed for username field only, remained on login page.';
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test('Test Case 10: Verify UI validation message when username field is filled and password field is empty.', async ({ page }) => {
    const testCaseId = 'TC010';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;

    try {
        await page.goto(BASE_URL);
        await page.fill(USERNAME_FIELD, VALID_USERNAME);
        // Leave password empty
        await page.click(LOGIN_BUTTON);

        // Expect "Required" message for password only and to remain on login page
        await expect(page.locator(USERNAME_REQUIRED_MESSAGE)).not.toBeVisible();
        await expect(page.locator(PASSWORD_REQUIRED_MESSAGE)).toBeVisible();
        await expect(page.url()).toContain('/web/index.php/auth/login');
        actualResult = '"Required" message displayed for password field only, remained on login page.';
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test("Test Case 11: Verify system's resilience against SQL injection attempt in the username field.", async ({ page }) => {
    const testCaseId = 'TC011';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;
    const sqlInjectionUsername = VALID_USERNAME + "' OR '1'='1'--";

    try {
        await page.goto(BASE_URL);
        await page.fill(USERNAME_FIELD, sqlInjectionUsername);
        await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(LOGIN_BUTTON);

        // Expect 'Invalid credentials' and no unexpected login
        await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials', { timeout: 5000 });
        await expect(page.url()).toContain('/web/index.php/auth/login');
        await expect(page.locator(DASHBOARD_HEADER)).not.toBeVisible(); // Ensure no login occurred
        actualResult = 'SQL injection attempt in username field resulted in "Invalid credentials" and no login.';
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test("Test Case 12: Verify system's resilience against SQL injection attempt in the password field.", async ({ page }) => {
    const testCaseId = 'TC012';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;
    const sqlInjectionPassword = VALID_PASSWORD + "' OR '1'='1'--";

    try {
        await page.goto(BASE_URL);
        await page.fill(USERNAME_FIELD, VALID_USERNAME);
        await page.fill(PASSWORD_FIELD, sqlInjectionPassword);
        await page.click(LOGIN_BUTTON);

        // Expect 'Invalid credentials' and no unexpected login
        await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials', { timeout: 5000 });
        await expect(page.url()).toContain('/web/index.php/auth/login');
        await expect(page.locator(DASHBOARD_HEADER)).not.toBeVisible(); // Ensure no login occurred
        actualResult = 'SQL injection attempt in password field resulted in "Invalid credentials" and no login.';
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test("Test Case 13: Verify system's resilience against XSS/HTML injection attempt in the username field.", async ({ page }) => {
    const testCaseId = 'TC013';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;
    const xssUsername = '<script>alert("XSS")</script>';

    try {
        await page.goto(BASE_URL);
        // Set up a listener for dialogs (like alerts) that would be triggered by XSS
        page.on('dialog', async dialog => {
            if (dialog.type() === 'alert') {
                await dialog.dismiss(); // Dismiss the alert to prevent the test from hanging
                throw new Error('XSS alert dialog detected!'); // Fail the test if an alert appears
            }
        });

        await page.fill(USERNAME_FIELD, xssUsername);
        await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(LOGIN_BUTTON);

        // Expect 'Invalid credentials' and no alert/script execution
        await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page.url()).toContain('/web/index.php/auth/login');
        actualResult = 'XSS attempt in username field resulted in "Invalid credentials" and no alert/script execution.';
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test("Test Case 14: Verify system's resilience against XSS/HTML injection attempt in the password field.", async ({ page }) => {
    const testCaseId = 'TC014';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;
    const xssPassword = '"><img src=x onerror=alert(1)>';

    try {
        await page.goto(BASE_URL);
        page.on('dialog', async dialog => {
            if (dialog.type() === 'alert') {
                await dialog.dismiss();
                throw new Error('XSS alert dialog detected!');
            }
        });

        await page.fill(USERNAME_FIELD, VALID_USERNAME);
        await page.fill(PASSWORD_FIELD, xssPassword);
        await page.click(LOGIN_BUTTON);

        // Expect 'Invalid credentials' and no alert/script execution
        await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page.url()).toContain('/web/index.php/auth/login');
        actualResult = 'XSS attempt in password field resulted in "Invalid credentials" and no alert/script execution.';
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test("Test Case 15: Verify handling of very long username input.", async ({ page }) => {
    const testCaseId = 'TC015';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;

    try {
        await page.goto(BASE_URL);
        await page.fill(USERNAME_FIELD, LONG_STRING);
        await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
        await page.click(LOGIN_BUTTON);

        // Expect it to behave like an invalid login gracefully
        await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page.url()).toContain('/web/index.php/auth/login');
        
        const usernameFieldValue = await page.locator(USERNAME_FIELD).inputValue();
        if (usernameFieldValue.length === LONG_STRING.length) {
            actualResult = `Very long username input handled gracefully (no crash), resulting in 'Invalid credentials'. Input field retained full long string.`;
        } else {
            actualResult = `Very long username input handled gracefully (no crash), resulting in 'Invalid credentials'. Input field truncated the long string.`;
        }
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test("Test Case 16: Verify handling of very long password input.", async ({ page }) => {
    const testCaseId = 'TC016';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;

    try {
        await page.goto(BASE_URL);
        await page.fill(USERNAME_FIELD, VALID_USERNAME);
        await page.fill(PASSWORD_FIELD, LONG_STRING);
        await page.click(LOGIN_BUTTON);

        // Expect it to behave like an invalid login gracefully
        await expect(page.locator(ERROR_MESSAGE)).toHaveText('Invalid credentials');
        await expect(page.url()).toContain('/web/index.php/auth/login');
        // Check password field masking visually by asserting its type attribute
        await expect(page.locator(PASSWORD_FIELD)).toHaveAttribute('type', 'password');
        actualResult = 'Very long password input handled gracefully (no crash), resulting in "Invalid credentials" and password field masking maintained.';
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test("Test Case 17: Verify the presence and functionality of the 'Forgot your password?' link.", async ({ page }) => {
    const testCaseId = 'TC017';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;

    try {
        await page.goto(BASE_URL);
        // Expect the link to be visible and click it
        await expect(page.locator(FORGOT_PASSWORD_LINK)).toBeVisible();
        await page.click(FORGOT_PASSWORD_LINK);

        // Expect redirection to the reset password page
        await expect(page.url()).toContain('/web/index.php/auth/requestPasswordReset');
        await expect(page.locator('.orangehrm-forgot-password-title')).toHaveText('Reset Password'); // Check a specific element on the new page
        actualResult = "Forgot your password? link is present and redirects to the Reset Password page.";
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});

test("Test Case 18: Verify that characters entered in the password field are masked.", async ({ page }) => {
    const testCaseId = 'TC018';
    let status = 'Pass';
    let actualResult = '';
    let defectId = null;

    try {
        await page.goto(BASE_URL);
        await page.fill(PASSWORD_FIELD, VALID_PASSWORD);

        // Assert that the input field's 'type' attribute is 'password' to confirm masking
        await expect(page.locator(PASSWORD_FIELD)).toHaveAttribute('type', 'password');
        actualResult = 'Characters entered in the password field are masked (input type="password").';
    } catch (error) {
        status = 'Fail';
        defectId = `DEF${String(defectIdCounter++).padStart(3, '0')}`;
        actualResult = `Test failed: ${error.message}`;
        console.error(`Test Case ${testCaseId} failed:`, error);
    } finally {
        await recordTestResult(testCaseId, status, actualResult, defectId);
    }
});