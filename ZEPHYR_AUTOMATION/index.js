const { processStory } = require("./services/storyProcessor");
const { STORY_DIRS } = require("./config");
const logger = require("./utils/logger");

async function main() {
  const args = process.argv.slice(2);

  const jiraFlagIndex = args.indexOf("--jira");
  const isJira = jiraFlagIndex !== -1;
  const yesFlagIndex = args.indexOf("--yes");
  const autoApprove = yesFlagIndex !== -1;
  const fileNames = args.filter((_, i) => i !== jiraFlagIndex && i !== yesFlagIndex);

  if (fileNames.length === 0) {
    console.error("Usage:");
    console.error("  node index.js <story-file>              (reads from stories/in-progress/)");
    console.error("  node index.js --jira <story-file>       (reads from stories/jira_stories/)");
    console.error("Example: node index.js US-01.md");
    console.error("Example: node index.js --jira PROJ-123.md");
    process.exit(1);
  }

  const sourceDir = isJira ? STORY_DIRS.jira : STORY_DIRS.default;
  if (isJira) logger.info(`Source: ${STORY_DIRS.jira}`);

  const summaries = [];

  for (const fileName of fileNames) {
    const storyId = fileName.replace(".md", "");
    const filePath = `${sourceDir}/${fileName}`;
    try {
      const summary = await processStory({ filePath, storyId, isJira, autoApprove });
      if (summary) summaries.push(summary);
    } catch (err) {
      logger.error(`[FAILED] ${fileName}: ${err.message}`);
    }
  }

  if (summaries.length > 0) {
    logger.info("========== Run Summary ==========");
    summaries.forEach((s) => logger.info(`  ${s.storyId}: ${s.written} written (${s.elapsed}s)`));
    const total = summaries.reduce((acc, s) => acc + s.written, 0);
    logger.info(`  Total test cases written: ${total}`);
    logger.info("=================================");
  }
}

main();
