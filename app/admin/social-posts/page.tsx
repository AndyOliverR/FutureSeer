'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, Megaphone, Newspaper } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { NewspaperArticleGenerator } from '@/components/admin/NewspaperArticleGenerator';
import { NewspaperOutreachOverview } from '@/components/admin/NewspaperOutreachOverview';
import { SocialPostGenerator } from '@/components/admin/SocialPostGenerator';
import { WeeklyDigestActions } from '@/components/admin/WeeklyDigestActions';
import { WeeklySocialQueue, type QueueSelection } from '@/components/admin/WeeklySocialQueue';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SocialChannel } from '@/lib/growth/socialPostTemplates';
import { getQueueItemByChannel, getTodayQueueItem } from '@/lib/growth/weeklySocialQueue';

type GrowthTab = 'social' | 'newspaper';

const TAB_TRIGGER_CLASS =
  'flex-1 gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors data-[state=active]:border-amber-500 data-[state=active]:bg-amber-600 data-[state=active]:text-slate-950 data-[state=inactive]:border-slate-600/60 data-[state=inactive]:bg-slate-900/60 data-[state=inactive]:text-slate-300 data-[state=inactive]:hover:border-amber-500/40 data-[state=inactive]:hover:text-slate-100';

function parseChannelParam(value: string | null): SocialChannel | undefined {
  const allowed: SocialChannel[] = [
    'whatsapp',
    'facebook',
    'threads',
    'instagram',
    'youtube',
    'linkedin',
    'x',
  ];
  return allowed.includes(value as SocialChannel) ? (value as SocialChannel) : undefined;
}

function parseTabParam(value: string | null): GrowthTab {
  return value === 'newspaper' ? 'newspaper' : 'social';
}

export default function AdminSocialPostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, isSuperadmin, loading: authLoading } = useAuth();

  const urlTab = parseTabParam(searchParams.get('tab'));
  const [activeTab, setActiveTab] = useState<GrowthTab>(urlTab);

  const todayItem = useMemo(() => getTodayQueueItem(), []);

  const urlChannel = parseChannelParam(searchParams.get('channel'));
  const urlTemplate = searchParams.get('template');

  const defaultSelection = useMemo((): QueueSelection => {
    const item = todayItem;
    return { channel: item.channel, templateId: item.defaultTemplateId };
  }, [todayItem]);

  const urlDrivenSelection = useMemo((): QueueSelection | null => {
    if (!urlChannel) return null;
    const item = getQueueItemByChannel(urlChannel) ?? todayItem;
    return {
      channel: urlChannel,
      templateId: urlTemplate ?? item.defaultTemplateId,
    };
  }, [urlChannel, urlTemplate, todayItem]);

  const [manualSelection, setManualSelection] = useState<QueueSelection | null>(null);

  const queueSelection = urlDrivenSelection ?? manualSelection ?? defaultSelection;
  const activeChannel = queueSelection.channel;

  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  const setTab = useCallback(
    (tab: GrowthTab) => {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'social') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const qs = params.toString();
      router.replace(qs ? `/admin/social-posts?${qs}` : '/admin/social-posts', { scroll: false });
      if (tab === 'newspaper') {
        requestAnimationFrame(() => {
          document.getElementById('newspaper-generator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    },
    [router, searchParams],
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/signin?redirect=/admin/social-posts');
      return;
    }
    if (!isAdmin && !isSuperadmin) {
      router.replace('/');
    }
  }, [authLoading, user, isAdmin, isSuperadmin, router]);

  const getIdToken = useCallback(async () => {
    if (!user) throw new Error('Not signed in');
    return user.getIdToken();
  }, [user]);

  const handleQueueSelect = useCallback((selection: QueueSelection) => {
    setManualSelection(selection);
    setTab('social');
    const el = document.getElementById('social-post-generator');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [setTab]);

  const handleChannelChange = useCallback(
    (channel: SocialChannel) => {
      setManualSelection((prev) => {
        const base = prev ?? urlDrivenSelection ?? defaultSelection;
        return { ...base, channel };
      });
    },
    [urlDrivenSelection, defaultSelection],
  );

  if (authLoading || !user || (!isAdmin && !isSuperadmin)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 pb-20">
        <Button asChild type="button" variant="outline" size="sm" className="mb-6 text-xs">
          <Link href="/admin/dashboard">Back to Admin Dashboard</Link>
        </Button>

        <header className="mb-6">
          <h1 className="flex items-center gap-2 text-xl font-semibold text-slate-200 mb-2">
            <Megaphone className="h-5 w-5 text-amber-400" />
            Growth content generator
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl">
            Two tools in one place: <strong className="font-medium text-slate-300">weekly social queue</strong> (IST +
            UTC) and <strong className="font-medium text-slate-300">newspaper / outreach drafts</strong> for TOI and
            press pitches. Copy-only — no auto-posting.
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={(v) => setTab(v as GrowthTab)} className="space-y-6">
          <TabsList className="grid h-auto w-full max-w-2xl grid-cols-2 gap-2 bg-transparent p-0">
            <TabsTrigger value="social" className={TAB_TRIGGER_CLASS}>
              <CalendarDays className="h-4 w-4 shrink-0" />
              Social queue
            </TabsTrigger>
            <TabsTrigger value="newspaper" className={TAB_TRIGGER_CLASS}>
              <Newspaper className="h-4 w-4 shrink-0" />
              Newspaper &amp; outreach
            </TabsTrigger>
          </TabsList>

          <TabsContent value="social" className="space-y-6 mt-0">
            <NewspaperOutreachOverview compact onOpenGenerator={() => setTab('newspaper')} />

            <WeeklySocialQueue onSelectDay={handleQueueSelect} selectedChannel={activeChannel} />
            <WeeklyDigestActions getIdToken={getIdToken} />
            <div id="social-post-generator">
              <SocialPostGenerator
                key={`${queueSelection.channel}:${queueSelection.templateId}`}
                getIdToken={getIdToken}
                initialChannel={queueSelection.channel}
                initialTemplateId={queueSelection.templateId}
                onChannelChange={handleChannelChange}
              />
            </div>
          </TabsContent>

          <TabsContent value="newspaper" className="space-y-6 mt-0" id="newspaper-generator">
            <NewspaperOutreachOverview />
            <NewspaperArticleGenerator getIdToken={getIdToken} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
