import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let targetUrl = searchParams.get('url');
  const title = searchParams.get('title') || 'video';
  const ext = searchParams.get('ext') || 'mp4';
  const videoId = searchParams.get('videoId');
  const resolution = searchParams.get('resolution') || '';

  const isAudioOnly = resolution.toLowerCase().includes('audio') || ext === 'm4a' || ext === 'mp3';
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || (isAudioOnly ? 'audio' : 'video');
  const filename = `${sanitizedTitle}.${ext}`;

  try {
    // If targetUrl is missing or points to a YouTube watch page, extract direct stream URL via ytdl-core
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

    // If still no direct stream URL, redirect to watch page as safety fallback
    if (!targetUrl || targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be') || targetUrl === '#') {
      const fallbackWatchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : 'https://www.youtube.com';
      return NextResponse.redirect(fallbackWatchUrl);
    }

    // Fetch the direct stream from googlevideo CDN
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
    if (targetUrl && !targetUrl.includes('youtube.com')) {
      return NextResponse.redirect(targetUrl);
    }
    const fallbackWatchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : 'https://www.youtube.com';
    return NextResponse.redirect(fallbackWatchUrl);
  }
}
