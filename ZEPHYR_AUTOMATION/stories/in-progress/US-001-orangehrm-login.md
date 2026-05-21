# US-001: OrangeHRM Login

## User Story
As a registered employee, I want to log in to OrangeHRM by providing my username and password, so that I can access the HR management system.

## Acceptance Criteria
- User can login with valid username and password
- User should see error message for invalid credentials
- User should see validation message for empty fields
- Password field should be masked
- Forgot password link should be present
- User should be redirected to dashboard after successful login

## Test Data
- Valid Username: Admin
- Valid Password: admin123
- Target URL: https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
