import {
  GROQ_DEFAULT_FAST_TEXT_MODEL,
  GROQ_DEFAULT_TEXT_MODEL,
  GROQ_DEFAULT_VISION_MODEL,
  GROQ_DEPRECATED_TEXT_MODEL_FAST,
  GROQ_DEPRECATED_TEXT_MODEL_FULL,
  GROQ_DEPRECATED_VISION_MODEL,
  aliasDeprecatedGroqModel,
  getGroqFastTextModel,
  getGroqTextModel,
  getGroqVisionModel,
  toAiGatewayModelId,
} from '@/lib/groqModels';

describe('groqModels', () => {
  const originalVision = process.env.GROQ_VISION_MODEL;
  const originalText = process.env.GROQ_TEXT_MODEL;
  const originalFast = process.env.GROQ_FAST_TEXT_MODEL;

  afterEach(() => {
    if (originalVision === undefined) delete process.env.GROQ_VISION_MODEL;
    else process.env.GROQ_VISION_MODEL = originalVision;
    if (originalText === undefined) delete process.env.GROQ_TEXT_MODEL;
    else process.env.GROQ_TEXT_MODEL = originalText;
    if (originalFast === undefined) delete process.env.GROQ_FAST_TEXT_MODEL;
    else process.env.GROQ_FAST_TEXT_MODEL = originalFast;
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

  it('defaults text models to Groq-hosted GPT OSS after Llama decommission', () => {
    delete process.env.GROQ_TEXT_MODEL;
    delete process.env.GROQ_FAST_TEXT_MODEL;
    expect(getGroqTextModel()).toBe('openai/gpt-oss-120b');
    expect(getGroqFastTextModel()).toBe('openai/gpt-oss-20b');
    expect(GROQ_DEFAULT_TEXT_MODEL).toBe('openai/gpt-oss-120b');
    expect(GROQ_DEFAULT_FAST_TEXT_MODEL).toBe('openai/gpt-oss-20b');
  });

  it('aliases decommissioned Llama IDs including groq/ prefix and leftover env', () => {
    expect(aliasDeprecatedGroqModel(GROQ_DEPRECATED_TEXT_MODEL_FULL)).toBe(GROQ_DEFAULT_TEXT_MODEL);
    expect(aliasDeprecatedGroqModel(GROQ_DEPRECATED_TEXT_MODEL_FAST)).toBe(GROQ_DEFAULT_FAST_TEXT_MODEL);
    expect(aliasDeprecatedGroqModel('groq/llama-3.3-70b-versatile')).toBe(GROQ_DEFAULT_TEXT_MODEL);
    process.env.GROQ_TEXT_MODEL = 'llama-3.3-70b-versatile';
    expect(getGroqTextModel()).toBe(GROQ_DEFAULT_TEXT_MODEL);
  });

  it('does not prefix groq/ onto IDs that already contain a vendor slash', () => {
    expect(toAiGatewayModelId('openai/gpt-oss-120b')).toBe('groq/openai/gpt-oss-120b');
    expect(toAiGatewayModelId('qwen/qwen3.6-27b')).toBe('groq/qwen/qwen3.6-27b');
    expect(toAiGatewayModelId('llama-3.3-70b-versatile')).toBe('groq/openai/gpt-oss-120b');
    expect(toAiGatewayModelId('gpt-4o-mini')).toBe('openai/gpt-4o-mini');
    expect(toAiGatewayModelId('openai/gpt-4o')).toBe('openai/gpt-4o');
  });
});
