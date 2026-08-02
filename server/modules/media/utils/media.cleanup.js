const fs = require('fs-extra');
const path = require('path');
const config = require('../config/media.config');

async function cleanupExpiredFiles() {
  const dir = path.resolve(config.tempPath);
  const maxAgeMs = config.fileRetentionHours * 60 * 60 * 1000;
  const now = Date.now();

  try {
    const exists = await fs.pathExists(dir);
    if (!exists) return;

    const files = await fs.readdir(dir);
    let removedCount = 0;

    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stat = await fs.stat(filePath);
        if (stat.isFile() && now - stat.mtimeMs > maxAgeMs) {
          await fs.remove(filePath);
          removedCount++;
        }
      } catch (err) {
        // Skip individual file error
      }
    }

    if (removedCount > 0) {
      console.log(`[MEDIA CLEANUP] Removed ${removedCount} expired file(s) from ${dir}`);
    }
  } catch (err) {
    console.error(`[MEDIA CLEANUP ERROR] Failed to clean ${dir}:`, err.message);
  }
}

let scheduledTimer = null;

function scheduleCleanup(intervalMs = 60 * 60 * 1000) {
  cleanupExpiredFiles();
  if (!scheduledTimer) {
    scheduledTimer = setInterval(cleanupExpiredFiles, intervalMs);
    if (scheduledTimer.unref) scheduledTimer.unref();
  }
}

module.exports = {
  cleanupExpiredFiles,
  scheduleCleanup,
};
