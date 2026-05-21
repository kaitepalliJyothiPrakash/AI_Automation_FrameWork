# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orangehrm_login_1779359454900.spec.js >> TC-012-001 SCN-012: Verify "Forgot your password?" link presence and clickability
- Location: Automation-test-Cases\orangehrm_login_1779359454900.spec.js:530:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('p.oxd-text--p.orangehrm-login-forgot-header a')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('p.oxd-text--p.orangehrm-login-forgot-header a')

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
            - textbox "Username" [active] [ref=e23]
          - generic [ref=e25]:
            - generic [ref=e26]:
              - generic [ref=e27]: 
              - generic [ref=e28]: Password
            - textbox "Password" [ref=e30]
          - button "Login" [ref=e32] [cursor=pointer]
          - paragraph [ref=e34] [cursor=pointer]: Forgot your password?
      - generic [ref=e35]:
        - generic [ref=e36]:
          - link [ref=e37] [cursor=pointer]:
            - /url: https://www.linkedin.com/company/orangehrm/mycompany/
          - link [ref=e40] [cursor=pointer]:
            - /url: https://www.facebook.com/OrangeHRM/
          - link [ref=e43] [cursor=pointer]:
            - /url: https://twitter.com/orangehrm?lang=en
          - link [ref=e46] [cursor=pointer]:
            - /url: https://www.youtube.com/c/OrangeHRMInc
        - generic [ref=e49]:
          - paragraph [ref=e50]: OrangeHRM OS 5.8
          - paragraph [ref=e51]:
            - text: © 2005 - 2026
            - link "OrangeHRM, Inc" [ref=e52] [cursor=pointer]:
              - /url: http://www.orangehrm.com
            - text: . All rights reserved.
  - img "orangehrm-logo" [ref=e54]
```

# Test source

```ts
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
  460 |     await expect(usernameRequiredMsg).toBeVisible();
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
> 537 |     await expect(forgotPasswordLink).toBeVisible();
      |                                      ^ Error: expect(locator).toBeVisible() failed
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
  561 |     const passwordField = page.locator(PASSWORD_FIELD);
  562 |     await expect(passwordField).toHaveAttribute('type', 'password');
  563 |     await page.fill(PASSWORD_FIELD, 'testpass');
  564 |     // Visual masking (asterisks/dots) is typically confirmed by the 'type="password"' attribute.
  565 |   } catch (error) {
  566 |     status = 'Fail';
  567 |     actualResult = error.message;
  568 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  569 |     throw error;
  570 |   } finally {
  571 |     await writeResult(testCaseId, browserName, status, actualResult);
  572 |   }
  573 | });
  574 | 
  575 | // Test Case ID: TC-014-001
  576 | // Scenario ID: SCN-014
  577 | // Description: Verify redirection to the dashboard after successful login.
  578 | // This test is similar to TC-001-001 but explicitly focuses on redirection.
  579 | test('TC-014-001 SCN-014: Verify redirection to the dashboard after successful login', async ({ page, browserName }) => {
  580 |   const testCaseId = 'TC-014-001';
  581 |   let status = 'Pass';
  582 |   let actualResult = 'User is successfully redirected to the OrangeHRM dashboard/home page.';
  583 |   try {
  584 |     await page.goto(ORANGEHRM_URL);
  585 |     await page.fill(USERNAME_FIELD, VALID_USERNAME);
  586 |     await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
  587 |     await page.click(LOGIN_BUTTON);
  588 |     await expect(page).toHaveURL(/.*dashboard\/index/); // Expect URL to include 'dashboard/index'
  589 |     await expect(page.locator(DASHBOARD_HEADER)).toBeVisible(); // Verify a key element on the dashboard
  590 |   } catch (error) {
  591 |     status = 'Fail';
  592 |     actualResult = error.message;
  593 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  594 |     throw error;
  595 |   } finally {
  596 |     await writeResult(testCaseId, browserName, status, actualResult);
  597 |   }
  598 | });
```