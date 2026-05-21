const fs = require("fs");
const path = require("path");
const { fetchIssue } = require("./services/jiraService");
const { issueToMarkdown } = require("./utils/jiraToMarkdown");
const { processStory } = require("./services/storyProcessor");
const logger = require("./utils/logger");

const JIRA_STORIES_DIR = "./stories/jira_stories";

async function fetchAndSave(issueKey) {
  logger.info(`Fetching Jira issue: ${issueKey}...`);

  const issue = await fetchIssue(issueKey);
  const markdown = issueToMarkdown(issue);

  try {
    fs.mkdirSync(JIRA_STORIES_DIR, { recursive: true });
  } catch (err) {
    throw new Error(`Could not create stories directory: ${err.message}`);
  }

  const fileName = `${issueKey}.md`;
  const filePath = path.join(JIRA_STORIES_DIR, fileName);

  try {
    fs.writeFileSync(filePath, markdown, "utf-8");
  } catch (err) {
    throw new Error(`Could not write story file ${filePath}: ${err.message}`);
  }

  logger.info(`Saved   : ${filePath}`);
  logger.info(`Summary : ${issue.fields.summary}`);
  logger.info(`Status  : ${issue.fields.status?.name}`);

  return { filePath, fileName, issueKey };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage:");
    console.error("  node fetch-jira.js <ISSUE-KEY>          — fetch and save story only");
    console.error("  node fetch-jira.js --run <ISSUE-KEY>    — fetch, save, and process");
    console.error("Example: node fetch-jira.js SCRUM-5");
    console.error("Example: node fetch-jira.js --run SCRUM-5");
    process.exit(1);
  }

  const runFlagIndex = args.indexOf("--run");
  const autoRun = runFlagIndex !== -1;
  const issueKeys = autoRun ? args.filter((_, i) => i !== runFlagIndex) : args;

  const summaries = [];

  for (const key of issueKeys) {
    const issueKey = key.toUpperCase();
    try {
      const { filePath } = await fetchAndSave(issueKey);

      if (autoRun) {
        logger.info(`========== Processing: ${issueKey} ==========`);
        const summary = await processStory({ filePath, storyId: issueKey, isJira: true, autoApprove: false });
        if (summary) summaries.push(summary);
      } else {
        logger.info(`Next step: node index.js --jira ${issueKey}.md`);
      }
    } catch (err) {
      logger.error(`[FAILED] ${issueKey}: ${err.message}`);
    }
  }

  if (summaries.length > 0) {
    logger.info("========== Run Summary ==========");
    summaries.forEach((s) => logger.info(`  ${s.storyId}: ${s.written} test cases written (${s.elapsed}s)`));
    logger.info("=================================");
  }
}

main();
