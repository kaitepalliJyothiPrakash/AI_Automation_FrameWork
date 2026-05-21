# AI Agent Context - OrangeHRM Test Case Creation

This file provides context for AI coding agents (GitHub Copilot, Cursor, Claude, etc.) working on this repository. Follow these guidelines when generating, modifying, or maintaining test cases.

## Repository Overview

**Type**: AI-powered Manual and Playwright Test Case Generator  
**Technology**: Excel-Driven Testing + Playwright TypeScript Automation  
**Target Application**: OrangeHRM Demo (https://opensource-demo.orangehrmlive.com)  
**LLM Provider**: Gemini
**Testing Approach**: Data-driven test case creation from user stories  
**Development Method**: User Story-Driven (local markdown or fetched from Jira)

---

## User Story-Driven Workflow

### How It Works

1. **Story Source**: Developer either creates a markdown file in `stories/in-progress/` or fetches directly from Jira using `node fetch-jira.js <ISSUE-KEY>`
2. **Story Linting**: The system validates the story has required sections (`## Story`, `## Acceptance Criteria`) and at least 2 ACs before processing
3. **AI Generation**: AI reads the story and generates structured test cases as JSON
4. **Developer Review**: Developer sees a preview of all generated test cases and approves or rejects with `[Y/N]` (skipped in batch mode via `--yes`)
5. **Output**: Approved test cases are written to `Manual_Test_Cases.xlsx` and saved as JSON to `output/json/`
6. **Playwright** (optional): Developer provides locators in `locators/<story-id>-locators.md`, then runs `node generate-playwright.js <story-id>` to generate a TypeScript page object and Playwright spec
7. **Results Writeback**: After Playwright execution, `node update-results.js` reads `test-results.json` and updates the `Automation Status` column in Excel

### Story Folder Organisation

- `stories/in-progress/` — Local stories being actively worked on
- `stories/jira_stories/` — Stories fetched from Jira API
- `stories/completed/` — Stories that have been processed (moved here automatically)
- `stories/backlog/` — Planned but not yet started

**Template**: `stories/TEMPLATE.md` — copy this for new local stories

---

## Running the Pipeline

### Local story
```bash
node index.js US-01.md
# or batch:
node index.js US-01.md US-02.md
```

### Jira story — fetch only
```bash
node fetch-jira.js SCRUM-5
node index.js --jira SCRUM-5.md
```

### Jira story — fetch and process in one step
```bash
node fetch-jira.js --run SCRUM-5
```

### Batch pipeline (Pipeline_Config.xlsx)
```bash
node run-pipeline.js --init   # create config template
node run-pipeline.js          # run all rows (or: Automation.bat)
```

### Generate Playwright automation
```bash
# First: create locators/SCRUM-5-locators.md with element selectors
node generate-playwright.js SCRUM-5
npx playwright test tests/SCRUM-5.spec.ts --project=edge
node update-results.js        # write Pass/Fail back to Excel
```

---

## Required Excel Sheet Structure

```
| Test Id | Test Scenario | Steps | Input Data | Expected Result | Priority | Type | Automation Status |
|---------|--------------|-------|-----------|-----------------|----------|------|-------------------|
| TC001   | Valid Login  | 1. Navigate to login page\n2. Enter credentials\n3. Click Login | Username: Admin, Password: admin123 | Dashboard is displayed | High | Positive | Passed |
```

**Required Columns:**

- `Test Id`: Unique identifier (TC001, TC002, ...)
- `Test Scenario`: Human-readable test description — **must exactly match the Playwright spec `test()` title**
- `Steps`: Ordered steps to execute the test (numbered list)
- `Input Data`: Test data values (empty string if not applicable)
- `Expected Result`: Observable outcome after all steps complete
- `Priority`: exactly `High`, `Medium`, or `Low`
- `Type`: exactly `Positive`, `Negative`, or `Edge`
- `Automation Status`: Written by `update-results.js` — `Passed`, `Failed`, `Timed Out`, `Skipped`, or `Not Run`

**Sheet naming**: `Test_Case_<STORY-ID>` — e.g. `Test_Case_US-01`, `Test_Case_SCRUM-5`

---

## AI Agent Action Sequence

1. Read the user story completely (from `stories/in-progress/` or `stories/jira_stories/`)
2. Read `docs/ai-agents/AI-Agent-Context.md` (this file) for patterns
3. Read `docs/ai-agents/REPO-CONTEXT.md` for full project structure
4. Generate manual test cases — return **only valid JSON**, no other text
5. If also generating Playwright: read the locators file, generate page object class, then generate spec using only methods from that page object

---

## JSON Output Format

```json
{
  "feature": "Login Feature",
  "test_cases": [
    {
      "id": "TC001",
      "title": "Valid login with correct credentials",
      "steps": [
        "Navigate to the OrangeHRM login page",
        "Enter username: Admin",
        "Enter password: admin123",
        "Click the Login button"
      ],
      "input_data": "Username: Admin, Password: admin123",
      "expected_result": "User is redirected to the dashboard",
      "priority": "High",
      "type": "Positive"
    }
  ]
}
```

**Field rules:**
- `id`: format TC001, TC002, ... (no gaps, no duplicates)
- `priority`: must be exactly `"High"`, `"Medium"`, or `"Low"`
- `type`: must be exactly `"Positive"`, `"Negative"`, or `"Edge"`
- `steps`: must be a non-empty array of strings
- `input_data`: use empty string `""` if not applicable — field must always be present
- `title`: must be copied verbatim into the Playwright `test("...")` title for results matching to work

**Never** output any text, explanation, or markdown outside the JSON object.

---

## Playwright Spec Generation Rules

When generating Playwright TypeScript specs:

- **Never hardcode credentials** — use `process.env.TEST_USERNAME` and `process.env.TEST_PASSWORD`
- **Case variation tests** — apply transformation directly on the env var:
  - Uppercase: `process.env.TEST_USERNAME!.toUpperCase()`
  - Lowercase: `process.env.TEST_USERNAME!.toLowerCase()`
  - Never invent placeholders like `"VALIDUSER"` or `"admin"`
- **Use relative paths** for navigation (e.g. `'/web/index.php/auth/login'`) — `baseURL` is configured in `playwright.config.ts`
- **Spec title must match** the `Test Scenario` column in Excel exactly — `testResultsService.js` uses this to write results back

---

## Acceptance Criteria Format in Stories

Stories must have a `## Acceptance Criteria` section with at least 2 checkboxes:

```markdown
## Acceptance Criteria

- [ ] AC1: User can log in successfully with valid username and password.
- [ ] AC2: System prevents login with invalid credentials and displays "Invalid credentials".
- [ ] AC3: System enforces mandatory fields — login fails if username or password is blank.
```

When writing acceptance criteria in Jira, use a **Heading** ("Acceptance Criteria") followed by a **bullet list** in the description editor — not plain text.

---

This context file is the source of truth for AI agents. Follow patterns exactly, validate always, and never output anything other than the required JSON.
