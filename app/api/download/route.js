import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export const maxDuration = 10;
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'https://media-mykamra-api.onrender.com';

async function getY2MateStreamUrl(vid, isAudioOnly) {
  try {
    const res = await fetch('https://www.y2mate.com/mates/analyzeV2/ajax', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: `url=${encodeURIComponent('https://www.youtube.com/watch?v=' + vid)}&q_auto=0&ajax=1`,
      next: { revalidate: 0 },
    });
    const data = await res.json();
    const targetGroup = isAudioOnly ? (data?.links?.mp3 || data?.links?.mp4) : (data?.links?.mp4 || data?.links?.mp3);

    if (targetGroup) {
      const keys = Object.keys(targetGroup);
      if (keys.length > 0) {
        const kVal = targetGroup[keys[0]]?.k;
        if (kVal) {
          const cRes = await fetch('https://www.y2mate.com/mates/convertV2/index', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            body: `vid=${encodeURIComponent(vid)}&k=${encodeURIComponent(kVal)}`,
            next: { revalidate: 0 },
          });
          const cData = await cRes.json();
          if (cData?.dlink) {
            return cData.dlink;
          }
        }
      }
    }
  } catch (err) {
    console.error('getY2MateStreamUrl error:', err.message);
  }
  return null;
}

async function proxyMediaStream(streamUrl, title, ext) {
  try {
    const res = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
      },
    });

    if (res.ok && res.body) {
      const cleanTitle = (title || 'video').replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'video';
      const fileExt = ext || 'mp4';
      const filename = `${cleanTitle}.${fileExt}`;
      const contentType = res.headers.get('content-type') || (fileExt === 'mp3' || fileExt === 'm4a' ? 'audio/mpeg' : 'video/mp4');

      return new Response(res.body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache',
        },
      });
    }
  } catch (err) {
    console.error('proxyMediaStream error:', err.message);
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let targetUrl = searchParams.get('url') || '';
  const title = searchParams.get('title') || 'media';
  const ext = searchParams.get('ext') || 'mp4';
  const videoId = searchParams.get('videoId') || searchParams.get('videoid') || '';
  const resolution = searchParams.get('resolution') || '';

  // 0. If targetUrl is already a resolved googlevideo/media CDN URL, proxy stream directly to trigger file download!
  if (targetUrl && (targetUrl.includes('googlevideo.com') || targetUrl.includes('.mp4') || targetUrl.includes('.m4a'))) {
    const proxied = await proxyMediaStream(targetUrl, title, ext);
    if (proxied) return proxied;
    return NextResponse.redirect(targetUrl);
  }

  const isAudioOnly = resolution.toLowerCase().includes('audio');
  let vid = videoId;
  if (!vid && targetUrl) {
    try {
      const match = targetUrl.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match) vid = match[1];
    } catch {
      vid = '';
    }
  }

  // 1. Python Render Backend Proxy (If BACKEND_URL environment variable is configured)
  if (BACKEND_URL && !BACKEND_URL.includes('localhost') && vid) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const bRes = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/download?videoId=${vid}&resolution=${resolution}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (bRes.ok && bRes.url && !bRes.url.includes('youtube.com/watch')) {
        const proxied = await proxyMediaStream(bRes.url, title, ext);
        if (proxied) return proxied;
      }
    } catch (err) {
      console.error('Backend download proxy error:', err.message);
    }
  }

  // 2. High-Speed Node.js Stream Extraction via @distube/ytdl-core (3.5s strict timeout)
  if (vid) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('YTDL_TIMEOUT')), 3500)
      );

      const ytUrl = `https://www.youtube.com/watch?v=${vid}`;
      const infoPromise = ytdl.getInfo(ytUrl, {
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        },
      });

      const info = await Promise.race([infoPromise, timeoutPromise]);

      let selectedFormat;
      if (isAudioOnly) {
        selectedFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' }) ||
                         ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
      } else {
        selectedFormat = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' }) ||
                         ytdl.chooseFormat(info.formats, { quality: 'highest' });
      }

      if (selectedFormat && selectedFormat.url) {
        const proxied = await proxyMediaStream(selectedFormat.url, title, ext);
        if (proxied) return proxied;
      }
    } catch (err) {
      console.error('Node ytdl-core extraction error:', err.message);
    }

    // 3. High-Speed Fallback Engine via Y2Mate API
    const y2mateDlink = await getY2MateStreamUrl(vid, isAudioOnly);
    if (y2mateDlink) {
      const proxied = await proxyMediaStream(y2mateDlink, title, ext);
      if (proxied) return proxied;
      return NextResponse.redirect(y2mateDlink);
    }

    // 4. Reliable 1-Click Downloader Redirect (ssyoutube / SaveFrom fallback)
    return NextResponse.redirect(`https://ssyoutube.com/watch?v=${vid}`);
  }

  return NextResponse.redirect('https://ssyoutube.com');
}

