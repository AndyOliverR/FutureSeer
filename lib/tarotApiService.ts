// Tarot API Service - Integration with external Tarot API and local card images
// Based on https://github.com/krates98/tarotcardapi

export interface TarotCard {
  id: string;
  name: string;
  suit: string;
  number?: number;
  meaning: string;
  reversed_meaning: string;
  description: string;
  image: string;
  element?: string;
  planet?: string;
  zodiac?: string;
}

export interface TarotReading {
  id: string;
  timestamp: string;
  question: string;
  spreadType: string;
  cards: TarotCard[];
  interpretation: string;
  guidance: string;
  timing: string;
}

export interface TarotSpread {
  name: string;
  positions: string[];
  description: string;
}

// Local card database with our images
const LOCAL_TAROT_CARDS: TarotCard[] = [
  // Major Arcana
  {
    id: "major_00",
    name: "The Fool",
    suit: "Major Arcana",
    number: 0,
    meaning: "New beginnings, innocence, spontaneity",
    reversed_meaning: "Recklessness, lack of direction, poor judgment",
    description: "The Fool represents new beginnings, innocence, and the start of a journey. It encourages taking a leap of faith.",
    image: "/tarot/major_00_the_fool.png.png",
    element: "Air",
    planet: "Uranus",
    zodiac: "Aquarius"
  },
  {
    id: "major_01",
    name: "The Magician",
    suit: "Major Arcana",
    number: 1,
    meaning: "Manifestation, willpower, skill",
    reversed_meaning: "Manipulation, poor planning, untapped talents",
    description: "The Magician represents the power to manifest your desires through willpower and skill.",
    image: "/tarot/major_01_the_magician.png.png",
    element: "Air",
    planet: "Mercury",
    zodiac: "Gemini"
  },
  {
    id: "major_02",
    name: "The High Priestess",
    suit: "Major Arcana",
    number: 2,
    meaning: "Intuition, mystery, subconscious",
    reversed_meaning: "Secrets, disconnect from intuition, hidden agendas",
    description: "The High Priestess represents intuition, mystery, and the power of the subconscious mind.",
    image: "/tarot/major_02_the_high_priestess.png.png",
    element: "Water",
    planet: "Moon",
    zodiac: "Cancer"
  },
  {
    id: "major_03",
    name: "The Empress",
    suit: "Major Arcana",
    number: 3,
    meaning: "Fertility, abundance, nurturing",
    reversed_meaning: "Dependency, smothering, creative blocks",
    description: "The Empress represents fertility, abundance, and the nurturing aspects of life.",
    image: "/tarot/major_03_the_empress.png.png",
    element: "Earth",
    planet: "Venus",
    zodiac: "Taurus"
  },
  {
    id: "major_04",
    name: "The Emperor",
    suit: "Major Arcana",
    number: 4,
    meaning: "Authority, structure, leadership",
    reversed_meaning: "Tyranny, rigidity, poor leadership",
    description: "The Emperor represents authority, structure, and strong leadership qualities.",
    image: "/tarot/major_04_the_emperor.png.png",
    element: "Fire",
    planet: "Aries",
    zodiac: "Aries"
  },
  {
    id: "major_05",
    name: "The Hierophant",
    suit: "Major Arcana",
    number: 5,
    meaning: "Tradition, spirituality, teaching",
    reversed_meaning: "Rebellion, unconventional beliefs, poor guidance",
    description: "The Hierophant represents tradition, spirituality, and the role of teacher or guide.",
    image: "/tarot/major_05_the_hierophant.png.png",
    element: "Earth",
    planet: "Venus",
    zodiac: "Taurus"
  },
  {
    id: "major_06",
    name: "The Lovers",
    suit: "Major Arcana",
    number: 6,
    meaning: "Love, relationships, choices",
    reversed_meaning: "Imbalance, poor choices, disharmony",
    description: "The Lovers represent love, relationships, and important life choices.",
    image: "/tarot/major_06_the_lovers.png.png",
    element: "Air",
    planet: "Mercury",
    zodiac: "Gemini"
  },
  {
    id: "major_07",
    name: "The Chariot",
    suit: "Major Arcana",
    number: 7,
    meaning: "Determination, control, victory",
    reversed_meaning: "Lack of control, aggression, defeat",
    description: "The Chariot represents determination, control, and the drive to achieve victory.",
    image: "/tarot/major_07_the_chariot.png.png",
    element: "Water",
    planet: "Moon",
    zodiac: "Cancer"
  },
  {
    id: "major_08",
    name: "Strength",
    suit: "Major Arcana",
    number: 8,
    meaning: "Inner strength, courage, patience",
    reversed_meaning: "Weakness, self-doubt, lack of courage",
    description: "Strength represents inner strength, courage, and the power of patience.",
    image: "/tarot/major_08_strength.png.png",
    element: "Fire",
    planet: "Sun",
    zodiac: "Leo"
  },
  {
    id: "major_09",
    name: "The Hermit",
    suit: "Major Arcana",
    number: 9,
    meaning: "Soul-searching, introspection, guidance",
    reversed_meaning: "Isolation, loneliness, poor guidance",
    description: "The Hermit represents soul-searching, introspection, and seeking inner guidance.",
    image: "/tarot/major_09_the_hermit.png.png",
    element: "Earth",
    planet: "Mercury",
    zodiac: "Virgo"
  },
  {
    id: "major_10",
    name: "Wheel of Fortune",
    suit: "Major Arcana",
    number: 10,
    meaning: "Change, cycles, destiny",
    reversed_meaning: "Bad luck, resistance to change, lack of control",
    description: "The Wheel of Fortune represents change, cycles, and the turning of destiny.",
    image: "/tarot/major_10_wheel_of_fortune.png.png",
    element: "Fire",
    planet: "Jupiter",
    zodiac: "Sagittarius"
  },
  {
    id: "major_11",
    name: "Justice",
    suit: "Major Arcana",
    number: 11,
    meaning: "Fairness, truth, balance",
    reversed_meaning: "Unfairness, dishonesty, imbalance",
    description: "Justice represents fairness, truth, and the need for balance in all things.",
    image: "/tarot/major_11_justice.png.png",
    element: "Air",
    planet: "Venus",
    zodiac: "Libra"
  },
  {
    id: "major_12",
    name: "The Hanged Man",
    suit: "Major Arcana",
    number: 12,
    meaning: "Sacrifice, waiting, new perspective",
    reversed_meaning: "Stalling, needless sacrifice, fear of sacrifice",
    description: "The Hanged Man represents sacrifice, waiting, and gaining a new perspective.",
    image: "/tarot/major_12_the_hanged_man.png.png",
    element: "Water",
    planet: "Neptune",
    zodiac: "Pisces"
  },
  {
    id: "major_13",
    name: "Death",
    suit: "Major Arcana",
    number: 13,
    meaning: "Transformation, endings, new beginnings",
    reversed_meaning: "Resistance to change, stagnation, fear of transformation",
    description: "Death represents transformation, endings, and the promise of new beginnings.",
    image: "/tarot/major_13_death.png.png",
    element: "Water",
    planet: "Scorpio",
    zodiac: "Scorpio"
  },
  {
    id: "major_14",
    name: "Temperance",
    suit: "Major Arcana",
    number: 14,
    meaning: "Balance, moderation, patience",
    reversed_meaning: "Imbalance, excess, lack of moderation",
    description: "Temperance represents balance, moderation, and the virtue of patience.",
    image: "/tarot/major_14_temperance.png.png",
    element: "Fire",
    planet: "Sagittarius",
    zodiac: "Sagittarius"
  },
  {
    id: "major_15",
    name: "The Devil",
    suit: "Major Arcana",
    number: 15,
    meaning: "Temptation, bondage, materialism",
    reversed_meaning: "Freedom, breaking free, overcoming temptation",
    description: "The Devil represents temptation, bondage, and the material aspects that bind us.",
    image: "/tarot/major_15_the_devil.png.png",
    element: "Earth",
    planet: "Saturn",
    zodiac: "Capricorn"
  },
  {
    id: "major_16",
    name: "The Tower",
    suit: "Major Arcana",
    number: 16,
    meaning: "Sudden change, revelation, upheaval",
    reversed_meaning: "Avoiding disaster, fear of change, internal revelation",
    description: "The Tower represents sudden change, revelation, and the upheaval that brings truth.",
    image: "/tarot/major_16_the_tower.png.png",
    element: "Fire",
    planet: "Mars",
    zodiac: "Aries"
  },
  {
    id: "major_17",
    name: "The Star",
    suit: "Major Arcana",
    number: 17,
    meaning: "Hope, inspiration, spirituality",
    reversed_meaning: "Hopelessness, lack of faith, blocked creativity",
    description: "The Star represents hope, inspiration, and the light of spirituality.",
    image: "/tarot/major_17_the_star.png.png",
    element: "Air",
    planet: "Aquarius",
    zodiac: "Aquarius"
  },
  {
    id: "major_18",
    name: "The Moon",
    suit: "Major Arcana",
    number: 18,
    meaning: "Illusion, intuition, subconscious",
    reversed_meaning: "Releasing fear, repressed emotion, inner confusion",
    description: "The Moon represents illusion, intuition, and the power of the subconscious.",
    image: "/tarot/major_18_the_moon.png.png",
    element: "Water",
    planet: "Pisces",
    zodiac: "Pisces"
  },
  {
    id: "major_19",
    name: "The Sun",
    suit: "Major Arcana",
    number: 19,
    meaning: "Joy, success, vitality",
    reversed_meaning: "Temporary depression, lack of success, creative blocks",
    description: "The Sun represents joy, success, and the vitality of life.",
    image: "/tarot/major_19_the_sun.png.png",
    element: "Fire",
    planet: "Sun",
    zodiac: "Leo"
  },
  {
    id: "major_20",
    name: "Judgment",
    suit: "Major Arcana",
    number: 20,
    meaning: "Judgment, rebirth, inner calling",
    reversed_meaning: "Self-doubt, lack of self-awareness, fear of judgment",
    description: "Judgment represents judgment, rebirth, and answering your inner calling.",
    image: "/tarot/major_20_judgment.png.png",
    element: "Fire",
    planet: "Pluto",
    zodiac: "Scorpio"
  },
  {
    id: "major_21",
    name: "The World",
    suit: "Major Arcana",
    number: 21,
    meaning: "Completion, accomplishment, travel",
    reversed_meaning: "Incompletion, lack of closure, inability to finish",
    description: "The World represents completion, accomplishment, and the fulfillment of goals.",
    image: "/tarot/major_21_the_world.png.png",
    element: "Earth",
    planet: "Saturn",
    zodiac: "Capricorn"
  }
];

// Tarot spreads
export const TAROT_SPREADS: TarotSpread[] = [
  {
    name: "Single Card",
    positions: ["Present"],
    description: "A simple one-card reading for quick guidance"
  },
  {
    name: "Three Card Spread",
    positions: ["Past", "Present", "Future"],
    description: "A classic three-card spread showing the progression of your situation"
  },
  {
    name: "Celtic Cross",
    positions: ["Present", "Challenge", "Past", "Future", "Above", "Below", "Advice", "External", "Hopes", "Outcome"],
    description: "The most comprehensive tarot spread for deep insight"
  },
  {
    name: "Horseshoe Spread",
    positions: ["Past", "Present", "Future", "Advice", "Obstacles", "External", "Outcome"],
    description: "A seven-card spread shaped like a horseshoe for detailed guidance"
  },
  {
    name: "Tree of Life",
    positions: ["Crown", "Wisdom", "Understanding", "Mercy", "Severity", "Beauty", "Victory", "Glory", "Foundation", "Kingdom"],
    description: "A mystical ten-card spread based on the Kabbalistic Tree of Life"
  }
];

// External API service
class TarotApiService {
  private baseUrl = 'https://tarot-api-3hv5.onrender.com/api/v1';

  async getRandomCard(): Promise<TarotCard | null> {
    try {
      const response = await fetch(`${this.baseUrl}/cards/onecard`);
      if (!response.ok) throw new Error('Failed to fetch random card');
      
      const data = await response.json();
      return this.mapExternalCardToLocal(data);
    } catch (error) {
      console.error('Error fetching random card:', error);
      return this.getRandomLocalCard();
    }
  }

  async getAllCards(): Promise<TarotCard[]> {
    try {
      const response = await fetch(`${this.baseUrl}/cards`);
      if (!response.ok) throw new Error('Failed to fetch all cards');
      
      const data = await response.json();
      return data.cards.map((card: any) => this.mapExternalCardToLocal(card));
    } catch (error) {
      console.error('Error fetching all cards:', error);
      return LOCAL_TAROT_CARDS;
    }
  }

  private mapExternalCardToLocal(externalCard: any): TarotCard {
    return {
      id: externalCard.id || externalCard.name?.toLowerCase().replace(/\s+/g, '_'),
      name: externalCard.name || 'Unknown Card',
      suit: externalCard.suit || 'Unknown',
      number: externalCard.number,
      meaning: externalCard.meaning || 'No meaning available',
      reversed_meaning: externalCard.reversed_meaning || 'No reversed meaning available',
      description: externalCard.description || 'No description available',
      image: externalCard.image || this.getLocalImagePath(externalCard.name),
      element: externalCard.element,
      planet: externalCard.planet,
      zodiac: externalCard.zodiac
    };
  }

  private getLocalImagePath(cardName: string): string {
    if (!cardName) return '/tarot/major_00_the_fool.png.png';
    
    const normalizedName = cardName.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    
    return `/tarot/${normalizedName}.png.png`;
  }

  private getRandomLocalCard(): TarotCard {
    const randomIndex = Math.floor(Math.random() * LOCAL_TAROT_CARDS.length);
    return LOCAL_TAROT_CARDS[randomIndex];
  }

  generateReading(question: string, spreadType: string, cards: TarotCard[]): TarotReading {
    const spread = TAROT_SPREADS.find(s => s.name === spreadType) || TAROT_SPREADS[0];
    
    return {
      id: `reading_${Date.now()}`,
      timestamp: new Date().toISOString(),
      question,
      spreadType,
      cards: cards.map((card, index) => ({
        ...card,
        position: spread.positions[index] || `Position ${index + 1}`
      })),
      interpretation: this.generateInterpretation(question, cards, spread),
      guidance: this.generateGuidance(cards),
      timing: this.generateTiming(cards)
    };
  }

  private generateInterpretation(question: string, cards: TarotCard[], spread: TarotSpread): string {
    const cardNames = cards.map(card => card.name).join(', ');
    return `Your question "${question}" has been answered through the ${spread.name}. The cards drawn are: ${cardNames}. Each card offers unique insights into your situation, providing both immediate guidance and deeper understanding of the forces at work in your life.`;
  }

  private generateGuidance(cards: TarotCard[]): string {
    const majorArcanaCount = cards.filter(card => card.suit === 'Major Arcana').length;
    const guidance = majorArcanaCount > 0 
      ? 'The presence of Major Arcana cards indicates significant life events and spiritual lessons.'
      : 'The Minor Arcana cards suggest practical guidance for everyday situations.';
    
    return `${guidance} Trust your intuition and consider the deeper meanings behind each card's message.`;
  }

  private generateTiming(cards: TarotCard[]): string {
    const timingCards = cards.filter(card => 
      card.name.includes('Wheel') || 
      card.name.includes('Sun') || 
      card.name.includes('Moon')
    );
    
    return timingCards.length > 0 
      ? 'The timing suggests significant changes are approaching. Be prepared for new opportunities.'
      : 'The timing indicates steady progress. Continue on your current path with patience and determination.';
  }
}

/**
 * Get tarot card image path by card name
 * Handles name variations and normalization
 */
export function getTarotCardImageByName(cardName: string): string {
  if (!cardName) {
    return '/tarot/major_00_the_fool.png.png'; // Fallback
  }

  // Normalize card name for matching
  const normalizedName = cardName.trim().toLowerCase();
  
  // Find matching card in LOCAL_TAROT_CARDS
  const card = LOCAL_TAROT_CARDS.find(c => {
    const cardNameLower = c.name.toLowerCase();
    // Exact match
    if (cardNameLower === normalizedName) return true;
    // Match without "The" prefix
    if (cardNameLower.replace(/^the /, '') === normalizedName.replace(/^the /, '')) return true;
    // Match if normalized name contains card name or vice versa
    if (cardNameLower.includes(normalizedName) || normalizedName.includes(cardNameLower)) return true;
    return false;
  });

  if (card) {
    return card.image;
  }

  // Fallback to default card image
  return '/tarot/major_00_the_fool.png.png';
}

export const tarotApiService = new TarotApiService();
export { LOCAL_TAROT_CARDS };
