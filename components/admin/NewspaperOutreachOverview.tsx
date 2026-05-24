'use client';

import { ExternalLink, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NEWSPAPER_OUTLETS } from '@/lib/growth/newspaperOutlets';
import { cn } from '@/lib/utils';

interface NewspaperOutreachOverviewProps {
  compact?: boolean;
  onOpenGenerator?: () => void;
  className?: string;
}

export function NewspaperOutreachOverview({
  compact = false,
  onOpenGenerator,
  className,
}: NewspaperOutreachOverviewProps) {
  if (compact) {
    return (
      <Card className={cn('admin-card border-amber-500/35 bg-amber-950/15 text-slate-200', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base text-slate-100">
            <Newspaper className="h-4 w-4 text-amber-400" />
            Newspaper &amp; outreach drafts
            <Badge variant="outline" className="border-amber-500/50 text-amber-200 font-normal">
              {NEWSPAPER_OUTLETS.length} outlets
            </Badge>
          </CardTitle>
          <p className="text-sm text-slate-400">
            AI-generated TOI Citizen Reporter stories, blog posts, NRI angles, and editor pitch emails — copy-only,
            submit manually.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            {NEWSPAPER_OUTLETS.map((o) => (
              <li key={o.id} className="rounded-md border border-slate-600/50 bg-slate-900/50 px-3 py-2">
                <span className="font-medium text-slate-100">{o.label}</span>
                <span className="block text-slate-500 mt-0.5">{o.targetWords} words · {o.description}</span>
              </li>
            ))}
          </ul>
          {onOpenGenerator ? (
            <Button
              type="button"
              className="gap-2 bg-amber-600 text-slate-950 hover:bg-amber-500"
              onClick={onOpenGenerator}
            >
              <Newspaper className="h-4 w-4" />
              Open newspaper generator
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('admin-card border-slate-600/50 text-slate-200', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-slate-100">
          <Newspaper className="h-4 w-4 text-amber-400" />
          Supported outlets
        </CardTitle>
        <p className="text-sm text-slate-400">
          Pick an outlet below to generate a submission-ready draft. Print classifieds are paid — this tool does not
          book ads.
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {NEWSPAPER_OUTLETS.map((o) => (
          <div
            key={o.id}
            className="rounded-lg border border-slate-600/50 bg-slate-900/40 p-4 space-y-2"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-slate-100">{o.label}</h3>
              <Badge variant="outline" className="border-slate-500 text-slate-400 text-[10px] shrink-0">
                {o.targetWords} words
              </Badge>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{o.description}</p>
            <p className="text-xs text-slate-500 italic">{o.submissionNotes}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 border-slate-500 text-slate-200"
              asChild
            >
              <a href={o.submissionUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" />
                {o.submissionLabel}
              </a>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
