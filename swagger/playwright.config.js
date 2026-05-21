import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./Automation-test-Cases",
  globalTeardown: "./global-teardown.js",
  timeout: 120000,
  workers: 3,                  // 3 threads parallel ga run avutayi
  fullyParallel: true,         // all tests parallel ga run avutayi
  use: {
    headless: false,
    baseURL: "https://opensource-demo.orangehrmlive.com",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "Chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
});
