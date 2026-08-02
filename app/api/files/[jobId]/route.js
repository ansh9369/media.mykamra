import { NextResponse } from 'next/server';
import { getDownloadJob } from '@/lib/jobStore';
import { proxyStreamResponse } from '@/lib/streamProxy';

export const runtime = 'nodejs';
export const maxDuration = 15;
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { jobId } = await params;

  if (!jobId) {
    return NextResponse.json(
      { success: false, error: 'Job ID is required' },
      { status: 400 }
    );
  }

  const job = getDownloadJob(jobId);

  if (!job) {
    return NextResponse.json(
      { success: false, error: 'Job not found or expired' },
      { status: 404 }
    );
  }

  // 1. Direct stream if downloadUrl is present
  if (job.downloadUrl && job.downloadUrl.startsWith('http')) {
    const stream = await proxyStreamResponse(job.downloadUrl, job.title, job.ext);
    if (stream) return stream;
  }

  // 2. Delegate to GET /api/download using job metadata
  const fallbackDownloadApiUrl = `/api/download?url=${encodeURIComponent(job.downloadUrl || '')}&videoId=${encodeURIComponent(job.videoId || '')}&title=${encodeURIComponent(job.title || 'media')}&ext=${encodeURIComponent(job.ext || 'mp4')}&resolution=${encodeURIComponent(job.resolution || '')}`;

  const currentOrigin = request.nextUrl.origin;
  try {
    const res = await fetch(`${currentOrigin}${fallbackDownloadApiUrl}`);
    if (res.ok && res.body) {
      const headers = new Headers(res.headers);
      headers.set('Content-Disposition', `attachment; filename="${job.title}.${job.ext}"`);
      return new Response(res.body, {
        status: 200,
        headers,
      });
    }
  } catch (err) {
    console.error(`[FILES STREAM ERROR] Job ${jobId}:`, err.message);
  }

  return NextResponse.json(
    { success: false, error: 'Unable to stream file' },
    { status: 500 }
  );
}
