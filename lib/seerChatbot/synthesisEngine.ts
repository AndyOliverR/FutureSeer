import { AggregatedEvidence } from './evidenceAggregator';
import { devLog } from '@/lib/devLogger';
import { IntentSlots } from './intentExtractor';

export interface SeerResponse {
  verdict: string;
  timing_window?: [string, string];
  confidence: number;
  support: Array<{
    module: string;
    summary: string;
    strength: number;
  }>;
  actions: string[];
  clarify?: string | null;
  primary_themes: string[];
  warnings: string[];
  conflicting_signals: boolean;
  source_badges: string[];
}

export interface SynthesisContext {
  user_query: string;
  intent_slots: IntentSlots;
  evidence: AggregatedEvidence;
  user_profile?: any;
}

// Example response for few-shot learning
const EXAMPLE_RESPONSE = {
  query: "Will the MSME grant arrive in December?",
  response: {
    verdict: "High probability (75-85%) of credit between Dec 2-4, 2025",
    timing_window: ["2025-12-02", "2025-12-04"],
    confidence: 0.8,
    support: [
      { module: "RajYoga", summary: "Active Aug2025-Feb2026 at 74%", strength: 0.9 },
      { module: "MoonTransit", summary: "11th-from-Moon window Dec 2-4", strength: 0.75 },
      { module: "Dasha", summary: "Mars Mahadasha with Jupiter bhukti favors institutional gain", strength: 0.85 }
    ],
    actions: ["Prepare final docs now", "Expect approval notice late Nov", "Check for SMS in first week of Dec"],
    clarify: null,
    primary_themes: ["Jupiter influence", "Mars Mahadasha", "Moon timing"],
    warnings: ["Mercury retrograde may affect communication"],
    conflicting_signals: false,
    source_badges: ["Raj Yoga", "Moon Transit", "Dasha"]
  }
};

export function generateSeerResponse(context: SynthesisContext): SeerResponse {
  const { user_query, intent_slots, evidence } = context;
  
  // Generate verdict based on evidence strength and timing
  const verdict = generateVerdict(intent_slots, evidence);
  
  // Extract timing window from evidence
  const timing_window = evidence.timing_consensus;
  
  // Calculate overall confidence
  const confidence = evidence.confidence_score;
  
  // Generate support array
  const support = evidence.sources.map(source => ({
    module: source.source,
    summary: generateModuleSummary(source),
    strength: source.strength
  }));
  
  // Generate actionable advice
  const actions = generateActions(intent_slots, evidence);
  
  // Check if clarification is needed
  const clarify = checkForClarification(intent_slots, evidence);
  
  // Extract source badges
  const source_badges = evidence.sources.map(source => source.source);
  
  return {
    verdict,
    timing_window,
    confidence,
    support,
    actions,
    clarify,
    primary_themes: evidence.primary_themes,
    warnings: evidence.warnings,
    conflicting_signals: evidence.conflicting_signals,
    source_badges
  };
}

function generateVerdict(intent_slots: IntentSlots, evidence: AggregatedEvidence): string {
  const { intent, domain, time_horizon } = intent_slots;
  const { overall_strength, timing_consensus, conflicting_signals } = evidence;
  
  // Convert strength to probability percentage
  const probability = Math.round(overall_strength * 100);
  
  // Generate probability descriptor
  let probabilityDesc = '';
  if (probability >= 80) probabilityDesc = 'Very high probability';
  else if (probability >= 65) probabilityDesc = 'High probability';
  else if (probability >= 50) probabilityDesc = 'Moderate probability';
  else if (probability >= 35) probabilityDesc = 'Low probability';
  else probabilityDesc = 'Very low probability';
  
  // Generate timing description
  let timingDesc = '';
  if (timing_consensus) {
    const [start, end] = timing_consensus;
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate.toDateString() === endDate.toDateString()) {
      timingDesc = `on ${startDate.toLocaleDateString()}`;
    } else {
      timingDesc = `between ${startDate.toLocaleDateString()} and ${endDate.toLocaleDateString()}`;
    }
  } else {
    switch (time_horizon) {
      case 'immediate': timingDesc = 'very soon'; break;
      case 'short_term': timingDesc = 'in the coming weeks'; break;
      case 'medium_term': timingDesc = 'in the next few months'; break;
      case 'long_term': timingDesc = 'in the coming year'; break;
      default: timingDesc = 'in due time'; break;
    }
  }
  
  // Generate domain-specific verdict
  let domainVerdict = '';
  switch (domain) {
    case 'financial':
      domainVerdict = conflicting_signals ? 
        `${probabilityDesc} (${probability}%) of financial approval ${timingDesc}` :
        `${probabilityDesc} (${probability}%) of financial success ${timingDesc}`;
      break;
    case 'career':
      domainVerdict = conflicting_signals ?
        `${probabilityDesc} (${probability}%) of career breakthrough ${timingDesc}` :
        `${probabilityDesc} (${probability}%) of career advancement ${timingDesc}`;
      break;
    case 'relationship':
      domainVerdict = conflicting_signals ?
        `${probabilityDesc} (${probability}%) of compatibility ${timingDesc}` :
        `${probabilityDesc} (${probability}%) of relationship success ${timingDesc}`;
      break;
    case 'health':
      domainVerdict = conflicting_signals ?
        `${probabilityDesc} (${probability}%) of health improvement ${timingDesc}` :
        `${probabilityDesc} (${probability}%) of wellness ${timingDesc}`;
      break;
    default:
      domainVerdict = `${probabilityDesc} (${probability}%) of positive outcome ${timingDesc}`;
  }
  
  return domainVerdict;
}

function generateModuleSummary(source: any): string {
  const { source: moduleName, primary_factors, strength } = source;
  
  // Generate concise summary based on module type
  switch (moduleName) {
    case 'VimshottariDasha':
      return `Dasha period favorable at ${Math.round(strength * 100)}% strength`;
    case 'TransitSummary':
      return `Current transits supportive at ${Math.round(strength * 100)}%`;
    case 'RajYogaTiming':
      return `Raj Yoga active at ${Math.round(strength * 100)}% strength`;
    case 'ChandraLagnaMoonWindows':
      return `Moon timing favorable at ${Math.round(strength * 100)}%`;
    case 'NumerologyMoneyCycle':
      return `Numerological cycle positive at ${Math.round(strength * 100)}%`;
    case 'NatalComposite':
      return `Composite chart favorable at ${Math.round(strength * 100)}%`;
    case 'TarotInsight':
      return `Tarot guidance positive at ${Math.round(strength * 100)}%`;
    default:
      return `${moduleName} indicates ${Math.round(strength * 100)}% favorable conditions`;
  }
}

function generateActions(intent_slots: IntentSlots, evidence: AggregatedEvidence): string[] {
  const { intent, domain, urgency } = intent_slots;
  const { warnings, timing_consensus } = evidence;
  
  const actions: string[] = [];
  
  // Domain-specific actions
  switch (domain) {
    case 'financial':
      actions.push("Prepare all required documentation");
      if (timing_consensus) {
        actions.push(`Submit application by ${new Date(timing_consensus[0]).toLocaleDateString()}`);
      }
      actions.push("Follow up with authorities regularly");
      break;
      
    case 'career':
      actions.push("Update your resume and portfolio");
      actions.push("Network actively in your field");
      if (timing_consensus) {
        actions.push(`Schedule important meetings around ${new Date(timing_consensus[0]).toLocaleDateString()}`);
      }
      break;
      
    case 'relationship':
      actions.push("Communicate openly with your partner");
      actions.push("Plan quality time together");
      if (timing_consensus) {
        actions.push(`Consider important relationship decisions around ${new Date(timing_consensus[0]).toLocaleDateString()}`);
      }
      break;
      
    case 'health':
      actions.push("Maintain a healthy lifestyle");
      actions.push("Consult with healthcare professionals");
      if (timing_consensus) {
        actions.push(`Schedule health checkups around ${new Date(timing_consensus[0]).toLocaleDateString()}`);
      }
      break;
      
    default:
      actions.push("Stay positive and focused");
      actions.push("Take consistent action toward your goals");
  }
  
  // Urgency-based actions
  if (urgency === 'high') {
    actions.unshift("Act immediately - timing is crucial");
  }
  
  // Warning-based actions
  if (warnings.length > 0) {
    actions.push("Be aware of potential challenges and plan accordingly");
  }
  
  return actions.slice(0, 4); // Limit to 4 actions
}

function checkForClarification(intent_slots: IntentSlots, evidence: AggregatedEvidence): string | null {
  const { entities, intent, domain } = intent_slots;
  const { confidence_score } = evidence;
  
  // Check for low confidence
  if (confidence_score < 0.5) {
    return "Could you provide more specific details about your question?";
  }
  
  // Check for missing entities based on intent
  switch (intent) {
    case 'compatibility':
      if (entities.length < 2) {
        return "Could you provide the birth details of both people for compatibility analysis?";
      }
      break;
      
    case 'financial_approval':
      if (!entities.some(e => ['loan', 'grant', 'credit', 'investment'].includes(e.toLowerCase()))) {
        return "What specific type of financial approval are you seeking?";
      }
      break;
      
    case 'career_timing':
      if (!entities.some(e => ['job', 'promotion', 'business', 'interview'].includes(e.toLowerCase()))) {
        return "What specific career opportunity are you asking about?";
      }
      break;
  }
  
  return null;
}

// Generate system prompt for LLM
export function generateSystemPrompt(context: SynthesisContext): string {
  const { user_query, intent_slots, evidence } = context;
  
  return `You are the Seer assistant, an AI-powered mystical advisor that combines ancient divination wisdom with modern analysis.

User Question: "${user_query}"

Intent Analysis:
- Intent: ${intent_slots.intent}
- Domain: ${intent_slots.domain}
- Time Horizon: ${intent_slots.time_horizon}
- Urgency: ${intent_slots.urgency}
- Confidence: ${intent_slots.confidence_level}

Evidence from Divination Modules:
${evidence.sources.map(source => `
${source.source} (${Math.round(source.strength * 100)}% strength):
- Factors: ${source.primary_factors.join(', ')}
- Warnings: ${source.warnings?.join(', ') || 'None'}
`).join('\n')}

Overall Analysis:
- Overall Strength: ${Math.round(evidence.overall_strength * 100)}%
- Confidence Score: ${Math.round(evidence.confidence_score * 100)}%
- Primary Themes: ${evidence.primary_themes.join(', ')}
- Warnings: ${evidence.warnings.join(', ') || 'None'}
- Conflicting Signals: ${evidence.conflicting_signals ? 'Yes' : 'No'}
${evidence.timing_consensus ? `- Timing Consensus: ${evidence.timing_consensus[0]} to ${evidence.timing_consensus[1]}` : ''}

Task:
1. Use common sense: do not assume unstated constraints; consider obvious alternatives before giving a verdict between two bad options; if critical information is missing, ask a clarifying question.
2. Provide a concise verdict with likelihood and timing
3. Explain key supporting factors from the evidence
4. State any risks or caveats
5. Suggest 2-3 concrete next actions

Format your response in a clear, mystical yet practical manner. Be specific about timing when available, and always acknowledge the source of your insights.

Example Response Format:
"🔮 Verdict: [Probability] of [outcome] [timing]
✨ Supporting Factors: [Key evidence points]
⚠️ Considerations: [Warnings/risks]
🎯 Recommended Actions: [Specific steps]
📊 Sources: [Module badges]"
`;
}

// Test the synthesis engine
export function testSynthesisEngine() {
  const mockEvidence: AggregatedEvidence = {
    sources: [
      {
        source: "RajYogaTiming",
        domain: "financial",
        strength: 0.90,
        timing_window: ["2025-08-01", "2026-02-28"],
        primary_factors: ["Jupiter exalted in 9th house", "Saturn in 11th house"],
        warnings: ["Early delay from retrograde planets"],
        confidence: 0.90,
        last_updated: new Date().toISOString()
      },
      {
        source: "TransitSummary",
        domain: "financial",
        strength: 0.75,
        timing_window: ["2025-12-02", "2025-12-04"],
        primary_factors: ["Jupiter in 11th house", "Venus trine Jupiter"],
        warnings: ["Mercury retrograde may affect communication"],
        confidence: 0.75,
        last_updated: new Date().toISOString()
      }
    ],
    overall_strength: 0.825,
    timing_consensus: ["2025-12-02", "2025-12-04"],
    primary_themes: ["Jupiter influence", "Venus trine Jupiter"],
    warnings: ["Early delay from retrograde planets", "Mercury retrograde may affect communication"],
    confidence_score: 0.825,
    conflicting_signals: false
  };
  
  const mockIntentSlots: IntentSlots = {
    intent: "financial_approval",
    domain: "financial",
    time_horizon: "short_term",
    urgency: "high",
    confidence_level: 0.8,
    entities: ["MSME", "December"],
    target: undefined,
    person: undefined
  };
  
  const context: SynthesisContext = {
    user_query: "Will the MSME grant arrive in December?",
    intent_slots: mockIntentSlots,
    evidence: mockEvidence
  };
  
  const response = generateSeerResponse(context);
  devLog.debug("Generated Response:");
  devLog.debug(JSON.stringify(response, null, 2));
  
  const systemPrompt = generateSystemPrompt(context);
  devLog.debug("\nSystem Prompt:");
  devLog.debug(systemPrompt);
} 