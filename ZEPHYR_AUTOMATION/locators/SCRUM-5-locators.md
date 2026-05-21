# SCRUM-5 OrangeHRM Login Page - Locators

## LoginPage
- url: /web/index.php/auth/login
- usernameInput: input[name="username"]
- passwordInput: input[name="password"]
- loginButton: button[type="submit"]
- forgotPasswordLink: .orangehrm-login-forgot-header
- invalidCredentialsError: .oxd-alert-content-text
- fieldErrorMessage: .oxd-input-field-error-message
- pageHeading: .oxd-topbar-header-breadcrumb-module

## ForgotPasswordPage
- url: /web/index.php/auth/requestPasswordResetCode
- pageTitle: .orangehrm-forgot-password-title
- usernameInput: input[name="username"]
- resetPasswordButton: .orangehrm-forgot-password-button--reset
- cancelButton: .orangehrm-forgot-password-button--cancel
