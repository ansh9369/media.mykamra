import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const filename = searchParams.get('filename') || 'video.mp4';

  if (!targetUrl) {
    return new NextResponse('Missing download URL', { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      // If direct fetch fails, redirect to URL
      return NextResponse.redirect(targetUrl);
    }

    const headers = new Headers();
    headers.set('Content-Type', res.headers.get('content-type') || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    return new NextResponse(res.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error('Download route error:', err);
    return NextResponse.redirect(targetUrl);
  }
}
