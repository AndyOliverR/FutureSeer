import { userSubdocGet, userSubdocSet } from '@/lib/userSubcollectionFirestore';

export interface Rune {
  name: string
  symbol: string
  meaning: string
  upright: string
  reversed: string
  element: 'fire' | 'earth' | 'air' | 'water'
  deity: string
  description: string
  energy: number // 1-10 scale
  timing: string
  keywords: string[]
}

export interface RuneReading {
  id: string
  timestamp: Date
  question: string
  spreadType: string
  spreadName: string
  positions: string[]
  runes: (Rune & { isReversed: boolean; position: string })[]
  overallReading: string
  elementalBalance: {
    fire: number
    earth: number
    air: number
    water: number
    primary: string
    secondary: string
    conflict: string
    harmony: string
  }
  energyScore: number // 1-100 scale
  confidenceLevel: number // 1-100
  timing: {
    currentPhase: string
    favorablePeriods: string[]
    challenges: string[]
    opportunities: string[]
  }
  recommendations: string[]
  coaching: {
    strengths: string[]
    challenges: string[]
    growthAreas: string[]
    affirmations: string[]
  }
}

export interface RunesCoaching {
  id: string
  timestamp: Date
  question: string
  response: string
  insights: string[]
  recommendations: string[]
  followUpQuestions: string[]
}

class RunesIntelligence {
  private elderFutharkRunes: Omit<Rune, 'energy' | 'timing' | 'keywords'>[] = [
    {
      name: "Fehu",
      symbol: "ᚠ",
      meaning: "Wealth, Prosperity, Success",
      upright: "Material gain, financial success, abundance, fertility, new beginnings, power, energy",
      reversed: "Loss of wealth, poverty, lack of resources, greed, materialism, stagnation",
      element: "fire",
      deity: "Freyr",
      description: "Fehu represents cattle, which was the primary form of wealth in ancient times. It symbolizes prosperity, abundance, and the power to create and maintain wealth."
    },
    {
      name: "Uruz",
      symbol: "ᚢ",
      meaning: "Strength, Vitality, Wild Power",
      upright: "Physical strength, courage, determination, health, vitality, primal energy, wild nature",
      reversed: "Weakness, lack of energy, illness, cowardice, lack of determination",
      element: "earth",
      deity: "Thor",
      description: "Uruz represents the aurochs, a wild ox. It embodies raw strength, vitality, and the untamed forces of nature."
    },
    {
      name: "Thurisaz",
      symbol: "ᚦ",
      meaning: "Thorn, Protection, Defense",
      upright: "Protection, defense, boundaries, conflict, challenge, gateway, transformation",
      reversed: "Vulnerability, attack, danger, lack of protection, weakness",
      element: "fire",
      deity: "Thor",
      description: "Thurisaz represents the thorn, a natural defense mechanism. It symbolizes protection, boundaries, and the power to defend oneself."
    },
    {
      name: "Ansuz",
      symbol: "ᚨ",
      meaning: "Communication, Wisdom, Divine Message",
      upright: "Communication, wisdom, divine inspiration, knowledge, truth, revelation, speech",
      reversed: "Miscommunication, lies, manipulation, lack of wisdom, silence",
      element: "air",
      deity: "Odin",
      description: "Ansuz represents the mouth and speech. It embodies communication, wisdom, and divine messages from the gods."
    },
    {
      name: "Raidho",
      symbol: "ᚱ",
      meaning: "Journey, Movement, Progress",
      upright: "Journey, travel, movement, progress, change, rhythm, flow, communication",
      reversed: "Stagnation, delays, obstacles, lack of progress, resistance",
      element: "air",
      deity: "Odin",
      description: "Raidho represents the wheel and movement. It symbolizes journeys, both physical and spiritual, and the flow of life."
    },
    {
      name: "Kenaz",
      symbol: "ᚲ",
      meaning: "Fire, Knowledge, Creativity",
      upright: "Fire, knowledge, creativity, inspiration, passion, transformation, illumination",
      reversed: "Lack of creativity, ignorance, darkness, confusion, loss of passion",
      element: "fire",
      deity: "Heimdall",
      description: "Kenaz represents the torch and fire. It embodies knowledge, creativity, and the transformative power of fire."
    },
    {
      name: "Gebo",
      symbol: "ᚷ",
      meaning: "Gift, Partnership, Exchange",
      upright: "Gift, partnership, generosity, balance, harmony, exchange, sacrifice",
      reversed: "Selfishness, imbalance, lack of generosity, broken partnerships",
      element: "air",
      deity: "Freya",
      description: "Gebo represents the gift and partnership. It symbolizes generosity, balance, and the sacred exchange between people."
    },
    {
      name: "Wunjo",
      symbol: "ᚹ",
      meaning: "Joy, Harmony, Fellowship",
      upright: "Joy, harmony, fellowship, happiness, success, celebration, community",
      reversed: "Sorrow, disharmony, isolation, failure, loneliness, conflict",
      element: "air",
      deity: "Freya",
      description: "Wunjo represents joy and harmony. It embodies happiness, success, and the bonds of community and fellowship."
    },
    {
      name: "Hagalaz",
      symbol: "ᚺ",
      meaning: "Hail, Disruption, Transformation",
      upright: "Disruption, transformation, change, destruction, chaos, breakthrough, revelation",
      reversed: "Stagnation, resistance to change, missed opportunities, lack of transformation",
      element: "water",
      deity: "Hel",
      description: "Hagalaz represents hail and disruption. It symbolizes necessary destruction and transformation that leads to growth."
    },
    {
      name: "Naudhiz",
      symbol: "ᚾ",
      meaning: "Need, Necessity, Constraint",
      upright: "Need, necessity, constraint, hardship, endurance, patience, survival",
      reversed: "Lack of need, excess, waste, impatience, lack of endurance",
      element: "fire",
      deity: "Norns",
      description: "Naudhiz represents need and necessity. It embodies the constraints that shape us and the endurance to overcome them."
    },
    {
      name: "Isa",
      symbol: "ᛁ",
      meaning: "Ice, Stillness, Standstill",
      upright: "Ice, stillness, standstill, patience, concentration, focus, clarity",
      reversed: "Lack of focus, scattered energy, impatience, lack of clarity",
      element: "water",
      deity: "Jotnar",
      description: "Isa represents ice and stillness. It symbolizes the power of concentration and the clarity that comes from stillness."
    },
    {
      name: "Jera",
      symbol: "ᛃ",
      meaning: "Harvest, Year, Cycle",
      upright: "Harvest, year, cycle, reward, completion, fruition, patience",
      reversed: "Lack of reward, incomplete cycles, impatience, lack of fruition",
      element: "earth",
      deity: "Freyr",
      description: "Jera represents harvest and the cycle of the year. It embodies the rewards of patience and the completion of cycles."
    },
    {
      name: "Eihwaz",
      symbol: "ᛇ",
      meaning: "Yew Tree, Endurance, Death",
      upright: "Endurance, death, transformation, protection, strength, resilience",
      reversed: "Lack of endurance, fear of death, weakness, lack of protection",
      element: "earth",
      deity: "Hel",
      description: "Eihwaz represents the yew tree and endurance. It symbolizes the strength to endure and the transformation through death."
    },
    {
      name: "Perthro",
      symbol: "ᛈ",
      meaning: "Lot Cup, Mystery, Fate",
      upright: "Mystery, fate, chance, destiny, secrets, hidden knowledge, divination",
      reversed: "Lack of mystery, revealed secrets, lack of fate, lack of destiny",
      element: "water",
      deity: "Norns",
      description: "Perthro represents the lot cup and mystery. It embodies the unknown and the role of fate in our lives."
    },
    {
      name: "Algiz",
      symbol: "ᛉ",
      meaning: "Elk, Protection, Defense",
      upright: "Protection, defense, sanctuary, safety, divine protection, spiritual defense",
      reversed: "Lack of protection, vulnerability, danger, lack of safety",
      element: "air",
      deity: "Heimdall",
      description: "Algiz represents the elk and protection. It symbolizes divine protection and the sanctuary of spiritual defense."
    },
    {
      name: "Sowilo",
      symbol: "ᛊ",
      meaning: "Sun, Success, Victory",
      upright: "Sun, success, victory, energy, power, health, vitality, guidance",
      reversed: "Lack of success, defeat, low energy, poor health, darkness",
      element: "fire",
      deity: "Sol",
      description: "Sowilo represents the sun and success. It embodies victory, energy, and the guiding light of success."
    },
    {
      name: "Tiwaz",
      symbol: "ᛏ",
      meaning: "Justice, Honor, Sacrifice",
      upright: "Justice, honor, sacrifice, victory, leadership, courage, truth",
      reversed: "Injustice, dishonor, lack of sacrifice, defeat, cowardice",
      element: "air",
      deity: "Tyr",
      description: "Tiwaz represents justice and honor. It symbolizes sacrifice, truth, and the courage to do what is right."
    },
    {
      name: "Berkano",
      symbol: "ᛒ",
      meaning: "Birth, Growth, New Beginnings",
      upright: "Birth, growth, new beginnings, fertility, family, nurturing, protection",
      reversed: "Lack of growth, infertility, family problems, stagnation",
      element: "earth",
      deity: "Freya",
      description: "Berkano represents birth and growth. It embodies fertility, new beginnings, and the nurturing aspects of life."
    },
    {
      name: "Ehwaz",
      symbol: "ᛖ",
      meaning: "Horse, Movement, Partnership",
      upright: "Movement, partnership, trust, loyalty, progress, teamwork, harmony",
      reversed: "Lack of movement, broken partnerships, distrust, disharmony",
      element: "earth",
      deity: "Freyr",
      description: "Ehwaz represents the horse and movement. It symbolizes partnership, trust, and harmonious progress."
    },
    {
      name: "Mannaz",
      symbol: "ᛗ",
      meaning: "Humanity, Community, Cooperation",
      upright: "Humanity, community, cooperation, social bonds, intelligence, civilization",
      reversed: "Isolation, lack of community, lack of cooperation, anti-social behavior",
      element: "air",
      deity: "Heimdall",
      description: "Mannaz represents humanity and community. It embodies the bonds of society and the intelligence of human cooperation."
    },
    {
      name: "Laguz",
      symbol: "ᛚ",
      meaning: "Water, Flow, Intuition",
      upright: "Water, flow, intuition, emotions, dreams, psychic abilities, healing",
      reversed: "Lack of flow, blocked intuition, emotional problems, lack of healing",
      element: "water",
      deity: "Njord",
      description: "Laguz represents water and flow. It symbolizes intuition, emotions, and the healing power of water."
    },
    {
      name: "Ingwaz",
      symbol: "ᛜ",
      meaning: "Fertility, Growth, Potential",
      upright: "Fertility, growth, potential, new beginnings, creativity, abundance",
      reversed: "Lack of fertility, lack of growth, wasted potential, lack of creativity",
      element: "earth",
      deity: "Freyr",
      description: "Ingwaz represents fertility and growth. It embodies the potential for new beginnings and creative abundance."
    },
    {
      name: "Dagaz",
      symbol: "ᛞ",
      meaning: "Day, Breakthrough, Transformation",
      upright: "Day, breakthrough, transformation, enlightenment, awakening, clarity",
      reversed: "Lack of breakthrough, lack of transformation, confusion, lack of clarity",
      element: "air",
      deity: "Baldr",
      description: "Dagaz represents day and breakthrough. It symbolizes enlightenment, awakening, and the clarity of transformation."
    },
    {
      name: "Othala",
      symbol: "ᛟ",
      meaning: "Heritage, Inheritance, Home",
      upright: "Heritage, inheritance, home, family, tradition, legacy, security",
      reversed: "Loss of heritage, homelessness, lack of tradition, insecurity",
      element: "earth",
      deity: "Odin",
      description: "Othala represents heritage and inheritance. It embodies family, tradition, and the security of home and community."
    }
  ]

  private runeSpreads = [
    {
      key: "single",
      name: "Single Rune",
      description: "A single rune for quick guidance and insight.",
      positions: ["Message"]
    },
    {
      key: "three",
      name: "Three Runes",
      description: "Past, Present, and Future insight.",
      positions: ["Past", "Present", "Future"]
    },
    {
      key: "five",
      name: "Five Runes",
      description: "Situation, Challenge, Advice, Outcome, and Hidden Influence.",
      positions: ["Situation", "Challenge", "Advice", "Outcome", "Hidden"]
    },
    {
      key: "nine",
      name: "Nine Runes",
      description: "Comprehensive reading covering all aspects of life.",
      positions: ["Self", "Environment", "Past", "Future", "Hopes", "Fears", "Advice", "Outcome", "Hidden"]
    }
  ]

  private lifePhases = [
    'Foundation Phase - Building your base',
    'Growth Phase - Expanding your horizons',
    'Maturity Phase - Consolidating your gains',
    'Wisdom Phase - Sharing your knowledge',
    'Transformation Phase - Major life changes'
  ]

  private favorablePeriods = [
    'Spring months for new beginnings',
    'Summer months for growth and expansion',
    'Autumn months for harvest and rewards',
    'Winter months for reflection and planning',
    'Full moon periods for manifestation',
    'New moon periods for setting intentions'
  ]

  private challenges = [
    'Learning to trust the guidance of the runes',
    'Developing patience with the timing of events',
    'Balancing different elemental influences',
    'Maintaining focus on your spiritual path',
    'Integrating ancient wisdom with modern life'
  ]

  private opportunities = [
    'Developing your intuitive abilities',
    'Building stronger spiritual connections',
    'Advancing in your personal growth',
    'Expanding your knowledge and wisdom',
    'Creating positive life transformations'
  ]

  async castRunes(question: string, spreadType: string, displayName?: string): Promise<RuneReading> {
    // Get the spread configuration
    const spread = this.runeSpreads.find(s => s.key === spreadType) || this.runeSpreads[0]
    
    // Generate runes with enhanced properties
    const runes = this.getRandomRunes(spread.positions.length).map((rune, index) => ({
      ...rune,
      position: spread.positions[index],
      energy: Math.floor(Math.random() * 10) + 1,
      timing: this.getRuneTiming(rune.name, rune.isReversed),
      keywords: this.getRuneKeywords(rune.name, rune.isReversed)
    }))

    // Calculate elemental balance
    const elementalBalance = this.calculateElementalBalance(runes)

    // Calculate energy score
    const totalEnergy = runes.reduce((sum, rune) => sum + rune.energy, 0)
    const energyScore = Math.round(totalEnergy / runes.length * 10)

    // Generate timing analysis
    const timing = {
      currentPhase: this.lifePhases[Math.floor(Math.random() * this.lifePhases.length)],
      favorablePeriods: this.favorablePeriods.sort(() => 0.5 - Math.random()).slice(0, 3),
      challenges: this.challenges.sort(() => 0.5 - Math.random()).slice(0, 2),
      opportunities: this.opportunities.sort(() => 0.5 - Math.random()).slice(0, 2)
    }

    // Generate overall reading
    const overallReading = this.generateOverallReading(runes, question, spread, displayName)

    // Generate recommendations
    const recommendations = this.generateRecommendations(runes, elementalBalance, timing)

    // Generate coaching insights
    const coaching = this.generateCoaching(runes, elementalBalance, timing)

    const reading: RuneReading = {
      id: Date.now().toString(),
      timestamp: new Date(),
      question,
      spreadType,
      spreadName: spread.name,
      positions: spread.positions,
      runes,
      overallReading,
      elementalBalance,
      energyScore,
      confidenceLevel: 94,
      timing,
      recommendations,
      coaching
    }

    return reading
  }

  private getRandomRunes(count: number): (Omit<Rune, 'energy' | 'timing' | 'keywords'> & { isReversed: boolean })[] {
    const shuffled = [...this.elderFutharkRunes].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count).map(rune => ({
      ...rune,
      isReversed: Math.random() > 0.7 // 30% chance of being reversed
    }))
  }

  private getRuneTiming(runeName: string, isReversed: boolean): string {
    const timingMap: { [key: string]: string } = {
      'Fehu': isReversed ? 'Financial setbacks require patience' : 'Prosperity flows naturally',
      'Uruz': isReversed ? 'Strength builds through challenges' : 'Natural strength manifests',
      'Thurisaz': isReversed ? 'Protection needed during vulnerable times' : 'Protection is strong',
      'Ansuz': isReversed ? 'Communication improves with time' : 'Wisdom speaks clearly',
      'Raidho': isReversed ? 'Journey progresses despite obstacles' : 'Movement flows smoothly',
      'Kenaz': isReversed ? 'Creativity emerges through struggle' : 'Inspiration burns bright',
      'Gebo': isReversed ? 'Balance restored through effort' : 'Harmony comes naturally',
      'Wunjo': isReversed ? 'Joy returns after hardship' : 'Happiness flows freely',
      'Hagalaz': isReversed ? 'Transformation completes its cycle' : 'Change brings breakthrough',
      'Naudhiz': isReversed ? 'Necessity reveals its purpose' : 'Constraint shapes growth',
      'Isa': isReversed ? 'Stillness gives way to action' : 'Focus brings clarity',
      'Jera': isReversed ? 'Harvest comes with patience' : 'Rewards manifest naturally',
      'Eihwaz': isReversed ? 'Endurance builds through trials' : 'Strength sustains through challenges',
      'Perthro': isReversed ? 'Mystery reveals its secrets' : 'Fate unfolds as destined',
      'Algiz': isReversed ? 'Protection strengthens through awareness' : 'Divine protection surrounds',
      'Sowilo': isReversed ? 'Success comes through persistence' : 'Victory shines brightly',
      'Tiwaz': isReversed ? 'Justice prevails through sacrifice' : 'Honor guides actions',
      'Berkano': isReversed ? 'Growth emerges from nurturing' : 'New beginnings flourish',
      'Ehwaz': isReversed ? 'Partnership strengthens through trust' : 'Movement flows harmoniously',
      'Mannaz': isReversed ? 'Community bonds through cooperation' : 'Humanity thrives together',
      'Laguz': isReversed ? 'Intuition flows through healing' : 'Water carries wisdom',
      'Ingwaz': isReversed ? 'Potential manifests through creativity' : 'Fertility brings abundance',
      'Dagaz': isReversed ? 'Breakthrough comes through awakening' : 'Transformation brings enlightenment',
      'Othala': isReversed ? 'Heritage strengthens through tradition' : 'Legacy provides security'
    }

    return timingMap[runeName] || 'Timing reveals through rune wisdom'
  }

  private getRuneKeywords(runeName: string, isReversed: boolean): string[] {
    const keywordMap: { [key: string]: string[] } = {
      'Fehu': isReversed ? ['patience', 'conservation', 'moderation'] : ['prosperity', 'abundance', 'wealth'],
      'Uruz': isReversed ? ['endurance', 'persistence', 'growth'] : ['strength', 'vitality', 'power'],
      'Thurisaz': isReversed ? ['awareness', 'caution', 'defense'] : ['protection', 'boundaries', 'defense'],
      'Ansuz': isReversed ? ['listening', 'reflection', 'truth'] : ['communication', 'wisdom', 'inspiration'],
      'Raidho': isReversed ? ['patience', 'persistence', 'flow'] : ['journey', 'movement', 'progress'],
      'Kenaz': isReversed ? ['perseverance', 'learning', 'growth'] : ['creativity', 'inspiration', 'knowledge'],
      'Gebo': isReversed ? ['balance', 'generosity', 'harmony'] : ['gift', 'partnership', 'exchange'],
      'Wunjo': isReversed ? ['healing', 'reconciliation', 'joy'] : ['joy', 'harmony', 'fellowship'],
      'Hagalaz': isReversed ? ['acceptance', 'transformation', 'growth'] : ['disruption', 'transformation', 'change'],
      'Naudhiz': isReversed ? ['patience', 'endurance', 'necessity'] : ['need', 'constraint', 'endurance'],
      'Isa': isReversed ? ['action', 'movement', 'clarity'] : ['stillness', 'focus', 'patience'],
      'Jera': isReversed ? ['patience', 'completion', 'reward'] : ['harvest', 'cycle', 'reward'],
      'Eihwaz': isReversed ? ['resilience', 'transformation', 'strength'] : ['endurance', 'protection', 'transformation'],
      'Perthro': isReversed ? ['revelation', 'destiny', 'mystery'] : ['mystery', 'fate', 'destiny'],
      'Algiz': isReversed ? ['awareness', 'protection', 'safety'] : ['protection', 'defense', 'sanctuary'],
      'Sowilo': isReversed ? ['persistence', 'success', 'victory'] : ['success', 'victory', 'energy'],
      'Tiwaz': isReversed ? ['sacrifice', 'justice', 'honor'] : ['justice', 'honor', 'sacrifice'],
      'Berkano': isReversed ? ['nurturing', 'growth', 'family'] : ['birth', 'growth', 'fertility'],
      'Ehwaz': isReversed ? ['trust', 'partnership', 'harmony'] : ['movement', 'partnership', 'trust'],
      'Mannaz': isReversed ? ['cooperation', 'community', 'intelligence'] : ['humanity', 'community', 'cooperation'],
      'Laguz': isReversed ? ['healing', 'intuition', 'flow'] : ['water', 'intuition', 'flow'],
      'Ingwaz': isReversed ? ['creativity', 'potential', 'abundance'] : ['fertility', 'growth', 'potential'],
      'Dagaz': isReversed ? ['awakening', 'clarity', 'transformation'] : ['day', 'breakthrough', 'transformation'],
      'Othala': isReversed ? ['tradition', 'heritage', 'security'] : ['heritage', 'inheritance', 'home']
    }

    return keywordMap[runeName] || ['wisdom', 'guidance', 'transformation']
  }

  private calculateElementalBalance(runes: (Rune & { isReversed: boolean; position: string })[]): RuneReading['elementalBalance'] {
    const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 }
    
    runes.forEach(rune => {
      elementCounts[rune.element]++
    })

    const sortedElements = Object.entries(elementCounts).sort(([,a], [,b]) => b - a)
    const primary = sortedElements[0][0]
    const secondary = sortedElements[1][0]
    const conflict = sortedElements[2][0]
    const harmony = sortedElements[3][0]

    return {
      fire: elementCounts.fire,
      earth: elementCounts.earth,
      air: elementCounts.air,
      water: elementCounts.water,
      primary,
      secondary,
      conflict,
      harmony
    }
  }

  private generateOverallReading(runes: (Rune & { isReversed: boolean; position: string })[], question: string, spread: any, displayName?: string): string {
    // Analyze question theme for context
    const questionTheme = this.analyzeQuestionTheme(question)
    
    // Get key runes based on position
    const selfRune = runes.find(r => r.position === 'Self')
    const primaryRune = runes.find(r => r.position === 'Present' || r.position === 'Situation' || r.position === 'Message') || selfRune || runes[0]
    const adviceRune = runes.find(r => r.position === 'Advice')
    const outcomeRune = runes.find(r => r.position === 'Outcome' || r.position === 'Future')
    const environmentRune = runes.find(r => r.position === 'Environment')
    const hopesRune = runes.find(r => r.position === 'Hopes')
    const fearsRune = runes.find(r => r.position === 'Fears')
    const pastRune = runes.find(r => r.position === 'Past')
    const hiddenRune = runes.find(r => r.position === 'Hidden')
    
    // Start with open-ended, exploratory introduction - personalize with display name if provided
    const greeting = displayName ? `${displayName}, ` : ''
    let interpretation = `${greeting}As you explore your question "${question}", the runes offer perspectives to consider rather than fixed answers. The future is not predetermined—these symbols illuminate possibilities and influences based on your current path, leaving room for your own intuition and free will to guide your decisions. `
    
    // Analyze rune relationships for contextual nuance
    const runeRelationships = this.analyzeRuneRelationships(runes)
    
    // For yes/no or specific date questions: reframe as guidance about variables
    if (this.isSpecificDateQuestion(question) || this.isYesNoQuestion(question)) {
      interpretation += `Rather than predicting a fixed outcome, the runes invite you to consider the variables and influences that could shape this situation. `
      
      if (primaryRune) {
        const primaryMeaning = primaryRune.isReversed ? primaryRune.reversed : primaryRune.upright
        interpretation += `The ${primaryRune.name} rune (${primaryRune.symbol}) ${primaryRune.isReversed ? 'reversed' : 'upright'} may point toward aspects of ${primaryMeaning.toLowerCase()}. `
        interpretation += `Consider: what in your current circumstances relates to these themes? `
      }
      
      if (environmentRune) {
        const envMeaning = environmentRune.isReversed ? environmentRune.reversed : environmentRune.upright
        interpretation += `The surrounding influences could involve ${envMeaning.toLowerCase()}. `
        interpretation += `Reflect on how external factors might be affecting this situation. `
      }
      
      if (adviceRune) {
        const adviceMeaning = adviceRune.isReversed ? adviceRune.reversed : adviceRune.upright
        interpretation += `The guidance here suggests considering ${adviceMeaning.toLowerCase()}. `
        interpretation += `What actions or perspectives might help align you with this energy? `
      }
      
      if (outcomeRune) {
        const outcomeMeaning = outcomeRune.isReversed ? outcomeRune.reversed : outcomeRune.upright
        interpretation += `Potential outcomes could involve ${outcomeMeaning.toLowerCase()}, though your choices and actions will significantly influence how these energies manifest. `
      }
      
    } else if (questionTheme.requiresEvaluation) {
      // For evaluation questions: explore factors rather than give definitive answers
      const partnerName = questionTheme.mentionedNames?.[0] || 'this person'
      interpretation += `When exploring this question, the runes invite you to examine various factors and dynamics rather than seeking a simple yes or no. `
      
      if (selfRune) {
        const selfMeaning = selfRune.isReversed ? selfRune.reversed : selfRune.upright
        interpretation += `Consider what you bring to this situation: the ${selfRune.name} rune suggests themes of ${selfMeaning.toLowerCase()}. `
        interpretation += `How do these qualities relate to your involvement here? `
      }
      
      if (environmentRune) {
        const envMeaning = environmentRune.isReversed ? environmentRune.reversed : environmentRune.upright
        interpretation += `The circumstances around this situation may involve ${envMeaning.toLowerCase()}. `
        interpretation += `What does your intuition tell you about these environmental factors? `
      }
      
      // Analyze partnership-related runes in context
      const geboRune = runes.find(r => r.name === 'Gebo')
      const ehwazRune = runes.find(r => r.name === 'Ehwaz')
      const mannazRune = runes.find(r => r.name === 'Mannaz')
      
      if (geboRune) {
        if (!geboRune.isReversed) {
          interpretation += `Gebo, the gift rune, appears—this could indicate potential for mutual exchange and balance. `
        } else {
          interpretation += `Gebo reversed invites reflection on whether there might be imbalance or unmet expectations. `
        }
        interpretation += `What does balanced exchange look like in this context? `
      }
      
      if (ehwazRune) {
        if (!ehwazRune.isReversed) {
          interpretation += `Ehwaz, representing partnership movement, suggests there could be potential for trust and harmonious progress. `
        } else {
          interpretation += `Ehwaz reversed points toward concerns about trust, movement, or partnership dynamics that may need attention. `
        }
        interpretation += `What factors contribute to—or hinder—trust and forward movement? `
      }
      
      if (mannazRune && !mannazRune.isReversed) {
        interpretation += `Mannaz emphasizes community and cooperation—consider how collaboration might play a role. `
      }
      
      if (hopesRune) {
        const hopesMeaning = hopesRune.isReversed ? hopesRune.reversed : hopesRune.upright
        interpretation += `Your hopes may center on ${hopesMeaning.toLowerCase()}. `
        interpretation += `How do these aspirations align with what you're seeking? `
      }
      
      if (fearsRune) {
        const fearsMeaning = fearsRune.isReversed ? fearsRune.reversed : fearsRune.upright
        interpretation += `Your concerns might involve ${fearsMeaning.toLowerCase()}. `
        interpretation += `What steps could address or transform these fears into awareness? `
      }
      
    } else {
      // General open-ended interpretation
      if (pastRune) {
        const pastMeaning = pastRune.isReversed ? pastRune.reversed : pastRune.upright
        interpretation += `Reflecting on what has come before, ${pastRune.name} suggests themes of ${pastMeaning.toLowerCase()} have influenced your path. `
        interpretation += `How might understanding these past influences inform your present choices? `
      }
      
      if (primaryRune) {
        const primaryMeaning = primaryRune.isReversed ? primaryRune.reversed : primaryRune.upright
        interpretation += `In your current circumstances, ${primaryRune.name} (${primaryRune.symbol}) ${primaryRune.isReversed ? 'reversed' : 'upright'} may indicate aspects of ${primaryMeaning.toLowerCase()}. `
        interpretation += `What resonates with you about this symbol's meaning? `
      }
      
      if (adviceRune) {
        const adviceMeaning = adviceRune.isReversed ? adviceRune.reversed : adviceRune.upright
        interpretation += `The guidance offered suggests considering ${adviceMeaning.toLowerCase()}. `
        interpretation += `How might you integrate this wisdom into your approach? `
      }
      
      if (outcomeRune) {
        const outcomeMeaning = outcomeRune.isReversed ? outcomeRune.reversed : outcomeRune.upright
        interpretation += `Potential future directions could involve ${outcomeMeaning.toLowerCase()}, though remember that your choices actively shape how these energies unfold. `
      }
      
      if (hiddenRune) {
        const hiddenMeaning = hiddenRune.isReversed ? hiddenRune.reversed : hiddenRune.upright
        interpretation += `Beneath the surface, ${hiddenRune.name} points toward ${hiddenMeaning.toLowerCase()}—what might be calling for deeper awareness or acknowledgment? `
      }
    }
    
    // Add rune relationship insights for nuanced understanding
    if (runeRelationships.conflicts.length > 0) {
      interpretation += `Notice how different runes interact: some energies may create tension or require balancing. `
      interpretation += `What does this dynamic reveal about the complexity of your situation? `
    }
    
    if (runeRelationships.harmonies.length > 0) {
      interpretation += `There are also harmonious connections between certain runes—where do you see alignment or support? `
    }
    
    // Add elemental guidance with exploratory language
    const elementalDesc = this.getElementalDescription(runes)
    const elementalGuidance = this.getElementalGuidance(runes)
    interpretation += `The ${elementalDesc} present in your spread could suggest ${elementalGuidance}, though how this manifests depends on your actions and awareness. `
    
    // Self-reflection prompts
    interpretation += `Take a moment to reflect: what insights arise when you connect these runic symbols to your personal experience? `
    interpretation += `Trust your intuition—the runes offer perspectives, but your inner wisdom knows what resonates most deeply. `
    
    // Empowering closing that acknowledges free will
    interpretation += `Remember, the runes illuminate possibilities, not fixed outcomes. You have the power to shape your path through conscious choices, awareness, and action. `
    interpretation += `May this guidance support you in finding clarity and empowerment as you navigate your journey.`
    
    return interpretation
  }
  
  private isSpecificDateQuestion(question: string): boolean {
    const lowerQuestion = question.toLowerCase()
    // Check for date patterns like "by November 30th", "by date", "by [month] [day]", "within X days/weeks/months"
    return /by\s+(?:november|december|january|february|march|april|may|june|july|august|september|october)\s+\d+|by\s+\d+|\d+\s+(?:days?|weeks?|months?)/i.test(lowerQuestion)
  }
  
  private isYesNoQuestion(question: string): boolean {
    const lowerQuestion = question.toLowerCase()
    return /^(will|can|should|is|are|do|does|did|would|could)\s+/i.test(lowerQuestion.trim()) ||
           /\?(?:\s*$)/.test(question) && /will|can|should/i.test(lowerQuestion)
  }
  
  private analyzeRuneRelationships(runes: (Rune & { isReversed: boolean; position: string })[]): {
    conflicts: string[]
    harmonies: string[]
    influences: string[]
  } {
    const conflicts: string[] = []
    const harmonies: string[] = []
    const influences: string[] = []
    
    // Analyze element conflicts and harmonies
    const elements = runes.map(r => r.element)
    const fireCount = elements.filter(e => e === 'fire').length
    const waterCount = elements.filter(e => e === 'water').length
    const airCount = elements.filter(e => e === 'air').length
    const earthCount = elements.filter(e => e === 'earth').length
    
    // Fire and Water can create tension
    if (fireCount > 0 && waterCount > 0) {
      conflicts.push('Fire and Water energies may create dynamic tension between passion and emotion')
    }
    
    // Air and Earth can balance
    if (airCount > 0 && earthCount > 0) {
      harmonies.push('Air and Earth create balance between thought and stability')
    }
    
    // Reversed runes may indicate conflicting energies
    const reversedCount = runes.filter(r => r.isReversed).length
    const uprightCount = runes.length - reversedCount
    
    if (reversedCount > uprightCount) {
      influences.push('Multiple reversed runes suggest internal reflection may be needed to transform challenges')
    }
    
    // Check for specific rune pairings
    const hasGebo = runes.some(r => r.name === 'Gebo' && !r.isReversed)
    const hasEhwaz = runes.some(r => r.name === 'Ehwaz' && !r.isReversed)
    if (hasGebo && hasEhwaz) {
      harmonies.push('Gebo and Ehwaz together emphasize partnership and balanced exchange')
    }
    
    const hasFehu = runes.some(r => r.name === 'Fehu')
    const hasNaudhiz = runes.some(r => r.name === 'Naudhiz' && !r.isReversed)
    if (hasFehu && hasNaudhiz) {
      influences.push('Fehu and Naudhiz together suggest wealth may come through necessity and constraint')
    }
    
    return { conflicts, harmonies, influences }
  }
  
  private analyzeQuestionTheme(question: string): {
    isPartnership: boolean
    isBusiness: boolean
    isRelationship: boolean
    isLove: boolean
    isCareer: boolean
    requiresEvaluation: boolean
    mentionedNames?: string[]
  } {
    const lowerQuestion = question.toLowerCase()
    
    // Extract mentioned names (simple heuristic - capitalize words after "is", "will", "going to be")
    const nameMatches = question.match(/(?:is|will|going to be)\s+([A-Z][a-z]+)/gi)
    const mentionedNames = nameMatches 
      ? nameMatches.map(m => m.match(/([A-Z][a-z]+)/)?.[0]).filter(Boolean) as string[]
      : undefined
    
    return {
      isPartnership: /partner|partnership|collaborat|work together|team up/i.test(lowerQuestion),
      isBusiness: /business|venture|enterprise|company|commercial|profit|financial|invest/i.test(lowerQuestion),
      isRelationship: /relationship|romance|love|dating|couple|marriage|significant other/i.test(lowerQuestion),
      isLove: /love|romance|heart|affection|feelings for/i.test(lowerQuestion),
      isCareer: /career|job|work|profession|occupation|employment/i.test(lowerQuestion),
      requiresEvaluation: /is.*good|will.*work|should.*|worth|wise|good idea|recommend/i.test(lowerQuestion),
      mentionedNames
    }
  }
  
  private getPositionContext(position: string): string {
    const contexts: Record<string, string> = {
      'Past': 'Reflecting on what has come before,',
      'Present': 'In your current circumstances,',
      'Future': 'Looking ahead,',
      'Situation': 'Regarding your current situation,',
      'Self': 'In relation to yourself,',
      'Environment': 'The surrounding circumstances reveal',
      'Challenge': 'The obstacles you face suggest',
      'Advice': 'The guidance being offered is',
      'Outcome': 'Concerning the likely outcome,',
      'Hidden': 'Beneath the surface,',
      'Hopes': 'Your hopes and aspirations show',
      'Fears': 'Your concerns and fears indicate',
      'Message': 'The message for you is'
    }
    return contexts[position] || 'In this position,'
  }

  private getElementalDescription(runes: (Rune & { isReversed: boolean; position: string })[]): string {
    const elements = runes.map(r => r.element)
    const fireCount = elements.filter(e => e === 'fire').length
    const earthCount = elements.filter(e => e === 'earth').length
    const airCount = elements.filter(e => e === 'air').length
    const waterCount = elements.filter(e => e === 'water').length

    if (fireCount > earthCount && fireCount > airCount && fireCount > waterCount) {
      return 'strong fire energy'
    } else if (earthCount > fireCount && earthCount > airCount && earthCount > waterCount) {
      return 'grounded earth energy'
    } else if (airCount > fireCount && airCount > earthCount && airCount > waterCount) {
      return 'intellectual air energy'
    } else if (waterCount > fireCount && waterCount > earthCount && waterCount > airCount) {
      return 'intuitive water energy'
    } else {
      return 'balanced elemental energy'
    }
  }

  private getElementalGuidance(runes: (Rune & { isReversed: boolean; position: string })[]): string {
    const elements = runes.map(r => r.element)
    const fireCount = elements.filter(e => e === 'fire').length
    const earthCount = elements.filter(e => e === 'earth').length
    const airCount = elements.filter(e => e === 'air').length
    const waterCount = elements.filter(e => e === 'water').length

    if (fireCount > earthCount && fireCount > airCount && fireCount > waterCount) {
      return 'passion and action will lead to success'
    } else if (earthCount > fireCount && earthCount > airCount && earthCount > waterCount) {
      return 'stability and grounding will bring results'
    } else if (airCount > fireCount && airCount > earthCount && airCount > waterCount) {
      return 'communication and intellect will guide your path'
    } else if (waterCount > fireCount && waterCount > earthCount && waterCount > airCount) {
      return 'intuition and emotion will provide clarity'
    } else {
      return 'balance and harmony will serve you well'
    }
  }

  private generateRecommendations(runes: (Rune & { isReversed: boolean; position: string })[], elementalBalance: RuneReading['elementalBalance'], timing: RuneReading['timing']): string[] {
    const recommendations = [
      'Study the meanings of the runes that appeared in your reading',
      'Pay attention to the timing indicated by the rune positions',
      'Work with the elemental energies shown in your spread',
      'Meditate on the reversed runes for deeper insights',
      'Use the runes as a daily guidance tool',
      'Honor the ancient wisdom of the Elder Futhark',
      'Trust your intuition when interpreting the runes',
      'Apply the runic wisdom to your daily decisions'
    ]

    return recommendations.sort(() => 0.5 - Math.random()).slice(0, 4)
  }

  private generateCoaching(runes: (Rune & { isReversed: boolean; position: string })[], elementalBalance: RuneReading['elementalBalance'], timing: RuneReading['timing']): RuneReading['coaching'] {
    const strengths = [
      `Natural ${elementalBalance.primary} energy for ${elementalBalance.primary === 'fire' ? 'passion and action' : elementalBalance.primary === 'earth' ? 'stability and grounding' : elementalBalance.primary === 'air' ? 'communication and intellect' : 'intuition and emotion'}`,
      `Strong connection to ${runes.find(r => r.position === 'Self')?.name || 'runic'} wisdom`,
      `Balanced ${elementalBalance.primary} and ${elementalBalance.secondary} elements for harmony`,
      `Receptive to ${runes.filter(r => r.isReversed).length > 0 ? 'transformation and growth' : 'direct guidance'}`
    ]

    const challenges = [
      'Learning to trust the ancient wisdom of the runes',
      'Developing patience with the timing shown in your spread',
      'Balancing different elemental influences in your life',
      'Integrating runic guidance with modern decision-making',
      'Maintaining focus on your spiritual path'
    ]

    const growthAreas = [
      'Deepening your understanding of runic symbolism',
      'Developing your intuitive connection to the runes',
      'Working with the elemental energies in your life',
      'Applying runic wisdom to daily challenges',
      'Building a personal relationship with the Elder Futhark'
    ]

    const affirmations = [
      'I trust the ancient wisdom of the runes',
      'I embrace the elemental energies that guide my path',
      'I develop my intuitive connection to runic symbols',
      'I apply runic wisdom to my daily decisions',
      'I honor the sacred tradition of the Elder Futhark',
      'I balance the different aspects of my being',
      'I grow through the challenges revealed by the runes'
    ]

    return {
      strengths,
      challenges,
      growthAreas,
      affirmations
    }
  }

  async getCoaching(question: string, reading: RuneReading): Promise<RunesCoaching | null> {
    const insights = [
      `Your ${reading.elementalBalance.primary} element dominance suggests ${reading.elementalBalance.primary === 'fire' ? 'passion and action' : reading.elementalBalance.primary === 'earth' ? 'stability and grounding' : reading.elementalBalance.primary === 'air' ? 'communication and intellect' : 'intuition and emotion'} are key to your situation.`,
      `The ${reading.runes.find(r => r.position === 'Advice')?.name || 'runic'} wisdom advises ${reading.runes.find(r => r.position === 'Advice')?.isReversed ? 'patience and reflection' : 'direct action'}.`,
      `Your ${reading.spreadName.toLowerCase()} reveals ${reading.timing.currentPhase.toLowerCase()}.`,
      `The ${reading.runes.filter(r => r.isReversed).length} reversed runes indicate areas requiring ${reading.runes.filter(r => r.isReversed).length > 0 ? 'transformation and growth' : 'direct guidance'}.`
    ]

    const recommendations = [
      'Study the specific runes that appeared in your reading',
      'Pay attention to the timing indicated by the rune positions',
      'Work with the elemental balance shown in your spread',
      'Meditate on the reversed runes for deeper insights',
      'Use the runes as a daily guidance tool'
    ]

    const followUpQuestions = [
      'How do you see the runic guidance manifesting in your daily life?',
      'What timing considerations from your rune reading are most relevant now?',
      'How can you develop the qualities indicated by the prominent runes?',
      'What elemental balance do you need to focus on currently?',
      'How does the ancient wisdom of the runes influence your decisions?'
    ]

    return {
      id: Date.now().toString(),
      timestamp: new Date(),
      question,
      response: `Based on your rune reading, the ${reading.spreadName.toLowerCase()} provides guidance for your question: "${question}". Your ${reading.elementalBalance.primary} element dominance suggests that ${reading.elementalBalance.primary === 'fire' ? 'passion and action' : reading.elementalBalance.primary === 'earth' ? 'stability and grounding' : reading.elementalBalance.primary === 'air' ? 'communication and intellect' : 'intuition and emotion'} are key to your situation. The ${reading.runes.find(r => r.position === 'Advice')?.name || 'runic'} wisdom advises ${reading.runes.find(r => r.position === 'Advice')?.isReversed ? 'patience and reflection' : 'direct action'}, while your ${reading.spreadName.toLowerCase()} reveals ${reading.timing.currentPhase.toLowerCase()}. To answer your specific question: You should ${reading.recommendations[0].toLowerCase()} and ${reading.recommendations[1].toLowerCase()}. Focus on developing your ${reading.elementalBalance.primary} energy and trust in the ancient wisdom of the Elder Futhark.`,
      insights,
      recommendations,
      followUpQuestions
    }
  }

  async saveReading(userId: string, reading: RuneReading): Promise<void> {
    await userSubdocSet(userId, 'rune-readings', reading.id, reading as unknown as Record<string, unknown>);
  }

  async getReading(userId: string, readingId: string): Promise<RuneReading | null> {
    const data = await userSubdocGet(userId, 'rune-readings', readingId);
    if (!data) return null;
    return data as unknown as RuneReading;
  }

  async saveCoaching(userId: string, coaching: RunesCoaching): Promise<void> {
    await userSubdocSet(userId, 'rune-coaching', coaching.id, coaching as unknown as Record<string, unknown>);
  }

  getAllRunes(): Rune[] {
    // Return all runes with default energy, timing, and keywords for reference display
    return this.elderFutharkRunes.map(rune => {
      // Get keywords using the private method
      let keywords: string[] = []
      try {
        keywords = this.getRuneKeywords(rune.name, false)
      } catch {
        keywords = ['wisdom', 'guidance', 'transformation']
      }
      
      return {
        ...rune,
        energy: 5, // Default energy for reference
        timing: 'Timing varies with context',
        keywords
      }
    })
  }

  getSystemStatus() {
    return {
      totalRunes: this.elderFutharkRunes.length,
      totalSpreads: this.runeSpreads.length,
      lifePhases: this.lifePhases.length,
      favorablePeriods: this.favorablePeriods.length,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    }
  }
}

export const runesIntelligence = new RunesIntelligence() 