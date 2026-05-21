/**
 * ============================================================
 * FILE: healingDB.js
 * LOCATION: utils/healingDB.js
 * ============================================================
 *
 * WHAT IS THIS FILE?
 * ------------------
 * This replaces the simple healed-locators.json cache file
 * with a proper SQLite database for fast retrieval.
 *
 * WHY SQLite INSTEAD OF JSON?
 * ----------------------------
 * JSON file:
 *   ❌ Slow for large number of locators
 *   ❌ No querying capability
 *   ❌ No history tracking
 *   ❌ Not scalable
 *
 * SQLite database:
 *   ✅ Fast key-value lookups
 *   ✅ SQL queries for reporting
 *   ✅ Full history with timestamps
 *   ✅ Hit count tracking
 *   ✅ Scalable for large projects
 *
 * TABLE STRUCTURE:
 * ----------------
 * healed_locators:
 *   original_locator → broken locator (KEY)
 *   healed_locator   → correct locator (VALUE)
 *   description      → element description
 *   heal_count       → how many times this was healed
 *   first_healed_at  → when first healed
 *   last_healed_at   → when last healed
 *
 * element_map:
 *   page_url         → which page
 *   element_id       → element id
 *   element_type     → input/button/link etc
 *   element_text     → visible text
 *   selector         → CSS selector
 *   xpath            → XPath
 *   created_at       → when scanned
 * ============================================================
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Path where the SQLite database file will be stored
const DB_PATH = path.join(__dirname, '../healing-report/healing.db');

// In-memory database instance (loaded from file)
let db = null;

/**
 * initDB()
 * --------
 * Initializes the SQLite database.
 * Creates the database file if it doesn't exist.
 * Creates tables if they don't exist.
 *
 * Called automatically before any DB operation.
 */
async function initDB() {
  if (db) return; // Already initialized

  // Create healing-report folder if it doesn't exist
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  // Initialize sql.js
  const SQL = await initSqlJs();

  // Load existing database from file, or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create healed_locators table if it doesn't exist
  // This is the main KV pair mapping table
  db.run(`
    CREATE TABLE IF NOT EXISTS healed_locators (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      original_locator  TEXT UNIQUE NOT NULL,
      healed_locator    TEXT NOT NULL,
      description       TEXT,
      element_type      TEXT DEFAULT 'unknown',
      heal_count        INTEGER DEFAULT 1,
      first_healed_at   TEXT NOT NULL,
      last_healed_at    TEXT NOT NULL
    )
  `);

  // Create element_map table for storing page element maps
  // This is used for the "scan once, use many times" feature
  db.run(`
    CREATE TABLE IF NOT EXISTS element_map (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      page_url     TEXT NOT NULL,
      element_id   TEXT,
      element_type TEXT,
      element_text TEXT,
      element_name TEXT,
      selector     TEXT,
      xpath        TEXT,
      created_at   TEXT NOT NULL
    )
  `);

  // Create healing_history table for full audit trail
  db.run(`
    CREATE TABLE IF NOT EXISTS healing_history (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      original_locator TEXT NOT NULL,
      healed_locator   TEXT NOT NULL,
      description      TEXT,
      page_url         TEXT,
      healed_at        TEXT NOT NULL,
      success          INTEGER DEFAULT 1
    )
  `);

  // Save the database to file
  saveDB();

  console.log('✅ SQLite healing database initialized');
}

/**
 * saveDB()
 * --------
 * Saves the in-memory database to the file system.
 * Called after every write operation.
 */
function saveDB() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * getHealedLocator()
 * ------------------
 * Looks up a healed locator from the database by the broken locator.
 * This is the KEY lookup — fast retrieval.
 *
 * @param {string} originalLocator - The broken locator to look up
 * @returns {string|null} - The healed locator, or null if not found
 */
async function getHealedLocator(originalLocator) {
  await initDB();

  const result = db.exec(
    `SELECT healed_locator FROM healed_locators WHERE original_locator = ?`,
    [originalLocator]
  );

  if (result.length > 0 && result[0].values.length > 0) {
    // Update hit count and last healed timestamp
    db.run(
      `UPDATE healed_locators
       SET heal_count = heal_count + 1, last_healed_at = ?
       WHERE original_locator = ?`,
      [new Date().toISOString(), originalLocator]
    );
    saveDB();

    return result[0].values[0][0]; // Return the healed locator
  }

  return null; // Not found in database
}

/**
 * saveHealedLocator()
 * -------------------
 * Saves a newly healed locator to the database.
 * If the locator was already healed before, updates the record.
 *
 * @param {string} originalLocator - The broken locator
 * @param {string} healedLocator   - The correct locator from Copilot
 * @param {string} description     - Element description
 * @param {string} elementType     - Type of element (input/button/link)
 * @param {string} pageUrl         - URL of the page where healing happened
 */
async function saveHealedLocator(originalLocator, healedLocator, description = '', elementType = 'unknown', pageUrl = '') {
  await initDB();

  const now = new Date().toISOString();

  // Insert or update the healed locator (UPSERT)
  db.run(
    `INSERT INTO healed_locators
       (original_locator, healed_locator, description, element_type, heal_count, first_healed_at, last_healed_at)
     VALUES (?, ?, ?, ?, 1, ?, ?)
     ON CONFLICT(original_locator) DO UPDATE SET
       healed_locator  = excluded.healed_locator,
       heal_count      = heal_count + 1,
       last_healed_at  = excluded.last_healed_at`,
    [originalLocator, healedLocator, description, elementType, now, now]
  );

  // Also save to healing history for full audit trail
  db.run(
    `INSERT INTO healing_history
       (original_locator, healed_locator, description, page_url, healed_at, success)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [originalLocator, healedLocator, description, pageUrl, now]
  );

  saveDB();

  console.log(`✅ DB: Healed locator saved: "${originalLocator}" → "${healedLocator}"`);
}

/**
 * saveElementMap()
 * ----------------
 * Saves the element map for a page to the database.
 * Called once per page to store all elements.
 *
 * @param {string} pageUrl  - The URL of the page
 * @param {Array}  elements - Array of element objects
 */
async function saveElementMap(pageUrl, elements) {
  await initDB();

  const now = new Date().toISOString();

  // Delete old element map for this page (refresh it)
  db.run(`DELETE FROM element_map WHERE page_url = ?`, [pageUrl]);

  // Insert all elements
  for (const el of elements) {
    db.run(
      `INSERT INTO element_map
         (page_url, element_id, element_type, element_text, element_name, selector, xpath, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [pageUrl, el.id || '', el.type || '', el.text || '', el.name || '', el.selector || '', el.xpath || '', now]
    );
  }

  saveDB();
}

/**
 * findElementInMap()
 * ------------------
 * Searches the element map for an element matching the description.
 * Used to find correct locator without calling Copilot API.
 *
 * @param {string} pageUrl     - The URL of the page
 * @param {string} description - Element description to search for
 * @returns {Object|null}      - Element object or null if not found
 */
async function findElementInMap(pageUrl, description) {
  await initDB();

  // Search by element text, id, or name matching the description
  const searchTerm = `%${description.toLowerCase()}%`;

  const result = db.exec(
    `SELECT selector, element_id, element_type, element_text
     FROM element_map
     WHERE page_url = ?
     AND (
       LOWER(element_text) LIKE ? OR
       LOWER(element_id)   LIKE ? OR
       LOWER(element_name) LIKE ?
     )
     LIMIT 1`,
    [pageUrl, searchTerm, searchTerm, searchTerm]
  );

  if (result.length > 0 && result[0].values.length > 0) {
    const [selector, id, type, text] = result[0].values[0];
    return { selector, id, type, text };
  }

  return null;
}

/**
 * getHealingReport()
 * ------------------
 * Returns a full healing report from the database.
 * Shows all healed locators with their hit counts.
 *
 * @returns {Object} - Report object with healed locators and stats
 */
async function getHealingReport() {
  await initDB();

  const result = db.exec(
    `SELECT original_locator, healed_locator, description,
            element_type, heal_count, first_healed_at, last_healed_at
     FROM healed_locators
     ORDER BY heal_count DESC`
  );

  const healed = result.length > 0
    ? result[0].values.map(row => ({
        original: row[0],
        healed: row[1],
        description: row[2],
        elementType: row[3],
        healCount: row[4],
        firstHealedAt: row[5],
        lastHealedAt: row[6],
      }))
    : [];

  return {
    timestamp: new Date().toISOString(),
    totalHealed: healed.length,
    healed,
  };
}

module.exports = {
  initDB,
  getHealedLocator,
  saveHealedLocator,
  saveElementMap,
  findElementInMap,
  getHealingReport,
};
