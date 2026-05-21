@echo off
title OrangeHRM Test Automation Runner
color 0A

echo ==========================================
echo   OrangeHRM Test Automation Runner
echo ==========================================
echo.

:: Step 1 - Kill existing processes and start Node server
echo [1/4] Starting Node Server...
echo Killing any existing process on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
start "Node Server" cmd /k "pushd C:\Users\2445084\OneDrive - Cognizant\Documents\JavaScript\swagger && node server.js"
timeout /t 4 /nobreak >nul

:: Step 2 - Start Swagger YAML server
echo [2/4] Starting Swagger YAML Server...
echo Killing any existing process on port 5050...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5050" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
start "Swagger YAML Server" cmd /k "pushd C:\Users\2445084\OneDrive - Cognizant\Documents\JavaScript\swagger && serve -p 5050"
timeout /t 5 /nobreak >nul

:: Step 3 - Generate test cases and WAIT for it to finish
echo [3/4] Generating Test Cases (Excel + Playwright spec)...
echo Please wait - this may take 1-2 minutes for Gemini AI to generate...
echo.

:: Run Maven synchronously (no start) so bat waits for it to finish
pushd C:\my-java-tests\ai-testcase-gen
call mvn -q test -Dtest=GenerateFromSwaggerTest
popd

echo.
echo Test cases generated!
echo.

:: Wait 3 more seconds for files to be written to disk
timeout /t 3 /nobreak >nul

:: Step 4 - Now pick the LATEST spec file (generated just now)
echo [4/4] Running Playwright Automation Tests on latest spec file only...
for /f "delims=" %%f in ('dir /b /o-d "C:\Users\2445084\OneDrive - Cognizant\Documents\JavaScript\swagger\Automation-test-Cases\orangehrm_login_*.spec.js" 2^>nul') do (
  set LATEST_SPEC=%%f
  goto :found
)
:found
echo.
echo ==========================================
echo   Latest Spec File: %LATEST_SPEC%
echo ==========================================
echo.
:: Clear old test_results.json before running new tests
if exist "C:\Users\2445084\OneDrive - Cognizant\Documents\JavaScript\swagger\output\test_results.json" (
  del "C:\Users\2445084\OneDrive - Cognizant\Documents\JavaScript\swagger\output\test_results.json"
  echo Cleared old test_results.json
)
start "Playwright Tests" cmd /k "pushd C:\Users\2445084\OneDrive - Cognizant\Documents\JavaScript\swagger && echo Running: %LATEST_SPEC% && echo. && npx playwright test %LATEST_SPEC% --headed && echo. && echo Tests completed! Excel updated! && echo. && pause"

echo.
echo ==========================================
echo   All steps started successfully!
echo ==========================================
echo.
echo Check output folder for Excel results!
echo.
pause
