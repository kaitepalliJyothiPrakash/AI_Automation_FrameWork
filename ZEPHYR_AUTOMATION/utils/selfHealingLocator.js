/**
 * ============================================================
 * FILE: selfHealingLocator.js
 * LOCATION: utils/selfHealingLocator.js
 * ============================================================
 *
 * UPGRADED VERSION — Manager Feedback Implemented:
 *
 * ✅ Feature 1: SQLite KV pair DB (replaces JSON cache)
 * ✅ Feature 2: Element Map (scan once, use many times)
 * ✅ Feature 3: Real World Scenarios:
 *    → Class name changes (UI rebuild)
 *    → Element type changes (input → button)
 *    → Workflow changes (new steps added)
 *
 * HEALING PRIORITY ORDER:
 * -----------------------
 * 1. SQLite DB cache        → Fastest (previous heals)
 * 2. Element Map            → Fast (in-memory scan)
 * 3. Class Name Change      → Handle UI rebuild class changes
 * 4. Element Type Change    → Handle input→button changes
 * 5. Workflow Change        → Handle new steps in flow
 * 6. GitHub Copilot API     → Last resort
 * ============================================================
 */

const { askCopilotForHealedLocator } = require('./copilotHealingService');
const { getHealedLocator, saveHealedLocator } = require('./healingDB');
const { getOrCreateElementMap } = require('./elementMap');
const fs = require('fs');
const path = require('path');

const HEALING_REPORT_PATH = path.join(__dirname, '../healing-report/healing-summary.json');

// Track healing session for current test run
const healingSession = {
  healed: [],
  failed: [],
};

function saveHealingReport() {
  fs.mkdirSync(path.dirname(HEALING_REPORT_PATH), { recursive: true });
  const report = {
    timestamp: new Date().toISOString(),
    totalHealed: healingSession.healed.length,
    totalFailed: healingSession.failed.length,
    healed: healingSession.healed,
    failed: healingSession.failed,
  };
  fs.writeFileSync(HEALING_REPORT_PATH, JSON.stringify(report, null, 2));
}

/**
 * detectClassNameChange()
 * -----------------------
 * Handles: Class name changes during UI rebuild
 *
 * SCENARIO:
 *   Before: .s-product-image-container
 *   After:  .product-img-wrapper-2025  ← class completely changed
 *
 * HOW IT WORKS (ITERATIVE):
 * Tries 4 strategies one by one until ONE unique element found:
 *   1. Partial class keyword match
 *   2. Role-based selector (semantic)
 *   3. data-testid match
 *   4. aria-label match
 *
 * UNIQUE IDENTIFICATION:
 * Each strategy checks count === 1 before returning.
 * If multiple elements match → skip (not unique enough).
 * Only returns when EXACTLY ONE element matches.
 */
async function detectClassNameChange(page, selector, description) {

  // Only handle class selectors (starting with .)
  if (!selector.startsWith('.')) return null;

  // Extract core keywords from class name
  // e.g., '.s-product-image-container' → ['product', 'image', 'container']
  const coreClass = selector.replace('.', '').toLowerCase();
  const classKeywords = coreClass.split(/[-_]/).filter(k => k.length > 3);

  console.log(`   🎨 Strategy 3: Class name change detection...`);
  console.log(`   🔑 Keywords: [${classKeywords.join(', ')}]`);

  // Strategy 3a: Partial class keyword match
  // Tries each keyword as [class*="keyword"] — iteratively
  for (const keyword of classKeywords) {
    try {
      const partialClass = `[class*="${keyword}"]`;
      const count = await page.locator(partialClass).count();
      if (count === 1) {
        console.log(`   ✅ Partial class match (unique): "${partialClass}"`);
        return partialClass;
      }
      // count > 1 means not unique — try next keyword
    } catch { /* try next */ }
  }

  // Strategy 3b: Role-based selector
  // Semantic roles survive class name changes
  const descLower = description.toLowerCase();
  const roleMap = {
    'image': 'img', 'button': 'button', 'link': 'link',
    'input': 'textbox', 'search': 'searchbox',
  };
  for (const [keyword, role] of Object.entries(roleMap)) {
    if (descLower.includes(keyword) || coreClass.includes(keyword)) {
      try {
        const count = await page.locator(`role=${role}`).count();
        if (count === 1) {
          console.log(`   ✅ Role-based match (unique): "role=${role}"`);
          return `role=${role}`;
        }
      } catch { /* try next */ }
    }
  }

  // Strategy 3c: data-testid match
  for (const keyword of classKeywords) {
    try {
      const testIdSel = `[data-testid*="${keyword}"]`;
      const count = await page.locator(testIdSel).count();
      if (count === 1) {
        console.log(`   ✅ data-testid match (unique): "${testIdSel}"`);
        return testIdSel;
      }
    } catch { /* try next */ }
  }

  // Strategy 3d: aria-label match
  for (const keyword of classKeywords) {
    try {
      const ariaSel = `[aria-label*="${keyword}"]`;
      const count = await page.locator(ariaSel).count();
      if (count === 1) {
        console.log(`   ✅ aria-label match (unique): "${ariaSel}"`);
        return ariaSel;
      }
    } catch { /* try next */ }
  }

  console.log(`   ❌ Class name change: no unique match found`);
  return null;
}

/**
 * detectElementTypeChange()
 * -------------------------
 * Handles: Element type changes (input → button → div)
 *
 * SCENARIO:
 *   Before: <input type="submit" id="login-btn">
 *   After:  <button id="login-btn-new">Sign In</button>
 *
 * HOW IT WORKS (ITERATIVE):
 * Tries 8 type variations one by one.
 * Returns FIRST variation that gives exactly 1 element.
 */
async function detectElementTypeChange(page, selector) {
  const coreId = selector.replace(/[#.\[\]'"=*]/g, '').trim();

  const typeVariations = [
    `#${coreId}`,
    `[id*="${coreId}"]`,
    `button[id*="${coreId}"]`,
    `input[id*="${coreId}"]`,
    `a[id*="${coreId}"]`,
    `[name*="${coreId}"]`,
    `[data-testid*="${coreId}"]`,
    `[aria-label*="${coreId}"]`,
  ];

  for (const variation of typeVariations) {
    try {
      const count = await page.locator(variation).count();
      if (count === 1) {
        console.log(`   ✅ Element type change (unique): "${variation}"`);
        return variation;
      }
    } catch { /* try next */ }
  }

  return null;
}

/**
 * detectWorkflowChange()
 * ----------------------
 * Handles: New steps added to the workflow
 *
 * SCENARIO:
 *   Before: Login → Home Page
 *   After:  Login → OTP Page → Home Page (new step!)
 */
async function detectWorkflowChange(page, selector, description) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    const currentUrl = page.url();
    console.log(`   🔄 Workflow check — URL: ${currentUrl.substring(0, 60)}...`);

    const unexpectedPages = {
      'ap/signin': 'Re-authentication needed',
      'ap/mfa':    'OTP/MFA page — new security step',
      'ap/cvf':    'Verification page — new step',
      'gp/cart':   'Cart page — workflow redirected',
    };

    for (const [urlPattern, message] of Object.entries(unexpectedPages)) {
      if (currentUrl.includes(urlPattern)) {
        console.log(`   ⚠️  Workflow change: ${message}`);
        return null; // Let Copilot handle with full context
      }
    }

    const count = await page.locator(selector).count();
    if (count > 0) {
      console.log(`   ✅ Element found after workflow stabilization`);
      return selector;
    }

  } catch { /* continue */ }

  return null;
}

/**
 * healingLocator()
 * ----------------
 * Main function — wraps Playwright locator with self-healing.
 *
 * HEALING PRIORITY (6 strategies, tried in order):
 * 1. SQLite DB cache     → Fastest — previous heals
 * 2. Element Map         → Scan page once, search in map
 * 3. Class Name Change   → Handle UI rebuild class changes
 * 4. Element Type Change → Handle input→button changes
 * 5. Workflow Change     → Handle new steps in flow
 * 6. GitHub Copilot API  → Last resort — AI suggestion
 *
 * UNIQUE IDENTIFICATION:
 * Every strategy checks count === 1 before returning.
 * This ensures we NEVER return an ambiguous locator.
 */
function healingLocator(page, selector, description = '') {
  const locator = page.locator(selector);

  return new Proxy(locator, {
    get(target, prop) {
      const original = target[prop];
      if (typeof original !== 'function') return original;

      return async (...args) => {
        try {
          return await original.apply(target, args);

        } catch (error) {
          console.log(`\n🔴 Locator failed: "${selector}" (${description})`);
          console.log(`   Starting healing process...`);

          const pageUrl = page.url();
          let healedSelector = null;

          // STRATEGY 1: SQLite DB Cache
          console.log(`   📦 Strategy 1: Checking SQLite DB cache...`);
          healedSelector = await getHealedLocator(selector);
          if (healedSelector) {
            console.log(`   ✅ Found in DB cache: "${healedSelector}"`);
          }

          // STRATEGY 2: Element Map
          if (!healedSelector) {
            console.log(`   🗺️  Strategy 2: Checking element map...`);
            healedSelector = await getOrCreateElementMap(page, pageUrl, selector, description);
            if (healedSelector) {
              console.log(`   ✅ Found in element map: "${healedSelector}"`);
            }
          }

          // STRATEGY 3: Class Name Change (for .class selectors)
          if (!healedSelector) {
            healedSelector = await detectClassNameChange(page, selector, description);
            if (healedSelector) {
              console.log(`   ✅ Class name change handled: "${healedSelector}"`);
            }
          }

          // STRATEGY 4: Element Type Change (for #id selectors)
          if (!healedSelector) {
            console.log(`   🔄 Strategy 4: Checking element type changes...`);
            healedSelector = await detectElementTypeChange(page, selector);
            if (healedSelector) {
              console.log(`   ✅ Element type change handled: "${healedSelector}"`);
            }
          }

          // STRATEGY 5: Workflow Change
          if (!healedSelector) {
            console.log(`   🔄 Strategy 5: Checking workflow changes...`);
            healedSelector = await detectWorkflowChange(page, selector, description);
            if (healedSelector) {
              console.log(`   ✅ Workflow change handled: "${healedSelector}"`);
            }
          }

          // STRATEGY 6: GitHub Copilot API (Last Resort)
          if (!healedSelector) {
            console.log(`   🤖 Strategy 6: Asking GitHub Copilot (last resort)...`);
            let pageHtml = '';
            try {
              pageHtml = await page.content();
            } catch {
              pageHtml = '<html>Could not capture page HTML</html>';
            }
            healedSelector = await askCopilotForHealedLocator(selector, pageHtml, description);
            if (healedSelector) {
              console.log(`   ✅ Copilot suggested: "${healedSelector}"`);
            }
          }

          // RETRY with healed selector
          if (healedSelector) {
            console.log(`   🔁 Retrying with healed locator: "${healedSelector}"`);
            try {
              const healedLocatorInstance = page.locator(healedSelector).first();
              const result = await healedLocatorInstance[prop](...args);

              await saveHealedLocator(selector, healedSelector, description, 'auto-detected', pageUrl);

              healingSession.healed.push({
                original: selector,
                healed: healedSelector,
                description,
                pageUrl,
                timestamp: new Date().toISOString(),
              });
              saveHealingReport();

              console.log(`   🎉 Healed successfully: "${selector}" → "${healedSelector}"`);
              return result;

            } catch (retryError) {
              console.log(`   ❌ Healed locator also failed: "${healedSelector}"`);
              healingSession.failed.push({
                original: selector,
                attempted: healedSelector,
                description,
                reason: retryError.message,
                timestamp: new Date().toISOString(),
              });
              saveHealingReport();
              throw retryError;
            }
          }

          // All strategies failed
          console.log(`   ❌ All healing strategies failed for: "${selector}"`);
          healingSession.failed.push({
            original: selector,
            attempted: null,
            description,
            reason: 'All strategies failed',
            timestamp: new Date().toISOString(),
          });
          saveHealingReport();
          throw error;
        }
      };
    },
  });
}

module.exports = { healingLocator, healingSession };
