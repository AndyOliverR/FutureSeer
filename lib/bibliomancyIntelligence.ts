/**
 * Bibliomancy Intelligence
 * Comprehensive bibliomancy readings based on user profile and sacred texts
 * Supports multiple sacred texts: Bible, Quran, Bhagavad Gita, Torah, Hafez
 */

import { doc, setDoc, getDoc, collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { getFirebaseDB } from './firebase'
import { UserProfile } from './firebase'
import { createAICompletion } from './aiGateway'
import { 
  BIBLE_PASSAGES, 
  getRandomPassages as getBibleRandomPassages, 
  getPassagesByLifeArea as getBiblePassagesByLifeArea,
  formatPassageReference as formatBibleReference,
  type BiblePassage 
} from './bibliomancy/bibleTexts'
import {
  QURAN_PASSAGES,
  getRandomPassages as getQuranRandomPassages,
  getPassagesByLifeArea as getQuranPassagesByLifeArea,
  formatPassageReference as formatQuranReference,
  type QuranPassage
} from './bibliomancy/quranTexts'
import {
  BHAGAVAD_GITA_PASSAGES,
  getRandomPassages as getGitaRandomPassages,
  getPassagesByLifeArea as getGitaPassagesByLifeArea,
  formatPassageReference as formatGitaReference,
  type BhagavadGitaPassage
} from './bibliomancy/bhagavadGitaTexts'
import {
  TORAH_PASSAGES,
  getRandomPassages as getTorahRandomPassages,
  getPassagesByLifeArea as getTorahPassagesByLifeArea,
  formatPassageReference as formatTorahReference,
  type TorahPassage
} from './bibliomancy/torahTexts'
import {
  HAFEZ_PASSAGES,
  getRandomPassages as getHafezRandomPassages,
  getPassagesByLifeArea as getHafezPassagesByLifeArea,
  formatPassageReference as formatHafezReference,
  type HafezPassage
} from './bibliomancy/hafezTexts'


// Sacred text type
export type SacredTextType = 'bible' | 'quran' | 'bhagavad-gita' | 'torah' | 'hafez'

// Unified passage interface that works for all text types
export interface Passage {
  book: string // For Bible/Torah: book name, for Quran: surah, for Gita: "Bhagavad Gita", for Hafez: "Divan of Hafez"
  chapter: number // For Bible/Torah/Gita: chapter, for Quran: surahNumber, for Hafez: ghazal
  verse: number // Verse/ayah/ghazal verse number
  text: string
  originalText?: string // Original language text (Arabic, Sanskrit, Hebrew, Persian)
  reference: string // Formatted reference (e.g., "John 3:16", "Al-Baqarah 2:186", "Chapter 2, Verse 47")
  interpretation: string
  application: string
  themes: string[]
}

export interface Guidance {
  passage: Passage
  message: string
  actions: string[]
  affirmations: string[]
}

export interface BibliomancyReading {
  id: string
  timestamp: Date
  userId: string
  textType: SacredTextType // Added: which sacred text was used
  divineMessage: {
    overview: string
    keyInsights: string[]
    personalMessage: string
  }
  selectedPassages: Passage[]
  lifeAreaGuidance: {
    love: Guidance
    career: Guidance
    health: Guidance
    spirituality: Guidance
    finances: Guidance
    relationships: Guidance
  }
  symbolicMeanings: {
    themes: string[]
    symbols: string[]
    numbers: string[]
  }
  practicalApplications: {
    actions: string[]
    affirmations: string[]
    practices: string[]
  }
  spiritualInsights: {
    current: string
    future: string[]
    warnings: string[]
  }
  questionReading?: {
    question: string
    passage: Passage
    interpretation: string
  }
  generatedAt: string
}

class BibliomancyIntelligence {
  private db: any = null
  private cache = new Map<string, BibliomancyReading>()
  private readonly CACHE_TTL = 1000 * 60 * 60 // 1 hour cache

  constructor() {
    try {
      this.db = getFirebaseDB()
    } catch (error) {
      console.warn('Firebase not available for Bibliomancy Intelligence')
    }
  }

  /**
   * Get text-specific passages by life area
   */
  private getTextPassagesByLifeArea(textType: SacredTextType, lifeArea: string): any[] {
    switch (textType) {
      case 'bible':
        return getBiblePassagesByLifeArea(lifeArea)
      case 'quran':
        return getQuranPassagesByLifeArea(lifeArea)
      case 'bhagavad-gita':
        return getGitaPassagesByLifeArea(lifeArea)
      case 'torah':
        return getTorahPassagesByLifeArea(lifeArea)
      case 'hafez':
        return getHafezPassagesByLifeArea(lifeArea)
      default:
        return getBiblePassagesByLifeArea(lifeArea)
    }
  }

  /**
   * Get random passages for a text type
   */
  private getTextRandomPassages(textType: SacredTextType, count: number): any[] {
    switch (textType) {
      case 'bible':
        return getBibleRandomPassages(count)
      case 'quran':
        return getQuranRandomPassages(count)
      case 'bhagavad-gita':
        return getGitaRandomPassages(count)
      case 'torah':
        return getTorahRandomPassages(count)
      case 'hafez':
        return getHafezRandomPassages(count)
      default:
        return getBibleRandomPassages(count)
    }
  }

  /**
   * Format passage reference based on text type
   */
  private formatTextReference(textType: SacredTextType, passage: any): string {
    switch (textType) {
      case 'bible':
        return formatBibleReference(passage)
      case 'quran':
        return formatQuranReference(passage)
      case 'bhagavad-gita':
        return formatGitaReference(passage)
      case 'torah':
        return formatTorahReference(passage)
      case 'hafez':
        return formatHafezReference(passage)
      default:
        return formatBibleReference(passage)
    }
  }

  /**
   * Convert text-specific passage to unified Passage format
   */
  private convertToUnifiedPassage(textType: SacredTextType, passage: any): Passage {
    switch (textType) {
      case 'bible':
        return {
          book: passage.book,
          chapter: passage.chapter,
          verse: passage.verse,
          text: passage.text,
          originalText: passage.originalText, // Bible typically doesn't have original text, but include for consistency
          reference: formatBibleReference(passage),
          interpretation: '',
          application: '',
          themes: passage.themes
        }
      case 'quran':
        return {
          book: passage.surah,
          chapter: passage.surahNumber,
          verse: passage.ayah,
          text: passage.text,
          originalText: passage.arabicText || passage.originalText,
          reference: formatQuranReference(passage),
          interpretation: '',
          application: '',
          themes: passage.themes
        }
      case 'bhagavad-gita':
        return {
          book: 'Bhagavad Gita',
          chapter: passage.chapter,
          verse: passage.verse,
          text: passage.text,
          originalText: passage.sanskritText || passage.originalText,
          reference: formatGitaReference(passage),
          interpretation: '',
          application: '',
          themes: passage.themes
        }
      case 'torah':
        return {
          book: passage.book,
          chapter: passage.chapter,
          verse: passage.verse,
          text: passage.text,
          originalText: passage.hebrewText || passage.originalText,
          reference: formatTorahReference(passage),
          interpretation: '',
          application: '',
          themes: passage.themes
        }
      case 'hafez':
        return {
          book: 'Divan of Hafez',
          chapter: passage.ghazal,
          verse: passage.verse,
          text: passage.text,
          originalText: passage.persianText || passage.originalText,
          reference: formatHafezReference(passage),
          interpretation: '',
          application: '',
          themes: passage.themes
        }
      default:
        return {
          book: passage.book,
          chapter: passage.chapter,
          verse: passage.verse,
          text: passage.text,
          originalText: passage.originalText,
          reference: formatBibleReference(passage),
          interpretation: '',
          application: '',
          themes: passage.themes
        }
    }
  }

  /**
   * Get text-specific passages array for filtering
   */
  private getTextPassagesArray(textType: SacredTextType): any[] {
    switch (textType) {
      case 'bible':
        return BIBLE_PASSAGES
      case 'quran':
        return QURAN_PASSAGES
      case 'bhagavad-gita':
        return BHAGAVAD_GITA_PASSAGES
      case 'torah':
        return TORAH_PASSAGES
      case 'hafez':
        return HAFEZ_PASSAGES
      default:
        return BIBLE_PASSAGES
    }
  }

  /**
   * Get text-specific system prompt for AI
   */
  private getTextSystemPrompt(textType: SacredTextType): string {
    const basePrompt = `You are a master bibliomancy reader with deep knowledge of sacred texts and their application to life guidance. Bibliomancy is the ancient practice of seeking divine guidance through randomly selected passages from sacred texts.

Key Concepts:
- Each passage contains divine wisdom relevant to the seeker's life
- Passages are interpreted in the context of the seeker's birth information and current situation
- Sacred texts offer guidance for all areas of life: love, career, health, spirituality, finances, and relationships
- Bibliomancy readings provide both spiritual insights and practical applications
- Address the user directly using "you" and "your" (not third person)

Guidelines:
- Address the user by their name directly
- Be profound yet practical
- Connect passages to their life situation
- Provide actionable guidance
- Use mystical language that feels authentic
- Reference themes and symbolism from the sacred text
- Make it deeply personal and transformative
- DO NOT use markdown formatting (no **, *, or []())
- DO NOT repeat information across sections
- Be concise and specific - avoid generic statements
- Each section should be unique and not repeat content from other sections`

    switch (textType) {
      case 'bible':
        return basePrompt + `\n\nYou are working with the Bible. Reference biblical themes, Christian symbolism, and biblical wisdom. Use terms like "divine guidance," "the Lord," "God's word," etc.`
      case 'quran':
        return basePrompt + `\n\nYou are working with the Quran. Reference Islamic themes, Quranic wisdom, and Islamic teachings. Use terms like "Allah," "divine guidance," "Quranic wisdom," etc. Be respectful of Islamic tradition.`
      case 'bhagavad-gita':
        return basePrompt + `\n\nYou are working with the Bhagavad Gita. Reference Hindu philosophy, concepts like dharma, karma, and devotion. Use terms like "Krishna," "divine wisdom," "dharma," "karma," etc. Be respectful of Hindu tradition.`
      case 'torah':
        return basePrompt + `\n\nYou are working with the Torah. Reference Jewish themes, Torah wisdom, and Jewish teachings. Use terms like "the Lord," "Torah wisdom," "divine guidance," etc. Be respectful of Jewish tradition.`
      case 'hafez':
        return basePrompt + `\n\nYou are working with the Divan of Hafez (Persian poetry). Reference Sufi themes, poetic wisdom, and mystical insights. Use terms like "divine love," "mystical wisdom," "poetic guidance," etc. Be respectful of Persian and Sufi tradition.`
      default:
        return basePrompt
    }
  }

  /**
   * Generate comprehensive bibliomancy reading for a user
   */
  async generateReading(
    userId: string,
    userProfile: UserProfile | null,
    question?: string,
    textType: SacredTextType = 'bible' // Default to bible for backward compatibility
  ): Promise<BibliomancyReading> {
    // Check cache first
    const cacheKey = `${userId}-${textType}-${userProfile?.birthDate || 'default'}-${question || 'comprehensive'}`
    const cached = this.cache.get(cacheKey)
    if (cached) {
      const cacheAge = Date.now() - cached.timestamp.getTime()
      if (cacheAge < this.CACHE_TTL) {
        return cached
      } else {
        this.cache.delete(cacheKey)
      }
    }

    // Try to load from Firestore if available
    if (this.db && userProfile?.birthDate) {
      try {
        const recentReadings = await this.getUserReadings(userId)
        const matchingReading = recentReadings.find(r => r.textType === textType)
        if (matchingReading) {
          const readingAge = Date.now() - matchingReading.timestamp.getTime()
          if (readingAge < this.CACHE_TTL && (!question || matchingReading.questionReading?.question === question)) {
            this.cache.set(cacheKey, matchingReading)
            return matchingReading
          }
        }
      } catch (error) {
        console.warn('Could not load from Firestore, generating new reading:', error)
      }
    }

    // Check if we have complete profile data
    const hasCompleteProfile = userProfile?.birthDate && 
                               userProfile?.birthTime && 
                               userProfile?.birthPlace

    console.log('📋 Profile completeness check:', {
      hasBirthDate: !!userProfile?.birthDate,
      hasBirthTime: !!userProfile?.birthTime,
      hasBirthPlace: !!userProfile?.birthPlace,
      isComplete: hasCompleteProfile,
      displayName: userProfile?.displayName || userProfile?.fullName,
      textType,
      textTypeReceived: textType
    })
    
    console.log('🔍 Text type validation:', {
      textType,
      isValid: ['bible', 'quran', 'bhagavad-gita', 'torah', 'hafez'].includes(textType)
    })

    if (!hasCompleteProfile) {
      console.log('ℹ️ Profile incomplete - generating basic reading')
      return this.generateBasicReading(userId, userProfile, question, textType)
    }

    console.log('✅ Profile complete - generating comprehensive AI reading')
    // Generate comprehensive reading using AI
    const reading = await this.generateComprehensiveReading(userId, userProfile, question, textType)

    // Cache the reading
    this.cache.set(cacheKey, reading)

    // Save to Firestore
    await this.saveReading(userId, reading)

    return reading
  }

  /**
   * Generate basic reading for incomplete profiles
   */
  private generateBasicReading(
    userId: string,
    userProfile: UserProfile | null,
    question?: string,
    textType: SacredTextType = 'bible'
  ): BibliomancyReading {
    const displayName = userProfile?.displayName || userProfile?.fullName || 'Beloved Seeker'
    const randomPassages = this.getTextRandomPassages(textType, 3)
    
    const passages: Passage[] = randomPassages.map(p => this.convertToUnifiedPassage(textType, p)).map(p => ({
      ...p,
      interpretation: 'This passage offers divine guidance for your journey.',
      application: 'Reflect on this passage and how it relates to your current situation.'
    }))

    const textNames: Record<SacredTextType, string> = {
      'bible': 'Bible',
      'quran': 'Quran',
      'bhagavad-gita': 'Bhagavad Gita',
      'torah': 'Torah',
      'hafez': 'Divan of Hafez'
    }

    return {
      id: `basic-${Date.now()}`,
      timestamp: new Date(),
      userId,
      textType,
      divineMessage: {
        overview: `Dear ${displayName}, the sacred texts hold profound wisdom for your journey. To receive the most detailed and personalized bibliomancy reading, please complete your birth information in your profile.`,
        keyInsights: [
          `The ${textNames[textType]} offers timeless wisdom for every aspect of life`,
          'Divine guidance is available to all who seek it',
          'Complete your profile to unlock personalized insights'
        ],
        personalMessage: `The sacred texts are ready to reveal their wisdom to you, ${displayName}. Complete your birth details to receive a comprehensive bibliomancy reading tailored to your unique path.`
      },
      selectedPassages: passages,
      lifeAreaGuidance: this.generateBasicLifeAreaGuidance(textType),
      symbolicMeanings: {
        themes: ['Guidance', 'Wisdom', 'Divine Love'],
        symbols: ['Book', 'Light', 'Path'],
        numbers: []
      },
      practicalApplications: {
        actions: [
          'Complete your birth information for personalized readings',
          'Meditate on the selected passages',
          'Seek guidance through prayer and reflection'
        ],
        affirmations: [
          'I am open to receiving divine wisdom',
          'The sacred texts guide my path',
          'I trust in divine timing and guidance'
        ],
        practices: [
          `Daily ${textNames[textType]} reading`,
          'Prayer and meditation',
          'Reflection on sacred passages'
        ]
      },
      spiritualInsights: {
        current: 'The sacred texts are ready to speak to your heart. Complete your profile to receive detailed guidance.',
        future: [
          'Personalized passages will be revealed',
          'Life area guidance will be provided',
          'Spiritual insights will deepen'
        ],
        warnings: []
      },
      questionReading: question ? {
        question,
        passage: passages[0],
        interpretation: 'This passage offers guidance for your question. Reflect on its meaning in relation to your situation.'
      } : undefined,
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * Generate basic life area guidance
   */
  private generateBasicLifeAreaGuidance(textType: SacredTextType = 'bible'): BibliomancyReading['lifeAreaGuidance'] {
    const textPassages = this.getTextPassagesArray(textType)
    const lovePassages = this.getTextPassagesByLifeArea(textType, 'love')
    const careerPassages = this.getTextPassagesByLifeArea(textType, 'career')
    const healthPassages = this.getTextPassagesByLifeArea(textType, 'health')
    const spiritualityPassages = textPassages.filter((p: any) => p.themes.some((t: string) => t.toLowerCase().includes('spirituality') || t.toLowerCase().includes('faith')))
    const financesPassages = this.getTextPassagesByLifeArea(textType, 'finances')
    const relationshipsPassages = this.getTextPassagesByLifeArea(textType, 'relationships')

    const lovePassage = lovePassages[0] || textPassages[0]
    const careerPassage = careerPassages[0] || textPassages[0]
    const healthPassage = healthPassages[0] || textPassages[0]
    const spiritualityPassage = spiritualityPassages[0] || textPassages[0]
    const financesPassage = financesPassages[0] || textPassages[0]
    const relationshipsPassage = relationshipsPassages[0] || textPassages[0]

    const createGuidance = (passage: any): Guidance => {
      const unified = this.convertToUnifiedPassage(textType, passage)
      const themes = (unified.themes && unified.themes.length > 0)
        ? unified.themes.join(', ')
        : 'wisdom and guidance'
      return {
        passage: {
          ...unified,
          interpretation: `This passage from ${unified.reference} speaks to ${themes}. Complete your profile to receive personalized guidance.`,
          application: `Reflect on how the themes of ${themes} apply to your current situation.`
        },
        message: 'Complete your profile to receive personalized guidance for this life area.',
        actions: ['Complete your profile', 'Reflect on the passage', 'Seek divine guidance'],
        affirmations: ['I am open to divine guidance', 'Wisdom is available to me']
      }
    }

    return {
      love: createGuidance(lovePassage),
      career: createGuidance(careerPassage),
      health: createGuidance(healthPassage),
      spirituality: createGuidance(spiritualityPassage),
      finances: createGuidance(financesPassage),
      relationships: createGuidance(relationshipsPassage)
    }
  }

  /**
   * Generate comprehensive reading using AI
   */
  private async generateComprehensiveReading(
    userId: string,
    userProfile: UserProfile,
    question?: string,
    textType: SacredTextType = 'bible'
  ): Promise<BibliomancyReading> {
    const displayName = userProfile.displayName || userProfile.fullName || 'Beloved Seeker'
    const birthDate = userProfile.birthDate || ''
    const birthTime = userProfile.birthTime || ''
    const birthPlace = userProfile.birthPlace || ''

    // Select passages for different life areas using text-specific functions
    console.log(`📚 Loading passages for text type: ${textType}`)
    const lovePassages = this.getTextPassagesByLifeArea(textType, 'love')
    const careerPassages = this.getTextPassagesByLifeArea(textType, 'career')
    const healthPassages = this.getTextPassagesByLifeArea(textType, 'health')
    const textPassages = this.getTextPassagesArray(textType)
    const spiritualityPassages = textPassages.filter((p: any) => p.themes.some((t: string) => t.toLowerCase().includes('spirituality') || t.toLowerCase().includes('faith')))
    const financesPassages = this.getTextPassagesByLifeArea(textType, 'finances')
    const relationshipsPassages = this.getTextPassagesByLifeArea(textType, 'relationships')
    
    console.log(`📊 Passage counts for ${textType}:`, {
      love: lovePassages.length,
      career: careerPassages.length,
      health: healthPassages.length,
      spirituality: spiritualityPassages.length,
      finances: financesPassages.length,
      relationships: relationshipsPassages.length,
      total: textPassages.length
    })

    // Select random passages for each area
    const selectedLove = lovePassages.length > 0 ? lovePassages[Math.floor(Math.random() * lovePassages.length)] : this.getTextRandomPassages(textType, 1)[0]
    const selectedCareer = careerPassages.length > 0 ? careerPassages[Math.floor(Math.random() * careerPassages.length)] : this.getTextRandomPassages(textType, 1)[0]
    const selectedHealth = healthPassages.length > 0 ? healthPassages[Math.floor(Math.random() * healthPassages.length)] : this.getTextRandomPassages(textType, 1)[0]
    const selectedSpirituality = spiritualityPassages.length > 0 ? spiritualityPassages[Math.floor(Math.random() * spiritualityPassages.length)] : this.getTextRandomPassages(textType, 1)[0]
    const selectedFinances = financesPassages.length > 0 ? financesPassages[Math.floor(Math.random() * financesPassages.length)] : this.getTextRandomPassages(textType, 1)[0]
    const selectedRelationships = relationshipsPassages.length > 0 ? relationshipsPassages[Math.floor(Math.random() * relationshipsPassages.length)] : this.getTextRandomPassages(textType, 1)[0]

    // Get additional random passages for the reading
    const additionalPassages = this.getTextRandomPassages(textType, 3)

    try {
      // Check if Groq API key is available
      if (!process.env.GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY is not set in environment variables')
        throw new Error('Groq API key is not configured')
      }

      console.log('📖 Starting Groq API call for bibliomancy reading')
      console.log('👤 User:', displayName, '| Birth:', birthDate, birthTime, birthPlace, '| Text:', textType)
      
      // Generate comprehensive interpretation using Groq AI
      const systemPrompt = this.getTextSystemPrompt(textType)

      // Convert passages to unified format for display
      const unifiedLove = this.convertToUnifiedPassage(textType, selectedLove)
      const unifiedCareer = this.convertToUnifiedPassage(textType, selectedCareer)
      const unifiedHealth = this.convertToUnifiedPassage(textType, selectedHealth)
      const unifiedSpirituality = this.convertToUnifiedPassage(textType, selectedSpirituality)
      const unifiedFinances = this.convertToUnifiedPassage(textType, selectedFinances)
      const unifiedRelationships = this.convertToUnifiedPassage(textType, selectedRelationships)

      const passagesContext = `
Selected Passages:
- Love: ${unifiedLove.reference} - "${unifiedLove.text}"
- Career: ${unifiedCareer.reference} - "${unifiedCareer.text}"
- Health: ${unifiedHealth.reference} - "${unifiedHealth.text}"
- Spirituality: ${unifiedSpirituality.reference} - "${unifiedSpirituality.text}"
- Finances: ${unifiedFinances.reference} - "${unifiedFinances.text}"
- Relationships: ${unifiedRelationships.reference} - "${unifiedRelationships.text}"
`

      const userPrompt = `Generate a comprehensive bibliomancy reading for ${displayName}.

Birth Information:
- Date: ${birthDate}
- Time: ${birthTime}
- Place: ${birthPlace}
${question ? `\nQuestion: ${question}` : ''}

${passagesContext}

IMPORTANT: Format your response EXACTLY as follows. Use clear section headers and bullet points. Do NOT use markdown formatting like ** or *. Use plain text only.

=== DIVINE MESSAGE ===

Overview: [Write 4-6 sentences about the divine message revealed through these passages. Be specific and personal.]

Key Insights:
- [Insight 1: specific and personal]
- [Insight 2: specific and personal]
- [Insight 3: specific and personal]
- [Insight 4: specific and personal]

=== LIFE AREA GUIDANCE ===

Love:
Passage Interpretation: [How the love passage applies to ${displayName} - 2-3 sentences]
Application: [One specific action or reflection for this passage - 1 sentence]
Message: [Personal message about love - 2-3 sentences]
Actions:
- [Action 1]
- [Action 2]
- [Action 3]
Affirmations:
- [Affirmation 1]
- [Affirmation 2]

Career:
Passage Interpretation: [How the career passage applies to ${displayName} - 2-3 sentences]
Application: [One specific action or reflection for this passage - 1 sentence]
Message: [Personal message about career - 2-3 sentences]
Actions:
- [Action 1]
- [Action 2]
- [Action 3]
Affirmations:
- [Affirmation 1]
- [Affirmation 2]

Health:
Passage Interpretation: [How the health passage applies to ${displayName} - 2-3 sentences]
Application: [One specific action or reflection for this passage - 1 sentence]
Message: [Personal message about health - 2-3 sentences]
Actions:
- [Action 1]
- [Action 2]
- [Action 3]
Affirmations:
- [Affirmation 1]
- [Affirmation 2]

Spirituality:
Passage Interpretation: [How the spirituality passage applies to ${displayName} - 2-3 sentences]
Application: [One specific action or reflection for this passage - 1 sentence]
Message: [Personal message about spirituality - 2-3 sentences]
Actions:
- [Action 1]
- [Action 2]
- [Action 3]
Affirmations:
- [Affirmation 1]
- [Affirmation 2]

Finances:
Passage Interpretation: [How the finances passage applies to ${displayName} - 2-3 sentences]
Application: [One specific action or reflection for this passage - 1 sentence]
Message: [Personal message about finances - 2-3 sentences]
Actions:
- [Action 1]
- [Action 2]
- [Action 3]
Affirmations:
- [Affirmation 1]
- [Affirmation 2]

Relationships:
Passage Interpretation: [How the relationships passage applies to ${displayName} - 2-3 sentences]
Application: [One specific action or reflection for this passage - 1 sentence]
Message: [Personal message about relationships - 2-3 sentences]
Actions:
- [Action 1]
- [Action 2]
- [Action 3]
Affirmations:
- [Affirmation 1]
- [Affirmation 2]

=== SYMBOLIC MEANINGS ===

Themes:
- [Theme 1]
- [Theme 2]
- [Theme 3]
- [Theme 4]

Symbols:
- [Symbol 1]
- [Symbol 2]
- [Symbol 3]

Numbers:
- [Number 1 and its meaning]
- [Number 2 and its meaning]

=== PRACTICAL APPLICATIONS ===

Actions:
- [Action 1]
- [Action 2]
- [Action 3]
- [Action 4]
- [Action 5]

Affirmations:
- [Affirmation 1]
- [Affirmation 2]
- [Affirmation 3]
- [Affirmation 4]
- [Affirmation 5]

Practices:
- [Practice 1]
- [Practice 2]
- [Practice 3]
- [Practice 4]

=== SPIRITUAL INSIGHTS ===

Current: [Current spiritual insight - 3-4 sentences]

Future:
- [Future insight 1]
- [Future insight 2]
- [Future insight 3]

Warnings:
- [Warning 1 if any, or "None"]
- [Warning 2 if any, or omit]

=== PERSONAL MESSAGE ===

[Write a beautiful, inspiring closing message - 4-6 sentences that addresses ${displayName} directly and speaks to their soul. Do NOT repeat information from above sections.]

${question ? `\n=== QUESTION READING ===\n\nQuestion: ${question}\n\nPassage Interpretation: [How the selected passage answers the question - 3-4 sentences]` : ''}

Remember: Use plain text only. No markdown formatting. Be specific and personal. Address ${displayName} directly using "you" and "your".`

      console.log('🔄 Calling AI Gateway/Groq API with model: llama-3.3-70b-versatile')
      const result = await createAICompletion({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        maxTokens: 4000,
        topP: 0.9,
        frequencyPenalty: 0.3,
        presencePenalty: 0.3
      })

      console.log('✅ AI Gateway/Groq API call successful')
      const aiResponse = result.content || ''
      
      if (!aiResponse || aiResponse.length < 100) {
        console.warn('⚠️ Groq API returned empty or very short response:', aiResponse.length, 'characters')
        throw new Error('Groq API returned insufficient response')
      }

      console.log('📝 Parsing AI response, length:', aiResponse.length)
      
      // Parse AI response into structured format
      const parsed = this.parseAIResponse(
        aiResponse, 
        displayName, 
        userId,
        textType,
        {
          love: selectedLove,
          career: selectedCareer,
          health: selectedHealth,
          spirituality: selectedSpirituality,
          finances: selectedFinances,
          relationships: selectedRelationships
        },
        additionalPassages,
        question
      )

      console.log('✅ Successfully parsed bibliomancy reading')
      return parsed
    } catch (error: any) {
      console.error('❌ Error generating bibliomancy reading:', error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
        response: error?.response?.data || error?.response
      })
      
      // Log if it's a Groq API error specifically
      if (error?.message?.includes('Groq') || error?.message?.includes('API')) {
        console.error('🚨 Groq API Error:', error.message)
      }
      
      // Log if it's a parsing error
      if (error?.message?.includes('parse') || error?.message?.includes('Parse')) {
        console.error('🚨 Parsing Error:', error.message)
      }
      
      console.log('⚠️ Falling back to generic reading due to error')
      return this.generateFallbackReading(userId, userProfile, question, textType)
    }
  }

  /**
   * Parse AI response into structured BibliomancyReading
   */
  private parseAIResponse(
    aiResponse: string,
    displayName: string,
    userId: string,
    textType: SacredTextType,
    selectedPassages: Record<string, any>,
    additionalPassages: any[],
    question?: string
  ): BibliomancyReading {
    // Helper function to clean text
    const cleanText = (text: string): string => {
      if (!text) return ''
      text = text.replace(/\*\*/g, '')
      text = text.replace(/\*/g, '')
      text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      text = text.replace(/^[-•*]\s*/gm, '')
      text = text.replace(/^\d+\.\s*/gm, '')
      text = text.replace(/\n{3,}/g, '\n\n')
      text = text.trim()
      return text
    }

    // Extract sections
    const extractSection = (sectionName: string, content: string, nextSection?: string): string => {
      const patterns = [
        new RegExp(`${sectionName}[\\s:]*([\\s\\S]*?)(?=${nextSection || '===|Love:|Career:|Health:|Spirituality:|Finances:|Relationships:|Application:|Message:|Themes:|Symbols:|Numbers:|Actions:|Affirmations:|Practices:|Current:|Future:|Warnings:|PERSONAL MESSAGE'}|$)`, 'i'),
        new RegExp(`${sectionName}[\\s:]*([\\s\\S]*?)(?=\\n\\n===|$)`, 'i')
      ]
      
      for (const pattern of patterns) {
        const match = content.match(pattern)
        if (match && match[1]) {
          const text = cleanText(match[1].trim())
          return text
        }
      }
      return ''
    }

    const extractList = (sectionName: string, content: string, maxItems: number = 10): string[] => {
      const sectionPattern = new RegExp(`${sectionName}[\\s:]*([\\s\\S]*?)(?=\\n(?:===|Love:|Career:|Health:|Spirituality:|Finances:|Relationships:|Application:|Message:|Themes:|Symbols:|Numbers:|Actions:|Affirmations:|Practices:|Current:|Future:|Warnings:|PERSONAL MESSAGE)|$)`, 'i')
      const sectionMatch = content.match(sectionPattern)
      
      if (!sectionMatch || !sectionMatch[1]) return []
      
      const items = sectionMatch[1]
        .split(/\n/)
        .map(line => cleanText(line))
        .filter(line => {
          const trimmed = line.trim()
          return trimmed.length > 3 && 
                 !trimmed.match(/^(===|Love|Career|Health|Spirituality|Finances|Relationships|Themes|Symbols|Numbers|Actions|Affirmations|Practices|Current|Future|Warnings|PERSONAL MESSAGE|Passage Interpretation|Application|Message)/i)
        })
        .map(item => item.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
        .filter(item => item.length > 0)
      
      return Array.from(new Set(items)).slice(0, maxItems)
    }

    // Extract divine message
    const divineMessageSection = aiResponse.match(/=== DIVINE MESSAGE ===([\s\S]*?)(?=== LIFE AREA|=== SYMBOLIC|=== PRACTICAL|=== SPIRITUAL|=== PERSONAL|$)/i)
    const overview = divineMessageSection 
      ? extractSection('Overview', divineMessageSection[1]) 
      : `Dear ${displayName}, the sacred texts reveal divine wisdom for your journey.`
    const keyInsights = divineMessageSection 
      ? extractList('Key Insights', divineMessageSection[1], 5)
      : ['The Bible offers timeless wisdom', 'Divine guidance is available', 'Trust in the sacred texts']

    // Extract life area guidance
    const lifeAreaSection = aiResponse.match(/=== LIFE AREA GUIDANCE ===([\s\S]*?)(?=== SYMBOLIC|=== PRACTICAL|=== SPIRITUAL|=== PERSONAL|$)/i)
    
    const extractLifeAreaGuidance = (area: string, passage: any): Guidance => {
      const unified = this.convertToUnifiedPassage(textType, passage)
      
      if (!lifeAreaSection) {
        const themes = (unified.themes && unified.themes.length > 0)
          ? unified.themes.join(', ')
          : 'wisdom and guidance'
        return {
          passage: {
            ...unified,
            interpretation: `This passage from ${unified.reference} speaks to ${themes}. It offers guidance for your ${area.toLowerCase()}.`,
            application: `Reflect on how the themes of ${themes} apply to your ${area.toLowerCase()}.`
          },
          message: `The sacred text offers guidance for your ${area}.`,
          actions: ['Reflect on the passage', 'Seek divine guidance', 'Apply the wisdom'],
          affirmations: ['I am open to divine guidance', 'Wisdom is available to me']
        }
      }

      // Get other area names (capitalized) for the regex pattern
      const otherAreas = Object.keys(selectedPassages)
        .filter(a => a.toLowerCase() !== area.toLowerCase())
        .map(a => a.charAt(0).toUpperCase() + a.slice(1))
        .join('|')
      
      const areaPattern = new RegExp(`${area}:([\\s\\S]*?)(?=\\n(?:${otherAreas}:|===|$))`, 'i')
      const areaMatch = lifeAreaSection[1].match(areaPattern)
      
      if (!areaMatch) {
        const themes = (unified.themes && unified.themes.length > 0)
          ? unified.themes.join(', ')
          : 'wisdom and guidance'
        return {
          passage: {
            ...unified,
            interpretation: `This passage from ${unified.reference} speaks to ${themes}. It offers guidance for your ${area.toLowerCase()}.`,
            application: `Reflect on how the themes of ${themes} apply to your ${area.toLowerCase()}.`
          },
          message: `The sacred text offers guidance for your ${area}.`,
          actions: ['Reflect on the passage', 'Seek divine guidance'],
          affirmations: ['I am open to divine guidance']
        }
      }

      const areaText = areaMatch[1]
      const interpretation = extractSection('Passage Interpretation', areaText) || 'This passage offers divine guidance.'
      const application = extractSection('Application', areaText) || `Apply the insight above to your ${area.toLowerCase()}.`
      const message = extractSection('Message', areaText) || `The sacred text offers guidance for your ${area}.`
      const actions = extractList('Actions', areaText, 4)
      const affirmations = extractList('Affirmations', areaText, 3)

      return {
        passage: {
          ...unified,
          interpretation: cleanText(interpretation),
          application: cleanText(application)
        },
        message: cleanText(message),
        actions: actions.length > 0 ? actions : ['Reflect on the passage', 'Seek divine guidance'],
        affirmations: affirmations.length > 0 ? affirmations : ['I am open to divine guidance']
      }
    }

    // Extract symbolic meanings
    const symbolicSection = aiResponse.match(/=== SYMBOLIC MEANINGS ===([\s\S]*?)(?=== PRACTICAL|=== SPIRITUAL|=== PERSONAL|$)/i)
    const themes = symbolicSection ? extractList('Themes', symbolicSection[1], 5) : ['Guidance', 'Wisdom', 'Divine Love']
    const symbols = symbolicSection ? extractList('Symbols', symbolicSection[1], 4) : ['Book', 'Light', 'Path']
    const numbers = symbolicSection ? extractList('Numbers', symbolicSection[1], 3) : []

    // Extract practical applications
    const practicalSection = aiResponse.match(/=== PRACTICAL APPLICATIONS ===([\s\S]*?)(?=== SPIRITUAL|=== PERSONAL|$)/i)
    const actions = practicalSection ? extractList('Actions', practicalSection[1], 6) : ['Meditate on the passages', 'Apply the wisdom', 'Seek divine guidance']
    const affirmations = practicalSection ? extractList('Affirmations', practicalSection[1], 6) : ['I am open to divine wisdom', 'The sacred texts guide me']
    const practices = practicalSection ? extractList('Practices', practicalSection[1], 5) : ['Daily Bible reading', 'Prayer and meditation']

    // Extract spiritual insights
    const spiritualSection = aiResponse.match(/=== SPIRITUAL INSIGHTS ===([\s\S]*?)(?=== PERSONAL|$)/i)
    const current = spiritualSection ? extractSection('Current', spiritualSection[1]) : 'The sacred texts offer spiritual guidance for your journey.'
    const future = spiritualSection ? extractList('Future', spiritualSection[1], 4) : ['Continued spiritual growth', 'Deepening faith']
    const warnings = spiritualSection ? extractList('Warnings', spiritualSection[1], 3).filter(w => !w.toLowerCase().includes('none')) : []

    // Extract personal message
    const personalMessageSection = aiResponse.match(/=== PERSONAL MESSAGE ===([\s\S]*?)$/i)
    const personalMessage = personalMessageSection 
      ? cleanText(personalMessageSection[1].trim())
      : `Dear ${displayName}, the sacred texts hold profound wisdom for your journey. Trust in the divine guidance revealed through these passages.`

    // Extract question reading if present
    let questionReading: BibliomancyReading['questionReading'] = undefined
    if (question) {
      const questionSection = aiResponse.match(/=== QUESTION READING ===([\s\S]*?)(?=== PERSONAL|$)/i)
      const questionPassageRaw = additionalPassages[0] || this.getTextRandomPassages(textType, 1)[0]
      const questionPassage = this.convertToUnifiedPassage(textType, questionPassageRaw)
      const questionInterpretation = questionSection 
        ? extractSection('Passage Interpretation', questionSection[1])
        : 'This passage offers guidance for your question. Reflect on its meaning in relation to your situation.'
      
      questionReading = {
        question,
        passage: {
          ...questionPassage,
          interpretation: cleanText(questionInterpretation),
          application: 'Reflect on how this passage answers your question.'
        },
        interpretation: cleanText(questionInterpretation)
      }
    }

    // Build life area guidance first (needed for selectedPassagesArray)
    const lifeAreaGuidance = {
      love: extractLifeAreaGuidance('Love', selectedPassages.love),
      career: extractLifeAreaGuidance('Career', selectedPassages.career),
      health: extractLifeAreaGuidance('Health', selectedPassages.health),
      spirituality: extractLifeAreaGuidance('Spirituality', selectedPassages.spirituality),
      finances: extractLifeAreaGuidance('Finances', selectedPassages.finances),
      relationships: extractLifeAreaGuidance('Relationships', selectedPassages.relationships)
    }

    // Build selected passages from life area guidance (use AI-extracted interpretation/application)
    const areaOrder = ['love', 'career', 'health', 'spirituality', 'finances', 'relationships'] as const
    const mainPassages: Passage[] = areaOrder.map(area => lifeAreaGuidance[area].passage)

    // Additional passages: derive interpretation/application from metadata
    const additionalPassagesWithContext = additionalPassages.slice(0, 2).map(p => {
      const unified = this.convertToUnifiedPassage(textType, p)
      const themes = (unified.themes && unified.themes.length > 0)
        ? unified.themes.join(', ')
        : 'wisdom and guidance'
      return {
        ...unified,
        interpretation: `This passage from ${unified.reference} speaks to ${themes}. Consider how its themes apply to your situation.`,
        application: `Reflect on how the themes of ${themes} from this passage apply to your current life.`
      }
    })

    const selectedPassagesArray: Passage[] = [...mainPassages, ...additionalPassagesWithContext]

    return {
      id: `bibliomancy-${Date.now()}`,
      timestamp: new Date(),
      userId,
      textType,
      divineMessage: {
        overview: cleanText(overview),
        keyInsights,
        personalMessage: cleanText(personalMessage)
      },
      selectedPassages: selectedPassagesArray,
      lifeAreaGuidance,
      symbolicMeanings: {
        themes,
        symbols,
        numbers
      },
      practicalApplications: {
        actions,
        affirmations,
        practices
      },
      spiritualInsights: {
        current: cleanText(current),
        future,
        warnings
      },
      questionReading,
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * Generate fallback reading if AI fails
   */
  private generateFallbackReading(
    userId: string,
    userProfile: UserProfile,
    question?: string,
    textType: SacredTextType = 'bible'
  ): BibliomancyReading {
    const displayName = userProfile.displayName || userProfile.fullName || 'Beloved Seeker'
    const passagesRaw = this.getTextRandomPassages(textType, 5)
    const passages = passagesRaw.map(p => this.convertToUnifiedPassage(textType, p))
    
    const textNames: Record<SacredTextType, string> = {
      'bible': 'Bible',
      'quran': 'Quran',
      'bhagavad-gita': 'Bhagavad Gita',
      'torah': 'Torah',
      'hafez': 'Divan of Hafez'
    }

    return {
      id: `fallback-${Date.now()}`,
      timestamp: new Date(),
      userId,
      textType,
      divineMessage: {
        overview: `Dear ${displayName}, the sacred texts reveal divine wisdom for your journey. The ${textNames[textType]} offers timeless guidance for every aspect of life.`,
        keyInsights: [
          `The ${textNames[textType]} offers timeless wisdom for every aspect of life`,
          'Divine guidance is available to all who seek it',
          'Trust in the sacred texts and their application to your life'
        ],
        personalMessage: `Dear ${displayName}, the sacred texts hold profound wisdom for your journey. Trust in the divine guidance revealed through these passages and apply their wisdom to your life.`
      },
      selectedPassages: passages.map(p => {
        const themes = (p.themes && p.themes.length > 0) ? p.themes.join(', ') : 'wisdom and guidance'
        return {
          ...p,
          interpretation: `This passage from ${p.reference} speaks to ${themes}. Consider how these themes apply to your journey.`,
          application: `Reflect on how the themes of ${themes} apply to your current situation.`
        }
      }),
      lifeAreaGuidance: this.generateBasicLifeAreaGuidance(textType),
      symbolicMeanings: {
        themes: ['Guidance', 'Wisdom', 'Divine Love', 'Faith'],
        symbols: ['Book', 'Light', 'Path', 'Cross'],
        numbers: []
      },
      practicalApplications: {
        actions: [
          'Meditate on the selected passages',
          'Apply the wisdom to your daily life',
          'Seek divine guidance through prayer',
          'Share the wisdom with others'
        ],
        affirmations: [
          'I am open to receiving divine wisdom',
          'The sacred texts guide my path',
          'I trust in divine timing and guidance',
          'Wisdom flows through me'
        ],
        practices: [
          `Daily ${textNames[textType]} reading`,
          'Prayer and meditation',
          'Reflection on sacred passages',
          'Application of sacred wisdom'
        ]
      },
      spiritualInsights: {
        current: `Dear ${displayName}, the sacred texts offer spiritual guidance for your journey. Trust in the divine wisdom revealed through these passages.`,
        future: [
          'Continued spiritual growth',
          'Deepening faith and understanding',
          'Greater alignment with divine purpose'
        ],
        warnings: []
      },
      questionReading: question ? {
        question,
        passage: {
          ...passages[0],
          interpretation: 'This passage offers guidance for your question. Reflect on its meaning in relation to your situation.',
          application: 'Apply the wisdom of this passage to your question.'
        },
        interpretation: 'This passage offers guidance for your question. Reflect on its meaning in relation to your situation.'
      } : undefined,
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * Save reading to Firestore
   */
  async saveReading(userId: string, reading: BibliomancyReading): Promise<void> {
    if (!this.db) {
      console.warn('Firestore not available, skipping save')
      return
    }

    try {
      const readingRef = doc(this.db, 'users', userId, 'bibliomancy-readings', reading.id)
      await setDoc(readingRef, {
        ...reading,
        timestamp: Timestamp.fromDate(reading.timestamp)
      })
      console.log('✅ Saved bibliomancy reading to Firestore')
    } catch (error) {
      console.error('Error saving bibliomancy reading:', error)
    }
  }

  /**
   * Get all readings for a user
   */
  async getUserReadings(userId: string): Promise<BibliomancyReading[]> {
    if (!this.db) {
      return []
    }

    try {
      const userDocRef = doc(this.db, 'users', userId)
      const readingsRef = collection(userDocRef, 'bibliomancy-readings')
      const q = query(readingsRef, orderBy('timestamp', 'desc'))
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          timestamp: data.timestamp.toDate()
        } as BibliomancyReading
      })
    } catch (error) {
      console.error('Error loading user bibliomancy readings:', error)
      return []
    }
  }
}

export const bibliomancyIntelligence = new BibliomancyIntelligence()

