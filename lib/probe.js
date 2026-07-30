export async function probeVideo(url) {
  const res = await fetch('/api/probe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Could not read that signal.');
  }

  return json.data;
}
