const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "../uploads");

// Run every day at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Running background cleanup job...");

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.log("Cleanup Error:", err);
      return;
    }


    files.forEach((file) => {
      const filePath = path.join(uploadDir, file);

      fs.stat(filePath, (err, stats) => {
        if (err) return;

        const now = Date.now();
        const fileAge = now - stats.mtimeMs;

        // Delete files older than 24 hours
        if (fileAge > 24 * 60 * 60 * 1000) {
          fs.unlink(filePath, (err) => {
            if (!err) {
              console.log("Deleted oldd file:", file);
            }
          });
        }
      });
    });
  });
});
