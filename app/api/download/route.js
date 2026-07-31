import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;

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
    // If Render Backend URL is configured, delegate download to Render backend for valid container compilation
    if (BACKEND_URL && (!targetUrl || targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be') || targetUrl === '#')) {
      const renderDownloadUrl = `${BACKEND_URL.replace(/\/$/, '')}/api/download?url=${encodeURIComponent(targetUrl || '')}&filename=${encodeURIComponent(filename)}&videoId=${encodeURIComponent(videoId)}&resolution=${encodeURIComponent(resolution)}`;
      return NextResponse.redirect(renderDownloadUrl);
    }

    // High-speed loader engine fallback if targetUrl is YouTube watch page
    if (!targetUrl || targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be') || targetUrl === '#') {
      if (videoId) {
        try {
          const formatKey = isAudioOnly ? 'mp3' : (resolution.includes('720') ? '720' : '360');
          const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
          const startRes = await fetch(`https://loader.to/api/ajax/download.php?format=${formatKey}&url=${encodeURIComponent(ytUrl)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
          });

          if (startRes.ok) {
            const startData = await startRes.json();
            if (startData && startData.id) {
              const jobId = startData.id;
              for (let attempt = 0; attempt < 6; attempt++) {
                await new Promise((r) => setTimeout(r, 800));
                const progRes = await fetch(`https://loader.to/api/ajax/progress.php?id=${jobId}`, {
                  headers: { 'User-Agent': 'Mozilla/5.0' },
                });
                if (progRes.ok) {
                  const progData = await progRes.json();
                  if (progData && progData.download_url) {
                    return NextResponse.redirect(progData.download_url);
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error('Loader fallback error:', e.message);
        }
      }
    }

    // Secondary ytdl-core fallback
    if (!targetUrl || targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be') || targetUrl === '#') {
      if (videoId) {
        try {
          const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`, {
            requestOptions: {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              },
            },
          });
          const chosenFormat = ytdl.chooseFormat(info.formats, {
            quality: isAudioOnly ? 'highestaudio' : 'highestvideo',
          });
          if (chosenFormat && chosenFormat.url) {
            targetUrl = chosenFormat.url;
          }
        } catch (e) {
          console.error('ytdl-core stream resolution error:', e.message);
        }
      }
    }

    // Safety fallback
    if (!targetUrl || targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be') || targetUrl === '#') {
      const fallbackWatchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : 'https://www.youtube.com';
      return NextResponse.redirect(fallbackWatchUrl);
    }

    // Fetch the stream
    const mediaRes = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!mediaRes.ok) {
      return NextResponse.redirect(targetUrl);
    }

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

    return new NextResponse(mediaRes.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error('Download route error:', err);
    const fallbackWatchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : 'https://www.youtube.com';
    return NextResponse.redirect(fallbackWatchUrl);
  }
}
