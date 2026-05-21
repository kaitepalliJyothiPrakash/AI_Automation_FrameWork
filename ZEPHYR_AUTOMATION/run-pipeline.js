const { execSync } = require("child_process");
const fs = require("fs");
const { readConfig, createConfigTemplate } = require("./services/pipelineConfigService");
const logger = require("./utils/logger");

const EXEC_TIMEOUT_MS = 5 * 60 * 1000; // 5 min per step
const STORY_ID_RE = /^[A-Za-z0-9_-]+$/;

function sanitize(storyId) {
  if (!STORY_ID_RE.test(storyId)) {
    throw new Error(`Invalid storyId "${storyId}" — only alphanumeric, hyphens and underscores allowed.`);
  }
  return storyId;
}

function run(command, env = {}) {
  logger.info(`> ${command}`);
  execSync(command, { stdio: "inherit", timeout: EXEC_TIMEOUT_MS, env: { ...process.env, ...env } });
}

function runPlaywright(command, env = {}) {
  logger.info(`> ${command}`);
  try {
    execSync(command, { stdio: "inherit", timeout: EXEC_TIMEOUT_MS, env: { ...process.env, ...env } });
  } catch {
    // Playwright exits non-zero when tests fail — expected. Still write results to Excel.
    logger.warn("Some Playwright tests failed — continuing to update Excel with results.");
  }
}

async function runStory({ storyId: rawId, runMode, browser, headless }) {
  const storyId = sanitize(rawId);

  logger.info(`${"=".repeat(50)}`);
  logger.info(`Story: ${storyId} | Mode: ${runMode} | Browser: ${browser} | Headless: ${headless}`);
  logger.info("=".repeat(50));

  const playwrightEnv = { HEADLESS: headless };

  if (runMode === "manual" || runMode === "both") {
    run(`node fetch-jira.js ${storyId}`);
    run(`node index.js --jira --yes ${storyId}.md`);

  }

  if (runMode === "automation" || runMode === "both") {
    const locatorsFile = `./locators/${storyId}-locators.md`;
    if (!fs.existsSync(locatorsFile)) {
      const storyFile = `./stories/jira_stories/${storyId}.md`;
      const jsonDir = `./output/json`;
      const testCaseFiles = fs.existsSync(jsonDir)
        ? fs.readdirSync(jsonDir).filter(f => f.startsWith(storyId) && f.endsWith(".json")).sort().reverse()
        : [];
      const testCasesRef = testCaseFiles.length > 0
        ? ` Use the test case steps in ${jsonDir}/${testCaseFiles[0]} to understand which page actions and assertions need locators — navigate those flows live using Playwright MCP to confirm selectors.`
        : "";

      const prompt = `Use Playwright MCP to navigate to OrangeHRM and generate ${locatorsFile} following the exact format shown in locators/LOCATORS-TEMPLATE.md (use locators/SCRUM-5-locators.md as a real example). Only include locators relevant to the acceptance criteria in ${storyFile}.${testCasesRef}`;
      logger.info(`[AUTO-LOCATORS] Locators file not found — generating via Claude + Playwright MCP...`);
      run(`claude -p --dangerously-skip-permissions "${prompt}"`);
    } else {
      logger.info(`[AUTO-LOCATORS] Locators file already exists — skipping generation.`);
    }
    run(`node generate-playwright.js ${storyId}`);
    runPlaywright(`npx playwright test tests/${storyId}.spec.ts --project=${browser}`, playwrightEnv);
    run(`node update-results.js ${storyId}`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--init")) {
    await createConfigTemplate();
    return;
  }

  let rows;
  try {
    rows = await readConfig();
  } catch (err) {
    logger.error(`Failed to read pipeline config: ${err.message}`);
    process.exit(1);
  }

  logger.info(`Loaded ${rows.length} story/stories from Pipeline_Config.xlsx`);

  const results = [];
  for (const row of rows) {
    try {
      await runStory(row);
      results.push({ ...row, status: "Done" });
    } catch (err) {
      logger.error(`[FAILED] ${row.storyId}: ${err.message}`);
      results.push({ ...row, status: "Failed" });
    }
  }

  logger.info(`${"=".repeat(50)}`);
  logger.info("Pipeline Run Summary");
  logger.info("=".repeat(50));
  results.forEach((r) =>
    logger.info(`  ${r.status === "Done" ? "✓" : "✗"} ${r.storyId} [${r.runMode}] — ${r.status}`)
  );
}

main();
