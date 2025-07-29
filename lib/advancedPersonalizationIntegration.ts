// ADVANCED PERSONALIZATION INTEGRATION
// Applies sophisticated personalization to remedy generation

import { ComprehensiveRemedy } from './comprehensiveRemedyDatabase'
import { AdvancedPersonalizationEngine, AdvancedUserProfile, PersonalizedContext, PersonalizationFactors } from './advancedPersonalization'

export interface PersonalizedRemedy extends ComprehensiveRemedy {
  personalizationFactors: PersonalizationFactors
  personalizedInstructions: string[]
  personalizedBenefits: string[]
  personalizedTiming: string
  personalizedIntensity: string
  personalizedDuration: string
  personalizedFrequency: string
  personalizedCost: string
  personalizedDifficulty: string
  compatibilityScore: number
  effectivenessPrediction: number
  adherencePrediction: number
  riskAssessment: string
  culturalNotes: string[]
  lifestyleAdaptations: string[]
  contraindications: string[]
  alternatives: string[]
  progressTracking: {
    milestones: string[]
    successMetrics: string[]
    adjustmentTriggers: string[]
  }
}

export class AdvancedPersonalizationIntegration {
  private personalizationEngine: AdvancedPersonalizationEngine
  
  constructor(userProfile: AdvancedUserProfile, context: PersonalizedContext) {
    this.personalizationEngine = new AdvancedPersonalizationEngine(userProfile, context)
  }
  
  // ============================================================================
  // MAIN PERSONALIZATION INTEGRATION
  // ============================================================================
  
  personalizeRemedies(remedies: ComprehensiveRemedy[]): PersonalizedRemedy[] {
    return remedies.map(remedy => this.personalizeRemedy(remedy))
  }
  
  private personalizeRemedy(remedy: ComprehensiveRemedy): PersonalizedRemedy {
    const factors = this.personalizationEngine.calculateComprehensiveScore(remedy)
    
    return {
      ...remedy,
      personalizationFactors: factors,
      personalizedInstructions: this.generatePersonalizedInstructions(remedy, factors),
      personalizedBenefits: this.generatePersonalizedBenefits(remedy, factors),
      personalizedTiming: this.generatePersonalizedTiming(remedy, factors),
      personalizedIntensity: this.generatePersonalizedIntensity(remedy, factors),
      personalizedDuration: this.generatePersonalizedDuration(remedy, factors),
      personalizedFrequency: this.generatePersonalizedFrequency(remedy, factors),
      personalizedCost: this.generatePersonalizedCost(remedy, factors),
      personalizedDifficulty: this.generatePersonalizedDifficulty(remedy, factors),
      compatibilityScore: factors.remedyCompatibility,
      effectivenessPrediction: factors.predictedEffectiveness,
      adherencePrediction: factors.adherenceLikelihood,
      riskAssessment: this.generateRiskAssessment(factors),
      culturalNotes: this.generateCulturalNotes(remedy, factors),
      lifestyleAdaptations: this.generateLifestyleAdaptations(remedy, factors),
      contraindications: this.generateContraindications(remedy, factors),
      alternatives: this.generateAlternatives(remedy, factors),
      progressTracking: this.generateProgressTracking(remedy, factors)
    }
  }
  
  // ============================================================================
  // PERSONALIZED INSTRUCTION GENERATION
  // ============================================================================
  
  private generatePersonalizedInstructions(remedy: ComprehensiveRemedy, factors: PersonalizationFactors): string[] {
    const baseInstructions = [...remedy.instructions]
    const personalizedInstructions: string[] = []
    
    // Add personality-based modifications
    if (factors.remedyCompatibility > 80) {
      personalizedInstructions.push("🌟 This remedy aligns perfectly with your personality - expect enhanced results!")
    } else if (factors.remedyCompatibility < 40) {
      personalizedInstructions.push("⚠️ This remedy may require extra effort due to personality differences - consider starting slowly")
    }
    
    // Add lifestyle adaptations
    if (factors.lifestyleFit < 60) {
      personalizedInstructions.push("🔄 Adapt this practice to fit your current lifestyle - focus on consistency over perfection")
    }
    
    // Add timing optimizations
    if (factors.timingOptimality > 80) {
      personalizedInstructions.push("⏰ The current timing is optimal for this practice - take advantage of this cosmic alignment")
    }
    
    // Add resource considerations
    if (factors.resourceAlignment < 70) {
      personalizedInstructions.push("💰 Consider budget-friendly alternatives or gradual implementation")
    }
    
    // Add difficulty adjustments
    if (factors.difficultyModifier > 1.2) {
      personalizedInstructions.push("📈 This practice has been enhanced for your advanced level - expect deeper results")
    } else if (factors.difficultyModifier < 0.8) {
      personalizedInstructions.push("🛡️ This practice has been simplified for your comfort level - build up gradually")
    }
    
    return [...baseInstructions, ...personalizedInstructions]
  }
  
  // ============================================================================
  // PERSONALIZED BENEFIT GENERATION
  // ============================================================================
  
  private generatePersonalizedBenefits(remedy: ComprehensiveRemedy, factors: PersonalizationFactors): string[] {
    const baseBenefits = [...remedy.benefits]
    const personalizedBenefits: string[] = []
    
    // Add effectiveness predictions
    if (factors.predictedEffectiveness > 85) {
      personalizedBenefits.push("🎯 High effectiveness predicted based on your profile")
    } else if (factors.predictedEffectiveness < 60) {
      personalizedBenefits.push("📊 Moderate effectiveness - consider combining with other practices")
    }
    
    // Add adherence predictions
    if (factors.adherenceLikelihood > 80) {
      personalizedBenefits.push("✅ High likelihood of consistent practice and results")
    } else if (factors.adherenceLikelihood < 60) {
      personalizedBenefits.push("📅 Consider setting reminders and tracking progress")
    }
    
    // Add long-term benefits
    if (factors.longTermBenefit > 80) {
      personalizedBenefits.push("🌱 Excellent long-term benefits for your life path")
    }
    
    return [...baseBenefits, ...personalizedBenefits]
  }
  
  // ============================================================================
  // PERSONALIZED TIMING GENERATION
  // ============================================================================
  
  private generatePersonalizedTiming(remedy: ComprehensiveRemedy, factors: PersonalizationFactors): string {
    const baseTiming = remedy.activationTime || "Anytime"
    
    if (factors.timingOptimality > 90) {
      return `🌟 OPTIMAL TIMING: ${baseTiming} - Perfect cosmic alignment for maximum effectiveness`
    } else if (factors.timingOptimality > 70) {
      return `✨ GOOD TIMING: ${baseTiming} - Favorable conditions for this practice`
    } else if (factors.timingOptimality < 40) {
      return `⚠️ CHALLENGING TIMING: ${baseTiming} - Consider waiting for better alignment or use with extra intention`
    }
    
    return baseTiming
  }
  
  // ============================================================================
  // PERSONALIZED INTENSITY GENERATION
  // ============================================================================
  
  private generatePersonalizedIntensity(remedy: ComprehensiveRemedy, factors: PersonalizationFactors): string {
    const baseIntensity = remedy.difficulty || "moderate"
    
    if (factors.intensityModifier > 1.3) {
      return "🔥 INTENSIFIED - Enhanced for your advanced level and high energy"
    } else if (factors.intensityModifier > 1.1) {
      return "⚡ ENHANCED - Slightly intensified for optimal results"
    } else if (factors.intensityModifier < 0.7) {
      return "🛡️ GENTLE - Softened for your comfort and current energy level"
    } else if (factors.intensityModifier < 0.9) {
      return "🌱 MODERATE - Adjusted for balanced practice"
    }
    
    return baseIntensity
  }
  
  // ============================================================================
  // PERSONALIZED DURATION GENERATION
  // ============================================================================
  
  private generatePersonalizedDuration(remedy: ComprehensiveRemedy, factors: PersonalizationFactors): string {
    const baseDuration = remedy.duration || "30 days"
    
    if (factors.durationModifier > 1.2) {
      return "⏳ EXTENDED - Longer duration for deeper transformation"
    } else if (factors.durationModifier < 0.8) {
      return "⚡ SHORTENED - Condensed for your busy lifestyle"
    }
    
    return baseDuration
  }
  
  // ============================================================================
  // PERSONALIZED FREQUENCY GENERATION
  // ============================================================================
  
  private generatePersonalizedFrequency(remedy: ComprehensiveRemedy, factors: PersonalizationFactors): string {
    const baseFrequency = remedy.frequency || "Daily"
    
    if (factors.frequencyModifier > 1.2) {
      return "🔄 INCREASED - More frequent practice for accelerated results"
    } else if (factors.frequencyModifier < 0.8) {
      return "📅 REDUCED - Less frequent practice for sustainable integration"
    }
    
    return baseFrequency
  }
  
  // ============================================================================
  // PERSONALIZED COST GENERATION
  // ============================================================================
  
  private generatePersonalizedCost(remedy: ComprehensiveRemedy, factors: PersonalizationFactors): string {
    const baseCost = remedy.cost || "medium"
    
    if (factors.costModifier > 1.2) {
      return "💎 PREMIUM - Enhanced investment for maximum quality"
    } else if (factors.costModifier < 0.8) {
      return "💰 BUDGET-FRIENDLY - Cost-effective alternatives recommended"
    }
    
    return baseCost
  }
  
  // ============================================================================
  // PERSONALIZED DIFFICULTY GENERATION
  // ============================================================================
  
  private generatePersonalizedDifficulty(remedy: ComprehensiveRemedy, factors: PersonalizationFactors): string {
    const baseDifficulty = remedy.difficulty || "intermediate"
    
    if (factors.difficultyModifier > 1.3) {
      return "🏆 EXPERT - Advanced level adapted for your capabilities"
    } else if (factors.difficultyModifier > 1.1) {
      return "📈 INTERMEDIATE+ - Slightly enhanced for your experience"
    } else if (factors.difficultyModifier < 0.7) {
      return "🛡️ BEGINNER - Simplified for your comfort level"
    } else if (factors.difficultyModifier < 0.9) {
      return "🌱 BEGINNER+ - Slightly simplified for easy adoption"
    }
    
    return baseDifficulty
  }
  
  // ============================================================================
  // RISK ASSESSMENT GENERATION
  // ============================================================================
  
  private generateRiskAssessment(factors: PersonalizationFactors): string {
    if (factors.sideEffectRisk < 20) {
      return "🟢 LOW RISK - Very safe practice with minimal side effects"
    } else if (factors.sideEffectRisk < 40) {
      return "🟡 MODERATE RISK - Generally safe with minor precautions"
    } else if (factors.sideEffectRisk < 60) {
      return "🟠 ELEVATED RISK - Requires careful attention and monitoring"
    } else {
      return "🔴 HIGH RISK - Consult with healthcare provider before starting"
    }
  }
  
  // ============================================================================
  // CULTURAL NOTES GENERATION
  // ============================================================================
  
  private generateCulturalNotes(remedy: ComprehensiveRemedy, factors: PersonalizationFactors): string[] {
    const notes: string[] = []
    
    if (factors.culturalRelevance > 90) {
      notes.push("🌟 Perfect cultural alignment - this practice resonates deeply with your background")
    } else if (factors.culturalRelevance > 70) {
      notes.push("✨ Good cultural fit - this practice should feel natural and comfortable")
    } else if (factors.culturalRelevance < 50) {
      notes.push("🌍 Cultural adaptation may be needed - consider local variations or alternatives")
    }
    
    return notes
  }
  
  // ============================================================================
  // LIFESTYLE ADAPTATIONS GENERATION
  // ============================================================================
  
  private generateLifestyleAdaptations(remedy: ComprehensiveRemedy, factors: PersonalizationFactors): string[] {
    const adaptations: string[] = []
    
    if (factors.lifestyleFit < 70) {
      adaptations.push("🔄 Adapt practice to your daily routine")
      adaptations.push("📱 Use technology reminders for consistency")
      adaptations.push("🎯 Focus on quality over quantity")
    }
    
    if (factors.resourceAlignment < 70) {
      adaptations.push("💰 Start with free or low-cost alternatives")
      adaptations.push("📚 Use library resources for materials")
      adaptations.push("🤝 Consider group practices for cost-sharing")
    }
    
    return adaptations
  }
  
  // ============================================================================
  // CONTRAINDICATIONS GENERATION
  // ============================================================================
  
  private generateContraindications(remedy: ComprehensiveRemedy, factors: PersonalizationFactors): string[] {
    const contraindications: string[] = []
    
    // Add base contraindications
    if (remedy.contraindications) {
      contraindications.push(...remedy.contraindications)
    }
    
    // Add personalized contraindications
    if (factors.sideEffectRisk > 50) {
      contraindications.push("⚠️ Monitor for adverse reactions")
      contraindications.push("🏥 Consult healthcare provider if concerns arise")
    }
    
    if (factors.adherenceLikelihood < 50) {
      contraindications.push("📅 Avoid if unable to maintain consistent practice")
    }
    
    return contraindications
  }
  
  // ============================================================================
  // ALTERNATIVES GENERATION
  // ============================================================================
  
  private generateAlternatives(remedy: ComprehensiveRemedy, factors: PersonalizationFactors): string[] {
    const alternatives: string[] = []
    
    if (factors.remedyCompatibility < 50) {
      alternatives.push("🔄 Consider similar practices with better personality alignment")
    }
    
    if (factors.lifestyleFit < 60) {
      alternatives.push("📱 Digital or app-based alternatives")
      alternatives.push("⏰ Shorter duration practices")
    }
    
    if (factors.costModifier > 1.3) {
      alternatives.push("💰 Budget-friendly alternatives available")
    }
    
    return alternatives
  }
  
  // ============================================================================
  // PROGRESS TRACKING GENERATION
  // ============================================================================
  
  private generateProgressTracking(remedy: ComprehensiveRemedy, factors: PersonalizationFactors): {
    milestones: string[]
    successMetrics: string[]
    adjustmentTriggers: string[]
  } {
    return {
      milestones: [
        "Week 1: Establish consistent practice routine",
        "Week 2: Notice initial subtle changes",
        "Week 4: Experience clear benefits",
        "Week 8: Integration into daily life",
        "Week 12: Mastery and optimization"
      ],
      successMetrics: [
        `Effectiveness: Track ${factors.predictedEffectiveness}% improvement target`,
        `Adherence: Maintain ${factors.adherenceLikelihood}% consistency`,
        "Energy levels and mood improvements",
        "Reduction in target symptoms or challenges",
        "Enhanced overall well-being"
      ],
      adjustmentTriggers: [
        "If no improvement after 2 weeks",
        "If experiencing adverse reactions",
        "If unable to maintain consistency",
        "If life circumstances change significantly",
        "If feeling overwhelmed or stressed"
      ]
    }
  }
  
  // ============================================================================
  // REMEDY RANKING AND FILTERING
  // ============================================================================
  
  rankRemedies(remedies: PersonalizedRemedy[]): PersonalizedRemedy[] {
    return remedies.sort((a, b) => {
      // Primary sort by overall compatibility score
      const scoreA = this.calculateOverallScore(a)
      const scoreB = this.calculateOverallScore(b)
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA
      }
      
      // Secondary sort by effectiveness prediction
      return b.effectivenessPrediction - a.effectivenessPrediction
    })
  }
  
  private calculateOverallScore(remedy: PersonalizedRemedy): number {
    const weights = {
      compatibility: 0.25,
      effectiveness: 0.25,
      adherence: 0.20,
      timing: 0.15,
      risk: 0.15
    }
    
    return (
      remedy.compatibilityScore * weights.compatibility +
      remedy.effectivenessPrediction * weights.effectiveness +
      remedy.adherencePrediction * weights.adherence +
      remedy.personalizationFactors.timingOptimality * weights.timing +
      (100 - remedy.personalizationFactors.sideEffectRisk) * weights.risk
    )
  }
  
  filterRemedies(remedies: PersonalizedRemedy[], criteria: {
    minCompatibility?: number
    minEffectiveness?: number
    maxRisk?: number
    maxCost?: string
    maxDifficulty?: string
  }): PersonalizedRemedy[] {
    return remedies.filter(remedy => {
      if (criteria.minCompatibility && remedy.compatibilityScore < criteria.minCompatibility) return false
      if (criteria.minEffectiveness && remedy.effectivenessPrediction < criteria.minEffectiveness) return false
      if (criteria.maxRisk && remedy.personalizationFactors.sideEffectRisk > criteria.maxRisk) return false
      if (criteria.maxCost && this.getCostLevel(remedy.personalizedCost) > this.getCostLevel(criteria.maxCost)) return false
      if (criteria.maxDifficulty && this.getDifficultyLevel(remedy.personalizedDifficulty) > this.getDifficultyLevel(criteria.maxDifficulty)) return false
      return true
    })
  }
  
  private getCostLevel(cost: string): number {
    const costLevels: { [key: string]: number } = {
      'free': 0,
      'low': 1,
      'medium': 2,
      'high': 3,
      'luxury': 4
    }
    return costLevels[cost] || 2
  }
  
  private getDifficultyLevel(difficulty: string): number {
    const difficultyLevels: { [key: string]: number } = {
      'beginner': 0,
      'intermediate': 1,
      'advanced': 2,
      'expert': 3
    }
    return difficultyLevels[difficulty] || 1
  }
}

export default AdvancedPersonalizationIntegration 