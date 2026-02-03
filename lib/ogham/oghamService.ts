/**
 * Ogham Service
 * Ogham transliteration and tree symbol database
 * Based on Celtic Ogham alphabet with all 20 basic letters (feda)
 */

export interface OghamLetter {
  unicode: string
  name: string
  irishName: string
  tree: string
  treeIrish: string
  meaning: string
  symbolism: string
  celticLore: string
  divinatoryMeaning: string
  personalTraits: string[]
  guidance: string[]
  color: string
  element: 'earth' | 'air' | 'fire' | 'water'
  season?: string
  planet?: string
  number?: number
}

/**
 * All 20 basic Ogham letters (feda) with complete information
 */
export const OGHAM_LETTERS: OghamLetter[] = [
  {
    unicode: '\u1680', // ᚁ
    name: 'Beith',
    irishName: 'Beithe',
    tree: 'Birch',
    treeIrish: 'Beith',
    meaning: 'Beginning, New Starts, Purification',
    symbolism: 'The birch tree represents new beginnings, purification, and protection. It is the first tree of the Ogham alphabet, symbolizing fresh starts and the ability to overcome difficulties.',
    celticLore: 'In Celtic mythology, birch was associated with the goddess Brigid and was used for protection and purification rituals. It was the first tree to grow after the last ice age, making it a symbol of resilience and new life.',
    divinatoryMeaning: 'A time for new beginnings, fresh starts, or purification. You may need to let go of the old to make way for the new. Protection and cleansing are indicated.',
    personalTraits: ['Pioneering spirit', 'Resilience', 'Adaptability', 'Fresh perspective', 'Protective nature'],
    guidance: ['Embrace new opportunities', 'Let go of past burdens', 'Seek purification and cleansing', 'Protect what is important to you', 'Start fresh with renewed energy'],
    color: 'Silver/White',
    element: 'air',
    season: 'Spring',
    planet: 'Mercury',
    number: 1
  },
  {
    unicode: '\u1681', // ᚂ
    name: 'Luis',
    irishName: 'Luis',
    tree: 'Rowan',
    treeIrish: 'Caorthann',
    meaning: 'Protection, Vision, Intuition',
    symbolism: 'The rowan tree is a powerful protective tree, especially against enchantment and negative energies. It enhances intuition and provides spiritual protection.',
    celticLore: 'Rowan was considered the most magical tree in Celtic tradition. It was planted near homes for protection and its berries were used in divination. The tree was sacred to the goddess Brigid.',
    divinatoryMeaning: 'Protection is needed or available. Trust your intuition and inner vision. You may need to guard against negative influences or enchantments.',
    personalTraits: ['Intuitive', 'Protective', 'Visionary', 'Spiritually aware', 'Discernment'],
    guidance: ['Trust your intuition', 'Seek protection when needed', 'Use your inner vision', 'Guard against negativity', 'Connect with spiritual guidance'],
    color: 'Red',
    element: 'fire',
    season: 'Spring',
    planet: 'Sun',
    number: 2
  },
  {
    unicode: '\u1682', // ᚃ
    name: 'Fearn',
    irishName: 'Fearn',
    tree: 'Alder',
    treeIrish: 'Fearnóg',
    meaning: 'Guidance, Protection, Strength',
    symbolism: 'The alder tree represents guidance, protection, and inner strength. It grows near water, symbolizing emotional depth and the flow of life.',
    celticLore: 'Alder was associated with Bran the Blessed in Welsh mythology. It was used for shields and protection, and its connection to water made it sacred to water deities.',
    divinatoryMeaning: 'Guidance is available to you. You have inner strength and protection. Trust in the flow of life and your emotional wisdom.',
    personalTraits: ['Strong', 'Protective', 'Guiding', 'Emotionally deep', 'Resilient'],
    guidance: ['Seek guidance from within', 'Trust your inner strength', 'Protect what matters', 'Flow with life\'s currents', 'Embrace emotional depth'],
    color: 'Crimson',
    element: 'water',
    season: 'Spring',
    planet: 'Venus',
    number: 3
  },
  {
    unicode: '\u1683', // ᚄ
    name: 'Sail',
    irishName: 'Sail',
    tree: 'Willow',
    treeIrish: 'Saileach',
    meaning: 'Intuition, Dreams, Feminine Power',
    symbolism: 'The willow tree is deeply connected to intuition, dreams, and the feminine aspect. It grows near water and represents emotional flow and psychic abilities.',
    celticLore: 'Willow was sacred to the moon goddess and was used in dream work and divination. Its connection to water made it a symbol of emotional healing and intuition.',
    divinatoryMeaning: 'Pay attention to your dreams and intuition. Feminine wisdom and emotional healing are available. Trust your inner knowing.',
    personalTraits: ['Intuitive', 'Dreamy', 'Emotionally aware', 'Feminine power', 'Psychic sensitivity'],
    guidance: ['Listen to your dreams', 'Trust your intuition', 'Embrace feminine wisdom', 'Heal emotional wounds', 'Connect with lunar energy'],
    color: 'Pale Green',
    element: 'water',
    season: 'Spring',
    planet: 'Moon',
    number: 4
  },
  {
    unicode: '\u1684', // ᚅ
    name: 'Nion',
    irishName: 'Nion',
    tree: 'Ash',
    treeIrish: 'Fuinnseog',
    meaning: 'Connection, World Tree, Unity',
    symbolism: 'The ash tree is the World Tree in Norse and Celtic mythology, connecting the three worlds. It represents connection, unity, and the link between heaven and earth.',
    celticLore: 'The ash was considered the World Tree, Yggdrasil in Norse mythology. It connects the underworld, middle world, and upper world, making it a symbol of unity and connection.',
    divinatoryMeaning: 'You are connected to all things. Unity and harmony are possible. The link between spiritual and material worlds is strong.',
    personalTraits: ['Connected', 'Unifying', 'Spiritual', 'Balanced', 'Harmonious'],
    guidance: ['Recognize your connections', 'Seek unity and harmony', 'Balance spiritual and material', 'Connect with the world tree', 'Find your place in the web of life'],
    color: 'Clear',
    element: 'air',
    season: 'Spring',
    planet: 'Sun',
    number: 5
  },
  {
    unicode: '\u1685', // ᚆ
    name: 'Uath',
    irishName: 'Uath',
    tree: 'Hawthorn',
    treeIrish: 'Sceach gheal',
    meaning: 'Purification, Protection, Boundaries',
    symbolism: 'The hawthorn tree represents purification, protection, and the setting of boundaries. It blooms in May and is associated with Beltane and the faerie realm.',
    celticLore: 'Hawthorn was sacred to the faeries and was used for protection and purification. It was considered unlucky to cut down a hawthorn tree, especially one growing alone.',
    divinatoryMeaning: 'Purification and protection are needed. Set clear boundaries. Be aware of the faerie realm and unseen influences.',
    personalTraits: ['Protective', 'Boundary-setting', 'Purifying', 'Faerie-touched', 'Aware'],
    guidance: ['Purify your space and energy', 'Set clear boundaries', 'Respect the unseen realms', 'Protect what is sacred', 'Honor the faerie folk'],
    color: 'White',
    element: 'fire',
    season: 'Spring',
    planet: 'Mars',
    number: 6
  },
  {
    unicode: '\u1686', // ᚇ
    name: 'Duir',
    irishName: 'Dair',
    tree: 'Oak',
    treeIrish: 'Dair',
    meaning: 'Strength, Endurance, Stability',
    symbolism: 'The oak tree is the king of the forest, representing strength, endurance, and stability. It is associated with the god of thunder and lightning.',
    celticLore: 'The oak was sacred to the thunder god and was the most revered tree. It represented strength, endurance, and the power of the gods. Kings were crowned under oak trees.',
    divinatoryMeaning: 'You have great strength and endurance. Stability and security are available. You are protected by powerful forces.',
    personalTraits: ['Strong', 'Enduring', 'Stable', 'Powerful', 'Protective'],
    guidance: ['Draw on your inner strength', 'Endure through challenges', 'Build stability', 'Connect with divine power', 'Stand firm in your truth'],
    color: 'Dark Brown',
    element: 'fire',
    season: 'Summer',
    planet: 'Jupiter',
    number: 7
  },
  {
    unicode: '\u1687', // ᚈ
    name: 'Tinne',
    irishName: 'Tinne',
    tree: 'Holly',
    treeIrish: 'Cuileann',
    meaning: 'Protection, Justice, Balance',
    symbolism: 'The holly tree represents protection, justice, and balance. It is evergreen, symbolizing eternal life and protection through the winter months.',
    celticLore: 'Holly was the tree of the warrior and was used for protection and justice. It was associated with the Holly King who rules the winter half of the year.',
    divinatoryMeaning: 'Protection and justice are available. Balance is needed. You may need to stand up for what is right.',
    personalTraits: ['Just', 'Protective', 'Balanced', 'Warrior spirit', 'Righteous'],
    guidance: ['Seek justice', 'Protect the innocent', 'Find balance', 'Stand up for what is right', 'Embrace your warrior spirit'],
    color: 'Dark Green',
    element: 'fire',
    season: 'Winter',
    planet: 'Mars',
    number: 8
  },
  {
    unicode: '\u1688', // ᚉ
    name: 'Coll',
    irishName: 'Coll',
    tree: 'Hazel',
    treeIrish: 'Coll',
    meaning: 'Wisdom, Knowledge, Inspiration',
    symbolism: 'The hazel tree is the tree of wisdom and knowledge. Its nuts were said to grant wisdom and inspiration, especially poetic inspiration.',
    celticLore: 'Hazel was sacred to the salmon of wisdom. Eating hazelnuts from the sacred hazel tree granted knowledge and poetic inspiration. It was associated with the god of poetry and wisdom.',
    divinatoryMeaning: 'Wisdom and knowledge are available. Inspiration may come to you. Seek learning and understanding.',
    personalTraits: ['Wise', 'Knowledgeable', 'Inspired', 'Poetic', 'Learned'],
    guidance: ['Seek wisdom', 'Pursue knowledge', 'Open to inspiration', 'Share your wisdom', 'Learn from experience'],
    color: 'Brown',
    element: 'air',
    season: 'Autumn',
    planet: 'Mercury',
    number: 9
  },
  {
    unicode: '\u1689', // ᚊ
    name: 'Quert',
    irishName: 'Ceirt',
    tree: 'Apple',
    treeIrish: 'Úll',
    meaning: 'Beauty, Love, Immortality',
    symbolism: 'The apple tree represents beauty, love, and immortality. It is the tree of the Otherworld and eternal youth.',
    celticLore: 'The apple was the fruit of the Otherworld, granting immortality and eternal youth. It was associated with the goddess of love and beauty, and the island of Avalon (Apple Isle).',
    divinatoryMeaning: 'Beauty and love are in your life. You may experience renewal or transformation. The promise of eternal youth and vitality is present.',
    personalTraits: ['Beautiful', 'Loving', 'Youthful', 'Renewing', 'Transforming'],
    guidance: ['Embrace beauty', 'Open to love', 'Seek renewal', 'Connect with the Otherworld', 'Find eternal youth within'],
    color: 'Green',
    element: 'water',
    season: 'Autumn',
    planet: 'Venus',
    number: 10
  },
  {
    unicode: '\u168A', // ᚊ
    name: 'Muin',
    irishName: 'Muin',
    tree: 'Vine',
    treeIrish: 'Fíonchaor',
    meaning: 'Prophetic Power, Release, Inner Work',
    symbolism: 'The vine represents prophetic power, release, and inner work. It is associated with prophecy, divination, and the release of inhibitions.',
    celticLore: 'The vine was associated with prophecy and divination. Wine made from grapes was used in ritual to access prophetic states and release inner wisdom.',
    divinatoryMeaning: 'Prophetic insights are available. You may need to release inhibitions or do inner work. Trust your prophetic abilities.',
    personalTraits: ['Prophetic', 'Releasing', 'Inner-focused', 'Intuitive', 'Transformative'],
    guidance: ['Trust your prophetic insights', 'Release what holds you back', 'Do inner work', 'Access deeper wisdom', 'Transform through release'],
    color: 'Variegated',
    element: 'water',
    season: 'Autumn',
    planet: 'Moon',
    number: 11
  },
  {
    unicode: '\u168B', // ᚋ
    name: 'Gort',
    irishName: 'Gort',
    tree: 'Ivy',
    treeIrish: 'Eidhneán',
    meaning: 'Search, Quest, Determination',
    symbolism: 'The ivy represents the search, quest, and determination. It clings and grows, symbolizing persistence and the ability to overcome obstacles.',
    celticLore: 'Ivy was associated with the quest for knowledge and spiritual growth. It represents determination and the ability to overcome obstacles through persistence.',
    divinatoryMeaning: 'You are on a quest or search. Determination and persistence will help you overcome obstacles. Keep searching for your truth.',
    personalTraits: ['Determined', 'Persistent', 'Questing', 'Searching', 'Resilient'],
    guidance: ['Continue your quest', 'Be determined', 'Persist through obstacles', 'Search for truth', 'Never give up'],
    color: 'Dark Green',
    element: 'water',
    season: 'Autumn',
    planet: 'Saturn',
    number: 12
  },
  {
    unicode: '\u168C', // ᚌ
    name: 'nGéadal',
    irishName: 'nGéadal',
    tree: 'Reed',
    treeIrish: 'Giolcach',
    meaning: 'Direct Action, Justice, Integrity',
    symbolism: 'The reed represents direct action, justice, and integrity. It grows straight and true, symbolizing honesty and directness.',
    celticLore: 'The reed was used for arrows and writing, symbolizing direct action and communication. It represents justice, integrity, and the ability to speak truth.',
    divinatoryMeaning: 'Direct action is needed. Justice and integrity are important. Speak your truth clearly and directly.',
    personalTraits: ['Direct', 'Just', 'Integrous', 'Honest', 'Truthful'],
    guidance: ['Take direct action', 'Seek justice', 'Maintain integrity', 'Speak truth', 'Be honest with yourself'],
    color: 'Grass Green',
    element: 'air',
    season: 'Autumn',
    planet: 'Mars',
    number: 13
  },
  {
    unicode: '\u168D', // ᚍ
    name: 'Straif',
    irishName: 'Straif',
    tree: 'Blackthorn',
    treeIrish: 'Draighean',
    meaning: 'Discipline, Authority, Control',
    symbolism: 'The blackthorn represents discipline, authority, and control. It is a protective but challenging tree, teaching through difficulty.',
    celticLore: 'Blackthorn was the tree of discipline and authority. It was used for protection but also represented the harsh lessons that lead to growth. It was associated with the dark side of the year.',
    divinatoryMeaning: 'Discipline and control are needed. You may face challenges that teach important lessons. Authority and protection are available.',
    personalTraits: ['Disciplined', 'Authoritative', 'Controlled', 'Protective', 'Challenging'],
    guidance: ['Embrace discipline', 'Exercise control', 'Learn from challenges', 'Use authority wisely', 'Protect through strength'],
    color: 'Black',
    element: 'fire',
    season: 'Winter',
    planet: 'Mars',
    number: 14
  },
  {
    unicode: '\u168E', // ᚎ
    name: 'Ruis',
    irishName: 'Ruis',
    tree: 'Elder',
    treeIrish: 'Trom',
    meaning: 'Endings, Transition, Rebirth',
    symbolism: 'The elder tree represents endings, transitions, and rebirth. It is associated with the cycle of death and rebirth and the transition between worlds.',
    celticLore: 'The elder was sacred to the crone goddess and was associated with death and rebirth. It was considered a gateway between worlds and was used in funeral rites.',
    divinatoryMeaning: 'An ending or transition is approaching. Rebirth follows endings. You are moving through a cycle of transformation.',
    personalTraits: ['Transitioning', 'Rebirthing', 'Transforming', 'Cyclical', 'Renewing'],
    guidance: ['Embrace endings', 'Welcome transitions', 'Trust in rebirth', 'Move through cycles', 'Transform through change'],
    color: 'Red',
    element: 'water',
    season: 'Winter',
    planet: 'Saturn',
    number: 15
  },
  {
    unicode: '\u168F', // ᚏ
    name: 'Ailm',
    irishName: 'Ailm',
    tree: 'Pine',
    treeIrish: 'Giúis',
    meaning: 'Insight, Clarity, Vision',
    symbolism: 'The pine tree represents insight, clarity, and vision. It is evergreen, symbolizing eternal wisdom and the ability to see clearly.',
    celticLore: 'Pine was associated with clarity and vision. It was used in purification rituals and was considered a tree of insight and spiritual clarity.',
    divinatoryMeaning: 'Insight and clarity are available. You may gain new vision or understanding. See things clearly and trust your insights.',
    personalTraits: ['Insightful', 'Clear', 'Visionary', 'Wise', 'Perceptive'],
    guidance: ['Seek insight', 'Gain clarity', 'Trust your vision', 'See clearly', 'Use your wisdom'],
    color: 'Pale Blue',
    element: 'air',
    season: 'Winter',
    planet: 'Jupiter',
    number: 16
  },
  {
    unicode: '\u1690', // ᚐ
    name: 'Onn',
    irishName: 'Onn',
    tree: 'Gorse',
    treeIrish: 'Aiteann',
    meaning: 'Collective Energy, Accumulation, Gathering',
    symbolism: 'The gorse represents collective energy, accumulation, and gathering. It blooms year-round, symbolizing constant energy and the gathering of resources.',
    celticLore: 'Gorse was associated with the gathering of energy and resources. It blooms throughout the year, representing constant vitality and the accumulation of power.',
    divinatoryMeaning: 'Collective energy is available. You may be gathering resources or accumulating power. Work with others for greater strength.',
    personalTraits: ['Energetic', 'Accumulating', 'Gathering', 'Collective', 'Vital'],
    guidance: ['Gather energy', 'Accumulate resources', 'Work collectively', 'Build power', 'Maintain vitality'],
    color: 'Yellow',
    element: 'fire',
    season: 'All Seasons',
    planet: 'Sun',
    number: 17
  },
  {
    unicode: '\u1691', // ᚑ
    name: 'Úr',
    irishName: 'Úr',
    tree: 'Heather',
    treeIrish: 'Fraoch',
    meaning: 'Dreams, Passion, Immortality',
    symbolism: 'The heather represents dreams, passion, and immortality. It covers the moors, symbolizing the connection between the physical and spiritual worlds.',
    celticLore: 'Heather was associated with dreams and the Otherworld. It was used in love magic and was considered a plant of passion and immortality.',
    divinatoryMeaning: 'Dreams and passion are in your life. You may experience deep love or spiritual connection. Immortality and eternal life are present.',
    personalTraits: ['Dreamy', 'Passionate', 'Immortal', 'Loving', 'Spiritual'],
    guidance: ['Follow your dreams', 'Embrace passion', 'Seek love', 'Connect with the Otherworld', 'Find immortality within'],
    color: 'Purple',
    element: 'water',
    season: 'Summer',
    planet: 'Venus',
    number: 18
  },
  {
    unicode: '\u1692', // ᚒ
    name: 'Eadhadh',
    irishName: 'Eadhadh',
    tree: 'Aspen',
    treeIrish: 'Crann creathach',
    meaning: 'Endurance, Shield, Protection',
    symbolism: 'The aspen represents endurance, shield, and protection. Its leaves tremble, symbolizing sensitivity and the ability to sense danger.',
    celticLore: 'Aspen was used for shields and protection. Its trembling leaves were said to sense danger, making it a tree of protection and endurance.',
    divinatoryMeaning: 'Endurance and protection are available. You may need to shield yourself or others. Your sensitivity helps you sense danger.',
    personalTraits: ['Enduring', 'Protective', 'Sensitive', 'Shielding', 'Alert'],
    guidance: ['Endure through challenges', 'Protect what matters', 'Use your sensitivity', 'Shield yourself', 'Stay alert'],
    color: 'Pale Yellow',
    element: 'air',
    season: 'Autumn',
    planet: 'Mercury',
    number: 19
  },
  {
    unicode: '\u1693', // ᚓ
    name: 'Iodhadh',
    irishName: 'Iodhadh',
    tree: 'Yew',
    treeIrish: 'Iúr',
    meaning: 'Death, Rebirth, Transformation',
    symbolism: 'The yew tree represents death, rebirth, and transformation. It is the longest-lived tree, symbolizing eternal life and the cycle of death and rebirth.',
    celticLore: 'The yew was the tree of death and rebirth. It was planted in graveyards and was considered a gateway between worlds. It represents eternal life and transformation.',
    divinatoryMeaning: 'Death and rebirth are part of your journey. Transformation is occurring. You are moving through cycles of change and renewal.',
    personalTraits: ['Transforming', 'Rebirthing', 'Eternal', 'Cyclical', 'Renewing'],
    guidance: ['Embrace transformation', 'Welcome rebirth', 'Move through cycles', 'Find eternal life', 'Transform through death'],
    color: 'Dark Green',
    element: 'water',
    season: 'Winter',
    planet: 'Saturn',
    number: 20
  }
]

/**
 * Ogham transliteration map: Latin to Ogham Unicode
 * Ogham Unicode range: U+1680 to U+169F
 * Note: Ogham has 20 basic letters, mapping A-T to the 20 feda
 */
const LATIN_TO_OGHAM: Record<string, string> = {
  'A': '\u1680', // Beith
  'B': '\u1681', // Luis
  'C': '\u1682', // Fearn
  'D': '\u1683', // Sail
  'E': '\u1684', // Nion
  'F': '\u1685', // Uath
  'G': '\u1686', // Duir
  'H': '\u1687', // Tinne
  'I': '\u1688', // Coll
  'J': '\u1688', // Coll (no J in Ogham)
  'K': '\u1689', // Quert
  'L': '\u168A', // Muin
  'M': '\u168B', // Gort
  'N': '\u168C', // nGéadal
  'O': '\u168D', // Straif
  'P': '\u168E', // Ruis
  'Q': '\u1689', // Quert
  'R': '\u168F', // Ailm
  'S': '\u1690', // Onn
  'T': '\u1691', // Úr
  'U': '\u1692', // Eadhadh
  'V': '\u1692', // Eadhadh (no V in Ogham)
  'W': '\u1692', // Eadhadh (no W in Ogham)
  'X': '\u1693', // Iodhadh
  'Y': '\u1693', // Iodhadh (no Y in Ogham)
  'Z': '\u1693'  // Iodhadh (no Z in Ogham)
}

/**
 * Transliterate Latin text to Ogham script
 */
export function transliterateToOgham(text: string): string {
  const upperText = text.toUpperCase().replace(/[^A-Z]/g, '')
  return upperText
    .split('')
    .map(char => LATIN_TO_OGHAM[char] || '')
    .join('')
}

/**
 * Get Ogham letter by name
 */
export function getOghamLetterByName(name: string): OghamLetter | undefined {
  return OGHAM_LETTERS.find(letter => 
    letter.name.toLowerCase() === name.toLowerCase() ||
    letter.irishName.toLowerCase() === name.toLowerCase()
  )
}

/**
 * Get Ogham letter by Unicode character
 */
export function getOghamLetterByUnicode(unicode: string): OghamLetter | undefined {
  return OGHAM_LETTERS.find(letter => letter.unicode === unicode)
}

/**
 * Get Ogham letter by tree name
 */
export function getOghamLetterByTree(treeName: string): OghamLetter | undefined {
  return OGHAM_LETTERS.find(letter => 
    letter.tree.toLowerCase() === treeName.toLowerCase() ||
    letter.treeIrish.toLowerCase() === treeName.toLowerCase()
  )
}

/**
 * Calculate birth tree based on birth date
 * Uses a simple day-of-year calculation
 */
export function calculateBirthTree(birthDate: string): OghamLetter {
  const date = new Date(birthDate)
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
  
  // Map day of year to Ogham tree (20 trees, ~18 days each)
  const treeIndex = Math.floor((dayOfYear - 1) / 18.25) % OGHAM_LETTERS.length
  return OGHAM_LETTERS[treeIndex]
}

/**
 * Get Ogham letters from a name
 */
export function getOghamLettersFromName(name: string): OghamLetter[] {
  const upperName = name.toUpperCase().replace(/[^A-Z]/g, '')
  const letters: OghamLetter[] = []
  
  for (const char of upperName) {
    const unicode = LATIN_TO_OGHAM[char]
    if (unicode) {
      const letter = getOghamLetterByUnicode(unicode)
      if (letter) {
        letters.push(letter)
      }
    }
  }
  
  return letters
}

/**
 * Get all Ogham letters
 */
export function getAllOghamLetters(): OghamLetter[] {
  return OGHAM_LETTERS
}

