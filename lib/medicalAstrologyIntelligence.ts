import { UserData, HealthData, HealthAnalysis, HealthTiming, BodySystem, NaturalRemedy } from '@/hooks/useMedicalAstrology'
import { doc, setDoc, getDoc, collection } from 'firebase/firestore'
import { getFirebaseDB } from './firebase';

class MedicalAstrologyIntelligence {
  private async getAstroData(birthData: UserData) {
    try {
      const response = await fetch('/api/astroapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'natal',
          birthTime: birthData.birthTime,
          birthPlace: birthData.birthPlace
        })
      })
      
      if (!response.ok) throw new Error('Failed to fetch astro data')
      return await response.json()
    } catch (error) {
      console.error('Error fetching astro data:', error)
      throw new Error('Unable to calculate birth chart')
    }
  }

  async analyzeHealthTiming(userData: UserData, healthData: HealthData): Promise<HealthAnalysis> {
    try {
      // Get user's birth chart
      const userChart = await this.getAstroData(userData)
      
      // Generate timing analysis
      const timing = this.calculateHealthTiming(userChart, healthData)
      
      // Analyze body systems
      const bodySystems = this.analyzeBodySystems(userChart, healthData)
      
      // Generate natural remedies
      const remedies = this.generateNaturalRemedies(userChart, healthData)
      
      // Generate overview
      const overview = this.generateOverview(timing, bodySystems, healthData)
      
      // Generate transit analysis
      const transits = this.analyzeTransits(userChart)
      
      // Generate advice
      const advice = this.generateAdvice(timing, bodySystems, remedies, healthData)

      return {
        overview,
        timing,
        bodySystems,
        remedies,
        transits,
        advice
      }
    } catch (error) {
      console.error('Medical astrology analysis error:', error)
      throw new Error('Failed to analyze health timing')
    }
  }

  private calculateHealthTiming(chart: any, healthData: HealthData): HealthTiming {
    const optimalProcedures: string[] = []
    const avoidPeriods: string[] = []
    const recoveryWindows: string[] = []
    
    // Analyze Moon phases for optimal timing
    const moonPhase = this.getMoonPhase(chart)
    if (moonPhase === 'waxing') {
      optimalProcedures.push('Waxing Moon - Excellent for growth-promoting procedures and treatments')
    } else if (moonPhase === 'waning') {
      optimalProcedures.push('Waning Moon - Good for removal procedures and detoxification')
    }
    
    // Analyze Venus for beauty and healing procedures
    if (chart.planets?.Venus) {
      const venusHouse = this.getHouse(chart.planets.Venus.position, chart.houses || [])
      if (venusHouse === 1 || venusHouse === 6) {
        optimalProcedures.push('Venus in 1st/6th house - Favorable for cosmetic and healing procedures')
      }
    }
    
    // Analyze Mars for surgery timing
    if (chart.planets?.Mars) {
      const marsHouse = this.getHouse(chart.planets.Mars.position, chart.houses || [])
      if (marsHouse === 6) {
        optimalProcedures.push('Mars in 6th house - Good for surgical procedures and treatments')
      }
    }
    
    // Analyze Saturn for chronic conditions
    if (chart.planets?.Saturn) {
      const saturnHouse = this.getHouse(chart.planets.Saturn.position, chart.houses || [])
      if (saturnHouse === 6) {
        optimalProcedures.push('Saturn in 6th house - Good for long-term health planning and chronic conditions')
      }
    }
    
    // Mercury retrograde periods to avoid
    avoidPeriods.push('Mercury retrograde periods - Avoid new treatments and medical decisions')
    avoidPeriods.push('Eclipse periods - High stress on body systems, avoid major procedures')
    avoidPeriods.push('Mars retrograde periods - Avoid surgical procedures and aggressive treatments')
    
    // Recovery windows based on Jupiter
    if (chart.planets?.Jupiter) {
      const jupiterHouse = this.getHouse(chart.planets.Jupiter.position, chart.houses || [])
      if (jupiterHouse === 6) {
        recoveryWindows.push('Jupiter in 6th house - Excellent recovery periods and healing support')
      }
    }
    
    // Calculate confidence based on planetary positions
    const confidence = this.calculateConfidence(chart, healthData)
    
    return {
      optimalProcedures,
      avoidPeriods,
      recoveryWindows,
      confidence
    }
  }

  private analyzeBodySystems(chart: any, healthData: HealthData): BodySystem[] {
    const bodySystems: BodySystem[] = []
    
    // Analyze based on zodiac signs and houses
    const sunSign = this.getSign(chart.planets?.Sun?.position || 0)
    const moonSign = this.getSign(chart.planets?.Moon?.position || 0)
    const ascendant = this.getSign(chart.houses?.[0]?.position || 0)
    
    // Aries rules head and brain
    if (['Aries', 'Leo', 'Sagittarius'].includes(sunSign)) {
      bodySystems.push({
        system: 'Head and Brain',
        status: 'strong',
        description: 'Strong mental energy and cognitive function',
        recommendations: ['Mental exercises', 'Brain-boosting foods', 'Head protection']
      })
    }
    
    // Taurus rules throat and neck
    if (['Taurus', 'Virgo', 'Capricorn'].includes(sunSign)) {
      bodySystems.push({
        system: 'Throat and Neck',
        status: 'balanced',
        description: 'Stable throat and neck function',
        recommendations: ['Voice exercises', 'Neck stretches', 'Throat health']
      })
    }
    
    // Gemini rules lungs and arms
    if (['Gemini', 'Libra', 'Aquarius'].includes(sunSign)) {
      bodySystems.push({
        system: 'Lungs and Respiratory',
        status: 'strong',
        description: 'Good respiratory function and lung capacity',
        recommendations: ['Breathing exercises', 'Fresh air', 'Lung health']
      })
    }
    
    // Cancer rules stomach and chest
    if (['Cancer', 'Scorpio', 'Pisces'].includes(sunSign)) {
      bodySystems.push({
        system: 'Digestive System',
        status: 'sensitive',
        description: 'Sensitive digestive system requiring care',
        recommendations: ['Gentle foods', 'Digestive enzymes', 'Stress management']
      })
    }
    
    // Leo rules heart and spine
    if (['Leo', 'Aries', 'Sagittarius'].includes(sunSign)) {
      bodySystems.push({
        system: 'Heart and Cardiovascular',
        status: 'strong',
        description: 'Strong heart energy and cardiovascular system',
        recommendations: ['Cardio exercise', 'Heart-healthy diet', 'Stress reduction']
      })
    }
    
    // Virgo rules intestines and nervous system
    if (['Virgo', 'Taurus', 'Capricorn'].includes(sunSign)) {
      bodySystems.push({
        system: 'Nervous System',
        status: 'sensitive',
        description: 'Sensitive nervous system requiring care',
        recommendations: ['Nervous system support', 'Calming practices', 'Regular routine']
      })
    }
    
    // Libra rules kidneys and lower back
    if (['Libra', 'Gemini', 'Aquarius'].includes(sunSign)) {
      bodySystems.push({
        system: 'Kidneys and Urinary',
        status: 'balanced',
        description: 'Balanced kidney function and urinary system',
        recommendations: ['Hydration', 'Kidney support', 'Balance practices']
      })
    }
    
    // Scorpio rules reproductive organs
    if (['Scorpio', 'Cancer', 'Pisces'].includes(sunSign)) {
      bodySystems.push({
        system: 'Reproductive System',
        status: 'strong',
        description: 'Strong reproductive energy and function',
        recommendations: ['Reproductive health', 'Emotional balance', 'Intimacy care']
      })
    }
    
    // Sagittarius rules hips and thighs
    if (['Sagittarius', 'Aries', 'Leo'].includes(sunSign)) {
      bodySystems.push({
        system: 'Hips and Lower Body',
        status: 'strong',
        description: 'Strong lower body and mobility',
        recommendations: ['Movement exercises', 'Hip flexibility', 'Lower body strength']
      })
    }
    
    // Capricorn rules knees and bones
    if (['Capricorn', 'Taurus', 'Virgo'].includes(sunSign)) {
      bodySystems.push({
        system: 'Bones and Joints',
        status: 'strong',
        description: 'Strong bone structure and joint health',
        recommendations: ['Bone health', 'Joint care', 'Structural support']
      })
    }
    
    // Aquarius rules ankles and circulatory system
    if (['Aquarius', 'Gemini', 'Libra'].includes(sunSign)) {
      bodySystems.push({
        system: 'Circulatory System',
        status: 'balanced',
        description: 'Balanced circulation and energy flow',
        recommendations: ['Circulation support', 'Energy work', 'Flow practices']
      })
    }
    
    // Pisces rules feet and lymphatic system
    if (['Pisces', 'Cancer', 'Scorpio'].includes(sunSign)) {
      bodySystems.push({
        system: 'Lymphatic System',
        status: 'sensitive',
        description: 'Sensitive lymphatic system requiring detox support',
        recommendations: ['Detoxification', 'Lymphatic drainage', 'Spiritual practices']
      })
    }
    
    return bodySystems
  }

  private generateNaturalRemedies(chart: any, healthData: HealthData): NaturalRemedy[] {
    const remedies: NaturalRemedy[] = []
    
    // Analyze based on planetary positions
    const sunSign = this.getSign(chart.planets?.Sun?.position || 0)
    const moonSign = this.getSign(chart.planets?.Moon?.position || 0)
    
    // Fire sign remedies
    if (['Aries', 'Leo', 'Sagittarius'].includes(sunSign)) {
      remedies.push({
        remedy: 'Ginger',
        type: 'herb',
        description: 'Warming herb for fire sign energy',
        usage: 'Tea or supplements for energy and digestion'
      })
      remedies.push({
        remedy: 'Carnelian',
        type: 'crystal',
        description: 'Energizing crystal for fire signs',
        usage: 'Wear or carry for vitality and courage'
      })
    }
    
    // Earth sign remedies
    if (['Taurus', 'Virgo', 'Capricorn'].includes(sunSign)) {
      remedies.push({
        remedy: 'Chamomile',
        type: 'herb',
        description: 'Grounding herb for earth signs',
        usage: 'Tea for calming and digestive support'
      })
      remedies.push({
        remedy: 'Jasper',
        type: 'crystal',
        description: 'Stabilizing crystal for earth signs',
        usage: 'Wear for grounding and stability'
      })
    }
    
    // Air sign remedies
    if (['Gemini', 'Libra', 'Aquarius'].includes(sunSign)) {
      remedies.push({
        remedy: 'Peppermint',
        type: 'herb',
        description: 'Clarifying herb for air signs',
        usage: 'Tea or essential oil for mental clarity'
      })
      remedies.push({
        remedy: 'Clear Quartz',
        type: 'crystal',
        description: 'Amplifying crystal for air signs',
        usage: 'Wear or meditate with for mental clarity'
      })
    }
    
    // Water sign remedies
    if (['Cancer', 'Scorpio', 'Pisces'].includes(sunSign)) {
      remedies.push({
        remedy: 'Lavender',
        type: 'herb',
        description: 'Calming herb for water signs',
        usage: 'Tea or essential oil for emotional balance'
      })
      remedies.push({
        remedy: 'Amethyst',
        type: 'crystal',
        description: 'Healing crystal for water signs',
        usage: 'Wear or place under pillow for emotional healing'
      })
    }
    
    // Color therapy based on Moon sign
    const moonColors = {
      'Aries': 'Red',
      'Taurus': 'Green',
      'Gemini': 'Yellow',
      'Cancer': 'Silver',
      'Leo': 'Gold',
      'Virgo': 'Brown',
      'Libra': 'Pink',
      'Scorpio': 'Deep Red',
      'Sagittarius': 'Purple',
      'Capricorn': 'Black',
      'Aquarius': 'Electric Blue',
      'Pisces': 'Sea Green'
    }
    
    remedies.push({
      remedy: moonColors[moonSign as keyof typeof moonColors] || 'White',
      type: 'color',
      description: `Healing color for ${moonSign} Moon sign`,
      usage: 'Wear, meditate with, or surround yourself with this color'
    })
    
    return remedies
  }

  private generateOverview(timing: HealthTiming, bodySystems: BodySystem[], healthData: HealthData) {
    const overallHealth = Math.round((timing.confidence + bodySystems.reduce((acc, system) => 
      acc + (system.status === 'strong' ? 100 : system.status === 'balanced' ? 75 : 50), 0) / bodySystems.length) / 2)
    
    let summary = ''
    if (overallHealth >= 80) {
      summary = 'Excellent cosmic alignment for health and wellness. Your body systems are well-supported by current planetary energies.'
    } else if (overallHealth >= 60) {
      summary = 'Good health potential with some areas requiring attention. Focus on timing and natural remedies.'
    } else if (overallHealth >= 40) {
      summary = 'Moderate cosmic support for health matters. Patience and careful attention to timing will be beneficial.'
    } else {
      summary = 'Challenging cosmic conditions for health matters. Focus on prevention and gentle approaches.'
    }
    
    const keyStrengths = bodySystems
      .filter(system => system.status === 'strong')
      .map(system => `Strong ${system.system.toLowerCase()}`)
    
    const areasOfConcern = bodySystems
      .filter(system => system.status === 'weak')
      .map(system => `Sensitive ${system.system.toLowerCase()}`)
    
    const recommendations = [
      'Follow optimal timing for medical procedures',
      'Use natural remedies aligned with your cosmic energy',
      'Maintain regular health check-ups',
      'Practice stress management techniques'
    ]
    
    return {
      summary,
      overallHealth,
      keyStrengths,
      areasOfConcern,
      recommendations
    }
  }

  private analyzeTransits(chart: any) {
    return {
      current: [
        'Jupiter in Aries - Expansion of health consciousness and new treatments',
        'Saturn in Pisces - Restructuring of health systems and spiritual healing',
        'Pluto in Aquarius - Transformation of medical technology and approaches'
      ],
      upcoming: [
        'Jupiter-Saturn conjunction - Major health cycle shift and new approaches',
        'Uranus in Taurus - Innovation in natural health and wellness',
        'Neptune in Pisces - Dissolution of old health paradigms'
      ],
      impact: 'Current transits favor holistic health approaches and spiritual healing. Upcoming transits suggest major shifts in medical technology and natural wellness.'
    }
  }

  private generateAdvice(timing: HealthTiming, bodySystems: BodySystem[], remedies: NaturalRemedy[], healthData: HealthData) {
    return {
      immediate: [
        'Review your current health routine alignment with cosmic timing',
        'Prepare for optimal procedure timing windows',
        'Begin incorporating recommended natural remedies'
      ],
      shortTerm: [
        'Focus on body systems showing strong cosmic support',
        'Avoid major procedures during eclipse periods',
        'Use Mercury retrograde for health research and planning'
      ],
      longTerm: [
        'Build sustainable health practices aligned with cosmic energy',
        'Plan for major health cycle shifts',
        'Develop comprehensive wellness routine'
      ],
      prevention: [
        'Regular health check-ups and screenings',
        'Stress management and emotional balance',
        'Proper nutrition and hydration',
        'Regular exercise and movement'
      ]
    }
  }

  // Helper methods
  private getHouse(planetPos: number, houses: any[]): number {
    if (!houses || houses.length === 0) return 1
    
    for (let i = 0; i < houses.length; i++) {
      const currentHouse = houses[i]
      const nextHouse = houses[(i + 1) % houses.length]
      
      if (planetPos >= currentHouse.position && planetPos < nextHouse.position) {
        return i + 1
      }
    }
    
    return 1
  }

  private getSign(position: number): string {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    const signIndex = Math.floor(position / 30)
    return signs[signIndex] || 'Aries'
  }

  private getMoonPhase(chart: any): string {
    // Simplified moon phase calculation
    const moonPos = chart.planets?.Moon?.position || 0
    const sunPos = chart.planets?.Sun?.position || 0
    
    const phase = (moonPos - sunPos + 360) % 360
    
    if (phase < 90) return 'waxing'
    if (phase < 180) return 'full'
    if (phase < 270) return 'waning'
    return 'new'
  }

  private calculateConfidence(chart: any, healthData: HealthData): number {
    let confidence = 50 // Base confidence
    
    // Add confidence based on favorable planetary positions
    if (chart.planets?.Jupiter) {
      const jupiterHouse = this.getHouse(chart.planets.Jupiter.position, chart.houses || [])
      if (jupiterHouse === 6) confidence += 15
    }
    
    if (chart.planets?.Venus) {
      const venusHouse = this.getHouse(chart.planets.Venus.position, chart.houses || [])
      if (venusHouse === 1 || venusHouse === 6) confidence += 10
    }
    
    // Adjust based on health focus
    if (healthData.healthFocus === 'general') confidence += 5
    if (healthData.healthFocus === 'surgery') confidence -= 5
    
    return Math.min(95, Math.max(20, confidence))
  }
}

export const medicalAstrologyIntelligence = new MedicalAstrologyIntelligence() 