# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orangehrm_login_1779359454900.spec.js >> TC-006-001 SCN-006: Verify validation message for empty password
- Location: Automation-test-Cases\orangehrm_login_1779359454900.spec.js:191:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[name="password"] + span.oxd-input-field-error-message')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('input[name="password"] + span.oxd-input-field-error-message')

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
            - textbox "Username" [ref=e23]: Admin
          - generic [ref=e25]:
            - generic [ref=e26]:
              - generic [ref=e27]: 
              - generic [ref=e28]: Password
            - textbox "Password" [ref=e30]
            - generic [ref=e31]: Required
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
  102 | });
  103 | 
  104 | // Test Case ID: TC-003-001
  105 | // Scenario ID: SCN-003
  106 | // Description: Verify login failure with a correct username and invalid password.
  107 | test('TC-003-001 SCN-003: Verify login failure with correct username and invalid password', async ({ page, browserName }) => {
  108 |   const testCaseId = 'TC-003-001';
  109 |   let status = 'Pass';
  110 |   let actualResult = 'Error message "Invalid credentials" displayed, user remains on login page.';
  111 |   try {
  112 |     await page.goto(ORANGEHRM_URL);
  113 |     await page.fill(USERNAME_FIELD, VALID_USERNAME);
  114 |     await page.fill(PASSWORD_FIELD, 'wrongpass');
  115 |     await page.click(LOGIN_BUTTON);
  116 |     const errorMessage = page.locator(ERROR_MESSAGE);
  117 |     await expect(errorMessage).toBeVisible();
  118 |     await expect(errorMessage).toHaveText('Invalid credentials');
  119 |     await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page
  120 |   } catch (error) {
  121 |     status = 'Fail';
  122 |     actualResult = error.message;
  123 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  124 |     throw error;
  125 |   } finally {
  126 |     await writeResult(testCaseId, browserName, status, actualResult);
  127 |   }
  128 | });
  129 | 
  130 | // Test Case ID: TC-004-001
  131 | // Scenario ID: SCN-004
  132 | // Description: Verify login failure and validation messages when both fields are empty.
  133 | test('TC-004-001 SCN-004: Verify login failure and validation messages when both fields are empty', async ({ page, browserName }) => {
  134 |   const testCaseId = 'TC-004-001';
  135 |   let status = 'Pass';
  136 |   let actualResult = 'Validation messages "Required" displayed for both username and password fields.';
  137 |   try {
  138 |     await page.goto(ORANGEHRM_URL);
  139 |     // Leave both fields empty
  140 |     await page.click(LOGIN_BUTTON);
  141 | 
  142 |     const usernameRequiredMsg = page.locator(USERNAME_REQUIRED_MESSAGE);
  143 |     const passwordRequiredMsg = page.locator(PASSWORD_REQUIRED_MESSAGE);
  144 | 
  145 |     await expect(usernameRequiredMsg).toBeVisible();
  146 |     await expect(usernameRequiredMsg).toHaveText('Required');
  147 |     await expect(passwordRequiredMsg).toBeVisible();
  148 |     await expect(passwordRequiredMsg).toHaveText('Required');
  149 |     await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page
  150 |   } catch (error) {
  151 |     status = 'Fail';
  152 |     actualResult = error.message;
  153 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  154 |     throw error;
  155 |   } finally {
  156 |     await writeResult(testCaseId, browserName, status, actualResult);
  157 |   }
  158 | });
  159 | 
  160 | // Test Case ID: TC-005-001
  161 | // Scenario ID: SCN-005
  162 | // Description: Verify login failure and validation message when username is empty and password is provided.
  163 | test('TC-005-001 SCN-005: Verify validation message for empty username', async ({ page, browserName }) => {
  164 |   const testCaseId = 'TC-005-001';
  165 |   let status = 'Pass';
  166 |   let actualResult = 'Validation message "Required" displayed for username field.';
  167 |   try {
  168 |     await page.goto(ORANGEHRM_URL);
  169 |     await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
  170 |     // Leave username empty
  171 |     await page.click(LOGIN_BUTTON);
  172 | 
  173 |     const usernameRequiredMsg = page.locator(USERNAME_REQUIRED_MESSAGE);
  174 |     await expect(usernameRequiredMsg).toBeVisible();
  175 |     await expect(usernameRequiredMsg).toHaveText('Required');
  176 |     await expect(page.locator(PASSWORD_REQUIRED_MESSAGE)).not.toBeVisible(); // Password field should not show error
  177 |     await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page
  178 |   } catch (error) {
  179 |     status = 'Fail';
  180 |     actualResult = error.message;
  181 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  182 |     throw error;
  183 |   } finally {
  184 |     await writeResult(testCaseId, browserName, status, actualResult);
  185 |   }
  186 | });
  187 | 
  188 | // Test Case ID: TC-006-001
  189 | // Scenario ID: SCN-006
  190 | // Description: Verify login failure and validation message when username is provided and password is empty.
  191 | test('TC-006-001 SCN-006: Verify validation message for empty password', async ({ page, browserName }) => {
  192 |   const testCaseId = 'TC-006-001';
  193 |   let status = 'Pass';
  194 |   let actualResult = 'Validation message "Required" displayed for password field.';
  195 |   try {
  196 |     await page.goto(ORANGEHRM_URL);
  197 |     await page.fill(USERNAME_FIELD, VALID_USERNAME);
  198 |     // Leave password empty
  199 |     await page.click(LOGIN_BUTTON);
  200 | 
  201 |     const passwordRequiredMsg = page.locator(PASSWORD_REQUIRED_MESSAGE);
> 202 |     await expect(passwordRequiredMsg).toBeVisible();
      |                                       ^ Error: expect(locator).toBeVisible() failed
  203 |     await expect(passwordRequiredMsg).toHaveText('Required');
  204 |     await expect(page.locator(USERNAME_REQUIRED_MESSAGE)).not.toBeVisible(); // Username field should not show error
  205 |     await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page
  206 |   } catch (error) {
  207 |     status = 'Fail';
  208 |     actualResult = error.message;
  209 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  210 |     throw error;
  211 |   } finally {
  212 |     await writeResult(testCaseId, browserName, status, actualResult);
  213 |   }
  214 | });
  215 | 
  216 | // Test Case ID: TC-007-001
  217 | // Scenario ID: SCN-007
  218 | // Description: Verify protection against SQL injection in the username field.
  219 | test('TC-007-001 SCN-007: Verify SQL injection protection in username field', async ({ page, browserName }) => {
  220 |   const testCaseId = 'TC-007-001';
  221 |   let status = 'Pass';
  222 |   let actualResult = 'Login fails with "Invalid credentials"; no unauthorized access or database errors.';
  223 |   try {
  224 |     await page.goto(ORANGEHRM_URL);
  225 |     await page.fill(USERNAME_FIELD, "' OR '1'='1");
  226 |     await page.fill(PASSWORD_FIELD, 'password'); // Use a generic password
  227 |     await page.click(LOGIN_BUTTON);
  228 |     const errorMessage = page.locator(ERROR_MESSAGE);
  229 |     await expect(errorMessage).toBeVisible();
  230 |     await expect(errorMessage).toHaveText('Invalid credentials');
  231 |     await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page
  232 |   } catch (error) {
  233 |     status = 'Fail';
  234 |     actualResult = error.message;
  235 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  236 |     throw error;
  237 |   } finally {
  238 |     await writeResult(testCaseId, browserName, status, actualResult);
  239 |   }
  240 | });
  241 | 
  242 | // Test Case ID: TC-007-002
  243 | // Scenario ID: SCN-007
  244 | // Description: Verify protection against SQL injection in the password field.
  245 | test('TC-007-002 SCN-007: Verify SQL injection protection in password field', async ({ page, browserName }) => {
  246 |   const testCaseId = 'TC-007-002';
  247 |   let status = 'Pass';
  248 |   let actualResult = 'Login fails with "Invalid credentials"; no unauthorized access or database errors.';
  249 |   try {
  250 |     await page.goto(ORANGEHRM_URL);
  251 |     await page.fill(USERNAME_FIELD, VALID_USERNAME);
  252 |     await page.fill(PASSWORD_FIELD, "' OR '1'='1");
  253 |     await page.click(LOGIN_BUTTON);
  254 |     const errorMessage = page.locator(ERROR_MESSAGE);
  255 |     await expect(errorMessage).toBeVisible();
  256 |     await expect(errorMessage).toHaveText('Invalid credentials');
  257 |     await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page
  258 |   } catch (error) {
  259 |     status = 'Fail';
  260 |     actualResult = error.message;
  261 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  262 |     throw error;
  263 |   } finally {
  264 |     await writeResult(testCaseId, browserName, status, actualResult);
  265 |   }
  266 | });
  267 | 
  268 | // Test Case ID: TC-008-001
  269 | // Scenario ID: SCN-008
  270 | // Description: Verify protection against XSS injection in the username field.
  271 | test('TC-008-001 SCN-008: Verify XSS injection protection in username field', async ({ page, browserName }) => {
  272 |   const testCaseId = 'TC-008-001';
  273 |   let status = 'Pass';
  274 |   let actualResult = 'The script is not executed; "Invalid credentials" displayed.';
  275 |   try {
  276 |     await page.goto(ORANGEHRM_URL);
  277 |     // Monitor for dialogs (like alert()) to ensure no XSS script execution
  278 |     page.on('dialog', async dialog => {
  279 |       if (dialog.type() === 'alert') {
  280 |         throw new Error('XSS alert dialog detected! Script was executed.'); // Fail the test if an alert appears
  281 |       }
  282 |       await dialog.dismiss();
  283 |     });
  284 | 
  285 |     await page.fill(USERNAME_FIELD, "<script>alert('XSS')</script>");
  286 |     await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
  287 |     await page.click(LOGIN_BUTTON);
  288 | 
  289 |     const errorMessage = page.locator(ERROR_MESSAGE);
  290 |     await expect(errorMessage).toBeVisible();
  291 |     await expect(errorMessage).toHaveText('Invalid credentials');
  292 |     await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page
  293 |   } catch (error) {
  294 |     status = 'Fail';
  295 |     actualResult = error.message;
  296 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  297 |     throw error;
  298 |   } finally {
  299 |     await writeResult(testCaseId, browserName, status, actualResult);
  300 |   }
  301 | });
  302 | 
```