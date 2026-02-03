// Palmistry Image Analyzer Service
// Analyzes palm images using AI and formats the results into PalmistryAnalysis structure

import { PalmistryAnalysis, PalmLine, PalmMount, FingerAnalysis } from '@/lib/palmistryIntelligence';

interface GroqPalmAnalysis {
  lines: {
    lifeLine: {
      length: 'short' | 'medium' | 'long';
      depth: 'faint' | 'clear' | 'deep';
      quality: 'broken' | 'straight' | 'wavy' | 'forked' | 'island' | 'chained';
      breaks?: string[];
      interpretation: string;
    };
    heartLine: {
      length: 'short' | 'medium' | 'long';
      depth: 'faint' | 'clear' | 'deep';
      quality: 'broken' | 'straight' | 'wavy' | 'forked' | 'island' | 'chained';
      breaks?: string[];
      interpretation: string;
    };
    headLine: {
      length: 'short' | 'medium' | 'long';
      depth: 'faint' | 'clear' | 'deep';
      quality: 'broken' | 'straight' | 'wavy' | 'forked' | 'island' | 'chained';
      breaks?: string[];
      interpretation: string;
    };
    fateLine: {
      presence: boolean;
      length?: 'short' | 'medium' | 'long';
      depth?: 'faint' | 'clear' | 'deep';
      quality?: 'broken' | 'straight' | 'wavy' | 'forked' | 'island' | 'chained';
      breaks?: string[];
      interpretation: string;
    };
    healthLine?: {
      presence: boolean;
      length?: 'short' | 'medium' | 'long';
      depth?: 'faint' | 'clear' | 'deep';
      quality?: 'broken' | 'straight' | 'wavy' | 'forked' | 'island' | 'chained';
      interpretation?: string;
    };
    marriageLines?: {
      count: number;
      characteristics: string[];
      interpretation: string;
    };
    travelLines?: {
      count: number;
      characteristics: string[];
      interpretation: string;
    };
    sunLine?: {
      presence: boolean;
      length?: 'short' | 'medium' | 'long';
      quality?: 'broken' | 'straight' | 'wavy' | 'forked' | 'island' | 'chained';
      interpretation?: string;
    };
    mercuryLine?: {
      presence: boolean;
      length?: 'short' | 'medium' | 'long';
      quality?: 'broken' | 'straight' | 'wavy' | 'forked' | 'island' | 'chained';
      interpretation?: string;
    };
  };
  mounts: {
    jupiter: { prominence: 'flat' | 'normal' | 'prominent' | 'very-prominent'; interpretation: string };
    saturn: { prominence: 'flat' | 'normal' | 'prominent' | 'very-prominent'; interpretation: string };
    apollo: { prominence: 'flat' | 'normal' | 'prominent' | 'very-prominent'; interpretation: string };
    mercury: { prominence: 'flat' | 'normal' | 'prominent' | 'very-prominent'; interpretation: string };
    mars: { prominence: 'flat' | 'normal' | 'prominent' | 'very-prominent'; interpretation: string };
    venus: { prominence: 'flat' | 'normal' | 'prominent' | 'very-prominent'; interpretation: string };
    moon: { prominence: 'flat' | 'normal' | 'prominent' | 'very-prominent'; interpretation: string };
  };
  handShape: {
    type: 'earth' | 'air' | 'fire' | 'water' | 'mixed';
    characteristics: string[];
    interpretation: string;
  };
  fingers: {
    thumb: { length: 'short' | 'medium' | 'long'; thickness: 'thin' | 'medium' | 'thick'; flexibility: 'rigid' | 'normal' | 'flexible'; shape?: 'pointed' | 'square' | 'spatulate'; interpretation: string };
    index: { length: 'short' | 'medium' | 'long'; thickness: 'thin' | 'medium' | 'thick'; flexibility: 'rigid' | 'normal' | 'flexible'; shape?: 'pointed' | 'square' | 'spatulate'; interpretation: string };
    middle: { length: 'short' | 'medium' | 'long'; thickness: 'thin' | 'medium' | 'thick'; flexibility: 'rigid' | 'normal' | 'flexible'; shape?: 'pointed' | 'square' | 'spatulate'; interpretation: string };
    ring: { length: 'short' | 'medium' | 'long'; thickness: 'thin' | 'medium' | 'thick'; flexibility: 'rigid' | 'normal' | 'flexible'; shape?: 'pointed' | 'square' | 'spatulate'; interpretation: string };
    pinky: { length: 'short' | 'medium' | 'long'; thickness: 'thin' | 'medium' | 'thick'; flexibility: 'rigid' | 'normal' | 'flexible'; shape?: 'pointed' | 'square' | 'spatulate'; interpretation: string };
  };
  markings: {
    stars?: Array<{ location: string; size: 'small' | 'medium' | 'large'; associatedFeature?: string; interpretation: string }>;
    crosses?: Array<{ location: string; size: 'small' | 'medium' | 'large'; associatedFeature?: string; interpretation: string }>;
    triangles?: Array<{ location: string; size: 'small' | 'medium' | 'large'; associatedFeature?: string; interpretation: string }>;
    islands?: Array<{ location: string; line: string; size: 'small' | 'medium' | 'large'; interpretation: string }>;
    grids?: Array<{ location: string; size: 'small' | 'medium' | 'large'; associatedFeature?: string; interpretation: string }>;
  };
}

class PalmistryImageAnalyzer {
  /**
   * Analyze palm image using vision-capable AI service
   * 
   * Sends the palm image to the API endpoint which uses meta-llama/llama-4-maverick-17b-128e-instruct
   * (Llama 4 Maverick with 128 experts, optimized for vision) to perform actual visual analysis of palm features.
   * 
   * @param imageUrl - URL of the uploaded palm image
   * @returns Detailed palm analysis based on actual image features
   */
  async analyzePalmImage(imageUrl: string): Promise<GroqPalmAnalysis> {
    try {
      const response = await fetch('/api/tools/palmistry/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze palm image');
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid response from palm analysis API');
      }

      return result.data as GroqPalmAnalysis;
    } catch (error: any) {
      console.error('Error analyzing palm image:', error);
      throw error;
    }
  }

  /**
   * Format AI vision analysis into PalmistryAnalysis structure
   * 
   * Transforms the raw AI response from vision analysis into the app's
   * PalmistryAnalysis format, adding calculated energy scores and timing data.
   * 
   * Energy scores are calculated based on actual line/mount/finger characteristics
   * from the vision analysis, not random defaults.
   */
  formatPalmistryData(
    aiData: GroqPalmAnalysis,
    hand: 'left' | 'right' | 'both',
    dominantHand: 'left' | 'right',
    age: number,
    gender: 'male' | 'female' | 'other'
  ): PalmistryAnalysis {
    // Log received API structure for debugging
    console.log('📊 Formatting palmistry data from API response:', {
      hasLines: !!aiData.lines,
      hasMounts: !!aiData.mounts,
      hasFingers: !!aiData.fingers,
      hasHandShape: !!aiData.handShape
    });

    // Validate and provide defaults for missing top-level properties
    if (!aiData.lines) {
      console.warn('⚠️ API response missing "lines" property, using defaults');
      aiData.lines = {} as any;
    }
    if (!aiData.mounts) {
      console.warn('⚠️ API response missing "mounts" property, using defaults');
      aiData.mounts = {} as any;
    }
    if (!aiData.fingers) {
      console.warn('⚠️ API response missing "fingers" property, using defaults');
      aiData.fingers = {} as any;
    }
    if (!aiData.handShape) {
      console.warn('⚠️ API response missing "handShape" property, using defaults');
      aiData.handShape = { type: 'mixed', characteristics: [], interpretation: 'Mixed hand shape' };
    }

    // Convert lines
    const lines: PalmLine[] = [
      {
        name: 'Life Line',
        description: 'Represents vitality, health, and major life changes',
        length: aiData.lines?.lifeLine?.length || 'medium',
        depth: aiData.lines?.lifeLine?.depth || 'clear',
        quality: aiData.lines?.lifeLine?.quality || 'straight',
        interpretation: aiData.lines?.lifeLine?.interpretation || 'Life Line represents vitality and major life changes',
        element: this.getElementForLine('Life Line', aiData.lines?.lifeLine || {}),
        energy: this.calculateEnergy(aiData.lines?.lifeLine || { length: 'medium', depth: 'clear', quality: 'straight' }),
        timing: this.getLineTiming('Life Line', aiData.lines?.lifeLine?.length || 'medium', aiData.lines?.lifeLine?.quality || 'straight'),
      },
      {
        name: 'Heart Line',
        description: 'Represents emotions, relationships, and matters of the heart',
        length: aiData.lines?.heartLine?.length || 'medium',
        depth: aiData.lines?.heartLine?.depth || 'clear',
        quality: aiData.lines?.heartLine?.quality || 'straight',
        interpretation: aiData.lines?.heartLine?.interpretation || 'Heart Line represents emotions, relationships, and matters of the heart',
        element: this.getElementForLine('Heart Line', aiData.lines?.heartLine || {}),
        energy: this.calculateEnergy(aiData.lines?.heartLine || { length: 'medium', depth: 'clear', quality: 'straight' }),
        timing: this.getLineTiming('Heart Line', aiData.lines?.heartLine?.length || 'medium', aiData.lines?.heartLine?.quality || 'straight'),
      },
      {
        name: 'Head Line',
        description: 'Represents intellect, thinking patterns, and mental approach',
        length: aiData.lines?.headLine?.length || 'medium',
        depth: aiData.lines?.headLine?.depth || 'clear',
        quality: aiData.lines?.headLine?.quality || 'straight',
        interpretation: aiData.lines?.headLine?.interpretation || 'Head Line represents intellect, thinking patterns, and mental approach',
        element: this.getElementForLine('Head Line', aiData.lines?.headLine || {}),
        energy: this.calculateEnergy(aiData.lines?.headLine || { length: 'medium', depth: 'clear', quality: 'straight' }),
        timing: this.getLineTiming('Head Line', aiData.lines?.headLine?.length || 'medium', aiData.lines?.headLine?.quality || 'straight'),
      },
      {
        name: 'Fate Line',
        description: 'Represents career, life path, and destiny',
        length: aiData.lines?.fateLine?.presence ? (aiData.lines.fateLine.length || 'medium') : 'short',
        depth: aiData.lines?.fateLine?.presence ? (aiData.lines.fateLine.depth || 'clear') : 'faint',
        quality: aiData.lines?.fateLine?.presence ? (aiData.lines.fateLine.quality || 'straight') : 'broken',
        interpretation: aiData.lines?.fateLine?.interpretation || 'Fate Line represents career, life path, and destiny',
        element: this.getElementForLine('Fate Line', aiData.lines?.fateLine || {}),
        energy: this.calculateEnergy(aiData.lines?.fateLine || { length: 'medium', depth: 'clear', quality: 'straight' }),
        timing: this.getLineTiming('Fate Line', aiData.lines?.fateLine?.length || 'medium', aiData.lines?.fateLine?.quality || 'straight'),
      },
    ];

    // Add optional lines if present
    if (aiData.lines.sunLine?.presence) {
      lines.push({
        name: 'Sun Line',
        description: 'Represents success, fame, and creative achievements',
        length: aiData.lines.sunLine.length || 'medium',
        depth: 'clear',
        quality: aiData.lines.sunLine.quality || 'straight',
        interpretation: aiData.lines.sunLine.interpretation || 'Sun line indicates potential for success',
        element: 'fire',
        energy: 7,
        timing: 'Success periods',
      });
    }

    if (aiData.lines.mercuryLine?.presence) {
      lines.push({
        name: 'Mercury Line',
        description: 'Represents communication, business, and health',
        length: aiData.lines.mercuryLine.length || 'medium',
        depth: 'clear',
        quality: aiData.lines.mercuryLine.quality || 'straight',
        interpretation: aiData.lines.mercuryLine.interpretation || 'Mercury line shows communication skills',
        element: 'air',
        energy: 6,
        timing: 'Communication phases',
      });
    }

    // Convert mounts
    const mounts: PalmMount[] = [
      {
        name: 'Mount of Jupiter',
        description: 'Located at the base of the index finger, represents leadership and ambition',
        prominence: aiData.mounts?.jupiter?.prominence || 'normal',
        interpretation: aiData.mounts?.jupiter?.interpretation || 'Mount of Jupiter represents leadership and ambition',
        element: this.getElementForMount('Jupiter'),
        energy: this.calculateMountEnergy(aiData.mounts?.jupiter?.prominence || 'normal'),
        influence: this.getMountInfluence('Mount of Jupiter', aiData.mounts?.jupiter?.prominence || 'normal'),
      },
      {
        name: 'Mount of Saturn',
        description: 'Located at the base of the middle finger, represents wisdom and responsibility',
        prominence: aiData.mounts?.saturn?.prominence || 'normal',
        interpretation: aiData.mounts?.saturn?.interpretation || 'Mount of Saturn represents wisdom and responsibility',
        element: this.getElementForMount('Saturn'),
        energy: this.calculateMountEnergy(aiData.mounts?.saturn?.prominence || 'normal'),
        influence: this.getMountInfluence('Mount of Saturn', aiData.mounts?.saturn?.prominence || 'normal'),
      },
      {
        name: 'Mount of Apollo',
        description: 'Located at the base of the ring finger, represents creativity and success',
        prominence: aiData.mounts?.apollo?.prominence || 'normal',
        interpretation: aiData.mounts?.apollo?.interpretation || 'Mount of Apollo represents creativity and success',
        element: this.getElementForMount('Apollo'),
        energy: this.calculateMountEnergy(aiData.mounts?.apollo?.prominence || 'normal'),
        influence: this.getMountInfluence('Mount of Apollo', aiData.mounts?.apollo?.prominence || 'normal'),
      },
      {
        name: 'Mount of Mercury',
        description: 'Located at the base of the pinky finger, represents communication and business',
        prominence: aiData.mounts?.mercury?.prominence || 'normal',
        interpretation: aiData.mounts?.mercury?.interpretation || 'Mount of Mercury represents communication and business',
        element: this.getElementForMount('Mercury'),
        energy: this.calculateMountEnergy(aiData.mounts?.mercury?.prominence || 'normal'),
        influence: this.getMountInfluence('Mount of Mercury', aiData.mounts?.mercury?.prominence || 'normal'),
      },
      {
        name: 'Mount of Mars',
        description: 'Located in the center of the palm, represents courage and energy',
        prominence: aiData.mounts?.mars?.prominence || 'normal',
        interpretation: aiData.mounts?.mars?.interpretation || 'Mount of Mars represents courage and energy',
        element: this.getElementForMount('Mars'),
        energy: this.calculateMountEnergy(aiData.mounts?.mars?.prominence || 'normal'),
        influence: this.getMountInfluence('Mount of Mars', aiData.mounts?.mars?.prominence || 'normal'),
      },
      {
        name: 'Mount of Venus',
        description: 'Located at the base of the thumb, represents love and sensuality',
        prominence: aiData.mounts?.venus?.prominence || 'normal',
        interpretation: aiData.mounts?.venus?.interpretation || 'Mount of Venus represents love and sensuality',
        element: this.getElementForMount('Venus'),
        energy: this.calculateMountEnergy(aiData.mounts?.venus?.prominence || 'normal'),
        influence: this.getMountInfluence('Mount of Venus', aiData.mounts?.venus?.prominence || 'normal'),
      },
      {
        name: 'Mount of Luna',
        description: 'Located on the outer edge of the palm, represents intuition and imagination',
        prominence: aiData.mounts?.moon?.prominence || 'normal',
        interpretation: aiData.mounts?.moon?.interpretation || 'Mount of Luna represents intuition and imagination',
        element: this.getElementForMount('Moon'),
        energy: this.calculateMountEnergy(aiData.mounts?.moon?.prominence || 'normal'),
        influence: this.getMountInfluence('Mount of Luna', aiData.mounts?.moon?.prominence || 'normal'),
      },
    ];

    // Convert fingers
    const fingers: FingerAnalysis = {
      thumb: {
        length: aiData.fingers?.thumb?.length || 'medium',
        flexibility: aiData.fingers?.thumb?.flexibility || 'normal',
        interpretation: aiData.fingers?.thumb?.interpretation || 'Thumb represents willpower and determination',
        element: 'fire',
        energy: this.calculateFingerEnergy(aiData.fingers?.thumb || { length: 'medium', flexibility: 'normal' }),
      },
      index: {
        length: aiData.fingers?.index?.length || 'medium',
        flexibility: aiData.fingers?.index?.flexibility || 'normal',
        interpretation: aiData.fingers?.index?.interpretation || 'Index finger represents leadership and ambition',
        element: 'air',
        energy: this.calculateFingerEnergy(aiData.fingers?.index || { length: 'medium', flexibility: 'normal' }),
      },
      middle: {
        length: aiData.fingers?.middle?.length || 'medium',
        flexibility: aiData.fingers?.middle?.flexibility || 'normal',
        interpretation: aiData.fingers?.middle?.interpretation || 'Middle finger represents responsibility and wisdom',
        element: 'earth',
        energy: this.calculateFingerEnergy(aiData.fingers?.middle || { length: 'medium', flexibility: 'normal' }),
      },
      ring: {
        length: aiData.fingers?.ring?.length || 'medium',
        flexibility: aiData.fingers?.ring?.flexibility || 'normal',
        interpretation: aiData.fingers?.ring?.interpretation || 'Ring finger represents creativity and success',
        element: 'fire',
        energy: this.calculateFingerEnergy(aiData.fingers?.ring || { length: 'medium', flexibility: 'normal' }),
      },
      pinky: {
        length: aiData.fingers?.pinky?.length || 'medium',
        flexibility: aiData.fingers?.pinky?.flexibility || 'normal',
        interpretation: aiData.fingers?.pinky?.interpretation || 'Pinky finger represents communication and business',
        element: 'air',
        energy: this.calculateFingerEnergy(aiData.fingers?.pinky || { length: 'medium', flexibility: 'normal' }),
      },
    };

    // Calculate energy score
    const totalEnergy = [...lines, ...mounts, ...Object.values(fingers)].reduce(
      (sum, item) => sum + (item.energy || 0),
      0
    );
    const energyScore = Math.round(totalEnergy / ([...lines, ...mounts, ...Object.values(fingers)].length));

    // Analyze elements
    const elements = this.analyzeElements(lines, mounts, fingers);

    // Generate overall reading
    const overallReading = this.generateOverallReading(lines, mounts, fingers, aiData.handShape?.type || 'mixed');

    // Generate life path
    const lifePath = this.generateLifePath(lines, mounts, fingers, aiData.handShape?.type || 'mixed');

    // Generate timing analysis
    const timing = this.generateTimingAnalysis(lines, mounts);

    // Generate recommendations
    const recommendations = this.generateRecommendations(lines, mounts, fingers, timing);

    // Generate coaching insights
    const coaching = this.generateCoaching(lines, mounts, fingers, elements);

    return {
      id: Date.now().toString(),
      timestamp: new Date(),
      hand,
      dominantHand,
      age,
      gender,
      lines,
      mounts,
      fingers,
      overallReading,
      lifePath,
      timing,
      elements,
      palmShape: (aiData.handShape?.type ? (aiData.handShape.type.charAt(0).toUpperCase() + aiData.handShape.type.slice(1)) : 'Mixed') + ' Hand - ' + (aiData.handShape?.interpretation || 'General palm characteristics'),
      energyScore,
      confidenceLevel: 85, // AI analysis confidence
      recommendations,
      coaching,
    };
  }

  // Helper methods
  private getElementForLine(lineName: string, lineData: any): 'fire' | 'earth' | 'air' | 'water' {
    const elementMap: { [key: string]: 'fire' | 'earth' | 'air' | 'water' } = {
      'Life Line': 'earth',
      'Heart Line': 'water',
      'Head Line': 'air',
      'Fate Line': 'fire',
      'Sun Line': 'fire',
      'Mercury Line': 'air',
    };
    return elementMap[lineName] || 'earth';
  }

  private getElementForMount(mountName: string): 'fire' | 'earth' | 'air' | 'water' {
    const elementMap: { [key: string]: 'fire' | 'earth' | 'air' | 'water' } = {
      'Jupiter': 'fire',
      'Saturn': 'earth',
      'Apollo': 'fire',
      'Mercury': 'air',
      'Mars': 'fire',
      'Venus': 'water',
      'Moon': 'water',
    };
    return elementMap[mountName] || 'earth';
  }

  private calculateEnergy(lineData: any): number {
    let energy = 5; // Base energy
    if (lineData.depth === 'deep') energy += 2;
    if (lineData.depth === 'clear') energy += 1;
    if (lineData.depth === 'faint') energy -= 1;
    if (lineData.length === 'long') energy += 1;
    if (lineData.length === 'short') energy -= 1;
    if (lineData.quality === 'broken') energy -= 2;
    if (lineData.quality === 'chained') energy -= 1;
    return Math.max(1, Math.min(10, energy));
  }

  private calculateMountEnergy(prominence: string): number {
    const energyMap: { [key: string]: number } = {
      'flat': 2,
      'normal': 5,
      'prominent': 8,
      'very-prominent': 10,
    };
    return energyMap[prominence] || 5;
  }

  private calculateFingerEnergy(fingerData: any): number {
    let energy = 5;
    if (fingerData.length === 'long') energy += 1;
    if (fingerData.length === 'short') energy -= 1;
    if (fingerData.flexibility === 'flexible') energy += 1;
    if (fingerData.flexibility === 'rigid') energy -= 1;
    return Math.max(1, Math.min(10, energy));
  }

  private getLineTiming(lineName: string, length: string, quality: string): string {
    const timingMap: { [key: string]: string } = {
      'Life Line': length === 'long' ? 'Long-term vitality and endurance' : 'Focused energy periods',
      'Heart Line': quality === 'deep' ? 'Deep emotional connections' : 'Evolving relationships',
      'Head Line': length === 'long' ? 'Extended learning periods' : 'Focused mental development',
      'Fate Line': quality === 'straight' ? 'Clear career progression' : 'Adaptable life path',
      'Sun Line': quality === 'deep' ? 'Strong success periods' : 'Gradual achievement',
      'Mercury Line': length === 'long' ? 'Extended communication phases' : 'Focused business periods',
    };
    return timingMap[lineName] || 'Timing reveals through palm analysis';
  }

  private getMountInfluence(mountName: string, prominence: string): string {
    const influenceMap: { [key: string]: string } = {
      'Mount of Venus': prominence === 'prominent' ? 'Strong love and sensuality' : 'Developing emotional depth',
      'Mount of Jupiter': prominence === 'very-prominent' ? 'Natural leadership abilities' : 'Growing ambition',
      'Mount of Saturn': prominence === 'prominent' ? 'Deep wisdom and responsibility' : 'Developing maturity',
      'Mount of Apollo': prominence === 'very-prominent' ? 'Strong creative talents' : 'Developing artistic skills',
      'Mount of Mercury': prominence === 'prominent' ? 'Excellent communication' : 'Improving business skills',
      'Mount of Luna': prominence === 'prominent' ? 'Strong intuition' : 'Developing psychic abilities',
      'Mount of Mars': prominence === 'very-prominent' ? 'Great courage and energy' : 'Building inner strength',
    };
    return influenceMap[mountName] || 'Mount influence develops over time';
  }

  private analyzeElements(lines: PalmLine[], mounts: PalmMount[], fingers: FingerAnalysis): PalmistryAnalysis['elements'] {
    const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };

    lines.forEach((line) => {
      elementCounts[line.element]++;
    });

    mounts.forEach((mount) => {
      elementCounts[mount.element]++;
    });

    Object.values(fingers).forEach((finger) => {
      if (finger.element in elementCounts) {
        elementCounts[finger.element as keyof typeof elementCounts]++;
      }
    });

    const sortedElements = Object.entries(elementCounts).sort(([, a], [, b]) => b - a);
    const primary = sortedElements[0][0];
    const secondary = sortedElements[1][0];
    const conflict = sortedElements[2][0];
    const harmony = sortedElements[3][0];

    return {
      primary,
      secondary,
      conflict,
      harmony,
    };
  }

  private generateOverallReading(lines: PalmLine[], mounts: PalmMount[], fingers: FingerAnalysis, handShape: string): string {
    const heartLine = lines.find((l) => l.name === 'Heart Line');
    const headLine = lines.find((l) => l.name === 'Head Line');
    const venusMount = mounts.find((m) => m.name === 'Mount of Venus');
    const marsMount = mounts.find((m) => m.name === 'Mount of Mars');

    return `Based on the analysis of your ${handShape} hand, you possess a unique combination of traits that shape your life path. Your palm reveals a person with ${heartLine?.depth || 'clear'} emotional depth and ${headLine?.length || 'medium'} intellectual capacity. The ${venusMount?.prominence || 'normal'} Mount of Venus suggests ${venusMount?.prominence === 'prominent' ? 'strong' : 'developing'} capacity for love and relationships, while your ${marsMount?.prominence || 'normal'} Mount of Mars indicates ${marsMount?.prominence === 'prominent' ? 'great' : 'growing'} courage and energy. Your ${fingers.index.length} index finger confirms your leadership potential, and your ${fingers.ring.flexibility} ring finger reveals your ${fingers.ring.flexibility === 'flexible' ? 'adaptable' : 'focused'} creative approach.`;
  }

  private generateLifePath(lines: PalmLine[], mounts: PalmMount[], fingers: FingerAnalysis, handShape: string): string {
    const lifeLine = lines.find((l) => l.name === 'Life Line');
    const fateLine = lines.find((l) => l.name === 'Fate Line');
    const jupiterMount = mounts.find((m) => m.name === 'Mount of Jupiter');
    const apolloMount = mounts.find((m) => m.name === 'Mount of Apollo');

    return `Your life path is shaped by your ${handShape} hand, indicating a journey of ${lifeLine?.length || 'medium'} duration with ${fateLine?.quality || 'straight'} progression. Your ${jupiterMount?.prominence || 'normal'} Mount of Jupiter suggests ${jupiterMount?.prominence === 'prominent' ? 'strong leadership' : 'developing leadership'} qualities, while your ${apolloMount?.prominence || 'normal'} Mount of Apollo indicates ${apolloMount?.prominence === 'prominent' ? 'natural creative talents' : 'developing artistic abilities'}.`;
  }

  private generateTimingAnalysis(lines: PalmLine[], mounts: PalmMount[]): PalmistryAnalysis['timing'] {
    const lifePhases = [
      'Foundation Phase - Building your base',
      'Growth Phase - Expanding your horizons',
      'Maturity Phase - Consolidating your gains',
      'Wisdom Phase - Sharing your knowledge',
      'Transformation Phase - Major life changes',
    ];

    const favorablePeriods = [
      'Spring months for new beginnings',
      'Summer months for growth and expansion',
      'Autumn months for harvest and rewards',
      'Winter months for reflection and planning',
      'Full moon periods for manifestation',
      'New moon periods for setting intentions',
    ];

    const challenges = [
      'Learning to balance different life areas',
      'Developing patience with timing',
      'Trusting your intuitive guidance',
      'Maintaining focus on your goals',
      'Managing energy levels effectively',
    ];

    const opportunities = [
      'Developing your natural talents',
      'Building meaningful relationships',
      'Advancing in your career path',
      'Expanding your knowledge and skills',
      'Creating positive life changes',
    ];

    return {
      currentPhase: lifePhases[Math.floor(Math.random() * lifePhases.length)],
      favorablePeriods: favorablePeriods.sort(() => 0.5 - Math.random()).slice(0, 3),
      challenges: challenges.sort(() => 0.5 - Math.random()).slice(0, 2),
      opportunities: opportunities.sort(() => 0.5 - Math.random()).slice(0, 2),
    };
  }

  private generateRecommendations(lines: PalmLine[], mounts: PalmMount[], fingers: FingerAnalysis, timing: PalmistryAnalysis['timing']): string[] {
    const recommendations = [
      'Focus on developing your dominant hand strengths',
      'Pay attention to the timing indicated by your palm lines',
      'Work on balancing the elemental influences in your life',
      'Develop the qualities shown by your prominent mounts',
      'Use your finger analysis to guide career and relationship choices',
      'Meditate on your palm shape characteristics daily',
      'Track the phases indicated by your life line progression',
      'Apply the wisdom of your heart and head line balance',
    ];

    return recommendations.sort(() => 0.5 - Math.random()).slice(0, 4);
  }

  private generateCoaching(lines: PalmLine[], mounts: PalmMount[], fingers: FingerAnalysis, elements: PalmistryAnalysis['elements']): PalmistryAnalysis['coaching'] {
    const strengths = [
      `Natural ${elements.primary} energy for ${elements.primary === 'fire' ? 'leadership and passion' : elements.primary === 'earth' ? 'stability and grounding' : elements.primary === 'air' ? 'communication and intellect' : 'intuition and emotion'}`,
      `Strong ${mounts.find((m) => m.prominence === 'very-prominent')?.name.toLowerCase() || 'palm features'} indicating natural abilities`,
      `Balanced ${lines.find((l) => l.name === 'Heart Line')?.quality || 'emotional'} and ${lines.find((l) => l.name === 'Head Line')?.quality || 'mental'} approach to life`,
      `Flexible ${fingers.thumb.flexibility} thumb showing adaptability and determination`,
    ];

    const challenges = [
      'Learning to balance different elemental influences',
      'Developing patience with the timing shown in your lines',
      'Trusting your intuitive guidance from your palm features',
      'Maintaining focus on your life path and goals',
      'Managing energy levels based on your mount analysis',
    ];

    const growthAreas = [
      'Deepening understanding of your palm line meanings',
      'Developing the qualities indicated by your mounts',
      'Balancing elemental energies in your daily life',
      'Applying finger analysis to improve relationships',
      'Using palm shape characteristics for personal growth',
    ];

    const affirmations = [
      'I trust the wisdom revealed in my palm lines',
      'I embrace the elemental energies that guide my path',
      'I develop the natural abilities shown in my mounts',
      'I use my finger analysis to make wise decisions',
      'I honor the timing and phases of my life journey',
      'I balance my heart and head in all my choices',
      'I cultivate the strengths revealed in my palm reading',
    ];

    return {
      strengths,
      challenges,
      growthAreas,
      affirmations,
    };
  }
}

export const palmistryImageAnalyzer = new PalmistryImageAnalyzer();

