import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  private readonly usernameInput = this.page.locator('input[name="username"]');
  private readonly passwordInput = this.page.locator('input[name="password"]');
  private readonly loginButton = this.page.locator('button[type="submit"]');
  private readonly forgotPasswordLink = this.page.locator('.orangehrm-login-forgot-header');
  private readonly invalidCredentialsError = this.page.locator('.oxd-alert-content-text');
  private readonly fieldErrorMessages = this.page.locator('.oxd-input-field-error-message');
  private readonly pageHeading = this.page.locator('.oxd-topbar-header-breadcrumb-module');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/web/index.php/auth/login');
    await this.waitForPageLoad();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async assertLoginSuccess(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.page).toHaveURL(/dashboard/);
  }

  async assertInvalidCredentialsError(): Promise<void> {
    await expect(this.invalidCredentialsError).toBeVisible();
    await expect(this.invalidCredentialsError).toContainText('Invalid credentials');
  }

  async assertFieldRequiredError(): Promise<void> {
    await expect(this.fieldErrorMessages.first()).toBeVisible();
    await expect(this.fieldErrorMessages.first()).toContainText('Required');
  }

  async assertBothFieldsRequiredError(): Promise<void> {
    await expect(this.fieldErrorMessages).toHaveCount(2);
    for (const msg of await this.fieldErrorMessages.all()) {
      await expect(msg).toContainText('Required');
    }
  }

  async assertPasswordFieldIsMasked(): Promise<void> {
    await expect(this.passwordInput).toHaveAttribute('type', 'password');
  }

  async assertLoginPageElementsVisible(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.forgotPasswordLink).toBeVisible();
  }

  async assertLoginPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/auth\/login/);
    await expect(this.usernameInput).toBeVisible();
  }

  async assertErrorOrRequiredMessageDisplayed(): Promise<void> {
    const invalidCredentialsVisible = await this.invalidCredentialsError.isVisible();
    const fieldErrorVisible = await this.fieldErrorMessages.first().isVisible();
    expect(invalidCredentialsVisible || fieldErrorVisible).toBeTruthy();
  }
}

export class ForgotPasswordPage extends BasePage {
  private readonly pageTitle = this.page.locator('.orangehrm-forgot-password-title');
  private readonly usernameInput = this.page.locator('input[name="username"]');
  private readonly resetPasswordButton = this.page.locator('.orangehrm-forgot-password-button--reset');
  private readonly cancelButton = this.page.locator('.orangehrm-forgot-password-button--cancel');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/web/index.php/auth/requestPasswordResetCode');
    await this.waitForPageLoad();
  }

  async assertForgotPasswordPageLoaded(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.page).toHaveURL(/requestPasswordResetCode/);
  }

  async assertCancelButtonVisible(): Promise<void> {
    await expect(this.cancelButton).toBeVisible();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async clickResetPassword(): Promise<void> {
    await this.resetPasswordButton.click();
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }
}