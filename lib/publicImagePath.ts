/**
 * PERFORMANCE ARCHITECTURE — Public static images
 * Prefer WebP when a sibling .webp exists (generated offline); PNG remains fallback in OptimizedPublicImage.
 */

export function publicImageSources(pngPath: string): { webp: string; png: string } {
  const normalized = pngPath.startsWith("/") ? pngPath : `/${pngPath}`;
  const webp = normalized.replace(/\.(png|jpe?g)$/i, ".webp");
  return { webp, png: normalized };
}
