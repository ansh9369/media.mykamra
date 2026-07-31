import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let targetUrl = searchParams.get('url');
  const title = searchParams.get('title') || 'media';
  const ext = searchParams.get('ext') || 'mp4';
  const videoId = searchParams.get('videoId') || '';
  const resolution = searchParams.get('resolution') || '';

  const isAudioOnly = resolution.toLowerCase().includes('audio') || ext === 'm4a' || ext === 'mp3';
  let vid = videoId;
  if (!vid && targetUrl) {
    try {
      vid = ytdl.getURLVideoID(targetUrl);
    } catch {
      vid = '6-60kFPNa6U';
    }
  }
  if (!vid) vid = '6-60kFPNa6U';

  // 1. High-Speed Node.js Stream Extraction via @distube/ytdl-core
  try {
    const ytUrl = `https://www.youtube.com/watch?v=${vid}`;
    const info = await ytdl.getInfo(ytUrl, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    });

    let selectedFormat;
    if (isAudioOnly) {
      selectedFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' }) ||
                       ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    } else {
      selectedFormat = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' }) ||
                       ytdl.chooseFormat(info.formats, { quality: 'highest' });
    }

    if (selectedFormat && selectedFormat.url) {
      return NextResponse.redirect(selectedFormat.url);
    }
  } catch (err) {
    console.error('Node ytdl-core extraction error:', err.message);
  }

  // 2. Fallback to Python Backend if configured
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';
  const renderDownloadUrl = `${BACKEND_URL.replace(/\/$/, '')}/api/download?videoId=${encodeURIComponent(vid)}&resolution=${encodeURIComponent(resolution)}`;
  return NextResponse.redirect(renderDownloadUrl);
}
