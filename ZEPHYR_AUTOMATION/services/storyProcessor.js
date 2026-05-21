const { readStory } = require("./parser");
const { lintStory } = require("./storyLinter");
const { runAgent } = require("../agents/testCaseAgent");
const { generateExcel } = require("./excelService");
const { pushTestCases } = require("./zephyrService");
const { moveToCompleted } = require("../utils/moveStory");
const { saveJson } = require("../utils/versionStore");
const { ask, printTestCasesSummary } = require("../utils/prompt");
const logger = require("../utils/logger");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/**
 * @param {object} opts
 * @param {string} opts.filePath   - Absolute or relative path to the story .md file
 * @param {string} opts.storyId    - Story identifier (e.g. "SCRUM-5")
 * @param {boolean} [opts.isJira]  - Whether the story originated from Jira (controls Zephyr → Jira linking)
 * @param {boolean} [opts.autoApprove] - Skip interactive approval prompt
 */
async function processStory({ filePath, storyId, isJira = false, autoApprove = false }) {
  const startTime = Date.now();

  logger.info(`========== Processing: ${storyId} ==========`);
  logger.info(`Reading story from: ${filePath}`);

  const story = readStory(filePath);

  const { errors, warnings, acCount } = lintStory(story, filePath);
  warnings.forEach((w) => logger.warn(w));
  if (errors.length > 0) {
    errors.forEach((e) => logger.error(e));
    throw new Error(`Story '${storyId}' failed validation — fix the errors above before proceeding.`);
  }
  logger.info(`Story linted OK — ${acCount} acceptance criteria found`);

  logger.info("Generating test cases via AI...");

  // const result = JSON.parse(fs.readFileSync(path.join(__dirname, "testcases.json"), "utf-8"));

  const result = await runAgent(story);

  printTestCasesSummary(result.test_cases);

  let approved = autoApprove;
  if (!autoApprove) {
    const answer = await ask("Approve and write to Excel? [Y/N]: ");
    approved = answer.toLowerCase() === "y";
  }
  if (!approved) {
    logger.info(`Skipped '${storyId}' — not written to Excel.`);
    return null;
  }

  const jsonPath = saveJson(storyId, result);
  logger.info(`JSON version saved to: ${jsonPath}`);

  const { written } = await generateExcel(result.test_cases, storyId);


  if (process.env.ZEPHYR_ENABLED !== "false") {
    try {
      logger.info(`Pushing ${result.test_cases.length} test case(s) to Zephyr Scale...`);
      const zResults = await pushTestCases(result.test_cases, storyId, { linkToJira: isJira });
      logger.info(`Zephyr: ${zResults.created.length} created, ${zResults.failed.length} failed`);
      zResults.created.forEach((c) => logger.info(`  ${c.tcId} → ${c.key}`));
      zResults.failed.forEach((f) => logger.warn(`  ${f.tcId} FAILED: ${f.error}`));
    } catch (err) {
      logger.warn(`Zephyr push skipped: ${err.message}`);
    }
  }

  moveToCompleted(filePath);
  logger.info(`Moved '${storyId}.md' to completed.`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  return { storyId, total: result.test_cases.length, written, elapsed };
}

module.exports = { processStory };
