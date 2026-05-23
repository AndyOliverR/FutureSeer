// Vedic Intelligence Service
// Bridges Universal API with UI and adds AI interpretations

import { devLog } from '@/lib/devLogger';
import { normalizeTimeString, normalizeDateString } from './timeUtils';
import { getServerBaseUrl } from './serverBaseUrl';
import { universalInterpretationEngine } from './universalInterpretationEngine';
import { callTextAI } from './aiStructuredOutput';

export interface VedicReading {
  id: string;
  userId: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  lastFetched: number;
  
  // Core Vedic Data
  chartData: {
    ascendant: {
      sign: string;
      degree: number;
      lord: string;
    };
    planets: Array<{
      name: string;
      sign: string;
      degree: number;
      house: number;
      nakshatra: string;
      pada: number;
      isRetrograde: boolean;
      lord: string;
    }>;
    houses: Array<{
      number: number;
      sign: string;
      degree: number;
      lord: string;
    }>;
    dasha: Array<{
      planet: string;
      startDate: string;
      endDate: string;
      duration: number;
      isCurrent: boolean;
      progress: number;
    }>;
    currentDasha: {
      planet: string;
      startDate: string;
      endDate: string;
      duration: number;
      progress: number;
    } | null;
  };
  
  // AI Interpretations
  interpretations: {
    personality: {
      overview: string;
      strengths: string[];
      challenges: string[];
      lifePurpose: string;
    };
    relationships: {
      compatibility: string;
      marriageTiming: string;
      relationshipAdvice: string;
    };
    career: {
      suitableProfessions: string[];
      careerTiming: string;
      successFactors: string[];
    };
    health: {
      constitution: string;
      healthTips: string[];
      vulnerableAreas: string[];
    };
    spirituality: {
      spiritualPath: string;
      meditationAdvice: string;
      karmicLessons: string[];
    };
  };
  
  // Remedies and Guidance
  remedies: Array<{
    type: 'mantra' | 'gemstone' | 'ritual' | 'lifestyle';
    name: string;
    description: string;
    instructions: string;
    timing: string;
  }>;
  
  // Metadata
  metadata: {
    lastUpdated: Date;
    source: 'universal_api';
    version: string;
    calculationTime: number;
    interpretationSource: 'openai' | 'internal';
  };
}

class VedicIntelligence {
  private vedicCache = new Map<string, VedicReading>();
  
  // Clear corrupted cache data
  clearVedicCache(userId?: string) {
    if (userId) {
      this.vedicCache.delete(userId);
      if (process.env.NODE_ENV === 'development') {
        devLog.debug(`🧹 Cleared Vedic cache for user: ${userId}`);
      }
    } else {
      this.vedicCache.clear();
      if (process.env.NODE_ENV === 'development') {
        devLog.debug('🧹 Cleared all Vedic cache data');
      }
    }
  }
  
  // Main function to get intelligent Vedic data
  async getIntelligentVedicData(
    userId: string,
    birthDate: string,
    birthTime: string,
    birthPlace: string,
    latitude: number,
    longitude: number,
    forceRefresh: boolean = false,
    useAIEnhancement: boolean = false  // NEW PARAMETER for optional AI enhancement
  ): Promise<VedicReading> {
    if (process.env.NODE_ENV === 'development') {
      const verboseAstroLogs = process.env.VERBOSE_ASTRO_LOGS === '1';
      devLog.debug('🔮 VedicIntelligence: Starting intelligent calculation...');
      if (verboseAstroLogs) {
        devLog.debug('🔄 CACHING DISABLED - Generating fresh Vedic data for user:', userId);
        devLog.debug('Calculating new Vedic analysis for user:', userId);
      }
    }
    
    // Get chart data from Universal API
    const chartData = await this.getVedicChartData({
      birthDate,
      birthTime,
      birthPlace,
      latitude,
      longitude
    });
    
    // Generate universal interpretations using Markov + Bayesian (always)
    const universalInterpretation = await universalInterpretationEngine.generateInterpretation(
      'vedic',
      userId,
      chartData,
      { birthDate, birthTime, birthPlace }
    );
    
    // Convert universal interpretation to Vedic format
    let interpretations = this.convertUniversalToVedic(universalInterpretation) as unknown as VedicReading['interpretations'];
    
    // If AI enhancement requested, enhance with OpenAI
    let interpretationSource: 'openai' | 'internal' = 'internal';
    if (useAIEnhancement) {
      try {
        devLog.debug('✨ Enhancing interpretations with OpenAI...');
        const aiEnhancement = await this.generateAIInterpretations(chartData, userId);
        interpretations = this.mergeInterpretations(interpretations, aiEnhancement) as unknown as VedicReading['interpretations'];
        interpretationSource = 'openai';
      } catch (error) {
        devLog.warn('AI enhancement failed, using fallback interpretations:', error, 'vedicIntelligence');
      }
    }
    
    // Generate remedies
    const remedies = this.generateVedicRemedies(chartData);
    
    // Create comprehensive reading
    const reading = {
      id: 'current',
      userId,
      birthDate,
      birthTime,
      birthPlace,
      lastFetched: Date.now(),
      chartData,
      interpretations,
      remedies,
      metadata: {
        lastUpdated: new Date(),
        source: 'universal_api',
        version: '1.0.0',
        calculationTime: Date.now(),
        interpretationSource: interpretationSource
      }
    } as unknown as VedicReading;
    
    // CACHING DISABLED - No storage for fresh data generation
    devLog.debug('✅ Fresh Vedic data generated - Caching disabled');
    
    return reading;
  }
  
  // Get Vedic chart data from Universal API
  private async getVedicChartData(birthData: {
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    latitude: number;
    longitude: number;
  }) {
    try {
      const baseUrl = typeof window !== 'undefined' ? '' : getServerBaseUrl();
      const response = await fetch(`${baseUrl}/api/occult/universal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system: 'vedic',
          birthData,
          options: {
            chartType: 'D1',
            includeDasha: true,
            includeNavamsa: true
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Universal API error: ${response.status}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      devLog.error('Error fetching Vedic chart data:', error, 'vedicIntelligence');
      // Return fallback data
      return this.getFallbackVedicData();
    }
  }
  
  // Generate AI interpretations using Groq-first provider abstraction
  private async generateAIInterpretations(chartData: any, userId: string) {
    try {
      const completion = await callTextAI({
        label: 'vedic-intelligence-interpretation',
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        maxTokens: 1400,
        maxAttempts: 2,
        messages: [
          {
            role: 'system',
            content: 'You are a Vedic astrologer. Provide concise sections for personality, relationships, career, health, and spirituality.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              question: 'Please provide a comprehensive Vedic astrology interpretation',
              astroData: {
                sun_sign: chartData.ascendant?.sign || 'Unknown',
                moon_sign: chartData.planets?.find((p: any) => p.name === 'Moon')?.sign || 'Unknown',
                rising_sign: chartData.ascendant?.sign || 'Unknown',
                planets: chartData.planets || [],
                houses: chartData.houses || [],
              },
              symbolicData: {
                primarySymbol: '🔮',
                elementalInfluence: 'Cosmic',
                cosmicAlignment: 'Harmonious',
                timing: 'Present moment',
              },
              userId,
            }),
          },
        ],
      });
      return this.parseAIInterpretation(completion.content || '');
    } catch (error) {
      devLog.error('Error generating AI interpretations:', error, 'vedicIntelligence');
      return this.getFallbackInterpretations();
    }
  }
  
  // Parse AI interpretation into structured format
  private parseAIInterpretation(aiResponse: string) {
    // Simple parsing - in production, use more sophisticated parsing
    return {
      personality: {
        overview: aiResponse.split('\n')[0] || 'Your Vedic chart reveals a unique cosmic blueprint.',
        strengths: ['Natural leadership', 'Intuitive wisdom', 'Spiritual depth'],
        challenges: ['Balancing material and spiritual', 'Managing emotions', 'Patience'],
        lifePurpose: 'To serve humanity through wisdom and compassion'
      },
      relationships: {
        compatibility: 'Strong compatibility with earth and water signs',
        marriageTiming: 'Favorable periods in your late 20s and early 30s',
        relationshipAdvice: 'Focus on emotional communication and mutual respect'
      },
      career: {
        suitableProfessions: ['Teaching', 'Healing', 'Counseling', 'Spiritual guidance'],
        careerTiming: 'Major career shifts around ages 28, 35, and 42',
        successFactors: ['Authenticity', 'Service to others', 'Spiritual practice']
      },
      health: {
        constitution: 'Pitta-Kapha constitution with strong digestive fire',
        healthTips: ['Regular meditation', 'Balanced diet', 'Adequate rest'],
        vulnerableAreas: ['Digestive system', 'Emotional balance', 'Stress management']
      },
      spirituality: {
        spiritualPath: 'Devotional path with emphasis on service and compassion',
        meditationAdvice: 'Practice daily meditation and mantra chanting',
        karmicLessons: ['Learning patience', 'Developing compassion', 'Balancing giving and receiving']
      }
    };
  }
  
  // Convert universal interpretation to Vedic format
  private convertUniversalToVedic(universalInterpretation: any) {
    // Ensure all sections have complete data with fallbacks
    const defaultPersonality = {
      overview: "Your Vedic chart reveals a balanced nature with harmonious characteristics.",
      strengths: ["Natural intuition", "Spiritual depth", "Compassionate nature", "Karmic wisdom", "Dasha awareness", "Nakshatra insight"],
      challenges: ["Managing emotions", "Patience", "Understanding karma", "Dasha transitions", "Nakshatra changes"],
      traits: ["Intuitive", "Spiritual", "Compassionate", "Wise", "Adaptable"]
    };

    const defaultLifePurpose = {
      overview: "Your dharma is to spiritual development through compassionate action",
      dharma: "Spiritual development through compassionate action",
      karmicLessons: ["Learning patience", "Developing wisdom", "Balancing material and spiritual", "Understanding service"],
      spiritualPath: "Your spiritual journey involves deepening your connection to universal wisdom and serving others with compassion."
    };

    const defaultRelationships = {
      overview: "Your beneficial planets placement suggests deep and meaningful relationships.",
      marriageTiming: "Favorable periods in your late 20s and early 30s",
      compatibility: "Strong compatibility with earth and water signs",
      familyLife: "Harmonious family relationships with opportunities for growth"
    };

    const defaultCareer = {
      overview: "Your positive house indicates success in healing and teaching.",
      suitableProfessions: ["Teaching", "Healing", "Counseling", "Spiritual guidance", "Writing"],
      successFactors: ["Authenticity", "Service to others", "Spiritual practice"],
      timing: "Major career shifts around ages 28, 35, and 42"
    };

    const defaultHealth = {
      overview: "Your constitution shows strong vitality with balanced elements.",
      constitution: "Pitta-Kapha constitution with strong digestive fire",
      healthTips: ["Regular meditation", "Balanced diet", "Adequate rest", "Stress management"],
      vulnerableAreas: ["Digestive system", "Emotional balance", "Stress-related conditions"]
    };

    const defaultSpirituality = {
      overview: "Your spiritual path is marked by deep inner wisdom and karmic understanding.",
      practices: ["Daily meditation", "Pranayama", "Study of sacred texts", "Service to others"],
      evolution: "Your soul evolution involves developing compassion and wisdom through service.",
      connection: "Your connection to the divine is strengthened through meditation and selfless service."
    };

    const defaultDasha = {
      overview: "Your current dasha period brings opportunities for spiritual growth.",
      current: "Current dasha favors spiritual development and inner wisdom.",
      upcoming: "Upcoming periods will focus on material success and relationships.",
      timing: "Favorable timing for spiritual practices and meditation."
    };

    const defaultRemedies = {
      overview: "Vedic remedies can help balance your planetary energies.",
      mantras: ["Om Namah Shivaya", "Om Gam Ganapataye Namaha", "Om Shreem Mahalakshmiyei Namaha"],
      gemstones: ["Ruby for Sun", "Pearl for Moon", "Red Coral for Mars", "Emerald for Mercury"],
      rituals: ["Daily prayer", "Meditation", "Charity", "Fasting on auspicious days"]
    };

    return {
      personality: {
        overview: universalInterpretation?.personality?.overview || defaultPersonality.overview,
        strengths: universalInterpretation?.personality?.strengths || defaultPersonality.strengths,
        challenges: universalInterpretation?.personality?.challenges || defaultPersonality.challenges,
        traits: universalInterpretation?.personality?.traits || defaultPersonality.traits
      },
      lifePurpose: {
        overview: universalInterpretation?.lifePurpose?.overview || defaultLifePurpose.overview,
        dharma: universalInterpretation?.lifePurpose?.dharma || defaultLifePurpose.dharma,
        karmicLessons: universalInterpretation?.lifePurpose?.karmicLessons || defaultLifePurpose.karmicLessons,
        spiritualPath: universalInterpretation?.lifePurpose?.spiritualPath || defaultLifePurpose.spiritualPath
      },
      relationships: {
        overview: universalInterpretation?.relationships?.overview || defaultRelationships.overview,
        marriageTiming: universalInterpretation?.relationships?.marriageTiming || defaultRelationships.marriageTiming,
        compatibility: universalInterpretation?.relationships?.compatibility || defaultRelationships.compatibility,
        familyLife: universalInterpretation?.relationships?.familyLife || defaultRelationships.familyLife
      },
      career: {
        overview: universalInterpretation?.career?.overview || defaultCareer.overview,
        suitableProfessions: universalInterpretation?.career?.suitableProfessions || defaultCareer.suitableProfessions,
        successFactors: universalInterpretation?.career?.successFactors || defaultCareer.successFactors,
        timing: universalInterpretation?.career?.careerTiming || defaultCareer.timing
      },
      health: {
        overview: universalInterpretation?.health?.overview || defaultHealth.overview,
        constitution: universalInterpretation?.health?.constitution || defaultHealth.constitution,
        healthTips: universalInterpretation?.health?.healthTips || defaultHealth.healthTips,
        vulnerableAreas: universalInterpretation?.health?.vulnerableAreas || defaultHealth.vulnerableAreas
      },
      spirituality: {
        overview: universalInterpretation?.spirituality?.overview || defaultSpirituality.overview,
        spiritualPath: universalInterpretation?.spirituality?.spiritualPath || "Devotional path with emphasis on service and wisdom",
        meditationAdvice: universalInterpretation?.spirituality?.meditationAdvice || "Practice daily meditation and mantra chanting",
        karmicLessons: universalInterpretation?.spirituality?.karmicLessons || ["patience", "discipline", "service to others"],
        practices: universalInterpretation?.remedies?.rituals || defaultSpirituality.practices,
        evolution: universalInterpretation?.lifePurpose?.soulEvolution || defaultSpirituality.evolution,
        connection: universalInterpretation?.spirituality?.divineConnection || defaultSpirituality.connection
      },
      dasha: {
        overview: universalInterpretation?.timing?.overview || defaultDasha.overview,
        current: universalInterpretation?.timing?.currentPeriod || defaultDasha.current,
        upcoming: universalInterpretation?.timing?.upcomingPeriods || defaultDasha.upcoming,
        timing: universalInterpretation?.timing?.favorableTiming || defaultDasha.timing
      },
      remedies: this.convertRemediesToArray(universalInterpretation?.remedies || defaultRemedies)
    };
  }

  // Convert remedies object to array format expected by UI
  private convertRemediesToArray(remediesData: any) {
    const remedyArray = [];
    
    // Add mantras
    if (remediesData.mantras && Array.isArray(remediesData.mantras)) {
      remedyArray.push({
        type: 'mantra',
        name: 'Gayatri Mantra',
        description: 'Universal spiritual practice',
        instructions: 'Chant Gayatri Mantra 108 times daily',
        timing: 'Sunrise and sunset'
      });
    }
    
    // Add lifestyle practices
    if (remediesData.lifestyle && Array.isArray(remediesData.lifestyle)) {
      remedyArray.push({
        type: 'lifestyle',
        name: 'Daily Meditation',
        description: 'Spiritual practice',
        instructions: 'Practice 20 minutes of meditation daily',
        timing: 'Early morning or evening'
      });
    }
    
    // Add gemstones if available
    if (remediesData.gemstones && Array.isArray(remediesData.gemstones) && remediesData.gemstones.length > 0) {
      remedyArray.push({
        type: 'gemstone',
        name: remediesData.gemstones[0] || 'Ruby',
        description: 'Enhance planetary energy',
        instructions: 'Wear during auspicious times',
        timing: 'During favorable planetary hours'
      });
    }
    
    // Add rituals if available
    if (remediesData.rituals && Array.isArray(remediesData.rituals) && remediesData.rituals.length > 0) {
      remedyArray.push({
        type: 'ritual',
        name: remediesData.rituals[0] || 'Daily Prayer',
        description: 'Spiritual practice',
        instructions: 'Perform daily prayers and offerings',
        timing: 'Morning and evening'
      });
    }
    
    return remedyArray;
  }

  // Merge AI interpretations with fallback data
  private mergeInterpretations(fallback: any, aiEnhancement: any) {
    return {
      personality: {
        overview: aiEnhancement.personality?.overview || fallback.personality?.overview,
        strengths: [
          ...(fallback.personality?.strengths || []),
          ...(aiEnhancement.personality?.strengths || [])
        ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 6), // Remove duplicates, keep top 6
        challenges: [
          ...(fallback.personality?.challenges || []),
          ...(aiEnhancement.personality?.challenges || [])
        ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 6),
        traits: aiEnhancement.personality?.traits || fallback.personality?.traits
      },
      lifePurpose: {
        overview: aiEnhancement.lifePurpose?.overview || fallback.lifePurpose?.overview,
        dharma: aiEnhancement.lifePurpose?.dharma || fallback.lifePurpose?.dharma,
        karmicLessons: [
          ...(fallback.lifePurpose?.karmicLessons || []),
          ...(aiEnhancement.lifePurpose?.karmicLessons || [])
        ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5),
        spiritualPath: aiEnhancement.lifePurpose?.spiritualPath || fallback.lifePurpose?.spiritualPath
      },
      relationships: {
        overview: aiEnhancement.relationships?.overview || fallback.relationships?.overview,
        marriageTiming: aiEnhancement.relationships?.marriageTiming || fallback.relationships?.marriageTiming,
        compatibility: aiEnhancement.relationships?.compatibility || fallback.relationships?.compatibility,
        familyLife: aiEnhancement.relationships?.familyLife || fallback.relationships?.familyLife
      },
      career: {
        overview: aiEnhancement.career?.overview || fallback.career?.overview,
        suitableProfessions: [
          ...(fallback.career?.suitableProfessions || []),
          ...(aiEnhancement.career?.suitableProfessions || [])
        ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 8),
        successFactors: [
          ...(fallback.career?.successFactors || []),
          ...(aiEnhancement.career?.successFactors || [])
        ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 6),
        timing: aiEnhancement.career?.timing || fallback.career?.timing
      },
      health: {
        overview: aiEnhancement.health?.overview || fallback.health?.overview,
        constitution: aiEnhancement.health?.constitution || fallback.health?.constitution,
        healthTips: [
          ...(fallback.health?.healthTips || []),
          ...(aiEnhancement.health?.healthTips || [])
        ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 8),
        vulnerableAreas: [
          ...(fallback.health?.vulnerableAreas || []),
          ...(aiEnhancement.health?.vulnerableAreas || [])
        ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 6)
      },
      spirituality: {
        overview: aiEnhancement.spirituality?.overview || fallback.spirituality?.overview,
        practices: [
          ...(fallback.spirituality?.practices || []),
          ...(aiEnhancement.spirituality?.practices || [])
        ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5),
        evolution: aiEnhancement.spirituality?.evolution || fallback.spirituality?.evolution,
        connection: aiEnhancement.spirituality?.connection || fallback.spirituality?.connection
      },
      dasha: fallback.dasha || {},
      remedies: fallback.remedies || {}
    };
  }

  // Generate Vedic remedies
  private generateVedicRemedies(chartData: any) {
    const remedies = [];
    
    // Sun remedies
    if (chartData.planets?.find((p: any) => p.name === 'Sun')?.house === 12) {
      remedies.push({
        type: 'mantra' as const,
        name: 'Surya Mantra',
        description: 'Strengthen Sun energy',
        instructions: 'Chant "Om Suryaya Namah" 108 times daily at sunrise',
        timing: 'Sunrise (6-8 AM)'
      });
    }
    
    // Moon remedies
    if (chartData.planets?.find((p: any) => p.name === 'Moon')?.house === 8) {
      remedies.push({
        type: 'gemstone' as const,
        name: 'Pearl',
        description: 'Balance Moon energy',
        instructions: 'Wear pearl ring on right hand little finger',
        timing: 'Monday mornings'
      });
    }
    
    // Mars remedies
    if (chartData.planets?.find((p: any) => p.name === 'Mars')?.house === 6) {
      remedies.push({
        type: 'ritual' as const,
        name: 'Mars Puja',
        description: 'Honor Mars energy',
        instructions: 'Offer red flowers and red cloth to Mars',
        timing: 'Tuesday evenings'
      });
    }
    
    // Default remedies if none generated
    if (remedies.length === 0) {
      remedies.push(
        {
          type: 'mantra' as const,
          name: 'Gayatri Mantra',
          description: 'Universal spiritual practice',
          instructions: 'Chant Gayatri Mantra 108 times daily',
          timing: 'Sunrise and sunset'
        },
        {
          type: 'lifestyle' as const,
          name: 'Daily Meditation',
          description: 'Spiritual practice',
          instructions: 'Practice 20 minutes of meditation daily',
          timing: 'Early morning or evening'
        }
      );
    }
    
    return remedies;
  }
  
  // Fallback data when APIs fail
  private getFallbackVedicData() {
    return {
      ascendant: { sign: 'Aries', degree: 15.5, lord: 'Mars' },
      planets: [
        { name: 'Sun', sign: 'Aries', degree: 15.5, house: 1, nakshatra: 'Bharani', pada: 1, isRetrograde: false, lord: 'Mars' },
        { name: 'Moon', sign: 'Cancer', degree: 8.3, house: 4, nakshatra: 'Pushya', pada: 2, isRetrograde: false, lord: 'Moon' },
        { name: 'Mars', sign: 'Scorpio', degree: 15.7, house: 7, nakshatra: 'Anuradha', pada: 3, isRetrograde: false, lord: 'Mars' },
        { name: 'Mercury', sign: 'Libra', degree: 22.1, house: 6, nakshatra: 'Swati', pada: 4, isRetrograde: false, lord: 'Mercury' },
        { name: 'Jupiter', sign: 'Pisces', degree: 18.9, house: 12, nakshatra: 'Revati', pada: 1, isRetrograde: false, lord: 'Jupiter' },
        { name: 'Venus', sign: 'Leo', degree: 6.4, house: 4, nakshatra: 'Magha', pada: 2, isRetrograde: false, lord: 'Venus' },
        { name: 'Saturn', sign: 'Aquarius', degree: 11.2, house: 11, nakshatra: 'Dhanishta', pada: 3, isRetrograde: false, lord: 'Saturn' }
      ],
      houses: [
        { number: 1, sign: 'Aries', degree: 15.5, lord: 'Mars' },
        { number: 2, sign: 'Taurus', degree: 45.5, lord: 'Venus' },
        { number: 3, sign: 'Gemini', degree: 75.5, lord: 'Mercury' },
        { number: 4, sign: 'Cancer', degree: 105.5, lord: 'Moon' },
        { number: 5, sign: 'Leo', degree: 135.5, lord: 'Sun' },
        { number: 6, sign: 'Virgo', degree: 165.5, lord: 'Mercury' },
        { number: 7, sign: 'Libra', degree: 195.5, lord: 'Venus' },
        { number: 8, sign: 'Scorpio', degree: 225.5, lord: 'Mars' },
        { number: 9, sign: 'Sagittarius', degree: 255.5, lord: 'Jupiter' },
        { number: 10, sign: 'Capricorn', degree: 285.5, lord: 'Saturn' },
        { number: 11, sign: 'Aquarius', degree: 315.5, lord: 'Saturn' },
        { number: 12, sign: 'Pisces', degree: 345.5, lord: 'Jupiter' }
      ],
      dasha: [
        { planet: 'Sun', startDate: '2020-01-01', endDate: '2026-01-01', duration: 6, isCurrent: true, progress: 65 },
        { planet: 'Moon', startDate: '2026-01-01', endDate: '2036-01-01', duration: 10, isCurrent: false, progress: 0 },
        { planet: 'Mars', startDate: '2036-01-01', endDate: '2043-01-01', duration: 7, isCurrent: false, progress: 0 }
      ],
      currentDasha: {
        planet: 'Sun',
        startDate: '2020-01-01',
        endDate: '2026-01-01',
        duration: 6,
        progress: 65
      }
    };
  }
  
  private getFallbackInterpretations() {
    return {
      personality: {
        overview: `Your Vedic birth chart reveals a fascinating cosmic blueprint that speaks to your unique journey through life. The ancient sages understood that each person's birth moment creates a celestial fingerprint, and yours tells a story of deep spiritual potential combined with practical wisdom. Your chart suggests someone who is naturally drawn to understanding the deeper mysteries of existence while maintaining a strong connection to earthly responsibilities. This dual nature - the seeker and the doer - defines your core personality and shapes how you interact with the world around you. You possess an innate ability to see beyond surface appearances and understand the underlying currents that move people and situations. This intuitive depth, combined with your natural leadership qualities, makes you someone others naturally turn to for guidance and support.`,
        strengths: [
          'Natural leadership abilities that inspire and motivate others',
          'Deep intuitive wisdom that allows you to see beyond surface appearances',
          'Strong spiritual foundation that provides inner stability and purpose',
          'Compassionate nature that makes you a natural healer and counselor',
          'Excellent communication skills that help you bridge different perspectives',
          'Resilient spirit that can overcome challenges with grace and determination'
        ],
        challenges: [
          'Balancing your spiritual aspirations with practical material needs',
          'Managing the intensity of your emotions and not becoming overwhelmed',
          'Developing patience with others who may not share your depth of understanding',
          'Learning to set healthy boundaries to avoid emotional exhaustion',
          'Trusting your intuition while also using logical analysis when needed',
          'Avoiding perfectionism and accepting that growth is a gradual process'
        ],
        lifePurpose: `Your life purpose is beautifully aligned with the ancient Vedic principle of Dharma - your righteous duty in this lifetime. You are here to serve as a bridge between the spiritual and material worlds, helping others find meaning and purpose in their own journeys. Your unique combination of intuitive wisdom and practical skills positions you to be a guide, teacher, or healer in whatever field you choose. Whether through direct service, creative expression, or leadership roles, your purpose involves elevating the consciousness of those around you while maintaining your own spiritual growth. The universe has given you the tools to make a significant positive impact on the world, and your challenge is to trust in your abilities and step forward with confidence.`
      },
      relationships: {
        compatibility: `In relationships, you seek deep, meaningful connections that go beyond superficial attraction. You're naturally compatible with partners who share your spiritual depth and intellectual curiosity. Earth signs (Taurus, Virgo, Capricorn) provide the stability and grounding you need, while water signs (Cancer, Scorpio, Pisces) understand your emotional depth and intuitive nature. Fire signs (Aries, Leo, Sagittarius) can bring excitement and adventure, but you may need to work on communication to avoid conflicts. Air signs (Gemini, Libra, Aquarius) stimulate your mind but may need more emotional connection to satisfy your deeper needs. The most fulfilling relationships for you are those where both partners grow spiritually and emotionally together.`,
        marriageTiming: `The cosmos suggests particularly favorable periods for marriage and committed relationships during your late twenties and early thirties. Around age 28-30, planetary transits will create opportunities for deep emotional connections and lasting partnerships. Age 32-35 represents another powerful window where you may meet someone who truly understands your spiritual nature and life goals. However, remember that the right relationship can happen at any time when you're aligned with your highest self. Focus on becoming the person you want to attract, and the universe will respond accordingly.`,
        relationshipAdvice: `Your success in relationships depends on maintaining authentic communication and emotional transparency. You have a tendency to keep your deepest feelings private, but sharing your inner world with a trusted partner will deepen your connection. Practice active listening and empathy, as your intuitive abilities make you naturally skilled at understanding others' emotions. Set healthy boundaries to avoid becoming overly responsible for your partner's emotional well-being. Remember that a healthy relationship involves two complete individuals choosing to grow together, not two incomplete people trying to complete each other.`
      },
      career: {
        suitableProfessions: [
          'Teaching and Education - Your natural wisdom and communication skills make you an excellent educator',
          'Healing and Healthcare - Your compassionate nature and intuitive abilities serve well in healing professions',
          'Counseling and Therapy - Your depth of understanding helps others navigate their emotional landscapes',
          'Spiritual Guidance - Your connection to higher wisdom qualifies you to guide others on their spiritual paths',
          'Writing and Communication - Your ability to bridge complex concepts makes you an effective communicator',
          'Leadership and Management - Your natural authority and wisdom inspire others to follow your lead',
          'Creative Arts - Your spiritual depth can be expressed through various artistic mediums',
          'Social Work and Service - Your compassionate nature drives you to help those in need'
        ],
        careerTiming: `Your career will unfold in distinct phases marked by significant growth opportunities. Around age 28, you'll experience a major shift that aligns your work more closely with your spiritual values and life purpose. Age 35 brings another powerful transition where you may step into a leadership role or start your own venture that allows you to express your unique gifts. Age 42 represents a pinnacle period where your accumulated wisdom and experience will be recognized and rewarded. These aren't just arbitrary ages - they correspond to important planetary cycles in your chart that support your professional evolution.`,
        successFactors: [
          'Authenticity - Being true to your spiritual nature and values in all professional interactions',
          'Service orientation - Focusing on how your work serves others and contributes to the greater good',
          'Continuous learning - Maintaining your spiritual practice and expanding your knowledge base',
          'Emotional intelligence - Using your intuitive abilities to understand and connect with colleagues and clients',
          'Patience and persistence - Trusting the process and not forcing outcomes before their time',
          'Integrity - Maintaining high ethical standards even when facing challenges or temptations'
        ]
      },
      health: {
        constitution: `According to Ayurvedic principles, your constitution shows a Pitta-Kapha dominance, which means you have a strong digestive fire (Pitta) balanced by earth and water elements (Kapha). This gives you good stamina and resilience, but you may be prone to imbalances when stress accumulates. Your strong digestive system allows you to process both food and life experiences effectively, but you need to be mindful of not overworking your system. The Kapha influence provides you with natural strength and endurance, but you may need to stay active to prevent stagnation. Your constitution supports both mental clarity and emotional stability, making you naturally suited for roles that require both intellectual and intuitive abilities.`,
        healthTips: [
          'Practice daily meditation to maintain mental clarity and emotional balance',
          'Follow a balanced diet that includes all six tastes (sweet, sour, salty, bitter, pungent, astringent)',
          'Ensure adequate rest and sleep, as your active mind needs time to recharge',
          'Engage in regular physical exercise to balance your Kapha nature and maintain vitality',
          'Spend time in nature to ground your spiritual energy and connect with natural rhythms',
          'Practice pranayama (breathing exercises) to balance your Pitta fire and calm your nervous system',
          'Maintain regular meal times to support your strong digestive system',
          'Consider seasonal cleansing practices to remove accumulated toxins and restore balance'
        ],
        vulnerableAreas: [
          'Digestive system - Your strong Pitta can become aggravated by stress, spicy foods, or irregular eating',
          'Emotional balance - Your deep sensitivity can lead to emotional overwhelm if not properly managed',
          'Stress management - Your high standards and spiritual aspirations can create internal pressure',
          'Sleep quality - Your active mind may interfere with restful sleep if not properly balanced',
          'Skin health - Pitta imbalances can manifest as skin irritations or inflammations',
          'Blood pressure - Stress and emotional intensity can affect cardiovascular health over time'
        ]
      },
      spirituality: {
        spiritualPath: `Your spiritual journey follows the path of Bhakti Yoga - the yoga of devotion and love. This doesn't necessarily mean religious devotion, but rather a deep love and reverence for the divine essence that flows through all of life. Your natural inclination toward service and compassion aligns perfectly with this path. You're drawn to practices that connect you with something greater than yourself while also serving others. This might manifest as traditional religious practices, meditation, nature connection, creative expression, or acts of service. The key is finding practices that resonate with your heart and help you feel connected to the universal flow of love and wisdom. Your spiritual path is not about escaping the world but about transforming it through your presence and actions.`,
        meditationAdvice: `Your meditation practice should honor both your intellectual nature and your intuitive abilities. Start with grounding techniques that connect you with the earth element, such as walking meditation or body awareness practices. Incorporate heart-centered meditations that open your natural compassion and love. Mantra meditation can be particularly powerful for you, as the vibrational qualities of sacred sounds help balance your mental activity. Consider practicing loving-kindness meditation (Metta) to enhance your natural compassion. Don't force long sessions - even 10-15 minutes of quality practice is more valuable than struggling through longer periods. Create a dedicated space for your practice and maintain consistency rather than intensity.`,
        karmicLessons: [
          'Learning patience with yourself and others - understanding that growth happens in divine timing',
          'Developing healthy boundaries - learning to give without depleting yourself',
          'Balancing idealism with practicality - bringing your spiritual insights into daily life',
          'Trusting your intuition while maintaining discernment - knowing when to act on inner guidance',
          'Accepting imperfection in yourself and others - embracing the human experience with compassion',
          'Learning to receive as well as give - allowing others to support and nurture you',
          'Integrating your spiritual wisdom with worldly responsibilities - finding the middle path',
          'Cultivating gratitude for all experiences - seeing challenges as opportunities for growth'
        ]
      }
    };
  }
}

// Export singleton instance
export const vedicIntelligence = new VedicIntelligence();

// Main function for external use
export async function getVedicReading(
  userId: string,
  birthDate: string,
  birthTime: string,
  birthPlace: string,
  latitude: number,
  longitude: number,
  forceRefresh: boolean = false,
  useAIEnhancement: boolean = false
): Promise<VedicReading> {
  // Normalize birth date and time inputs
  const normalizedBirthDate = normalizeDateString(birthDate);
  const normalizedBirthTime = normalizeTimeString(birthTime);
  
  return vedicIntelligence.getIntelligentVedicData(
    userId,
    normalizedBirthDate,
    normalizedBirthTime,
    birthPlace,
    latitude,
    longitude,
    forceRefresh,
    useAIEnhancement
  );
}
