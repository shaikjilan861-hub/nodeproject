const crypto = require("crypto");
const fs = require("fs");

const generateChecksum = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);

  return crypto
    .createHash("sha256")
    .update(fileBuffer)
    .digest("hex");
};

module.exports = generateChecksum;   // ⭐ IMPORTANT
