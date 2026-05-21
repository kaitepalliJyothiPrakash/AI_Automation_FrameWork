import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ForgotPasswordPage } from "../pages/LoginPage";

test.describe("OrangeHRM Login Page", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("Valid login with correct username and password", async ({ page }) => {
    await loginPage.login(
      process.env.TEST_USERNAME!,
      process.env.TEST_PASSWORD!
    );
    await loginPage.assertLoginSuccess();
  });

  test(
    "Login fails with invalid username and valid password",
    { tag: "@negative" },
    async ({ page }) => {
      await loginPage.login("invalidUser", process.env.TEST_PASSWORD!);
      await loginPage.assertInvalidCredentialsError();
    }
  );

  test(
    "Login fails with valid username and invalid password",
    { tag: "@negative" },
    async ({ page }) => {
      await loginPage.login(process.env.TEST_USERNAME!, "wrongPassword");
      await loginPage.assertInvalidCredentialsError();
    }
  );

  test(
    "Login fails with both invalid username and invalid password",
    { tag: "@negative" },
    async ({ page }) => {
      await loginPage.login("fakeUser", "fakePass");
      await loginPage.assertInvalidCredentialsError();
    }
  );

  test(
    "Login fails when username field is left blank",
    { tag: "@negative" },
    async ({ page }) => {
      await loginPage.enterPassword(process.env.TEST_PASSWORD!);
      await loginPage.clickLogin();
      await loginPage.assertFieldRequiredError();
    }
  );

  test(
    "Login fails when password field is left blank",
    { tag: "@negative" },
    async ({ page }) => {
      await loginPage.enterUsername(process.env.TEST_USERNAME!);
      await loginPage.clickLogin();
      await loginPage.assertFieldRequiredError();
    }
  );

  test(
    "Login fails when both username and password fields are left blank",
    { tag: "@negative" },
    async ({ page }) => {
      await loginPage.clickLogin();
      await loginPage.assertBothFieldsRequiredError();
    }
  );

  test("Password field masks input characters", async ({ page }) => {
    await loginPage.enterPassword(process.env.TEST_PASSWORD!);
    await loginPage.assertPasswordFieldIsMasked();
  });

  test(
    "Forgot your password link redirects to password recovery page",
    async ({ page }) => {
      const forgotPasswordPage = new ForgotPasswordPage(page);
      await loginPage.clickForgotPassword();
      await forgotPasswordPage.assertForgotPasswordPageLoaded();
    }
  );

  test("Login succeeds with username in all uppercase", async ({ page }) => {
    await loginPage.login(
      process.env.TEST_USERNAME!.toUpperCase(),
      process.env.TEST_PASSWORD!
    );
    await loginPage.assertLoginSuccess();
  });

  test("Login succeeds with username in all lowercase", async ({ page }) => {
    await loginPage.login(
      process.env.TEST_USERNAME!.toLowerCase(),
      process.env.TEST_PASSWORD!
    );
    await loginPage.assertLoginSuccess();
  });

  test(
    "Login succeeds with username in mixed case",
    { tag: "@edge" },
    async ({ page }) => {
      const username = process.env.TEST_USERNAME!;
      const mixed = username
        .split("")
        .map((char, i) => (i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
        .join("");
      await loginPage.login(mixed, process.env.TEST_PASSWORD!);
      await loginPage.assertLoginSuccess();
    }
  );

  test(
    "Login fails with correct username but password in different case",
    { tag: "@negative" },
    async ({ page }) => {
      await loginPage.login(
        process.env.TEST_USERNAME!,
        process.env.TEST_PASSWORD!.toUpperCase()
      );
      await loginPage.assertInvalidCredentialsError();
    }
  );

  test(
    "Login page loads successfully with all required elements visible",
    async ({ page }) => {
      await loginPage.assertLoginPageElementsVisible();
    }
  );

  test(
    "Login fails with username containing only whitespace",
    { tag: "@edge" },
    async ({ page }) => {
      await loginPage.login("   ", process.env.TEST_PASSWORD!);
      await loginPage.assertErrorOrRequiredMessageDisplayed();
    }
  );

  test(
    "Login fails with password containing only whitespace",
    { tag: "@edge" },
    async ({ page }) => {
      await loginPage.login(process.env.TEST_USERNAME!, "   ");
      await loginPage.assertErrorOrRequiredMessageDisplayed();
    }
  );

  test(
    "Login fails with SQL injection attempt in username field",
    { tag: "@negative" },
    async ({ page }) => {
      await loginPage.login("' OR '1'='1", "anyPassword");
      await loginPage.assertInvalidCredentialsError();
    }
  );

  test(
    "Login fails with SQL injection attempt in password field",
    { tag: "@negative" },
    async ({ page }) => {
      await loginPage.login(process.env.TEST_USERNAME!, "' OR '1'='1");
      await loginPage.assertInvalidCredentialsError();
    }
  );

  test(
    "Login fails with extremely long username input",
    { tag: "@edge" },
    async ({ page }) => {
      const longUsername = "A".repeat(256);
      await loginPage.login(longUsername, process.env.TEST_PASSWORD!);
      await loginPage.assertErrorOrRequiredMessageDisplayed();
    }
  );

  test(
    "Login fails with extremely long password input",
    { tag: "@edge" },
    async ({ page }) => {
      const longPassword = "A".repeat(256);
      await loginPage.login(process.env.TEST_USERNAME!, longPassword);
      await loginPage.assertErrorOrRequiredMessageDisplayed();
    }
  );

  test(
    "Login fails with special characters in username field",
    { tag: "@negative" },
    async ({ page }) => {
      await loginPage.login("!@#$%^&*()", process.env.TEST_PASSWORD!);
      await loginPage.assertInvalidCredentialsError();
    }
  );

  test(
    "Password field does not reveal characters when toggled if no show/hide toggle exists",
    async ({ page }) => {
      await loginPage.enterPassword(process.env.TEST_PASSWORD!);
      await loginPage.assertPasswordFieldIsMasked();
    }
  );

  test(
    "Forgot your password page contains a way to return to login",
    async ({ page }) => {
      const forgotPasswordPage = new ForgotPasswordPage(page);
      await loginPage.clickForgotPassword();
      await forgotPasswordPage.assertForgotPasswordPageLoaded();
      await forgotPasswordPage.assertCancelButtonVisible();
    }
  );

  test(
    "Login page is accessible via direct URL navigation",
    async ({ page }) => {
      await loginPage.assertLoginPageLoaded();
    }
  );

  test(
    "Login fails with numeric-only username not registered in the system",
    { tag: "@negative" },
    async ({ page }) => {
      await loginPage.login("123456", process.env.TEST_PASSWORD!);
      await loginPage.assertInvalidCredentialsError();
    }
  );
});