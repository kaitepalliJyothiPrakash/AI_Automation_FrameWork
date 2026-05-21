# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orangehrm_login_1779347835206.spec.js >> TC006 SCN001: Verify login fails when the username field is filled and the password field is empty.
- Location: Automation-test-Cases\orangehrm_login_1779347835206.spec.js:173:1

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
  82  |   await writeResult(testCaseId, browserName, status, actualResult);
  83  | });
  84  | 
  85  | // Test Case: TC002
  86  | test('TC002 SCN001: Verify login fails with an invalid username and a valid password.', async ({ page, browserName }) => {
  87  |   const testCaseId = 'TC002';
  88  |   let status = 'Fail';
  89  |   let actualResult = '';
  90  |   try {
  91  |     await page.goto(ORANGEHRM_URL);
  92  |     await page.fill(USERNAME_FIELD, 'InvalidUser');
  93  |     await page.fill(PASSWORD_FIELD, 'admin123');
  94  |     await page.click(LOGIN_BUTTON);
  95  |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
  96  |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
  97  |     status = 'Pass';
  98  |     actualResult = 'Login failed with "Invalid credentials" message for invalid username.';
  99  |   } catch (error) {
  100 |     actualResult = error.message;
  101 |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  102 |     throw error;
  103 |   }
  104 |   await writeResult(testCaseId, browserName, status, actualResult);
  105 | });
  106 | 
  107 | // Test Case: TC003
  108 | test('TC003 SCN001: Verify login fails with a valid username and an invalid password.', async ({ page, browserName }) => {
  109 |   const testCaseId = 'TC003';
  110 |   let status = 'Fail';
  111 |   let actualResult = '';
  112 |   try {
  113 |     await page.goto(ORANGEHRM_URL);
  114 |     await page.fill(USERNAME_FIELD, 'Admin');
  115 |     await page.fill(PASSWORD_FIELD, 'wrongpassword');
  116 |     await page.click(LOGIN_BUTTON);
  117 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
  118 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
  119 |     status = 'Pass';
  120 |     actualResult = 'Login failed with "Invalid credentials" message for invalid password.';
  121 |   } catch (error) {
  122 |     actualResult = error.message;
  123 |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  124 |     throw error;
  125 |   }
  126 |   await writeResult(testCaseId, browserName, status, actualResult);
  127 | });
  128 | 
  129 | // Test Case: TC004
  130 | test('TC004 SCN001: Verify login fails when both username and password fields are left empty.', async ({ page, browserName }) => {
  131 |   const testCaseId = 'TC004';
  132 |   let status = 'Fail';
  133 |   let actualResult = '';
  134 |   try {
  135 |     await page.goto(ORANGEHRM_URL);
  136 |     // Do not fill username or password
  137 |     await page.click(LOGIN_BUTTON);
  138 |     await expect(page.locator(ERROR_MESSAGE_USERNAME_EMPTY)).toBeVisible();
  139 |     await expect(page.locator(ERROR_MESSAGE_USERNAME_EMPTY)).toHaveText('Required'); // OrangeHRM's actual message is 'Required'
  140 |     status = 'Pass';
  141 |     actualResult = 'Error message "Required" displayed near Username field when both fields are empty.';
  142 |   } catch (error) {
  143 |     actualResult = error.message;
  144 |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  145 |     throw error;
  146 |   }
  147 |   await writeResult(testCaseId, browserName, status, actualResult);
  148 | });
  149 | 
  150 | // Test Case: TC005
  151 | test('TC005 SCN001: Verify login fails when the username field is empty and the password field is filled.', async ({ page, browserName }) => {
  152 |   const testCaseId = 'TC005';
  153 |   let status = 'Fail';
  154 |   let actualResult = '';
  155 |   try {
  156 |     await page.goto(ORANGEHRM_URL);
  157 |     // Leave Username empty
  158 |     await page.fill(PASSWORD_FIELD, 'admin123');
  159 |     await page.click(LOGIN_BUTTON);
  160 |     await expect(page.locator(ERROR_MESSAGE_USERNAME_EMPTY)).toBeVisible();
  161 |     await expect(page.locator(ERROR_MESSAGE_USERNAME_EMPTY)).toHaveText('Required'); // OrangeHRM's actual message is 'Required'
  162 |     status = 'Pass';
  163 |     actualResult = 'Error message "Required" displayed near Username field when username is empty.';
  164 |   } catch (error) {
  165 |     actualResult = error.message;
  166 |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  167 |     throw error;
  168 |   }
  169 |   await writeResult(testCaseId, browserName, status, actualResult);
  170 | });
  171 | 
  172 | // Test Case: TC006
  173 | test('TC006 SCN001: Verify login fails when the username field is filled and the password field is empty.', async ({ page, browserName }) => {
  174 |   const testCaseId = 'TC006';
  175 |   let status = 'Fail';
  176 |   let actualResult = '';
  177 |   try {
  178 |     await page.goto(ORANGEHRM_URL);
  179 |     await page.fill(USERNAME_FIELD, 'Admin');
  180 |     // Leave Password empty
  181 |     await page.click(LOGIN_BUTTON);
> 182 |     await expect(page.locator(ERROR_MESSAGE_PASSWORD_EMPTY)).toBeVisible();
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  183 |     await expect(page.locator(ERROR_MESSAGE_PASSWORD_EMPTY)).toHaveText('Required'); // OrangeHRM's actual message is 'Required'
  184 |     status = 'Pass';
  185 |     actualResult = 'Error message "Required" displayed near Password field when password is empty.';
  186 |   } catch (error) {
  187 |     actualResult = error.message;
  188 |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  189 |     throw error;
  190 |   }
  191 |   await writeResult(testCaseId, browserName, status, actualResult);
  192 | });
  193 | 
  194 | // Test Case: TC007
  195 | test('TC007 SCN002: Verify system is resilient to common SQL injection attempts in the username field.', async ({ page, browserName }) => {
  196 |   const testCaseId = 'TC007';
  197 |   let status = 'Fail';
  198 |   let actualResult = '';
  199 |   try {
  200 |     await page.goto(ORANGEHRM_URL);
  201 |     await page.fill(USERNAME_FIELD, "' OR '1'='1");
  202 |     await page.fill(PASSWORD_FIELD, 'password');
  203 |     await page.click(LOGIN_BUTTON);
  204 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
  205 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toHaveText('Invalid credentials');
  206 |     status = 'Pass';
  207 |     actualResult = 'Login failed with "Invalid credentials" for SQL injection attempt in username.';
  208 |   } catch (error) {
  209 |     actualResult = error.message;
  210 |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  211 |     throw error;
  212 |   }
  213 |   await writeResult(testCaseId, browserName, status, actualResult);
  214 | });
  215 | 
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
```