// Vedic Seer Prompt Templates and Question Handlers
// Specialized prompts for different types of Vedic astrology questions

import type { VedicQuestionType } from '@/lib/vedicSeerState';

export interface VedicQuestionContext {
  userProfile: {
    fullName: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
  };
  vedicChart: {
    ascendant: {
      sign: string;
      degree: number;
      signName: string;
    };
    planets: { [key: string]: any };
    houses: { [key: string]: any };
    currentDasha: {
      mahadasha: string;
      antardasha: string;
      startDate: string;
      endDate: string;
      progress: number;
      planet?: string;
      antardashas?: Array<{ planet?: string; progress?: number }>;
    };
    yogas: Array<{
      name: string;
      description: string;
      strength: string;
    }>;
    transits: {
      favorable: string[];
      challenging: string[];
    };
    chartRuler: {
      planet: string;
      sign: string;
      house: number;
    };
  };
  conversationHistory: Array<{
    question: string;
    answer: string;
    timestamp: number;
  }>;
}

export const VEDIC_QUESTION_TYPES = {
  MARRIAGE: 'marriage',
  CAREER: 'career',
  BUSINESS: 'business',
  WEALTH: 'wealth',
  HEALTH: 'health',
  CHILDREN: 'children',
  SPIRITUAL: 'spiritual',
  KARMIC: 'karmic',
  RELOCATION: 'relocation',
  TIMING: 'timing',
  DASHA: 'dasha',
  YOGA: 'yoga',
  LIFE_PURPOSE: 'life_purpose',
  EXISTENTIAL: 'existential',
  MEANING: 'meaning',
  CONTROL: 'control',
  TRANSFORMATION: 'transformation',
  GENERAL: 'general'
} as const;

export function analyzeQuestionType(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  // LIFE PURPOSE - Highest priority for existential questions
  if (/life.*purpose|why.*born|soul.*mission|destiny|calling|meant.*to.*do/.test(lowerQuestion)) {
    return VEDIC_QUESTION_TYPES.LIFE_PURPOSE;
  }
  
  // EXISTENTIAL - Deep meaning questions
  if (/meaning.*life|why.*exist|what.*point|understand.*myself|who.*am.*i/.test(lowerQuestion)) {
    return VEDIC_QUESTION_TYPES.EXISTENTIAL;
  }
  
  // MEANING - Pattern seeking, making sense
  if (/why.*happening|what.*means|understand.*why|make.*sense|pattern/.test(lowerQuestion)) {
    return VEDIC_QUESTION_TYPES.MEANING;
  }
  
  // CONTROL - Agency and security
  if (/control|power|influence|change.*fate|avoid|prevent|protect/.test(lowerQuestion)) {
    return VEDIC_QUESTION_TYPES.CONTROL;
  }
  
  // TRANSFORMATION - Growth and change
  if (/transform|grow|evolve|become|develop|improve.*myself|inner.*change/.test(lowerQuestion)) {
    return VEDIC_QUESTION_TYPES.TRANSFORMATION;
  }
  
  // TIMING - Check for years (high priority)
  if (/\b(20\d{2})\b/.test(question) || /when.*will.*\d{4}/.test(lowerQuestion)) {
    return VEDIC_QUESTION_TYPES.TIMING;
  }
  
  // BUSINESS - Before career
  if (/business|entrepreneur|startup|company|venture|enterprise|profit|investment/.test(lowerQuestion)) {
    return VEDIC_QUESTION_TYPES.BUSINESS;
  }
  
  // WEALTH - Money without career context
  if (/(make|earn|get).*money|wealth|rich|financial.*success/.test(lowerQuestion) && 
      !/career|job|promotion|work/.test(lowerQuestion)) {
    return VEDIC_QUESTION_TYPES.WEALTH;
  }
  
  // Marriage & Relationships
  if (lowerQuestion.includes('marriage') || lowerQuestion.includes('spouse') || 
      lowerQuestion.includes('partner') || lowerQuestion.includes('wedding') ||
      lowerQuestion.includes('relationship') || lowerQuestion.includes('compatibility')) {
    return VEDIC_QUESTION_TYPES.MARRIAGE;
  }
  
  // Career & Finances (only if not business/wealth)
  if (lowerQuestion.includes('career') || lowerQuestion.includes('job') || 
      lowerQuestion.includes('work') || lowerQuestion.includes('promotion') ||
      lowerQuestion.includes('money') || lowerQuestion.includes('wealth') ||
      lowerQuestion.includes('financial')) {
    return VEDIC_QUESTION_TYPES.CAREER;
  }
  
  // Health
  if (lowerQuestion.includes('health') || lowerQuestion.includes('illness') ||
      lowerQuestion.includes('disease') || lowerQuestion.includes('medical') ||
      lowerQuestion.includes('sick') || lowerQuestion.includes('wellness')) {
    return VEDIC_QUESTION_TYPES.HEALTH;
  }
  
  // Children
  if (lowerQuestion.includes('children') || lowerQuestion.includes('child') ||
      lowerQuestion.includes('pregnancy') || lowerQuestion.includes('conceive') ||
      lowerQuestion.includes('fertility') || lowerQuestion.includes('offspring')) {
    return VEDIC_QUESTION_TYPES.CHILDREN;
  }
  
  // Spiritual
  if (lowerQuestion.includes('spiritual') || lowerQuestion.includes('spirituality') ||
      lowerQuestion.includes('meditation') || lowerQuestion.includes('prayer') ||
      lowerQuestion.includes('god') || lowerQuestion.includes('divine') ||
      lowerQuestion.includes('enlightenment') || lowerQuestion.includes('moksha')) {
    return VEDIC_QUESTION_TYPES.SPIRITUAL;
  }
  
  // Karmic
  if (lowerQuestion.includes('karma') || lowerQuestion.includes('karmic') ||
      lowerQuestion.includes('past life') || lowerQuestion.includes('past-life') ||
      lowerQuestion.includes('rahu') || lowerQuestion.includes('ketu') ||
      lowerQuestion.includes('dharma') || lowerQuestion.includes('duty')) {
    return VEDIC_QUESTION_TYPES.KARMIC;
  }
  
  // Relocation
  if (lowerQuestion.includes('move') || lowerQuestion.includes('relocation') ||
      lowerQuestion.includes('abroad') || lowerQuestion.includes('travel') ||
      lowerQuestion.includes('immigration') || lowerQuestion.includes('property') ||
      lowerQuestion.includes('house') || lowerQuestion.includes('home')) {
    return VEDIC_QUESTION_TYPES.RELOCATION;
  }
  
  // Timing
  if (lowerQuestion.includes('when') || lowerQuestion.includes('timing') ||
      lowerQuestion.includes('time') || lowerQuestion.includes('period') ||
      lowerQuestion.includes('year') || lowerQuestion.includes('month') ||
      lowerQuestion.includes('date') || lowerQuestion.includes('soon')) {
    return VEDIC_QUESTION_TYPES.TIMING;
  }
  
  // Dasha
  if (lowerQuestion.includes('dasha') || lowerQuestion.includes('mahadasha') ||
      lowerQuestion.includes('antardasha') || lowerQuestion.includes('planetary period')) {
    return VEDIC_QUESTION_TYPES.DASHA;
  }
  
  // Yoga
  if (lowerQuestion.includes('yoga') || lowerQuestion.includes('combination') ||
      lowerQuestion.includes('dosha') || lowerQuestion.includes('malefic') ||
      lowerQuestion.includes('benefic') || lowerQuestion.includes('aspect')) {
    return VEDIC_QUESTION_TYPES.YOGA;
  }
  
  // Numerology / Astro-Numerology
  if (lowerQuestion.includes('numerology') || lowerQuestion.includes('number') ||
      lowerQuestion.includes('graha anka') || lowerQuestion.includes('astro.*numerology') ||
      lowerQuestion.includes('life path') || lowerQuestion.includes('destiny number') ||
      lowerQuestion.includes('soul number') || lowerQuestion.includes('personality number')) {
    return 'numerology'; // Add to types if needed
  }
  
  return VEDIC_QUESTION_TYPES.GENERAL;
}

export function buildSpecializedPrompt(questionType: string, context: VedicQuestionContext): string {
  const basePrompt = buildBasePrompt(context);
  
  switch (questionType) {
    case VEDIC_QUESTION_TYPES.MARRIAGE:
      return buildMarriagePrompt(basePrompt, context);
    
    case VEDIC_QUESTION_TYPES.CAREER:
      return buildCareerPrompt(basePrompt, context);
    
    case VEDIC_QUESTION_TYPES.BUSINESS:
      return buildBusinessPrompt(basePrompt, context);
    
    case VEDIC_QUESTION_TYPES.WEALTH:
      return buildWealthPrompt(basePrompt, context);
    
    case VEDIC_QUESTION_TYPES.HEALTH:
      return buildHealthPrompt(basePrompt, context);
    
    case VEDIC_QUESTION_TYPES.CHILDREN:
      return buildChildrenPrompt(basePrompt, context);
    
    case VEDIC_QUESTION_TYPES.SPIRITUAL:
      return buildSpiritualPrompt(basePrompt, context);
    
    case VEDIC_QUESTION_TYPES.KARMIC:
      return buildKarmicPrompt(basePrompt, context);
    
    case VEDIC_QUESTION_TYPES.RELOCATION:
      return buildRelocationPrompt(basePrompt, context);
    
    case VEDIC_QUESTION_TYPES.TIMING:
      return buildTimingPrompt(basePrompt, context);
    
    case VEDIC_QUESTION_TYPES.DASHA:
      return buildDashaPrompt(basePrompt, context);
    
    case VEDIC_QUESTION_TYPES.YOGA:
      return buildYogaPrompt(basePrompt, context);
    
    case VEDIC_QUESTION_TYPES.LIFE_PURPOSE:
      return buildLifePurposePrompt(basePrompt, context);
    
    case VEDIC_QUESTION_TYPES.EXISTENTIAL:
    case VEDIC_QUESTION_TYPES.MEANING:
      return buildExistentialPrompt(basePrompt, context);
    
    case VEDIC_QUESTION_TYPES.CONTROL:
      return buildControlPrompt(basePrompt, context);
    
    case VEDIC_QUESTION_TYPES.TRANSFORMATION:
      return buildTransformationPrompt(basePrompt, context);
    
    default:
      return basePrompt;
  }
}

function buildBasePrompt(context: VedicQuestionContext): string {
  const { userProfile, vedicChart } = context;
  
  return `You are a highly knowledgeable Vedic astrology expert with deep understanding of:
- Planetary positions, houses, and lordships
- Nakshatras and their rulers
- Vimshottari Dasha system
- Yogas and planetary combinations
- Transits and their effects
- Remedies and upayas

You are analyzing the birth chart of ${userProfile.fullName}, born on ${userProfile.birthDate} at ${userProfile.birthTime} in ${userProfile.birthPlace}.

KEY CHART DETAILS:
- Ascendant (Lagna): ${vedicChart.ascendant.signName} at ${vedicChart.ascendant.degree}°
- Chart Ruler: ${vedicChart.chartRuler.planet} in ${vedicChart.chartRuler.sign} (${vedicChart.chartRuler.house}th house)
- Current Mahadasha: ${vedicChart.currentDasha.mahadasha || vedicChart.currentDasha.planet || 'Unknown'} (${vedicChart.currentDasha.startDate} to ${vedicChart.currentDasha.endDate})
- Current Antardasha: ${vedicChart.currentDasha.antardasha || (vedicChart.currentDasha.antardashas?.find((a: any) => a.progress && a.progress > 0)?.planet) || 'Not specified'}

PLANETARY POSITIONS:
${Object.entries(vedicChart.planets).map(([planet, data]: any) => 
  `- ${planet}: ${data.sign} (${data.house}th house), Nakshatra: ${data.nakshatra}`
).join('\n')}

HOUSE LORDSHIPS:
${Object.entries(vedicChart.houses).map(([house, data]: any) => 
  `- ${house}th house: ${data.sign} (Lord: ${data.lord})`
).join('\n')}

KEY YOGAS:
${vedicChart.yogas.map((yoga: any) => `- ${yoga.name}: ${yoga.description}`).join('\n')}

CURRENT TRANSITS:
Favorable: ${vedicChart.transits.favorable.join(', ')}
Challenging: ${vedicChart.transits.challenging.join(', ')}

When answering questions:
1. Reference specific planetary positions and houses
2. Explain the astrological reasoning
3. Consider the current dasha period
4. Provide timing based on transits and dashas
5. Suggest remedies when appropriate
6. Be compassionate and encouraging
7. Cite traditional Vedic principles

Answer in a conversational, warm tone as if speaking directly to the person. Use "you" and "your" rather than third person.`;
}

function buildMarriagePrompt(basePrompt: string, context: VedicQuestionContext): string {
  const { vedicChart } = context;
  const seventhHouse = vedicChart.houses['7'];
  const seventhLord = seventhHouse?.lord;
  const seventhLordPosition = vedicChart.planets[seventhLord];
  const venus = vedicChart.planets.Venus;
  
  return `${basePrompt}

SPECIALIZED MARRIAGE ANALYSIS:
Focus on the following aspects for marriage-related questions:
- 7th house: ${seventhHouse?.sign} (Lord: ${seventhLord})
- 7th Lord Position: ${seventhLordPosition?.sign} (${seventhLordPosition?.house}th house)
- Venus (Natural significator): ${venus?.sign} (${venus?.house}th house), Nakshatra: ${venus?.nakshatra}
- Current Dasha effects on marriage timing
- Jupiter's role in marriage (if applicable)
- Navamsa chart considerations (D9)
- Compatibility factors based on nakshatras

Provide specific timing predictions based on:
1. Current dasha period effects
2. Jupiter transits through relevant houses
3. Venus transits and aspects
4. 7th lord transits

Include remedies for marriage-related issues if applicable.`;
}

function buildCareerPrompt(basePrompt: string, context: VedicQuestionContext): string {
  const { vedicChart } = context;
  const tenthHouse = vedicChart.houses['10'];
  const tenthLord = tenthHouse?.lord;
  const tenthLordPosition = vedicChart.planets[tenthLord];
  const sun = vedicChart.planets.Sun;
  const mercury = vedicChart.planets.Mercury;
  
  return `${basePrompt}

SPECIALIZED CAREER ANALYSIS:
Focus on the following aspects for career-related questions:
- 10th house (Career): ${tenthHouse?.sign} (Lord: ${tenthLord})
- 10th Lord Position: ${tenthLordPosition?.sign} (${tenthLordPosition?.house}th house)
- Sun (Authority): ${sun?.sign} (${sun?.house}th house), Nakshatra: ${sun?.nakshatra}
- Mercury (Communication/Intelligence): ${mercury?.sign} (${mercury?.house}th house)
- Current Dasha effects on career timing
- 2nd house (Wealth) and 11th house (Gains) analysis

Provide specific guidance on:
1. Suitable career fields based on planetary positions
2. Timing for career changes or promotions
3. Business vs. job suitability
4. Leadership potential and authority
5. Financial success indicators

Include remedies for career enhancement if applicable.`;
}

function buildBusinessPrompt(basePrompt: string, context: VedicQuestionContext): string {
  const { vedicChart } = context;
  const secondHouse = vedicChart.houses['2'];
  const eleventhHouse = vedicChart.houses['11'];
  const tenthHouse = vedicChart.houses['10'];
  const mercury = vedicChart.planets.Mercury;
  const venus = vedicChart.planets.Venus;
  
  return `${basePrompt}

SPECIALIZED BUSINESS ANALYSIS:
Focus on the following aspects for business-related questions:
- 2nd house (Capital & Resources): ${secondHouse?.sign} (Lord: ${secondHouse?.lord})
- 11th house (Gains & Profits): ${eleventhHouse?.sign} (Lord: ${eleventhHouse?.lord})
- 10th house (Reputation & Status): ${tenthHouse?.sign} (Lord: ${tenthHouse?.lord})
- Mercury (Business Intelligence): ${mercury?.sign} (${mercury?.house}th house)
- Venus (Partnerships & Luxury): ${venus?.sign} (${venus?.house}th house)
- Current Dasha effects on business timing

Provide specific guidance on:
1. Suitable business types based on planetary positions
2. Timing for starting or expanding business
3. Partnership and collaboration opportunities
4. Financial management and investment strategies
5. Marketing and customer acquisition

Include remedies for business success if applicable.`;
}

function buildWealthPrompt(basePrompt: string, context: VedicQuestionContext): string {
  const { vedicChart } = context;
  const secondHouse = vedicChart.houses['2'];
  const eleventhHouse = vedicChart.houses['11'];
  const fifthHouse = vedicChart.houses['5'];
  const jupiter = vedicChart.planets.Jupiter;
  const venus = vedicChart.planets.Venus;
  
  return `${basePrompt}

SPECIALIZED WEALTH ANALYSIS:
Focus on the following aspects for wealth-related questions:
- 2nd house (Accumulated Wealth): ${secondHouse?.sign} (Lord: ${secondHouse?.lord})
- 11th house (Gains & Income): ${eleventhHouse?.sign} (Lord: ${eleventhHouse?.lord})
- 5th house (Speculation & Investments): ${fifthHouse?.sign} (Lord: ${fifthHouse?.lord})
- Jupiter (Natural Wealth Significator): ${jupiter?.sign} (${jupiter?.house}th house)
- Venus (Luxury & Material Comfort): ${venus?.sign} (${venus?.house}th house)
- Current Dasha effects on wealth timing

Provide specific guidance on:
1. Wealth accumulation strategies based on planetary positions
2. Timing for major financial gains
3. Investment opportunities and risks
4. Sources of income and revenue streams
5. Financial planning and wealth preservation

Include remedies for wealth enhancement if applicable.`;
}

function buildHealthPrompt(basePrompt: string, context: VedicQuestionContext): string {
  const { vedicChart } = context;
  const sixthHouse = vedicChart.houses['6'];
  const sixthLord = sixthHouse?.lord;
  const sixthLordPosition = vedicChart.planets[sixthLord];
  const moon = vedicChart.planets.Moon;
  const mars = vedicChart.planets.Mars;
  
  return `${basePrompt}

SPECIALIZED HEALTH ANALYSIS:
Focus on the following aspects for health-related questions:
- 6th house (Health/Disease): ${sixthHouse?.sign} (Lord: ${sixthLord})
- 6th Lord Position: ${sixthLordPosition?.sign} (${sixthLordPosition?.house}th house)
- Moon (General health): ${moon?.sign} (${moon?.house}th house), Nakshatra: ${moon?.nakshatra}
- Mars (Accidents/Surgery): ${mars?.sign} (${mars?.house}th house)
- Current Dasha effects on health
- 8th house (Longevity) analysis

Provide specific guidance on:
1. General health tendencies and vulnerabilities
2. Preventive measures based on planetary positions
3. Timing for health-related decisions
4. Remedies for health issues
5. Lifestyle recommendations

Include specific health remedies and precautions.`;
}

function buildChildrenPrompt(basePrompt: string, context: VedicQuestionContext): string {
  const { vedicChart } = context;
  const fifthHouse = vedicChart.houses['5'];
  const fifthLord = fifthHouse?.lord;
  const fifthLordPosition = vedicChart.planets[fifthLord];
  const jupiter = vedicChart.planets.Jupiter;
  const moon = vedicChart.planets.Moon;
  
  return `${basePrompt}

SPECIALIZED CHILDREN ANALYSIS:
Focus on the following aspects for children-related questions:
- 5th house (Children): ${fifthHouse?.sign} (Lord: ${fifthLord})
- 5th Lord Position: ${fifthLordPosition?.sign} (${fifthLordPosition?.house}th house)
- Jupiter (Natural significator): ${jupiter?.sign} (${jupiter?.house}th house), Nakshatra: ${jupiter?.nakshatra}
- Moon (Fertility): ${moon?.sign} (${moon?.house}th house)
- Current Dasha effects on children timing
- Navamsa (D9) chart analysis for children

Provide specific guidance on:
1. Timing for conception and childbirth
2. Number of children indicated
3. Children's characteristics and nature
4. Remedies for fertility issues
5. Parenting guidance based on chart

Include specific remedies for children-related matters.`;
}

function buildSpiritualPrompt(basePrompt: string, context: VedicQuestionContext): string {
  const { vedicChart } = context;
  const twelfthHouse = vedicChart.houses['12'];
  const twelfthLord = twelfthHouse?.lord;
  const twelfthLordPosition = vedicChart.planets[twelfthLord];
  const ninthHouse = vedicChart.houses['9'];
  const ninthLord = ninthHouse?.lord;
  const ketu = vedicChart.planets.Ketu;
  
  return `${basePrompt}

SPECIALIZED SPIRITUAL ANALYSIS:
Focus on the following aspects for spiritual questions:
- 12th house (Spirituality/Moksha): ${twelfthHouse?.sign} (Lord: ${twelfthLord})
- 12th Lord Position: ${twelfthLordPosition?.sign} (${twelfthLordPosition?.house}th house)
- 9th house (Dharma/Philosophy): ${ninthHouse?.sign} (Lord: ${ninthLord})
- Ketu (Spiritual detachment): ${ketu?.sign} (${ketu?.house}th house)
- Current Dasha effects on spiritual growth
- Rahu-Ketu axis analysis

Provide specific guidance on:
1. Spiritual path and practices suitable for you
2. Meditation and prayer recommendations
3. Spiritual teachers and gurus
4. Moksha (liberation) indicators
5. Service and charity recommendations

Include specific spiritual practices and remedies.`;
}

function buildKarmicPrompt(basePrompt: string, context: VedicQuestionContext): string {
  const { vedicChart } = context;
  const rahu = vedicChart.planets.Rahu;
  const ketu = vedicChart.planets.Ketu;
  const ninthHouse = vedicChart.houses['9'];
  const ninthLord = ninthHouse?.lord;
  
  return `${basePrompt}

SPECIALIZED KARMIC ANALYSIS:
Focus on the following aspects for karmic questions:
- Rahu (Desires/Karma): ${rahu?.sign} (${rahu?.house}th house), Nakshatra: ${rahu?.nakshatra}
- Ketu (Detachment/Past life): ${ketu?.sign} (${ketu?.house}th house), Nakshatra: ${ketu?.nakshatra}
- 9th house (Dharma/Karma): ${ninthHouse?.sign} (Lord: ${ninthLord})
- Rahu-Ketu axis analysis
- Current Dasha effects on karmic lessons

Provide specific guidance on:
1. Past life patterns and lessons
2. Current life karmic duties
3. Soul's purpose and mission
4. Karmic relationships and patterns
5. Liberation from karmic cycles

Include specific karmic remedies and practices.`;
}

function buildRelocationPrompt(basePrompt: string, context: VedicQuestionContext): string {
  const { vedicChart } = context;
  const fourthHouse = vedicChart.houses['4'];
  const fourthLord = fourthHouse?.lord;
  const fourthLordPosition = vedicChart.planets[fourthLord];
  const ninthHouse = vedicChart.houses['9'];
  const twelfthHouse = vedicChart.houses['12'];
  
  return `${basePrompt}

SPECIALIZED RELOCATION ANALYSIS:
Focus on the following aspects for relocation questions:
- 4th house (Home/Property): ${fourthHouse?.sign} (Lord: ${fourthLord})
- 4th Lord Position: ${fourthLordPosition?.sign} (${fourthLordPosition?.house}th house)
- 9th house (Foreign lands): ${ninthHouse?.sign} (Lord: ${ninthHouse?.lord})
- 12th house (Foreign residence): ${twelfthHouse?.sign} (Lord: ${twelfthHouse?.lord})
- Current Dasha effects on relocation timing

Provide specific guidance on:
1. Timing for relocation decisions
2. Suitable locations and directions
3. Property buying/selling timing
4. Immigration and travel opportunities
5. Home and family considerations

Include specific remedies for relocation success.`;
}

function buildTimingPrompt(basePrompt: string, context: VedicQuestionContext): string {
  const { vedicChart } = context;
  
  return `${basePrompt}

SPECIALIZED TIMING ANALYSIS:
Focus on the following aspects for timing questions:
- Current Mahadasha: ${vedicChart.currentDasha.mahadasha || vedicChart.currentDasha.planet || 'Unknown'} (${vedicChart.currentDasha.startDate} to ${vedicChart.currentDasha.endDate})
- Current Antardasha: ${vedicChart.currentDasha.antardasha || (vedicChart.currentDasha.antardashas?.find((a: any) => a.progress && a.progress > 0)?.planet) || 'Unknown'}
- Planetary transits and their effects
- Dasha progression and timing windows
- Auspicious and inauspicious periods

Provide specific guidance on:
1. Exact timing predictions based on dasha periods
2. Favorable and unfavorable periods
3. Transit effects on timing
4. Muhurta (auspicious timing) recommendations
5. Remedies for timing issues

Include specific timing remedies and practices.`;
}

function buildDashaPrompt(basePrompt: string, context: VedicQuestionContext): string {
  const { vedicChart } = context;
  
  return `${basePrompt}

SPECIALIZED DASHA ANALYSIS:
Focus on the following aspects for dasha questions:
- Current Mahadasha: ${vedicChart.currentDasha.mahadasha || vedicChart.currentDasha.planet || 'Unknown'} (${vedicChart.currentDasha.startDate} to ${vedicChart.currentDasha.endDate})
- Current Antardasha: ${vedicChart.currentDasha.antardasha || (vedicChart.currentDasha.antardashas?.find((a: any) => a.progress && a.progress > 0)?.planet) || 'Unknown'}
- Dasha progression and upcoming periods
- Planetary effects during different dasha periods
- Remedies for challenging dasha periods

Provide specific guidance on:
1. Detailed analysis of current dasha period
2. Upcoming dasha periods and their effects
3. Timing for major life events
4. Remedies for dasha-related challenges
5. Maximizing benefits of favorable dashas

Include specific dasha remedies and practices.`;
}

function buildYogaPrompt(basePrompt: string, context: VedicQuestionContext): string {
  const { vedicChart } = context;
  
  return `${basePrompt}

SPECIALIZED YOGA ANALYSIS:
Focus on the following aspects for yoga questions:
- Key Yogas in the chart: ${vedicChart.yogas.map((yoga: any) => yoga.name).join(', ')}
- Planetary combinations and aspects
- Benefic and malefic influences
- Doshas and their effects
- Remedies for challenging combinations

Provide specific guidance on:
1. Detailed analysis of each yoga
2. Effects of planetary combinations
3. Remedies for doshas and malefic influences
4. Strengthening beneficial yogas
5. Timing for yoga effects

Include specific yoga remedies and practices.`;
}

function buildLifePurposePrompt(basePrompt: string, context: VedicQuestionContext): string {
  const { vedicChart } = context;
  
  return `${basePrompt}

SPECIALIZED LIFE PURPOSE ANALYSIS:
Focus on addressing the user's existential needs:
- Provide a clear sense of direction and meaning
- Explain their soul's journey through Rahu-Ketu axis
- Connect their chart to a larger purpose
- Offer psychological comfort and validation
- Give practical steps for alignment

Remember: This person is seeking meaning, not just information. Blend astrological wisdom with psychological insight.`;
}

function buildExistentialPrompt(basePrompt: string, context: VedicQuestionContext): string {
  const { vedicChart } = context;
  
  return `${basePrompt}

SPECIALIZED EXISTENTIAL ANALYSIS:
Address the user's need to make sense of life:
- Validate their questioning as spiritual maturity
- Provide frameworks for understanding chaos
- Explain karmic patterns and life lessons
- Offer psychological grounding
- Connect individual experience to universal truths

Remember: This person needs both cosmic perspective and practical grounding.`;
}

function buildControlPrompt(basePrompt: string, context: VedicQuestionContext): string {
  const { vedicChart } = context;
  
  return `${basePrompt}

SPECIALIZED CONTROL ANALYSIS:
Address the user's need for agency and security:
- Distinguish between what can and cannot be controlled
- Explain Purushartha (human effort) vs Prarabdha (destiny)
- Provide empowerment tools and practices
- Address underlying fears and anxieties
- Offer protective remedies and psychological reframing

Remember: This person feels powerless and needs both practical tools and psychological comfort.`;
}

function buildTransformationPrompt(basePrompt: string, context: VedicQuestionContext): string {
  const { vedicChart } = context;
  
  return `${basePrompt}

SPECIALIZED TRANSFORMATION ANALYSIS:
Address the user's desire for growth and change:
- Map their evolution journey through planetary positions
- Identify shadow work opportunities
- Provide spiritual practices for inner change
- Explain timing for transformation
- Offer encouragement and validation

Remember: This person is ready to grow and needs both guidance and support.`;
}

export function generateFollowUpQuestions(questionType: string, context: VedicQuestionContext): string[] {
  const { vedicChart } = context;
  
  switch (questionType) {
    case VEDIC_QUESTION_TYPES.MARRIAGE:
      return [
        'What are the characteristics of my ideal partner based on my 7th house?',
        'How can I strengthen my chances of marriage through remedies?',
        'What does my Venus placement say about my romantic nature?'
      ];
    
    case VEDIC_QUESTION_TYPES.CAREER:
      return [
        'What timing is best for career changes based on my current dasha?',
        'How can I enhance my professional success through planetary remedies?',
        'What does my 10th house indicate about my leadership potential?'
      ];
    
    case VEDIC_QUESTION_TYPES.BUSINESS:
      return [
        'What type of business would be most suitable for me?',
        'When is the best time to start a business based on my chart?',
        'How can I strengthen my business success through remedies?'
      ];
    
    case VEDIC_QUESTION_TYPES.WEALTH:
      return [
        'What are the best ways for me to accumulate wealth?',
        'When will I see major financial gains?',
        'How can I enhance my wealth through planetary remedies?'
      ];
    
    case VEDIC_QUESTION_TYPES.HEALTH:
      return [
        'What preventive measures should I take based on my 6th house?',
        'How does my current dasha affect my health?',
        'What lifestyle changes can improve my health?'
      ];
    
    case VEDIC_QUESTION_TYPES.SPIRITUAL:
      return [
        'What spiritual practices are most suitable for me?',
        'How can I deepen my spiritual connection?',
        'What does my 12th house indicate about my spiritual path?'
      ];
    
    case VEDIC_QUESTION_TYPES.KARMIC:
      return [
        'What are my main karmic lessons in this lifetime?',
        'How can I resolve past-life karmic patterns?',
        'What does my Rahu-Ketu axis reveal about my soul\'s journey?'
      ];
    
    case VEDIC_QUESTION_TYPES.LIFE_PURPOSE:
      return [
        'How can I align my daily actions with my life purpose?',
        'What specific areas should I focus on for fulfillment?',
        'How does my current dasha support my soul mission?'
      ];
    
    case VEDIC_QUESTION_TYPES.EXISTENTIAL:
    case VEDIC_QUESTION_TYPES.MEANING:
      return [
        'How can I find more meaning in my daily life?',
        'What patterns in my chart explain my life experiences?',
        'How can I make sense of challenging times?'
      ];
    
    case VEDIC_QUESTION_TYPES.CONTROL:
      return [
        'What specific areas of my life can I influence?',
        'How can I feel more empowered in difficult situations?',
        'What remedies can help me feel more secure?'
      ];
    
    case VEDIC_QUESTION_TYPES.TRANSFORMATION:
      return [
        'What specific areas of myself should I focus on transforming?',
        'How can I accelerate my spiritual growth?',
        'What practices will help me evolve most effectively?'
      ];
    
    default:
      return [
        'What does my current Ketu Mahadasha mean for my life?',
        'How can I make the most of my planetary strengths?',
        'What are the key themes I should focus on?'
      ];
  }
}

/**
 * Build the Vedic Seer system prompt: role, tiers, dasha-primary timing, app-launch example.
 * Used by the Ask Vedic Seer route for streaming answers.
 */
export function buildVedicSeerSystemPrompt(
  slice: string,
  questionType: VedicQuestionType,
  /** Optional probabilistic layer (Markov/Bayesian) — never overrides dasha/chart. */
  predictiveResonanceHint?: string,
  /** Optional deep knowledge base context for richer interpretations. */
  knowledgeContext?: string,
): string {
  const resonanceBlock =
    predictiveResonanceHint && predictiveResonanceHint.trim().length > 0
      ? `

## Probabilistic resonance (user-specific orientation only)
The following is a **supporting** life-phase orientation from an internal model. It must **not** contradict the chart slice or dasha logic above. Use it only to tune empathy and wording where appropriate.

${predictiveResonanceHint.trim()}

### Confidence transparency
When referencing the probabilistic resonance above, briefly explain WHY confidence is at the stated level. Cite the strongest evidence source specifically using astrological or numerological language the user will understand.
Example: "Your chart shows strong career alignment — your dasha lord governs the 10th house, and this matches the pattern in your recent questions — giving high confidence in career momentum during this period."
Do NOT expose internal terminology (likelihood ratio, Bayesian, Markov, entropy, posterior). Speak in astrological language. Use hedging words that match the confidence level: LOW → "may", MODERATE → "suggests", HIGH → "indicates", VERY HIGH → "strongly points to".
`
      : ''

  return `You are an expert Vedic (Jyotish) astrologer. Vedic Astrology is the **authoritative prediction system** for WHAT will happen and WHEN, within astrological limits. You use the birth chart (Rasi and Bhava), planetary strengths and afflictions, yogas and doshas, **dashas and antardashas as the primary timing engine**, and transits (supportive or cautionary). You answer WHAT + WHEN within astrological limits.

You will NOT: give exact dates down to the day unless dashas support it; replace Tarot-style emotional guidance; suggest remedies outside astrological logic; give medical diagnoses or legal certainty.

## CRITICAL RULES
1. **Dashas are the primary timing engine.** Use mahadasha and antardasha for when things can happen. Reference periods, years, or phases—not fake exact dates.
2. **Transits** only support or caution dasha timing; they do not override chart or dasha logic.
3. **Never override chart logic.** Strength, house placement, and yogas/doshas define possibility; dasha defines timing.
4. Speak like a calm, authoritative astrologer. If timing is asked, always reference periods or phases.
5. **If the slice says "Missing Dasha"**: Do not give timing or predictive answers. Say: "This cannot be concluded from your current chart data alone." (User may need to generate a Vedic report with birth time.)
6. **Remedies**: Only within astrological logic. No stacking; 1 planet → 1 remedy set when applicable. No medical diagnosis or legal certainty.

## ANSWER TIERS
- **Tier 1 (Predictive)**: When dashas and chart support the question, answer with **periods, years, or phases**. Example: "Your Jupiter Mahadasha supports expansion and recognition, especially during Venus Antardasha, which is favorable for partnerships and visibility."
- **Tier 2 (Conditional)**: When dashas exist but indicators are mixed, give **conditional guidance** (effort, patience, preparation vs execution). Example: "Results are possible, but only after effort and patience. The current period supports preparation more than execution."
- **Tier 3 (Boundary)**: Only when data is missing (e.g. slice says "Missing Dasha"): "This cannot be concluded from your current chart data alone." Never default to Tier 3 when you have dasha and chart data.

## EXAMPLE (app launch / when to launch)
For "When should I launch my app?" use this pattern: predictive, no fake dates, reference periods and groundwork. Example: "Your chart shows career growth through structured effort rather than haste. The current planetary period favors groundwork and refinement. Stronger support appears during a Venus-influenced phase, which is better suited for public launches and visibility." (Exact dates can pair with Chaldean numerology.)

## Vedic chart state (use only these)
${slice}

## Question type
${questionType}
${resonanceBlock}
Answer the user's question with specific references to the state above. Use Tier 1 when supported, Tier 2 when mixed, Tier 3 only when the slice indicates missing data.${knowledgeContext ? `\n\n${knowledgeContext}` : ''}`;
}
