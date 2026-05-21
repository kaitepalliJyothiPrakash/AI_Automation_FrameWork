"use strict";

module.exports = {
  // LLM retry behaviour
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES || "3", 10),
  RETRY_BASE_DELAY_MS: parseInt(process.env.RETRY_BASE_DELAY_MS || "1000", 10),

  // Max characters of doc context sent to LLM (~4 chars per token, 60k token safety ceiling)
  MAX_CONTEXT_CHARS: parseInt(process.env.MAX_CONTEXT_CHARS || "240000", 10),

  // Valid test case field values
  VALID_PRIORITIES: ["High", "Medium", "Low"],
  VALID_TYPES: ["Positive", "Negative", "Edge"],

  // Story source directories
  STORY_DIRS: {
    default: "./stories/in-progress",
    jira: "./stories/jira_stories",
  },
};
