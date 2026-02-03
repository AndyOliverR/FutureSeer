export interface TimingAnalysis {
  year: number;
  mahadasha: string;
  antardashas: AntardashaInfo[];
  monthlyBreakdown: MonthlyTiming[];
  transits: YearlyTransits;
  wealthIndicators: WealthTiming;
  recommendation: string;
}

export interface AntardashaInfo {
  planet: string;
  startDate: string;
  endDate: string;
  months: string[];
  influence: string;
  favorableFor: string[];
}

export interface MonthlyTiming {
  month: string;
  monthNumber: number;
  antardasha: string;
  jupiterHouse: number;
  saturnHouse: number;
  favorability: 'excellent' | 'good' | 'neutral' | 'challenging';
  wealthScore: number;
  description: string;
}

export interface YearlyTransits {
  jupiter: TransitInfo;
  saturn: TransitInfo;
  rahu: TransitInfo;
  ketu: TransitInfo;
}

export interface TransitInfo {
  house: number;
  sign: string;
  description: string;
  influence: string;
}

export interface WealthTiming {
  secondHouse: HouseTiming;
  eleventhHouse: HouseTiming;
  overallScore: number;
}

export interface HouseTiming {
  lord: string;
  transit: string;
  influence: string;
  score: number;
}

export class TimingAnalyzer {
  private readonly ANTARDASHA_DURATIONS: { [key: string]: number } = {
    'Sun': 6, 'Moon': 10, 'Mars': 7, 'Mercury': 17, 'Jupiter': 16,
    'Venus': 20, 'Saturn': 19, 'Rahu': 18, 'Ketu': 7
  };

  private readonly ANTARDASHA_SEQUENCE: { [key: string]: string[] } = {
    'Sun': ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'],
    'Moon': ['Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Sun'],
    'Mars': ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Sun', 'Moon'],
    'Mercury': ['Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Sun', 'Moon', 'Mars'],
    'Jupiter': ['Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Sun', 'Moon', 'Mars', 'Mercury'],
    'Venus': ['Venus', 'Saturn', 'Rahu', 'Ketu', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter'],
    'Saturn': ['Saturn', 'Rahu', 'Ketu', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus'],
    'Rahu': ['Rahu', 'Ketu', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'],
    'Ketu': ['Ketu', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu']
  };

  private readonly MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(private vedicChart: any, private birthDate: Date) {}

  // Calculate which Antardasha is active for a specific date
  calculateAntardashaForDate(date: Date): AntardashaInfo {
    const mahadasha = this.vedicChart.currentDasha.mahadasha || this.vedicChart.currentDasha.planet || 'Unknown';
    const mahadashaStart = new Date(this.vedicChart.currentDasha.startDate);
    const mahadashaEnd = new Date(this.vedicChart.currentDasha.endDate);
    
    // Calculate total Mahadasha duration in years
    const totalDurationYears = (mahadashaEnd.getTime() - mahadashaStart.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    
    // Calculate elapsed time from Mahadasha start
    const elapsedYears = (date.getTime() - mahadashaStart.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    
    // Get Antardasha sequence for this Mahadasha
    const antardashaSequence = this.ANTARDASHA_SEQUENCE[mahadasha] || [];
    
    // Calculate which Antardasha is active
    let cumulativeYears = 0;
    let currentAntardasha = antardashaSequence[0];
    
    for (const planet of antardashaSequence) {
      const duration = this.ANTARDASHA_DURATIONS[planet] || 1;
      const antardashaYears = (duration / 120) * totalDurationYears; // Convert to years
      
      if (elapsedYears <= cumulativeYears + antardashaYears) {
        currentAntardasha = planet;
        break;
      }
      cumulativeYears += antardashaYears;
    }
    
    // Calculate start and end dates for this Antardasha
    const antardashaStart = new Date(mahadashaStart.getTime() + cumulativeYears * 365.25 * 24 * 60 * 60 * 1000);
    const antardashaDuration = (this.ANTARDASHA_DURATIONS[currentAntardasha] / 120) * totalDurationYears;
    const antardashaEnd = new Date(antardashaStart.getTime() + antardashaDuration * 365.25 * 24 * 60 * 60 * 1000);
    
    return {
      planet: currentAntardasha,
      startDate: antardashaStart.toISOString().split('T')[0],
      endDate: antardashaEnd.toISOString().split('T')[0],
      months: this.getMonthsInRange(antardashaStart, antardashaEnd),
      influence: this.getAntardashaInfluence(currentAntardasha),
      favorableFor: this.getAntardashaFavorableFor(currentAntardasha)
    };
  }

  // Analyze specific year with month-by-month breakdown
  analyzeYear(year: number): TimingAnalysis {
    const monthlyBreakdown: MonthlyTiming[] = [];
    
    for (let month = 1; month <= 12; month++) {
      const date = new Date(year, month - 1, 15); // Mid-month
      const antardasha = this.calculateAntardashaForDate(date);
      const transits = this.calculateTransitsForDate(date);
      
      monthlyBreakdown.push({
        month: this.getMonthName(month),
        monthNumber: month,
        antardasha: antardasha.planet,
        jupiterHouse: transits.jupiter.house,
        saturnHouse: transits.saturn.house,
        favorability: this.calculateFavorability(antardasha, transits),
        wealthScore: this.calculateWealthScore(antardasha, transits),
        description: this.generateMonthDescription(antardasha, transits)
      });
    }
    
    return {
      year,
      mahadasha: this.vedicChart.currentDasha.mahadasha || this.vedicChart.currentDasha.planet || 'Unknown',
      antardashas: this.getAntardashasForYear(year),
      monthlyBreakdown,
      transits: this.calculateYearlyTransits(year),
      wealthIndicators: this.analyzeWealthTiming(year),
      recommendation: this.generateYearRecommendation(year, monthlyBreakdown)
    };
  }

  // Calculate planetary transits for specific date
  calculateTransitsForDate(date: Date): any {
    // For now, return mock data - in production, integrate with astronomia-vedic
    // This would calculate actual planetary positions for the given date
    return {
      jupiter: {
        house: this.calculateHouseFromSign(this.getJupiterSignForDate(date)),
        sign: this.getJupiterSignForDate(date),
        description: `Jupiter transiting ${this.getJupiterSignForDate(date)}`,
        influence: this.getJupiterInfluence(this.getJupiterSignForDate(date))
      },
      saturn: {
        house: this.calculateHouseFromSign(this.getSaturnSignForDate(date)),
        sign: this.getSaturnSignForDate(date),
        description: `Saturn transiting ${this.getSaturnSignForDate(date)}`,
        influence: this.getSaturnInfluence(this.getSaturnSignForDate(date))
      }
    };
  }

  // Calculate wealth score based on 2nd, 11th house transits and Dasha
  calculateWealthScore(antardasha: AntardashaInfo, transits: any): number {
    let score = 50; // Base neutral score
    
    // Check Jupiter transit (major wealth indicator)
    if (transits.jupiter.house === 2 || transits.jupiter.house === 11) {
      score += 20;
    }
    
    // Check Antardasha planet's relationship with wealth houses
    const antardashaLord = antardasha.planet;
    if (this.isWealthLord(antardashaLord)) {
      score += 15;
    }
    
    // Check Saturn's influence
    if (transits.saturn.house === 2 || transits.saturn.house === 11) {
      score -= 10; // Saturn delays but stabilizes
    }
    
    // Check if Antardasha lord is in wealth houses
    const antardashaLordHouse = this.getPlanetHouse(antardashaLord);
    if (antardashaLordHouse === 2 || antardashaLordHouse === 11) {
      score += 10;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  // Compare two years and recommend better one
  compareYears(year1: number, year2: number): string {
    const analysis1 = this.analyzeYear(year1);
    const analysis2 = this.analyzeYear(year2);
    
    const avgScore1 = this.calculateAverageWealthScore(analysis1);
    const avgScore2 = this.calculateAverageWealthScore(analysis2);
    
    const betterYear = avgScore1 > avgScore2 ? year1 : year2;
    const bestMonths = this.getBestMonths(avgScore1 > avgScore2 ? analysis1 : analysis2);
    
    return `**${betterYear} is more favorable** (score: ${Math.max(avgScore1, avgScore2)}/100 vs ${Math.min(avgScore1, avgScore2)}/100). Best months: ${bestMonths.join(', ')}.`;
  }

  // Helper methods
  private getAntardashaSequence(mahadasha: string): string[] {
    return this.ANTARDASHA_SEQUENCE[mahadasha] || [];
  }

  private getMonthName(monthNumber: number): string {
    return this.MONTH_NAMES[monthNumber - 1] || 'Unknown';
  }

  private getMonthsInRange(startDate: Date, endDate: Date): string[] {
    const months: string[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      months.push(this.getMonthName(current.getMonth() + 1));
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  }

  private getAntardashaInfluence(planet: string): string {
    const influences: { [key: string]: string } = {
      'Sun': 'Leadership, authority, recognition, and royal connections',
      'Moon': 'Emotions, intuition, public support, and nurturing',
      'Mars': 'Energy, courage, competition, and initiative',
      'Mercury': 'Communication, intelligence, commerce, and learning',
      'Jupiter': 'Wisdom, expansion, teaching, and spiritual growth',
      'Venus': 'Beauty, relationships, arts, and luxury',
      'Saturn': 'Discipline, hard work, delays, and long-term gains',
      'Rahu': 'Innovation, technology, unconventional success',
      'Ketu': 'Spirituality, detachment, and sudden gains'
    };
    return influences[planet] || 'Mixed influences';
  }

  private getAntardashaFavorableFor(planet: string): string[] {
    const favorable: { [key: string]: string[] } = {
      'Sun': ['Career advancement', 'Leadership roles', 'Government connections'],
      'Moon': ['Public relations', 'Emotional fulfillment', 'Family matters'],
      'Mars': ['Physical activities', 'Competition', 'New ventures'],
      'Mercury': ['Business', 'Communication', 'Learning', 'Writing'],
      'Jupiter': ['Teaching', 'Spiritual growth', 'Expansion', 'Wisdom'],
      'Venus': ['Relationships', 'Arts', 'Beauty', 'Luxury'],
      'Saturn': ['Long-term planning', 'Discipline', 'Stability'],
      'Rahu': ['Technology', 'Innovation', 'Unconventional paths'],
      'Ketu': ['Spiritual practices', 'Detachment', 'Healing']
    };
    return favorable[planet] || ['General activities'];
  }

  private calculateFavorability(antardasha: AntardashaInfo, transits: any): 'excellent' | 'good' | 'neutral' | 'challenging' {
    const score = this.calculateWealthScore(antardasha, transits);
    
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'neutral';
    return 'challenging';
  }

  private generateMonthDescription(antardasha: AntardashaInfo, transits: any): string {
    const planet = antardasha.planet;
    const jupiterHouse = transits.jupiter.house;
    const saturnHouse = transits.saturn.house;
    
    let description = `${planet} Antardasha period`;
    
    if (jupiterHouse === 2 || jupiterHouse === 11) {
      description += ` with Jupiter blessing wealth houses`;
    }
    
    if (saturnHouse === 2 || saturnHouse === 11) {
      description += ` and Saturn requiring patience for gains`;
    }
    
    return description;
  }

  private getAntardashasForYear(year: number): AntardashaInfo[] {
    const antardashas: AntardashaInfo[] = [];
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    
    // Calculate all Antardashas that fall within this year
    let currentDate = new Date(yearStart);
    
    while (currentDate <= yearEnd) {
      const antardasha = this.calculateAntardashaForDate(currentDate);
      
      // Check if this Antardasha is already in our list
      if (!antardashas.find(a => a.planet === antardasha.planet)) {
        antardashas.push(antardasha);
      }
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return antardashas;
  }

  private calculateYearlyTransits(year: number): YearlyTransits {
    const midYear = new Date(year, 6, 15); // July 15th
    const transits = this.calculateTransitsForDate(midYear);
    
    return {
      jupiter: transits.jupiter,
      saturn: transits.saturn,
      rahu: { house: 0, sign: 'Unknown', description: 'Rahu transit', influence: 'Mixed' },
      ketu: { house: 0, sign: 'Unknown', description: 'Ketu transit', influence: 'Mixed' }
    };
  }

  private analyzeWealthTiming(year: number): WealthTiming {
    const midYear = new Date(year, 6, 15);
    const transits = this.calculateTransitsForDate(midYear);
    
    return {
      secondHouse: {
        lord: this.vedicChart.houses[2]?.lord || 'Unknown',
        transit: `Jupiter in ${transits.jupiter.sign}`,
        influence: transits.jupiter.house === 2 ? 'Very favorable' : 'Neutral',
        score: transits.jupiter.house === 2 ? 85 : 50
      },
      eleventhHouse: {
        lord: this.vedicChart.houses[11]?.lord || 'Unknown',
        transit: `Jupiter in ${transits.jupiter.sign}`,
        influence: transits.jupiter.house === 11 ? 'Very favorable' : 'Neutral',
        score: transits.jupiter.house === 11 ? 85 : 50
      },
      overallScore: (transits.jupiter.house === 2 || transits.jupiter.house === 11) ? 80 : 50
    };
  }

  private generateYearRecommendation(year: number, monthlyBreakdown: MonthlyTiming[]): string {
    const excellentMonths = monthlyBreakdown.filter(m => m.favorability === 'excellent');
    const goodMonths = monthlyBreakdown.filter(m => m.favorability === 'good');
    
    if (excellentMonths.length > 0) {
      return `${year} shows excellent potential with ${excellentMonths.length} highly favorable months. Focus on wealth-building activities during ${excellentMonths.map(m => m.month).join(', ')}.`;
    } else if (goodMonths.length > 0) {
      return `${year} offers good opportunities with ${goodMonths.length} favorable months. Steady progress is possible with proper planning.`;
    } else {
      return `${year} requires patience and careful planning. Focus on consolidation rather than expansion.`;
    }
  }

  private calculateAverageWealthScore(analysis: TimingAnalysis): number {
    const totalScore = analysis.monthlyBreakdown.reduce((sum, month) => sum + month.wealthScore, 0);
    return Math.round(totalScore / analysis.monthlyBreakdown.length);
  }

  private getBestMonths(analysis: TimingAnalysis): string[] {
    return analysis.monthlyBreakdown
      .filter(m => m.favorability === 'excellent' || m.favorability === 'good')
      .sort((a, b) => b.wealthScore - a.wealthScore)
      .slice(0, 3)
      .map(m => m.month);
  }

  private isWealthLord(planet: string): boolean {
    const wealthLords = ['Venus', 'Jupiter', 'Mercury'];
    return wealthLords.includes(planet);
  }

  private getPlanetHouse(planet: string): number {
    const planetData = this.vedicChart.planets[planet.toLowerCase()];
    return planetData?.house || 0;
  }

  private calculateHouseFromSign(sign: string): number {
    // Simplified calculation - in production, use proper house calculation
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const ascendantSign = this.vedicChart.ascendant?.signName || 'Gemini';
    const ascendantIndex = signs.indexOf(ascendantSign);
    const signIndex = signs.indexOf(sign);
    
    if (ascendantIndex === -1 || signIndex === -1) return 0;
    
    return ((signIndex - ascendantIndex + 12) % 12) + 1;
  }

  private getJupiterSignForDate(date: Date): string {
    // Mock implementation - in production, calculate actual Jupiter position
    const year = date.getFullYear();
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    // Jupiter moves roughly 1 sign per year
    const jupiterIndex = (year - 2020) % 12;
    return signs[jupiterIndex] || 'Aries';
  }

  private getSaturnSignForDate(date: Date): string {
    // Mock implementation - in production, calculate actual Saturn position
    const year = date.getFullYear();
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    // Saturn moves roughly 1 sign per 2.5 years
    const saturnIndex = Math.floor((year - 2020) / 2.5) % 12;
    return signs[saturnIndex] || 'Capricorn';
  }

  private getJupiterInfluence(sign: string): string {
    const influences: { [key: string]: string } = {
      'Aries': 'New beginnings and leadership',
      'Taurus': 'Material stability and values',
      'Gemini': 'Communication and learning',
      'Cancer': 'Emotional security and family',
      'Leo': 'Creativity and recognition',
      'Virgo': 'Service and health',
      'Libra': 'Relationships and partnerships',
      'Scorpio': 'Transformation and depth',
      'Sagittarius': 'Wisdom and expansion',
      'Capricorn': 'Discipline and structure',
      'Aquarius': 'Innovation and humanitarianism',
      'Pisces': 'Spirituality and compassion'
    };
    return influences[sign] || 'General expansion';
  }

  private getSaturnInfluence(sign: string): string {
    const influences: { [key: string]: string } = {
      'Aries': 'Discipline in action',
      'Taurus': 'Material responsibility',
      'Gemini': 'Communication challenges',
      'Cancer': 'Emotional maturity',
      'Leo': 'Creative discipline',
      'Virgo': 'Service and duty',
      'Libra': 'Relationship responsibility',
      'Scorpio': 'Deep transformation',
      'Sagittarius': 'Philosophical discipline',
      'Capricorn': 'Authority and structure',
      'Aquarius': 'Social responsibility',
      'Pisces': 'Spiritual discipline'
    };
    return influences[sign] || 'General discipline';
  }
}
