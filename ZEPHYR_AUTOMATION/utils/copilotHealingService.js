/**
 * ============================================================
 * FILE: copilotHealingService.js
 * LOCATION: utils/copilotHealingService.js
 * ============================================================
 *
 * WHAT IS THIS FILE?
 * ------------------
 * This file is the BRIDGE between our framework and GitHub Copilot AI.
 * When a locator fails, selfHealingLocator.js calls this file.
 * This file communicates with the GitHub Copilot API and gets
 * the correct locator suggestion back.
 *
 * WHAT DOES IT DO?
 * ----------------
 * 1. Checks if the broken locator was already healed before (cache)
 *    → If yes, returns the cached result immediately (no API call)
 *    → If no, calls GitHub Copilot API
 *
 * 2. Builds a smart prompt with:
 *    → The broken locator
 *    → The element description
 *    → The actual page HTML
 *    Then sends it to GitHub Copilot
 *
 * 3. Handles token expiry automatically
 *    → Copilot tokens expire every 30 minutes
 *    → This file detects expiry and refreshes the token automatically
 *    → No manual action needed from the user
 *
 * 4. Saves healed locators to cache
 *    → So the same locator doesn't call the API again next time
 *
 * TOKENS USED:
 * ------------
 * GITHUB_OAUTH_TOKEN   → Long-lived master token (never expires)
 *                        Used to generate new Copilot session tokens
 * COPILOT_OAUTH_TOKEN  → Short-lived session token (expires in 30 min)
 *                        Used to actually call the Copilot API
 * ============================================================
 */

// Load environment variables from .env file
// This makes GITHUB_TOKEN, COPILOT_OAUTH_TOKEN etc. available
require('dotenv').config();

// Note: Disabling SSL verification is a security risk in general,
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// axios is used to make HTTP requests to GitHub Copilot API
const axios = require('axios');

// Node.js built-in modules for file system operations
const fs = require('fs');
const path = require('path');

// Path to the cache file where healed locators are stored
// Once a locator is healed, it's saved here so we don't call
// the Copilot API again for the same broken locator
const HEALED_LOCATORS_PATH = path.join(__dirname, '../healing-report/healed-locators.json');

// Path to the .env file — needed to update tokens when they refresh
const ENV_PATH = path.join(__dirname, '../.env');

/**
 * loadHealedCache()
 * -----------------
 * Reads the healed-locators.json file and returns its contents.
 *
 * This is checked BEFORE calling the Copilot API.
 * If the broken locator was already healed in a previous run,
 * we return the cached result immediately — no API call needed.
 *
 * Example cache content:
 * {
 *   "#WRONG_SEARCH_BAR_123": {
 *     "healed": "#twotabsearchtextbox",
 *     "timestamp": "2025-01-01T10:00:00.000Z"
 *   }
 * }
 *
 * @returns {Object} - The cache object, or empty {} if no cache exists
 */
function loadHealedCache() {
  // Check if the cache file exists
  if (fs.existsSync(HEALED_LOCATORS_PATH)) {
    // Read and parse the JSON file
    return JSON.parse(fs.readFileSync(HEALED_LOCATORS_PATH, 'utf-8'));
  }
  // Return empty object if cache file doesn't exist yet
  return {};
}

/**
 * saveHealedLocator()
 * -------------------
 * Saves a newly healed locator to the cache file.
 *
 * After GitHub Copilot suggests a correct locator,
 * we save it here so next time the same locator fails,
 * we can return the cached result without calling the API.
 *
 * @param {string} originalLocator - The broken locator (e.g., "#WRONG_ID")
 * @param {string} healedLocator   - The correct locator from Copilot (e.g., "#correct-id")
 */
function saveHealedLocator(originalLocator, healedLocator) {
  // Load existing cache
  const cache = loadHealedCache();

  // Add the new healed locator to the cache
  cache[originalLocator] = {
    healed: healedLocator,
    timestamp: new Date().toISOString(), // Record when it was healed
  };

  // Create the healing-report folder if it doesn't exist
  fs.mkdirSync(path.dirname(HEALED_LOCATORS_PATH), { recursive: true });

  // Save the updated cache back to the JSON file
  fs.writeFileSync(HEALED_LOCATORS_PATH, JSON.stringify(cache, null, 2));

  console.log(`✅ Healed locator saved: "${originalLocator}" → "${healedLocator}"`);
}

/**
 * updateEnvKey()
 * --------------
 * Updates a specific key in the .env file.
 *
 * This is used when the Copilot session token is refreshed.
 * The new token is saved back to .env so it persists
 * for the next test run.
 *
 * @param {string} key   - The .env key to update (e.g., "COPILOT_OAUTH_TOKEN")
 * @param {string} value - The new value to set
 */
function updateEnvKey(key, value) {
  // Read the current .env file content
  let envContent = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8') : '';

  if (envContent.includes(`${key}=`)) {
    // Key already exists — replace its value
    envContent = envContent.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
  } else {
    // Key doesn't exist — add it as a new line
    envContent += `\n${key}=${value}`;
  }

  // Save the updated content back to .env
  fs.writeFileSync(ENV_PATH, envContent.trim() + '\n');
}

/**
 * refreshCopilotToken()
 * ---------------------
 * Automatically refreshes the expired Copilot session token.
 *
 * WHY IS THIS NEEDED?
 * The COPILOT_OAUTH_TOKEN expires every 30 minutes.
 * When it expires, the Copilot API returns a 401 error.
 * Instead of asking the user to manually refresh,
 * this function does it automatically using the GITHUB_OAUTH_TOKEN
 * (which never expires).
 *
 * FLOW:
 * GITHUB_OAUTH_TOKEN → GitHub API → New COPILOT_OAUTH_TOKEN
 * New token saved to .env automatically
 *
 * @returns {string|null} - The new Copilot token, or null if refresh failed
 */
async function refreshCopilotToken() {
  // Get the long-lived OAuth token from environment
  const oauthToken = process.env.GITHUB_OAUTH_TOKEN;

  if (!oauthToken) {
    console.error('   → GITHUB_OAUTH_TOKEN not found. Run: node utils/setupCopilotAuth.js');
    return null;
  }

  try {
    console.log('   🔄 Refreshing Copilot session token...');

    // Call GitHub API to get a new Copilot session token
    // This endpoint exchanges the OAuth token for a short-lived Copilot token
    const response = await axios.get(
      'https://api.github.com/copilot_internal/v2/token',
      {
        headers: {
          Authorization: `token ${oauthToken}`,       // Use the long-lived token
          'Accept': 'application/json',
          'User-Agent': 'GitHubCopilotChat/0.20.3',   // Identify as Copilot client
          'Editor-Version': 'vscode/1.90.0',           // Pretend to be VS Code
          'Editor-Plugin-Version': 'copilot-chat/0.20.3',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    // Extract the new token from the response
    const newToken = response.data.token;

    // Save the new token to .env file so it persists
    updateEnvKey('COPILOT_OAUTH_TOKEN', newToken);

    // Also update the current process environment
    // so the new token is used immediately without restart
    process.env.COPILOT_OAUTH_TOKEN = newToken;

    console.log('   ✅ Copilot session token refreshed!');
    return newToken;

  } catch (error) {
    console.error(`   ❌ Token refresh failed: ${error.message}`);
    if (error.response?.status === 401) {
      // The OAuth token itself has expired — user needs to re-authenticate
      console.error('   → OAuth token expired. Run: node utils/setupCopilotAuth.js');
    }
    return null;
  }
}

/**
 * callCopilotAPI()
 * ----------------
 * Makes the actual HTTP request to the GitHub Copilot Chat API.
 *
 * This sends our prompt (broken locator + HTML + description)
 * to GitHub Copilot and returns the suggested correct locator.
 *
 * MODEL USED: gpt-4o (most powerful GitHub Copilot model)
 * TEMPERATURE: 0.1 (low = more deterministic, less random answers)
 * MAX_TOKENS: 100 (we only need a short locator string back)
 *
 * @param {string} token  - The valid Copilot session token
 * @param {string} prompt - The full prompt with broken locator + HTML
 * @returns {string|null} - The suggested locator from Copilot
 */
async function callCopilotAPI(token, prompt) {
  const response = await axios.post(
    // Official GitHub Copilot API endpoint for individual plan users
    'https://api.individual.githubcopilot.com/chat/completions',
    {
      model: 'gpt-4o',          // Use the most capable model
      messages: [
        {
          // System message — tells Copilot what role to play
          role: 'system',
          content: 'You are GitHub Copilot, an AI assistant for developers.'
        },
        {
          // User message — the actual prompt with broken locator + HTML
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,   // Low temperature = consistent, deterministic answers
      max_tokens: 100,    // We only need a short locator string (e.g., "#search-bar")
      stream: false,      // Get the full response at once, not streamed
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,              // Copilot session token
        'Content-Type': 'application/json',
        'Editor-Version': 'vscode/1.90.0',               // Required by Copilot API
        'Editor-Plugin-Version': 'copilot-chat/0.20.3',  // Required by Copilot API
        'User-Agent': 'GitHubCopilotChat/0.20.3',        // Required by Copilot API
        'Copilot-Integration-Id': 'vscode-chat',         // Required by Copilot API
      },
      timeout: 30000, // 30 second timeout for API response
    }
  );

  // Extract and return the locator string from Copilot's response
  // .trim() removes any extra whitespace from the response
  return response.data.choices?.[0]?.message?.content?.trim();
}

/**
 * askCopilotForHealedLocator()
 * ----------------------------
 * This is the MAIN FUNCTION called by selfHealingLocator.js
 * when a locator fails and needs to be healed.
 *
 * STEP BY STEP FLOW:
 * 1. Check cache → if already healed before, return cached result
 * 2. Build prompt with broken locator + page HTML + description
 * 3. Call Copilot API with current token
 * 4. If token expired (401) → auto refresh token → retry API call
 * 5. Save healed locator to cache
 * 6. Return the healed locator to selfHealingLocator.js
 *
 * @param {string} brokenLocator      - The locator that failed (e.g., "#WRONG_ID")
 * @param {string} pageHtml           - The full HTML of the current page
 * @param {string} elementDescription - What element we are looking for
 *                                      (e.g., "Search bar on Amazon home page")
 *
 * @returns {string|null} - The correct locator from Copilot, or null if failed
 */
async function askCopilotForHealedLocator(brokenLocator, pageHtml, elementDescription) {

  // ─── STEP 1: CHECK CACHE ───────────────────────────────────────────────────
  // Before calling the API, check if this locator was already healed before.
  // If yes, return the cached result immediately — no API call needed.
  // This saves API quota and makes healing much faster on repeated runs.
  const cache = loadHealedCache();
  if (cache[brokenLocator]) {
    console.log(`🔄 Using cached healed locator for: "${brokenLocator}"`);
    return cache[brokenLocator].healed;
  }

  // ─── STEP 2: CHECK TOKEN ───────────────────────────────────────────────────
  // Make sure we have a Copilot token before making the API call
  let copilotToken = process.env.COPILOT_OAUTH_TOKEN;
  if (!copilotToken) {
    console.error('   → COPILOT_OAUTH_TOKEN not set. Run: node utils/setupCopilotAuth.js');
    return null;
  }

  // ─── STEP 3: BUILD THE PROMPT ─────────────────────────────────────────────
  // This is the message we send to GitHub Copilot.
  // We give it 3 things:
  //   1. The broken locator — so Copilot knows what failed
  //   2. The element description — so Copilot knows WHAT to find
  //   3. The page HTML — so Copilot can analyze the actual page
  //
  // The RULES section is important:
  //   - Rule 1: Return only the locator string (no explanation)
  //   - Rule 2: Must match exactly one element (avoid strict mode errors)
  //   - Rule 3: Prefer ID selectors (most stable and reliable)
  const prompt = `You are a Playwright test automation expert. A locator has broken and needs to be healed.

Broken locator: "${brokenLocator}"
Element description: "${elementDescription}"

Relevant page HTML:
\`\`\`html
${pageHtml.substring(0, 3000)}
\`\`\`

RULES:
1. Return ONLY a single locator string — no explanation, no markdown
2. The locator MUST match EXACTLY ONE element on the page
3. Prefer ID-based selectors (#id) over text-based ones

Examples:
#nav-link-accountList
[id="nav-link-accountList-nav-line-1"]`;

  try {
    // ─── STEP 4: CALL COPILOT API (FIRST ATTEMPT) ─────────────────────────
    // Try calling the API with the current token
    const result = await callCopilotAPI(copilotToken, prompt);

    if (result) {
      // ✅ Copilot returned a locator — save it to cache and return
      saveHealedLocator(brokenLocator, result);
      return result;
    }

  } catch (error) {

    if (error.response?.status === 401) {
      // ─── TOKEN EXPIRED — AUTO REFRESH AND RETRY ───────────────────────
      // 401 means the Copilot session token has expired (happens every 30 min)
      // We automatically refresh it using the long-lived GITHUB_OAUTH_TOKEN
      console.log('   ⚠️  Session token expired. Auto-refreshing...');

      // Get a new Copilot token
      const newToken = await refreshCopilotToken();

      if (newToken) {
        try {
          // ─── STEP 5: RETRY WITH NEW TOKEN ─────────────────────────────
          const result = await callCopilotAPI(newToken, prompt);

          if (result) {
            // ✅ Success after token refresh — save and return
            saveHealedLocator(brokenLocator, result);
            return result;
          }
        } catch (retryError) {
          // Even after token refresh, the API call failed
          console.error(`❌ GitHub Copilot API error after refresh: ${retryError.message}`);
        }
      }

    } else if (error.code === 'ENOTFOUND') {
      // Network error — Copilot API is not reachable
      // This happens when Cognizant network blocks the API endpoint
      console.error('❌ Network blocked. Use personal mobile hotspot.');

    } else {
      // Some other error occurred
      console.error(`❌ GitHub Copilot API error: ${error.message}`);
    }
  }

  // If we reach here, healing failed — return null
  // selfHealingLocator.js will handle this and throw the original error
  return null;
}

// Export functions so they can be used by other files
module.exports = { askCopilotForHealedLocator, saveHealedLocator, loadHealedCache };
