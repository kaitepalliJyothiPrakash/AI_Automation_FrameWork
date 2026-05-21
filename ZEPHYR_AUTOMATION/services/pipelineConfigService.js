const ExcelJS = require("exceljs");
const fs = require("fs");

const CONFIG_FILE = "Pipeline_Config.xlsx";
const VALID_RUN_MODES = ["manual", "automation", "both"];
const VALID_BROWSERS = ["edge", "chrome"];

async function createConfigTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Pipeline");

  sheet.columns = [
    { header: "Story ID", key: "storyId", width: 15 },
    { header: "Run Mode", key: "runMode", width: 15 },
    { header: "Browser", key: "browser", width: 12 },
    { header: "Headless", key: "headless", width: 12 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } };
  });

  // Add a sample row
  sheet.addRow({ storyId: "SCRUM-5", runMode: "both", browser: "edge", headless: "false" });

  await workbook.xlsx.writeFile(CONFIG_FILE);
  console.log(`Created ${CONFIG_FILE} with a sample row.`);
  console.log(`Fill in your story IDs and run: node run-pipeline.js`);
}

async function readConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    throw new Error(
      `${CONFIG_FILE} not found. Run 'node run-pipeline.js --init' to create a template.`
    );
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(CONFIG_FILE);

  const sheet = workbook.getWorksheet("Pipeline");
  if (!sheet) throw new Error(`Sheet 'Pipeline' not found in ${CONFIG_FILE}.`);

  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const storyId = String(row.getCell(1).value || "").trim().toUpperCase();
    const runMode = String(row.getCell(2).value || "").trim().toLowerCase();
    const browser = String(row.getCell(3).value || "edge").trim().toLowerCase();
    const headless = String(row.getCell(4).value || "false").trim().toLowerCase();

    if (!storyId) return; // skip empty rows

    const errors = [];
    if (!VALID_RUN_MODES.includes(runMode))
      errors.push(`Run Mode must be one of: ${VALID_RUN_MODES.join(", ")}`);
    if (!VALID_BROWSERS.includes(browser))
      errors.push(`Browser must be one of: ${VALID_BROWSERS.join(", ")}`);
    if (headless !== "true" && headless !== "false")
      errors.push(`Headless must be "true" or "false"`);

    if (errors.length > 0) {
      console.warn(`  [WARN] Row ${rowNumber} (${storyId}): ${errors.join("; ")} — skipping`);
      return;
    }

    rows.push({ storyId, runMode, browser, headless });
  });

  if (rows.length === 0) throw new Error(`No valid rows found in ${CONFIG_FILE}.`);
  return rows;
}

module.exports = { readConfig, createConfigTemplate };
