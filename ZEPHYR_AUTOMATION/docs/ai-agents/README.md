# AI Agent Documentation

This folder contains essential documentation for AI coding agents (GitHub Copilot, Cursor, Claude, etc.) working on this test case generation repository.

## Start Here

### 1. Primary Reference

**[AI-Agent-Context.md](AI-Agent-Context.md)** - READ THIS FIRST

Contains:

- Repository overview and critical rules
- Full pipeline walkthrough (local stories + Jira integration + batch pipeline)
- Required JSON output format and field rules
- Excel sheet structure and column definitions (including `Automation Status`)
- Playwright spec generation rules (env var credentials, case transformations)
- Acceptance criteria format guidelines

**This is your primary reference for all generation and modifications.**

### 2. Repository Context

**[REPO-CONTEXT.md](REPO-CONTEXT.md)**

Contains:

- Complete project structure (all files and folders)
- Full workflow diagrams for Path A (local), Path B (Jira), and Path C (batch pipeline)
- All CLI commands and npm scripts
- Environment variables reference
- Pipeline_Config.xlsx column reference
- Locators file format for Playwright generation

---

## Execution Flow

```
1. Read AI-Agent-Context.md         → Understand rules and JSON format
2. Read REPO-CONTEXT.md             → Understand project structure and commands
3. Read the user story provided     → Local .md file or fetched from Jira
4. Generate test cases as JSON      → Cover Positive, Negative, and Edge cases
5. Write test cases to Excel        → Sheet named Test_Case_<STORY-ID>
6. (Optional) Generate Playwright   → Page object + spec from locators file
7. (Optional) Run pipeline batch    → node run-pipeline.js via Pipeline_Config.xlsx
8. Task complete ✅
```

---

**Remember**: Output only valid JSON for test case generation — no explanations, no markdown fences, no extra text. Follow patterns exactly and never skip validation. Spec `test()` titles must match Excel `Test Scenario` values exactly for results writeback to work.
