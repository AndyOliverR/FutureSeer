// Success, Connection, and Maturity numbers

interface SummaryNumbers {
  success: {
    number: number
    qualities: string[]
    challenges: string[]
  }
  connection: {
    number: number
    focus: string
  }
  maturity: {
    number: number
    traits: string[]
    note: string
  }
}

function calcSuccessNumber(lifePath: number, destiny: number): number {
  const sum = (lifePath || 1) + (destiny || 1)
  let num = sum
  while (num > 9) {
    num = num.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0)
  }
  return num
}

function calcConnectionNumber(birthDay: number): number {
  let num = birthDay || 1
  while (num > 9) {
    num = num.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0)
  }
  return num
}

function calcMaturityNumber(lifePath: number, destiny: number): number {
  const sum = (lifePath || 1) + (destiny || 1)
  let num = sum
  while (num > 9 && num !== 11 && num !== 22) {
    num = num.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0)
  }
  return num === 11 || num === 22 ? num : (num > 9 ? num.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0) : num)
}

const SUCCESS_QUALITIES: Record<number, { qualities: string[]; challenges: string[] }> = {
  1: {
    qualities: ['Strong-willed', 'Confident', 'Inherent sense of power', 'Direct communication'],
    challenges: ['Difficulties with authority', 'Letting go of past experiences'],
  },
  8: {
    qualities: ['Strong-willed', 'Confident', 'Inherent sense of power', 'Financial success focus'],
    challenges: ['Authority relationships', 'External opposition', 'Releasing emotional burdens'],
  },
}

const CONNECTION_FOCUS: Record<number, string> = {
  1: 'Boost initiative and leadership',
  2: 'Cultivate partnerships',
  3: 'Express creativity',
  4: 'Build reliability and organization',
  5: 'Embrace change',
  6: 'Nurture relationships',
  7: 'Seek wisdom',
  8: 'Build authority',
  9: 'Serve humanity',
}

const MATURITY_TRAITS: Record<number, { traits: string[]; note: string }> = {
  1: {
    traits: ['Stronger drive for independence', 'Desire for recognition', 'Resistance to collaboration'],
    note: 'May become overly authoritative; balance individuality with connection.',
  },
  8: {
    traits: ['Focus on material achievement', 'Executive abilities', 'Sound judgment'],
    note: 'Success through persistent effort; avoid underestimating demands.',
  },
}

export function getSummaryNumbers(
  lifePath: number | null,
  destiny: number | null,
  birthDay: number | null
): SummaryNumbers {
  const successNum = calcSuccessNumber(lifePath || 1, destiny || 1)
  const connectionNum = calcConnectionNumber(birthDay || 1)
  const maturityNum = calcMaturityNumber(lifePath || 1, destiny || 1)
  
  return {
    success: {
      number: successNum,
      qualities: SUCCESS_QUALITIES[successNum]?.qualities || ['Determined', 'Focused'],
      challenges: SUCCESS_QUALITIES[successNum]?.challenges || ['Stay balanced'],
    },
    connection: {
      number: connectionNum,
      focus: CONNECTION_FOCUS[connectionNum] || 'Maintain harmony',
    },
    maturity: {
      number: maturityNum,
      traits: MATURITY_TRAITS[maturityNum]?.traits || ['Growing wisdom'],
      note: MATURITY_TRAITS[maturityNum]?.note || 'Balance and humility essential.',
    },
  }
}

