'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import {
  formatPartialGenerationBody,
  formatPartialGenerationHeadline,
  type FailedToolSummary,
} from '@/lib/generationFailureUx';
import { fsAdaptivePanel } from '@/lib/designSystemClasses';
import { Button } from '@/components/ui/button';

type Props = {
  failedTools: FailedToolSummary[];
  variant?: 'm3' | 'web';
};

export function GenerationPartialFailureBanner({ failedTools, variant = 'web' }: Props) {
  if (failedTools.length === 0) return null;

  const isM3 = variant === 'm3';
  const headline = formatPartialGenerationHeadline(failedTools.length);
  const body = formatPartialGenerationBody(failedTools.length);
  const preview = failedTools.slice(0, 6);
  const remaining = failedTools.length - preview.length;

  return (
    <div
      className={`${fsAdaptivePanel} mb-6 p-5`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex gap-3">
        <AlertTriangle
          className={isM3 ? 'h-6 w-6 shrink-0 text-[var(--m3-error)]' : 'h-6 w-6 shrink-0 text-amber-400'}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <h2
            className={
              isM3
                ? 'text-base font-medium text-on-surface mb-1'
                : 'text-lg font-serif font-semibold text-amber-200 mb-1'
            }
          >
            {headline}
          </h2>
          <p className={isM3 ? 'text-sm text-on-surface-variant mb-3' : 'text-sm text-slate-300 mb-3'}>
            {body}
          </p>
          <ul
            className={
              isM3
                ? 'mb-4 list-disc pl-5 text-sm text-on-surface-variant space-y-0.5'
                : 'mb-4 list-disc pl-5 text-sm text-slate-400 space-y-0.5'
            }
          >
            {preview.map((tool) => (
              <li key={tool.slug}>{tool.label}</li>
            ))}
            {remaining > 0 ? <li>+{remaining} more</li> : null}
          </ul>
          <Button asChild size="sm" variant={isM3 ? 'default' : 'outline'}>
            <Link href="/profile">Retry from Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
