import { IntentSlots } from './intentExtractor';
import { devLog } from '@/lib/devLogger';

export interface DivinationModule {
  name: string;
  description: string;
  domain: string[];
  confidence_weight: number;
  timing_relevance: boolean;
  compatibility_relevance: boolean;
  financial_relevance: boolean;
}

export interface ModuleSelection {
  primary_modules: DivinationModule[];
  secondary_modules: DivinationModule[];
  confidence_score: number;
  reasoning: string;
}

// Available divination modules
const DIVINATION_MODULES: DivinationModule[] = [
  {
    name: "VimshottariDasha",
    description: "Major planetary periods and sub-periods",
    domain: ["timing", "career", "financial", "health", "relationship"],
    confidence_weight: 0.85,
    timing_relevance: true,
    compatibility_relevance: false,
    financial_relevance: true
  },
  {
    name: "TransitSummary",
    description: "Current planetary transits and their effects",
    domain: ["timing", "career", "financial", "health", "relationship"],
    confidence_weight: 0.75,
    timing_relevance: true,
    compatibility_relevance: false,
    financial_relevance: true
  },
  {
    name: "RajYogaTiming",
    description: "Royal combinations and their activation periods",
    domain: ["career", "financial", "success", "recognition"],
    confidence_weight: 0.90,
    timing_relevance: true,
    compatibility_relevance: false,
    financial_relevance: true
  },
  {
    name: "ChandraLagnaMoonWindows",
    description: "Moon-based timing windows for activities",
    domain: ["timing", "health", "emotional", "travel"],
    confidence_weight: 0.70,
    timing_relevance: true,
    compatibility_relevance: false,
    financial_relevance: false
  },
  {
    name: "NumerologyMoneyCycle",
    description: "Numerological cycles for financial matters",
    domain: ["financial", "career", "timing"],
    confidence_weight: 0.65,
    timing_relevance: true,
    compatibility_relevance: false,
    financial_relevance: true
  },
  {
    name: "StrengthYogas",
    description: "Planetary strength and auspicious combinations",
    domain: ["career", "success", "health", "general"],
    confidence_weight: 0.80,
    timing_relevance: false,
    compatibility_relevance: false,
    financial_relevance: true
  },
  {
    name: "NatalComposite",
    description: "Composite chart analysis for relationships",
    domain: ["relationship", "compatibility", "partnership"],
    confidence_weight: 0.85,
    timing_relevance: false,
    compatibility_relevance: true,
    financial_relevance: false
  },
  {
    name: "HouseOverlaps",
    description: "House overlays for relationship compatibility",
    domain: ["relationship", "compatibility", "partnership"],
    confidence_weight: 0.75,
    timing_relevance: false,
    compatibility_relevance: true,
    financial_relevance: false
  },
  {
    name: "ElementalMatch",
    description: "Elemental compatibility analysis",
    domain: ["relationship", "compatibility", "partnership"],
    confidence_weight: 0.70,
    timing_relevance: false,
    compatibility_relevance: true,
    financial_relevance: false
  },
  {
    name: "SynastryScores",
    description: "Detailed relationship compatibility scores",
    domain: ["relationship", "compatibility", "partnership"],
    confidence_weight: 0.80,
    timing_relevance: false,
    compatibility_relevance: true,
    financial_relevance: false
  },
  {
    name: "TarotInsight",
    description: "Tarot card guidance for current situation",
    domain: ["general", "guidance", "insight"],
    confidence_weight: 0.60,
    timing_relevance: false,
    compatibility_relevance: false,
    financial_relevance: false
  },
  {
    name: "AngelNumbers",
    description: "Angel number interpretations and guidance",
    domain: ["general", "guidance", "spiritual"],
    confidence_weight: 0.55,
    timing_relevance: false,
    compatibility_relevance: false,
    financial_relevance: false
  }
];

// Intent to module mapping
const INTENT_MODULE_MAPPING = {
  financial_approval: [
    "VimshottariDasha",
    "TransitSummary", 
    "RajYogaTiming",
    "NumerologyMoneyCycle"
  ],
  career_timing: [
    "RajYogaTiming",
    "TransitSummary",
    "VimshottariDasha",
    "StrengthYogas"
  ],
  compatibility: [
    "NatalComposite",
    "HouseOverlaps",
    "ElementalMatch",
    "SynastryScores"
  ],
  health_wellness: [
    "VimshottariDasha",
    "ChandraLagnaMoonWindows",
    "TransitSummary"
  ],
  travel_movement: [
    "ChandraLagnaMoonWindows",
    "TransitSummary",
    "VimshottariDasha"
  ],
  education_learning: [
    "VimshottariDasha",
    "TransitSummary",
    "StrengthYogas"
  ],
  general_guidance: [
    "TarotInsight",
    "AngelNumbers",
    "TransitSummary"
  ]
};

export function selectRelevantModules(intentSlots: IntentSlots): ModuleSelection {
  const { intent, domain, time_horizon, urgency } = intentSlots;
  
  // Get primary modules based on intent
  const primaryModuleNames = INTENT_MODULE_MAPPING[intent as keyof typeof INTENT_MODULE_MAPPING] || 
                            INTENT_MODULE_MAPPING.general_guidance;
  
  const primaryModules = primaryModuleNames
    .map(name => DIVINATION_MODULES.find(module => module.name === name))
    .filter(Boolean) as DivinationModule[];
  
  // Select secondary modules based on domain and timing
  const secondaryModules = DIVINATION_MODULES
    .filter(module => {
      // Don't include modules already in primary
      if (primaryModuleNames.includes(module.name)) return false;
      
      // Filter by domain relevance
      const domainMatch = module.domain.includes(domain);
      
      // Filter by timing relevance if timing is important
      const timingMatch = time_horizon && time_horizon !== 'long_term' ? 
                         module.timing_relevance : true;
      
      // Filter by urgency
      const urgencyMatch = urgency === 'high' ? 
                          module.confidence_weight > 0.7 : true;
      
      return domainMatch && timingMatch && urgencyMatch;
    })
    .sort((a, b) => b.confidence_weight - a.confidence_weight)
    .slice(0, 2); // Take top 2 secondary modules
  
  // Calculate overall confidence
  const primaryConfidence = primaryModules.reduce((sum, module) => 
    sum + module.confidence_weight, 0) / primaryModules.length;
  
  const secondaryConfidence = secondaryModules.length > 0 ? 
    secondaryModules.reduce((sum, module) => sum + module.confidence_weight, 0) / secondaryModules.length : 0;
  
  const overallConfidence = (primaryConfidence * 0.7) + (secondaryConfidence * 0.3);
  
  // Generate reasoning
  const reasoning = generateSelectionReasoning(intentSlots, primaryModules, secondaryModules);
  
  return {
    primary_modules: primaryModules,
    secondary_modules: secondaryModules,
    confidence_score: overallConfidence,
    reasoning
  };
}

function generateSelectionReasoning(
  intentSlots: IntentSlots, 
  primaryModules: DivinationModule[], 
  secondaryModules: DivinationModule[]
): string {
  const { intent, domain, time_horizon, urgency } = intentSlots;
  
  let reasoning = `Selected modules for ${intent} (${domain} domain): `;
  
  // Primary modules reasoning
  reasoning += `Primary: ${primaryModules.map(m => m.name).join(', ')} `;
  
  // Secondary modules reasoning
  if (secondaryModules.length > 0) {
    reasoning += `Secondary: ${secondaryModules.map(m => m.name).join(', ')} `;
  }
  
  // Add timing context
  if (time_horizon && time_horizon !== 'medium_term') {
    reasoning += `Timing focus: ${time_horizon} `;
  }
  
  // Add urgency context
  if (urgency === 'high') {
    reasoning += `High urgency - prioritizing high-confidence modules`;
  }
  
  return reasoning;
}

// Get module by name
export function getModuleByName(name: string): DivinationModule | undefined {
  return DIVINATION_MODULES.find(module => module.name === name);
}

// Get all available modules
export function getAllModules(): DivinationModule[] {
  return DIVINATION_MODULES;
}

// Test the tool selector
export function testToolSelection() {
  const testIntents = [
    {
      intent: "financial_approval",
      domain: "financial",
      time_horizon: "short_term",
      urgency: "high" as const,
      confidence_level: 0.8,
      entities: ["MSME", "December"],
      target: undefined,
      person: undefined
    },
    {
      intent: "compatibility",
      domain: "relationship",
      time_horizon: "long_term",
      urgency: "medium" as const,
      confidence_level: 0.9,
      entities: ["marriage"],
      target: undefined,
      person: undefined
    },
    {
      intent: "career_timing",
      domain: "career",
      time_horizon: "medium_term",
      urgency: "medium" as const,
      confidence_level: 0.7,
      entities: ["breakthrough"],
      target: undefined,
      person: undefined
    }
  ];
  
  testIntents.forEach(intentSlots => {
    const selection = selectRelevantModules(intentSlots);
    devLog.debug(`Intent: ${intentSlots.intent}`);
    devLog.debug(`Primary Modules: ${selection.primary_modules.map(m => m.name).join(', ')}`);
    devLog.debug(`Secondary Modules: ${selection.secondary_modules.map(m => m.name).join(', ')}`);
    devLog.debug(`Confidence: ${selection.confidence_score.toFixed(2)}`);
    devLog.debug(`Reasoning: ${selection.reasoning}`);
    devLog.debug('---');
  });
} 