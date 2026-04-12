/**
 * Profile Generation Orchestrator
 *
 * ONE-TIME, ATOMIC profile generation.
 * Runs ALL tools, stores each report separately, builds Master Seer Database.
 * Rule: Generation is one-time. Interpretation is continuous.
 * Do not add partial or subset regeneration; edited-profile flow requires full pipeline only.
 *
 * Feng Shui practical guides (wealthTips, practicalChecklist from lib/fengshui/practicalGuides.ts)
 * are computed on the Feng Shui tool page for v1; they are not added to stored Firestore payloads
 * unless the feng-shui tool API and schema are extended deliberately.
 */

import { UserProfile } from './firebase';
import { devLog } from '@/lib/devLogger';
import { getServerBaseUrl } from './serverBaseUrl';
import { calculateVedicNumerologyProfile } from './vedicNumerologyCalculations';
import { normalizeBirthTime } from './birthTimeUtils';
export interface ToolReportEntry {
  status: 'success' | 'failed';
  data?: Record<string, unknown>;
  error?: string;
  generatedAt: string;
  _usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export interface ToolReports {
  [toolSlug: string]: ToolReportEntry;
}

export interface SeerMasterData {
  core_identity: string[];
  life_purpose: string[];
  career_themes: string[];
  relationship_patterns: string[];
  health_tendencies: string[];
  timing_windows: string[];
  remedies: {
    gemstones: string[];
    mudras: string[];
    colors: string[];
    mantras: string[];
    behaviors: string[];
  };
}

export interface GenerationResult {
  success: boolean;
  toolReports: ToolReports;
  seerMaster: SeerMasterData;
  comprehensiveProfile: Record<string, unknown>;
  failedTools: string[];
  systemsUsed: string[];
  aggregateUsage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

/** Add usage from a tool API response body (_usage or usage) into the running aggregate. */
function addResponseUsage(
  aggregate: { promptTokens: number; completionTokens: number; totalTokens: number },
  body: unknown
): void {
  if (!body || typeof body !== 'object') return;
  const u = (body as Record<string, unknown>)._usage ?? (body as Record<string, unknown>).usage;
  if (!u || typeof u !== 'object') return;
  const p = (u as Record<string, unknown>).promptTokens;
  const c = (u as Record<string, unknown>).completionTokens;
  const t = (u as Record<string, unknown>).totalTokens;
  if (typeof p === 'number') aggregate.promptTokens += p;
  if (typeof c === 'number') aggregate.completionTokens += c;
  if (typeof t === 'number') aggregate.totalTokens += t;
}

/** List of all tools to run at profile generation time. No lazy loading. Exported so API can check for missing reports. */
export const ALL_TOOL_SLUGS = [
  'vedic',
  'western',
  'astrocartography',
  'esotericAstrology',
  'psychologicalAstrology',
  'shamanicAstrology',
  'kabbalisticAstrology',
  'hermeticAstrology',
  'hellenistic',
  'kp',
  'numerology',
  'tarot',
  'iching',
  'runes',
  'lenormand',
  'pendulum',
  'geomancy',
  'ogham',
  'sortilege',
  'palmistry',
  'faceReading',
  'nameAnalysis',
  'dreamSymbols',
  'angelNumbers',
  'kabbalisticNumerology',
  'navaratna',
  'trichakra',
  'fengShui',
  'vastu',
  'energyHealing',
  'dailyDecisions',
  'horary',
  'medicalAstrology',
  'financialAstrology',
  'mundaneAstrology',
  'synastry',
  'bazi',
  'ziweiDouShu',
  'humanDesign',
  'akashicRecords',
  'scrying',
  'bibliomancy',
] as const;

/** Run a single tool and return its report. Failures are caught; never throw. */
async function runTool(
  toolSlug: string,
  userId: string,
  profile: UserProfile,
  baseUrl: string
): Promise<ToolReportEntry> {
  const generatedAt = new Date().toISOString();
  try {
    switch (toolSlug) {
      case 'vedic': {
        const res = await fetch(`${baseUrl}/api/occult/universal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system: 'vedic',
            birthData: {
              birthDate: profile.birthDate,
              birthTime: profile.birthTime || '12:00:00',
              birthPlace: profile.birthPlace,
              latitude: profile.birthLatitude ?? 0,
              longitude: profile.birthLongitude ?? 0,
            },
          }),
        });
        if (!res.ok) throw new Error(`Vedic API: ${res.status}`);
        const data = await res.json();
        return { status: 'success', data: data.data ?? data, generatedAt, _usage: data._usage ?? data.usage };
      }

      case 'western': {
        const res = await fetch(`${baseUrl}/api/occult/universal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system: 'western',
            birthData: {
              birthDate: profile.birthDate,
              birthTime: profile.birthTime || '12:00:00',
              birthPlace: profile.birthPlace,
              latitude: profile.birthLatitude ?? 0,
              longitude: profile.birthLongitude ?? 0,
            },
            options: { includeTransits: true },
          }),
        });
        if (!res.ok) throw new Error(`Western API: ${res.status}`);
        const json = await res.json();
        const chartData = json.data ?? json;
        return { status: 'success', data: { chart: chartData }, generatedAt, _usage: json._usage ?? json.usage };
      }

      case 'astrocartography': {
        const res = await fetch(`${baseUrl}/api/astrocartography/comprehensive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            userProfile: profile,
            birthData: {
              birthDate: profile.birthDate,
              birthTime: profile.birthTime || '12:00:00',
              birthPlace: profile.birthPlace,
              latitude: profile.birthLatitude ?? 0,
              longitude: profile.birthLongitude ?? 0,
            },
          }),
        });
        if (!res.ok) throw new Error(`Astrocartography API: ${res.status}`);
        const json = await res.json();
        const report = json.data?.comprehensiveAnalysis ?? json.comprehensiveAnalysis ?? json.data;
        return { status: 'success', data: report ? { comprehensiveAnalysis: report } : json.data ?? json, generatedAt, _usage: json._usage ?? json.usage };
      }

      case 'esotericAstrology': {
        const res = await fetch(`${baseUrl}/api/esoteric-astrology/comprehensive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            userProfile: profile,
            birthData: {
              birthDate: profile.birthDate,
              birthTime: profile.birthTime || '12:00:00',
              birthPlace: profile.birthPlace,
              latitude: profile.birthLatitude ?? 0,
              longitude: profile.birthLongitude ?? 0,
            },
          }),
        });
        if (!res.ok) throw new Error(`Esoteric Astrology API: ${res.status}`);
        const json = await res.json();
        const report = json.data?.comprehensiveAnalysis ?? json.comprehensiveAnalysis ?? json.data;
        return { status: 'success', data: report ? { comprehensiveAnalysis: report } : json.data ?? json, generatedAt, _usage: json._usage ?? json.usage };
      }

      case 'psychologicalAstrology': {
        const res = await fetch(`${baseUrl}/api/psychological-astrology/comprehensive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            userProfile: profile,
            birthData: {
              birthDate: profile.birthDate,
              birthTime: profile.birthTime || '12:00:00',
              birthPlace: profile.birthPlace,
              latitude: profile.birthLatitude ?? 0,
              longitude: profile.birthLongitude ?? 0,
            },
          }),
        });
        if (!res.ok) throw new Error(`Psychological Astrology API: ${res.status}`);
        const json = await res.json();
        const report = json.data?.comprehensiveAnalysis ?? json.comprehensiveAnalysis ?? json.data;
        return { status: 'success', data: report ? { comprehensiveAnalysis: report } : json.data ?? json, generatedAt, _usage: json._usage ?? json.usage };
      }

      case 'shamanicAstrology': {
        const res = await fetch(`${baseUrl}/api/shamanic-astrology/comprehensive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            userProfile: profile,
            birthData: {
              birthDate: profile.birthDate,
              birthTime: profile.birthTime || '12:00:00',
              birthPlace: profile.birthPlace,
              latitude: profile.birthLatitude ?? 0,
              longitude: profile.birthLongitude ?? 0,
            },
          }),
        });
        if (!res.ok) throw new Error(`Shamanic Astrology API: ${res.status}`);
        const json = await res.json();
        const report = json.data?.comprehensiveAnalysis ?? json.comprehensiveAnalysis ?? json.data;
        return { status: 'success', data: report ? { comprehensiveAnalysis: report } : json.data ?? json, generatedAt, _usage: json._usage ?? json.usage };
      }

      case 'kabbalisticAstrology': {
        const res = await fetch(`${baseUrl}/api/kabbalistic-astrology/comprehensive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            userProfile: profile,
            birthData: {
              birthDate: profile.birthDate,
              birthTime: profile.birthTime || '12:00:00',
              birthPlace: profile.birthPlace,
              latitude: profile.birthLatitude ?? 0,
              longitude: profile.birthLongitude ?? 0,
            },
          }),
        });
        if (!res.ok) throw new Error(`Kabbalistic Astrology API: ${res.status}`);
        const json = await res.json();
        const report = json.data?.comprehensiveAnalysis ?? json.comprehensiveAnalysis ?? json.data;
        return { status: 'success', data: report ? { comprehensiveAnalysis: report } : json.data ?? json, generatedAt, _usage: json._usage ?? json.usage };
      }

      case 'hermeticAstrology': {
        const res = await fetch(`${baseUrl}/api/hermetic-astrology/comprehensive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            userProfile: profile,
            birthData: {
              birthDate: profile.birthDate,
              birthTime: profile.birthTime || '12:00:00',
              birthPlace: profile.birthPlace,
              latitude: profile.birthLatitude ?? 0,
              longitude: profile.birthLongitude ?? 0,
            },
          }),
        });
        if (!res.ok) throw new Error(`Hermetic Astrology API: ${res.status}`);
        const json = await res.json();
        const report = json.data?.comprehensiveAnalysis ?? json.comprehensiveAnalysis ?? json.data;
        return { status: 'success', data: report ? { comprehensiveAnalysis: report } : json.data ?? json, generatedAt, _usage: json._usage ?? json.usage };
      }

      case 'hellenistic': {
        const res = await fetch(`${baseUrl}/api/hellenistic/comprehensive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            userProfile: {
              birthDate: profile.birthDate,
              birthTime: profile.birthTime || '12:00:00',
              birthPlace: profile.birthPlace,
              birthLatitude: profile.birthLatitude ?? 0,
              birthLongitude: profile.birthLongitude ?? 0,
            },
          }),
        });
        if (!res.ok) throw new Error(`Hellenistic API: ${res.status}`);
        const json = await res.json();
        const data = json.data ?? json;
        if (!data || (data as Record<string, unknown>).placeholder === true) {
          return {
            status: 'success',
            data: {
              placeholder: true,
              reason: json.error ?? 'Hellenistic reading unavailable',
            },
            generatedAt,
            _usage: json._usage ?? json.usage,
          };
        }
        return { status: 'success', data, generatedAt, _usage: json._usage ?? json.usage };
      }

      case 'numerology': {
        const { computeChaldeanProfile } = await import('./numerology/chaldean');
        const { calcPersonalYear } = await import('./numerology/personalYear');
        const { calcDriver, calcConductor } = await import('./numerology/driverConductor');
        const chaldean = computeChaldeanProfile(profile.fullName || '', profile.birthDate || '');
        const personalYear = calcPersonalYear(profile.birthDate || '');
        const driver = calcDriver(profile.birthDate || '');
        const conductor = calcConductor(profile.birthDate || '');
        return {
          status: 'success',
          data: {
            reading: 'Chaldean Numerology profile calculated.',
            numbers: chaldean.numbers,
            breakdown: chaldean.breakdown,
            personalYear,
            driver,
            conductor,
          },
          generatedAt,
        };
      }

      case 'dreamSymbols': {
        const { dreamSymbolsIntelligence } = await import('./dreamSymbolsIntelligence');
        const symbols = dreamSymbolsIntelligence.getDreamSymbols();
        return {
          status: 'success',
          data: {
            reading: 'Dream symbols interpretation framework available.',
            symbols: Object.keys(symbols).length,
            framework: { categories: ['animals', 'objects', 'people', 'places', 'actions'] },
          },
          generatedAt,
        };
      }

      case 'tarot': {
        const { tarotIntelligence } = await import('./tarotIntelligence');
        const tarotProfile = tarotIntelligence.calculateProfileCards(profile.birthDate || '', profile.fullName || '');
        return {
          status: 'success',
          data: { profile: tarotProfile },
          generatedAt,
        };
      }

      case 'kp': {
        const res = await fetch(`${baseUrl}/api/tools/kp-astrology/generate-real`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            birthData: {
              birthDate: profile.birthDate,
              birthTime: profile.birthTime || '12:00:00',
              birthPlace: profile.birthPlace,
              latitude: profile.birthLatitude ?? 0,
              longitude: profile.birthLongitude ?? 0,
            },
          }),
        });
        if (!res.ok) throw new Error(`KP API: ${res.status}`);
        const json = await res.json();
        const analysis = json.data ?? json;
        if (!analysis?.cusps?.length || !analysis?.timingAnalysis) {
          return { status: 'success', data: { placeholder: true, reason: 'KP chart incomplete' }, generatedAt, _usage: json._usage ?? json.usage };
        }
        return { status: 'success', data: analysis, generatedAt, _usage: json._usage ?? json.usage };
      }

      case 'iching': {
        const { buildBirthHexagram } = await import('./ichingBirthHexagram');
        const hexagram = buildBirthHexagram(profile.birthDate || '');
        return {
          status: 'success',
          data: { hexagram },
          generatedAt,
        };
      }

      case 'faceReading': {
        if (!profile.facePhotoUrl) {
          return {
            status: 'success',
            data: {
              placeholder: true,
              reason: 'Upload a face photo to generate a face reading.',
            },
            generatedAt,
          };
        }
        try {
          const { faceReadingIntelligence } = await import('./faceReadingIntelligence');
          const age = profile.birthDate
            ? Math.floor(
                (Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
              )
            : 30;
          const gender = (profile.gender === 'non-binary' ? 'other' : profile.gender) || 'other';
          const analysis = await faceReadingIntelligence.analyzeFace(
            age,
            gender as 'male' | 'female' | 'other',
            profile.facePhotoUrl
          );
          return {
            status: 'success',
            data: { analysis, faceReadingContext: analysis },
            generatedAt,
          };
        } catch (err) {
          devLog.warn('[ProfileOrchestrator] Face reading analysis failed:', err, 'profileGenerationOrchestrator');
          return {
            status: 'success',
            data: {
              placeholder: true,
              reason: 'Face reading failed. Try re-uploading a clearer image.',
            },
            generatedAt,
          };
        }
      }

      case 'palmistry': {
        if (!profile.palmPhotoUrl) {
          return {
            status: 'success',
            data: {
              placeholder: true,
              reason: 'Upload hand images to generate a palmistry reading.',
            },
            generatedAt,
          };
        }
        try {
          const res = await fetch(`${baseUrl}/api/tools/palmistry/analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageUrl: profile.palmPhotoUrl,
              dominantHand: 'right',
              gender: profile.gender || 'other',
              age: profile.birthDate
                ? Math.floor(
                    (Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
                  )
                : 30,
            }),
          });
          if (!res.ok) throw new Error(`Palmistry API: ${res.status}`);
          const json = await res.json();
          const aiData = json.data ?? json;
          if (!aiData?.lines || !aiData?.mounts) throw new Error('Incomplete palm analysis');
          const dominantHand: 'left' | 'right' = 'right';
          const hand: 'left' | 'right' | 'both' =
            profile.gender === 'female' ? 'left' : profile.gender === 'male' ? 'right' : 'both';
          const age = profile.birthDate
            ? Math.floor(
                (Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
              )
            : 30;
          const gender = (profile.gender === 'non-binary' ? 'other' : profile.gender) || 'other';
          const { palmistryImageAnalyzer } = await import('./palmistry/palmistryImageAnalyzer');
          const analysis = palmistryImageAnalyzer.formatPalmistryData(aiData, hand, dominantHand, age, gender);
          return {
            status: 'success',
            data: { palmistryContext: analysis, analysis },
            generatedAt,
            _usage: json._usage ?? json.usage,
          };
        } catch (err) {
          devLog.warn('[ProfileOrchestrator] Palmistry analysis failed:', err, 'profileGenerationOrchestrator');
          return {
            status: 'success',
            data: {
              placeholder: true,
              reason: 'Palm analysis failed. Try re-uploading a clearer image.',
            },
            generatedAt,
          };
        }
      }

      case 'dailyDecisions': {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(`${baseUrl}/api/tools/daily-decisions/analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            userProfile: profile,
            date: today,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { error?: string })?.error ?? `Daily Decisions API: ${res.status}`);
        }
        const json = await res.json();
        const data = json.data ?? json;
        if (!data || (data as Record<string, unknown>).placeholder === true) {
          return {
            status: 'success',
            data: {
              reading: 'Daily decisions analysis is not available for this profile.',
              placeholder: true,
            },
            generatedAt,
            _usage: json._usage ?? json.usage,
          };
        }
        return { status: 'success', data: data as Record<string, unknown>, generatedAt, _usage: json._usage ?? json.usage };
      }

      case 'medicalAstrology': {
        const res = await fetch(`${baseUrl}/api/occult/universal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system: 'medical',
            birthData: {
              birthDate: profile.birthDate,
              birthTime: profile.birthTime || '12:00:00',
              birthPlace: profile.birthPlace,
              latitude: profile.birthLatitude ?? 0,
              longitude: profile.birthLongitude ?? 0,
            },
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { error?: string })?.error ?? `Medical Astrology API: ${res.status}`);
        }
        const json = await res.json();
        const responseData = json.data ?? json;
        if (!responseData || (responseData as Record<string, unknown>).placeholder === true) {
          return {
            status: 'success',
            data: {
              placeholder: true,
              reason: (json as { error?: string })?.error ?? 'Medical astrology reading unavailable',
            },
            generatedAt,
            _usage: json._usage ?? json.usage,
          };
        }
        return {
          status: 'success',
          data: { data: responseData, metadata: json.metadata ?? { generatedAt: new Date().toISOString() } },
          generatedAt,
          _usage: json._usage ?? json.usage,
        };
      }

      case 'financialAstrology': {
        const res = await fetch(`${baseUrl}/api/financial-astrology/comprehensive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            userProfile: profile,
            birthData: {
              birthDate: profile.birthDate,
              birthTime: profile.birthTime || '12:00:00',
              birthPlace: profile.birthPlace,
              latitude: profile.birthLatitude ?? 0,
              longitude: profile.birthLongitude ?? 0,
            },
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { error?: string })?.error ?? `Financial Astrology API: ${res.status}`);
        }
        const json = await res.json();
        const report = json.data?.comprehensiveAnalysis ?? json.comprehensiveAnalysis ?? json.data ?? json;
        return {
          status: 'success',
          data: report ? { comprehensiveAnalysis: report } : { comprehensiveAnalysis: json },
          generatedAt,
          _usage: json._usage ?? json.usage,
        };
      }

      case 'mundaneAstrology': {
        const res = await fetch(`${baseUrl}/api/mundane-astrology/comprehensive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            userProfile: profile,
            birthData: {
              birthDate: profile.birthDate,
              birthTime: profile.birthTime || '12:00:00',
              birthPlace: profile.birthPlace,
              latitude: profile.birthLatitude ?? 0,
              longitude: profile.birthLongitude ?? 0,
            },
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { error?: string })?.error ?? `Mundane Astrology API: ${res.status}`);
        }
        const json = await res.json();
        const report = json.data?.comprehensiveAnalysis ?? json.comprehensiveAnalysis ?? json.data ?? json;
        return {
          status: 'success',
          data: report ? { comprehensiveAnalysis: report } : { comprehensiveAnalysis: json },
          generatedAt,
          _usage: json._usage ?? json.usage,
        };
      }

      case 'ziweiDouShu': {
        const res = await fetch(`${baseUrl}/api/tools/ziwei-dou-shu/generate-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            userProfile: profile,
            birthDate: profile.birthDate,
            birthTime: profile.birthTime || '12:00:00',
            birthPlace: profile.birthPlace,
            gender: profile.gender || 'other',
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { error?: string })?.error ?? `Zi Wei Dou Shu API: ${res.status}`);
        }
        const json = await res.json();
        const responseData = json.data ?? json;
        if (responseData && (responseData as Record<string, unknown>).placeholder === true) {
          return {
            status: 'success',
            data: responseData as Record<string, unknown>,
            generatedAt,
            _usage: json._usage ?? json.usage,
          };
        }
        return {
          status: 'success',
          data: (responseData as Record<string, unknown>) ?? { placeholder: true, reason: 'Zi Wei report unavailable' },
          generatedAt,
          _usage: json._usage ?? json.usage,
        };
      }

      case 'scrying': {
        try {
          // Generate in-process to avoid self-fetch timeouts/deadlocks in dev
          const { generateScryingReport } = await import('@/lib/scrying/scryingReportGenerator');
          const profileForScrying = {
            fullName: String(profile.fullName ?? (profile as unknown as Record<string, unknown>).displayName ?? ''),
            birthDate: profile.birthDate ?? '',
            birthTime: profile.birthTime ?? '',
            birthPlace: profile.birthPlace ?? '',
            gender: profile.gender ?? '',
          };
          const report = generateScryingReport(profileForScrying, new Date(generatedAt));
          return {
            status: 'success',
            data: report as unknown as Record<string, unknown>,
            generatedAt,
          };
        } catch (scryingErr) {
          const msg = scryingErr instanceof Error ? scryingErr.message : 'Unknown error';
          devLog.warn('[ProfileOrchestrator] scrying failed:', msg, 'profileGenerationOrchestrator');
          return { status: 'failed', error: msg, generatedAt };
        }
      }

      case 'bibliomancy': {
        try {
          const { generateBibliomancyReport } = await import('@/lib/bibliomancy/bibliomancyReportGenerator');
          const profileForBibliomancy = {
            fullName: String(profile.fullName ?? (profile as unknown as Record<string, unknown>).displayName ?? ''),
            birthDate: profile.birthDate ?? '',
            birthTime: profile.birthTime ?? '',
            birthPlace: profile.birthPlace ?? '',
            userId,
          };
          const report = generateBibliomancyReport(profileForBibliomancy, new Date(generatedAt));
          return {
            status: 'success',
            data: report as unknown as Record<string, unknown>,
            generatedAt,
          };
        } catch (bibliomancyErr) {
          const msg = bibliomancyErr instanceof Error ? bibliomancyErr.message : 'Unknown error';
          devLog.warn('[ProfileOrchestrator] bibliomancy failed:', msg, 'profileGenerationOrchestrator');
          return { status: 'failed', error: msg, generatedAt };
        }
      }

      case 'ogham': {
        try {
          const res = await fetch(`${baseUrl}/api/tools/ogham/generate-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, userProfile: profile }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((err as { error?: string })?.error ?? `Ogham API: ${res.status}`);
          }
          const json = await res.json();
          const data = json.data ?? json;
          return { status: 'success', data: (data as Record<string, unknown>) ?? {}, generatedAt, _usage: json._usage ?? json.usage };
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          devLog.warn('[ProfileOrchestrator] Ogham failed:', msg, 'profileGenerationOrchestrator');
          return {
            status: 'success',
            data: { placeholder: true, reason: msg },
            generatedAt,
          };
        }
      }

      case 'bazi': {
        devLog.info('[ProfileOrchestrator] Calling BaZi API', { baseUrl, userId: profile?.uid || userId }, 'profileGenerationOrchestrator');
        try {
          const res = await fetch(`${baseUrl}/api/tools/bazi/analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, userProfile: profile }),
          });
          const json = await res.json().catch(() => ({}));
          const data = json.data ?? json;
          const isPlaceholder = !data || (data as Record<string, unknown>).placeholder === true;
          if (!res.ok) {
            const errMsg = (json as { error?: string })?.error ?? `BaZi API: ${res.status}`;
            devLog.warn('[ProfileOrchestrator] BaZi API non-ok', { status: res.status, error: errMsg }, 'profileGenerationOrchestrator');
            throw new Error(errMsg);
          }
          if (isPlaceholder) {
            devLog.warn('[ProfileOrchestrator] BaZi returned placeholder or empty data', 'profileGenerationOrchestrator');
            return {
              status: 'success',
              data: { placeholder: true, reason: 'BaZi reading unavailable for this profile.' },
              generatedAt,
              _usage: json._usage ?? json.usage,
            };
          }
          devLog.info('[ProfileOrchestrator] BaZi report generated successfully', 'profileGenerationOrchestrator');
          return { status: 'success', data: data as Record<string, unknown>, generatedAt, _usage: json._usage ?? json.usage };
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          devLog.warn('[ProfileOrchestrator] BaZi failed:', msg, 'profileGenerationOrchestrator');
          return {
            status: 'success',
            data: { placeholder: true, reason: msg },
            generatedAt,
          };
        }
      }

      case 'humanDesign': {
        try {
          const res = await fetch(`${baseUrl}/api/tools/human-design/generate-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              userProfile: profile,
              birthData: {
                birthDate: profile.birthDate,
                birthTime: profile.birthTime || '12:00:00',
                birthPlace: profile.birthPlace,
                latitude: profile.birthLatitude ?? 0,
                longitude: profile.birthLongitude ?? 0,
              },
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((err as { error?: string })?.error ?? `Human Design API: ${res.status}`);
          }
          const json = await res.json();
          const data = json.data ?? json;
          if (!data || (data as Record<string, unknown>).placeholder === true) {
            return {
              status: 'success',
              data: { placeholder: true, reason: 'Human Design report unavailable.' },
              generatedAt,
              _usage: json._usage ?? json.usage,
            };
          }
          return { status: 'success', data: data as Record<string, unknown>, generatedAt, _usage: json._usage ?? json.usage };
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          devLog.warn('[ProfileOrchestrator] Human Design failed:', msg, 'profileGenerationOrchestrator');
          return {
            status: 'success',
            data: { placeholder: true, reason: msg },
            generatedAt,
          };
        }
      }

      case 'navaratna': {
        try {
          const res = await fetch(`${baseUrl}/api/tools/navaratna-planetary-stones/analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, userProfile: profile }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((err as { error?: string })?.error ?? `Navaratna API: ${res.status}`);
          }
          const json = await res.json();
          const data = json.data ?? json;
          if (!data || (data as Record<string, unknown>).placeholder === true) {
            return {
              status: 'success',
              data: { placeholder: true, reason: 'Navaratna analysis unavailable.' },
              generatedAt,
              _usage: json._usage ?? json.usage,
            };
          }
          return { status: 'success', data: data as Record<string, unknown>, generatedAt, _usage: json._usage ?? json.usage };
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          devLog.warn('[ProfileOrchestrator] Navaratna failed:', msg, 'profileGenerationOrchestrator');
          return {
            status: 'success',
            data: { placeholder: true, reason: msg },
            generatedAt,
          };
        }
      }

      case 'trichakra': {
        try {
          const res = await fetch(`${baseUrl}/api/tools/trichakra-method/analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, userProfile: profile }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((err as { error?: string })?.error ?? `Trichakra API: ${res.status}`);
          }
          const json = await res.json();
          const data = json.data ?? json;
          if (!data || (data as Record<string, unknown>).placeholder === true) {
            return {
              status: 'success',
              data: { placeholder: true, reason: 'Trichakra analysis unavailable.' },
              generatedAt,
              _usage: json._usage ?? json.usage,
            };
          }
          return { status: 'success', data: data as Record<string, unknown>, generatedAt, _usage: json._usage ?? json.usage };
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          devLog.warn('[ProfileOrchestrator] Trichakra failed:', msg, 'profileGenerationOrchestrator');
          return {
            status: 'success',
            data: { placeholder: true, reason: msg },
            generatedAt,
          };
        }
      }

      case 'energyHealing': {
        const methods = ['chakra', 'aura', 'reiki', 'crystal', 'energy'] as const;
        const combined: Record<string, unknown> = {};
        let hasAny = false;
        const energyUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
        for (const method of methods) {
          try {
            const res = await fetch(`${baseUrl}/api/tools/energy-healing/analysis`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ method, userProfile: profile }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              devLog.warn(`[ProfileOrchestrator] Energy Healing ${method} failed:`, (err as { error?: string })?.error ?? res.status, 'profileGenerationOrchestrator');
              continue;
            }
            const json = await res.json();
            if (json._usage || json.usage) {
              const u = json._usage ?? json.usage;
              if (typeof u.promptTokens === 'number') energyUsage.promptTokens += u.promptTokens;
              if (typeof u.completionTokens === 'number') energyUsage.completionTokens += u.completionTokens;
              if (typeof u.totalTokens === 'number') energyUsage.totalTokens += u.totalTokens;
            }
            const data = json.data ?? json;
            if (data && typeof data === 'object' && (data as Record<string, unknown>).placeholder !== true) {
              combined[method] = data;
              hasAny = true;
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            devLog.warn(`[ProfileOrchestrator] Energy Healing ${method} failed:`, msg, 'profileGenerationOrchestrator');
          }
        }
        if (!hasAny) {
          return {
            status: 'success',
            data: { placeholder: true, reason: 'Energy healing analysis unavailable.' },
            generatedAt,
            _usage: energyUsage.promptTokens + energyUsage.completionTokens + energyUsage.totalTokens > 0 ? energyUsage : undefined,
          };
        }
        return { status: 'success', data: combined as Record<string, unknown>, generatedAt, _usage: energyUsage.promptTokens + energyUsage.completionTokens + energyUsage.totalTokens > 0 ? energyUsage : undefined };
      }

      case 'akashicRecords': {
        try {
          const res = await fetch(`${baseUrl}/api/tools/akashic-records/reading`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, userProfile: profile }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((err as { error?: string })?.error ?? `Akashic Records API: ${res.status}`);
          }
          const json = await res.json();
          const data = json.data ?? json;
          if (!data || (data as Record<string, unknown>).placeholder === true) {
            return {
              status: 'success',
              data: { placeholder: true, reason: 'Akashic Records reading unavailable.' },
              generatedAt,
              _usage: json._usage ?? json.usage,
            };
          }
          return { status: 'success', data: data as Record<string, unknown>, generatedAt, _usage: json._usage ?? json.usage };
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          devLog.warn('[ProfileOrchestrator] Akashic Records failed:', msg, 'profileGenerationOrchestrator');
          return {
            status: 'success',
            data: { placeholder: true, reason: msg },
            generatedAt,
          };
        }
      }

      default: {
        // Scrying must never get the generic placeholder - run in-process if we landed here
        if (toolSlug === 'scrying') {
          try {
            const { generateScryingReport } = await import('@/lib/scrying/scryingReportGenerator');
            const profileForScrying = {
              fullName: String(profile.fullName ?? (profile as unknown as Record<string, unknown>).displayName ?? ''),
              birthDate: profile.birthDate ?? '',
              birthTime: profile.birthTime ?? '',
              birthPlace: profile.birthPlace ?? '',
              gender: profile.gender ?? '',
            };
            const report = generateScryingReport(profileForScrying, new Date(generatedAt));
            return { status: 'success', data: report as unknown as Record<string, unknown>, generatedAt };
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            devLog.warn('[ProfileOrchestrator] scrying fallback failed:', msg, 'profileGenerationOrchestrator');
            return { status: 'failed', error: msg, generatedAt };
          }
        }
        // Placeholder for tools not yet wired - store minimal report so we don't block
        return {
          status: 'success',
          data: {
            reading: `${toolSlug} reading will be generated when tool is fully integrated.`,
            placeholder: true,
          },
          generatedAt,
        };
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    devLog.warn(`[ProfileOrchestrator] ${toolSlug} failed:`, msg, 'profileGenerationOrchestrator');
    return { status: 'failed', error: msg, generatedAt };
  }
}

/** Extract normalized insights for Master Seer from tool reports and interpretations. */
function buildSeerMaster(
  toolReports: ToolReports,
  interpretations: Record<string, unknown>
): SeerMasterData {
  const extract = (obj: unknown, keys: string[]): string[] => {
    if (!obj || typeof obj !== 'object') return [];
    const arr: string[] = [];
    for (const k of keys) {
      const v = (obj as Record<string, unknown>)[k];
      if (typeof v === 'string') arr.push(v);
      if (Array.isArray(v)) arr.push(...v.filter((x): x is string => typeof x === 'string'));
    }
    return arr;
  };

  const ip = interpretations as Record<string, unknown>;
  const personality = ip.personality as Record<string, unknown> | undefined;
  const lifePurpose = ip.lifePurpose as Record<string, unknown> | undefined;
  const career = ip.career as Record<string, unknown> | undefined;
  const relationships = ip.relationships as Record<string, unknown> | undefined;
  const health = ip.health as Record<string, unknown> | undefined;
  const timing = ip.timing as Record<string, unknown> | undefined;
  const remedies = ip.remedies as Record<string, unknown> | undefined;

  return {
    core_identity: extract(personality, ['overview', 'strengths', 'challenges', 'traits']),
    life_purpose: extract(lifePurpose, ['overview', 'dharma', 'karmicLessons', 'spiritualPath']),
    career_themes: extract(career, ['overview', 'suitableProfessions', 'successFactors', 'careerAdvice']),
    relationship_patterns: extract(relationships, ['overview', 'marriageTiming', 'compatibility', 'relationshipAdvice']),
    health_tendencies: extract(health, ['overview', 'vulnerableAreas', 'healthTips']),
    timing_windows: extract(timing, ['overview', 'current', 'upcoming', 'favorablePeriods', 'favorableTiming']),
    remedies: {
      gemstones: Array.isArray(remedies?.gemstones) ? (remedies.gemstones as string[]) : [],
      mudras: Array.isArray(remedies?.mudras) ? (remedies.mudras as string[]) : [],
      colors: Array.isArray(remedies?.colors) ? (remedies.colors as string[]) : [],
      mantras: Array.isArray(remedies?.mantras) ? (remedies.mantras as string[]) : [],
      behaviors: Array.isArray(remedies?.practices) ? (remedies.practices as string[]) : [],
    },
  };
}

/**
 * Main orchestrator: Run ALL tools, store reports, build Seer Master.
 * If one tool fails, mark status but do not rerun others.
 */
export async function runProfileGeneration(
  userId: string,
  userProfile: UserProfile
): Promise<GenerationResult> {
  const baseUrl = getServerBaseUrl();
  const toolReports: ToolReports = {};
  const failedTools: string[] = [];
  const aggregateUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  // Normalize birth time so invalid values (e.g. 34:00) never reach tool APIs
  const profile: UserProfile = {
    ...userProfile,
    birthTime: normalizeBirthTime(userProfile.birthTime) || userProfile.birthTime || '12:00:00',
  };

  // 1. Run Vedic first (required for interpretations)
  const vedicEntry = await runTool('vedic', userId, profile, baseUrl);
  toolReports.vedic = vedicEntry;
  if (vedicEntry.status === 'failed') {
    failedTools.push('vedic');
    addResponseUsage(aggregateUsage, vedicEntry);
    return {
      success: false,
      toolReports,
      seerMaster: buildSeerMaster(toolReports, {}),
      comprehensiveProfile: {},
      failedTools,
      systemsUsed: [],
      aggregateUsage,
    };
  }

  // 2. Generate interpretations via universal engine (uses Vedic data)
  let interpretations: Record<string, unknown> = {};
  try {
    const { universalInterpretationEngine } = await import('./universalInterpretationEngine');
    const vedicData = vedicEntry.data as Record<string, unknown>;
    const interpretation = await universalInterpretationEngine.generateInterpretation(
      'vedic',
      userId,
      vedicData,
      profile
    );
    interpretations = interpretation as unknown as Record<string, unknown>;
  } catch (err) {
    devLog.warn('[ProfileOrchestrator] Interpretation engine failed:', err, 'profileGenerationOrchestrator');
  }

  // 2a. Fetch Vedic comprehensive report (planetaryAnalysis, houseAnalysis, etc.) and store in vedicEntry.data so it is saved to profile; Overview/Planets/Houses/Remedies then show it without generating on mount
  try {
    const res = await fetch(`${baseUrl}/api/vedic/comprehensive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        vedicChartData: vedicEntry.data,
        userProfile: {
          birthDate: profile.birthDate,
          birthTime: profile.birthTime ?? '12:00:00',
          birthPlace: profile.birthPlace,
          fullName: (profile as unknown as Record<string, unknown>).fullName ?? profile.displayName,
          displayName: profile.displayName,
        },
      }),
    });
    if (res.ok) {
      const json = await res.json();
      addResponseUsage(aggregateUsage, json);
      const analysis = json?.data?.comprehensiveAnalysis ?? json?.comprehensiveAnalysis ?? json?.data;
      if (analysis && typeof analysis === 'object') {
        (vedicEntry.data as Record<string, unknown>).comprehensiveAnalysis = analysis;
        devLog.info('[ProfileOrchestrator] Vedic comprehensive report stored for user', userId, 'profileGenerationOrchestrator');
      } else {
        devLog.warn('[ProfileOrchestrator] Vedic comprehensive response missing analysis (non-blocking)', undefined, 'profileGenerationOrchestrator');
      }
    } else {
      devLog.warn('[ProfileOrchestrator] Vedic comprehensive fetch failed (non-blocking)', undefined, 'profileGenerationOrchestrator');
    }
  } catch (err) {
    devLog.warn('[ProfileOrchestrator] Vedic comprehensive fetch failed (non-blocking):', err, 'profileGenerationOrchestrator');
  }

  // 2b. Run Vedic Astro-Numerology (depends on Vedic chart; runs after vedic so we have moon/lagna/sun)
  const vedicAstroNumGeneratedAt = new Date().toISOString();
  try {
    const vdata = vedicEntry.data as Record<string, unknown>;
    const getSign = (src: unknown, key: string, subKey: string): string => {
      const obj = src as Record<string, unknown> | undefined;
      if (!obj) return 'Unknown';
      const val = obj[key] ?? obj[subKey];
      if (typeof val === 'string') return val;
      const inner = val as Record<string, unknown> | undefined;
      return (inner?.signName ?? inner?.sign) as string ?? 'Unknown';
    };
    const planets = vdata?.planets as Array<{ name: string; sign?: string; signName?: string }> | undefined;
    const findPlanet = (name: string) =>
      Array.isArray(planets) ? planets.find((p) => p.name === name || p.name === name.toLowerCase()) : undefined;
    const moonSign =
      getSign(vdata?.moon, 'sign', 'signName') !== 'Unknown'
        ? getSign(vdata?.moon, 'sign', 'signName')
        : (findPlanet('Moon')?.signName ?? findPlanet('Moon')?.sign ?? 'Unknown');
    const sunSign =
      getSign(vdata?.sun, 'sign', 'signName') !== 'Unknown'
        ? getSign(vdata?.sun, 'sign', 'signName')
        : (findPlanet('Sun')?.signName ?? findPlanet('Sun')?.sign ?? 'Unknown');
    const lagnaSign =
      getSign(vdata?.ascendant, 'signName', 'sign') !== 'Unknown'
        ? getSign(vdata?.ascendant, 'signName', 'sign')
        : getSign(vdata?.lagna, 'signName', 'sign');

    const birthDate = profile.birthDate ?? '';
    const fullName = (profile.displayName ?? (profile as unknown as Record<string, unknown>).fullName ?? '') as string;

    if (birthDate && fullName && moonSign !== 'Unknown') {
      const numerologyProfile = calculateVedicNumerologyProfile(fullName, birthDate);
      const res = await fetch(`${baseUrl}/api/vedic-astro-numerology/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          birthDate,
          fullName,
          moonSign,
          lagnaSign: lagnaSign !== 'Unknown' ? lagnaSign : 'Aries',
          sunSign: sunSign !== 'Unknown' ? sunSign : 'Aries',
          numerologyProfile,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        addResponseUsage(aggregateUsage, result);
        const data = result?.data ?? result;
        toolReports.vedicAstroNumerology = { status: 'success', data: data as Record<string, unknown>, generatedAt: vedicAstroNumGeneratedAt, _usage: result._usage ?? result.usage };
      } else {
        const err = await res.json().catch(() => ({}));
        toolReports.vedicAstroNumerology = { status: 'failed', error: err?.error ?? `API ${res.status}`, generatedAt: vedicAstroNumGeneratedAt };
        failedTools.push('vedicAstroNumerology');
      }
    } else {
      toolReports.vedicAstroNumerology = { status: 'failed', error: 'Missing birthDate, fullName, or moonSign', generatedAt: vedicAstroNumGeneratedAt };
      failedTools.push('vedicAstroNumerology');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown';
    devLog.warn('[ProfileOrchestrator] Vedic Astro-Numerology failed:', msg, 'profileGenerationOrchestrator');
    toolReports.vedicAstroNumerology = { status: 'failed', error: msg, generatedAt: vedicAstroNumGeneratedAt };
    failedTools.push('vedicAstroNumerology');
  }

  // 3. Run ALL other tools in parallel (excluding vedic, already done)
  const otherTools = ALL_TOOL_SLUGS.filter((t) => t !== 'vedic');
  const results = await Promise.allSettled(
    otherTools.map(async (slug) => {
      const entry = await runTool(slug, userId, profile, baseUrl);
      toolReports[slug] = entry;
      if (entry.status === 'failed') failedTools.push(slug);
      return entry;
    })
  );

  // Log any unexpected rejections
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      const slug = otherTools[i];
      toolReports[slug] = { status: 'failed', error: r.reason?.message || 'Unknown', generatedAt: new Date().toISOString() };
      failedTools.push(slug);
    }
  });

  for (const entry of Object.values(toolReports)) {
    if (entry._usage) addResponseUsage(aggregateUsage, { _usage: entry._usage });
  }

  // 3b. Run Western Astro-Numerology (depends on Western chart for sun sign; runs after western so we have chart)
  const astroNumGeneratedAt = new Date().toISOString();
  try {
    const westernEntry = toolReports.western;
    const westernData = westernEntry?.status === 'success' && westernEntry?.data ? (westernEntry.data as Record<string, unknown>) : undefined;
    const chart = westernData?.chart as { planets?: Array<{ name: string; sign?: string; signName?: string }> } | undefined;
    const planets = chart?.planets;
    const findSun = () =>
      Array.isArray(planets) ? planets.find((p) => p.name === 'Sun' || p.name === 'sun') : undefined;
    const sunPlanet = findSun();
    const sunSign =
      (sunPlanet?.signName ?? sunPlanet?.sign) ?? 'Unknown';

    const birthDate = profile.birthDate ?? '';
    const fullName = (profile.displayName ?? (profile as unknown as Record<string, unknown>).fullName ?? '') as string;

    if (birthDate && fullName && sunSign !== 'Unknown') {
      const res = await fetch(`${baseUrl}/api/astro-numerology/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          birthDate,
          fullName,
          sunSign,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        addResponseUsage(aggregateUsage, result);
        const data = result?.data ?? result;
        toolReports.astroNumerology = { status: 'success', data: data as Record<string, unknown>, generatedAt: astroNumGeneratedAt, _usage: result._usage ?? result.usage };
      } else {
        const err = await res.json().catch(() => ({}));
        toolReports.astroNumerology = { status: 'failed', error: (err as { error?: string })?.error ?? `API ${res.status}`, generatedAt: astroNumGeneratedAt };
        failedTools.push('astroNumerology');
      }
    } else {
      toolReports.astroNumerology = { status: 'failed', error: 'Missing birthDate, fullName, or sunSign from Western chart', generatedAt: astroNumGeneratedAt };
      failedTools.push('astroNumerology');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown';
    devLog.warn('[ProfileOrchestrator] Western Astro-Numerology failed:', msg, 'profileGenerationOrchestrator');
    toolReports.astroNumerology = { status: 'failed', error: msg, generatedAt: astroNumGeneratedAt };
    failedTools.push('astroNumerology');
  }

  const systemsUsed = Object.entries(toolReports).filter(([, v]) => v.status === 'success').map(([k]) => k);

  // 4. Build comprehensive profile (backward compatible with existing structure)
  const interp = interpretations as Record<string, unknown>;
  const timing = interp.timing as Record<string, unknown> | undefined;
  const comprehensiveProfile: Record<string, unknown> = {
    vedic: {
      ascendant: (vedicEntry.data as Record<string, unknown>)?.ascendant ?? 0,
      planets: (vedicEntry.data as Record<string, unknown>)?.planets ?? [],
      houses: (vedicEntry.data as Record<string, unknown>)?.houses ?? [],
      dasha: (vedicEntry.data as Record<string, unknown>)?.dasha ?? [],
      currentDasha: (vedicEntry.data as Record<string, unknown>)?.currentDasha ?? null,
    },
    interpretations: {
      comprehensive: (interp.personality as Record<string, unknown>)?.overview ?? '',
      personality: interp.personality,
      lifePurpose: interp.lifePurpose,
      relationships: interp.relationships,
      career: interp.career,
      health: interp.health,
      spirituality: interp.spirituality,
      dasha: timing ? { overview: timing.overview, current: timing.currentPeriod, upcoming: timing.upcomingPeriods, timing: timing.favorableTiming } : {},
      remedies: interp.remedies,
    },
    toolReports,
    metadata: {
      source: 'profile_generation_orchestrator',
      version: '2.0',
      generatedAt: new Date().toISOString(),
      calculationTime: Date.now(),
      systemsUsed,
      interpretationType: 'universal_comprehensive',
      ...(typeof process.env.NEXT_PUBLIC_MYSTICAL_PIPELINE_RELEASE === 'string' &&
      process.env.NEXT_PUBLIC_MYSTICAL_PIPELINE_RELEASE.trim().length > 0
        ? { pipelineRelease: process.env.NEXT_PUBLIC_MYSTICAL_PIPELINE_RELEASE.trim() }
        : {}),
    },
    userId,
    lastUpdated: Date.now(),
    birthDate: profile.birthDate,
    birthPlace: profile.birthPlace,
    birthTime: profile.birthTime,
  };

  // 5. Merge successful tool reports into comprehensiveProfile (top-level keys for Seer route)
  const placeholders: string[] = [];
  for (const [slug, entry] of Object.entries(toolReports)) {
    if (entry.status === 'success' && entry.data && typeof entry.data === 'object') {
      comprehensiveProfile[slug] = entry.data;
      if ((entry.data as Record<string, unknown>).placeholder === true) {
        placeholders.push(slug);
      }
    }
  }
  if (placeholders.length > 0) {
    devLog.info('[ProfileOrchestrator] Tools that returned placeholder (no real report)', placeholders, 'profileGenerationOrchestrator');
  }

  // 6. Build Seer Master (normalized insight for Ask the Seer)
  const seerMaster = buildSeerMaster(toolReports, interpretations as Record<string, unknown>);

  return {
    success: systemsUsed.length > 0,
    toolReports,
    seerMaster,
    comprehensiveProfile,
    failedTools,
    systemsUsed,
    aggregateUsage,
  };
}
