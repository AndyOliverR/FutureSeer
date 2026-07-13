/**
 * Groq model IDs — single place to update when Groq deprecates models.
 * @see https://console.groq.com/docs/deprecations
 */

/** Deprecated 2026-07-17 — use {@link getGroqVisionModel} instead. */
export const GROQ_DEPRECATED_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

/** Groq-recommended Scout replacement with image input (20 MB max file). */
export const GROQ_DEFAULT_VISION_MODEL = 'qwen/qwen3.6-27b';

/** Default text model for comprehensive reports and tool Seers. */
export const GROQ_DEFAULT_TEXT_MODEL = 'llama-3.3-70b-versatile';

/** Default fast text model (Main Seer free tier). */
export const GROQ_DEFAULT_FAST_TEXT_MODEL = 'llama-3.1-8b-instant';

/**
 * Vision / multimodal (palmistry image analysis).
 * Override with GROQ_VISION_MODEL on Vercel before 2026-07-17 Scout shutdown.
 */
export function getGroqVisionModel(): string {
  const override = process.env.GROQ_VISION_MODEL?.trim();
  return override || GROQ_DEFAULT_VISION_MODEL;
}
