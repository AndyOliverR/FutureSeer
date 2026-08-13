'use client';

import { useCallback, useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import type { VedicCareerAnalysis } from '@/lib/vedic/vedicCareerReport';
import { extractPersistedCareerAnalysis } from '@/lib/vedic/vedicCareerReport';
import {
  toVedicFocusedReportApiProfile,
  type VedicFocusedReportUserInput,
} from '@/lib/vedic/vedicFocusedReportProfile';
import { fetchWithFirebaseAuthRequired } from '@/lib/clientFirebaseFetch';
import { AlertCircle, Briefcase, Calendar, Loader2, MessageCircle, RefreshCw, Target, TrendingUp } from 'lucide-react';

interface VedicCareerReportPanelProps {
  userId: string;
  userProfile: VedicFocusedReportUserInput;
  vedicChartData?: Record<string, unknown> | null;
  cachedReport?: VedicCareerAnalysis | null;
  onAskSeer?: () => void;
}

export function VedicCareerReportPanel({
  userId,
  userProfile,
  vedicChartData,
  cachedReport,
  onAskSeer,
}: VedicCareerReportPanelProps) {
  const [report, setReport] = useState<VedicCareerAnalysis | null>(cachedReport ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!userProfile?.birthDate || !userProfile?.birthPlace) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithFirebaseAuthRequired('/api/vedic/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userProfile: toVedicFocusedReportApiProfile(userProfile),
          vedicChartData,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load career report');
      }
      setReport(json.data?.careerAnalysis ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load career report');
    } finally {
      setLoading(false);
    }
  }, [userId, userProfile, vedicChartData]);

  useEffect(() => {
    if (cachedReport) {
      setReport(cachedReport);
      return;
    }
    const fromChart = extractPersistedCareerAnalysis(vedicChartData);
    if (fromChart) {
      setReport(fromChart);
      return;
    }
    if (userId && userProfile?.birthDate) {
      void fetchReport();
    }
  }, [cachedReport, vedicChartData, userId, userProfile?.birthDate, fetchReport]);

  if (loading && !report) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-amber-200/80">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p className="text-sm">Building your career & timing report from your chart…</p>
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
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-heading text-amber-400 tracking-wide flex items-center gap-2">
              <Briefcase className="h-5 w-5" /> Career & timing
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Direction, wealth houses, dasha windows, and a 7-day action plan — from your Vedic chart, in plain language.
            </p>
          </div>
          <div className="text-center sm:text-right shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-amber-500/80 block">Alignment</span>
            <span className="text-3xl font-heading text-amber-300">{report.alignmentScore.score}/10</span>
          </div>
        </div>
        {onAskSeer && (
          <Button
            type="button"
            onClick={onAskSeer}
            className="mt-4 w-full sm:w-auto bg-amber-500/90 hover:bg-amber-500 text-slate-900"
          >
            <MessageCircle className="h-4 w-4 mr-2" /> Ask the Seer about this report
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={['profile', 'seven-day']} className="space-y-2">
        <AccordionItem value="profile" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium">Your career profile</AccordionTrigger>
          <AccordionContent className="text-slate-300 text-sm leading-relaxed">{report.careerProfile}</AccordionContent>
        </AccordionItem>

        <AccordionItem value="dasha" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium">Dasha — current & next</AccordionTrigger>
          <AccordionContent className="space-y-3 text-sm text-slate-300">
            <p>{report.dashaCareer}</p>
            <p className="text-slate-400 border-t border-slate-700/50 pt-3">{report.nextDashaCareer}</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="yogas" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium">Career yogas</AccordionTrigger>
          <AccordionContent className="text-slate-300 text-sm">{report.careerYogas}</AccordionContent>
        </AccordionItem>

        <AccordionItem value="wealth" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium">Money & wealth (2nd / 11th)</AccordionTrigger>
          <AccordionContent className="text-slate-300 text-sm">{report.moneyAndWealth}</AccordionContent>
        </AccordionItem>

        <AccordionItem value="venus" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium">Venus — income & magnetism</AccordionTrigger>
          <AccordionContent className="text-slate-300 text-sm">{report.venusCareer}</AccordionContent>
        </AccordionItem>

        <AccordionItem value="timing" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Career timing
          </AccordionTrigger>
          <AccordionContent className="text-slate-300 text-sm">{report.careerTiming}</AccordionContent>
        </AccordionItem>

        {report.doshaAlerts && (
          <AccordionItem value="dosha" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
            <AccordionTrigger className="text-amber-300 font-medium">Dosha notes (workplace)</AccordionTrigger>
            <AccordionContent className="text-slate-300 text-sm">{report.doshaAlerts}</AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="seven-day" className="border-2 border-amber-500/40 rounded-xl px-4 bg-amber-950/20">
          <AccordionTrigger className="text-amber-200 font-semibold">7-day action plan</AccordionTrigger>
          <AccordionContent className="space-y-4">
            {report.sevenDayPlan.map((day) => (
              <div key={day.day} className="rounded-lg border border-amber-500/20 p-3 bg-slate-900/50">
                <p className="text-amber-400 text-xs font-bold uppercase tracking-wider">{day.label}</p>
                <p className="text-white text-sm font-medium mt-1">{day.theme}</p>
                <p className="text-slate-400 text-xs mt-1 italic">{day.chartReason}</p>
                <p className="text-slate-200 text-sm mt-2"><strong>Action:</strong> {day.action}</p>
                <p className="text-slate-400 text-xs mt-1">{day.directionColour}</p>
                <p className="text-amber-200/80 text-xs mt-2">Evening: {day.eveningCheck}</p>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="months" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Month-by-month (12 months)
          </AccordionTrigger>
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

        <AccordionItem value="paths" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium flex items-center gap-2">
            <Target className="h-4 w-4" /> Career paths
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {report.careerPaths.map((p) => (
              <div key={p.title} className="text-sm border-b border-slate-700/40 pb-2 last:border-0">
                <p className="text-white font-medium">{p.title}</p>
                <p className="text-slate-400">{p.fit}</p>
                <p className="text-amber-200/90 text-xs mt-1">Tip: {p.actionTip}</p>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="advice" className="border border-amber-500/20 rounded-xl px-4 bg-slate-900/40">
          <AccordionTrigger className="text-amber-300 font-medium">Next 90 days</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
              {report.actionableAdvice.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
            {report.alignmentScore.bullets.length > 0 && (
              <ul className="mt-3 list-disc list-inside text-slate-400 text-xs">
                {report.alignmentScore.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {loading && (
        <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" /> Refreshing…
        </p>
      )}
    </div>
  );
}
