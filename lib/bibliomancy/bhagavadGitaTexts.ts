/**
 * Bhagavad Gita Texts Resource for Bibliomancy
 * Bhagavad Gita verses organized by themes and life areas for divination
 * Format: Chapter and Verse
 */

export interface BhagavadGitaPassage {
  chapter: number
  verse: number
  text: string
  sanskritText?: string // Original Sanskrit text
  themes: string[]
  lifeAreas: string[]
  chapterName?: string
}

export const BHAGAVAD_GITA_PASSAGES: BhagavadGitaPassage[] = [
  // Guidance & Wisdom
  {
    chapter: 2,
    verse: 47,
    text: 'You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.',
    sanskritText: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    themes: ['guidance', 'duty', 'karma', 'detachment'],
    lifeAreas: ['spirituality', 'career', 'decision-making'],
    chapterName: 'Sankhya Yoga'
  },
  {
    chapter: 6,
    verse: 5,
    text: 'One must deliver himself with the help of his mind, and not degrade himself. The mind is the friend of the conditioned soul, and his enemy as well.',
    sanskritText: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥',
    themes: ['guidance', 'mind', 'self-control', 'wisdom'],
    lifeAreas: ['spirituality', 'mental-health'],
    chapterName: 'Dhyana Yoga'
  },
  {
    chapter: 18,
    verse: 63,
    text: 'Thus I have explained to you knowledge still more confidential. Deliberate on this fully, and then do what you wish to do.',
    sanskritText: 'इति ते ज्ञानमाख्यातं गुह्याद्गुह्यतरं मया। विमृश्यैतदशेषेण यथेच्छसि तथा कुरु॥',
    themes: ['guidance', 'wisdom', 'decision-making', 'free-will'],
    lifeAreas: ['spirituality', 'decision-making'],
    chapterName: 'Moksha Yoga'
  },
  {
    chapter: 3,
    verse: 35,
    text: 'It is better to engage in one\'s own occupation, even though one may perform it imperfectly, than to accept another\'s occupation and perform it perfectly.',
    sanskritText: 'श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्। स्वधर्मे निधनं श्रेयः परधर्मो भयावहः॥',
    themes: ['guidance', 'duty', 'purpose', 'authenticity'],
    lifeAreas: ['career', 'spirituality', 'life-path'],
    chapterName: 'Karma Yoga'
  },

  // Love & Relationships
  {
    chapter: 12,
    verse: 13,
    text: 'One who is not envious but is a kind friend to all living entities, who does not think himself a proprietor and is free from false ego, who is equal in both happiness and distress, who is tolerant, always satisfied, self-controlled.',
    sanskritText: 'अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च। निर्ममो निरहङ्कारः समदुःखसुखः क्षमी॥',
    themes: ['love', 'relationships', 'compassion', 'equality'],
    lifeAreas: ['love', 'relationships'],
    chapterName: 'Bhakti Yoga'
  },
  {
    chapter: 6,
    verse: 32,
    text: 'He is a perfect yogi who, by comparison to his own self, sees the true equality of all beings, in both their happiness and their distress.',
    sanskritText: 'आत्मौपम्येन सर्वत्र समं पश्यति योऽर्जुन। सुखं वा यदि वा दुःखं स योगी परमो मतः॥',
    themes: ['love', 'relationships', 'compassion', 'unity'],
    lifeAreas: ['love', 'relationships', 'spirituality'],
    chapterName: 'Dhyana Yoga'
  },
  {
    chapter: 9,
    verse: 29,
    text: 'I envy no one, nor am I partial to anyone. I am equal to all. But whoever renders service unto Me in devotion is a friend, is in Me, and I am also a friend to him.',
    sanskritText: 'समोऽहं सर्वभूतेषु न मे द्वेष्योऽस्ति न प्रियः। ये भजन्ति तु मां भक्त्या मयि ते तेषु चाप्यहम्॥',
    themes: ['love', 'devotion', 'relationships', 'divine-love'],
    lifeAreas: ['love', 'relationships', 'spirituality'],
    chapterName: 'Raja Vidya Raja Guhya Yoga'
  },

  // Career & Work
  {
    chapter: 3,
    verse: 8,
    text: 'Perform your prescribed duty, for doing so is better than not working. One cannot even maintain one\'s physical body without work.',
    sanskritText: 'नियतं कुरु कर्म त्वं कर्म ज्यायो ह्यकर्मणः। शरीरयात्रापि च ते न प्रसिद्ध्येदकर्मणः॥',
    themes: ['work', 'career', 'duty', 'purpose'],
    lifeAreas: ['career', 'work'],
    chapterName: 'Karma Yoga'
  },
  {
    chapter: 18,
    verse: 48,
    text: 'Every endeavor is covered by some fault, just as fire is covered by smoke. Therefore one should not give up the work born of his nature.',
    sanskritText: 'सहजं कर्म कौन्तेय सदोषमपि न त्यजेत्। सर्वारम्भा हि दोषेण धूमेनाग्निरिवावृताः॥',
    themes: ['work', 'career', 'perseverance', 'duty'],
    lifeAreas: ['career', 'work'],
    chapterName: 'Moksha Yoga'
  },
  {
    chapter: 2,
    verse: 41,
    text: 'Those who are on this path are resolute in purpose, and their aim is one. O beloved child of the Kurus, the intelligence of those who are irresolute is many-branched.',
    themes: ['work', 'career', 'focus', 'determination'],
    lifeAreas: ['career', 'work'],
    chapterName: 'Sankhya Yoga'
  },

  // Health & Healing
  {
    chapter: 6,
    verse: 16,
    text: 'There is no possibility of one\'s becoming a yogi, O Arjuna, if one eats too much or eats too little, sleeps too much or does not sleep enough.',
    sanskritText: 'नात्यश्नतस्तु योगोऽस्ति न चैकान्तमनश्नतः। न चातिस्वप्नशीलस्य जाग्रतो नैव चार्जुन॥',
    themes: ['health', 'balance', 'wellness', 'discipline'],
    lifeAreas: ['health'],
    chapterName: 'Dhyana Yoga'
  },
  {
    chapter: 6,
    verse: 17,
    text: 'He who is regulated in his habits of eating, sleeping, recreation and work can mitigate all material pains by practicing the yoga system.',
    sanskritText: 'युक्ताहारविहारस्य युक्तचेष्टस्य कर्मसु। युक्तस्वप्नावबोधस्य योगो भवति दुःखहा॥',
    themes: ['health', 'wellness', 'discipline', 'healing'],
    lifeAreas: ['health'],
    chapterName: 'Dhyana Yoga'
  },
  {
    chapter: 15,
    verse: 14,
    text: 'I am the fire of digestion in the bodies of all living entities, and I join with the air of life, outgoing and incoming, to digest the four kinds of foodstuff.',
    themes: ['health', 'wellness', 'divine-support', 'nourishment'],
    lifeAreas: ['health'],
    chapterName: 'Purusottama Yoga'
  },

  // Finances & Prosperity
  {
    chapter: 9,
    verse: 22,
    text: 'To those who are constantly devoted and who worship Me with love, I give the understanding by which they can come to Me.',
    themes: ['prosperity', 'devotion', 'blessing', 'divine-favor'],
    lifeAreas: ['finances', 'spirituality'],
    chapterName: 'Raja Vidya Raja Guhya Yoga'
  },
  {
    chapter: 17,
    verse: 20,
    text: 'Charity given out of duty, without expectation of return, at the proper time and place, and to a worthy person is considered to be in the mode of goodness.',
    themes: ['finances', 'charity', 'giving', 'duty'],
    lifeAreas: ['finances'],
    chapterName: 'Sraddha Traya Vibhaga Yoga'
  },
  {
    chapter: 6,
    verse: 1,
    text: 'One who is unattached to the fruits of his work and who works as he is obligated is in the renounced order of life, and he is the true mystic, not he who lights no fire and performs no duty.',
    themes: ['finances', 'work', 'detachment', 'duty'],
    lifeAreas: ['finances', 'career'],
    chapterName: 'Dhyana Yoga'
  },

  // Protection & Strength
  {
    chapter: 9,
    verse: 22,
    text: 'To those who are constantly devoted and who worship Me with love, I give the understanding by which they can come to Me.',
    themes: ['protection', 'divine-support', 'devotion', 'strength'],
    lifeAreas: ['spirituality', 'protection'],
    chapterName: 'Raja Vidya Raja Guhya Yoga'
  },
  {
    chapter: 18,
    verse: 66,
    text: 'Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.',
    themes: ['protection', 'surrender', 'divine-protection', 'fearlessness'],
    lifeAreas: ['spirituality', 'protection'],
    chapterName: 'Moksha Yoga'
  },
  {
    chapter: 2,
    verse: 23,
    text: 'The soul can never be cut to pieces by any weapon, nor burned by fire, nor moistened by water, nor withered by the wind.',
    themes: ['protection', 'immortality', 'strength', 'divine-nature'],
    lifeAreas: ['spirituality', 'protection'],
    chapterName: 'Sankhya Yoga'
  },

  // Peace & Comfort
  {
    chapter: 2,
    verse: 56,
    text: 'One who is not disturbed in mind even amidst the threefold miseries, who is not elated when there is happiness, and who is free from attachment, fear and anger, is called a sage of steady mind.',
    themes: ['peace', 'comfort', 'equanimity', 'tranquility'],
    lifeAreas: ['spirituality', 'mental-health'],
    chapterName: 'Sankhya Yoga'
  },
  {
    chapter: 6,
    verse: 19,
    text: 'As a lamp in a windless place does not waver, so the transcendentalist, whose mind is controlled, remains always steady in his meditation on the transcendent Self.',
    themes: ['peace', 'meditation', 'tranquility', 'steadiness'],
    lifeAreas: ['spirituality', 'mental-health'],
    chapterName: 'Dhyana Yoga'
  },
  {
    chapter: 12,
    verse: 12,
    text: 'Better indeed is knowledge than practice; than knowledge, meditation is better; than meditation, renunciation of the fruits of action; peace immediately follows such renunciation.',
    themes: ['peace', 'tranquility', 'detachment', 'wisdom'],
    lifeAreas: ['spirituality', 'mental-health'],
    chapterName: 'Bhakti Yoga'
  },

  // Hope & Encouragement
  {
    chapter: 18,
    verse: 78,
    text: 'Wherever there is Krishna, the master of all mystics, and wherever there is Arjuna, the supreme archer, there will also certainly be opulence, victory, extraordinary power, and morality.',
    themes: ['hope', 'encouragement', 'victory', 'divine-support'],
    lifeAreas: ['spirituality', 'life-path'],
    chapterName: 'Moksha Yoga'
  },
  {
    chapter: 6,
    verse: 40,
    text: 'The Blessed Lord said: Son of Pritha, a transcendentalist engaged in auspicious activities does not meet with destruction either in this world or in the spiritual world.',
    themes: ['hope', 'encouragement', 'protection', 'spiritual-growth'],
    lifeAreas: ['spirituality', 'life-path'],
    chapterName: 'Dhyana Yoga'
  },
  {
    chapter: 2,
    verse: 40,
    text: 'In this endeavor there is no loss or diminution, and a little advancement on this path can protect one from the most dangerous type of fear.',
    themes: ['hope', 'encouragement', 'protection', 'progress'],
    lifeAreas: ['spirituality', 'life-path'],
    chapterName: 'Sankhya Yoga'
  },

  // Faith & Trust
  {
    chapter: 4,
    verse: 11,
    text: 'As all surrender unto Me, I reward them accordingly. Everyone follows My path in all respects, O son of Pritha.',
    themes: ['faith', 'trust', 'surrender', 'divine-response'],
    lifeAreas: ['spirituality'],
    chapterName: 'Jnana Karma Sanyasa Yoga'
  },
  {
    chapter: 9,
    verse: 34,
    text: 'Engage your mind always in thinking of Me, become My devotee, offer obeisances to Me and worship Me. Being completely absorbed in Me, surely you will come to Me.',
    themes: ['faith', 'devotion', 'trust', 'divine-connection'],
    lifeAreas: ['spirituality'],
    chapterName: 'Raja Vidya Raja Guhya Yoga'
  },
  {
    chapter: 18,
    verse: 66,
    text: 'Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.',
    themes: ['faith', 'trust', 'surrender', 'fearlessness'],
    lifeAreas: ['spirituality'],
    chapterName: 'Moksha Yoga'
  },

  // Purpose & Calling
  {
    chapter: 3,
    verse: 35,
    text: 'It is better to engage in one\'s own occupation, even though one may perform it imperfectly, than to accept another\'s occupation and perform it perfectly.',
    themes: ['purpose', 'calling', 'duty', 'authenticity'],
    lifeAreas: ['spirituality', 'life-path', 'career'],
    chapterName: 'Karma Yoga'
  },
  {
    chapter: 18,
    verse: 46,
    text: 'By following his qualities of work, every man can become perfect. Now please hear from Me how this can be done.',
    themes: ['purpose', 'calling', 'perfection', 'duty'],
    lifeAreas: ['spirituality', 'life-path', 'career'],
    chapterName: 'Moksha Yoga'
  },
  {
    chapter: 2,
    verse: 31,
    text: 'Considering your specific duty as a kshatriya, you should know that there is no better engagement for you than fighting on religious principles; and so there is no need for hesitation.',
    themes: ['purpose', 'calling', 'duty', 'determination'],
    lifeAreas: ['spirituality', 'life-path', 'career'],
    chapterName: 'Sankhya Yoga'
  },

  // Forgiveness & Mercy
  {
    chapter: 16,
    verse: 3,
    text: 'Fearlessness, purification of one\'s existence, cultivation of spiritual knowledge, charity, self-control, performance of sacrifice, study of the Vedas, austerity and simplicity.',
    themes: ['forgiveness', 'mercy', 'compassion', 'purity'],
    lifeAreas: ['spirituality', 'relationships'],
    chapterName: 'Daivasura Sampad Vibhaga Yoga'
  },
  {
    chapter: 12,
    verse: 13,
    text: 'One who is not envious but is a kind friend to all living entities, who does not think himself a proprietor and is free from false ego.',
    themes: ['forgiveness', 'mercy', 'kindness', 'humility'],
    lifeAreas: ['spirituality', 'relationships'],
    chapterName: 'Bhakti Yoga'
  },

  // Gratitude & Thanksgiving
  {
    chapter: 9,
    verse: 22,
    text: 'To those who are constantly devoted and who worship Me with love, I give the understanding by which they can come to Me.',
    themes: ['gratitude', 'devotion', 'thanksgiving', 'divine-favor'],
    lifeAreas: ['spirituality'],
    chapterName: 'Raja Vidya Raja Guhya Yoga'
  },
  {
    chapter: 18,
    verse: 54,
    text: 'One who is thus transcendentally situated at once realizes the Supreme Brahman and becomes fully joyful. He never laments or desires to have anything.',
    themes: ['gratitude', 'joy', 'contentment', 'fulfillment'],
    lifeAreas: ['spirituality'],
    chapterName: 'Moksha Yoga'
  },

  // Perseverance & Endurance
  {
    chapter: 6,
    verse: 35,
    text: 'The Blessed Lord said: Undoubtedly, O mighty-armed, the mind is restless and difficult to control; but it is subdued by constant practice and by detachment.',
    themes: ['perseverance', 'endurance', 'practice', 'discipline'],
    lifeAreas: ['spirituality', 'life-path'],
    chapterName: 'Dhyana Yoga'
  },
  {
    chapter: 6,
    verse: 16,
    text: 'There is no possibility of one\'s becoming a yogi, O Arjuna, if one eats too much or eats too little, sleeps too much or does not sleep enough.',
    themes: ['perseverance', 'endurance', 'discipline', 'balance'],
    lifeAreas: ['spirituality', 'life-path'],
    chapterName: 'Dhyana Yoga'
  }
]

/**
 * Get random Bhagavad Gita passage
 */
export function getRandomPassage(): BhagavadGitaPassage {
  return BHAGAVAD_GITA_PASSAGES[Math.floor(Math.random() * BHAGAVAD_GITA_PASSAGES.length)]
}

/**
 * Get passages by theme
 */
export function getPassagesByTheme(theme: string): BhagavadGitaPassage[] {
  return BHAGAVAD_GITA_PASSAGES.filter(passage => 
    passage.themes.some(t => t.toLowerCase().includes(theme.toLowerCase()))
  )
}

/**
 * Get passages by life area
 */
export function getPassagesByLifeArea(lifeArea: string): BhagavadGitaPassage[] {
  return BHAGAVAD_GITA_PASSAGES.filter(passage => 
    passage.lifeAreas.some(area => area.toLowerCase().includes(lifeArea.toLowerCase()))
  )
}

/**
 * Get multiple random passages
 */
export function getRandomPassages(count: number): BhagavadGitaPassage[] {
  const shuffled = [...BHAGAVAD_GITA_PASSAGES].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, BHAGAVAD_GITA_PASSAGES.length))
}

/**
 * Format passage reference
 */
export function formatPassageReference(passage: BhagavadGitaPassage): string {
  return `Chapter ${passage.chapter}, Verse ${passage.verse}${passage.chapterName ? ` (${passage.chapterName})` : ''}`
}

