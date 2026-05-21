# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orangehrm_login_1779347835206.spec.js >> TC003 SCN001: Verify login fails with a valid username and an invalid password.
- Location: Automation-test-Cases\orangehrm_login_1779347835206.spec.js:108:1

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

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e6]:
    - img "company-branding" [ref=e8]
    - generic [ref=e9]:
      - heading "Login" [level=5] [ref=e10]
      - generic [ref=e11]:
        - generic [ref=e12]:
          - alert [ref=e13]:
            - generic [ref=e14]:
              - generic [ref=e15]: 
              - paragraph [ref=e16]: Invalid credentials
          - generic [ref=e18]:
            - paragraph [ref=e19]: "Username : Admin"
            - paragraph [ref=e20]: "Password : admin123"
        - generic [ref=e21]:
          - generic [ref=e23]:
            - generic [ref=e24]:
              - generic [ref=e25]: 
              - generic [ref=e26]: Username
            - textbox "Username" [active] [ref=e28]
          - generic [ref=e30]:
            - generic [ref=e31]:
              - generic [ref=e32]: 
              - generic [ref=e33]: Password
            - textbox "Password" [ref=e35]
          - button "Login" [ref=e37] [cursor=pointer]
          - paragraph [ref=e39] [cursor=pointer]: Forgot your password?
      - generic [ref=e40]:
        - generic [ref=e41]:
          - link [ref=e42] [cursor=pointer]:
            - /url: https://www.linkedin.com/company/orangehrm/mycompany/
          - link [ref=e45] [cursor=pointer]:
            - /url: https://www.facebook.com/OrangeHRM/
          - link [ref=e48] [cursor=pointer]:
            - /url: https://twitter.com/orangehrm?lang=en
          - link [ref=e51] [cursor=pointer]:
            - /url: https://www.youtube.com/c/OrangeHRMInc
        - generic [ref=e54]:
          - paragraph [ref=e55]: OrangeHRM OS 5.8
          - paragraph [ref=e56]:
            - text: © 2005 - 2026
            - link "OrangeHRM, Inc" [ref=e57] [cursor=pointer]:
              - /url: http://www.orangehrm.com
            - text: . All rights reserved.
  - img "orangehrm-logo" [ref=e59]
```

# Test source

```ts
  17  | const PASSWORD_FIELD = 'input[name="password"]';
  18  | const LOGIN_BUTTON = 'button[type="submit"]';
  19  | const ERROR_MESSAGE_GENERAL = '.oxd-alert-content-text';
  20  | const ERROR_MESSAGE_USERNAME_EMPTY = 'input[name="username"] + span.oxd-input-field-error-message';
  21  | const ERROR_MESSAGE_PASSWORD_EMPTY = 'input[name="password"] + span.oxd-input-field-error-message';
  22  | const DASHBOARD_HEADER = '.oxd-topbar-header-breadcrumb'; // Selector for dashboard after login
  23  | const FORGOT_PASSWORD_LINK = 'p.oxd-text.oxd-text--p.orangehrm-login-forgot-header';
  24  | 
  25  | 
  26  | /**
  27  |  * Helper function to write test results to a JSON file.
  28  |  * This function handles file locking to prevent race conditions during parallel execution.
  29  |  */
  30  | async function writeResult(testCaseId, browser, status, actualResult) {
  31  |   const outputDir = path.resolve(__dirname, '..', 'output');
  32  |   if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  33  |   const resultFile = path.join(outputDir, 'test_results.json');
  34  |   const lockFile = path.join(outputDir, 'test_results.lock');
  35  |   let waited = 0;
  36  |   while (fs.existsSync(lockFile) && waited < 10000) { await new Promise(r => setTimeout(r, 100)); waited += 100; } // Wait up to 10 seconds for lock
  37  |   fs.writeFileSync(lockFile, process.pid.toString()); // Acquire lock
  38  | 
  39  |   try {
  40  |     let results = [];
  41  |     if (fs.existsSync(resultFile)) {
  42  |       try {
  43  |         results = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
  44  |       } catch (e) {
  45  |         console.error('Error parsing existing test_results.json, starting fresh:', e);
  46  |         results = []; // If file is corrupt, start with an empty array
  47  |       }
  48  |     }
  49  | 
  50  |     const entry = { test_case_id: testCaseId, browser, status, actual_result: actualResult };
  51  |     if (status === 'Fail') {
  52  |       // Calculate defect ID
  53  |       const max = results.filter(r => r.defect_id).length;
  54  |       entry.defect_id = 'DEF' + String(max + 1).padStart(3, '0') + '-' + browser;
  55  |     }
  56  |     results.push(entry);
  57  |     fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
  58  |     console.log('Result written: ' + testCaseId + ' | ' + browser + ' | ' + status);
  59  |   } finally {
  60  |     if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile); // Release lock
  61  |   }
  62  | }
  63  | 
  64  | // Test Case: TC001
  65  | test('TC001 SCN001: Verify successful login with valid username and password.', async ({ page, browserName }) => {
  66  |   const testCaseId = 'TC001';
  67  |   let status = 'Fail';
  68  |   let actualResult = '';
  69  |   try {
  70  |     await page.goto(ORANGEHRM_URL);
  71  |     await page.fill(USERNAME_FIELD, 'Admin');
  72  |     await page.fill(PASSWORD_FIELD, 'admin123');
  73  |     await page.click(LOGIN_BUTTON);
  74  |     await expect(page.locator(DASHBOARD_HEADER)).toBeVisible();
  75  |     status = 'Pass';
  76  |     actualResult = 'User successfully redirected to the dashboard.';
  77  |   } catch (error) {
  78  |     actualResult = error.message;
  79  |     await writeResult(testCaseId, browserName, 'Fail', actualResult);
  80  |     throw error;
  81  |   }
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
> 117 |     await expect(page.locator(ERROR_MESSAGE_GENERAL)).toBeVisible();
      |                                                       ^ Error: expect(locator).toBeVisible() failed
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
  182 |     await expect(page.locator(ERROR_MESSAGE_PASSWORD_EMPTY)).toBeVisible();
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
```