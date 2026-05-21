/**
 * ============================================================
 * FILE: healingFixture.js
 * LOCATION: fixtures/healingFixture.js
 * ============================================================
 *
 * WHAT IS THIS FILE?
 * ------------------
 * This is a Playwright FIXTURE file.
 *
 * WHAT IS A FIXTURE IN PLAYWRIGHT?
 * ---------------------------------
 * A fixture is a way to set up reusable test dependencies.
 * Instead of creating a new UserDetailsPage in every test file,
 * you define it once here as a fixture.
 * Then any test can use it directly without extra setup code.
 *
 * Think of it like a "helper" that prepares things before the test runs.
 *
 * WHAT DOES THIS FIXTURE PROVIDE?
 * --------------------------------
 * It extends the base Playwright test with a pre-configured
 * UserDetailsPage object that is ready to use in any test.
 *
 * HOW TO USE IN TEST FILES?
 * --------------------------
 * Instead of:
 *   import { test } from '@playwright/test';
 *
 * Use:
 *   import { test } from '../fixtures/healingFixture.js';
 *
 * Then in your test:
 *   test('my test', async ({ page, userDetailsPage }) => {
 *     await userDetailsPage.login(email, password);
 *   });
 *
 * The userDetailsPage is automatically created and injected
 * into your test — no manual setup needed.
 * ============================================================
 */

// Import the base Playwright test object
// We will extend this with our custom fixtures
const { test: base } = require('@playwright/test');

// Import UserDetailsPage so we can create it as a fixture
const { UserDetailsPage } = require('../pages/UserDetailsPage');

/**
 * Extended test object with self-healing fixtures
 *
 * base.extend() adds new fixtures to the standard Playwright test.
 * Any test that imports from this file gets access to these fixtures.
 */
exports.test = base.extend({

  /**
   * userDetailsPage fixture
   * -----------------------
   * Automatically creates a UserDetailsPage instance for each test.
   *
   * HOW IT WORKS:
   * - Playwright calls this function before each test
   * - It creates a new UserDetailsPage with the current page
   * - The page object is passed to the test via the { userDetailsPage } parameter
   * - After the test finishes, Playwright cleans up automatically
   *
   * USAGE IN TEST:
   *   test('change name', async ({ userDetailsPage }) => {
   *     await userDetailsPage.login(email, password);
   *     await userDetailsPage.changeName('New Name');
   *   });
   *
   * @param {Page} page - The Playwright page (automatically provided by Playwright)
   * @param {Function} use - Playwright's function to pass the fixture to the test
   */
  userDetailsPage: async ({ page }, use) => {
    // Create a new UserDetailsPage instance with the current browser page
    // This UserDetailsPage has all self-healing locators built in
    const userDetailsPage = new UserDetailsPage(page);

    // Pass the userDetailsPage to the test
    // The test can now use it as: async ({ userDetailsPage }) => { ... }
    await use(userDetailsPage);

    // After the test completes, Playwright automatically handles cleanup
    // (closing the page, browser context, etc.)
  },

});

/**
 * Export expect so test files can use assertions
 * This allows: import { test, expect } from '../fixtures/healingFixture.js'
 */
exports.expect = base.expect;
