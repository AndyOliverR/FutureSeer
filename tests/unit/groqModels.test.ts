import {
  GROQ_DEFAULT_VISION_MODEL,
  GROQ_DEPRECATED_VISION_MODEL,
  getGroqVisionModel,
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
});
