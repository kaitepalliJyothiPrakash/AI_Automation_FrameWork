const fs = require("fs");
const path = require("path");

function moveToCompleted(storyPath) {
  const filename = path.basename(storyPath);
  const completedDir = "./stories/completed";
  if (!fs.existsSync(completedDir))
    fs.mkdirSync(completedDir, { recursive: true });

  const dest = path.join(completedDir, filename);
  try {
    fs.renameSync(storyPath, dest);
  } catch {
    // renameSync fails cross-device (different drives) — fall back to copy + delete
    fs.copyFileSync(storyPath, dest);
    fs.unlinkSync(storyPath);
  }
  return dest;
}

module.exports = { moveToCompleted };
