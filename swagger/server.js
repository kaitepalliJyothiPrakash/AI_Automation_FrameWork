// Flow: Request comes in →
// swagger URL fetch chesi metadata + story extract avutundi →
// OrangeHRM login page scrape chestundi →
// Gemini ki prompt send chestundi →
// scenarios + test cases generate avutayi →
// 4 sheet Excel lo save avutundi (Test Scenario, Test Cases, Defect Report, RTM) → JSON response return avutundi
import express from "express";  // Express framework — HTTP server create cheyyadaniki
import bodyParser from "body-parser"; // Request body lo vache JSON data ni parse cheyyadaniki
import dotenv from "dotenv"; // .env file lo unna secret keys (GEMINI_API_KEY) ni load cheyyadaniki
import { GoogleGenerativeAI } from "@google/generative-ai"; // Google Gemini AI model use cheyyadaniki — test cases generate cheyyadaniki
import YAML from "yaml"; // swagger.yaml file ni parse cheyyadaniki
import ExcelJS from "exceljs"; // Scenarios and test cases ni 2 sheet .xlsx Excel file lo write cheyyadaniki
import fs from "fs"; // File system — output folder exist check cheyyadaniki and create cheyyadaniki
import path from "path"; // File paths correctly build cheyyadaniki (Windows/Linux compatible)
import { load } from "cheerio"; // OrangeHRM login page HTML ni scrape cheyyadaniki (like jQuery for Node.js)

dotenv.config(); // .env file load avutundi — GEMINI_API_KEY environment variable ga available avutundi

// output folder exist avvakapote create chestundi — generated Excel files ikkade save avutayi
const OUT_DIR = path.resolve(process.cwd(), "output");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Automation test cases spec files save cheyyadaniki separate folder
const AUTO_DIR = path.resolve(process.cwd(), "Automation-test-Cases");

const app = express(); // Express app instance create chestundi
app.use(bodyParser.json()); // Incoming request body ni JSON ga parse chestundi
// /output route lo Excel files ni static files ga serve chestundi — download cheyyadaniki
app.use("/output", express.static(OUT_DIR));
// /automation route lo Playwright spec files ni static files ga serve chestundi — download cheyyadaniki
app.use("/automation", express.static(AUTO_DIR));

// ---- Gemini setup (Google Generative AI) ----
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // .env lo unna GEMINI_API_KEY tho Gemini AI client initialize chestundi
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // gemini-2.5-flash model use chestundi — fast and efficient
  // Gemini response ni always JSON format lo return cheyyadaniki enforce chestundi
  generationConfig: { responseMimeType: "application/json" },
});

// ---- Helpers ----
// Gemini response text ni JSON object/array ga parse chestundi
// Direct JSON.parse fail ayite, regex tho first JSON block extract chesi parse chestundi
// Valid JSON dorakakpote error throw chestundi
function extractFirstJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/(\[[\s\S]*?\]|\{[\s\S]*?\})/);
    if (!match) throw new Error("No JSON found in response");
    return JSON.parse(match[1]);
  }
}

// 503 error vastే automatically retry cheyye helper function
// maxRetries: max retry attempts, delayMs: wait time between retries
async function generateWithRetry(prompt, maxRetries = 5, delayMs = 10000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return await result.response.text();
    } catch (e) {
      const is503 = e.message?.includes("503") || e.message?.includes("Service Unavailable");
      if (is503 && attempt < maxRetries) {
        console.log(`⚠️ Gemini 503 error — attempt ${attempt}/${maxRetries}. Retrying in ${delayMs / 1000}s...`);
        await new Promise(r => setTimeout(r, delayMs));
      } else {
        throw e; // max retries exceeded or different error
      }
    }
  }
}

// OrangeHRM login page URL — targetUrl provide cheyakapote default ga ee URL use avutundi
const ORANGEHRM_URL = "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login";

// OrangeHRM login page kosam scenarios + test cases generate cheyye function
// targetUrl: login page URL, story: swagger.yaml description field nundi vache user story
async function generateTestCasesForOrangeHRM(targetUrl = ORANGEHRM_URL, story = "") {

  // OrangeHRM login page fetch chesi form fields scrape cheyyadaniki try chestundi
  let pageSummary = "";
  try {
    // targetUrl fetch chesi HTML response text ga teesukuntundi
    const resp = await fetch(targetUrl);
    const html = await resp.text();
    const $ = load(html); // cheerio tho HTML parse chestundi
    const inputs = [];
    // Page lo unna all input fields and submit buttons scrape chestundi (name, type, placeholder, label)
    $("input, button[type='submit']").each((i, el) => {
      const name = $(el).attr("name") || $(el).attr("id") || "";
      const type = $(el).attr("type") || el.tagName;
      const placeholder = $(el).attr("placeholder") || "";
      const label =
        $(el).attr("aria-label") || $(el).closest("label").text().trim() || "";
      inputs.push({ name, type, placeholder, label });
    });
    // Scraped fields ni readable summary string ga build chestundi
    // OrangeHRM React SPA kabatti scraping fail ayite default field names use chestundi
    pageSummary =
      inputs.length > 0
        ? `Page fields:\n${inputs
            .map(
              (i) =>
                `- ${i.name || "(no-name)"} (type=${i.type}) label="${
                  i.label
                }" placeholder="${i.placeholder}"`
            )
            .join("\n")}`
        : "Fields: Username (text), Password (password), Login (submit button)";
  } catch {
    // Fetch fail ayite default OrangeHRM login page fields use chestundi
    pageSummary =
      "Fields: Username (text), Password (password), Login (submit button)";
  }

  // Gemini ki send chese prompt — user story + scraped page fields + 14 test scenario categories include chestundi
  // Response format: { scenarios: [...], testCases: [...] }
  const prompt = `
Return ONLY a JSON object with two keys: "scenarios" and "testCases". No markdown.

"scenarios" is an array of scenario objects:
{
  "module": "string",
  "scenario_id": "string",
  "scenario_name": "string",
  "scenario_description": "string",
  "requirement_id": "string"
}

"testCases" is an array of test case objects:
{
  "test_scenario_id": "string",
  "test_case_id": "string",
  "test_case_description": "string",
  "prerequisites": "string",
  "steps_to_execute": ["string"],
  "expected_results": "string",
  "actual_result": ""
}

User story:
${story}

${pageSummary}

Default valid credentials: username="Admin", password="admin123"
Module name: "OrangeHRM Login"
Requirement ID prefix: "REQ"
Scenario ID prefix: "SCN"
Test Case ID prefix: "TC"

Generate scenarios and test cases covering:
1. Valid login with correct credentials
2. Invalid username
3. Invalid password
4. Both fields empty
5. Username empty, password filled
6. Username filled, password empty
7. SQL injection in username/password
8. XSS/HTML injection attempts
9. Case sensitivity for username/password
10. Boundary values (very long username/password)
11. UI validation messages
12. Forgot password link presence
13. Password field masking
14. Successful redirect after login
`.trim();

  // generateWithRetry tho Gemini ki prompt send chestundi — 503 error vastే auto retry avutundi
  const text = await generateWithRetry(prompt);
  // Response text ni JSON object ga parse chestundi
  const parsed = extractFirstJson(text);
  // scenarios and testCases keys lekapote error throw chestundi
  if (!parsed.scenarios || !parsed.testCases)
    throw new Error("Model did not return expected format");
  return { scenarios: parsed.scenarios, testCases: parsed.testCases, story: story };
}

// Manual test cases ni input ga teesukuni Playwright JavaScript automation code generate cheyye function
async function generatePlaywrightCode(testCases, targetUrl = ORANGEHRM_URL) {
  // Manual test cases ni readable format lo convert chestundi — exact test_case_id include chestundi
  const testCaseSummary = testCases.map((tc, i) =>
    `Test Case ID: ${tc.test_case_id}\nScenario ID: ${tc.test_scenario_id}\nDescription: ${tc.test_case_description}\nPrerequisites: ${tc.prerequisites}\nSteps: ${Array.isArray(tc.steps_to_execute) ? tc.steps_to_execute.join(" | ") : tc.steps_to_execute}\nExpected: ${tc.expected_results}`
  ).join("\n\n");

  // exact test case IDs list — Gemini ki pass chestundi
  const testCaseIds = testCases.map(tc => tc.test_case_id).join(", ");
  // exact scenario IDs list — Gemini ki pass chestundi
  const scenarioIds = [...new Set(testCases.map(tc => tc.test_scenario_id))].join(", ");

  // Gemini ki send chese prompt — manual test cases ni Playwright parallel + cross browser code ga convert cheyyadaniki
  const prompt = `
Generate a complete Playwright JavaScript test file for the OrangeHRM login page.
URL: ${targetUrl}
Valid credentials: username="Admin", password="admin123"

Use these selectors for OrangeHRM login page:
- Username field: input[name="username"]
- Password field: input[name="password"]
- Login button: button[type="submit"]
- Error message: .oxd-alert-content-text
- Dashboard after login: .oxd-topbar-header-breadcrumb

=====================================================================
IMPORTANT: EXCEL SHEET ID AND BROWSER NAME MAPPING
=====================================================================
The following Test Case IDs, Scenario IDs and Browser names are already written in the Excel sheet.
You MUST use these EXACT same values in the automation code — NO changes allowed.

Exact Test Case IDs used in Excel Sheet 2 (Test Cases):
${testCaseIds}

Exact Scenario IDs used in Excel Sheet 1 (Test Scenario):
${scenarioIds}

Exact Browser names used in Excel:
- "chromium" (Playwright gives browserName as "chromium" for Chrome)
- Tests run on Chrome only — single browser
=====================================================================

Generate Playwright test() blocks for each of the following manual test cases:
${testCaseSummary}

Rules:
- Use import {test, expect} from '@playwright/test'
- Add this import at top: import { fileURLToPath } from 'url';
- Add this line after imports: const __dirname = path.dirname(fileURLToPath(import.meta.url));
- Use test.describe.configure({ mode: 'parallel' }) at the very top to enable parallel execution
- Each test case must be a separate test() block
- Use async ({page, browserName}) => {} for each test to capture browser name
- Navigate to "${targetUrl}" at the start of each test
- Use page.fill(), page.click(), page.locator(), expect() methods
- Tests will run alternately on Chrome and Edge via playwright.config.js projects with workers:2
- Do NOT hardcode any browser name inside the test — use browserName variable from fixture
- At the END of each test() block write result using this writeResult helper function — define it once at top of file:
  async function writeResult(testCaseId, browser, status, actualResult) {
    const outputDir = path.resolve(__dirname, '..', 'output');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const resultFile = path.join(outputDir, 'test_results.json');
    const lockFile = path.join(outputDir, 'test_results.lock');
    let waited = 0;
    while (fs.existsSync(lockFile) && waited < 10000) { await new Promise(r => setTimeout(r, 100)); waited += 100; }
    fs.writeFileSync(lockFile, process.pid.toString());
    try {
      let results = [];
      if (fs.existsSync(resultFile)) { try { results = JSON.parse(fs.readFileSync(resultFile, 'utf8')); } catch { results = []; } }
      const entry = { test_case_id: testCaseId, browser, status, actual_result: actualResult };
      if (status === 'Fail') { const max = results.filter(r=>r.defect_id).length; entry.defect_id = 'DEF' + String(max+1).padStart(3,'0') + '-' + browser; }
      results.push(entry);
      fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
      console.log('Result written: ' + testCaseId + ' | ' + browser + ' | ' + status);
    } finally {
      if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
    }
  }
- Call writeResult(exactTestCaseId, browserName, status, actualResult) in finally block of each test
- Use the EXACT test case ID from the Excel list above in each writeResult() call
- If test fails, catch the error, set status='Fail', actualResult=error.message
- Return ONLY valid JavaScript code, no markdown, no explanation
`.trim();

  // Gemini model for code generation — text/plain response, retry on 503
  const codeModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "text/plain" },
  });

  // 503 ayite retry cheyyadaniki — codeModel tho retry function
  let code = "";
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const code_result = await codeModel.generateContent(prompt);
      code = await code_result.response.text();
      break; // success — loop exit
    } catch (e) {
      const is503 = e.message?.includes("503") || e.message?.includes("Service Unavailable");
      if (is503 && attempt < 5) {
        console.log(`⚠️ Gemini 503 error (code gen) — attempt ${attempt}/5. Retrying in 10s...`);
        await new Promise(r => setTimeout(r, 10000));
      } else {
        throw e;
      }
    }
  }

  // If Gemini returned JSON object with content key, extract the actual code
  try {
    const parsed = JSON.parse(code);
    if (parsed.content) code = parsed.content;
    else if (parsed.code) code = parsed.code;
  } catch {
    // not JSON, use as is
  }

  // Markdown code blocks remove chestundi — clean JS code matrame untundi
  code = code.replace(/```javascript\n?/g, "").replace(/```js\n?/g, "").replace(/```\n?/g, "").trim();
  return code;
}

// Swagger URL fetch chesi JSON or YAML ga parse chestundi
// JSON parse fail ayite YAML.parse try chestundi
async function loadSwagger(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch swagger: ${res.status}`);
  const txt = await res.text();
  try {
    return JSON.parse(txt); // JSON format ayite direct parse chestundi
  } catch {
    return YAML.parse(txt); // YAML format ayite YAML parse chestundi
  }
}

// ---- Route: POST /generate-testcases-from-swagger ----
// swaggerUrl mandatory — lekapote 400 Bad Request error return chestundi
app.post("/generate-testcases-from-swagger", async (req, res) => {
  try {
    const { swaggerUrl, targetUrl } = req.body || {};
    if (!swaggerUrl)
      return res.status(400).json({ error: "Missing swaggerUrl" });

    // swaggerUrl fetch chesi spec_title, spec_version, story extract cheyyadaniki
    const spec = await loadSwagger(swaggerUrl);

    // swagger.yaml info.description field nundi user story extract chestundi
    // description lekapote default story use chestundi
    const swaggerStory = spec.info?.description?.trim() || `As an API consumer, I want to use ${spec.info?.title || "this API"}.`;

    // swagger story use chesi OrangeHRM login page kosam scenarios + test cases generate chestundi
    const { scenarios, testCases, story } = await generateTestCasesForOrangeHRM(targetUrl, swaggerStory);

    // Manual test cases ni use chesi Playwright automation code generate chestundi
    const playwrightCode = await generatePlaywrightCode(testCases, targetUrl);

    // Playwright .spec.js file timestamp tho unique filename create chesi Automation-test-cases folder lo save chestundi
    const specFileName = `orangehrm_login_${Date.now()}.spec.js`;
    const specFilePath = path.join(AUTO_DIR, specFileName);
    fs.writeFileSync(specFilePath, playwrightCode, "utf8");
    console.log(`\n✅ Playwright spec file generated: ${specFilePath}`);
    console.log(`   Run: npx playwright test ${specFileName} --headed`);

    // ExcelJS workbook create chestundi — 2 sheets add cheyyadaniki
    const workbook = new ExcelJS.Workbook();

    // ---- Sheet 1: Test Scenario — 5 columns ----
    const scenarioSheet = workbook.addWorksheet("Test Scenario");
    scenarioSheet.addRow(["Module", "Scenario ID", "Scenario Name", "Scenario Description", "Requirement Id"]);
    for (const sc of scenarios) {
      scenarioSheet.addRow([sc.module || "", sc.scenario_id || "", sc.scenario_name || "", sc.scenario_description || "", sc.requirement_id || ""]);
    }
    scenarioSheet.columns.forEach((col) => {
      let max = 15;
      col.eachCell({ includeEmpty: true }, (cell) => { const val = cell.value ? String(cell.value) : ""; if (val.length > max) max = Math.min(val.length, 100); });
      col.width = max + 2;
    });

    // ---- Sheet 2: Test Cases — 10 columns ----
    const testCaseSheet = workbook.addWorksheet("Test Cases");
    testCaseSheet.addRow(["Test Scenario ID", "Test Case ID", "Test Case Description", "Prerequisites", "Steps To Execute", "Expected Results", "Actual Result", "Pass/Fail", "Defect ID", "Remarks"]);
    for (const tc of testCases) {
      const steps = Array.isArray(tc.steps_to_execute) ? tc.steps_to_execute.join("\n") : String(tc.steps_to_execute || "");
      testCaseSheet.addRow([tc.test_scenario_id || "", tc.test_case_id || "", tc.test_case_description || "", tc.prerequisites || "", steps, tc.expected_results || "", "", "", "", ""]);
    }
    testCaseSheet.columns.forEach((col) => {
      let max = 15;
      col.eachCell({ includeEmpty: true }, (cell) => { const val = cell.value ? String(cell.value) : ""; if (val.length > max) max = Math.min(val.length, 100); });
      col.width = max + 2;
    });

    // ---- Sheet 3: Defect Report — 11 columns ----
    const defectSheet = workbook.addWorksheet("Defect Report");
    defectSheet.addRow(["Serial No.", "Defect ID", "Description", "Reproducible (Yes/No)", "Steps To Reproduce", "Severity", "Priority", "Reported By", "Reported Date", "Status", "Remarks"]);
    defectSheet.columns.forEach((col) => {
      let max = 15;
      col.eachCell({ includeEmpty: true }, (cell) => { const val = cell.value ? String(cell.value) : ""; if (val.length > max) max = Math.min(val.length, 100); });
      col.width = max + 2;
    });

    // ---- Sheet 4: RTM — 6 columns ----
    const rtmSheet = workbook.addWorksheet("RTM");
    rtmSheet.addRow(["Serial No.", "Requirement ID", "Requirement Description", "Test Scenario ID", "Test Case ID", "Defect ID"]);
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const matchedScenario = scenarios.find(sc => sc.scenario_id === tc.test_scenario_id);
      const reqId = matchedScenario?.requirement_id || "";
      const reqDesc = matchedScenario?.scenario_description || "";
      rtmSheet.addRow([i + 1, reqId, reqDesc, tc.test_scenario_id || "", tc.test_case_id || "", ""]);
    }
    rtmSheet.columns.forEach((col) => {
      let max = 15;
      col.eachCell({ includeEmpty: true }, (cell) => { const val = cell.value ? String(cell.value) : ""; if (val.length > max) max = Math.min(val.length, 100); });
      col.width = max + 2;
    });

    // Timestamp tho unique filename create chesi output folder lo Excel file save chestundi
    const fileName = `testcases_${Date.now()}.xlsx`;
    const filePath = path.join(OUT_DIR, fileName);
    await workbook.xlsx.writeFile(filePath);
    console.log(`\n✅ Excel file generated: ${filePath}`);
    // Client ki downloadable Excel URL build chestundi
    const host = req.get("host") || "localhost:3000";
    const excelUrl = `${req.protocol}://${host}/output/${fileName}`;
    const specUrl = `${req.protocol}://${host}/output/${specFileName}`;

    // Final JSON response return chestundi — scenarios, test cases, Excel download URL, Playwright spec file URL tho
    res.json({
      spec_title: spec.info?.title || "API",
      spec_version: spec.info?.version || "unknown",
      page: "OrangeHRM Login",
      login_url: targetUrl || ORANGEHRM_URL,
      story,
      total_scenarios: scenarios.length,
      total_test_cases: testCases.length,
      scenarios,
      test_cases: testCases,
      excel_file: filePath,
      excel_url: excelUrl,
      playwright_spec_file: specFilePath,
      playwright_spec_url: specUrl,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message }); // Unexpected error ayite 500 Internal Server Error return chestundi
  }
});

// ---- Route: POST /update-excel-results ----
// Playwright test results JSON file read chesi Excel sheets update cheyye route
// Body: { excelFile: "path/to/testcases.xlsx" }
app.post("/update-excel-results", async (req, res) => {
  try {
    const { excelFile } = req.body || {};
    if (!excelFile) return res.status(400).json({ error: "Missing excelFile path" });

    // test_results.json file exist avutundaa check chestundi
    const resultsFile = path.resolve(OUT_DIR, "test_results.json");
    if (!fs.existsSync(resultsFile))
      return res.status(404).json({ error: "test_results.json not found. Run Playwright tests first." });

    // test_results.json read chestundi
    const results = JSON.parse(fs.readFileSync(resultsFile, "utf8"));

    // Excel file read chestundi
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFile);

    const testCaseSheet = workbook.getWorksheet("Test Cases");
    const defectSheet = workbook.getWorksheet("Defect Report");
    const rtmSheet = workbook.getWorksheet("RTM");

    let defectCounter = 1;
    let defectSerial = 1;
    const defectMap = {};

    // Update Test Cases sheet
    for (const result of results) {
      const { test_case_id, status, actual_result, defect_id } = result;
      const generatedDefectId = status === "Fail"
        ? (defect_id || `DEF${String(defectCounter).padStart(3, "0")}`)
        : "";

      testCaseSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        if (String(row.getCell(2).value || "").trim() === String(test_case_id).trim()) {
          row.getCell(7).value = actual_result || "";          // Actual Result
          row.getCell(8).value = status || "";                 // Pass/Fail
          row.getCell(9).value = generatedDefectId;            // Defect ID
          row.getCell(10).value = status === "Fail" ? "Defect raised" : "Test passed"; // Remarks
        }
      });

      if (status === "Fail") {
        defectMap[test_case_id] = generatedDefectId;
        defectCounter++;
      }
    }

    // Clear and update Defect Report sheet
    const defRowCount = defectSheet.rowCount;
    for (let i = defRowCount; i >= 2; i--) defectSheet.spliceRows(i, 1);

    for (const result of results) {
      if (result.status === "Fail") {
        const defId = defectMap[result.test_case_id] || "";
        defectSheet.addRow([defectSerial++, defId, result.actual_result || "", "Yes", "", "Medium", "Medium", "", new Date().toLocaleDateString(), "Open", ""]);
      }
    }
    defectSheet.columns.forEach((col) => {
      let max = 15;
      col.eachCell({ includeEmpty: true }, (cell) => { const val = cell.value ? String(cell.value) : ""; if (val.length > max) max = Math.min(val.length, 100); });
      col.width = max + 2;
    });

    // Update RTM sheet
    rtmSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const tcId = String(row.getCell(5).value || "").trim();
      if (defectMap[tcId]) row.getCell(6).value = defectMap[tcId];
    });

    // Updated Excel file save chestundi
    await workbook.xlsx.writeFile(excelFile);

    // test_results.json delete chestundi — next run kosam clean slate
    fs.unlinkSync(resultsFile);

    const host = req.get("host") || "localhost:3000";
    const fileName = path.basename(excelFile);
    const excelUrl = `${req.protocol}://${host}/output/${fileName}`;

    res.json({
      message: "Excel updated successfully with test results",
      total_results: results.length,
      passed: results.filter(r => r.status === "Pass").length,
      failed: results.filter(r => r.status === "Fail").length,
      excel_url: excelUrl,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000")); // Server port 3000 lo start avutundi
