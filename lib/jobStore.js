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
  const targetStreamUrl = downloadUrl || '';

  const fileUrl = `/api/download?url=${encodeURIComponent(targetStreamUrl)}&title=${encodeURIComponent(cleanTitle)}&ext=${fileExt}&videoId=${encodeURIComponent(videoId || '')}&resolution=${encodeURIComponent(resolution || '')}`;

  const job = {
    jobId,
    url: url || '',
    videoId: videoId || '',
    resolution: resolution || '720p',
    preset: preset || '',
    formatId: formatId || '',
    title: cleanTitle,
    ext: fileExt,
    downloadUrl: targetStreamUrl,
    status: 'completed',
    progress: 100,
    stage: 'Media ready for download',
    fileUrl,
    createdAt: Date.now(),
    error: null,
  };

  globalJobStore.set(jobId, job);
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
