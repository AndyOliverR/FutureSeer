// Energy Healing Image Analyzer Service
// Formats Groq API responses into structured Energy Healing data

import { 
  CHAKRA_DATA, 
  AURA_LAYERS, 
  REIKI_SYMBOLS, 
  CRYSTAL_DATABASE 
} from './energyHealingData';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ChakraAnalysis {
  chakras: Array<{
    name: string;
    balance: number; // 0-100
    status: 'balanced' | 'overactive' | 'underactive' | 'blocked';
    color: string;
    interpretation: string;
    recommendations: string[];
  }>;
  overallBalance: number;
  primaryIssues: string[];
  recommendations: string[];
}

export interface AuraReading {
  layers: Array<{
    name: string;
    color: string;
    thickness: 'thin' | 'medium' | 'thick';
    clarity: 'clear' | 'cloudy' | 'vibrant';
    interpretation: string;
  }>;
  dominantColor: string;
  colorInterpretation: string;
  overallHealth: 'excellent' | 'good' | 'fair' | 'needs_attention';
  recommendations: string[];
}

export interface ReikiAnalysis {
  energyLevel: 'high' | 'medium' | 'low';
  blockages: string[];
  recommendedSymbols: string[];
  treatmentAreas: string[];
  interpretation: string;
  recommendations: string[];
}

export interface CrystalRecommendation {
  crystals: Array<{
    name: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
    chakraAssociation: string[];
    usage: string[];
  }>;
  primaryCrystal: string;
  crystalGrid: string[];
  interpretation: string;
}

export interface EnergyBalanceAnalysis {
  overallBalance: number;
  chakraBalance: number;
  auraHealth: number;
  energyFlow: 'excellent' | 'good' | 'needs_attention' | 'blocked';
  blockages: string[];
  recommendations: string[];
  techniques: string[];
}

// Groq API Response Interfaces
interface GroqChakraResponse {
  chakras?: {
    root?: { balance?: number; status?: string; interpretation?: string };
    sacral?: { balance?: number; status?: string; interpretation?: string };
    solarPlexus?: { balance?: number; status?: string; interpretation?: string };
    heart?: { balance?: number; status?: string; interpretation?: string };
    throat?: { balance?: number; status?: string; interpretation?: string };
    thirdEye?: { balance?: number; status?: string; interpretation?: string };
    crown?: { balance?: number; status?: string; interpretation?: string };
  };
  overallBalance?: number;
  recommendations?: string[];
}

interface GroqAuraResponse {
  layers?: Array<{
    name?: string;
    color?: string;
    thickness?: string;
    clarity?: string;
    interpretation?: string;
  }> | {
    [key: string]: {
      name?: string;
      color?: string;
      thickness?: string;
      clarity?: string;
      interpretation?: string;
    };
  };
  dominantColor?: string;
  interpretation?: string;
  recommendations?: string[] | string;
}

interface GroqReikiResponse {
  energyLevel?: string;
  blockages?: string[];
  recommendedSymbols?: string[];
  interpretation?: string;
  recommendations?: string[];
}

interface GroqCrystalResponse {
  crystals?: Array<{
    name?: string;
    priority?: string;
    reason?: string;
  }>;
  interpretation?: string;
  recommendations?: string[];
}

interface GroqEnergyBalanceResponse {
  overallBalance?: number;
  chakraBalance?: number;
  auraHealth?: number;
  energyFlow?: string;
  blockages?: string[];
  recommendations?: string[];
}

class EnergyHealingImageAnalyzer {
  /**
   * Format chakra analysis from Groq API response
   */
  formatChakraAnalysis(aiData: GroqChakraResponse): ChakraAnalysis {
    console.log('📊 Formatting chakra analysis from API response:', {
      hasChakras: !!aiData.chakras,
      overallBalance: aiData.overallBalance
    });

    if (!aiData.chakras) {
      aiData.chakras = {};
    }

    const chakraKeys = ['root', 'sacral', 'solarPlexus', 'heart', 'throat', 'thirdEye', 'crown'];
    const chakras = chakraKeys.map((key) => {
      const chakraData = CHAKRA_DATA[key as keyof typeof CHAKRA_DATA];
      const aiChakra = aiData.chakras![key as keyof typeof aiData.chakras];
      
      const balance = aiChakra?.balance ?? Math.floor(Math.random() * 40) + 30; // Default 30-70
      const status = (aiChakra?.status as any) || this.getChakraStatus(balance);
      
      return {
        name: chakraData.name,
        balance: Math.max(0, Math.min(100, balance)),
        status,
        color: chakraData.color,
        interpretation: aiChakra?.interpretation || `The ${chakraData.name} (${chakraData.sanskritName}) influences ${chakraData.governingAreas.join(', ')}.`,
        recommendations: this.getChakraRecommendations(key, status)
      };
    });

    const overallBalance = aiData.overallBalance ?? 
      Math.round(chakras.reduce((sum, c) => sum + c.balance, 0) / chakras.length);

    const primaryIssues = chakras
      .filter(c => c.status !== 'balanced')
      .map(c => c.name);

    return {
      chakras,
      overallBalance,
      primaryIssues,
      recommendations: aiData.recommendations || this.getGeneralChakraRecommendations(chakras)
    };
  }

  /**
   * Format aura reading from Groq API response
   */
  formatAuraReading(aiData: GroqAuraResponse): AuraReading {
    console.log('📊 Formatting aura reading from API response:', {
      hasLayers: !!aiData.layers,
      layersType: typeof aiData.layers,
      isArray: Array.isArray(aiData.layers),
      dominantColor: aiData.dominantColor,
      rawLayers: aiData.layers
    });

    // Ensure layers is always an array
    let layersArray: any[] = [];
    if (Array.isArray(aiData.layers)) {
      layersArray = aiData.layers;
    } else if (aiData.layers && typeof aiData.layers === 'object') {
      // Convert object to array if needed
      layersArray = Object.values(aiData.layers);
      console.log('⚠️ Converted layers object to array:', layersArray);
    } else {
      // Use fallback from AURA_LAYERS
      layersArray = AURA_LAYERS.slice(0, 4).map((layer, index) => ({
        name: layer.name,
        color: this.getDefaultAuraColor(index),
        thickness: 'medium',
        clarity: 'clear'
      }));
      console.log('⚠️ Using fallback layers array');
    }

    // Ensure we have at least 4 layers
    if (layersArray.length < 4) {
      const fallbackLayers = AURA_LAYERS.slice(0, 4);
      while (layersArray.length < 4) {
        const index = layersArray.length;
        layersArray.push({
          name: fallbackLayers[index].name,
          color: this.getDefaultAuraColor(index),
          thickness: 'medium',
          clarity: 'clear'
        });
      }
    }

    const layers = layersArray.map((layer, index) => {
      const layerData = AURA_LAYERS[index] || AURA_LAYERS[0];
      const color = (layer.color || this.getDefaultAuraColor(index)).toLowerCase();
      const thickness = (layer.thickness as any) || 'medium';
      const clarity = (layer.clarity as any) || 'clear';

      // Get interpretation from API or use layer data
      let interpretation = layer.interpretation;
      if (!interpretation) {
        // Try to get color meaning from layer data
        const colorMeaning = layerData.colorMeanings[color];
        if (colorMeaning) {
          interpretation = `${layerData.name} shows ${color} color indicating ${colorMeaning}`;
        } else {
          interpretation = `${layerData.name} shows ${color} color indicating balanced energy`;
        }
      }

      return {
        name: layer.name || layerData.name,
        color,
        thickness,
        clarity,
        interpretation
      };
    });

    const dominantColor = (aiData.dominantColor || layers[0]?.color || 'blue').toLowerCase();
    const colorInterpretation = aiData.interpretation || 
      AURA_LAYERS[0].colorMeanings[dominantColor] || 
      `${dominantColor} aura indicates balanced spiritual energy`;

    const overallHealth = this.calculateAuraHealth(layers);

    // Ensure recommendations is an array
    let recommendations: string[] = [];
    if (Array.isArray(aiData.recommendations)) {
      recommendations = aiData.recommendations;
    } else if (aiData.recommendations) {
      recommendations = [String(aiData.recommendations)];
    } else {
      recommendations = this.getAuraRecommendations(layers, overallHealth);
    }

    return {
      layers,
      dominantColor,
      colorInterpretation,
      overallHealth,
      recommendations
    };
  }

  /**
   * Format Reiki analysis from Groq API response
   */
  formatReikiAnalysis(aiData: GroqReikiResponse): ReikiAnalysis {
    console.log('📊 Formatting Reiki analysis from API response:', {
      energyLevel: aiData.energyLevel,
      hasBlockages: !!aiData.blockages
    });

    const energyLevel = (aiData.energyLevel as any) || 'medium';
    const blockages = aiData.blockages || [];
    const recommendedSymbols = aiData.recommendedSymbols || 
      this.getRecommendedReikiSymbols(energyLevel, blockages);

    return {
      energyLevel,
      blockages,
      recommendedSymbols,
      treatmentAreas: this.getTreatmentAreas(blockages),
      interpretation: aiData.interpretation || 
        `Your energy level is ${energyLevel}. ${blockages.length > 0 ? 'Blockages detected in: ' + blockages.join(', ') : 'Energy flow is relatively clear.'}`,
      recommendations: aiData.recommendations || this.getReikiRecommendations(energyLevel, blockages)
    };
  }

  /**
   * Format crystal recommendations from Groq API response
   */
  formatCrystalAnalysis(aiData: GroqCrystalResponse): CrystalRecommendation {
    console.log('📊 Formatting crystal analysis from API response:', {
      hasCrystals: !!aiData.crystals
    });

    const crystals = (aiData.crystals || []).map((crystal) => {
      const crystalData = CRYSTAL_DATABASE[crystal.name || 'Clear Quartz'] || CRYSTAL_DATABASE['Clear Quartz'];
      
      return {
        name: crystal.name || 'Clear Quartz',
        priority: (crystal.priority as any) || 'medium',
        reason: crystal.reason || `Supports ${crystalData.properties.join(', ')}`,
        chakraAssociation: crystalData.chakraAssociation,
        usage: crystalData.howToUse
      };
    });

    // If no crystals provided, recommend common ones
    if (crystals.length === 0) {
      crystals.push(
        {
          name: 'Clear Quartz',
          priority: 'high',
          reason: 'Master healer, amplifies all energy',
          chakraAssociation: CRYSTAL_DATABASE['Clear Quartz'].chakraAssociation,
          usage: CRYSTAL_DATABASE['Clear Quartz'].howToUse
        },
        {
          name: 'Amethyst',
          priority: 'high',
          reason: 'Protection and spiritual growth',
          chakraAssociation: CRYSTAL_DATABASE['Amethyst'].chakraAssociation,
          usage: CRYSTAL_DATABASE['Amethyst'].howToUse
        }
      );
    }

    const primaryCrystal = crystals.find(c => c.priority === 'high')?.name || crystals[0]?.name || 'Clear Quartz';
    const crystalGrid = this.suggestCrystalGrid(crystals);

    return {
      crystals,
      primaryCrystal,
      crystalGrid,
      interpretation: aiData.interpretation || 
        `Recommended crystals for your energy healing journey. ${primaryCrystal} is particularly beneficial for your current needs.`,
      recommendations: aiData.recommendations || this.getCrystalRecommendations(crystals)
    };
  }

  /**
   * Format energy balance analysis from Groq API response
   */
  formatEnergyBalance(aiData: GroqEnergyBalanceResponse): EnergyBalanceAnalysis {
    console.log('📊 Formatting energy balance from API response:', {
      overallBalance: aiData.overallBalance,
      energyFlow: aiData.energyFlow
    });

    const overallBalance = aiData.overallBalance ?? 50;
    const chakraBalance = aiData.chakraBalance ?? overallBalance;
    const auraHealth = aiData.auraHealth ?? overallBalance;
    const energyFlow = (aiData.energyFlow as any) || this.getEnergyFlowStatus(overallBalance);
    const blockages = aiData.blockages || [];

    return {
      overallBalance: Math.max(0, Math.min(100, overallBalance)),
      chakraBalance: Math.max(0, Math.min(100, chakraBalance)),
      auraHealth: Math.max(0, Math.min(100, auraHealth)),
      energyFlow,
      blockages,
      recommendations: aiData.recommendations || this.getEnergyBalanceRecommendations(energyFlow, blockages),
      techniques: this.getRecommendedTechniques(energyFlow, blockages)
    };
  }

  // Helper methods
  private getChakraStatus(balance: number): 'balanced' | 'overactive' | 'underactive' | 'blocked' {
    if (balance >= 70) return 'balanced';
    if (balance >= 50) return 'underactive';
    if (balance >= 30) return 'blocked';
    return 'overactive';
  }

  private getChakraRecommendations(chakraKey: string, status: string): string[] {
    const chakraData = CHAKRA_DATA[chakraKey as keyof typeof CHAKRA_DATA];
    const recommendations: string[] = [];

    if (status === 'blocked' || status === 'underactive') {
      recommendations.push(`Practice ${chakraData.affirmations[0]}`);
      recommendations.push(`Use ${chakraData.associatedCrystals[0]} crystal`);
      recommendations.push(`Chant ${chakraData.mantras[0]} mantra`);
    }

    return recommendations;
  }

  private getGeneralChakraRecommendations(chakras: any[]): string[] {
    const unbalanced = chakras.filter(c => c.status !== 'balanced');
    if (unbalanced.length === 0) {
      return ['Maintain your balanced chakras through regular meditation', 'Continue practicing affirmations'];
    }
    return [
      `Focus on balancing ${unbalanced.map(c => c.name).join(', ')}`,
      'Practice daily chakra meditation',
      'Use appropriate crystals for each chakra',
      'Include chakra-balancing foods in your diet'
    ];
  }

  private getDefaultAuraColor(index: number): string {
    const colors = ['blue', 'green', 'purple', 'white'];
    return colors[index % colors.length];
  }

  private calculateAuraHealth(layers: any[]): 'excellent' | 'good' | 'fair' | 'needs_attention' {
    const vibrantCount = layers.filter(l => l.clarity === 'vibrant').length;
    const cloudyCount = layers.filter(l => l.clarity === 'cloudy').length;

    if (vibrantCount >= 3) return 'excellent';
    if (cloudyCount === 0) return 'good';
    if (cloudyCount <= 2) return 'fair';
    return 'needs_attention';
  }

  private getAuraRecommendations(layers: any[], health: string): string[] {
    if (health === 'excellent') {
      return ['Maintain your vibrant aura through continued spiritual practices', 'Protect your energy field'];
    }
    return [
      'Practice energy clearing techniques',
      'Use protection crystals like Black Tourmaline',
      'Spend time in nature to recharge',
      'Practice meditation to strengthen your aura'
    ];
  }

  private getRecommendedReikiSymbols(energyLevel: string, blockages: string[]): string[] {
    const symbols: string[] = ['Cho Ku Rei']; // Always include power symbol
    if (blockages.length > 0) {
      symbols.push('Sei He Ki'); // Mental/emotional symbol
    }
    if (energyLevel === 'low') {
      symbols.push('Dai Ko Myo'); // Master symbol for deep healing
    }
    return symbols;
  }

  private getTreatmentAreas(blockages: string[]): string[] {
    const areas: string[] = [];
    blockages.forEach(blockage => {
      if (blockage.toLowerCase().includes('throat')) areas.push('Throat');
      if (blockage.toLowerCase().includes('heart')) areas.push('Heart');
      if (blockage.toLowerCase().includes('head')) areas.push('Crown');
      if (blockage.toLowerCase().includes('root')) areas.push('Root');
    });
    return areas.length > 0 ? areas : ['General energy field'];
  }

  private getReikiRecommendations(energyLevel: string, blockages: string[]): string[] {
    const recommendations: string[] = [
      'Regular Reiki sessions to maintain energy flow',
      'Practice self-Reiki daily'
    ];
    if (blockages.length > 0) {
      recommendations.push('Focus on clearing blockages with specific symbols');
    }
    if (energyLevel === 'low') {
      recommendations.push('Consider distance Reiki healing');
    }
    return recommendations;
  }

  private suggestCrystalGrid(crystals: any[]): string[] {
    const grid: string[] = [];
    const chakras = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'];
    crystals.slice(0, 7).forEach((crystal, index) => {
      grid.push(`${crystal.name} - ${chakras[index] || 'General'}`);
    });
    return grid;
  }

  private getCrystalRecommendations(crystals: any[]): string[] {
    return [
      'Cleanse crystals regularly with sage or moonlight',
      'Charge crystals under full moon',
      'Carry crystals with you or wear as jewelry',
      'Meditate with crystals daily',
      'Create crystal grids for enhanced energy'
    ];
  }

  private getEnergyFlowStatus(balance: number): 'excellent' | 'good' | 'needs_attention' | 'blocked' {
    if (balance >= 70) return 'excellent';
    if (balance >= 50) return 'good';
    if (balance >= 30) return 'needs_attention';
    return 'blocked';
  }

  private getEnergyBalanceRecommendations(flow: string, blockages: string[]): string[] {
    const recommendations: string[] = [];
    if (flow === 'blocked' || flow === 'needs_attention') {
      recommendations.push('Practice daily energy clearing');
      recommendations.push('Use grounding techniques');
      if (blockages.length > 0) {
        recommendations.push(`Focus on clearing blockages in: ${blockages.join(', ')}`);
      }
    }
    recommendations.push('Maintain regular meditation practice');
    recommendations.push('Balance chakras through visualization');
    return recommendations;
  }

  private getRecommendedTechniques(flow: string, blockages: string[]): string[] {
    const techniques: string[] = ['Grounding Meditation'];
    if (blockages.length > 0) {
      techniques.push('Chakra Balancing Visualization');
    }
    if (flow === 'blocked') {
      techniques.push('Breath Work');
      techniques.push('Crystal Grid Balancing');
    }
    return techniques;
  }
}

export const energyHealingImageAnalyzer = new EnergyHealingImageAnalyzer();
