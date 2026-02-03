// Ancient Medical Astrology Wisdom
// Traditional quotes and principles from historical sources

export interface WisdomQuote {
  condition: string;
  source: string;
  quote: string;
  remedy: string;
  tradition: 'Greek' | 'Arabic' | 'European' | 'Traditional' | 'Alchemical';
}

export const ancientWisdom: WisdomQuote[] = [
  {
    condition: "Saturn in 6th house",
    source: "Galen (2nd Century CE)",
    quote: "Saturn brings chronic cold conditions, affecting bones and teeth. The melancholic humor dominates, creating dryness and contraction in the body.",
    remedy: "Warm, dry herbs of Mars or Sun nature. Garlic, ginger, cinnamon. Avoid cold and damp foods.",
    tradition: "Greek"
  },
  {
    condition: "Mars in 8th house",
    source: "Ptolemy, Tetrabiblos",
    quote: "Mars in the eighth house indicates sudden acute diseases, bleeding, and inflammation. His hot and dry nature creates fevers and crisis.",
    remedy: "Cooling herbs of Venus or Moon nature. Elderflower, plantain, chamomile. Avoid stimulants and heat.",
    tradition: "Greek"
  },
  {
    condition: "Jupiter afflicted",
    source: "Culpeper (1653)",
    quote: "Jupiter rules the blood and liver. When afflicted, blood conditions arise - excess humors, sluggish circulation, or congested liver.",
    remedy: "Dandelion root, milk thistle, burdock - all herbs of Jupiter's nature to support liver and blood.",
    tradition: "European"
  },
  {
    condition: "Moon in debilitated sign",
    source: "Ibn Sina (Avicenna)",
    quote: "The Moon governs all fluids of the body - digestion, menstruation, lactation. When weak, digestive juices and lymphatic function suffer.",
    remedy: "Moon-ruled herbs: Silver (lunaria), camphor, jasmine. Support digestive health with bitter tonics.",
    tradition: "Arabic"
  },
  {
    condition: "Venus in health houses",
    source: "Hippocrates",
    quote: "Venus governs the kidneys, veins, and reproductive organs. Her benefic influence brings harmony when well-placed, but indulgence when afflicted.",
    remedy: "Venusian herbs: Roses, marshmallow, yarrow. Support kidney function and maintain healthy boundaries.",
    tradition: "Greek"
  },
  {
    condition: "Mercury retrograde in 6th",
    source: "Paracelsus",
    quote: "Mercury when weakened affects all nervous function - communication between organs fails, digestion suffers, and mental clarity diminishes.",
    remedy: "Mercurial herbs: Dill, fennel, peppermint. Support nervous system with magnesium-rich foods.",
    tradition: "Alchemical"
  },
  {
    condition: "Sun in fall or detriment",
    source: "Al-Kindi",
    quote: "The Sun is the source of all vital heat and energy. When weakened, vitality declines, the heart struggles, and the constitution weakens.",
    remedy: "Solar herbs: St. John's Wort, angelica, calendula. Build vitality through prana-enhancing practices.",
    tradition: "Arabic"
  },
  {
    condition: "Multiple planets in cadent houses",
    source: "William Lilly",
    quote: "Planets in cadent houses lack strength. In health matters, this indicates chronic, lingering conditions that resist treatment easily.",
    remedy: "Build vitality through constitutional remedies. Long-term nurturing approaches, not quick fixes.",
    tradition: "Traditional"
  },
  {
    condition: "Uranus transit to 6th ruler",
    source: "Modern Medical Astrology",
    quote: "Uranus brings sudden disruptions to systems. Nervous disorders, unusual symptoms, or irregularities in health patterns emerge.",
    remedy: "Grounding herbs of earth elements. Adaptogens to support system stability during change.",
    tradition: "Modern"
  },
  {
    condition: "Neptune in 12th house",
    source: "Dane Rudhyar",
    quote: "Neptune dissolves boundaries - immune function may be compromised, hidden enemies to health emerge, or addictions challenge vitality.",
    remedy: "Protective herbs: Echinacea, ginseng. Clear lymphatic system. Support immune function with adaptogens.",
    tradition: "Modern"
  },
  {
    condition: "Pluto in health houses",
    source: "Modern Medical Astrology",
    quote: "Pluto rules transformation and elimination. When in health houses, deep systemic changes occur - regenerative processes or chronic degenerative patterns.",
    remedy: "Detoxification support. Deep-acting homeopathics or constitutional remedies. Support elimination organs.",
    tradition: "Modern"
  },
  {
    condition: "Ascendant ruler in 12th",
    source: "Traditional Medical Astrology",
    quote: "When the Ascendant ruler hides in the 12th house, vitality is compromised. Chronic health issues emerge, often with unclear etiology.",
    remedy: "Strengthen Ascendant ruler's nature. Support primary vitality. Correct imbalances in ruling sign's body parts.",
    tradition: "Traditional"
  }
];

export function findWisdomForChart(chart: any): WisdomQuote[] {
  const matchingWisdom: WisdomQuote[] = [];
  const healthHouses = [1, 6, 8, 12];
  
  // Check each planet in health-related positions
  Object.entries(chart.planets || {}).forEach(([planet, data]: [string, any]) => {
    // Check for afflictions
    const isInHealthHouse = healthHouses.includes(data.house);
    const isRetrograde = data.speed < 0;
    const isInDetriment = (planet === 'Sun' && data.sign === 'Aquarius') ||
                         (planet === 'Moon' && data.sign === 'Capricorn') ||
                         (planet === 'Mercury' && (data.sign === 'Sagittarius' || data.sign === 'Pisces'));
    
    // Find relevant wisdom
    ancientWisdom.forEach(wisdom => {
      const conditionMatches = 
        wisdom.condition.toLowerCase().includes(planet.toLowerCase()) ||
        wisdom.condition.toLowerCase().includes((data.house + 'th house') || 'house') ||
        (isInHealthHouse && wisdom.condition.toLowerCase().includes('health houses')) ||
        (isInDetriment && wisdom.condition.toLowerCase().includes('afflicted')) ||
        (isRetrograde && wisdom.condition.toLowerCase().includes('retrograde'));
      
      if (conditionMatches) {
        matchingWisdom.push(wisdom);
      }
    });
  });
  
  // Always return at least one wisdom
  if (matchingWisdom.length === 0) {
    matchingWisdom.push(ancientWisdom[Math.floor(Math.random() * ancientWisdom.length)]);
  }
  
  // Remove duplicates and return top 3
  const unique = Array.from(new Map(matchingWisdom.map(w => [w.condition, w])).values());
  return unique.slice(0, 3);
}
