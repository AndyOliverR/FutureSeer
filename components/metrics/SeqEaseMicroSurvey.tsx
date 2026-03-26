'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SEQ_PROMPT_AFTER_PROFILE_GEN } from '@/lib/metricsSession';

const LABELS: Record<number, string> = {
  1: 'Very difficult',
  2: 'Difficult',
  3: 'Somewhat difficult',
  4: 'Neutral',
  5: 'Somewhat easy',
  6: 'Easy',
  7: 'Very easy',
};

type SeqEaseMicroSurveyProps = {
  userId?: string | null;
};

export function SeqEaseMicroSurvey({ userId }: SeqEaseMicroSurveyProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (sessionStorage.getItem(SEQ_PROMPT_AFTER_PROFILE_GEN) === '1') {
        sessionStorage.removeItem(SEQ_PROMPT_AFTER_PROFILE_GEN);
        queueMicrotask(() => setOpen(true));
      }
    } catch {
      /* private mode / quota */
    }
  }, []);

  const submit = async (score: number) => {
    try {
      await fetch('/api/metrics/seq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score,
          context: 'profile_generation_after',
          userId: userId ?? undefined,
          url: typeof window !== 'undefined' ? window.location.href : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        }),
      });
    } catch {
      /* best-effort */
    }
    setOpen(false);
  };

  const dismiss = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dismiss()}>
      <DialogContent className="max-w-md border-amber-500/30 bg-[#0b1220] text-amber-50 sm:rounded-xl">
        <DialogHeader>
          <DialogTitle id="seq-dialog-title" className="text-amber-100">
            Quick question
          </DialogTitle>
          <DialogDescription id="seq-dialog-desc" className="text-amber-100/70">
            Overall, how easy was it to generate your mystical profile? (1 = very difficult, 7 = very easy)
          </DialogDescription>
        </DialogHeader>
        <div
          className="grid grid-cols-7 gap-1.5 py-2"
          role="group"
          aria-labelledby="seq-dialog-title"
        >
          {([1, 2, 3, 4, 5, 6, 7] as const).map((n) => (
            <Button
              key={n}
              type="button"
              variant="outline"
              className="h-11 min-w-0 px-0 text-xs font-semibold border-amber-500/40 text-amber-100 hover:bg-amber-500/20"
              onClick={() => submit(n)}
              aria-label={`${n}, ${LABELS[n]}`}
            >
              {n}
            </Button>
          ))}
        </div>
        <DialogFooter className="sm:justify-center">
          <Button type="button" variant="ghost" className="text-amber-200/80" onClick={dismiss}>
            Not now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
