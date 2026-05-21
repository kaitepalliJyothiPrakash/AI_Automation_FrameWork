# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orangehrm_login_1779359454900.spec.js >> TC-011-001 SCN-011: Verify "Username cannot be empty" message
- Location: Automation-test-Cases\orangehrm_login_1779359454900.spec.js:449:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[name="username"] + span.oxd-input-field-error-message')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('input[name="username"] + span.oxd-input-field-error-message')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e6]:
    - img "company-branding" [ref=e8]
    - generic [ref=e9]:
      - heading "Login" [level=5] [ref=e10]
      - generic [ref=e11]:
        - generic [ref=e13]:
          - paragraph [ref=e14]: "Username : Admin"
          - paragraph [ref=e15]: "Password : admin123"
        - generic [ref=e16]:
          - generic [ref=e18]:
            - generic [ref=e19]:
              - generic [ref=e20]: 
              - generic [ref=e21]: Username
            - textbox "Username" [ref=e23]
            - generic [ref=e24]: Required
          - generic [ref=e26]:
            - generic [ref=e27]:
              - generic [ref=e28]: 
              - generic [ref=e29]: Password
            - textbox "Password" [ref=e31]: admin123
          - button "Login" [active] [ref=e33] [cursor=pointer]
          - paragraph [ref=e35] [cursor=pointer]: Forgot your password?
      - generic [ref=e36]:
        - generic [ref=e37]:
          - link [ref=e38] [cursor=pointer]:
            - /url: https://www.linkedin.com/company/orangehrm/mycompany/
          - link [ref=e41] [cursor=pointer]:
            - /url: https://www.facebook.com/OrangeHRM/
          - link [ref=e44] [cursor=pointer]:
            - /url: https://twitter.com/orangehrm?lang=en
          - link [ref=e47] [cursor=pointer]:
            - /url: https://www.youtube.com/c/OrangeHRMInc
        - generic [ref=e50]:
          - paragraph [ref=e51]: OrangeHRM OS 5.8
          - paragraph [ref=e52]:
            - text: © 2005 - 2026
            - link "OrangeHRM, Inc" [ref=e53] [cursor=pointer]:
              - /url: http://www.orangehrm.com
            - text: . All rights reserved.
  - img "orangehrm-logo" [ref=e55]
```

# Test source

```ts
  360 |     await writeResult(testCaseId, browserName, status, actualResult);
  361 |   }
  362 | });
  363 | 
  364 | // Test Case ID: TC-009-002
  365 | // Scenario ID: SCN-009
  366 | // Description: Verify case sensitivity for password (uppercase).
  367 | test('TC-009-002 SCN-009: Verify case sensitivity for password (uppercase)', async ({ page, browserName }) => {
  368 |   const testCaseId = 'TC-009-002';
  369 |   let status = 'Pass';
  370 |   let actualResult = 'Login fails with "Invalid credentials" due to case-sensitive password.';
  371 |   try {
  372 |     await page.goto(ORANGEHRM_URL);
  373 |     await page.fill(USERNAME_FIELD, VALID_USERNAME);
  374 |     await page.fill(PASSWORD_FIELD, 'ADMIN123'); // Uppercase password
  375 |     await page.click(LOGIN_BUTTON);
  376 |     const errorMessage = page.locator(ERROR_MESSAGE);
  377 |     await expect(errorMessage).toBeVisible();
  378 |     await expect(errorMessage).toHaveText('Invalid credentials');
  379 |     await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page
  380 |   } catch (error) {
  381 |     status = 'Fail';
  382 |     actualResult = error.message;
  383 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  384 |     throw error;
  385 |   } finally {
  386 |     await writeResult(testCaseId, browserName, status, actualResult);
  387 |   }
  388 | });
  389 | 
  390 | // Test Case ID: TC-010-001
  391 | // Scenario ID: SCN-010
  392 | // Description: Verify handling of a very long username.
  393 | test('TC-010-001 SCN-010: Verify handling of a very long username', async ({ page, browserName }) => {
  394 |   const testCaseId = 'TC-010-001';
  395 |   let status = 'Pass';
  396 |   let actualResult = 'System handles long username gracefully; login fails with "Invalid credentials".';
  397 |   const longUsername = 'a'.repeat(255); // Create a very long string
  398 |   try {
  399 |     await page.goto(ORANGEHRM_URL);
  400 |     await page.fill(USERNAME_FIELD, longUsername);
  401 |     await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
  402 |     await page.click(LOGIN_BUTTON);
  403 | 
  404 |     const errorMessage = page.locator(ERROR_MESSAGE);
  405 |     await expect(errorMessage).toBeVisible();
  406 |     await expect(errorMessage).toHaveText('Invalid credentials');
  407 |     await expect(page).toHaveURL(ORANGEHRM_URL);
  408 |   } catch (error) {
  409 |     status = 'Fail';
  410 |     actualResult = error.message;
  411 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  412 |     throw error;
  413 |   } finally {
  414 |     await writeResult(testCaseId, browserName, status, actualResult);
  415 |   }
  416 | });
  417 | 
  418 | // Test Case ID: TC-010-002
  419 | // Scenario ID: SCN-010
  420 | // Description: Verify handling of a very long password.
  421 | test('TC-010-002 SCN-010: Verify handling of a very long password', async ({ page, browserName }) => {
  422 |   const testCaseId = 'TC-010-002';
  423 |   let status = 'Pass';
  424 |   let actualResult = 'System handles long password gracefully; login fails with "Invalid credentials".';
  425 |   const longPassword = 'a'.repeat(255); // Create a very long string
  426 |   try {
  427 |     await page.goto(ORANGEHRM_URL);
  428 |     await page.fill(USERNAME_FIELD, VALID_USERNAME);
  429 |     await page.fill(PASSWORD_FIELD, longPassword);
  430 |     await page.click(LOGIN_BUTTON);
  431 | 
  432 |     const errorMessage = page.locator(ERROR_MESSAGE);
  433 |     await expect(errorMessage).toBeVisible();
  434 |     await expect(errorMessage).toHaveText('Invalid credentials');
  435 |     await expect(page).toHaveURL(ORANGEHRM_URL);
  436 |   } catch (error) {
  437 |     status = 'Fail';
  438 |     actualResult = error.message;
  439 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  440 |     throw error;
  441 |   } finally {
  442 |     await writeResult(testCaseId, browserName, status, actualResult);
  443 |   }
  444 | });
  445 | 
  446 | // Test Case ID: TC-011-001
  447 | // Scenario ID: SCN-011
  448 | // Description: Verify "Username cannot be empty" message.
  449 | test('TC-011-001 SCN-011: Verify "Username cannot be empty" message', async ({ page, browserName }) => {
  450 |   const testCaseId = 'TC-011-001';
  451 |   let status = 'Pass';
  452 |   let actualResult = 'A clear "Username cannot be empty" validation message is displayed.';
  453 |   try {
  454 |     await page.goto(ORANGEHRM_URL);
  455 |     // Leave Username field empty
  456 |     await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
  457 |     await page.click(LOGIN_BUTTON);
  458 | 
  459 |     const usernameRequiredMsg = page.locator(USERNAME_REQUIRED_MESSAGE);
> 460 |     await expect(usernameRequiredMsg).toBeVisible();
      |                                       ^ Error: expect(locator).toBeVisible() failed
  461 |     await expect(usernameRequiredMsg).toHaveText('Required'); // OrangeHRM uses "Required" for empty fields
  462 |     await expect(page).toHaveURL(ORANGEHRM_URL);
  463 |   } catch (error) {
  464 |     status = 'Fail';
  465 |     actualResult = error.message;
  466 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  467 |     throw error;
  468 |   } finally {
  469 |     await writeResult(testCaseId, browserName, status, actualResult);
  470 |   }
  471 | });
  472 | 
  473 | // Test Case ID: TC-011-002
  474 | // Scenario ID: SCN-011
  475 | // Description: Verify "Password cannot be empty" message.
  476 | test('TC-011-002 SCN-011: Verify "Password cannot be empty" message', async ({ page, browserName }) => {
  477 |   const testCaseId = 'TC-011-002';
  478 |   let status = 'Pass';
  479 |   let actualResult = 'A clear "Password cannot be empty" validation message is displayed.';
  480 |   try {
  481 |     await page.goto(ORANGEHRM_URL);
  482 |     await page.fill(USERNAME_FIELD, VALID_USERNAME);
  483 |     // Leave Password field empty
  484 |     await page.click(LOGIN_BUTTON);
  485 | 
  486 |     const passwordRequiredMsg = page.locator(PASSWORD_REQUIRED_MESSAGE);
  487 |     await expect(passwordRequiredMsg).toBeVisible();
  488 |     await expect(passwordRequiredMsg).toHaveText('Required'); // OrangeHRM uses "Required" for empty fields
  489 |     await expect(page).toHaveURL(ORANGEHRM_URL);
  490 |   } catch (error) {
  491 |     status = 'Fail';
  492 |     actualResult = error.message;
  493 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  494 |     throw error;
  495 |   } finally {
  496 |     await writeResult(testCaseId, browserName, status, actualResult);
  497 |   }
  498 | });
  499 | 
  500 | // Test Case ID: TC-011-003
  501 | // Scenario ID: SCN-011
  502 | // Description: Verify "Invalid credentials" message for incorrect inputs.
  503 | test('TC-011-003 SCN-011: Verify "Invalid credentials" message for incorrect inputs', async ({ page, browserName }) => {
  504 |   const testCaseId = 'TC-011-003';
  505 |   let status = 'Pass';
  506 |   let actualResult = 'A clear "Invalid credentials" error message is displayed.';
  507 |   try {
  508 |     await page.goto(ORANGEHRM_URL);
  509 |     await page.fill(USERNAME_FIELD, 'WrongUser');
  510 |     await page.fill(PASSWORD_FIELD, 'WrongPass');
  511 |     await page.click(LOGIN_BUTTON);
  512 | 
  513 |     const errorMessage = page.locator(ERROR_MESSAGE);
  514 |     await expect(errorMessage).toBeVisible();
  515 |     await expect(errorMessage).toHaveText('Invalid credentials');
  516 |     await expect(page).toHaveURL(ORANGEHRM_URL);
  517 |   } catch (error) {
  518 |     status = 'Fail';
  519 |     actualResult = error.message;
  520 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  521 |     throw error;
  522 |   } finally {
  523 |     await writeResult(testCaseId, browserName, status, actualResult);
  524 |   }
  525 | });
  526 | 
  527 | // Test Case ID: TC-012-001
  528 | // Scenario ID: SCN-012
  529 | // Description: Verify the presence and clickability of the "Forgot your password?" link.
  530 | test('TC-012-001 SCN-012: Verify "Forgot your password?" link presence and clickability', async ({ page, browserName }) => {
  531 |   const testCaseId = 'TC-012-001';
  532 |   let status = 'Pass';
  533 |   let actualResult = 'Forgot password link is present, clickable, and redirects to the password reset page.';
  534 |   try {
  535 |     await page.goto(ORANGEHRM_URL);
  536 |     const forgotPasswordLink = page.locator(FORGOT_PASSWORD_LINK);
  537 |     await expect(forgotPasswordLink).toBeVisible();
  538 |     await expect(forgotPasswordLink).toBeEnabled(); // Verify it's clickable
  539 |     await forgotPasswordLink.click();
  540 |     await expect(page).toHaveURL(/.*auth\/requestPasswordReset/); // Verify redirection to reset page
  541 |     await expect(page.locator('h6.oxd-text--h6')).toHaveText('Reset Password'); // Verify a distinct element on the reset page
  542 |   } catch (error) {
  543 |     status = 'Fail';
  544 |     actualResult = error.message;
  545 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  546 |     throw error;
  547 |   } finally {
  548 |     await writeResult(testCaseId, browserName, status, actualResult);
  549 |   }
  550 | });
  551 | 
  552 | // Test Case ID: TC-013-001
  553 | // Scenario ID: SCN-013
  554 | // Description: Verify characters entered in the password field are masked.
  555 | test('TC-013-001 SCN-013: Verify characters entered in password field are masked', async ({ page, browserName }) => {
  556 |   const testCaseId = 'TC-013-001';
  557 |   let status = 'Pass';
  558 |   let actualResult = 'Characters entered in the password field are masked (input type="password").';
  559 |   try {
  560 |     await page.goto(ORANGEHRM_URL);
```