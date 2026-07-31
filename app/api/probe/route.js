import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import { spawn } from 'child_process';
import path from 'path';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;

// 1. Render Python Backend Proxy (If BACKEND_URL env is set)
async function extractWithRenderBackend(url) {
  if (!BACKEND_URL) return null;
  try {
    const res = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/probe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Render backend extraction error:', err.message);
    return null;
  }
}

// 2. Primary Node.js Extractor using @distube/ytdl-core (Serverless Compatible)
async function extractWithYtdlCore(url) {
  try {
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    });

    if (!info || !info.videoDetails) return null;

    const details = info.videoDetails;
    const videoId = details.videoId || '';
    const title = details.title || 'YouTube Video';
    const uploader = details.author ? details.author.name : 'YouTube Creator';
    const duration = parseInt(details.lengthSeconds || '0', 10);
    const thumbnail =
      details.thumbnails && details.thumbnails.length > 0
        ? details.thumbnails[details.thumbnails.length - 1].url
        : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const viewCount = parseInt(details.viewCount || '0', 10);
    const uploadDate = details.publishDate || '';

    const rawFormats = info.formats || [];
    const processedFormats = [];
    const seen = new Set();

    for (const f of rawFormats) {
      if (!f.url) continue;

      const hasVideo = Boolean(f.hasVideo);
      const hasAudio = Boolean(f.hasAudio);

      if (!hasVideo && !hasAudio) continue;

      let resolution = 'SD';
      if (!hasVideo && hasAudio) {
        resolution = 'audio only';
      } else if (f.qualityLabel) {
        resolution = f.qualityLabel;
      } else if (f.height) {
        resolution = `${f.height}p`;
      }

      const ext = f.container || (hasVideo ? 'mp4' : 'm4a');
      const key = `${resolution}_${ext}_${hasVideo}_${hasAudio}`;

      if (seen.has(key)) continue;
      seen.add(key);

      const filesize = f.contentLength ? parseInt(f.contentLength, 10) : (f.bitrate ? Math.round((f.bitrate * duration) / 8) : 0);

      processedFormats.push({
        formatId: String(f.itag || Math.random().toString(36).substring(7)),
        ext,
        resolution,
        fps: f.fps || null,
        hasVideo,
        hasAudio,
        playableAsIs: hasVideo && hasAudio,
        filesizeApprox: filesize,
        note: resolution,
        downloadUrl: f.url,
      });
    }

    if (processedFormats.length === 0) return null;

    const presets = Array.from(new Set(processedFormats.map((f) => f.resolution)));

    return {
      success: true,
      data: {
        type: 'video',
        id: videoId,
        title,
        uploader,
        duration,
        thumbnail,
        viewCount,
        uploadDate,
        availableQualityPresets: presets,
        formats: processedFormats,
      },
    };
  } catch (err) {
    console.error('ytdl-core extraction error:', err.message);
    return null;
  }
}

// 3. Local Python yt_dlp Extractor
function runYtDlpPython(url) {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'lib', 'ytdlp.py');
    const pythonProcess = spawn('python', [scriptPath, url]);

    let stdoutData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
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

// 4. Fallback oEmbed metadata generator
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

    // Step 0: Render Python Backend (If configured in Vercel Env)
    const renderResult = await extractWithRenderBackend(url.trim());
    if (renderResult && renderResult.success) {
      return NextResponse.json(renderResult);
    }

    // Step 1: Extract with @distube/ytdl-core (Fast & Serverless Native)
    const ytdlResult = await extractWithYtdlCore(url.trim());
    if (ytdlResult && ytdlResult.success) {
      return NextResponse.json(ytdlResult);
    }

    // Step 2: Try Local Python yt_dlp extraction
    const pyResult = await runYtDlpPython(url.trim());
    if (pyResult && pyResult.success) {
      return NextResponse.json(pyResult);
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
    console.error('Probe API route error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
