// Traditional Medical Astrological Formulas
// Based on Ptolemy, Robert Zoller's DMA, and Rosicrucian traditions

export interface AstrologicalFormula {
  name: string;
  tradition: 'Ptolemy' | 'Zoller' | 'Rosicrucian' | 'Traditional';
  description: string;
  criteria: {
    planets?: string[];
    signs?: string[];
    houses?: number[];
    aspects?: string[];
  };
  medicalImplications: string;
  remedies: string[];
}

// Ptolemy's Traditional Medical Astrology Formulas
export const ptolemyFormulas: AstrologicalFormula[] = [
  {
    name: "Mars in 6th House",
    tradition: "Ptolemy",
    description: "Indicates potential for inflammatory conditions, fevers, and acute illnesses",
    criteria: {
      planets: ["Mars"],
      houses: [6]
    },
    medicalImplications: "Acute inflammatory conditions, fevers, infections, surgical procedures",
    remedies: ["Homeopathic: Belladonna, Arnica", "Herbal: Anti-inflammatory herbs", "Timing: Avoid surgical procedures during Mars transits"]
  },
  {
    name: "Saturn in 6th House",
    tradition: "Ptolemy",
    description: "Chronic health conditions, delays in healing, obstruction",
    criteria: {
      planets: ["Saturn"],
      houses: [6]
    },
    medicalImplications: "Chronic illnesses, slow healing, bone/joint disorders, depression",
    remedies: ["Homeopathic: Sepia, Natrum Mur", "Herbal: Strengthening tonics", "Timing: Long-term treatment required"]
  },
  {
    name: "Sun in 6th House Square Saturn",
    tradition: "Ptolemy",
    description: "Conflict between life force and chronic restrictions",
    criteria: {
      planets: ["Sun", "Saturn"],
      houses: [6],
      aspects: ["square"]
    },
    medicalImplications: "Heart disease, chronic fatigue, autoimmune conditions",
    remedies: ["Homeopathic: Natrum Mur", "Herbal: Cardio tonic herbs", "Acupuncture: Heart-Spleen formula"]
  },
  {
    name: "Moon in 6th House",
    tradition: "Ptolemy",
    description: "Fluctuating health, digestive issues, water retention",
    criteria: {
      planets: ["Moon"],
      houses: [6]
    },
    medicalImplications: "Digestive disorders, fluctuating conditions, hormonal imbalances",
    remedies: ["Homeopathic: Pulsatilla, Sepia", "Herbal: Digestive herbs", "Timing: Follow lunar cycles"]
  }
];

// Robert Zoller's DMA (Diploma in Medical Astrology) Techniques
export const zollerFormulas: AstrologicalFormula[] = [
  {
    name: "Critical Degree Affliction",
    tradition: "Zoller",
    description: "Planets or angles at 0°, 15°, or 29° indicating crisis potential",
    criteria: {
      aspects: ["critical_degree"]
    },
    medicalImplications: "Potential for sudden onset illness or crisis, requires immediate attention",
    remedies: ["Homeopathic: Emergency remedies", "Herbal: Crisis interventions", "Timing: Monitor carefully"]
  },
  {
    name: "Hyleg Afflictions",
    tradition: "Zoller",
    description: "The life-giver (Sun, Moon, Ascendant, 10th house cusp) is afflicted",
    criteria: {
      planets: ["Sun", "Moon"]
    },
    medicalImplications: "Core vitality compromised, major health concerns",
    remedies: ["Strengthening constitution", "Hyleg-specific remedies", "Life-force support"]
  },
  {
    name: "8th House Afflictions",
    tradition: "Zoller",
    description: "Death house indicates critical health issues or crisis points",
    criteria: {
      houses: [8]
    },
    medicalImplications: "Critical health crisis, surgical interventions may be needed, transformation",
    remedies: ["Homeopathic: Aconite for crisis", "Herbal: Crisis management", "Acupuncture: Emergency points"]
  },
  {
    name: "12th House Afflictions",
    tradition: "Zoller",
    description: "Confinement house - hospitalization, isolation, hidden conditions",
    criteria: {
      houses: [12]
    },
    medicalImplications: "Chronic hidden conditions, immune system weakness, confinement",
    remedies: ["Homeopathic: Sepia, Thuja", "Herbal: Immune support", "Timing: Recovery periods"]
  },
  {
    name: "Decumbiture Chart",
    tradition: "Zoller",
    description: "Chart for onset of illness - timing critical recovery periods",
    criteria: {
      aspects: ["timing"]
    },
    medicalImplications: "Onset timing analysis for recovery planning",
    remedies: ["Time-specific remedies", "Optimal recovery windows", "Treatment timing"]
  }
];

// Rosicrucian Medical Correlations
export const rosicrucianFormulas: AstrologicalFormula[] = [
  {
    name: "Aries - Head and Brain",
    tradition: "Rosicrucian",
    description: "Headaches, neurological disorders, brain-related conditions",
    criteria: {
      signs: ["Aries"]
    },
    medicalImplications: "Head injuries, migraines, neurological disorders, mental health",
    remedies: ["Homeopathic: Belladonna, Aconite", "Herbal: Head-clearing herbs", "Acupuncture: Head points"]
  },
  {
    name: "Leo - Heart and Spine",
    tradition: "Rosicrucian",
    description: "Cardiovascular health, back problems, circulation",
    criteria: {
      signs: ["Leo"]
    },
    medicalImplications: "Heart conditions, back pain, circulation issues",
    remedies: ["Homeopathic: Aconite, Crataegus", "Herbal: Cardio herbs", "Acupuncture: Heart meridian"]
  },
  {
    name: "Virgo - Digestive System",
    tradition: "Rosicrucian",
    description: "Intestinal disorders, nervous system, dietary issues",
    criteria: {
      signs: ["Virgo"]
    },
    medicalImplications: "Digestive disorders, nutritional deficiencies, nervous system",
    remedies: ["Homeopathic: Nux vomica, Pulsatilla", "Herbal: Digestive herbs", "Acupuncture: Spleen meridian"]
  },
  {
    name: "Scorpio - Reproductive System",
    tradition: "Rosicrucian",
    description: "Reproductive health, urinary system, elimination",
    criteria: {
      signs: ["Scorpio"]
    },
    medicalImplications: "Reproductive disorders, urinary issues, elimination problems",
    remedies: ["Homeopathic: Sepia, Thuja", "Herbal: Reproductive herbs", "Acupuncture: Kidney-Bladder"]
  },
  {
    name: "Saturn - Chronic Conditions",
    tradition: "Rosicrucian",
    description: "Saturn rules bones, skin, teeth, chronic ailments",
    criteria: {
      planets: ["Saturn"]
    },
    medicalImplications: "Chronic pain, arthritis, skin disorders, dental issues",
    remedies: ["Homeopathic: Sulfur, Sepia", "Herbal: Strengthening tonics", "Acupuncture: Kidney support"]
  },
  {
    name: "Mars - Inflammation",
    tradition: "Rosicrucian",
    description: "Mars rules blood, fever, inflammation, acute conditions",
    criteria: {
      planets: ["Mars"]
    },
    medicalImplications: "Inflammation, fever, blood disorders, acute pain",
    remedies: ["Homeopathic: Arnica, Belladonna", "Herbal: Anti-inflammatory", "Acupuncture: Cooling points"]
  }
];

// Medical Crisis Indicators (Robert Zoller)
export const crisisFormulas: AstrologicalFormula[] = [
  {
    name: "Uranus in 6th House",
    tradition: "Zoller",
    description: "Sudden health crises, unexpected illnesses",
    criteria: {
      planets: ["Uranus"],
      houses: [6]
    },
    medicalImplications: "Sudden onset conditions, neurological crises, unexpected health events",
    remedies: ["Homeopathic: Aconite for shock", "Herbal: Crisis herbs", "Immediate medical attention"]
  },
  {
    name: "Pluto in 8th House",
    tradition: "Zoller",
    description: "Transformation through crisis, profound health changes",
    criteria: {
      planets: ["Pluto"],
      houses: [8]
    },
    medicalImplications: "Life-threatening conditions, major transformations, deep healing",
    remedies: ["Homeopathic: Deep-acting remedies", "Herbal: Transformative herbs", "Intensive treatment"]
  },
  {
    name: "Neptune in 12th House",
    tradition: "Zoller",
    description: "Mysterious conditions, immune system issues, hidden causes",
    criteria: {
      planets: ["Neptune"],
      houses: [12]
    },
    medicalImplications: "Autoimmune disorders, unclear diagnoses, addiction-related health issues",
    remedies: ["Homeopathic: Constitutional remedies", "Herbal: Immune support", "Spiritual healing"]
  }
];

// All formulas combined
export const allMedicalFormulas: AstrologicalFormula[] = [
  ...ptolemyFormulas,
  ...zollerFormulas,
  ...rosicrucianFormulas,
  ...crisisFormulas
];

// Formula search function
export function searchFormulas(criteria: {
  planet?: string;
  sign?: string;
  house?: number;
  tradition?: 'Ptolemy' | 'Zoller' | 'Rosicrucian' | 'All';
}): AstrologicalFormula[] {
  let results = allMedicalFormulas;

  if (criteria.tradition && criteria.tradition !== 'All') {
    results = results.filter(f => f.tradition === criteria.tradition);
  }

  if (criteria.planet) {
    const planet = criteria.planet;
    results = results.filter(f => 
      f.criteria.planets?.includes(planet) ||
      f.description.toLowerCase().includes(planet.toLowerCase())
    );
  }

  if (criteria.sign) {
    const sign = criteria.sign;
    results = results.filter(f => 
      f.criteria.signs?.includes(sign) ||
      f.description.toLowerCase().includes(sign.toLowerCase())
    );
  }

  if (criteria.house != null) {
    const house = criteria.house;
    results = results.filter(f => 
      f.criteria.houses?.includes(house) ||
      f.description.includes(house.toString())
    );
  }

  return results;
}

// Get formula recommendations based on chart
export function getFormulaRecommendations(chartData: {
  planets?: { [key: string]: { sign: string; house: number } };
  houses?: number[];
  aspects?: string[];
}) {
  const recommendations: AstrologicalFormula[] = [];

  // Check planetary positions
  if (chartData.planets) {
    Object.entries(chartData.planets).forEach(([planet, position]) => {
      if (position.house === 6) {
        recommendations.push(...searchFormulas({ planet, house: 6 }));
      }
      if (position.house === 8) {
        recommendations.push(...searchFormulas({ planet, house: 8 }));
      }
      if (position.house === 12) {
        recommendations.push(...searchFormulas({ planet, house: 12 }));
      }
    });
  }

  return recommendations;
}

