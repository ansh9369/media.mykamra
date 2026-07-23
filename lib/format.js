export function formatDuration(totalSeconds) {
  if (!totalSeconds && totalSeconds !== 0) return '';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function formatViews(count) {
  if (count == null) return '';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K views`;
  return `${count} views`;
}

export function formatUploadDate(yyyymmdd) {
  if (!yyyymmdd || yyyymmdd.length !== 8) return '';
  const year = yyyymmdd.slice(0, 4);
  const month = yyyymmdd.slice(4, 6);
  const day = yyyymmdd.slice(6, 8);
  const date = new Date(`${year}-${month}-${day}T00:00:00`);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let val = bytes;
  let i = 0;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(val >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Groups raw backend formats by resolution and picks the best single
 * representative per resolution (preferring one with audio, then mp4,
 * then larger filesize), while keeping all raw formats available too.
 */
export function groupFormatsByResolution(formats) {
  const groups = new Map();
  for (const f of formats) {
    const key = f.resolution;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  }

  const order = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', '144p', 'audio only'];
  const entries = Array.from(groups.entries()).sort((a, b) => {
    const ia = order.indexOf(a[0]);
    const ib = order.indexOf(b[0]);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return entries.map(([resolution, items]) => {
    const best = [...items].sort((a, b) => {
      if (a.hasAudio !== b.hasAudio) return a.hasAudio ? -1 : 1;
      if (a.ext !== b.ext) return a.ext === 'mp4' ? -1 : 1;
      return (b.filesizeApprox || 0) - (a.filesizeApprox || 0);
    })[0];
    return { resolution, best, all: items };
  });
}
