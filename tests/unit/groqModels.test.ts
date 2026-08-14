import {
  GROQ_DEFAULT_FAST_TEXT_MODEL,
  GROQ_DEFAULT_TEXT_MODEL,
  GROQ_DEFAULT_VISION_MODEL,
  GROQ_DEPRECATED_VISION_MODEL,
  getGroqVisionModel,
  normalizeGroqTextModel,
} from '@/lib/groqModels';

describe('groqModels', () => {
  const original = process.env.GROQ_VISION_MODEL;

  afterEach(() => {
    if (original === undefined) delete process.env.GROQ_VISION_MODEL;
    else process.env.GROQ_VISION_MODEL = original;
  });

  it('defaults vision model to Qwen3.6 27B (Scout replacement)', () => {
    delete process.env.GROQ_VISION_MODEL;
    expect(getGroqVisionModel()).toBe(GROQ_DEFAULT_VISION_MODEL);
    expect(GROQ_DEFAULT_VISION_MODEL).toBe('qwen/qwen3.6-27b');
  });

  it('allows GROQ_VISION_MODEL override', () => {
    process.env.GROQ_VISION_MODEL = 'openai/gpt-oss-120b';
    expect(getGroqVisionModel()).toBe('openai/gpt-oss-120b');
  });

  it('documents deprecated Scout id for migration audits', () => {
    expect(GROQ_DEPRECATED_VISION_MODEL).toContain('llama-4-scout');
  });

  it('uses Groq GPT-OSS replacements for retired text models', () => {
    expect(GROQ_DEFAULT_TEXT_MODEL).toBe('openai/gpt-oss-120b');
    expect(GROQ_DEFAULT_FAST_TEXT_MODEL).toBe('openai/gpt-oss-20b');
  });

  it('normalizes stale Llama defaults and environment overrides', () => {
    expect(normalizeGroqTextModel('llama-3.3-70b-versatile')).toBe(
      GROQ_DEFAULT_TEXT_MODEL,
    );
    expect(normalizeGroqTextModel('groq/llama-3.1-8b-instant')).toBe(
      GROQ_DEFAULT_FAST_TEXT_MODEL,
    );
    expect(normalizeGroqTextModel('qwen/qwen3.6-27b')).toBe(
      'qwen/qwen3.6-27b',
    );
  });
});
