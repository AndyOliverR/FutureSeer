// Life Journey Utilities
// Calculates major astrological cycles and life milestones

export interface LifeMilestone {
  id: string
  name: string
  description: string
  age: number
  date: Date
  type: 'saturn' | 'jupiter' | 'progressed-moon' | 'solar-return' | 'lunar-return' | 'chiron'
  icon: string
  significance: 'major' | 'moderate' | 'minor'
  isPast: boolean
  yearsUntil?: number
}

// Calculate age from birth date
function calculateAge(birthDate: Date, atDate: Date = new Date()): number {
  const age = atDate.getFullYear() - birthDate.getFullYear()
  const monthDiff = atDate.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && atDate.getDate() < birthDate.getDate())) {
    return age - 1
  }
  
  return age
}

// Saturn cycle milestones (approximately every 7 years)
function getSaturnMilestones(birthDate: Date): LifeMilestone[] {
  const milestones: LifeMilestone[] = []
  const currentAge = calculateAge(birthDate)
  
  const saturnCycles = [
    { age: 7, name: 'Saturn Square', description: 'First major life test - learning responsibility and boundaries' },
    { age: 14, name: 'Saturn Opposition', description: 'Adolescent challenges - finding your place in the world' },
    { age: 21, name: 'Saturn Square', description: 'Young adult crossroads - making serious life choices' },
    { age: 29, name: 'Saturn Return', description: 'Coming of age - major life restructuring and maturation', significance: 'major' as const },
    { age: 36, name: 'Saturn Square', description: 'Mid-life checkpoint - evaluating progress and redirecting' },
    { age: 44, name: 'Saturn Opposition', description: 'Mid-life reassessment - wisdom meets experience' },
    { age: 51, name: 'Saturn Square', description: 'Mature wisdom phase - teaching and consolidating achievements' },
    { age: 58, name: 'Second Saturn Return', description: 'Elder wisdom - reaping rewards of life experience', significance: 'major' as const },
    { age: 87, name: 'Third Saturn Return', description: 'Sage wisdom - completing the life cycle', significance: 'major' as const }
  ]
  
  for (const cycle of saturnCycles) {
    const milestoneDate = new Date(birthDate)
    milestoneDate.setFullYear(birthDate.getFullYear() + cycle.age)
    
    const isPast = currentAge > cycle.age
    const yearsUntil = isPast ? undefined : cycle.age - currentAge
    
    milestones.push({
      id: `saturn-${cycle.age}`,
      name: cycle.name,
      description: cycle.description,
      age: cycle.age,
      date: milestoneDate,
      type: 'saturn',
      icon: '♄',
      significance: cycle.significance || 'moderate',
      isPast,
      yearsUntil
    })
  }
  
  return milestones
}

// Jupiter cycle milestones (approximately every 12 years)
function getJupiterMilestones(birthDate: Date): LifeMilestone[] {
  const milestones: LifeMilestone[] = []
  const currentAge = calculateAge(birthDate)
  
  const jupiterCycles = [
    { age: 12, name: 'First Jupiter Return', description: 'Adolescent expansion - new horizons and growth' },
    { age: 24, name: 'Second Jupiter Return', description: 'Young adult opportunities - broadening life experience' },
    { age: 36, name: 'Third Jupiter Return', description: 'Mature expansion - wisdom and abundance', significance: 'major' as const },
    { age: 48, name: 'Fourth Jupiter Return', description: 'Peak wisdom - teaching and sharing knowledge' },
    { age: 60, name: 'Fifth Jupiter Return', description: 'Elder growth - continued expansion and joy', significance: 'major' as const },
    { age: 72, name: 'Sixth Jupiter Return', description: 'Sage wisdom - philosophical fulfillment' },
    { age: 84, name: 'Seventh Jupiter Return', description: 'Complete cycle - joy and understanding' }
  ]
  
  for (const cycle of jupiterCycles) {
    const milestoneDate = new Date(birthDate)
    milestoneDate.setFullYear(birthDate.getFullYear() + cycle.age)
    
    const isPast = currentAge > cycle.age
    const yearsUntil = isPast ? undefined : cycle.age - currentAge
    
    milestones.push({
      id: `jupiter-${cycle.age}`,
      name: cycle.name,
      description: cycle.description,
      age: cycle.age,
      date: milestoneDate,
      type: 'jupiter',
      icon: '♃',
      significance: cycle.significance || 'moderate',
      isPast,
      yearsUntil
    })
  }
  
  return milestones
}

// Chiron return (around age 50-51)
function getChironReturn(birthDate: Date): LifeMilestone[] {
  const currentAge = calculateAge(birthDate)
  const chironAge = 50
  
  const chironDate = new Date(birthDate)
  chironDate.setFullYear(birthDate.getFullYear() + chironAge)
  
  return [{
    id: 'chiron-return',
    name: 'Chiron Return',
    description: 'The wounded healer returns - integrating life wounds into wisdom and healing power',
    age: chironAge,
    date: chironDate,
    type: 'chiron',
    icon: '⚕',
    significance: 'major',
    isPast: currentAge > chironAge,
    yearsUntil: currentAge > chironAge ? undefined : chironAge - currentAge
  }]
}

// Progressed Moon sign changes (approximately every 2.5 years)
function getProgressedMoonChanges(birthDate: Date): LifeMilestone[] {
  const milestones: LifeMilestone[] = []
  const currentAge = calculateAge(birthDate)
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
  
  // Progressed Moon changes sign roughly every 2.5 years
  for (let i = 0; i < 80; i += 2.5) {
    const age = Math.floor(i)
    const signIndex = Math.floor((i / 2.5) % 12)
    const nextSignIndex = (signIndex + 1) % 12
    
    const milestoneDate = new Date(birthDate)
    milestoneDate.setFullYear(birthDate.getFullYear() + age)
    milestoneDate.setMonth(birthDate.getMonth() + Math.floor((i % 2.5) * 12 / 2.5))
    
    const isPast = currentAge > age || (currentAge === age && new Date() > milestoneDate)
    const yearsUntil = isPast ? undefined : age - currentAge
    
    // Only include upcoming and recent changes (±5 years from current age)
    if (Math.abs(age - currentAge) <= 5) {
      milestones.push({
        id: `progressed-moon-${age}`,
        name: `Progressed Moon enters ${signs[nextSignIndex]}`,
        description: `Emotional focus shifts to ${signs[nextSignIndex]} themes - new emotional chapter begins`,
        age,
        date: milestoneDate,
        type: 'progressed-moon',
        icon: '☽',
        significance: 'minor',
        isPast,
        yearsUntil
      })
    }
  }
  
  return milestones
}

// Get next solar return (birthday)
function getNextSolarReturn(birthDate: Date): LifeMilestone[] {
  const now = new Date()
  const currentYear = now.getFullYear()
  
  let nextBirthday = new Date(birthDate)
  nextBirthday.setFullYear(currentYear)
  
  // If birthday has passed this year, get next year's
  if (nextBirthday < now) {
    nextBirthday.setFullYear(currentYear + 1)
  }
  
  const age = calculateAge(birthDate, nextBirthday)
  
  return [{
    id: 'solar-return',
    name: `Solar Return (Age ${age})`,
    description: 'Your personal new year - the Sun returns to its birth position, beginning a new annual cycle',
    age,
    date: nextBirthday,
    type: 'solar-return',
    icon: '☉',
    significance: 'moderate',
    isPast: false,
    yearsUntil: 0
  }]
}

// Get all life milestones
export function getLifeMilestones(birthDate: Date | string): LifeMilestone[] {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  
  const milestones: LifeMilestone[] = [
    ...getSaturnMilestones(birth),
    ...getJupiterMilestones(birth),
    ...getChironReturn(birth),
    ...getProgressedMoonChanges(birth),
    ...getNextSolarReturn(birth)
  ]
  
  // Sort by date
  return milestones.sort((a, b) => a.date.getTime() - b.date.getTime())
}

// Get upcoming milestones (next 5 years)
export function getUpcomingMilestones(birthDate: Date | string, years: number = 5): LifeMilestone[] {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const allMilestones = getLifeMilestones(birth)
  const now = new Date()
  const futureDate = new Date(now.getFullYear() + years, now.getMonth(), now.getDate())
  
  return allMilestones.filter(m => !m.isPast && m.date <= futureDate)
}

// Get past milestones (last 5 years)
export function getPastMilestones(birthDate: Date | string, years: number = 5): LifeMilestone[] {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const allMilestones = getLifeMilestones(birth)
  const now = new Date()
  const pastDate = new Date(now.getFullYear() - years, now.getMonth(), now.getDate())
  
  return allMilestones.filter(m => m.isPast && m.date >= pastDate)
}

// Get current age and position in life cycle
export function getCurrentLifePosition(birthDate: Date | string): {
  age: number
  nextMilestone: LifeMilestone | null
  recentMilestone: LifeMilestone | null
  saturnPhase: string
  jupiterPhase: string
} {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const age = calculateAge(birth)
  const allMilestones = getLifeMilestones(birth)
  
  const upcomingMilestones = allMilestones.filter(m => !m.isPast)
  const pastMilestones = allMilestones.filter(m => m.isPast).reverse()
  
  const nextMilestone = upcomingMilestones[0] || null
  const recentMilestone = pastMilestones[0] || null
  
  // Determine Saturn phase (0-29 year cycle)
  const saturnAge = age % 29
  let saturnPhase = ''
  if (saturnAge < 7) saturnPhase = 'First Quarter (Building)'
  else if (saturnAge < 14) saturnPhase = 'Second Quarter (Testing)'
  else if (saturnAge < 21) saturnPhase = 'Third Quarter (Maturing)'
  else saturnPhase = 'Fourth Quarter (Mastering)'
  
  // Determine Jupiter phase (0-12 year cycle)
  const jupiterAge = age % 12
  let jupiterPhase = ''
  if (jupiterAge < 3) jupiterPhase = 'Expansion Phase'
  else if (jupiterAge < 6) jupiterPhase = 'Growth Phase'
  else if (jupiterAge < 9) jupiterPhase = 'Harvest Phase'
  else jupiterPhase = 'Integration Phase'
  
  return {
    age,
    nextMilestone,
    recentMilestone,
    saturnPhase,
    jupiterPhase
  }
}
