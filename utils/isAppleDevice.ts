export function isAppleDevice() {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && !window.MSStream;
} 