const readline = require("readline");

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans.trim()); }));
}

function printTestCasesSummary(testCases) {
  console.log("\n--- Generated Test Cases Preview ---");
  testCases.forEach((tc) => console.log(`  [${tc.priority}][${tc.type}] ${tc.id}: ${tc.title}`));
  console.log(`Total: ${testCases.length} test case(s)\n`);
}

module.exports = { ask, printTestCasesSummary };
