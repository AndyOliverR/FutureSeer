/**
 * Ogham Report Generator
 * Structures comprehensive Ogham reports with all sections
 */

import { UserProfile } from '../firebase'
import { OghamLetter, getOghamLettersFromName, calculateBirthTree, getAllOghamLetters } from './oghamService'

export interface OghamNameAnalysis {
  originalName: string
  oghamScript: string
  letters: OghamLetter[]
  overallMeaning: string
  letterMeanings: Array<{
    letter: OghamLetter
    position: number
    personalSignificance: string
  }>
  combinedTraits: string[]
  nameGuidance: string
}

export interface OghamBirthAnalysis {
  birthDate: string
  birthTree: OghamLetter
  treeMeaning: string
  personalConnection: string
  lifePath: string
  seasonalInfluence: string
}

export interface OghamGuidance {
  current: string
  spiritual: string[]
  practical: string[]
  lifeAreas: {
    career: string
    relationships: string
    health: string
    spirituality: string
  }
  affirmations: string[]
}

export interface OghamCelticWisdom {
  overview: string
  traditions: string[]
  connections: string[]
  practices: string[]
}

export interface OghamReport {
  id: string
  timestamp: Date
  userId: string
  overview: {
    summary: string
    personalMessage: string
    keyInsights: string[]
  }
  nameAnalysis: OghamNameAnalysis
  birthTree: OghamBirthAnalysis
  personalLetters: {
    primary: OghamLetter[]
    secondary: OghamLetter[]
    allRelevant: OghamLetter[]
  }
  guidance: OghamGuidance
  celticWisdom: OghamCelticWisdom
  allLetters: {
    overview: string
    letters: OghamLetter[]
  }
  generatedAt: string
}

/**
 * Generate comprehensive Ogham report structure
 */
export function generateOghamReportStructure(
  userId: string,
  userProfile: UserProfile | null,
  nameAnalysis: OghamNameAnalysis,
  birthTree: OghamBirthAnalysis,
  aiInsights?: {
    overview?: string
    personalMessage?: string
    guidance?: OghamGuidance
    celticWisdom?: OghamCelticWisdom
  }
): OghamReport {
  const allLetters = getAllOghamLetters()
  
  // Determine primary and secondary letters
  const primaryLetters = [birthTree.birthTree, ...nameAnalysis.letters.slice(0, 3)]
  const uniquePrimary = Array.from(new Map(primaryLetters.map(l => [l.name, l])).values())
  
  const secondaryLetters = nameAnalysis.letters.slice(3)
  const uniqueSecondary = Array.from(new Map(secondaryLetters.map(l => [l.name, l])).values())
  
  const allRelevant = Array.from(new Map([...uniquePrimary, ...uniqueSecondary].map(l => [l.name, l])).values())
  
  return {
    id: `ogham-${userId}-${Date.now()}`,
    timestamp: new Date(),
    userId,
    overview: {
      summary: aiInsights?.overview || `Welcome to your Ogham reading. The ancient Celtic tree alphabet reveals profound insights about your path, connecting you with the wisdom of the trees and the natural world.`,
      personalMessage: aiInsights?.personalMessage || `The trees speak to you in the ancient Ogham script. Your birth tree, the ${birthTree.birthTree.tree}, guides your path, while the letters of your name reveal your unique gifts and challenges.`,
      keyInsights: [
        `Your birth tree is the ${birthTree.birthTree.tree}, representing ${birthTree.birthTree.meaning}`,
        `Your name in Ogham reveals ${nameAnalysis.combinedTraits.length} key traits`,
        `The Celtic wisdom of the trees offers guidance for your journey`,
        `You are connected to ${allRelevant.length} powerful tree energies`
      ]
    },
    nameAnalysis,
    birthTree,
    personalLetters: {
      primary: uniquePrimary,
      secondary: uniqueSecondary,
      allRelevant
    },
    guidance: aiInsights?.guidance || {
      current: `The trees guide you. Trust in the wisdom of your birth tree and the letters of your name.`,
      spiritual: [
        'Connect with nature regularly',
        'Meditate under trees when possible',
        'Honor the Celtic traditions',
        'Trust your intuitive guidance'
      ],
      practical: [
        'Embrace the traits of your birth tree',
        'Work with the energies of your name letters',
        'Use Celtic wisdom in daily life',
        'Create sacred spaces in nature'
      ],
      lifeAreas: {
        career: `Your birth tree, the ${birthTree.birthTree.tree}, suggests ${birthTree.birthTree.personalTraits[0]} in your career path.`,
        relationships: `The letters of your name reveal ${nameAnalysis.combinedTraits[0]} in relationships.`,
        health: `The ${birthTree.birthTree.tree} tree energy supports ${birthTree.birthTree.element} element balance.`,
        spirituality: `Your connection to Celtic wisdom through Ogham opens doors to ${birthTree.birthTree.celticLore.substring(0, 50)}...`
      },
      affirmations: [
        `I am connected to the wisdom of the ${birthTree.birthTree.tree} tree`,
        `The Ogham letters guide my path`,
        `I honor the Celtic traditions`,
        `Nature speaks to me through the trees`
      ]
    },
    celticWisdom: aiInsights?.celticWisdom || {
      overview: `The Ogham alphabet connects you with ancient Celtic wisdom, where each tree holds profound meaning and power.`,
      traditions: [
        'Tree worship and reverence',
        'Seasonal celebrations',
        'Divination through nature',
        'Connection with the Otherworld'
      ],
      connections: [
        'The natural world',
        'Celtic deities and spirits',
        'Ancestral wisdom',
        'The cycle of seasons'
      ],
      practices: [
        'Spend time in nature',
        'Learn about Celtic traditions',
        'Work with tree energies',
        'Honor the seasons'
      ]
    },
    allLetters: {
      overview: 'All 20 Ogham letters represent different trees, each with unique wisdom and guidance. Explore them all to deepen your understanding.',
      letters: allLetters
    },
    generatedAt: new Date().toISOString()
  }
}

/**
 * Generate name analysis from user profile
 */
export function generateNameAnalysis(
  userProfile: UserProfile | null
): OghamNameAnalysis {
  const fullName = userProfile?.fullName || userProfile?.displayName || 'Seeker'
  const letters = getOghamLettersFromName(fullName)
  
  // Get unique traits from all letters
  const allTraits = letters.flatMap(l => l.personalTraits)
  const uniqueTraits = Array.from(new Set(allTraits))
  
  // Generate letter meanings
  const letterMeanings = letters.map((letter, index) => ({
    letter,
    position: index + 1,
    personalSignificance: `${letter.tree} energy brings ${letter.meaning} to position ${index + 1} of your name. ${letter.symbolism.substring(0, 100)}...`
  }))
  
  // Overall meaning from combined letters
  const overallMeaning = letters.length > 0
    ? `Your name in Ogham reveals a journey through ${letters.length} tree energies, each contributing to your unique path. The combination of ${letters.slice(0, 3).map(l => l.tree).join(', ')} trees shapes your character and destiny.`
    : 'Your name holds deep meaning in the Ogham script.'
  
  return {
    originalName: fullName,
    oghamScript: letters.map(l => l.unicode).join(''),
    letters,
    overallMeaning,
    letterMeanings,
    combinedTraits: uniqueTraits,
    nameGuidance: `The trees of your name guide you: ${letters.map(l => l.tree).join(', ')}. Each tree offers its wisdom and strength.`
  }
}

/**
 * Generate birth tree analysis
 */
export function generateBirthTreeAnalysis(
  userProfile: UserProfile | null
): OghamBirthAnalysis {
  if (!userProfile?.birthDate) {
    // Default tree if no birth date
    const defaultTree = getAllOghamLetters()[0]
    return {
      birthDate: 'Unknown',
      birthTree: defaultTree,
      treeMeaning: defaultTree.meaning,
      personalConnection: 'Complete your birth information to discover your true birth tree.',
      lifePath: 'Your path will be revealed when your birth information is complete.',
      seasonalInfluence: 'Seasonal influences depend on your birth date.'
    }
  }
  
  const birthTree = calculateBirthTree(userProfile.birthDate)
  
  return {
    birthDate: userProfile.birthDate,
    birthTree,
    treeMeaning: birthTree.meaning,
    personalConnection: `You are deeply connected to the ${birthTree.tree} tree, which represents ${birthTree.meaning}. This tree guides your life path and offers its wisdom.`,
    lifePath: `Your life path is influenced by the ${birthTree.tree} tree energy, bringing ${birthTree.personalTraits.join(', ')} to your journey.`,
    seasonalInfluence: birthTree.season 
      ? `The ${birthTree.season} season influences your connection to the ${birthTree.tree} tree.`
      : 'Seasonal influences are present in your tree connection.'
  }
}

