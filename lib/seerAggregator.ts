// Seer Aggregator - Calls tool-specific seer APIs and aggregates their expert responses
// Makes Ask the Seer a true universal expert by leveraging all specialized seers

import { devLog } from './devLogger';
import type { DecomposedQuery } from './universalSeerDecomposition';

export interface ToolSeerResponse {
  tool: string;
  toolName: string;
  answer: string;
  confidence: number;
  sources: string[];
  error?: string;
  timing?: {
    favorable: string[];
    challenging: string[];
  };
  remedies?: string[];
  followUpQuestions?: string[];
}

export interface ExpertConsensus {
  highAgreement: string[];
  mediumAgreement: string[];
  lowAgreement: string[];
  conflicts: string[];
  overallConfidence: number;
}

/** Profile key (or display name) -> tool key for jurisdiction/availability. */
const PROFILE_KEY_TO_TOOL: Record<string, string> = {
  vedic: 'vedic', 'Vedic Astrology': 'vedic',
  western: 'western', 'Western Astrology': 'western',
  tarot: 'tarot', 'Tarot': 'tarot',
  numerology: 'numerology', 'Numerology': 'numerology',
  kabbalisticNumerology: 'kabbalistic', 'Kabbalistic Numerology': 'kabbalistic',
  nameAnalysis: 'nameAnalysis', 'Name Analysis': 'nameAnalysis',
  lenormand: 'lenormand', 'Lenormand': 'lenormand', 'Lenormand Divination': 'lenormand',
  iching: 'iching', 'I Ching': 'iching',
  geomancy: 'geomancy', 'Geomancy': 'geomancy',
  financialAstrology: 'financial', 'Financial Astrology': 'financial',
  medicalAstrology: 'medical', 'Medical Astrology': 'medical',
  navaratna: 'navaratna', navaratnaPlanetaryStones: 'navaratna', 'Navaratna': 'navaratna',
  dreamSymbols: 'dreamSymbols', 'Dream Symbols': 'dreamSymbols',
  faceReading: 'faceReading', 'Face Reading': 'faceReading',
  fengShui: 'fengShui', 'Feng Shui': 'fengShui',
  vastu: 'vastu', 'Vastu': 'vastu',
  humanDesign: 'humanDesign', 'Human Design': 'humanDesign',
  ogham: 'ogham', 'Ogham': 'ogham',
  bibliomancy: 'bibliomancy', 'Bibliomancy': 'bibliomancy',
  trichakraMethod: 'trichakra', trichakra: 'trichakra', 'Trichakra': 'trichakra',
  sortilege: 'sortilege', 'Sortilege': 'sortilege',
  pendulum: 'pendulum', 'Pendulum Divination': 'pendulum',
};

const SKIP_PROFILE_KEYS = new Set(['userId', 'lastUpdated', 'userProfile', 'generatedAt', 'dataQuality', 'source', 'cacheExpiry', 'interpretations']);

export class SeerAggregator {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  /** Returns tool keys (vedic, western, ...) that have data in comprehensiveProfile. */
  private getAvailableToolKeys(comprehensiveProfile: any): string[] {
    if (!comprehensiveProfile || typeof comprehensiveProfile !== 'object') return [];
    const keys = Object.keys(comprehensiveProfile).filter(k => !SKIP_PROFILE_KEYS.has(k));
    const toolKeys = new Set<string>();
    for (const k of keys) {
      const tool = PROFILE_KEY_TO_TOOL[k];
      if (tool) toolKeys.add(tool);
      else if (!SKIP_PROFILE_KEYS.has(k)) toolKeys.add(k); // use key as-is if not in map (e.g. vedic)
    }
    return [...toolKeys];
  }

  /**
   * Determines which tool-specific seers are relevant for a question.
   * When decomposedQuery is provided, uses only domains_required (jurisdiction filter) intersected with available tools.
   * When not provided, uses keyword-based selection (backward compatible).
   */
  determineRelevantTools(question: string, comprehensiveProfile: any, decomposedQuery?: DecomposedQuery | null): string[] {
    const availableTools = this.getAvailableToolKeys(comprehensiveProfile);

    // Domain Activation Filter: when decomposition is provided, use only domains_required ∩ available
    if (decomposedQuery?.domains_required?.length) {
      const jurisdictionTools = decomposedQuery.domains_required.filter(t => availableTools.includes(t));
      if (jurisdictionTools.length > 0) {
        const capped = jurisdictionTools.length > 5 ? jurisdictionTools.slice(0, 5) : jurisdictionTools;
        return [...new Set(capped)];
      }
      // Fall through to keyword-based if no overlap (e.g. profile has no data in jurisdiction)
    }

    const lowerQuestion = question.toLowerCase();
    const relevantTools: string[] = [];

    // Always include core systems for comprehensive analysis
    if (availableTools.includes('vedic')) {
      relevantTools.push('vedic');
    }

    // Question-based tool selection
    if (lowerQuestion.includes('tarot') || lowerQuestion.includes('card') ||
        lowerQuestion.includes('arcana') || (availableTools.includes('tarot') &&
        (lowerQuestion.includes('relationship') || lowerQuestion.includes('love') || lowerQuestion.includes('guidance') || lowerQuestion.includes('spiritual')))) {
      if (availableTools.includes('tarot')) {
        relevantTools.push('tarot');
      }
    }

    if (lowerQuestion.includes('western') || lowerQuestion.includes('natal chart') ||
        lowerQuestion.includes('horoscope') || lowerQuestion.includes('zodiac')) {
      if (availableTools.includes('western')) {
        relevantTools.push('western');
      }
    }

    if (lowerQuestion.includes('number') || lowerQuestion.includes('numerology') ||
        lowerQuestion.includes('life path') || lowerQuestion.includes('destiny number')) {
      if (availableTools.includes('numerology')) {
        relevantTools.push('numerology');
      }
    }

    // Kabbalistic Numerology – soul lesson, pattern, name alignment, inner correction, purpose
    if (/\b(soul (lesson|number|path|purpose)|why (pattern|repetition)|name alignment|inner correction|purpose|gematria|kabbalah|hebrew (name|letters))\b/i.test(lowerQuestion)) {
      if (availableTools.includes('kabbalistic')) {
        relevantTools.push('kabbalistic');
      }
    }

    // Name Analysis – expression, perception, branding, career name, public name
    if (/\b(how (does my name|am i) (perceived|seen)|(first impression|public perception|brand name|career name|expression (and|&) perception|name (for|and) (career|brand)|(name|personality) alignment))\b/i.test(lowerQuestion)) {
      if (availableTools.includes('nameAnalysis')) {
        relevantTools.push('nameAnalysis');
      }
    }

    if (lowerQuestion.includes('health') || lowerQuestion.includes('medical') ||
        lowerQuestion.includes('illness') || lowerQuestion.includes('disease')) {
      if (availableTools.includes('medical')) {
        relevantTools.push('medical');
      }
    }

    if (lowerQuestion.includes('financial') || lowerQuestion.includes('money') ||
        lowerQuestion.includes('wealth') || lowerQuestion.includes('business') ||
        lowerQuestion.includes('investment')) {
      if (availableTools.includes('financial')) {
        relevantTools.push('financial');
      }
    }

    if (lowerQuestion.includes('iching') || lowerQuestion.includes('i ching') ||
        lowerQuestion.includes('hexagram') || lowerQuestion.includes('chinese')) {
      if (availableTools.includes('iching')) {
        relevantTools.push('iching');
      }
    }

    if (lowerQuestion.includes('geomancy') || lowerQuestion.includes('geomantic')) {
      if (availableTools.includes('geomancy')) {
        relevantTools.push('geomancy');
      }
    }

    // Navaratna / gemstones
    if (/\b(gemstone|gem\b|navaratna|ratti|carats?|stone to wear|metal\b|ring\b|wear a stone)\b/i.test(lowerQuestion)) {
      if (availableTools.includes('navaratna')) {
        relevantTools.push('navaratna');
      }
    }

    // Dream Symbols
    if (/\b(dream|symbol|interpretation|archetype|subconscious)\b/i.test(lowerQuestion)) {
      if (availableTools.includes('dreamSymbols')) {
        relevantTools.push('dreamSymbols');
      }
    }

    // Face Reading
    if (/\b(face|physiognomy|facial|features|reading face)\b/i.test(lowerQuestion)) {
      if (availableTools.includes('faceReading')) {
        relevantTools.push('faceReading');
      }
    }

    // Feng Shui
    if (/\b(feng shui|space|direction|bagua|kua|chi|energy flow)\b/i.test(lowerQuestion)) {
      if (availableTools.includes('fengShui')) {
        relevantTools.push('fengShui');
      }
    }

    // Vastu – spatial, orientation, zones, Brahmasthan, room placement
    if (/\b(vastu|brahmasthan|ishanya|nairutya|orientation|zone (to )?function|room placement|layout (balanced|harmony)|spatial (harmony|constraint))\b/i.test(lowerQuestion)) {
      if (availableTools.includes('vastu')) {
        relevantTools.push('vastu');
      }
    }

    // Human Design
    if (/\b(human design|bodygraph|energy type|strategy|authority|profile|centers|gates|channels)\b/i.test(lowerQuestion)) {
      if (availableTools.includes('humanDesign')) {
        relevantTools.push('humanDesign');
      }
    }

    // Ogham
    if (/\b(ogham|celtic|tree alphabet|ogham script)\b/i.test(lowerQuestion)) {
      if (availableTools.includes('ogham')) {
        relevantTools.push('ogham');
      }
    }

    // Bibliomancy
    if (/\b(bibliomancy|passage|verse|sacred text|bible|quran|gita|torah|hafez)\b/i.test(lowerQuestion)) {
      if (availableTools.includes('bibliomancy')) {
        relevantTools.push('bibliomancy');
      }
    }

    // Trichakra
    if (/\b(trichakra|body mind soul|three chakra)\b/i.test(lowerQuestion)) {
      if (availableTools.includes('trichakra')) {
        relevantTools.push('trichakra');
      }
    }

    // Sortilege
    if (/\b(sortilege|casting|drawing lots)\b/i.test(lowerQuestion)) {
      if (availableTools.includes('sortilege')) {
        relevantTools.push('sortilege');
      }
    }

    // Pendulum (confirmation only - never primary)
    if (/\b(aligned|alignment|proceed|confirm|supported|yes or no|should i proceed|is this (aligned|supported))\b/i.test(lowerQuestion)) {
      relevantTools.push('pendulum');
    }

    // Lenormand – concrete situation, near-term, what's happening, outcome (not Tarot)
    if (/\b(lenormand|36 card|concrete (situation|outcome)|near term|what('s| is) happening|will i (get|hear)|likely outcome|moving forward or blocked)\b/i.test(lowerQuestion)) {
      if (availableTools.includes('lenormand')) {
        relevantTools.push('lenormand');
      }
    }

    // For general questions, include multiple relevant tools (but limit to avoid too many calls)
    if (relevantTools.length === 0 || (lowerQuestion.length < 20 && relevantTools.length < 3)) {
      // Add top tools for general questions (prioritize most comprehensive)
      if (availableTools.includes('vedic')) {
        relevantTools.push('vedic');
      }
      if (availableTools.includes('western')) {
        relevantTools.push('western');
      }
      if (availableTools.includes('numerology')) {
        relevantTools.push('numerology');
      }
    }

    // Limit to max 5 tools to avoid performance issues
    if (relevantTools.length > 5) {
      const priority = ['vedic', 'western', 'tarot', 'numerology', 'kabbalistic', 'nameAnalysis', 'lenormand', 'vastu', 'financial', 'medical', 'iching', 'geomancy', 'navaratna', 'dreamSymbols', 'faceReading', 'fengShui', 'humanDesign', 'ogham', 'bibliomancy', 'trichakra', 'sortilege', 'pendulum'];
      relevantTools.sort((a, b) => {
        const aIndex = priority.indexOf(a);
        const bIndex = priority.indexOf(b);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });
      relevantTools.splice(5);
    }

    // Remove duplicates
    return [...new Set(relevantTools)];
  }

  /**
   * Calls a specific tool seer API
   */
  private async callToolSeer(
    tool: string,
    question: string,
    userId: string,
    userProfile: any,
    comprehensiveProfile: any
  ): Promise<ToolSeerResponse | null> {
    const toolNameMap: Record<string, string> = {
      'vedic': 'Vedic Astrology',
      'western': 'Western Astrology',
      'tarot': 'Tarot',
      'numerology': 'Numerology',
      'kabbalistic': 'Kabbalistic Numerology',
      'nameAnalysis': 'Name Analysis',
      'lenormand': 'Lenormand Divination',
      'vastu': 'Vastu',
      'iching': 'I Ching',
      'geomancy': 'Geomancy',
      'financial': 'Financial Astrology',
      'medical': 'Medical Astrology',
      'navaratna': 'Navaratna',
      'dreamSymbols': 'Dream Symbols',
      'faceReading': 'Face Reading',
      'fengShui': 'Feng Shui',
      'humanDesign': 'Human Design',
      'ogham': 'Ogham',
      'bibliomancy': 'Bibliomancy',
      'trichakra': 'Trichakra',
      'sortilege': 'Sortilege',
      'pendulum': 'Pendulum Divination',
    };

    const toolName = toolNameMap[tool] || tool;

    try {
      devLog.debug(`🔮 Calling ${toolName} Seer API...`, undefined, 'seer-aggregator');

      let apiPath = '';
      let requestBody: any = {
        userId,
        question,
        userProfile
      };

      // Build request based on tool type
      switch (tool) {
        case 'vedic':
          apiPath = '/api/ask-vedic-seer';
          const vedicData = comprehensiveProfile?.vedic || comprehensiveProfile?.['Vedic Astrology'];
          if (!vedicData?.chart) {
            devLog.warn(`⚠️ Missing Vedic chart data, skipping ${toolName} Seer`, undefined, 'seer-aggregator');
            return null;
          }
          requestBody.vedicChartData = vedicData.chart;
          requestBody.vedicNumerologyData = vedicData.numerology;
          break;

        case 'western':
          apiPath = '/api/ask-western-seer';
          const westernData = comprehensiveProfile?.western || comprehensiveProfile?.['Western Astrology'];
          if (!westernData?.chart) {
            devLog.warn(`⚠️ Missing Western chart data, skipping ${toolName} Seer`, undefined, 'seer-aggregator');
            return null;
          }
          requestBody.westernChartData = westernData.chart;
          requestBody.astroNumerologyData = westernData.astroNumerology;
          break;

        case 'tarot':
          apiPath = '/api/ask-tarot-seer';
          const tarotData = comprehensiveProfile?.tarot || comprehensiveProfile?.Tarot;
          requestBody.tarotProfileData = tarotData?.profile;
          requestBody.westernAstrologyData = comprehensiveProfile?.western;
          requestBody.numerologyData = comprehensiveProfile?.numerology;
          requestBody.combinedSystemData = comprehensiveProfile;
          break;

        case 'numerology':
          apiPath = '/api/ask-numerology-seer';
          const numerologyData = comprehensiveProfile?.numerology || comprehensiveProfile?.Numerology;
          if (!numerologyData) {
            devLog.warn(`⚠️ Missing Numerology data, skipping ${toolName} Seer`, undefined, 'seer-aggregator');
            return null;
          }
          requestBody.numerologyData = {
            lifePathNumber: numerologyData.lifePathNumber,
            expressionNumber: numerologyData.expressionNumber,
            soulUrgeNumber: numerologyData.soulUrgeNumber,
            personalityNumber: numerologyData.personalityNumber,
            destinyNumber: numerologyData.destinyNumber,
            birthdayNumber: numerologyData.birthdayNumber,
            maturityNumber: numerologyData.maturityNumber,
            personalYearNumber: numerologyData.personalYearNumber,
            breakdown: numerologyData.breakdown
          };
          requestBody.comprehensiveReport = numerologyData.comprehensiveReport;
          break;

        case 'kabbalistic': {
          apiPath = '/api/ask-kabbalistic-numerology-seer';
          const kabbalisticData = comprehensiveProfile?.kabbalisticNumerology ?? comprehensiveProfile?.['Kabbalistic Numerology'];
          if (!kabbalisticData?.chart?.nameAnalysis) {
            devLog.warn(`⚠️ Missing Kabbalistic Numerology name analysis, skipping ${toolName} Seer`, undefined, 'seer-aggregator');
            return null;
          }
          requestBody.kabbalisticAnalysis = kabbalisticData;
          requestBody.comprehensiveProfile = comprehensiveProfile;
          break;
        }

        case 'nameAnalysis': {
          apiPath = '/api/ask-name-analysis-seer';
          const nameAnalysisData = comprehensiveProfile?.nameAnalysis ?? comprehensiveProfile?.['Name Analysis'];
          if (!nameAnalysisData?.fullName && !nameAnalysisData?.full_name) {
            devLog.warn(`⚠️ Missing Name Analysis data, skipping ${toolName} Seer`, undefined, 'seer-aggregator');
            return null;
          }
          requestBody.nameAnalysis = nameAnalysisData;
          requestBody.comprehensiveProfile = comprehensiveProfile;
          break;
        }

        case 'lenormand': {
          apiPath = '/api/ask-lenormand-seer';
          const lenormandData = comprehensiveProfile?.lenormand ?? comprehensiveProfile?.['Lenormand Divination'];
          if (!lenormandData?.question || !lenormandData?.cards?.length) {
            devLog.warn(`⚠️ Missing Lenormand reading (question + cards), skipping ${toolName} Seer`, undefined, 'seer-aggregator');
            return null;
          }
          requestBody.lenormandReading = {
            question: lenormandData.question,
            spreadType: lenormandData.spreadType,
            cards: lenormandData.cards,
            positions: lenormandData.positions,
          };
          break;
        }

        case 'iching':
          apiPath = '/api/ask-iching-seer';
          const ichingData = comprehensiveProfile?.iching || comprehensiveProfile?.['I Ching'];
          if (!ichingData?.hexagram) {
            devLog.warn(`⚠️ Missing I Ching data, skipping ${toolName} Seer`, undefined, 'seer-aggregator');
            return null;
          }
          requestBody.ichingAnalysis = ichingData;
          break;

        case 'geomancy': {
          apiPath = '/api/ask-geomancy-seer';
          const geomancyData = comprehensiveProfile?.geomancy || comprehensiveProfile?.Geomancy;
          const figures = geomancyData?.figures;
          if (!figures || !Array.isArray(figures) || figures.length < 15) {
            devLog.warn(`⚠️ Missing or incomplete Geomancy chart (need 15 figures), skipping ${toolName} Seer`, undefined, 'seer-aggregator');
            return null;
          }
          requestBody.geomancyAnalysis = geomancyData;
          break;
        }

        case 'financial': {
          apiPath = '/api/ask-financial-seer';
          const financialData = comprehensiveProfile?.financialAstrology || comprehensiveProfile?.['Financial Astrology'];
          const vedic = comprehensiveProfile?.vedic ?? comprehensiveProfile?.['Vedic Astrology'];
          const western = comprehensiveProfile?.western ?? comprehensiveProfile?.['Western Astrology'];
          const natalChart =
            vedic?.vedicCharts?.D1 ?? vedic?.chart ?? western?.chart ?? western?.data ?? financialData?.chart;
          const hasPlanets =
            natalChart?.planets &&
            (Array.isArray(natalChart.planets) ? natalChart.planets.length > 0 : Object.keys(natalChart.planets).length > 0);
          if (!hasPlanets) {
            devLog.warn(`⚠️ Missing natal chart for Financial Astrology, skipping ${toolName} Seer`, undefined, 'seer-aggregator');
            return null;
          }
          requestBody.natalChart = natalChart;
          requestBody.comprehensiveProfile = comprehensiveProfile;
          requestBody.financialChartData = financialData?.chart;
          break;
        }

        case 'medical': {
          apiPath = '/api/chat/medical-seer';
          const medicalData = comprehensiveProfile?.medicalAstrology || comprehensiveProfile?.['Medical Astrology'];
          const chart = medicalData?.data?.chart ?? medicalData?.chart;
          if (!chart?.planets || Object.keys(chart.planets).length === 0) {
            devLog.warn(`⚠️ Missing Medical Astrology chart data, skipping ${toolName} Seer`, undefined, 'seer-aggregator');
            return null;
          }
          if (medicalData?.data) {
            requestBody.analysis = medicalData;
          } else {
            requestBody.chartData = chart;
            requestBody.analysis = { data: { chart, timing: medicalData?.timing } };
          }
          requestBody.comprehensiveProfile = comprehensiveProfile;
          break;
        }

        case 'navaratna': {
          apiPath = '/api/ask-navaratna-seer';
          const navaratnaData = comprehensiveProfile?.navaratna || comprehensiveProfile?.navaratnaPlanetaryStones || comprehensiveProfile?.['Navaratna'];
          const navaratnaAnalysis = navaratnaData?.analysis ?? navaratnaData;
          if (!navaratnaAnalysis?.chartSummary) {
            devLog.warn(`⚠️ Missing Navaratna analysis data, skipping ${toolName} Seer`, undefined, 'seer-aggregator');
            return null;
          }
          requestBody.navaratnaAnalysis = navaratnaAnalysis;
          break;
        }

        case 'dreamSymbols':
          apiPath = '/api/ask-dream-symbols-seer';
          const dreamData = comprehensiveProfile?.dreamSymbols || comprehensiveProfile?.['Dream Symbols'];
          if (dreamData) requestBody.dreamSymbolsAnalysis = dreamData;
          break;

        case 'faceReading':
          apiPath = '/api/ask-face-reading-seer';
          const faceData = comprehensiveProfile?.faceReading || comprehensiveProfile?.['Face Reading'];
          if (faceData) requestBody.faceReadingAnalysis = faceData;
          break;

        case 'fengShui':
          apiPath = '/api/ask-feng-shui-seer';
          const fengShuiData = comprehensiveProfile?.fengShui || comprehensiveProfile?.['Feng Shui'];
          if (fengShuiData) requestBody.fengShuiAnalysis = fengShuiData;
          break;

        case 'vastu': {
          apiPath = '/api/ask-vastu-seer';
          const vastuData = comprehensiveProfile?.vastu ?? comprehensiveProfile?.['Vastu'];
          if (!vastuData?.entranceDirection && !vastuData?.mainEntranceAnalysis?.houseFacing) {
            devLog.warn(`⚠️ Missing Vastu orientation/layout, skipping ${toolName} Seer`, undefined, 'seer-aggregator');
            return null;
          }
          requestBody.vastuAnalysis = vastuData;
          break;
        }

        case 'humanDesign':
          apiPath = '/api/ask-human-design-seer';
          const humanDesignData = comprehensiveProfile?.humanDesign || comprehensiveProfile?.['Human Design'];
          if (humanDesignData) requestBody.humanDesignChart = humanDesignData;
          break;

        case 'ogham':
          apiPath = '/api/ask-ogham-seer';
          const oghamData = comprehensiveProfile?.ogham || comprehensiveProfile?.['Ogham'];
          if (oghamData) requestBody.oghamReport = oghamData;
          break;

        case 'bibliomancy':
          apiPath = '/api/ask-bibliomancy-seer';
          const bibliomancyData = comprehensiveProfile?.bibliomancy || comprehensiveProfile?.['Bibliomancy'];
          if (bibliomancyData) requestBody.bibliomancyReading = bibliomancyData;
          break;

        case 'trichakra': {
          apiPath = '/api/ask-trichakra-seer';
          const trichakraData = comprehensiveProfile?.trichakraMethod || comprehensiveProfile?.trichakra || comprehensiveProfile?.['Trichakra'];
          if (!trichakraData) {
            devLog.warn(`⚠️ Missing Trichakra data, skipping ${toolName} Seer`, undefined, 'seer-aggregator');
            return null;
          }
          requestBody.trichakraAnalysis = trichakraData;
          break;
        }

        case 'sortilege': {
          apiPath = '/api/ask-sortilege-seer';
          const sortilegeData = comprehensiveProfile?.sortilege || comprehensiveProfile?.['Sortilege'];
          if (!sortilegeData?.castResult) {
            devLog.warn(`⚠️ Missing Sortilege reading data, skipping ${toolName} Seer`, undefined, 'seer-aggregator');
            return null;
          }
          requestBody.sortilegeReading = sortilegeData;
          break;
        }

        case 'pendulum':
          apiPath = '/api/ask-pendulum-seer';
          const pendulumData = comprehensiveProfile?.pendulum || comprehensiveProfile?.['Pendulum Divination'];
          if (pendulumData?.reading?.answer) {
            requestBody.pendulumAnalysis = pendulumData.reading;
          }
          break;

        default:
          devLog.warn(`⚠️ Unknown tool: ${tool}, skipping`, undefined, 'seer-aggregator');
          return null;
      }

      // Call the tool-specific seer API
      const response = await fetch(`${this.baseUrl}${apiPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        devLog.warn(`⚠️ ${toolName} Seer API error: ${response.status}`, errorText, 'seer-aggregator');
        return {
          tool,
          toolName,
          answer: '',
          confidence: 0,
          sources: [],
          error: `API error: ${response.status}`
        };
      }

      // Handle streaming responses (some seers return streams)
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/event-stream')) {
        // For streaming responses, read the stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let answer = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            answer += decoder.decode(value, { stream: true });
          }
        }

        return {
          tool,
          toolName,
          answer: answer.trim(),
          confidence: 0.8,
          sources: [toolName]
        };
      }

      // Handle JSON responses
      const result = await response.json();

      if (!result.success && !result.data && !result.answer) {
        return {
          tool,
          toolName,
          answer: '',
          confidence: 0,
          sources: [],
          error: result.error || 'Unknown error'
        };
      }

      // Handle different response formats
      const data = result.data || result;
      const answer = data.answer || data.response || result.answer || '';
      
      if (!answer || answer.trim().length === 0) {
        return {
          tool,
          toolName,
          answer: '',
          confidence: 0,
          sources: [],
          error: 'Empty response from seer'
        };
      }

      return {
        tool,
        toolName,
        answer: answer.trim(),
        confidence: data.confidence || result.confidence || 0.7,
        sources: data.sources || data.source_badges || result.sources || [toolName],
        timing: data.timing || result.timing,
        remedies: data.remedies || result.remedies,
        followUpQuestions: data.followUpQuestions || result.followUpQuestions
      };

    } catch (error) {
      devLog.warn(`⚠️ Error calling ${toolName} Seer:`, error instanceof Error ? error.message : String(error), 'seer-aggregator');
      return {
        tool,
        toolName,
        answer: '',
        confidence: 0,
        sources: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Aggregates expert responses from multiple tool-specific seers.
   * When decomposedQuery is provided, only tools in domains_required (with data) are called.
   */
  async aggregateExpertResponses(
    question: string,
    userId: string,
    userProfile: any,
    comprehensiveProfile: any,
    decomposedQuery?: DecomposedQuery | null
  ): Promise<{
    expertResponses: ToolSeerResponse[];
    expertConsensus: ExpertConsensus;
    primaryExpert: string | null;
  }> {
    devLog.info('🔮 SeerAggregator: Starting expert aggregation...', undefined, 'seer-aggregator');

    // Determine which tools are relevant (jurisdiction filter when decomposedQuery provided)
    const relevantTools = this.determineRelevantTools(question, comprehensiveProfile, decomposedQuery);
    devLog.debug(`📊 Relevant tools identified:`, relevantTools, 'seer-aggregator');

    if (relevantTools.length === 0) {
      devLog.warn('⚠️ No relevant tools found, returning empty aggregation', undefined, 'seer-aggregator');
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

    // Call all relevant tool seers in parallel
    const expertPromises = relevantTools.map(tool =>
      this.callToolSeer(tool, question, userId, userProfile, comprehensiveProfile)
    );

    const expertResults = await Promise.allSettled(expertPromises);
    
    // Process results
    const expertResponses: ToolSeerResponse[] = [];
    for (let i = 0; i < expertResults.length; i++) {
      const result = expertResults[i];
      if (result.status === 'fulfilled' && result.value) {
        expertResponses.push(result.value);
      } else if (result.status === 'rejected') {
        devLog.warn(`⚠️ Tool seer ${relevantTools[i]} failed:`, result.reason, 'seer-aggregator');
      }
    }

    // Filter out failed responses
    const validResponses = expertResponses.filter(r => r.answer && !r.error);

    devLog.info(`✅ Aggregated ${validResponses.length} expert responses from ${relevantTools.length} tools`, undefined, 'seer-aggregator');

    // Calculate consensus
    const expertConsensus = this.calculateConsensus(validResponses);

    // Determine primary expert (highest confidence with valid answer)
    const primaryExpert = validResponses.length > 0
      ? validResponses.reduce((prev, current) => 
          (current.confidence > prev.confidence) ? current : prev
        ).tool
      : null;

    return {
      expertResponses: validResponses,
      expertConsensus,
      primaryExpert
    };
  }

  /**
   * Calculates consensus among expert responses
   */
  private calculateConsensus(responses: ToolSeerResponse[]): ExpertConsensus {
    if (responses.length === 0) {
      return {
        highAgreement: [],
        mediumAgreement: [],
        lowAgreement: [],
        conflicts: [],
        overallConfidence: 0
      };
    }

    // Simple consensus calculation based on confidence scores
    const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
    
    const highConfidence = responses.filter(r => r.confidence >= 0.8);
    const mediumConfidence = responses.filter(r => r.confidence >= 0.6 && r.confidence < 0.8);
    const lowConfidence = responses.filter(r => r.confidence < 0.6);

    // Detect conflicts (when experts have very different confidence levels)
    const conflicts: string[] = [];
    if (responses.length > 1) {
      const confidences = responses.map(r => r.confidence);
      const maxConf = Math.max(...confidences);
      const minConf = Math.min(...confidences);
      if (maxConf - minConf > 0.5) {
        conflicts.push('Conflicting confidence levels detected');
      }
    }

    return {
      highAgreement: highConfidence.map(r => r.toolName),
      mediumAgreement: mediumConfidence.map(r => r.toolName),
      lowAgreement: lowConfidence.map(r => r.toolName),
      conflicts,
      overallConfidence: avgConfidence
    };
  }
}
