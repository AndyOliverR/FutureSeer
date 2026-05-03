import { ThirteenSignsAnalysis, BirthData, ZodiacSign, CompatibilityMatch } from '@/hooks/useThirteenSignsZodiac'
import { devLog } from '@/lib/devLogger';

class ThirteenSignsZodiacIntelligence {
  private zodiacSigns: ZodiacSign[] = [
    {
      name: "Aries",
      symbol: "♈",
      element: "Fire",
      quality: "Cardinal",
      ruler: "Mars",
      dates: "Mar 21 - Apr 19",
      traits: ["Courageous", "Energetic", "Pioneering", "Independent", "Impulsive"],
      description: "The first sign of the zodiac, Aries represents new beginnings, leadership, and raw energy."
    },
    {
      name: "Taurus",
      symbol: "♉",
      element: "Earth",
      quality: "Fixed",
      ruler: "Venus",
      dates: "Apr 20 - May 20",
      traits: ["Reliable", "Patient", "Practical", "Devoted", "Persistent"],
      description: "Taurus represents stability, sensuality, and a deep connection to the material world."
    },
    {
      name: "Gemini",
      symbol: "♊",
      element: "Air",
      quality: "Mutable",
      ruler: "Mercury",
      dates: "May 21 - Jun 20",
      traits: ["Adaptable", "Versatile", "Communicative", "Witty", "Intellectual"],
      description: "Gemini represents communication, curiosity, and the duality of human nature."
    },
    {
      name: "Cancer",
      symbol: "♋",
      element: "Water",
      quality: "Cardinal",
      ruler: "Moon",
      dates: "Jun 21 - Jul 22",
      traits: ["Nurturing", "Protective", "Intuitive", "Emotional", "Sympathetic"],
      description: "Cancer represents home, family, and deep emotional connections."
    },
    {
      name: "Leo",
      symbol: "♌",
      element: "Fire",
      quality: "Fixed",
      ruler: "Sun",
      dates: "Jul 23 - Aug 22",
      traits: ["Creative", "Passionate", "Generous", "Warm-hearted", "Cheerful"],
      description: "Leo represents self-expression, leadership, and the desire to be recognized."
    },
    {
      name: "Virgo",
      symbol: "♍",
      element: "Earth",
      quality: "Mutable",
      ruler: "Mercury",
      dates: "Aug 23 - Sep 22",
      traits: ["Analytical", "Kind", "Hardworking", "Practical", "Modest"],
      description: "Virgo represents service, perfectionism, and attention to detail."
    },
    {
      name: "Libra",
      symbol: "♎",
      element: "Air",
      quality: "Cardinal",
      ruler: "Venus",
      dates: "Sep 23 - Oct 22",
      traits: ["Diplomatic", "Gracious", "Fair-minded", "Social", "Peaceful"],
      description: "Libra represents balance, harmony, and the pursuit of justice."
    },
    {
      name: "Scorpio",
      symbol: "♏",
      element: "Water",
      quality: "Fixed",
      ruler: "Pluto",
      dates: "Oct 23 - Nov 21",
      traits: ["Passionate", "Assertive", "Determined", "Magnetic", "Strategic"],
      description: "Scorpio represents transformation, power, and deep emotional intensity."
    },
    {
      name: "Sagittarius",
      symbol: "♐",
      element: "Fire",
      quality: "Mutable",
      ruler: "Jupiter",
      dates: "Nov 22 - Dec 21",
      traits: ["Optimistic", "Adventurous", "Independent", "Honest", "Philosophical"],
      description: "Sagittarius represents expansion, wisdom, and the quest for truth."
    },
    {
      name: "Ophiuchus",
      symbol: "🐍",
      element: "Fire",
      quality: "Fixed",
      ruler: "Chiron",
      dates: "Nov 29 - Dec 17",
      traits: ["Healing", "Wise", "Mysterious", "Transformative", "Intuitive"],
      description: "The 13th sign, Ophiuchus represents healing, wisdom, and spiritual transformation."
    },
    {
      name: "Capricorn",
      symbol: "♑",
      element: "Earth",
      quality: "Cardinal",
      ruler: "Saturn",
      dates: "Dec 18 - Jan 19",
      traits: ["Responsible", "Disciplined", "Self-controlled", "Ambitious", "Patient"],
      description: "Capricorn represents ambition, discipline, and the pursuit of success."
    },
    {
      name: "Aquarius",
      symbol: "♒",
      element: "Air",
      quality: "Fixed",
      ruler: "Uranus",
      dates: "Jan 20 - Feb 18",
      traits: ["Progressive", "Original", "Independent", "Humanitarian", "Intellectual"],
      description: "Aquarius represents innovation, freedom, and humanitarian ideals."
    },
    {
      name: "Pisces",
      symbol: "♓",
      element: "Water",
      quality: "Mutable",
      ruler: "Neptune",
      dates: "Feb 19 - Mar 20",
      traits: ["Compassionate", "Artistic", "Intuitive", "Gentle", "Musical"],
      description: "Pisces represents spirituality, compassion, and connection to the divine."
    }
  ]

  private compatibilityMatrix: Record<string, Record<string, number>> = {
    Aries: { Aries: 70, Taurus: 40, Gemini: 80, Cancer: 50, Leo: 90, Virgo: 30, Libra: 60, Scorpio: 70, Sagittarius: 90, Ophiuchus: 75, Capricorn: 40, Aquarius: 80, Pisces: 50 },
    Taurus: { Aries: 40, Taurus: 80, Gemini: 50, Cancer: 90, Leo: 60, Virgo: 90, Libra: 70, Scorpio: 80, Sagittarius: 40, Ophiuchus: 65, Capricorn: 90, Aquarius: 50, Pisces: 80 },
    Gemini: { Aries: 80, Taurus: 50, Gemini: 70, Cancer: 40, Leo: 80, Virgo: 60, Libra: 90, Scorpio: 50, Sagittarius: 80, Ophiuchus: 85, Capricorn: 50, Aquarius: 90, Pisces: 60 },
    Cancer: { Aries: 50, Taurus: 90, Gemini: 40, Cancer: 80, Leo: 70, Virgo: 80, Libra: 50, Scorpio: 90, Sagittarius: 40, Ophiuchus: 70, Capricorn: 80, Aquarius: 40, Pisces: 90 },
    Leo: { Aries: 90, Taurus: 60, Gemini: 80, Cancer: 70, Leo: 80, Virgo: 50, Libra: 80, Scorpio: 60, Sagittarius: 90, Ophiuchus: 80, Capricorn: 60, Aquarius: 70, Pisces: 60 },
    Virgo: { Aries: 30, Taurus: 90, Gemini: 60, Cancer: 80, Leo: 50, Virgo: 80, Libra: 60, Scorpio: 80, Sagittarius: 30, Ophiuchus: 60, Capricorn: 90, Aquarius: 60, Pisces: 80 },
    Libra: { Aries: 60, Taurus: 70, Gemini: 90, Cancer: 50, Leo: 80, Virgo: 60, Libra: 80, Scorpio: 70, Sagittarius: 60, Ophiuchus: 75, Capricorn: 70, Aquarius: 80, Pisces: 70 },
    Scorpio: { Aries: 70, Taurus: 80, Gemini: 50, Cancer: 90, Leo: 60, Virgo: 80, Libra: 70, Scorpio: 80, Sagittarius: 70, Ophiuchus: 85, Capricorn: 80, Aquarius: 50, Pisces: 90 },
    Sagittarius: { Aries: 90, Taurus: 40, Gemini: 80, Cancer: 40, Leo: 90, Virgo: 30, Libra: 60, Scorpio: 70, Sagittarius: 80, Ophiuchus: 90, Capricorn: 40, Aquarius: 80, Pisces: 60 },
    Ophiuchus: { Aries: 75, Taurus: 65, Gemini: 85, Cancer: 70, Leo: 80, Virgo: 60, Libra: 75, Scorpio: 85, Sagittarius: 90, Ophiuchus: 85, Capricorn: 65, Aquarius: 85, Pisces: 75 },
    Capricorn: { Aries: 40, Taurus: 90, Gemini: 50, Cancer: 80, Leo: 60, Virgo: 90, Libra: 70, Scorpio: 80, Sagittarius: 40, Ophiuchus: 65, Capricorn: 80, Aquarius: 70, Pisces: 80 },
    Aquarius: { Aries: 80, Taurus: 50, Gemini: 90, Cancer: 40, Leo: 70, Virgo: 60, Libra: 80, Scorpio: 50, Sagittarius: 80, Ophiuchus: 85, Capricorn: 70, Aquarius: 80, Pisces: 70 },
    Pisces: { Aries: 50, Taurus: 80, Gemini: 60, Cancer: 90, Leo: 60, Virgo: 80, Libra: 70, Scorpio: 90, Sagittarius: 60, Ophiuchus: 75, Capricorn: 80, Aquarius: 70, Pisces: 80 }
  }

  async performThirteenSignsAnalysis(birthData: BirthData): Promise<ThirteenSignsAnalysis> {
    try {
      // Generate planetary positions (simplified for demo)
      const signs = this.generatePlanetaryPositions(birthData)
      
      // Generate overview
      const overview = this.generateOverview(signs, birthData.focus)
      
      // Generate compatibility
      const compatibility = this.generateCompatibility(signs.sun)
      
      // Generate personality
      const personality = this.generatePersonality(signs, birthData.focus)
      
      // Generate career
      const career = this.generateCareer(signs, birthData.focus)
      
      // Generate health
      const health = this.generateHealth(signs, birthData.focus)
      
      // Generate advice
      const advice = this.generateAdvice(signs, birthData.focus)

      return {
        overview,
        signs,
        compatibility,
        personality,
        career,
        health,
        advice
      }
    } catch (error) {
      devLog.error('13 Signs analysis error:', error, 'thirteenSignsZodiacIntelligence')
      throw new Error('Failed to perform 13 signs analysis')
    }
  }

  private generatePlanetaryPositions(birthData: BirthData) {
    // Simplified planetary position generation
    const signNames = this.zodiacSigns.map(sign => sign.name)
    
    return {
      sun: this.zodiacSigns[Math.floor(Math.random() * this.zodiacSigns.length)],
      moon: this.zodiacSigns[Math.floor(Math.random() * this.zodiacSigns.length)],
      rising: this.zodiacSigns[Math.floor(Math.random() * this.zodiacSigns.length)],
      mercury: this.zodiacSigns[Math.floor(Math.random() * this.zodiacSigns.length)],
      venus: this.zodiacSigns[Math.floor(Math.random() * this.zodiacSigns.length)],
      mars: this.zodiacSigns[Math.floor(Math.random() * this.zodiacSigns.length)]
    }
  }

  private generateOverview(signs: any, focus: string): any {
    const primarySign = signs.sun
    const secondarySign = signs.moon
    
    let summary = ''
    if (primarySign.name === 'Ophiuchus') {
      summary = `As an Ophiuchus, you embody the rare qualities of a healer and wisdom seeker. Your ${secondarySign.name} Moon adds emotional depth to your transformative nature.`
    } else {
      summary = `Your ${primarySign.name} Sun sign represents your core identity, while your ${secondarySign.name} Moon reveals your emotional nature.`
    }
    
    const keyTraits = [...primarySign.traits.slice(0, 3), ...secondarySign.traits.slice(0, 2)]
    const uniqueCharacteristics = this.getUniqueCharacteristics(primarySign, secondarySign)
    
    return {
      primarySign,
      secondarySign,
      summary,
      keyTraits,
      uniqueCharacteristics
    }
  }

  private getUniqueCharacteristics(primary: ZodiacSign, secondary: ZodiacSign): string[] {
    const characteristics: string[] = []
    
    if (primary.name === 'Ophiuchus') {
      characteristics.push('Natural healing abilities and intuitive wisdom')
      characteristics.push('Deep connection to spiritual transformation')
      characteristics.push('Ability to see through deception and illusion')
    }
    
    if (primary.element === secondary.element) {
      characteristics.push(`Strong ${primary.element} energy throughout your personality`)
    } else {
      characteristics.push(`Balanced ${primary.element} and ${secondary.element} energies`)
    }
    
    if (primary.quality === 'Cardinal' && secondary.quality === 'Fixed') {
      characteristics.push('Natural leadership with determination')
    }
    
    return characteristics
  }

  private generateCompatibility(sunSign: ZodiacSign): any {
    const compatibilities = this.compatibilityMatrix[sunSign.name] || {}
    const matches: CompatibilityMatch[] = []
    
    Object.entries(compatibilities).forEach(([sign, percentage]) => {
      const match: CompatibilityMatch = {
        sign,
        compatibility: percentage >= 80 ? 'excellent' : percentage >= 60 ? 'good' : percentage >= 40 ? 'fair' : 'challenging',
        percentage,
        description: this.getCompatibilityDescription(sunSign.name, sign, percentage),
        strengths: this.getCompatibilityStrengths(sunSign.name, sign),
        challenges: this.getCompatibilityChallenges(sunSign.name, sign)
      }
      matches.push(match)
    })
    
    const bestMatches = matches.filter(m => m.compatibility === 'excellent').slice(0, 3)
    const goodMatches = matches.filter(m => m.compatibility === 'good').slice(0, 3)
    const challengingMatches = matches.filter(m => m.compatibility === 'challenging').slice(0, 3)
    
    return {
      bestMatches,
      goodMatches,
      challengingMatches,
      overallCompatibility: this.getOverallCompatibilityDescription(sunSign.name, matches)
    }
  }

  private getCompatibilityDescription(sign1: string, sign2: string, percentage: number): string {
    if (percentage >= 80) {
      return `${sign1} and ${sign2} have exceptional compatibility with natural harmony and understanding.`
    } else if (percentage >= 60) {
      return `${sign1} and ${sign2} have good compatibility with potential for growth and learning.`
    } else if (percentage >= 40) {
      return `${sign1} and ${sign2} have fair compatibility requiring effort and compromise.`
    } else {
      return `${sign1} and ${sign2} have challenging compatibility that may require significant work.`
    }
  }

  private getCompatibilityStrengths(sign1: string, sign2: string): string[] {
    const strengths = [
      'Mutual respect and understanding',
      'Complementary personality traits',
      'Shared values and goals',
      'Balanced energy exchange'
    ]
    return strengths.slice(0, 2)
  }

  private getCompatibilityChallenges(sign1: string, sign2: string): string[] {
    const challenges = [
      'Different communication styles',
      'Conflicting priorities',
      'Emotional expression differences',
      'Life pace variations'
    ]
    return challenges.slice(0, 2)
  }

  private getOverallCompatibilityDescription(sign: string, matches: CompatibilityMatch[]): string {
    const excellentCount = matches.filter(m => m.compatibility === 'excellent').length
    const goodCount = matches.filter(m => m.compatibility === 'good').length
    
    if (excellentCount >= 5) {
      return `${sign} has excellent compatibility with most signs, making you naturally harmonious in relationships.`
    } else if (goodCount >= 5) {
      return `${sign} has good compatibility with many signs, showing adaptability in relationships.`
    } else {
      return `${sign} has selective compatibility, indicating the importance of choosing partners carefully.`
    }
  }

  private generatePersonality(signs: any, focus: string): any {
    const sunSign = signs.sun
    const moonSign = signs.moon
    const risingSign = signs.rising
    
    const coreTraits = [...sunSign.traits, ...moonSign.traits.slice(0, 2)]
    const strengths = this.getPersonalityStrengths(sunSign, moonSign, risingSign)
    const weaknesses = this.getPersonalityWeaknesses(sunSign, moonSign, risingSign)
    const growthAreas = this.getGrowthAreas(sunSign, moonSign, risingSign)
    const lifePath = this.getLifePath(sunSign, moonSign, risingSign)
    
    return {
      coreTraits,
      strengths,
      weaknesses,
      growthAreas,
      lifePath
    }
  }

  private getPersonalityStrengths(sun: ZodiacSign, moon: ZodiacSign, rising: ZodiacSign): string[] {
    const strengths: string[] = []
    
    if (sun.name === 'Ophiuchus') {
      strengths.push('Natural healing and intuitive abilities')
      strengths.push('Deep wisdom and spiritual insight')
      strengths.push('Transformative influence on others')
    }
    
    strengths.push(`Strong ${sun.element} energy for ${sun.traits[0].toLowerCase()} expression`)
    strengths.push(`Emotional ${moon.traits[0].toLowerCase()} from ${moon.name} Moon`)
    strengths.push(`Natural ${rising.traits[0].toLowerCase()} presence`)
    
    return strengths
  }

  private getPersonalityWeaknesses(sun: ZodiacSign, moon: ZodiacSign, rising: ZodiacSign): string[] {
    const weaknesses: string[] = []
    
    if (sun.quality === 'Fixed') {
      weaknesses.push('Can be stubborn and resistant to change')
    }
    if (sun.quality === 'Cardinal') {
      weaknesses.push('May be impulsive and impatient')
    }
    if (sun.quality === 'Mutable') {
      weaknesses.push('Can be indecisive and easily influenced')
    }
    
    return weaknesses
  }

  private getGrowthAreas(sun: ZodiacSign, moon: ZodiacSign, rising: ZodiacSign): string[] {
    const growthAreas: string[] = []
    
    if (sun.element === 'Fire') {
      growthAreas.push('Developing patience and emotional balance')
    }
    if (sun.element === 'Earth') {
      growthAreas.push('Embracing change and spontaneity')
    }
    if (sun.element === 'Air') {
      growthAreas.push('Grounding ideas in practical action')
    }
    if (sun.element === 'Water') {
      growthAreas.push('Setting healthy emotional boundaries')
    }
    
    return growthAreas
  }

  private getLifePath(sun: ZodiacSign, moon: ZodiacSign, rising: ZodiacSign): string {
    if (sun.name === 'Ophiuchus') {
      return 'Your life path involves healing others and sharing your wisdom through transformation and spiritual guidance.'
    }
    
    const paths: Record<string, string> = {
      Aries: 'Leadership and pioneering new paths for others to follow',
      Taurus: 'Building stability and creating lasting value in the world',
      Gemini: 'Communication and connecting people through knowledge and ideas',
      Cancer: 'Nurturing and creating safe spaces for emotional growth',
      Leo: 'Inspiring others through creative expression and leadership',
      Virgo: 'Serving others through attention to detail and practical help',
      Libra: 'Creating harmony and balance in relationships and society',
      Scorpio: 'Transforming situations and people through deep understanding',
      Sagittarius: 'Expanding horizons and sharing wisdom through teaching',
      Capricorn: 'Building structures and achieving success through discipline',
      Aquarius: 'Innovating and bringing progressive change to society',
      Pisces: 'Spiritual service and connecting others to divine inspiration'
    }
    
    return paths[sun.name] || 'Your life path involves personal growth and self-discovery.'
  }

  private generateCareer(signs: any, focus: string): any {
    const sunSign = signs.sun
    const mercurySign = signs.mercury
    
    const idealProfessions = this.getIdealProfessions(sunSign, mercurySign)
    const workStyle = this.getWorkStyle(sunSign, mercurySign)
    const leadershipQualities = this.getLeadershipQualities(sunSign)
    const successFactors = this.getSuccessFactors(sunSign, mercurySign)
    
    return {
      idealProfessions,
      workStyle,
      leadershipQualities,
      successFactors
    }
  }

  private getIdealProfessions(sun: ZodiacSign, mercury: ZodiacSign): string[] {
    const professions: Record<string, string[]> = {
      Aries: ['Entrepreneur', 'Athlete', 'Military Officer', 'Sales Manager', 'Emergency Responder'],
      Taurus: ['Financial Advisor', 'Chef', 'Architect', 'Real Estate Agent', 'Gardener'],
      Gemini: ['Journalist', 'Teacher', 'Marketing Specialist', 'Translator', 'Travel Agent'],
      Cancer: ['Nurse', 'Counselor', 'Social Worker', 'Chef', 'Interior Designer'],
      Leo: ['Actor', 'Manager', 'Event Planner', 'Teacher', 'Sales Representative'],
      Virgo: ['Accountant', 'Editor', 'Researcher', 'Quality Control', 'Healthcare Worker'],
      Libra: ['Lawyer', 'Diplomat', 'HR Manager', 'Fashion Designer', 'Mediator'],
      Scorpio: ['Detective', 'Psychologist', 'Surgeon', 'Researcher', 'Financial Analyst'],
      Sagittarius: ['Professor', 'Travel Guide', 'Publisher', 'Religious Leader', 'Adventure Guide'],
      Ophiuchus: ['Healer', 'Spiritual Counselor', 'Alternative Medicine Practitioner', 'Mystic', 'Life Coach'],
      Capricorn: ['CEO', 'Engineer', 'Project Manager', 'Banker', 'Government Official'],
      Aquarius: ['Scientist', 'Inventor', 'Social Worker', 'Technology Consultant', 'Humanitarian'],
      Pisces: ['Artist', 'Musician', 'Nurse', 'Psychologist', 'Spiritual Teacher']
    }
    
    return professions[sun.name] || ['Professional', 'Specialist', 'Consultant']
  }

  private getWorkStyle(sun: ZodiacSign, mercury: ZodiacSign): string {
    const styles: Record<string, string> = {
      Aries: 'Dynamic and action-oriented, preferring to lead and take initiative',
      Taurus: 'Steady and methodical, valuing stability and tangible results',
      Gemini: 'Adaptable and communicative, thriving on variety and interaction',
      Cancer: 'Nurturing and detail-oriented, creating supportive work environments',
      Leo: 'Creative and inspiring, motivating others through enthusiasm and charisma',
      Virgo: 'Analytical and organized, ensuring quality and efficiency in all tasks',
      Libra: 'Collaborative and diplomatic, seeking harmony and balance in work relationships',
      Scorpio: 'Intense and focused, diving deep into complex problems and solutions',
      Sagittarius: 'Visionary and adventurous, expanding horizons and sharing knowledge',
      Ophiuchus: 'Transformative and intuitive, bringing healing and wisdom to work situations',
      Capricorn: 'Disciplined and ambitious, building long-term success through hard work',
      Aquarius: 'Innovative and independent, bringing unique perspectives and progressive ideas',
      Pisces: 'Compassionate and artistic, connecting with others through empathy and creativity'
    }
    
    return styles[sun.name] || 'Adaptable and professional work style'
  }

  private getLeadershipQualities(sun: ZodiacSign): string[] {
    const qualities: Record<string, string[]> = {
      Aries: ['Natural leadership', 'Courage and initiative', 'Direct communication'],
      Taurus: ['Reliable and steady', 'Practical decision-making', 'Team stability'],
      Gemini: ['Adaptable communication', 'Quick thinking', 'Versatile approach'],
      Cancer: ['Emotional intelligence', 'Nurturing leadership', 'Team support'],
      Leo: ['Charismatic inspiration', 'Creative vision', 'Natural authority'],
      Virgo: ['Attention to detail', 'Quality standards', 'Efficient organization'],
      Libra: ['Diplomatic balance', 'Fair decision-making', 'Collaborative approach'],
      Scorpio: ['Strategic thinking', 'Deep insight', 'Transformative leadership'],
      Sagittarius: ['Visionary guidance', 'Knowledge sharing', 'Expansive thinking'],
      Ophiuchus: ['Healing leadership', 'Intuitive wisdom', 'Transformative influence'],
      Capricorn: ['Disciplined execution', 'Long-term planning', 'Reliable authority'],
      Aquarius: ['Innovative thinking', 'Progressive vision', 'Independent leadership'],
      Pisces: ['Compassionate guidance', 'Creative inspiration', 'Spiritual leadership']
    }
    
    return qualities[sun.name] || ['Leadership', 'Management', 'Guidance']
  }

  private getSuccessFactors(sun: ZodiacSign, mercury: ZodiacSign): string[] {
    const factors: string[] = []
    
    if (sun.element === 'Fire') {
      factors.push('Maintaining enthusiasm and energy')
      factors.push('Taking action and leading initiatives')
    }
    if (sun.element === 'Earth') {
      factors.push('Building solid foundations')
      factors.push('Consistent effort and reliability')
    }
    if (sun.element === 'Air') {
      factors.push('Networking and communication')
      factors.push('Staying adaptable and informed')
    }
    if (sun.element === 'Water') {
      factors.push('Emotional intelligence and intuition')
      factors.push('Building meaningful connections')
    }
    
    return factors
  }

  private generateHealth(signs: any, focus: string): any {
    const sunSign = signs.sun
    const marsSign = signs.mars
    
    const strengths = this.getHealthStrengths(sunSign, marsSign)
    const vulnerabilities = this.getHealthVulnerabilities(sunSign, marsSign)
    const wellnessTips = this.getWellnessTips(sunSign, marsSign)
    const recommendedActivities = this.getRecommendedActivities(sunSign, marsSign)
    
    return {
      strengths,
      vulnerabilities,
      wellnessTips,
      recommendedActivities
    }
  }

  private getHealthStrengths(sun: ZodiacSign, mars: ZodiacSign): string[] {
    const strengths: string[] = []
    
    if (sun.element === 'Fire') {
      strengths.push('High energy and vitality')
      strengths.push('Strong cardiovascular system')
    }
    if (sun.element === 'Earth') {
      strengths.push('Stable and grounded constitution')
      strengths.push('Good physical endurance')
    }
    if (sun.element === 'Air') {
      strengths.push('Mental agility and quick thinking')
      strengths.push('Adaptable nervous system')
    }
    if (sun.element === 'Water') {
      strengths.push('Strong intuitive healing abilities')
      strengths.push('Emotional resilience')
    }
    
    return strengths
  }

  private getHealthVulnerabilities(sun: ZodiacSign, mars: ZodiacSign): string[] {
    const vulnerabilities: string[] = []
    
    if (sun.element === 'Fire') {
      vulnerabilities.push('Stress-related inflammation')
      vulnerabilities.push('Burnout from overexertion')
    }
    if (sun.element === 'Earth') {
      vulnerabilities.push('Digestive system sensitivity')
      vulnerabilities.push('Tendency toward weight gain')
    }
    if (sun.element === 'Air') {
      vulnerabilities.push('Nervous system sensitivity')
      vulnerabilities.push('Respiratory issues')
    }
    if (sun.element === 'Water') {
      vulnerabilities.push('Emotional stress impact')
      vulnerabilities.push('Fluid retention issues')
    }
    
    return vulnerabilities
  }

  private getWellnessTips(sun: ZodiacSign, mars: ZodiacSign): string[] {
    const tips: string[] = []
    
    if (sun.element === 'Fire') {
      tips.push('Regular exercise to channel energy')
      tips.push('Cooling foods and stress management')
    }
    if (sun.element === 'Earth') {
      tips.push('Grounding activities and stable routines')
      tips.push('Healthy digestion and regular meals')
    }
    if (sun.element === 'Air') {
      tips.push('Mental stimulation and breathing exercises')
      tips.push('Regular breaks and mental rest')
    }
    if (sun.element === 'Water') {
      tips.push('Emotional processing and water therapy')
      tips.push('Gentle exercise and spiritual practices')
    }
    
    return tips
  }

  private getRecommendedActivities(sun: ZodiacSign, mars: ZodiacSign): string[] {
    const activities: string[] = []
    
    if (sun.element === 'Fire') {
      activities.push('High-intensity workouts', 'Martial arts', 'Competitive sports')
    }
    if (sun.element === 'Earth') {
      activities.push('Hiking', 'Gardening', 'Strength training')
    }
    if (sun.element === 'Air') {
      activities.push('Dance', 'Swimming', 'Mind-body practices')
    }
    if (sun.element === 'Water') {
      activities.push('Swimming', 'Yoga', 'Meditation')
    }
    
    return activities.slice(0, 3)
  }

  private generateAdvice(signs: any, focus: string): any {
    const sunSign = signs.sun
    const moonSign = signs.moon
    
    const personal = this.getPersonalAdvice(sunSign, moonSign)
    const relationships = this.getRelationshipAdvice(sunSign, moonSign)
    const career = this.getCareerAdvice(sunSign, moonSign)
    const health = this.getHealthAdvice(sunSign, moonSign)
    const spiritual = this.getSpiritualAdvice(sunSign, moonSign)
    
    return {
      personal,
      relationships,
      career,
      health,
      spiritual
    }
  }

  private getPersonalAdvice(sun: ZodiacSign, moon: ZodiacSign): string[] {
    const advice: string[] = []
    
    if (sun.name === 'Ophiuchus') {
      advice.push('Trust your healing instincts and intuitive wisdom')
      advice.push('Share your transformative insights with others')
      advice.push('Embrace your role as a spiritual guide')
    } else {
      advice.push(`Embrace your ${sun.element} nature and express it authentically`)
      advice.push(`Balance your ${sun.quality} tendencies with flexibility`)
      advice.push(`Develop your ${sun.traits[0].toLowerCase()} qualities`)
    }
    
    return advice
  }

  private getRelationshipAdvice(sun: ZodiacSign, moon: ZodiacSign): string[] {
    const advice: string[] = []
    
    advice.push(`Seek partners who appreciate your ${sun.element} energy`)
    advice.push(`Express your ${moon.name} Moon emotions openly`)
    advice.push('Practice active listening and empathy')
    advice.push('Maintain healthy boundaries in relationships')
    
    return advice
  }

  private getCareerAdvice(sun: ZodiacSign, moon: ZodiacSign): string[] {
    const advice: string[] = []
    
    advice.push(`Focus on careers that align with your ${sun.element} nature`)
    advice.push(`Develop your ${sun.traits[0].toLowerCase()} skills`)
    advice.push('Build strong professional relationships')
    advice.push('Stay adaptable to changing circumstances')
    
    return advice
  }

  private getHealthAdvice(sun: ZodiacSign, moon: ZodiacSign): string[] {
    const advice: string[] = []
    
    if (sun.element === 'Fire') {
      advice.push('Manage stress through regular exercise')
      advice.push('Practice cooling and calming activities')
    }
    if (sun.element === 'Earth') {
      advice.push('Maintain stable routines and healthy eating')
      advice.push('Engage in grounding activities')
    }
    if (sun.element === 'Air') {
      advice.push('Practice breathing exercises and mental rest')
      advice.push('Stay mentally stimulated and engaged')
    }
    if (sun.element === 'Water') {
      advice.push('Process emotions through creative expression')
      advice.push('Engage in water-based activities')
    }
    
    return advice
  }

  private getSpiritualAdvice(sun: ZodiacSign, moon: ZodiacSign): string[] {
    const advice: string[] = []
    
    if (sun.name === 'Ophiuchus') {
      advice.push('Develop your natural healing abilities')
      advice.push('Study spiritual traditions and wisdom')
      advice.push('Share your transformative insights')
    } else {
      advice.push(`Connect with your ${sun.element} element through nature`)
      advice.push('Practice meditation and mindfulness')
      advice.push('Explore spiritual practices that resonate with you')
    }
    
    return advice
  }
}

export const thirteenSignsZodiacIntelligence = new ThirteenSignsZodiacIntelligence() 