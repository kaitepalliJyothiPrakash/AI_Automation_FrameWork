/**
 * ============================================================
 * FILE: UserDetailsPage.js
 * LOCATION: pages/UserDetailsPage.js
 * ============================================================
 *
 * WHAT IS THIS FILE?
 * ------------------
 * This is a Page Object Model (POM) file for the Amazon Login
 * and Account Management pages.
 *
 * WHAT IS PAGE OBJECT MODEL (POM)?
 * ---------------------------------
 * POM is a design pattern where:
 *   - All locators (element selectors) are defined in one place
 *   - All actions (click, fill, etc.) are written as methods
 *   - Test files just call these methods — no locator code in tests
 *
 * This makes tests easy to read and maintain.
 * If a locator changes, you only update it in ONE place (here).
 *
 * WHAT PAGES DOES THIS COVER?
 * ----------------------------
 * 1. Amazon Login Page     → email, password, sign in
 * 2. Amazon Account Page   → My Account, Login & Security
 * 3. Edit Name Page        → Edit name, save changes
 *
 * SELF-HEALING IN THIS FILE:
 * --------------------------
 * Instead of normal page.locator(), we use healingLocator().
 * This means if any locator breaks (e.g., Amazon changes an ID),
 * GitHub Copilot will automatically suggest the correct locator.
 *
 * The loginButton locator is intentionally set to a WRONG value
 * (#nav-link-accountList-nav-line-11 — extra "1" at the end)
 * to demonstrate that self-healing works.
 * ============================================================
 */

import { expect } from '@playwright/test';

// Import the self-healing locator wrapper
// This replaces normal page.locator() with AI-powered healing capability
import { healingLocator } from '../utils/selfHealingLocator.js';

export class UserDetailsPage {

  /**
   * constructor()
   * -------------
   * This runs when we create a new UserDetailsPage object.
   * It defines all the locators (element selectors) for this page.
   *
   * Each locator uses healingLocator() with 3 parameters:
   *   1. page       → The Playwright page object
   *   2. selector   → The CSS/ID selector for the element
   *   3. description → Human-readable name (sent to GitHub Copilot
   *                    when healing is needed — helps Copilot understand
   *                    WHAT element to find)
   *
   * @param {Page} page - The Playwright browser page
   */
  constructor(page) {
    this.page = page;

    // ─── LOGIN PAGE LOCATORS ───────────────────────────────────────────────

    /**
     * ❌ INTENTIONALLY BROKEN LOCATOR — FOR SELF-HEALING DEMO
     * The correct locator is: #nav-link-accountList-nav-line-1
     * We added an extra "1" at the end to make it wrong.
     * When the test runs, this locator will fail.
     * GitHub Copilot will automatically heal it to the correct one.
     */
    this.loginButton = healingLocator(
      page,
      '#nav-link-accountList-nav-line-11',  // ❌ Wrong — extra "1"
      'Login Button in nav'                  // Description for Copilot
    );

    // Email input field on the Amazon login page
    this.usernameInput = healingLocator(
      page,
      '#ap_email_login',
      'Email/Username input field'
    );

    // "Continue" button clicked after entering email
    this.usernameContinueButton = healingLocator(
      page,
      '#continue',
      'Continue button after email entry'
    );

    // Password input field
    this.passwordInput = healingLocator(
      page,
      '#ap_password',
      'Password input field'
    );

    // "Sign In" submit button
    this.signInBtn = healingLocator(
      page,
      '#signInSubmit',
      'Sign In submit button'
    );

    // ─── ACCOUNT PAGE LOCATORS ────────────────────────────────────────────

    // "Hello, [Name]" button in the top navigation bar
    // Clicking this opens the account dropdown menu
    this.myAccountButton = healingLocator(
      page,
      '#nav-link-accountList-nav-line-1',
      'My Account nav button'
    );

    // "Login & security" link in the account dropdown
    this.loginAndSecurityButton = healingLocator(
      page,
      'text=Login & security',
      'Login and Security menu item'
    );

    // ─── EDIT NAME PAGE LOCATORS ──────────────────────────────────────────

    // "Edit" button next to the Name section on Login & Security page
    this.editNameButton = healingLocator(
      page,
      '#NAME_BUTTON',
      'Edit Name button'
    );

    // Input field where the new name is typed
    this.nameInputBox = healingLocator(
      page,
      '#ap_customer_name',
      'Customer name input box'
    );

    // "Save changes" button after entering the new name
    this.saveChangesButton = healingLocator(
      page,
      '.a-button-input',
      'Save Changes button'
    );

    // Success message shown after name is updated successfully
    this.successMsg = healingLocator(
      page,
      'text=Name updated',
      'Name updated success message'
    );
  }

  /**
   * login()
   * -------
   * Performs the complete Amazon login flow.
   *
   * STEPS:
   * 1. Click the login button in the navigation bar
   * 2. Enter the email address
   * 3. Click "Continue"
   * 4. Enter the password
   * 5. Click "Sign In"
   * 6. Wait for the account button to appear (confirms login success)
   *
   * NOTE: The loginButton locator is intentionally broken.
   * GitHub Copilot will heal it automatically during step 1.
   *
   * @param {string} username - Amazon account email address
   * @param {string} password - Amazon account password
   */
  async login(username, password) {
    // Step 1: Click login button (self-healing will trigger here if locator is wrong)
    await this.loginButton.click();

    // Step 2: Enter email address
    await this.usernameInput.fill(username);

    // Step 3: Click Continue to go to password page
    await this.usernameContinueButton.click();

    // Step 4: Enter password
    await this.passwordInput.fill(password);

    // Step 5: Click Sign In
    await this.signInBtn.click();

    // Step 6: Wait for the account button to be visible
    // This confirms that login was successful
    // Timeout is 90 seconds to handle slow network connections
    await this.myAccountButton.waitFor({ state: 'visible', timeout: 90000 });
  }

  /**
   * changeName()
   * ------------
   * Changes the user's display name on Amazon.
   *
   * STEPS:
   * 1. Click "My Account" button
   * 2. Click "Login & security"
   * 3. Wait for page to load (Amazon may redirect to re-auth page)
   * 4. Handle re-authentication if Amazon asks for password again
   * 5. Close Rufus AI panel if it appears (it blocks clicks)
   * 6. Click "Edit" next to Name
   * 7. Enter the new name
   * 8. Click "Save changes"
   *
   * @param {string} newName - The new name to set for the account
   */
  async changeName(newName) {
    // Step 1: Click My Account button to open account menu
    await this.myAccountButton.click();

    // Step 2: Click "Login & security" from the dropdown
    await this.loginAndSecurityButton.click();

    // Step 3: Wait for the page to fully load
    // Amazon sometimes redirects through multiple pages here
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    // Step 4: Handle Amazon re-authentication
    // Amazon sometimes asks you to enter your password again
    // before showing the Login & Security page (security feature)
    try {
      const reAuthPassword = this.page.locator('#ap_password');
      if (await reAuthPassword.isVisible({ timeout: 5000 })) {
        // Password field is visible — Amazon wants re-authentication
        await reAuthPassword.fill(process.env.AMAZON_PASSWORD);
        await this.page.locator('#signInSubmit').click();
        // Wait for the page to load after re-authentication
        await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      }
    } catch {
      // No re-authentication needed — continue normally
    }

    // Step 5: Close Amazon Rufus AI panel if it appears
    // Amazon sometimes shows a Rufus AI assistant panel
    // that overlays the page and blocks clicks on other elements
    try {
      const rufusClose = this.page.locator('#zumaRufusContinueToSite-announce');
      if (await rufusClose.isVisible({ timeout: 3000 })) {
        await rufusClose.click();
        // Small wait to let the panel close completely
        await this.page.waitForTimeout(1000);
      }
    } catch {
      // Rufus panel is not present — continue normally
    }

    // Step 6: Wait for the Edit Name button to be visible
    // This confirms the Login & Security page has fully loaded
    await this.page.locator('#NAME_BUTTON').waitFor({ state: 'visible', timeout: 30000 });

    // Step 7: Click the "Edit" button next to Name
    await this.editNameButton.click();

    // Step 8: Clear the existing name and type the new name
    await this.nameInputBox.fill(newName);

    // Step 9: Click "Save changes" to save the new name
    await this.saveChangesButton.click();
  }

  /**
   * verifyNameUpdated()
   * -------------------
   * Verifies that the name was updated successfully.
   *
   * After saving the name, Amazon shows a "Name updated" message.
   * This method checks that the message is visible on the page.
   * If the message is not visible, the test will fail.
   */
  async verifyNameUpdated() {
    // Assert that the "Name updated" success message is visible
    await expect(this.page.locator('text=Name updated')).toBeVisible();
  }
}
