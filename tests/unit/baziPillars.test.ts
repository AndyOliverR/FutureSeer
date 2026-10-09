import { baziIntelligence } from '@/lib/baziIntelligence'

const MUMBAI = {
  birthPlace: 'Mumbai',
  latitude: 19.076,
  longitude: 72.8777,
}

async function pillars(birthDate: string, birthTime: string, gender: 'male' | 'female' = 'male') {
  const reading = await baziIntelligence.analyzeBazi({
    birthDate,
    birthTime,
    gender,
    ...MUMBAI,
  })
  const { yearPillar, monthPillar, dayPillar, hourPillar, luckPillars } = reading.chart
  return {
    year: `${yearPillar.heavenlyStem.name} ${yearPillar.earthlyBranch.name}`,
    month: `${monthPillar.heavenlyStem.name} ${monthPillar.earthlyBranch.name}`,
    day: `${dayPillar.heavenlyStem.name} ${dayPillar.earthlyBranch.name}`,
    hour: `${hourPillar.heavenlyStem.name} ${hourPillar.earthlyBranch.name}`,
    firstLuck: `${luckPillars[0].heavenlyStem.name} ${luckPillars[0].earthlyBranch.name}`,
    dayMaster: reading.chart.dayMaster.name,
  }
}

describe('BaZi four pillars', () => {
  it('casts 15 June 1990 as Geng Wu / Ren Wu / Xin Hai', async () => {
    const chart = await pillars('1990-06-15', '11:30', 'male')
    expect(chart.year).toBe('Geng Wu')
    expect(chart.month).toBe('Ren Wu')
    expect(chart.day).toBe('Xin Hai')
    expect(chart.hour).toBe('Jia Wu')
    expect(chart.dayMaster).toBe('Xin')
    expect(chart.firstLuck).toBe('Gui Wei')
  })

  it('keeps the Snake month on 5 June 1990 and switches at Grain in Ear', async () => {
    const beforeTerm = await pillars('1990-06-05', '12:00')
    const onTerm = await pillars('1990-06-06', '12:00')
    expect(beforeTerm.year).toBe('Geng Wu')
    expect(beforeTerm.month).toBe('Xin Si')
    expect(onTerm.month).toBe('Ren Wu')
  })

  it('keeps 1 January 2000 in the previous solar year and the Rat month', async () => {
    const chart = await pillars('2000-01-01', '12:00', 'male')
    expect(chart.year).toBe('Ji Mao')
    expect(chart.month).toBe('Bing Zi')
    expect(chart.day).toBe('Wu Wu')
    expect(chart.hour).toBe('Wu Wu')
    expect(chart.firstLuck).toBe('Yi Hai')
  })

  it('opens the Ox month at Minor Cold and the Tiger month at Start of Spring', async () => {
    const beforeCold = await pillars('2000-01-05', '12:00')
    const minorCold = await pillars('2000-01-06', '12:00')
    const beforeSpring = await pillars('2000-02-03', '12:00')
    const startOfSpring = await pillars('2000-02-04', '12:00')
    expect(beforeCold.year).toBe('Ji Mao')
    expect(beforeCold.month).toBe('Bing Zi')
    expect(minorCold.month).toBe('Ding Chou')
    expect(beforeSpring.year).toBe('Ji Mao')
    expect(beforeSpring.month).toBe('Ding Chou')
    expect(startOfSpring.year).toBe('Geng Chen')
    expect(startOfSpring.month).toBe('Wu Yin')
  })

  it('does not reuse a male luck cycle for a woman born at the same moment', async () => {
    const male = await pillars('1990-06-15', '11:30', 'male')
    const female = await pillars('1990-06-15', '11:30', 'female')
    expect(male.firstLuck).toBe('Gui Wei')
    expect(female.firstLuck).toBe('Xin Si')
  })
})
