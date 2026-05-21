/**
 * locatorService.js
 * -----------------
 * Uses a real Playwright browser to navigate to the target URL
 * and extract actual locators from the live DOM.
 *
 * This replaces the cheerio static scraping approach which fails
 * on React/Angular SPAs because they render in the browser, not server-side.
 *
 * FLOW:
 * 1. Launch Playwright Chromium browser (headless)
 * 2. Navigate to the target URL
 * 3. Wait for the page to fully render (networkidle)
 * 4. Extract all interactive elements with their best selectors
 * 5. Return a structured locator map + formatted summary for Gemini prompt
 */

import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCATORS_DIR = path.join(__dirname, "../locators");
const LOCATORS_FILE = path.join(LOCATORS_DIR, "page-locators.md");

/**
 * extractLocatorsFromPage()
 * -------------------------
 * Opens a real browser, navigates to the URL, and extracts
 * all interactive element locators from the live rendered DOM.
 *
 * @param {string} targetUrl - The URL to navigate to
 * @returns {Object} - { locatorMap, pageSummary }
 *   locatorMap   → structured object with element name → best selector
 *   pageSummary  → formatted string ready to inject into Gemini prompt
 */
async function extractLocatorsFromPage(targetUrl) {
  let browser = null;

  try {
    console.log(`\n🌐 Launching Playwright browser to extract locators from: ${targetUrl}`);

    // Launch headless Chromium — no UI needed, just DOM extraction
    browser = await chromium.launch({ headless: true, channel: "chrome" });
    const page = await browser.newPage();

    // Navigate and wait for full render (React/Angular SPAs need this)
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });
    console.log(`✅ Page loaded: ${page.url()}`);

    // Extract all interactive elements from the live DOM
    const elements = await page.evaluate(() => {
      const results = [];
      const seen = new Set();

      // Target all interactive elements
      const selectors = [
        "input",
        "button",
        "a[href]",
        "select",
        "textarea",
        "[role='button']",
        "[role='textbox']",
        "[role='link']",
        "[data-testid]",
        "[aria-label]",
      ];

      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          const id          = el.id || "";
          const name        = el.getAttribute("name") || "";
          const type        = el.getAttribute("type") || el.tagName.toLowerCase();
          const placeholder = el.getAttribute("placeholder") || "";
          const ariaLabel   = el.getAttribute("aria-label") || "";
          const dataTestId  = el.getAttribute("data-testid") || "";
          const text        = (el.innerText || el.value || "").trim().substring(0, 80);
          const className   = typeof el.className === "string" ? el.className.trim() : "";

          // Skip hidden elements
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) return;

          // Unique key to avoid duplicates
          const key = `${id}-${name}-${type}-${text.substring(0, 20)}`;
          if (seen.has(key)) return;
          seen.add(key);

          // Build the BEST selector — priority: name > id > data-testid > aria-label > type
          let bestSelector = "";
          if (name)        bestSelector = `${el.tagName.toLowerCase()}[name="${name}"]`;
          else if (id)     bestSelector = `#${id}`;
          else if (dataTestId) bestSelector = `[data-testid="${dataTestId}"]`;
          else if (ariaLabel)  bestSelector = `[aria-label="${ariaLabel}"]`;
          else if (type && el.tagName.toLowerCase() !== type)
                           bestSelector = `${el.tagName.toLowerCase()}[type="${type}"]`;
          else             bestSelector = el.tagName.toLowerCase();

          // Build a human-readable element name
          let elementName = name || id || ariaLabel || placeholder || text || type;
          elementName = elementName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").substring(0, 40);

          results.push({
            elementName: elementName || `element_${results.length}`,
            tagName: el.tagName.toLowerCase(),
            type,
            name,
            id,
            placeholder,
            ariaLabel,
            dataTestId,
            text,
            className,
            bestSelector,
          });
        });
      });

      return results;
    });

    console.log(`✅ Extracted ${elements.length} interactive elements from live DOM`);

    // Build locator map — elementName → bestSelector
    const locatorMap = {};
    elements.forEach((el) => {
      if (el.bestSelector && el.elementName) {
        locatorMap[el.elementName] = el.bestSelector;
      }
    });

    // Build formatted summary string for Gemini prompt
    const pageSummary = elements.length > 0
      ? `Live page locators extracted from ${targetUrl}:\n` +
        elements.map((el) =>
          `- ${el.elementName} (${el.type}): "${el.bestSelector}"` +
          (el.placeholder ? ` placeholder="${el.placeholder}"` : "") +
          (el.ariaLabel   ? ` aria-label="${el.ariaLabel}"` : "") +
          (el.text        ? ` text="${el.text}"` : "")
        ).join("\n")
      : `Fields: Username (text), Password (password), Login (submit button)`;

    // Save locators to .md file — overwrite on every run to keep it updated
    saveLocatorsToMd(targetUrl, elements);

    return { locatorMap, pageSummary };

  } catch (error) {
    console.warn(`⚠️  Playwright locator extraction failed: ${error.message}`);
    console.warn(`   Falling back to default OrangeHRM locators`);

    // Fallback — known OrangeHRM locators
    return {
      locatorMap: {
        usernameInput:  `input[name="username"]`,
        passwordInput:  `input[name="password"]`,
        loginButton:    `button[type="submit"]`,
        errorMessage:   `.oxd-alert-content-text`,
        dashboardHeader: `.oxd-topbar-header-breadcrumb`,
      },
      pageSummary: `Fields: Username (text) selector="input[name='username']", Password (password) selector="input[name='password']", Login button selector="button[type='submit']"`,
    };

  } finally {
    if (browser) await browser.close();
    console.log(`🔒 Browser closed`);
  }
}

/**
 * saveLocatorsToMd()
 * ------------------
 * Saves extracted locators to locators/page-locators.md
 * File is overwritten on every run to stay up to date.
 *
 * @param {string} pageUrl  - The URL that was scanned
 * @param {Array}  elements - Extracted elements array
 */
function saveLocatorsToMd(pageUrl, elements) {
  fs.mkdirSync(LOCATORS_DIR, { recursive: true });

  const timestamp = new Date().toISOString();

  const lines = [
    `# Page Locators`,
    ``,
    `## LoginPage`,
    `- url: ${pageUrl}`,
    `- _extracted: ${timestamp}`,
    ``,
    ...elements
      .filter((el) => el.bestSelector && el.elementName)
      .map((el) => {
        let line = `- ${el.elementName}: ${el.bestSelector}`;
        if (el.placeholder) line += `  <!-- placeholder="${el.placeholder}" -->`;
        if (el.text)        line += `  <!-- text="${el.text}" -->`;
        return line;
      }),
  ];

  fs.writeFileSync(LOCATORS_FILE, lines.join("\n"), "utf8");
  console.log(`📄 Locators saved to: ${LOCATORS_FILE}`);
}

export { extractLocatorsFromPage };
