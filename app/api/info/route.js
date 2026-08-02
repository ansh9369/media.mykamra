import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

export const runtime = 'nodejs';
export const maxDuration = 15;
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL || 'https://media-mykamra-api.onrender.com';

function extractVideoId(url) {
  const match = url.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
}

// 1. Fetch metadata using Python Backend Proxy
async function extractWithBackend(url) {
  if (!BACKEND_URL) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const backendEndpoint = `${BACKEND_URL.replace(/\/$/, '')}/api/info`;
    const res = await fetch(backendEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.data && data.data.formats && data.data.formats.length > 0) {
        console.log(`[INFO BACKEND SUCCESS] URL: ${url} | Formats: ${data.data.formats.length}`);
        return data;
      }
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`[INFO BACKEND ERROR] ${url}:`, err.message);
  }
  return null;
}

// 2. Local Python yt-dlp Extractor
function runYtDlpLocal(url) {
  return new Promise((resolve) => {
    try {
      const pyProcess = spawn('python', ['-c', `
import yt_dlp, json, sys, re

def extract_video_id(url):
    match = re.search(r'(?:v=|\\/embed\\/|\\/shorts\\/|youtu\\.be\\/)([a-zA-Z0-9_-]{11})', url)
    return match.group(1) if match else ""

url = sys.argv[1].strip()
video_id = extract_video_id(url)

ydl_opts = {
    'quiet': True,
    'no_warnings': True,
    'skip_download': True,
    'nocheckcertificate': True,
    'geo_bypass': True,
    'socket_timeout': 10,
    'extractor_args': {
        'youtube': {
            'player_client': ['mweb', 'tv', 'ios', 'android_vr', 'web']
        }
    },
    'http_headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.youtube.com/',
    }
}

try:
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        if info and info.get('formats'):
            vid = info.get('id', video_id)
            title = info.get('title', 'YouTube Video')
            uploader = info.get('uploader') or info.get('channel') or 'YouTube Creator'
            duration = info.get('duration') or 0
            thumbnail = info.get('thumbnail') or f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
            view_count = info.get('view_count') or 0
            upload_date = info.get('upload_date') or ''
            raw_formats = info.get('formats', [])
            processed = []
            seen = set()

            for f in raw_formats:
                url_fmt = f.get('url', '')
                if not url_fmt or not url_fmt.startswith('http'): continue
                ext = f.get('ext', 'mp4')
                if ext in ['mhtml', 'sb0', 'sb1', 'sb2', 'sb3']: continue
                vcodec = f.get('vcodec', 'none')
                acodec = f.get('acodec', 'none')
                has_video = vcodec != 'none' and vcodec is not None
                has_audio = acodec != 'none' and acodec is not None
                if not has_video and not has_audio: continue
                height = f.get('height')
                res = 'audio only' if not has_video else (f"{height}p" if height else "SD")
                key = f"{res}_{ext}_{has_video}_{has_audio}"
                if key in seen: continue
                seen.add(key)
                processed.append({
                    "formatId": str(f.get('format_id', '')),
                    "ext": ext,
                    "resolution": res,
                    "fps": f.get('fps'),
                    "hasVideo": has_video,
                    "hasAudio": has_audio,
                    "playableAsIs": has_video and has_audio,
                    "filesizeApprox": f.get('filesize') or f.get('filesize_approx') or 0,
                    "note": f"{res} ({'Video+Audio' if (has_video and has_audio) else 'Audio' if has_audio else 'Video Only'})",
                    "downloadUrl": url_fmt
                })

            if processed:
                presets = list(set(x['resolution'] for x in processed))
                if '1080p' in presets: presets.append('best')
                print(json.dumps({"success": True, "data": {"type": "video", "id": vid, "title": title, "uploader": uploader, "duration": duration, "thumbnail": thumbnail, "viewCount": view_count, "uploadDate": upload_date, "availableQualityPresets": presets, "formats": processed}}))
                sys.exit(0)
except Exception as e:
    pass

print(json.dumps({"success": False, "stage": "info", "error": "Unable to fetch downloadable media"}))
      `, url], { cwd: process.cwd() });

      let stdout = '';
      const timer = setTimeout(() => {
        pyProcess.kill();
        resolve(null);
      }, 9500);

      pyProcess.stdout.on('data', (data) => { stdout += data.toString(); });
      pyProcess.on('error', () => {
        clearTimeout(timer);
        resolve(null);
      });
      pyProcess.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0 && stdout) {
          try {
            const parsed = JSON.parse(stdout);
            if (parsed && parsed.success) return resolve(parsed);
          } catch {}
        }
        resolve(null);
      });
    } catch {
      resolve(null);
    }
  });
}

async function handleInfo(targetUrl) {
  const url = (targetUrl || '').trim();
  console.log(`[INFO ROUTE START] Incoming URL: ${url}`);

  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    console.warn(`[INFO ROUTE REJECT] Invalid URL: ${url}`);
    return NextResponse.json(
      { success: false, stage: 'info', error: 'Please enter a valid YouTube URL' },
      { status: 400 }
    );
  }

  // Step 1: Query Backend Proxy
  const backendResult = await extractWithBackend(url);
  if (backendResult && backendResult.success) {
    return NextResponse.json(backendResult, { status: 200 });
  }

  // Step 2: Query Local Python Extractor
  const localResult = await runYtDlpLocal(url);
  if (localResult && localResult.success) {
    return NextResponse.json(localResult, { status: 200 });
  }

  console.error(`[INFO ROUTE FAIL] Extraction failed for: ${url}`);
  return NextResponse.json(
    { success: false, stage: 'info', error: 'Unable to fetch downloadable media for this video.' },
    { status: 500 }
  );
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  return handleInfo(targetUrl);
}

export async function POST(request) {
  try {
    const body = await request.json();
    return handleInfo(body.url);
  } catch (err) {
    return NextResponse.json(
      { success: false, stage: 'info', error: 'Invalid request payload' },
      { status: 400 }
    );
  }
}
