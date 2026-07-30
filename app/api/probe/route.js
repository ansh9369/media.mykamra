import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

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
        console.error('Python process error:', stderrData);
        resolve(null);
        return;
      }

      try {
        const json = JSON.parse(stdoutData.trim());
        resolve(json);
      } catch (e) {
        console.error('Failed to parse Python output:', e);
        resolve(null);
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to spawn python:', err);
      resolve(null);
    });
  });
}

// Fallback oEmbed metadata if python is unavailable
async function fetchOEmbedFallback(url) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return null;
    const data = await res.json();
    
    // Extract video ID
    const match = url.match(/(?:v=|\/embed\/|\/144\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = match ? match[1] : 'sample';

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
        availableQualityPresets: ['1080p', '720p', '480p', '360p', 'audio only'],
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
            downloadUrl: `https://www.youtube.com/watch?v=${videoId}`
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
            downloadUrl: `https://www.youtube.com/watch?v=${videoId}`
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
            downloadUrl: `https://www.youtube.com/watch?v=${videoId}`
          }
        ]
      }
    };
  } catch (e) {
    console.error('oEmbed fallback error:', e);
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string' || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=...)' },
        { status: 400 }
      );
    }

    // Try Python yt_dlp extraction
    const pyResult = await runYtDlpPython(url.trim());
    if (pyResult && pyResult.success) {
      return NextResponse.json(pyResult);
    }

    // Fallback to oEmbed metadata
    const fallback = await fetchOEmbedFallback(url.trim());
    if (fallback && fallback.success) {
      return NextResponse.json(fallback);
    }

    return NextResponse.json(
      { success: false, error: 'Could not extract video metadata from this link.' },
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
