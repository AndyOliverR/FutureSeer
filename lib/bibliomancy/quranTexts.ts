/**
 * Quran Texts Resource for Bibliomancy
 * Quranic verses (ayahs) organized by themes and life areas for divination
 * Format: Surah (chapter) and Ayah (verse)
 */

export interface QuranPassage {
  surah: string
  surahNumber: number
  ayah: number
  text: string
  arabicText?: string // Original Arabic text
  themes: string[]
  lifeAreas: string[]
  translation: string
}

export const QURAN_PASSAGES: QuranPassage[] = [
  // Guidance & Wisdom
  {
    surah: 'Al-Baqarah',
    surahNumber: 2,
    ayah: 186,
    text: 'And when My servants ask you concerning Me, indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.',
    arabicText: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
    themes: ['guidance', 'prayer', 'divine-presence', 'faith'],
    lifeAreas: ['spirituality', 'prayer'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Fatihah',
    surahNumber: 1,
    ayah: 6,
    text: 'Guide us to the straight path',
    arabicText: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    themes: ['guidance', 'direction', 'path', 'wisdom'],
    lifeAreas: ['spirituality', 'decision-making'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Baqarah',
    surahNumber: 2,
    ayah: 255,
    text: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep.',
    arabicText: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
    themes: ['divine-power', 'protection', 'faith', 'eternity'],
    lifeAreas: ['spirituality', 'protection'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Imran',
    surahNumber: 3,
    ayah: 159,
    text: 'So by mercy from Allah, you were lenient with them. And if you had been rude in speech and harsh in heart, they would have disbanded from about you.',
    arabicText: 'فَبِمَا رَحْمَةٍ مِّنَ اللَّهِ لِنتَ لَهُمْ ۖ وَلَوْ كُنتَ فَظًّا غَلِيظَ الْقَلْبِ لَانفَضُّوا مِنْ حَوْلِكَ',
    themes: ['mercy', 'kindness', 'compassion', 'leadership'],
    lifeAreas: ['relationships', 'spirituality'],
    translation: 'Sahih International'
  },

  // Love & Relationships
  {
    surah: 'Ar-Rum',
    surahNumber: 30,
    ayah: 21,
    text: 'And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy.',
    arabicText: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    themes: ['love', 'relationships', 'marriage', 'tranquility'],
    lifeAreas: ['love', 'relationships'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Hujurat',
    surahNumber: 49,
    ayah: 13,
    text: 'O mankind, indeed We have created you from male and female and made you peoples and tribes that you may know one another.',
    arabicText: 'يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا',
    themes: ['unity', 'relationships', 'diversity', 'respect'],
    lifeAreas: ['relationships', 'spirituality'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Baqarah',
    surahNumber: 2,
    ayah: 187,
    text: 'They are clothing for you and you are clothing for them.',
    arabicText: 'هُنَّ لِبَاسٌ لَّكُمْ وَأَنتُمْ لِبَاسٌ لَّهُنَّ',
    themes: ['love', 'relationships', 'marriage', 'protection'],
    lifeAreas: ['love', 'relationships'],
    translation: 'Sahih International'
  },

  // Career & Work
  {
    surah: 'Al-Mulk',
    surahNumber: 67,
    ayah: 15,
    text: 'It is He who made the earth tame for you - so walk among its slopes and eat of His provision - and to Him is the resurrection.',
    themes: ['work', 'provision', 'gratitude', 'purpose'],
    lifeAreas: ['career', 'work'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Baqarah',
    surahNumber: 2,
    ayah: 195,
    text: 'And spend in the way of Allah and do not throw yourselves with your own hands into destruction. And do good; indeed, Allah loves the doers of good.',
    themes: ['work', 'charity', 'good-deeds', 'diligence'],
    lifeAreas: ['career', 'work', 'finances'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Jumu\'ah',
    surahNumber: 62,
    ayah: 10,
    text: 'And when the prayer has been concluded, disperse within the land and seek from the bounty of Allah.',
    themes: ['work', 'provision', 'effort', 'blessing'],
    lifeAreas: ['career', 'work'],
    translation: 'Sahih International'
  },

  // Health & Healing
  {
    surah: 'Ash-Shu\'ara',
    surahNumber: 26,
    ayah: 80,
    text: 'And when I am ill, it is He who cures me',
    arabicText: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ',
    themes: ['healing', 'health', 'divine-healing', 'faith'],
    lifeAreas: ['health'],
    translation: 'Sahih International'
  },
  {
    surah: 'Yunus',
    surahNumber: 10,
    ayah: 57,
    text: 'O mankind, there has come to you instruction from your Lord and healing for what is in the breasts and guidance and mercy for the believers.',
    arabicText: 'يَا أَيُّهَا النَّاسُ قَدْ جَاءَتْكُم مَّوْعِظَةٌ مِّن رَّبِّكُمْ وَشِفَاءٌ لِّمَا فِي الصُّدُورِ وَهُدًى وَرَحْمَةٌ لِّلْمُؤْمِنِينَ',
    themes: ['healing', 'health', 'guidance', 'mercy'],
    lifeAreas: ['health', 'spirituality'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Isra',
    surahNumber: 17,
    ayah: 82,
    text: 'And We send down of the Quran that which is healing and mercy for the believers.',
    themes: ['healing', 'health', 'divine-healing', 'mercy'],
    lifeAreas: ['health', 'spirituality'],
    translation: 'Sahih International'
  },

  // Finances & Prosperity
  {
    surah: 'Al-Baqarah',
    surahNumber: 2,
    ayah: 261,
    text: 'The example of those who spend their wealth in the way of Allah is like a seed which grows seven spikes, in each spike is a hundred grains.',
    arabicText: 'مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنبُلَةٍ مِّائَةُ حَبَّةٍ',
    themes: ['finances', 'charity', 'prosperity', 'blessing'],
    lifeAreas: ['finances'],
    translation: 'Sahih International'
  },
  {
    surah: 'At-Talaq',
    surahNumber: 65,
    ayah: 2,
    text: 'And whoever fears Allah - He will make for him a way out and will provide for him from where he does not expect.',
    arabicText: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
    themes: ['finances', 'provision', 'trust', 'faith'],
    lifeAreas: ['finances', 'spirituality'],
    translation: 'Sahih International'
  },
  {
    surah: 'Ibrahim',
    surahNumber: 14,
    ayah: 7,
    text: 'And remember when your Lord proclaimed: If you are grateful, I will surely increase you in favor.',
    themes: ['finances', 'gratitude', 'prosperity', 'blessing'],
    lifeAreas: ['finances', 'spirituality'],
    translation: 'Sahih International'
  },

  // Protection & Strength
  {
    surah: 'Al-Baqarah',
    surahNumber: 2,
    ayah: 286,
    text: 'Allah does not charge a soul except with that within its capacity.',
    themes: ['strength', 'protection', 'divine-mercy', 'comfort'],
    lifeAreas: ['spirituality', 'protection'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Anfal',
    surahNumber: 8,
    ayah: 17,
    text: 'And you did not throw when you threw, but it was Allah who threw.',
    themes: ['divine-power', 'protection', 'support', 'faith'],
    lifeAreas: ['spirituality', 'protection'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Hadid',
    surahNumber: 57,
    ayah: 4,
    text: 'And He is with you wherever you are.',
    themes: ['divine-presence', 'protection', 'comfort', 'faith'],
    lifeAreas: ['spirituality', 'protection'],
    translation: 'Sahih International'
  },

  // Peace & Comfort
  {
    surah: 'Ar-Ra\'d',
    surahNumber: 13,
    ayah: 28,
    text: 'Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.',
    arabicText: 'الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    themes: ['peace', 'comfort', 'remembrance', 'tranquility'],
    lifeAreas: ['spirituality', 'mental-health'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Fath',
    surahNumber: 48,
    ayah: 4,
    text: 'It is He who sent down tranquility into the hearts of the believers.',
    arabicText: 'هُوَ الَّذِي أَنزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ',
    themes: ['peace', 'comfort', 'tranquility', 'faith'],
    lifeAreas: ['spirituality', 'mental-health'],
    translation: 'Sahih International'
  },
  {
    surah: 'At-Tawbah',
    surahNumber: 9,
    ayah: 40,
    text: 'If you do not aid him, Allah has already aided him.',
    themes: ['divine-support', 'comfort', 'protection', 'faith'],
    lifeAreas: ['spirituality', 'mental-health'],
    translation: 'Sahih International'
  },

  // Hope & Encouragement
  {
    surah: 'Az-Zumar',
    surahNumber: 39,
    ayah: 53,
    text: 'Say, O My servants who have transgressed against themselves, do not despair of the mercy of Allah.',
    arabicText: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
    themes: ['hope', 'mercy', 'forgiveness', 'encouragement'],
    lifeAreas: ['spirituality', 'mental-health'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Baqarah',
    surahNumber: 2,
    ayah: 286,
    text: 'Our Lord, do not impose blame upon us if we have forgotten or erred.',
    arabicText: 'رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا',
    themes: ['hope', 'mercy', 'forgiveness', 'divine-mercy'],
    lifeAreas: ['spirituality'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Inshirah',
    surahNumber: 94,
    ayah: 5,
    text: 'For indeed, with hardship comes ease.',
    arabicText: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    themes: ['hope', 'encouragement', 'patience', 'relief'],
    lifeAreas: ['spirituality', 'mental-health'],
    translation: 'Sahih International'
  },

  // Faith & Trust
  {
    surah: 'At-Taghabun',
    surahNumber: 64,
    ayah: 11,
    text: 'No disaster strikes except by permission of Allah. And whoever believes in Allah - He will guide his heart.',
    themes: ['faith', 'trust', 'divine-plan', 'guidance'],
    lifeAreas: ['spirituality'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Baqarah',
    surahNumber: 2,
    ayah: 152,
    text: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
    themes: ['faith', 'remembrance', 'gratitude', 'divine-connection'],
    lifeAreas: ['spirituality'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Ma\'idah',
    surahNumber: 5,
    ayah: 23,
    text: 'And upon Allah rely, if you should be believers.',
    themes: ['faith', 'trust', 'reliance', 'belief'],
    lifeAreas: ['spirituality'],
    translation: 'Sahih International'
  },

  // Purpose & Calling
  {
    surah: 'Adh-Dhariyat',
    surahNumber: 51,
    ayah: 56,
    text: 'And I did not create the jinn and mankind except to worship Me.',
    themes: ['purpose', 'calling', 'worship', 'destiny'],
    lifeAreas: ['spirituality', 'life-path'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Baqarah',
    surahNumber: 2,
    ayah: 30,
    text: 'Indeed, I will make upon the earth a successive authority.',
    themes: ['purpose', 'responsibility', 'stewardship', 'calling'],
    lifeAreas: ['spirituality', 'life-path', 'career'],
    translation: 'Sahih International'
  },

  // Forgiveness & Mercy
  {
    surah: 'Az-Zumar',
    surahNumber: 39,
    ayah: 53,
    text: 'Say, O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins.',
    themes: ['forgiveness', 'mercy', 'redemption', 'hope'],
    lifeAreas: ['spirituality', 'relationships'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-A\'raf',
    surahNumber: 7,
    ayah: 199,
    text: 'Take what is given freely, enjoin what is good, and turn away from the ignorant.',
    themes: ['forgiveness', 'mercy', 'kindness', 'wisdom'],
    lifeAreas: ['spirituality', 'relationships'],
    translation: 'Sahih International'
  },

  // Gratitude & Thanksgiving
  {
    surah: 'Ibrahim',
    surahNumber: 14,
    ayah: 7,
    text: 'And remember when your Lord proclaimed: If you are grateful, I will surely increase you in favor.',
    themes: ['gratitude', 'thanksgiving', 'blessing', 'prosperity'],
    lifeAreas: ['spirituality', 'finances'],
    translation: 'Sahih International'
  },
  {
    surah: 'An-Naml',
    surahNumber: 27,
    ayah: 19,
    text: 'My Lord, enable me to be grateful for Your favor which You have bestowed upon me.',
    themes: ['gratitude', 'thanksgiving', 'appreciation', 'prayer'],
    lifeAreas: ['spirituality'],
    translation: 'Sahih International'
  },

  // Perseverance & Endurance
  {
    surah: 'Al-Baqarah',
    surahNumber: 2,
    ayah: 155,
    text: 'And We will surely test you with something of fear and hunger and a loss of wealth and lives and fruits, but give good tidings to the patient.',
    themes: ['perseverance', 'endurance', 'patience', 'reward'],
    lifeAreas: ['spirituality', 'life-path'],
    translation: 'Sahih International'
  },
  {
    surah: 'Al-Asr',
    surahNumber: 103,
    ayah: 3,
    text: 'Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.',
    themes: ['perseverance', 'endurance', 'patience', 'righteousness'],
    lifeAreas: ['spirituality', 'life-path'],
    translation: 'Sahih International'
  }
]

/**
 * Get random Quran passage
 */
export function getRandomPassage(): QuranPassage {
  return QURAN_PASSAGES[Math.floor(Math.random() * QURAN_PASSAGES.length)]
}

/**
 * Get passages by theme
 */
export function getPassagesByTheme(theme: string): QuranPassage[] {
  return QURAN_PASSAGES.filter(passage => 
    passage.themes.some(t => t.toLowerCase().includes(theme.toLowerCase()))
  )
}

/**
 * Get passages by life area
 */
export function getPassagesByLifeArea(lifeArea: string): QuranPassage[] {
  return QURAN_PASSAGES.filter(passage => 
    passage.lifeAreas.some(area => area.toLowerCase().includes(lifeArea.toLowerCase()))
  )
}

/**
 * Get multiple random passages
 */
export function getRandomPassages(count: number): QuranPassage[] {
  const shuffled = [...QURAN_PASSAGES].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, QURAN_PASSAGES.length))
}

/**
 * Format passage reference
 */
export function formatPassageReference(passage: QuranPassage): string {
  return `${passage.surah} ${passage.surahNumber}:${passage.ayah}`
}

