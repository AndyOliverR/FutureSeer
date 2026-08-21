'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import type { AdditionalProfile } from '@/lib/types/profileTypes';
import type { VedicRelationshipAnalysis } from '@/lib/vedic/vedicRelationshipReport';
import {
  toVedicFocusedReportApiProfile,
  type VedicFocusedReportUserInput,
} from '@/lib/vedic/vedicFocusedReportProfile';
import { fetchWithFirebaseAuthRequired } from '@/lib/clientFirebaseFetch';
import { AlertCircle, Calendar, Heart, Loader2, MessageCircle, RefreshCw, Users } from 'lucide-react';

interface VedicRelationshipReportPanelProps {
  userId: string;
  userProfile: VedicFocusedReportUserInput;
  vedicChartData?: Record<string, unknown> | null;
  cachedReport?: VedicRelationshipAnalysis | null;
  selectedPartner?: AdditionalProfile | null;
  onAskSeer?: () => void;
  compatibilityHref?: string;
}

export function VedicRelationshipReportPanel({
  userId,
  userProfile,
  vedicChartData,
  cachedReport,
  selectedPartner,
  onAskSeer,
  compatibilityHref = '/tools/vedic?tab=compatibility',
}: VedicRelationshipReportPanelProps) {
  const [report, setReport] = useState<VedicRelationshipAnalysis | null>(cachedReport ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!userProfile?.birthDate || !userProfile?.birthPlace) return;
    setLoading(true);
    setError(null);
    try {
      const partner = selectedPartner
        ? {
            name: selectedPartner.name,
            dateOfBirth: selectedPartner.dateOfBirth,
            timeOfBirth: selectedPartner.timeOfBirth,
            birthPlace: selectedPartner.birthPlace,
            relationshipType: selectedPartner.relationshipType,
          }
        : undefined;

      const res = await fetchWithFirebaseAuthRequired('/api/vedic/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userProfile: toVedicFocusedReportApiProfile(userProfile),
          vedicChartData,
          partner,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load relationships report');
      }
      setReport(json.data?.relationshipAnalysis ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [userId, userProfile, vedicChartData, selectedPartner]);

  useEffect(() => {
    if (userId && userProfile?.birthDate) {
      void fetchReport();
    }
  }, [userId, userProfile?.birthDate, selectedPartner?.id, fetchReport]);

  if (loading && !report) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-amber-200/80">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p className="text-sm">Reading connection, compatibility, and timing from your chart…</p>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
        <p className="text-slate-300 text-sm mb-4">{error}</p>
        <Button onClick={() => void fetchReport()} variant="outline" className="border-amber-500/40">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-500/25 bg-slate-900/50 p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-heading text-amber-400 tracking-wide flex items-center gap-2">
          <Heart className="h-5 w-5" /> Love & relationships
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-xl">
          Connection, compatibility, and timing — 7th house, Venus, Moon, and D9 — explained in plain language.
        </p>
        {selectedPartner && (
          <p className="text-xs text-amber-200/70 mt-2">
            Including themes with <span className="text-amber-300">{selectedPartner.name}</span> (from your saved profile).
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-4">
          {onAskSeer && (
            <Button
              type="button"
              onClick={onAskSeer}
              className="bg-amber-500/90 hover:bg-amber-500 text-slate-900"
            >
              <MessageCircle className="h-4 w-4 mr-2" /> Ask the Seer
            </Button>
          )}
          <Button asChild variant="outline" className="border-amber-500/40 text-amber-200">
            <Link href={compatibilityHref}>
              <Users className="h-4 w-4 mr-2" /> Compare two charts
            </Link>
          </Button>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={['profile', 'compatibility']} className="space-y-2">
        <AccordionItem value="profile" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium">Your connection profile</AccordionTrigger>
          <AccordionContent className="text-slate-300 text-sm leading-relaxed">{report.relationshipProfile}</AccordionContent>
        </AccordionItem>

        <AccordionItem value="d9" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium">D9 Navamsa</AccordionTrigger>
          <AccordionContent className="text-slate-300 text-sm">{report.d9Navamsa}</AccordionContent>
        </AccordionItem>

        <AccordionItem value="dasha" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium">Dasha & relationships</AccordionTrigger>
          <AccordionContent className="text-slate-300 text-sm">{report.dashaRelationships}</AccordionContent>
        </AccordionItem>

        <AccordionItem value="venus-moon" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium">Venus & Moon</AccordionTrigger>
          <AccordionContent className="text-slate-300 text-sm">{report.venusAndMoon}</AccordionContent>
        </AccordionItem>

        <AccordionItem value="patterns" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium">Partnership patterns</AccordionTrigger>
          <AccordionContent className="text-slate-300 text-sm">{report.partnershipPatterns}</AccordionContent>
        </AccordionItem>

        <AccordionItem value="compatibility" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium">Connection & compatibility</AccordionTrigger>
          <AccordionContent className="text-slate-300 text-sm">{report.connectionCompatibility}</AccordionContent>
        </AccordionItem>

        <AccordionItem value="timing" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Relationship timing
          </AccordionTrigger>
          <AccordionContent className="text-slate-300 text-sm">{report.relationshipTiming}</AccordionContent>
        </AccordionItem>

        {report.thirtyDayThemes.length > 0 && (
          <AccordionItem value="30day" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
            <AccordionTrigger className="text-amber-300 font-medium">Next 30 days</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                {report.thirtyDayThemes.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="months" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium">Month-by-month (12 months)</AccordionTrigger>
          <AccordionContent className="space-y-3">
            {report.monthByMonth.map((m) => (
              <div key={m.month} className="text-sm">
                <p className="text-amber-400 font-medium">{m.month}</p>
                <p className="text-slate-300">{m.focus}</p>
                <ul className="list-disc list-inside text-slate-400 mt-1">
                  {m.actions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
                {m.caution && <p className="text-slate-500 text-xs mt-1">Caution: {m.caution}</p>}
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="advice" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium">Practical guidance</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
              {report.partnershipAdvice.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="remedies" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium">Remedies for connection</AccordionTrigger>
          <AccordionContent className="text-slate-300 text-sm">{report.remediesForConnection}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
