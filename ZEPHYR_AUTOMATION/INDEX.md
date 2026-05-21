# Documentation Index

**AI-Powered Manual & Playwright Test Case Generator**

Welcome! This index helps you navigate the project documentation and tooling.

---

## Documentation Structure

```
docs/
└── ai-agents/
    ├── AI-Agent-Context.md     ← PRIMARY REFERENCE for AI agents
    ├── REPO-CONTEXT.md         ← Full project structure, workflows, commands
    └── README.md               ← Documentation index for AI agents
```

---

## For AI Agents

**Start Here**: [`docs/ai-agents/AI-Agent-Context.md`](docs/ai-agents/AI-Agent-Context.md)

Contains everything an AI agent must follow:
- Full pipeline walkthrough (local stories + Jira integration + batch pipeline)
- Required JSON output format and field validation rules
- Excel column format and sheet naming convention
- Acceptance criteria format for Jira stories
- What to NEVER do (output anything other than JSON)

**Repository Overview**: [`docs/ai-agents/REPO-CONTEXT.md`](docs/ai-agents/REPO-CONTEXT.md)

---

## For Developers

### How do I...?

| Task | Command |
|------|---------|
| Create a new local story | Copy `stories/TEMPLATE.md` → save to `stories/in-progress/` |
| Fetch a story from Jira | `node fetch-jira.js SCRUM-5` |
| Fetch + process in one step | `node fetch-jira.js --run SCRUM-5` |
| Generate manual test cases | `node index.js US-01.md` |
| Generate from a Jira story | `node index.js --jira SCRUM-5.md` |
| Generate Playwright spec | `node generate-playwright.js SCRUM-5` |
| Run Playwright tests | `npx playwright test --project=edge` |
| Write test results to Excel | `node update-results.js` |
| Create pipeline config template | `node run-pipeline.js --init` |
| Run full batch pipeline | `node run-pipeline.js` (or `Automation.bat`) |
| Open Playwright UI mode | `npx playwright test --ui` |
| Open HTML test report | `npx playwright show-report` |

---

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run generate` | Generate test cases from a local story |
| `npm run jira:fetch` | Fetch story from Jira |
| `npm run jira:run` | Fetch from Jira and process in one step |
| `npm run jira:generate` | Process an already-fetched Jira story |
| `npm run playwright:generate` | Generate page object + Playwright spec |
| `npm run playwright:test` | Run all Playwright tests |
| `npm run playwright:test:ui` | Playwright interactive UI mode |
| `npm run playwright:report` | Open HTML report |
| `npm run playwright:results` | Write Playwright results to Excel |
| `npm run pipeline:init` | Create `Pipeline_Config.xlsx` template |
| `npm run pipeline:run` | Run full batch pipeline from `Pipeline_Config.xlsx` |

---

## Full Pipeline

### Path A — Local Story
```
stories/in-progress/US-01.md
        ↓
node index.js US-01.md        (lint → AI → preview → [Y/N])
        ↓
Manual_Test_Cases.xlsx  +  output/json/US-01_<timestamp>.json
        ↓  create locators/US-01-locators.md first
node generate-playwright.js US-01
        ↓
pages/LoginPage.ts  +  tests/US-01.spec.ts
        ↓
npx playwright test tests/US-01.spec.ts --project=edge
        ↓
node update-results.js        (writes Pass/Fail to Excel)
```

### Path B — Jira Story
```
node fetch-jira.js --run SCRUM-5
        ↓  fetch → save → lint → AI → approve → Excel + JSON
```

### Path C — Batch Pipeline (Pipeline_Config.xlsx)
```
node run-pipeline.js --init   (creates Pipeline_Config.xlsx template)
        ↓  fill in Story ID, Run Mode, Browser, Headless
node run-pipeline.js          (or: Automation.bat)
        ↓  for each row in Pipeline_Config.xlsx:
             fetch Jira story → generate test cases → write Excel
             → generate Playwright → run tests → write results
```

---

## Pipeline_Config.xlsx

Controls which stories run and how. Create it with `node run-pipeline.js --init`.

| Column | Values | Description |
|--------|--------|-------------|
| `Story ID` | e.g. `SCRUM-5` | Jira issue key |
| `Run Mode` | `manual` / `automation` / `both` | Which pipeline steps to execute |
| `Browser` | `edge` / `chrome` | Browser to use for Playwright |
| `Headless` | `true` / `false` | Run browser headlessly |

---

## Excel Output Format

All test cases are written to `Manual_Test_Cases.xlsx`.
Each story gets its own sheet named `Test_Case_<STORY-ID>` (e.g. `Test_Case_US-01`, `Test_Case_SCRUM-5`).
If the sheet already exists it is replaced on re-run.

| Column | Description |
|--------|-------------|
| `Test Id` | TC001, TC002, ... |
| `Test Scenario` | Human-readable description of what is being tested |
| `Steps` | Ordered numbered steps the tester performs |
| `Input Data` | e.g. "Username: Admin, Password: admin123" |
| `Expected Result` | Observable outcome after all steps complete |
| `Priority` | High / Medium / Low |
| `Type` | Positive / Negative / Edge |
| `Automation Status` | Populated after Playwright run — `Passed`, `Failed`, `Timed Out`, `Skipped`, or `Not Run` |

---

## Story Folders

| Folder | Purpose |
|--------|---------|
| `stories/backlog/` | Planned stories, not yet started |
| `stories/in-progress/` | Local stories being actively worked on |
| `stories/jira_stories/` | Stories fetched from Jira API |
| `stories/completed/` | Processed stories (moved here automatically) |

---

## Playwright Page Object Structure

| Folder | Purpose |
|--------|---------|
| `locators/` | One `.md` file per story — element names + CSS selectors |
| `pages/` | AI-generated TypeScript page object classes |
| `tests/` | AI-generated Playwright spec files |

**Locators file format** (`locators/US-01-locators.md`):
```markdown
## LoginPage
- url: /web/index.php/auth/login
- usernameInput: input[name="username"]
- loginButton: button[type="submit"]
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

| Variable | Required for | Description |
|----------|-------------|-------------|
| `GEMINI_API_KEY` | All AI generation | GitHub personal access token for GitHub Models |
| `LLM_MODEL` | AI generation | Model ID (default: `openai/gpt-4o`) |
| `JIRA_BASE_URL` | Jira integration | e.g. `https://yourcompany.atlassian.net` |
| `JIRA_EMAIL` | Jira integration | Your Jira account email |
| `JIRA_API_TOKEN` | Jira integration | Generate at id.atlassian.com/manage-profile/security/api-tokens |
| `JIRA_DONE_STATUS` | Jira transition | Status name to transition story to after processing |
| `BASE_URL` | Playwright | Target app base URL (default: OrangeHRM demo) |
| `HEADLESS` | Playwright | `true` / `false` (default: `true`) |
| `WORKERS` | Playwright | Parallel worker count (default: `5`) |
| `TEST_USERNAME` | Playwright | Login username for automation tests |
| `TEST_PASSWORD` | Playwright | Login password for automation tests |

---

## External Links

- [OrangeHRM Demo](https://opensource-demo.orangehrmlive.com) — Target application
- [Jira API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens) — Generate your Jira API token
- [Playwright Docs](https://playwright.dev) — Automation framework docs
- [GitHub Models](https://github.com/marketplace/models) — LLM inference endpoint

---

**Last Updated**: 2026-04-24
**Status**: Active
