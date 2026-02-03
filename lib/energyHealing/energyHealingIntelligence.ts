// Energy Healing Intelligence Service
// Core logic for energy healing analysis using Groq API

import { UserProfile } from '@/lib/firebase';
import { energyHealingImageAnalyzer } from './energyHealingImageAnalyzer';
import {
  ChakraAnalysis,
  AuraReading,
  ReikiAnalysis,
  CrystalRecommendation,
  EnergyBalanceAnalysis
} from './energyHealingImageAnalyzer';

export interface EnergyHealingAnalysis {
  method: 'chakra' | 'aura' | 'reiki' | 'crystal' | 'energy';
  timestamp: Date;
  chakraAnalysis?: ChakraAnalysis;
  auraReading?: AuraReading;
  reikiAnalysis?: ReikiAnalysis;
  crystalRecommendation?: CrystalRecommendation;
  energyBalance?: EnergyBalanceAnalysis;
  overallInsights: string[];
  recommendations: string[];
}

class EnergyHealingIntelligence {
  /**
   * Analyze chakras using AI
   */
  async analyzeChakras(
    userProfile: UserProfile,
    imageUrl?: string
  ): Promise<ChakraAnalysis> {
    try {
      console.log('✨ Analyzing chakras with AI...');
      
      const response = await fetch('/api/tools/energy-healing/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'chakra',
          userProfile,
          imageUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze chakras');
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid response from chakra analysis API');
      }

      return energyHealingImageAnalyzer.formatChakraAnalysis(result.data);
    } catch (error: any) {
      console.error('⚠️ AI chakra analysis failed, using fallback:', error);
      return this.getFallbackChakraAnalysis();
    }
  }

  /**
   * Analyze aura using AI
   */
  async analyzeAura(
    userProfile: UserProfile,
    imageUrl?: string
  ): Promise<AuraReading> {
    try {
      console.log('✨ Analyzing aura with AI...');
      
      const response = await fetch('/api/tools/energy-healing/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'aura',
          userProfile,
          imageUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze aura');
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid response from aura analysis API');
      }

      return energyHealingImageAnalyzer.formatAuraReading(result.data);
    } catch (error: any) {
      console.error('⚠️ AI aura analysis failed, using fallback:', error);
      return this.getFallbackAuraReading();
    }
  }

  /**
   * Analyze Reiki energy
   */
  async analyzeReiki(userProfile: UserProfile): Promise<ReikiAnalysis> {
    try {
      console.log('✨ Analyzing Reiki energy with AI...');
      
      const response = await fetch('/api/tools/energy-healing/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'reiki',
          userProfile
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze Reiki');
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid response from Reiki analysis API');
      }

      return energyHealingImageAnalyzer.formatReikiAnalysis(result.data);
    } catch (error: any) {
      console.error('⚠️ AI Reiki analysis failed, using fallback:', error);
      return this.getFallbackReikiAnalysis();
    }
  }

  /**
   * Get crystal recommendations
   */
  async analyzeCrystals(userProfile: UserProfile): Promise<CrystalRecommendation> {
    try {
      console.log('✨ Analyzing crystal recommendations with AI...');
      
      const response = await fetch('/api/tools/energy-healing/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'crystal',
          userProfile
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze crystals');
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid response from crystal analysis API');
      }

      return energyHealingImageAnalyzer.formatCrystalAnalysis(result.data);
    } catch (error: any) {
      console.error('⚠️ AI crystal analysis failed, using fallback:', error);
      return this.getFallbackCrystalRecommendation();
    }
  }

  /**
   * Analyze overall energy balance
   */
  async analyzeEnergyBalance(userProfile: UserProfile): Promise<EnergyBalanceAnalysis> {
    try {
      console.log('✨ Analyzing energy balance with AI...');
      
      const response = await fetch('/api/tools/energy-healing/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'energy',
          userProfile
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze energy balance');
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid response from energy balance API');
      }

      return energyHealingImageAnalyzer.formatEnergyBalance(result.data);
    } catch (error: any) {
      console.error('⚠️ AI energy balance analysis failed, using fallback:', error);
      return this.getFallbackEnergyBalance();
    }
  }

  /**
   * Perform comprehensive energy healing analysis
   */
  async performHealingAnalysis(
    method: 'chakra' | 'aura' | 'reiki' | 'crystal' | 'energy',
    userProfile: UserProfile,
    imageUrl?: string
  ): Promise<EnergyHealingAnalysis> {
    const timestamp = new Date();
    let chakraAnalysis: ChakraAnalysis | undefined;
    let auraReading: AuraReading | undefined;
    let reikiAnalysis: ReikiAnalysis | undefined;
    let crystalRecommendation: CrystalRecommendation | undefined;
    let energyBalance: EnergyBalanceAnalysis | undefined;

    try {
      switch (method) {
        case 'chakra':
          chakraAnalysis = await this.analyzeChakras(userProfile, imageUrl);
          break;
        case 'aura':
          auraReading = await this.analyzeAura(userProfile, imageUrl);
          break;
        case 'reiki':
          reikiAnalysis = await this.analyzeReiki(userProfile);
          break;
        case 'crystal':
          crystalRecommendation = await this.analyzeCrystals(userProfile);
          break;
        case 'energy':
          energyBalance = await this.analyzeEnergyBalance(userProfile);
          break;
      }

      const overallInsights = this.generateOverallInsights(
        chakraAnalysis,
        auraReading,
        reikiAnalysis,
        crystalRecommendation,
        energyBalance
      );

      const recommendations = this.generateRecommendations(
        chakraAnalysis,
        auraReading,
        reikiAnalysis,
        crystalRecommendation,
        energyBalance
      );

      return {
        method,
        timestamp,
        chakraAnalysis,
        auraReading,
        reikiAnalysis,
        crystalRecommendation,
        energyBalance,
        overallInsights,
        recommendations
      };
    } catch (error: any) {
      console.error('Error performing healing analysis:', error);
      throw error;
    }
  }

  // Fallback methods for when AI fails
  private getFallbackChakraAnalysis(): ChakraAnalysis {
    return {
      chakras: [
        { name: 'Root Chakra', balance: 65, status: 'balanced', color: '#DC143C', interpretation: 'Root chakra is balanced', recommendations: [] },
        { name: 'Sacral Chakra', balance: 60, status: 'balanced', color: '#FF8C00', interpretation: 'Sacral chakra is balanced', recommendations: [] },
        { name: 'Solar Plexus Chakra', balance: 70, status: 'balanced', color: '#FFD700', interpretation: 'Solar plexus chakra is balanced', recommendations: [] },
        { name: 'Heart Chakra', balance: 65, status: 'balanced', color: '#00FF00', interpretation: 'Heart chakra is balanced', recommendations: [] },
        { name: 'Throat Chakra', balance: 60, status: 'balanced', color: '#1E90FF', interpretation: 'Throat chakra is balanced', recommendations: [] },
        { name: 'Third Eye Chakra', balance: 65, status: 'balanced', color: '#4B0082', interpretation: 'Third eye chakra is balanced', recommendations: [] },
        { name: 'Crown Chakra', balance: 70, status: 'balanced', color: '#9370DB', interpretation: 'Crown chakra is balanced', recommendations: [] }
      ],
      overallBalance: 65,
      primaryIssues: [],
      recommendations: ['Maintain regular meditation practice', 'Use chakra-balancing crystals']
    };
  }

  private getFallbackAuraReading(): AuraReading {
    return {
      layers: [
        { name: 'Physical Layer', color: 'blue', thickness: 'medium', clarity: 'clear', interpretation: 'Balanced physical energy' },
        { name: 'Etheric Layer', color: 'green', thickness: 'medium', clarity: 'clear', interpretation: 'Normal etheric field' },
        { name: 'Emotional Layer', color: 'pink', thickness: 'medium', clarity: 'vibrant', interpretation: 'Loving emotional energy' },
        { name: 'Mental Layer', color: 'yellow', thickness: 'medium', clarity: 'clear', interpretation: 'Clear mental activity' }
      ],
      dominantColor: 'blue',
      colorInterpretation: 'Blue aura indicates calm and peaceful energy',
      overallHealth: 'good',
      recommendations: ['Maintain energy practices', 'Protect your aura']
    };
  }

  private getFallbackReikiAnalysis(): ReikiAnalysis {
    return {
      energyLevel: 'medium',
      blockages: [],
      recommendedSymbols: ['Cho Ku Rei'],
      treatmentAreas: ['General energy field'],
      interpretation: 'Energy flow is relatively clear',
      recommendations: ['Regular Reiki sessions', 'Practice self-Reiki daily']
    };
  }

  private getFallbackCrystalRecommendation(): CrystalRecommendation {
    return {
      crystals: [
        { name: 'Clear Quartz', priority: 'high', reason: 'Master healer', chakraAssociation: ['All Chakras'], usage: ['Meditate with', 'Place on chakras'] },
        { name: 'Amethyst', priority: 'high', reason: 'Protection and spiritual growth', chakraAssociation: ['Crown'], usage: ['Place under pillow', 'Wear as jewelry'] }
      ],
      primaryCrystal: 'Clear Quartz',
      crystalGrid: ['Clear Quartz - Crown', 'Amethyst - Third Eye'],
      interpretation: 'Clear Quartz and Amethyst are recommended for your energy healing journey',
      recommendations: ['Cleanse crystals regularly', 'Charge crystals under full moon']
    };
  }

  private getFallbackEnergyBalance(): EnergyBalanceAnalysis {
    return {
      overallBalance: 65,
      chakraBalance: 65,
      auraHealth: 65,
      energyFlow: 'good',
      blockages: [],
      recommendations: ['Maintain regular meditation', 'Practice grounding techniques'],
      techniques: ['Grounding Meditation', 'Chakra Balancing Visualization']
    };
  }

  private generateOverallInsights(
    chakra?: ChakraAnalysis,
    aura?: AuraReading,
    reiki?: ReikiAnalysis,
    crystal?: CrystalRecommendation,
    energy?: EnergyBalanceAnalysis
  ): string[] {
    const insights: string[] = [];
    
    if (chakra) {
      insights.push(`Chakra balance: ${chakra.overallBalance}%`);
      if (chakra.primaryIssues.length > 0) {
        insights.push(`Focus areas: ${chakra.primaryIssues.join(', ')}`);
      }
    }
    
    if (aura) {
      insights.push(`Aura health: ${aura.overallHealth}`);
      insights.push(`Dominant aura color: ${aura.dominantColor}`);
    }
    
    if (reiki) {
      insights.push(`Reiki energy level: ${reiki.energyLevel}`);
      if (reiki.blockages.length > 0) {
        insights.push(`Energy blockages detected: ${reiki.blockages.length}`);
      }
    }
    
    if (energy) {
      insights.push(`Overall energy balance: ${energy.overallBalance}%`);
      insights.push(`Energy flow: ${energy.energyFlow}`);
    }

    return insights;
  }

  private generateRecommendations(
    chakra?: ChakraAnalysis,
    aura?: AuraReading,
    reiki?: ReikiAnalysis,
    crystal?: CrystalRecommendation,
    energy?: EnergyBalanceAnalysis
  ): string[] {
    const recommendations: string[] = [];
    
    if (chakra?.recommendations) {
      recommendations.push(...chakra.recommendations);
    }
    
    if (aura?.recommendations) {
      recommendations.push(...aura.recommendations);
    }
    
    if (reiki?.recommendations) {
      recommendations.push(...reiki.recommendations);
    }
    
    if (crystal?.recommendations) {
      recommendations.push(...crystal.recommendations);
    }
    
    if (energy?.recommendations) {
      recommendations.push(...energy.recommendations);
    }

    // Remove duplicates
    return [...new Set(recommendations)];
  }
}

export const energyHealingIntelligence = new EnergyHealingIntelligence();
