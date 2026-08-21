/**
 * Groq model IDs — single place to update when Groq deprecates models.
 * @see https://console.groq.com/docs/deprecations
 */

/** Deprecated 2026-07-17 — use {@link getGroqVisionModel} instead. */
export const GROQ_DEPRECATED_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

/** Groq-recommended Scout replacement with image input (20 MB max file). */
export const GROQ_DEFAULT_VISION_MODEL = 'qwen/qwen3.6-27b';

/** Decommissioned 2026-08-16 — aliased to {@link GROQ_DEFAULT_TEXT_MODEL}. */
export const GROQ_DEPRECATED_TEXT_MODEL_FULL = 'llama-3.3-70b-versatile';

/** Decommissioned 2026-08-16 — aliased to {@link GROQ_DEFAULT_FAST_TEXT_MODEL}. */
export const GROQ_DEPRECATED_TEXT_MODEL_FAST = 'llama-3.1-8b-instant';

/** Default text model for comprehensive reports and tool Seers (Groq-hosted GPT OSS). */
export const GROQ_DEFAULT_TEXT_MODEL = 'openai/gpt-oss-120b';

/** Default fast text model (Main Seer free tier). */
export const GROQ_DEFAULT_FAST_TEXT_MODEL = 'openai/gpt-oss-20b';

const DEPRECATED_TEXT_ALIASES: Record<string, string> = {
  'llama-3.3-70b-versatile': GROQ_DEFAULT_TEXT_MODEL,
  'llama-3.1-8b-instant': GROQ_DEFAULT_FAST_TEXT_MODEL,
  'groq/llama-3.3-70b-versatile': GROQ_DEFAULT_TEXT_MODEL,
  'groq/llama-3.1-8b-instant': GROQ_DEFAULT_FAST_TEXT_MODEL,
};

/** Rewrite decommissioned Llama text IDs (and leftover env vars) to current Groq models. */
export function aliasDeprecatedGroqModel(model: string): string {
  const trimmed = model.trim();
  return DEPRECATED_TEXT_ALIASES[trimmed] ?? trimmed;
}

/**
 * Vision / multimodal (palmistry image analysis).
 * Override with GROQ_VISION_MODEL on Vercel.
 */
export function getGroqVisionModel(): string {
  const override = process.env.GROQ_VISION_MODEL?.trim();
  return override || GROQ_DEFAULT_VISION_MODEL;
}

/** Full-quality Groq text model. Override with GROQ_TEXT_MODEL. */
export function getGroqTextModel(): string {
  const override = process.env.GROQ_TEXT_MODEL?.trim();
  return aliasDeprecatedGroqModel(override || GROQ_DEFAULT_TEXT_MODEL);
}

/** Fast Groq text model. Override with GROQ_FAST_TEXT_MODEL. */
export function getGroqFastTextModel(): string {
  const override = process.env.GROQ_FAST_TEXT_MODEL?.trim();
  return aliasDeprecatedGroqModel(override || GROQ_DEFAULT_FAST_TEXT_MODEL);
}

/** True when this ID is Groq-hosted GPT OSS (not OpenAI's API). */
export function isGroqHostedGptOss(model: string): boolean {
  const id = aliasDeprecatedGroqModel(model).replace(/^groq\//, '');
  return id.startsWith('openai/gpt-oss');
}

const OPENAI_API_IDS = new Set(['gpt-4', 'gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini']);

/**
 * AI Gateway model id. Groq-hosted IDs (including openai/gpt-oss-* and qwen/*)
 * become groq/...; real OpenAI chat models stay openai/...
 */
export function toAiGatewayModelId(model: string): string {
  const aliased = aliasDeprecatedGroqModel(model);
  if (aliased.startsWith('groq/')) return aliased;
  if (OPENAI_API_IDS.has(aliased) || (aliased.startsWith('openai/') && !isGroqHostedGptOss(aliased))) {
    return aliased.includes('/') ? aliased : `openai/${aliased}`;
  }
  return `groq/${aliased}`;
}
