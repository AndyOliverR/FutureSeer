/* eslint-disable security/detect-non-literal-regexp */
/**
 * Human Design Report Generator
 * Generates personalized Human Design interpretations using AI
 */

import { HumanDesignChart } from './humanDesignCalculator';
import { devLog } from '@/lib/devLogger';
import { UserProfile } from '@/lib/firebase';
import { REPORT_VOICE_RULE } from '@/lib/reportVoiceRule';
import { callTextAI } from '@/lib/aiStructuredOutput';

export interface HumanDesignReport {
  overview: {
    summary: string;
    keyInsights: string[];
    personalMessage: string;
  };
  type: {
    description: string;
    strategy: string;
    notSelfTheme: string;
    practicalGuidance: string[];
  };
  authority: {
    description: string;
    decisionMaking: string;
    practicalTips: string[];
  };
  profile: {
    description: string;
    lifeRole: string;
    strengths: string[];
    challenges: string[];
  };
  centers: {
    defined: Array<{
      name: string;
      description: string;
      gifts: string[];
      challenges: string[];
    }>;
    undefined: Array<{
      name: string;
      description: string;
      wisdom: string[];
      conditioning: string[];
    }>;
  };
  gates: {
    overview: string;
    keyGates: Array<{
      gate: number;
      name: string;
      description: string;
      personalMeaning: string;
    }>;
  };
  channels: {
    overview: string;
    activeChannels: Array<{
      name: string;
      description: string;
      gifts: string[];
      expression: string;
    }>;
  };
  incarnationCross: {
    description: string;
    lifePurpose: string;
    expression: string[];
  };
  relationships: {
    overview: string;
    compatibility: string;
    advice: string[];
  };
  career: {
    overview: string;
    suitablePaths: string[];
    successFactors: string[];
  };
  personalGrowth: {
    overview: string;
    recommendations: string[];
    practices: string[];
  };
}

/**
 * Generate comprehensive Human Design report
 */
export async function generateHumanDesignReport(
  chart: HumanDesignChart,
  userProfile?: UserProfile | null
): Promise<HumanDesignReport> {
  // Keep fullName available for calculations if needed (never used in report text; reports use second person only)
  const fullName = userProfile?.fullName || userProfile?.displayName || '';
  
  // Generate AI-powered interpretations
  const aiReport = await generateAIReport(chart, userProfile);
  
  // Combine with structured data
  const finalReport: HumanDesignReport = {
    overview: {
      summary: aiReport.overview || generateOverviewSummary(chart),
      keyInsights: aiReport.keyInsights || generateKeyInsights(chart),
      personalMessage: aiReport.personalMessage || generatePersonalMessage(chart)
    },
    type: {
      description: aiReport.typeDescription || chart.type.description,
      strategy: chart.strategy,
      notSelfTheme: chart.type.notSelfTheme,
      practicalGuidance: aiReport.typeGuidance || generateTypeGuidance(chart.type.id)
    },
    authority: {
      description: aiReport.authorityDescription || chart.authority.description,
      decisionMaking: aiReport.decisionMaking || generateDecisionMakingGuidance(chart.authority.id),
      practicalTips: aiReport.authorityTips || generateAuthorityTips(chart.authority.id)
    },
    profile: {
      description: aiReport.profileDescription || chart.profile.description,
      lifeRole: chart.profile.role,
      strengths: aiReport.profileStrengths || generateProfileStrengths(chart.profile.id),
      challenges: aiReport.profileChallenges || generateProfileChallenges(chart.profile.id)
    },
    centers: {
      defined: generateDefinedCenters(chart.centers.defined, chart.centers.details),
      undefined: generateUndefinedCenters(chart.centers.undefined, chart.centers.details)
    },
    gates: {
      overview: aiReport.gatesOverview || generateGatesOverview(chart.gates),
      keyGates: generateKeyGates(chart.gates)
    },
    channels: {
      overview: aiReport.channelsOverview || generateChannelsOverview(chart.channels),
      activeChannels: generateActiveChannels(chart.channels)
    },
    incarnationCross: {
      description: aiReport.incarnationCrossDescription || chart.incarnationCross.description,
      lifePurpose: aiReport.lifePurpose || generateLifePurpose(chart.incarnationCross),
      expression: aiReport.incarnationExpression || generateIncarnationExpression(chart.incarnationCross)
    },
    relationships: {
      overview: aiReport.relationshipsOverview || generateRelationshipsOverview(chart),
      compatibility: aiReport.compatibility || generateCompatibility(chart),
      advice: aiReport.relationshipAdvice || generateRelationshipAdvice(chart)
    },
    career: {
      overview: aiReport.careerOverview || generateCareerOverview(chart),
      suitablePaths: aiReport.careerPaths || generateCareerPaths(chart),
      successFactors: aiReport.successFactors || generateSuccessFactors(chart)
    },
    personalGrowth: {
      overview: aiReport.growthOverview || generateGrowthOverview(chart),
      recommendations: aiReport.growthRecommendations || generateGrowthRecommendations(chart),
      practices: aiReport.growthPractices || generateGrowthPractices(chart)
    }
  };

  // Final safety check: ensure no user name appears in overview (second person only)
  if (userProfile?.fullName || userProfile?.displayName) {
    const names = [userProfile.fullName, userProfile.displayName].filter(Boolean) as string[];
    for (const n of [...new Set(names)]) {
      if (!n?.trim()) continue;
      const re = new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (finalReport.overview.personalMessage) {
        finalReport.overview.personalMessage = finalReport.overview.personalMessage.replace(re, '').replace(/\b(Dear|Beloved)\s*,?\s*/gi, '').trim();
      }
      if (finalReport.overview.summary) {
        finalReport.overview.summary = finalReport.overview.summary.replace(re, '').replace(/\b(Dear|Beloved)\s*,?\s*/gi, '').trim();
      }
    }
  }

  return finalReport;
}

/**
 * Generate AI-powered report using OpenAI
 */
async function generateAIReport(
  chart: HumanDesignChart,
  userProfile?: UserProfile | null
): Promise<any> {
  try {
    // Build question: second person only; no user name in report
    const question = `Generate a comprehensive, personalized Human Design interpretation. ${REPORT_VOICE_RULE} Write as if FutureSeer has analyzed the chart and is speaking directly to the user.`;
    
    const result = await callTextAI({
      label: 'human-design-report',
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      maxTokens: 2400,
      maxAttempts: 2,
      messages: [
        {
          role: 'system',
          content:
            'You are a Human Design expert for FutureSeer. Return concise structured sections for overview, key insights, type, authority, profile, relationships, career, and growth. Use second person voice only. Never include the user name.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            question,
            chart: {
              type: chart.type.name,
              strategy: chart.strategy,
              authority: chart.authority.name,
              profile: chart.profile.name,
              definedCenters: chart.centers.defined,
              undefinedCenters: chart.centers.undefined,
              activeGates: chart.gates.map((g) => g.gate),
              activeChannels: chart.channels.map((c) => c.name),
              incarnationCross: chart.incarnationCross.name,
              definition: chart.definition.type,
            },
            symbolicData: {
              primarySymbol: '🧬',
              elementalInfluence: chart.type.name,
              cosmicAlignment: chart.definition.type,
              timing: 'Present moment',
            },
            userId: userProfile?.uid,
          }),
        },
      ],
    });
    const aiResponse = result.content;
    
    // Post-process: Remove any user name from response (reports must not contain the user's name)
    let cleanedResponse = aiResponse;
    if (userProfile?.fullName || userProfile?.displayName) {
      const names = [userProfile.fullName, userProfile.displayName].filter(Boolean) as string[];
      const uniqueNames = [...new Set(names)];
      for (const n of uniqueNames) {
        if (!n.trim()) continue;
        const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`\\b${escaped}\\b`, 'gi');
        cleanedResponse = cleanedResponse.replace(re, '');
      }
      cleanedResponse = cleanedResponse.replace(/\b(Dear|Beloved)\s*,?\s*/gi, '').trim();
    }
    
    const parsedResponse = parseAIResponse(cleanedResponse);
    parsedResponse._provider = 'groq';
    parsedResponse._model = 'llama-3.3-70b-versatile';
    
    // Post-process each extracted field to remove any user name
    return cleanAIResponseFields(parsedResponse, userProfile);
  } catch (error) {
    devLog.error('Error generating AI report:', error, 'humanDesignReportGenerator');
    return {};
  }
}

/**
 * Parse AI response into structured format
 */
function parseAIResponse(response: string): any {
  // Simple parsing - extract key sections
  return {
    overview: extractSection(response, 'overview', 'summary'),
    keyInsights: extractList(response, 'key insights', 'insights'),
    personalMessage: extractSection(response, 'personal message', 'message'),
    typeDescription: extractSection(response, 'type', 'description'),
    authorityDescription: extractSection(response, 'authority', 'description'),
    profileDescription: extractSection(response, 'profile', 'description'),
    decisionMaking: extractSection(response, 'decision making', 'decision'),
    lifePurpose: extractSection(response, 'life purpose', 'purpose'),
    relationshipsOverview: extractSection(response, 'relationships', 'relationships'),
    careerOverview: extractSection(response, 'career', 'career'),
    growthOverview: extractSection(response, 'personal growth', 'growth')
  };
}

function extractSection(text: string, ...keywords: string[]): string {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[:\\s]+([^\\n]+)`, 'i');
    const match = text.match(regex);
    if (match) return match[1].trim();
  }
  return '';
}

function extractList(text: string, ...keywords: string[]): string[] {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[:\\s]+([^\\n]+(?:\\n[^\\n]+)*)`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[1].split('\n').map(s => s.trim()).filter(s => s.length > 0);
    }
  }
  return [];
}

/**
 * Clean AI response fields: remove any user name so the report never contains the user's name.
 */
function cleanAIResponseFields(aiResponse: any, userProfile?: UserProfile | null): any {
  if (!userProfile?.fullName && !userProfile?.displayName) {
    return aiResponse;
  }

  const names = [userProfile.fullName, userProfile.displayName].filter(Boolean) as string[];
  const uniqueNames = [...new Set(names)];

  const stripNames = (s: string): string => {
    let out = s;
    for (const n of uniqueNames) {
      if (!n.trim()) continue;
      const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      out = out.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), '');
    }
    return out.replace(/\b(Dear|Beloved)\s*,?\s*/gi, '').trim();
  };

  const cleaned: any = {};
  for (const key in aiResponse) {
    if (typeof aiResponse[key] === 'string') {
      cleaned[key] = stripNames(aiResponse[key]);
    } else if (Array.isArray(aiResponse[key])) {
      cleaned[key] = aiResponse[key].map((item: any) =>
        typeof item === 'string' ? stripNames(item) : item
      );
    } else {
      cleaned[key] = aiResponse[key];
    }
  }
  return cleaned;
}

// Fallback generators (second person only; no user name in report)
function generateOverviewSummary(chart: HumanDesignChart): string {
  return `Your Human Design reveals a ${chart.type.name} with ${chart.authority.name}. Your ${chart.profile.name} profile guides your life role, and your ${chart.incarnationCross.name} illuminates your unique purpose. You have ${chart.centers.defined.length} defined centers and ${chart.centers.undefined.length} undefined centers, creating a ${chart.definition.type} definition that shapes how you experience energy.`;
}

function generateKeyInsights(chart: HumanDesignChart): string[] {
  return [
    `Your Strategy: ${chart.strategy}`,
    `Your Authority: ${chart.authority.name} - ${chart.authority.description}`,
    `Your Profile: ${chart.profile.name} - ${chart.profile.description}`,
    `Your Definition: ${chart.definition.type} - ${chart.definition.description}`
  ];
}

function generatePersonalMessage(chart: HumanDesignChart): string {
  return `You are designed to ${chart.type.description.toLowerCase()}. Trust your ${chart.authority.name.toLowerCase()} to guide your decisions. Your ${chart.profile.name} profile shows you are here to ${chart.profile.role.toLowerCase()}. Embrace your authentic nature and live according to your design.`;
}

function generateTypeGuidance(typeId: string): string[] {
  const guidance: Record<string, string[]> = {
    manifestor: [
      'Inform others before taking action',
      'Honor your need for independence',
      'Recognize when you feel anger (your not-self theme)',
      'Take time to rest between actions'
    ],
    generator: [
      'Wait to respond to life',
      'Trust your sacral responses (uh-huh/uh-uh)',
      'Recognize when you feel frustration (your not-self theme)',
      'Follow what excites you'
    ],
    projector: [
      'Wait for invitations',
      'Recognize when you feel bitterness (your not-self theme)',
      'Share your wisdom with those who invite you',
      'Rest and recharge regularly'
    ],
    reflector: [
      'Wait a full lunar cycle (28 days) before major decisions',
      'Recognize when you feel disappointment (your not-self theme)',
      'Surround yourself with healthy people',
      'Sample different experiences before committing'
    ]
  };
  return guidance[typeId] || [];
}

function generateDecisionMakingGuidance(authorityId: string): string {
  const guidance: Record<string, string> = {
    emotional: 'Wait for emotional clarity. Experience the full emotional wave before deciding.',
    sacral: 'Respond with your gut. Trust your immediate "uh-huh" or "uh-uh" sounds.',
    splenic: 'Trust your first instinct. Make decisions in the moment based on immediate knowing.',
    self_projected: 'Speak to know. Talk through decisions to hear your truth.',
    ego: 'Wait for clarity about what you want. Make decisions from your willpower center.',
    environmental: 'Wait a full lunar cycle (28 days) to make major decisions.',
    lunar: 'Wait a full lunar cycle to make decisions. Reflect on options over 28 days.'
  };
  return guidance[authorityId] || 'Trust your inner guidance.';
}

function generateAuthorityTips(authorityId: string): string[] {
  const tips: Record<string, string[]> = {
    emotional: [
      'Notice your emotional waves',
      'Wait for clarity after the wave passes',
      'Don\'t make decisions at the peak of emotion',
      'Trust the process of emotional clarity'
    ],
    sacral: [
      'Listen to your body sounds',
      'Respond to what life brings you',
      'Trust your immediate responses',
      'Honor your energy levels'
    ],
    splenic: [
      'Trust your first instinct',
      'Act on immediate knowing',
      'Don\'t overthink',
      'Honor your survival intuition'
    ]
  };
  return tips[authorityId] || ['Trust your inner guidance', 'Wait for clarity', 'Honor your process'];
}

function generateProfileStrengths(profileId: string): string[] {
  const strengths: Record<string, string[]> = {
    '1/3': ['Investigative nature', 'Learning through experience', 'Resilience', 'Practical wisdom'],
    '1/4': ['Investigative depth', 'Network building', 'Sharing discoveries', 'Natural authority'],
    '2/4': ['Natural talents', 'Network opportunities', 'Emergent wisdom', 'Social connections'],
    '2/5': ['Natural talents', 'Universal projection', 'Teaching ability', 'Natural authority'],
    '3/5': ['Trial and error learning', 'Universal solutions', 'Teaching through experience', 'Practical wisdom'],
    '3/6': ['Trial and error learning', 'Role modeling', 'Life experience', 'Wisdom sharing'],
    '4/1': ['Network building', 'Investigative depth', 'Sharing opportunities', 'Truth seeking'],
    '4/6': ['Network building', 'Role modeling', 'Opportunity sharing', 'Life wisdom'],
    '5/1': ['Universal solutions', 'Investigative depth', 'Teaching ability', 'Truth seeking'],
    '5/2': ['Universal solutions', 'Natural talents', 'Teaching ability', 'Practical wisdom'],
    '6/2': ['Role modeling', 'Natural talents', 'Life wisdom', 'Teaching ability'],
    '6/3': ['Role modeling', 'Trial and error learning', 'Life experience', 'Wisdom sharing']
  };
  return strengths[profileId] || ['Unique gifts', 'Personal strengths', 'Life wisdom'];
}

function generateProfileChallenges(profileId: string): string[] {
  const challenges: Record<string, string[]> = {
    '1/3': ['Tendency to make mistakes', 'Need for experience', 'Trial and error process', 'Learning through failure'],
    '1/4': ['Need for investigation', 'Network dependency', 'Sharing pressure', 'Authority challenges'],
    '2/4': ['Hidden talents', 'Waiting for recognition', 'Network dependency', 'Emergence timing'],
    '2/5': ['Hidden talents', 'Projection pressure', 'Expectation management', 'Authority challenges'],
    '3/5': ['Trial and error process', 'Projection pressure', 'Expectation management', 'Learning through mistakes'],
    '3/6': ['Trial and error process', 'Role model pressure', 'Life experience needed', 'Wisdom development'],
    '4/1': ['Network dependency', 'Investigation pressure', 'Sharing expectations', 'Truth seeking challenges'],
    '4/6': ['Network dependency', 'Role model pressure', 'Sharing expectations', 'Life wisdom development'],
    '5/1': ['Projection pressure', 'Investigation pressure', 'Teaching expectations', 'Truth seeking challenges'],
    '5/2': ['Projection pressure', 'Hidden talents', 'Teaching expectations', 'Talent recognition'],
    '6/2': ['Role model pressure', 'Hidden talents', 'Life wisdom development', 'Talent recognition'],
    '6/3': ['Role model pressure', 'Trial and error process', 'Life experience needed', 'Wisdom development']
  };
  return challenges[profileId] || ['Personal growth areas', 'Life lessons', 'Development opportunities'];
}

function generateDefinedCenters(defined: string[], details: Record<string, any>): any[] {
  return defined.map(centerId => ({
    name: details[centerId]?.name || centerId,
    description: details[centerId]?.description || '',
    gifts: generateCenterGifts(centerId),
    challenges: generateCenterChallenges(centerId)
  }));
}

function generateUndefinedCenters(undefined: string[], details: Record<string, any>): any[] {
  return undefined.map(centerId => ({
    name: details[centerId]?.name || centerId,
    description: details[centerId]?.description || '',
    wisdom: generateCenterWisdom(centerId),
    conditioning: generateCenterConditioning(centerId)
  }));
}

function generateCenterGifts(centerId: string): string[] {
  const gifts: Record<string, string[]> = {
    head: ['Inspiration', 'Mental clarity', 'Ideas generation'],
    ajna: ['Mental awareness', 'Conceptualization', 'Understanding'],
    throat: ['Communication', 'Manifestation', 'Expression'],
    g: ['Identity', 'Love', 'Direction'],
    heart: ['Willpower', 'Ego strength', 'Courage'],
    solar_plexus: ['Emotional awareness', 'Feelings', 'Emotional intelligence'],
    sacral: ['Life force', 'Work energy', 'Vitality'],
    root: ['Adrenaline', 'Pressure to evolve', 'Drive'],
    spleen: ['Intuition', 'Health awareness', 'Survival instinct']
  };
  return gifts[centerId] || ['Unique gifts'];
}

function generateCenterChallenges(centerId: string): string[] {
  const challenges: Record<string, string[]> = {
    head: ['Mental pressure', 'Overthinking', 'Inspiration pressure'],
    ajna: ['Mental pressure', 'Certainty pressure', 'Understanding pressure'],
    throat: ['Expression pressure', 'Communication pressure', 'Manifestation pressure'],
    g: ['Identity confusion', 'Love seeking', 'Direction seeking'],
    heart: ['Ego pressure', 'Willpower pressure', 'Proving pressure'],
    solar_plexus: ['Emotional waves', 'Emotional pressure', 'Feeling pressure'],
    sacral: ['Work pressure', 'Energy pressure', 'Response pressure'],
    root: ['Adrenaline pressure', 'Evolution pressure', 'Drive pressure'],
    spleen: ['Health anxiety', 'Survival fear', 'Intuition pressure']
  };
  return challenges[centerId] || ['Personal challenges'];
}

function generateCenterWisdom(centerId: string): string[] {
  const wisdom: Record<string, string[]> = {
    head: ['Learn from others\' inspiration', 'Don\'t take mental pressure personally', 'Sample different ideas'],
    ajna: ['Learn from others\' certainty', 'Don\'t take mental pressure personally', 'Sample different perspectives'],
    throat: ['Learn from others\' expression', 'Don\'t take communication pressure personally', 'Sample different ways of speaking'],
    g: ['Learn from others\' identity', 'Don\'t take love seeking personally', 'Sample different directions'],
    heart: ['Learn from others\' willpower', 'Don\'t take ego pressure personally', 'Sample different ways of proving'],
    solar_plexus: ['Learn from others\' emotions', 'Don\'t take emotional waves personally', 'Sample different emotional experiences'],
    sacral: ['Learn from others\' energy', 'Don\'t take work pressure personally', 'Sample different activities'],
    root: ['Learn from others\' drive', 'Don\'t take adrenaline pressure personally', 'Sample different pressures'],
    spleen: ['Learn from others\' intuition', 'Don\'t take health anxiety personally', 'Sample different health approaches']
  };
  return wisdom[centerId] || ['Learn from others', 'Sample experiences', 'Gain wisdom'];
}

function generateCenterConditioning(centerId: string): string[] {
  const conditioning: Record<string, string[]> = {
    head: ['Taking on others\' mental pressure', 'Feeling responsible for inspiration', 'Overthinking'],
    ajna: ['Taking on others\' certainty', 'Feeling responsible for understanding', 'Mental pressure'],
    throat: ['Taking on others\' expression', 'Feeling responsible for communication', 'Expression pressure'],
    g: ['Taking on others\' identity', 'Feeling responsible for love', 'Direction seeking'],
    heart: ['Taking on others\' willpower', 'Feeling responsible for proving', 'Ego pressure'],
    solar_plexus: ['Taking on others\' emotions', 'Feeling responsible for feelings', 'Emotional pressure'],
    sacral: ['Taking on others\' energy', 'Feeling responsible for work', 'Work pressure'],
    root: ['Taking on others\' drive', 'Feeling responsible for pressure', 'Adrenaline pressure'],
    spleen: ['Taking on others\' health', 'Feeling responsible for survival', 'Health anxiety']
  };
  return conditioning[centerId] || ['Conditioning patterns', 'External influences', 'Learning opportunities'];
}

function generateGatesOverview(gates: any[]): string {
  return `You have ${gates.length} active gates in your chart, each representing a specific I Ching hexagram energy that influences your design. These gates activate the centers they reside in and create channels when connected.`;
}

function generateKeyGates(gates: any[]): any[] {
  // Get top 5 most significant gates (Sun, Moon, Nodes, etc.)
  const priorityPlanets = ['Sun', 'Moon', 'NorthNode', 'SouthNode', 'Mercury', 'Venus', 'Mars'];
  const keyGates = gates
    .filter(g => priorityPlanets.includes(g.planet))
    .slice(0, 5)
    .map(gate => ({
      gate: gate.gate,
      name: `Gate ${gate.gate}`,
      description: `Gate ${gate.gate} represents...`,
      personalMeaning: `Your ${gate.planet} in Gate ${gate.gate} influences...`
    }));
  return keyGates;
}

function generateChannelsOverview(channels: any[]): string {
  return `You have ${channels.length} active channels in your chart, creating consistent connections between centers. These channels represent your natural talents and consistent ways of expressing energy.`;
}

function generateActiveChannels(channels: any[]): any[] {
  return channels.map(channel => ({
    name: channel.name,
    description: channel.description,
    gifts: [`Natural talent in ${channel.name}`, 'Consistent expression', 'Reliable energy'],
    expression: `You naturally express ${channel.name} energy through...`
  }));
}

function generateLifePurpose(incarnationCross: any): string {
  return `Your Incarnation Cross reveals your life purpose: ${incarnationCross.description}. You are here to express the energy of Gate ${incarnationCross.sunGate} and Gate ${incarnationCross.earthGate}.`;
}

function generateIncarnationExpression(incarnationCross: any): string[] {
  return [
    `Express Gate ${incarnationCross.sunGate} energy`,
    `Ground through Gate ${incarnationCross.earthGate} energy`,
    'Live your unique purpose',
    'Share your gifts with the world'
  ];
}

function generateRelationshipsOverview(chart: HumanDesignChart): string {
  return `As a ${chart.type.name}, your relationships are influenced by your ${chart.authority.name} and ${chart.profile.name} profile. Your ${chart.definition.type} definition affects how you connect with others.`;
}

function generateCompatibility(chart: HumanDesignChart): string {
  return `Your design works well with others who complement your ${chart.definition.type} definition. ${chart.type.name}s often connect well with other types who respect their strategy and authority.`;
}

function generateRelationshipAdvice(chart: HumanDesignChart): string[] {
  return [
    `Honor your ${chart.strategy} in relationships`,
    `Use your ${chart.authority.name} to make relationship decisions`,
    `Recognize your ${chart.type.notSelfTheme} as a sign of not living your design`,
    'Respect others\' designs and strategies'
  ];
}

function generateCareerOverview(chart: HumanDesignChart): string {
  return `Your ${chart.type.name} design and ${chart.profile.name} profile guide your career path. Your active channels reveal natural talents, and your ${chart.authority.name} shows how to make career decisions.`;
}

function generateCareerPaths(chart: HumanDesignChart): string[] {
  const paths: string[] = [];
  if (chart.channels.length > 0) {
    paths.push(`Paths aligned with your ${chart.channels[0].name} channel`);
  }
  paths.push(`Careers that honor your ${chart.type.strategy}`);
  paths.push(`Work that uses your ${chart.profile.name} profile strengths`);
  return paths;
}

function generateSuccessFactors(chart: HumanDesignChart): string[] {
  return [
    `Follow your ${chart.strategy}`,
    `Trust your ${chart.authority.name}`,
    `Honor your ${chart.profile.name} profile`,
    'Work with your definition, not against it'
  ];
}

function generateGrowthOverview(chart: HumanDesignChart): string {
  return `Your personal growth journey involves living your ${chart.type.name} design authentically, trusting your ${chart.authority.name}, and expressing your ${chart.profile.name} profile.`;
}

function generateGrowthRecommendations(chart: HumanDesignChart): string[] {
  return [
    `Practice your ${chart.strategy} daily`,
    `Learn to recognize your ${chart.type.notSelfTheme}`,
    `Develop trust in your ${chart.authority.name}`,
    'Experiment with living your design',
    'Surround yourself with people who honor your design'
  ];
}

function generateGrowthPractices(chart: HumanDesignChart): string[] {
  return [
    'Daily meditation on your design',
    'Journaling about your strategy and authority',
    'Observing when you\'re in your not-self theme',
    'Practicing your strategy in small decisions',
    'Learning about your defined and undefined centers'
  ];
}

