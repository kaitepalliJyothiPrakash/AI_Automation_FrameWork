const fs = require("fs");
const path = require("path");

function saveJson(storyId, data) {
  const dir = "./output/json";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = path.join(dir, `${storyId}_${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  return filePath;
}

module.exports = { saveJson };
