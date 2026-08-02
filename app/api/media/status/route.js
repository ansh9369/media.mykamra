import { NextResponse } from 'next/server';
import { getDownloadJob } from '@/lib/jobStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId') || searchParams.get('job_id') || '';

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'jobId parameter is required' }, { status: 400 });
    }

    const job = getDownloadJob(jobId);
    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.jobId,
        state: job.status,
        progress: job.progress,
        stage: job.stage,
        fileName: `${job.title}.${job.ext}`,
        fileUrl: job.fileUrl,
      },
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
