const fs = require("fs");
const path = require("path");

async function getFolderSize(dirPath) {
  let total = 0;
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dirPath, file.name);
    if (file.isDirectory()) total += getFolderSize(filePath);
    else total += fs.statSync(filePath).size;
  }
  return total; 
}

module.exports = {
  getFolderSize
};