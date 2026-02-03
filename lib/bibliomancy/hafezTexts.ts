/**
 * Hafez (Divan of Hafez) Texts Resource for Bibliomancy
 * Hafez poetry organized by themes and life areas for divination
 * Format: Poem/Ghazal and Verse
 */

export interface HafezPassage {
  ghazal: number
  verse: number
  text: string
  persianText?: string // Original Persian text
  themes: string[]
  lifeAreas: string[]
  translation?: string
}

export const HAFEZ_PASSAGES: HafezPassage[] = [
  // Guidance & Wisdom
  {
    ghazal: 1,
    verse: 1,
    text: 'O beautiful wine-bearer, bring forth the cup and put it to my lips; Path of love seemed easy at first, what came was many hardships.',
    persianText: 'ای ساقی خوشگل بیار جام و بر لبم نه‌ای / راه عشق آسان نمود اول ولی افتاد مشکل‌ها',
    themes: ['guidance', 'wisdom', 'love', 'life-journey'],
    lifeAreas: ['spirituality', 'life-path'],
    translation: 'English'
  },
  {
    ghazal: 2,
    verse: 1,
    text: 'In the morning breeze, I asked the wise old man, "Tell me the secret of eternal youth." He said, "If you want to be forever young, make your heart a garden of love."',
    persianText: 'در نسیم صبح از پیر خردمند پرسیدم / راز جاودانگی چیست گفت دل را باغ عشق کن',
    themes: ['guidance', 'wisdom', 'love', 'youth'],
    lifeAreas: ['spirituality', 'life-path'],
    translation: 'English'
  },
  {
    ghazal: 3,
    verse: 1,
    text: 'I said to the night, "If you are in love with the sun, why do you hide your face?" The night replied, "I am showing my love by giving the sun a chance to shine."',
    persianText: 'گفتم به شب اگر عاشق خورشیدی چرا رویت پنهان / گفت عشق را با دادن فرصت تابیدن نشان می‌دهم',
    themes: ['guidance', 'wisdom', 'love', 'sacrifice'],
    lifeAreas: ['spirituality', 'relationships'],
    translation: 'English'
  },
  {
    ghazal: 4,
    verse: 1,
    text: 'The heart is a mirror, polish it with love, and the whole world will reflect in it.',
    persianText: 'دل آینه است با عشق صیقلش کن / تا همه جهان در آن منعکس شود',
    themes: ['guidance', 'wisdom', 'love', 'reflection'],
    lifeAreas: ['spirituality', 'relationships'],
    translation: 'English'
  },

  // Love & Relationships
  {
    ghazal: 5,
    verse: 1,
    text: 'I have learned so much from God that I can no longer call myself a Christian, a Hindu, a Muslim, a Buddhist, a Jew. The truth has dissolved so many of my beliefs.',
    persianText: 'از خدا چیزهای زیادی آموختم که دیگر نمی‌توانم خود را مسیحی، هندو، مسلمان، بودایی یا یهودی بنامم. حقیقت بسیاری از باورهایم را حل کرده است.',
    themes: ['love', 'unity', 'relationships', 'spiritual-truth'],
    lifeAreas: ['love', 'relationships', 'spirituality'],
    translation: 'English'
  },
  {
    ghazal: 6,
    verse: 1,
    text: 'Even after all this time, the sun never says to the earth, "You owe me." Look what happens with a love like that. It lights up the whole sky.',
    persianText: 'حتی پس از این همه زمان، خورشید هرگز به زمین نمی‌گوید "تو به من بدهکاری." ببین با عشقی مثل آن چه می‌شود. تمام آسمان را روشن می‌کند.',
    themes: ['love', 'relationships', 'devotion', 'selflessness'],
    lifeAreas: ['love', 'relationships'],
    translation: 'English'
  },
  {
    ghazal: 7,
    verse: 1,
    text: 'I wish I could show you when you are lonely or in darkness the astonishing light of your own being.',
    persianText: 'ای کاش می‌توانستم وقتی تنها یا در تاریکی هستی، نور شگفت‌انگیز وجود خودت را به تو نشان دهم.',
    themes: ['love', 'relationships', 'self-love', 'illumination'],
    lifeAreas: ['love', 'relationships', 'spirituality'],
    translation: 'English'
  },
  {
    ghazal: 8,
    verse: 1,
    text: 'The minute I heard my first love story, I started looking for you, not knowing how blind that was. Lovers don\'t finally meet somewhere. They\'re in each other all along.',
    themes: ['love', 'relationships', 'destiny', 'unity'],
    lifeAreas: ['love', 'relationships'],
    translation: 'English'
  },

  // Career & Work
  {
    ghazal: 9,
    verse: 1,
    text: 'Work. Keep digging your well. Don\'t think about getting off from work. Water is there somewhere.',
    persianText: 'کار کن. به حفر چاهت ادامه بده. به ترک کار فکر نکن. آب جایی آنجاست.',
    themes: ['work', 'career', 'perseverance', 'purpose'],
    lifeAreas: ['career', 'work'],
    translation: 'English'
  },
  {
    ghazal: 10,
    verse: 1,
    text: 'Let the beauty we love be what we do. There are hundreds of ways to kneel and kiss the ground.',
    persianText: 'بگذار زیبایی که دوست داریم همان کاری باشد که انجام می‌دهیم. صدها راه برای زانو زدن و بوسیدن زمین وجود دارد.',
    themes: ['work', 'career', 'passion', 'purpose'],
    lifeAreas: ['career', 'work'],
    translation: 'English'
  },
  {
    ghazal: 11,
    verse: 1,
    text: 'The way you make love is the way God will be with you.',
    themes: ['work', 'career', 'dedication', 'divine-connection'],
    lifeAreas: ['career', 'work', 'spirituality'],
    translation: 'English'
  },

  // Health & Healing
  {
    ghazal: 12,
    verse: 1,
    text: 'The wound is the place where the Light enters you.',
    themes: ['healing', 'health', 'transformation', 'illumination'],
    lifeAreas: ['health', 'spirituality'],
    translation: 'English'
  },
  {
    ghazal: 13,
    verse: 1,
    text: 'Don\'t grieve. Anything you lose comes round in another form.',
    themes: ['healing', 'health', 'transformation', 'hope'],
    lifeAreas: ['health', 'mental-health'],
    translation: 'English'
  },
  {
    ghazal: 14,
    verse: 1,
    text: 'The cure for pain is in the pain.',
    themes: ['healing', 'health', 'wisdom', 'acceptance'],
    lifeAreas: ['health', 'mental-health'],
    translation: 'English'
  },
  {
    ghazal: 15,
    verse: 1,
    text: 'Suffering is a gift. In it is hidden mercy.',
    themes: ['healing', 'health', 'mercy', 'wisdom'],
    lifeAreas: ['health', 'spirituality'],
    translation: 'English'
  },

  // Finances & Prosperity
  {
    ghazal: 16,
    verse: 1,
    text: 'If you are seeking, seek us with joy. For we live in the kingdom of joy.',
    themes: ['prosperity', 'joy', 'abundance', 'gratitude'],
    lifeAreas: ['finances', 'spirituality'],
    translation: 'English'
  },
  {
    ghazal: 17,
    verse: 1,
    text: 'Be grateful for your life, every detail of it, and your face will come to shine like a sun, and everyone who sees it will be made glad and peaceful.',
    themes: ['prosperity', 'gratitude', 'abundance', 'peace'],
    lifeAreas: ['finances', 'spirituality'],
    translation: 'English'
  },
  {
    ghazal: 18,
    verse: 1,
    text: 'The universe is not outside of you. Look inside yourself; everything that you want, you already are.',
    themes: ['prosperity', 'abundance', 'self-realization', 'wisdom'],
    lifeAreas: ['finances', 'spirituality'],
    translation: 'English'
  },

  // Protection & Strength
  {
    ghazal: 19,
    verse: 1,
    text: 'You were born with wings, why prefer to crawl through life?',
    themes: ['strength', 'protection', 'freedom', 'potential'],
    lifeAreas: ['spirituality', 'protection'],
    translation: 'English'
  },
  {
    ghazal: 20,
    verse: 1,
    text: 'The moon stays bright when it doesn\'t avoid the night.',
    themes: ['strength', 'protection', 'courage', 'endurance'],
    lifeAreas: ['spirituality', 'protection'],
    translation: 'English'
  },
  {
    ghazal: 21,
    verse: 1,
    text: 'Forget safety. Live where you fear to live. Destroy your reputation. Be notorious.',
    themes: ['strength', 'courage', 'freedom', 'authenticity'],
    lifeAreas: ['spirituality', 'protection'],
    translation: 'English'
  },
  {
    ghazal: 22,
    verse: 1,
    text: 'When the world pushes you to your knees, you\'re in the perfect position to pray.',
    themes: ['strength', 'protection', 'prayer', 'faith'],
    lifeAreas: ['spirituality', 'protection'],
    translation: 'English'
  },

  // Peace & Comfort
  {
    ghazal: 23,
    verse: 1,
    text: 'Be empty of worrying. Think of who created thought! Why do you stay in prison when the door is so wide open?',
    themes: ['peace', 'comfort', 'freedom', 'wisdom'],
    lifeAreas: ['spirituality', 'mental-health'],
    translation: 'English'
  },
  {
    ghazal: 24,
    verse: 1,
    text: 'Out beyond ideas of wrongdoing and rightdoing, there is a field. I\'ll meet you there.',
    themes: ['peace', 'comfort', 'unity', 'transcendence'],
    lifeAreas: ['spirituality', 'mental-health'],
    translation: 'English'
  },
  {
    ghazal: 25,
    verse: 1,
    text: 'Let yourself be silently drawn by the strange pull of what you really love. It will not lead you astray.',
    themes: ['peace', 'comfort', 'guidance', 'trust'],
    lifeAreas: ['spirituality', 'mental-health'],
    translation: 'English'
  },
  {
    ghazal: 26,
    verse: 1,
    text: 'The quieter you become, the more you are able to hear.',
    themes: ['peace', 'tranquility', 'wisdom', 'meditation'],
    lifeAreas: ['spirituality', 'mental-health'],
    translation: 'English'
  },

  // Hope & Encouragement
  {
    ghazal: 27,
    verse: 1,
    text: 'The wound is the place where the Light enters you.',
    themes: ['hope', 'encouragement', 'transformation', 'illumination'],
    lifeAreas: ['spirituality', 'mental-health'],
    translation: 'English'
  },
  {
    ghazal: 28,
    verse: 1,
    text: 'Don\'t be satisfied with stories, how things have gone with others. Unfold your own myth.',
    themes: ['hope', 'encouragement', 'destiny', 'authenticity'],
    lifeAreas: ['spirituality', 'life-path'],
    translation: 'English'
  },
  {
    ghazal: 29,
    verse: 1,
    text: 'Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.',
    themes: ['hope', 'encouragement', 'transformation', 'wisdom'],
    lifeAreas: ['spirituality', 'life-path'],
    translation: 'English'
  },
  {
    ghazal: 30,
    verse: 1,
    text: 'What you seek is seeking you.',
    themes: ['hope', 'encouragement', 'destiny', 'divine-plan'],
    lifeAreas: ['spirituality', 'life-path'],
    translation: 'English'
  },

  // Faith & Trust
  {
    ghazal: 31,
    verse: 1,
    text: 'Let yourself be drawn by the stronger pull of that which you truly love.',
    themes: ['faith', 'trust', 'love', 'guidance'],
    lifeAreas: ['spirituality']
  },
  {
    ghazal: 32,
    verse: 1,
    text: 'The universe is not outside of you. Look inside yourself; everything that you want, you already are.',
    themes: ['faith', 'trust', 'self-realization', 'divine-connection'],
    lifeAreas: ['spirituality']
  },
  {
    ghazal: 33,
    verse: 1,
    text: 'When you do things from your soul, you feel a river moving in you, a joy.',
    themes: ['faith', 'trust', 'joy', 'authenticity'],
    lifeAreas: ['spirituality']
  },
  {
    ghazal: 34,
    verse: 1,
    text: 'The moment you accept what troubles you\'ve been given, the door will open.',
    themes: ['faith', 'trust', 'acceptance', 'transformation'],
    lifeAreas: ['spirituality']
  },

  // Purpose & Calling
  {
    ghazal: 35,
    verse: 1,
    text: 'Let the beauty we love be what we do. There are hundreds of ways to kneel and kiss the ground.',
    themes: ['purpose', 'calling', 'beauty', 'devotion'],
    lifeAreas: ['spirituality', 'life-path', 'career']
  },
  {
    ghazal: 36,
    verse: 1,
    text: 'Don\'t be satisfied with stories, how things have gone with others. Unfold your own myth.',
    themes: ['purpose', 'calling', 'destiny', 'authenticity'],
    lifeAreas: ['spirituality', 'life-path']
  },
  {
    ghazal: 37,
    verse: 1,
    text: 'You were born with wings, why prefer to crawl through life?',
    themes: ['purpose', 'calling', 'potential', 'freedom'],
    lifeAreas: ['spirituality', 'life-path', 'career']
  },
  {
    ghazal: 38,
    verse: 1,
    text: 'The garden of the world has no limits, except in your mind.',
    themes: ['purpose', 'calling', 'freedom', 'potential'],
    lifeAreas: ['spirituality', 'life-path']
  },

  // Forgiveness & Mercy
  {
    ghazal: 39,
    verse: 1,
    text: 'Out beyond ideas of wrongdoing and rightdoing, there is a field. I\'ll meet you there.',
    themes: ['forgiveness', 'mercy', 'compassion', 'transcendence'],
    lifeAreas: ['spirituality', 'relationships']
  },
  {
    ghazal: 40,
    verse: 1,
    text: 'The moment you accept what troubles you\'ve been given, the door will open.',
    themes: ['forgiveness', 'mercy', 'acceptance', 'healing'],
    lifeAreas: ['spirituality', 'relationships']
  },
  {
    ghazal: 41,
    verse: 1,
    text: 'Suffering is a gift. In it is hidden mercy.',
    themes: ['forgiveness', 'mercy', 'compassion', 'wisdom'],
    lifeAreas: ['spirituality', 'relationships']
  },

  // Gratitude & Thanksgiving
  {
    ghazal: 42,
    verse: 1,
    text: 'Be grateful for your life, every detail of it, and your face will come to shine like a sun.',
    themes: ['gratitude', 'thanksgiving', 'joy', 'illumination'],
    lifeAreas: ['spirituality']
  },
  {
    ghazal: 43,
    verse: 1,
    text: 'If you are seeking, seek us with joy. For we live in the kingdom of joy.',
    themes: ['gratitude', 'thanksgiving', 'joy', 'abundance'],
    lifeAreas: ['spirituality']
  },
  {
    ghazal: 44,
    verse: 1,
    text: 'The universe is not outside of you. Look inside yourself; everything that you want, you already are.',
    themes: ['gratitude', 'thanksgiving', 'abundance', 'self-realization'],
    lifeAreas: ['spirituality']
  },

  // Perseverance & Endurance
  {
    ghazal: 45,
    verse: 1,
    text: 'Work. Keep digging your well. Don\'t think about getting off from work. Water is there somewhere.',
    themes: ['perseverance', 'endurance', 'patience', 'purpose'],
    lifeAreas: ['spirituality', 'life-path']
  },
  {
    ghazal: 46,
    verse: 1,
    text: 'The moon stays bright when it doesn\'t avoid the night.',
    themes: ['perseverance', 'endurance', 'courage', 'strength'],
    lifeAreas: ['spirituality', 'life-path']
  },
  {
    ghazal: 47,
    verse: 1,
    text: 'Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.',
    themes: ['perseverance', 'endurance', 'transformation', 'growth'],
    lifeAreas: ['spirituality', 'life-path']
  },
  {
    ghazal: 48,
    verse: 1,
    text: 'The wound is the place where the Light enters you.',
    themes: ['perseverance', 'endurance', 'transformation', 'hope'],
    lifeAreas: ['spirituality', 'life-path']
  }
]

/**
 * Get random Hafez passage
 */
export function getRandomPassage(): HafezPassage {
  return HAFEZ_PASSAGES[Math.floor(Math.random() * HAFEZ_PASSAGES.length)]
}

/**
 * Get passages by theme
 */
export function getPassagesByTheme(theme: string): HafezPassage[] {
  return HAFEZ_PASSAGES.filter(passage => 
    passage.themes.some(t => t.toLowerCase().includes(theme.toLowerCase()))
  )
}

/**
 * Get passages by life area
 */
export function getPassagesByLifeArea(lifeArea: string): HafezPassage[] {
  return HAFEZ_PASSAGES.filter(passage => 
    passage.lifeAreas.some(area => area.toLowerCase().includes(lifeArea.toLowerCase()))
  )
}

/**
 * Get multiple random passages
 */
export function getRandomPassages(count: number): HafezPassage[] {
  const shuffled = [...HAFEZ_PASSAGES].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, HAFEZ_PASSAGES.length))
}

/**
 * Format passage reference
 */
export function formatPassageReference(passage: HafezPassage): string {
  return `Ghazal ${passage.ghazal}, Verse ${passage.verse}`
}

