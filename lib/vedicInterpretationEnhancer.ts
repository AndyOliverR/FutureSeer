/* eslint-disable security/detect-non-literal-regexp, security/detect-unsafe-regex */
import { createAICompletion } from './aiGateway';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { VERIFIED_VEDIC_FALLBACKS } from './verifiedFallbacks';

// Remove top-level Groq initialization - will be done inside methods

const VEDIC_CACHE_VERSION = 5; // Increment to invalidate all caches (v5: Adds personalized userName to divisional charts)

export class VedicInterpretationEnhancer {
  
  // Generate enhanced overview
  async generateEnhancedOverview(chartData: any, userId: string): Promise<string> {
    devLog.debug('🔍 Generating overview for degree:', chartData.ascendant?.degree);
    
    // Validate ascendant data
    if (!chartData.ascendant?.degree) {
      devLog.warn('⚠️ Ascendant degree missing, using fallback', 'vedicInterpretationEnhancer');
      return VERIFIED_VEDIC_FALLBACKS.overview.default;
    }
    
    // Use versioned cache key to invalidate old cache
    const cached = await this.getCachedInterpretation(userId, 'overview_v2', chartData);
    if (cached) {
      devLog.debug('✅ Using cached overview (validated)');
      return cached;
    }
    
    devLog.debug('🔄 Generating new overview with Groq...');
    
    // Generate with Groq
    try {
      const prompt = this.buildOverviewPrompt(chartData);
      const interpretation = await this.callGroq(prompt);
      
      // Validate that interpretation doesn't contain "at 0°" when degree is not 0
      if (chartData.ascendant.degree > 0.1 && interpretation.includes('at 0°')) {
        devLog.warn('⚠️ Groq generated incorrect 0° degree, regenerating...', 'vedicInterpretationEnhancer');
        // Force regeneration with more explicit prompt
        const enhancedPrompt = prompt + '\n\nREMINDER: The ascendant degree is NOT 0°. Use the exact degree provided above.';
        const correctedInterpretation = await this.callGroq(enhancedPrompt);
        
        // Cache corrected result
        await this.cacheInterpretation(userId, 'overview_v2', correctedInterpretation);
        devLog.debug('✅ Corrected interpretation cached');
        return correctedInterpretation;
      }
      
      // Cache result
      await this.cacheInterpretation(userId, 'overview_v2', interpretation);
      devLog.debug('✅ New interpretation cached');
      
      return interpretation;
    } catch (error) {
      devLog.error('Failed to generate overview:', error, 'vedicInterpretationEnhancer');
      return VERIFIED_VEDIC_FALLBACKS.overview.default;
    }
  }
  
  // Generate planetary interpretation
  async generatePlanetaryInterpretation(
    planet: string, 
    chartData: any, 
    userId: string
  ): Promise<string> {
    const cached = await this.getCachedInterpretation(userId, `planets/${planet}`, chartData);
    if (cached) return cached;
    
    try {
      const prompt = this.buildPlanetPrompt(planet, chartData);
      const interpretation = await this.callGroq(prompt);
      await this.cacheInterpretation(userId, `planets/${planet}`, interpretation);
      return interpretation;
    } catch (error) {
      devLog.error(`Failed to generate ${planet} interpretation:`, error, 'vedicInterpretationEnhancer');
      return VERIFIED_VEDIC_FALLBACKS.planets[planet as keyof typeof VERIFIED_VEDIC_FALLBACKS.planets] || `${planet} influences your life path and karmic lessons. Consult with a Vedic astrologer for personalized insights.`;
    }
  }
  
  // Generate house interpretation
  async generateHouseInterpretation(
    houseNumber: number, 
    chartData: any, 
    userId: string
  ): Promise<string> {
    const cached = await this.getCachedInterpretation(userId, `houses/${houseNumber}`, chartData);
    if (cached) return cached;
    
    try {
      const prompt = this.buildHousePrompt(houseNumber, chartData);
      const interpretation = await this.callGroq(prompt);
      await this.cacheInterpretation(userId, `houses/${houseNumber}`, interpretation);
      return interpretation;
    } catch (error) {
      devLog.error(`Failed to generate house ${houseNumber} interpretation:`, error, 'vedicInterpretationEnhancer');
      return VERIFIED_VEDIC_FALLBACKS.houses[houseNumber as keyof typeof VERIFIED_VEDIC_FALLBACKS.houses] || `The ${houseNumber}${houseNumber === 1 ? 'st' : houseNumber === 2 ? 'nd' : houseNumber === 3 ? 'rd' : 'th'} house governs important life areas. Consult with a Vedic astrologer for personalized insights.`;
    }
  }
  
  // Generate dasha interpretation
  async generateDashaInterpretation(
    dashaData: any,
    chartData: any,
    userId: string
  ): Promise<string> {
    // Generate proper cache key using correct property names
    const mahadasha = dashaData.mahadasha || dashaData.planet || 'Unknown';
    const antardasha = dashaData.antardasha || 
      (dashaData.antardashas?.find((a: any) => a.progress && a.progress > 0)?.planet) || 
      'Unknown';
    const dashaId = `${mahadasha}_${antardasha}`;
    
    // Check cache and validate content
    const cached = await this.getCachedInterpretation(userId, `dasha/${dashaId}`, chartData);
    if (cached && this.isValidInterpretation(cached, chartData)) {
      return cached;
    }
    
    // If cache invalid or missing, generate new interpretation
    try {
      const prompt = this.buildDashaPrompt(dashaData, chartData);
      const interpretation = await this.callGroq(prompt);
      
      // Save verified interpretation permanently
      if (interpretation && this.isValidInterpretation(interpretation, chartData)) {
        await this.cacheInterpretation(userId, `dasha/${dashaId}`, interpretation);
        return interpretation;
      }
      
      // Fallback if content is invalid
      return VERIFIED_VEDIC_FALLBACKS.dasha.default;
    } catch (error) {
      devLog.error('Failed to generate dasha interpretation:', error, 'vedicInterpretationEnhancer');
      return VERIFIED_VEDIC_FALLBACKS.dasha.default;
    }
  }
  
  // Generate transit interpretation
  async generateTransitInterpretation(
    transitData: any, 
    chartData: any, 
    userId: string
  ): Promise<string> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const cached = await this.getCachedInterpretation(userId, `transits/${today}`, chartData);
    if (cached) return cached;
    
    try {
      const prompt = this.buildTransitPrompt(transitData, chartData);
      const interpretation = await this.callGroq(prompt);
      await this.cacheInterpretation(userId, `transits/${today}`, interpretation);
      return interpretation;
    } catch (error) {
      devLog.error('Failed to generate transit interpretation:', error, 'vedicInterpretationEnhancer');
      return VERIFIED_VEDIC_FALLBACKS.transits.default;
    }
  }
  
  // Generate remedy interpretation
  async generateRemedyInterpretation(
    planet: string,
    remedy: any,
    chartData: any,
    userId: string
  ): Promise<string> {
    const cached = await this.getCachedInterpretation(userId, `remedies/${planet}`, chartData);
    if (cached) return cached;
    
    try {
      const prompt = this.buildRemedyPrompt(planet, remedy, chartData);
      const interpretation = await this.callGroq(prompt);
      await this.cacheInterpretation(userId, `remedies/${planet}`, interpretation);
      return interpretation;
    } catch (error) {
      devLog.error(`Failed to generate remedy interpretation for ${planet}:`, error, 'vedicInterpretationEnhancer');
      return VERIFIED_VEDIC_FALLBACKS.remedies[planet as keyof typeof VERIFIED_VEDIC_FALLBACKS.remedies] || 'Remedies help strengthen planetary influences. Consult with a Vedic astrologer for personalized guidance.';
    }
  }
  
  // Generate panchanga insight
  async generatePanchangaInsight(
    panchangaData: any,
    chartData: any,
    userId: string
  ): Promise<string> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const cached = await this.getCachedInterpretation(userId, `panchanga/${today}`, chartData);
    if (cached) return cached;
    
    try {
      const prompt = this.buildPanchangaPrompt(panchangaData, chartData);
      const interpretation = await this.callGroq(prompt);
      await this.cacheInterpretation(userId, `panchanga/${today}`, interpretation);
      return interpretation;
    } catch (error) {
      devLog.error('Failed to generate panchanga insight:', error, 'vedicInterpretationEnhancer');
      return VERIFIED_VEDIC_FALLBACKS.panchanga.default;
    }
  }

  // Generate divisional chart insight
  async generateDivisionalInsight(
    chartType: 'D9' | 'D10',
    insightType: string,
    chartData: any,
    userId: string,
    userName?: string
  ): Promise<string> {
    // Include userName in cache key to ensure personalized content
    const firstName = userName?.split(' ')[0] || 'default';
    const cacheKey = `divisional_${chartType}_${insightType}_${firstName}`;
    
    // Check cache first
    const cached = await this.getCachedInterpretation(userId, cacheKey, chartData);
    if (cached) {
      // Post-process cached content: Replace "Dear seeker" if userName is provided
      if (userName && firstName !== 'default') {
        return cached.replace(/Dear seeker/gi, `Dear ${firstName}`)
                     .replace(/dear seeker/gi, `Dear ${firstName}`)
                     .replace(/dear one/gi, firstName);
      }
      return cached;
    }
    
    try {
      // Build prompt based on chart type and insight type
      const prompt = this.buildDivisionalPrompt(chartType, insightType, chartData, userName);
      
      // Call Groq
      let interpretation = await this.callGroq(prompt);
      
      // Post-process: Replace any remaining "Dear seeker" or "dear seeker" with personalized address
      if (interpretation && userName) {
        const firstName = userName.split(' ')[0];
        // Replace "Dear seeker" or "dear seeker" with "Dear [firstName]" or "you"
        interpretation = interpretation.replace(/Dear seeker/gi, firstName ? `Dear ${firstName}` : 'Dear seeker');
        interpretation = interpretation.replace(/dear seeker/gi, firstName ? `Dear ${firstName}` : 'dear seeker');
        // Also replace "dear one" with personalized address
        interpretation = interpretation.replace(/dear one/gi, firstName ? `${firstName}` : 'you');
      }
      
      // Cache the result (permanent - birth chart never changes)
      if (interpretation) {
        await this.cacheInterpretation(userId, cacheKey, interpretation);
      }
      
      return interpretation;
    } catch (error) {
      devLog.error(`Failed to generate ${chartType} ${insightType} insight:`, error, 'vedicInterpretationEnhancer');
      return 'Divisional charts provide deeper insights into specific life areas. The D9 (Navamsa) reveals your inner strength and marriage potential, while the D10 (Dasamsa) illuminates your career path and professional achievements.';
    }
  }

  private buildDivisionalPrompt(
    chartType: 'D9' | 'D10',
    insightType: string,
    chartData: any,
    userName?: string
  ): string {
    const ascendant = chartData.ascendant?.signName || 'Unknown';
    const firstName = userName?.split(' ')[0] || 'you';
    const addressForm = firstName !== 'you' ? `Dear ${firstName}` : 'Dear seeker';
    
    if (chartType === 'D9') {
      switch (insightType) {
        case 'marriageIndicators':
          return `As a Vedic astrologer, provide a detailed 2-3 paragraph interpretation about marriage indicators in the D9 (Navamsa) chart for a ${ascendant} ascendant native. Focus on:

1. The 7th house lord's placement and its significance for marriage timing and partner qualities
2. Venus placement in Navamsa and its impact on marital harmony
3. Benefic and malefic aspects to the 7th house and their effects on relationships

Write in a mystical, insightful tone. Address the person as "${addressForm}" or use "you/your/yours" throughout. Never use "dear seeker" - use their name or "you" instead. Include specific astrological principles and practical guidance.`;

        case 'spiritualPath':
          return `As a Vedic astrologer, provide a detailed 2-3 paragraph interpretation about spiritual path in the D9 (Navamsa) chart for a ${ascendant} ascendant native. Focus on:

1. Jupiter and Ketu's placement and their role in spiritual evolution
2. The path to moksha (liberation) as indicated by planetary positions
3. Whether the spiritual path is through Jnana Yoga, Bhakti Yoga, or Karma Yoga

Write in a mystical, insightful tone. Address the person as "${addressForm}" or use "you/your/yours" throughout. Never use "dear seeker" - use their name or "you" instead. Include specific astrological principles and spiritual guidance.`;

        case 'innerStrength':
          return `As a Vedic astrologer, provide a detailed 2-3 paragraph interpretation about inner strength in the D9 (Navamsa) chart for a ${ascendant} ascendant native. Focus on:

1. How Navamsa reveals the true strength of planets compared to the birth chart
2. Planetary strength in Navamsa and its impact on life results
3. The sustainability and quality of achievements based on Navamsa positions

Write in a mystical, insightful tone. Address the person as "${addressForm}" or use "you/your/yours" throughout. Never use "dear seeker" - use their name or "you" instead. Include specific astrological principles and practical insights.`;
      }
    } else if (chartType === 'D10') {
      switch (insightType) {
        case 'tenthHouseAnalysis':
          return `As a Vedic astrologer, provide a detailed 2-3 paragraph interpretation about 10th house analysis in the D10 (Dasamsa) chart for a ${ascendant} ascendant native. Focus on:

1. The 10th house lord's placement and its significance for career direction
2. Professional achievements and recognition potential
3. The nature of career based on sign and house placements

Write in a mystical, insightful tone. Address the person as "${addressForm}" or use "you/your/yours" throughout. Never use "dear seeker" - use their name or "you" instead. Include specific astrological principles and career guidance.`;

        case 'successTiming':
          return `As a Vedic astrologer, provide a detailed 2-3 paragraph interpretation about success timing in the D10 (Dasamsa) chart for a ${ascendant} ascendant native. Focus on:

1. Strong planets in Kendra houses (1st, 4th, 7th, 10th) and their impact
2. Periods of professional growth and recognition
3. Timing of career breakthroughs based on planetary strength

Write in a mystical, insightful tone. Address the person as "${addressForm}" or use "you/your/yours" throughout. Never use "dear seeker" - use their name or "you" instead. Include specific astrological principles and timing guidance.`;

        case 'socialStatus':
          return `As a Vedic astrologer, provide a detailed 2-3 paragraph interpretation about social status in the D10 (Dasamsa) chart for a ${ascendant} ascendant native. Focus on:

1. Sun and Saturn's placement and their role in professional authority
2. Leadership qualities and recognition potential
3. Social standing and reputation in professional life

Write in a mystical, insightful tone. Address the person as "${addressForm}" or use "you/your/yours" throughout. Never use "dear seeker" - use their name or "you" instead. Include specific astrological principles and status guidance.`;
      }
    }
    
    return 'Unable to generate interpretation for this chart type and insight.';
  }
  
  // Call Groq API with retry logic
  private async callGroq(prompt: string): Promise<string> {
    // Validate API key first (either Gateway or direct Groq)
    if (!process.env.GROQ_API_KEY && !process.env.AI_GATEWAY_API_KEY) {
      devLog.error('❌ GROQ_API_KEY or AI_GATEWAY_API_KEY is not configured. Please add one to your .env.local file.', undefined, 'vedicInterpretationEnhancer');
      throw new Error('GROQ_API_KEY or AI_GATEWAY_API_KEY is not configured');
    }

    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        devLog.debug(`🔄 Calling AI Gateway/Groq API (attempt ${attempt}/${maxRetries})...`);
        const result = await createAICompletion({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          maxTokens: 1000,
        });

        const text = result.content || '';
        devLog.debug(`✅ AI Gateway/Groq response received: ${text.substring(0, 100)}...`);
        
        // Validate response
        if (this.isValidInterpretation(text)) {
          devLog.debug('✅ AI Gateway/Groq content validated successfully');
          return text;
        } else {
          devLog.debug(`❌ AI Gateway/Groq returned invalid content (attempt ${attempt}/${maxRetries})`);
          lastError = new Error('Invalid content from AI Gateway/Groq');
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }
        }
      } catch (error: any) {
        lastError = error;
        if (error?.status === 429) {
          const delay = 2000 * Math.pow(2, attempt - 1);
          devLog.debug(`Rate limited. Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          devLog.error('Groq error:', error, 'vedicInterpretationEnhancer');
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    }

    // After all retries failed, throw error
    throw new Error(`Failed to generate valid content after ${maxRetries} attempts: ${lastError?.message}`);
  }
  
  // Get cached interpretation
  private async getCachedInterpretation(
    userId: string, 
    path: string,
    chartData?: any
  ): Promise<string | null> {
    try {
      const db = getFirebaseDB();
      const docRef = doc(db, 'users', userId, 'vedicInterpretations', path);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        // Check cache version FIRST
        if (!data.version || data.version < VEDIC_CACHE_VERSION) {
          devLog.debug(`🗑️ Old cache version (${data.version || 0}) detected for ${path}, deleting...`);
          await this.deleteCachedInterpretation(userId, path);
          return null; // Force regeneration
        }
        
        // Then check validity
        if (this.isCacheValid(path, data.generatedAt)) {
          const cachedText = data.text;
          
          if (this.isValidInterpretation(cachedText, chartData)) {
            return cachedText;
          } else {
            devLog.debug(`🗑️ Invalid cached content detected for ${path}, deleting...`);
            await this.deleteCachedInterpretation(userId, path);
            return null;
          }
        }
      }
    } catch (error) {
      devLog.error('Cache read error:', error, 'vedicInterpretationEnhancer');
    }
    return null;
  }

  // Delete cached interpretation
  private async deleteCachedInterpretation(
    userId: string, 
    path: string
  ): Promise<void> {
    try {
      const db = getFirebaseDB();
      const { deleteDoc } = await import('firebase/firestore');
      const docRef = doc(db, 'users', userId, 'vedicInterpretations', path);
      await deleteDoc(docRef);
      devLog.debug('✅ Bad cache deleted:', path);
    } catch (error) {
      devLog.error('Error deleting cache:', error, 'vedicInterpretationEnhancer');
    }
  }
  
  // Cache interpretation
  private async cacheInterpretation(
    userId: string, 
    path: string, 
    text: string
  ): Promise<void> {
    try {
      const db = getFirebaseDB();
      const docRef = doc(db, 'users', userId, 'vedicInterpretations', path);
      await setDoc(docRef, {
        text,
        generatedAt: Date.now(),
        version: VEDIC_CACHE_VERSION, // Save current version
      });
      devLog.debug(`✅ Cache saved: ${path} (v${VEDIC_CACHE_VERSION})`);
    } catch (error) {
      devLog.error('Cache write error:', error, 'vedicInterpretationEnhancer');
    }
  }
  
  // Check if cache is valid
  private isCacheValid(path: string, generatedAt: number): boolean {
    const now = Date.now();
    const age = now - generatedAt;
    
    // Different expiry for different types
    if (path.includes('transits') || path.includes('panchanga')) {
      return age < 24 * 60 * 60 * 1000; // 1 day
    }
    return true; // Birth chart data never expires
  }

  // Validate interpretation content
  private isValidInterpretation(text: string, chartData?: any): boolean {
    if (!text || text.length < 50) return false;
    
    const invalidPhrases = [
      // Generic chat phrases
      'didn\'t ask', 'provide context', 'please clarify', 'didn\'t provide', 'could you please',
      'more information', 'didn\'t type', 'empty message', 'share what\'s on your mind',
      'ask me anything', 'feel free to ask', 'go ahead and ask', 'please provide more',
      'clarify how I can help', 'provide more details',
      
      // Error messages
      'unable to generate', 'please refresh the page', 'try again',
      
      // Astrological content issues
      'unique energy', 'brings energy',
      'in your life.', // Generic ending
      'unknown mahadasha', 'unknown antardasha', 'unknown dasha',
    ];
    
    // Check invalid phrases
    for (const phrase of invalidPhrases) {
      if (phrase.includes('[') && phrase.includes(']')) {
        const regex = new RegExp(phrase, 'i');
        if (regex.test(text)) {
          devLog.debug(`❌ Invalid phrase: "${phrase}"`);
          return false;
        }
      } else {
        if (text.toLowerCase().includes(phrase.toLowerCase())) {
          devLog.debug(`❌ Invalid phrase: "${phrase}"`);
          return false;
        }
      }
    }
    
    // Check for incorrect 0° when actual degree is not 0
    if (chartData?.ascendant?.degree && chartData.ascendant.degree > 0.1) {
      if (text.includes('at 0°') || text.includes('at 0 degrees')) {
        devLog.debug('❌ Incorrect 0° degree');
        return false;
      }
    }
    
    // Check for "in X in the Yth house" pattern (e.g., "Sun in 10 in the 9th house")
    const incorrectHousePattern = /\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Rahu|Ketu)\s+in\s+\d+\s+in\s+the\s+\d+(st|nd|rd|th)\s+house/i;
    if (incorrectHousePattern.test(text)) {
      devLog.debug('❌ Incorrect "Planet in X in the Yth house" pattern');
      return false;
    }
    
    // Check for "The Xth house in Y" pattern (e.g., "The 1st house in 2")
    const houseInSignNumberPattern = /The\s+\d+(st|nd|rd|th)\s+house\s+in\s+\d+/i;
    if (houseInSignNumberPattern.test(text)) {
      devLog.debug('❌ Incorrect "The Xth house in Y" pattern');
      return false;
    }
    
    // Check for unordinal house numbers (e.g., "7 house" instead of "7th house")
    const unordinalHousePattern = /\bin\s+(the\s+)?(\d+)\s+house\b/gi;
    const matches = text.matchAll(unordinalHousePattern);
    for (const match of matches) {
      const num = match[2];
      // Check if it's NOT followed by ordinal suffix
      const afterMatch = text.substring(match.index! + match[0].length, match.index! + match[0].length + 2);
      if (!['st', 'nd', 'rd', 'th'].includes(afterMatch)) {
        devLog.debug(`❌ Unordinal house number: "${match[0]}"`);
        return false;
      }
    }
    
    return true;
  }
  
  // Build overview prompt
  private buildOverviewPrompt(chartData: any): string {
    const ascendant = chartData.ascendant?.signName || 'Unknown';
    const ascendantDegree = chartData.ascendant?.degree?.toFixed(2) || '0.00';
    const sunSign = chartData.planets?.Sun?.signName || 'Unknown';
    const sunHouse = chartData.planets?.Sun?.house || 'Unknown';
    const moonSign = chartData.planets?.Moon?.signName || 'Unknown';
    const moonNakshatra = chartData.planets?.Moon?.nakshatra || 'Unknown';
    const currentDasha = chartData.currentDasha?.planet || 'Unknown';
    
    return `You are a wise Vedic astrologer. Generate a personality analysis.

Birth Chart:
- Ascendant: ${ascendant} at ${ascendantDegree}°
- Sun: ${sunSign} in ${sunHouse}th house
- Moon: ${moonSign} in ${moonNakshatra} nakshatra
- Current Dasha: ${currentDasha}

CRITICAL FORMATTING RULES:
1. Use EXACT degree: "${ascendant} Ascendant at ${ascendantDegree}°" (NOT "0°")
2. Use ordinal house numbers: "7th house" (NOT "7 house")
3. Use sign names: "Gemini" (NOT "2")
4. NEVER use these phrases: "unique energy", "brings energy", "in your life."
5. Be specific and mystical, not generic.

Include:
1. Core identity and life purpose
2. Karmic lessons from this lifetime
3. Greatest strengths and natural gifts
4. Challenges to overcome
5. Spiritual path and growth areas

Tone: Personal, profound, practical. Use "you" and "your". Be encouraging yet honest. Mix conversational warmth with mystical wisdom. 2-3 paragraphs.`;
  }
  
  // Build planet prompt
  private buildPlanetPrompt(planet: string, chartData: any): string {
    const planetData = chartData.planets?.[planet];
    if (!planetData) return '';
    
    const sign = planetData.signName || 'Unknown';
    const house = planetData.house || 'Unknown';
    const nakshatra = planetData.nakshatra || 'Unknown';
    const ascendant = chartData.ascendant?.signName || 'Unknown';
    const degree = planetData.degree || 0;
    const houseTheme = this.getHouseTheme(house);
    
    return `You are a Vedic astrologer. Explain ${planet} in ${sign} in the ${house}th house for ${ascendant} ascendant.

The ${house}th house governs: ${houseTheme}

Provide 2-3 sentences:
1. How ${planet} in ${sign} influences ${houseTheme}
2. Practical effects in daily life
3. Role of nakshatra ${nakshatra}

CRITICAL RULES:
- Use "${planet} in ${sign} in the ${house}th house" (NOT "${planet} in ${house} in the ${house}th house")
- NEVER use "unique energy" or "brings energy"
- Be specific, mystical, actionable
- Use "you" and "your"`;
  }

  // Get house theme mapping
  private getHouseTheme(houseNumber: number): string {
    const themes: { [key: number]: string } = {
      1: 'self-identity, physical body, and personality',
      2: 'wealth, family, and speech',
      3: 'courage, siblings, and communication',
      4: 'home, mother, and emotional foundation',
      5: 'creativity, children, and intelligence',
      6: 'health, service, and overcoming obstacles',
      7: 'partnerships, marriage, and business',
      8: 'transformation, occult, and longevity',
      9: 'dharma, higher learning, and fortune',
      10: 'career, status, and public life',
      11: 'gains, aspirations, and social networks',
      12: 'spirituality, losses, and liberation'
    };
    return themes[houseNumber] || 'life experiences';
  }
  
  // Build house prompt
  private buildHousePrompt(houseNumber: number, chartData: any): string {
    const house = chartData.houses?.[houseNumber];
    if (!house) return '';
    
    const sign = house.signName || 'Unknown';
    const lord = house.lord || 'Unknown';
    const planets = house.planets || [];
    const ascendant = chartData.ascendant?.signName || 'Unknown';
    
    return `Explain the ${houseNumber}th house in ${sign}, ruled by ${lord}.

The ${houseNumber}th house governs: ${this.getHouseTheme(houseNumber)}

Provide 2-3 sentences about how ${sign} influences this house.

CRITICAL RULES:
- Say "The ${houseNumber}th house in ${sign}" (NOT "The ${houseNumber}th house in ${house.sign}")
- Use sign NAME, not number
- NEVER end with "in your life."
- Be specific and mystical`;
  }
  
  // Build dasha prompt
  private buildDashaPrompt(dashaData: any, chartData: any): string {
    // Handle both old format (mahadasha/antardasha) and new format (planet)
    const mahadasha = dashaData.mahadasha || dashaData.planet || 'Unknown';
    
    // Find current antardasha from antardashas array
    let antardasha = dashaData.antardasha || 'Unknown';
    if (dashaData.antardashas && Array.isArray(dashaData.antardashas)) {
      const currentAntardasha = dashaData.antardashas.find((a: any) => a.progress && a.progress > 0);
      if (currentAntardasha) {
        antardasha = currentAntardasha.planet;
      }
    }
    
    const ascendant = chartData.ascendant?.signName || 'Unknown';
    
    return `You are a Vedic astrologer. Explain the current ${mahadasha} Mahadasha and ${antardasha} Antardasha for someone with ${ascendant} ascendant.

Be conversational yet mystical. Explain:
1. What this dasha period brings to their life
2. Key themes and lessons of this time
3. Practical guidance for navigating this period

Tone: Warm, insightful, empowering. Mix practical wisdom with mystical insights. Use "you" and "your". 1-2 paragraphs.`;
  }
  
  // Build transit prompt
  private buildTransitPrompt(transitData: any, chartData: any): string {
    const ascendant = chartData.ascendant?.signName || 'Unknown';
    
    return `You are a Vedic astrologer. Explain the current planetary transits for someone with ${ascendant} ascendant.

Current Transits:
${transitData.favorable?.map((t: any) => `- Favorable: ${t}`).join('\n') || ''}
${transitData.challenging?.map((t: any) => `- Challenging: ${t}`).join('\n') || ''}

Be conversational yet mystical. Explain:
1. How these transits affect their life
2. Opportunities and challenges to be aware of
3. Practical guidance for this time

Tone: Warm, insightful, empowering. Mix practical wisdom with mystical insights. Use "you" and "your". 1-2 paragraphs.`;
  }
  
  // Build remedy prompt
  private buildRemedyPrompt(planet: string, remedy: any, chartData: any): string {
    const planetData = chartData.planets?.[planet];
    const sign = planetData?.signName || 'Unknown';
    const house = planetData?.house || 'Unknown';
    const ascendant = chartData.ascendant?.signName || 'Unknown';
    
    return `You are a Vedic astrologer. Explain why ${remedy.name || 'this remedy'} is beneficial for someone with ${planet} in ${sign} in the ${house}th house and ${ascendant} ascendant.

Be conversational yet mystical. Explain:
1. The energetic connection and why this remedy works
2. Expected benefits and improvements
3. How to use this remedy effectively

Tone: Warm, insightful, empowering. Mix practical wisdom with mystical insights. Use "you" and "your". 1 paragraph.`;
  }
  
  // Build panchanga prompt
  private buildPanchangaPrompt(panchangaData: any, chartData: any): string {
    const ascendant = chartData.ascendant?.signName || 'Unknown';
    const tithi = panchangaData.tithi || 'Unknown';
    const nakshatra = panchangaData.nakshatra || 'Unknown';
    const yoga = panchangaData.yoga || 'Unknown';
    
    return `You are a Vedic astrologer. Provide mystical daily wisdom based on today's Panchanga for someone with ${ascendant} ascendant.

Today's Panchanga:
- Tithi: ${tithi}
- Nakshatra: ${nakshatra}
- Yoga: ${yoga}

Be conversational yet mystical. Provide:
1. Daily guidance and wisdom
2. What energies to work with today
3. Practical spiritual advice

Tone: Warm, insightful, empowering. Mix practical wisdom with mystical insights. Use "you" and "your". 1-2 paragraphs.`;
  }

  // Public method to delete all cached interpretations for a user
  public async deleteAllVedicInterpretationsForUser(userId: string): Promise<void> {
    try {
      const db = getFirebaseDB();
      const { collection, query, getDocs, deleteDoc } = await import('firebase/firestore');
      const interpretationsRef = collection(db, 'users', userId, 'vedicInterpretations');
      const q = query(interpretationsRef);
      const querySnapshot = await getDocs(q);

      const deletePromises: Promise<void>[] = [];
      querySnapshot.forEach((document) => {
        deletePromises.push(deleteDoc(document.ref));
      });

      await Promise.all(deletePromises);
      devLog.debug(`🗑️ Deleted ${querySnapshot.size} cached interpretations for user ${userId}`);
    } catch (error) {
      devLog.error('Error deleting all interpretations:', error, 'vedicInterpretationEnhancer');
    }
  }
}

