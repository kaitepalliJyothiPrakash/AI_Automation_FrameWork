const fs = require("fs");
const { generateTestCases } = require("../services/llmService");
const { validateTestCases } = require("../services/validator");
const { MAX_RETRIES, RETRY_BASE_DELAY_MS } = require("../config");
const logger = require("../utils/logger");

function extractJson(text) {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1);

  return text.trim();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runAgent(story) {
  let basePrompt;
  try {
    basePrompt = fs.readFileSync("./prompts/basePrompt.txt", "utf-8");
  } catch (err) {
    throw new Error(`Could not read basePrompt.txt: ${err.message}`);
  }

  const fullPrompt = `${basePrompt}\n${story}`;
  let rawOutput = await generateTestCases(fullPrompt);
  let parsed;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      parsed = JSON.parse(extractJson(rawOutput));
      break;
    } catch (err) {
      if (attempt + 1 >= MAX_RETRIES) {
        throw new Error(`Failed to parse LLM output as JSON after ${MAX_RETRIES} attempts. Last error: ${err.message}`);
      }
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
      logger.warn(`JSON parse failed (attempt ${attempt + 1}/${MAX_RETRIES}) — retrying in ${delay}ms...`);
      await sleep(delay);
      const fixPrompt = `Return only valid JSON with no markdown fences or explanation. Fix and return:\n${rawOutput}`;
      rawOutput = await generateTestCases(fixPrompt);
    }
  }

  validateTestCases(parsed);
  return parsed;
}

module.exports = { runAgent };
