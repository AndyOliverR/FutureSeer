/**
 * Bible Texts Resource for Bibliomancy
 * Public domain King James Version (KJV) Bible verses
 * Organized by themes and life areas for divination
 */

export interface BiblePassage {
  book: string
  chapter: number
  verse: number
  text: string
  themes: string[]
  lifeAreas: string[]
  testament: 'Old' | 'New'
}

export const BIBLE_PASSAGES: BiblePassage[] = [
  // Guidance & Wisdom
  {
    book: 'Proverbs',
    chapter: 3,
    verse: 5,
    text: 'Trust in the Lord with all thine heart; and lean not unto thine own understanding.',
    themes: ['guidance', 'wisdom', 'trust', 'faith'],
    lifeAreas: ['spirituality', 'decision-making'],
    testament: 'Old'
  },
  {
    book: 'Proverbs',
    chapter: 16,
    verse: 9,
    text: 'A man\'s heart deviseth his way: but the Lord directeth his steps.',
    themes: ['guidance', 'divine-plan', 'purpose'],
    lifeAreas: ['career', 'spirituality', 'life-path'],
    testament: 'Old'
  },
  {
    book: 'Isaiah',
    chapter: 30,
    verse: 21,
    text: 'And thine ears shall hear a word behind thee, saying, This is the way, walk ye in it, when ye turn to the right hand, and when ye turn to the left.',
    themes: ['guidance', 'direction', 'divine-voice'],
    lifeAreas: ['spirituality', 'decision-making'],
    testament: 'Old'
  },
  {
    book: 'James',
    chapter: 1,
    verse: 5,
    text: 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.',
    themes: ['wisdom', 'prayer', 'guidance'],
    lifeAreas: ['spirituality', 'decision-making'],
    testament: 'New'
  },

  // Love & Relationships
  {
    book: '1 Corinthians',
    chapter: 13,
    verse: 4,
    text: 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.',
    themes: ['love', 'relationships', 'patience', 'kindness'],
    lifeAreas: ['love', 'relationships'],
    testament: 'New'
  },
  {
    book: '1 Corinthians',
    chapter: 13,
    verse: 13,
    text: 'And now abideth faith, hope, charity, these three; but the greatest of these is charity.',
    themes: ['love', 'faith', 'hope'],
    lifeAreas: ['love', 'relationships', 'spirituality'],
    testament: 'New'
  },
  {
    book: 'Song of Solomon',
    chapter: 8,
    verse: 7,
    text: 'Many waters cannot quench love, neither can the floods drown it: if a man would give all the substance of his house for love, it would utterly be contemned.',
    themes: ['love', 'relationships', 'devotion'],
    lifeAreas: ['love', 'relationships'],
    testament: 'Old'
  },
  {
    book: 'Ephesians',
    chapter: 4,
    verse: 2,
    text: 'With all lowliness and meekness, with longsuffering, forbearing one another in love.',
    themes: ['love', 'relationships', 'patience', 'humility'],
    lifeAreas: ['love', 'relationships'],
    testament: 'New'
  },

  // Career & Work
  {
    book: 'Colossians',
    chapter: 3,
    verse: 23,
    text: 'And whatsoever ye do, do it heartily, as to the Lord, and not unto men.',
    themes: ['work', 'career', 'dedication', 'purpose'],
    lifeAreas: ['career', 'work'],
    testament: 'New'
  },
  {
    book: 'Proverbs',
    chapter: 22,
    verse: 29,
    text: 'Seest thou a man diligent in his business? he shall stand before kings; he shall not stand before mean men.',
    themes: ['work', 'career', 'diligence', 'success'],
    lifeAreas: ['career', 'work'],
    testament: 'Old'
  },
  {
    book: 'Ecclesiastes',
    chapter: 9,
    verse: 10,
    text: 'Whatsoever thy hand findeth to do, do it with thy might; for there is no work, nor device, nor knowledge, nor wisdom, in the grave, whither thou goest.',
    themes: ['work', 'career', 'effort', 'purpose'],
    lifeAreas: ['career', 'work'],
    testament: 'Old'
  },

  // Health & Healing
  {
    book: 'Jeremiah',
    chapter: 30,
    verse: 17,
    text: 'For I will restore health unto thee, and I will heal thee of thy wounds, saith the Lord.',
    themes: ['healing', 'health', 'restoration'],
    lifeAreas: ['health'],
    testament: 'Old'
  },
  {
    book: 'Proverbs',
    chapter: 17,
    verse: 22,
    text: 'A merry heart doeth good like a medicine: but a broken spirit drieth the bones.',
    themes: ['health', 'healing', 'joy', 'wellness'],
    lifeAreas: ['health'],
    testament: 'Old'
  },
  {
    book: '3 John',
    chapter: 1,
    verse: 2,
    text: 'Beloved, I wish above all things that thou mayest prosper and be in health, even as thy soul prospereth.',
    themes: ['health', 'prosperity', 'wellness'],
    lifeAreas: ['health', 'finances'],
    testament: 'New'
  },

  // Finances & Prosperity
  {
    book: 'Malachi',
    chapter: 3,
    verse: 10,
    text: 'Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the Lord of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.',
    themes: ['finances', 'prosperity', 'blessing', 'giving'],
    lifeAreas: ['finances'],
    testament: 'Old'
  },
  {
    book: 'Philippians',
    chapter: 4,
    verse: 19,
    text: 'But my God shall supply all your need according to his riches in glory by Christ Jesus.',
    themes: ['finances', 'prosperity', 'provision'],
    lifeAreas: ['finances'],
    testament: 'New'
  },
  {
    book: 'Proverbs',
    chapter: 10,
    verse: 22,
    text: 'The blessing of the Lord, it maketh rich, and he addeth no sorrow with it.',
    themes: ['finances', 'prosperity', 'blessing'],
    lifeAreas: ['finances'],
    testament: 'Old'
  },

  // Protection & Strength
  {
    book: 'Psalm',
    chapter: 91,
    verse: 1,
    text: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.',
    themes: ['protection', 'safety', 'divine-shelter'],
    lifeAreas: ['spirituality', 'protection'],
    testament: 'Old'
  },
  {
    book: 'Psalm',
    chapter: 23,
    verse: 4,
    text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
    themes: ['protection', 'comfort', 'courage', 'faith'],
    lifeAreas: ['spirituality', 'protection'],
    testament: 'Old'
  },
  {
    book: 'Isaiah',
    chapter: 41,
    verse: 10,
    text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.',
    themes: ['strength', 'protection', 'courage', 'support'],
    lifeAreas: ['spirituality', 'protection'],
    testament: 'Old'
  },
  {
    book: 'Philippians',
    chapter: 4,
    verse: 13,
    text: 'I can do all things through Christ which strengtheneth me.',
    themes: ['strength', 'power', 'ability', 'faith'],
    lifeAreas: ['spirituality', 'career'],
    testament: 'New'
  },

  // Peace & Comfort
  {
    book: 'John',
    chapter: 14,
    verse: 27,
    text: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.',
    themes: ['peace', 'comfort', 'calm', 'fearlessness'],
    lifeAreas: ['spirituality', 'mental-health'],
    testament: 'New'
  },
  {
    book: 'Philippians',
    chapter: 4,
    verse: 7,
    text: 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
    themes: ['peace', 'comfort', 'divine-peace'],
    lifeAreas: ['spirituality', 'mental-health'],
    testament: 'New'
  },
  {
    book: 'Isaiah',
    chapter: 26,
    verse: 3,
    text: 'Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.',
    themes: ['peace', 'trust', 'faith', 'calm'],
    lifeAreas: ['spirituality', 'mental-health'],
    testament: 'Old'
  },

  // Hope & Encouragement
  {
    book: 'Jeremiah',
    chapter: 29,
    verse: 11,
    text: 'For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.',
    themes: ['hope', 'encouragement', 'divine-plan', 'future'],
    lifeAreas: ['spirituality', 'life-path'],
    testament: 'Old'
  },
  {
    book: 'Romans',
    chapter: 8,
    verse: 28,
    text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
    themes: ['hope', 'encouragement', 'divine-plan', 'purpose'],
    lifeAreas: ['spirituality', 'life-path'],
    testament: 'New'
  },
  {
    book: 'Psalm',
    chapter: 30,
    verse: 5,
    text: 'For his anger endureth but a moment; in his favour is life: weeping may endure for a night, but joy cometh in the morning.',
    themes: ['hope', 'encouragement', 'joy', 'restoration'],
    lifeAreas: ['spirituality', 'mental-health'],
    testament: 'Old'
  },

  // Faith & Trust
  {
    book: 'Hebrews',
    chapter: 11,
    verse: 1,
    text: 'Now faith is the substance of things hoped for, the evidence of things not seen.',
    themes: ['faith', 'trust', 'hope', 'belief'],
    lifeAreas: ['spirituality'],
    testament: 'New'
  },
  {
    book: 'Mark',
    chapter: 11,
    verse: 24,
    text: 'Therefore I say unto you, What things soever ye desire, when ye pray, believe that ye receive them, and ye shall have them.',
    themes: ['faith', 'prayer', 'belief', 'manifestation'],
    lifeAreas: ['spirituality'],
    testament: 'New'
  },
  {
    book: 'Matthew',
    chapter: 17,
    verse: 20,
    text: 'And Jesus said unto them, Because of your unbelief: for verily I say unto you, If ye have faith as a grain of mustard seed, ye shall say unto this mountain, Remove hence to yonder place; and it shall remove; and nothing shall be impossible unto you.',
    themes: ['faith', 'power', 'possibility', 'belief'],
    lifeAreas: ['spirituality'],
    testament: 'New'
  },

  // Purpose & Calling
  {
    book: 'Ephesians',
    chapter: 2,
    verse: 10,
    text: 'For we are his workmanship, created in Christ Jesus unto good works, which God hath before ordained that we should walk in them.',
    themes: ['purpose', 'calling', 'divine-plan', 'destiny'],
    lifeAreas: ['spirituality', 'life-path', 'career'],
    testament: 'New'
  },
  {
    book: 'Jeremiah',
    chapter: 1,
    verse: 5,
    text: 'Before I formed thee in the belly I knew thee; and before thou camest forth out of the womb I sanctified thee, and I ordained thee a prophet unto the nations.',
    themes: ['purpose', 'calling', 'divine-plan', 'destiny'],
    lifeAreas: ['spirituality', 'life-path'],
    testament: 'Old'
  },
  {
    book: 'Romans',
    chapter: 12,
    verse: 6,
    text: 'Having then gifts differing according to the grace that is given to us, whether prophecy, let us prophesy according to the proportion of faith.',
    themes: ['purpose', 'gifts', 'talents', 'calling'],
    lifeAreas: ['spirituality', 'career', 'life-path'],
    testament: 'New'
  },

  // Forgiveness & Mercy
  {
    book: '1 John',
    chapter: 1,
    verse: 9,
    text: 'If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.',
    themes: ['forgiveness', 'mercy', 'cleansing', 'redemption'],
    lifeAreas: ['spirituality', 'relationships'],
    testament: 'New'
  },
  {
    book: 'Ephesians',
    chapter: 4,
    verse: 32,
    text: 'And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ\'s sake hath forgiven you.',
    themes: ['forgiveness', 'mercy', 'kindness', 'relationships'],
    lifeAreas: ['spirituality', 'relationships'],
    testament: 'New'
  },
  {
    book: 'Matthew',
    chapter: 6,
    verse: 14,
    text: 'For if ye forgive men their trespasses, your heavenly Father will also forgive you.',
    themes: ['forgiveness', 'mercy', 'relationships'],
    lifeAreas: ['spirituality', 'relationships'],
    testament: 'New'
  },

  // Gratitude & Thanksgiving
  {
    book: '1 Thessalonians',
    chapter: 5,
    verse: 18,
    text: 'In every thing give thanks: for this is the will of God in Christ Jesus concerning you.',
    themes: ['gratitude', 'thanksgiving', 'appreciation'],
    lifeAreas: ['spirituality'],
    testament: 'New'
  },
  {
    book: 'Psalm',
    chapter: 100,
    verse: 4,
    text: 'Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.',
    themes: ['gratitude', 'thanksgiving', 'praise', 'worship'],
    lifeAreas: ['spirituality'],
    testament: 'Old'
  },

  // Perseverance & Endurance
  {
    book: 'Galatians',
    chapter: 6,
    verse: 9,
    text: 'And let us not be weary in well doing: for in due season we shall reap, if we faint not.',
    themes: ['perseverance', 'endurance', 'patience', 'reward'],
    lifeAreas: ['career', 'spirituality', 'life-path'],
    testament: 'New'
  },
  {
    book: 'James',
    chapter: 1,
    verse: 12,
    text: 'Blessed is the man that endureth temptation: for when he is tried, he shall receive the crown of life, which the Lord hath promised to them that love him.',
    themes: ['perseverance', 'endurance', 'reward', 'blessing'],
    lifeAreas: ['spirituality', 'life-path'],
    testament: 'New'
  },
  {
    book: 'Hebrews',
    chapter: 12,
    verse: 1,
    text: 'Wherefore seeing we also are compassed about with so great a cloud of witnesses, let us lay aside every weight, and the sin which doth so easily beset us, and let us run with patience the race that is set before us.',
    themes: ['perseverance', 'endurance', 'patience', 'purpose'],
    lifeAreas: ['spirituality', 'life-path'],
    testament: 'New'
  }
]

/**
 * Get random Bible passage
 */
export function getRandomPassage(): BiblePassage {
  return BIBLE_PASSAGES[Math.floor(Math.random() * BIBLE_PASSAGES.length)]
}

/**
 * Get passages by theme
 */
export function getPassagesByTheme(theme: string): BiblePassage[] {
  return BIBLE_PASSAGES.filter(passage => 
    passage.themes.some(t => t.toLowerCase().includes(theme.toLowerCase()))
  )
}

/**
 * Get passages by life area
 */
export function getPassagesByLifeArea(lifeArea: string): BiblePassage[] {
  return BIBLE_PASSAGES.filter(passage => 
    passage.lifeAreas.some(area => area.toLowerCase().includes(lifeArea.toLowerCase()))
  )
}

/**
 * Get passages by testament
 */
export function getPassagesByTestament(testament: 'Old' | 'New'): BiblePassage[] {
  return BIBLE_PASSAGES.filter(passage => passage.testament === testament)
}

/**
 * Get multiple random passages
 */
export function getRandomPassages(count: number): BiblePassage[] {
  const shuffled = [...BIBLE_PASSAGES].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, BIBLE_PASSAGES.length))
}

/**
 * Format passage reference
 */
export function formatPassageReference(passage: BiblePassage): string {
  return `${passage.book} ${passage.chapter}:${passage.verse}`
}

