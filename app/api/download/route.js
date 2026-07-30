import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let targetUrl = searchParams.get('url');
  const title = searchParams.get('title') || 'video';
  const ext = searchParams.get('ext') || 'mp4';
  const videoId = searchParams.get('videoId');

  const sanitizedTitle = title.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'media';
  const filename = `${sanitizedTitle}.${ext}`;

  try {
    // If targetUrl is a YouTube watch URL or not a direct media link, try resolving a direct stream URL
    if (!targetUrl || targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be') || targetUrl === '#') {
      if (videoId) {
        // Try fetching direct stream URL from Invidious instance
        const invRes = await fetch(`https://inv.tux.pizza/api/v1/videos/${videoId}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        if (invRes.ok) {
          const invData = await invRes.json();
          const streams = invData.formatStreams || [];
          if (streams.length > 0 && streams[0].url) {
            targetUrl = streams[0].url;
          }
        }
      }
    }

    if (!targetUrl || targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be') || targetUrl === '#') {
      // If still YouTube URL, redirect gracefully or return error
      return NextResponse.json(
        { error: 'Direct media stream not available for this track.' },
        { status: 400 }
      );
    }

    // Fetch the direct video/audio stream from googlevideo/invidious stream server
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
    const contentType = mediaRes.headers.get('content-type') || (ext === 'mp3' ? 'audio/mpeg' : 'video/mp4');
    
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
    return NextResponse.json(
      { error: 'Failed to download media stream' },
      { status: 500 }
    );
  }
}
