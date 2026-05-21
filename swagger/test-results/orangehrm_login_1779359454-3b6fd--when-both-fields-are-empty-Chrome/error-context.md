# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orangehrm_login_1779359454900.spec.js >> TC-004-001 SCN-004: Verify login failure and validation messages when both fields are empty
- Location: Automation-test-Cases\orangehrm_login_1779359454900.spec.js:133:1

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
            - textbox "Password" [ref=e31]
            - generic [ref=e32]: Required
          - button "Login" [active] [ref=e34] [cursor=pointer]
          - paragraph [ref=e36] [cursor=pointer]: Forgot your password?
      - generic [ref=e37]:
        - generic [ref=e38]:
          - link [ref=e39] [cursor=pointer]:
            - /url: https://www.linkedin.com/company/orangehrm/mycompany/
          - link [ref=e42] [cursor=pointer]:
            - /url: https://www.facebook.com/OrangeHRM/
          - link [ref=e45] [cursor=pointer]:
            - /url: https://twitter.com/orangehrm?lang=en
          - link [ref=e48] [cursor=pointer]:
            - /url: https://www.youtube.com/c/OrangeHRMInc
        - generic [ref=e51]:
          - paragraph [ref=e52]: OrangeHRM OS 5.8
          - paragraph [ref=e53]:
            - text: © 2005 - 2026
            - link "OrangeHRM, Inc" [ref=e54] [cursor=pointer]:
              - /url: http://www.orangehrm.com
            - text: . All rights reserved.
  - img "orangehrm-logo" [ref=e56]
```

# Test source

```ts
  45  |     if (status === 'Fail') { const max = results.filter(r=>r.defect_id).length; entry.defect_id = 'DEF' + String(max+1).padStart(3,'0') + '-' + browser; }
  46  |     results.push(entry);
  47  |     fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
  48  |     console.log('Result written: ' + testCaseId + ' | ' + browser + ' | ' + status);
  49  |   } finally {
  50  |     if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
  51  |   }
  52  | }
  53  | 
  54  | // Test Case ID: TC-001-001
  55  | // Scenario ID: SCN-001
  56  | // Description: Verify successful login with correct username and password.
  57  | test('TC-001-001 SCN-001: Verify successful login with correct username and password', async ({ page, browserName }) => {
  58  |   const testCaseId = 'TC-001-001';
  59  |   let status = 'Pass';
  60  |   let actualResult = 'User successfully logged in and redirected to the dashboard page.';
  61  |   try {
  62  |     await page.goto(ORANGEHRM_URL);
  63  |     await page.fill(USERNAME_FIELD, VALID_USERNAME);
  64  |     await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
  65  |     await page.click(LOGIN_BUTTON);
  66  |     await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
  67  |     await expect(page).toHaveURL(/.*dashboard\/index/); // Verify URL redirection
  68  |   } catch (error) {
  69  |     status = 'Fail';
  70  |     actualResult = error.message;
  71  |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  72  |     throw error; // Re-throw to make Playwright mark the test as failed
  73  |   } finally {
  74  |     await writeResult(testCaseId, browserName, status, actualResult);
  75  |   }
  76  | });
  77  | 
  78  | // Test Case ID: TC-002-001
  79  | // Scenario ID: SCN-002
  80  | // Description: Verify login failure with an invalid username and correct password.
  81  | test('TC-002-001 SCN-002: Verify login failure with invalid username and correct password', async ({ page, browserName }) => {
  82  |   const testCaseId = 'TC-002-001';
  83  |   let status = 'Pass';
  84  |   let actualResult = 'Error message "Invalid credentials" displayed, user remains on login page.';
  85  |   try {
  86  |     await page.goto(ORANGEHRM_URL);
  87  |     await page.fill(USERNAME_FIELD, 'InvalidUser');
  88  |     await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
  89  |     await page.click(LOGIN_BUTTON);
  90  |     const errorMessage = page.locator(ERROR_MESSAGE);
  91  |     await expect(errorMessage).toBeVisible();
  92  |     await expect(errorMessage).toHaveText('Invalid credentials');
  93  |     await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page
  94  |   } catch (error) {
  95  |     status = 'Fail';
  96  |     actualResult = error.message;
  97  |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  98  |     throw error;
  99  |   } finally {
  100 |     await writeResult(testCaseId, browserName, status, actualResult);
  101 |   }
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
> 145 |     await expect(usernameRequiredMsg).toBeVisible();
      |                                       ^ Error: expect(locator).toBeVisible() failed
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
  202 |     await expect(passwordRequiredMsg).toBeVisible();
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
```