// Chart Pattern Detection for Western Astrology
// Identifies major aspect patterns like Grand Trine, T-Square, Grand Cross, etc.

export interface AspectPattern {
  type: 'grand-trine' | 't-square' | 'grand-cross' | 'yod' | 'kite' | 'stellium' | 'mystic-rectangle'
  name: string
  description: string
  planets: string[]
  element?: string
  influence: 'harmonious' | 'challenging' | 'mixed'
  strength: number // 0-1
}

interface Planet {
  name: string
  longitude: number
  sign?: string | { signName: string }
  // Note: Angle points (Ascendant, MC) are included as "planets" for pattern detection purposes
}

interface Aspect {
  planet1: string
  planet2: string
  type: string
  orb: number
  influence?: 'harmonious' | 'challenging' | 'neutral'
}

// Helper to get sign name from planet
function getSignName(planet: Planet): string {
  if (typeof planet.sign === 'string') return planet.sign
  if (planet.sign && typeof planet.sign === 'object' && 'signName' in planet.sign) {
    return planet.sign.signName
  }
  return 'Unknown'
}

// Helper to get element from sign name
function getElement(signName: string): string {
  const fireSigns = ['Aries', 'Leo', 'Sagittarius']
  const earthSigns = ['Taurus', 'Virgo', 'Capricorn']
  const airSigns = ['Gemini', 'Libra', 'Aquarius']
  const waterSigns = ['Cancer', 'Scorpio', 'Pisces']
  
  if (fireSigns.includes(signName)) return 'Fire'
  if (earthSigns.includes(signName)) return 'Earth'
  if (airSigns.includes(signName)) return 'Air'
  if (waterSigns.includes(signName)) return 'Water'
  return 'Unknown'
}

// Detect Grand Trine (3 planets in trine, all in same element)
function detectGrandTrine(planets: Planet[], aspects: Aspect[]): AspectPattern[] {
  const patterns: AspectPattern[] = []
  const trineAspects = aspects.filter(a => a.type.toLowerCase() === 'trine')
  
  // Find sets of 3 planets all in trine with each other
  const planetNames = planets.map(p => p.name)
  
  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      for (let k = j + 1; k < planetNames.length; k++) {
        const p1 = planetNames[i]
        const p2 = planetNames[j]
        const p3 = planetNames[k]
        
        // Check if all three are in trine with each other
        const hasTrine12 = trineAspects.some(a => 
          (a.planet1 === p1 && a.planet2 === p2) || (a.planet1 === p2 && a.planet2 === p1)
        )
        const hasTrine23 = trineAspects.some(a => 
          (a.planet1 === p2 && a.planet2 === p3) || (a.planet1 === p3 && a.planet2 === p2)
        )
        const hasTrine13 = trineAspects.some(a => 
          (a.planet1 === p1 && a.planet2 === p3) || (a.planet1 === p3 && a.planet2 === p1)
        )
        
        if (hasTrine12 && hasTrine23 && hasTrine13) {
          // Check if all in same element
          const planet1 = planets.find(p => p.name === p1)!
          const planet2 = planets.find(p => p.name === p2)!
          const planet3 = planets.find(p => p.name === p3)!
          
          const element1 = getElement(getSignName(planet1))
          const element2 = getElement(getSignName(planet2))
          const element3 = getElement(getSignName(planet3))
          
          if (element1 === element2 && element2 === element3 && element1 !== 'Unknown') {
            patterns.push({
              type: 'grand-trine',
              name: `Grand Trine in ${element1}`,
              description: `A harmonious triangle formed by ${p1}, ${p2}, and ${p3}, all in ${element1} signs. This indicates natural talent and ease in the areas governed by these planets.`,
              planets: [p1, p2, p3],
              element: element1,
              influence: 'harmonious',
              strength: 0.9
            })
          }
        }
      }
    }
  }
  
  return patterns
}

// Detect T-Square (3 planets: 2 in opposition, both square to 3rd)
function detectTSquare(planets: Planet[], aspects: Aspect[]): AspectPattern[] {
  const patterns: AspectPattern[] = []
  const oppositionAspects = aspects.filter(a => a.type.toLowerCase() === 'opposition')
  const squareAspects = aspects.filter(a => a.type.toLowerCase() === 'square')
  
  for (const opposition of oppositionAspects) {
    const p1 = opposition.planet1
    const p2 = opposition.planet2
    
    // Find a planet that squares both
    for (const planet of planets) {
      const p3 = planet.name
      if (p3 === p1 || p3 === p2) continue
      
      const squaresP1 = squareAspects.some(a =>
        (a.planet1 === p1 && a.planet2 === p3) || (a.planet1 === p3 && a.planet2 === p1)
      )
      const squaresP2 = squareAspects.some(a =>
        (a.planet1 === p2 && a.planet2 === p3) || (a.planet1 === p3 && a.planet2 === p2)
      )
      
      if (squaresP1 && squaresP2) {
        patterns.push({
          type: 't-square',
          name: `T-Square (${p1}, ${p2}, ${p3})`,
          description: `A challenging configuration where ${p1} opposes ${p2}, and both are squared by ${p3}. This creates dynamic tension that drives action and growth through challenge.`,
          planets: [p1, p2, p3],
          influence: 'challenging',
          strength: 0.85
        })
      }
    }
  }
  
  return patterns
}

// Detect Grand Cross (4 planets, 2 oppositions forming a cross, all square each other)
function detectGrandCross(planets: Planet[], aspects: Aspect[]): AspectPattern[] {
  const patterns: AspectPattern[] = []
  const oppositionAspects = aspects.filter(a => a.type.toLowerCase() === 'opposition')
  const squareAspects = aspects.filter(a => a.type.toLowerCase() === 'square')
  
  // Find two oppositions that form a cross
  for (let i = 0; i < oppositionAspects.length; i++) {
    for (let j = i + 1; j < oppositionAspects.length; j++) {
      const opp1 = oppositionAspects[i]
      const opp2 = oppositionAspects[j]
      
      // Get all 4 planets
      const allPlanets = new Set([opp1.planet1, opp1.planet2, opp2.planet1, opp2.planet2])
      
      if (allPlanets.size === 4) {
        const planetsArray = Array.from(allPlanets)
        
        // Verify all are square to each other appropriately
        let isGrandCross = true
        for (let x = 0; x < planetsArray.length; x++) {
          for (let y = x + 1; y < planetsArray.length; y++) {
            const p1 = planetsArray[x]
            const p2 = planetsArray[y]
            
            // Should be either opposition or square
            const hasAspect = aspects.some(a =>
              ((a.planet1 === p1 && a.planet2 === p2) || (a.planet1 === p2 && a.planet2 === p1)) &&
              (a.type.toLowerCase() === 'opposition' || a.type.toLowerCase() === 'square')
            )
            
            if (!hasAspect) {
              isGrandCross = false
              break
            }
          }
          if (!isGrandCross) break
        }
        
        if (isGrandCross) {
          patterns.push({
            type: 'grand-cross',
            name: `Grand Cross (${planetsArray.join(', ')})`,
            description: `A powerful configuration of four planets forming two oppositions and four squares. This creates maximum tension and challenge, but also tremendous potential for growth and manifestation through persistent effort.`,
            planets: planetsArray,
            influence: 'challenging',
            strength: 1.0
          })
        }
      }
    }
  }
  
  return patterns
}

// Detect Stellium (3+ planets in same sign or house)
function detectStellium(planets: Planet[]): AspectPattern[] {
  const patterns: AspectPattern[] = []
  const planetsBySign: Record<string, string[]> = {}
  
  // Group planets by sign
  for (const planet of planets) {
    const signName = getSignName(planet)
    if (signName !== 'Unknown') {
      if (!planetsBySign[signName]) {
        planetsBySign[signName] = []
      }
      planetsBySign[signName].push(planet.name)
    }
  }
  
  // Find stelliums (3+ planets in same sign)
  for (const [signName, planetsInSign] of Object.entries(planetsBySign)) {
    if (planetsInSign.length >= 3) {
      const element = getElement(signName)
      patterns.push({
        type: 'stellium',
        name: `Stellium in ${signName}`,
        description: `A concentration of ${planetsInSign.length} planets in ${signName}, creating intense focus and energy in the areas ruled by this sign. This amplifies ${element} qualities significantly.`,
        planets: planetsInSign,
        element,
        influence: 'mixed',
        strength: Math.min(planetsInSign.length / 5, 1) // More planets = stronger
      })
    }
  }
  
  return patterns
}

// Detect Yod (Finger of God - 2 planets in sextile, both quincunx to 3rd)
function detectYod(planets: Planet[], aspects: Aspect[]): AspectPattern[] {
  const patterns: AspectPattern[] = []
  const sextileAspects = aspects.filter(a => a.type.toLowerCase() === 'sextile')
  const quincunxAspects = aspects.filter(a => 
    a.type.toLowerCase() === 'quincunx' || a.type.toLowerCase() === 'inconjunct'
  )
  
  for (const sextile of sextileAspects) {
    const p1 = sextile.planet1
    const p2 = sextile.planet2
    
    // Find a planet that is quincunx to both
    for (const planet of planets) {
      const p3 = planet.name
      if (p3 === p1 || p3 === p2) continue
      
      const quincunxP1 = quincunxAspects.some(a =>
        (a.planet1 === p1 && a.planet2 === p3) || (a.planet1 === p3 && a.planet2 === p1)
      )
      const quincunxP2 = quincunxAspects.some(a =>
        (a.planet1 === p2 && a.planet2 === p3) || (a.planet1 === p3 && a.planet2 === p2)
      )
      
      if (quincunxP1 && quincunxP2) {
        patterns.push({
          type: 'yod',
          name: `Yod (Finger of God)`,
          description: `A rare pattern where ${p1} and ${p2} are in sextile, both forming quincunxes to ${p3}. Known as the "Finger of God," this indicates a special destiny or karmic purpose requiring adjustment and spiritual growth.`,
          planets: [p1, p2, p3],
          influence: 'mixed',
          strength: 0.9
        })
      }
    }
  }
  
  return patterns
}

// Main function to detect all patterns
// Note: planets array should include angle points (Ascendant, MC) for complete pattern detection
export function detectChartPatterns(planets: Planet[], aspects: Aspect[]): AspectPattern[] {
  const allPatterns: AspectPattern[] = []
  
  // Detect each type of pattern
  allPatterns.push(...detectGrandTrine(planets, aspects))
  allPatterns.push(...detectTSquare(planets, aspects))
  allPatterns.push(...detectGrandCross(planets, aspects))
  allPatterns.push(...detectStellium(planets))
  allPatterns.push(...detectYod(planets, aspects))
  
  // Sort by strength (most significant first)
  return allPatterns.sort((a, b) => b.strength - a.strength)
}

// Get pattern icon
export function getPatternIcon(patternType: AspectPattern['type']): string {
  const icons = {
    'grand-trine': '△',
    't-square': '⊤',
    'grand-cross': '✚',
    'yod': '☝',
    'kite': '🪁',
    'stellium': '✦',
    'mystic-rectangle': '▭'
  }
  return icons[patternType] || '✦'
}

// Get pattern color
export function getPatternColor(influence: AspectPattern['influence']): string {
  const colors = {
    harmonious: 'green',
    challenging: 'orange',
    mixed: 'blue'
  }
  return colors[influence]
}
