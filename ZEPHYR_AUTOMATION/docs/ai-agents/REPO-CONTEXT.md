# Repository Context Summary

## For AI Agents and Developers

This repository is an **AI-powered Manual and Playwright Test Case Generator** for Jira user stories.
It fetches stories from Jira (or reads local markdown files), generates structured manual test cases via AI, writes them to Excel, and can also generate Playwright TypeScript automation specs with automatic results writeback.

---

## For AI Agents

1. **Primary Reference**: `docs/ai-agents/AI-Agent-Context.md` — workflow rules, Excel format, naming conventions
2. **Workflow**: Story (local or Jira) → AI generates test cases → user approves → Excel written → optional Playwright spec generation → results written back to Excel

## For Human Developers

1. **Add a story locally**: Create a `.md` file in `stories/in-progress/` using `stories/TEMPLATE.md`
2. **Or fetch from Jira**: Run `node fetch-jira.js SCRUM-5`
3. **Generate test cases**: Run `node index.js <story-file>` or `node fetch-jira.js --run SCRUM-5`
4. **Batch pipeline**: Fill in `Pipeline_Config.xlsx`, then run `node run-pipeline.js` (or `Automation.bat`)
5. **Generate Playwright specs**: Run `node generate-playwright.js <story-id>`
6. **Output**: `Manual_Test_Cases.xlsx` — sheet named `Test_Case_<STORY-ID>`, with `Automation Status` column updated after test run

---

## Project Structure

```
TestCase-Jira/
├── .env                          ← API keys — never commit this
├── .env.example                  ← Template showing all required env vars
├── .gitignore
├── index.js                      ← CLI: generate manual test cases from local/jira stories
├── fetch-jira.js                 ← CLI: fetch story from Jira + optional auto-process
├── generate-playwright.js        ← CLI: generate Page Object + Playwright spec from test cases
├── run-pipeline.js               ← CLI: batch pipeline driven by Pipeline_Config.xlsx
├── update-results.js             ← CLI: reads test-results.json → writes Automation Status to Excel
├── Automation.bat                ← Windows shortcut: runs `node run-pipeline.js`
├── Pipeline_Config.xlsx          ← Input: Story ID, Run Mode, Browser, Headless per row
├── Manual_Test_Cases.xlsx        ← Output: all generated test cases + Automation Status
├── package.json
├── playwright.config.ts          ← Playwright config (baseURL/headless/workers from env vars)
├── tsconfig.json
│
├── agents/
│   ├── testCaseAgent.js          ← AI orchestration: story → test cases JSON (with retry + JSON extraction)
│   ├── pageObjectAgent.js        ← AI orchestration: locators + test cases → TypeScript page object
│   └── playwrightAgent.js        ← AI orchestration: test cases + page object → Playwright spec
│
├── services/
│   ├── llmService.js             ← GitHub Models API (OpenAI-compatible, SSL bypass for corporate proxy)
│   ├── excelService.js           ← Reads/writes Manual_Test_Cases.xlsx via ExcelJS
│   ├── jiraService.js            ← Jira REST API v3 (Basic auth, 30s timeout)
│   ├── pipelineConfigService.js  ← Reads/validates Pipeline_Config.xlsx; createConfigTemplate()
│   ├── testResultsService.js     ← Maps test-results.json spec titles → Excel rows by normalized match
│   ├── parser.js                 ← Reads story markdown files from disk
│   ├── playwrightService.js      ← Writes generated TS files to pages/ and tests/
│   ├── storyLinter.js            ← Validates story has required sections and acceptance criteria
│   └── validator.js              ← Validates generated test case JSON structure
│
├── prompts/
│   ├── basePrompt.txt            ← System prompt for manual test case generation (priority/type ratio guidance)
│   ├── pageObjectPrompt.txt      ← System prompt for Playwright page object generation
│   └── playwrightPrompt.txt      ← System prompt for Playwright spec generation (env var credentials rule)
│
├── utils/
│   ├── prompt.js                 ← Shared ask() and printTestCasesSummary() helpers
│   ├── extractCode.js            ← Shared extractTypeScript() — strips markdown fences from LLM output
│   ├── moveStory.js              ← Moves processed stories: in-progress/jira_stories → completed (atomic rename)
│   ├── jiraToMarkdown.js         ← Converts Jira ADF description format → our story markdown
│   └── versionStore.js           ← Saves timestamped JSON snapshots to output/json/
│
├── pages/                        ← Playwright Page Object Models (TypeScript)
│   ├── BasePage.ts               ← Base class: navigate, waitForPageLoad, getTitle
│   └── LoginPage.ts              ← OrangeHRM login page (AI-generated)
│
├── tests/                        ← AI-generated Playwright spec files
│   └── SCRUM-5.spec.ts
│
├── locators/                     ← UI element locator files — one per story
│   └── SCRUM-5-locators.md
│
├── output/
│   └── json/                     ← Timestamped JSON snapshots of generated test cases
│
├── stories/
│   ├── TEMPLATE.md               ← Copy this to create new user stories
│   ├── backlog/                  ← Planned, not started
│   ├── in-progress/              ← Active stories for local processing
│   ├── completed/                ← Processed stories (moved here automatically)
│   └── jira_stories/             ← Stories fetched from Jira API
│
└── docs/
    └── ai-agents/
        ├── AI-Agent-Context.md   ← Primary AI agent reference — read first
        ├── README.md             ← Documentation index
        └── REPO-CONTEXT.md       ← This file
```

---

## Complete Workflows

### Path A — Local story file
```
stories/in-progress/US-01.md
        ↓
node index.js US-01.md
        ↓  lint → AI generates → preview shown → [Y/N] approval
Manual_Test_Cases.xlsx  +  output/json/US-01_<timestamp>.json
        ↓  (create locators/US-01-locators.md first)
node generate-playwright.js US-01
        ↓  AI generates page object → AI generates spec
pages/LoginPage.ts  +  tests/US-01.spec.ts
        ↓
npx playwright test tests/US-01.spec.ts --project=edge
        ↓
node update-results.js
        ↓  reads test-results.json → updates Automation Status column in Excel
```

### Path B — Jira story (two steps)
```
node fetch-jira.js SCRUM-5
        ↓  fetches from Jira REST API → converts ADF → saves markdown
stories/jira_stories/SCRUM-5.md
        ↓
node index.js --jira SCRUM-5.md
        ↓  lint → AI → approve → Excel + JSON
```

### Path B — Jira story (one command)
```
node fetch-jira.js --run SCRUM-5
        ↓  fetch + save + lint + AI + approve + Excel — all in one step
```

### Path C — Batch pipeline (Pipeline_Config.xlsx)
```
node run-pipeline.js --init
        ↓  creates Pipeline_Config.xlsx with sample row
        ↓  fill in Story ID, Run Mode, Browser, Headless columns
node run-pipeline.js   (or: Automation.bat)
        ↓  for each row:
             if runMode is manual or both:
               node fetch-jira.js <storyId>
               node index.js --jira --yes <storyId>.md
             if runMode is automation or both:
               node generate-playwright.js <storyId>
               npx playwright test tests/<storyId>.spec.ts --project=<browser>
               node update-results.js   ← always runs even if tests fail
        ↓  summary: ✓/✗ per story
```

---

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run generate <file>` | Generate test cases from a local story |
| `npm run jira:fetch <KEY>` | Fetch story from Jira and save to jira_stories/ |
| `npm run jira:run <KEY>` | Fetch from Jira and process in one step |
| `npm run jira:generate <file>` | Process an already-fetched Jira story |
| `npm run playwright:generate <id>` | Generate page object + Playwright spec |
| `npm run playwright:test` | Run all Playwright tests |
| `npm run playwright:test:ui` | Run Playwright in interactive UI mode |
| `npm run playwright:report` | Open the HTML test report |
| `npm run playwright:results` | Write Playwright results to Excel |
| `npm run pipeline:init` | Create Pipeline_Config.xlsx template |
| `npm run pipeline:run` | Run full batch pipeline |

---

## Environment Variables

| Variable | Required for | Description |
|----------|-------------|-------------|
| `GITHUB_TOKEN` | All AI generation | GitHub personal access token for GitHub Models API |
| `LLM_MODEL` | AI generation | Model ID override (default: `openai/gpt-4o`) |
| `JIRA_BASE_URL` | Jira integration | e.g. `https://yourcompany.atlassian.net` |
| `JIRA_EMAIL` | Jira integration | Your Jira account email |
| `JIRA_API_TOKEN` | Jira integration | Generate at id.atlassian.com/manage-profile/security/api-tokens |
| `JIRA_DONE_STATUS` | Jira transition | Status name to transition story to after processing |
| `BASE_URL` | Playwright | Target application base URL (default: OrangeHRM demo) |
| `HEADLESS` | Playwright | `true` / `false` — overrides playwright.config.ts (default: `true`) |
| `WORKERS` | Playwright | Parallel worker count (default: `5`) |
| `TEST_USERNAME` | Playwright | Login username used in automation tests |
| `TEST_PASSWORD` | Playwright | Login password used in automation tests |

Copy `.env.example` to `.env` and fill in your values.

---

## Excel Output Format

Every processed story produces a new sheet in `Manual_Test_Cases.xlsx`. If a sheet for the same story already exists, it is replaced.

| Column | Description |
|--------|-------------|
| `Test Id` | Unique identifier — TC001, TC002, ... |
| `Test Scenario` | Human-readable description of what is being tested |
| `Steps` | Ordered steps for the tester to execute |
| `Input Data` | Specific values used (e.g. Username: Admin, Password: admin123) |
| `Expected Result` | What should happen after the steps are executed |
| `Priority` | High / Medium / Low |
| `Type` | Positive / Negative / Edge |
| `Automation Status` | Written by `update-results.js` — `Passed`, `Failed`, `Timed Out`, `Skipped`, or `Not Run` |

**Sheet naming**: `Test_Case_<STORY-ID>` — e.g. `Test_Case_US-01`, `Test_Case_SCRUM-5`

**Matching**: `testResultsService.js` matches spec titles to Excel `Test Scenario` values using normalized string comparison (lowercase, punctuation stripped).

---

## Pipeline_Config.xlsx

Controls batch execution. Create with `node run-pipeline.js --init`.

| Column | Valid Values | Description |
|--------|-------------|-------------|
| `Story ID` | e.g. `SCRUM-5` | Jira issue key (case-insensitive) |
| `Run Mode` | `manual` / `automation` / `both` | Which pipeline steps to run |
| `Browser` | `edge` / `chrome` | Playwright browser project |
| `Headless` | `true` / `false` | Headless browser execution |

Rows with invalid values are skipped with a warning.

---

## Locators File Format

To generate Playwright page objects, create `locators/<STORY-ID>-locators.md`:

```markdown
## LoginPage
- url: /web/index.php/auth/login
- usernameInput: input[name="username"]
- passwordInput: input[name="password"]
- loginButton: button[type="submit"]
- errorAlert: .oxd-alert-content-text
```

The `##` heading becomes the class name. Each `-` line becomes a private locator property. The AI derives methods and assertions from the test case JSON.

---

## External Resources

- [OrangeHRM Demo](https://opensource-demo.orangehrmlive.com) — Target application
- [GitHub Models](https://github.com/marketplace/models) — LLM inference endpoint
- [ExcelJS Docs](https://github.com/exceljs/exceljs) — Excel library used
- [Playwright Docs](https://playwright.dev) — Automation framework
- [Jira REST API v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/) — Jira integration
