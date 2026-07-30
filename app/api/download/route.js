import { NextResponse } from 'next/server';

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
    // If targetUrl is missing or points to a YouTube watch page, resolve a direct stream URL
    if (!targetUrl || targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be') || targetUrl === '#') {
      if (videoId) {
        const instances = ['https://inv.tux.pizza', 'https://invidious.nerdvpn.de', 'https://vid.puffyan.us'];
        for (const instance of instances) {
          try {
            const invRes = await fetch(`${instance}/api/v1/videos/${videoId}`, {
              headers: { 'User-Agent': 'Mozilla/5.0' },
            });
            if (invRes.ok) {
              const invData = await invRes.json();
              if (isAudioOnly) {
                const audioStreams = (invData.adaptiveFormats || []).filter(
                  (s) => s.type && s.type.startsWith('audio')
                );
                if (audioStreams.length > 0 && audioStreams[0].url) {
                  targetUrl = audioStreams[0].url;
                  break;
                }
              }

              const videoStreams = invData.formatStreams || [];
              if (videoStreams.length > 0 && videoStreams[0].url) {
                targetUrl = videoStreams[0].url;
                break;
              }
            }
          } catch (e) {
            // try next instance
          }
        }
      }
    }

    if (!targetUrl || targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be') || targetUrl === '#') {
      return NextResponse.json(
        { error: 'Direct media stream unavailable.' },
        { status: 400 }
      );
    }

    // Fetch the stream from googlevideo/invidious CDN
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
    console.error('Download stream error:', err);
    if (targetUrl && !targetUrl.includes('youtube.com')) {
      return NextResponse.redirect(targetUrl);
    }
    return NextResponse.json({ error: 'Failed to download media' }, { status: 500 });
  }
}
