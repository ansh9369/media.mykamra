export async function probeVideo(url) {
  try {
    const res = await fetch('/api/probe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Unable to fetch downloadable media');
    }

    return json.data;
  } catch (err) {
    throw new Error(err.message || 'Unable to fetch downloadable media');
  }
}
