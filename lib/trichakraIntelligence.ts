// TRICHAKRA INTELLIGENCE ENGINE
// Analyzes multiple occult systems and generates integrated remedies
// Organizes remedies into Body, Mind, and Soul levels (Trichakra approach)

import { generateAstrologicalChart } from './astroCalculations'
import { calculateLifePathNumber, calculateDestinyNumber, calculateSoulNumber } from './numerologyCalculations'
import { getLalKitabRemediesForPlanets } from './lalKitabRemedies'
import {
  TrichakraRemedy,
  convertAstrologicalRemedy,
  convertNumerologyRemedy,
  convertVastuRemedy,
  convertLalKitabRemedy,
  organizeRemediesByChakra,
  generateActionPlan,
  findComplementaryRemedies,
  checkConflictingRemedies
} from './trichakraRemedyGenerator'
import { GEMSTONE_DATABASE } from './remedyDatabase'

export interface UserProfile {
  fullName?: string
  birthDate?: string
  birthTime?: string
  birthPlace?: string
  latitude?: number
  longitude?: number
}

export interface TrichakraAnalysis {
  userProfile: UserProfile
  astrologicalAnalysis: {
    weakPlanets: string[]
    strongPlanets: string[]
    doshas: any[]
    maleficHouses: number[]
    chartData: any
  }
  numerologyAnalysis: {
    lifePathNumber: number
    destinyNumber: number
    soulNumber: number
    nameAdjustments: string[]
    luckyNumbers: number[]
    luckyDays: string[]
  }
  vastuAnalysis: {
    favorableDirections: string[]
    unfavorableDirections: string[]
    remedies: any[]
  }
  lalKitabAnalysis: {
    planetRemedies: any[]
    priorityPlanets: string[]
  }
  remedies: {
    body: TrichakraRemedy[]
    mind: TrichakraRemedy[]
    soul: TrichakraRemedy[]
  }
  actionPlan: {
    immediate: TrichakraRemedy[]
    shortTerm: TrichakraRemedy[]
    longTerm: TrichakraRemedy[]
  }
  complementaryRemedies: Array<{
    remedy: TrichakraRemedy
    complements: TrichakraRemedy[]
  }>
  metadata: {
    generatedAt: Date
    version: string
    systemsAnalyzed: string[]
  }
}

class TrichakraIntelligence {
  /**
   * Main entry point: Generate comprehensive Trichakra remedies
   */
  async generateTrichakraRemedies(userProfile: UserProfile): Promise<TrichakraAnalysis> {
    // 1. Analyze Astrological Remedies
    const astrologicalAnalysis = await this.analyzeAstrologicalRemedies(userProfile)
    
    // 2. Analyze Numerology Remedies
    const numerologyAnalysis = this.analyzeNumerologyRemedies(userProfile)
    
    // 3. Analyze Vastu Remedies
    const vastuAnalysis = this.analyzeVastuRemedies(userProfile)
    
    // 4. Analyze Lal Kitab Remedies
    const lalKitabAnalysis = this.analyzeLalKitabRemedies(astrologicalAnalysis.weakPlanets)
    
    // 5. Convert and combine all remedies
    const allRemedies = this.combineAllRemedies(
      astrologicalAnalysis,
      numerologyAnalysis,
      vastuAnalysis,
      lalKitabAnalysis
    )
    
    // 6. Organize by chakras
    const organizedRemedies = organizeRemediesByChakra(allRemedies)
    
    // 7. Generate action plan
    const actionPlan = generateActionPlan(organizedRemedies)
    
    // 8. Find complementary remedies
    const complementaryRemedies = this.findAllComplementaryRemedies(allRemedies)
    
    return {
      userProfile,
      astrologicalAnalysis,
      numerologyAnalysis,
      vastuAnalysis,
      lalKitabAnalysis,
      remedies: organizedRemedies,
      actionPlan,
      complementaryRemedies,
      metadata: {
        generatedAt: new Date(),
        version: '1.0.0',
        systemsAnalyzed: ['astrology', 'numerology', 'vastu', 'lal-kitab']
      }
    }
  }

  /**
   * Analyze astrological remedies based on birth chart
   */
  private async analyzeAstrologicalRemedies(userProfile: UserProfile) {
    let chartData: any = null
    const weakPlanets: string[] = []
    const strongPlanets: string[] = []
    const doshas: any[] = []
    const maleficHouses: number[] = []

    try {
      if (userProfile.birthDate && userProfile.birthTime && 
          userProfile.latitude && userProfile.longitude) {
        chartData = generateAstrologicalChart(
          userProfile.birthDate,
          userProfile.birthTime,
          userProfile.latitude,
          userProfile.longitude
        )

        // Analyze planetary positions
        if (chartData.planets) {
          chartData.planets.forEach((planet: any) => {
            // Simple logic: planets in debilitation or weak houses are weak
            if (planet.house === 6 || planet.house === 8 || planet.house === 12) {
              weakPlanets.push(planet.name.toLowerCase())
            } else if (planet.house === 1 || planet.house === 5 || planet.house === 9) {
              strongPlanets.push(planet.name.toLowerCase())
            }
          })
        }

        // Check for common doshas (simplified)
        if (chartData.planets) {
          const mars = chartData.planets.find((p: any) => p.name === 'Mars')
          const saturn = chartData.planets.find((p: any) => p.name === 'Saturn')
          
          if (mars && (mars.house === 1 || mars.house === 4 || mars.house === 7 || mars.house === 8)) {
            doshas.push({
              type: 'Mangal Dosha',
              severity: 'high',
              description: 'Mars in challenging position',
              remedies: ['Wear red coral', 'Chant Mars mantra', 'Donate red items']
            })
          }

          if (saturn && (saturn.house === 1 || saturn.house === 4 || saturn.house === 7 || saturn.house === 8)) {
            doshas.push({
              type: 'Shani Dosha',
              severity: 'high',
              description: 'Saturn in challenging position',
              remedies: ['Feed crows on Saturday', 'Donate mustard oil', 'Wear blue sapphire']
            })
          }
        }

        // Identify malefic houses (6, 8, 12)
        maleficHouses.push(6, 8, 12)
      }
    } catch (error) {
      console.error('Error analyzing astrological remedies:', error)
    }

    return {
      weakPlanets,
      strongPlanets,
      doshas,
      maleficHouses,
      chartData
    }
  }

  /**
   * Analyze numerology remedies based on name and birth date
   */
  private analyzeNumerologyRemedies(userProfile: UserProfile) {
    let lifePathNumber = 0
    let destinyNumber = 0
    let soulNumber = 0
    const nameAdjustments: string[] = []
    const luckyNumbers: number[] = []
    const luckyDays: string[] = []

    try {
      if (userProfile.birthDate) {
        lifePathNumber = calculateLifePathNumber(userProfile.birthDate)
        luckyNumbers.push(lifePathNumber)
      }

      if (userProfile.fullName) {
        destinyNumber = calculateDestinyNumber(userProfile.fullName)
        soulNumber = calculateSoulNumber(userProfile.fullName)
        luckyNumbers.push(destinyNumber, soulNumber)
      }

      // Suggest name adjustments based on numbers
      if (lifePathNumber === 4 || lifePathNumber === 8) {
        nameAdjustments.push('Consider adding letters that reduce to 1, 3, or 5 for balance')
      }
      if (destinyNumber === 4 || destinyNumber === 8) {
        nameAdjustments.push('Consider spelling variations that create more harmonious numbers')
      }

      // Determine lucky days based on life path number
      const dayMapping: Record<number, string[]> = {
        1: ['Sunday', 'Monday'],
        2: ['Monday', 'Friday'],
        3: ['Thursday', 'Sunday'],
        4: ['Saturday', 'Sunday'],
        5: ['Wednesday', 'Friday'],
        6: ['Friday', 'Monday'],
        7: ['Monday', 'Thursday'],
        8: ['Saturday', 'Sunday'],
        9: ['Tuesday', 'Thursday']
      }
      luckyDays.push(...(dayMapping[lifePathNumber] || ['Monday', 'Friday']))
    } catch (error) {
      console.error('Error analyzing numerology remedies:', error)
    }

    return {
      lifePathNumber,
      destinyNumber,
      soulNumber,
      nameAdjustments,
      luckyNumbers: [...new Set(luckyNumbers)],
      luckyDays: [...new Set(luckyDays)]
    }
  }

  /**
   * Analyze Vastu remedies based on birth data
   */
  private analyzeVastuRemedies(userProfile: UserProfile) {
    const favorableDirections: string[] = []
    const unfavorableDirections: string[] = []
    const remedies: any[] = []

    try {
      if (userProfile.birthDate) {
        const date = new Date(userProfile.birthDate)
        const dayOfWeek = date.getDay()
        
        // Simple directional mapping based on birth day
        const directionMapping: Record<number, { favorable: string[], unfavorable: string[] }> = {
          0: { favorable: ['north', 'northeast'], unfavorable: ['south', 'southwest'] }, // Sunday
          1: { favorable: ['north', 'northwest'], unfavorable: ['south', 'southeast'] }, // Monday
          2: { favorable: ['east', 'northeast'], unfavorable: ['west', 'southwest'] }, // Tuesday
          3: { favorable: ['north', 'northeast'], unfavorable: ['south', 'southwest'] }, // Wednesday
          4: { favorable: ['northeast', 'east'], unfavorable: ['southwest', 'west'] }, // Thursday
          5: { favorable: ['north', 'northeast'], unfavorable: ['south', 'southwest'] }, // Friday
          6: { favorable: ['west', 'northwest'], unfavorable: ['east', 'southeast'] } // Saturday
        }

        const mapping = directionMapping[dayOfWeek] || directionMapping[0]
        favorableDirections.push(...mapping.favorable)
        unfavorableDirections.push(...mapping.unfavorable)

        // Generate Vastu remedies
        remedies.push({
          title: 'Directional Remedies',
          description: 'Follow favorable directions for important activities',
          instructions: [
            `Sleep with head towards ${favorableDirections[0] || 'north'}`,
            `Place prayer room in ${favorableDirections[0] || 'northeast'} direction`,
            `Avoid ${unfavorableDirections[0] || 'south'} direction for main activities`
          ],
          priority: 'medium',
          cost: 'free'
        })
      }
    } catch (error) {
      console.error('Error analyzing Vastu remedies:', error)
    }

    return {
      favorableDirections,
      unfavorableDirections,
      remedies
    }
  }

  /**
   * Analyze Lal Kitab remedies for weak planets
   */
  private analyzeLalKitabRemedies(weakPlanets: string[]): {
    planetRemedies: any[]
    priorityPlanets: string[]
  } {
    const planetRemedies = getLalKitabRemediesForPlanets(weakPlanets)
    
    return {
      planetRemedies,
      priorityPlanets: weakPlanets
    }
  }

  /**
   * Combine all remedies from different systems
   */
  private combineAllRemedies(
    astrologicalAnalysis: any,
    numerologyAnalysis: any,
    vastuAnalysis: any,
    lalKitabAnalysis: any
  ): TrichakraRemedy[] {
    const allRemedies: TrichakraRemedy[] = []

    // Add astrological remedies
    astrologicalAnalysis.weakPlanets.forEach((planet: string) => {
      // Gemstone remedies
      const gemstoneRemedy = {
        id: `gemstone_${planet}`,
        title: `Wear ${this.getGemstoneForPlanet(planet)}`,
        description: `Strengthen ${planet} with gemstone therapy`,
        instructions: [
          `Wear ${this.getGemstoneForPlanet(planet)} on ${this.getPlanetaryDay(planet)}`,
          'Wear during auspicious hours',
          'Clean gemstone regularly'
        ],
        priority: 'high' as const,
        cost: 'high' as const,
        benefits: [`Strengthens ${planet}`, 'Improves planetary energy', 'Better fortune']
      }
      allRemedies.push(convertAstrologicalRemedy(gemstoneRemedy, planet))

      // Mantra remedies
      const mantraRemedy = {
        id: `mantra_${planet}`,
        title: `Chant ${planet} Mantra`,
        description: `Strengthen ${planet} with mantra chanting`,
        instructions: [
          `Chant ${this.getPlanetaryMantra(planet)} 108 times daily`,
          `Best time: ${this.getPlanetaryDay(planet)} during ${this.getPlanetaryTime(planet)}`,
          'Use mala (rosary) for counting'
        ],
        priority: 'high' as const,
        cost: 'free' as const,
        benefits: [`Strengthens ${planet}`, 'Spiritual growth', 'Mental peace']
      }
      allRemedies.push(convertAstrologicalRemedy(mantraRemedy, planet))
    })

    // Add dosha remedies
    astrologicalAnalysis.doshas.forEach((dosha: any) => {
      dosha.remedies.forEach((remedy: string) => {
        const doshaRemedy = {
          id: `dosha_${dosha.type}_${Date.now()}`,
          title: remedy,
          description: `Remedy for ${dosha.type}`,
          instructions: [remedy, 'Perform regularly', 'Maintain consistency'],
          priority: dosha.severity === 'high' ? 'critical' as const : 'high' as const,
          cost: 'low' as const,
          benefits: [`Addresses ${dosha.type}`, 'Reduces negative effects', 'Improves life conditions']
        }
        allRemedies.push(convertAstrologicalRemedy(doshaRemedy))
      })
    })

    // Add numerology remedies
    if (numerologyAnalysis.lifePathNumber) {
      const numRemedy = {
        id: `num_lifepath_${numerologyAnalysis.lifePathNumber}`,
        title: `Life Path ${numerologyAnalysis.lifePathNumber} Remedies`,
        description: `Remedies for Life Path Number ${numerologyAnalysis.lifePathNumber}`,
        instructions: [
          `Use lucky numbers: ${numerologyAnalysis.luckyNumbers.join(', ')}`,
          `Favorable days: ${numerologyAnalysis.luckyDays.join(', ')}`,
          ...numerologyAnalysis.nameAdjustments
        ],
        priority: 'medium' as const,
        cost: 'free' as const,
        benefits: ['Better life path alignment', 'Improved fortune', 'Personal growth']
      }
      allRemedies.push(convertNumerologyRemedy(numRemedy, numerologyAnalysis.lifePathNumber))
    }

    // Add Vastu remedies
    vastuAnalysis.remedies.forEach((remedy: any) => {
      allRemedies.push(convertVastuRemedy(remedy, vastuAnalysis.favorableDirections[0]))
    })

    // Add Lal Kitab remedies
    lalKitabAnalysis.planetRemedies.forEach((remedy: any) => {
      allRemedies.push(convertLalKitabRemedy(remedy))
    })

    return allRemedies
  }

  /**
   * Find all complementary remedies
   */
  private findAllComplementaryRemedies(allRemedies: TrichakraRemedy[]): Array<{
    remedy: TrichakraRemedy
    complements: TrichakraRemedy[]
  }> {
    return allRemedies.map(remedy => ({
      remedy,
      complements: findComplementaryRemedies(remedy, allRemedies)
    })).filter(item => item.complements.length > 0)
  }

  // Helper methods
  private getGemstoneForPlanet(planet: string): string {
    const gemstones: Record<string, string> = {
      sun: 'Ruby',
      moon: 'Pearl',
      mars: 'Red Coral',
      mercury: 'Emerald',
      jupiter: 'Yellow Sapphire',
      venus: 'Diamond',
      saturn: 'Blue Sapphire',
      rahu: 'Hessonite',
      ketu: 'Cat\'s Eye'
    }
    return gemstones[planet.toLowerCase()] || 'Crystal'
  }

  private getPlanetaryDay(planet: string): string {
    const days: Record<string, string> = {
      sun: 'Sunday',
      moon: 'Monday',
      mars: 'Tuesday',
      mercury: 'Wednesday',
      jupiter: 'Thursday',
      venus: 'Friday',
      saturn: 'Saturday',
      rahu: 'Saturday',
      ketu: 'Tuesday'
    }
    return days[planet.toLowerCase()] || 'Monday'
  }

  private getPlanetaryMantra(planet: string): string {
    const mantras: Record<string, string> = {
      sun: 'Om Suryaya Namah',
      moon: 'Om Chandramase Namah',
      mars: 'Om Mangalaya Namah',
      mercury: 'Om Budhaya Namah',
      jupiter: 'Om Brihaspataye Namah',
      venus: 'Om Shukraya Namah',
      saturn: 'Om Shanaishcharaya Namah',
      rahu: 'Om Rahave Namah',
      ketu: 'Om Ketave Namah'
    }
    return mantras[planet.toLowerCase()] || 'Om'
  }

  private getPlanetaryTime(planet: string): string {
    const times: Record<string, string> = {
      sun: 'Sunrise (6-8 AM)',
      moon: 'Evening (6-8 PM)',
      mars: 'Morning (8-10 AM)',
      mercury: 'Morning (8-10 AM)',
      jupiter: 'Morning (8-10 AM)',
      venus: 'Evening (6-8 PM)',
      saturn: 'Evening (6-8 PM)',
      rahu: 'Evening (6-8 PM)',
      ketu: 'Morning (8-10 AM)'
    }
    return times[planet.toLowerCase()] || 'Morning'
  }
}

export const trichakraIntelligence = new TrichakraIntelligence()
