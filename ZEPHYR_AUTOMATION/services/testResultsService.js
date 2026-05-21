const fs = require("fs");
const ExcelJS = require("exceljs");

const STATUS_MAP = {
  passed: "Passed",
  failed: "Failed",
  skipped: "Skipped",
  timedOut: "Timed Out",
  interrupted: "Interrupted",
};

const STATUS_COLORS = {
  Passed: "FF00B050",
  Failed: "FFFF0000",
  Skipped: "FFFFC000",
  "Timed Out": "FFFF0000",
  Interrupted: "FFFF0000",
  "Not Run": "FFD3D3D3",
};

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Recursively collect all specs from Playwright JSON report suites
function collectSpecs(suites, results = []) {
  for (const suite of suites || []) {
    for (const spec of suite.specs || []) {
      const lastResult = spec.tests?.[0]?.results?.slice(-1)[0];
      const status = STATUS_MAP[lastResult?.status] || "Not Run";
      results.push({ title: spec.title, normalizedTitle: normalize(spec.title), status });
    }
    collectSpecs(suite.suites, results);
  }
  return results;
}

// Find the best matching spec for an Excel row scenario title
function findStatus(scenarioTitle, specs) {
  const key = normalize(scenarioTitle);

  // 1. Exact normalized match
  const exact = specs.find((s) => s.normalizedTitle === key);
  if (exact) return exact.status;

  // 2. Partial match — spec title is contained in scenario or vice versa
  const partial = specs.find(
    (s) => key.includes(s.normalizedTitle) || s.normalizedTitle.includes(key)
  );
  if (partial) return partial.status;

  return "Not Run";
}

async function updateExcelWithResults(
  storyId,
  resultsFile = "test-results.json",
  excelFile = "Manual_Test_Cases.xlsx"
) {
  if (!fs.existsSync(resultsFile)) {
    throw new Error(
      `Results file not found: ${resultsFile}\nRun your Playwright tests first: npx playwright test --project=edge`
    );
  }

  const report = JSON.parse(fs.readFileSync(resultsFile, "utf-8"));
  const specs = collectSpecs(report.suites);

  // Deduplicate by title — keep last result (handles retries / multiple projects)
  const seen = new Map();
  for (const spec of specs) {
    seen.set(spec.normalizedTitle, spec);
  }
  const uniqueSpecs = [...seen.values()];

  if (uniqueSpecs.length === 0) {
    throw new Error("No test results found in the report.");
  }

  console.log(`\nTest results loaded: ${uniqueSpecs.length} unique specs`);
  uniqueSpecs.forEach((s) => console.log(`  [${s.status}] ${s.title}`));

  // Load workbook
  const workbook = new ExcelJS.Workbook();
  if (!fs.existsSync(excelFile)) {
    throw new Error(`Excel file not found: ${excelFile}`);
  }
  await workbook.xlsx.readFile(excelFile);

  const sheetName = `Test_Case_${storyId}`;
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    throw new Error(
      `Sheet '${sheetName}' not found in ${excelFile}. Generate test cases first.`
    );
  }

  // Find or add "Automation Status" column
  const headerRow = sheet.getRow(1);
  let statusColNumber = null;

  headerRow.eachCell((cell, colNumber) => {
    if (cell.value === "Automation Status") statusColNumber = colNumber;
  });

  if (!statusColNumber) {
    statusColNumber = headerRow.cellCount + 1;
    const headerCell = headerRow.getCell(statusColNumber);
    headerCell.value = "Automation Status";
    headerCell.font = { bold: true };
    headerCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9E1F2" },
    };
    sheet.getColumn(statusColNumber).width = 18;
  }

  // Update each data row by matching Test Scenario (col 2) to spec titles
  let updated = 0;
  const counts = { Passed: 0, Failed: 0, Skipped: 0, "Not Run": 0, "Timed Out": 0 };

  console.log("\n--- Matching Excel rows to Playwright specs ---");
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const scenarioTitle = String(row.getCell(2).value || "");
    const status = findStatus(scenarioTitle, uniqueSpecs);
    console.log(`  Row ${rowNumber}: [${status}] "${scenarioTitle}"`);

    const cell = row.getCell(statusColNumber);
    cell.value = status;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: STATUS_COLORS[status] || STATUS_COLORS["Not Run"] },
    };
    cell.font = { bold: status === "Failed" || status === "Timed Out" };
    counts[status] = (counts[status] || 0) + 1;
    updated++;
  });

  await workbook.xlsx.writeFile(excelFile);

  console.log(`\nUpdated ${updated} rows in sheet '${sheetName}'`);
  console.log(
    `Summary — Passed: ${counts.Passed} | Failed: ${counts.Failed} | Timed Out: ${counts["Timed Out"]} | Skipped: ${counts.Skipped} | Not Run: ${counts["Not Run"] || 0}`
  );

  return counts;
}

module.exports = { updateExcelWithResults };
