# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered test case generation system that converts Jira user stories (or local markdown stories) into manual test cases (Excel) and Playwright automation (TypeScript). Uses the Gemini API via an OpenAI-compatible endpoint.

## Common Commands

### Test Case Generation
```bash
node index.js US-01.md                     # Generate from local story (interactive)
node index.js --yes US-01.md               # Auto-approve (batch mode)
node fetch-jira.js SCRUM-5                 # Fetch Jira story only
node fetch-jira.js --run SCRUM-5           # Fetch Jira story + generate test cases
node index.js --jira SCRUM-5.md            # Process already-fetched Jira story
```

### Playwright Automation
```bash
node generate-playwright.js SCRUM-5        # Generate page object + spec from test cases
npx playwright test tests/SCRUM-5.spec.ts --project=edge  # Run a single spec
npm run playwright:test                    # Run all tests
npm run playwright:test:ui                 # Interactive UI mode
npm run playwright:report                  # View HTML report
node update-results.js SCRUM-5             # Write Playwright results back to Excel
```

### Batch Pipeline
```bash
node run-pipeline.js --init               # Create Pipeline_Config.xlsx template
node run-pipeline.js                      # Run full pipeline for all rows
Automation.bat                            # Windows batch runner
```

## Architecture: Three-Stage Pipeline

**Stage 1 — Story Ingestion**
- Local stories: `stories/in-progress/*.md`
- Jira stories: `fetch-jira.js` → Jira API → `stories/jira_stories/*.md`
- Processed stories archived to `stories/completed/`

**Stage 2 — Test Case Generation**
1. `storyLinter.js` validates story has `## Story` + `## Acceptance Criteria` (min 2 items)
2. `testCaseAgent.js` builds LLM prompt from `prompts/basePrompt.txt` + docs in `docs/ai-agents/`
3. `llmService.js` calls Gemini API (temperature=0.2); retries JSON extraction up to 3 times
4. `validator.js` enforces: priority ∈ {High, Medium, Low}, type ∈ {Positive, Negative, Edge}
5. Output: `Manual_Test_Cases.xlsx` (sheet `Test_Case_<STORY-ID>`) + `output/json/*_<timestamp>.json`

**Stage 3 — Automation Generation (optional)**
1. Requires a locators file at `locators/<StoryId>-locators.md` (CSS/XPath selectors, with `## ClassName` header)
2. `pageObjectAgent.js` generates a TypeScript class extending `BasePage` → `pages/<ClassName>.ts`
3. `playwrightAgent.js` generates `test.describe()` spec → `tests/<StoryId>.spec.ts`
4. After test runs, `testResultsService.js` reads `test-results.json` and updates "Automation Status" in Excel

## Key Data Flows

- **LLM context**: `llmService.js` always loads all `.md` files from `docs/` as system context alongside the story
- **JSON versioning**: Every LLM output is timestamped and stored in `output/json/` before writing to Excel
- **Batch config**: `Pipeline_Config.xlsx` drives `run-pipeline.js`; columns are Story ID, Run Mode (`manual`/`automation`/`both`), Browser, Headless

## Environment Configuration (`.env`)
Required variables:
- `GEMINI_API_KEY` — Gemini API key
- `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY` — Jira credentials
- `TEST_USERNAME`, `TEST_PASSWORD` — OrangeHRM demo credentials
- `BROWSER`, `HEADLESS` — Playwright overrides

## Playwright Setup
- `playwright.config.ts` targets Microsoft Edge, base URL is OrangeHRM demo, 3 parallel workers
- Generated page objects extend `BasePage` (check `pages/` for existing examples)
- Reports: HTML (`test-results/`) + JSON (`test-results.json`)
