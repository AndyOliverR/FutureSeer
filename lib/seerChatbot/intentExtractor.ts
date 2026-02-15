import { devLog } from '@/lib/devLogger';

export interface IntentSlots {
  intent: string;
  domain: string;
  target?: string;
  time_horizon?: string;
  person?: string;
  confidence_level: number;
  entities: string[];
  urgency: 'low' | 'medium' | 'high';
}

export interface QueryAnalysis {
  original_query: string;
  slots: IntentSlots;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

// Intent patterns and keywords
const INTENT_PATTERNS = {
  financial_approval: {
    keywords: ['grant', 'loan', 'credit', 'approval', 'money', 'funding', 'financial', 'bank', 'msme', 'investment'],
    domain: 'financial',
    time_indicators: ['when', 'timing', 'arrive', 'receive', 'approve']
  },
  career_timing: {
    keywords: ['job', 'career', 'promotion', 'interview', 'opportunity', 'work', 'business', 'success', 'breakthrough'],
    domain: 'career',
    time_indicators: ['when', 'timing', 'opportunity', 'breakthrough', 'success']
  },
  compatibility: {
    keywords: ['compatibility', 'relationship', 'love', 'marriage', 'partner', 'romance', 'connection', 'match'],
    domain: 'relationship',
    time_indicators: ['compatible', 'match', 'relationship', 'future']
  },
  health_wellness: {
    keywords: ['health', 'wellness', 'healing', 'recovery', 'medical', 'treatment', 'energy', 'vitality'],
    domain: 'health',
    time_indicators: ['recovery', 'healing', 'improvement', 'timing']
  },
  travel_movement: {
    keywords: ['travel', 'journey', 'movement', 'relocation', 'trip', 'foreign', 'abroad', 'migration'],
    domain: 'travel',
    time_indicators: ['when', 'timing', 'journey', 'travel']
  },
  education_learning: {
    keywords: ['education', 'study', 'learning', 'exam', 'course', 'degree', 'knowledge', 'academic'],
    domain: 'education',
    time_indicators: ['exam', 'result', 'success', 'timing']
  }
};

// Time horizon patterns
const TIME_PATTERNS = {
  immediate: ['now', 'today', 'immediate', 'urgent', 'asap', 'quick'],
  short_term: ['this week', 'this month', 'soon', 'next week', 'next month', 'few days', 'few weeks'],
  medium_term: ['next 3 months', 'quarter', 'next few months', 'this year'],
  long_term: ['next year', 'future', 'long term', 'next 6 months', 'next year']
};

export function extractIntentAndSlots(query: string): QueryAnalysis {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/);
  
  // Extract intent
  let bestIntent = 'general_guidance';
  let bestConfidence = 0.3;
  let detectedDomain = 'general';
  
  for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
    const keywordMatches = pattern.keywords.filter(keyword => 
      lowerQuery.includes(keyword)
    ).length;
    
    const timeMatches = pattern.time_indicators.filter(indicator => 
      lowerQuery.includes(indicator)
    ).length;
    
    const confidence = (keywordMatches * 0.4) + (timeMatches * 0.3);
    
    if (confidence > bestConfidence) {
      bestIntent = intent;
      bestConfidence = confidence;
      detectedDomain = pattern.domain;
    }
  }
  
  // Extract time horizon
  let timeHorizon = 'medium_term';
  for (const [horizon, patterns] of Object.entries(TIME_PATTERNS)) {
    if (patterns.some(pattern => lowerQuery.includes(pattern))) {
      timeHorizon = horizon;
      break;
    }
  }
  
  // Extract urgency
  let urgency: 'low' | 'medium' | 'high' = 'medium';
  if (lowerQuery.includes('urgent') || lowerQuery.includes('asap') || lowerQuery.includes('emergency')) {
    urgency = 'high';
  } else if (lowerQuery.includes('when') || lowerQuery.includes('timing')) {
    urgency = 'medium';
  } else {
    urgency = 'low';
  }
  
  // Extract entities (names, dates, specific terms)
  const entities = extractEntities(lowerQuery);
  
  // Determine sentiment
  const sentiment = analyzeSentiment(lowerQuery);
  
  const slots: IntentSlots = {
    intent: bestIntent,
    domain: detectedDomain,
    time_horizon: timeHorizon,
    confidence_level: Math.min(bestConfidence, 0.95),
    entities,
    urgency
  };
  
  return {
    original_query: query,
    slots,
    keywords: words.filter(word => word.length > 3),
    sentiment
  };
}

function extractEntities(query: string): string[] {
  const entities: string[] = [];
  
  // Extract potential names (capitalized words)
  const nameMatches = query.match(/\b[A-Z][a-z]+\b/g);
  if (nameMatches) {
    entities.push(...nameMatches);
  }
  
  // Extract dates
  const dateMatches = query.match(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g);
  if (dateMatches) {
    entities.push(...dateMatches);
  }
  
  // Extract months
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                  'july', 'august', 'september', 'october', 'november', 'december'];
  const monthMatches = months.filter(month => query.includes(month));
  entities.push(...monthMatches);
  
  return entities;
}

function analyzeSentiment(query: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['success', 'good', 'positive', 'favorable', 'beneficial', 'lucky', 'fortune'];
  const negativeWords = ['problem', 'issue', 'difficulty', 'challenge', 'obstacle', 'delay', 'failure'];
  
  const positiveCount = positiveWords.filter(word => query.includes(word)).length;
  const negativeCount = negativeWords.filter(word => query.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// Example usage and testing
export function testIntentExtraction() {
  const testQueries = [
    "Will the MSME grant arrive in December?",
    "When is the best time for my career breakthrough?",
    "Are we compatible for marriage?",
    "When should I travel abroad for business?",
    "Will my health improve this month?"
  ];
  
  testQueries.forEach(query => {
    const analysis = extractIntentAndSlots(query);
    devLog.debug(`Query: "${query}"`);
    devLog.debug(`Intent: ${analysis.slots.intent} (${analysis.slots.confidence_level})`);
    devLog.debug(`Domain: ${analysis.slots.domain}`);
    devLog.debug(`Time Horizon: ${analysis.slots.time_horizon}`);
    devLog.debug(`Urgency: ${analysis.slots.urgency}`);
    devLog.debug(`Sentiment: ${analysis.sentiment}`);
    devLog.debug('---');
  });
} 