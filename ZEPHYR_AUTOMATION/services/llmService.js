require("dotenv").config();
const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");
const { MAX_CONTEXT_CHARS } = require("../config");
const logger = require("../utils/logger");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function collectMarkdownFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectMarkdownFiles(full));
    else if (entry.name.endsWith(".md")) results.push(full);
  }
  return results;
}

let context = "";
try {
  const files = collectMarkdownFiles("./docs");
  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    context += `\n  =========================\n  FILE: ${path.relative(".", file)}\n  =========================\n  ${content}`;
  }
  if (context.length > MAX_CONTEXT_CHARS) {
    logger.warn(`Doc context truncated from ${context.length} to ${MAX_CONTEXT_CHARS} chars to stay within token limits.`);
    context = context.slice(0, MAX_CONTEXT_CHARS);
  }
  logger.debug(`Loaded doc context: ${context.length} chars from ${collectMarkdownFiles("./docs").length} files`);
} catch (err) {
  logger.warn(`Could not load docs context: ${err.message}`);
}

async function generateTestCases(prompt) {
  logger.debug(`LLM call — model: ${process.env.LLM_MODEL || "claude-sonnet-4-6"}, prompt length: ${prompt.length} chars`);
  try {
    const response = await client.messages.create({
      model: process.env.LLM_MODEL || "claude-sonnet-4-6",
      max_tokens: 8096,
      temperature: 0.2,
      system: "Here are the markdown files:\n" + context,
      messages: [
        { role: "user", content: prompt },
      ],
    });

    if (!response.content || response.content.length === 0) {
      throw new Error("LLM returned an empty response.");
    }

    return response.content[0].text;
  } catch (err) {
    logger.error(`LLM API call failed: ${err.message}`);
    throw err;
  }
}

module.exports = { generateTestCases };
