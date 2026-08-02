import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'https://media-mykamra-api.onrender.com';

function extractVideoId(url) {
  const match = url.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
}

// Binary Stream Proxy Function (Strictly Returns Native Attachment Stream)
async function proxyStreamResponse(streamUrl, filename, ext) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const upstreamRes = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': 'https://www.youtube.com/',
        'Origin': 'https://www.youtube.com',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (upstreamRes.ok && upstreamRes.body) {
      const cleanTitle = (filename || 'media').replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'media';
      const fileExt = ext || 'mp4';
      const finalFilename = `${cleanTitle}.${fileExt}`;

      const contentType = upstreamRes.headers.get('content-type') ||
        (fileExt === 'mp3' || fileExt === 'm4a' ? 'audio/mpeg' : 'video/mp4');
      const contentLength = upstreamRes.headers.get('content-length');

      const headers = new Headers({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${finalFilename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Accept-Ranges': 'bytes',
      });

      if (contentLength) {
        headers.set('Content-Length', contentLength);
      }

      console.log(`[PROXY STREAM SUCCESS] Streaming file attachment: ${finalFilename}`);
      return new Response(upstreamRes.body, {
        status: 200,
        headers,
      });
    } else {
      console.error(`[PROXY STREAM FAIL] Upstream Googlevideo returned status: ${upstreamRes.status}`);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`[PROXY STREAM EXCEPTION] ${streamUrl.slice(0, 80)}:`, err.message);
  }

  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = (searchParams.get('url') || '').trim();
  const title = searchParams.get('title') || 'media';
  const ext = searchParams.get('ext') || 'mp4';
  const videoId = searchParams.get('videoId') || searchParams.get('videoid') || extractVideoId(targetUrl);
  const resolution = searchParams.get('resolution') || '';

  console.log(`[DOWNLOAD API GET] Video ID: ${videoId} | Resolution: ${resolution} | Target URL Present: ${Boolean(targetUrl)}`);

  // 1. Direct Googlevideo Proxy (If stream URL is already resolved)
  if (targetUrl && (targetUrl.includes('googlevideo.com') || targetUrl.includes('.mp4') || targetUrl.includes('.m4a'))) {
    const proxied = await proxyStreamResponse(targetUrl, title, ext);
    if (proxied) return proxied;
  }

  // 2. Query Render Python Backend Proxy (/api/download)
  if (BACKEND_URL && videoId) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const bRes = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/download?videoId=${videoId}&resolution=${encodeURIComponent(resolution)}&filename=${encodeURIComponent(title)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (bRes.ok && bRes.body) {
        const contentType = bRes.headers.get('content-type') || (ext === 'mp3' || ext === 'm4a' ? 'audio/mpeg' : 'video/mp4');
        const contentLength = bRes.headers.get('content-length');
        const cleanTitle = (title || 'media').replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'media';
        const finalFilename = `${cleanTitle}.${ext}`;

        const headers = new Headers({
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${finalFilename}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Accept-Ranges': 'bytes',
        });
        if (contentLength) headers.set('Content-Length', contentLength);

        console.log(`[DOWNLOAD BACKEND PROXY SUCCESS] File: ${finalFilename}`);
        return new Response(bRes.body, {
          status: 200,
          headers,
        });
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error(`[DOWNLOAD BACKEND PROXY ERROR] Video ID ${videoId}:`, err.message);
    }
  }

  console.error(`[DOWNLOAD API FAIL] Unable to fetch downloadable media for Video ID: ${videoId}`);
  return NextResponse.json(
    { success: false, stage: 'download', error: 'Unable to fetch downloadable media' },
    { status: 502 }
  );
}
