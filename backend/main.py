from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import yt_dlp
import requests
import urllib.parse
import re
import logging
import sys

# Structured Logger Setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("media_backend")

app = FastAPI(title="MyKamra Media Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProbeRequest(BaseModel):
    url: str

def extract_video_id(url: str) -> str:
    match = re.search(r'(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})', url)
    return match.group(1) if match else ""

def get_yt_dlp_options():
    return {
        'quiet': True,
        'no_warnings': True,
        'skip_download': True,
        'nocheckcertificate': True,
        'ignoreerrors': True,
        'geo_bypass': True,
        'socket_timeout': 20,
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

@app.get("/")
def root():
    return {"status": "online", "service": "MyKamra Media Extractor Engine"}

@app.post("/api/probe")
def probe_video(req: ProbeRequest):
    raw_url = req.url.strip()
    logger.info(f"[PROBE START] Incoming URL: {raw_url}")

    if not raw_url or ("youtube.com" not in raw_url and "youtu.be" not in raw_url):
        logger.warning(f"[PROBE FAIL] Invalid YouTube URL: {raw_url}")
        return JSONResponse(
            status_code=400,
            content={"success": False, "stage": "probe", "error": "Please enter a valid YouTube URL."}
        )

    video_id = extract_video_id(raw_url)
    logger.info(f"[PROBE EXTRACTED] Video ID: {video_id}")

    ydl_opts = get_yt_dlp_options()

    try:
        info = None
        target_watch_url = f"https://www.youtube.com/watch?v={video_id}" if video_id else raw_url
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(target_watch_url, download=False)

        if info and info.get('formats'):
            vid = info.get('id', video_id)
            title = info.get('title', 'YouTube Video')
            uploader = info.get('uploader') or info.get('channel') or 'YouTube Creator'
            duration = info.get('duration') or 0
            thumbnail = info.get('thumbnail') or f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
            view_count = info.get('view_count') or 0

            raw_formats = info.get('formats', [])
            processed_formats = []
            seen = set()

            for f in raw_formats:
                url_download = f.get('url', '')
                if not url_download or 'googlevideo.com' not in url_download:
                    continue

                vcodec = f.get('vcodec', 'none')
                acodec = f.get('acodec', 'none')
                has_video = vcodec != 'none' and vcodec is not None
                has_audio = acodec != 'none' and acodec is not None

                if not has_video and not has_audio:
                    continue

                height = f.get('height')
                format_note = f.get('format_note', '') or ''

                if not has_video and has_audio:
                    resolution = 'audio only'
                elif height:
                    resolution = f"{height}p"
                elif '1080' in format_note:
                    resolution = '1080p'
                elif '720' in format_note:
                    resolution = '720p'
                elif '480' in format_note:
                    resolution = '480p'
                elif '360' in format_note:
                    resolution = '360p'
                else:
                    resolution = 'SD'

                ext = f.get('ext', 'mp4')
                format_id = str(f.get('format_id', ''))
                key = f"{resolution}_{ext}_{has_video}_{has_audio}"
                if key in seen:
                    continue
                seen.add(key)

                filesize = f.get('filesize') or f.get('filesize_approx') or 0

                processed_formats.append({
                    "formatId": format_id,
                    "ext": ext,
                    "resolution": resolution,
                    "fps": f.get('fps'),
                    "hasVideo": has_video,
                    "hasAudio": has_audio,
                    "playableAsIs": has_video and has_audio,
                    "filesizeApprox": filesize,
                    "note": f"{resolution} ({'Video+Audio' if (has_video and has_audio) else 'Audio' if has_audio else 'Video Only'})",
                    "downloadUrl": url_download
                })

            if processed_formats:
                processed_formats.sort(key=lambda x: (not x['hasAudio'], not x['hasVideo']))
                presets = list(set(fmt['resolution'] for fmt in processed_formats))
                logger.info(f"[PROBE SUCCESS] Video ID: {vid} | Formats Found: {len(processed_formats)}")
                return {
                    "success": True,
                    "data": {
                        "type": "video",
                        "id": vid,
                        "title": title,
                        "uploader": uploader,
                        "duration": duration,
                        "thumbnail": thumbnail,
                        "viewCount": view_count,
                        "availableQualityPresets": presets,
                        "formats": processed_formats
                    }
                }
    except Exception as e:
        logger.error(f"[PROBE ERROR] yt_dlp extraction exception for {video_id}: {str(e)}")

    logger.warning(f"[PROBE FAIL] Unable to fetch downloadable media for {raw_url}")
    return JSONResponse(
        status_code=404,
        content={"success": False, "stage": "probe", "error": "Unable to fetch downloadable media"}
    )

def resolve_direct_stream_url(video_id: str, is_audio: bool = False) -> str:
    ydl_opts = get_yt_dlp_options()
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            if info and info.get('formats'):
                raw_formats = info.get('formats', [])
                for f in raw_formats:
                    url_fmt = f.get('url', '')
                    if not url_fmt or 'googlevideo.com' not in url_fmt:
                        continue
                    vcodec = f.get('vcodec', 'none')
                    acodec = f.get('acodec', 'none')
                    has_video = vcodec != 'none' and vcodec is not None
                    has_audio = acodec != 'none' and acodec is not None
                    if is_audio and has_audio:
                        return url_fmt
                    if not is_audio and has_video:
                        return url_fmt
                for f in raw_formats:
                    url_fmt = f.get('url', '')
                    if 'googlevideo.com' in url_fmt:
                        return url_fmt
    except Exception as e:
        logger.error(f"[RESOLVE STREAM ERROR] {video_id}: {str(e)}")
    return ""

@app.get("/api/download")
def download_stream(url: str = "", videoId: str = "", video_id: str = "", filename: str = "video.mp4", resolution: str = ""):
    target_url = url.strip()
    vid = videoId or video_id or extract_video_id(target_url)
    is_audio = "audio" in resolution.lower() or filename.endswith(".mp3") or filename.endswith(".m4a")

    logger.info(f"[DOWNLOAD START] Video ID: {vid} | Resolution: {resolution} | Target URL Present: {bool(target_url)}")

    direct_stream_url = ""
    if target_url and "googlevideo.com" in target_url:
        direct_stream_url = target_url
    elif vid:
        direct_stream_url = resolve_direct_stream_url(vid, is_audio)

    if not direct_stream_url:
        logger.error(f"[DOWNLOAD FAIL] Stream URL resolution failed for Video ID: {vid}")
        return JSONResponse(
            status_code=404,
            content={"success": False, "stage": "download", "error": "Unable to fetch downloadable media"}
        )

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.youtube.com/',
        'Origin': 'https://www.youtube.com',
    }

    try:
        req = requests.get(direct_stream_url, headers=headers, stream=True, timeout=20)
        if req.status_code == 200:
            clean_filename = re.sub(r'[^a-zA-Z0-9 _-]', '', filename).strip() or "video"
            ext = "mp3" if is_audio else "mp4"
            final_name = f"{clean_filename}.{ext}"

            content_type = req.headers.get("content-type") or ("audio/mpeg" if is_audio else "video/mp4")
            content_length = req.headers.get("content-length")

            res_headers = {
                "Content-Type": content_type,
                "Content-Disposition": f'attachment; filename="{final_name}"',
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Accept-Ranges": "bytes",
            }
            if content_length:
                res_headers["Content-Length"] = content_length

            logger.info(f"[DOWNLOAD PROXY SUCCESS] Streaming {final_name} to client")
            return StreamingResponse(
                req.iter_content(chunk_size=64 * 1024),
                status_code=200,
                headers=res_headers
            )
        else:
            logger.error(f"[DOWNLOAD PROXY FAIL] Upstream Googlevideo status code: {req.status_code}")
    except Exception as e:
        logger.error(f"[DOWNLOAD PROXY ERROR] Stream exception: {str(e)}")

    return JSONResponse(
        status_code=502,
        content={"success": False, "stage": "proxy", "error": "Unable to fetch downloadable media"}
    )
