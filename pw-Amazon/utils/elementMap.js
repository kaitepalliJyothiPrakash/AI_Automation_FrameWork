/**
 * ============================================================
 * FILE: elementMap.js
 * LOCATION: utils/elementMap.js
 * ============================================================
 *
 * WHAT IS THIS FILE?
 * ------------------
 * Implements "Grab page source ONCE → Build indexed map →
 * Search only the map for all subsequent failures"
 *
 * COMPUTATIONAL OPTIMIZATION:
 * ---------------------------
 * OLD WAY (not optimal):
 *   Locator 1 fails → grab full HTML → send to Copilot
 *   Locator 2 fails → grab full HTML → send to Copilot
 *   Locator 3 fails → grab full HTML → send to Copilot
 *   = N page grabs + N API calls = SLOW + EXPENSIVE
 *
 * NEW WAY (optimal):
 *   Locator 1 fails → grab page ONCE → build indexed map
 *   Locator 2 fails → search map only → no page grab
 *   Locator 3 fails → search map only → no page grab
 *   = 1 page grab + 0 API calls (if found in map) = FAST ⚡
 *
 * HOW THE MAP IS INDEXED:
 * -----------------------
 * After scanning the page ONCE, we build 5 indexes:
 *
 *   idIndex       → { 'login-btn': elementObject }
 *   classIndex    → { 'product': [el1, el2] }
 *   textIndex     → { 'sign in': elementObject }
 *   ariaIndex     → { 'search': elementObject }
 *   testIdIndex   → { 'search-bar': elementObject }
 *
 * When a locator fails, we search ONLY these indexes
 * instead of re-scanning the page HTML.
 * ============================================================
 */

const { saveElementMap, findElementInMap } = require('./healingDB');

/**
 * PageLocatorMap — The pre-processed indexed map
 *
 * Structure per page URL:
 * {
 *   elements: [],          // raw elements array
 *   idIndex: Map(),        // id → element
 *   classIndex: Map(),     // keyword → [elements]
 *   textIndex: Map(),      // text → element
 *   ariaIndex: Map(),      // aria-label → element
 *   testIdIndex: Map(),    // data-testid → element
 *   scannedAt: timestamp
 * }
 */
const pageLocatorMaps = new Map();

/**
 * buildIndexes()
 * --------------
 * Pre-processes raw elements into searchable indexes.
 * Called ONCE after page scan.
 * All subsequent searches use these indexes — no re-scanning.
 *
 * @param {Array} elements - Raw elements from page scan
 * @returns {Object} - Pre-built indexes for fast lookup
 */
function buildIndexes(elements) {
  const idIndex     = new Map(); // exact id → element
  const classIndex  = new Map(); // class keyword → [elements]
  const textIndex   = new Map(); // visible text → element
  const ariaIndex   = new Map(); // aria-label → element
  const testIdIndex = new Map(); // data-testid → element
  const nameIndex   = new Map(); // name attr → element

  for (const el of elements) {

    // Index by ID (exact match — fastest lookup)
    if (el.id) {
      idIndex.set(el.id.toLowerCase(), el);

      // Also index by partial ID parts
      // e.g., 'nav-link-accountList-nav-line-1' →
      //       index 'nav', 'link', 'accountlist', 'line'
      el.id.toLowerCase().split(/[-_]/).forEach(part => {
        if (part.length > 3) {
          if (!idIndex.has(part)) idIndex.set(part, el);
        }
      });
    }

    // Index by class keywords
    // e.g., 's-product-image-container' →
    //       index 'product', 'image', 'container'
    if (el.className) {
      el.className.toLowerCase().split(/\s+/).forEach(cls => {
        cls.split(/[-_]/).forEach(keyword => {
          if (keyword.length > 3) {
            if (!classIndex.has(keyword)) classIndex.set(keyword, []);
            classIndex.get(keyword).push(el);
          }
        });
      });
    }

    // Index by visible text (lowercase, trimmed)
    if (el.text && el.text.length > 0 && el.text.length < 100) {
      textIndex.set(el.text.toLowerCase().trim(), el);
    }

    // Index by aria-label
    if (el.ariaLabel) {
      ariaIndex.set(el.ariaLabel.toLowerCase(), el);
      // Also index individual words
      el.ariaLabel.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 3) ariaIndex.set(word, el);
      });
    }

    // Index by data-testid
    if (el.dataTestId) {
      testIdIndex.set(el.dataTestId.toLowerCase(), el);
    }

    // Index by name attribute
    if (el.name) {
      nameIndex.set(el.name.toLowerCase(), el);
    }
  }

  return { idIndex, classIndex, textIndex, ariaIndex, testIdIndex, nameIndex };
}

/**
 * scanPageOnce()
 * --------------
 * Scans the page ONCE and builds all indexes.
 * Subsequent calls for same URL return cached map instantly.
 *
 * @param {Page}   page    - Playwright page
 * @param {string} pageUrl - Current page URL
 * @returns {Object} - The indexed locator map
 */
async function scanPageOnce(page, pageUrl) {

  // Return cached map if already scanned this page
  if (pageLocatorMaps.has(pageUrl)) {
    console.log(`   ⚡ Using cached locator map (${pageLocatorMaps.get(pageUrl).elements.length} elements)`);
    return pageLocatorMaps.get(pageUrl);
  }

  console.log(`   🔍 Scanning page ONCE and building indexed locator map...`);

  try {
    // Grab page source ONCE — extract all elements
    const elements = await page.evaluate(() => {
      const results = [];
      const seen = new Set();

      const selectors = [
        'input', 'button', 'a', 'select', 'textarea',
        '[id]', '[name]', '[data-testid]', '[aria-label]',
        'form', 'label', 'span[id]', 'div[id]', 'li[id]'
      ];

      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          const id          = el.id || '';
          const name        = el.getAttribute('name') || '';
          const type        = el.tagName.toLowerCase();
          const text        = (el.innerText || el.value || el.placeholder || '').trim().substring(0, 100);
          const ariaLabel   = el.getAttribute('aria-label') || '';
          const dataTestId  = el.getAttribute('data-testid') || '';
          const className   = (typeof el.className === 'string' ? el.className : '') || '';

          // Unique key to avoid duplicates
          const key = `${id}-${name}-${type}-${text.substring(0, 20)}`;
          if (seen.has(key)) return;
          seen.add(key);

          // Build best CSS selector for this element
          let selector = type;
          if (id)          selector = `#${id}`;
          else if (dataTestId) selector = `[data-testid="${dataTestId}"]`;
          else if (ariaLabel)  selector = `[aria-label="${ariaLabel}"]`;
          else if (name)       selector = `[name="${name}"]`;

          results.push({ id, name, type, text, ariaLabel, dataTestId, className, selector });
        });
      });

      return results;
    });

    // Build pre-processed indexes from elements
    const indexes = buildIndexes(elements);

    // Store complete map in memory
    const locatorMap = {
      elements,
      ...indexes,
      scannedAt: new Date().toISOString(),
      pageUrl,
    };

    pageLocatorMaps.set(pageUrl, locatorMap);

    // Also persist to SQLite DB for cross-run usage
    await saveElementMap(pageUrl, elements);

    console.log(`   ✅ Locator map built: ${elements.length} elements, ${indexes.idIndex.size} IDs indexed`);
    return locatorMap;

  } catch (error) {
    console.error(`   ❌ Page scan failed: ${error.message}`);
    return null;
  }
}

/**
 * searchLocatorMap()
 * ------------------
 * Searches ONLY the pre-built indexes — no page re-scan.
 * This is the fast path for all locator failures after first scan.
 *
 * SEARCH ORDER (fastest to slowest):
 * 1. ID index exact match      → O(1) hash lookup
 * 2. ID index partial match    → O(1) hash lookup
 * 3. Class keyword index       → O(1) hash lookup
 * 4. Text index                → O(1) hash lookup
 * 5. Aria-label index          → O(1) hash lookup
 * 6. data-testid index         → O(1) hash lookup
 * 7. Scored full scan          → O(n) but n is small
 *
 * All lookups are O(1) hash map operations — very fast!
 *
 * @param {Object} locatorMap    - Pre-built indexed map
 * @param {string} brokenLocator - The broken locator
 * @param {string} description   - Element description
 * @returns {string|null}        - Best matching selector
 */
function searchLocatorMap(locatorMap, brokenLocator, description) {

  if (!locatorMap) return null;

  const { idIndex, classIndex, textIndex, ariaIndex, testIdIndex, elements } = locatorMap;

  // Extract search keywords from broken locator and description
  const locatorCore = brokenLocator.replace(/[#.\[\]'"=*]/g, ' ').toLowerCase().trim();
  const descLower   = description.toLowerCase();

  const keywords = [
    ...locatorCore.split(/[\s\-_]+/),
    ...descLower.split(/\s+/),
  ].filter(k => k.length > 3);

  // ── SEARCH 1: Exact ID match (O(1)) ──────────────────────────────────────
  for (const keyword of keywords) {
    const el = idIndex.get(keyword);
    if (el && el.selector) {
      // Verify it's unique on the page
      console.log(`   🗺️  Map hit (ID exact): "${el.selector}"`);
      return el.selector;
    }
  }

  // ── SEARCH 2: Class keyword match (O(1)) ─────────────────────────────────
  for (const keyword of keywords) {
    const matches = classIndex.get(keyword);
    if (matches && matches.length === 1) {
      // Exactly ONE element has this class keyword → unique!
      console.log(`   🗺️  Map hit (class keyword, unique): "${matches[0].selector}"`);
      return matches[0].selector;
    }
  }

  // ── SEARCH 3: Text content match (O(1)) ──────────────────────────────────
  for (const keyword of keywords) {
    const el = textIndex.get(keyword);
    if (el && el.selector) {
      console.log(`   🗺️  Map hit (text): "${el.selector}"`);
      return el.selector;
    }
  }

  // ── SEARCH 4: Aria-label match (O(1)) ────────────────────────────────────
  for (const keyword of keywords) {
    const el = ariaIndex.get(keyword);
    if (el && el.selector) {
      console.log(`   🗺️  Map hit (aria-label): "${el.selector}"`);
      return el.selector;
    }
  }

  // ── SEARCH 5: data-testid match (O(1)) ───────────────────────────────────
  for (const keyword of keywords) {
    const el = testIdIndex.get(keyword);
    if (el && el.selector) {
      console.log(`   🗺️  Map hit (data-testid): "${el.selector}"`);
      return el.selector;
    }
  }

  // ── SEARCH 6: Scored scan (O(n) — fallback) ──────────────────────────────
  // Only runs if all O(1) lookups failed
  // n is small (few hundred elements) so still fast
  let bestMatch = null;
  let bestScore = 0;

  for (const el of elements) {
    let score = 0;
    const elId   = (el.id || '').toLowerCase();
    const elText = (el.text || '').toLowerCase();
    const elAria = (el.ariaLabel || '').toLowerCase();

    for (const keyword of keywords) {
      if (elId.includes(keyword))   score += 20; // ID match = high confidence
      if (elText.includes(keyword)) score += 10;
      if (elAria.includes(keyword)) score += 10;
    }

    if (el.id) score += 5; // Bonus for having stable ID

    if (score > bestScore) {
      bestScore = score;
      bestMatch = el;
    }
  }

  // Only return if high confidence (score >= 20)
  if (bestScore >= 20 && bestMatch?.selector) {
    console.log(`   🗺️  Map hit (scored, score=${bestScore}): "${bestMatch.selector}"`);
    return bestMatch.selector;
  }

  console.log(`   🗺️  Map: no confident match found`);
  return null;
}

/**
 * getOrCreateElementMap()
 * -----------------------
 * Main entry point called by selfHealingLocator.js
 *
 * Flow:
 * 1. Check if page already scanned (in-memory cache)
 * 2. If not → scan page ONCE → build indexes
 * 3. Search ONLY the indexes (no re-scan)
 * 4. Return unique matching selector
 *
 * @param {Page}   page          - Playwright page
 * @param {string} pageUrl       - Current page URL
 * @param {string} brokenLocator - The broken locator
 * @param {string} description   - Element description
 * @returns {string|null}        - Best matching selector
 */
async function getOrCreateElementMap(page, pageUrl, brokenLocator, description) {

  // Get or create the indexed locator map (scan page ONCE)
  const locatorMap = await scanPageOnce(page, pageUrl);

  // Search ONLY the pre-built indexes — no page re-scan
  return searchLocatorMap(locatorMap, brokenLocator, description);
}

// Clear map for a specific page (call when navigating)
function clearPageMap(pageUrl) {
  pageLocatorMaps.delete(pageUrl);
}

// Clear all maps (call at end of test run)
function clearAllMaps() {
  pageLocatorMaps.clear();
}

module.exports = {
  scanPageOnce,
  getOrCreateElementMap,
  searchLocatorMap,
  clearPageMap,
  clearAllMaps,
};
