import { DivinationModule } from './toolSelector';

export interface EvidenceSource {
  source: string;
  domain: string;
  strength: number;
  timing_window?: [string, string];
  primary_factors: string[];
  warnings?: string[];
  confidence: number;
  last_updated: string;
}

export interface AggregatedEvidence {
  sources: EvidenceSource[];
  overall_strength: number;
  timing_consensus?: [string, string];
  primary_themes: string[];
  warnings: string[];
  confidence_score: number;
  conflicting_signals: boolean;
}

// Mock data generators for different modules
const MOCK_EVIDENCE_DATA = {
  VimshottariDasha: {
    financial_approval: {
      source: "VimshottariDasha",
      domain: "financial",
      strength: 0.85,
      timing_window: ["2025-12-01", "2025-12-15"],
      primary_factors: ["Mars Mahadasha active", "Jupiter bhukti favorable", "Saturn sub-period supportive"],
      warnings: ["Rahu influence may cause delays"],
      confidence: 0.85,
      last_updated: new Date().toISOString()
    },
    career_timing: {
      source: "VimshottariDasha",
      domain: "career",
      strength: 0.80,
      timing_window: ["2025-11-15", "2026-02-28"],
      primary_factors: ["Jupiter Mahadasha", "Mercury bhukti for communication", "Venus sub-period for recognition"],
      warnings: ["Mars retrograde may slow progress"],
      confidence: 0.80,
      last_updated: new Date().toISOString()
    }
  },
  
  TransitSummary: {
    financial_approval: {
      source: "TransitSummary",
      domain: "financial",
      strength: 0.75,
      timing_window: ["2025-12-02", "2025-12-04"],
      primary_factors: ["Jupiter in 11th house", "Saturn direct in 2nd house", "Venus trine Jupiter"],
      warnings: ["Mercury retrograde may affect communication"],
      confidence: 0.75,
      last_updated: new Date().toISOString()
    },
    career_timing: {
      source: "TransitSummary",
      domain: "career",
      strength: 0.70,
      timing_window: ["2025-11-20", "2025-12-10"],
      primary_factors: ["Mars in 10th house", "Sun in 9th house", "Jupiter aspecting 10th"],
      warnings: ["Rahu transit may bring uncertainty"],
      confidence: 0.70,
      last_updated: new Date().toISOString()
    }
  },
  
  RajYogaTiming: {
    financial_approval: {
      source: "RajYogaTiming",
      domain: "financial",
      strength: 0.90,
      timing_window: ["2025-08-01", "2026-02-28"],
      primary_factors: ["Jupiter exalted in 9th house", "Saturn in 11th house", "Mars-Jupiter conjunction"],
      warnings: ["Early delay from retrograde planets"],
      confidence: 0.90,
      last_updated: new Date().toISOString()
    },
    career_timing: {
      source: "RajYogaTiming",
      domain: "career",
      strength: 0.85,
      timing_window: ["2025-10-01", "2026-03-31"],
      primary_factors: ["Sun-Mars combination", "Jupiter in 10th house", "Saturn in 11th house"],
      warnings: ["Rahu leakage may reduce benefits"],
      confidence: 0.85,
      last_updated: new Date().toISOString()
    }
  },
  
  NumerologyMoneyCycle: {
    financial_approval: {
      source: "NumerologyMoneyCycle",
      domain: "financial",
      strength: 0.65,
      timing_window: ["2025-12-01", "2025-12-31"],
      primary_factors: ["Personal year 8", "Universal month 3", "Favorable number combinations"],
      warnings: ["Avoid number 4 dates"],
      confidence: 0.65,
      last_updated: new Date().toISOString()
    }
  },
  
  NatalComposite: {
    compatibility: {
      source: "NatalComposite",
      domain: "relationship",
      strength: 0.85,
      primary_factors: ["Sun-Moon conjunction", "Venus-Mars trine", "Jupiter in 7th house"],
      warnings: ["Saturn square Venus may bring challenges"],
      confidence: 0.85,
      last_updated: new Date().toISOString()
    }
  },
  
  TarotInsight: {
    general_guidance: {
      source: "TarotInsight",
      domain: "general",
      strength: 0.60,
      primary_factors: ["The Star card", "Wheel of Fortune", "Three of Cups"],
      warnings: ["Seven of Swords suggests caution"],
      confidence: 0.60,
      last_updated: new Date().toISOString()
    }
  }
};

export async function fetchModuleEvidence(
  moduleName: string, 
  intent: string, 
  userProfile?: any
): Promise<EvidenceSource | null> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  // Get mock data for the module and intent
  const moduleData = MOCK_EVIDENCE_DATA[moduleName as keyof typeof MOCK_EVIDENCE_DATA];
  if (!moduleData) {
    console.warn(`No mock data available for module: ${moduleName}`);
    return null;
  }
  
  const intentData = moduleData[intent as keyof typeof moduleData];
  if (!intentData) {
    console.warn(`No mock data available for intent: ${intent} in module: ${moduleName}`);
    return null;
  }
  
  const data = intentData as EvidenceSource;
  // Add some randomization to make it more realistic
  const randomizedStrength = data.strength + (Math.random() - 0.5) * 0.1;
  const randomizedConfidence = data.confidence + (Math.random() - 0.5) * 0.05;
  
  return {
    ...data,
    strength: Math.max(0.1, Math.min(1.0, randomizedStrength)),
    confidence: Math.max(0.1, Math.min(1.0, randomizedConfidence))
  };
}

export async function aggregateEvidence(
  modules: DivinationModule[], 
  intent: string, 
  userProfile?: any
): Promise<AggregatedEvidence> {
  const evidencePromises = modules.map(module => 
    fetchModuleEvidence(module.name, intent, userProfile)
  );
  
  const evidenceResults = await Promise.all(evidencePromises);
  const validEvidence = evidenceResults.filter(Boolean) as EvidenceSource[];
  
  if (validEvidence.length === 0) {
    return {
      sources: [],
      overall_strength: 0,
      primary_themes: [],
      warnings: [],
      confidence_score: 0,
      conflicting_signals: false
    };
  }
  
  // Calculate overall strength (weighted average)
  const totalWeight = validEvidence.reduce((sum, evidence) => sum + evidence.strength, 0);
  const overall_strength = totalWeight / validEvidence.length;
  
  // Calculate confidence score
  const totalConfidence = validEvidence.reduce((sum, evidence) => sum + evidence.confidence, 0);
  const confidence_score = totalConfidence / validEvidence.length;
  
  // Extract primary themes
  const allFactors = validEvidence.flatMap(evidence => evidence.primary_factors);
  const factorCounts = allFactors.reduce((counts, factor) => {
    counts[factor] = (counts[factor] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  const primary_themes = Object.entries(factorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([factor]) => factor);
  
  // Collect all warnings
  const warnings = validEvidence
    .flatMap(evidence => evidence.warnings || [])
    .filter((warning, index, array) => array.indexOf(warning) === index);
  
  // Check for timing consensus
  const timingEvidence = validEvidence.filter(evidence => evidence.timing_window);
  let timing_consensus: [string, string] | undefined;
  
  if (timingEvidence.length >= 2) {
    const windows = timingEvidence.map(evidence => evidence.timing_window!);
    const startDates = windows.map(([start]) => new Date(start));
    const endDates = windows.map(([, end]) => new Date(end));
    
    const latestStart = new Date(Math.max(...startDates.map(d => d.getTime())));
    const earliestEnd = new Date(Math.min(...endDates.map(d => d.getTime())));
    
    if (latestStart < earliestEnd) {
      timing_consensus = [latestStart.toISOString().split('T')[0], earliestEnd.toISOString().split('T')[0]];
    }
  }
  
  // Check for conflicting signals
  const strengths = validEvidence.map(evidence => evidence.strength);
  const strengthVariance = calculateVariance(strengths);
  const conflicting_signals = strengthVariance > 0.1; // High variance indicates conflicts
  
  return {
    sources: validEvidence,
    overall_strength,
    timing_consensus,
    primary_themes,
    warnings,
    confidence_score,
    conflicting_signals
  };
}

function calculateVariance(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
}

// Test the evidence aggregator
export async function testEvidenceAggregation() {
  const testModules = [
    { name: "VimshottariDasha", description: "Dasha", domain: ["timing"], confidence_weight: 0.85, timing_relevance: true, compatibility_relevance: false, financial_relevance: true },
    { name: "TransitSummary", description: "Transits", domain: ["timing"], confidence_weight: 0.75, timing_relevance: true, compatibility_relevance: false, financial_relevance: true },
    { name: "RajYogaTiming", description: "Raj Yoga", domain: ["career"], confidence_weight: 0.90, timing_relevance: true, compatibility_relevance: false, financial_relevance: true }
  ];
  
  const intent = "financial_approval";
  
  console.log(`Testing evidence aggregation for intent: ${intent}`);
  const aggregated = await aggregateEvidence(testModules, intent);
  
  console.log(`Overall Strength: ${aggregated.overall_strength.toFixed(2)}`);
  console.log(`Confidence Score: ${aggregated.confidence_score.toFixed(2)}`);
  console.log(`Primary Themes: ${aggregated.primary_themes.join(', ')}`);
  console.log(`Warnings: ${aggregated.warnings.join(', ')}`);
  console.log(`Conflicting Signals: ${aggregated.conflicting_signals}`);
  console.log(`Timing Consensus: ${aggregated.timing_consensus ? aggregated.timing_consensus.join(' to ') : 'None'}`);
  console.log(`Sources: ${aggregated.sources.map(s => s.source).join(', ')}`);
} 