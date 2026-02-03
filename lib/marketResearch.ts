/**
 * Market Research Data (Internal Use Only)
 * 
 * This file contains market research data for pricing decisions.
 * No competitor names are included - just research-based market-appropriate pricing data.
 */

export interface MarketResearchData {
  countryCode: string;
  // Market research notes (internal use only, no competitor names)
  marketNotes: {
    normalPriceRange: string; // e.g., "Typical SaaS/astrology apps: $5-$20/month in this market"
    qualityThreshold: number; // Minimum price to signal quality (e.g., $9.99 for US)
    pricingStrategy: 'aggressive' | 'moderate' | 'premium';
    purchasingPower: 'high' | 'medium' | 'low';
  };
  // Market-research-based pricing (feels "normal" in that market)
  marketAppropriatePricing: {
    limited: number;      // Limited plan price
    allFeatures: number;  // All features price
    annual: number;       // Annual plan price
  };
  // Quality perception indicators
  qualitySignals: {
    limited: 'high' | 'medium' | 'low'; // Does price signal quality?
    allFeatures: 'high' | 'medium' | 'low';
    annual: 'high' | 'medium' | 'low';
  };
}

/**
 * Market research data per country
 * Used internally for pricing decisions - no competitor names
 */
export const MARKET_RESEARCH_DATA: Record<string, MarketResearchData> = {
  'IN': {
    countryCode: 'IN',
    marketNotes: {
      normalPriceRange: 'Typical SaaS/astrology apps: ₹99-₹499/month',
      qualityThreshold: 99,
      pricingStrategy: 'moderate',
      purchasingPower: 'medium'
    },
    marketAppropriatePricing: {
      limited: 99,
      allFeatures: 199,
      annual: 999
    },
    qualitySignals: {
      limited: 'high',
      allFeatures: 'high',
      annual: 'high'
    }
  },
  'US': {
    countryCode: 'US',
    marketNotes: {
      normalPriceRange: 'Typical SaaS/astrology apps: $5-$20/month. Quality threshold: $9.99+',
      qualityThreshold: 9.99,
      pricingStrategy: 'moderate',
      purchasingPower: 'high'
    },
    marketAppropriatePricing: {
      limited: 9.99,
      allFeatures: 19.99,
      annual: 99.99
    },
    qualitySignals: {
      limited: 'high',
      allFeatures: 'high',
      annual: 'high'
    }
  },
  'GB': {
    countryCode: 'GB',
    marketNotes: {
      normalPriceRange: 'Typical SaaS pricing: £5-£15/month. Quality threshold: £7.99+',
      qualityThreshold: 7.99,
      pricingStrategy: 'moderate',
      purchasingPower: 'high'
    },
    marketAppropriatePricing: {
      limited: 7.99,
      allFeatures: 14.99,
      annual: 79.99
    },
    qualitySignals: {
      limited: 'high',
      allFeatures: 'high',
      annual: 'high'
    }
  },
  'EU': {
    countryCode: 'EU',
    marketNotes: {
      normalPriceRange: 'Typical SaaS pricing: €8-€18/month. Quality threshold: €9.99+',
      qualityThreshold: 9.99,
      pricingStrategy: 'moderate',
      purchasingPower: 'high'
    },
    marketAppropriatePricing: {
      limited: 9.99,
      allFeatures: 18.99,
      annual: 99.99
    },
    qualitySignals: {
      limited: 'high',
      allFeatures: 'high',
      annual: 'high'
    }
  }
  // Additional countries can be added as needed
};

/**
 * Get market research data for a country
 */
export function getMarketResearch(countryCode: string): MarketResearchData | null {
  return MARKET_RESEARCH_DATA[countryCode] || null;
}

/**
 * Check if pricing signals quality in a given market
 */
export function signalsQuality(tier: 'limited' | 'allFeatures' | 'annual', countryCode: string): boolean {
  const research = getMarketResearch(countryCode);
  if (!research) return true; // Default to true if no research available
  
  const signal = research.qualitySignals[tier];
  return signal === 'high';
}
