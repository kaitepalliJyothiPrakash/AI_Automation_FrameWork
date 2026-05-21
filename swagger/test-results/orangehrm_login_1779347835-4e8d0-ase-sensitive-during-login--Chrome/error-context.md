# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orangehrm_login_1779347835206.spec.js >> TC012 SCN003: Verify password is case-sensitive during login.
- Location: Automation-test-Cases\orangehrm_login_1779347835206.spec.js:307:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.oxd-alert-content-text')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.oxd-alert-content-text')

```

# Test source

```ts
  216 | // Test Case: TC008
  217 | test('TC008 SCN002: Verify system is resilient to common SQL injection attempts in the password field.', async ({ page, browserName }) => {
  218 |   const testCaseId = 'TC008';
  219 |   let status = 'Fail';
  220 |   let actualResult = '';
  221 |   try {
  222 |     await page.goto(ORANGEHRM_URL);
  223 |     await page.fill(USERNAME_FIELD, 'Admin');
  224 |     await page.fill(PASSWORD_FIELD, "' OR '1'='1");
  225 |     await page.click(LOGIN_BUTTON);
  226 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
  227 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
  228 |     status = 'Pass';
  229 |     actualResult = 'Login failed with "Invalid credentials" for SQL injection attempt in password.';
  230 |   } catch (error) {
  231 |     actualResult = error.message;
  232 |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  233 |     throw error;
  234 |   }
  235 |   await writeResult(testCaseId, browserName, status, actualResult);
  236 | });
  237 | 
  238 | // Test Case: TC009
  239 | test('TC009 SCN002: Verify system is resilient to XSS/HTML injection attempts in the username field.', async ({ page, browserName }) => {
  240 |   const testCaseId = 'TC009';
  241 |   let status = 'Fail';
  242 |   let actualResult = '';
  243 |   try {
  244 |     await page.goto(ORANGEHRM_URL);
  245 |     await page.fill(USERNAME_FIELD, "<script>alert('XSS')</script>");
  246 |     await page.fill(PASSWORD_FIELD, 'admin123');
  247 |     await page.click(LOGIN_BUTTON);
  248 |     // Check that no alert was triggered (Playwright handles this by default, will fail test if alert appears)
  249 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
  250 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
  251 |     status = 'Pass';
  252 |     actualResult = 'Login failed with "Invalid credentials" and no script execution for XSS in username.';
  253 |   } catch (error) {
  254 |     actualResult = error.message;
  255 |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  256 |     throw error;
  257 |   }
  258 |   await writeResult(testCaseId, browserName, status, actualResult);
  259 | });
  260 | 
  261 | // Test Case: TC010
  262 | test('TC010 SCN002: Verify system is resilient to XSS/HTML injection attempts in the password field.', async ({ page, browserName }) => {
  263 |   const testCaseId = 'TC010';
  264 |   let status = 'Fail';
  265 |   let actualResult = '';
  266 |   try {
  267 |     await page.goto(ORANGEHRM_URL);
  268 |     await page.fill(USERNAME_FIELD, 'Admin');
  269 |     await page.fill(PASSWORD_FIELD, "<img src=x onerror=alert('XSS')>");
  270 |     await page.click(LOGIN_BUTTON);
  271 |     // Check that no alert was triggered
  272 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
  273 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
  274 |     status = 'Pass';
  275 |     actualResult = 'Login failed with "Invalid credentials" and no script execution for XSS in password.';
  276 |   } catch (error) {
  277 |     actualResult = error.message;
  278 |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  279 |     throw error;
  280 |   }
  281 |   await writeResult(testCaseId, browserName, status, actualResult);
  282 | });
  283 | 
  284 | // Test Case: TC011
  285 | test('TC011 SCN003: Verify username is case-sensitive during login.', async ({ page, browserName }) => {
  286 |   const testCaseId = 'TC011';
  287 |   let status = 'Fail';
  288 |   let actualResult = '';
  289 |   try {
  290 |     await page.goto(ORANGEHRM_URL);
  291 |     await page.fill(USERNAME_FIELD, 'admin'); // lowercase username
  292 |     await page.fill(PASSWORD_FIELD, 'admin123');
  293 |     await page.click(LOGIN_BUTTON);
  294 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
  295 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
  296 |     status = 'Pass';
  297 |     actualResult = 'Login failed with "Invalid credentials" for lowercase username, confirming case-sensitivity.';
  298 |   } catch (error) {
  299 |     actualResult = error.message;
  300 |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  301 |     throw error;
  302 |   }
  303 |   await writeResult(testCaseId, browserName, status, actualResult);
  304 | });
  305 | 
  306 | // Test Case: TC012
  307 | test('TC012 SCN003: Verify password is case-sensitive during login.', async ({ page, browserName }) => {
  308 |   const testCaseId = 'TC012';
  309 |   let status = 'Fail';
  310 |   let actualResult = '';
  311 |   try {
  312 |     await page.goto(ORANGEHRM_URL);
  313 |     await page.fill(USERNAME_FIELD, 'Admin');
  314 |     await page.fill(PASSWORD_FIELD, 'ADMIN123'); // uppercase password
  315 |     await page.click(LOGIN_BUTTON);
> 316 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
      |                                                       ^ Error: expect(locator).toBeVisible() failed
  317 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
  318 |     status = 'Pass';
  319 |     actualResult = 'Login failed with "Invalid credentials" for uppercase password, confirming case-sensitivity.';
  320 |   } catch (error) {
  321 |     actualResult = error.message;
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
```