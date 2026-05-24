'use client';

import { CalendarDays, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getTodayQueueItem,
  WEEKLY_SOCIAL_QUEUE,
  type WeeklyQueueItem,
} from '@/lib/growth/weeklySocialQueue';
import { cn } from '@/lib/utils';

export interface QueueSelection {
  channel: WeeklyQueueItem['channel'];
  templateId: string;
}

interface WeeklySocialQueueProps {
  onSelectDay: (selection: QueueSelection) => void;
  selectedChannel?: WeeklyQueueItem['channel'];
}

export function WeeklySocialQueue({ onSelectDay, selectedChannel }: WeeklySocialQueueProps) {
  const today = getTodayQueueItem();

  return (
    <Card className="admin-card border-slate-600/50 text-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-slate-100">
          <CalendarDays className="h-4 w-4 text-amber-400" />
          This week&apos;s queue
        </CardTitle>
        <p className="text-sm text-slate-400">
          Today: <span className="text-amber-200/90">{today.dayName}</span> — {today.channelLabel} at{' '}
          {today.postTimeIst} ({today.postTimeUtc}). Generate copy below, then paste in the scheduler (no auto-post).
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {WEEKLY_SOCIAL_QUEUE.map((item) => {
          const isToday =
            item.dayIndex === today.dayIndex;
          const isSelected = selectedChannel === item.channel;

          return (
            <div
              key={item.dayIndex}
              className={cn(
                'flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between',
                isToday ? 'border-amber-500/50 bg-amber-950/20' : 'border-slate-600/50 bg-slate-900/40',
                isSelected && 'ring-1 ring-amber-400/60',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-100">{item.dayName}</span>
                  {isToday ? (
                    <Badge variant="outline" className="border-amber-500/60 text-amber-200">
                      Today
                    </Badge>
                  ) : null}
                  <span className="text-sm text-slate-400">{item.channelLabel}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {item.defaultTemplateLabel} — {item.calendarHint}
                </p>
                <p className="mt-1 text-xs text-amber-200/80">
                  Post at {item.postTimeIst} · {item.postTimeUtc}
                  {item.timingNote ? ` — ${item.timingNote}` : ''}
                </p>
                {item.postingNote ? (
                  <p className="mt-1 text-xs text-slate-500 italic">{item.postingNote}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-slate-500 text-slate-200"
                  asChild
                >
                  <a href={item.scheduler.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-3.5 w-3.5" />
                    {item.scheduler.manualOnly ? 'Open app' : 'Scheduler'}
                  </a>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="gap-1 bg-amber-600 text-slate-950 hover:bg-amber-500"
                  onClick={() =>
                    onSelectDay({
                      channel: item.channel,
                      templateId: item.defaultTemplateId,
                    })
                  }
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
