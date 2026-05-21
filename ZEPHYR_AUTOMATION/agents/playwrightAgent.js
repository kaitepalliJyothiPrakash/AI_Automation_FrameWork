const fs = require("fs");
const { generateTestCases } = require("../services/llmService");
const { extractTypeScript } = require("../utils/extractCode");
const { MAX_RETRIES, RETRY_BASE_DELAY_MS } = require("../config");
const logger = require("../utils/logger");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generatePlaywrightSpec(testCaseJson, pageObjectCode, className) {
  let basePrompt;
  try {
    basePrompt = fs.readFileSync("./prompts/playwrightPrompt.txt", "utf-8");
  } catch (err) {
    throw new Error(`Could not read playwrightPrompt.txt: ${err.message}`);
  }

  const fullPrompt =
    `${basePrompt}\n${pageObjectCode}\n\n=== TEST CASES JSON ===\n${JSON.stringify(testCaseJson, null, 2)}\n\n` +
    `Import the page object as: import { ${className} } from "../pages/${className}";`;

  let rawOutput = await generateTestCases(fullPrompt);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const code = extractTypeScript(rawOutput);
    if (code.includes("import") && code.includes("test.describe")) {
      return code;
    }

    if (attempt + 1 >= MAX_RETRIES) {
      throw new Error(`Failed to get valid Playwright TypeScript after ${MAX_RETRIES} attempts.`);
    }

    const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
    logger.warn(`Invalid spec output (attempt ${attempt + 1}/${MAX_RETRIES}) — retrying in ${delay}ms...`);
    await sleep(delay);
    rawOutput = await generateTestCases(`Return ONLY valid Playwright TypeScript spec code. No markdown, no explanation:\n${rawOutput}`);
  }
}

module.exports = { generatePlaywrightSpec };
