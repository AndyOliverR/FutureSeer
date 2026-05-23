'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { SocialPostGenerator } from '@/components/admin/SocialPostGenerator';
import { WeeklyDigestActions } from '@/components/admin/WeeklyDigestActions';
import { WeeklySocialQueue, type QueueSelection } from '@/components/admin/WeeklySocialQueue';
import { Button } from '@/components/ui/button';
import type { SocialChannel } from '@/lib/growth/socialPostTemplates';
import { getQueueItemByChannel, getTodayQueueItem } from '@/lib/growth/weeklySocialQueue';

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

export default function AdminSocialPostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, isSuperadmin, loading: authLoading } = useAuth();

  const todayItem = useMemo(() => getTodayQueueItem(), []);

  const urlChannel = parseChannelParam(searchParams.get('channel'));
  const urlTemplate = searchParams.get('template');

  const [queueSelection, setQueueSelection] = useState<QueueSelection>(() => {
    const ch = urlChannel ?? todayItem.channel;
    const item = getQueueItemByChannel(ch) ?? todayItem;
    const templateId = urlTemplate ?? item.defaultTemplateId;
    return { channel: item.channel, templateId };
  });

  const [activeChannel, setActiveChannel] = useState<SocialChannel>(queueSelection.channel);

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

  useEffect(() => {
    const ch = urlChannel;
    if (!ch) return;
    const item = getQueueItemByChannel(ch) ?? todayItem;
    setQueueSelection({
      channel: ch,
      templateId: urlTemplate ?? item.defaultTemplateId,
    });
    setActiveChannel(ch);
  }, [urlChannel, urlTemplate, todayItem]);

  const getIdToken = useCallback(async () => {
    if (!user) throw new Error('Not signed in');
    return user.getIdToken();
  }, [user]);

  const handleQueueSelect = useCallback((selection: QueueSelection) => {
    setQueueSelection(selection);
    setActiveChannel(selection.channel);
    const el = document.getElementById('social-post-generator');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  if (authLoading || !user || (!isAdmin && !isSuperadmin)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-16">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="sm" className="gap-1 text-slate-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Admin
          </Button>
        </Link>
      </div>

      <header className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-100">
          <Megaphone className="h-6 w-6 text-amber-400" />
          Social post generator
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Phase B + C-lite — weekly queue, AI copy, native schedulers. No auto-posting ($0 vs paid APIs).
        </p>
      </header>

      <div className="space-y-6">
        <WeeklySocialQueue onSelectDay={handleQueueSelect} selectedChannel={activeChannel} />
        <WeeklyDigestActions getIdToken={getIdToken} />
        <div id="social-post-generator">
          <SocialPostGenerator
            getIdToken={getIdToken}
            initialChannel={queueSelection.channel}
            initialTemplateId={queueSelection.templateId}
            onChannelChange={setActiveChannel}
          />
        </div>
      </div>
    </div>
  );
}
