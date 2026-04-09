const ALLOWED_PROXY_HOSTS = new Set([
  'astroapp.com',
  'www.astroapp.com',
  'api.astroapp.com',
  'cdn.astroapp.com',
]);

export function validateProxyImageUrl(imageUrl: string): { ok: true; url: URL } | { ok: false; error: string } {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return { ok: false, error: 'Invalid image URL' };
  }

  if (parsedUrl.protocol !== 'https:') {
    return { ok: false, error: 'Only https URLs are allowed' };
  }

  if (!ALLOWED_PROXY_HOSTS.has(parsedUrl.hostname)) {
    return { ok: false, error: 'Invalid image source' };
  }

  return { ok: true, url: parsedUrl };
}

