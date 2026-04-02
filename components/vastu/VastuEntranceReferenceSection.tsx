'use client';

import { BookOpen } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useIsMobileLayout } from '@/hooks/useIsMobileLayout';
import { VASTU_REFERENCE_DISCLAIMER } from '@/lib/vastu16ZoneReference';
import { PADAS_BY_QUADRANT, VASTU_32_ENTRANCE_REFERENCE_NOTES } from '@/lib/vastu32EntranceReferenceNotes';
import type { PadaQuadrant } from '@/lib/vastu32EntranceReferenceNotes';
import { getPadaById } from '@/lib/vastu32Padas';
import { VastuReferenceCompass } from '@/components/vastu/VastuReferenceCompass';

const QUADRANT_LABELS: Record<PadaQuadrant, string> = {
  north: 'North (N1–N8)',
  east: 'East (E1–E8)',
  south: 'South (S1–S8)',
  west: 'West (W1–W8)',
};

const QUADRANT_ORDER: PadaQuadrant[] = ['north', 'east', 'south', 'west'];

/** North blue, East green, South red, West gold — card + label accents per quadrant. */
const QUADRANT_ACCENT: Record<
  PadaQuadrant,
  {
    trigger: string;
    cardWeb: string;
    cardMobile: string;
    padaWeb: string;
    padaMobile: string;
    idWeb: string;
    idMobile: string;
  }
> = {
  north: {
    trigger: 'border-l-4 border-l-blue-500 pl-3',
    cardWeb: 'border-blue-200/90 bg-blue-50/50',
    cardMobile: 'border-blue-500/35 bg-blue-950/25',
    padaWeb: 'text-blue-800',
    padaMobile: 'text-blue-200',
    idWeb: 'text-blue-700',
    idMobile: 'text-blue-200',
  },
  east: {
    trigger: 'border-l-4 border-l-emerald-600 pl-3',
    cardWeb: 'border-emerald-200/90 bg-emerald-50/50',
    cardMobile: 'border-emerald-600/35 bg-emerald-950/25',
    padaWeb: 'text-emerald-800',
    padaMobile: 'text-emerald-200',
    idWeb: 'text-emerald-800',
    idMobile: 'text-emerald-200',
  },
  south: {
    trigger: 'border-l-4 border-l-red-600 pl-3',
    cardWeb: 'border-red-200/90 bg-red-50/40',
    cardMobile: 'border-red-600/35 bg-red-950/25',
    padaWeb: 'text-red-800',
    padaMobile: 'text-red-200',
    idWeb: 'text-red-800',
    idMobile: 'text-red-200',
  },
  west: {
    trigger: 'border-l-4 border-l-amber-400 pl-3',
    cardWeb: 'border-amber-200/90 bg-amber-50/40',
    cardMobile: 'border-amber-500/35 bg-slate-800/40',
    padaWeb: 'text-amber-900',
    padaMobile: 'text-amber-100',
    idWeb: 'text-amber-900',
    idMobile: 'text-amber-100',
  },
};

/**
 * Educational 16-zone compass + 32-pada entrance reference copy for the Main Entrance tab.
 * Not a substitute for personalized analysis when available.
 */
export function VastuEntranceReferenceSection() {
  const isMobile = useIsMobileLayout();

  return (
    <section
      className={cn(
        'rounded-2xl border-2 p-4 shadow-sm sm:p-6',
        isMobile ? 'border-amber-700/40 bg-slate-900/80' : 'border-amber-300/80 bg-amber-50/70'
      )}
      aria-labelledby="vastu-entrance-reference-heading"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
          <BookOpen className="h-6 w-6 text-white" aria-hidden />
        </div>
        <div>
          <h3
            id="vastu-entrance-reference-heading"
            className={cn('text-xl font-bold sm:text-2xl', isMobile ? 'text-amber-100' : 'text-amber-900')}
          >
            Compass & entrance segments (educational reference)
          </h3>
          <p className={cn('mt-1 text-sm', isMobile ? 'text-slate-300' : 'text-slate-600')}>
            Explore 16 directional zones and 32 main-door segments (padas). Schools vary; this is a general map.
          </p>
        </div>
      </div>

      <div
        className={cn(
          'mb-10 flex gap-3 rounded-xl border p-3 text-xs',
          isMobile ? 'border-slate-600/60 bg-slate-950/50 text-slate-300' : 'border-amber-200/80 bg-white/60 text-slate-700'
        )}
        role="note"
      >
        <span className={cn('font-semibold', isMobile ? 'text-amber-300' : 'text-amber-800')}>Disclaimer:</span>
        <p>{VASTU_REFERENCE_DISCLAIMER}</p>
      </div>

      <VastuReferenceCompass className="mb-10" />

      <div className="mt-2">
        <h4 className={cn('mb-3 text-lg font-semibold', isMobile ? 'text-amber-100' : 'text-amber-900')}>
          Main door segments by quadrant
        </h4>
        <p className={cn('mb-4 text-sm', isMobile ? 'text-slate-400' : 'text-slate-600')}>
          Each segment shows the <span className="font-medium">deity name</span> for that pada, a{' '}
          <span className="font-medium">reference note</span> (general traditional themes), and{' '}
          <span className="font-medium">effects</span> from the chart when wording differs between sources.
        </p>
        <Accordion type="single" collapsible defaultValue="north" className="w-full">
          {QUADRANT_ORDER.map((q) => {
            const accent = QUADRANT_ACCENT[q];
            return (
              <AccordionItem
                key={q}
                value={q}
                className={cn(isMobile ? 'border-slate-700' : 'border-amber-200/80')}
              >
                <AccordionTrigger
                  className={cn(
                    'text-left hover:no-underline',
                    accent.trigger,
                    isMobile ? 'text-amber-100' : 'text-amber-900'
                  )}
                >
                  {QUADRANT_LABELS[q]}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-4 pt-1">
                    {PADAS_BY_QUADRANT[q].map((id) => {
                      const pada = getPadaById(id);
                      const note = VASTU_32_ENTRANCE_REFERENCE_NOTES[id];
                      return (
                        <li
                          key={id}
                          className={cn(
                            'rounded-xl border p-4',
                            isMobile ? accent.cardMobile : accent.cardWeb
                          )}
                        >
                          <div className="flex flex-wrap items-baseline gap-3">
                            <span
                              className={cn(
                                'font-mono text-base font-bold',
                                isMobile ? accent.idMobile : accent.idWeb
                              )}
                            >
                              {id}
                            </span>
                            {pada && (
                              <span
                                className={cn(
                                  'text-sm font-semibold',
                                  isMobile ? accent.padaMobile : accent.padaWeb
                                )}
                              >
                                {pada.deity}
                              </span>
                            )}
                          </div>
                          <p
                            className={cn(
                              'mt-2 text-sm leading-relaxed',
                              isMobile ? 'text-slate-300' : 'text-slate-700'
                            )}
                          >
                            <span
                              className={cn('font-medium', isMobile ? 'text-amber-200' : 'text-amber-900')}
                            >
                              Reference note:{' '}
                            </span>
                            {note}
                          </p>
                          {pada && pada.effects.length > 0 && (
                            <p className={cn('mt-2 text-xs', isMobile ? 'text-slate-400' : 'text-slate-500')}>
                              <span className={cn('font-medium', isMobile ? 'text-slate-400' : 'text-slate-600')}>
                                Effects:{' '}
                              </span>
                              {pada.effects.join(', ')}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
}
