import { POST as infoPOST } from '@/app/api/info/route';

export const runtime = 'nodejs';
export const maxDuration = 15;
export const dynamic = 'force-dynamic';

export async function POST(request) {
  return infoPOST(request);
}
