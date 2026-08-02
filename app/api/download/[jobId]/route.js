import { NextResponse } from 'next/server';
import { getDownloadJob } from '@/lib/jobStore';

export const runtime = 'nodejs';
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
      { success: false, error: 'Download job not found or expired' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      stage: job.stage,
      fileUrl: job.fileUrl,
      title: job.title,
      ext: job.ext,
      error: job.error,
    },
  }, { status: 200 });
}
