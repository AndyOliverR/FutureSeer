/**
 * Global Country-Based Pricing Configuration
 * 
 * Pricing is based on India base prices (₹99, ₹199, ₹999) and adjusted for each country
 * using market research to ensure pricing feels "normal" and signals quality, not cheapness.
 */

export interface CountryPricingConfig {
  countryCode: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  
  // PPP multiplier based on India base (1.0 = India)
  // Based on market research, not direct currency conversion
  pppMultiplier: number;
  
  // Market research note (internal use only, no competitor names)
  marketResearchNote?: string;
  
  // Pricing tiers adjusted for market research and quality perception
  // India base: ₹99/month (Coffee), ₹199/quarter (Treat), ₹999/year (Hamper)
  pricingTiers: {
    limited: number;      // Limited choice (4 tools) - Not actively used
    allFeatures: number;  // Coffee - Monthly
    quarterly: number;    // Treat - Quarterly (3 months)
    annual: number;       // Hamper - Annual (12 months)
  };
  
  // Referral pricing (what friends pay with referral code)
  referralPricing: {
    limited: number;      // Friend pays this with referral code for limited plan
    allFeatures: number;  // Friend pays this with referral code for all features
    annual: number;       // Friend pays this with referral code for annual plan
  };
  
  // Pricing attractiveness indicators (for internal use)
  pricingAttractiveness: {
    tier1: 'high' | 'medium' | 'low';
    tier2: 'high' | 'medium' | 'low';
    tier3: 'high' | 'medium' | 'low';
  };
}

export const COUNTRY_PRICING_CONFIG: Record<string, CountryPricingConfig> = {
  'IN': {
    countryCode: 'IN',
    countryName: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    pppMultiplier: 1.0, // Base country
    pricingTiers: {
      limited: 99,        // ₹99/month - Limited (4 tools) - Not actively used
      allFeatures: 99,    // ₹99/month - Coffee (Monthly)
      quarterly: 199,     // ₹199/quarter - Treat (Quarterly)
      annual: 999         // ₹999/year - Hamper (Annual)
    },
    referralPricing: {
      limited: 99,        // Share code for same ₹99
      allFeatures: 99,    // Share code for ₹99
      annual: 99          // Share code for ₹99 (first month discount)
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'US': {
    countryCode: 'US',
    countryName: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    // Market research: Astrology apps in US typically $5-$20/month
    // Coffee: $9.99/month, Treat: $19.99/quarter, Hamper: $99.99/year
    pppMultiplier: 0.101, // Based on market research, not direct conversion
    marketResearchNote: 'Typical SaaS/astrology apps: $5-$20/month. Quality threshold: $9.99+',
    pricingTiers: {
      limited: 9.99,      // $9.99/month - Not actively used
      allFeatures: 9.99,  // $9.99/month - Coffee (Monthly)
      quarterly: 19.99,   // $19.99/quarter - Treat (Quarterly)
      annual: 99.99       // $99.99/year - Hamper (Annual)
    },
    referralPricing: {
      limited: 9.99,      // Friend pays same $9.99 with referral
      allFeatures: 9.99,  // Friend pays $9.99
      annual: 9.99        // Friend pays $9.99 (first month discount)
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'GB': {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    // Market research: UK pricing typically £5-£15/month for similar apps
    pppMultiplier: 0.008,
    marketResearchNote: 'Typical SaaS/astrology apps: £5-£15/month. Quality threshold: £7.99+',
    pricingTiers: {
      limited: 7.99,
      allFeatures: 7.99,    // Coffee
      quarterly: 14.99,     // Treat
      annual: 79.99         // Hamper
    },
    referralPricing: {
      limited: 7.99,
      allFeatures: 7.99,
      annual: 7.99
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'CA': {
    countryCode: 'CA',
    countryName: 'Canada',
    currency: 'CAD',
    currencySymbol: 'C$',
    // Similar to US market
    pppMultiplier: 0.013,
    marketResearchNote: 'Similar to US market pricing expectations',
    pricingTiers: {
      limited: 12.99,
      allFeatures: 12.99,   // Coffee
      quarterly: 24.99,     // Treat
      annual: 129.99        // Hamper
    },
    referralPricing: {
      limited: 12.99,
      allFeatures: 12.99,
      annual: 12.99
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'AU': {
    countryCode: 'AU',
    countryName: 'Australia',
    currency: 'AUD',
    currencySymbol: 'A$',
    pppMultiplier: 0.015,
    marketResearchNote: 'Similar to US/UK market pricing expectations',
    pricingTiers: {
      limited: 14.99,
      allFeatures: 14.99,   // Coffee
      quarterly: 29.99,     // Treat
      annual: 149.99        // Hamper
    },
    referralPricing: {
      limited: 14.99,
      allFeatures: 14.99,
      annual: 14.99
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'EU': {
    countryCode: 'EU',
    countryName: 'Europe',
    currency: 'EUR',
    currencySymbol: '€',
    // Using Germany as representative for EU
    pppMultiplier: 0.009,
    marketResearchNote: 'Typical SaaS pricing: €8-€18/month. Quality threshold: €9.99+',
    pricingTiers: {
      limited: 9.99,
      allFeatures: 9.99,    // Coffee
      quarterly: 18.99,     // Treat
      annual: 99.99         // Hamper
    },
    referralPricing: {
      limited: 9.99,
      allFeatures: 9.99,
      annual: 9.99
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'SG': {
    countryCode: 'SG',
    countryName: 'Singapore',
    currency: 'SGD',
    currencySymbol: 'S$',
    pppMultiplier: 0.014,
    marketResearchNote: 'High purchasing power, similar to developed markets',
    pricingTiers: {
      limited: 13.99,
      allFeatures: 13.99,   // Coffee
      quarterly: 27.99,     // Treat
      annual: 139.99        // Hamper
    },
    referralPricing: {
      limited: 13.99,
      allFeatures: 13.99,
      annual: 13.99
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'AE': {
    countryCode: 'AE',
    countryName: 'UAE',
    currency: 'AED',
    currencySymbol: 'AED',
    pppMultiplier: 0.04,
    marketResearchNote: 'High purchasing power market',
    pricingTiers: {
      limited: 39.99,
      allFeatures: 39.99,   // Coffee
      quarterly: 79.99,     // Treat
      annual: 399.99        // Hamper
    },
    referralPricing: {
      limited: 39.99,
      allFeatures: 39.99,
      annual: 39.99
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'BR': {
    countryCode: 'BR',
    countryName: 'Brazil',
    currency: 'BRL',
    currencySymbol: 'R$',
    pppMultiplier: 0.055,
    marketResearchNote: 'Emerging market, price adjusted for local purchasing power',
    pricingTiers: {
      limited: 54.99,
      allFeatures: 54.99,   // Coffee
      quarterly: 109.99,    // Treat
      annual: 549.99        // Hamper
    },
    referralPricing: {
      limited: 54.99,
      allFeatures: 54.99,
      annual: 54.99
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'MX': {
    countryCode: 'MX',
    countryName: 'Mexico',
    currency: 'MXN',
    currencySymbol: 'MX$',
    pppMultiplier: 0.22,
    marketResearchNote: 'Emerging market pricing',
    pricingTiers: {
      limited: 219.99,
      allFeatures: 219.99,  // Coffee
      quarterly: 439.99,    // Treat
      annual: 2199.99       // Hamper
    },
    referralPricing: {
      limited: 219.99,
      allFeatures: 219.99,
      annual: 219.99
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'PK': {
    countryCode: 'PK',
    countryName: 'Pakistan',
    currency: 'PKR',
    currencySymbol: '₨',
    pppMultiplier: 0.32,
    marketResearchNote: 'Similar purchasing power to India',
    pricingTiers: {
      limited: 319,
      allFeatures: 319,     // Coffee
      quarterly: 639,       // Treat
      annual: 3190          // Hamper
    },
    referralPricing: {
      limited: 319,
      allFeatures: 319,
      annual: 319
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'BD': {
    countryCode: 'BD',
    countryName: 'Bangladesh',
    currency: 'BDT',
    currencySymbol: '৳',
    pppMultiplier: 0.85,
    marketResearchNote: 'Similar purchasing power to India',
    pricingTiers: {
      limited: 849,
      allFeatures: 849,     // Coffee
      quarterly: 1699,      // Treat
      annual: 8490          // Hamper
    },
    referralPricing: {
      limited: 849,
      allFeatures: 849,
      annual: 849
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'ID': {
    countryCode: 'ID',
    countryName: 'Indonesia',
    currency: 'IDR',
    currencySymbol: 'Rp',
    pppMultiplier: 0.19,
    marketResearchNote: 'Emerging market pricing',
    pricingTiers: {
      limited: 189999,
      allFeatures: 189999,  // Coffee
      quarterly: 379999,    // Treat
      annual: 1899990       // Hamper
    },
    referralPricing: {
      limited: 189999,
      allFeatures: 189999,
      annual: 189999
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'PH': {
    countryCode: 'PH',
    countryName: 'Philippines',
    currency: 'PHP',
    currencySymbol: '₱',
    pppMultiplier: 0.35,
    marketResearchNote: 'Emerging market pricing',
    pricingTiers: {
      limited: 349,
      allFeatures: 349,     // Coffee
      quarterly: 699,       // Treat
      annual: 3490          // Hamper
    },
    referralPricing: {
      limited: 349,
      allFeatures: 349,
      annual: 349
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'TH': {
    countryCode: 'TH',
    countryName: 'Thailand',
    currency: 'THB',
    currencySymbol: '฿',
    pppMultiplier: 0.42,
    marketResearchNote: 'Emerging market pricing',
    pricingTiers: {
      limited: 419,
      allFeatures: 419,     // Coffee
      quarterly: 839,       // Treat
      annual: 4190          // Hamper
    },
    referralPricing: {
      limited: 419,
      allFeatures: 419,
      annual: 419
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'VN': {
    countryCode: 'VN',
    countryName: 'Vietnam',
    currency: 'VND',
    currencySymbol: '₫',
    pppMultiplier: 0.28,
    marketResearchNote: 'Emerging market pricing',
    pricingTiers: {
      limited: 279999,
      allFeatures: 279999,  // Coffee
      quarterly: 559999,    // Treat
      annual: 2799990       // Hamper
    },
    referralPricing: {
      limited: 279999,
      allFeatures: 279999,
      annual: 279999
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'MY': {
    countryCode: 'MY',
    countryName: 'Malaysia',
    currency: 'MYR',
    currencySymbol: 'RM',
    pppMultiplier: 0.056,
    marketResearchNote: 'Similar to Singapore market',
    pricingTiers: {
      limited: 54.99,
      allFeatures: 54.99,   // Coffee
      quarterly: 109.99,    // Treat
      annual: 549.99        // Hamper
    },
    referralPricing: {
      limited: 54.99,
      allFeatures: 54.99,
      annual: 54.99
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  },
  'ZA': {
    countryCode: 'ZA',
    countryName: 'South Africa',
    currency: 'ZAR',
    currencySymbol: 'R',
    pppMultiplier: 0.21,
    marketResearchNote: 'Emerging market pricing',
    pricingTiers: {
      limited: 209.99,
      allFeatures: 209.99,  // Coffee
      quarterly: 419.99,    // Treat
      annual: 2099.99       // Hamper
    },
    referralPricing: {
      limited: 209.99,
      allFeatures: 209.99,
      annual: 209.99
    },
    pricingAttractiveness: {
      tier1: 'high',
      tier2: 'high',
      tier3: 'high'
    }
  }
};

/**
 * Calculate attractive pricing based on market research (maintains quality perception)
 */
export function getAttractivePrice(
  tier: 'limited' | 'allFeatures' | 'quarterly' | 'annual',
  countryCode: string = 'IN'
): { price: number; currency: string; currencySymbol: string; formatted: string } {
  const config = COUNTRY_PRICING_CONFIG[countryCode] || COUNTRY_PRICING_CONFIG['IN'];
  const price = config.pricingTiers[tier];
  
  // Format price in local currency
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: config.currency === 'INR' || config.currency === 'PKR' || config.currency === 'BDT' ? 0 : 2,
    maximumFractionDigits: config.currency === 'INR' || config.currency === 'PKR' || config.currency === 'BDT' ? 0 : 2
  }).format(price);
  
  return {
    price,
    currency: config.currency,
    currencySymbol: config.currencySymbol,
    formatted
  };
}

/**
 * Get referral pricing for friends
 */
export function getReferralPrice(
  tier: 'limited' | 'allFeatures' | 'annual',
  countryCode: string = 'IN'
): { price: number; currency: string; currencySymbol: string; formatted: string } {
  const config = COUNTRY_PRICING_CONFIG[countryCode] || COUNTRY_PRICING_CONFIG['IN'];
  const price = config.referralPricing[tier];
  
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: config.currency === 'INR' || config.currency === 'PKR' || config.currency === 'BDT' ? 0 : 2,
    maximumFractionDigits: config.currency === 'INR' || config.currency === 'PKR' || config.currency === 'BDT' ? 0 : 2
  }).format(price);
  
  return {
    price,
    currency: config.currency,
    currencySymbol: config.currencySymbol,
    formatted
  };
}

/**
 * Get country pricing config
 */
export function getCountryPricingConfig(countryCode: string): CountryPricingConfig {
  return COUNTRY_PRICING_CONFIG[countryCode] || COUNTRY_PRICING_CONFIG['IN'];
}

/**
 * Minimum plan amount in smallest currency unit for Razorpay (e.g. trial plans).
 * INR/USD/etc require at least 1 unit of major currency (100 paise/cents); IDR/VND have no sub-unit.
 */
export function getMinPlanAmountInSmallestUnit(currency: string): number {
  if (currency === 'IDR' || currency === 'VND') return 1;
  return 100;
}

/**
 * Get all available countries
 */
export function getAvailableCountries(): Array<{ code: string; name: string; currency: string; currencySymbol: string }> {
  return Object.values(COUNTRY_PRICING_CONFIG).map(config => ({
    code: config.countryCode,
    name: config.countryName,
    currency: config.currency,
    currencySymbol: config.currencySymbol
  }));
}
