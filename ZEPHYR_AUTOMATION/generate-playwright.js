const fs = require("fs");
const path = require("path");
const { generatePageObject } = require("./agents/pageObjectAgent");
const { generatePlaywrightSpec } = require("./agents/playwrightAgent");
const { writePageObject, writeSpecFile } = require("./services/playwrightService");

function findLatestJson(storyId) {
  const dir = "./output/json";
  if (!fs.existsSync(dir)) {
    throw new Error(`No JSON output found. Run 'node index.js ${storyId}.md' first.`);
  }

  const matches = fs.readdirSync(dir)
    .filter((f) => f.startsWith(storyId) && f.endsWith(".json"))
    .sort()
    .reverse();

  if (matches.length === 0) {
    throw new Error(`No JSON found for '${storyId}' in ${dir}. Run 'node index.js ${storyId}.md' first.`);
  }

  return path.join(dir, matches[0]);
}

function findLocatorsFile(storyId) {
  const filePath = `./locators/${storyId}-locators.md`;
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Locators file not found: ${filePath}\nCreate it using the format in locators/US-01-locators.md`
    );
  }
  return filePath;
}

async function processStory(storyId) {
  console.log(`\n========== Generating Playwright spec: ${storyId} ==========`);

  // Load inputs
  const jsonPath = findLatestJson(storyId);
  const locatorsPath = findLocatorsFile(storyId);

  console.log(`Test cases : ${jsonPath}`);
  console.log(`Locators   : ${locatorsPath}`);

  const testCaseJson = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const locatorsContent = fs.readFileSync(locatorsPath, "utf-8");

  console.log(`Loaded ${testCaseJson.test_cases.length} test cases — feature: ${testCaseJson.feature}`);

  // Step 1 — Generate page object from locators + test cases
  console.log("\n[1/2] Generating Page Object via AI...");
  const { code: pageObjectCode, className } = await generatePageObject(locatorsContent, testCaseJson);
  const pageObjectPath = writePageObject(className, pageObjectCode);
  console.log(`Page object written: ${pageObjectPath}`);

  // Step 2 — Generate spec using the page object the AI just created
  console.log("\n[2/2] Generating Playwright spec via AI...");
  const tsCode = await generatePlaywrightSpec(testCaseJson, pageObjectCode, className);
  const specPath = writeSpecFile(storyId, tsCode);
  console.log(`Spec file written : ${specPath}`);

  console.log(`\nRun tests: npx playwright test tests/${storyId}.spec.ts --project=edge`);
}

async function main() {
  const storyIds = process.argv.slice(2);
  if (storyIds.length === 0) {
    console.error("Usage: node generate-playwright.js <story-id> [story-id2 ...]");
    console.error("Example: node generate-playwright.js US-01");
    process.exit(1);
  }

  for (const storyId of storyIds) {
    try {
      await processStory(storyId);
    } catch (error) {
      console.error(`\n[FAILED] ${storyId}: ${error.message}`);
    }
  }
}

main();
