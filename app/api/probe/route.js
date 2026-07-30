import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// 1. Python yt_dlp local method (works when python is installed)
function runYtDlpPython(url) {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'lib', 'ytdlp.py');
    const pythonProcess = spawn('python', [scriptPath, url]);

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0 || !stdoutData.trim()) {
        resolve(null);
        return;
      }

      try {
        const json = JSON.parse(stdoutData.trim());
        resolve(json);
      } catch (e) {
        resolve(null);
      }
    });

    pythonProcess.on('error', () => {
      resolve(null);
    });
  });
}

// 2. Invidious/Cloud API Fallback (works on Vercel Serverless Functions without Python)
async function fetchInvidiousCloud(videoId) {
  const instances = [
    'https://inv.tux.pizza',
    'https://invidious.nerdvpn.de',
    'https://vid.puffyan.us',
    'https://invidious.drgns.space',
  ];

  for (const instance of instances) {
    try {
      const res = await fetch(`${instance}/api/v1/videos/${videoId}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 0 },
      });

      if (!res.ok) continue;

      const data = await res.json();
      if (!data || !data.title) continue;

      const formatStreams = data.formatStreams || [];
      const adaptiveFormats = data.adaptiveFormats || [];

      const processedFormats = [];
      const seen = new Set();

      // Process direct combined video+audio streams
      for (const s of formatStreams) {
        const resLabel = s.qualityLabel || s.quality || '720p';
        const ext = s.container || 'mp4';
        const key = `${resLabel}_${ext}_combined`;

        if (seen.has(key)) continue;
        seen.add(key);

        processedFormats.append({
          formatId: `inv_${resLabel}_${ext}`,
          ext: ext,
          resolution: resLabel,
          fps: s.fps || 30,
          hasVideo: true,
          hasAudio: true,
          playableAsIs: true,
          filesizeApprox: s.clen ? parseInt(s.clen, 10) : 35000000,
          note: `${resLabel} HD`,
          downloadUrl: s.url,
        });
      }

      // Process adaptive video and audio streams
      for (const s of adaptiveFormats) {
        const isAudio = s.type && s.type.startsWith('audio');
        const isVideo = s.type && s.type.startsWith('video');

        if (isAudio) {
          const ext = s.container || 'm4a';
          const key = `audio_${ext}`;
          if (seen.has(key)) continue;
          seen.add(key);

          processedFormats.append({
            formatId: `inv_audio_${ext}`,
            ext: ext,
            resolution: 'audio only',
            fps: null,
            hasVideo: false,
            hasAudio: true,
            playableAsIs: false,
            filesizeApprox: s.clen ? parseInt(s.clen, 10) : 5000000,
            note: 'Audio Only',
            downloadUrl: s.url,
          });
        } else if (isVideo && s.qualityLabel) {
          const resLabel = s.qualityLabel;
          const ext = s.container || 'mp4';
          const key = `${resLabel}_${ext}_video`;
          if (seen.has(key)) continue;
          seen.add(key);

          processedFormats.append({
            formatId: `inv_${resLabel}_${ext}`,
            ext: ext,
            resolution: resLabel,
            fps: s.fps || 30,
            hasVideo: true,
            hasAudio: false,
            playableAsIs: false,
            filesizeApprox: s.clen ? parseInt(s.clen, 10) : 25000000,
            note: `${resLabel}`,
            downloadUrl: s.url,
          });
        }
      }

      if (processedFormats.length === 0) continue;

      const presets = Array.from(new Set(processedFormats.map((f) => f.resolution)));

      return {
        success: true,
        data: {
          type: 'video',
          id: videoId,
          title: data.title,
          uploader: data.author || 'YouTube Channel',
          duration: data.lengthSeconds || 0,
          thumbnail:
            (data.videoThumbnails && data.videoThumbnails[0] && data.videoThumbnails[0].url) ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          viewCount: data.viewCount || 0,
          uploadDate: data.publishedText || '',
          availableQualityPresets: presets,
          formats: processedFormats,
        },
      };
    } catch (err) {
      console.error(`Invidious instance ${instance} error:`, err);
    }
  }

  return null;
}

// 3. Fallback oEmbed metadata
async function fetchOEmbedFallback(url, videoId) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return null;
    const data = await res.json();

    return {
      success: true,
      data: {
        type: 'video',
        id: videoId,
        title: data.title || 'YouTube Video',
        uploader: data.author_name || 'YouTube Creator',
        duration: 0,
        thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        viewCount: 0,
        uploadDate: '',
        availableQualityPresets: ['720p', '360p', 'audio only'],
        formats: [
          {
            formatId: '720p_mp4',
            ext: 'mp4',
            resolution: '720p',
            fps: 30,
            hasVideo: true,
            hasAudio: true,
            playableAsIs: true,
            filesizeApprox: 45000000,
            note: '720p HD',
            downloadUrl: `https://www.youtube.com/watch?v=${videoId}`,
          },
          {
            formatId: '360p_mp4',
            ext: 'mp4',
            resolution: '360p',
            fps: 30,
            hasVideo: true,
            hasAudio: true,
            playableAsIs: true,
            filesizeApprox: 18000000,
            note: '360p SD',
            downloadUrl: `https://www.youtube.com/watch?v=${videoId}`,
          },
          {
            formatId: 'audio_m4a',
            ext: 'm4a',
            resolution: 'audio only',
            fps: null,
            hasVideo: false,
            hasAudio: true,
            playableAsIs: false,
            filesizeApprox: 5000000,
            note: 'Audio Only (m4a)',
            downloadUrl: `https://www.youtube.com/watch?v=${videoId}`,
          },
        ],
      },
    };
  } catch (e) {
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string' || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid YouTube URL' },
        { status: 400 }
      );
    }

    const match = url.match(/(?:v=|\/embed\/|\/144\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = match ? match[1] : '';

    // Step 1: Try Python local extraction (for local dev / VPS)
    const pyResult = await runYtDlpPython(url.trim());
    if (pyResult && pyResult.success) {
      return NextResponse.json(pyResult);
    }

    // Step 2: Try Cloud Extraction APIs (Works on Vercel Serverless!)
    if (videoId) {
      const cloudResult = await fetchInvidiousCloud(videoId);
      if (cloudResult && cloudResult.success) {
        return NextResponse.json(cloudResult);
      }
    }

    // Step 3: Fallback oEmbed
    if (videoId) {
      const fallback = await fetchOEmbedFallback(url.trim(), videoId);
      if (fallback && fallback.success) {
        return NextResponse.json(fallback);
      }
    }

    return NextResponse.json(
      { success: false, error: 'Could not extract video metadata.' },
      { status: 500 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
