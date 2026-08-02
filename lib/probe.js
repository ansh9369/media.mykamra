export async function probeVideo(url) {
  return fetchVideoInfo(url);
}

export async function fetchVideoInfo(url) {
  try {
    const res = await fetch('/api/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Unable to fetch downloadable media');
    }

    return json.data;
  } catch (err) {
    throw new Error(err.message || 'Unable to fetch downloadable media');
  }
}

export async function createDownloadJob(options) {
  const { url, videoId, resolution, preset, formatId, title, ext, downloadUrl } = options;

  try {
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        videoId,
        resolution,
        preset,
        formatId,
        title,
        ext,
        downloadUrl,
      }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to create download job');
    }

    return json.data;
  } catch (err) {
    throw new Error(err.message || 'Failed to create download job');
  }
}

export async function pollDownloadJobStatus(jobId, onProgress, intervalMs = 600) {
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/download/${jobId}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          clearInterval(intervalId);
          return reject(new Error(json.error || 'Job status error'));
        }

        const data = json.data;
        if (onProgress && typeof onProgress === 'function') {
          onProgress(data);
        }

        if (data.status === 'completed') {
          clearInterval(intervalId);
          return resolve(data);
        }

        if (data.status === 'failed') {
          clearInterval(intervalId);
          return reject(new Error(data.error || 'Download job failed'));
        }
      } catch (err) {
        clearInterval(intervalId);
        return reject(err);
      }
    }, intervalMs);
  });
}

export function getDownloadFileUrl(jobId) {
  return `/api/files/${jobId}`;
}
