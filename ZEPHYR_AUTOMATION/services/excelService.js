const ExcelJS = require("exceljs");

async function generateExcel(
  testCases,
  storyId = "US-00",
  fileName = "Manual_Test_Cases.xlsx",
) {
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.readFile(fileName);
  } catch {
    // File does not exist yet — start with empty workbook
  }

  const sheetName = `Test_Case_${storyId}`;

  // Remove existing sheet for this story before re-adding
  const existing = workbook.getWorksheet(sheetName);
  if (existing) {
    workbook.removeWorksheet(existing.id);
    console.log(`Removed existing sheet '${sheetName}'`);
  }

  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = [
    { header: "Test Id", key: "test_id", width: 12 },
    { header: "Test Scenario", key: "test_scenario", width: 35 },
    { header: "Steps", key: "steps", width: 50 },
    { header: "Input Data", key: "input_data", width: 30 },
    { header: "Expected Result", key: "expected_result", width: 40 },
    { header: "Priority", key: "priority", width: 12 },
    { header: "Type", key: "type", width: 12 },
  ];

  testCases.forEach((tc) => {
    const stepsText = Array.isArray(tc.steps)
      ? tc.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")
      : tc.steps || "";

    sheet.addRow({
      test_id: tc.id,
      test_scenario: tc.title,
      steps: stepsText,
      input_data: tc.input_data || "",
      expected_result: tc.expected_result,
      priority: tc.priority || "",
      type: tc.type || "",
    });
  });

  sheet.getColumn("steps").alignment = { wrapText: true };
  sheet.getColumn("expected_result").alignment = { wrapText: true };

  await workbook.xlsx.writeFile(fileName);

  const written = testCases.length;
  console.log(
    `Excel sheet '${sheetName}' written to ${fileName} (${written} test cases)`,
  );

  return { written };
}

module.exports = { generateExcel };
