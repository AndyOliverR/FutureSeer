/**
 * Profile Generation Orchestrator
 *
 * ONE-TIME, ATOMIC profile generation.
 * Runs ALL tools, stores each report separately, builds Master Seer Database.
 * Rule: Generation is one-time. Interpretation is continuous.
 * Do not add partial or subset regeneration; edited-profile flow requires full pipeline only.
 */

import { UserProfile } from './firebase';
import { devLog } from '@/lib/devLogger';
import { getServerBaseUrl } from './serverBaseUrl';
import { calculateVedicNumerologyProfile } from './vedicNumerologyCalculations';

export interface ToolReportEntry {
  status: 'success' | 'failed';
  data?: Record<string, unknown>;
  error?: string;
  generatedAt: string;
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
}

/** List of all tools to run at profile generation time. No lazy loading. */
const ALL_TOOLS = [
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
  'chineseAstrology',
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
        return { status: 'success', data: data.data ?? data, generatedAt };
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
          }),
        });
        if (!res.ok) throw new Error(`Western API: ${res.status}`);
        const json = await res.json();
        const chartData = json.data ?? json;
        return { status: 'success', data: { chart: chartData }, generatedAt };
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
        return { status: 'success', data: report ? { comprehensiveAnalysis: report } : json.data ?? json, generatedAt };
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
        return { status: 'success', data: report ? { comprehensiveAnalysis: report } : json.data ?? json, generatedAt };
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
        return { status: 'success', data: report ? { comprehensiveAnalysis: report } : json.data ?? json, generatedAt };
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
        return { status: 'success', data: report ? { comprehensiveAnalysis: report } : json.data ?? json, generatedAt };
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
        return { status: 'success', data: report ? { comprehensiveAnalysis: report } : json.data ?? json, generatedAt };
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
        return { status: 'success', data: report ? { comprehensiveAnalysis: report } : json.data ?? json, generatedAt };
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
          return { status: 'success', data: { placeholder: true, reason: 'KP chart incomplete' }, generatedAt };
        }
        return { status: 'success', data: analysis, generatedAt };
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

      default:
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

  // 1. Run Vedic first (required for interpretations)
  const vedicEntry = await runTool('vedic', userId, userProfile, baseUrl);
  toolReports.vedic = vedicEntry;
  if (vedicEntry.status === 'failed') {
    failedTools.push('vedic');
    // Cannot build interpretations without Vedic; return early with partial result
    return {
      success: false,
      toolReports,
      seerMaster: buildSeerMaster(toolReports, {}),
      comprehensiveProfile: {},
      failedTools,
      systemsUsed: [],
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
      userProfile
    );
    interpretations = interpretation as unknown as Record<string, unknown>;
  } catch (err) {
    devLog.warn('[ProfileOrchestrator] Interpretation engine failed:', err, 'profileGenerationOrchestrator');
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

    const birthDate = userProfile.birthDate ?? '';
    const fullName = (userProfile.displayName ?? (userProfile as unknown as Record<string, unknown>).fullName ?? '') as string;

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
        const data = result?.data ?? result;
        toolReports.vedicAstroNumerology = { status: 'success', data: data as Record<string, unknown>, generatedAt: vedicAstroNumGeneratedAt };
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
  const otherTools = ALL_TOOLS.filter((t) => t !== 'vedic');
  const results = await Promise.allSettled(
    otherTools.map(async (slug) => {
      const entry = await runTool(slug, userId, userProfile, baseUrl);
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
    },
    userId,
    lastUpdated: Date.now(),
    birthDate: userProfile.birthDate,
    birthPlace: userProfile.birthPlace,
    birthTime: userProfile.birthTime,
  };

  // 5. Merge successful tool reports into comprehensiveProfile (top-level keys for Seer route)
  for (const [slug, entry] of Object.entries(toolReports)) {
    if (entry.status === 'success' && entry.data && typeof entry.data === 'object') {
      comprehensiveProfile[slug] = entry.data;
    }
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
  };
}
