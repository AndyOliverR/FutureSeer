/**
 * Ogham Intelligence
 * Comprehensive Ogham divination with AI-enhanced interpretations
 */

import { doc, setDoc, getDoc, collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from './firebase'
import { UserProfile } from './firebase'
import { createAICompletion } from './aiGateway'
import {
  generateOghamReportStructure,
  generateNameAnalysis,
  generateBirthTreeAnalysis,
  OghamReport
} from './ogham/oghamReportGenerator'
import { isProfileComplete } from './firebase'


class OghamIntelligence {
  private db: any = null
  private cache = new Map<string, OghamReport>()
  private readonly CACHE_TTL = 1000 * 60 * 60 // 1 hour cache

  constructor() {
    try {
      this.db = getFirebaseDB()
    } catch (error) {
      devLog.warn('Firebase not available for Ogham Intelligence', undefined, 'oghamIntelligence')
    }
  }

  /**
   * Generate comprehensive Ogham reading for a user
   */
  async generateReading(
    userId: string,
    userProfile: UserProfile | null
  ): Promise<OghamReport> {
    // Check cache first
    const cacheKey = `${userId}-${userProfile?.birthDate || 'default'}-${userProfile?.fullName || 'default'}`
    const cached = this.cache.get(cacheKey)
    if (cached) {
      // Check if cache is still valid (within TTL)
      const cacheAge = Date.now() - cached.timestamp.getTime()
      if (cacheAge < this.CACHE_TTL) {
        return cached
      } else {
        // Remove expired cache
        this.cache.delete(cacheKey)
      }
    }

    // Try to load from Firestore if available
    if (this.db && userProfile?.birthDate) {
      try {
        const recentReadings = await this.getUserReadings(userId)
        if (recentReadings.length > 0) {
          const mostRecent = recentReadings[0]
          const readingAge = Date.now() - mostRecent.timestamp.getTime()
          if (readingAge < this.CACHE_TTL) {
            this.cache.set(cacheKey, mostRecent)
            return mostRecent
          }
        }
      } catch (error) {
        devLog.warn('Could not load from Firestore, generating new reading:', error, 'oghamIntelligence')
      }
    }

    // Check if we have complete profile data
    const hasCompleteProfile = isProfileComplete(userProfile)

    if (!hasCompleteProfile) {
      // Return a basic reading encouraging profile completion
      return this.generateBasicReading(userId, userProfile)
    }

    // Generate comprehensive reading using AI (userProfile non-null after hasCompleteProfile check)
    const reading = await this.generateComprehensiveReading(userId, userProfile!)

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
    userProfile: UserProfile | null
  ): OghamReport {
    const displayName = userProfile?.displayName || userProfile?.fullName || 'Beloved Seeker'
    const nameAnalysis = generateNameAnalysis(userProfile)
    const birthTree = generateBirthTreeAnalysis(userProfile)
    
    return generateOghamReportStructure(
      userId,
      userProfile,
      nameAnalysis,
      birthTree,
      {
        overview: `Dear ${displayName}, the ancient Ogham alphabet holds profound wisdom about your path through the Celtic tree tradition. To access the most detailed insights about your birth tree, name analysis, and Celtic guidance, please complete your birth information in your profile.`,
        personalMessage: `The trees speak your name, ${displayName}, but to fully understand your connection to the Ogham alphabet and your birth tree, complete your birth date, time, and place. The Celtic wisdom of the trees awaits you.`
      }
    )
  }

  /**
   * Generate comprehensive reading using AI
   */
  private async generateComprehensiveReading(
    userId: string,
    userProfile: UserProfile
  ): Promise<OghamReport> {
    const displayName = userProfile.displayName || userProfile.fullName || 'Beloved Seeker'
    const birthDate = userProfile.birthDate || ''
    const birthTime = userProfile.birthTime || ''
    const birthPlace = userProfile.birthPlace || ''

    // Generate base analysis
    const nameAnalysis = generateNameAnalysis(userProfile)
    const birthTree = generateBirthTreeAnalysis(userProfile)

    try {
      // Generate AI-enhanced insights using Groq
      const systemPrompt = `You are a master Ogham reader with deep knowledge of Celtic traditions, tree symbolism, and the Ogham alphabet. The Ogham (pronounced "O-m" or "O-gam") is an early medieval alphabet used to write Primitive and Old Irish, consisting of 20 basic letters (feda) each associated with a tree.

Key Concepts:
- Each Ogham letter represents a tree with specific meanings, symbolism, and Celtic lore
- The Ogham alphabet connects the user to Celtic wisdom and natural forces
- Birth trees reveal life path and personal traits
- Name transliteration to Ogham reveals character and destiny
- Celtic traditions honor the natural world and tree energies

Guidelines:
- Address the user by their name directly (use "you" and "your")
- Be profound yet practical
- Connect tree symbolism to personal life
- Reference Celtic mythology and traditions authentically
- Use mystical language that feels authentic
- Make it deeply personal and transformative
- DO NOT use markdown formatting (no **, *, or []())
- DO NOT repeat information across sections
- Be concise and specific - avoid generic statements
- Each section should be unique and not repeat content from other sections`

      const userPrompt = `Generate a comprehensive Ogham reading for ${displayName}.

Birth Information:
- Date: ${birthDate}
- Time: ${birthTime}
- Place: ${birthPlace}

Name: ${nameAnalysis.originalName}
Name in Ogham: ${nameAnalysis.oghamScript}
Birth Tree: ${birthTree.birthTree.tree} (${birthTree.birthTree.name})
Birth Tree Meaning: ${birthTree.birthTree.meaning}

IMPORTANT: Format your response EXACTLY as follows. Use clear section headers and bullet points. Do NOT use markdown formatting like ** or *. Use plain text only.

=== OVERVIEW ===

Summary: [Write 4-6 sentences about their connection to Ogham and Celtic tree wisdom. Be specific and personal, referencing their birth tree and name letters.]

Personal Message: [Write 3-4 sentences directly addressing them, using their name. Connect their birth tree and name letters to their life path.]

=== GUIDANCE ===

Current: [Write 2-3 sentences about their current path and what the trees are telling them now.]

Spiritual:
- [Spiritual guidance 1]
- [Spiritual guidance 2]
- [Spiritual guidance 3]
- [Spiritual guidance 4]

Practical:
- [Practical guidance 1]
- [Practical guidance 2]
- [Practical guidance 3]
- [Practical guidance 4]

Life Areas:
Career: [One sentence about their career path based on their birth tree and name letters]
Relationships: [One sentence about relationships based on their birth tree and name letters]
Health: [One sentence about health based on their birth tree element and energy]
Spirituality: [One sentence about their spiritual path based on Celtic wisdom]

Affirmations:
- [Affirmation 1]
- [Affirmation 2]
- [Affirmation 3]
- [Affirmation 4]

=== CELTIC WISDOM ===

Overview: [Write 3-4 sentences about their connection to Celtic traditions and how Ogham connects them to ancient wisdom.]

Traditions:
- [Tradition 1]
- [Tradition 2]
- [Tradition 3]
- [Tradition 4]

Connections:
- [Connection 1]
- [Connection 2]
- [Connection 3]
- [Connection 4]

Practices:
- [Practice 1]
- [Practice 2]
- [Practice 3]
- [Practice 4]`

      const result = await createAICompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        maxTokens: 2000
      })

      const aiResponse = result.content || ''

      // Parse AI response
      const aiInsights = this.parseAIResponse(aiResponse, displayName)

      // Generate comprehensive report
      const report = generateOghamReportStructure(
        userId,
        userProfile,
        nameAnalysis,
        birthTree,
        aiInsights
      )

      return report

    } catch (error) {
      devLog.error('Error generating AI-enhanced Ogham reading:', error, 'oghamIntelligence')
      // Return report without AI enhancements if AI fails
      return generateOghamReportStructure(
        userId,
        userProfile,
        nameAnalysis,
        birthTree
      )
    }
  }

  /**
   * Parse AI response into structured insights
   */
  private parseAIResponse(aiResponse: string, displayName: string): {
    overview?: string
    personalMessage?: string
    guidance?: any
    celticWisdom?: any
  } {
    const insights: any = {}

    // Extract overview
    const overviewMatch = aiResponse.match(/=== OVERVIEW ===\s*Summary:\s*([\s\S]+?)(?=Personal Message:|===)/)
    if (overviewMatch) {
      insights.overview = overviewMatch[1].trim()
    }

    // Extract personal message
    const personalMessageMatch = aiResponse.match(/Personal Message:\s*([\s\S]+?)(?=== GUIDANCE ===|$)/)
    if (personalMessageMatch) {
      insights.personalMessage = personalMessageMatch[1].trim()
    }

    // Extract guidance
    const guidanceMatch = aiResponse.match(/=== GUIDANCE ===\s*([\s\S]+?)(?=== CELTIC WISDOM ===|$)/)
    if (guidanceMatch) {
      const guidanceText = guidanceMatch[1]
      insights.guidance = {
        current: this.extractSection(guidanceText, 'Current:'),
        spiritual: this.extractList(guidanceText, 'Spiritual:'),
        practical: this.extractList(guidanceText, 'Practical:'),
        lifeAreas: {
          career: this.extractSection(guidanceText, 'Career:'),
          relationships: this.extractSection(guidanceText, 'Relationships:'),
          health: this.extractSection(guidanceText, 'Health:'),
          spirituality: this.extractSection(guidanceText, 'Spirituality:')
        },
        affirmations: this.extractList(guidanceText, 'Affirmations:')
      }
    }

    // Extract Celtic wisdom
    const celticWisdomMatch = aiResponse.match(/=== CELTIC WISDOM ===\s*([\s\S]+)$/)
    if (celticWisdomMatch) {
      const wisdomText = celticWisdomMatch[1]
      insights.celticWisdom = {
        overview: this.extractSection(wisdomText, 'Overview:'),
        traditions: this.extractList(wisdomText, 'Traditions:'),
        connections: this.extractList(wisdomText, 'Connections:'),
        practices: this.extractList(wisdomText, 'Practices:')
      }
    }

    return insights
  }

  /**
   * Extract a section from text
   */
  private extractSection(text: string, label: string): string {
    const regex = new RegExp(`${label}\\s*([\\s\\S]+?)(?=\\n[A-Z]|$)`)
    const match = text.match(regex)
    return match ? match[1].trim() : ''
  }

  /**
   * Extract a list from text
   */
  private extractList(text: string, label: string): string[] {
    const regex = new RegExp(`${label}\\s*\\n((?:-\\s*[\\s\\S]+\\n?)+)`)
    const match = text.match(regex)
    if (match) {
      return match[1]
        .split('\n')
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line.length > 0)
    }
    return []
  }

  /**
   * Get user's recent readings from Firestore
   */
  private async getUserReadings(userId: string): Promise<OghamReport[]> {
    if (!this.db) return []

    try {
      // Use proper Firestore v9 pattern
      const userDocRef = doc(this.db, 'users', userId)
      const readingsRef = collection(userDocRef, 'oghamReadings')
      const q = query(readingsRef, orderBy('timestamp', 'desc'))
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          id: doc.id
        } as OghamReport
      })
    } catch (error) {
      devLog.error('Error fetching user readings:', error, 'oghamIntelligence')
      return []
    }
  }

  /**
   * Save reading to Firestore
   */
  private async saveReading(userId: string, reading: OghamReport): Promise<void> {
    if (!this.db) return

    try {
      // Use proper Firestore v9 pattern
      const readingRef = doc(this.db, 'users', userId, 'oghamReadings', reading.id)
      await setDoc(readingRef, {
        ...reading,
        timestamp: Timestamp.fromDate(reading.timestamp)
      })
    } catch (error) {
      devLog.error('Error saving reading:', error, 'oghamIntelligence')
    }
  }
}

// Export singleton instance
export const oghamIntelligence = new OghamIntelligence()

// Export class for testing
export { OghamIntelligence }

