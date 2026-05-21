# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orangehrm_login_1779359454900.spec.js >> TC-009-001 SCN-009: Verify case sensitivity for username (lowercase)
- Location: Automation-test-Cases\orangehrm_login_1779359454900.spec.js:341:1

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
- generic [ref=e3]:
  - generic:
    - complementary [ref=e4]:
      - navigation "Sidepanel" [ref=e5]:
        - generic [ref=e6]:
          - link "client brand banner" [ref=e7] [cursor=pointer]:
            - /url: https://www.orangehrm.com/
            - img "client brand banner" [ref=e9]
          - text: 
        - generic [ref=e10]:
          - generic [ref=e11]:
            - generic [ref=e12]:
              - textbox "Search" [ref=e15]
              - button "" [ref=e16] [cursor=pointer]:
                - generic [ref=e17]: 
            - separator [ref=e18]
          - list [ref=e19]:
            - listitem [ref=e20]:
              - link "Admin" [ref=e21] [cursor=pointer]:
                - /url: /web/index.php/admin/viewAdminModule
                - generic [ref=e24]: Admin
            - listitem [ref=e25]:
              - link "PIM" [ref=e26] [cursor=pointer]:
                - /url: /web/index.php/pim/viewPimModule
                - generic [ref=e40]: PIM
            - listitem [ref=e41]:
              - link "Leave" [ref=e42] [cursor=pointer]:
                - /url: /web/index.php/leave/viewLeaveModule
                - generic [ref=e45]: Leave
            - listitem [ref=e46]:
              - link "Time" [ref=e47] [cursor=pointer]:
                - /url: /web/index.php/time/viewTimeModule
                - generic [ref=e53]: Time
            - listitem [ref=e54]:
              - link "Recruitment" [ref=e55] [cursor=pointer]:
                - /url: /web/index.php/recruitment/viewRecruitmentModule
                - generic [ref=e61]: Recruitment
            - listitem [ref=e62]:
              - link "My Info" [ref=e63] [cursor=pointer]:
                - /url: /web/index.php/pim/viewMyDetails
                - generic [ref=e69]: My Info
            - listitem [ref=e70]:
              - link "Performance" [ref=e71] [cursor=pointer]:
                - /url: /web/index.php/performance/viewPerformanceModule
                - generic [ref=e79]: Performance
            - listitem [ref=e80]:
              - link "Dashboard" [ref=e81] [cursor=pointer]:
                - /url: /web/index.php/dashboard/index
                - generic [ref=e84]: Dashboard
            - listitem [ref=e85]:
              - link "Directory" [ref=e86] [cursor=pointer]:
                - /url: /web/index.php/directory/viewDirectory
                - generic [ref=e89]: Directory
            - listitem [ref=e90]:
              - link "Maintenance" [ref=e91] [cursor=pointer]:
                - /url: /web/index.php/maintenance/viewMaintenanceModule
                - generic [ref=e95]: Maintenance
            - listitem [ref=e96]:
              - link "Claim" [ref=e97] [cursor=pointer]:
                - /url: /web/index.php/claim/viewClaimModule
                - img [ref=e100]
                - generic [ref=e104]: Claim
            - listitem [ref=e105]:
              - link "Buzz" [ref=e106] [cursor=pointer]:
                - /url: /web/index.php/buzz/viewBuzz
                - generic [ref=e109]: Buzz
    - banner [ref=e110]:
      - generic [ref=e111]:
        - generic [ref=e112]:
          - text: 
          - heading "Dashboard" [level=6] [ref=e114]
        - link "Upgrade" [ref=e116]:
          - /url: https://orangehrm.com/open-source/upgrade-to-advanced
          - button "Upgrade" [ref=e117] [cursor=pointer]: Upgrade
        - list [ref=e123]:
          - listitem [ref=e124]:
            - generic [ref=e125] [cursor=pointer]:
              - img "profile picture" [ref=e126]
              - paragraph [ref=e127]: madhu testLastName
              - generic [ref=e128]: 
      - navigation "Topbar Menu" [ref=e130]:
        - list [ref=e131]:
          - button "" [ref=e133] [cursor=pointer]:
            - generic [ref=e134]: 
  - generic [ref=e135]:
    - generic [ref=e137]:
      - generic [ref=e139]:
        - generic [ref=e141]:
          - generic [ref=e142]: 
          - paragraph [ref=e143]: Time at Work
        - separator [ref=e144]
        - generic [ref=e146]:
          - generic [ref=e147]:
            - img "profile picture" [ref=e149]
            - generic [ref=e150]:
              - paragraph [ref=e151]: Punched Out
              - paragraph [ref=e152]: "Punched Out: Today at 03:53 PM (GMT 5.5)"
          - generic [ref=e153]:
            - generic [ref=e154]: 0h 14m Today
            - button "" [ref=e155] [cursor=pointer]:
              - generic [ref=e156]: 
          - separator [ref=e157]
          - generic [ref=e158]:
            - generic [ref=e159]:
              - paragraph [ref=e160]: This Week
              - paragraph [ref=e161]: May 18 - May 24
            - generic [ref=e162]:
              - generic [ref=e163]: 
              - paragraph [ref=e164]: 0h 14m
      - generic [ref=e168]:
        - generic [ref=e170]:
          - generic [ref=e171]: 
          - paragraph [ref=e172]: My Actions
        - separator [ref=e173]
        - generic [ref=e175]:
          - generic [ref=e176]:
            - button [ref=e177] [cursor=pointer]
            - paragraph [ref=e183] [cursor=pointer]: (1) Pending Self Review
          - generic [ref=e184]:
            - button [ref=e185] [cursor=pointer]
            - paragraph [ref=e194] [cursor=pointer]: (1) Candidate to Interview
      - generic [ref=e196]:
        - generic [ref=e198]:
          - generic [ref=e199]: 
          - paragraph [ref=e200]: Quick Launch
        - separator [ref=e201]
        - generic [ref=e203]:
          - generic [ref=e204]:
            - button "Assign Leave" [ref=e205] [cursor=pointer]
            - generic "Assign Leave" [ref=e208]:
              - paragraph [ref=e209]: Assign Leave
          - generic [ref=e210]:
            - button "Leave List" [ref=e211] [cursor=pointer]
            - generic "Leave List" [ref=e218]:
              - paragraph [ref=e219]: Leave List
          - generic [ref=e220]:
            - button "Timesheets" [ref=e221] [cursor=pointer]
            - generic "Timesheets" [ref=e227]:
              - paragraph [ref=e228]: Timesheets
          - generic [ref=e229]:
            - button "Apply Leave" [ref=e230] [cursor=pointer]
            - generic "Apply Leave" [ref=e233]:
              - paragraph [ref=e234]: Apply Leave
          - generic [ref=e235]:
            - button "My Leave" [ref=e236] [cursor=pointer]
            - generic "My Leave" [ref=e241]:
              - paragraph [ref=e242]: My Leave
          - generic [ref=e243]:
            - button "My Timesheet" [ref=e244] [cursor=pointer]
            - generic "My Timesheet" [ref=e247]:
              - paragraph [ref=e248]: My Timesheet
      - generic [ref=e250]:
        - generic [ref=e252]:
          - generic [ref=e253]: 
          - paragraph [ref=e254]: Buzz Latest Posts
        - separator [ref=e255]
        - generic [ref=e257]:
          - generic [ref=e258]:
            - generic [ref=e259] [cursor=pointer]:
              - img "profile picture" [ref=e261]
              - generic [ref=e262]:
                - paragraph [ref=e263]: madhu Iravant testLastName
                - paragraph [ref=e264]: 2020-08-10 09:08 AM
            - separator [ref=e265]
            - paragraph [ref=e266]: "Hi All; Linda has been blessed with a baby boy! Linda: With love, we welcome your dear new baby to this world. Congratulations!"
          - generic [ref=e267]:
            - generic [ref=e268] [cursor=pointer]:
              - img "profile picture" [ref=e270]
              - generic [ref=e271]:
                - paragraph [ref=e272]: Sania Shaheen
                - paragraph [ref=e273]: 2020-08-10 09:08 AM
            - separator [ref=e274]
            - paragraph [ref=e275]: "World Championship: What makes the perfect snooker player? Mark Selby: Robertson has one of the best techniques in the game. It is very, very straight and he fully commits to every single shot he plays. John Higgins: Every shot is repetitive. He always keeps the same technique and cues through the ball bang straight. Barry Hawkins: Robertson is textbook with his grip and has a ramrod solid cue action, delivering it in a straight line. Honourable mentions: Shaun Murphy, Ding Junhui, Jack Lisowski."
          - generic [ref=e276]:
            - generic [ref=e277] [cursor=pointer]:
              - img "profile picture" [ref=e279]
              - generic [ref=e280]:
                - paragraph [ref=e281]: Rebecca Harmony
                - paragraph [ref=e282]: 2020-08-10 09:04 AM
            - separator [ref=e283]
            - paragraph [ref=e284]: Throwback Thursdays!!
            - img [ref=e285]
          - generic [ref=e286]:
            - generic [ref=e287] [cursor=pointer]:
              - img "profile picture" [ref=e289]
              - generic [ref=e290]:
                - paragraph [ref=e291]: Russel Hamilton
                - paragraph [ref=e292]: 2020-08-10 09:03 AM
            - separator [ref=e293]
            - paragraph [ref=e294]: Live SIMPLY Dream BIG Be GREATFULL Give LOVE Laugh LOT.......
      - generic [ref=e296]:
        - generic [ref=e297]:
          - paragraph [ref=e302]: Employees on Leave Today
          - generic [ref=e303] [cursor=pointer]: 
        - separator [ref=e304]
        - generic [ref=e306]:
          - img "No Content" [ref=e307]
          - paragraph [ref=e308]: No Employees are on Leave Today
      - generic [ref=e310]:
        - generic [ref=e312]:
          - generic [ref=e313]: 
          - paragraph [ref=e314]: Employee Distribution by Sub Unit
        - separator [ref=e315]
        - list [ref=e320]:
          - listitem [ref=e321] [cursor=pointer]:
            - generic "Engineering" [ref=e323]
          - listitem [ref=e324] [cursor=pointer]:
            - generic "Human Resources" [ref=e326]
          - listitem [ref=e327] [cursor=pointer]:
            - generic "Administration" [ref=e329]
          - listitem [ref=e330] [cursor=pointer]:
            - generic "Client Services" [ref=e332]
          - listitem [ref=e333] [cursor=pointer]:
            - generic "Unassigned" [ref=e335]
      - generic [ref=e337]:
        - generic [ref=e339]:
          - generic [ref=e340]: 
          - paragraph [ref=e341]: Employee Distribution by Location
        - separator [ref=e342]
        - list [ref=e347]:
          - listitem [ref=e348] [cursor=pointer]:
            - generic "Texas R&D" [ref=e350]
          - listitem [ref=e351] [cursor=pointer]:
            - generic "New York Sales Office" [ref=e353]
          - listitem [ref=e354] [cursor=pointer]:
            - generic "Unassigned" [ref=e356]
    - generic [ref=e357]:
      - paragraph [ref=e358]: OrangeHRM OS 5.8
      - paragraph [ref=e359]:
        - text: © 2005 - 2026
        - link "OrangeHRM, Inc" [ref=e360] [cursor=pointer]:
          - /url: http://www.orangehrm.com
        - text: . All rights reserved.
```

# Test source

```ts
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
  303 | // Test Case ID: TC-008-002
  304 | // Scenario ID: SCN-008
  305 | // Description: Verify protection against XSS injection in the password field.
  306 | test('TC-008-002 SCN-008: Verify XSS injection protection in password field', async ({ page, browserName }) => {
  307 |   const testCaseId = 'TC-008-002';
  308 |   let status = 'Pass';
  309 |   let actualResult = 'The script/HTML is not executed; "Invalid credentials" displayed.';
  310 |   try {
  311 |     await page.goto(ORANGEHRM_URL);
  312 |     // Monitor for dialogs (like alert()) to ensure no XSS script execution
  313 |     page.on('dialog', async dialog => {
  314 |       if (dialog.type() === 'alert') {
  315 |         throw new Error('XSS alert dialog detected! Script was executed.'); // Fail the test if an alert appears
  316 |       }
  317 |       await dialog.dismiss();
  318 |     });
  319 | 
  320 |     await page.fill(USERNAME_FIELD, VALID_USERNAME);
  321 |     await page.fill(PASSWORD_FIELD, "<img src=x onerror=alert('XSS')>");
  322 |     await page.click(LOGIN_BUTTON);
  323 | 
  324 |     const errorMessage = page.locator(ERROR_MESSAGE);
  325 |     await expect(errorMessage).toBeVisible();
  326 |     await expect(errorMessage).toHaveText('Invalid credentials');
  327 |     await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page
  328 |   } catch (error) {
  329 |     status = 'Fail';
  330 |     actualResult = error.message;
  331 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  332 |     throw error;
  333 |   } finally {
  334 |     await writeResult(testCaseId, browserName, status, actualResult);
  335 |   }
  336 | });
  337 | 
  338 | // Test Case ID: TC-009-001
  339 | // Scenario ID: SCN-009
  340 | // Description: Verify case sensitivity for username (lowercase).
  341 | test('TC-009-001 SCN-009: Verify case sensitivity for username (lowercase)', async ({ page, browserName }) => {
  342 |   const testCaseId = 'TC-009-001';
  343 |   let status = 'Pass';
  344 |   let actualResult = 'Login fails with "Invalid credentials" due to case-sensitive username.';
  345 |   try {
  346 |     await page.goto(ORANGEHRM_URL);
  347 |     await page.fill(USERNAME_FIELD, 'admin'); // Lowercase username
  348 |     await page.fill(PASSWORD_FIELD, VALID_PASSWORD);
  349 |     await page.click(LOGIN_BUTTON);
  350 |     const errorMessage = page.locator(ERROR_MESSAGE);
> 351 |     await expect(errorMessage).toBeVisible();
      |                                ^ Error: expect(locator).toBeVisible() failed
  352 |     await expect(errorMessage).toHaveText('Invalid credentials');
  353 |     await expect(page).toHaveURL(ORANGEHRM_URL); // User remains on login page
  354 |   } catch (error) {
  355 |     status = 'Fail';
  356 |     actualResult = error.message;
  357 |     console.error(`Test ${testCaseId} failed: ${error.message}`);
  358 |     throw error;
  359 |   } finally {
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
```