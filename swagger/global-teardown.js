import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// This file runs automatically after ALL Playwright tests finish
export default async function globalTeardown() {
  try {
    // absolute path use chestundi — working directory issue avoid cheyyadaniki
    const resultsFile = path.resolve(__dirname, "output", "test_results.json");
    if (!fs.existsSync(resultsFile)) {
      console.log("No test_results.json found — skipping Excel update.");
      console.log(`Expected at: ${resultsFile}`);
      return;
    }

    // latest Excel file output folder lo find chestundi — timestamp by sort chestundi
    const outDir = path.resolve(__dirname, "output");
    const excelFiles = fs.readdirSync(outDir)
      .filter(f => f.startsWith("testcases_") && f.endsWith(".xlsx"))
      .map(f => {
        // filename lo timestamp extract chestundi — testcases_TIMESTAMP.xlsx
        const ts = parseInt(f.replace("testcases_", "").replace(".xlsx", ""), 10);
        return { name: f, time: isNaN(ts) ? 0 : ts };
      })
      .sort((a, b) => b.time - a.time); // latest timestamp first

    if (excelFiles.length === 0) {
      console.log("No Excel file found in output folder — skipping Excel update.");
      return;
    }

    const latestExcel = path.join(outDir, excelFiles[0].name);
    console.log(`\n✅ Auto-updating Excel: ${latestExcel}`);

    const response = await fetch("http://localhost:3000/update-excel-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ excelFile: latestExcel }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Excel updated successfully!`);
      console.log(`   Total: ${result.total_results} | Passed: ${result.passed} | Failed: ${result.failed}`);
      console.log(`   Download: ${result.excel_url}`);
    } else {
      console.error("❌ Excel update failed:", result.error);
      console.error("❌ Full response:", JSON.stringify(result));
    }
  } catch (e) {
    console.error("❌ Global teardown error:", e.message);
  }
}
