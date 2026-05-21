const { updateExcelWithResults } = require("./services/testResultsService");

async function main() {
  const storyIds = process.argv.slice(2);

  if (storyIds.length === 0) {
    console.error("Usage: node update-results.js <story-id> [story-id2 ...]");
    console.error("Example: node update-results.js SCRUM-5");
    console.error("Example: node update-results.js US-01 SCRUM-5");
    process.exit(1);
  }

  for (const storyId of storyIds) {
    try {
      console.log(`\n========== Updating results: ${storyId} ==========`);
      await updateExcelWithResults(storyId);
    } catch (err) {
      console.error(`[FAILED] ${storyId}: ${err.message}`);
    }
  }
}

main();
