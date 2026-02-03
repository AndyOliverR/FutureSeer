/**
 * Torah Texts Resource for Bibliomancy
 * Torah passages organized by themes and life areas for divination
 * Format: Book, Chapter, and Verse
 */

export interface TorahPassage {
  book: string
  chapter: number
  verse: number
  text: string
  hebrewText?: string // Original Hebrew text
  themes: string[]
  lifeAreas: string[]
}

export const TORAH_PASSAGES: TorahPassage[] = [
  // Guidance & Wisdom
  {
    book: 'Deuteronomy',
    chapter: 30,
    verse: 19,
    text: 'I call heaven and earth to witness against you this day: I have put before you life and death, blessing and curse. Choose life—if you and your offspring would live.',
    hebrewText: 'הַעִידֹתִי בָכֶם הַיּוֹם אֶת־הַשָּׁמַיִם וְאֶת־הָאָרֶץ הַחַיִּים וְהַמָּוֶת נָתַתִּי לְפָנֶיךָ הַבְּרָכָה וְהַקְּלָלָה וּבָחַרְתָּ בַּחַיִּים',
    themes: ['guidance', 'wisdom', 'choice', 'life'],
    lifeAreas: ['spirituality', 'decision-making']
  },
  {
    book: 'Proverbs',
    chapter: 3,
    verse: 5,
    text: 'Trust in the Lord with all your heart and do not rely on your own understanding.',
    hebrewText: 'בְּטַח אֶל־יְהוָה בְּכָל־לִבֶּךָ וְאֶל־בִּינָתְךָ אַל־תִּשָּׁעֵן',
    themes: ['guidance', 'wisdom', 'trust', 'faith'],
    lifeAreas: ['spirituality', 'decision-making']
  },
  {
    book: 'Proverbs',
    chapter: 16,
    verse: 9,
    text: 'A man\'s heart devises his way, but the Lord directs his steps.',
    hebrewText: 'לֵב אָדָם יְחַשֵּׁב דַּרְכּוֹ וַיהוָה יָכִין צַעֲדוֹ',
    themes: ['guidance', 'divine-plan', 'purpose', 'direction'],
    lifeAreas: ['career', 'spirituality', 'life-path']
  },
  {
    book: 'Isaiah',
    chapter: 30,
    verse: 21,
    text: 'And your ears shall hear a word behind you, saying, "This is the way, walk in it," when you turn to the right or when you turn to the left.',
    hebrewText: 'וְאָזְנֶיךָ תִּשְׁמַעְנָה דָּבָר מֵאַחֲרֶיךָ לֵאמֹר זֶה הַדֶּרֶךְ לְכוּ בוֹ כִּי תַאֲמִינוּ וְכִי תַשְׂמְאִילוּ',
    themes: ['guidance', 'direction', 'divine-voice', 'path'],
    lifeAreas: ['spirituality', 'decision-making']
  },

  // Love & Relationships
  {
    book: 'Leviticus',
    chapter: 19,
    verse: 18,
    text: 'You shall not take vengeance or bear a grudge against your kinsfolk. Love your neighbor as yourself: I am the Lord.',
    hebrewText: 'לֹא־תִקֹּם וְלֹא־תִטֹּר אֶת־בְּנֵי עַמֶּךָ וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ אֲנִי יְהוָה',
    themes: ['love', 'relationships', 'compassion', 'forgiveness'],
    lifeAreas: ['love', 'relationships']
  },
  {
    book: 'Song of Songs',
    chapter: 8,
    verse: 6,
    text: 'Set me as a seal upon your heart, as a seal upon your arm; for love is strong as death, passion fierce as the grave.',
    hebrewText: 'שִׂימֵנִי כַחוֹתָם עַל־לִבֶּךָ כַּחוֹתָם עַל־זְרוֹעֶךָ כִּי־עַזָּה כַמָּוֶת אַהֲבָה',
    themes: ['love', 'relationships', 'devotion', 'passion'],
    lifeAreas: ['love', 'relationships']
  },
  {
    book: 'Proverbs',
    chapter: 17,
    verse: 17,
    text: 'A friend loves at all times, and kinsfolk are born to share adversity.',
    hebrewText: 'בְּכָל־עֵת אֹהֵב הָרֵעַ וְאָח לְצָרָה יִוָּלֵד',
    themes: ['love', 'relationships', 'friendship', 'loyalty'],
    lifeAreas: ['love', 'relationships']
  },
  {
    book: 'Ecclesiastes',
    chapter: 4,
    verse: 9,
    text: 'Two are better than one, because they have a good reward for their toil.',
    themes: ['love', 'relationships', 'partnership', 'support'],
    lifeAreas: ['love', 'relationships']
  },

  // Career & Work
  {
    book: 'Proverbs',
    chapter: 22,
    verse: 29,
    text: 'Do you see a man skilled in his work? He will stand before kings; he will not stand before obscure men.',
    hebrewText: 'חָזִיתָ אִישׁ מָהִיר בִּמְלַאכְתּוֹ לִפְנֵי מְלָכִים יִתְיַצָּב בַּל־יִתְיַצֵּב לִפְנֵי חֲשֻׁכִּים',
    themes: ['work', 'career', 'diligence', 'success'],
    lifeAreas: ['career', 'work']
  },
  {
    book: 'Ecclesiastes',
    chapter: 9,
    verse: 10,
    text: 'Whatever your hand finds to do, do it with all your might; for there is no work or thought or knowledge or wisdom in Sheol, to which you are going.',
    hebrewText: 'כֹּל אֲשֶׁר תִּמְצָא יָדְךָ לַעֲשׂוֹת בְּכֹחֲךָ עֲשֵׂה כִּי אֵין מַעֲשֶׂה וְחֶשְׁבּוֹן וְדַעַת וְחָכְמָה בִּשְׁאוֹל אֲשֶׁר אַתָּה הֹלֵךְ שָׁמָּה',
    themes: ['work', 'career', 'effort', 'purpose'],
    lifeAreas: ['career', 'work']
  },
  {
    book: 'Proverbs',
    chapter: 12,
    verse: 11,
    text: 'He who tills his land will have plenty of bread, but he who follows worthless pursuits has no sense.',
    themes: ['work', 'career', 'diligence', 'prosperity'],
    lifeAreas: ['career', 'work']
  },
  {
    book: 'Exodus',
    chapter: 20,
    verse: 9,
    text: 'Six days you shall labor and do all your work.',
    themes: ['work', 'career', 'duty', 'balance'],
    lifeAreas: ['career', 'work']
  },

  // Health & Healing
  {
    book: 'Exodus',
    chapter: 15,
    verse: 26,
    text: 'I am the Lord who heals you.',
    themes: ['healing', 'health', 'divine-healing', 'faith'],
    lifeAreas: ['health']
  },
  {
    book: 'Proverbs',
    chapter: 17,
    verse: 22,
    text: 'A cheerful heart is good medicine, but a downcast spirit dries up the bones.',
    themes: ['health', 'healing', 'joy', 'wellness'],
    lifeAreas: ['health']
  },
  {
    book: 'Proverbs',
    chapter: 3,
    verse: 8,
    text: 'It will be healing to your flesh and refreshment to your bones.',
    themes: ['healing', 'health', 'wellness', 'restoration'],
    lifeAreas: ['health']
  },
  {
    book: 'Deuteronomy',
    chapter: 7,
    verse: 15,
    text: 'The Lord will take away from you all sickness, and none of the evil diseases of Egypt, which you knew, will he inflict upon you.',
    themes: ['healing', 'health', 'divine-protection', 'wellness'],
    lifeAreas: ['health']
  },

  // Finances & Prosperity
  {
    book: 'Deuteronomy',
    chapter: 8,
    verse: 18,
    text: 'You shall remember the Lord your God, for it is he who gives you power to get wealth.',
    themes: ['finances', 'prosperity', 'divine-blessing', 'gratitude'],
    lifeAreas: ['finances']
  },
  {
    book: 'Proverbs',
    chapter: 10,
    verse: 22,
    text: 'The blessing of the Lord makes rich, and he adds no sorrow with it.',
    themes: ['finances', 'prosperity', 'blessing', 'joy'],
    lifeAreas: ['finances']
  },
  {
    book: 'Malachi',
    chapter: 3,
    verse: 10,
    text: 'Bring the full tithe into the storehouse, so that there may be food in my house, and thus put me to the test, says the Lord of hosts; see if I will not open the windows of heaven for you and pour down for you an overflowing blessing.',
    themes: ['finances', 'prosperity', 'blessing', 'giving'],
    lifeAreas: ['finances']
  },
  {
    book: 'Proverbs',
    chapter: 11,
    verse: 25,
    text: 'A generous person will be enriched, and one who gives water will get water.',
    themes: ['finances', 'charity', 'generosity', 'prosperity'],
    lifeAreas: ['finances']
  },

  // Protection & Strength
  {
    book: 'Deuteronomy',
    chapter: 31,
    verse: 6,
    text: 'Be strong and bold; have no fear or dread of them, because it is the Lord your God who goes with you; he will not fail you or forsake you.',
    themes: ['strength', 'protection', 'courage', 'divine-presence'],
    lifeAreas: ['spirituality', 'protection']
  },
  {
    book: 'Psalm',
    chapter: 91,
    verse: 1,
    text: 'You who live in the shelter of the Most High, who abide in the shadow of the Almighty.',
    themes: ['protection', 'safety', 'divine-shelter', 'faith'],
    lifeAreas: ['spirituality', 'protection']
  },
  {
    book: 'Isaiah',
    chapter: 41,
    verse: 10,
    text: 'Do not fear, for I am with you; do not be afraid, for I am your God; I will strengthen you, I will help you, I will uphold you with my victorious right hand.',
    themes: ['strength', 'protection', 'courage', 'support'],
    lifeAreas: ['spirituality', 'protection']
  },
  {
    book: 'Exodus',
    chapter: 14,
    verse: 14,
    text: 'The Lord will fight for you, and you have only to keep still.',
    themes: ['protection', 'divine-support', 'faith', 'peace'],
    lifeAreas: ['spirituality', 'protection']
  },

  // Peace & Comfort
  {
    book: 'Numbers',
    chapter: 6,
    verse: 24,
    text: 'The Lord bless you and keep you; the Lord make his face to shine upon you, and be gracious to you.',
    themes: ['peace', 'comfort', 'blessing', 'divine-favor'],
    lifeAreas: ['spirituality', 'mental-health']
  },
  {
    book: 'Isaiah',
    chapter: 26,
    verse: 3,
    text: 'Those of steadfast mind you keep in peace—in peace because they trust in you.',
    themes: ['peace', 'trust', 'faith', 'calm'],
    lifeAreas: ['spirituality', 'mental-health']
  },
  {
    book: 'Psalm',
    chapter: 23,
    verse: 4,
    text: 'Even though I walk through the darkest valley, I fear no evil; for you are with me; your rod and your staff—they comfort me.',
    themes: ['peace', 'comfort', 'courage', 'divine-presence'],
    lifeAreas: ['spirituality', 'mental-health']
  },
  {
    book: 'Proverbs',
    chapter: 14,
    verse: 30,
    text: 'A tranquil mind gives life to the flesh, but passion makes the bones rot.',
    themes: ['peace', 'tranquility', 'health', 'wellness'],
    lifeAreas: ['spirituality', 'mental-health', 'health']
  },

  // Hope & Encouragement
  {
    book: 'Jeremiah',
    chapter: 29,
    verse: 11,
    text: 'For surely I know the plans I have for you, says the Lord, plans for your welfare and not for harm, to give you a future with hope.',
    themes: ['hope', 'encouragement', 'divine-plan', 'future'],
    lifeAreas: ['spirituality', 'life-path']
  },
  {
    book: 'Lamentations',
    chapter: 3,
    verse: 22,
    text: 'The steadfast love of the Lord never ceases, his mercies never come to an end.',
    themes: ['hope', 'encouragement', 'mercy', 'divine-love'],
    lifeAreas: ['spirituality', 'mental-health']
  },
  {
    book: 'Psalm',
    chapter: 30,
    verse: 5,
    text: 'For his anger is but for a moment; his favor is for a lifetime. Weeping may linger for the night, but joy comes with the morning.',
    themes: ['hope', 'encouragement', 'joy', 'restoration'],
    lifeAreas: ['spirituality', 'mental-health']
  },
  {
    book: 'Isaiah',
    chapter: 40,
    verse: 31,
    text: 'But those who wait for the Lord shall renew their strength, they shall mount up with wings like eagles, they shall run and not be weary, they shall walk and not faint.',
    themes: ['hope', 'encouragement', 'strength', 'renewal'],
    lifeAreas: ['spirituality', 'life-path']
  },

  // Faith & Trust
  {
    book: 'Proverbs',
    chapter: 3,
    verse: 5,
    text: 'Trust in the Lord with all your heart, and do not rely on your own insight.',
    themes: ['faith', 'trust', 'reliance', 'wisdom'],
    lifeAreas: ['spirituality']
  },
  {
    book: 'Habakkuk',
    chapter: 2,
    verse: 4,
    text: 'The righteous live by their faith.',
    themes: ['faith', 'righteousness', 'trust', 'life'],
    lifeAreas: ['spirituality']
  },
  {
    book: 'Psalm',
    chapter: 37,
    verse: 5,
    text: 'Commit your way to the Lord; trust in him, and he will act.',
    themes: ['faith', 'trust', 'commitment', 'divine-action'],
    lifeAreas: ['spirituality']
  },
  {
    book: 'Deuteronomy',
    chapter: 6,
    verse: 5,
    text: 'You shall love the Lord your God with all your heart, and with all your soul, and with all your might.',
    themes: ['faith', 'love', 'devotion', 'commitment'],
    lifeAreas: ['spirituality']
  },

  // Purpose & Calling
  {
    book: 'Jeremiah',
    chapter: 1,
    verse: 5,
    text: 'Before I formed you in the womb I knew you, and before you were born I consecrated you; I appointed you a prophet to the nations.',
    themes: ['purpose', 'calling', 'divine-plan', 'destiny'],
    lifeAreas: ['spirituality', 'life-path']
  },
  {
    book: 'Exodus',
    chapter: 3,
    verse: 10,
    text: 'So come, I will send you to Pharaoh to bring my people, the Israelites, out of Egypt.',
    themes: ['purpose', 'calling', 'mission', 'divine-commission'],
    lifeAreas: ['spirituality', 'life-path', 'career']
  },
  {
    book: 'Isaiah',
    chapter: 43,
    verse: 1,
    text: 'Do not fear, for I have redeemed you; I have called you by name, you are mine.',
    themes: ['purpose', 'calling', 'divine-love', 'identity'],
    lifeAreas: ['spirituality', 'life-path']
  },

  // Forgiveness & Mercy
  {
    book: 'Micah',
    chapter: 7,
    verse: 18,
    text: 'Who is a God like you, pardoning iniquity and passing over the transgression of the remnant of your possession? He does not retain his anger forever, because he delights in showing clemency.',
    themes: ['forgiveness', 'mercy', 'divine-mercy', 'compassion'],
    lifeAreas: ['spirituality', 'relationships']
  },
  {
    book: 'Psalm',
    chapter: 103,
    verse: 12,
    text: 'As far as the east is from the west, so far he removes our transgressions from us.',
    themes: ['forgiveness', 'mercy', 'redemption', 'divine-love'],
    lifeAreas: ['spirituality', 'relationships']
  },
  {
    book: 'Leviticus',
    chapter: 19,
    verse: 18,
    text: 'You shall not take vengeance or bear a grudge against any of your people, but you shall love your neighbor as yourself: I am the Lord.',
    themes: ['forgiveness', 'mercy', 'love', 'compassion'],
    lifeAreas: ['spirituality', 'relationships']
  },

  // Gratitude & Thanksgiving
  {
    book: 'Psalm',
    chapter: 100,
    verse: 4,
    text: 'Enter his gates with thanksgiving, and his courts with praise. Give thanks to him, bless his name.',
    themes: ['gratitude', 'thanksgiving', 'praise', 'worship'],
    lifeAreas: ['spirituality']
  },
  {
    book: 'Deuteronomy',
    chapter: 8,
    verse: 10,
    text: 'You shall eat your fill and bless the Lord your God for the good land that he has given you.',
    themes: ['gratitude', 'thanksgiving', 'blessing', 'appreciation'],
    lifeAreas: ['spirituality', 'finances']
  },
  {
    book: 'Psalm',
    chapter: 107,
    verse: 1,
    text: 'O give thanks to the Lord, for he is good; for his steadfast love endures forever.',
    themes: ['gratitude', 'thanksgiving', 'divine-love', 'praise'],
    lifeAreas: ['spirituality']
  },

  // Perseverance & Endurance
  {
    book: 'Proverbs',
    chapter: 24,
    verse: 16,
    text: 'For the righteous fall seven times and rise again, but the wicked are overthrown by calamity.',
    themes: ['perseverance', 'endurance', 'resilience', 'righteousness'],
    lifeAreas: ['spirituality', 'life-path']
  },
  {
    book: 'Isaiah',
    chapter: 40,
    verse: 31,
    text: 'But those who wait for the Lord shall renew their strength, they shall mount up with wings like eagles, they shall run and not be weary, they shall walk and not faint.',
    themes: ['perseverance', 'endurance', 'patience', 'renewal'],
    lifeAreas: ['spirituality', 'life-path']
  },
  {
    book: 'Proverbs',
    chapter: 3,
    verse: 11,
    text: 'My child, do not despise the Lord\'s discipline or be weary of his reproof.',
    themes: ['perseverance', 'endurance', 'discipline', 'growth'],
    lifeAreas: ['spirituality', 'life-path']
  }
]

/**
 * Get random Torah passage
 */
export function getRandomPassage(): TorahPassage {
  return TORAH_PASSAGES[Math.floor(Math.random() * TORAH_PASSAGES.length)]
}

/**
 * Get passages by theme
 */
export function getPassagesByTheme(theme: string): TorahPassage[] {
  return TORAH_PASSAGES.filter(passage => 
    passage.themes.some(t => t.toLowerCase().includes(theme.toLowerCase()))
  )
}

/**
 * Get passages by life area
 */
export function getPassagesByLifeArea(lifeArea: string): TorahPassage[] {
  return TORAH_PASSAGES.filter(passage => 
    passage.lifeAreas.some(area => area.toLowerCase().includes(lifeArea.toLowerCase()))
  )
}

/**
 * Get multiple random passages
 */
export function getRandomPassages(count: number): TorahPassage[] {
  const shuffled = [...TORAH_PASSAGES].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, TORAH_PASSAGES.length))
}

/**
 * Format passage reference
 */
export function formatPassageReference(passage: TorahPassage): string {
  return `${passage.book} ${passage.chapter}:${passage.verse}`
}

