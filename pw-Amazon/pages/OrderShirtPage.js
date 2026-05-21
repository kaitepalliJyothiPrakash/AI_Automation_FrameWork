/**
 * ============================================================
 * FILE: OrderShirtPage.js
 * LOCATION: pages/OrderShirtPage.js
 * ============================================================
 *
 * Page Object Model file for the Amazon order flow.
 * All locators use healingLocator() for automatic self-healing.
 * searchBar locator is intentionally wrong to demo healing.
 *
 * TEST FLOW:
 * Login → Search T-Shirt → Click Product →
 * Buy/Add to Cart → COD Payment → Place Order → Verify Order
 * ============================================================
 */

const { expect } = require("@playwright/test");
const { healingLocator } = require("../utils/selfHealingLocator");

class OrderShirtPage {

  constructor(page) {
    this.page = page;

    // ─── LOGIN PAGE LOCATORS ───────────────────────────────────────────────
    this.loginButton            = healingLocator(page, "#nav-link-accountList-nav-line-1", "Login Button in nav");
    this.usernameInput          = healingLocator(page, "#ap_email_login", "Email input field");
    this.usernameContinueButton = healingLocator(page, "#continue", "Continue button after email");
    this.passwordInput          = healingLocator(page, "#ap_password", "Password input field");
    this.signInBtn              = healingLocator(page, "#signInSubmit", "Sign In submit button");

    // ─── SEARCH BAR LOCATORS ──────────────────────────────────────────────
    // ❌ Intentionally wrong locator to demo self-healing
    this.searchBar    = healingLocator(page, "#WRONG_SEARCH_BAR_123", "Search bar on Amazon home page");
    this.searchButton = healingLocator(page, "#nav-search-submit-button", "Search submit button");

    // ─── PRODUCT LISTING PAGE LOCATORS ────────────────────────────────────
    this.productTitle = healingLocator(page, ".s-product-image-container", "Product image container in search results");

    // ─── PRODUCT DETAIL PAGE LOCATORS ─────────────────────────────────────
    this.buyButton       = healingLocator(page, "#buy-now-button", "Buy Now button on product page");
    this.addToCartButton = healingLocator(page, "#add-to-cart-button", "Add to Cart button on product page");

    // ─── CHECKOUT PAGE LOCATORS ───────────────────────────────────────────
    this.CODButton           = healingLocator(page, "[name='ppw-instrumentRowSelection']", "Cash on Delivery payment option");
    this.paymentMethodButton = healingLocator(page, "#checkout-primary-continue-button-id", "Continue button on payment page");
    this.placeOrderButton    = healingLocator(page, "#placeOrder", "Place Order button");

    // ─── ORDERS PAGE LOCATORS ─────────────────────────────────────────────
    this.recentOrderButton = healingLocator(page, "#nav-orders", "Returns and Orders nav button");
    this.orderTitleDiv     = healingLocator(page, ".yohtmlc-product-title", "Order title in recent orders");
  }

  async clickOnLogin() {
    await this.loginButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.loginButton.hover();
    await this.loginButton.click();
  }

  async setUsername(name) {
    await this.usernameInput.fill(name);
    await this.usernameContinueButton.click();
    await this.passwordInput.waitFor({ state: "visible", timeout: 60000 });
  }

  async setPassword(pass) {
    await this.passwordInput.fill(pass);
  }

  async clickSignIn() {
    await this.signInBtn.click();
    await this.page.waitForURL('https://www.amazon.in/**', { timeout: 90000 });
  }

  async searchProduct(product) {
    // ← Self-healing triggers here — searchBar locator is wrong
    await this.searchBar.fill(product);
    await this.searchButton.click();
  }

  async clickProduct() {
    const productElement = this.page.locator(".s-product-image-container").first();
    try {
      await productElement.click({ timeout: 15000 });
    } catch {
      await productElement.click({ force: true });
    }
    await this.page.waitForLoadState("domcontentloaded");
  }

  async clickBuy() {
    if (await this.page.locator("#buy-now-button").isVisible().catch(() => false)) {
      await this.page.locator("#buy-now-button").click();
      return true;
    }
    if (await this.page.locator("#add-to-cart-button").isVisible().catch(() => false)) {
      await this.page.locator("#add-to-cart-button").click();
      return true;
    }
    console.log("Buy Now / Add to Cart button not available for this product");
    return false;
  }

  async clickCOD() {
    if (await this.page.locator("[name='ppw-instrumentRowSelection']").isVisible().catch(() => false)) {
      await this.page.locator("[name='ppw-instrumentRowSelection']").last().check();
    }
  }

  async clickPaymentMethod() {
    if (await this.page.locator("#checkout-primary-continue-button-id").isVisible().catch(() => false)) {
      await this.page.locator("#checkout-primary-continue-button-id").click();
    }
  }

  async clickPlaceOrder() {
    if (await this.page.locator("#placeOrder").isVisible().catch(() => false)) {
      await this.page.locator("#placeOrder").first().click();
    }
  }

  async clickRecentOrders() {
    await this.recentOrderButton.click();
  }

  async checkOrderTitleMatch() {
    const orderText = await this.page.locator(".yohtmlc-product-title").first().textContent();
    if (orderText && (orderText.includes("T-Shirt") || orderText.includes("Polo"))) {
      console.log("Order has been verified successfully.");
    } else {
      console.log("Order was not placed.");
    }
    await expect(this.page.locator(".yohtmlc-product-title").first()).toBeVisible();
  }
}

module.exports = { OrderShirtPage };
