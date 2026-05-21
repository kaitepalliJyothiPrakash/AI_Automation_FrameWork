const fs = require("fs");

function readStory(filePath) {
    if(fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return content;
    } else {
      throw new Error(`File not found: ${filePath}`);
    }
}

module.exports = { readStory };
