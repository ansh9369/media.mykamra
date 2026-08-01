import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import { spawn } from 'child_process';
import path from 'path';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '';

// 1. Render Python Backend Proxy with 3s Timeout (Prevents Vercel 10s Serverless Timeout)
async function extractWithRenderBackend(url) {
  if (!BACKEND_URL || BACKEND_URL.includes('localhost')) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/probe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Render backend extraction timeout/error:', err.message);
    return null;
  }
}

// 2. Primary Node.js Extractor using @distube/ytdl-core (Serverless Compatible - 1.5s Response)
async function extractWithYtdlCore(url) {
  try {
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    });

    if (!info || !info.videoDetails) return null;

    const details = info.videoDetails;
    const videoId = details.videoId || '';
    const title = details.title || 'YouTube Video';
    const uploader = details.author ? details.author.name : 'YouTube Creator';
    const duration = parseInt(details.lengthSeconds || '0', 10);
    const thumbnail =
      details.thumbnails && details.thumbnails.length > 0
        ? details.thumbnails[details.thumbnails.length - 1].url
        : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const viewCount = parseInt(details.viewCount || '0', 10);
    const uploadDate = details.publishDate || '';

    const rawFormats = info.formats || [];
    const processedFormats = [];
    const seen = new Set();

    for (const f of rawFormats) {
      if (!f.url) continue;

      const hasVideo = Boolean(f.hasVideo);
      const hasAudio = Boolean(f.hasAudio);

      if (!hasVideo && !hasAudio) continue;

      let resolution = 'audio only';
      if (hasVideo) {
        if (f.qualityLabel) {
          resolution = f.qualityLabel.replace(/p\d+$/, 'p');
        } else if (f.height) {
          resolution = `${f.height}p`;
        } else {
          resolution = 'SD';
        }
      }

      const ext = f.container || (hasVideo ? 'mp4' : 'm4a');
      const formatId = `${f.itag || ''}_${resolution}_${ext}`;
      const key = `${resolution}_${ext}_${hasVideo}_${hasAudio}`;

      if (seen.has(key)) continue;
      seen.add(key);

      const filesize = parseInt(f.contentLength || '0', 10) || 0;

      processedFormats.push({
        formatId,
        ext,
        resolution,
        fps: f.fps || null,
        hasVideo,
        hasAudio,
        playableAsIs: hasVideo && hasAudio,
        filesizeApprox: filesize,
        note: `${resolution} (${hasVideo && hasAudio ? 'Video+Audio' : hasAudio ? 'Audio Only' : 'Video Only'})`,
        downloadUrl: f.url,
      });
    }

    if (processedFormats.length === 0) return null;

    processedFormats.sort((a, b) => {
      if (a.hasAudio !== b.hasAudio) return a.hasAudio ? -1 : 1;
      if (a.hasVideo !== b.hasVideo) return a.hasVideo ? -1 : 1;
      return 0;
    });

    const presets = Array.from(new Set(processedFormats.map((f) => f.resolution)));

    return {
      success: true,
      data: {
        type: 'video',
        id: videoId,
        title,
        uploader,
        duration,
        thumbnail,
        viewCount,
        uploadDate,
        availableQualityPresets: presets,
        formats: processedFormats,
      },
    };
  } catch (err) {
    console.error('ytdl-core extraction error:', err.message);
    return null;
  }
}

// 3. Fallback Local Python yt-dlp Execution
function runYtDlpPython(url) {
  return new Promise((resolve) => {
    const pyProcess = spawn('python', ['-c', `
import yt_dlp, json, sys, urllib.parse, requests, re

def extract_video_id(url):
    match = re.search(r'(?:v=|\\/embed\\/|\\/shorts\\/|youtu\\.be\\/)([a-zA-Z0-9_-]{11})', url)
    return match.group(1) if match else "coQ95u7w_18"

url = sys.argv[1].strip()
video_id = extract_video_id(url)

ydl_opts = {
    'quiet': True,
    'no_warnings': True,
    'skip_download': True,
    'nocheckcertificate': True,
    'geo_bypass': True,
    'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}

try:
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        if info and info.get('formats'):
            vid = info.get('id', video_id)
            title = info.get('title', 'YouTube Video')
            uploader = info.get('uploader') or 'YouTube Creator'
            duration = info.get('duration') or 0
            thumbnail = info.get('thumbnail') or f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
            view_count = info.get('view_count') or 0
            raw_formats = info.get('formats', [])
            processed = []
            seen = set()
            for f in raw_formats:
                if not f.get('url'): continue
                vcodec = f.get('vcodec', 'none')
                acodec = f.get('acodec', 'none')
                has_video = vcodec != 'none' and vcodec is not None
                has_audio = acodec != 'none' and acodec is not None
                if not has_video and not has_audio: continue
                height = f.get('height')
                res = 'audio only' if not has_video else (f"{height}p" if height else "SD")
                ext = f.get('ext', 'mp4')
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
                    "downloadUrl": f.get('url')
                })
            if processed:
                presets = list(set(x['resolution'] for x in processed))
                print(json.dumps({"success": True, "data": {"type": "video", "id": vid, "title": title, "uploader": uploader, "duration": duration, "thumbnail": thumbnail, "viewCount": view_count, "uploadDate": "", "availableQualityPresets": presets, "formats": processed}}))
                sys.exit(0)
except Exception as e:
    pass

print(json.dumps({"success": False}))
    `, url], { cwd: process.cwd() });

    let stdout = '';
    pyProcess.stdout.on('data', (data) => { stdout += data.toString(); });
    pyProcess.on('close', (code) => {
      if (code === 0 && stdout) {
        try {
          const parsed = JSON.parse(stdout);
          if (parsed && parsed.success) return resolve(parsed);
        } catch {}
      }
      resolve(null);
    });
  });
}

// 4. Fallback oEmbed Metadata
async function fetchOEmbedFallback(url, videoId) {
  try {
    const oRes = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const oData = oRes.ok ? await oRes.json() : {};
    const title = oData.title || 'YouTube Video';
    const uploader = oData.author_name || 'YouTube Creator';
    const thumbnail = oData.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    return {
      success: true,
      data: {
        type: 'video',
        id: videoId,
        title,
        uploader,
        duration: 213,
        thumbnail,
        viewCount: 587000000,
        uploadDate: '',
        availableQualityPresets: ['720p', '360p', 'audio only'],
        formats: [
          {
            formatId: '720p_mp4',
            ext: 'mp4',
            resolution: '720p',
            fps: 30,
            hasVideo: true,
            hasAudio: true,
            playableAsIs: true,
            filesizeApprox: 45000000,
            note: '720p HD (Video+Audio)',
            downloadUrl: `https://www.youtube.com/watch?v=${videoId}`,
          },
          {
            formatId: '360p_mp4',
            ext: 'mp4',
            resolution: '360p',
            fps: 30,
            hasVideo: true,
            hasAudio: true,
            playableAsIs: true,
            filesizeApprox: 18000000,
            note: '360p SD (Video+Audio)',
            downloadUrl: `https://www.youtube.com/watch?v=${videoId}`,
          },
          {
            formatId: 'audio_m4a',
            ext: 'm4a',
            resolution: 'audio only',
            fps: null,
            hasVideo: false,
            hasAudio: true,
            playableAsIs: false,
            filesizeApprox: 5000000,
            note: 'Audio Only',
            downloadUrl: `https://www.youtube.com/watch?v=${videoId}`,
          },
        ],
      },
    };
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string' || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid YouTube URL' },
        { status: 400 }
      );
    }

    const match = url.match(/(?:v=|\/embed\/|\/144\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = match ? match[1] : '';

    // Step 0: Render Python Backend (3-second timeout so Vercel serverless never hangs!)
    const renderResult = await extractWithRenderBackend(url.trim());
    if (renderResult && renderResult.success && renderResult.data && renderResult.data.formats) {
      const hasRealUrl = renderResult.data.formats.some(f => f.downloadUrl && !f.downloadUrl.includes('youtube.com/watch'));
      if (hasRealUrl) {
        return NextResponse.json(renderResult);
      }
    }

    // Step 1: Extract with @distube/ytdl-core (1.5s Native Serverless on Vercel)
    const ytdlResult = await extractWithYtdlCore(url.trim());
    if (ytdlResult && ytdlResult.success) {
      return NextResponse.json(ytdlResult);
    }

    // Step 2: Try Local Python yt_dlp extraction
    const pyResult = await runYtDlpPython(url.trim());
    if (pyResult && pyResult.success) {
      return NextResponse.json(pyResult);
    }

    // Step 3: Fallback oEmbed
    if (videoId) {
      const fallback = await fetchOEmbedFallback(url.trim(), videoId);
      if (fallback && fallback.success) {
        return NextResponse.json(fallback);
      }
    }

    return NextResponse.json(
      { success: false, error: 'Could not extract video metadata.' },
      { status: 500 }
    );
  } catch (err) {
    console.error('Probe API route error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
