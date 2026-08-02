const path = require('path');
const fs = require('fs-extra');
const config = require('../config/media.config');
const mediaService = require('../services/media.service');
const { infoSchema, downloadSchema } = require('../validations/media.validation');

async function getInfo(url) {
  if (!config.enabled) {
    throw new Error('Media service is currently disabled.');
  }

  const validated = infoSchema.parse({ url });
  const data = await mediaService.getInfo(validated.url);
  return { success: true, data };
}

async function createDownload(url, quality = 'best') {
  if (!config.enabled) {
    throw new Error('Media service is currently disabled.');
  }

  const validated = downloadSchema.parse({ url, quality });
  const jobId = await mediaService.startDownloadJob(validated.url, validated.quality);

  return {
    success: true,
    data: {
      jobId,
      statusUrl: `/api/media/status?jobId=${jobId}`,
    },
  };
}

async function getDownloadStatus(jobId) {
  if (!jobId) {
    throw new Error('jobId parameter is required');
  }

  const job = mediaService.getJobStatus(jobId);
  if (!job) {
    return {
      success: false,
      error: 'Job not found',
    };
  }

  const response = {
    jobId: job.id,
    state: job.state,
    progress: job.progress,
  };

  if (job.state === 'completed') {
    response.fileName = job.fileName;
    response.fileUrl = `/api/media/files?jobId=${job.id}`;
  } else if (job.state === 'failed') {
    response.error = job.error;
  }

  return { success: true, data: response };
}

async function getFilePath(jobId) {
  if (!jobId || !/^[0-9a-f-]{36}$/i.test(jobId)) {
    throw new Error('Invalid or missing jobId');
  }

  const job = mediaService.getJobStatus(jobId);
  if (!job) {
    throw new Error('Download job not found');
  }

  if (job.state !== 'completed') {
    throw new Error(`File is not ready (current state: ${job.state})`);
  }

  const exists = await fs.pathExists(job.filePath);
  if (!exists) {
    throw new Error('File has expired or was removed');
  }

  return {
    filePath: job.filePath,
    fileName: job.fileName,
  };
}

module.exports = {
  getInfo,
  createDownload,
  getDownloadStatus,
  getFilePath,
};
