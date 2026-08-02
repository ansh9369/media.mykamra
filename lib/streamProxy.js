export async function proxyStreamResponse(streamUrl, filename, ext) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9500);

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
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`[PROXY STREAM EXCEPTION] ${streamUrl.slice(0, 80)}:`, err.message);
  }

  return null;
}
