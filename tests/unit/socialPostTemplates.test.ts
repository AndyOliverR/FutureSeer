import {
  FUTURESEER_CORE_MESSAGE,
  getSocialPostTemplate,
  listTemplatesForChannel,
  SOCIAL_POST_TEMPLATES,
} from '@/lib/growth/socialPostTemplates';
import {
  buildAdminOptionalContext,
  buildSocialPostPromptMessages,
  parseGeneratedSocialPostCopy,
} from '@/lib/growth/socialPostCopyHelpers';

describe('socialPostTemplates', () => {
  it('exposes templates for each channel in the weekly calendar', () => {
    const channels = new Set(SOCIAL_POST_TEMPLATES.map((t) => t.channel));
    expect(channels.has('whatsapp')).toBe(true);
    expect(channels.has('facebook')).toBe(true);
    expect(channels.has('x')).toBe(true);
  });

  it('lists templates filtered by channel', () => {
    const fb = listTemplatesForChannel('facebook');
    expect(fb.length).toBeGreaterThanOrEqual(2);
    expect(fb.every((t) => t.channel === 'facebook')).toBe(true);
  });

  it('resolves template by id', () => {
    expect(getSocialPostTemplate('x-curiosity-hook')?.kind).toBe('curiosity_hook');
    expect(getSocialPostTemplate('missing')).toBeUndefined();
  });
});

describe('generateSocialPostCopy helpers', () => {
  it('builds optional admin context', () => {
    const ctx = buildAdminOptionalContext({
      templateId: 'x-curiosity-hook',
      capabilityBullet: 'Unified chart',
      mythTopic: 'Apps are separate',
    });
    expect(ctx).toContain('Unified chart');
    expect(ctx).toContain('Apps are separate');
  });

  it('builds prompt messages with brand one-liner', () => {
    const template = getSocialPostTemplate('threads-short-hook');
    expect(template).toBeDefined();
    const { system, user } = buildSocialPostPromptMessages(template!, { templateId: template!.id });
    expect(system).toContain(FUTURESEER_CORE_MESSAGE);
    expect(user).toContain('Threads');
  });

  it('parses LLM JSON into copy fields', () => {
    const parsed = parseGeneratedSocialPostCopy(
      {
        headline: 'Hook',
        primary: 'Body text',
        bullets: ['One', 'Two'],
        hashtags: '#FutureSeer',
        cta: 'Visit https://futureseer.app',
        notes: 'Use share card',
      },
      'instagram-reel-caption',
      'instagram',
    );
    expect(parsed.primary).toBe('Body text');
    expect(parsed.bullets).toHaveLength(2);
    expect(parsed.cta).toContain('futureseer.app');
  });
});
