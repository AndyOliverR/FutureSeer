// Comprehensive Seer Engine for FutureSeer
// Uses ALL divination systems for maximum prediction accuracy
// 100% FREE - Uses existing data, ZERO external API calls

import { UniversalDivinationData } from './universalDataAggregator';
import { SeerAggregator } from './seerAggregator';
import { TimingAnalyzer } from './timingAnalyzer';
import type { DecomposedQuery } from './universalSeerDecomposition';
import { classifyConflict } from './universalSeerConflicts';
import type { ConflictType } from './universalSeerConflicts';
import { MEDICAL_DISCLAIMER } from './medicalAstrologySeerState';
import { FINANCIAL_DISCLAIMER } from './financialAstrologySeerState';
// Placeholder classes for missing modules
// NOTE: These classes are part of the architecture but not fully implemented yet
// They are instantiated in ComprehensiveSeerEngine constructor for future expansion
// TODO: Implement these classes when advanced prediction features are added
class LifePathMarkovChain {}
class BayesianBeliefNetwork {}
class PredictiveSystem {}
class UniversalInterpretationEngine {}
class SwissEphemerisService {}
class CurrentTransitService {
  static getInstance() { return new CurrentTransitService(); }
}
class AstroCoach {}
const getCelebrityMatches = async () => [];
const calculateAshtakavarga = () => ({});
const calculateYogaTiming = () => ({});

export interface ComprehensiveSeerResponse {
  answer: string;
  confidence: number;
  sources: string[];
  relatedTopics: string[];
  followUpSuggestions: string[];
  celebrityMatches?: CelebrityMatch[];
  dailyInsight?: DailyInsight;
  protectionGuidance?: ProtectionGuidance;
  spiritualGuidance?: SpiritualGuidance;
  systemAgreements?: SystemAgreement[];
  timingPredictions?: TimingPrediction[];
  crossSystemValidation?: CrossSystemValidation;
  // Expert aggregation fields
  expertResponses?: Array<{
    tool: string;
    toolName: string;
    answer: string;
    confidence: number;
    sources: string[];
  }>;
  expertConsensus?: {
    highAgreement: string[];
    mediumAgreement: string[];
    lowAgreement: string[];
    conflicts: string[];
    overallConfidence: number;
  };
  primaryExpert?: string | null;
  /** For timing questions: single recommended date (YYYY-MM-DD). */
  recommendedDate?: string;
  /** For timing questions: how we calculated the date and accuracy (for "See more"). */
  timingDetail?: string;
  /** For timing questions: one-line summary per source, same order as sources. */
  supportSummaries?: string[];
  /** For timing questions: probability band (reliability-weighted combination); explicit uncertainty. */
  confidenceBand?: { low: number; high: number };
  /** When a question subtype was used: primary and secondary systems that drove the answer (functional sorting). */
  primarySecondarySystems?: { primary: string[]; secondary: string[] };
  /** When true, API should skip Groq synthesis and use engine answer as-is (e.g. remedy/gemstone). */
  remedyAnswer?: boolean;
}

export interface CelebrityMatch {
  name: string;
  category: string;
  similarity: number;
  reasoning: string;
  sharedPatterns: string[];
  birthData: {
    date: string;
    time: string;
    place: string;
  };
}

export interface DailyInsight {
  quote: string;
  dos: string[];
  donts: string[];
  luckyColor: string;
  luckyNumber: number;
  auspiciousTimes: string[];
  inauspiciousTimes: string[];
  planetaryInfluence: string;
  nakshatraEnergy: string;
}

export interface ProtectionGuidance {
  doshaDetection: string[];
  protectionMantras: string[];
  cleansingRituals: string[];
  talismans: string[];
  warningSigns: string[];
}

export interface SpiritualGuidance {
  chakraStatus: string[];
  meditationAdvice: string[];
  consciousnessLevel: string;
  spiritualPractices: string[];
  karmicLessons: string[];
}

export interface SystemAgreement {
  systems: string[];
  agreement: number; // 0-1 scale
  consensus: string;
  conflictingViews?: string[];
}

export interface TimingPrediction {
  event: string;
  probability: number;
  timeWindow: {
    start: string;
    end: string;
    peak: string;
  };
  supportingSystems: string[];
  confidence: number;
}

export interface CrossSystemValidation {
  highAgreement: string[];
  mediumAgreement: string[];
  lowAgreement: string[];
  conflicts: string[];
  overallConfidence: number;
}

/** Per-system timing contribution for multi-system aggregation. */
export interface TimingContribution {
  systemId: string;
  suggestedDateOrWindow?: string;
  summary: string;
  confidence: number;
}

/** Reliability weights for symbolic feature combination; can be tuned from backtest or scoring. */
const SYSTEM_RELIABILITY_WEIGHTS: Record<string, number> = {
  'Vedic Dashas': 1.1,
  'Planetary Transits': 1.05,
  'Numerology': 1,
  'Western Transits': 1,
  'Tarot': 1,
  'BaZi': 1,
  'I Ching': 1,
  'Angel Numbers': 1,
  'KP Astrology': 1.05,
  'Kabbalistic Numerology': 1,
  'Vedic Astrology': 1.1,
  'Runes': 1,
  'Life Purpose Analysis': 1.05,
  'Dasha Periods': 1.05,
  'Panchanga': 1,
  'Spiritual Guidance': 1,
  'Horary': 1.05,
  'Geomancy': 1,
  'Western Astrology': 1
};

/** Functional sorting: question subtype -> primary and secondary systems (one job per system, no stacking same role). */
export type QuestionSubtype = 'when' | 'binary' | 'directional' | 'relationship' | 'career_timing' | 'immediate' | 'life_theme' | null;

const QUESTION_SUBTYPE_MATRIX: Record<NonNullable<QuestionSubtype>, { primary: string[]; secondary: string[] }> = {
  when: { primary: ['Vedic Astrology', 'Vedic Dashas', 'Dasha Periods', 'Planetary Transits'], secondary: ['KP Astrology'] },
  binary: { primary: ['KP Astrology'], secondary: ['Horary'] },
  directional: { primary: ['I Ching'], secondary: ['Tarot'] },
  relationship: { primary: ['Tarot'], secondary: ['Western Astrology'] },
  career_timing: { primary: ['Vedic Astrology', 'Vedic Dashas', 'Dasha Periods'], secondary: ['Numerology'] },
  immediate: { primary: ['Horary'], secondary: ['Geomancy'] },
  life_theme: { primary: ['Kabbalistic Numerology'], secondary: ['Western Astrology'] }
};

export class ComprehensiveSeerEngine {
  private universalData: UniversalDivinationData;
  private markovChain: LifePathMarkovChain;
  private bayesianNetwork: BayesianBeliefNetwork;
  private predictiveSystem: PredictiveSystem;
  private swissEphemeris: SwissEphemerisService;
  private currentTransits: CurrentTransitService;
  private astroCoach: AstroCoach;
  private seerAggregator: SeerAggregator;
  private userId?: string;
  private comprehensiveProfile?: any;
  /** Set for the duration of answerQuestion so answer methods can use primary/secondary (functional sorting). */
  private _currentSubtype: QuestionSubtype = null;
  private _currentMatrixEntry: { primary: string[]; secondary: string[] } | null = null;

  constructor(universalData: UniversalDivinationData, userId?: string, comprehensiveProfile?: any) {
    this.universalData = universalData;
    this.markovChain = new LifePathMarkovChain();
    this.bayesianNetwork = new BayesianBeliefNetwork();
    this.predictiveSystem = new PredictiveSystem();
    this.swissEphemeris = new SwissEphemerisService();
    this.currentTransits = CurrentTransitService.getInstance();
    this.astroCoach = new AstroCoach();
    this.seerAggregator = new SeerAggregator();
    this.userId = userId;
    this.comprehensiveProfile = comprehensiveProfile;
  }

  /** Returns a safe string for display; never undefined, null, or the literal "undefined". */
  private safeStr(value: unknown, fallback: string): string {
    if (value === undefined || value === null || value === 'undefined') return fallback;
    const s = String(value).trim();
    return s === '' || s === 'undefined' ? fallback : s;
  }

  /**
   * Gather timing contributions from all available occult systems (Western, Tarot, Bazi, I Ching, etc.).
   * Used alongside Vedic/Transits/Numerology to produce a combined recommendation and list all sources in "See more".
   */
  private getAdditionalTimingContributions(targetYear: string | null, eventLabel: string | null): TimingContribution[] {
    const out: TimingContribution[] = [];
    const yearPhrase = targetYear || 'the coming year';
    const eventPhrase = eventLabel ? ` for your ${eventLabel}` : ' for your event';

    // Western Astrology – transits or favorable periods
    const western = this.universalData.westernAstrology as { reading?: { transits?: unknown; favorablePeriods?: unknown[] }; transits?: unknown } | undefined;
    if (western?.reading?.transits || western?.transits || (Array.isArray(western?.reading?.favorablePeriods) && western.reading.favorablePeriods.length > 0)) {
      const periods = (western?.reading?.favorablePeriods as { month?: string; window?: string }[]) ?? [];
      const windowStr = periods.length > 0 && periods[0]?.window ? periods[0].window : (periods[0]?.month ? `${periods[0].month} ${targetYear || ''}`.trim() : null);
      out.push({
        systemId: 'Western Transits',
        suggestedDateOrWindow: windowStr ?? undefined,
        summary: windowStr ? `Western transits suggest ${windowStr} as a favorable window${eventPhrase}.` : `Western chart supports timing decisions; favorable windows can be identified from your progressions and transits in ${yearPhrase}.`,
        confidence: 0.8
      });
    }

    // Tarot – if reading has timing or lucky period text
    const tarot = this.universalData.tarot as { reading?: { timing?: string; luckyPeriod?: string; overview?: string } } | undefined;
    if (tarot?.reading) {
      const timingText = this.safeStr(tarot.reading.timing ?? tarot.reading.luckyPeriod ?? (tarot.reading.overview && tarot.reading.overview.length > 80 ? tarot.reading.overview.slice(0, 120) + '…' : ''), '');
      if (timingText) {
        out.push({
          systemId: 'Tarot',
          summary: timingText.length > 100 ? `Tarot: ${timingText.slice(0, 100)}…` : `Tarot: ${timingText}`,
          confidence: 0.7
        });
      } else {
        out.push({ systemId: 'Tarot', summary: `Tarot insight supports choosing an auspicious moment${eventPhrase} in ${yearPhrase}.`, confidence: 0.65 });
      }
    }

    // Bazi / Four Pillars – favorable period or pillar cycle
    const bazi = this.universalData.baziFourPillars as { reading?: { favorablePeriod?: string; timing?: string }; pillars?: unknown } | undefined;
    if (bazi?.reading?.favorablePeriod || bazi?.reading?.timing || bazi?.pillars) {
      const period = this.safeStr(bazi.reading?.favorablePeriod ?? bazi.reading?.timing, '');
      out.push({
        systemId: 'BaZi',
        suggestedDateOrWindow: period || undefined,
        summary: period ? `BaZi favorable period: ${period}.` : `BaZi pillar cycles support timing decisions in ${yearPhrase}.`,
        confidence: 0.8
      });
    }

    // I Ching – if reading has timing or change text
    const iching = this.universalData.iching as { reading?: { timing?: string; change?: string; interpretation?: string } } | undefined;
    if (iching?.reading) {
      const timingText = this.safeStr(iching.reading.timing ?? iching.reading.change ?? iching.reading.interpretation, '');
      if (timingText && timingText.length > 20) {
        out.push({ systemId: 'I Ching', summary: `I Ching: ${timingText.slice(0, 100)}${timingText.length > 100 ? '…' : ''}`, confidence: 0.7 });
      } else {
        out.push({ systemId: 'I Ching', summary: `I Ching supports reflecting on the right moment${eventPhrase} in ${yearPhrase}.`, confidence: 0.65 });
      }
    }

    // Angel Numbers – if reading has favorable period or timing
    const angel = this.universalData.angelNumbers as { reading?: { favorablePeriod?: string; timing?: string } } | undefined;
    if (angel?.reading?.favorablePeriod || angel?.reading?.timing) {
      const period = this.safeStr(angel.reading?.favorablePeriod ?? angel.reading?.timing, '');
      out.push({
        systemId: 'Angel Numbers',
        summary: period ? `Angel Numbers: ${period}.` : `Angel number cycles support favorable timing in ${yearPhrase}.`,
        confidence: 0.7
      });
    }

    // KP Astrology – if data has dasha or timing
    const kp = this.universalData.kpAstrology as { reading?: { timing?: string }; dashas?: unknown } | undefined;
    if (kp?.reading?.timing || kp?.dashas) {
      const timingText = this.safeStr(kp.reading?.timing, '');
      out.push({
        systemId: 'KP Astrology',
        summary: timingText ? `KP Astrology: ${timingText.slice(0, 100)}${timingText.length > 100 ? '…' : ''}` : `KP sub-periods support timing decisions in ${yearPhrase}.`,
        confidence: 0.85
      });
    }

    // Kabbalistic Numerology – timing or life cycle
    const kabbalistic = this.universalData.kabbalisticNumerology as { reading?: { timing?: { overview?: string }; lifeCycle?: unknown } } | undefined;
    if (kabbalistic?.reading?.timing?.overview || kabbalistic?.reading?.lifeCycle) {
      const overview = this.safeStr(kabbalistic.reading?.timing?.overview, '');
      out.push({
        systemId: 'Kabbalistic Numerology',
        summary: overview ? `Kabbalistic cycles: ${overview.slice(0, 100)}${overview.length > 100 ? '…' : ''}` : `Kabbalistic numerology supports favorable timing in ${yearPhrase}.`,
        confidence: 0.75
      });
    }

    return out;
  }

  async answerQuestion(question: string, decomposedQuery?: DecomposedQuery | null): Promise<ComprehensiveSeerResponse> {
    console.log('🔮 ComprehensiveSeerEngine: Processing question with ALL systems:', question);

    try {
      // Validate inputs
      if (!question || question.trim().length < 3) {
        throw new Error('Question must be at least 3 characters long');
      }
      
      if (!this.universalData || !this.universalData.profile) {
        throw new Error('Universal data not available. Please ensure your profile is complete.');
      }
      
      // Detect question type and subtype (functional sorting: primary/secondary systems)
      const questionType = this.detectQuestionType(question);
      const subtype = this.detectQuestionSubtype(question, questionType);
      this._currentSubtype = subtype;
      this._currentMatrixEntry = subtype ? QUESTION_SUBTYPE_MATRIX[subtype] : null;
      const keywords = this.extractKeywords(question);
      
      console.log('📊 Question Type:', questionType, 'Subtype:', subtype ?? 'none', 'Keywords:', keywords);
      
      // Generate response based on type using primary/secondary systems when subtype is set
      let response: ComprehensiveSeerResponse;
    
    switch(questionType) {
      case 'purpose':
        response = await this.answerPurposeQuestion(question, keywords);
        break;
      case 'marriage':
        response = await this.answerMarriageQuestion(question, keywords);
        break;
      case 'career':
        response = await this.answerCareerQuestion(question, keywords);
        break;
      case 'health':
        response = await this.answerHealthQuestion(question, keywords);
        break;
      case 'wealth':
        response = await this.answerWealthQuestion(question, keywords);
        break;
      case 'timing':
        response = await this.answerTimingQuestion(question, keywords);
        break;
      case 'spiritual':
        response = await this.answerSpiritualQuestion(question, keywords);
        break;
      case 'protection':
        response = await this.answerProtectionQuestion(question, keywords);
        break;
      case 'past-life':
        response = await this.answerPastLifeQuestion(question, keywords);
        break;
      case 'remedy':
        response = await this.answerRemedyQuestion(question, keywords);
        break;
      case 'general':
      default:
        // Fallback to universal handler for ANY question
        response = await this.answerUniversalQuestion(question, keywords);
        break;
    }

    // Set primary/secondary systems on response when subtype was used (functional sorting)
    if (this._currentMatrixEntry) {
      response.primarySecondarySystems = {
        primary: [...this._currentMatrixEntry.primary],
        secondary: [...this._currentMatrixEntry.secondary]
      };
    }

    // Shared post-processing: probability band and uncertainty wording for all question types
    if (!response.confidenceBand) {
      const c = typeof response.confidence === 'number' ? response.confidence : 0.75;
      response.confidenceBand = {
        low: Math.max(0.1, c - 0.1),
        high: Math.min(0.95, c + 0.1)
      };
    }
    const band = response.confidenceBand;
    const bandLowPct = Math.round(band.low * 100);
    const bandHighPct = Math.round(band.high * 100);
    const hasUncertaintyPhrase = /probability|not a certainty/i.test(response.answer || '');
    if (!hasUncertaintyPhrase && response.answer) {
      response.answer = `${response.answer} This is a probability-based synthesis from symbolic systems, not a certainty.`;
    }
    const hasConfidenceBandPhrase = /Confidence band:\s*\d/i.test(response.answer || '');
    if (!hasConfidenceBandPhrase && response.answer) {
      response.answer = `${response.answer} Confidence band: ${bandLowPct}–${bandHighPct}%.`;
    }

    // Add cross-system validation
    response.crossSystemValidation = this.validateAcrossSystems(question, questionType);
    
    // Add system agreements
    response.systemAgreements = this.findSystemAgreements(question, questionType);
    
    // Add timing predictions
    response.timingPredictions = this.generateTimingPredictions(question, questionType);
    
    // Aggregate expert responses from tool-specific seers (jurisdiction filter when decomposedQuery provided)
    if (this.userId && this.comprehensiveProfile && this.universalData.profile) {
      try {
        const expertAggregation = await this.aggregateToolExpertResponses(question, decomposedQuery);

        // Synthesis WITHOUT COLLAPSE: conflict-aware reframe; never pick a winner
        if (expertAggregation.expertResponses.length > 0) {
          const conflictType = classifyConflict(expertAggregation.expertResponses.map(r => ({
            tool: r.tool,
            toolName: r.toolName,
            answer: r.answer,
            summary: r.answer.slice(0, 200)
          })));
          response = this.synthesizeWithExpertResponses(response, expertAggregation, conflictType);
        } else {
          // Still add the structure even if no responses
          response.expertResponses = [];
          response.expertConsensus = expertAggregation.expertConsensus;
          response.primaryExpert = expertAggregation.primaryExpert;
        }
      } catch (error) {
        console.warn('⚠️ Error aggregating expert responses:', error);
        // Continue without expert responses if aggregation fails
      }
    }
    
      console.log('✅ Comprehensive response generated with confidence:', response.confidence);
      
      return response;
      
    } catch (error) {
      console.error('❌ Error in ComprehensiveSeerEngine:', error);
      
      // Return a fallback response
      return {
        answer: `I apologize, but I encountered an error while processing your question: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support if the issue persists.`,
        confidence: 0.1,
        sources: ['Error Recovery'],
        relatedTopics: ['error', 'support'],
        followUpSuggestions: [
          'Try rephrasing your question',
          'Check if your profile is complete',
          'Contact support if the issue persists'
        ],
        crossSystemValidation: {
          highAgreement: [],
          mediumAgreement: [],
          lowAgreement: [],
          conflicts: ['System error occurred'],
          overallConfidence: 0.1
        }
      };
    }
  }
  
  private detectQuestionType(question: string): string {
    const lowerQuestion = question.toLowerCase();
    
    // Purpose questions
    if (lowerQuestion.includes('purpose') || lowerQuestion.includes('dharma') || 
        lowerQuestion.includes('mission') || lowerQuestion.includes('destiny')) {
      return 'purpose';
    }
    
    // Marriage questions
    if (lowerQuestion.includes('marriage') || lowerQuestion.includes('marry') || 
        lowerQuestion.includes('wedding') || lowerQuestion.includes('partner') ||
        lowerQuestion.includes('relationship') || lowerQuestion.includes('love')) {
      return 'marriage';
    }
    
    // Career questions
    if (lowerQuestion.includes('career') || lowerQuestion.includes('job') || 
        lowerQuestion.includes('profession') || lowerQuestion.includes('work') ||
        lowerQuestion.includes('business') || lowerQuestion.includes('success')) {
      return 'career';
    }
    
    // Health questions
    if (lowerQuestion.includes('health') || lowerQuestion.includes('illness') || 
        lowerQuestion.includes('disease') || lowerQuestion.includes('medical') ||
        lowerQuestion.includes('body') || lowerQuestion.includes('wellness')) {
      return 'health';
    }
    
    // Wealth questions
    if (lowerQuestion.includes('wealth') || lowerQuestion.includes('money') || 
        lowerQuestion.includes('financial') || lowerQuestion.includes('rich') ||
        lowerQuestion.includes('poverty') || lowerQuestion.includes('income')) {
      return 'wealth';
    }
    
    // Timing questions
    if (lowerQuestion.includes('when') || lowerQuestion.includes('time') || 
        lowerQuestion.includes('period') || lowerQuestion.includes('age') ||
        lowerQuestion.includes('year') || lowerQuestion.includes('month')) {
      return 'timing';
    }
    // Date-specific phrasing: "5th of February 2026", "February 5", "launch on ... February"
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const hasMonthName = monthNames.some(m => lowerQuestion.includes(m));
    const hasYearOrDay = /\b(19|20)\d{2}\b/.test(question) || /\b(0?[1-9]|[12]\d|3[01])\b/.test(question);
    if (hasMonthName && hasYearOrDay) return 'timing';

    // Spiritual questions
    if (lowerQuestion.includes('spiritual') || lowerQuestion.includes('soul') || 
        lowerQuestion.includes('enlightenment') || lowerQuestion.includes('meditation') ||
        lowerQuestion.includes('consciousness') || lowerQuestion.includes('chakra')) {
      return 'spiritual';
    }
    
    // Protection questions
    if (lowerQuestion.includes('protection') || lowerQuestion.includes('negative') || 
        lowerQuestion.includes('evil') || lowerQuestion.includes('curse') ||
        lowerQuestion.includes('black magic') || lowerQuestion.includes('enemy')) {
      return 'protection';
    }
    
    // Past life questions
    if (lowerQuestion.includes('past life') || lowerQuestion.includes('karma') || 
        lowerQuestion.includes('previous') || lowerQuestion.includes('reincarnation')) {
      return 'past-life';
    }

    // Gemstone / remedy questions
    if (/\b(gemstone|gem\b|navaratna|ratti|carats?|which stone|recommend a stone|stone to wear|metal\b|ring\b|wear a stone)\b/i.test(lowerQuestion)) {
      return 'remedy';
    }

    return 'general';
  }

  /**
   * Detect question subtype for functional sorting (primary/secondary system selection).
   * Order: binary and immediate first (most specific), then when, directional, relationship, career_timing, life_theme.
   */
  private detectQuestionSubtype(question: string, questionType: string): QuestionSubtype {
    const lower = question.toLowerCase().trim();
    // Binary: "will it happen", "yes or no", "should I", "will I get", "will we"
    if (/\b(will it happen|yes or no|should i\b|will i get|will we\b|will they\b|can i\b.*\b(get|have|marry)|is it (going to|likely to)|does (it|he|she) (love|want)|did (i|he|she) get)\b/i.test(lower) ||
        /\b(will (this|that|it) (work|happen|succeed|fail)|(is|are) (they|we|he|she) (going to|likely to))\b/i.test(lower)) {
      return 'binary';
    }
    // Immediate: "right now", "urgent", "immediate", "today", "this week" (decision context)
    if (/\b(right now|urgent|immediately?|immediate (decision|answer)|today|this week|quick(ly)?|asap|need (an? )?answer (now|today))\b/i.test(lower)) {
      return 'immediate';
    }
    // When: timing type + "when", "what year", "what month", "how long"
    if (questionType === 'timing' && /\b(when|what (year|month|period)|how long|which (year|month)|time (frame|window))\b/i.test(lower)) {
      return 'when';
    }
    // Career timing: career type + timing keywords
    if (questionType === 'career' && /\b(when|year|month|period|timing|best time|right time)\b/i.test(lower)) {
      return 'career_timing';
    }
    // Directional: "where is this going", "what direction", "how will this evolve"
    if (/\b(where (is|are) (this|things|we|it) going|what (direction|path)|how will (this|it) (evolve|unfold|go)|trajectory|heading)\b/i.test(lower)) {
      return 'directional';
    }
    // Relationship: marriage type or strong relationship/love keywords
    if (questionType === 'marriage' || /\b(relationship|love|partner|compatibility|marriage|marry|wedding)\b/i.test(lower)) {
      return 'relationship';
    }
    // Life theme: purpose or past-life type, or "meaning", "life theme", "soul"
    if (questionType === 'purpose' || questionType === 'past-life' ||
        /\b(meaning (of|in)|life theme|soul (level|purpose)|bigger picture|why (am i|is this)|karmic|dharma)\b/i.test(lower)) {
      return 'life_theme';
    }
    return null;
  }

  /**
   * When a subtype is set (functional sorting), only sources in primary or secondary are allowed (no same-job stacking).
   * When no subtype, returns true for any source (no restriction).
   */
  private isSourcePreferredForSubtype(sourceName: string): boolean {
    if (!this._currentMatrixEntry) return true;
    const primary = this._currentMatrixEntry.primary;
    const secondary = this._currentMatrixEntry.secondary;
    return primary.includes(sourceName) || secondary.includes(sourceName);
  }

  private extractKeywords(question: string): string[] {
    const words = question.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    // Remove common words
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'what', 'when', 'where', 'why', 'how', 'who', 'which', 'that', 'this', 'these', 'those'];
    
    return words.filter(word => !stopWords.includes(word));
  }
  
  private async answerPurposeQuestion(question: string, keywords: string[]): Promise<ComprehensiveSeerResponse> {
    console.log('🎯 Analyzing life purpose using ALL systems...');
    
    const responses = [];
    const sources = [];
    let totalConfidence = 0;
    let systemCount = 0;
    
    // Vedic Astrology Analysis
    if (this.universalData.vedicAstrology?.reading) {
      const vedicPurpose = this.universalData.vedicAstrology.reading.lifePurpose;
      if (vedicPurpose) {
        responses.push(`**Vedic Astrology:** ${vedicPurpose.overview}`);
        sources.push('Vedic Astrology');
        totalConfidence += 0.9;
        systemCount++;
      }
    }
    
    // Western Astrology Analysis
    if (this.universalData.westernAstrology?.reading) {
      const westernPurpose = this.universalData.westernAstrology.reading.lifePurpose;
      if (westernPurpose) {
        responses.push(`**Western Astrology:** ${westernPurpose.overview}`);
        sources.push('Western Astrology');
        totalConfidence += 0.8;
        systemCount++;
      }
    }
    
    // Numerology Analysis
    if (this.universalData.chaldeanNumerology?.reading) {
      const numerologyPurpose = this.universalData.chaldeanNumerology.reading.lifePurpose;
      if (numerologyPurpose) {
        responses.push(`**Numerology:** ${numerologyPurpose.overview}`);
        sources.push('Numerology');
        totalConfidence += 0.75;
        systemCount++;
      }
    }
    
    // Tarot Analysis
    if (this.universalData.tarot?.reading) {
      const tarotPurpose = this.universalData.tarot.reading.lifePurpose;
      if (tarotPurpose) {
        responses.push(`**Tarot:** ${tarotPurpose.overview}`);
        sources.push('Tarot');
        totalConfidence += 0.7;
        systemCount++;
      }
    }
    
    // I-Ching Analysis
    if (this.universalData.iching?.reading) {
      const ichingPurpose = this.universalData.iching.reading.lifePurpose;
      if (ichingPurpose) {
        responses.push(`**I-Ching:** ${ichingPurpose.overview}`);
        sources.push('I-Ching');
        totalConfidence += 0.65;
        systemCount++;
      }
    }
    
    // Name Analysis
    if (this.universalData.nameAnalysis?.reading) {
      const namePurpose = this.universalData.nameAnalysis.reading.lifePurpose;
      if (namePurpose) {
        responses.push(`**Name Analysis:** ${namePurpose.overview}`);
        sources.push('Name Analysis');
        totalConfidence += 0.6;
        systemCount++;
      }
    }
    
    // Synthesize the response
    const synthesizedAnswer = this.synthesizePurposeResponse(responses, keywords);
    const averageConfidence = systemCount > 0 ? totalConfidence / systemCount : 0;
    
    return {
      answer: synthesizedAnswer,
      confidence: Math.min(0.95, averageConfidence),
      sources,
      relatedTopics: ['dharma', 'soul mission', 'spiritual path', 'life lessons'],
      followUpSuggestions: [
        'What are my spiritual practices?',
        'How can I align with my purpose?',
        'What obstacles might I face?',
        'When will my purpose manifest?'
      ],
      celebrityMatches: await this.getPurposeCelebrityMatches(),
      dailyInsight: this.generatePurposeDailyInsight(),
      spiritualGuidance: this.generatePurposeSpiritualGuidance()
    };
  }
  
  private async answerMarriageQuestion(question: string, keywords: string[]): Promise<ComprehensiveSeerResponse> {
    console.log('💕 Analyzing marriage using ALL systems...');
    
    const responses = [];
    const sources = [];
    let totalConfidence = 0;
    let systemCount = 0;

    // Functional sorting: when subtype is relationship, prefer Tarot (primary) and Western Astrology (secondary) only
    const addIfPreferred = (sourceName: string, overview: string, conf: number) => {
      if (!this.isSourcePreferredForSubtype(sourceName)) return;
      responses.push(`**${sourceName}:** ${overview}`);
      sources.push(sourceName);
      totalConfidence += conf;
      systemCount++;
    };
    
    // Vedic Astrology Analysis
    if (this.universalData.vedicAstrology?.reading) {
      const vedicMarriage = this.universalData.vedicAstrology.reading.relationships;
      if (vedicMarriage) addIfPreferred('Vedic Astrology', vedicMarriage.overview, 0.9);
    }
    
    // Western Astrology Analysis (secondary for relationship)
    if (this.universalData.westernAstrology?.reading) {
      const westernMarriage = this.universalData.westernAstrology.reading.relationships;
      if (westernMarriage) addIfPreferred('Western Astrology', westernMarriage.overview, 0.8);
    }
    
    // Synastry Analysis
    if (this.universalData.synastry?.reading) {
      const synastryMarriage = this.universalData.synastry.reading.compatibility;
      if (synastryMarriage) addIfPreferred('Synastry', synastryMarriage.overview, 0.85);
    }
    
    // Numerology Analysis
    if (this.universalData.chaldeanNumerology?.reading) {
      const numerologyMarriage = this.universalData.chaldeanNumerology.reading.relationships;
      if (numerologyMarriage) addIfPreferred('Numerology', numerologyMarriage.overview, 0.75);
    }
    
    // Tarot Analysis (primary for relationship)
    if (this.universalData.tarot?.reading) {
      const tarotMarriage = this.universalData.tarot.reading.relationships;
      if (tarotMarriage) addIfPreferred('Tarot', tarotMarriage.overview, 0.7);
    }
    
    // Synthesize the response
    const synthesizedAnswer = this.synthesizeMarriageResponse(responses, keywords);
    const averageConfidence = systemCount > 0 ? totalConfidence / systemCount : 0;
    
    return {
      answer: synthesizedAnswer,
      confidence: Math.min(0.95, averageConfidence),
      sources,
      relatedTopics: ['compatibility', 'timing', 'partnership', 'family'],
      followUpSuggestions: [
        'What kind of partner suits me?',
        'When will I get married?',
        'What are my relationship challenges?',
        'How can I attract the right partner?'
      ],
      celebrityMatches: await this.getMarriageCelebrityMatches(),
      timingPredictions: this.generateMarriageTimingPredictions()
    };
  }
  
  private async answerCareerQuestion(question: string, keywords: string[]): Promise<ComprehensiveSeerResponse> {
    console.log('💼 Analyzing career using ALL systems...');
    
    const responses = [];
    const sources = [];
    let totalConfidence = 0;
    let systemCount = 0;

    // Functional sorting: when subtype is career_timing, prefer Vedic (primary) and Numerology (secondary) only
    const addIfPreferred = (sourceName: string, overview: string, conf: number) => {
      if (!this.isSourcePreferredForSubtype(sourceName)) return;
      responses.push(`**${sourceName}:** ${overview}`);
      sources.push(sourceName);
      totalConfidence += conf;
      systemCount++;
    };
    
    // Vedic Astrology Analysis (primary for career_timing)
    if (this.universalData.vedicAstrology?.reading) {
      const vedicCareer = this.universalData.vedicAstrology.reading.career;
      if (vedicCareer) addIfPreferred('Vedic Astrology', vedicCareer.overview, 0.9);
    }
    
    // Western Astrology Analysis
    if (this.universalData.westernAstrology?.reading) {
      const westernCareer = this.universalData.westernAstrology.reading.career;
      if (westernCareer) addIfPreferred('Western Astrology', westernCareer.overview, 0.8);
    }
    
    // Financial Astrology Analysis
    if (this.universalData.financialAstrology?.reading) {
      const financialCareer = this.universalData.financialAstrology.reading.career;
      if (financialCareer) addIfPreferred('Financial Astrology', financialCareer.overview, 0.85);
    }
    
    // Numerology Analysis (secondary for career_timing)
    if (this.universalData.chaldeanNumerology?.reading) {
      const numerologyCareer = this.universalData.chaldeanNumerology.reading.career;
      if (numerologyCareer) addIfPreferred('Numerology', numerologyCareer.overview, 0.75);
    }
    
    // Synthesize the response
    const synthesizedAnswer = this.synthesizeCareerResponse(responses, keywords);
    const averageConfidence = systemCount > 0 ? totalConfidence / systemCount : 0;
    
    return {
      answer: synthesizedAnswer,
      confidence: Math.min(0.95, averageConfidence),
      sources,
      relatedTopics: ['profession', 'success', 'timing', 'skills'],
      followUpSuggestions: [
        'What career suits me best?',
        'When will I succeed professionally?',
        'What are my natural talents?',
        'How can I advance my career?'
      ],
      celebrityMatches: await this.getCareerCelebrityMatches(),
      timingPredictions: this.generateCareerTimingPredictions()
    };
  }
  
  private async answerHealthQuestion(question: string, keywords: string[]): Promise<ComprehensiveSeerResponse> {
    console.log('🏥 Analyzing health using ALL systems...');
    
    const responses = [];
    const sources = [];
    let totalConfidence = 0;
    let systemCount = 0;
    
    // Medical Astrology Analysis
    if (this.universalData.medicalAstrology?.reading) {
      const medicalHealth = this.universalData.medicalAstrology.reading.health;
      if (medicalHealth) {
        responses.push(`**Medical Astrology:** ${medicalHealth.overview}`);
        sources.push('Medical Astrology');
        totalConfidence += 0.9;
        systemCount++;
      }
    }
    
    // Vedic Astrology Analysis
    if (this.universalData.vedicAstrology?.reading) {
      const vedicHealth = this.universalData.vedicAstrology.reading.health;
      if (vedicHealth) {
        responses.push(`**Vedic Astrology:** ${vedicHealth.overview}`);
        sources.push('Vedic Astrology');
        totalConfidence += 0.85;
        systemCount++;
      }
    }
    
    // Western Astrology Analysis
    if (this.universalData.westernAstrology?.reading) {
      const westernHealth = this.universalData.westernAstrology.reading.health;
      if (westernHealth) {
        responses.push(`**Western Astrology:** ${westernHealth.overview}`);
        sources.push('Western Astrology');
        totalConfidence += 0.8;
        systemCount++;
      }
    }
    
    // Palmistry Analysis
    if (this.universalData.palmistry?.reading) {
      const palmistryHealth = this.universalData.palmistry.reading.health;
      if (palmistryHealth) {
        responses.push(`**Palmistry:** ${palmistryHealth.overview}`);
        sources.push('Palmistry');
        totalConfidence += 0.7;
        systemCount++;
      }
    }
    
    // Face Reading Analysis
    if (this.universalData.faceReading?.reading) {
      const faceHealth = this.universalData.faceReading.reading.health;
      if (faceHealth) {
        responses.push(`**Face Reading:** ${faceHealth.overview}`);
        sources.push('Face Reading');
        totalConfidence += 0.65;
        systemCount++;
      }
    }
    
    // Synthesize the response
    let synthesizedAnswer = this.synthesizeHealthResponse(responses, keywords);
    if (sources.includes('Medical Astrology') && !synthesizedAnswer.includes(MEDICAL_DISCLAIMER)) {
      synthesizedAnswer = `${synthesizedAnswer.trim()}\n\n${MEDICAL_DISCLAIMER}`;
    }
    const averageConfidence = systemCount > 0 ? totalConfidence / systemCount : 0;

    return {
      answer: synthesizedAnswer,
      confidence: Math.min(0.95, averageConfidence),
      sources,
      relatedTopics: ['wellness', 'prevention', 'healing', 'vitality'],
      followUpSuggestions: [
        'What should I be careful about?',
        'How can I improve my health?',
        'What are my vulnerable areas?',
        'What healing practices suit me?'
      ],
      protectionGuidance: this.generateHealthProtectionGuidance()
    };
  }
  
  private async answerWealthQuestion(question: string, keywords: string[]): Promise<ComprehensiveSeerResponse> {
    console.log('💰 Analyzing wealth using ALL systems...');
    
    // Get ALL available data
    const allData = this.extractAllAvailableData();
    
    if (!allData || allData.length === 0) {
      return {
        answer: "I need more information to provide accurate guidance. Please ensure your profile is complete.",
        confidence: 0,
        sources: [],
        relatedTopics: [],
        followUpSuggestions: []
      };
    }
    
    // Build contextual response for wealth/money questions
    const wealthContext = `Based on your comprehensive mystical profile, here's guidance about your wealth and financial prospects:

${allData}

**Wealth Analysis:**
Looking at your chart, your career path (teaching, healing, counseling, spiritual guidance, writing) indicates wealth through service and wisdom-sharing. Success timing is around ages 28, 35, and 42. Your dharma of serving humanity through wisdom and compassion aligns with professions that bring both fulfillment and prosperity.

**For 2025-2026:**
Your current dasha period brings growth and expansion. The timing suggests favorable periods ahead, particularly focusing on spiritual practices and authentic service. Financial success will come through staying true to your purpose rather than chasing money directly.

**Key Recommendations:**
- Focus on authenticity and service to others
- Leverage your natural gifts in teaching/healing
- Practice the remedies suggested for enhanced prosperity
- Align business decisions with your spiritual path`;

    const answer = wealthContext.includes(FINANCIAL_DISCLAIMER)
      ? wealthContext
      : `${wealthContext.trim()}\n\n${FINANCIAL_DISCLAIMER}`;

    return {
      answer,
      confidence: 0.85,
      sources: ['Vedic Astrology', 'Life Purpose Analysis', 'Dasha Periods'],
      relatedTopics: ['prosperity', 'career', 'dharma', 'timing'],
      followUpSuggestions: [
        'What business opportunities align with my dharma?',
        'When is the best time to start a new venture?',
        'What remedies can enhance my prosperity?',
        'How can I balance wealth and spirituality?'
      ],
      timingPredictions: this.generateWealthTimingPredictions()
    };
  }
  
  private async answerTimingQuestion(question: string, keywords: string[]): Promise<ComprehensiveSeerResponse> {
    console.log('⏰ Analyzing timing using ALL systems...');

    // Parse target year (e.g. 2026) and event (release, launch, etc.) from the question
    const yearMatch = question.match(/\b(19|20)\d{2}\b/);
    const targetYear = yearMatch ? yearMatch[0] : null;
    const lowerQuestion = question.toLowerCase();
    const eventKeywords = ['release', 'launch', 'start', 'open', 'begin'];
    const eventLabel = eventKeywords.find(kw => lowerQuestion.includes(kw)) || null;

    // Parse user-requested specific date (e.g. "5th of February 2026", "February 5, 2026", "5 February 2026")
    const MONTH_NAMES_LOWER = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    let requestedDate: { day: number; monthNum: number; year: string } | null = null;
    const dayMonthYearInQuestion = (() => {
      // "5th of February 2026", "5 of february 2026"
      const ofMatch = lowerQuestion.match(/(\d{1,2})(?:st|nd|rd|th)?\s+of\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s*(?:\s|,)?\s*(\d{4})?/);
      if (ofMatch) {
        const day = parseInt(ofMatch[1], 10);
        const monthIdx = MONTH_NAMES_LOWER.indexOf(ofMatch[2]);
        const year = ofMatch[3] || targetYear;
        if (monthIdx >= 0 && day >= 1 && day <= 31 && year) return { day, monthNum: monthIdx + 1, year };
      }
      // "February 5, 2026", "February 5 2026", "february 5"
      const monthFirstMatch = lowerQuestion.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:,|\s)?\s*(\d{4})?/);
      if (monthFirstMatch) {
        const monthIdx = MONTH_NAMES_LOWER.indexOf(monthFirstMatch[1]);
        const day = parseInt(monthFirstMatch[2], 10);
        const year = monthFirstMatch[3] || targetYear;
        if (monthIdx >= 0 && day >= 1 && day <= 31 && year) return { day, monthNum: monthIdx + 1, year };
      }
      // "5 February 2026", "5th February 2026"
      const dayFirstMatch = lowerQuestion.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s*(?:\s|,)?\s*(\d{4})?/);
      if (dayFirstMatch) {
        const day = parseInt(dayFirstMatch[1], 10);
        const monthIdx = MONTH_NAMES_LOWER.indexOf(dayFirstMatch[2]);
        const year = dayFirstMatch[3] || targetYear;
        if (monthIdx >= 0 && day >= 1 && day <= 31 && year) return { day, monthNum: monthIdx + 1, year };
      }
      return null;
    })();
    if (dayMonthYearInQuestion) requestedDate = dayMonthYearInQuestion;

    const timingContext = { targetYear, eventLabel };
    const responses: string[] = [];
    const sources: string[] = [];
    const supportSummaries: string[] = [];
    /** Per-system confidence for reliability-weighted combination and probability band. Flow: (1) Symbolic feature extraction — each system contributes confidence and summary; (2) Reliability-weighted combination — weighted average and band; (3) Probability band output — explicit uncertainty. */
    const confidenceEntries: { source: string; confidence: number }[] = [];
    let dashaSummaryForDetail = '';
    let transitSummaryForDetail = '';

    // Vedic Dasha Analysis – build summary from actual data (no .overview); never output "undefined"
    const dashaFallback = 'Dasha periods support timing decisions; a full Vedic reading can pinpoint specific dates for your event.';
    if (this.universalData.vedicAstrology?.dashas) {
      const dashaTiming = this.universalData.vedicAstrology.dashas as Record<string, unknown>;
      if (dashaTiming && typeof dashaTiming === 'object') {
        let dashaSummary: string;
        const current = (dashaTiming.currentDasha as { planet?: string; mahadasha?: string; antardasha?: string; startDate?: string; endDate?: string; antardashas?: Array<{ planet?: string; progress?: number }> }) | undefined;
        if (this.safeStr(current?.planet, '') !== '' || this.safeStr(current?.mahadasha, '') !== '') {
          const mahadasha = this.safeStr(current?.mahadasha ?? current?.planet, 'current');
          const antardashaRaw = current?.antardasha ?? (Array.isArray(current?.antardashas) ? current.antardashas.find((a: { progress?: number }) => a.progress != null && a.progress > 0) as { planet?: string } | undefined : undefined)?.planet ?? null;
          const antardasha = this.safeStr(antardashaRaw, '');
          const startDate = this.safeStr(current?.startDate, '');
          const endDate = this.safeStr(current?.endDate, '');
          const period = startDate && endDate ? ` (${startDate}–${endDate})` : '';
          const yearPhrase = targetYear || 'the coming year';
          dashaSummary = antardasha
            ? `You're in ${mahadasha} Mahadasha, ${antardasha} Antardasha${period}; favorable for major moves in ${yearPhrase}.`
            : `You're in ${mahadasha} Mahadasha${period}; favorable for timing decisions in ${yearPhrase}.`;
          dashaSummaryForDetail = `${mahadasha} Mahadasha, ${antardasha} Antardasha`;
        } else {
          const dashaList = (dashaTiming.dasha ?? dashaTiming.mahadashas) as Array<{ planet?: string; isCurrent?: boolean }> | undefined;
          const currentEntry = Array.isArray(dashaList) ? dashaList.find((d: { isCurrent?: boolean }) => d.isCurrent) : undefined;
          const planet = this.safeStr(currentEntry?.planet, '');
          if (planet) {
            dashaSummary = `Current ${planet} Dasha period supports favorable timing; consider ${targetYear || 'the coming year'} for your event.`;
            dashaSummaryForDetail = `${planet} Dasha`;
          } else {
            dashaSummary = dashaFallback;
            dashaSummaryForDetail = '';
          }
        }
        const dashaLine = `**Vedic Dashas:** ${dashaSummary}`;
        if (!dashaLine.includes('undefined') && this.isSourcePreferredForSubtype('Vedic Dashas')) {
          responses.push(dashaLine);
          sources.push('Vedic Dashas');
          supportSummaries.push(dashaSummary);
          confidenceEntries.push({ source: 'Vedic Dashas', confidence: 0.9 });
        }
      }
    }

    // Planetary Transits – build summary from favorable/challenging/upcoming (no .overview); never output "undefined"
    const transitFallback = 'Current transits influence timing; favorable windows can be identified from your chart.';
    if (this.universalData.vedicAstrology?.transits) {
      const transitTiming = this.universalData.vedicAstrology.transits as { favorable?: unknown[]; challenging?: unknown[]; upcoming?: unknown[] };
      if (transitTiming && typeof transitTiming === 'object') {
        const fav = Array.isArray(transitTiming.favorable) ? transitTiming.favorable.length : 0;
        const chal = Array.isArray(transitTiming.challenging) ? transitTiming.challenging.length : 0;
        const up = Array.isArray(transitTiming.upcoming) ? transitTiming.upcoming.length : 0;
        let transitSummary: string;
        if (fav > 0 || chal > 0 || up > 0) {
          const parts: string[] = [];
          if (fav > 0) parts.push(`${fav} favorable`);
          if (chal > 0) parts.push(`${chal} challenging`);
          transitSummary = parts.length > 0
            ? `${parts.join(' and ')} transit(s) currently; ${up > 0 ? ` ${up} upcoming major transit(s) to consider for timing.` : ' consider Jupiter/Venus windows for major moves.'}`
            : up > 0 ? `${up} upcoming major transit(s); consider these windows for your event in ${targetYear || 'the coming year'}.` : transitFallback;
        } else {
          transitSummary = transitFallback;
        }
        transitSummaryForDetail = transitSummary;
        const transitLine = `**Planetary Transits:** ${transitSummary}`;
        if (!transitLine.includes('undefined') && this.isSourcePreferredForSubtype('Planetary Transits')) {
          responses.push(transitLine);
          sources.push('Planetary Transits');
          supportSummaries.push(transitSummary);
          confidenceEntries.push({ source: 'Planetary Transits', confidence: 0.85 });
        }
      }
    }

    // Numerology Cycles – use .overview with fallback so never undefined
    if (this.universalData.chaldeanNumerology?.reading) {
      const numerologyTiming = this.universalData.chaldeanNumerology.reading.timing as { overview?: string } | undefined;
      if (numerologyTiming) {
        const numerSummary = this.safeStr(numerologyTiming.overview, 'Numerology cycles support favorable timing.').trim();
        if (numerSummary) {
          const numerLine = `**Numerology Cycles:** ${numerSummary}`;
          if (!numerLine.includes('undefined') && this.isSourcePreferredForSubtype('Numerology')) {
            responses.push(numerLine);
            sources.push('Numerology');
            supportSummaries.push(numerSummary);
            confidenceEntries.push({ source: 'Numerology', confidence: 0.75 });
          }
        }
      }
    }

    // Additional systems: Western, Tarot, BaZi, I Ching, Angel Numbers, KP, Kabbalistic (filtered by subtype when set)
    const additionalContributions = this.getAdditionalTimingContributions(targetYear, eventLabel);
    for (const c of additionalContributions) {
      if (!c.summary || c.summary.includes('undefined') || !this.isSourcePreferredForSubtype(c.systemId)) continue;
      responses.push(`**${c.systemId}:** ${c.summary}`);
      sources.push(c.systemId);
      supportSummaries.push(c.summary);
      confidenceEntries.push({ source: c.systemId, confidence: c.confidence });
    }

    // Binary subtype: add Horary when data exists (primary KP already from additionalContributions, Horary secondary)
    if (this.isSourcePreferredForSubtype('Horary')) {
      const horary = (this.universalData as { horaryAstrology?: { reading?: { answer?: string; overview?: string; interpretation?: string } } }).horaryAstrology?.reading;
      if (horary) {
        const horaryText = (horary.overview ?? horary.answer ?? horary.interpretation ?? '').toString().trim();
        if (horaryText) {
          const horarySummary = horaryText.length > 120 ? horaryText.slice(0, 120) + '…' : horaryText;
          responses.push(`**Horary:** ${horarySummary}`);
          sources.push('Horary');
          supportSummaries.push(horarySummary);
          confidenceEntries.push({ source: 'Horary', confidence: 0.85 });
        }
      }
    }

    const systemCount = confidenceEntries.length;
    const weight = (source: string) => SYSTEM_RELIABILITY_WEIGHTS[source] ?? 1;
    const weightedSum = confidenceEntries.reduce((s, e) => s + e.confidence * weight(e.source), 0);
    const weightSum = confidenceEntries.reduce((s, e) => s + weight(e.source), 0);
    let averageConfidence = weightSum > 0 ? weightedSum / weightSum : 0;
    const confValues = confidenceEntries.map(e => e.confidence);
    let bandLow = confValues.length > 0 ? Math.max(0.1, Math.min(...confValues) - 0.05) : averageConfidence;
    let bandHigh = confValues.length > 0 ? Math.min(0.95, Math.max(...confValues) + 0.05) : averageConfidence;
    const maxConfBySystems = systemCount <= 1 ? 0.70 : systemCount === 2 ? 0.80 : 0.90;
    averageConfidence = Math.min(averageConfidence, maxConfBySystems);
    bandLow = Math.min(bandLow, maxConfBySystems);
    bandHigh = Math.min(bandHigh, maxConfBySystems);
    const confidenceBand = { low: bandLow, high: bandHigh };
    const confidencePct = Math.round(Math.min(0.95, averageConfidence) * 100);
    const bandLowPct = Math.round(bandLow * 100);
    const bandHighPct = Math.round(bandHigh * 100);
    const eventPhrase = eventLabel ? ` for your ${eventLabel}` : ' for your event';

    // Single recommended date when target year is present
    let recommendedDate: string | undefined;
    let leadSentence: string | null = null;
    let timingDetail: string | undefined;
    let ketuCaveat = '';
    let twoPhaseSentence = '';
    const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    if (targetYear) {
      const yearNum = parseInt(targetYear, 10);
      try {
        const vedic = this.universalData.vedicAstrology as Record<string, unknown> | undefined;
        const dashas = vedic?.dashas as Record<string, unknown> | undefined;
        const currentDasha = dashas?.currentDasha as { startDate?: string; endDate?: string; planet?: string; mahadasha?: string } | undefined;
        const profile = this.universalData.profile as { birthDate?: string; birthTime?: string } | undefined;
        if (currentDasha?.startDate && currentDasha?.endDate && profile?.birthDate) {
          const vedicChart = { currentDasha: { ...currentDasha, startDate: new Date(currentDasha.startDate), endDate: new Date(currentDasha.endDate) }, houses: {}, planets: {} };
          const birthDate = new Date(profile.birthDate);
          const analyzer = new TimingAnalyzer(vedicChart, birthDate);
          const analysis = analyzer.analyzeYear(yearNum);
          const favorabilityOrder: Record<string, number> = { excellent: 3, good: 2, neutral: 1, challenging: 0 };
          const systemsList = sources.length > 0 ? sources.join(', ') : 'Vedic chart and transit analysis';

          if (requestedDate) {
            const monthEntry = analysis.monthlyBreakdown[requestedDate.monthNum - 1] as { favorability: string; description: string; month: string } | undefined;
            if (monthEntry) {
              const reqDateStr = `${requestedDate.year}-${String(requestedDate.monthNum).padStart(2, '0')}-${String(requestedDate.day).padStart(2, '0')}`;
              recommendedDate = reqDateStr;
              const monthName = MONTH_NAMES[requestedDate.monthNum - 1] ?? monthEntry.month;
              const fav = monthEntry.favorability;
              const verdict = fav === 'excellent' || fav === 'good' ? 'favorable' : fav === 'neutral' ? 'acceptable' : 'best avoided';
              const todayForReq = new Date();
              todayForReq.setHours(0, 0, 0, 0);
              const todayReqStr = todayForReq.toISOString().split('T')[0];
              const passedNote = reqDateStr <= todayReqStr ? ' Note: this date has already passed.' : '';
              leadSentence = `**${requestedDate.day} ${monthName} ${requestedDate.year}** falls in ${monthName}; your Vedic chart rates ${monthName} ${requestedDate.year} as **${fav}** for new ventures (${monthEntry.description}). Therefore this date is ${verdict}.${passedNote}`;
              timingDetail = [
                dashaSummaryForDetail ? `Your chart (${dashaSummaryForDetail}) rates ${monthName} ${requestedDate.year} as ${fav}.` : `Chart analysis: ${monthName} ${requestedDate.year} is ${fav}.`,
                sources.length > 0 ? `The systems used for this answer were: ${sources.join(', ')}. The rating is from your Vedic chart.` : 'The rating is from your Vedic chart.',
                monthEntry.description,
                `Confidence is ${confidencePct}% based on ${systemsList}.`
              ].join(' ');
              const isLaunchRelatedReq = eventLabel !== null || /\b(launch|start|release|open|begin)\b/i.test(lowerQuestion);
              const isKetuReq = /Ketu/i.test(dashaSummaryForDetail);
              if (isKetuReq && isLaunchRelatedReq) ketuCaveat = ' Ketu periods favor initiation and soft launch rather than mass visibility; for public launch and scaling, a later window (e.g. April–May) may be stronger.';
            }
          }
          if (!leadSentence) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];
            const sorted = [...analysis.monthlyBreakdown].sort((a: { favorability: string; wealthScore: number }, b: { favorability: string; wealthScore: number }) => {
              const fa = favorabilityOrder[a.favorability] ?? 0;
              const fb = favorabilityOrder[b.favorability] ?? 0;
              if (fb !== fa) return fb - fa;
              return b.wealthScore - a.wealthScore;
            });
            let chosen: { month: string; monthNumber: number; favorability: string; description: string } | undefined;
            let day = 15;
            for (const entry of sorted) {
              const monthNum = (entry as { monthNumber: number }).monthNumber;
              const candidate15 = `${targetYear}-${String(monthNum).padStart(2, '0')}-15`;
              const candidate1 = `${targetYear}-${String(monthNum).padStart(2, '0')}-01`;
              if (candidate15 > todayStr) {
                chosen = entry as { month: string; monthNumber: number; favorability: string; description: string };
                day = 15;
                break;
              }
              if (candidate1 > todayStr) {
                chosen = entry as { month: string; monthNumber: number; favorability: string; description: string };
                day = 1;
                break;
              }
            }
            if (chosen) {
              const isLaunchRelated = eventLabel !== null || /\b(launch|start|release|open|begin)\b/i.test(lowerQuestion);
              const isKetu = /Ketu/i.test(dashaSummaryForDetail);
              if (isLaunchRelated && isKetu) {
                const q2Months = analysis.monthlyBreakdown.filter((m: { monthNumber: number }) => m.monthNumber >= 4 && m.monthNumber <= 6);
                const sortedQ2 = [...q2Months].sort((a: { favorability: string; wealthScore: number }, b: { favorability: string; wealthScore: number }) => {
                  const fa = favorabilityOrder[a.favorability] ?? 0;
                  const fb = favorabilityOrder[b.favorability] ?? 0;
                  if (fb !== fa) return fb - fa;
                  return b.wealthScore - a.wealthScore;
                });
                const todayStr = new Date().toISOString().split('T')[0];
                let q2Chosen: { month: string; monthNumber: number; favorability: string; description: string } | undefined;
                for (const entry of sortedQ2) {
                  const monthNum = (entry as { monthNumber: number }).monthNumber;
                  const candidate21 = `${targetYear}-${String(monthNum).padStart(2, '0')}-21`;
                  const candidate15 = `${targetYear}-${String(monthNum).padStart(2, '0')}-15`;
                  if (candidate21 > todayStr) {
                    q2Chosen = entry as { month: string; monthNumber: number; favorability: string; description: string };
                    break;
                  }
                  if (candidate15 > todayStr) {
                    q2Chosen = entry as { month: string; monthNumber: number; favorability: string; description: string };
                    break;
                  }
                }
                if (q2Chosen) {
                  chosen = q2Chosen;
                  day = 21;
                }
              }
              const monthNum = chosen.monthNumber;
              recommendedDate = `${targetYear}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const monthName = MONTH_NAMES[monthNum - 1] ?? chosen.month;
              leadSentence = `Based on your Vedic chart, ${monthName} ${targetYear} is **${chosen.favorability}** for new ventures (${chosen.description}); we recommend **${day} ${monthName} ${targetYear}** for that reason.`;
              if (isLaunchRelated && isKetu && monthNum >= 4 && monthNum <= 6) {
                leadSentence = `${leadSentence} February ${targetYear} is favorable for initiation or soft launch; this date is recommended for public launch and scaling.`;
              }
              timingDetail = [
                dashaSummaryForDetail ? `This date is based on your Vedic chart: you are in ${dashaSummaryForDetail}.` : 'This date is based on your Vedic chart and transit analysis.',
                sources.length > 0 ? `The systems used for this answer were: ${sources.join(', ')}. The single date is from your Vedic chart.` : 'The single date is from your Vedic chart.',
                `For ${targetYear}, ${monthName} scored highest for new ventures (${chosen.description}).`,
                `Confidence is ${confidencePct}% based on agreement across ${systemsList}.`
              ].join(' ');
              if (isKetu && isLaunchRelated && !(monthNum >= 4 && monthNum <= 6)) ketuCaveat = ' Ketu periods favor initiation and soft launch rather than mass visibility; for public launch and scaling, a later window (e.g. April–May) may be stronger.';
              if (isLaunchRelated && monthNum >= 1 && monthNum <= 3 && analysis.monthlyBreakdown) {
                const q2Months = analysis.monthlyBreakdown.filter((m: { monthNumber: number }) => m.monthNumber >= 4 && m.monthNumber <= 6);
                const sortedQ2 = [...q2Months].sort((a: { favorability: string; wealthScore: number }, b: { favorability: string; wealthScore: number }) => {
                  const fa = favorabilityOrder[a.favorability] ?? 0;
                  const fb = favorabilityOrder[b.favorability] ?? 0;
                  if (fb !== fa) return fb - fa;
                  return b.wealthScore - a.wealthScore;
                });
                const bestQ2 = sortedQ2[0] as { monthNumber: number } | undefined;
                const bestQ2MonthName = bestQ2 ? MONTH_NAMES[bestQ2.monthNumber - 1] : 'April';
                twoPhaseSentence = ` For a two-phase approach: use this date for initiation or soft launch; ${bestQ2MonthName} ${targetYear} is often stronger for public launch and scaling.`;
              }
            } else {
              const best = sorted[0] as { month: string; monthNumber: number; favorability: string; description: string } | undefined;
              if (best) {
                const monthName = MONTH_NAMES[best.monthNumber - 1] ?? best.month;
                leadSentence = `The most favorable months in ${targetYear} (e.g. ${monthName}) have already passed. Based on your Vedic chart, ${monthName} ${targetYear} was **${best.favorability}** for new ventures. Consider asking about ${yearNum + 1} or a specific future date.`;
                timingDetail = [
                  dashaSummaryForDetail ? `Your chart (${dashaSummaryForDetail}) indicated favorable timing in ${targetYear}.` : `Chart analysis: favorable months in ${targetYear} have passed.`,
                  `Confidence is ${confidencePct}% based on agreement across ${systemsList}.`
                ].join(' ');
              }
            }
          }
        }
      } catch {
        // ignore
      }
      if (!leadSentence) {
        const dashaKnow = supportSummaries.length > 0 ? supportSummaries[0] : 'Your current dasha period supports favorable timing in the year.';
        if (requestedDate) {
          recommendedDate = `${requestedDate.year}-${String(requestedDate.monthNum).padStart(2, '0')}-${String(requestedDate.day).padStart(2, '0')}`;
          const monthName = MONTH_NAMES[requestedDate.monthNum - 1] ?? '';
          leadSentence = `We don't have your full Vedic chart, so we cannot rate **${requestedDate.day} ${monthName} ${requestedDate.year}** from your chart. What we know: ${dashaKnow} For a precise rating of this date, use the Vedic timing tool with your birth data.`;
        } else {
          recommendedDate = undefined;
          leadSentence = `We don't have your full Vedic chart (birth date + chart dates), so we cannot calculate a precise best date from your chart. What we know: ${dashaKnow} For a calculated date, use the Vedic timing tool with your birth data. If you have a date in mind (e.g. 5 February 2026), we cannot rate that specific day without your chart—only that ${targetYear} is generally supported by your dasha.`;
        }
        const systemsList = sources.length > 0 ? sources.join(', ') : 'general favorable periods';
        timingDetail = `This response is based on ${systemsList} without full chart data. For a personalized date or to rate a specific day, use the Vedic timing tool with your birth data.`;
      }
    }

    const hasRealDashaTransit = sources.includes('Vedic Dashas') || sources.includes('Planetary Transits');
    const synthesizedAnswer = this.synthesizeTimingResponse(responses, keywords, {
      ...timingContext,
      leadSentence: leadSentence ?? undefined,
      hasRealDashaTransit
    });

    const systemsPhrase = sources.length > 0 ? `agreement across ${sources.join(', ')}` : 'dasha and transit analysis';
    const uncertaintyNote = recommendedDate ? ' This is a probability-based recommendation from your chart, not a certainty.' : '';
    const bandSentence = systemCount > 1 ? ` This probability band combines symbolic features from ${systemCount} systems with reliability weighting.` : '';
    const multiSystemNote = recommendedDate ? '\n\nThe recommended date is from your Vedic chart; Western Astrology, Tarot, Chaldean Numerology, and other systems in Supporting Factors also inform favorable timing for the year when available.' : '';
    const answer = leadSentence
      ? recommendedDate
        ? `${leadSentence}${multiSystemNote}\n\nConfidence band: ${bandLowPct}–${bandHighPct}% based on ${systemsPhrase}.${bandSentence}${uncertaintyNote}${!requestedDate && targetYear ? `\n\nOther dates in ${targetYear} may also work; ask about a specific date if you have one in mind.` : ''}${ketuCaveat}${twoPhaseSentence}`
        : `${leadSentence}${systemCount > 0 ? `\n\nConfidence band: ${bandLowPct}–${bandHighPct}%.` : ''}${bandSentence}${uncertaintyNote}${ketuCaveat}${twoPhaseSentence}`
      : synthesizedAnswer;

    return {
      answer,
      confidence: Math.min(0.95, averageConfidence),
      confidenceBand,
      sources,
      relatedTopics: ['cycles', 'periods', 'windows', 'opportunities'],
      followUpSuggestions: [
        'What are my favorable periods?',
        'When should I take action?',
        'What are my challenging times?',
        'How can I maximize timing?'
      ],
      timingPredictions: this.generateComprehensiveTimingPredictions(),
      recommendedDate,
      timingDetail,
      supportSummaries: supportSummaries.length > 0 ? supportSummaries : undefined
    };
  }

  private async answerSpiritualQuestion(question: string, keywords: string[]): Promise<ComprehensiveSeerResponse> {
    console.log('🧘 Analyzing spirituality using ALL systems...');
    
    const responses = [];
    const sources = [];
    const confidenceEntries: { source: string; confidence: number }[] = [];
    
    // Vedic Astrology Analysis
    if (this.universalData.vedicAstrology?.reading) {
      const vedicSpiritual = this.universalData.vedicAstrology.reading.spirituality;
      if (vedicSpiritual) {
        responses.push(`**Vedic Astrology:** ${vedicSpiritual.overview}`);
        sources.push('Vedic Astrology');
        confidenceEntries.push({ source: 'Vedic Astrology', confidence: 0.9 });
      }
    }
    
    // Kabbalistic Numerology Analysis
    if (this.universalData.kabbalisticNumerology?.reading) {
      const kabbalisticSpiritual = this.universalData.kabbalisticNumerology.reading.spirituality;
      if (kabbalisticSpiritual) {
        responses.push(`**Kabbalistic Numerology:** ${kabbalisticSpiritual.overview}`);
        sources.push('Kabbalistic Numerology');
        confidenceEntries.push({ source: 'Kabbalistic Numerology', confidence: 0.8 });
      }
    }
    
    // Angel Numbers Analysis
    if (this.universalData.angelNumbers?.reading) {
      const angelSpiritual = this.universalData.angelNumbers.reading.spirituality;
      if (angelSpiritual) {
        responses.push(`**Angel Numbers:** ${angelSpiritual.overview}`);
        sources.push('Angel Numbers');
        confidenceEntries.push({ source: 'Angel Numbers', confidence: 0.7 });
      }
    }
    
    const systemCount = confidenceEntries.length;
    const weight = (source: string) => SYSTEM_RELIABILITY_WEIGHTS[source] ?? 1;
    const weightedSum = confidenceEntries.reduce((s, e) => s + e.confidence * weight(e.source), 0);
    const weightSum = confidenceEntries.reduce((s, e) => s + weight(e.source), 0);
    const averageConfidence = weightSum > 0 ? weightedSum / weightSum : 0;
    const confValues = confidenceEntries.map(e => e.confidence);
    const bandLow = confValues.length > 0 ? Math.max(0.1, Math.min(...confValues) - 0.05) : averageConfidence;
    const bandHigh = confValues.length > 0 ? Math.min(0.95, Math.max(...confValues) + 0.05) : averageConfidence;
    const confidenceBand = { low: bandLow, high: bandHigh };
    
    let synthesizedAnswer = this.synthesizeSpiritualResponse(responses, keywords);
    if (systemCount > 1) {
      synthesizedAnswer = `${synthesizedAnswer} This probability band combines symbolic features from ${systemCount} systems with reliability weighting.`;
    }
    
    return {
      answer: synthesizedAnswer,
      confidence: Math.min(0.95, averageConfidence),
      confidenceBand,
      sources,
      relatedTopics: ['enlightenment', 'meditation', 'consciousness', 'chakras'],
      followUpSuggestions: [
        'How can I achieve spiritual growth?',
        'What are my spiritual practices?',
        'What is my consciousness level?',
        'How can I develop my chakras?'
      ],
      spiritualGuidance: this.generateComprehensiveSpiritualGuidance()
    };
  }
  
  private async answerProtectionQuestion(question: string, keywords: string[]): Promise<ComprehensiveSeerResponse> {
    console.log('🛡️ Analyzing protection using ALL systems...');
    
    const responses = [];
    const sources = [];
    const confidenceEntries: { source: string; confidence: number }[] = [];
    
    // Vedic Astrology Analysis
    if (this.universalData.vedicAstrology?.reading) {
      const vedicProtection = this.universalData.vedicAstrology.reading.protection;
      if (vedicProtection) {
        responses.push(`**Vedic Astrology:** ${vedicProtection.overview}`);
        sources.push('Vedic Astrology');
        confidenceEntries.push({ source: 'Vedic Astrology', confidence: 0.9 });
      }
    }
    
    // Runes Analysis
    if (this.universalData.runes?.reading) {
      const runesProtection = this.universalData.runes.reading.protection;
      if (runesProtection) {
        responses.push(`**Runes:** ${runesProtection.overview}`);
        sources.push('Runes');
        confidenceEntries.push({ source: 'Runes', confidence: 0.8 });
      }
    }
    
    const systemCount = confidenceEntries.length;
    const weight = (source: string) => SYSTEM_RELIABILITY_WEIGHTS[source] ?? 1;
    const weightedSum = confidenceEntries.reduce((s, e) => s + e.confidence * weight(e.source), 0);
    const weightSum = confidenceEntries.reduce((s, e) => s + weight(e.source), 0);
    const averageConfidence = weightSum > 0 ? weightedSum / weightSum : 0;
    const confValues = confidenceEntries.map(e => e.confidence);
    const bandLow = confValues.length > 0 ? Math.max(0.1, Math.min(...confValues) - 0.05) : averageConfidence;
    const bandHigh = confValues.length > 0 ? Math.min(0.95, Math.max(...confValues) + 0.05) : averageConfidence;
    const confidenceBand = { low: bandLow, high: bandHigh };
    
    let synthesizedAnswer = this.synthesizeProtectionResponse(responses, keywords);
    if (systemCount > 1) {
      synthesizedAnswer = `${synthesizedAnswer} This probability band combines symbolic features from ${systemCount} systems with reliability weighting.`;
    }
    
    return {
      answer: synthesizedAnswer,
      confidence: Math.min(0.95, averageConfidence),
      confidenceBand,
      sources,
      relatedTopics: ['energy', 'cleansing', 'mantras', 'rituals'],
      followUpSuggestions: [
        'How can I protect myself from negative energy?',
        'What cleansing rituals should I do?',
        'What protection mantras work for me?',
        'How can I strengthen my aura?'
      ],
      protectionGuidance: this.generateComprehensiveProtectionGuidance()
    };
  }
  
  private async answerPastLifeQuestion(question: string, keywords: string[]): Promise<ComprehensiveSeerResponse> {
    console.log('🔄 Analyzing past life using ALL systems...');
    
    const responses = [];
    const sources = [];
    let totalConfidence = 0;
    let systemCount = 0;
    
    // Vedic Astrology Analysis
    if (this.universalData.vedicAstrology?.reading) {
      const vedicKarma = this.universalData.vedicAstrology.reading.karma;
      if (vedicKarma) {
        responses.push(`**Vedic Astrology:** ${vedicKarma.overview}`);
        sources.push('Vedic Astrology');
        totalConfidence += 0.9;
        systemCount++;
      }
    }
    
    // Synthesize the response
    const synthesizedAnswer = this.synthesizePastLifeResponse(responses, keywords);
    const averageConfidence = systemCount > 0 ? totalConfidence / systemCount : 0;
    
    return {
      answer: synthesizedAnswer,
      confidence: Math.min(0.95, averageConfidence),
      sources,
      relatedTopics: ['karma', 'soul lessons', 'reincarnation', 'dharma'],
      followUpSuggestions: [
        'What are my karmic lessons?',
        'How does my past life affect me now?',
        'What should I focus on in this lifetime?',
        'How can I resolve my karma?'
      ],
      spiritualGuidance: this.generateKarmicGuidance()
    };
  }

  private async answerRemedyQuestion(question: string, _keywords: string[]): Promise<ComprehensiveSeerResponse> {
    console.log('💎 Answering gemstone/remedy question...');
    const reading = this.universalData.vedicAstrology?.reading as { remedies?: Array<{ name?: string } | string>; gemstones?: string[] } | undefined;
    const gemstoneNames: string[] = [];
    if (reading?.gemstones && Array.isArray(reading.gemstones)) {
      reading.gemstones.forEach((g: string) => { if (typeof g === 'string' && g.trim()) gemstoneNames.push(g.trim()); });
    }
    if (gemstoneNames.length === 0 && reading?.remedies && Array.isArray(reading.remedies)) {
      reading.remedies.forEach((r: { name?: string } | string) => {
        const name = typeof r === 'string' ? r : r?.name;
        if (typeof name === 'string' && name.trim()) gemstoneNames.push(name.trim());
      });
    }
    const navaratnaReferral = 'For exact ratti (carat) and metal, use the Navaratna tool (Tools > Navaratna Planetary Stones).';
    let answer: string;
    if (gemstoneNames.length > 0) {
      answer = `Based on your Vedic chart, recommended gemstones include: ${gemstoneNames.join(', ')}. ${navaratnaReferral}`;
    } else {
      answer = `For a personalized gemstone, ratti, and metal recommendation based on your chart, use the Navaratna tool (Tools > Navaratna Planetary Stones).`;
    }
    return {
      answer,
      confidence: 0.75,
      sources: gemstoneNames.length > 0 ? ['Vedic Astrology'] : ['Vedic Astrology'],
      relatedTopics: ['gemstones', 'navaratna', 'remedies', 'ratti', 'metals'],
      followUpSuggestions: [
        'What are my favorable periods?',
        'Which remedies suit my chart?',
        'How do I activate gemstones?'
      ],
      remedyAnswer: true
    };
  }
  
  private async answerGeneralQuestion(question: string, keywords: string[]): Promise<ComprehensiveSeerResponse> {
    console.log('🔮 Analyzing general question using ALL systems...');
    
    const responses = [];
    const sources = [];
    let totalConfidence = 0;
    let systemCount = 0;
    
    // Use the most relevant systems for general questions
    const relevantSystems = [
      'vedicAstrology',
      'westernAstrology',
      'numerology',
      'tarot',
      'iching'
    ];
    
    for (const system of relevantSystems) {
      const systemData = this.universalData[system as keyof UniversalDivinationData];
      if (systemData && (systemData as any).reading) {
        const reading = (systemData as any).reading;
        if (reading.general) {
          responses.push(`**${system}:** ${reading.general.overview}`);
          sources.push(system);
          totalConfidence += 0.7;
          systemCount++;
        }
      }
    }
    
    // Synthesize the response
    const synthesizedAnswer = this.synthesizeGeneralResponse(responses, keywords);
    const averageConfidence = systemCount > 0 ? totalConfidence / systemCount : 0;
    
    return {
      answer: synthesizedAnswer,
      confidence: Math.min(0.95, averageConfidence),
      sources,
      relatedTopics: ['guidance', 'insights', 'patterns', 'trends'],
      followUpSuggestions: [
        'What should I focus on?',
        'What are the key themes in my life?',
        'How can I improve my situation?',
        'What opportunities are coming?'
      ]
    };
  }
  
  // Synthesis methods for different question types
  private synthesizePurposeResponse(responses: string[], keywords: string[]): string {
    if (responses.length === 0) {
      return "I need more information to provide accurate guidance about your life purpose. Please ensure your profile is complete.";
    }
    
    const baseResponse = responses.join('\n\n');
    return `Based on comprehensive analysis across ${responses.length} divination systems, here's what I see about your life purpose:\n\n${baseResponse}\n\n**Synthesis:** Your purpose appears to be multifaceted, combining elements from multiple mystical traditions. The consensus suggests a path of service, wisdom, and spiritual growth.`;
  }
  
  private synthesizeMarriageResponse(responses: string[], keywords: string[]): string {
    if (responses.length === 0) {
      return "I need more information to provide accurate guidance about your marriage prospects. Please ensure your profile is complete.";
    }
    
    const baseResponse = responses.join('\n\n');
    return `Based on comprehensive analysis across ${responses.length} divination systems, here's what I see about your marriage:\n\n${baseResponse}\n\n**Synthesis:** The systems show strong compatibility indicators and suggest favorable timing for partnership.`;
  }
  
  private synthesizeCareerResponse(responses: string[], keywords: string[]): string {
    if (responses.length === 0) {
      return "I need more information to provide accurate guidance about your career. Please ensure your profile is complete.";
    }
    
    const baseResponse = responses.join('\n\n');
    return `Based on comprehensive analysis across ${responses.length} divination systems, here's what I see about your career:\n\n${baseResponse}\n\n**Synthesis:** The systems indicate strong potential for success in service-oriented or wisdom-sharing professions.`;
  }
  
  private synthesizeHealthResponse(responses: string[], keywords: string[]): string {
    if (responses.length === 0) {
      return "I need more information to provide accurate guidance about your health. Please ensure your profile is complete.";
    }
    
    const baseResponse = responses.join('\n\n');
    return `Based on comprehensive analysis across ${responses.length} divination systems, here's what I see about your health:\n\n${baseResponse}\n\n**Synthesis:** The systems suggest focusing on preventive care and maintaining emotional balance.`;
  }
  
  private synthesizeWealthResponse(responses: string[], keywords: string[]): string {
    if (responses.length === 0) {
      return "I need more information to provide accurate guidance about your wealth prospects. Please ensure your profile is complete.";
    }
    
    const baseResponse = responses.join('\n\n');
    return `Based on comprehensive analysis across ${responses.length} divination systems, here's what I see about your wealth:\n\n${baseResponse}\n\n**Synthesis:** The systems indicate potential for prosperity through service and wisdom-sharing.`;
  }
  
  private synthesizeTimingResponse(
    responses: string[],
    keywords: string[],
    context?: {
      targetYear?: string | null;
      eventLabel?: string | null;
      leadSentence?: string;
      hasRealDashaTransit?: boolean;
    }
  ): string {
    const filtered = (responses || []).filter(
      (r) => typeof r === 'string' && r.trim() !== '' && r !== 'undefined' && !r.includes('undefined')
    );
    const { targetYear, eventLabel, leadSentence, hasRealDashaTransit } = context || {};

    if (leadSentence) {
      const shortAnswer = leadSentence;
      if (filtered.length === 0) {
        const synthesis = hasRealDashaTransit
          ? `**Synthesis:** Consider the dasha and transit windows above when choosing a month or date.`
          : `**Synthesis:** This suggestion is based on favorable planetary periods; for a personalized date, use the Vedic timing tool with your birth data.`;
        return `${shortAnswer}\n\n${synthesis}`;
      }
      let baseResponse = filtered.join('\n\n');
      baseResponse = baseResponse.replace(/undefined/g, 'favorable periods');
      const synthesis = hasRealDashaTransit
        ? `**Synthesis:** For ${targetYear || 'your target year'}, the systems show favorable periods. Consider the dasha and transit windows above when choosing a month or date.`
        : `**Synthesis:** This suggestion is based on favorable planetary periods; for a personalized date, use the Vedic timing tool with your birth data.`;
      const result = `${shortAnswer}\n\n${baseResponse}\n\n${synthesis}`;
      return result.includes('undefined') ? result.replace(/undefined/g, 'favorable periods') : result;
    }

    if (filtered.length === 0) {
      return "I need more information to provide accurate timing guidance. Please ensure your profile is complete.";
    }

    let baseResponse = filtered.join('\n\n');
    baseResponse = baseResponse.replace(/undefined/g, 'favorable periods');

    let intro: string;
    if (targetYear) {
      const eventPhrase = eventLabel
        ? ` for your ${eventLabel} (e.g. app launch, product release)`
        : '';
      intro = `For **${targetYear}**${eventPhrase}, based on comprehensive analysis across ${filtered.length} divination systems, here's what I see about timing:\n\n`;
    } else {
      intro = `Based on comprehensive analysis across ${filtered.length} divination systems, here's what I see about timing:\n\n`;
    }

    const synthesis = hasRealDashaTransit
      ? (targetYear
          ? `**Synthesis:** For ${targetYear}, the systems show favorable periods and specific windows of opportunity. Consider the dasha and transit windows above when choosing a month or date.`
          : `**Synthesis:** The systems show favorable periods ahead with specific windows of opportunity. Consider the dasha and transit windows above when choosing a month or date.`)
      : `**Synthesis:** This suggestion is based on favorable planetary periods; for a personalized date, use the Vedic timing tool with your birth data.`;

    const result = `${intro}${baseResponse}\n\n${synthesis}`;
    return result.includes('undefined') ? result.replace(/undefined/g, 'favorable periods') : result;
  }
  
  private synthesizeSpiritualResponse(responses: string[], keywords: string[]): string {
    if (responses.length === 0) {
      return "I need more information to provide accurate spiritual guidance. Please ensure your profile is complete.";
    }
    
    const baseResponse = responses.join('\n\n');
    return `Based on comprehensive analysis across ${responses.length} divination systems, here's what I see about your spiritual path:\n\n${baseResponse}\n\n**Synthesis:** The systems indicate a strong spiritual calling with potential for deep wisdom and service.`;
  }
  
  private synthesizeProtectionResponse(responses: string[], keywords: string[]): string {
    if (responses.length === 0) {
      return "I need more information to provide accurate protection guidance. Please ensure your profile is complete.";
    }
    
    const baseResponse = responses.join('\n\n');
    return `Based on comprehensive analysis across ${responses.length} divination systems, here's what I see about protection:\n\n${baseResponse}\n\n**Synthesis:** The systems suggest focusing on spiritual practices and energy cleansing for protection.`;
  }
  
  private synthesizePastLifeResponse(responses: string[], keywords: string[]): string {
    if (responses.length === 0) {
      return "I need more information to provide accurate past life guidance. Please ensure your profile is complete.";
    }
    
    const baseResponse = responses.join('\n\n');
    return `Based on comprehensive analysis across ${responses.length} divination systems, here's what I see about your past life karma:\n\n${baseResponse}\n\n**Synthesis:** The systems indicate lessons around service, wisdom, and spiritual growth carried forward from previous lifetimes.`;
  }
  
  private synthesizeGeneralResponse(responses: string[], keywords: string[]): string {
    if (responses.length === 0) {
      return "I need more information to provide accurate guidance. Please ensure your profile is complete.";
    }
    
    const baseResponse = responses.join('\n\n');
    return `Based on comprehensive analysis across ${responses.length} divination systems, here's what I see:\n\n${baseResponse}\n\n**Synthesis:** The systems show consistent themes of growth, service, and spiritual development.`;
  }
  
  // Cross-system validation methods
  private validateAcrossSystems(question: string, questionType: string): CrossSystemValidation {
    const highAgreement: string[] = [];
    const mediumAgreement: string[] = [];
    const lowAgreement: string[] = [];
    const conflicts: string[] = [];
    
    // This would analyze responses across systems for agreement/disagreement
    // For now, return a basic structure
    return {
      highAgreement,
      mediumAgreement,
      lowAgreement,
      conflicts,
      overallConfidence: this.universalData.confidenceScore
    };
  }
  
  private findSystemAgreements(question: string, questionType: string): SystemAgreement[] {
    // This would find areas where multiple systems agree
    return [];
  }
  
  private generateTimingPredictions(question: string, questionType: string): TimingPrediction[] {
    // This would generate timing predictions based on multiple systems
    return [];
  }
  
  // Helper methods for generating specific insights
  private async getPurposeCelebrityMatches(): Promise<CelebrityMatch[]> {
    return [];
  }
  
  private async getMarriageCelebrityMatches(): Promise<CelebrityMatch[]> {
    return [];
  }
  
  private async getCareerCelebrityMatches(): Promise<CelebrityMatch[]> {
    return [];
  }
  
  private generatePurposeDailyInsight(): DailyInsight {
    return {
      quote: "Your purpose unfolds through service and wisdom.",
      dos: ["Meditate daily", "Help others", "Study spiritual texts"],
      donts: ["Ignore your intuition", "Focus only on material gains"],
      luckyColor: "Gold",
      luckyNumber: 7,
      auspiciousTimes: ["Sunrise", "Evening"],
      inauspiciousTimes: ["Midnight"],
      planetaryInfluence: "Jupiter",
      nakshatraEnergy: "Wisdom"
    };
  }
  
  private generatePurposeSpiritualGuidance(): SpiritualGuidance {
    return {
      chakraStatus: ["Heart chakra active", "Crown chakra developing"],
      meditationAdvice: ["Practice daily meditation", "Focus on service"],
      consciousnessLevel: "Expanding",
      spiritualPractices: ["Meditation", "Service", "Study"],
      karmicLessons: ["Patience", "Service", "Wisdom"]
    };
  }
  
  private generateMarriageTimingPredictions(): TimingPrediction[] {
    return [];
  }
  
  private generateCareerTimingPredictions(): TimingPrediction[] {
    return [];
  }
  
  private generateWealthTimingPredictions(): TimingPrediction[] {
    return [];
  }
  
  private generateComprehensiveTimingPredictions(): TimingPrediction[] {
    return [];
  }
  
  private generateComprehensiveSpiritualGuidance(): SpiritualGuidance {
    return {
      chakraStatus: ["All chakras balanced"],
      meditationAdvice: ["Daily practice recommended"],
      consciousnessLevel: "High",
      spiritualPractices: ["Meditation", "Prayer", "Service"],
      karmicLessons: ["Wisdom", "Compassion", "Service"]
    };
  }
  
  private generateHealthProtectionGuidance(): ProtectionGuidance {
    return {
      doshaDetection: ["Balanced constitution"],
      protectionMantras: ["Om Namah Shivaya"],
      cleansingRituals: ["Daily meditation", "Regular exercise"],
      talismans: ["Crystal protection"],
      warningSigns: ["Stress indicators"]
    };
  }
  
  private generateComprehensiveProtectionGuidance(): ProtectionGuidance {
    return {
      doshaDetection: ["Vata-Pitta balanced"],
      protectionMantras: ["Gayatri Mantra", "Om Namah Shivaya"],
      cleansingRituals: ["Salt baths", "Sage smudging"],
      talismans: ["Black tourmaline", "Amethyst"],
      warningSigns: ["Energy drains", "Negative thoughts"]
    };
  }
  
  private generateKarmicGuidance(): SpiritualGuidance {
    return {
      chakraStatus: ["Root chakra healing"],
      meditationAdvice: ["Focus on forgiveness", "Practice gratitude"],
      consciousnessLevel: "Evolving",
      spiritualPractices: ["Karma yoga", "Meditation"],
      karmicLessons: ["Forgiveness", "Compassion", "Service"]
    };
  }

  // Universal Data Extractor - NEW METHOD
  private extractAllAvailableData(): string {
    const dataPoints: string[] = [];
    
    // Extract from Vedic Astrology
    if (this.universalData.vedicAstrology?.reading) {
      const reading = this.universalData.vedicAstrology.reading;
      
      if (reading.personality) {
        dataPoints.push(`**Personality:** ${reading.personality.overview}`);
      }
      if (reading.career) {
        dataPoints.push(`**Career & Wealth:** ${reading.career.overview} Success timing: ${reading.career.timing}. Suitable professions: ${reading.career.suitableProfessions?.join(', ')}`);
      }
      if (reading.lifePurpose || reading.karma) {
        const purpose = reading.lifePurpose || reading.karma;
        dataPoints.push(`**Life Purpose & Karma:** ${purpose.overview || purpose.dharma}. Karmic lessons: ${purpose.karmicLessons?.join(', ')}`);
      }
      if (reading.relationships) {
        dataPoints.push(`**Relationships:** ${reading.relationships.overview}. Marriage timing: ${reading.relationships.marriageTiming}`);
      }
      if (reading.health) {
        dataPoints.push(`**Health:** ${reading.health.overview}. Constitution: ${reading.health.constitution}`);
      }
      if (reading.spirituality) {
        dataPoints.push(`**Spirituality:** ${reading.spirituality.overview}. Practices: ${reading.spirituality.practices?.join(', ')}`);
      }
      if (reading.dasha) {
        dataPoints.push(`**Current Period (Dasha):** ${reading.dasha.overview}. Current: ${reading.dasha.current}`);
      }
      if (reading.remedies) {
        // Safety check: ensure remedies is an array before calling .map()
        const remedyNames = Array.isArray(reading.remedies) 
          ? reading.remedies.map((r: any) => r.name).join(', ')
          : 'Available';
        dataPoints.push(`**Remedies:** ${remedyNames}`);
      }
    }
    
    // Extract from chart data
    if (this.universalData.vedicAstrology?.planets) {
      dataPoints.push(`**Planetary Positions:** Available for detailed analysis`);
    }
    
    // Extract from other systems (Western, Numerology, etc.) when available
    if (this.universalData.westernAstrology?.reading) {
      dataPoints.push(`**Western Astrology:** Available`);
    }
    if (this.universalData.numerology?.reading) {
      dataPoints.push(`**Numerology:** Available`);
    }
    
    return dataPoints.join('\n\n');
  }

  // Universal Question Handler - NEW METHOD
  private async answerUniversalQuestion(question: string, keywords: string[]): Promise<ComprehensiveSeerResponse> {
    console.log('🌟 Answering universal question using ALL available data...');
    
    // Functional sorting: when subtype is directional, life_theme, or immediate, use only primary/secondary systems
    if (this._currentMatrixEntry) {
      const responses: string[] = [];
      const sources: string[] = [];
      const preferred = [...this._currentMatrixEntry.primary, ...this._currentMatrixEntry.secondary];
      for (const sourceName of preferred) {
        if (!this.isSourcePreferredForSubtype(sourceName)) continue;
        const overview = this.getUniversalOverviewForSource(sourceName);
        if (overview) {
          responses.push(`**${sourceName}:** ${overview}`);
          sources.push(sourceName);
        }
      }
      if (responses.length > 0) {
        const synthesized = this.synthesizeGeneralResponse(responses, keywords);
        return {
          answer: synthesized,
          confidence: 0.75,
          sources,
          relatedTopics: this.extractRelevantTopics(question),
          followUpSuggestions: this.generateFollowUpQuestions(question)
        };
      }
    }
    
    const allData = this.extractAllAvailableData();
    
    if (!allData || allData.length === 0) {
      return {
        answer: "I need more information to provide accurate guidance. Please ensure your profile is complete.",
        confidence: 0,
        sources: [],
        relatedTopics: [],
        followUpSuggestions: []
      };
    }
    
    // Build contextual response based on available data
    const universalResponse = `Based on your comprehensive mystical profile, here's guidance for your question: "${question}"

${allData}

**Mystical Insight:**
${this.generateContextualInsight(question, allData)}

**Auspicious Timing:**
Based on your current dasha period and planetary positions, favorable times for important activities are during your spiritual practice hours (early morning and evening). For daily decisions like grooming, consider auspicious nakshatras and tithis.

**Recommendations:**
${this.generateContextualRecommendations(question)}`;

    return {
      answer: universalResponse,
      confidence: 0.75,
      sources: ['Vedic Astrology', 'Panchanga', 'Spiritual Guidance'],
      relatedTopics: this.extractRelevantTopics(question),
      followUpSuggestions: this.generateFollowUpQuestions(question)
    };
  }

  /** Get a short overview string for a source name from universalData (for universal question primary/secondary). */
  private getUniversalOverviewForSource(sourceName: string): string | null {
    const r = (x: unknown): string | null => (x && typeof x === 'object' && 'overview' in x && typeof (x as { overview?: string }).overview === 'string') ? (x as { overview: string }).overview : null;
    switch (sourceName) {
      case 'I Ching':
        return r(this.universalData.iching?.reading) ?? r((this.universalData.iching as { reading?: { general?: { overview?: string } } })?.reading?.general) ?? null;
      case 'Tarot':
        return r(this.universalData.tarot?.reading) ?? r((this.universalData.tarot as { reading?: { general?: { overview?: string } } })?.reading?.general) ?? null;
      case 'Western Astrology':
        return r(this.universalData.westernAstrology?.reading) ?? r((this.universalData.westernAstrology as { reading?: { lifePurpose?: { overview?: string } } })?.reading?.lifePurpose) ?? null;
      case 'Kabbalistic Numerology':
        return r((this.universalData as { kabbalisticNumerology?: { reading?: { overview?: string } } }).kabbalisticNumerology?.reading) ?? r(this.universalData.chaldeanNumerology?.reading) ?? null;
      case 'Horary': {
        const horary = (this.universalData as { horaryAstrology?: { reading?: { answer?: string; overview?: string } } }).horaryAstrology?.reading;
        if (horary && (typeof horary.answer === 'string' || typeof horary.overview === 'string'))
          return (horary.overview ?? horary.answer ?? '').trim() || null;
        return null;
      }
      case 'Geomancy':
        return r((this.universalData as { geomancy?: { reading?: { overview?: string } } }).geomancy?.reading) ?? null;
      case 'KP Astrology':
        return r((this.universalData as { kpAstrology?: { reading?: { overview?: string; timing?: string } } }).kpAstrology?.reading) ?? null;
      default:
        return null;
    }
  }

  // Contextual Insight Generator - NEW METHOD
  private generateContextualInsight(question: string, profileData: string): string {
    const lowerQuestion = question.toLowerCase();
    if (/\b(gemstone|gem\b|navaratna|ratti|carats?|which stone|recommend a stone|stone to wear|metal\b|ring\b|wear a stone)\b/i.test(lowerQuestion)) {
      const reading = this.universalData.vedicAstrology?.reading as { remedies?: Array<{ name?: string } | string>; gemstones?: string[] } | undefined;
      const names: string[] = [];
      if (reading?.gemstones && Array.isArray(reading.gemstones)) reading.gemstones.forEach((g: string) => { if (typeof g === 'string' && g.trim()) names.push(g.trim()); });
      if (names.length === 0 && reading?.remedies && Array.isArray(reading.remedies)) reading.remedies.forEach((r: { name?: string } | string) => { const n = typeof r === 'string' ? r : r?.name; if (typeof n === 'string' && n.trim()) names.push(n.trim()); });
      if (names.length > 0) return `Based on your Vedic chart, recommended gemstones include: ${names.join(', ')}. For exact ratti (carat) and metal, use the Navaratna tool in Tools.`;
      return 'For a personalized gemstone, ratti, and metal recommendation based on your chart, use the Navaratna tool (Tools > Navaratna Planetary Stones).';
    }
    if (lowerQuestion.includes('hair') || lowerQuestion.includes('nail')) {
      return "For grooming activities, Vedic tradition suggests avoiding inauspicious days. Based on your chart, Thursdays and Fridays during waxing moon are generally favorable for you.";
    }
    if (lowerQuestion.includes('business') || lowerQuestion.includes('start')) {
      return "Your chart shows strong potential for service-oriented businesses. The best timing aligns with your dasha periods of growth and expansion.";
    }
    if (lowerQuestion.includes('travel') || lowerQuestion.includes('move')) {
      return "Travel and relocation should be considered during favorable planetary transits. Your current period supports spiritual journeys and purposeful moves.";
    }
    if (lowerQuestion.includes('wealth') || lowerQuestion.includes('money') || lowerQuestion.includes('financial')) {
      return "Your career path indicates wealth through service and wisdom-sharing. Success timing is around ages 28, 35, and 42. Financial success will come through staying true to your purpose.";
    }
    if (lowerQuestion.includes('color') || lowerQuestion.includes('wear')) {
      return "Based on your planetary influences, colors that enhance your energy include gold, yellow, and white. These colors align with your Jupiter-ruled nature and spiritual path.";
    }
    if (lowerQuestion.includes('food') || lowerQuestion.includes('eat') || lowerQuestion.includes('diet')) {
      return "Your Pitta-Kapha constitution suggests a balanced diet with cooling foods. Avoid excessive spicy foods and focus on fresh, natural ingredients.";
    }
    
    return "Your mystical profile suggests approaching this decision with both practical wisdom and spiritual awareness, aligning actions with your dharma.";
  }

  // Contextual Recommendations Generator - NEW METHOD
  private generateContextualRecommendations(question: string): string {
    return `- Consult your daily panchanga for auspicious timings
- Practice your recommended remedies before important decisions
- Align choices with your life purpose and karmic lessons
- Trust your natural intuition (a key strength in your chart)`;
  }

  // Extract Relevant Topics - NEW METHOD
  private extractRelevantTopics(question: string): string[] {
    const lowerQuestion = question.toLowerCase();
    const topics: string[] = [];
    
    if (lowerQuestion.includes('hair') || lowerQuestion.includes('nail')) {
      topics.push('grooming', 'auspicious timing', 'panchanga');
    }
    if (lowerQuestion.includes('business') || lowerQuestion.includes('start')) {
      topics.push('business', 'career', 'timing', 'dharma');
    }
    if (lowerQuestion.includes('travel') || lowerQuestion.includes('move')) {
      topics.push('travel', 'relocation', 'transits');
    }
    if (lowerQuestion.includes('wealth') || lowerQuestion.includes('money')) {
      topics.push('prosperity', 'career', 'dharma', 'timing');
    }
    if (lowerQuestion.includes('color') || lowerQuestion.includes('wear')) {
      topics.push('colors', 'planetary influences', 'energy');
    }
    if (lowerQuestion.includes('food') || lowerQuestion.includes('eat')) {
      topics.push('diet', 'constitution', 'health');
    }
    
    return topics.length > 0 ? topics : ['guidance', 'mystical insights', 'spiritual wisdom'];
  }

  // Generate Follow-up Questions - NEW METHOD
  private generateFollowUpQuestions(question: string): string[] {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('hair') || lowerQuestion.includes('nail')) {
      return [
        'What other grooming activities should I time carefully?',
        'What are the best days for important decisions?',
        'How can I use panchanga for daily planning?'
      ];
    }
    if (lowerQuestion.includes('business') || lowerQuestion.includes('start')) {
      return [
        'What business opportunities align with my dharma?',
        'When is the best time to start a new venture?',
        'What remedies can enhance my prosperity?'
      ];
    }
    if (lowerQuestion.includes('wealth') || lowerQuestion.includes('money')) {
      return [
        'How can I balance wealth and spirituality?',
        'What investments suit my chart?',
        'When will I achieve financial success?'
      ];
    }
    
    return [
      'What should I focus on next?',
      'How can I align with my purpose?',
      'What opportunities are coming?'
    ];
  }

  /**
   * Aggregates expert responses from tool-specific seer APIs.
   * When decomposedQuery is provided, only tools in domains_required (with data) are called.
   */
  private async aggregateToolExpertResponses(question: string, decomposedQuery?: DecomposedQuery | null): Promise<{
    expertResponses: Array<{
      tool: string;
      toolName: string;
      answer: string;
      confidence: number;
      sources: string[];
    }>;
    expertConsensus: {
      highAgreement: string[];
      mediumAgreement: string[];
      lowAgreement: string[];
      conflicts: string[];
      overallConfidence: number;
    };
    primaryExpert: string | null;
  }> {
    if (!this.userId || !this.comprehensiveProfile) {
      return {
        expertResponses: [],
        expertConsensus: {
          highAgreement: [],
          mediumAgreement: [],
          lowAgreement: [],
          conflicts: [],
          overallConfidence: 0
        },
        primaryExpert: null
      };
    }

    const aggregation = await this.seerAggregator.aggregateExpertResponses(
      question,
      this.userId,
      this.universalData.profile,
      this.comprehensiveProfile,
      decomposedQuery
    );

    return {
      expertResponses: aggregation.expertResponses.map(r => ({
        tool: r.tool,
        toolName: r.toolName,
        answer: r.answer,
        confidence: r.confidence,
        sources: r.sources
      })),
      expertConsensus: aggregation.expertConsensus,
      primaryExpert: aggregation.primaryExpert
    };
  }

  /**
   * Synthesis WITHOUT COLLAPSE: reframe by system and role; never choose a winner, never "ignore X".
   * Uses conflict type to select framing template. Pattern: "System A addresses X. System B addresses Y. Together, this suggests…"
   */
  private synthesizeWithExpertResponses(
    dataResponse: ComprehensiveSeerResponse,
    expertAggregation: {
      expertResponses: Array<{
        tool: string;
        toolName: string;
        answer: string;
        confidence: number;
        sources: string[];
      }>;
      expertConsensus: {
        highAgreement: string[];
        mediumAgreement: string[];
        lowAgreement: string[];
        conflicts: string[];
        overallConfidence: number;
      };
      primaryExpert: string | null;
    },
    conflictType: ConflictType
  ): ComprehensiveSeerResponse {
    if (expertAggregation.expertResponses.length === 0) return dataResponse;

    const validExperts = expertAggregation.expertResponses
      .filter(r => r.answer && r.answer.length > 0 && r.answer.length < 2000)
      .slice(0, 5);

    // Build reframed synthesis: each system by role, then "Together…"
    const parts: string[] = [];
    for (const r of validExperts) {
      const snippet = r.answer.length > 400 ? r.answer.slice(0, 400).trim() + '…' : r.answer.trim();
      parts.push(`${r.toolName} addresses this from its domain: ${snippet}`);
    }
    const conflictPreamble = this.getConflictPreamble(conflictType, validExperts);
    const togetherPhrase = 'Together, this suggests a layered view: no single system overrides another—contradiction only exists when context is missing; the Seer restores context.';
    const enhancedAnswer = [
      dataResponse.answer?.trim(),
      conflictPreamble,
      ...parts,
      togetherPhrase
    ].filter(Boolean).join(' ');

    const dataWeight = 0.6;
    const expertWeight = 0.4;
    const enhancedConfidence = Math.min(0.95,
      (dataResponse.confidence * dataWeight) + (expertAggregation.expertConsensus.overallConfidence * expertWeight)
    );
    const allSources = [
      ...dataResponse.sources,
      ...expertAggregation.expertResponses.flatMap(r => r.sources)
    ];
    const uniqueSources = [...new Set(allSources)];

    return {
      ...dataResponse,
      answer: enhancedAnswer.trim(),
      confidence: enhancedConfidence,
      sources: uniqueSources,
      expertResponses: expertAggregation.expertResponses,
      expertConsensus: expertAggregation.expertConsensus,
      primaryExpert: expertAggregation.primaryExpert
    };
  }

  /** Returns a short framing line based on conflict type (for synthesis-without-collapse). */
  private getConflictPreamble(
    conflictType: ConflictType,
    _experts: Array<{ tool: string; toolName: string; answer: string }>
  ): string {
    switch (conflictType) {
      case 'B_time_vs_expression':
        return 'One system speaks to timing (when), another to expression or identity (how/who)—use each for its strength.';
      case 'C_structural_vs_situational':
        return 'One view is structural or mechanical, another situational or event-based—both add context.';
      case 'D_symbolic_vs_literal':
        return 'One system is symbolic and process-oriented, another more literal or outcome-oriented—they complement each other.';
      case 'A_domain_mismatch':
        return 'Different systems address different layers of the question.';
      default:
        return '';
    }
  }
}
