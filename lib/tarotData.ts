// Comprehensive Tarot Card Data
// Based on Rider-Waite-Smith Tarot deck with detailed interpretations

export interface TarotCard {
  name: string
  suite: string
  image: string
  description: string
  interpretation: string
  keywords?: string[]
  element?: string
  number?: number
}

export interface TarotSpread {
  name: string
  description: string
  positions: string[]
  cardCount: number
}

export interface TarotReading {
  id: string
  timestamp: Date
  question: string
  spreadType: string
  cards: TarotCard[]
  interpretation: string
}

// Major Arcana Cards (22 cards)
export const majorArcana: TarotCard[] = [
  {
    name: "The Fool",
    suite: "major",
    image: "deck/RWS_Tarot_00_Fool.jpg",
    description: "With light step, as if earth and its trammels had little power to restrain him, a young man in gorgeous vestments pauses at the brink of a precipice among the great heights of the world; he surveys the blue distance before him-its expanse of sky rather than the prospect below.",
    interpretation: "Folly, mania, extravagance, intoxication, delirium, frenzy, bewrayment. Reversed: Negligence, absence, distribution, carelessness, apathy, nullity, vanity.",
    keywords: ["New Beginnings", "Innocence", "Spontaneity", "Adventure"],
    element: "Air",
    number: 0
  },
  {
    name: "The Magician",
    suite: "major", 
    image: "deck/RWS_Tarot_01_Magician.jpg",
    description: "A youthful figure in the robe of a magician, having the countenance of divine Apollo, with smile of confidence and shining eyes. Above his head is the mysterious sign of the Holy Spirit, the sign of life, like an endless cord, forming the figure 8 in a horizontal position.",
    interpretation: "Skill, diplomacy, address, subtlety; sickness, pain, loss, disaster, snares of enemies; self-confidence, will; the Querent, if male. Reversed: Physician, Magus, mental disease, disgrace, disquiet.",
    keywords: ["Willpower", "Manifestation", "Skill", "Concentration"],
    element: "Air",
    number: 1
  },
  {
    name: "High Priestess",
    suite: "major",
    image: "deck/RWS_Tarot_02_High_Priestess.jpg", 
    description: "She has the lunar crescent at her feet, a horned diadem on her head, with a globe in the middle place, and a large solar cross on her breast. The scroll in her hands is inscribed with the word Tora, signifying the Greater Law, the Secret Law and the second sense of the Word.",
    interpretation: "Secrets, mystery, the future as yet unrevealed; the woman who interests the Querent, if male; the Querent herself, if female; silence, tenacity; mystery, wisdom, science. Reversed: Passion, moral or physical ardour, conceit, surface knowledge.",
    keywords: ["Intuition", "Mystery", "Wisdom", "Subconscious"],
    element: "Water",
    number: 2
  },
  {
    name: "Empress",
    suite: "major",
    image: "deck/RWS_Tarot_03_Empress.jpg",
    description: "A stately figure, seated, having rich vestments and royal aspect, as of a daughter of heaven and earth. Her diadem is of twelve stars, gathered in a cluster. The symbol of Venus is on the shield which rests near her.",
    interpretation: "Fruitfulness, action, initiative, length of days; the unknown, clandestine; also difficulty, doubt, ignorance. Reversed: Light, truth, the unravelling of involved matters, public rejoicings; according to another reading, vacillation.",
    keywords: ["Fertility", "Abundance", "Nature", "Motherhood"],
    element: "Earth",
    number: 3
  },
  {
    name: "Emperor",
    suite: "major",
    image: "deck/RWS_Tarot_04_Emperor.jpg",
    description: "He has a form of the Crux ansata for his sceptre and a globe in his left hand. He is a crowned monarch--commanding, stately, seated on a throne, the arms of which axe fronted by rams' heads.",
    interpretation: "Stability, power, protection, realization; a great person; aid, reason, conviction; also authority and will. Reversed: Benevolence, compassion, credit; also confusion to enemies, obstruction, immaturity.",
    keywords: ["Authority", "Structure", "Leadership", "Control"],
    element: "Fire",
    number: 4
  },
  {
    name: "Hierophant",
    suite: "major",
    image: "deck/RWS_Tarot_05_Hierophant.jpg",
    description: "He wears the triple crown and is seated between two pillars, but they are not those of the Temple which is guarded by the High Priestess. In his left hand he holds a sceptre terminating in the triple cross.",
    interpretation: "Marriage, alliance, captivity, servitude; by another account, mercy and goodness; inspiration; the man to whom the Querent has recourse. Reversed: Society, good understanding, concord, overkindness, weakness.",
    keywords: ["Tradition", "Spirituality", "Guidance", "Conformity"],
    element: "Earth",
    number: 5
  },
  {
    name: "The Lovers",
    suite: "major",
    image: "deck/RWS_Tarot_06_Lovers.jpg",
    description: "The sun shines in the zenith, and beneath is a great winged figure with arms extended, pouring down influences. In the foreground are two human figures, male and female, unveiled before each other.",
    interpretation: "Attraction, love, beauty, trials overcome. Reversed: Failure, foolish designs. Another account speaks of marriage frustrated and contrarieties of all kinds.",
    keywords: ["Love", "Relationships", "Choices", "Harmony"],
    element: "Air",
    number: 6
  },
  {
    name: "Chariot",
    suite: "major",
    image: "deck/RWS_Tarot_07_Chariot.jpg",
    description: "An erect and princely figure carrying a drawn sword and corresponding, broadly speaking, to the traditional description. On the shoulders of the victorious hero are supposed to be the Urim and Thummim.",
    interpretation: "Succour, providence also war, triumph, presumption, vengeance, trouble. Reversed: Riot, quarrel, dispute, litigation, defeat.",
    keywords: ["Willpower", "Victory", "Determination", "Control"],
    element: "Water",
    number: 7
  },
  {
    name: "Strength",
    suite: "major",
    image: "deck/RWS_Tarot_08_Strength.jpg",
    description: "A woman, over whose head there broods the same symbol of life which we have seen in the card of the Magician, is closing the jaws of a lion. The only point in which this design differs from the conventional presentations is that her beneficent fortitude has already subdued the lion.",
    interpretation: "Power, energy, action, courage, magnanimity; also complete success and honours. Reversed: Despotism, abuse if power, weakness, discord, sometimes even disgrace.",
    keywords: ["Inner Strength", "Courage", "Patience", "Compassion"],
    element: "Fire",
    number: 8
  },
  {
    name: "Hermit",
    suite: "major",
    image: "deck/RWS_Tarot_09_Hermit.jpg",
    description: "The variation from the conventional models in this card is only that the lamp is not enveloped partially in the mantle of its bearer, who blends the idea of the Ancient of Days with the Light of the World It is a star which shines in the lantern.",
    interpretation: "Prudence, circumspection; also and especially treason, dissimulation, roguery, corruption. Reversed: Concealment, disguise, policy, fear, unreasoned caution.",
    keywords: ["Guidance", "Wisdom", "Soul-searching", "Introspection"],
    element: "Earth",
    number: 9
  },
  {
    name: "Wheel of Fortune",
    suite: "major",
    image: "deck/RWS_Tarot_10_Wheel_of_Fortune.jpg",
    description: "In this symbol I have again followed the reconstruction of Eliphas Levi, who has furnished several variants. It is legitimate--as I have intimated--to use Egyptian symbolism when this serves our purpose.",
    interpretation: "Destiny, fortune, success, elevation, luck, felicity. Reversed: Increase, abundance, superfluity.",
    keywords: ["Change", "Cycles", "Fortune", "Destiny"],
    element: "Fire",
    number: 10
  },
  {
    name: "Justice",
    suite: "major",
    image: "deck/RWS_Tarot_11_Justice.jpg",
    description: "As this card follows the traditional symbolism and carries above all its obvious meanings, there is little to say regarding it outside the few considerations collected in the first part.",
    interpretation: "Equity, rightness, probity, executive; triumph of the deserving side in law. Reversed: Law in all its departments, legal complications, bigotry, bias, excessive severity.",
    keywords: ["Justice", "Fairness", "Truth", "Balance"],
    element: "Air",
    number: 11
  },
  {
    name: "Hanged Man",
    suite: "major",
    image: "deck/RWS_Tarot_12_Hanged_Man.jpg",
    description: "The gallows from which he is suspended forms a Tau cross, while the figure--from the position of the legs--forms a fylfot cross. There is a nimbus about the head of the seeming martyr.",
    interpretation: "Wisdom, circumspection, discernment, trials, sacrifice, intuition, divination, prophecy. Reversed: Selfishness, the crowd, body politic.",
    keywords: ["Sacrifice", "Waiting", "Surrender", "New Perspective"],
    element: "Water",
    number: 12
  },
  {
    name: "Death",
    suite: "major",
    image: "deck/RWS_Tarot_13_Death.jpg",
    description: "The veil or mask of life is perpetuated in change, transformation and passage from lower to higher, and this is more fitly represented in the rectified Tarot by one of the apocalyptic visions than by the crude notion of the reaping skeleton.",
    interpretation: "End, mortality, destruction, corruption also, for a man, the loss of a benefactor for a woman, many contrarieties; for a maid, failure of marriage projects. Reversed: Inertia, sleep, lethargy, petrifaction, somnambulism; hope destroyed.",
    keywords: ["Transformation", "Endings", "Change", "Rebirth"],
    element: "Water",
    number: 13
  },
  {
    name: "Temperance",
    suite: "major",
    image: "deck/RWS_Tarot_14_Temperance.jpg",
    description: "A winged angel, with the sign of the sun upon his forehead and on his breast the square and triangle of the septenary. I speak of him in the masculine sense, but the figure is neither male nor female.",
    interpretation: "Economy, moderation, frugality, management, accommodation. Reversed: Things connected with churches, religions, sects, the priesthood, sometimes even the priest who will marry the Querent; also disunion, unfortunate combinations, competing interests.",
    keywords: ["Balance", "Moderation", "Patience", "Harmony"],
    element: "Fire",
    number: 14
  },
  {
    name: "Devil",
    suite: "major",
    image: "deck/RWS_Tarot_15_Devil.jpg",
    description: "The Horned Goat of Mendes, with wings like those of a bat, is standing on an altar. At the pit of the stomach there is the sign of Mercury. The right hand is upraised and extended, being the reverse of that benediction which is given by the Hierophant.",
    interpretation: "Ravage, violence, vehemence, extraordinary efforts, force, fatality; that which is predestined but is not for this reason evil. Reversed: Evil fatality, weakness, pettiness, blindness.",
    keywords: ["Temptation", "Bondage", "Materialism", "Ignorance"],
    element: "Earth",
    number: 15
  },
  {
    name: "Tower",
    suite: "major",
    image: "deck/RWS_Tarot_16_Tower.jpg",
    description: "Occult explanations attached to this card are meagre and mostly disconcerting. It is idle to indicate that it depicts min in all its aspects, because it bears this evidence on the surface.",
    interpretation: "Misery, distress, indigence, adversity, calamity, disgrace, deception, ruin. It is a card in particular of unforeseen catastrophe. Reversed: According to one account, the same in a lesser degree also oppression, imprisonment, tyranny.",
    keywords: ["Sudden Change", "Revelation", "Disaster", "Liberation"],
    element: "Fire",
    number: 16
  },
  {
    name: "Star",
    suite: "major",
    image: "deck/RWS_Tarot_17_Star.jpg",
    description: "A great, radiant star of eight rays, surrounded by seven lesser stars--also of eight rays. The female figure in the foreground is entirely naked. Her left knee is on the land and her right foot upon the water.",
    interpretation: "Loss, theft, privation, abandonment; another reading says-hope and bright prospects, Reversed: Arrogance, haughtiness, impotence.",
    keywords: ["Hope", "Inspiration", "Spirituality", "Guidance"],
    element: "Air",
    number: 17
  },
  {
    name: "Moon",
    suite: "major",
    image: "deck/RWS_Tarot_18_Moon.jpg",
    description: "The distinction between this card and some of the conventional types is that the moon is increasing on what is called the side of mercy, to the right of the observer. It has sixteen chief and sixteen secondary rays.",
    interpretation: "Hidden enemies, danger, calumny, darkness, terror, deception, occult forces, error. Reversed: Instability, inconstancy, silence, lesser degrees of deception and error.",
    keywords: ["Illusion", "Fear", "Anxiety", "Subconscious"],
    element: "Water",
    number: 18
  },
  {
    name: "Sun",
    suite: "major",
    image: "deck/RWS_Tarot_19_Sun.jpg",
    description: "The naked child mounted on a white horse and displaying a red standard has been mentioned already as the better symbolism connected with this card. It is the destiny of the Supernatural East and the great and holy light.",
    interpretation: "Material happiness, fortunate marriage, contentment. Reversed: The same in a lesser sense.",
    keywords: ["Joy", "Success", "Vitality", "Optimism"],
    element: "Fire",
    number: 19
  },
  {
    name: "Judgement",
    suite: "major",
    image: "deck/RWS_Tarot_20_Judgement.jpg",
    description: "I have said that this symbol is essentially invariable in all Tarot sets, or at least the variations do not alter its character. The great angel is here encompassed by clouds, but he blows his bannered trumpet.",
    interpretation: "Change of position, renewal, outcome. Another account specifies total loss though lawsuit. Reversed: Weakness, pusillanimity, simplicity; also deliberation, decision, sentence.",
    keywords: ["Judgement", "Rebirth", "Absolution", "Awakening"],
    element: "Fire",
    number: 20
  },
  {
    name: "World",
    suite: "major",
    image: "deck/RWS_Tarot_21_World.jpg",
    description: "As this final message of the Major Trumps is unchanged--and indeed unchangeable--in respect of its design, it has been partly described already regarding its deeper sense. It represents also the perfection and end of the Cosmos.",
    interpretation: "Assured success, recompense, voyage, route, emigration, flight, change of place. Reversed: Inertia, fixity, stagnation, permanence.",
    keywords: ["Completion", "Achievement", "Fulfillment", "Success"],
    element: "Earth",
    number: 21
  }
]

// Tarot Spreads
export const tarotSpreads: TarotSpread[] = [
  {
    name: "Single Card",
    description: "A simple one-card reading for daily guidance or quick insight",
    positions: ["Guidance"],
    cardCount: 1
  },
  {
    name: "Three Card",
    description: "Past, Present, Future spread for understanding your journey",
    positions: ["Past", "Present", "Future"],
    cardCount: 3
  },
  {
    name: "Five Card",
    description: "A comprehensive spread covering different aspects of your situation",
    positions: ["Situation", "Challenge", "Past Influence", "Future Influence", "Outcome"],
    cardCount: 5
  },
  {
    name: "Celtic Cross",
    description: "The most comprehensive spread for deep insight into your question",
    positions: ["Current Situation", "Challenge", "Distant Past", "Recent Past", "Possible Future", "Immediate Future", "Your Approach", "External Influences", "Hopes & Fears", "Final Outcome"],
    cardCount: 10
  },
  {
    name: "Past Present Future",
    description: "Understanding your timeline and how events connect",
    positions: ["Past", "Present", "Future"],
    cardCount: 3
  }
]

// Utility functions
export function getRandomCard(): TarotCard {
  const allCards = [...majorArcana] // Add minor arcana when available
  return allCards[Math.floor(Math.random() * allCards.length)]
}

export function getRandomCards(count: number): TarotCard[] {
  const cards: TarotCard[] = []
  const usedIndices = new Set<number>()
  
  while (cards.length < count) {
    const randomIndex = Math.floor(Math.random() * majorArcana.length)
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex)
      cards.push(majorArcana[randomIndex])
    }
  }
  
  return cards
}

export function getSpreadByName(name: string): TarotSpread | undefined {
  return tarotSpreads.find(spread => spread.name === name)
}

export function createTarotReading(question: string, spreadType: string): TarotReading {
  const spread = getSpreadByName(spreadType)
  if (!spread) {
    throw new Error(`Spread "${spreadType}" not found`)
  }
  
  const cards = getRandomCards(spread.cardCount)
  
  return {
    id: Date.now().toString(),
    timestamp: new Date(),
    question,
    spreadType,
    cards,
    interpretation: `Your ${spreadType} reading reveals insights about: ${question}`
  }
}
