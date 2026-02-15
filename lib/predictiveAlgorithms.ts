// Advanced Predictive Algorithms for FutureSeer
// Combining ancient wisdom with modern mathematics

import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore'
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from './firebase'

// ============================================================================
// MARKOV CHAIN PREDICTIONS
// ============================================================================

interface MarkovState {
  currentState: string
  possibleTransitions: Array<{
    nextState: string
    probability: number
    conditions: string[]
    cosmicFactors: string[]
  }>
  historicalData: number[]
  confidence: number
}

interface LifeTransition {
  fromState: string
  toState: string
  timestamp: number
  astroFactors: string[]
  numerologicalFactors: string[]
  userBehavior: string[]
  success: boolean
}

export class LifePathMarkovChain {
  private transitionMatrix: Map<string, Map<string, number>>
  private cosmicFactors: Map<string, number>
  private userHistory: Map<string, LifeTransition[]>
  private learningRate: number = 0.1

  constructor() {
    this.transitionMatrix = new Map()
    this.cosmicFactors = new Map()
    this.userHistory = new Map()
    this.initializeCosmicFactors()
  }

  private initializeCosmicFactors() {
    // Initialize cosmic influence factors
    this.cosmicFactors.set('new_moon', 1.2)
    this.cosmicFactors.set('full_moon', 1.3)
    this.cosmicFactors.set('mercury_retrograde', 0.8)
    this.cosmicFactors.set('jupiter_transit', 1.4)
    this.cosmicFactors.set('saturn_return', 1.5)
    this.cosmicFactors.set('solar_eclipse', 1.6)
    this.cosmicFactors.set('lunar_eclipse', 1.4)
  }

  predictNextState(
    userId: string,
    currentState: string,
    astroData: any,
    numerologyData: any,
    userBehavior: string[]
  ): MarkovState {
    devLog.debug('🔮 MarkovChain: Predicting next life state...')

    // Get user's transition history
    const userTransitions = this.userHistory.get(userId) || []
    
    // Calculate base transition probabilities
    const baseProbabilities = this.calculateBaseProbabilities(currentState, userTransitions)
    
    // Apply cosmic factors
    const cosmicProbabilities = this.applyCosmicFactors(baseProbabilities, astroData)
    
    // Apply numerological influences
    const numerologicalProbabilities = this.applyNumerologicalFactors(cosmicProbabilities, numerologyData)
    
    // Apply behavioral patterns
    const finalProbabilities = this.applyBehavioralPatterns(numerologicalProbabilities, userBehavior)
    
    // Generate possible transitions
    const possibleTransitions = this.generatePossibleTransitions(finalProbabilities, astroData, numerologyData)
    
    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(userTransitions.length, astroData, numerologyData)
    
    return {
      currentState,
      possibleTransitions,
      historicalData: userTransitions.map(t => t.timestamp),
      confidence
    }
  }

  private calculateBaseProbabilities(currentState: string, transitions: LifeTransition[]): Map<string, number> {
    const probabilities = new Map<string, number>()
    
    // Count transitions from current state
    const stateTransitions = transitions.filter(t => t.fromState === currentState)
    const totalTransitions = stateTransitions.length
    
    if (totalTransitions === 0) {
      // Use default probabilities for new states
      return this.getDefaultProbabilities(currentState)
    }
    
    // Calculate empirical probabilities
    const transitionCounts = new Map<string, number>()
    stateTransitions.forEach(transition => {
      const count = transitionCounts.get(transition.toState) || 0
      transitionCounts.set(transition.toState, count + 1)
    })
    
    transitionCounts.forEach((count, state) => {
      probabilities.set(state, count / totalTransitions)
    })
    
    return probabilities
  }

  private getDefaultProbabilities(currentState: string): Map<string, number> {
    const defaults = new Map<string, number>()
    
    // Default life state transitions
    const stateTransitions: { [key: string]: { [key: string]: number } } = {
      'student': {
        'career_start': 0.4,
        'relationship': 0.3,
        'travel': 0.2,
        'self_discovery': 0.1
      },
      'career_start': {
        'career_growth': 0.5,
        'relationship': 0.2,
        'challenge': 0.2,
        'spiritual_awakening': 0.1
      },
      'relationship': {
        'commitment': 0.4,
        'growth': 0.3,
        'challenge': 0.2,
        'ending': 0.1
      },
      'challenge': {
        'growth': 0.6,
        'transformation': 0.3,
        'stagnation': 0.1
      },
      'growth': {
        'success': 0.5,
        'new_challenge': 0.3,
        'spiritual_awakening': 0.2
      },
      'spiritual_awakening': {
        'transformation': 0.7,
        'service': 0.2,
        'integration': 0.1
      }
    }
    
    const transitions = stateTransitions[currentState] || {
      'growth': 0.4,
      'challenge': 0.3,
      'transformation': 0.2,
      'success': 0.1
    }
    
    Object.entries(transitions).forEach(([state, prob]) => {
      defaults.set(state, prob)
    })
    
    return defaults
  }

  private applyCosmicFactors(probabilities: Map<string, number>, astroData: any): Map<string, number> {
    const adjusted = new Map(probabilities)
    
    if (!astroData) return adjusted
    
    // Apply planetary influences
    const currentTransits = astroData.currentTransits || []
    
    currentTransits.forEach((transit: any) => {
      const factor = this.cosmicFactors.get(transit.planet) || 1.0
      
      // Adjust probabilities based on transit effects
      adjusted.forEach((prob, state) => {
        if (this.stateMatchesTransit(state, transit)) {
          adjusted.set(state, prob * factor)
        }
      })
    })
    
    // Normalize probabilities
    return this.normalizeProbabilities(adjusted)
  }

  private applyNumerologicalFactors(probabilities: Map<string, number>, numerologyData: any): Map<string, number> {
    const adjusted = new Map(probabilities)
    
    if (!numerologyData) return adjusted
    
    // Apply personal year number influence
    const personalYear = numerologyData.personalYearNumber
    const yearInfluence = this.getNumerologicalInfluence(personalYear)
    
    adjusted.forEach((prob, state) => {
      if (this.stateMatchesNumerology(state, personalYear)) {
        adjusted.set(state, prob * yearInfluence)
      }
    })
    
    return this.normalizeProbabilities(adjusted)
  }

  private applyBehavioralPatterns(probabilities: Map<string, number>, userBehavior: string[]): Map<string, number> {
    const adjusted = new Map(probabilities)
    
    // Analyze user behavior patterns
    const behaviorPatterns = this.analyzeBehaviorPatterns(userBehavior)
    
    behaviorPatterns.forEach((pattern, state) => {
      const currentProb = adjusted.get(state) || 0
      adjusted.set(state, currentProb * pattern.strength)
    })
    
    return this.normalizeProbabilities(adjusted)
  }

  private generatePossibleTransitions(
    probabilities: Map<string, number>,
    astroData: any,
    numerologyData: any
  ): Array<{ nextState: string; probability: number; conditions: string[]; cosmicFactors: string[] }> {
    const transitions: Array<{ nextState: string; probability: number; conditions: string[]; cosmicFactors: string[] }> = []
    
    probabilities.forEach((prob, state) => {
      if (prob > 0.05) { // Only include significant probabilities
        const conditions = this.generateConditions(state, astroData, numerologyData)
        const cosmicFactors = this.getCosmicFactors(state, astroData)
        
        transitions.push({
          nextState: state,
          probability: prob,
          conditions,
          cosmicFactors
        })
      }
    })
    
    // Sort by probability (highest first)
    return transitions.sort((a, b) => b.probability - a.probability)
  }

  private generateConditions(state: string, astroData: any, numerologyData: any): string[] {
    const conditions: string[] = []
    
    // Add astrological conditions
    if (astroData?.currentTransits) {
      astroData.currentTransits.forEach((transit: any) => {
        if (this.stateMatchesTransit(state, transit)) {
          conditions.push(`${transit.planet} transit in ${transit.targetPlanet}`)
        }
      })
    }
    
    // Add numerological conditions
    if (numerologyData?.personalYearNumber) {
      const year = numerologyData.personalYearNumber
      if (this.stateMatchesNumerology(state, year)) {
        conditions.push(`Personal Year ${year} influence`)
      }
    }
    
    // Add timing conditions
    const currentDate = new Date()
    const moonPhase = this.getMoonPhase(currentDate)
    if (moonPhase) {
      conditions.push(`${moonPhase} moon phase`)
    }
    
    return conditions
  }

  private getCosmicFactors(state: string, astroData: any): string[] {
    const factors: string[] = []
    
    if (!astroData) return factors
    
    // Add planetary influences
    const planets = astroData.planets || []
    planets.forEach((planet: any) => {
      if (this.stateMatchesPlanet(state, planet)) {
        factors.push(`${planet.name} in ${planet.sign}`)
      }
    })
    
    // Add current transits
    const transits = astroData.currentTransits || []
    transits.forEach((transit: any) => {
      factors.push(`${transit.planet} ${transit.aspect} ${transit.targetPlanet}`)
    })
    
    return factors
  }

  private calculateConfidence(transitionCount: number, astroData: any, numerologyData: any): number {
    let confidence = 0.5 // Base confidence
    
    // Increase confidence with more historical data
    confidence += Math.min(transitionCount * 0.1, 0.3)
    
    // Increase confidence with complete astro data
    if (astroData?.planets?.length > 0) confidence += 0.1
    if (astroData?.currentTransits?.length > 0) confidence += 0.1
    
    // Increase confidence with numerology data
    if (numerologyData?.personalYearNumber) confidence += 0.1
    
    return Math.min(confidence, 0.95)
  }

  // Helper methods
  private normalizeProbabilities(probabilities: Map<string, number>): Map<string, number> {
    const total = Array.from(probabilities.values()).reduce((sum, prob) => sum + prob, 0)
    if (total === 0) return probabilities
    
    const normalized = new Map<string, number>()
    probabilities.forEach((prob, state) => {
      normalized.set(state, prob / total)
    })
    
    return normalized
  }

  private stateMatchesTransit(state: string, transit: any): boolean {
    // Define which states are influenced by which transits
    const transitInfluences: { [key: string]: string[] } = {
      'jupiter_transit': ['growth', 'success', 'expansion'],
      'saturn_transit': ['challenge', 'discipline', 'maturity'],
      'uranus_transit': ['transformation', 'innovation', 'awakening'],
      'neptune_transit': ['spiritual_awakening', 'inspiration', 'illusion'],
      'pluto_transit': ['transformation', 'power', 'regeneration']
    }
    
    const influences = transitInfluences[transit.planet] || []
    return influences.includes(state)
  }

  private stateMatchesNumerology(state: string, personalYear: number): boolean {
    // Define which states are influenced by which personal years
    const yearInfluences: { [key: number]: string[] } = {
      1: ['new_beginnings', 'leadership', 'independence'],
      2: ['partnership', 'cooperation', 'patience'],
      3: ['creativity', 'communication', 'joy'],
      4: ['stability', 'hard_work', 'discipline'],
      5: ['change', 'freedom', 'adventure'],
      6: ['responsibility', 'harmony', 'service'],
      7: ['spirituality', 'analysis', 'wisdom'],
      8: ['power', 'success', 'material'],
      9: ['completion', 'compassion', 'universal_love']
    }
    
    const influences = yearInfluences[personalYear] || []
    return influences.includes(state)
  }

  private getNumerologicalInfluence(personalYear: number): number {
    // Return influence multiplier based on personal year
    const influences: { [key: number]: number } = {
      1: 1.2, 2: 1.1, 3: 1.3, 4: 0.9, 5: 1.4,
      6: 1.1, 7: 1.2, 8: 1.3, 9: 1.1
    }
    
    return influences[personalYear] || 1.0
  }

  private analyzeBehaviorPatterns(behavior: string[]): Map<string, { strength: number; pattern: string }> {
    const patterns = new Map<string, { strength: number; pattern: string }>()
    
    // Analyze behavior for patterns
    const behaviorString = behavior.join(' ').toLowerCase()
    
    if (behaviorString.includes('meditation') || behaviorString.includes('spiritual')) {
      patterns.set('spiritual_awakening', { strength: 1.3, pattern: 'spiritual_focus' })
    }
    
    if (behaviorString.includes('work') || behaviorString.includes('career')) {
      patterns.set('career_growth', { strength: 1.2, pattern: 'career_focus' })
    }
    
    if (behaviorString.includes('relationship') || behaviorString.includes('love')) {
      patterns.set('relationship', { strength: 1.4, pattern: 'relationship_focus' })
    }
    
    if (behaviorString.includes('challenge') || behaviorString.includes('difficulty')) {
      patterns.set('challenge', { strength: 1.3, pattern: 'challenge_focus' })
    }
    
    return patterns
  }

  private stateMatchesPlanet(state: string, planet: any): boolean {
    // Define which states are influenced by which planets
    const planetInfluences: { [key: string]: string[] } = {
      'Sun': ['leadership', 'success', 'vitality'],
      'Moon': ['emotions', 'intuition', 'nurturing'],
      'Mercury': ['communication', 'learning', 'adaptability'],
      'Venus': ['love', 'beauty', 'harmony'],
      'Mars': ['action', 'courage', 'conflict'],
      'Jupiter': ['growth', 'wisdom', 'expansion'],
      'Saturn': ['discipline', 'responsibility', 'challenge'],
      'Uranus': ['innovation', 'freedom', 'awakening'],
      'Neptune': ['spirituality', 'inspiration', 'illusion'],
      'Pluto': ['transformation', 'power', 'regeneration']
    }
    
    const influences = planetInfluences[planet.name] || []
    return influences.includes(state)
  }

  private getMoonPhase(date: Date): string | null {
    // Simplified moon phase calculation
    const lunarMonth = 29.53058867
    const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime()
    const timeDiff = date.getTime() - knownNewMoon
    const daysSinceNewMoon = (timeDiff / (1000 * 60 * 60 * 24)) % lunarMonth
    
    if (daysSinceNewMoon < 3.5) return 'new'
    if (daysSinceNewMoon < 10.5) return 'waxing_crescent'
    if (daysSinceNewMoon < 17.5) return 'full'
    if (daysSinceNewMoon < 24.5) return 'waning_crescent'
    return 'new'
  }

  // Learning and improvement methods
  async recordTransition(
    userId: string,
    transition: LifeTransition
  ): Promise<void> {
    const userTransitions = this.userHistory.get(userId) || []
    userTransitions.push(transition)
    this.userHistory.set(userId, userTransitions)
    
    // Update transition matrix
    this.updateTransitionMatrix(transition)
    
    // Store in Firebase for persistence
    try {
      const db = getFirebaseDB()
      const docRef = doc(db, 'users', userId, 'markovTransitions', transition.timestamp.toString())
      await setDoc(docRef, transition)
    } catch (error) {
      devLog.warn('Failed to store transition in Firebase:', error, 'predictiveAlgorithms')
    }
  }

  private updateTransitionMatrix(transition: LifeTransition): void {
    const fromState = transition.fromState
    const toState = transition.toState
    
    if (!this.transitionMatrix.has(fromState)) {
      this.transitionMatrix.set(fromState, new Map())
    }
    
    const stateTransitions = this.transitionMatrix.get(fromState)!
    const currentProb = stateTransitions.get(toState) || 0
    
    // Update probability with learning rate
    const newProb = currentProb + this.learningRate * (1 - currentProb)
    stateTransitions.set(toState, newProb)
    
    // Normalize probabilities for this state
    this.normalizeStateTransitions(stateTransitions)
  }

  private normalizeStateTransitions(transitions: Map<string, number>): void {
    const total = Array.from(transitions.values()).reduce((sum, prob) => sum + prob, 0)
    if (total === 0) return
    
    transitions.forEach((prob, state) => {
      transitions.set(state, prob / total)
    })
  }

  // Get prediction summary
  getPredictionSummary(prediction: MarkovState): {
    primaryPrediction: string
    confidence: string
    timing: string
    recommendations: string[]
  } {
    const primaryTransition = prediction.possibleTransitions[0]
    
    return {
      primaryPrediction: primaryTransition.nextState,
      confidence: `${Math.round(prediction.confidence * 100)}%`,
      timing: this.predictTiming(primaryTransition),
      recommendations: this.generateRecommendations(primaryTransition)
    }
  }

  private predictTiming(transition: any): string {
    // Predict timing based on cosmic factors
    const cosmicFactors = transition.cosmicFactors
    const hasJupiter = cosmicFactors.some((f: string) => f.includes('Jupiter'))
    const hasSaturn = cosmicFactors.some((f: string) => f.includes('Saturn'))
    
    if (hasJupiter) return 'Within 3-6 months (Jupiter influence)'
    if (hasSaturn) return 'Within 6-12 months (Saturn influence)'
    return 'Within 1-3 months'
  }

  private generateRecommendations(transition: any): string[] {
    const recommendations: string[] = []
    
    // Add recommendations based on the predicted state
    switch (transition.nextState) {
      case 'spiritual_awakening':
        recommendations.push('Practice daily meditation')
        recommendations.push('Explore spiritual literature')
        recommendations.push('Connect with like-minded individuals')
        break
      case 'career_growth':
        recommendations.push('Focus on skill development')
        recommendations.push('Network with professionals')
        recommendations.push('Set clear career goals')
        break
      case 'relationship':
        recommendations.push('Open your heart to new connections')
        recommendations.push('Practice active listening')
        recommendations.push('Work on self-love first')
        break
      case 'challenge':
        recommendations.push('Stay resilient and patient')
        recommendations.push('Seek support from trusted friends')
        recommendations.push('Focus on personal growth')
        break
      default:
        recommendations.push('Trust your intuition')
        recommendations.push('Stay open to opportunities')
        recommendations.push('Practice gratitude daily')
    }
    
    return recommendations
  }
}

// ============================================================================
// BAYESIAN NETWORK PREDICTIONS
// ============================================================================

interface BayesianNode {
  variable: string
  parents: string[]
  probabilityTable: Map<string, number>
  evidence: any[]
  cosmicInfluence: number
}

interface BayesianPrediction {
  prediction: string
  confidence: number
  factors: string[]
  probabilityDistribution: Map<string, number>
  reasoning: string[]
}

export class MysticalBayesianNetwork {
  private nodes: Map<string, BayesianNode>
  private evidence: Map<string, any>
  private cosmicFactors: Map<string, number>

  constructor() {
    this.nodes = new Map()
    this.evidence = new Map()
    this.cosmicFactors = new Map()
    this.initializeNetwork()
  }

  private initializeNetwork() {
    // Initialize nodes for different life aspects
    this.addNode('life_purpose', [], {
      'spiritual_service': 0.3,
      'creative_expression': 0.25,
      'leadership': 0.2,
      'healing': 0.15,
      'innovation': 0.1
    })
    
    this.addNode('relationship_status', ['life_purpose'], {
      'single_seeking': 0.4,
      'committed': 0.3,
      'complicated': 0.2,
      'spiritual_partnership': 0.1
    })
    
    this.addNode('career_path', ['life_purpose'], {
      'entrepreneur': 0.3,
      'creative_professional': 0.25,
      'healing_profession': 0.2,
      'spiritual_teacher': 0.15,
      'innovator': 0.1
    })
    
    this.addNode('spiritual_growth', ['life_purpose', 'relationship_status'], {
      'awakening': 0.4,
      'integration': 0.3,
      'mastery': 0.2,
      'transcendence': 0.1
    })
  }

  private addNode(variable: string, parents: string[], probabilities: { [key: string]: number }) {
    const node: BayesianNode = {
      variable,
      parents,
      probabilityTable: new Map(Object.entries(probabilities)),
      evidence: [],
      cosmicInfluence: 1.0
    }
    
    this.nodes.set(variable, node)
  }

  calculatePrediction(
    evidence: any,
    astroData: any,
    numerologyData: any
  ): BayesianPrediction {
    devLog.debug('🔮 BayesianNetwork: Calculating prediction...')
    
    // Set evidence
    this.setEvidence(evidence)
    
    // Apply cosmic factors
    this.applyCosmicFactors(astroData, numerologyData)
    
    // Calculate posterior probabilities
    const probabilityDistribution = this.calculatePosteriorProbabilities()
    
    // Find most likely outcome
    const prediction = this.findMostLikelyOutcome(probabilityDistribution)
    
    // Calculate confidence
    const confidence = this.calculateConfidence(probabilityDistribution)
    
    // Generate factors and reasoning
    const factors = this.generateFactors(evidence, astroData, numerologyData)
    const reasoning = this.generateReasoning(prediction, factors)
    
    return {
      prediction,
      confidence,
      factors,
      probabilityDistribution,
      reasoning
    }
  }

  private setEvidence(evidence: any): void {
    this.evidence.clear()
    
    // Set evidence from user data
    Object.entries(evidence).forEach(([key, value]) => {
      this.evidence.set(key, value)
    })
  }

  private applyCosmicFactors(astroData: any, numerologyData: any): void {
    // Apply astrological influences to nodes
    this.nodes.forEach((node, variable) => {
      const influence = this.calculateCosmicInfluence(variable, astroData, numerologyData)
      node.cosmicInfluence = influence
    })
  }

  private calculateCosmicInfluence(variable: string, astroData: any, numerologyData: any): number {
    let influence = 1.0
    
    if (!astroData || !numerologyData) return influence
    
    // Apply planetary influences
    const planets = astroData.planets || []
    planets.forEach((planet: any) => {
      const planetInfluence = this.getPlanetaryInfluence(variable, planet)
      influence *= planetInfluence
    })
    
    // Apply numerological influences
    const personalYear = numerologyData.personalYearNumber
    const numerologicalInfluence = this.getNumerologicalInfluence(variable, personalYear)
    influence *= numerologicalInfluence
    
    return influence
  }

  private getPlanetaryInfluence(variable: string, planet: any): number {
    // Define planetary influences on different variables
    const influences: { [key: string]: { [key: string]: number } } = {
      'life_purpose': {
        'Sun': 1.3, 'Jupiter': 1.2, 'Saturn': 0.9, 'Neptune': 1.4
      },
      'relationship_status': {
        'Venus': 1.4, 'Moon': 1.3, 'Mars': 1.1, 'Saturn': 0.8
      },
      'career_path': {
        'Mercury': 1.2, 'Jupiter': 1.3, 'Saturn': 1.1, 'Uranus': 1.4
      },
      'spiritual_growth': {
        'Neptune': 1.5, 'Pluto': 1.4, 'Jupiter': 1.2, 'Saturn': 0.9
      }
    }
    
    const variableInfluences = influences[variable] || {}
    return variableInfluences[planet.name] || 1.0
  }

  private getNumerologicalInfluence(variable: string, personalYear: number): number {
    // Define numerological influences on different variables
    const influences: { [key: string]: { [key: number]: number } } = {
      'life_purpose': {
        1: 1.3, 3: 1.2, 7: 1.4, 9: 1.3
      },
      'relationship_status': {
        2: 1.4, 6: 1.3, 9: 1.2
      },
      'career_path': {
        1: 1.3, 4: 1.2, 8: 1.4
      },
      'spiritual_growth': {
        7: 1.5, 9: 1.4, 11: 1.6, 22: 1.7
      }
    }
    
    const variableInfluences = influences[variable] || {}
    return variableInfluences[personalYear] || 1.0
  }

  private calculatePosteriorProbabilities(): Map<string, number> {
    const probabilities = new Map<string, number>()
    
    // Calculate probabilities for each possible outcome
    const outcomes = ['spiritual_service', 'creative_expression', 'leadership', 'healing', 'innovation']
    
    outcomes.forEach(outcome => {
      const probability = this.calculateOutcomeProbability(outcome)
      probabilities.set(outcome, probability)
    })
    
    // Normalize probabilities
    return this.normalizeProbabilities(probabilities)
  }

  private calculateOutcomeProbability(outcome: string): number {
    let probability = 1.0
    
    // Calculate joint probability using Bayes' theorem
    this.nodes.forEach((node, variable) => {
      const nodeProb = this.calculateNodeProbability(node, outcome)
      probability *= nodeProb * node.cosmicInfluence
    })
    
    return probability
  }

  private calculateNodeProbability(node: BayesianNode, outcome: string): number {
    // Get base probability from probability table
    const baseProb = node.probabilityTable.get(outcome) || 0.1
    
    // Adjust based on evidence
    let adjustedProb = baseProb
    
    node.evidence.forEach(evidence => {
      if (evidence.supports && evidence.supports.includes(outcome)) {
        adjustedProb *= 1.2
      } else if (evidence.contradicts && evidence.contradicts.includes(outcome)) {
        adjustedProb *= 0.8
      }
    })
    
    return adjustedProb
  }

  private findMostLikelyOutcome(probabilities: Map<string, number>): string {
    let maxProb = 0
    let mostLikely = ''
    
    probabilities.forEach((prob, outcome) => {
      if (prob > maxProb) {
        maxProb = prob
        mostLikely = outcome
      }
    })
    
    return mostLikely
  }

  private calculateConfidence(probabilities: Map<string, number>): number {
    const values = Array.from(probabilities.values())
    const maxProb = Math.max(...values)
    const totalProb = values.reduce((sum, prob) => sum + prob, 0)
    
    // Confidence based on how much the highest probability dominates
    return maxProb / totalProb
  }

  private generateFactors(evidence: any, astroData: any, numerologyData: any): string[] {
    const factors: string[] = []
    
    // Add evidence factors
    Object.entries(evidence).forEach(([key, value]) => {
      factors.push(`${key}: ${value}`)
    })
    
    // Add astrological factors
    if (astroData?.planets) {
      astroData.planets.forEach((planet: any) => {
        factors.push(`${planet.name} in ${planet.sign}`)
      })
    }
    
    // Add numerological factors
    if (numerologyData?.personalYearNumber) {
      factors.push(`Personal Year ${numerologyData.personalYearNumber}`)
    }
    
    return factors
  }

  private generateReasoning(prediction: string, factors: string[]): string[] {
    const reasoning: string[] = []
    
    // Add reasoning based on prediction
    switch (prediction) {
      case 'spiritual_service':
        reasoning.push('Strong Neptune and Jupiter influences suggest spiritual calling')
        reasoning.push('Personal year number indicates service-oriented period')
        reasoning.push('Current planetary alignments favor spiritual development')
        break
      case 'creative_expression':
        reasoning.push('Venus and Mercury alignments support creative endeavors')
        reasoning.push('Numerological patterns indicate artistic expression')
        reasoning.push('Cosmic energies favor creative manifestation')
        break
      case 'leadership':
        reasoning.push('Sun and Mars positions indicate leadership potential')
        reasoning.push('Personal year suggests taking charge')
        reasoning.push('Astrological aspects support authority and direction')
        break
      default:
        reasoning.push('Multiple factors align to support this outcome')
        reasoning.push('Cosmic energies are favorable for this path')
        reasoning.push('Personal numerology supports this direction')
    }
    
    return reasoning
  }

  private normalizeProbabilities(probabilities: Map<string, number>): Map<string, number> {
    const total = Array.from(probabilities.values()).reduce((sum, prob) => sum + prob, 0)
    if (total === 0) return probabilities
    
    const normalized = new Map<string, number>()
    probabilities.forEach((prob, outcome) => {
      normalized.set(outcome, prob / total)
    })
    
    return normalized
  }
}

// ============================================================================
// MAIN PREDICTIVE SYSTEM
// ============================================================================

export class PredictiveSystem {
  private markovChain: LifePathMarkovChain
  private bayesianNetwork: MysticalBayesianNetwork

  constructor() {
    this.markovChain = new LifePathMarkovChain()
    this.bayesianNetwork = new MysticalBayesianNetwork()
  }

  async generateComprehensivePrediction(
    userId: string,
    currentState: string,
    astroData: any,
    numerologyData: any,
    userBehavior: string[],
    evidence: any
  ): Promise<{
    markovPrediction: MarkovState
    bayesianPrediction: BayesianPrediction
    combinedPrediction: string
    confidence: number
    recommendations: string[]
    timing: string
  }> {
    devLog.debug('🔮 PredictiveSystem: Generating comprehensive prediction...')
    
    // Generate Markov Chain prediction
    const markovPrediction = this.markovChain.predictNextState(
      userId,
      currentState,
      astroData,
      numerologyData,
      userBehavior
    )
    
    // Generate Bayesian Network prediction
    const bayesianPrediction = this.bayesianNetwork.calculatePrediction(
      evidence,
      astroData,
      numerologyData
    )
    
    // Combine predictions
    const combinedPrediction = this.combinePredictions(markovPrediction, bayesianPrediction)
    const confidence = this.calculateCombinedConfidence(markovPrediction, bayesianPrediction)
    const recommendations = this.combineRecommendations(markovPrediction, bayesianPrediction)
    const timing = this.predictCombinedTiming(markovPrediction, bayesianPrediction)
    
    return {
      markovPrediction,
      bayesianPrediction,
      combinedPrediction,
      confidence,
      recommendations,
      timing
    }
  }

  private combinePredictions(markov: MarkovState, bayesian: BayesianPrediction): string {
    // Weight the predictions (Markov for transitions, Bayesian for outcomes)
    const markovWeight = 0.6
    const bayesianWeight = 0.4
    
    const markovPrimary = markov.possibleTransitions[0]?.nextState || 'growth'
    const bayesianPrimary = bayesian.prediction
    
    // If predictions align, use the aligned prediction
    if (markovPrimary === bayesianPrimary) {
      return markovPrimary
    }
    
    // Otherwise, use weighted combination
    const markovScore = markov.possibleTransitions[0]?.probability || 0
    const bayesianScore = bayesian.confidence
    
    const combinedScore = (markovScore * markovWeight) + (bayesianScore * bayesianWeight)
    
    if (combinedScore > 0.5) {
      return markovPrimary // Prefer Markov for transitions
    } else {
      return bayesianPrimary // Prefer Bayesian for outcomes
    }
  }

  private calculateCombinedConfidence(markov: MarkovState, bayesian: BayesianPrediction): number {
    const markovConfidence = markov.confidence
    const bayesianConfidence = bayesian.confidence
    
    // Weighted average of confidences
    return (markovConfidence * 0.6) + (bayesianConfidence * 0.4)
  }

  private combineRecommendations(markov: MarkovState, bayesian: BayesianPrediction): string[] {
    const markovRecs = this.markovChain.getPredictionSummary(markov).recommendations
    const bayesianReasoning = bayesian.reasoning
    
    // Combine and deduplicate recommendations
    const allRecs = [...markovRecs, ...bayesianReasoning]
    const uniqueRecs = [...new Set(allRecs)]
    
    return uniqueRecs.slice(0, 5) // Return top 5 recommendations
  }

  private predictCombinedTiming(markov: MarkovState, bayesian: BayesianPrediction): string {
    const markovTiming = this.markovChain.getPredictionSummary(markov).timing
    const bayesianConfidence = bayesian.confidence
    
    // Adjust timing based on Bayesian confidence
    if (bayesianConfidence > 0.8) {
      return markovTiming.replace('months', 'weeks').replace('6-12', '2-4')
    } else if (bayesianConfidence < 0.5) {
      return markovTiming.replace('months', 'months').replace('1-3', '3-6')
    }
    
    return markovTiming
  }

  // Record user outcomes for learning
  async recordOutcome(
    userId: string,
    prediction: string,
    actualOutcome: string,
    success: boolean,
    timestamp: number
  ): Promise<void> {
    // Record for Markov Chain learning
    const transition: LifeTransition = {
      fromState: 'current_state', // This would be the actual current state
      toState: actualOutcome,
      timestamp,
      astroFactors: [],
      numerologicalFactors: [],
      userBehavior: [],
      success
    }
    
    await this.markovChain.recordTransition(userId, transition)
    
    // Store outcome in Firebase for analysis
    try {
      const db = getFirebaseDB()
      const docRef = doc(db, 'users', userId, 'predictionOutcomes', timestamp.toString())
      await setDoc(docRef, {
        prediction,
        actualOutcome,
        success,
        timestamp,
        userId
      })
    } catch (error) {
      devLog.warn('Failed to store prediction outcome:', error, 'predictiveAlgorithms')
    }
  }
}

// Export instances for use in the application
export const predictiveSystem = new PredictiveSystem()
export const markovChain = new LifePathMarkovChain()
export const bayesianNetwork = new MysticalBayesianNetwork()
export { MysticalBayesianNetwork as BayesianBeliefNetwork } 