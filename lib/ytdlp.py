import sys
import json
import yt_dlp

def probe_youtube(url):
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'skip_download': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
        if not info:
            return {"success": False, "error": "Could not extract video metadata."}
            
        video_id = info.get('id', '')
        title = info.get('title', 'YouTube Video')
        uploader = info.get('uploader') or info.get('channel') or 'YouTube Creator'
        duration = info.get('duration') or 0
        thumbnail = info.get('thumbnail') or f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
        view_count = info.get('view_count') or 0
        upload_date = info.get('upload_date') or ''
        
        raw_formats = info.get('formats', [])
        processed_formats = []
        seen = set()
        
        for f in raw_formats:
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
            elif '240' in format_note:
                resolution = '240p'
            elif '144' in format_note:
                resolution = '144p'
            else:
                resolution = 'SD'
                
            ext = f.get('ext', 'mp4')
            format_id = str(f.get('format_id', ''))
            key = f"{resolution}_{ext}_{has_video}_{has_audio}"
            
            if key in seen:
                continue
            seen.add(key)
            
            filesize = f.get('filesize') or f.get('filesize_approx') or 0
            url_download = f.get('url') or '#'
            
            processed_formats.append({
                "formatId": format_id,
                "ext": ext,
                "resolution": resolution,
                "fps": f.get('fps'),
                "hasVideo": has_video,
                "hasAudio": has_audio,
                "playableAsIs": has_video and has_audio,
                "filesizeApprox": filesize,
                "note": format_note or resolution,
                "downloadUrl": url_download
            })
            
        # Sort formats: audio first, then resolution height descending
        presets = list(set(fmt['resolution'] for fmt in processed_formats))
        
        return {
            "success": True,
            "data": {
                "type": "video",
                "id": video_id,
                "title": title,
                "uploader": uploader,
                "duration": duration,
                "thumbnail": thumbnail,
                "viewCount": view_count,
                "uploadDate": upload_date,
                "availableQualityPresets": presets,
                "formats": processed_formats
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No URL provided."}))
        sys.exit(1)
    
    target_url = sys.argv[1]
    result = probe_youtube(target_url)
    print(json.dumps(result))
