// Lunar Phase Calculations for Health Timing

interface LunarPhase {
  name: string
  description: string
  optimalFor: string[]
  startDate: Date
  endDate: Date
}

// Calculate current lunar phase
export function getCurrentLunarPhase(): LunarPhase {
  const now = new Date()
  
  // Approximate lunar cycle (29.53 days)
  // Days since last new moon
  const daysSinceNewMoon = (now.getTime() / (1000 * 60 * 60 * 24)) % 29.53
  
  if (daysSinceNewMoon < 3.7) {
    return {
      name: 'New Moon',
      description: 'Fresh start, new health routines',
      optimalFor: ['Setting new health goals', 'Starting detox programs', 'Beginning treatment protocols'],
      startDate: now,
      endDate: new Date(now.getTime() + 3.7 * 24 * 60 * 60 * 1000)
    }
  } else if (daysSinceNewMoon < 7.4) {
    return {
      name: 'Waxing Crescent',
      description: 'Building vitality',
      optimalFor: ['Building strength', 'Increasing energy', 'Recovery'],
      startDate: now,
      endDate: new Date(now.getTime() + (7.4 - daysSinceNewMoon) * 24 * 60 * 60 * 1000)
    }
  } else if (daysSinceNewMoon < 14.8) {
    return {
      name: 'First Quarter to Full Moon',
      description: 'Peak energy, action phase',
      optimalFor: ['Surgery timing', 'Active treatments', 'Peak healing'],
      startDate: now,
      endDate: new Date(now.getTime() + (14.8 - daysSinceNewMoon) * 24 * 60 * 60 * 1000)
    }
  } else if (daysSinceNewMoon < 22.2) {
    return {
      name: 'Waning Gibbous',
      description: 'Release and detox',
      optimalFor: ['Elimination therapies', 'Cleansing protocols', 'Weight loss'],
      startDate: now,
      endDate: new Date(now.getTime() + (22.2 - daysSinceNewMoon) * 24 * 60 * 60 * 1000)
    }
  } else {
    return {
      name: 'Last Quarter to New Moon',
      description: 'Rest and integration',
      optimalFor: ['Rest and recovery', 'Contemplation', 'Wound healing'],
      startDate: now,
      endDate: new Date(now.getTime() + (29.53 - daysSinceNewMoon) * 24 * 60 * 60 * 1000)
    }
  }
}

// Get next 3 beneficial lunar phases for healing
export function getNextHealingPhases(): LunarPhase[] {
  const phases: LunarPhase[] = []
  const now = new Date()
  let currentDate = new Date(now)
  
  for (let i = 0; i < 3; i++) {
    // Skip ahead by ~7 days (quarter moon phases)
    currentDate = new Date(currentDate.getTime() + 7.4 * 24 * 60 * 60 * 1000)
    const cycleDay = (currentDate.getTime() / (1000 * 60 * 60 * 24)) % 29.53
    
    phases.push({
      name: cycleDay < 14.8 ? 'Waxing Moon (Healing)' : 'Full to Waning (Release)',
      description: cycleDay < 14.8 
        ? 'Optimal time for building health and recovery' 
        : 'Optimal time for detoxification and release',
      optimalFor: cycleDay < 14.8 
        ? ['Surgery', 'Active treatment', 'Building vitality'] 
        : ['Detox', 'Release', 'Cleansing'],
      startDate: currentDate,
      endDate: new Date(currentDate.getTime() + 7.4 * 24 * 60 * 60 * 1000)
    })
  }
  
  return phases
}

// Check if Mercury is retrograde (approximate)
export function isMercuryRetrograde(date: Date = new Date()): boolean {
  // Approximate Mercury retrograde periods (roughly 3-4 times per year, ~3 weeks each)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  
  // Typical Mercury retrograde months (approximate for any year)
  const retrogradeMonths = [1, 5, 9] // January, May, September
  
  return retrogradeMonths.includes(month)
}

