/**
 * ============================================================
 * FILE: amazonOrder.spec.js
 * LOCATION: tests/amazonOrder.spec.js
 * ============================================================
 *
 * WHAT IS THIS FILE?
 * ------------------
 * This is a Playwright TEST FILE.
 * It tests the complete "Order a T-Shirt" flow on Amazon.in.
 *
 * WHAT DOES THIS TEST DO?
 * ------------------------
 * 1. Opens Amazon.in
 * 2. Logs in with the test account
 * 3. Searches for "T-Shirt"
 * 4. Clicks on the first product
 * 5. Clicks "Buy Now" or "Add to Cart"
 * 6. Selects Cash on Delivery payment
 * 7. Places the order
 * 8. Navigates to Recent Orders
 * 9. Verifies the order appears in the list
 *
 * SELF-HEALING DEMO IN THIS TEST:
 * --------------------------------
 * The searchBar locator in OrderShirtPage.js is intentionally
 * set to a wrong value (#WRONG_SEARCH_BAR_123).
 *
 * When this test runs:
 *   1. searchBar.fill("T-Shirt") will fail (wrong locator)
 *   2. GitHub Copilot will be asked to heal it
 *   3. Copilot will suggest: #twotabsearchtextbox
 *   4. Test retries with the healed locator
 *   5. Test passes ✅
 * ============================================================
 */

// Import Playwright test runner
import { test } from '@playwright/test';

// Import the OrderShirtPage class which contains all
// locators and methods for the Amazon order flow
import { OrderShirtPage } from '../pages/OrderShirtPage';

/**
 * TEST: Order T-Shirt and place order
 * ------------------------------------
 * This test covers the complete end-to-end order flow on Amazon.in.
 * It demonstrates self-healing when the search bar locator is broken.
 */
test('Order T‑Shirt and place order', async ({ page }) => {

  // Create a new instance of OrderShirtPage
  // This gives us access to all order flow methods
  const orderShirtPage = new OrderShirtPage(page);

  // ─── STEP 1: OPEN AMAZON ──────────────────────────────────────────────────
  await page.goto('https://www.amazon.in');

  // ─── STEP 2: LOGIN ────────────────────────────────────────────────────────

  // Click the login button in the navigation bar
  await orderShirtPage.clickOnLogin();

  // Enter email address and click Continue
  await orderShirtPage.setUsername('plantifulsoul1112@gmail.com');

  // Enter password
  await orderShirtPage.setPassword('Lavanya@2003');

  // Click Sign In and wait for home page to load
  await orderShirtPage.clickSignIn();

  // ─── STEP 3: SEARCH FOR PRODUCT ───────────────────────────────────────────

  // Search for T-Shirt
  // NOTE: searchBar locator is intentionally broken (#WRONG_SEARCH_BAR_123)
  //       GitHub Copilot will automatically heal it to #twotabsearchtextbox
  await orderShirtPage.searchProduct('T‑Shirt');

  // ─── STEP 4: CLICK ON PRODUCT ─────────────────────────────────────────────

  // Click on the first product in search results
  await orderShirtPage.clickProduct();

  // ─── STEP 5: BUY THE PRODUCT ──────────────────────────────────────────────

  // Click Buy Now or Add to Cart (whichever is available)
  await orderShirtPage.clickBuy();

  // ─── STEP 6: COMPLETE PAYMENT ─────────────────────────────────────────────

  // Select Cash on Delivery payment option (if available)
  await orderShirtPage.clickCOD();

  // Click Continue on payment method page
  await orderShirtPage.clickPaymentMethod();

  // Click Place Order to finalize the order
  await orderShirtPage.clickPlaceOrder();

  // ─── STEP 7: VERIFY ORDER ─────────────────────────────────────────────────

  // Navigate to Returns & Orders page
  await orderShirtPage.clickRecentOrders();

  // Verify the T-Shirt order appears in the recent orders list
  await orderShirtPage.checkOrderTitleMatch();
});
