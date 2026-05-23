/* eslint-disable security/detect-non-literal-regexp */
/**
 * Akashic Records Intelligence
 * Access the universal library of souls for personalized insights
 */

import { Timestamp } from 'firebase/firestore'
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from './firebase'
import { userSubdocGet, userSubdocSet, userSubcollectionQueryOrdered } from '@/lib/userSubcollectionFirestore'
import { UserProfile } from './firebase'
import { callTextAI } from './aiStructuredOutput'
import { REPORT_VOICE_RULE } from './reportVoiceRule'


export interface PastLife {
  era: string
  location: string
  role: string
  lessons: string[]
  connections: string
  significance: string
}

export interface KarmicPattern {
  type: string
  description: string
  origin: string
  resolution: string
  currentManifestation: string
}

export interface AkashicReading {
  id: string
  timestamp: Date
  userId: string
  soulJourney: {
    overview: string
    evolution: string[]
    currentStage: string
    nextSteps: string[]
    milestones: string[]
  }
  pastLives: PastLife[]
  karmicPatterns: {
    patterns: KarmicPattern[]
    debts: string[]
    credits: string[]
    overallBalance: string
  }
  lifePurpose: {
    mission: string
    gifts: string[]
    challenges: string[]
    expression: string
    alignment: string[]
  }
  guidance: {
    current: string
    spiritual: string[]
    practical: string[]
    affirmations: string[]
  }
  personalMessage: string
  generatedAt: string
}

class AkashicRecordsIntelligence {
  private db: any = null
  private cache = new Map<string, AkashicReading>()
  private readonly CACHE_TTL = 1000 * 60 * 60 // 1 hour cache

  constructor() {
    try {
      this.db = getFirebaseDB()
    } catch (error) {
      devLog.warn('Firebase not available for Akashic Records Intelligence', undefined, 'akashicRecordsIntelligence')
    }
  }

  /**
   * Access the Akashic Records for a user
   */
  async accessRecords(
    userId: string,
    userProfile: UserProfile | null
  ): Promise<AkashicReading> {
    // Check cache first
    const cacheKey = `${userId}-${userProfile?.birthDate || 'default'}`
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
        devLog.warn('Could not load from Firestore, generating new reading:', error, 'akashicRecordsIntelligence')
      }
    }

    // Check if we have complete profile data
    const hasCompleteProfile = userProfile?.birthDate && 
                               userProfile?.birthTime && 
                               userProfile?.birthPlace

    if (!hasCompleteProfile) {
      // Return a basic reading encouraging profile completion
      return this.generateBasicReading(userId, userProfile)
    }

    // Generate comprehensive reading using AI
    const reading = await this.generateComprehensiveReading(userId, userProfile)

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
    _userProfile: UserProfile | null
  ): AkashicReading {
    return {
      id: `basic-${Date.now()}`,
      timestamp: new Date(),
      userId,
      soulJourney: {
        overview: `The Akashic Records hold profound wisdom about your soul's journey. To access the most detailed insights about your past lives, karmic patterns, and life purpose, please complete your birth information in your profile.`,
        evolution: [
          'Your soul is on a journey of growth and expansion',
          'Each lifetime brings new lessons and experiences',
          'You are evolving toward greater wisdom and love'
        ],
        currentStage: 'Awakening and Discovery',
        nextSteps: [
          'Complete your birth information for personalized insights',
          'Explore your spiritual path with intention',
          'Trust in the journey of your soul'
        ],
        milestones: []
      },
      pastLives: [],
      karmicPatterns: {
        patterns: [],
        debts: [],
        credits: [],
        overallBalance: 'Complete your profile to discover your karmic patterns'
      },
      lifePurpose: {
        mission: 'Your soul\'s purpose will be revealed when your complete birth information is available',
        gifts: [],
        challenges: [],
        expression: '',
        alignment: []
      },
      guidance: {
        current: `The Records are ready to reveal your path. Complete your birth details to unlock the full wisdom of your soul's journey.`,
        spiritual: [
          'Meditate on your life purpose',
          'Connect with your higher self',
          'Trust in divine timing'
        ],
        practical: [
          'Add your birth date, time, and place to your profile',
          'Return here once your profile is complete',
          'Prepare to receive profound insights'
        ],
        affirmations: [
          'I am ready to discover my soul\'s purpose',
          'My birth information is a key to my spiritual path',
          'The Akashic Records hold wisdom for me'
        ]
      },
      personalMessage: `The Akashic Records are a universal library containing all thoughts, events, experiences, and knowledge - past, present, and future. To access your personal soul records with the most accurate insights, please complete your birth information. Once you do, you'll receive a comprehensive reading about your soul's journey, past lives, karmic patterns, and life purpose.`,
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * Generate comprehensive reading using AI
   */
  private async generateComprehensiveReading(
    userId: string,
    userProfile: UserProfile
  ): Promise<AkashicReading> {
    const birthDate = userProfile.birthDate || ''
    const birthTime = userProfile.birthTime || ''
    const birthPlace = userProfile.birthPlace || ''

    try {
      // Generate reading using Groq AI
      const systemPrompt = `You are a master Akashic Records reader with deep knowledge of Theosophy, Anthroposophy, and spiritual traditions. The Akashic Records (from Sanskrit "Akasha" meaning "ether" or "sky") are believed to be a universal library containing all events, thoughts, words, emotions, and intentions that have ever occurred, are occurring, or will occur.

Key Concepts:
- The Records exist in a non-physical plane (akasha/ether)
- Time is non-linear in the Records
- Each soul has its own record within the universal Records
- The Records reveal soul journey, past lives, karmic patterns, and life purpose
- Access is through meditation, prayer, or spiritual practice

Guidelines:
- ${REPORT_VOICE_RULE}
- Be profound yet practical
- Connect past lives to current life patterns
- Explain karmic patterns with clarity
- Reveal life purpose with inspiration
- Use mystical language that feels authentic
- Reference the concept of Akasha and non-linear time
- Make it deeply personal and transformative
- DO NOT use markdown formatting (no **, *, or []())
- DO NOT repeat information across sections
- Be concise and specific - avoid generic statements
- Each section should be unique and not repeat content from other sections`

      const userPrompt = `Generate a comprehensive Akashic Records reading.

Birth Information:
- Date: ${birthDate}
- Time: ${birthTime}
- Place: ${birthPlace}

IMPORTANT: Format your response EXACTLY as follows. Use clear section headers and bullet points. Do NOT use markdown formatting like ** or *. Use plain text only.

=== SOUL JOURNEY ===

Overview: [Write 4-6 sentences about their soul's evolution across lifetimes. Be specific and personal.]

Evolution Stages:
- [Stage 1: specific description]
- [Stage 2: specific description]
- [Stage 3: specific description]
- [Stage 4: specific description]
- [Stage 5: specific description]

Current Stage: [One clear sentence about where they are now]

Next Steps:
- [Step 1: specific action]
- [Step 2: specific action]
- [Step 3: specific action]
- [Step 4: specific action]

Milestones:
- [Milestone 1]
- [Milestone 2]
- [Milestone 3]

=== PAST LIVES ===

Past Life 1:
Era: [Historical period]
Location: [Geographic location]
Role: [Their role/occupation]
Lessons: [Lesson 1], [Lesson 2], [Lesson 3]
Connections: [How this life connects to current life - one sentence]
Significance: [Why this life matters now - one sentence]

Past Life 2:
Era: [Historical period]
Location: [Geographic location]
Role: [Their role/occupation]
Lessons: [Lesson 1], [Lesson 2], [Lesson 3]
Connections: [How this life connects to current life - one sentence]
Significance: [Why this life matters now - one sentence]

Past Life 3:
Era: [Historical period]
Location: [Geographic location]
Role: [Their role/occupation]
Lessons: [Lesson 1], [Lesson 2], [Lesson 3]
Connections: [How this life connects to current life - one sentence]
Significance: [Why this life matters now - one sentence]

=== KARMIC PATTERNS ===

Pattern 1:
Type: [Pattern name]
Description: [What it means - one sentence]
Origin: [Where it came from - one sentence]
Resolution: [How to resolve/heal it - one sentence]
Current Manifestation: [How it shows up now - one sentence]

Pattern 2:
Type: [Pattern name]
Description: [What it means - one sentence]
Origin: [Where it came from - one sentence]
Resolution: [How to resolve/heal it - one sentence]
Current Manifestation: [How it shows up now - one sentence]

Pattern 3:
Type: [Pattern name]
Description: [What it means - one sentence]
Origin: [Where it came from - one sentence]
Resolution: [How to resolve/heal it - one sentence]
Current Manifestation: [How it shows up now - one sentence]

Debts:
- [Debt 1]
- [Debt 2]
- [Debt 3]

Credits:
- [Credit 1]
- [Credit 2]
- [Credit 3]

Overall Balance: [Summary of their karmic balance - 2-3 sentences]

=== LIFE PURPOSE ===

Mission: [Their soul's primary mission - 3-4 sentences]

Gifts:
- [Gift 1]
- [Gift 2]
- [Gift 3]
- [Gift 4]
- [Gift 5]

Challenges:
- [Challenge 1]
- [Challenge 2]
- [Challenge 3]

Expression: [How to express their purpose - 2-3 sentences]

Alignment:
- [Way 1]
- [Way 2]
- [Way 3]
- [Way 4]

=== GUIDANCE ===

Current: [Immediate guidance - 3-4 sentences]

Spiritual:
- [Practice 1]
- [Practice 2]
- [Practice 3]
- [Practice 4]

Practical:
- [Action 1]
- [Action 2]
- [Action 3]
- [Action 4]

Affirmations:
- [Affirmation 1]
- [Affirmation 2]
- [Affirmation 3]
- [Affirmation 4]
- [Affirmation 5]

=== PERSONAL MESSAGE ===

[Write a beautiful, inspiring closing message - 4-6 sentences that address the reader as "you" and speak to their soul. Do NOT repeat information from above sections.]

Remember: Use plain text only. No markdown formatting. Be specific and personal. Address the reader as "you" and "your" only; do not use the person's name.`

      const result = await callTextAI({
        label: 'akashic-records-reading',
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        maxTokens: 4000,
        topP: 0.9,
        frequencyPenalty: 0.3,
        presencePenalty: 0.3,
        maxAttempts: 2,
      })

      const aiResponse = result.content
      
      // Parse AI response into structured format
      const parsed = this.parseAIResponse(aiResponse, userId)

      return parsed
    } catch (error) {
      devLog.error('Error generating Akashic Records reading:', error, 'akashicRecordsIntelligence')
      // Return fallback reading
      return this.generateFallbackReading(userId, userProfile)
    }
  }

  /**
   * Parse AI response into structured AkashicReading
   */
  private parseAIResponse(
    aiResponse: string,
    userId: string
  ): AkashicReading {
    devLog.debug('📚 Parsing AI response, length:', aiResponse.length)
    
    // Clean text function to remove markdown and formatting
    const cleanText = (text: string): string => {
      if (!text) return ''
      // Remove markdown formatting
      text = text.replace(/\*\*/g, '') // Remove bold
      text = text.replace(/\*/g, '') // Remove italic
      text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
      text = text.replace(/^[-•*]\s*/gm, '') // Remove bullet points
      text = text.replace(/^\d+\.\s*/gm, '') // Remove numbered lists
      text = text.replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      text = text.replace(/\s+/g, ' ') // Normalize whitespace
      text = text.trim()
      return text
    }

    // Improved extraction functions
    const extractSection = (sectionName: string, content: string, nextSection?: string): string => {
      // Try multiple patterns
      const patterns = [
        new RegExp(`${sectionName}[\\s:]*([\\s\\S]*?)(?=${nextSection || '===|Past Life|Pattern|Debts|Credits|Gifts|Challenges|Spiritual|Practical|Affirmations'}|$)`, 'i'),
        new RegExp(`${sectionName}[\\s:]*([\\s\\S]*?)(?=\\n\\n===|$)`, 'i'),
        new RegExp(`${sectionName}[\\s:]*([^]*?)(?=\\n[A-Z][^:]*:|$)`, 'i')
      ]
      
      for (const pattern of patterns) {
        const match = content.match(pattern)
        if (match && match[1]) {
          let text = match[1].trim()
          text = cleanText(text)
          // Remove any remaining section headers or labels
          text = text.replace(/^(Overview|Mission|Current|Expression|Overall Balance|Connections|Significance)[\\s:]*/i, '')
          text = text.trim()
          if (text.length > 10) {
            // Limit length to prevent repetition
            if (text.length > 500) {
              text = text.substring(0, 500).trim() + '...'
            }
            return text
          }
        }
      }
      return ''
    }

    const extractList = (sectionName: string, content: string, maxItems: number = 10): string[] => {
      // Try to find the section first
      const sectionPattern = new RegExp(`${sectionName}[\\s:]*([\\s\\S]*?)(?=\\n(?:===|Past Life|Pattern|Debts|Credits|Gifts|Challenges|Spiritual|Practical|Affirmations|Overall Balance|Mission|Current|Expression|Alignment)|$)`, 'i')
      const sectionMatch = content.match(sectionPattern)
      
      let sectionText = ''
      if (sectionMatch && sectionMatch[1]) {
        sectionText = sectionMatch[1]
      } else {
        // Try extracting from the full content
        const lines = content.split('\n')
        let inSection = false
        const sectionLines: string[] = []
        
        for (const line of lines) {
          if (line.match(new RegExp(`^${sectionName}`, 'i'))) {
            inSection = true
            continue
          }
          if (inSection) {
            if (line.match(/^(===|Past Life|Pattern|Debts|Credits|Gifts|Challenges|Spiritual|Practical|Affirmations|Overall Balance|Mission|Current|Expression|Alignment)/i)) {
              break
            }
            if (line.trim().length > 0) {
              sectionLines.push(line)
            }
          }
        }
        sectionText = sectionLines.join('\n')
      }
      
      const items = sectionText
        .split(/\n/)
        .map(line => cleanText(line))
        .filter(line => {
          const trimmed = line.trim()
          // Filter out empty lines, section headers, and very short items
          return trimmed.length > 5 && 
                 !trimmed.match(/^(===|Past Life|Pattern|Type|Description|Origin|Resolution|Current Manifestation|Era|Location|Role|Lessons|Connections|Significance|Mission|Expression|Overall Balance|Current|Debts|Credits|Gifts|Challenges|Spiritual|Practical|Affirmations|Alignment)/i) &&
                 !trimmed.match(/^[A-Z][^:]*:$/)
        })
        .map(item => {
          // Remove any remaining prefixes
          item = item.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '')
          // Remove any markdown or formatting
          item = cleanText(item)
          return item.trim()
        })
        .filter(item => item.length > 0)
      
      // Remove duplicates
      const uniqueItems = Array.from(new Set(items))
      
      return uniqueItems.slice(0, maxItems)
    }

    // Extract soul journey - improved extraction
    const soulJourneySection = aiResponse.match(/=== SOUL JOURNEY ===([\s\S]*?)(?=== PAST LIVES ===|=== KARMIC|$)/i) ||
                              aiResponse.match(/SOUL JOURNEY([\s\S]*?)(?=PAST LIVES|KARMIC|$)/i)
    
    let soulJourneyOverview = ''
    if (soulJourneySection) {
      soulJourneyOverview = extractSection('Overview', soulJourneySection[1]) || 
                           soulJourneySection[1].split('\n').slice(0, 6).join(' ').trim()
    }
    
    if (!soulJourneyOverview || soulJourneyOverview.length < 20) {
      soulJourneyOverview = `Your soul is on a profound journey of evolution and growth across lifetimes.`
    }
    
    // Clean up overview - remove any repetition
    soulJourneyOverview = cleanText(soulJourneyOverview)
    if (soulJourneyOverview.length > 500) {
      soulJourneyOverview = soulJourneyOverview.substring(0, 500).trim() + '...'
    }
    
    let evolution: string[] = []
    if (soulJourneySection) {
      evolution = extractList('Evolution Stages', soulJourneySection[1], 7) || 
                 extractList('Evolution', soulJourneySection[1], 7)
    }
    if (evolution.length === 0) {
      evolution = extractList('Evolution', aiResponse, 7)
    }
    if (evolution.length === 0) {
      evolution = ['Awakening to your true nature', 'Integrating past life wisdom', 'Expanding consciousness', 'Healing karmic patterns', 'Expressing your life purpose']
    }
    
    let currentStage = ''
    if (soulJourneySection) {
      currentStage = extractSection('Current Stage', soulJourneySection[1])
    }
    if (!currentStage) {
      currentStage = extractSection('Current Stage', aiResponse) || 'Awakening and Integration'
    }
    currentStage = cleanText(currentStage)
    
    let nextSteps: string[] = []
    if (soulJourneySection) {
      nextSteps = extractList('Next Steps', soulJourneySection[1], 6)
    }
    if (nextSteps.length === 0) {
      nextSteps = extractList('Next Steps', aiResponse, 6)
    }
    if (nextSteps.length === 0) {
      nextSteps = ['Continue your spiritual practice', 'Heal karmic patterns', 'Express your life purpose', 'Serve others with love', 'Trust in your journey']
    }

    // Extract past lives - improved extraction
    const pastLives: PastLife[] = []
    
    // Try to find past lives section
    const pastLivesSection = aiResponse.match(/=== PAST LIVES ===([\s\S]*?)(?=== KARMIC|=== LIFE PURPOSE|$)/i) ||
                            aiResponse.match(/PAST LIVES([\s\S]*?)(?=KARMIC|LIFE PURPOSE|$)/i)
    
    if (pastLivesSection) {
      const sectionText = pastLivesSection[1]
      // Split by "Past Life" indicators
      const lifeBlocks = sectionText.split(/Past Life \d+:/i).filter(block => block.trim().length > 0)
      
      for (let i = 0; i < Math.min(5, lifeBlocks.length); i++) {
        const block = lifeBlocks[i]
        let era = extractSection('Era', block) || 'Ancient Times'
        let location = extractSection('Location', block) || 'Various Locations'
        let role = extractSection('Role', block) || 'Spiritual Seeker'
        let lessons: string[] = extractList('Lessons', block, 4)
        let connections = extractSection('Connections', block) || 'This life influences your current path'
        let significance = extractSection('Significance', block) || 'Important for your soul\'s evolution'
        
        // Clean all fields
        era = cleanText(era)
        location = cleanText(location)
        role = cleanText(role)
        connections = cleanText(connections)
        significance = cleanText(significance)
        lessons = lessons.map(l => cleanText(l)).filter(l => l.length > 0)
        
        if (lessons.length === 0) {
          lessons = ['Growth', 'Wisdom', 'Love', 'Service']
        }
        
        if (era && location && role) {
          pastLives.push({ era, location, role, lessons, connections, significance })
        }
      }
    }

    // If no past lives found, create meaningful defaults
    if (pastLives.length === 0) {
      pastLives.push(
        {
          era: 'Ancient Times',
          location: 'Various Locations',
          role: 'Spiritual Seeker',
          lessons: ['Wisdom', 'Compassion', 'Service', 'Love'],
          connections: 'Your past lives have shaped your current spiritual path and gifts',
          significance: 'These experiences contribute to your soul\'s evolution and purpose'
        },
        {
          era: 'Medieval Period',
          location: 'Europe/Asia',
          role: 'Teacher or Healer',
          lessons: ['Knowledge', 'Healing', 'Guidance', 'Patience'],
          connections: 'Your ability to guide and heal others comes from these lifetimes',
          significance: 'These experiences developed your gifts of teaching and compassion'
        }
      )
    }

    // Extract karmic patterns - improved extraction
    const karmicPatterns: KarmicPattern[] = []
    const karmicSection = aiResponse.match(/=== KARMIC PATTERNS ===([\s\S]*?)(?=== LIFE PURPOSE|=== GUIDANCE|$)/i) ||
                         aiResponse.match(/KARMIC PATTERNS([\s\S]*?)(?=LIFE PURPOSE|GUIDANCE|$)/i)
    
    if (karmicSection) {
      const sectionText = karmicSection[1]
      // Split by "Pattern" indicators
      const patternBlocks = sectionText.split(/Pattern \d+:/i).filter(block => block.trim().length > 0)
      
      for (let i = 0; i < Math.min(6, patternBlocks.length); i++) {
        const block = patternBlocks[i]
        if (block.length < 20) continue
        
        let type = extractSection('Type', block) || 'Karmic Pattern'
        let description = extractSection('Description', block) || 'A pattern affecting your life'
        let origin = extractSection('Origin', block) || 'From past actions'
        let resolution = extractSection('Resolution', block) || 'Through awareness and healing'
        let currentManifestation = extractSection('Current Manifestation', block) || 'Shows in your current experiences'
        
        // Clean all fields
        type = cleanText(type)
        description = cleanText(description)
        origin = cleanText(origin)
        resolution = cleanText(resolution)
        currentManifestation = cleanText(currentManifestation)
        
        // Remove any markdown or formatting artifacts
        if (type.includes('**') || description.includes('**')) {
          // Skip if it looks like it has markdown formatting issues
          continue
        }
        
        if (type && description && type.length > 3 && description.length > 10) {
          karmicPatterns.push({ type, description, origin, resolution, currentManifestation })
        }
      }
    }

    // If no patterns found, add a default
    if (karmicPatterns.length === 0) {
      karmicPatterns.push({
        type: 'Soul Growth',
        description: 'A pattern of continuous spiritual evolution and learning',
        origin: 'From your soul\'s journey across lifetimes',
        resolution: 'Through conscious awareness, healing, and spiritual practice',
        currentManifestation: 'Shows as your desire for growth, understanding, and alignment'
      })
    }

    let debts: string[] = []
    let credits: string[] = []
    let overallBalance = ''
    
    if (karmicSection) {
      debts = extractList('Debts', karmicSection[1], 4)
      credits = extractList('Credits', karmicSection[1], 4)
      overallBalance = extractSection('Overall Balance', karmicSection[1])
    }
    
    if (debts.length === 0) {
      debts = extractList('Debts', aiResponse, 4) || []
    }
    if (credits.length === 0) {
      credits = extractList('Credits', aiResponse, 4) || []
    }
    if (!overallBalance) {
      overallBalance = extractSection('Overall Balance', aiResponse) || 
                      'Your karmic balance reflects your soul\'s journey'
    }
    
    overallBalance = cleanText(overallBalance)

    // Extract life purpose - improved extraction
    const lifePurposeSection = aiResponse.match(/=== LIFE PURPOSE ===([\s\S]*?)(?=== GUIDANCE|=== PERSONAL|$)/i) ||
                              aiResponse.match(/LIFE PURPOSE([\s\S]*?)(?=GUIDANCE|PERSONAL MESSAGE|$)/i)
    
    let mission = ''
    if (lifePurposeSection) {
      mission = extractSection('Mission', lifePurposeSection[1])
    }
    if (!mission) {
      mission = extractSection('Mission', aiResponse) || 
                `Your soul's mission is to grow, learn, and express your unique gifts.`
    }
    mission = cleanText(mission)
    
    let gifts: string[] = []
    if (lifePurposeSection) {
      gifts = extractList('Gifts', lifePurposeSection[1], 7)
    }
    if (gifts.length === 0) {
      gifts = extractList('Gifts', aiResponse, 7)
    }
    if (gifts.length === 0) {
      gifts = ['Intuition', 'Compassion', 'Wisdom', 'Creativity', 'Healing ability', 'Teaching ability']
    }
    gifts = gifts.map(g => cleanText(g)).filter(g => g.length > 0)
    
    let challenges: string[] = []
    if (lifePurposeSection) {
      challenges = extractList('Challenges', lifePurposeSection[1], 5)
    }
    if (challenges.length === 0) {
      challenges = extractList('Challenges', aiResponse, 5)
    }
    if (challenges.length === 0) {
      challenges = ['Growth through experience', 'Learning to trust', 'Expressing your truth', 'Setting boundaries']
    }
    challenges = challenges.map(c => cleanText(c)).filter(c => c.length > 0)
    
    let expression = ''
    if (lifePurposeSection) {
      expression = extractSection('Expression', lifePurposeSection[1])
    }
    if (!expression) {
      expression = extractSection('Expression', aiResponse) || 
                  'Express your purpose through your unique gifts and talents'
    }
    expression = cleanText(expression)
    
    let alignment: string[] = []
    if (lifePurposeSection) {
      alignment = extractList('Alignment', lifePurposeSection[1], 6)
    }
    if (alignment.length === 0) {
      alignment = extractList('Alignment', aiResponse, 6)
    }
    if (alignment.length === 0) {
      alignment = ['Follow your intuition', 'Serve others', 'Practice self-love', 'Express your creativity', 'Trust in divine timing']
    }
    alignment = alignment.map(a => cleanText(a)).filter(a => a.length > 0)

    // Extract guidance - improved extraction
    const guidanceSection = aiResponse.match(/=== GUIDANCE ===([\s\S]*?)(?=== PERSONAL MESSAGE|$)/i) ||
                           aiResponse.match(/GUIDANCE([\s\S]*?)(?=PERSONAL MESSAGE|$)/i)
    
    let currentGuidance = ''
    if (guidanceSection) {
      currentGuidance = extractSection('Current', guidanceSection[1])
    }
    if (!currentGuidance) {
      currentGuidance = extractSection('Current', aiResponse) || 
                       'Trust in your journey and follow your inner guidance.'
    }
    currentGuidance = cleanText(currentGuidance)
    
    let spiritual: string[] = []
    if (guidanceSection) {
      spiritual = extractList('Spiritual', guidanceSection[1], 6)
    }
    if (spiritual.length === 0) {
      spiritual = extractList('Spiritual', aiResponse, 6)
    }
    if (spiritual.length === 0) {
      spiritual = ['Meditate daily', 'Connect with nature', 'Practice gratitude', 'Read spiritual texts', 'Practice forgiveness']
    }
    spiritual = spiritual.map(s => cleanText(s)).filter(s => s.length > 0)
    
    let practical: string[] = []
    if (guidanceSection) {
      practical = extractList('Practical', guidanceSection[1], 6)
    }
    if (practical.length === 0) {
      practical = extractList('Practical', aiResponse, 6)
    }
    if (practical.length === 0) {
      practical = ['Take aligned action', 'Honor your boundaries', 'Express your truth', 'Surround yourself with supportive people']
    }
    practical = practical.map(p => cleanText(p)).filter(p => p.length > 0)
    
    let affirmations: string[] = []
    if (guidanceSection) {
      affirmations = extractList('Affirmations', guidanceSection[1], 7)
    }
    if (affirmations.length === 0) {
      affirmations = extractList('Affirmations', aiResponse, 7)
    }
    if (affirmations.length === 0) {
      affirmations = ['I am aligned with my soul\'s purpose', 'I trust in my journey', 'I am worthy of love', 'I express my unique gifts', 'I am healing and growing']
    }
    affirmations = affirmations.map(a => cleanText(a)).filter(a => a.length > 0)

    // Extract personal message
    const personalMessageSection = aiResponse.match(/=== PERSONAL MESSAGE ===([\s\S]*?)$/i) ||
                                  aiResponse.match(/PERSONAL MESSAGE([\s\S]*?)$/i)
    
    let personalMessage = ''
    if (personalMessageSection) {
      personalMessage = personalMessageSection[1].trim()
    } else {
      personalMessage = extractSection('PERSONAL MESSAGE', aiResponse) || 
                       `The Akashic Records reveal that your soul is on a beautiful journey of growth and evolution. Trust in the wisdom that flows through you and know that you are exactly where you need to be.`
    }
    personalMessage = cleanText(personalMessage)
    
    // Ensure personal message doesn't repeat other sections
    if (personalMessage.includes('Soul Journey') || personalMessage.includes('Past Lives') || personalMessage.includes('Karmic')) {
      personalMessage = `The Akashic Records reveal that your soul is on a beautiful journey of growth and evolution. Trust in the wisdom that flows through you and know that you are exactly where you need to be.`
    }

    return {
      id: `akashic-${Date.now()}`,
      timestamp: new Date(),
      userId,
      soulJourney: {
        overview: soulJourneyOverview,
        evolution,
        currentStage,
        nextSteps,
        milestones: (() => {
          let milestones: string[] = []
          if (soulJourneySection) {
            milestones = extractList('Milestones', soulJourneySection[1], 5)
          }
          if (milestones.length === 0) {
            milestones = extractList('Milestones', aiResponse, 5)
          }
          if (milestones.length === 0) {
            milestones = ['Soul awakening', 'Karmic healing', 'Purpose alignment']
          }
          return milestones.map(m => cleanText(m)).filter(m => m.length > 0)
        })()
      },
      pastLives,
      karmicPatterns: {
        patterns: karmicPatterns.length > 0 ? karmicPatterns : [{
          type: 'Soul Growth',
          description: 'A pattern of continuous spiritual evolution',
          origin: 'From your soul\'s journey across lifetimes',
          resolution: 'Through conscious awareness and spiritual practice',
          currentManifestation: 'Shows as your desire for growth and understanding'
        }],
        debts,
        credits,
        overallBalance
      },
      lifePurpose: {
        mission,
        gifts,
        challenges,
        expression,
        alignment
      },
      guidance: {
        current: currentGuidance,
        spiritual,
        practical,
        affirmations
      },
      personalMessage,
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * Generate fallback reading if AI fails
   */
  private generateFallbackReading(
    userId: string,
    _userProfile: UserProfile
  ): AkashicReading {
    return {
      id: `fallback-${Date.now()}`,
      timestamp: new Date(),
      userId,
      soulJourney: {
        overview: `Your soul is on a profound journey of evolution. The Akashic Records reveal that you are here to learn, grow, and express your unique gifts.`,
        evolution: [
          'Awakening to your true nature',
          'Integrating wisdom from past experiences',
          'Expanding your consciousness',
          'Healing karmic patterns',
          'Expressing your life purpose'
        ],
        currentStage: 'Awakening and Integration',
        nextSteps: [
          'Continue your spiritual practice',
          'Heal past wounds and patterns',
          'Express your unique gifts',
          'Serve others with love',
          'Trust in your journey'
        ],
        milestones: [
          'Soul awakening',
          'Karmic healing',
          'Purpose alignment'
        ]
      },
      pastLives: [
        {
          era: 'Ancient Times',
          location: 'Various Locations',
          role: 'Spiritual Seeker',
          lessons: ['Wisdom', 'Compassion', 'Service', 'Love'],
          connections: 'Your past lives have shaped your current spiritual path and gifts',
          significance: 'These experiences contribute to your soul\'s evolution and purpose'
        }
      ],
      karmicPatterns: {
        patterns: [
          {
            type: 'Soul Growth',
            description: 'A pattern of continuous spiritual evolution and learning',
            origin: 'From your soul\'s journey across lifetimes',
            resolution: 'Through conscious awareness, healing, and spiritual practice',
            currentManifestation: 'Shows as your desire for growth, understanding, and alignment'
          }
        ],
        debts: [],
        credits: ['Spiritual wisdom', 'Compassionate heart', 'Service to others'],
        overallBalance: 'Your karmic balance reflects a soul dedicated to growth and service'
      },
      lifePurpose: {
        mission: `Your soul's mission is to grow, learn, express your unique gifts, and serve others with love and wisdom.`,
        gifts: ['Intuition', 'Compassion', 'Wisdom', 'Creativity', 'Healing ability'],
        challenges: ['Learning to trust', 'Expressing your truth', 'Setting boundaries', 'Self-love'],
        expression: 'Express your purpose through your unique gifts, talents, and service to others',
        alignment: [
          'Follow your intuition',
          'Serve others with love',
          'Practice self-care',
          'Express your creativity',
          'Trust in divine timing'
        ]
      },
      guidance: {
        current: `Trust in your journey and follow your inner guidance. The Akashic Records reveal that you are exactly where you need to be.`,
        spiritual: [
          'Meditate daily to connect with your higher self',
          'Practice gratitude for all experiences',
          'Connect with nature to ground your energy',
          'Read spiritual texts that resonate',
          'Practice forgiveness and compassion'
        ],
        practical: [
          'Take aligned action toward your goals',
          'Honor your boundaries and needs',
          'Express your truth with love',
          'Surround yourself with supportive people',
          'Trust in the process'
        ],
        affirmations: [
          'I am aligned with my soul\'s purpose',
          'I trust in my journey and divine timing',
          'I am worthy of love and abundance',
          'I express my unique gifts with confidence',
          'I am healing and growing every day'
        ]
      },
      personalMessage: `The Akashic Records are a universal library containing all knowledge and experiences. Your soul's record reveals a beautiful journey of growth, learning, and service. Trust in the wisdom that flows through you, know that you are exactly where you need to be, and remember that your purpose is unfolding perfectly. The Records are always accessible to you through meditation, prayer, and spiritual practice.`,
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * Save reading to Firestore
   */
  async saveReading(userId: string, reading: AkashicReading): Promise<void> {
    if (!this.db) {
      devLog.warn('Firestore not available, skipping save', 'akashicRecordsIntelligence')
      return
    }

    try {
      await userSubdocSet(userId, 'akashic-readings', reading.id, {
        ...reading,
        timestamp: Timestamp.fromDate(reading.timestamp),
      } as unknown as Record<string, unknown>)
      devLog.debug('✅ Saved Akashic Records reading to Firestore')
    } catch (error) {
      devLog.error('Error saving Akashic Records reading:', error, 'akashicRecordsIntelligence')
    }
  }

  /**
   * Load reading from Firestore
   */
  async loadReading(userId: string, readingId: string): Promise<AkashicReading | null> {
    if (!this.db) {
      return null
    }

    try {
      const data = await userSubdocGet(userId, 'akashic-readings', readingId)
      if (!data?.timestamp) return null
      const ts = data.timestamp as { toDate?: () => Date }
      const timestamp = typeof ts.toDate === 'function' ? ts.toDate() : new Date(data.timestamp as string)
      return {
        ...data,
        timestamp,
      } as AkashicReading
    } catch (error) {
      devLog.error('Error loading Akashic Records reading:', error, 'akashicRecordsIntelligence')
      return null
    }
  }

  /**
   * Get all readings for a user
   */
  async getUserReadings(userId: string): Promise<AkashicReading[]> {
    if (!this.db) {
      return []
    }

    try {
      const rows = await userSubcollectionQueryOrdered(userId, 'akashic-readings', 'timestamp', 'desc')
      return rows.map((data) => {
        const ts = data.timestamp as { toDate?: () => Date }
        const timestamp = typeof ts.toDate === 'function' ? ts.toDate() : new Date(data.timestamp as string)
        return {
          ...data,
          timestamp,
        } as AkashicReading
      })
    } catch (error) {
      devLog.error('Error loading user Akashic Records readings:', error, 'akashicRecordsIntelligence')
      return []
    }
  }
}

export const akashicRecordsIntelligence = new AkashicRecordsIntelligence()

