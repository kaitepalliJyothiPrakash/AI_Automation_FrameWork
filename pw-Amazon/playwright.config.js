/**
 * ============================================================
 * FILE: playwright.config.js
 * LOCATION: playwright.config.js (project root)
 * ============================================================
 *
 * WHAT IS THIS FILE?
 * ------------------
 * This is the main configuration file for Playwright.
 * It controls how tests run — timeouts, browsers, reporters, etc.
 *
 * EVERY Playwright project must have this file.
 * Playwright reads this file automatically when you run tests.
 *
 * KEY SETTINGS IN THIS FILE:
 * ---------------------------
 * - testDir     → Where to find test files
 * - timeout     → How long a single test can run
 * - headless    → Whether to show the browser window or not
 * - reporter    → How to display test results
 * - projects    → Which browsers to run tests on
 * ============================================================
 */

// @ts-check — enables TypeScript type checking in VS Code
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({

  // ─── TEST DIRECTORY ─────────────────────────────────────────────────────
  // Playwright will look for test files in this folder
  // All files ending in .spec.js inside ./tests/ will be run
  testDir: './tests',

  // ─── TEST TIMEOUT ───────────────────────────────────────────────────────
  // Maximum time a single test can take before it is marked as failed
  // Set to 100 seconds because Amazon pages can be slow to load
  // and self-healing adds extra time (Copilot API calls take ~5-10 seconds)
  timeout: 100 * 1000, // 100 seconds

  // ─── ASSERTION TIMEOUT ──────────────────────────────────────────────────
  // Maximum time for expect() assertions to pass
  // For example: expect(element).toBeVisible() will wait up to 5 seconds
  expect: {
    timeout: 5000, // 5 seconds
  },

  // ─── PARALLEL EXECUTION ─────────────────────────────────────────────────
  // Run test files in parallel (at the same time) to save time
  // Each test file runs in its own browser instance
  fullyParallel: true,

  // ─── CI/CD SETTINGS ─────────────────────────────────────────────────────
  // Prevent accidental test.only() from blocking the CI pipeline
  // If someone forgets to remove test.only(), the build will fail
  forbidOnly: !!process.env.CI,

  // Retry failed tests on CI (GitHub Actions, Jenkins, etc.)
  // On local machine: no retries (0)
  // On CI server: retry 2 times before marking as failed
  retries: process.env.CI ? 2 : 0,

  // Number of parallel workers (browser instances)
  // On CI: use 1 worker (sequential) to avoid resource issues
  // On local: use default (based on CPU cores)
  workers: process.env.CI ? 1 : undefined,

  // ─── REPORTER ───────────────────────────────────────────────────────────
  // 'html' generates a beautiful HTML report after tests run
  // Open it with: npx playwright show-report
  // The report shows pass/fail status, screenshots, and error details
  reporter: 'html',

  // ─── SHARED SETTINGS ────────────────────────────────────────────────────
  // These settings apply to ALL tests in ALL projects
  use: {

    // Show the browser window during test execution
    // Set to true so we can watch the test run live
    // Set to false for faster execution (no browser window)
    headless: false,

    // Maximum time for individual actions (click, fill, etc.)
    // If a click() takes more than 15 seconds, it fails
    // This is where self-healing kicks in — if the locator is wrong,
    // the action times out and healing is triggered
    actionTimeout: 15 * 1000, // 15 seconds

    // Maximum time for page navigation (page.goto, redirects)
    // Amazon pages sometimes take time to load
    navigationTimeout: 30 * 1000, // 30 seconds

    // Capture a trace (detailed recording) when a test fails on first retry
    // Traces can be viewed with: npx playwright show-trace trace.zip
    // They show every action, screenshot, and network request
    trace: 'on-first-retry',
  },

  // ─── BROWSER PROJECTS ───────────────────────────────────────────────────
  // Define which browsers to run tests on
  // Currently only Chromium (Chrome) is configured
  // You can add Firefox and Safari by uncommenting the other projects
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }, // Run as Desktop Chrome browser
    },

    // Uncomment below to also run on Firefox and Safari:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
