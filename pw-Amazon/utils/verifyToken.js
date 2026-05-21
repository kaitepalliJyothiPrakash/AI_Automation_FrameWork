/**
 * ============================================================
 * FILE: verifyToken.js
 * LOCATION: utils/verifyToken.js
 * ============================================================
 *
 * WHAT IS THIS FILE?
 * ------------------
 * This is a simple VERIFICATION SCRIPT to check if your
 * GitHub token is valid and working correctly.
 *
 * HOW TO RUN:
 *   node utils/verifyToken.js
 *
 * WHEN TO USE THIS?
 * -----------------
 * Run this after:
 *   1. Setting up your GITHUB_TOKEN in the .env file
 *   2. After generating a new token from GitHub
 *   3. When you want to confirm your token hasn't expired
 *   4. When tests fail with authentication errors
 *
 * WHAT DOES IT CHECK?
 * -------------------
 * It calls the GitHub API (/user endpoint) with your token.
 * If the token is valid → GitHub returns your account details
 * If the token is invalid → GitHub returns a 401 error
 *
 * EXPECTED OUTPUT (when token is valid):
 * ✅ Token is valid! Logged in as: YourGitHubUsername
 *    Name: Your Name
 *    You are ready to use Copilot self-healing!
 *
 * EXPECTED OUTPUT (when token is invalid):
 * ❌ Token is INVALID or EXPIRED
 *    Go to https://github.com/settings/tokens and generate a new one
 * ============================================================
 */

// Load environment variables from .env file
// This makes GITHUB_TOKEN available as process.env.GITHUB_TOKEN
require('dotenv').config();

// axios — for making HTTP requests to GitHub API
const axios = require('axios');

/**
 * verifyToken()
 * -------------
 * Checks if the GITHUB_TOKEN in .env is valid.
 *
 * It calls the GitHub API to get the authenticated user's profile.
 * If successful, the token is valid and ready to use.
 * If it fails with 401, the token is invalid or expired.
 */
async function verifyToken() {

  // Read the GitHub token from the .env file
  const token = process.env.GITHUB_TOKEN;

  // Check if the token is set in .env
  // If it's still the placeholder value, remind the user to set it
  if (!token || token === '<your_github_token_here>') {
    console.log('❌ GITHUB_TOKEN is not set in your .env file');
    console.log('   Open .env and replace <your_github_token_here> with your actual token');
    return;
  }

  console.log('🔍 Verifying GitHub token...');

  try {
    // Call GitHub API to get the authenticated user's profile
    // This is a simple way to verify if the token is valid
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}` // Send token in Authorization header
      },
    });

    // ✅ Token is valid — show the user's GitHub account details
    console.log(`✅ Token is valid! Logged in as: ${response.data.login}`);
    console.log(`   Name: ${response.data.name}`);
    console.log(`   You are ready to use Copilot self-healing!`);

  } catch (error) {
    if (error.response?.status === 401) {
      // 401 = Unauthorized — token is invalid or expired
      console.log('❌ Token is INVALID or EXPIRED');
      console.log('   Go to https://github.com/settings/tokens and generate a new one');
    } else {
      // Some other error (network issue, etc.)
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

// Run the verification
verifyToken();
