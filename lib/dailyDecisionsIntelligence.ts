// Daily Decisions Intelligence Service
// Provides personalized recommendations for daily life decisions based on Vedic Astrology and Numerology

import { vedicIntelligence } from './vedicIntelligence';
import { calculateAccuratePanchanga, calculateCurrentPanchanga } from './enhancedPanchangaCalculator';
import { calculateRahuGulika, RahuGulikaTimings } from './rahuGulikaCalculator';
import { getChart } from './astronomia-vedic';
import { NAILS_VEDIC_GUIDE } from './dailyDecisionsColorGuide';
import { getVastuTiming } from './vastuTimingService';

export interface DailyDecisionRecommendation {
  bestDays: string[];
  avoidDays: string[];
  avoidTimes: string[];
  personalizedNote: string;
  score: number; // 0-100, higher is better
  tips?: string[];
  avoidAfterSunset?: boolean;
}

export interface DailyDecisionsAnalysis {
  date: string;
  userContext: {
    janmaNakshatra: string;
    janmaTithi: string;
    currentDasha: {
      planet: string;
      progress: number;
    } | null;
    ascendant: string;
    moonSign: string;
    moonNakshatra: string;
    sunSign?: string;
    venusSign?: string;
  };
  rahuKaal: {
    start: string;
    end: string;
    formatted: string;
  };
  gulikaKaal: {
    start: string;
    end: string;
    formatted: string;
  };
  panchangaSummary: {
    tithi: string;
    nakshatra: string;
    vara: string;
    yoga: string;
    sunrise?: string;
    sunset?: string;
  };
  recommendations: {
    lendMoney: DailyDecisionRecommendation;
    borrowMoney: DailyDecisionRecommendation;
    payBackDebts: DailyDecisionRecommendation;
    haircut: DailyDecisionRecommendation;
    cutNails: DailyDecisionRecommendation;
    hairOil: DailyDecisionRecommendation;
    travel: DailyDecisionRecommendation;
  };
  propertyConstruction?: {
    auspiciousScore: number;
    isAuspicious: boolean;
    bestActivities: string[];
    avoidActivities: string[];
    recommendations: string[];
  };
  generatedAt: string;
}

// Day names mapping
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const VARA_TO_DAY: Record<string, string> = {
  'Ravivar': 'Sunday',
  'Somavar': 'Monday',
  'Mangalvar': 'Tuesday',
  'Budhvar': 'Wednesday',
  'Guruvar': 'Thursday',
  'Shukravar': 'Friday',
  'Shanivar': 'Saturday',
};

// Malefic Dasha planets
const MALEFIC_DASHA = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

class DailyDecisionsIntelligence {
  /**
   * Get personalized daily decisions recommendations
   */
  async getRecommendations(
    userId: string,
    birthDate: string,
    birthTime: string,
    birthPlace: string,
    latitude: number,
    longitude: number,
    targetDate?: string // ISO date string, defaults to today
  ): Promise<DailyDecisionsAnalysis> {
    const date = targetDate ? new Date(targetDate) : new Date();
    const dateStr = date.toISOString().split('T')[0];

    // 1. Get Vedic chart data
    const vedicData = await vedicIntelligence.getIntelligentVedicData(
      userId,
      birthDate,
      birthTime,
      birthPlace,
      latitude,
      longitude,
      false,
      false
    );

    const chartData = vedicData.chartData;
    const ascendant = chartData.ascendant;
    const planets = chartData.planets || [];
    const currentDasha = chartData.currentDasha;

    // Find Moon, Sun, Venus
    const moonPlanet = Array.isArray(planets)
      ? planets.find((p: any) => p.name === 'Moon' || p.name === 'moon')
      : null;
    const moonSign = (moonPlanet as { sign?: string; signName?: string })?.sign ?? (moonPlanet as { signName?: string })?.signName ?? 'Unknown';
    const moonNakshatra = moonPlanet?.nakshatra || 'Unknown';

    const sunPlanet = Array.isArray(planets)
      ? planets.find((p: any) => p.name === 'Sun' || p.name === 'sun')
      : null;
    const sunSign = (sunPlanet as { sign?: string; signName?: string })?.sign ?? (sunPlanet as { signName?: string })?.signName ?? 'Unknown';

    const venusPlanet = Array.isArray(planets)
      ? planets.find((p: any) => p.name === 'Venus' || p.name === 'venus')
      : null;
    const venusSign = (venusPlanet as { sign?: string; signName?: string })?.sign ?? (venusPlanet as { signName?: string })?.signName ?? 'Unknown';

    // 2. Calculate birth Panchanga (for Janma Nakshatra, Janma Tithi)
    const birthChart = getChart({
      date: new Date(birthDate + 'T' + birthTime),
      latitude,
      longitude,
      birthDate: new Date(birthDate + 'T' + birthTime),
    });

    const birthPanchanga = calculateAccuratePanchanga(birthChart, {
      birthDate,
      birthTime,
      birthPlace,
    });

    const janmaNakshatra = birthPanchanga?.nakshatra?.name || 'Unknown';
    const janmaTithi = birthPanchanga?.tithi?.name || 'Unknown';

    // 3. Calculate Panchanga for target date
    // Use getChart for the target date
    const targetChart = getChart({
      date: date,
      latitude,
      longitude,
      birthDate: undefined,
    });

    let targetPanchanga = calculateAccuratePanchanga(targetChart, {
      birthDate: dateStr,
      birthTime: '12:00',
      birthPlace,
    });

    // Fallback to current Panchanga if calculation fails
    if (!targetPanchanga) {
      console.warn('⚠️ Failed to calculate Panchanga for target date, using current Panchanga');
      targetPanchanga = calculateCurrentPanchanga(birthPlace, latitude, longitude);
    }

    const currentTithi = targetPanchanga.tithi.name;
    const currentNakshatra = targetPanchanga.nakshatra.name;
    const currentVara = targetPanchanga.vara.name;
    const currentYoga = targetPanchanga.yoga.name;
    const currentDay = VARA_TO_DAY[currentVara] || DAY_NAMES[date.getDay()];

    // 4. Calculate Rahu Kaal and Gulika Kaal
    const rahuGulika = calculateRahuGulika(
      targetPanchanga.sunrise,
      targetPanchanga.sunset,
      date
    );

    const formatTime = (d: Date) => {
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    // 5. Apply rules for each topic
    const recommendations = {
      lendMoney: this.getLendMoneyRecommendation(
        currentDay,
        currentDasha,
        currentNakshatra,
        janmaNakshatra,
        rahuGulika,
        moonNakshatra
      ),
      borrowMoney: this.getBorrowMoneyRecommendation(
        currentDay,
        currentNakshatra,
        janmaNakshatra
      ),
      payBackDebts: this.getPayBackDebtsRecommendation(
        currentDay,
        rahuGulika
      ),
      haircut: this.getHaircutRecommendation(
        currentDay,
        currentNakshatra,
        currentTithi,
        janmaNakshatra,
        janmaTithi
      ),
      cutNails: this.getCutNailsRecommendation(
        currentDay,
        currentNakshatra,
        currentTithi,
        janmaNakshatra,
        janmaTithi,
        rahuGulika,
        formatTime(targetPanchanga.sunset)
      ),
      hairOil: this.getHairOilRecommendation(currentDay),
      travel: this.getTravelRecommendation(currentDay, rahuGulika),
    };

    let propertyConstruction: DailyDecisionsAnalysis['propertyConstruction'];
    try {
      const vastu = getVastuTiming(date, latitude, longitude, null);
      if (vastu) {
        propertyConstruction = {
          auspiciousScore: vastu.auspiciousScore,
          isAuspicious: vastu.isAuspicious,
          bestActivities: vastu.bestActivities,
          avoidActivities: vastu.avoidActivities,
          recommendations: vastu.recommendations,
        };
      }
    } catch (e) {
      console.warn('Vastu timing skipped:', e);
    }

    return {
      date: dateStr,
      userContext: {
        janmaNakshatra,
        janmaTithi,
        currentDasha: currentDasha
          ? {
              planet: currentDasha.planet,
              progress: currentDasha.progress || 0,
            }
          : null,
        ascendant: (ascendant as { sign?: string; signName?: string }).sign ?? (ascendant as { signName?: string }).signName ?? 'Unknown',
        moonSign,
        moonNakshatra,
        sunSign,
        venusSign,
      },
      rahuKaal: {
        start: rahuGulika.rahuKaal.start.toISOString(),
        end: rahuGulika.rahuKaal.end.toISOString(),
        formatted: `${formatTime(rahuGulika.rahuKaal.start)} - ${formatTime(rahuGulika.rahuKaal.end)}`,
      },
      gulikaKaal: {
        start: rahuGulika.gulikaKaal.start.toISOString(),
        end: rahuGulika.gulikaKaal.end.toISOString(),
        formatted: `${formatTime(rahuGulika.gulikaKaal.start)} - ${formatTime(rahuGulika.gulikaKaal.end)}`,
      },
      panchangaSummary: {
        tithi: currentTithi,
        nakshatra: currentNakshatra,
        vara: currentVara,
        yoga: currentYoga,
        sunrise: formatTime(targetPanchanga.sunrise),
        sunset: formatTime(targetPanchanga.sunset),
      },
      recommendations,
      ...(propertyConstruction && { propertyConstruction }),
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Lend Money: Prefer Monday. Avoid transit Moon in 8th from natal Moon, malefic Mahadasha, Saturdays, Rahu Kaal.
   */
  private getLendMoneyRecommendation(
    currentDay: string,
    currentDasha: any,
    currentNakshatra: string,
    janmaNakshatra: string,
    rahuGulika: RahuGulikaTimings,
    moonNakshatra: string
  ): DailyDecisionRecommendation {
    const bestDays = ['Monday'];
    const avoidDays = ['Saturday'];
    const avoidTimes = [`Rahu Kaal: ${this.formatRahuGulika(rahuGulika.rahuKaal)}`];

    let score = 70; // Base score
    let personalizedNote = '';

    // Check if current day is best
    if (bestDays.includes(currentDay)) {
      score += 20;
      personalizedNote += 'Today is Monday, which is generally favorable for lending. ';
    }

    // Check if current day should be avoided
    if (avoidDays.includes(currentDay)) {
      score -= 30;
      personalizedNote += '⚠️ Today is Saturday - avoid lending money. ';
    }

    // Check Dasha
    if (currentDasha && MALEFIC_DASHA.includes(currentDasha.planet)) {
      score -= 15;
      personalizedNote += `You're in ${currentDasha.planet} Dasha (malefic period) - exercise caution. `;
    }

    // Check if current Nakshatra is Janma Nakshatra (8th from natal Moon concept simplified)
    if (currentNakshatra === janmaNakshatra) {
      score -= 20;
      personalizedNote += '⚠️ Today is your Janma Nakshatra day - avoid lending. ';
    }

    score = Math.max(0, Math.min(100, score));

    if (!personalizedNote) {
      personalizedNote = 'Consider timing carefully based on your chart. ';
    }

    return {
      bestDays,
      avoidDays,
      avoidTimes,
      personalizedNote: personalizedNote.trim(),
      score,
    };
  }

  /**
   * Borrow Money: Prefer Thursday. Avoid Janma Nakshatra day, Tue/Sat.
   */
  private getBorrowMoneyRecommendation(
    currentDay: string,
    currentNakshatra: string,
    janmaNakshatra: string
  ): DailyDecisionRecommendation {
    const bestDays = ['Thursday'];
    const avoidDays = ['Tuesday', 'Saturday'];

    let score = 70;
    let personalizedNote = '';

    if (bestDays.includes(currentDay)) {
      score += 20;
      personalizedNote += "Today is Thursday (Jupiter's day) - favorable for borrowing. ";
    }

    if (avoidDays.includes(currentDay)) {
      score -= 30;
      personalizedNote += `⚠️ Today is ${currentDay} - avoid borrowing money. `;
    }

    if (currentNakshatra === janmaNakshatra) {
      score -= 20;
      personalizedNote += '⚠️ Today is your Janma Nakshatra day - avoid borrowing. ';
    }

    score = Math.max(0, Math.min(100, score));

    if (!personalizedNote) {
      personalizedNote = 'Consider timing carefully. ';
    }

    return {
      bestDays,
      avoidDays,
      avoidTimes: [],
      personalizedNote: personalizedNote.trim(),
      score,
    };
  }

  /**
   * Pay Back Debts: Prefer Tuesday; Gulika on Tuesday "clear quickly" (use Gulika window on Tue).
   */
  private getPayBackDebtsRecommendation(
    currentDay: string,
    rahuGulika: RahuGulikaTimings
  ): DailyDecisionRecommendation {
    const bestDays = ['Tuesday'];
    const avoidTimes: string[] = [];

    let score = 70;
    let personalizedNote = '';

    if (currentDay === 'Tuesday') {
      score += 25;
      const gulikaTime = this.formatRahuGulika(rahuGulika.gulikaKaal);
      personalizedNote += `Today is Tuesday - excellent for paying debts. Consider Gulika time (${gulikaTime}) for quick clearance. `;
      avoidTimes.push(`Gulika time: ${gulikaTime} (use this time for payment)`);
    } else {
      personalizedNote += 'Tuesday is generally best for paying back debts. ';
    }

    score = Math.max(0, Math.min(100, score));

    return {
      bestDays,
      avoidDays: [],
      avoidTimes,
      personalizedNote: personalizedNote.trim(),
      score,
    };
  }

  /**
   * Haircut: Prefer Wed (Mercury), Fri (Venus). Avoid Sat, Tue; avoid Janma Nakshatra day and Janma Tithi.
   */
  private getHaircutRecommendation(
    currentDay: string,
    currentNakshatra: string,
    currentTithi: string,
    janmaNakshatra: string,
    janmaTithi: string
  ): DailyDecisionRecommendation {
    const bestDays = ['Wednesday', 'Friday'];
    const avoidDays = ['Saturday', 'Tuesday'];

    let score = 70;
    let personalizedNote = '';

    if (bestDays.includes(currentDay)) {
      score += 20;
      personalizedNote += `Today is ${currentDay} - favorable for haircut. `;
    }

    if (avoidDays.includes(currentDay)) {
      score -= 30;
      personalizedNote += `⚠️ Today is ${currentDay} - avoid haircut. `;
    }

    if (currentNakshatra === janmaNakshatra) {
      score -= 25;
      personalizedNote += '⚠️ Today is your Janma Nakshatra day - avoid haircut. ';
    }

    if (currentTithi === janmaTithi) {
      score -= 25;
      personalizedNote += '⚠️ Today is your Janma Tithi - avoid haircut. ';
    }

    score = Math.max(0, Math.min(100, score));

    if (!personalizedNote) {
      personalizedNote = 'Consider timing based on your chart. ';
    }

    return {
      bestDays,
      avoidDays,
      avoidTimes: [],
      personalizedNote: personalizedNote.trim(),
      score,
    };
  }

  /**
   * Cut Nails (Vedic): Best Wed, Fri, Mon, Thu. Avoid Sat, Tue, Sun. Avoid after sunset; Janma Nakshatra/Tithi.
   */
  private getCutNailsRecommendation(
    currentDay: string,
    currentNakshatra: string,
    currentTithi: string,
    janmaNakshatra: string,
    janmaTithi: string,
    rahuGulika: RahuGulikaTimings,
    sunsetFormatted: string
  ): DailyDecisionRecommendation {
    const bestDays = [...NAILS_VEDIC_GUIDE.bestDays];
    const avoidDays = [...NAILS_VEDIC_GUIDE.avoidDays];
    const avoidTimes = [
      `Rahu Kaal: ${this.formatRahuGulika(rahuGulika.rahuKaal)}`,
      `Gulika Kaal: ${this.formatRahuGulika(rahuGulika.gulikaKaal)}`,
      `After sunset (until sunrise) — avoid after ${sunsetFormatted}`,
    ];

    let score = 70;
    let personalizedNote = '';

    if ((bestDays as readonly string[]).includes(currentDay)) {
      score += 20;
      personalizedNote += `Today is ${currentDay} — favorable for cutting nails. `;
    }

    if ((avoidDays as readonly string[]).includes(currentDay)) {
      score -= 30;
      personalizedNote += `Today is ${currentDay} — avoid cutting nails. `;
    }

    if (currentNakshatra === janmaNakshatra) {
      score -= 25;
      personalizedNote += 'Today is your Janma Nakshatra day — avoid cutting nails. ';
    }

    if (currentTithi === janmaTithi) {
      score -= 25;
      personalizedNote += 'Today is your Janma Tithi — avoid cutting nails. ';
    }

    score = Math.max(0, Math.min(100, score));

    if (!personalizedNote) {
      personalizedNote = 'Consider timing based on your chart. ';
    }

    const tips = [
      NAILS_VEDIC_GUIDE.bestTiming,
      `Avoid after sunset (e.g. after ${sunsetFormatted}). ${NAILS_VEDIC_GUIDE.avoidAfterSunsetReason}`,
      NAILS_VEDIC_GUIDE.disposalTip,
      ...NAILS_VEDIC_GUIDE.keyTakeaways,
    ];

    return {
      bestDays,
      avoidDays,
      avoidTimes,
      personalizedNote: personalizedNote.trim(),
      score,
      tips,
      avoidAfterSunset: NAILS_VEDIC_GUIDE.avoidAfterSunset,
    };
  }

  /**
   * Hair Oil: Avoid Thu, Sat.
   */
  private getHairOilRecommendation(currentDay: string): DailyDecisionRecommendation {
    const avoidDays = ['Thursday', 'Saturday'];
    const bestDays = ['Monday', 'Wednesday', 'Friday']; // Other days are generally okay

    let score = 70;
    let personalizedNote = '';

    if (avoidDays.includes(currentDay)) {
      score -= 30;
      personalizedNote += `⚠️ Today is ${currentDay} - avoid applying hair oil. `;
    } else if (bestDays.includes(currentDay)) {
      score += 15;
      personalizedNote += `Today is ${currentDay} - favorable for applying hair oil. `;
    }

    score = Math.max(0, Math.min(100, score));

    if (!personalizedNote) {
      personalizedNote = 'Generally safe, but avoid Thursday and Saturday. ';
    }

    return {
      bestDays,
      avoidDays,
      avoidTimes: [],
      personalizedNote: personalizedNote.trim(),
      score,
    };
  }

  /**
   * Travel: Postpone long/important travel on Tuesday; avoid Rahu Kaal and Gulika Kaal for journey start.
   */
  private getTravelRecommendation(
    currentDay: string,
    rahuGulika: RahuGulikaTimings
  ): DailyDecisionRecommendation {
    const bestDays = ['Monday', 'Wednesday', 'Thursday', 'Friday'];
    const avoidDays = ['Tuesday'];

    const avoidTimes = [
      `Rahu Kaal (avoid starting journey): ${this.formatRahuGulika(rahuGulika.rahuKaal)}`,
      `Gulika Kaal (avoid starting journey): ${this.formatRahuGulika(rahuGulika.gulikaKaal)}`,
    ];

    let score = 70;
    let personalizedNote = '';

    if (bestDays.includes(currentDay)) {
      score += 20;
      personalizedNote += `Today is ${currentDay} — generally favorable for travel. Avoid starting journeys during Rahu Kaal and Gulika Kaal. `;
    }

    if (avoidDays.includes(currentDay)) {
      score -= 30;
      personalizedNote += 'Today is Tuesday — postpone major or long-distance travel when possible. ';
    }

    score = Math.max(0, Math.min(100, score));

    if (!personalizedNote) {
      personalizedNote = 'Avoid starting journeys during Rahu Kaal and Gulika Kaal. ';
    }

    return {
      bestDays,
      avoidDays,
      avoidTimes,
      personalizedNote: personalizedNote.trim(),
      score,
    };
  }

  /**
   * Format Rahu/Gulika time for display
   */
  private formatRahuGulika(period: { start: Date; end: Date }): string {
    const formatTime = (d: Date) => {
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };
    return `${formatTime(period.start)} - ${formatTime(period.end)}`;
  }
}

export const dailyDecisionsIntelligence = new DailyDecisionsIntelligence();
