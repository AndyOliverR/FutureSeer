// Palmistry Remedy Analyzer
// Analyzes palmistry profiles and generates personalized remedy recommendations

import { READING_REMEDIES } from '@/lib/comprehensiveRemedyDatabase'
import { PalmistryAnalysis } from '@/lib/palmistryIntelligence'

export interface PalmistryRemedy {
  id: string
  category: 'line' | 'mount' | 'hand-shape' | 'finger' | 'marking'
  subCategory: string // e.g., 'life-line-weak', 'jupiter-mount-weak'
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  instructions: string[]
  benefits: string[]
  gemstones?: string[]
  colors?: string[]
  mantras?: string[]
  practices?: string[]
  timing?: string
  frequency?: string
  triggers?: string[]
}

export interface RemedyAnalysis {
  remedies: PalmistryRemedy[]
  summary: {
    totalRemedies: number
    criticalCount: number
    highCount: number
    mediumCount: number
    lowCount: number
    categories: string[]
  }
}

// Get remedies for weak/broken lines
function getLineRemedies(lines: PalmistryAnalysis['lines']): PalmistryRemedy[] {
  const remedies: PalmistryRemedy[] = []
  
  // Safely access lineRemedies
  if (!READING_REMEDIES.palmistry?.lineRemedies) {
    console.warn('lineRemedies not found in READING_REMEDIES.palmistry')
    return remedies
  }
  
  const lineRemedies = READING_REMEDIES.palmistry.lineRemedies

  lines.forEach((line) => {
    // Check for weak/faint lines
    if (line.depth === 'faint' || line.energy < 4) {
      // Convert "Life Line" to "lifeLineWeak" (camelCase with capital L)
      const lineNameKey = line.name.replace(/\s+/g, '').replace(/^./, (c) => c.toLowerCase())
      const remedyKey = `${lineNameKey}Weak` as keyof typeof lineRemedies
      
      if (lineRemedies && lineRemedies[remedyKey]) {
        const remedy = lineRemedies[remedyKey] as any
        remedies.push({
          id: `line-${line.name.toLowerCase().replace(/\s+/g, '-')}-weak`,
          category: 'line',
          subCategory: `${line.name.toLowerCase().replace(/\s+/g, '-')}-weak`,
          title: remedy.title,
          description: remedy.description,
          priority: remedy.priority || 'high',
          instructions: remedy.instructions || [],
          benefits: remedy.benefits || [],
          gemstones: remedy.gemstones,
          colors: remedy.colors,
          mantras: remedy.mantras,
          practices: remedy.practices,
          timing: remedy.timing,
          frequency: remedy.frequency,
          triggers: remedy.palmistryTriggers || []
        })
      }
    }

    // Check for broken lines
    if (line.quality === 'broken') {
      // Convert "Life Line" to "lifeLineBroken" (camelCase with capital L)
      const lineNameKey = line.name.replace(/\s+/g, '').replace(/^./, (c) => c.toLowerCase())
      const remedyKey = `${lineNameKey}Broken` as keyof typeof lineRemedies
      
      if (lineRemedies && lineRemedies[remedyKey]) {
        const remedy = lineRemedies[remedyKey] as any
        remedies.push({
          id: `line-${line.name.toLowerCase().replace(/\s+/g, '-')}-broken`,
          category: 'line',
          subCategory: `${line.name.toLowerCase().replace(/\s+/g, '-')}-broken`,
          title: remedy.title,
          description: remedy.description,
          priority: remedy.priority || 'critical',
          instructions: remedy.instructions || [],
          benefits: remedy.benefits || [],
          gemstones: remedy.gemstones,
          colors: remedy.colors,
          mantras: remedy.mantras,
          practices: remedy.practices,
          timing: remedy.timing,
          frequency: remedy.frequency,
          triggers: remedy.palmistryTriggers || []
        })
      }
    }

    // Check for short lines
    if (line.length === 'short' && line.name === 'Life Line') {
      if (lineRemedies && lineRemedies.lifeLineShort) {
        const remedy = lineRemedies.lifeLineShort as any
        remedies.push({
          id: 'line-life-short',
          category: 'line',
          subCategory: 'life-line-short',
          title: remedy.title,
          description: remedy.description,
          priority: remedy.priority || 'high',
          instructions: remedy.instructions || [],
          benefits: remedy.benefits || [],
          gemstones: remedy.gemstones,
          colors: remedy.colors,
          mantras: remedy.mantras,
          practices: remedy.practices,
          timing: remedy.timing,
          frequency: remedy.frequency,
          triggers: remedy.palmistryTriggers || []
        })
      }
    }

    // Check for chained lines
    if (line.quality === 'chained') {
      const lineNameKey = line.name.replace(/\s+/g, '').replace(/^./, (c) => c.toLowerCase())
      const remedyKey = `${lineNameKey}Chained` as keyof typeof lineRemedies
      if (lineRemedies && lineRemedies[remedyKey]) {
        const remedy = lineRemedies[remedyKey] as any
        remedies.push({
          id: `line-${line.name.toLowerCase().replace(/\s+/g, '-')}-chained`,
          category: 'line',
          subCategory: `${line.name.toLowerCase().replace(/\s+/g, '-')}-chained`,
          title: remedy.title,
          description: remedy.description,
          priority: remedy.priority || 'high',
          instructions: remedy.instructions || [],
          benefits: remedy.benefits || [],
          gemstones: remedy.gemstones,
          colors: remedy.colors,
          mantras: remedy.mantras,
          practices: remedy.practices,
          timing: remedy.timing,
          frequency: remedy.frequency,
          triggers: remedy.palmistryTriggers || []
        })
      }
    }

    // Check for wavy head line
    if (line.name === 'Head Line' && line.quality === 'wavy') {
      if (lineRemedies && lineRemedies.headLineWavy) {
        const remedy = lineRemedies.headLineWavy as any
        remedies.push({
          id: 'line-head-wavy',
          category: 'line',
          subCategory: 'head-line-wavy',
          title: remedy.title,
          description: remedy.description,
          priority: remedy.priority || 'medium',
          instructions: remedy.instructions || [],
          benefits: remedy.benefits || [],
          gemstones: remedy.gemstones,
          colors: remedy.colors,
          mantras: remedy.mantras,
          practices: remedy.practices,
          timing: remedy.timing,
          frequency: remedy.frequency,
          triggers: remedy.palmistryTriggers || []
        })
      }
    }

    // Check for forked heart line
    if (line.name === 'Heart Line' && line.quality === 'forked') {
      const remedy = lineRemedies.heartLineForked as any
      if (remedy) {
        remedies.push({
          id: 'line-heart-forked',
          category: 'line',
          subCategory: 'heart-line-forked',
          title: remedy.title,
          description: remedy.description,
          priority: remedy.priority || 'medium',
          instructions: remedy.instructions || [],
          benefits: remedy.benefits || [],
          gemstones: remedy.gemstones,
          colors: remedy.colors,
          mantras: remedy.mantras,
          practices: remedy.practices,
          timing: remedy.timing,
          frequency: remedy.frequency,
          triggers: remedy.palmistryTriggers || []
        })
      }
    }

    // Check for missing fate line
    if (line.name === 'Fate Line' && line.length === 'short' && line.depth === 'faint') {
      const remedy = lineRemedies.fateLineMissing as any
      if (remedy) {
        remedies.push({
          id: 'line-fate-missing',
          category: 'line',
          subCategory: 'fate-line-missing',
          title: remedy.title,
          description: remedy.description,
          priority: remedy.priority || 'high',
          instructions: remedy.instructions || [],
          benefits: remedy.benefits || [],
          gemstones: remedy.gemstones,
          colors: remedy.colors,
          mantras: remedy.mantras,
          practices: remedy.practices,
          timing: remedy.timing,
          frequency: remedy.frequency,
          triggers: remedy.palmistryTriggers || []
        })
      }
    }
  })

  return remedies
}

// Get remedies for weak/overdeveloped mounts
function getMountRemedies(mounts: PalmistryAnalysis['mounts']): PalmistryRemedy[] {
  const remedies: PalmistryRemedy[] = []
  
  // Safely access mountRemedies
  if (!READING_REMEDIES.palmistry?.mountRemedies) {
    console.warn('mountRemedies not found in READING_REMEDIES.palmistry')
    return remedies
  }
  
  const mountRemedies = READING_REMEDIES.palmistry.mountRemedies

  mounts.forEach((mount) => {
    const mountName = mount.name.toLowerCase()
      .replace('mount of ', '')
      .replace('mount ', '')
      .replace(/\s+/g, '')
    
    // Map to correct keys
    const mountKeyMap: { [key: string]: string } = {
      'jupiter': 'jupiter',
      'saturn': 'saturn',
      'apollo': 'apollo',
      'sun': 'apollo', // Apollo and Sun are the same
      'mercury': 'mercury',
      'mars': 'mars',
      'venus': 'venus',
      'moon': 'moon',
      'luna': 'moon' // Moon and Luna are the same
    }
    
    const mappedMountName = mountKeyMap[mountName] || mountName
    
    // Check for weak/flat mounts
    if (mount.prominence === 'flat' || (mount.prominence === 'normal' && mount.energy < 4)) {
      const remedyKey = `${mappedMountName}MountWeak` as keyof typeof mountRemedies
      
      if (mountRemedies && mountRemedies[remedyKey]) {
        const remedy = mountRemedies[remedyKey] as any
        remedies.push({
          id: `mount-${mappedMountName}-weak`,
          category: 'mount',
          subCategory: `${mappedMountName}-mount-weak`,
          title: remedy.title,
          description: remedy.description,
          priority: remedy.priority || 'high',
          instructions: remedy.instructions || [],
          benefits: remedy.benefits || [],
          gemstones: remedy.gemstones,
          colors: remedy.colors,
          mantras: remedy.mantras,
          practices: remedy.practices,
          timing: remedy.timing,
          frequency: remedy.frequency,
          triggers: remedy.palmistryTriggers || []
        })
      }
    }

    // Check for overdeveloped mounts
    if (mount.prominence === 'very-prominent' || mount.energy > 8) {
      const remedyKey = `${mappedMountName}MountOverdeveloped` as keyof typeof mountRemedies
      
      if (mountRemedies && mountRemedies[remedyKey]) {
        const remedy = mountRemedies[remedyKey] as any
        remedies.push({
          id: `mount-${mappedMountName}-overdeveloped`,
          category: 'mount',
          subCategory: `${mappedMountName}-mount-overdeveloped`,
          title: remedy.title,
          description: remedy.description,
          priority: remedy.priority || 'medium',
          instructions: remedy.instructions || [],
          benefits: remedy.benefits || [],
          gemstones: remedy.gemstones,
          colors: remedy.colors,
          mantras: remedy.mantras,
          practices: remedy.practices,
          timing: remedy.timing,
          frequency: remedy.frequency,
          triggers: remedy.palmistryTriggers || []
        })
      }
    }
  })

  return remedies
}

// Get remedies for hand shape
function getHandShapeRemedies(handShape: string): PalmistryRemedy[] {
  const remedies: PalmistryRemedy[] = []
  
  // Safely access handShapeRemedies
  if (!READING_REMEDIES.palmistry?.handShapeRemedies) {
    console.warn('handShapeRemedies not found in READING_REMEDIES.palmistry')
    return remedies
  }
  
  const handShapeRemedies = READING_REMEDIES.palmistry.handShapeRemedies

  // Extract hand shape type from palm shape string
  const shapeType = handShape.toLowerCase().includes('earth') ? 'earth' :
                   handShape.toLowerCase().includes('air') ? 'air' :
                   handShape.toLowerCase().includes('fire') ? 'fire' :
                   handShape.toLowerCase().includes('water') ? 'water' : null

  if (shapeType) {
    const remedyKey = `${shapeType}Hand` as keyof typeof handShapeRemedies
    
    if (handShapeRemedies && handShapeRemedies[remedyKey]) {
      const remedy = handShapeRemedies[remedyKey] as any
      remedies.push({
        id: `hand-shape-${shapeType}`,
        category: 'hand-shape',
        subCategory: `${shapeType}-hand`,
        title: remedy.title,
        description: remedy.description,
        priority: remedy.priority || 'medium',
        instructions: remedy.instructions || [],
        benefits: remedy.benefits || [],
        gemstones: remedy.gemstones,
        colors: remedy.colors,
        mantras: remedy.mantras,
        practices: remedy.practices,
        timing: remedy.timing,
        frequency: remedy.frequency,
        triggers: remedy.palmistryTriggers || []
      })
    }
  }

  return remedies
}

// Get remedies for finger characteristics
function getFingerRemedies(fingers: PalmistryAnalysis['fingers']): PalmistryRemedy[] {
  const remedies: PalmistryRemedy[] = []
  
  // Safely access fingerRemedies
  if (!READING_REMEDIES.palmistry?.fingerRemedies) {
    console.warn('fingerRemedies not found in READING_REMEDIES.palmistry')
    return remedies
  }
  
  const fingerRemedies = READING_REMEDIES.palmistry.fingerRemedies

  // Analyze all fingers collectively
  const allFingers = Object.values(fingers)
  const avgLength = allFingers.filter(f => f.length === 'short').length > allFingers.length / 2 ? 'short' :
                   allFingers.filter(f => f.length === 'long').length > allFingers.length / 2 ? 'long' : 'medium'
  
  const avgThickness = allFingers.filter(f => f.thickness === 'thin').length > allFingers.length / 2 ? 'thin' :
                       allFingers.filter(f => f.thickness === 'thick').length > allFingers.length / 2 ? 'thick' : 'medium'
  
  const avgFlexibility = allFingers.filter(f => f.flexibility === 'rigid').length > allFingers.length / 2 ? 'rigid' :
                         allFingers.filter(f => f.flexibility === 'flexible').length > allFingers.length / 2 ? 'flexible' : 'normal'

  // Add remedies based on characteristics
  if (avgLength === 'short' && fingerRemedies.shortFingers) {
    const remedy = fingerRemedies.shortFingers as any
    remedies.push({
      id: 'fingers-short',
      category: 'finger',
      subCategory: 'short-fingers',
      title: remedy.title,
      description: remedy.description,
      priority: remedy.priority || 'low',
      instructions: remedy.instructions || [],
      benefits: remedy.benefits || [],
      gemstones: remedy.gemstones,
      colors: remedy.colors,
      mantras: remedy.mantras,
      practices: remedy.practices,
      timing: remedy.timing,
      frequency: remedy.frequency,
      triggers: remedy.palmistryTriggers || []
    })
  }

  if (avgLength === 'long' && fingerRemedies.longFingers) {
    const remedy = fingerRemedies.longFingers as any
    remedies.push({
      id: 'fingers-long',
      category: 'finger',
      subCategory: 'long-fingers',
      title: remedy.title,
      description: remedy.description,
      priority: remedy.priority || 'low',
      instructions: remedy.instructions || [],
      benefits: remedy.benefits || [],
      gemstones: remedy.gemstones,
      colors: remedy.colors,
      mantras: remedy.mantras,
      practices: remedy.practices,
      timing: remedy.timing,
      frequency: remedy.frequency,
      triggers: remedy.palmistryTriggers || []
    })
  }

  if (avgThickness === 'thick' && fingerRemedies.thickFingers) {
    const remedy = fingerRemedies.thickFingers as any
    remedies.push({
      id: 'fingers-thick',
      category: 'finger',
      subCategory: 'thick-fingers',
      title: remedy.title,
      description: remedy.description,
      priority: remedy.priority || 'low',
      instructions: remedy.instructions || [],
      benefits: remedy.benefits || [],
      gemstones: remedy.gemstones,
      colors: remedy.colors,
      mantras: remedy.mantras,
      practices: remedy.practices,
      timing: remedy.timing,
      frequency: remedy.frequency,
      triggers: remedy.palmistryTriggers || []
    })
  }

  if (avgThickness === 'thin' && fingerRemedies.thinFingers) {
    const remedy = fingerRemedies.thinFingers as any
    remedies.push({
      id: 'fingers-thin',
      category: 'finger',
      subCategory: 'thin-fingers',
      title: remedy.title,
      description: remedy.description,
      priority: remedy.priority || 'low',
      instructions: remedy.instructions || [],
      benefits: remedy.benefits || [],
      gemstones: remedy.gemstones,
      colors: remedy.colors,
      mantras: remedy.mantras,
      practices: remedy.practices,
      timing: remedy.timing,
      frequency: remedy.frequency,
      triggers: remedy.palmistryTriggers || []
    })
  }

  if (avgFlexibility === 'rigid' && fingerRemedies.rigidFingers) {
    const remedy = fingerRemedies.rigidFingers as any
    remedies.push({
      id: 'fingers-rigid',
      category: 'finger',
      subCategory: 'rigid-fingers',
      title: remedy.title,
      description: remedy.description,
      priority: remedy.priority || 'low',
      instructions: remedy.instructions || [],
      benefits: remedy.benefits || [],
      gemstones: remedy.gemstones,
      colors: remedy.colors,
      mantras: remedy.mantras,
      practices: remedy.practices,
      timing: remedy.timing,
      frequency: remedy.frequency,
      triggers: remedy.palmistryTriggers || []
    })
  }

  if (avgFlexibility === 'flexible' && fingerRemedies.flexibleFingers) {
    const remedy = fingerRemedies.flexibleFingers as any
    remedies.push({
      id: 'fingers-flexible',
      category: 'finger',
      subCategory: 'flexible-fingers',
      title: remedy.title,
      description: remedy.description,
      priority: remedy.priority || 'low',
      instructions: remedy.instructions || [],
      benefits: remedy.benefits || [],
      gemstones: remedy.gemstones,
      colors: remedy.colors,
      mantras: remedy.mantras,
      practices: remedy.practices,
      timing: remedy.timing,
      frequency: remedy.frequency,
      triggers: remedy.palmistryTriggers || []
    })
  }

  return remedies
}

// Get remedies for markings (if available in analysis)
function getMarkingRemedies(lines: PalmistryAnalysis['lines']): PalmistryRemedy[] {
  const remedies: PalmistryRemedy[] = []
  
  // Safely access markingRemedies
  if (!READING_REMEDIES.palmistry?.markingRemedies) {
    console.warn('markingRemedies not found in READING_REMEDIES.palmistry')
    return remedies
  }
  
  const markingRemedies = READING_REMEDIES.palmistry.markingRemedies

  // Check for broken lines (marking remedy)
  const hasBrokenLines = lines.some(line => line.quality === 'broken')
  if (hasBrokenLines && markingRemedies.linesWithBreaks) {
    const remedy = markingRemedies.linesWithBreaks as any
    remedies.push({
      id: 'marking-lines-breaks',
      category: 'marking',
      subCategory: 'lines-with-breaks',
      title: remedy.title,
      description: remedy.description,
      priority: remedy.priority || 'critical',
      instructions: remedy.instructions || [],
      benefits: remedy.benefits || [],
      gemstones: remedy.gemstones,
      colors: remedy.colors,
      mantras: remedy.mantras,
      practices: remedy.practices,
      timing: remedy.timing,
      frequency: remedy.frequency,
      triggers: remedy.palmistryTriggers || []
    })
  }

  // Check for island formations
  const hasIslands = lines.some(line => line.quality === 'island')
  if (hasIslands && markingRemedies.islandFormations) {
    const remedy = markingRemedies.islandFormations as any
    remedies.push({
      id: 'marking-islands',
      category: 'marking',
      subCategory: 'island-formations',
      title: remedy.title,
      description: remedy.description,
      priority: remedy.priority || 'high',
      instructions: remedy.instructions || [],
      benefits: remedy.benefits || [],
      gemstones: remedy.gemstones,
      colors: remedy.colors,
      mantras: remedy.mantras,
      practices: remedy.practices,
      timing: remedy.timing,
      frequency: remedy.frequency,
      triggers: remedy.palmistryTriggers || []
    })
  }

  return remedies
}

// Main analysis function
export function analyzePalmistryProfile(palmistryData: PalmistryAnalysis): RemedyAnalysis {
  const remedies: PalmistryRemedy[] = []

  // 1. Line remedies (highest priority)
  remedies.push(...getLineRemedies(palmistryData.lines))

  // 2. Marking remedies (high priority)
  remedies.push(...getMarkingRemedies(palmistryData.lines))

  // 3. Mount remedies (medium-high priority)
  remedies.push(...getMountRemedies(palmistryData.mounts))

  // 4. Hand shape remedies (medium priority)
  remedies.push(...getHandShapeRemedies(palmistryData.palmShape))

  // 5. Finger remedies (medium-low priority)
  remedies.push(...getFingerRemedies(palmistryData.fingers))

  // Sort by priority (critical > high > medium > low)
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  remedies.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  // Remove duplicates
  const uniqueRemedies = remedies.filter((remedy, index, self) => 
    index === self.findIndex(r => r.id === remedy.id)
  )

  // Count by priority
  const criticalCount = uniqueRemedies.filter(r => r.priority === 'critical').length
  const highCount = uniqueRemedies.filter(r => r.priority === 'high').length
  const mediumCount = uniqueRemedies.filter(r => r.priority === 'medium').length
  const lowCount = uniqueRemedies.filter(r => r.priority === 'low').length

  // Get unique categories
  const categories = Array.from(new Set(uniqueRemedies.map(r => r.category)))

  return {
    remedies: uniqueRemedies,
    summary: {
      totalRemedies: uniqueRemedies.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      categories
    }
  }
}

