import {
  formatIstTime,
  formatScheduledTimeDisplay,
  istToUtcDisplay,
} from '@/lib/growth/socialPostSchedule';
import {
  buildNewspaperArticlePromptMessages,
  parseGeneratedNewspaperArticleCopy,
} from '@/lib/growth/newspaperArticleCopyHelpers';
import { getNewspaperOutlet, NEWSPAPER_OUTLETS } from '@/lib/growth/newspaperOutlets';
import {
  adminSocialPostsUrl,
  getTodayQueueItem,
  WEEKLY_SOCIAL_QUEUE,
} from '@/lib/growth/weeklySocialQueue';
import { buildWeeklySocialDigestHtml } from '@/lib/growth/socialWeeklyDigestContent';

describe('socialPostSchedule', () => {
  it('formats IST and UTC for a morning slot', () => {
    expect(formatIstTime(10, 0)).toBe('10:00 AM IST');
    expect(istToUtcDisplay(10, 0)).toBe('04:30 UTC');
  });

  it('formats evening WhatsApp slot', () => {
    const display = formatScheduledTimeDisplay({ hourIst: 19, minuteIst: 0 });
    expect(display.ist).toBe('7:00 PM IST');
    expect(display.utc).toBe('13:30 UTC');
  });
});

describe('weeklySocialQueue', () => {
  it('has seven days Sun–Sat with research-aligned channel order', () => {
    expect(WEEKLY_SOCIAL_QUEUE).toHaveLength(7);
    expect(WEEKLY_SOCIAL_QUEUE[0].channel).toBe('whatsapp');
    expect(WEEKLY_SOCIAL_QUEUE[1].channel).toBe('linkedin');
    expect(WEEKLY_SOCIAL_QUEUE[3].channel).toBe('facebook');
    expect(WEEKLY_SOCIAL_QUEUE[4].channel).toBe('x');
  });

  it('includes IST and UTC post times on each item', () => {
    const wed = WEEKLY_SOCIAL_QUEUE[3];
    expect(wed.postTimeIst).toContain('IST');
    expect(wed.postTimeUtc).toContain('UTC');
  });

  it('resolves today from weekday index', () => {
    const monday = new Date('2026-05-18T12:00:00');
    const item = getTodayQueueItem(monday);
    expect(item.channel).toBe('linkedin');
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

describe('newspaperOutlets', () => {
  it('lists TOI citizen reporter outlet', () => {
    expect(NEWSPAPER_OUTLETS.some((o) => o.id === 'toi-citizen-reporter')).toBe(true);
  });

  it('builds prompt messages for citizen reporter', () => {
    const outlet = getNewspaperOutlet('toi-citizen-reporter');
    expect(outlet).toBeDefined();
    const { system, user } = buildNewspaperArticlePromptMessages(outlet!, {
      outletId: outlet!.id,
      topicAngle: 'Digital literacy',
    });
    expect(system).toContain('Citizen Reporter');
    expect(user).toContain('Digital literacy');
  });

  it('parses generated article JSON', () => {
    const parsed = parseGeneratedNewspaperArticleCopy(
      {
        headline: 'Title',
        body: 'Body text',
        submissionChecklist: '1. Review',
      },
      'toi-blog',
    );
    expect(parsed.headline).toBe('Title');
    expect(parsed.body).toBe('Body text');
  });
});

describe('socialWeeklyDigestEmail', () => {
  it('builds HTML with all queue days and post times', () => {
    const html = buildWeeklySocialDigestHtml('https://futureseer.app');
    expect(html).toContain('Sunday');
    expect(html).toContain('IST');
    expect(html).toContain('UTC');
    expect(html).toContain('Generate copy');
    expect(html).toContain('admin/social-posts');
  });
});
