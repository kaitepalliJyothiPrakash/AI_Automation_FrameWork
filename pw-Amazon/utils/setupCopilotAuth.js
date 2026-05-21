/**
 * ============================================================
 * FILE: setupCopilotAuth.js
 * LOCATION: utils/setupCopilotAuth.js
 * ============================================================
 *
 * WHAT IS THIS FILE?
 * ------------------
 * This is a ONE-TIME SETUP script for GitHub Copilot authentication.
 * You only need to run this ONCE before running your tests.
 *
 * HOW TO RUN:
 *   node utils/setupCopilotAuth.js
 *
 * WHAT DOES IT DO?
 * ----------------
 * It uses "GitHub OAuth Device Flow" to authenticate your GitHub account.
 * After running this script:
 *   1. It gives you a URL and a code
 *   2. You open the URL in your browser
 *   3. You enter the code
 *   4. You click Authorize
 *   5. Two tokens are automatically saved to your .env file:
 *      - GITHUB_OAUTH_TOKEN  → Long-lived token (never expires)
 *      - COPILOT_OAUTH_TOKEN → Short-lived token (expires in 30 min)
 *
 * WHAT IS OAUTH DEVICE FLOW?
 * ---------------------------
 * It is a secure way to authenticate without sharing your password.
 * GitHub gives a temporary code → you authorize it in browser →
 * GitHub gives back an access token.
 * This is the same method used by GitHub CLI and VS Code.
 *
 * WHEN TO RUN AGAIN?
 * ------------------
 * - When GITHUB_OAUTH_TOKEN expires (rare — usually lasts months)
 * - When you see "OAuth token expired" error in tests
 * - The COPILOT_OAUTH_TOKEN is refreshed automatically — no need to re-run
 * ============================================================
 */

// Disable SSL certificate verification
// Required for Cognizant corporate network which uses its own SSL certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// axios — for making HTTP requests to GitHub API
const axios = require('axios');

// fs and path — for reading and writing the .env file
const fs = require('fs');
const path = require('path');

// readline — not actively used but kept for potential future input prompts
const readline = require('readline');

/**
 * CLIENT_ID — GitHub OAuth App Client ID
 * ----------------------------------------
 * This is the official Client ID of the GitHub Copilot VS Code extension.
 * We use this to authenticate as a Copilot client.
 * This is a public value — it is safe to have in code.
 * (It is the same ID used by VS Code's GitHub Copilot extension)
 */
const CLIENT_ID = 'Iv1.b507a08c87ecfe98';

// Path to the .env file where tokens will be saved
const ENV_PATH = path.join(__dirname, '../.env');

/**
 * setup()
 * -------
 * Main function that runs the OAuth Device Flow authentication.
 *
 * COMPLETE FLOW:
 * Step 1 → Request a device code from GitHub
 * Step 2 → Show the user the URL and code to enter
 * Step 3 → Poll GitHub every 5 seconds waiting for user to authorize
 * Step 4 → Once authorized, exchange for Copilot session token
 * Step 5 → Save both tokens to .env file
 */
async function setup() {
  console.log('\n🤖 GitHub Copilot OAuth Setup\n');

  try {

    // ─── STEP 1: REQUEST DEVICE CODE ──────────────────────────────────────
    // Ask GitHub to give us a device code and user code.
    // The device code is used internally.
    // The user code is what the user types in the browser.
    console.log('Step 1: Requesting device code from GitHub...');

    const deviceResponse = await axios.post(
      'https://github.com/login/device/code',
      {
        client_id: CLIENT_ID,  // Identify as GitHub Copilot client
        scope: 'read:user',    // We only need basic user read access
      },
      {
        headers: { Accept: 'application/json' },
        timeout: 10000, // 10 second timeout
      }
    );

    // Extract the codes and timing info from GitHub's response
    const {
      device_code,       // Internal code used to poll for the token
      user_code,         // The code the user types in the browser (e.g., "CEFB-C85B")
      verification_uri,  // The URL to open (https://github.com/login/device)
      interval,          // How many seconds to wait between polling attempts
      expires_in         // How many seconds before the code expires (usually 900 = 15 min)
    } = deviceResponse.data;

    // ─── STEP 2: SHOW USER THE URL AND CODE ───────────────────────────────
    // Display clear instructions for the user to follow
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Step 2: Open this URL in your browser:`);
    console.log(`\n   👉 ${verification_uri}\n`);  // https://github.com/login/device
    console.log(`Step 3: Enter this code when prompted:`);
    console.log(`\n   🔑 ${user_code}\n`);          // e.g., CEFB-C85B
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // ─── STEP 3: POLL FOR TOKEN ───────────────────────────────────────────
    // Keep checking GitHub every few seconds to see if the user has authorized.
    // GitHub will return the access token once the user clicks "Authorize".
    console.log('Waiting for you to authorize in browser...');

    // Convert interval from seconds to milliseconds (default: 5 seconds)
    const pollInterval = (interval || 5) * 1000;

    // Calculate when the code expires
    const expiry = Date.now() + (expires_in || 900) * 1000;

    // Keep polling until the code expires
    while (Date.now() < expiry) {

      // Wait for the poll interval before checking again
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      try {
        // Ask GitHub if the user has authorized yet
        const tokenResponse = await axios.post(
          'https://github.com/login/oauth/access_token',
          {
            client_id: CLIENT_ID,
            device_code,  // The internal code from Step 1
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          },
          {
            headers: { Accept: 'application/json' },
            timeout: 10000,
          }
        );

        const { access_token, error } = tokenResponse.data;

        // User hasn't authorized yet — keep waiting
        if (error === 'authorization_pending') {
          process.stdout.write('.'); // Show a dot to indicate we're still waiting
          continue;
        }

        // GitHub is asking us to slow down our polling
        if (error === 'slow_down') {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait extra 5 seconds
          continue;
        }

        // The code has expired — user took too long
        if (error === 'expired_token') {
          console.log('\n❌ Code expired. Run this script again.');
          process.exit(1);
        }

        // ✅ User authorized! We have the access token
        if (access_token) {
          console.log('\n\n✅ Authorization successful!\n');

          // ─── STEP 4: GET COPILOT SESSION TOKEN ──────────────────────────
          // The access_token we got is a GitHub OAuth token.
          // We need to exchange it for a Copilot-specific session token
          // that can be used to call the Copilot Chat API.
          console.log('Getting GitHub Copilot session token...');

          const copilotTokenResponse = await axios.get(
            'https://api.github.com/copilot_internal/v2/token',
            {
              headers: {
                Authorization: `token ${access_token}`,         // Use the OAuth token
                'Accept': 'application/json',
                'User-Agent': 'GitHubCopilotChat/0.20.3',       // Identify as Copilot
                'Editor-Version': 'vscode/1.90.0',               // Pretend to be VS Code
                'Editor-Plugin-Version': 'copilot-chat/0.20.3',
              },
              timeout: 10000,
            }
          );

          // Extract the Copilot session token
          const copilotToken = copilotTokenResponse.data.token;
          console.log('✅ Copilot session token received!\n');

          // ─── STEP 5: SAVE BOTH TOKENS TO .ENV ───────────────────────────
          // Read the current .env file content
          let envContent = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8') : '';

          // Save or update GITHUB_OAUTH_TOKEN (long-lived — never expires)
          // This is used to refresh the Copilot token when it expires
          if (envContent.includes('GITHUB_OAUTH_TOKEN=')) {
            envContent = envContent.replace(/GITHUB_OAUTH_TOKEN=.*/g, `GITHUB_OAUTH_TOKEN=${access_token}`);
          } else {
            envContent += `\nGITHUB_OAUTH_TOKEN=${access_token}`;
          }

          // Save or update COPILOT_OAUTH_TOKEN (short-lived — expires in 30 min)
          // This is used to call the GitHub Copilot Chat API
          if (envContent.includes('COPILOT_OAUTH_TOKEN=')) {
            envContent = envContent.replace(/COPILOT_OAUTH_TOKEN=.*/g, `COPILOT_OAUTH_TOKEN=${copilotToken}`);
          } else {
            envContent += `\nCOPILOT_OAUTH_TOKEN=${copilotToken}`;
          }

          // Write the updated content back to .env
          fs.writeFileSync(ENV_PATH, envContent.trim() + '\n');

          // Show success message with next steps
          console.log('✅ Tokens saved to .env file!\n');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🎉 Setup complete! Now run your tests:');
          console.log('   npx playwright test tests/nameChange.spec.js --headed');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

          // Exit the script successfully
          process.exit(0);
        }

      } catch (pollError) {
        // Ignore 400 errors during polling (they are expected while waiting)
        // Only log unexpected errors
        if (pollError.response?.status !== 400) {
          console.error('\n❌ Poll error:', pollError.message);
        }
      }
    }

    // If we exit the while loop, the code has expired
    console.log('\n❌ Authorization timed out. Run this script again.');

  } catch (error) {
    // Handle setup errors
    console.error('❌ Setup failed:', error.message);

    if (error.code === 'ENOTFOUND') {
      // Network error — GitHub API is not reachable
      console.error('   → Network blocked. Use personal mobile hotspot and try again.');
    }
  }
}

// Run the setup function
setup();
