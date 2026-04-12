import { getTarotCardImageByName } from '@/lib/tarotApiService'

export const TAROT_FALLBACK_IMAGE = '/tarot/major_00_the_fool.png.png'

/**
 * Normalize stored vs static deck paths for `<img src>`.
 * Pipeline data may use basename-only, full `/tarot/...`, or absolute URLs.
 */
export function resolveTarotCardImageSrc(card: { name: string; image?: string | null }): string {
  const raw = typeof card.image === 'string' ? card.image.trim() : ''
  if (!raw) return getTarotCardImageByName(card.name)
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith('/')) return raw
  if (raw.startsWith('tarot/')) return `/${raw}`
  return `/tarot/${raw}`
}

/**
 * Client-only: chain fallbacks (by name, single `.png`, then Fool).
 */
export function applyTarotImageOnError(
  img: HTMLImageElement,
  card: { name: string; image?: string | null }
): void {
  if (typeof window === 'undefined') return

  const stage = img.dataset.fsTarotStage ?? '0'
  if (stage === '0') {
    img.dataset.fsTarotStage = '1'
    img.src = getTarotCardImageByName(card.name)
    return
  }

  if (stage === '1') {
    img.dataset.fsTarotStage = '2'
    try {
      const u = new URL(img.src, window.location.origin)
      const nextPath = u.pathname.replace(/\.png\.png$/i, '.png')
      if (nextPath !== u.pathname) {
        img.src = `${u.origin}${nextPath}${u.search}`
        return
      }
    } catch {
      /* ignore */
    }
  }

  img.dataset.fsTarotStage = '3'
  img.src = TAROT_FALLBACK_IMAGE
}
