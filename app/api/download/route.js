import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

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

// Local Python yt-dlp Extractor for expired URL resolution
function runYtDlpLocalStream(videoId, isAudio) {
  return new Promise((resolve) => {
    try {
      const pyProcess = spawn('python', ['-c', `
import yt_dlp, sys

vid = sys.argv[1].strip()
is_audio = sys.argv[2].lower() == 'true'

ydl_opts = {
    'quiet': True,
    'no_warnings': True,
    'skip_download': True,
    'nocheckcertificate': True,
    'geo_bypass': True,
    'socket_timeout': 20,
    'extractor_args': {
        'youtube': {
            'player_client': ['android', 'web']
        }
    },
    'http_headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.youtube.com/',
    }
}

try:
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(f"https://www.youtube.com/watch?v={vid}", download=False)
        if info and info.get('formats'):
            raw_formats = info.get('formats', [])
            for f in raw_formats:
                url_fmt = f.get('url', '')
                if not url_fmt or not url_fmt.startswith('http'): continue
                vcodec = f.get('vcodec', 'none')
                acodec = f.get('acodec', 'none')
                has_video = vcodec != 'none' and vcodec is not None
                has_audio = acodec != 'none' and acodec is not None
                if is_audio and has_audio:
                    print(url_fmt)
                    sys.exit(0)
                if not is_audio and has_video:
                    print(url_fmt)
                    sys.exit(0)
            for f in raw_formats:
                url_fmt = f.get('url', '')
                if url_fmt and url_fmt.startswith('http'):
                    print(url_fmt)
                    sys.exit(0)
except Exception:
    pass

print("")
      `, videoId, String(isAudio)], { cwd: process.cwd() });

      let stdout = '';
      const timer = setTimeout(() => {
        pyProcess.kill();
        resolve('');
      }, 20000);

      pyProcess.stdout.on('data', (data) => { stdout += data.toString(); });
      pyProcess.on('error', () => {
        clearTimeout(timer);
        resolve('');
      });
      pyProcess.on('close', (code) => {
        clearTimeout(timer);
        resolve(stdout.trim());
      });
    } catch {
      resolve('');
    }
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = (searchParams.get('url') || '').trim();
  const title = searchParams.get('title') || 'media';
  const ext = searchParams.get('ext') || 'mp4';
  const videoId = searchParams.get('videoId') || searchParams.get('videoid') || extractVideoId(targetUrl);
  const resolution = searchParams.get('resolution') || '';
  const isAudioOnly = resolution.toLowerCase().includes('audio') || ext === 'mp3' || ext === 'm4a';

  console.log(`[DOWNLOAD API GET] Video ID: ${videoId} | Resolution: ${resolution} | Target URL Present: ${Boolean(targetUrl)}`);

  // 1. Direct Googlevideo Proxy (If stream URL is already resolved & fresh)
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

  // 3. Local Python Extractor Fallback for Expired URL Resolution
  if (videoId) {
    const localStreamUrl = await runYtDlpLocalStream(videoId, isAudioOnly);
    if (localStreamUrl) {
      const proxied = await proxyStreamResponse(localStreamUrl, title, ext);
      if (proxied) return proxied;
    }
  }

  console.error(`[DOWNLOAD API FAIL] Unable to fetch downloadable media for Video ID: ${videoId}`);
  return NextResponse.json(
    { success: false, stage: 'download', error: 'Unable to fetch downloadable media' },
    { status: 502 }
  );
}
