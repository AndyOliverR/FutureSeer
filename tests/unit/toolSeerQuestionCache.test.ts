import {
  buildToolSeerQuestionCache,
  toolSeerCacheCollectionFromLabel,
} from '@/lib/toolSeerQuestionCache';

describe('toolSeerQuestionCache', () => {
  it('maps ask-*-seer labels to collection names', () => {
    expect(toolSeerCacheCollectionFromLabel('ask-tarot-seer')).toBe('tarotSeerCache');
    expect(toolSeerCacheCollectionFromLabel('ask-kp-astrology-seer')).toBe('kpAstrologySeerCache');
    expect(toolSeerCacheCollectionFromLabel('hellenistic-ask-seer')).toBe('hellenisticSeerCache');
  });

  it('builds cache config with keywords', () => {
    const cfg = buildToolSeerQuestionCache('ask-tarot-seer', 'What does The Tower mean?');
    expect(cfg?.collectionName).toBe('tarotSeerCache');
    expect(cfg?.keywords.length).toBeGreaterThan(5);
  });
});
