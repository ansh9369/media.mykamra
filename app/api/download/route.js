import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url') || '';
  const title = searchParams.get('title') || 'video';
  const ext = searchParams.get('ext') || 'mp4';
  const videoId = searchParams.get('videoId') || '';
  const resolution = searchParams.get('resolution') || '';

  const isAudioOnly = resolution.toLowerCase().includes('audio') || ext === 'm4a' || ext === 'mp3';
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || (isAudioOnly ? 'audio' : 'video');
  const filename = `${sanitizedTitle}.${ext}`;

  // Extract video ID from url if not provided
  let targetId = videoId;
  if (!targetId && rawUrl) {
    const match = rawUrl.match(/(?:v=|\/embed\/|\/144\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) targetId = match[1];
  }

  // Format mapping for loader.to engine
  let formatKey = '720';
  if (isAudioOnly) {
    formatKey = 'mp3';
  } else if (resolution.includes('1080')) {
    formatKey = '1080';
  } else if (resolution.includes('1440')) {
    formatKey = '1440';
  } else if (resolution.includes('2160')) {
    formatKey = '4k';
  } else if (resolution.includes('480')) {
    formatKey = '480';
  } else if (resolution.includes('360')) {
    formatKey = '360';
  }

  try {
    // Attempt 1: High-Speed Direct Stream Conversion via loader.to engine
    if (targetId) {
      const ytUrl = `https://www.youtube.com/watch?v=${targetId}`;
      const startRes = await fetch(`https://loader.to/api/ajax/download.php?format=${formatKey}&url=${encodeURIComponent(ytUrl)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      if (startRes.ok) {
        const startData = await startRes.json();
        if (startData && startData.id) {
          const jobId = startData.id;

          // Poll progress for max 5 attempts (takes ~1-2s)
          for (let attempt = 0; attempt < 6; attempt++) {
            await new Promise((r) => setTimeout(r, 800));
            const progRes = await fetch(`https://loader.to/api/ajax/progress.php?id=${jobId}`, {
              headers: { 'User-Agent': 'Mozilla/5.0' },
            });
            if (progRes.ok) {
              const progData = await progRes.json();
              if (progData && progData.download_url) {
                // Return direct 302 redirect for native browser file download
                return NextResponse.redirect(progData.download_url);
              }
            }
          }
        }
      }
    }

    // Attempt 2: Direct media stream proxy if rawUrl is a direct media link
    if (rawUrl && !rawUrl.includes('youtube.com') && !rawUrl.includes('youtu.be') && rawUrl !== '#') {
      const mediaRes = await fetch(rawUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (mediaRes.ok) {
        const headers = new Headers();
        headers.set('Content-Type', isAudioOnly ? 'audio/mpeg' : 'video/mp4');
        headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        return new NextResponse(mediaRes.body, { status: 200, headers });
      }

      return NextResponse.redirect(rawUrl);
    }

    // Attempt 3: Fallback safety redirect
    const fallbackUrl = targetId ? `https://www.youtube.com/watch?v=${targetId}` : 'https://www.youtube.com';
    return NextResponse.redirect(fallbackUrl);
  } catch (err) {
    console.error('Download API route error:', err);
    const fallbackUrl = targetId ? `https://www.youtube.com/watch?v=${targetId}` : 'https://www.youtube.com';
    return NextResponse.redirect(fallbackUrl);
  }
}
