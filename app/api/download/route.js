import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

async function getY2MateStreamUrl(vid, isAudioOnly) {
  try {
    const res = await fetch('https://www.y2mate.com/mates/analyzeV2/ajax', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: `url=${encodeURIComponent('https://www.youtube.com/watch?v=' + vid)}&q_auto=0&ajax=1`,
      next: { revalidate: 0 },
    });
    const data = await res.json();
    const targetGroup = isAudioOnly ? (data?.links?.mp3 || data?.links?.mp4) : (data?.links?.mp4 || data?.links?.mp3);

    if (targetGroup) {
      const keys = Object.keys(targetGroup);
      if (keys.length > 0) {
        const kVal = targetGroup[keys[0]]?.k;
        if (kVal) {
          const cRes = await fetch('https://www.y2mate.com/mates/convertV2/index', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            body: `vid=${encodeURIComponent(vid)}&k=${encodeURIComponent(kVal)}`,
            next: { revalidate: 0 },
          });
          const cData = await cRes.json();
          if (cData?.dlink) {
            return cData.dlink;
          }
        }
      }
    }
  } catch (err) {
    console.error('getY2MateStreamUrl error:', err.message);
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let targetUrl = searchParams.get('url');
  const videoId = searchParams.get('videoId') || searchParams.get('videoid') || '';
  const resolution = searchParams.get('resolution') || '';

  // 0. Instant Direct Stream Redirect if targetUrl is already a resolved media stream URL
  if (targetUrl && (targetUrl.includes('googlevideo.com') || targetUrl.includes('.mp4') || targetUrl.includes('.m4a') || targetUrl.includes('loader.to'))) {
    return NextResponse.redirect(targetUrl);
  }

  const isAudioOnly = resolution.toLowerCase().includes('audio');
  let vid = videoId;
  if (!vid && targetUrl) {
    try {
      vid = ytdl.getURLVideoID(targetUrl);
    } catch {
      vid = '6-60kFPNa6U';
    }
  }
  if (!vid) vid = '6-60kFPNa6U';

  // 1. High-Speed Node.js Stream Extraction via @distube/ytdl-core
  try {
    const ytUrl = `https://www.youtube.com/watch?v=${vid}`;
    const info = await ytdl.getInfo(ytUrl, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    });

    let selectedFormat;
    if (isAudioOnly) {
      selectedFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' }) ||
                       ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    } else {
      selectedFormat = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' }) ||
                       ytdl.chooseFormat(info.formats, { quality: 'highest' });
    }

    if (selectedFormat && selectedFormat.url) {
      return NextResponse.redirect(selectedFormat.url);
    }
  } catch (err) {
    console.error('Node ytdl-core extraction error:', err.message);
  }

  // 2. High-Speed Fallback Engine via Y2Mate API
  const y2mateDlink = await getY2MateStreamUrl(vid, isAudioOnly);
  if (y2mateDlink) {
    return NextResponse.redirect(y2mateDlink);
  }

  // 3. Final Fallback: Direct YouTube Watch URL
  return NextResponse.redirect(`https://www.youtube.com/watch?v=${vid}`);
}
