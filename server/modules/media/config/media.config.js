const path = require('path');

const config = {
  enabled: process.env.MEDIA_API_ENABLED !== 'false',
  tempPath: process.env.MEDIA_TEMP_PATH || '/tmp/media',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  fileRetentionHours: parseInt(process.env.FILE_RETENTION_HOURS || '6', 10),
  maxConcurrentDownloads: parseInt(process.env.MAX_CONCURRENT_DOWNLOADS || '2', 10),
  maxPlaylistEntries: parseInt(process.env.MAX_PLAYLIST_ENTRIES || '50', 10),
  ytDlpPath: process.env.YT_DLP_PATH || 'yt-dlp',
  ytDlpCookiesFile: process.env.YT_DLP_COOKIES_FILE || '',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '20', 10),
  },
};

module.exports = config;
