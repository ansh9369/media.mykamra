const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/media.config');
const { resolveFormatSelector } = require('../validations/media.validation');

// In-memory job store for job tracking and status querying
const jobsStore = new Map();

function buildYtDlpArgs(extraArgs = []) {
  const args = [];
  if (config.ytDlpCookiesFile) {
    args.push('--cookies', config.ytDlpCookiesFile);
  }
  return [...args, ...extraArgs];
}

async function getInfo(url) {
  return new Promise((resolve, reject) => {
    const args = buildYtDlpArgs([
      '--dump-single-json',
      '--flat-playlist',
      '--no-warnings',
      '--quiet',
      url,
    ]);

    const proc = spawn(config.ytDlpPath, args);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (chunk) => {
      stdout += chunk;
    });

    proc.stderr.on('data', (chunk) => {
      stderr += chunk;
    });

    proc.on('error', (err) => {
      if (err.code === 'ENOENT') {
        return reject(
          new Error(
            `yt-dlp executable not found at "${config.ytDlpPath}". Ensure yt-dlp is installed and added to PATH.`
          )
        );
      }
      reject(err);
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`yt-dlp info failed: ${stderr || 'Unknown error'}`));
      }

      try {
        const raw = JSON.parse(stdout);

        if (raw._type === 'playlist') {
          const rawEntries = raw.entries || [];
          const capped = rawEntries.slice(0, config.maxPlaylistEntries);

          return resolve({
            type: 'playlist',
            id: raw.id || '',
            title: raw.title || 'Playlist',
            entryCount: rawEntries.length,
            truncated: rawEntries.length > config.maxPlaylistEntries,
            entries: capped.map((e, idx) => ({
              index: idx + 1,
              id: e.id,
              title: e.title,
              url: e.url || `https://www.youtube.com/watch?v=${e.id}`,
              duration: e.duration || 0,
            })),
          });
        }

        const presets = new Set();
        const formats = (raw.formats || [])
          .filter((f) => f.url && f.url.startsWith('http'))
          .map((f) => {
            const hasVideo = f.vcodec !== 'none' && f.vcodec != null;
            const hasAudio = f.acodec !== 'none' && f.acodec != null;
            let resolution = 'audio';

            if (hasVideo) {
              resolution = f.height ? `${f.height}p` : 'SD';
            }

            presets.add(resolution);

            return {
              formatId: String(f.format_id),
              ext: f.ext,
              resolution,
              fps: f.fps || null,
              hasVideo,
              hasAudio,
              playableAsIs: hasVideo && hasAudio,
              filesizeApprox: f.filesize || f.filesize_approx || 0,
              note: f.format_note || null,
            };
          });

        const presetList = [
          'best',
          'worst',
          ...Array.from(presets).sort((a, b) => parseInt(b) - parseInt(a)),
        ];

        return resolve({
          type: 'video',
          id: raw.id,
          title: raw.title,
          uploader: raw.uploader || raw.channel || '',
          duration: raw.duration || 0,
          thumbnail: raw.thumbnail || (raw.id ? `https://i.ytimg.com/vi/${raw.id}/hqdefault.jpg` : ''),
          viewCount: raw.view_count || 0,
          uploadDate: raw.upload_date || '',
          availableQualityPresets: presetList,
          formats,
        });
      } catch (parseErr) {
        reject(new Error(`Failed to parse yt-dlp JSON output: ${parseErr.message}`));
      }
    });
  });
}

async function startDownloadJob(url, quality) {
  const jobId = uuidv4();
  await fs.ensureDir(config.tempPath);

  const jobState = {
    id: jobId,
    url,
    quality,
    state: 'waiting', // waiting | active | completed | failed
    progress: 0,
    fileName: null,
    filePath: null,
    error: null,
    createdAt: Date.now(),
  };

  jobsStore.set(jobId, jobState);

  // Process asynchronously
  processJob(jobState).catch((err) => {
    jobState.state = 'failed';
    jobState.error = err.message || 'Download execution failed';
  });

  return jobId;
}

async function processJob(jobState) {
  jobState.state = 'active';
  jobState.progress = 5;

  const outputTemplate = path.join(config.tempPath, `${jobState.id}_%(title)s.%(ext)s`);
  const formatSelector = resolveFormatSelector(jobState.quality);

  const args = buildYtDlpArgs([
    '--format',
    formatSelector,
    '--output',
    outputTemplate,
    '--newline',
    '--no-playlist',
    '--no-warnings',
    jobState.url,
  ]);

  return new Promise((resolve, reject) => {
    const proc = spawn(config.ytDlpPath, args);

    proc.stdout.on('data', (data) => {
      const line = data.toString();
      const match = line.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
      if (match) {
        const pct = parseFloat(match[1]);
        jobState.progress = Math.min(99, Math.max(jobState.progress, pct));
      }
    });

    proc.stderr.on('data', (data) => {
      console.error(`[MEDIA SERVICE DEBUG ${jobState.id}]`, data.toString().trim());
    });

    proc.on('error', (err) => {
      jobState.state = 'failed';
      jobState.error = err.message;
      reject(err);
    });

    proc.on('close', async (code) => {
      if (code !== 0) {
        jobState.state = 'failed';
        jobState.error = `yt-dlp process exited with code ${code}`;
        return reject(new Error(jobState.error));
      }

      try {
        const files = await fs.readdir(config.tempPath);
        const downloadedFile = files.find((f) => f.startsWith(jobState.id));

        if (!downloadedFile) {
          jobState.state = 'failed';
          jobState.error = 'Downloaded file not found on disk';
          return reject(new Error(jobState.error));
        }

        const fullPath = path.join(config.tempPath, downloadedFile);
        const cleanName = downloadedFile.replace(`${jobState.id}_`, '');

        jobState.state = 'completed';
        jobState.progress = 100;
        jobState.fileName = cleanName;
        jobState.filePath = fullPath;

        resolve(jobState);
      } catch (err) {
        jobState.state = 'failed';
        jobState.error = err.message;
        reject(err);
      }
    });
  });
}

function getJobStatus(jobId) {
  return jobsStore.get(jobId) || null;
}

module.exports = {
  getInfo,
  startDownloadJob,
  getJobStatus,
  jobsStore,
};
