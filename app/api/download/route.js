import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;

async function getConvertedDownloadUrl(videoId, resolution, isAudioOnly) {
  if (!videoId) return null;
  try {
    let formatKey = isAudioOnly ? 'mp3' : '720';
    if (resolution.includes('1080')) formatKey = '1080';
    else if (resolution.includes('480')) formatKey = '480';
    else if (resolution.includes('360')) formatKey = '360';
    else if (resolution.includes('1440')) formatKey = '1440';
    else if (resolution.includes('2160')) formatKey = '4k';

    const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const startRes = await fetch(`https://loader.to/api/ajax/download.php?format=${formatKey}&url=${encodeURIComponent(ytUrl)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (startRes.ok) {
      const startData = await startRes.json();
      if (startData && startData.id) {
        const jobId = startData.id;
        for (let attempt = 0; attempt < 8; attempt++) {
          await new Promise((r) => setTimeout(r, 800));
          const progRes = await fetch(`https://loader.to/api/ajax/progress.php?id=${jobId}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
          });
          if (progRes.ok) {
            const progData = await progRes.json();
            if (progData && progData.download_url) {
              return progData.download_url;
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('getConvertedDownloadUrl error:', e.message);
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let targetUrl = searchParams.get('url');
  const title = searchParams.get('title') || 'video';
  const ext = searchParams.get('ext') || 'mp4';
  const videoId = searchParams.get('videoId') || '';
  const resolution = searchParams.get('resolution') || '';

  const isAudioOnly = resolution.toLowerCase().includes('audio') || ext === 'm4a' || ext === 'mp3';
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || (isAudioOnly ? 'audio' : 'video');
  const filename = `${sanitizedTitle}.${ext}`;

  try {
    // 1. Delegate to Render Backend if configured (always reliable)
    if (BACKEND_URL) {
      const renderDownloadUrl = `${BACKEND_URL.replace(/\/$/, '')}/api/download?url=${encodeURIComponent(targetUrl || '')}&filename=${encodeURIComponent(filename)}&videoId=${encodeURIComponent(videoId)}&resolution=${encodeURIComponent(resolution)}`;
      return NextResponse.redirect(renderDownloadUrl);
    }

    // 2. High-Speed Conversion Engine if targetUrl is YouTube page or missing
    if (!targetUrl || targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be') || targetUrl === '#') {
      const convertedUrl = await getConvertedDownloadUrl(videoId, resolution, isAudioOnly);
      if (convertedUrl) {
        return NextResponse.redirect(convertedUrl);
      }
    }

    // 3. Try fetching targetUrl stream
    if (targetUrl && !targetUrl.includes('youtube.com') && !targetUrl.includes('youtu.be') && targetUrl !== '#') {
      const mediaRes = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (mediaRes.ok) {
        const headers = new Headers();
        const contentType =
          mediaRes.headers.get('content-type') ||
          (isAudioOnly ? 'audio/mp4' : 'video/mp4');

        headers.set('Content-Type', contentType);
        headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

        const contentLength = mediaRes.headers.get('content-length');
        if (contentLength) {
          headers.set('Content-Length', contentLength);
        }

        return new NextResponse(mediaRes.body, { status: 200, headers });
      }
    }

    // 4. Fallback conversion engine
    const fallbackConvertedUrl = await getConvertedDownloadUrl(videoId, resolution, isAudioOnly);
    if (fallbackConvertedUrl) {
      return NextResponse.redirect(fallbackConvertedUrl);
    }

    // Never redirect to youtube.com; return clean JSON error instead
    return NextResponse.json(
      { error: 'Media stream unavailable. Please check the video link and try again.' },
      { status: 500 }
    );
  } catch (err) {
    console.error('Download route error:', err);
    return NextResponse.json(
      { error: 'Failed to process media download request.' },
      { status: 500 }
    );
  }
}
