const fs = require("fs");
const { generateTestCases } = require("../services/llmService");
const { extractTypeScript } = require("../utils/extractCode");
const { MAX_RETRIES, RETRY_BASE_DELAY_MS } = require("../config");
const logger = require("../utils/logger");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseClassName(locatorsContent) {
  const match = locatorsContent.match(/^##\s+(\w+)/m);
  if (!match) logger.warn("Could not parse class name from locators — defaulting to 'PageObject'");
  return match ? match[1] : "PageObject";
}

async function generatePageObject(locatorsContent, testCaseJson) {
  let basePrompt;
  try {
    basePrompt = fs.readFileSync("./prompts/pageObjectPrompt.txt", "utf-8");
  } catch (err) {
    throw new Error(`Could not read pageObjectPrompt.txt: ${err.message}`);
  }

  const fullPrompt = `${basePrompt}\n${locatorsContent}\n\n=== TEST CASES JSON ===\n${JSON.stringify(testCaseJson, null, 2)}`;
  let rawOutput = await generateTestCases(fullPrompt);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const code = extractTypeScript(rawOutput);
    if (code.includes("import") && code.includes("extends BasePage")) {
      return { code, className: parseClassName(locatorsContent) };
    }

    if (attempt + 1 >= MAX_RETRIES) {
      throw new Error(`Failed to get valid Page Object TypeScript after ${MAX_RETRIES} attempts.`);
    }

    const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
    logger.warn(`Invalid page object output (attempt ${attempt + 1}/${MAX_RETRIES}) — retrying in ${delay}ms...`);
    await sleep(delay);
    rawOutput = await generateTestCases(`Return ONLY valid TypeScript Playwright page object code. No markdown, no explanation:\n${rawOutput}`);
  }
}

module.exports = { generatePageObject };
