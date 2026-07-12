'use client';

import { CheckCircle, Clock, XCircle } from 'lucide-react';
import {
  actionBandHint,
  actionBandLabel,
  actionBandScoreColor,
  scoreToActionBand,
} from '@/lib/dailyDecisionBands';

export function ActionBandBadge({ score }: { score: number }) {
  const band = scoreToActionBand(score);
  const Icon =
    band === 'favorable' ? CheckCircle : band === 'neutral' ? Clock : XCircle;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 shrink-0 ${actionBandScoreColor(band)}`} aria-hidden />
        <span className={`font-bold ${actionBandScoreColor(band)}`}>{actionBandLabel(band)}</span>
      </div>
      <p className="text-xs opacity-80">{actionBandHint(band)}</p>
    </div>
  );
}
