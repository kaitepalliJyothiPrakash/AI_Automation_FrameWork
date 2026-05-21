# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orangehrm_login_1779347835206.spec.js >> TC017 SCN003: Verify successful redirection to the dashboard after a valid login.
- Location: Automation-test-Cases\orangehrm_login_1779347835206.spec.js:413:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.oxd-topbar-header-breadcrumb')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.oxd-topbar-header-breadcrumb')
    - waiting for" https://opensource-demo.orangehrmlive.com/web/index.php/auth/validate" navigation to finish...

```

# Test source

```ts
  322 |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  323 |     throw error;
  324 |   }
  325 |   await writeResult(testCaseId, browserName, status, actualResult);
  326 | });
  327 | 
  328 | // Test Case: TC013
  329 | test('TC013 SCN003: Verify login handles a very long username without breaking UI or functionality.', async ({ page, browserName }) => {
  330 |   const testCaseId = 'TC013';
  331 |   let status = 'Fail';
  332 |   let actualResult = '';
  333 |   const longUsername = 'A'.repeat(255); // A very long string
  334 |   try {
  335 |     await page.goto(ORANGEHRM_URL);
  336 |     await page.fill(USERNAME_FIELD, longUsername);
  337 |     await page.fill(PASSWORD_FIELD, 'admin123');
  338 |     await page.click(LOGIN_BUTTON);
  339 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
  340 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
  341 |     status = 'Pass';
  342 |     actualResult = 'Login failed with "Invalid credentials" for a very long username. UI remained stable.';
  343 |   } catch (error) {
  344 |     actualResult = error.message;
  345 |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  346 |     throw error;
  347 |   }
  348 |   await writeResult(testCaseId, browserName, status, actualResult);
  349 | });
  350 | 
  351 | // Test Case: TC014
  352 | test('TC014 SCN003: Verify login handles a very long password without breaking UI or functionality.', async ({ page, browserName }) => {
  353 |   const testCaseId = 'TC014';
  354 |   let status = 'Fail';
  355 |   let actualResult = '';
  356 |   const longPassword = 'P'.repeat(255); // A very long string
  357 |   try {
  358 |     await page.goto(ORANGEHRM_URL);
  359 |     await page.fill(USERNAME_FIELD, 'Admin');
  360 |     await page.fill(PASSWORD_FIELD, longPassword);
  361 |     await page.click(LOGIN_BUTTON);
  362 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
  363 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
  364 |     status = 'Pass';
  365 |     actualResult = 'Login failed with "Invalid credentials" for a very long password. UI remained stable.';
  366 |   } catch (error) {
  367 |     actualResult = error.message;
  368 |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  369 |     throw error;
  370 |   }
  371 |   await writeResult(testCaseId, browserName, status, actualResult);
  372 | });
  373 | 
  374 | // Test Case: TC015
  375 | test('TC015 SCN003: Verify the "Forgot your password?" link is present on the login page.', async ({ page, browserName }) => {
  376 |   const testCaseId = 'TC015';
  377 |   let status = 'Fail';
  378 |   let actualResult = '';
  379 |   try {
  380 |     await page.goto(ORANGEHRM_URL);
  381 |     await expect(page.locator(FORGOT_PASSWORD_LINK)).toBeVisible();
  382 |     await expect(page.locator(FORGOT_PASSWORD_LINK)).toHaveText('Forgot your password?');
  383 |     status = 'Pass';
  384 |     actualResult = '"Forgot your password?" link is visible on the login page.';
  385 |   } catch (error) {
  386 |     actualResult = error.message;
  387 |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  388 |     throw error;
  389 |   }
  390 |   await writeResult(testCaseId, browserName, status, actualResult);
  391 | });
  392 | 
  393 | // Test Case: TC016
  394 | test('TC016 SCN003: Verify characters entered in the password field are masked.', async ({ page, browserName }) => {
  395 |   const testCaseId = 'TC016';
  396 |   let status = 'Fail';
  397 |   let actualResult = '';
  398 |   try {
  399 |     await page.goto(ORANGEHRM_URL);
  400 |     await page.fill(PASSWORD_FIELD, 'test123');
  401 |     await expect(page.locator(PASSWORD_FIELD)).toHaveAttribute('type', 'password');
  402 |     status = 'Pass';
  403 |     actualResult = 'Password field characters are masked (input type is "password").';
  404 |   } catch (error) {
  405 |     actualResult = error.message;
  406 |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  407 |     throw error;
  408 |   }
  409 |   await writeResult(testCaseId, browserName, status, actualResult);
  410 | });
  411 | 
  412 | // Test Case: TC017
  413 | test('TC017 SCN003: Verify successful redirection to the dashboard after a valid login.', async ({ page, browserName }) => {
  414 |   const testCaseId = 'TC017';
  415 |   let status = 'Fail';
  416 |   let actualResult = '';
  417 |   try {
  418 |     await page.goto(ORANGEHRM_URL);
  419 |     await page.fill(USERNAME_FIELD, 'Admin');
  420 |     await page.fill(PASSWORD_FIELD, 'admin123');
  421 |     await page.click(LOGIN_BUTTON);
> 422 |     await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
      |                                                  ^ Error: expect(locator).toBeVisible() failed
  423 |     await expect(page).toHaveURL(/web\/index.php\/dashboard/); // Check URL contains dashboard path
  424 |     status = 'Pass';
  425 |     actualResult = 'User successfully redirected to the dashboard, and URL reflects the dashboard page.';
  426 |   } catch (error) {
  427 |     actualResult = error.message;
  428 |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  429 |     throw error;
  430 |   }
  431 |   await writeResult(testCaseId, browserName, status, actualResult);
  432 | });
```