/**
 * ============================================================
 * FILE: nameChange.spec.js
 * LOCATION: tests/nameChange.spec.js
 * ============================================================
 *
 * WHAT IS THIS FILE?
 * ------------------
 * This is a Playwright TEST FILE.
 * It tests the "Change User Name" feature on Amazon.in.
 *
 * WHAT DOES THIS TEST DO?
 * ------------------------
 * 1. Opens Amazon.in
 * 2. Logs in with the test account credentials
 * 3. Navigates to Login & Security settings
 * 4. Changes the account name to "Lavanya"
 * 5. Verifies that the name was updated successfully
 *
 * SELF-HEALING DEMO IN THIS TEST:
 * --------------------------------
 * The loginButton locator in UserDetailsPage.js is intentionally
 * set to a wrong value (#nav-link-accountList-nav-line-11).
 *
 * When this test runs:
 *   1. loginButton.click() will fail (wrong locator)
 *   2. GitHub Copilot will be asked to heal it
 *   3. Copilot will suggest: #nav-link-accountList
 *   4. Test retries with the healed locator
 *   5. Test passes ✅
 *
 * CREDENTIALS:
 * ------------
 * Email and password are stored in the .env file (not hardcoded here)
 * for security reasons. They are accessed via process.env.
 * ============================================================
 */

// Import test from the healing fixture
// This is the standard Playwright test runner
import { test } from '../fixtures/healingFixture.js';

// Import the UserDetailsPage class which contains all
// locators and methods for the login and name change flow
import { UserDetailsPage } from '../pages/UserDetailsPage.js';

/**
 * TEST: Change user first name
 * ----------------------------
 * This test verifies that a user can successfully change
 * their display name on Amazon.in.
 *
 * The test uses credentials stored in the .env file:
 *   AMAZON_EMAIL    → The Amazon account email
 *   AMAZON_PASSWORD → The Amazon account password
 */
test('Change user first name', async ({ page }) => {

  // Create a new instance of UserDetailsPage
  // This gives us access to all login and account management methods
  const userPage = new UserDetailsPage(page);

  // Step 1: Open Amazon India home page
  await page.goto('https://www.amazon.in');

  // Step 2: Login to Amazon
  // Credentials are loaded from .env file (AMAZON_EMAIL, AMAZON_PASSWORD)
  // NOTE: The loginButton locator is intentionally broken here.
  //       GitHub Copilot will automatically heal it.
  await userPage.login(
    process.env.AMAZON_EMAIL,    // Email from .env file
    process.env.AMAZON_PASSWORD  // Password from .env file
  );

  // Step 3: Change the account name to "Lavanya"
  // This navigates to Login & Security and updates the name
  await userPage.changeName('Lavanya');

  // Step 4: Verify that the name was updated successfully
  // This checks for the "Name updated" success message on the page
  await userPage.verifyNameUpdated();
});
