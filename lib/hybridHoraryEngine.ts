import { ProfessionalAstroEngine } from './professionalAstroEngine'
import { devLog } from '@/lib/devLogger';
import { ProfessionalChartGenerator } from './professionalChartGenerator'

export interface HoraryChartData {
  chartImage?: string
  planets: Array<{
    planet: string
    longitude: number
    latitude: number
    house: number
    sign: string
    degree: number
    speed: number
  }>
  houses: Array<{
    house: number
    cusp: number
    sign: string
  }>
  aspects: Array<{
    planet1: string
    planet2: string
    aspect: string
    orb: number
    applying: boolean
  }>
  metadata: {
    engine: 'astroapp' | 'custom'
    timestamp: string
    accuracy: 'high' | 'medium'
  }
}

export interface HoraryRequest {
  question: string
  questionDate: string
  questionTime: string
  questionPlace: string
  latitude?: number
  longitude?: number
  timezone?: string
}

export class HybridHoraryEngine {
  private astroAppApiKey: string
  private customEngine: ProfessionalAstroEngine
  private chartGenerator: ProfessionalChartGenerator

  constructor() {
    this.astroAppApiKey = process.env.ASTROAPP_API_KEY || ''
    this.customEngine = new ProfessionalAstroEngine()
    this.chartGenerator = new ProfessionalChartGenerator()
  }

  /**
   * Intelligent engine selection based on request type and availability
   */
  async generateHoraryChart(request: HoraryRequest): Promise<HoraryChartData> {
    try {
      // Try AstroApp first for maximum accuracy
      if (this.astroAppApiKey && this.shouldUseAstroApp(request)) {
        devLog.debug('🔄 Using AstroApp API for maximum accuracy...')
        return await this.generateWithAstroApp(request)
      }
    } catch (error) {
      devLog.warn('⚠️ AstroApp failed, falling back to custom engine:', error, 'hybridHoraryEngine')
    }

    // Fallback to our custom engine
    devLog.debug('🔄 Using FutureSeer Custom Engine...')
    try {
      return await this.generateWithCustomEngine(request)
    } catch (error) {
      devLog.error('❌ Both engines failed:', error, 'hybridHoraryEngine')
      throw new Error(`All engines failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Determine if AstroApp should be used based on request characteristics
   */
  private shouldUseAstroApp(request: HoraryRequest): boolean {
    // Use AstroApp for:
    // 1. Complex Vedic calculations
    // 2. When high precision is critical
    // 3. For traditional horary questions
    return (
      request.question.toLowerCase().includes('vedic') ||
      request.question.toLowerCase().includes('traditional') ||
      request.question.toLowerCase().includes('marriage') ||
      request.question.toLowerCase().includes('career') ||
      request.question.toLowerCase().includes('property')
    )
  }

  /**
   * Generate chart using AstroApp API
   */
  private async generateWithAstroApp(request: HoraryRequest): Promise<HoraryChartData> {
    const astroAppRequest = {
      chart: {
        chartData: {
          chartDate: `${request.questionDate}T${request.questionTime}`,
          lat: request.latitude || 0,
          lng: request.longitude || 0,
          tz: request.timezone || 'UTC',
          zodiacID: 100 // Sidereal zodiac for Vedic
        }
      },
      calcRequestProps: {
        needImage: "Y",
        styleID: 8, // South Indian chart style
        needAspects: "Y",
        needHousePlacements: "Y"
      },
      params: {
        objects: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
      }
    }

    const response = await fetch('https://api.astroapp.com/chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.astroAppApiKey}`
      },
      body: JSON.stringify(astroAppRequest)
    })

    if (!response.ok) {
      throw new Error(`AstroApp API error: ${response.status}`)
    }

    const astroData = await response.json()
    
    // Transform AstroApp data to our format
    return this.transformAstroAppData(astroData, request)
  }

  /**
   * Generate chart using our custom engine
   */
  private async generateWithCustomEngine(request: HoraryRequest): Promise<HoraryChartData> {
    try {
      devLog.debug('🔧 Custom Engine: Starting horary calculation...')
      devLog.debug('📅 Date:', request.questionDate)
      devLog.debug('⏰ Time:', request.questionTime)
      devLog.debug('Location', { latitude: request.latitude, longitude: request.longitude }, 'hybridHoraryEngine')
      
      // Check if the method exists
      if (typeof this.customEngine.calculateHoraryChart !== 'function') {
        throw new Error('calculateHoraryChart method not found on customEngine')
      }
      
      devLog.debug('🔧 Custom Engine: About to call calculateHoraryChart...')
      
      const chartData = await this.customEngine.calculateHoraryChart(
        request.questionDate,
        request.questionTime,
        request.latitude || 0,
        request.longitude || 0,
        request.timezone || 'UTC'
      )

      devLog.debug('✅ Custom Engine: Chart data calculated successfully')
      devLog.debug('📊 Planets count:', chartData.planets?.length || 0)
      devLog.debug('🏠 Houses count:', chartData.houses?.length || 0)
      devLog.debug('🔗 Aspects count:', chartData.aspects?.length || 0)

      const chartImage = this.chartGenerator.generateProfessionalHoraryChart(
        chartData.planets,
        chartData.houses,
        chartData.aspects,
        {
          showDegrees: true,
          showAspects: true,
          showHouses: true,
          primaryColor: '#1e40af',
          secondaryColor: '#fbbf24'
        }
      )

      devLog.debug('🎨 Custom Engine: Chart image generated successfully')

      return {
        chartImage,
        planets: chartData.planets,
        houses: chartData.houses,
        aspects: chartData.aspects,
        metadata: {
          engine: 'custom',
          timestamp: new Date().toISOString(),
          accuracy: 'medium'
        }
      }
    } catch (error) {
      devLog.error('❌ Custom Engine Error:', error, 'hybridHoraryEngine')
      throw new Error(`Custom engine failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Transform AstroApp response to our standard format
   */
  private transformAstroAppData(astroData: any, request: HoraryRequest): HoraryChartData {
    // Extract chart image
    const chartImage = astroData.chart?.image || astroData.image

    // Transform planets data
    const planets = astroData.planets?.map((planet: any) => ({
      planet: planet.name,
      longitude: planet.longitude,
      latitude: planet.latitude || 0,
      house: planet.house || 0,
      sign: planet.sign,
      degree: planet.degree || 0,
      speed: planet.speed || 0
    })) || []

    // Transform houses data
    const houses = astroData.houses?.map((house: any) => ({
      house: house.number,
      cusp: house.cusp,
      sign: house.sign
    })) || []

    // Transform aspects data
    const aspects = astroData.aspects?.map((aspect: any) => ({
      planet1: aspect.planet1,
      planet2: aspect.planet2,
      aspect: aspect.aspect,
      orb: aspect.orb,
      applying: aspect.applying || false
    })) || []

    return {
      chartImage,
      planets,
      houses,
      aspects,
      metadata: {
        engine: 'astroapp',
        timestamp: new Date().toISOString(),
        accuracy: 'high'
      }
    }
  }

  /**
   * Generate dynamic horary interpretation
   */
  async generateHoraryInterpretation(
    chartData: HoraryChartData, 
    question: string
  ): Promise<{
    answer: string
    timing: string
    guidance: string
    confidence: number
  }> {
    // Use our custom interpretation engine regardless of chart source
    // This ensures consistent, dynamic interpretations
    return this.generateDynamicInterpretation(chartData, question)
  }

  /**
   * Generate dynamic interpretation based on actual chart data
   */
  private generateDynamicInterpretation(
    chartData: HoraryChartData, 
    question: string
  ): {
    answer: string
    timing: string
    guidance: string
    confidence: number
  } {
    const { planets, houses, aspects } = chartData
    const moon = planets.find(p => p.planet === 'Moon')
    const sun = planets.find(p => p.planet === 'Sun')
    const ascendant = houses.find(h => h.house === 1)

    // Calculate chart signature for uniqueness
    const chartSignature = this.calculateChartSignature(moon, sun, ascendant)
    
    // Determine question type
    const questionType = this.determineQuestionType(question)
    
    // Generate dynamic answer based on actual planetary positions
    const answer = this.generateDynamicAnswer(chartData, questionType, chartSignature)
    const timing = this.generateDynamicTiming(chartData, moon)
    const guidance = this.generateDynamicGuidance(chartData, questionType)
    
    // Calculate confidence based on chart strength
    const confidence = this.calculateConfidence(chartData)

    return { answer, timing, guidance, confidence }
  }

  private calculateChartSignature(moon: any, sun: any, ascendant: any): string {
    if (!moon || !sun || !ascendant) return 'unknown'
    
    const moonSign = moon.sign || 'unknown'
    const sunSign = sun.sign || 'unknown'
    const ascSign = ascendant.sign || 'unknown'
    
    return `${moonSign}-${sunSign}-${ascSign}`
  }

  private determineQuestionType(question: string): string {
    const q = question.toLowerCase()
    if (q.includes('marriage') || q.includes('relationship') || q.includes('love')) return 'relationship'
    if (q.includes('career') || q.includes('job') || q.includes('work')) return 'career'
    if (q.includes('money') || q.includes('financial') || q.includes('investment')) return 'financial'
    if (q.includes('health') || q.includes('medical') || q.includes('illness')) return 'health'
    if (q.includes('travel') || q.includes('journey') || q.includes('move')) return 'travel'
    return 'general'
  }

  private generateDynamicAnswer(chartData: HoraryChartData, questionType: string, signature: string): string {
    const { planets, houses, aspects } = chartData
    const moon = planets.find(p => p.planet === 'Moon')
    const sun = planets.find(p => p.planet === 'Sun')
    const ascendant = houses.find(h => h.house === 1)
    const ruler = this.findSignRuler(ascendant?.sign ?? '')
    const rulerPlanet = planets.find(p => p.planet === ruler)
    
    // Professional horary analysis with detailed reasoning
    let analysis = `**Professional Horary Analysis:**\n\n`
    
    // 1. Chart Reception Analysis
    analysis += `**1. Chart Reception:** The question was asked at ${moon?.degree || 0}° ${moon?.sign || 'unknown'} with the Moon in the ${this.getHouseMeaning(moon?.house || 0)} house. `
    
    // 2. Ascendant and Ruler Analysis
    if (ascendant && rulerPlanet) {
      const ascDegree = (ascendant as { degree?: number }).degree ?? ascendant.cusp ?? 0
      analysis += `The Ascendant at ${ascDegree}° ${ascendant.sign} is ruled by ${ruler}, which is currently positioned at ${rulerPlanet.degree}° ${rulerPlanet.sign} in house ${rulerPlanet.house}. `
      
      // Ruler's dignity
      const dignity = this.calculatePlanetaryDignity(rulerPlanet.planet, rulerPlanet.longitude)
      analysis += `${ruler} is in ${dignity.toLowerCase()} in ${rulerPlanet.sign}, which ${this.getDignityMeaning(dignity)}. `
    }
    
    // 3. Moon's Role (Primary Significator)
    if (moon) {
      analysis += `\n\n**2. Moon's Position:** The Moon at ${moon.degree}° ${moon.sign} in house ${moon.house} serves as the primary significator. `
      analysis += `${this.getMoonHouseMeaning(moon.house)} ${this.getMoonSignMeaning(moon.sign)}. `
      
      // Moon's aspects
      const moonAspects = aspects.filter(a => a.planet1 === 'Moon' || a.planet2 === 'Moon')
      if (moonAspects.length > 0) {
        analysis += `The Moon forms ${moonAspects.length} aspect${moonAspects.length > 1 ? 's' : ''}: `
        moonAspects.forEach((aspect, index) => {
          const otherPlanet = aspect.planet1 === 'Moon' ? aspect.planet2 : aspect.planet1
          analysis += `${aspect.aspect} to ${otherPlanet}`
          if (index < moonAspects.length - 1) analysis += ', '
        })
        analysis += '. '
      }
    }
    
    // 4. Question-Specific Analysis
    analysis += `\n\n**3. Question Analysis:** For a ${questionType} question, `
    analysis += this.getDetailedQuestionAnalysis(questionType, moon, rulerPlanet, aspects)
    
    // 5. Timing and Outcome
    analysis += `\n\n**4. Timing & Outcome:** `
    analysis += this.getDetailedTimingAnalysis(moon, aspects)
    
    return analysis
  }

  private generateDynamicTiming(chartData: HoraryChartData, moon: any): string {
    if (!moon) return 'Timing cannot be determined from this chart.'
    
    const moonSpeed = moon.speed || 0
    const moonHouse = moon.house || 0
    const moonDegree = moon.degree || 0
    
    let timing = 'Based on the Moon\'s current position and speed, '
    
    // Speed-based timing
    if (moonSpeed > 15) {
      timing += 'the Moon is moving quickly, suggesting rapid developments within '
    } else if (moonSpeed > 12) {
      timing += 'the Moon is moving at normal speed, indicating developments within '
    } else {
      timing += 'the Moon is moving slowly, suggesting a longer timeframe of '
    }
    
    // House-based timing
    if (moonHouse <= 3) {
      timing += 'days to weeks.'
    } else if (moonHouse <= 6) {
      timing += 'weeks to months.'
    } else if (moonHouse <= 9) {
      timing += 'months to a year.'
    } else {
      timing += 'a year or more.'
    }
    
    // Degree-based refinement
    if (moonDegree < 5) {
      timing += ' The early degree suggests the matter is just beginning.'
    } else if (moonDegree > 25) {
      timing += ' The late degree indicates the matter is nearing completion.'
    }
    
    return timing
  }

  private generateDynamicGuidance(chartData: HoraryChartData, questionType: string): string {
    const { planets, aspects } = chartData
    const moon = planets.find(p => p.planet === 'Moon')
    const sun = planets.find(p => p.planet === 'Sun')
    
    let guidance = 'For your specific situation, '
    
    // Aspect analysis
    const moonAspects = aspects.filter(a => a.planet1 === 'Moon' || a.planet2 === 'Moon')
    if (moonAspects.length > 0) {
      const strongestAspect = moonAspects[0]
      guidance += `the Moon's ${strongestAspect.aspect} aspect suggests `
      
      if (strongestAspect.aspect === 'conjunction') {
        guidance += 'direct action is required. '
      } else if (strongestAspect.aspect === 'trine') {
        guidance += 'favorable conditions are present. '
      } else if (strongestAspect.aspect === 'square') {
        guidance += 'challenges must be overcome through effort. '
      } else if (strongestAspect.aspect === 'opposition') {
        guidance += 'balance and compromise are necessary. '
      }
    }
    
    // Question-specific advice
    const specificAdvice = this.getSpecificAdvice(questionType, moon?.sign ?? '')
    guidance += specificAdvice
    
    return guidance
  }

  private calculateConfidence(chartData: HoraryChartData): number {
    const { planets, houses, aspects } = chartData
    let confidence = 0.5 // Base confidence
    
    // More planets = higher confidence
    confidence += Math.min(planets.length * 0.05, 0.2)
    
    // More aspects = higher confidence
    confidence += Math.min(aspects.length * 0.02, 0.15)
    
    // Complete houses = higher confidence
    confidence += Math.min(houses.length * 0.02, 0.1)
    
    // Engine type affects confidence
    if (chartData.metadata.engine === 'astroapp') {
      confidence += 0.1 // AstroApp gets slight confidence boost
    }
    
    return Math.min(confidence, 0.95) // Cap at 95%
  }

  // Helper methods
  private findSignRuler(sign: string): string {
    const rulers: { [key: string]: string } = {
      'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury',
      'Cancer': 'Moon', 'Leo': 'Sun', 'Virgo': 'Mercury',
      'Libra': 'Venus', 'Scorpio': 'Mars', 'Sagittarius': 'Jupiter',
      'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
    }
    return rulers[sign] || 'unknown'
  }

  private getSignMeaning(sign: string): string {
    const meanings: { [key: string]: string } = {
      'Aries': 'This requires bold, direct action.',
      'Taurus': 'Patience and persistence will be rewarded.',
      'Gemini': 'Communication and flexibility are key.',
      'Cancer': 'Emotional sensitivity and nurturing are important.',
      'Leo': 'Confidence and leadership will serve you well.',
      'Virgo': 'Attention to detail and practical planning are essential.',
      'Libra': 'Balance and harmony must be maintained.',
      'Scorpio': 'Deep transformation and intensity are involved.',
      'Sagittarius': 'Expansion and higher learning are favored.',
      'Capricorn': 'Structure and discipline will bring success.',
      'Aquarius': 'Innovation and independence are highlighted.',
      'Pisces': 'Intuition and compassion will guide you.'
    }
    return meanings[sign] || 'The cosmic influences suggest careful consideration.'
  }

  private getQuestionSpecificGuidance(questionType: string, moonHouse: number, moonSign: string): string {
    const guidance: { [key: string]: string } = {
      'relationship': `For relationship matters, the Moon in ${moonSign} suggests emotional authenticity is crucial.`,
      'career': `For career questions, the Moon in house ${moonHouse} indicates professional development opportunities.`,
      'financial': `For financial matters, the Moon's position suggests careful planning and timing.`,
      'health': `For health concerns, the Moon's influence suggests emotional well-being is connected to physical health.`,
      'travel': `For travel plans, the Moon's position indicates favorable timing for journeys.`,
      'general': `The cosmic influences suggest this matter requires your full attention and intention.`
    }
    return guidance[questionType] || guidance['general']
  }

  private getHouseMeaning(house: number): string {
    const meanings: { [key: number]: string } = {
      1: '1st (Self & Identity)',
      2: '2nd (Resources & Values)',
      3: '3rd (Communication & Siblings)',
      4: '4th (Home & Family)',
      5: '5th (Creativity & Children)',
      6: '6th (Health & Service)',
      7: '7th (Partnerships & Marriage)',
      8: '8th (Transformation & Shared Resources)',
      9: '9th (Higher Learning & Travel)',
      10: '10th (Career & Public Image)',
      11: '11th (Friends & Hopes)',
      12: '12th (Subconscious & Hidden Matters)'
    }
    return meanings[house] || 'unknown house'
  }

  private getMoonHouseMeaning(house: number): string {
    const meanings: { [key: number]: string } = {
      1: 'indicates the matter concerns your personal identity and how you present yourself to the world.',
      2: 'suggests the question relates to your resources, values, or material possessions.',
      3: 'shows the matter involves communication, learning, or relationships with siblings.',
      4: 'indicates the question concerns your home, family, or emotional foundation.',
      5: 'suggests the matter relates to creativity, romance, or children.',
      6: 'shows the question involves health, work, or daily routines.',
      7: 'indicates the matter concerns partnerships, marriage, or open enemies.',
      8: 'suggests the question involves transformation, shared resources, or hidden matters.',
      9: 'shows the matter relates to higher learning, travel, or philosophical beliefs.',
      10: 'indicates the question concerns your career, reputation, or public image.',
      11: 'suggests the matter involves friends, groups, or your hopes and dreams.',
      12: 'shows the question relates to subconscious patterns, hidden enemies, or spiritual matters.'
    }
    return meanings[house] || 'has unclear significance in this context.'
  }

  private getMoonSignMeaning(sign: string): string {
    const meanings: { [key: string]: string } = {
      'Aries': 'The Moon in Aries brings urgency and directness to the matter.',
      'Taurus': 'The Moon in Taurus suggests stability and persistence are needed.',
      'Gemini': 'The Moon in Gemini indicates communication and adaptability are key.',
      'Cancer': 'The Moon in Cancer emphasizes emotional security and nurturing.',
      'Leo': 'The Moon in Leo brings pride and leadership qualities to the situation.',
      'Virgo': 'The Moon in Virgo suggests attention to detail and practical solutions.',
      'Libra': 'The Moon in Libra emphasizes balance, harmony, and partnership.',
      'Scorpio': 'The Moon in Scorpio indicates transformation and deep emotional intensity.',
      'Sagittarius': 'The Moon in Sagittarius brings optimism and a broader perspective.',
      'Capricorn': 'The Moon in Capricorn suggests discipline and long-term planning.',
      'Aquarius': 'The Moon in Aquarius indicates innovation and unconventional approaches.',
      'Pisces': 'The Moon in Pisces brings intuition and spiritual sensitivity to the matter.'
    }
    return meanings[sign] || 'The Moon\'s sign provides additional context for the situation.'
  }

  private getDignityMeaning(dignity: string): string {
    const meanings: { [key: string]: string } = {
      'Domicile': 'strengthens the planet\'s natural qualities and gives it power to act effectively',
      'Exaltation': 'enhances the planet\'s positive qualities and brings success',
      'Detriment': 'weakens the planet\'s ability to act effectively and may cause delays',
      'Fall': 'diminishes the planet\'s positive qualities and may bring challenges',
      'Neutral': 'gives the planet neither advantage nor disadvantage'
    }
    return meanings[dignity] || 'affects the planet\'s ability to influence the matter'
  }

  private getDetailedQuestionAnalysis(questionType: string, moon: any, rulerPlanet: any, aspects: any[]): string {
    switch (questionType) {
      case 'love':
        return `the Moon's position and aspects reveal the emotional dynamics of your relationship. ${this.getLoveAnalysis(moon, rulerPlanet, aspects)}`
      case 'career':
        return `the chart shows the current state of your professional situation and potential opportunities. ${this.getCareerAnalysis(moon, rulerPlanet, aspects)}`
      case 'health':
        return `the planetary positions indicate the current state of your health and potential remedies. ${this.getHealthAnalysis(moon, rulerPlanet, aspects)}`
      case 'travel':
        return `the chart reveals whether travel plans will be successful and what to expect. ${this.getTravelAnalysis(moon, rulerPlanet, aspects)}`
      default:
        return `the planetary configurations provide insight into the matter at hand. ${this.getGeneralAnalysis(moon, rulerPlanet, aspects)}`
    }
  }

  private getDetailedTimingAnalysis(moon: any, aspects: any[]): string {
    if (!moon) return 'Timing cannot be determined from this chart.'
    
    const moonSpeed = moon.speed || 0
    const moonDegree = moon.degree || 0
    
    let timing = ''
    
    // Speed-based timing
    if (moonSpeed > 15) {
      timing += 'The Moon\'s rapid motion (over 15° per day) indicates swift developments, typically within days to weeks. '
    } else if (moonSpeed > 12) {
      timing += 'The Moon\'s normal speed (12-15° per day) suggests moderate timing, typically within weeks to months. '
    } else {
      timing += 'The Moon\'s slow motion (under 12° per day) indicates delayed timing, requiring patience over months. '
    }
    
    // Degree-based timing
    if (moonDegree < 5) {
      timing += 'The Moon\'s early degree position suggests the matter is just beginning to unfold. '
    } else if (moonDegree > 25) {
      timing += 'The Moon\'s late degree position indicates the matter is approaching completion. '
    } else {
      timing += 'The Moon\'s mid-degree position shows the matter is in active development. '
    }
    
    // Aspect-based timing
    const applyingAspects = aspects.filter(a => a.applying)
    if (applyingAspects.length > 0) {
      timing += `The Moon has ${applyingAspects.length} applying aspect${applyingAspects.length > 1 ? 's' : ''}, indicating active developments are occurring. `
    }
    
    return timing
  }

  private getLoveAnalysis(moon: any, rulerPlanet: any, aspects: any[]): string {
    const venus = aspects.find(a => a.planet1 === 'Venus' || a.planet2 === 'Venus')
    const mars = aspects.find(a => a.planet1 === 'Mars' || a.planet2 === 'Mars')
    
    let analysis = ''
    
    if (venus) {
      analysis += 'Venus aspects indicate romantic potential and relationship harmony. '
    }
    if (mars) {
      analysis += 'Mars aspects suggest passion and action in relationships. '
    }
    
    if (moon?.house === 7) {
      analysis += 'The Moon in the 7th house strongly supports partnership matters. '
    } else if (moon?.house === 5) {
      analysis += 'The Moon in the 5th house indicates romantic and creative fulfillment. '
    }
    
    return analysis
  }

  private getCareerAnalysis(moon: any, rulerPlanet: any, aspects: any[]): string {
    const saturn = aspects.find(a => a.planet1 === 'Saturn' || a.planet2 === 'Saturn')
    const jupiter = aspects.find(a => a.planet1 === 'Jupiter' || a.planet2 === 'Jupiter')
    
    let analysis = ''
    
    if (saturn) {
      analysis += 'Saturn aspects suggest career stability and long-term success through hard work. '
    }
    if (jupiter) {
      analysis += 'Jupiter aspects indicate expansion and opportunities in your professional life. '
    }
    
    if (moon?.house === 10) {
      analysis += 'The Moon in the 10th house strongly supports career advancement and public recognition. '
    } else if (moon?.house === 6) {
      analysis += 'The Moon in the 6th house indicates success through service and daily work. '
    }
    
    return analysis
  }

  private getHealthAnalysis(moon: any, rulerPlanet: any, aspects: any[]): string {
    const mars = aspects.find(a => a.planet1 === 'Mars' || a.planet2 === 'Mars')
    const saturn = aspects.find(a => a.planet1 === 'Saturn' || a.planet2 === 'Saturn')
    
    let analysis = ''
    
    if (mars) {
      analysis += 'Mars aspects indicate vitality and energy, but may also suggest inflammation or fever. '
    }
    if (saturn) {
      analysis += 'Saturn aspects suggest chronic conditions or the need for patience in healing. '
    }
    
    if (moon?.house === 6) {
      analysis += 'The Moon in the 6th house directly relates to health matters and daily well-being. '
    } else if (moon?.house === 12) {
      analysis += 'The Moon in the 12th house may indicate hidden health issues or the need for rest. '
    }
    
    return analysis
  }

  private getTravelAnalysis(moon: any, rulerPlanet: any, aspects: any[]): string {
    const jupiter = aspects.find(a => a.planet1 === 'Jupiter' || a.planet2 === 'Jupiter')
    const mercury = aspects.find(a => a.planet1 === 'Mercury' || a.planet2 === 'Mercury')
    
    let analysis = ''
    
    if (jupiter) {
      analysis += 'Jupiter aspects indicate successful and expansive travel experiences. '
    }
    if (mercury) {
      analysis += 'Mercury aspects suggest communication and learning opportunities during travel. '
    }
    
    if (moon?.house === 9) {
      analysis += 'The Moon in the 9th house strongly supports long-distance travel and higher learning. '
    } else if (moon?.house === 3) {
      analysis += 'The Moon in the 3rd house indicates short-distance travel and local journeys. '
    }
    
    return analysis
  }

  private getGeneralAnalysis(moon: any, rulerPlanet: any, aspects: any[]): string {
    const sun = aspects.find(a => a.planet1 === 'Sun' || a.planet2 === 'Sun')
    const mercury = aspects.find(a => a.planet1 === 'Mercury' || a.planet2 === 'Mercury')
    
    let analysis = ''
    
    if (sun) {
      analysis += 'Sun aspects indicate clarity and success in the matter. '
    }
    if (mercury) {
      analysis += 'Mercury aspects suggest communication and mental clarity are important. '
    }
    
    analysis += 'The overall planetary configuration provides guidance for your situation. '
    
    return analysis
  }

  private calculatePlanetaryDignity(planet: string, longitude: number): string {
    const sign = this.getSignFromLongitude(longitude)
    
    // Traditional dignity rules
    const dignities = {
      'Sun': { 'Leo': 'Domicile', 'Aries': 'Exaltation', 'Aquarius': 'Detriment', 'Libra': 'Fall' },
      'Moon': { 'Cancer': 'Domicile', 'Taurus': 'Exaltation', 'Capricorn': 'Detriment', 'Scorpio': 'Fall' },
      'Mercury': { 'Gemini': 'Domicile', 'Virgo': 'Domicile', 'Sagittarius': 'Detriment', 'Pisces': 'Fall' },
      'Venus': { 'Taurus': 'Domicile', 'Libra': 'Domicile', 'Pisces': 'Exaltation', 'Scorpio': 'Detriment', 'Aries': 'Detriment', 'Virgo': 'Fall' },
      'Mars': { 'Aries': 'Domicile', 'Scorpio': 'Domicile', 'Capricorn': 'Exaltation', 'Libra': 'Detriment', 'Taurus': 'Detriment', 'Cancer': 'Fall' },
      'Jupiter': { 'Sagittarius': 'Domicile', 'Pisces': 'Domicile', 'Cancer': 'Exaltation', 'Gemini': 'Detriment', 'Virgo': 'Detriment', 'Capricorn': 'Fall' },
      'Saturn': { 'Capricorn': 'Domicile', 'Aquarius': 'Domicile', 'Libra': 'Exaltation', 'Cancer': 'Detriment', 'Leo': 'Detriment', 'Aries': 'Fall' }
    }
    
    return (dignities as Record<string, Record<string, string>>)[planet]?.[sign] || 'Neutral'
  }

  private getSignFromLongitude(longitude: number): string {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    const signIndex = Math.floor(longitude / 30)
    return signs[signIndex] || 'Unknown'
  }

  async generateProfessionalHouseAnalysis(chartData: HoraryChartData, questionType: string): Promise<any[]> {
    const { planets, houses, aspects } = chartData
    const moon = planets.find(p => p.planet === 'Moon')
    const sun = planets.find(p => p.planet === 'Sun')
    
    type HouseWithExtras = { house: number; cusp: number; sign: string; lord?: string; degree?: number; minute?: number }
    type PlanetWithExtras = { planet: string; longitude: number; latitude: number; house: number; sign: string; degree: number; speed: number; minute?: number; retrograde?: boolean }
    return houses.map(house => {
      const h = house as HouseWithExtras
      const planetsInHouse = planets.filter(p => p.house === house.house)
      const houseRuler = planets.find(p => p.planet === h.lord)
      const houseAspects = aspects.filter(a => 
        planetsInHouse.some(p => p.planet === a.planet1 || p.planet === a.planet2)
      )
      
      return {
        house: house.house,
        name: this.getHouseName(house.house),
        cusp: `${h.degree ?? h.cusp ?? 0}°${h.minute ?? 0}' ${house.sign}`,
        ruler: h.lord ?? '',
        rulerPosition: houseRuler ? `${(houseRuler as PlanetWithExtras).degree}°${(houseRuler as PlanetWithExtras).minute ?? 0}' ${houseRuler.sign} in House ${houseRuler.house}` : 'Not found in chart',
        rulerDignity: houseRuler ? this.calculatePlanetaryDignity(houseRuler.planet, houseRuler.longitude) : 'Unknown',
        planets: planetsInHouse.map(p => {
          const px = p as PlanetWithExtras
          return {
            name: p.planet,
            position: `${px.degree}°${px.minute ?? 0}' ${p.sign}`,
            dignity: this.calculatePlanetaryDignity(p.planet, p.longitude),
            retrograde: px.retrograde ?? false
          }
        }),
        aspects: houseAspects.map(a => ({
          aspect: a.aspect,
          planets: `${a.planet1} ${a.aspect} ${a.planet2}`,
          orb: a.orb,
          applying: a.applying
        })),
        horarySignificance: this.getHoraryHouseSignificance(house.house, questionType, moon, planetsInHouse),
        professionalAnalysis: this.getProfessionalHouseAnalysis(house.house, houseRuler ?? null, planetsInHouse, houseAspects, questionType)
      }
    })
  }

  private getHouseName(houseNumber: number): string {
    const names: Record<number, string> = {
      1: '1st House - Self & Identity',
      2: '2nd House - Resources & Values', 
      3: '3rd House - Communication & Siblings',
      4: '4th House - Home & Family',
      5: '5th House - Creativity & Children',
      6: '6th House - Health & Service',
      7: '7th House - Partnerships & Marriage',
      8: '8th House - Transformation & Shared Resources',
      9: '9th House - Higher Learning & Travel',
      10: '10th House - Career & Public Image',
      11: '11th House - Friends & Hopes',
      12: '12th House - Subconscious & Hidden Matters'
    }
    return (names as Record<number, string>)[houseNumber] || `House ${houseNumber}`
  }

  private getHoraryHouseSignificance(houseNumber: number, questionType: string, moon: any, planetsInHouse: any[]): string {
    const significance: Record<number, string> = {
      1: 'In horary astrology, the 1st house represents the querent (questioner) and their current state of mind. The condition of this house shows how the questioner is approaching the matter.',
      2: 'The 2nd house governs money, possessions, and values. In horary, it shows the querent\'s resources and what they value most in relation to the question.',
      3: 'The 3rd house rules communication, siblings, and short journeys. In horary, it indicates how information flows and local matters.',
      4: 'The 4th house represents home, family, and emotional foundation. In horary, it shows the querent\'s private life and emotional security.',
      5: 'The 5th house governs creativity, children, and romance. In horary, it indicates pleasure, speculation, and matters of the heart.',
      6: 'The 6th house rules health, work, and service. In horary, it shows daily routines, health matters, and work-related issues.',
      7: 'The 7th house represents partnerships, marriage, and open enemies. In horary, it\'s crucial for relationship questions and legal matters.',
      8: 'The 8th house governs transformation, shared resources, and mysteries. In horary, it indicates hidden matters and significant changes.',
      9: 'The 9th house rules higher learning, travel, and philosophy. In horary, it shows long-distance matters and higher education.',
      10: 'The 10th house represents career, reputation, and public image. In horary, it\'s essential for career and status questions.',
      11: 'The 11th house governs friends, groups, and hopes. In horary, it shows the querent\'s aspirations and social connections.',
      12: 'The 12th house rules subconscious, secrets, and hidden enemies. In horary, it indicates hidden obstacles and spiritual matters.'
    }
    
    let analysis = (significance as Record<number, string>)[houseNumber] || 'This house has specific significance in horary astrology.'
    
    // Add Moon significance if Moon is in this house
    if (moon && moon.house === houseNumber) {
      analysis += ` The Moon in this house makes it the primary significator for the question, indicating this area of life is central to the matter.`
    }
    
    // Add question-specific significance
    if (questionType === 'love' && (houseNumber === 5 || houseNumber === 7)) {
      analysis += ` For relationship questions, this house is particularly significant as it directly relates to matters of the heart.`
    } else if (questionType === 'career' && (houseNumber === 6 || houseNumber === 10)) {
      analysis += ` For career questions, this house is crucial as it governs professional matters and public reputation.`
    } else if (questionType === 'health' && houseNumber === 6) {
      analysis += ` For health questions, this house is the primary indicator of physical well-being and medical matters.`
    } else if (questionType === 'travel' && (houseNumber === 3 || houseNumber === 9)) {
      analysis += ` For travel questions, this house indicates the nature and success of journeys.`
    }
    
    return analysis
  }

  private getProfessionalHouseAnalysis(houseNumber: number, ruler: any, planetsInHouse: any[], aspects: any[], questionType: string): string {
    let analysis = ''
    
    // Ruler analysis
    if (ruler) {
      const dignity = this.calculatePlanetaryDignity(ruler.planet, ruler.longitude)
      const rulerMin = (ruler as { minute?: number }).minute ?? 0
      analysis += `**Ruler Analysis:** The ruler of this house, ${ruler.planet}, is positioned at ${ruler.degree}°${rulerMin}' ${ruler.sign} in house ${ruler.house}. `
      analysis += `${ruler.planet} is in ${dignity.toLowerCase()}, which ${this.getDignityMeaning(dignity)}. `
      
      if ((ruler as { retrograde?: boolean }).retrograde) {
        analysis += `The retrograde motion of ${ruler.planet} suggests delays or internal processing in matters related to this house. `
      }
    } else {
      analysis += `**Ruler Analysis:** The ruler of this house is not clearly defined in the current chart, suggesting uncertainty in this area of life. `
    }
    
    // Planets in house analysis
    if (planetsInHouse.length > 0) {
      analysis += `**Planets in House:** This house contains ${planetsInHouse.length} planet${planetsInHouse.length > 1 ? 's' : ''}: `
      planetsInHouse.forEach((planet, index) => {
        const dignity = this.calculatePlanetaryDignity(planet.planet, planet.longitude)
        const pMin = (planet as { minute?: number }).minute ?? 0
        analysis += `${planet.planet} at ${planet.degree}°${pMin}' ${planet.sign} (${dignity.toLowerCase()})`
        if ((planet as { retrograde?: boolean }).retrograde) analysis += ' (retrograde)'
        if (index < planetsInHouse.length - 1) analysis += ', '
      })
      analysis += '. '
      
      // Analyze the strongest planet
      const strongestPlanet = planetsInHouse.reduce((strongest, current) => {
        const currentDignity = this.calculatePlanetaryDignity(current.planet, current.longitude)
        const strongestDignity = this.calculatePlanetaryDignity(strongest.planet, strongest.longitude)
        return this.getDignityStrength(currentDignity) > this.getDignityStrength(strongestDignity) ? current : strongest
      })
      
      analysis += `The most influential planet here is ${strongestPlanet.planet}, which ${this.getPlanetInHouseMeaning(strongestPlanet.planet, houseNumber)}. `
    } else {
      analysis += `**Planets in House:** This house is empty, suggesting that matters related to this area may not be the primary focus of the question. `
    }
    
    // Aspects analysis
    if (aspects.length > 0) {
      analysis += `**Aspects:** This house forms ${aspects.length} aspect${aspects.length > 1 ? 's' : ''} with other houses: `
      aspects.forEach((aspect, index) => {
        analysis += `${aspect.aspect} aspect between ${aspect.planet1} and ${aspect.planet2}`
        if (aspect.applying) analysis += ' (applying)'
        if (index < aspects.length - 1) analysis += ', '
      })
      analysis += '. '
    }
    
    // Question-specific analysis
    analysis += `**Horary Significance:** ${this.getQuestionSpecificHouseAnalysis(houseNumber, questionType, ruler, planetsInHouse)}`
    
    return analysis
  }

  private getDignityStrength(dignity: string): number {
    const strengths = {
      'Domicile': 5,
      'Exaltation': 4,
      'Neutral': 3,
      'Detriment': 2,
      'Fall': 1
    }
    return (strengths as Record<string, number>)[dignity] || 3
  }

  private getPlanetInHouseMeaning(planet: string, house: number): string {
    const meanings = {
      'Sun': 'brings clarity, leadership, and vitality to this area of life',
      'Moon': 'indicates emotional sensitivity and fluctuating conditions in this area',
      'Mercury': 'suggests communication, learning, and adaptability are important here',
      'Venus': 'brings harmony, beauty, and pleasure to this area of life',
      'Mars': 'indicates action, energy, and potential conflict in this area',
      'Jupiter': 'suggests expansion, wisdom, and good fortune in this area',
      'Saturn': 'indicates discipline, limitations, and long-term development here',
      'Uranus': 'brings innovation, sudden changes, and unconventional approaches',
      'Neptune': 'suggests intuition, confusion, and spiritual matters in this area',
      'Pluto': 'indicates transformation, power, and deep psychological processes'
    }
    return (meanings as Record<string, string>)[planet] || 'influences this area of life in its unique way'
  }

  private getQuestionSpecificHouseAnalysis(houseNumber: number, questionType: string, ruler: any, planetsInHouse: any[]): string {
    switch (questionType) {
      case 'love':
        if (houseNumber === 5) return 'For love questions, this house indicates romantic potential and creative expression in relationships.'
        if (houseNumber === 7) return 'For love questions, this house is crucial as it directly represents partnerships and marriage.'
        if (houseNumber === 1) return 'For love questions, this house shows how the querent presents themselves in relationships.'
        if (houseNumber === 11) return 'For love questions, this house indicates hopes and dreams for the relationship.'
        return 'This house provides additional context for relationship matters.'
        
      case 'career':
        if (houseNumber === 10) return 'For career questions, this house is the primary indicator of professional success and public reputation.'
        if (houseNumber === 6) return 'For career questions, this house shows daily work routines and service to others.'
        if (houseNumber === 2) return 'For career questions, this house indicates earning potential and financial resources.'
        if (houseNumber === 11) return 'For career questions, this house shows professional networks and career aspirations.'
        return 'This house provides additional context for career matters.'
        
      case 'health':
        if (houseNumber === 6) return 'For health questions, this house is the primary indicator of physical well-being and daily health routines.'
        if (houseNumber === 12) return 'For health questions, this house may indicate hidden health issues or the need for rest.'
        if (houseNumber === 1) return 'For health questions, this house shows overall vitality and physical constitution.'
        if (houseNumber === 8) return 'For health questions, this house may indicate serious health matters or transformation.'
        return 'This house provides additional context for health matters.'
        
      case 'travel':
        if (houseNumber === 9) return 'For travel questions, this house indicates long-distance journeys and foreign travel.'
        if (houseNumber === 3) return 'For travel questions, this house shows short trips and local travel.'
        if (houseNumber === 1) return 'For travel questions, this house shows the querent\'s readiness for travel.'
        if (houseNumber === 11) return 'For travel questions, this house indicates hopes and aspirations for the journey.'
        return 'This house provides additional context for travel matters.'
        
      default:
        return 'This house provides important context for understanding the question and its potential outcome.'
    }
  }

  private getSpecificAdvice(questionType: string, moonSign: string): string {
    const advice: { [key: string]: string } = {
      'relationship': 'Focus on honest communication and emotional vulnerability.',
      'career': 'Take initiative and showcase your unique talents.',
      'financial': 'Make decisions based on long-term stability rather than quick gains.',
      'health': 'Listen to your body and seek professional guidance when needed.',
      'travel': 'Plan thoroughly but remain open to spontaneous opportunities.',
      'general': 'Trust your intuition while maintaining practical awareness.'
    }
    return advice[questionType] || advice['general']
  }
}
