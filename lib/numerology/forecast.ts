// Month-wise forecast calculation based on Personal Year and Driver

export interface MonthForecast {
  month: string
  year: number
  theme: string
  expectations: string[]
  advice: string
}

const MONTH_THEMES: Record<number, Record<number, { theme: string; expectations: string[]; advice: string }>> = {
  1: {
    1: {
      theme: 'Fresh starts, independence, and bold self-expression',
      expectations: [
        'High energy and determination to tackle challenges',
        'Fresh perspectives and new opportunities',
        'Forming lasting meaningful relationships',
        'Creative ideas turning into reality',
      ],
      advice: 'Embark on new ventures, trust your instincts, seek guidance when needed. Request salary increases or promotions.',
    },
    2: {
      theme: 'Building balance and strong relationships',
      expectations: [
        'Easy-going and friendly demeanor',
        'Collaboration and teamwork',
        'Diplomatic handling of sensitive matters',
        'Mood fluctuations requiring awareness',
      ],
      advice: 'Act as peacemaker, use diplomacy, gather what\'s rightfully yours, avoid unnecessary arguments.',
    },
    3: {
      theme: 'Creative expression and vibrant communication',
      expectations: [
        'Magnetic charm drawing people to you',
        'Strong communication skills',
        'New adventures and fresh perspectives',
        'Building lasting friendships',
      ],
      advice: 'Entertain and connect with others, embrace humor and creativity, avoid excessive spending.',
    },
    4: {
      theme: 'Grounding efforts and managing details',
      expectations: [
        'Unwavering determination and precision',
        'Practical decision-making',
        'Systematic work style',
        'Reliable support for others',
      ],
      advice: 'Streamline work, stay methodical, avoid unnecessary purchases, focus on completing existing projects.',
    },
    5: {
      theme: 'Exploration and change',
      expectations: [
        'Easy connections with others',
        'Professional success and recognition',
        'Flexibility and adaptability',
        'Goal-oriented approach',
      ],
      advice: 'Take swift decisive action, trust instincts, engage in meaningful interactions, consider travel or transactions.',
    },
    6: {
      theme: 'Family, home, and responsibility',
      expectations: [
        'Strong affection for family and friends',
        'Romance and creative expression',
        'Thriving in group settings',
        'Tendency to resist change',
      ],
      advice: 'Step into responsibilities with confidence, create harmony, support loved ones, avoid unnecessary conflicts.',
    },
    7: {
      theme: 'Introspection and spiritual development',
      expectations: [
        'Focus on details and accuracy',
        'Financial security priority',
        'Deep understanding of people',
        'Reflective and introspective nature',
      ],
      advice: 'Refine and perfect everything, take time for solitude, listen to intuition, avoid new partnerships.',
    },
    8: {
      theme: 'Driving success and building wealth',
      expectations: [
        'Confidently voicing thoughts and desires',
        'Strategic financial investments',
        'Grounded relationships',
        'Energy and enthusiasm in social settings',
      ],
      advice: 'Take decisive executive actions, engage with major corporations, present affluence, stay positive.',
    },
    9: {
      theme: 'New beginnings and independence',
      expectations: [
        'High energy levels',
        'Strong determination',
        'Building new connections',
        'Potential for conflicts',
      ],
      advice: 'Begin new ventures, work on unique ideas, follow instincts, make prompt decisive choices.',
    },
  },
}

export function generateMonthForecast(
  personalYear: number | null,
  birthYear: number | null,
  startMonth: number = 0
): MonthForecast[] {
  if (!personalYear || !birthYear) return []
  
  const yearData = MONTH_THEMES[personalYear] || MONTH_THEMES[1]
  const forecasts: MonthForecast[] = []
  const months = [
    'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December', 'January',
  ]
  const currentYear = new Date().getFullYear()
  
  // Map month numbers (1-12) to array indices (our array starts with February)
  const monthIndexMap: Record<number, number> = {
    1: 11, 2: 0, 3: 1, 4: 2, 5: 3, 6: 4,
    7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10
  }
  
  for (let i = 0; i < 12; i++) {
    const monthNum = ((startMonth - 1 + i) % 12) + 1 // 1-12
    const monthIndex = monthIndexMap[monthNum] || 0
    const monthData = yearData[monthNum] || yearData[1]
    
    // Determine year based on whether we've crossed from December to January
    let year: number
    if (monthNum === 12) {
      // December: use currentYear if it's the first month, otherwise currentYear
      year = i === 0 ? currentYear : currentYear
    } else if (monthNum === 1) {
      // January: always next year
      year = currentYear + 1
    } else {
      // Feb-Nov: if we started from December, use next year; otherwise check position
      year = startMonth === 12 || monthNum < startMonth ? currentYear + 1 : currentYear
    }
    
    forecasts.push({
      month: months[monthIndex],
      year,
      theme: monthData.theme,
      expectations: monthData.expectations,
      advice: monthData.advice,
    })
  }
  
  return forecasts
}

