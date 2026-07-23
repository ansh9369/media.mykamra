// Replace this with a real call to your backend, e.g.:
//
//   const res = await fetch('/api/probe', {
//     method: 'POST',
//     body: JSON.stringify({ url }),
//   });
//   const json = await res.json();
//   return json.data;
//
// Shape returned matches your extractor's real response:
// { success, data: { type, id, title, uploader, duration, thumbnail,
//   viewCount, uploadDate, availableQualityPresets, formats: [...] } }

export function mockProbe(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!url.includes('.')) {
        reject(new Error('That doesn\u2019t look like a valid link.'));
        return;
      }
      resolve(sampleResponse.data);
    }, 1200);
  });
}

export const sampleResponse = {
  success: true,
  data: {
    type: 'video',
    id: 'XOboQNife1w',
    title: 'Sample video title, used to preview the layout',
    uploader: 'NDTV India',
    duration: 1914,
    thumbnail: 'https://i.ytimg.com/vi/XOboQNife1w/maxresdefault.jpg',
    viewCount: 203325,
    uploadDate: '20260530',
    availableQualityPresets: [
      'best', 'worst', '2160p', '1440p', '1080p', '720p', '480p', '360p', 'audio',
    ],
    formats: [
      { formatId: '139', ext: 'm4a', resolution: 'audio only', fps: null, hasVideo: false, hasAudio: true, playableAsIs: false, filesizeApprox: 11671659, note: 'low', downloadUrl: '#' },
      { formatId: '249', ext: 'webm', resolution: 'audio only', fps: null, hasVideo: false, hasAudio: true, playableAsIs: false, filesizeApprox: 12101748, note: 'low', downloadUrl: '#' },
      { formatId: '140', ext: 'm4a', resolution: 'audio only', fps: null, hasVideo: false, hasAudio: true, playableAsIs: false, filesizeApprox: 30974452, note: 'medium', downloadUrl: '#' },
      { formatId: '251', ext: 'webm', resolution: 'audio only', fps: null, hasVideo: false, hasAudio: true, playableAsIs: false, filesizeApprox: 28650702, note: 'medium', downloadUrl: '#' },
      { formatId: '137', ext: 'mp4', resolution: '1080p', fps: 25, hasVideo: true, hasAudio: false, playableAsIs: false, filesizeApprox: 256538119, note: '1080p', downloadUrl: '#' },
      { formatId: '248', ext: 'webm', resolution: '1080p', fps: 25, hasVideo: true, hasAudio: false, playableAsIs: false, filesizeApprox: 193904280, note: '1080p', downloadUrl: '#' },
      { formatId: '136', ext: 'mp4', resolution: '720p', fps: 25, hasVideo: true, hasAudio: false, playableAsIs: false, filesizeApprox: 83960340, note: '720p', downloadUrl: '#' },
      { formatId: '247', ext: 'webm', resolution: '720p', fps: 25, hasVideo: true, hasAudio: false, playableAsIs: false, filesizeApprox: 114330325, note: '720p', downloadUrl: '#' },
      { formatId: '135', ext: 'mp4', resolution: '480p', fps: 25, hasVideo: true, hasAudio: false, playableAsIs: false, filesizeApprox: 56943568, note: '480p', downloadUrl: '#' },
      { formatId: '244', ext: 'webm', resolution: '480p', fps: 25, hasVideo: true, hasAudio: false, playableAsIs: false, filesizeApprox: 69224567, note: '480p', downloadUrl: '#' },
      { formatId: '18', ext: 'mp4', resolution: '360p', fps: 25, hasVideo: true, hasAudio: true, playableAsIs: true, filesizeApprox: 93259120, note: '360p', downloadUrl: '#' },
      { formatId: '134', ext: 'mp4', resolution: '360p', fps: 25, hasVideo: true, hasAudio: false, playableAsIs: false, filesizeApprox: 32936602, note: '360p', downloadUrl: '#' },
      { formatId: '133', ext: 'mp4', resolution: '240p', fps: 25, hasVideo: true, hasAudio: false, playableAsIs: false, filesizeApprox: 16497574, note: '240p', downloadUrl: '#' },
      { formatId: '160', ext: 'mp4', resolution: '144p', fps: 25, hasVideo: true, hasAudio: false, playableAsIs: false, filesizeApprox: 8620069, note: '144p', downloadUrl: '#' },
    ],
  },
};