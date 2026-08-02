import { POST as downloadPOST } from '@/app/api/download/route';

export const runtime = 'nodejs';
export const maxDuration = 15;
export const dynamic = 'force-dynamic';

export async function POST(request) {
  return downloadPOST(request);
}
