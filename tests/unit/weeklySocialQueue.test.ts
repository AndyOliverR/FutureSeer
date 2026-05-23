import { getSchedulerLink } from '@/lib/growth/socialSchedulerLinks';
import {
  adminSocialPostsUrl,
  getTodayQueueItem,
  WEEKLY_SOCIAL_QUEUE,
} from '@/lib/growth/weeklySocialQueue';
import { buildWeeklySocialDigestHtml } from '@/lib/growth/socialWeeklyDigestContent';

describe('weeklySocialQueue', () => {
  it('has seven days Sun–Sat', () => {
    expect(WEEKLY_SOCIAL_QUEUE).toHaveLength(7);
    expect(WEEKLY_SOCIAL_QUEUE[0].channel).toBe('whatsapp');
    expect(WEEKLY_SOCIAL_QUEUE[1].channel).toBe('facebook');
  });

  it('resolves today from weekday index', () => {
    const monday = new Date('2026-05-18T12:00:00'); // Monday UTC
    const item = getTodayQueueItem(monday);
    expect(item.channel).toBe('facebook');
  });

  it('builds admin deep links with channel and template', () => {
    const url = adminSocialPostsUrl({
      baseUrl: 'https://futureseer.app',
      channel: 'linkedin',
      templateId: 'linkedin-unified-stack',
    });
    expect(url).toContain('channel=linkedin');
    expect(url).toContain('template=linkedin-unified-stack');
  });
});

describe('socialSchedulerLinks', () => {
  it('returns URLs for each channel', () => {
    expect(getSchedulerLink('facebook').url).toContain('business.facebook.com');
    expect(getSchedulerLink('x').url).toContain('compose');
  });
});

describe('socialWeeklyDigestEmail', () => {
  it('builds HTML with all queue days', () => {
    const html = buildWeeklySocialDigestHtml('https://futureseer.app');
    expect(html).toContain('Sunday');
    expect(html).toContain('Generate copy');
    expect(html).toContain('admin/social-posts');
  });
});
