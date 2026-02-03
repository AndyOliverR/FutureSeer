// YOGA REMEDY GENERATOR
// Generates personalized remedies for detected Vedic yogas

import { Yoga } from './enhancedYogaDetection';
import { getYogaRemedies, YogaRemedy } from './comprehensiveYogaDatabase';

export interface PersonalizedYogaRemedy {
  yogaName: string;
  yogaType: string;
  priority: 'high' | 'medium' | 'low';
  remedies: {
    mantras: YogaRemedyItem[];
    gemstones: YogaRemedyItem[];
    rituals: YogaRemedyItem[];
    lifestyle: YogaRemedyItem[];
    charity: YogaRemedyItem[];
  };
  timing: string;
  expectedBenefits: string[];
}

export interface YogaRemedyItem {
  name: string;
  description: string;
  instructions: string[];
  frequency: string;
  benefits: string[];
  difficulty?: 'easy' | 'moderate' | 'advanced';
  cost?: 'free' | 'low' | 'medium' | 'high';
}

// Generate personalized remedies for a yoga
export function generateYogaRemedies(yoga: Yoga): PersonalizedYogaRemedy {
  // Get remedies from comprehensive database
  const databaseRemedies = getYogaRemedies(yoga.name);
  
  // If yoga has remedies in database, use them
  if (databaseRemedies) {
    return {
      yogaName: yoga.name,
      yogaType: yoga.type,
      priority: getPriority(yoga),
      remedies: {
        mantras: databaseRemedies.mantras.map(m => ({
          name: m.name,
          description: m.description,
          instructions: m.instructions,
          frequency: m.frequency,
          benefits: m.benefits,
          difficulty: 'moderate' as const,
          cost: 'free' as const
        })),
        gemstones: databaseRemedies.gemstones.map(g => ({
          name: g.name,
          description: g.description,
          instructions: g.instructions,
          frequency: g.frequency,
          benefits: g.benefits,
          difficulty: 'easy' as const,
          cost: 'high' as const
        })),
        rituals: databaseRemedies.rituals.map(r => ({
          name: r.name,
          description: r.description,
          instructions: r.instructions,
          frequency: r.frequency,
          benefits: r.benefits,
          difficulty: 'moderate' as const,
          cost: 'low' as const
        })),
        lifestyle: databaseRemedies.lifestyle.map(l => ({
          name: l.name,
          description: l.description,
          instructions: l.instructions,
          frequency: l.frequency,
          benefits: l.benefits,
          difficulty: 'easy' as const,
          cost: 'free' as const
        })),
        charity: databaseRemedies.charity.map(c => ({
          name: c.name,
          description: c.description,
          instructions: c.instructions,
          frequency: c.frequency,
          benefits: c.benefits,
          difficulty: 'easy' as const,
          cost: 'low' as const
        }))
      },
      timing: databaseRemedies.timing,
      expectedBenefits: yoga.effects
    };
  }
  
  // Generate generic remedies based on planets involved
  return generateGenericRemedies(yoga);
}

// Generate remedies for all detected yogas
export function generateAllYogaRemedies(yogas: Yoga[]): PersonalizedYogaRemedy[] {
  return yogas.map(yoga => generateYogaRemedies(yoga));
}

// Generate generic remedies when specific ones aren't available
function generateGenericRemedies(yoga: Yoga): PersonalizedYogaRemedy {
  const remedies: PersonalizedYogaRemedy = {
    yogaName: yoga.name,
    yogaType: yoga.type,
    priority: getPriority(yoga),
    remedies: {
      mantras: [],
      gemstones: [],
      rituals: [],
      lifestyle: [],
      charity: []
    },
    timing: 'During relevant planetary periods',
    expectedBenefits: yoga.effects
  };
  
  // Generate planet-specific remedies
  if (yoga.planets && yoga.planets.length > 0) {
    yoga.planets.forEach(planet => {
      const planetRemedies = getPlanetRemedies(planet);
      remedies.remedies.mantras.push(...planetRemedies.mantras);
      remedies.remedies.gemstones.push(...planetRemedies.gemstones);
      remedies.remedies.rituals.push(...planetRemedies.rituals);
    });
  }
  
  // Add generic lifestyle remedies
  remedies.remedies.lifestyle.push({
    name: 'Positive Mindset',
    description: 'Maintain positive thoughts to enhance yoga effects',
    instructions: [
      'Practice daily affirmations',
      'Visualize success',
      'Maintain gratitude journal',
      'Avoid negative thoughts'
    ],
    frequency: 'Daily',
    benefits: ['Enhanced yoga manifestation', 'Mental clarity', 'Positive outcomes'],
    difficulty: 'easy',
    cost: 'free'
  });
  
  // Add generic charity
  remedies.remedies.charity.push({
    name: 'General Charity',
    description: 'Donate to enhance karmic merit',
    instructions: [
      'Donate to the needy',
      'Support charitable causes',
      'Help those in need',
      'Practice compassion'
    ],
    frequency: 'Weekly',
    benefits: ['Karmic purification', 'Yoga strengthening', 'Blessings'],
    difficulty: 'easy',
    cost: 'low'
  });
  
  return remedies;
}

// Get planet-specific remedies
function getPlanetRemedies(planet: string): {
  mantras: YogaRemedyItem[];
  gemstones: YogaRemedyItem[];
  rituals: YogaRemedyItem[];
} {
  const planetData: Record<string, any> = {
    Sun: {
      mantra: {
        name: 'Surya Mantra',
        description: 'Mantra to strengthen Sun',
        instructions: ['Chant "Om Suryaya Namaha" 108 times', 'Face east', 'Best at sunrise'],
        frequency: 'Daily, especially Sundays',
        benefits: ['Enhances vitality', 'Boosts confidence', 'Success in career']
      },
      gemstone: {
        name: 'Ruby (Manik)',
        description: 'Primary gemstone for Sun',
        instructions: ['Wear in gold ring', 'On ring finger', 'Minimum 3 carats', 'Consecrate on Sunday'],
        frequency: 'Wear continuously',
        benefits: ['Sun\'s blessings', 'Authority', 'Success']
      },
      ritual: {
        name: 'Surya Namaskar',
        description: 'Sun salutation practice',
        instructions: ['Practice 12 rounds daily', 'Face east at sunrise', 'Chant Surya mantras'],
        frequency: 'Daily at sunrise',
        benefits: ['Physical health', 'Sun\'s grace', 'Vitality']
      }
    },
    Moon: {
      mantra: {
        name: 'Chandra Mantra',
        description: 'Mantra to strengthen Moon',
        instructions: ['Chant "Om Chandraya Namaha" 108 times', 'Best on Mondays', 'Evening time'],
        frequency: 'Daily, especially Mondays',
        benefits: ['Emotional stability', 'Mental peace', 'Intuition']
      },
      gemstone: {
        name: 'Pearl (Moti)',
        description: 'Primary gemstone for Moon',
        instructions: ['Wear in silver ring', 'On little finger', 'Minimum 5 carats', 'Consecrate on Monday'],
        frequency: 'Wear continuously',
        benefits: ['Emotional balance', 'Mental clarity', 'Peace']
      },
      ritual: {
        name: 'Monday Fasting',
        description: 'Fast dedicated to Moon',
        instructions: ['Fast on Mondays', 'Eat white foods', 'Offer milk to Moon', 'Wear white'],
        frequency: 'Weekly on Mondays',
        benefits: ['Moon\'s blessings', 'Emotional healing', 'Mental clarity']
      }
    },
    Mars: {
      mantra: {
        name: 'Mangal Mantra',
        description: 'Mantra to strengthen Mars',
        instructions: ['Chant "Om Mangalaya Namaha" 108 times', 'Face south', 'Best on Tuesdays'],
        frequency: 'Daily, especially Tuesdays',
        benefits: ['Courage', 'Energy', 'Victory']
      },
      gemstone: {
        name: 'Red Coral (Moonga)',
        description: 'Primary gemstone for Mars',
        instructions: ['Wear in copper/gold ring', 'On ring finger', 'Minimum 5 carats', 'Consecrate on Tuesday'],
        frequency: 'Wear continuously',
        benefits: ['Courage', 'Protection', 'Energy']
      },
      ritual: {
        name: 'Hanuman Worship',
        description: 'Worship Lord Hanuman',
        instructions: ['Visit Hanuman temple on Tuesdays', 'Offer red flowers', 'Recite Hanuman Chalisa'],
        frequency: 'Weekly on Tuesdays',
        benefits: ['Mars blessings', 'Courage', 'Victory']
      }
    },
    Mercury: {
      mantra: {
        name: 'Budha Mantra',
        description: 'Mantra to strengthen Mercury',
        instructions: ['Chant "Om Budhaya Namaha" 108 times', 'Best on Wednesdays'],
        frequency: 'Daily, especially Wednesdays',
        benefits: ['Intelligence', 'Communication', 'Business success']
      },
      gemstone: {
        name: 'Emerald (Panna)',
        description: 'Primary gemstone for Mercury',
        instructions: ['Wear in gold ring', 'On little finger', 'Minimum 3 carats', 'Consecrate on Wednesday'],
        frequency: 'Wear continuously',
        benefits: ['Intelligence', 'Communication', 'Business acumen']
      },
      ritual: {
        name: 'Wednesday Fasting',
        description: 'Fast for Mercury',
        instructions: ['Fast on Wednesdays', 'Eat green foods', 'Donate green items'],
        frequency: 'Weekly on Wednesdays',
        benefits: ['Mercury blessings', 'Intelligence', 'Success']
      }
    },
    Jupiter: {
      mantra: {
        name: 'Guru Mantra',
        description: 'Mantra to strengthen Jupiter',
        instructions: ['Chant "Om Gurave Namaha" 108 times', 'Face northeast', 'Best on Thursdays'],
        frequency: 'Daily, especially Thursdays',
        benefits: ['Wisdom', 'Prosperity', 'Spiritual growth']
      },
      gemstone: {
        name: 'Yellow Sapphire (Pukhraj)',
        description: 'Primary gemstone for Jupiter',
        instructions: ['Wear in gold ring', 'On index finger', 'Minimum 3 carats', 'Consecrate on Thursday'],
        frequency: 'Wear continuously',
        benefits: ['Wisdom', 'Wealth', 'Jupiter\'s blessings']
      },
      ritual: {
        name: 'Thursday Worship',
        description: 'Worship dedicated to Jupiter',
        instructions: ['Fast on Thursdays', 'Wear yellow', 'Donate yellow items', 'Visit Jupiter temple'],
        frequency: 'Weekly on Thursdays',
        benefits: ['Jupiter blessings', 'Prosperity', 'Wisdom']
      }
    },
    Venus: {
      mantra: {
        name: 'Shukra Mantra',
        description: 'Mantra to strengthen Venus',
        instructions: ['Chant "Om Shukraya Namaha" 108 times', 'Best on Fridays'],
        frequency: 'Daily, especially Fridays',
        benefits: ['Luxury', 'Relationships', 'Artistic abilities']
      },
      gemstone: {
        name: 'Diamond or White Sapphire',
        description: 'Primary gemstone for Venus',
        instructions: ['Wear in platinum/silver', 'On middle finger', 'Consecrate on Friday'],
        frequency: 'Wear continuously',
        benefits: ['Luxury', 'Love', 'Artistic success']
      },
      ritual: {
        name: 'Lakshmi Puja',
        description: 'Friday worship of Goddess Lakshmi',
        instructions: ['Worship Lakshmi on Fridays', 'Offer white flowers', 'Light ghee lamp'],
        frequency: 'Weekly on Fridays',
        benefits: ['Venus blessings', 'Prosperity', 'Harmony']
      }
    },
    Saturn: {
      mantra: {
        name: 'Shani Mantra',
        description: 'Mantra to appease Saturn',
        instructions: ['Chant "Om Shanaye Namaha" 108 times', 'Best on Saturdays'],
        frequency: 'Daily, especially Saturdays',
        benefits: ['Discipline', 'Patience', 'Karmic relief']
      },
      gemstone: {
        name: 'Blue Sapphire (Neelam)',
        description: 'Powerful Saturn gemstone',
        instructions: ['Wear in silver ring', 'On middle finger', 'Test before wearing', 'Consecrate on Saturday'],
        frequency: 'Wear after testing',
        benefits: ['Saturn\'s grace', 'Discipline', 'Success']
      },
      ritual: {
        name: 'Shani Worship',
        description: 'Saturday worship of Saturn',
        instructions: ['Visit Shani temple on Saturdays', 'Offer black sesame', 'Light mustard oil lamp'],
        frequency: 'Weekly on Saturdays',
        benefits: ['Saturn blessings', 'Obstacle removal', 'Karmic balance']
      }
    },
    Rahu: {
      mantra: {
        name: 'Rahu Mantra',
        description: 'Mantra to appease Rahu',
        instructions: ['Chant "Om Rahave Namaha" 108 times', 'Best on Saturdays'],
        frequency: 'Daily',
        benefits: ['Material success', 'Foreign gains', 'Innovation']
      },
      gemstone: {
        name: 'Hessonite (Gomed)',
        description: 'Primary gemstone for Rahu',
        instructions: ['Wear in silver ring', 'On middle finger', 'Consecrate on Saturday'],
        frequency: 'Wear continuously',
        benefits: ['Rahu\'s blessings', 'Material success', 'Protection']
      },
      ritual: {
        name: 'Rahu Remedies',
        description: 'Appease Rahu',
        instructions: ['Donate to the poor', 'Feed crows', 'Respect elders'],
        frequency: 'Regular practice',
        benefits: ['Rahu\'s grace', 'Success', 'Protection']
      }
    },
    Ketu: {
      mantra: {
        name: 'Ketu Mantra',
        description: 'Mantra to appease Ketu',
        instructions: ['Chant "Om Ketave Namaha" 108 times'],
        frequency: 'Daily',
        benefits: ['Spiritual growth', 'Liberation', 'Wisdom']
      },
      gemstone: {
        name: 'Cat\'s Eye (Lehsunia)',
        description: 'Primary gemstone for Ketu',
        instructions: ['Wear in silver ring', 'On ring finger', 'Consecrate on Tuesday'],
        frequency: 'Wear continuously',
        benefits: ['Ketu\'s blessings', 'Spiritual growth', 'Protection']
      },
      ritual: {
        name: 'Ketu Remedies',
        description: 'Appease Ketu',
        instructions: ['Practice meditation', 'Donate to spiritual causes', 'Help animals'],
        frequency: 'Regular practice',
        benefits: ['Ketu\'s grace', 'Spiritual advancement', 'Liberation']
      }
    }
  };
  
  const data = planetData[planet];
  if (!data) {
    return { mantras: [], gemstones: [], rituals: [] };
  }
  
  return {
    mantras: [{ ...data.mantra, difficulty: 'moderate' as const, cost: 'free' as const }],
    gemstones: [{ ...data.gemstone, difficulty: 'easy' as const, cost: 'high' as const }],
    rituals: [{ ...data.ritual, difficulty: 'moderate' as const, cost: 'low' as const }]
  };
}

// Determine priority based on yoga type and strength
function getPriority(yoga: Yoga): 'high' | 'medium' | 'low' {
  if (yoga.type === 'Raj Yoga' && (yoga.strength === 'Very Strong' || yoga.strength === 'Strong')) {
    return 'high';
  }
  if (yoga.type === 'Dhana Yoga' && (yoga.strength === 'Very Strong' || yoga.strength === 'Strong')) {
    return 'high';
  }
  if (yoga.type === 'Arishta Yoga' || yoga.type === 'Kala Yoga') {
    return 'high'; // High priority to mitigate negative effects
  }
  if (yoga.strength === 'Moderate') {
    return 'medium';
  }
  return 'low';
}

// Export helper functions
export { getPlanetRemedies, getPriority };

