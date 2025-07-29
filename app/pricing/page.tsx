"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Sparkles, Crown, Zap, Users, Globe, Shield, Clock, Heart } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Global pricing configuration
const PRICING_CONFIG = {
  // Base prices in INR (Indian Rupees)
  base: {
    mysticExplorer: 199,
    cosmicOracle: 499,
    cosmicMaster: 9999
  },
  
  // Regional pricing multipliers
  regions: {
    'IN': { multiplier: 1, currency: '₹', name: 'India' },
    'US': { multiplier: 0.012, currency: '$', name: 'United States' },
    'EU': { multiplier: 0.011, currency: '€', name: 'Europe' },
    'GB': { multiplier: 0.0095, currency: '£', name: 'United Kingdom' },
    'CA': { multiplier: 0.016, currency: 'C$', name: 'Canada' },
    'AU': { multiplier: 0.018, currency: 'A$', name: 'Australia' },
    'SG': { multiplier: 0.016, currency: 'S$', name: 'Singapore' },
    'AE': { multiplier: 0.044, currency: 'AED', name: 'UAE' },
    'SA': { multiplier: 0.045, currency: 'SAR', name: 'Saudi Arabia' },
    'BR': { multiplier: 0.062, currency: 'R$', name: 'Brazil' },
    'MX': { multiplier: 0.24, currency: 'MX$', name: 'Mexico' },
    'ZA': { multiplier: 0.22, currency: 'R', name: 'South Africa' },
    'NG': { multiplier: 0.27, currency: '₦', name: 'Nigeria' },
    'KE': { multiplier: 0.32, currency: 'KSh', name: 'Kenya' },
    'PK': { multiplier: 0.34, currency: '₨', name: 'Pakistan' },
    'BD': { multiplier: 0.85, currency: '৳', name: 'Bangladesh' },
    'LK': { multiplier: 0.54, currency: '₨', name: 'Sri Lanka' },
    'NP': { multiplier: 0.60, currency: '₨', name: 'Nepal' },
    'MY': { multiplier: 0.057, currency: 'RM', name: 'Malaysia' },
    'TH': { multiplier: 0.43, currency: '฿', name: 'Thailand' },
    'VN': { multiplier: 0.29, currency: '₫', name: 'Vietnam' },
    'PH': { multiplier: 0.36, currency: '₱', name: 'Philippines' },
    'ID': { multiplier: 0.19, currency: 'Rp', name: 'Indonesia' }
  }
}

// Student discount regions (50% off)
const STUDENT_DISCOUNT_REGIONS = ['IN', 'US', 'CA', 'AU', 'GB', 'EU', 'SG']

// Tier-2/3 city discounts for India
const TIER_DISCOUNT_REGIONS = {
  'IN': {
    tier2: 0.10, // 10% off
    tier3: 0.15, // 15% off
    rural: 0.20  // 20% off
  }
}

interface PricingTier {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  borderColor: string
  features: string[]
  popular?: boolean
  originalPrice?: number
  discount?: number
  badge?: string
  badgeColor?: string
}

export default function PricingPage() {
  const [selectedRegion, setSelectedRegion] = useState('IN')
  const [isStudent, setIsStudent] = useState(false)
  const [userTier, setUserTier] = useState<'tier1' | 'tier2' | 'tier3' | 'rural'>('tier1')
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
    
    // Auto-detect user's region
    const detectRegion = () => {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const country = timezone.split('/')[0] === 'Etc' ? 'IN' : timezone.split('/')[1]?.substring(0, 2) || 'IN'
        const region = Object.keys(PRICING_CONFIG.regions).includes(country) ? country : 'IN'
        setSelectedRegion(region)
      } catch (error) {
        setSelectedRegion('IN')
      }
    }
    
    detectRegion()
  }, [])

  const getPrice = (basePrice: number, region: string = selectedRegion) => {
    const regionConfig = PRICING_CONFIG.regions[region as keyof typeof PRICING_CONFIG.regions]
    if (!regionConfig) return { price: basePrice, currency: '₹', formatted: `₹${basePrice}` }
    
    let price = basePrice * regionConfig.multiplier
    
    // Apply student discount
    if (isStudent && STUDENT_DISCOUNT_REGIONS.includes(region)) {
      price *= 0.5
    }
    
    // Apply tier discounts for India
    if (region === 'IN' && TIER_DISCOUNT_REGIONS.IN) {
      const discount = TIER_DISCOUNT_REGIONS.IN[userTier as keyof typeof TIER_DISCOUNT_REGIONS.IN] || 0
      price *= (1 - discount)
    }
    
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: regionConfig.currency === '₹' ? 'INR' : 
                regionConfig.currency === '$' ? 'USD' :
                regionConfig.currency === '€' ? 'EUR' :
                regionConfig.currency === '£' ? 'GBP' : 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
    
    return {
      price: Math.round(price),
      currency: regionConfig.currency,
      formatted: formatted
    }
  }

  const pricingTiers: PricingTier[] = [
    {
      id: 'cosmic-seeker',
      name: 'Cosmic Seeker',
      description: 'New users, curious explorers',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'bg-green-500',
      borderColor: 'border-green-500',
      features: [
        '2 AI readings per day',
        '3 basic tools (Tarot, Daily Horoscope, Basic Numerology)',
        'Community access (read-only)',
        'Basic cosmic insights',
        'Ad-supported experience'
      ],
      badge: 'Free Forever',
      badgeColor: 'bg-green-500'
    },
    {
      id: 'mystic-explorer',
      name: 'Mystic Explorer',
      description: 'Regular users, spiritual seekers',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-amber-500',
      borderColor: 'border-amber-500',
      features: [
        'Unlimited AI readings',
        'All 18+ divination tools',
        'Advanced astrology reports',
        'Priority AI responses',
        'Community participation',
        'Personal reading history',
        'Email support',
        'Ad-free experience'
      ],
      popular: true,
      originalPrice: PRICING_CONFIG.base.mysticExplorer * 1.5,
      discount: 33,
      badge: 'Most Popular',
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'cosmic-oracle',
      name: 'Cosmic Oracle',
      description: 'Power users, professionals',
      icon: <Crown className="w-6 h-6" />,
      color: 'bg-purple-500',
      borderColor: 'border-purple-500',
      features: [
        'All Mystic Explorer features',
        'Custom AI training on personal data',
        'Exclusive cosmic insights',
        '1-on-1 consultation sessions (2/month)',
        'Advanced analytics & patterns',
        'Priority support (24-hour response)',
        'Early access to new features',
        'Export readings to PDF',
        'Family account (up to 3 members)'
      ],
      originalPrice: PRICING_CONFIG.base.cosmicOracle * 1.6,
      discount: 37
    },
    {
      id: 'cosmic-master',
      name: 'Cosmic Master',
      description: 'Lifetime believers, high-value customers',
      icon: <Star className="w-6 h-6" />,
      color: 'bg-blue-600',
      borderColor: 'border-blue-600',
      features: [
        'All Oracle features forever',
        'Lifetime updates & new tools',
        'VIP community access',
        'Personal cosmic advisor (monthly calls)',
        'Exclusive content & workshops',
        'Dedicated support team',
        'Influence on product roadmap',
        'Family account (up to 5 members)',
        'Custom integrations',
        'White-label options for professionals'
      ],
      originalPrice: PRICING_CONFIG.base.cosmicMaster * 2,
      discount: 50,
      badge: 'Best Value',
      badgeColor: 'bg-blue-600'
    }
  ]

  const handleSubscribe = (tierId: string) => {
    if (tierId === 'cosmic-seeker') {
      toast({
        title: 'Coming Soon! 🌟',
        description: 'Free tier will be available soon. Stay tuned!',
      })
      return
    }
    
    toast({
      title: 'Coming Soon! 🚀',
      description: 'Subscription system will be live soon. Join our waitlist!',
    })
  }

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">Cosmic Path</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover the perfect plan for your spiritual journey. From curious explorers to dedicated practitioners, 
            we have a path for everyone.
          </p>
          
          {/* Region Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent text-white border-none outline-none"
              >
                {Object.entries(PRICING_CONFIG.regions).map(([code, config]) => (
                  <option key={code} value={code} className="bg-slate-800">
                    {config.name} ({config.currency})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Student Discount Toggle */}
            {STUDENT_DISCOUNT_REGIONS.includes(selectedRegion) && (
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-2">
                <Users className="w-4 h-4 text-blue-400" />
                <label className="text-white text-sm">
                  <input
                    type="checkbox"
                    checked={isStudent}
                    onChange={(e) => setIsStudent(e.target.checked)}
                    className="mr-2"
                  />
                  Student (50% off)
                </label>
              </div>
            )}
            
            {/* India Tier Discount */}
            {selectedRegion === 'IN' && (
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-2">
                <Shield className="w-4 h-4 text-green-400" />
                <select
                  value={userTier}
                  onChange={(e) => setUserTier(e.target.value as any)}
                  className="bg-transparent text-white border-none outline-none text-sm"
                >
                  <option value="tier1">Metro Cities</option>
                  <option value="tier2">Tier-2 Cities (10% off)</option>
                  <option value="tier3">Tier-3 Cities (15% off)</option>
                  <option value="rural">Rural Areas (20% off)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {pricingTiers.map((tier) => {
            const isFree = tier.id === 'cosmic-seeker'
            const priceInfo = isFree ? { price: 0, currency: '₹', formatted: 'Free' } : 
              tier.id === 'mystic-explorer' ? getPrice(PRICING_CONFIG.base.mysticExplorer) :
              tier.id === 'cosmic-oracle' ? getPrice(PRICING_CONFIG.base.cosmicOracle) :
              getPrice(PRICING_CONFIG.base.cosmicMaster)
            
            const originalPriceInfo = tier.originalPrice ? 
              tier.id === 'mystic-explorer' ? getPrice(tier.originalPrice) :
              tier.id === 'cosmic-oracle' ? getPrice(tier.originalPrice) :
              getPrice(tier.originalPrice) : null

            return (
              <Card 
                key={tier.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                  tier.popular 
                    ? 'ring-2 ring-amber-500 shadow-2xl shadow-amber-500/20' 
                    : 'hover:shadow-xl hover:shadow-slate-700/20'
                } bg-slate-800/50 border-slate-700`}
              >
                {tier.badge && (
                  <div className={`absolute top-4 right-4 ${tier.badgeColor} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                    {tier.badge}
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${tier.color} text-white mb-4`}>
                    {tier.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    {tier.name}
                  </CardTitle>
                  <p className="text-gray-400 text-sm">
                    {tier.description}
                  </p>
                </CardHeader>

                <CardContent className="text-center">
                  {/* Pricing */}
                  <div className="mb-6">
                    {isFree ? (
                      <div className="text-3xl font-bold text-green-400">Free</div>
                    ) : (
                      <div>
                        <div className="text-3xl font-bold text-white">
                          {priceInfo.formatted}
                          {tier.id === 'cosmic-master' ? '' : '/month'}
                        </div>
                        {originalPriceInfo && (
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-gray-400 line-through text-sm">
                              {originalPriceInfo.formatted}{tier.id === 'cosmic-master' ? '' : '/month'}
                            </span>
                            <Badge variant="secondary" className="bg-green-500 text-white">
                              Save {tier.discount}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 text-left">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSubscribe(tier.id)}
                    className={`w-full ${
                      tier.popular 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600' 
                        : tier.id === 'cosmic-seeker'
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500'
                    } text-white font-semibold py-3`}
                  >
                    {isFree ? 'Coming Soon' : 'Coming Soon'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center text-gray-400 space-y-4">
          <p className="text-lg">
            💫 All plans include our core mystical tools and AI-powered insights
          </p>
          <p className="text-sm">
            🔒 Secure payments • 30-day money-back guarantee • Cancel anytime
          </p>
          <div className="flex justify-center items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span>Trusted by 10,000+ users</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>100% secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 