import { UserData, MarketData, FinancialAnalysis, FinancialTiming, SectorAnalysis, MarketPrediction } from '@/hooks/useFinancialAstrology'
import { doc, setDoc, getDoc, collection } from 'firebase/firestore'
import { getFirebaseDB } from './firebase';

class FinancialAstrologyIntelligence {
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

  async analyzeFinancialTiming(userData: UserData, marketData: MarketData): Promise<FinancialAnalysis> {
    try {
      // Get user's birth chart
      const userChart = await this.getAstroData(userData)
      
      // Generate timing analysis
      const timing = this.calculateFinancialTiming(userChart, marketData)
      
      // Analyze favorable sectors
      const sectors = this.analyzeSectors(userChart, marketData)
      
      // Generate market predictions
      const predictions = this.generateMarketPredictions(userChart, marketData)
      
      // Generate overview
      const overview = this.generateOverview(timing, sectors, predictions, marketData)
      
      // Generate transit analysis
      const transits = this.analyzeTransits(userChart)
      
      // Generate advice
      const advice = this.generateAdvice(timing, sectors, predictions, marketData)

      return {
        overview,
        timing,
        sectors,
        transits,
        predictions,
        advice
      }
    } catch (error) {
      console.error('Financial astrology analysis error:', error)
      throw new Error('Failed to analyze financial timing')
    }
  }

  private calculateFinancialTiming(chart: any, marketData: MarketData): FinancialTiming {
    const optimalEntry: string[] = []
    const optimalExit: string[] = []
    const avoidPeriods: string[] = []
    
    // Analyze Jupiter transits for expansion opportunities
    if (chart.planets?.Jupiter) {
      const jupiterHouse = this.getHouse(chart.planets.Jupiter.position, chart.houses || [])
      if (jupiterHouse === 2 || jupiterHouse === 8) {
        optimalEntry.push('Jupiter in 2nd/8th house - Excellent for financial growth and investments')
      }
    }
    
    // Analyze Saturn transits for timing
    if (chart.planets?.Saturn) {
      const saturnHouse = this.getHouse(chart.planets.Saturn.position, chart.houses || [])
      if (saturnHouse === 2) {
        optimalEntry.push('Saturn in 2nd house - Good for long-term, conservative investments')
      }
    }
    
    // Analyze Venus for timing
    if (chart.planets?.Venus) {
      const venusHouse = this.getHouse(chart.planets.Venus.position, chart.houses || [])
      if (venusHouse === 2 || venusHouse === 8) {
        optimalEntry.push('Venus in 2nd/8th house - Favorable for luxury investments and partnerships')
      }
    }
    
    // Mars transits for aggressive timing
    if (chart.planets?.Mars) {
      const marsHouse = this.getHouse(chart.planets.Mars.position, chart.houses || [])
      if (marsHouse === 2) {
        optimalEntry.push('Mars in 2nd house - Good for aggressive, high-risk investments')
      }
    }
    
    // Mercury retrograde periods to avoid
    avoidPeriods.push('Mercury retrograde periods - Avoid new investments and major financial decisions')
    avoidPeriods.push('Eclipse periods - Market volatility likely, exercise caution')
    
    // Calculate confidence based on planetary positions
    const confidence = this.calculateConfidence(chart, marketData)
    
    return {
      optimalEntry,
      optimalExit,
      avoidPeriods,
      confidence
    }
  }

  private analyzeSectors(chart: any, marketData: MarketData): SectorAnalysis {
    const favorable: string[] = []
    const challenging: string[] = []
    const neutral: string[] = []
    
    // Analyze based on Sun sign
    const sunSign = this.getSign(chart.planets?.Sun?.position || 0)
    const sunHouse = this.getHouse(chart.planets?.Sun?.position || 0, chart.houses || [])
    
    // Fire signs favor technology, energy, entertainment
    if (['Aries', 'Leo', 'Sagittarius'].includes(sunSign)) {
      favorable.push('Technology and innovation')
      favorable.push('Energy and renewable resources')
      favorable.push('Entertainment and media')
    }
    
    // Earth signs favor real estate, commodities, utilities
    if (['Taurus', 'Virgo', 'Capricorn'].includes(sunSign)) {
      favorable.push('Real estate and property')
      favorable.push('Commodities and natural resources')
      favorable.push('Utilities and infrastructure')
    }
    
    // Air signs favor communication, finance, travel
    if (['Gemini', 'Libra', 'Aquarius'].includes(sunSign)) {
      favorable.push('Communication and technology')
      favorable.push('Finance and banking')
      favorable.push('Travel and transportation')
    }
    
    // Water signs favor healthcare, pharmaceuticals, water-related
    if (['Cancer', 'Scorpio', 'Pisces'].includes(sunSign)) {
      favorable.push('Healthcare and pharmaceuticals')
      favorable.push('Water and environmental services')
      favorable.push('Psychology and wellness')
    }
    
    // Analyze Jupiter for expansion sectors
    if (chart.planets?.Jupiter) {
      const jupiterSign = this.getSign(chart.planets.Jupiter.position)
      if (['Sagittarius', 'Pisces'].includes(jupiterSign)) {
        favorable.push('International markets and foreign investments')
      }
    }
    
    // Analyze Saturn for stable sectors
    if (chart.planets?.Saturn) {
      const saturnSign = this.getSign(chart.planets.Saturn.position)
      if (['Capricorn', 'Aquarius'].includes(saturnSign)) {
        favorable.push('Government bonds and stable investments')
      }
    }
    
    const reasoning = `Based on your ${sunSign} Sun sign and planetary positions, you have natural affinity for ${favorable.slice(0, 3).join(', ')} sectors. Your ${sunHouse}${this.getOrdinalSuffix(sunHouse)} house Sun indicates ${this.getHouseMeaning(sunHouse)} focus in your financial approach.`
    
    return {
      favorable,
      challenging,
      neutral,
      reasoning
    }
  }

  private generateMarketPredictions(chart: any, marketData: MarketData): MarketPrediction[] {
    const predictions: MarketPrediction[] = []
    
    // Short-term prediction (1-3 months)
    predictions.push({
      trend: this.getTrendFromPlanets(chart, 'short'),
      timeframe: '1-3 months',
      confidence: this.calculatePredictionConfidence(chart, 'short'),
      reasoning: this.getPredictionReasoning(chart, 'short'),
      keyEvents: [
        'Jupiter-Saturn conjunction effects',
        'Mercury retrograde periods',
        'Eclipse season impacts'
      ]
    })
    
    // Medium-term prediction (3-12 months)
    predictions.push({
      trend: this.getTrendFromPlanets(chart, 'medium'),
      timeframe: '3-12 months',
      confidence: this.calculatePredictionConfidence(chart, 'medium'),
      reasoning: this.getPredictionReasoning(chart, 'medium'),
      keyEvents: [
        'Pluto transit effects',
        'Uranus innovation cycles',
        'Neptune dissolution periods'
      ]
    })
    
    // Long-term prediction (1-5 years)
    predictions.push({
      trend: this.getTrendFromPlanets(chart, 'long'),
      timeframe: '1-5 years',
      confidence: this.calculatePredictionConfidence(chart, 'long'),
      reasoning: this.getPredictionReasoning(chart, 'long'),
      keyEvents: [
        'Saturn return effects',
        'Jupiter expansion cycles',
        'Pluto transformation periods'
      ]
    })
    
    return predictions
  }

  private generateOverview(timing: FinancialTiming, sectors: SectorAnalysis, predictions: MarketPrediction[], marketData: MarketData) {
    const overallScore = Math.round((timing.confidence + predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length) / 2)
    
    let summary = ''
    if (overallScore >= 80) {
      summary = 'Excellent cosmic alignment for financial success. Your timing and sector choices are well-supported by current planetary energies.'
    } else if (overallScore >= 60) {
      summary = 'Good potential for financial growth with some areas requiring attention. Focus on timing and sector selection.'
    } else if (overallScore >= 40) {
      summary = 'Moderate cosmic support for financial endeavors. Patience and careful planning will be key to success.'
    } else {
      summary = 'Challenging cosmic conditions for financial matters. Focus on risk management and conservative approaches.'
    }
    
    const keyStrengths = [
      `Strong ${marketData.investmentType} alignment`,
      `Favorable timing with ${timing.confidence}% confidence`,
      `Multiple sector opportunities available`
    ]
    
    const potentialRisks = [
      'Market volatility during eclipse periods',
      'Mercury retrograde communication challenges',
      'Saturn transit restrictions'
    ]
    
    const recommendations = [
      'Diversify across favorable sectors',
      'Use optimal timing windows for major decisions',
      'Maintain risk management protocols',
      'Stay informed about cosmic timing'
    ]
    
    return {
      summary,
      overallScore,
      keyStrengths,
      potentialRisks,
      recommendations
    }
  }

  private analyzeTransits(chart: any) {
    return {
      current: [
        'Jupiter in Aries - Expansion in new ventures and technology',
        'Saturn in Pisces - Restructuring in spiritual and creative sectors',
        'Pluto in Aquarius - Transformation in technology and social structures'
      ],
      upcoming: [
        'Jupiter-Saturn conjunction - Major economic cycle shift',
        'Uranus in Taurus - Innovation in finance and real estate',
        'Neptune in Pisces - Dissolution of old financial structures'
      ],
      impact: 'Current transits favor technology, innovation, and restructuring. Upcoming transits suggest major shifts in financial systems and real estate markets.'
    }
  }

  private generateAdvice(timing: FinancialTiming, sectors: SectorAnalysis, predictions: MarketPrediction[], marketData: MarketData) {
    return {
      immediate: [
        'Review your current portfolio alignment with favorable sectors',
        'Prepare for optimal entry timing windows',
        'Set up risk management protocols'
      ],
      shortTerm: [
        'Focus on sectors showing strong cosmic support',
        'Avoid major decisions during eclipse periods',
        'Use Mercury retrograde for research and planning'
      ],
      longTerm: [
        'Build positions in sectors with long-term cosmic support',
        'Plan for major economic cycle shifts',
        'Develop multiple income streams'
      ],
      riskManagement: [
        'Never invest more than you can afford to lose',
        'Diversify across multiple sectors and asset classes',
        'Use stop-loss orders and position sizing',
        'Keep emergency funds separate from investments'
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

  private getOrdinalSuffix(num: number): string {
    if (num >= 11 && num <= 13) return 'th'
    switch (num % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  private getHouseMeaning(house: number): string {
    const meanings = {
      1: 'personal initiative and leadership',
      2: 'values and material resources',
      3: 'communication and learning',
      4: 'home and emotional foundation',
      5: 'creativity and speculation',
      6: 'work and service',
      7: 'partnerships and contracts',
      8: 'shared resources and transformation',
      9: 'philosophy and expansion',
      10: 'career and public image',
      11: 'social networks and groups',
      12: 'spirituality and hidden matters'
    }
    return meanings[house as keyof typeof meanings] || 'personal development'
  }

  private calculateConfidence(chart: any, marketData: MarketData): number {
    let confidence = 50 // Base confidence
    
    // Add confidence based on favorable planetary positions
    if (chart.planets?.Jupiter) {
      const jupiterHouse = this.getHouse(chart.planets.Jupiter.position, chart.houses || [])
      if (jupiterHouse === 2 || jupiterHouse === 8) confidence += 15
    }
    
    if (chart.planets?.Venus) {
      const venusHouse = this.getHouse(chart.planets.Venus.position, chart.houses || [])
      if (venusHouse === 2 || venusHouse === 8) confidence += 10
    }
    
    // Adjust based on risk tolerance
    if (marketData.riskTolerance === 'conservative') confidence += 5
    if (marketData.riskTolerance === 'aggressive') confidence -= 5
    
    return Math.min(95, Math.max(20, confidence))
  }

  private getTrendFromPlanets(chart: any, timeframe: string): 'bullish' | 'bearish' | 'neutral' {
    // Simplified trend calculation
    const jupiterPos = chart.planets?.Jupiter?.position || 0
    const saturnPos = chart.planets?.Saturn?.position || 0
    
    if (jupiterPos > saturnPos) return 'bullish'
    if (saturnPos > jupiterPos) return 'bearish'
    return 'neutral'
  }

  private calculatePredictionConfidence(chart: any, timeframe: string): number {
    // Simplified confidence calculation
    return Math.floor(Math.random() * 30) + 60 // 60-90% range
  }

  private getPredictionReasoning(chart: any, timeframe: string): string {
    const reasons = [
      'Jupiter expansion cycles favor growth in this period',
      'Saturn restructuring creates opportunities for disciplined investors',
      'Uranus innovation drives new market sectors',
      'Pluto transformation reshapes financial landscapes'
    ]
    return reasons[Math.floor(Math.random() * reasons.length)]
  }
}

export const financialAstrologyIntelligence = new FinancialAstrologyIntelligence() 