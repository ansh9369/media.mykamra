import { v4 as uuidv4 } from 'crypto';

// Global memory cache for download jobs across hot-reloads
const globalJobStore = globalThis.__MYKAMRA_JOB_STORE__ || new Map();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__MYKAMRA_JOB_STORE__ = globalJobStore;
}

export function createDownloadJob({ url, videoId, resolution, preset, formatId, title, ext, downloadUrl }) {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const cleanTitle = (title || 'media').replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'media';
  const fileExt = ext || 'mp4';

  const job = {
    jobId,
    url: url || '',
    videoId: videoId || '',
    resolution: resolution || '720p',
    preset: preset || '',
    formatId: formatId || '',
    title: cleanTitle,
    ext: fileExt,
    downloadUrl: downloadUrl || '',
    status: 'queued', // queued | downloading | processing | completed | failed
    progress: 0,
    stage: 'Initializing download queue...',
    fileUrl: `/api/files/${jobId}`,
    createdAt: Date.now(),
    error: null,
  };

  globalJobStore.set(jobId, job);

  // Background processing runner
  startJobProcessing(jobId);

  return job;
}

export function getDownloadJob(jobId) {
  return globalJobStore.get(jobId) || null;
}

export function updateDownloadJob(jobId, updates) {
  const job = globalJobStore.get(jobId);
  if (!job) return null;
  const updated = { ...job, ...updates };
  globalJobStore.set(jobId, updated);
  return updated;
}

function startJobProcessing(jobId) {
  const job = globalJobStore.get(jobId);
  if (!job) return;

  // Step 1: Queued -> Downloading
  setTimeout(() => {
    updateDownloadJob(jobId, {
      status: 'downloading',
      progress: 25,
      stage: 'Fetching media stream from source...',
    });
  }, 400);

  // Step 2: Downloading Progress
  setTimeout(() => {
    updateDownloadJob(jobId, {
      status: 'downloading',
      progress: 65,
      stage: 'Buffer streams and preparing file headers...',
    });
  }, 1200);

  // Step 3: Processing
  setTimeout(() => {
    updateDownloadJob(jobId, {
      status: 'processing',
      progress: 90,
      stage: 'Finalizing file stream...',
    });
  }, 2000);

  // Step 4: Completed
  setTimeout(() => {
    updateDownloadJob(jobId, {
      status: 'completed',
      progress: 100,
      stage: 'Media stream ready for download',
      fileUrl: `/api/files/${jobId}`,
    });
  }, 2800);
}
