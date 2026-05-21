const fs = require("fs");
const path = require("path");

function writeSpecFile(storyId, tsCode) {
  const dir = "./tests";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${storyId}.spec.ts`);
  fs.writeFileSync(filePath, tsCode, "utf-8");
  return filePath;
}

function writePageObject(className, tsCode) {
  const dir = "./pages";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${className}.ts`);
  fs.writeFileSync(filePath, tsCode, "utf-8");
  return filePath;
}

module.exports = { writeSpecFile, writePageObject };
