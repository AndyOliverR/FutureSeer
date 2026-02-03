"use client"

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Coffee, Gift, Sparkles } from 'lucide-react'
import { getAttractivePrice } from '@/lib/pricingConfig'

export interface TipJarEncouragementProps {
  onSelectPlan: (planId: 'buy-coffee' | 'treat-me' | 'festive-hamper') => void
  onDismiss: () => void
  countryCode?: string
}

export function TipJarEncouragement({ 
  onSelectPlan, 
  onDismiss,
  countryCode = 'IN' 
}: TipJarEncouragementProps) {
  // Get pricing for display
  const monthlyPricing = getAttractivePrice('allFeatures', countryCode)
  const quarterlyPricing = getAttractivePrice('quarterly', countryCode)
  const annualPricing = getAttractivePrice('annual', countryCode)

  const pricingDisplay = {
    monthly: monthlyPricing.formatted,
    quarterly: quarterlyPricing.formatted,
    annual: annualPricing.formatted
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="my-6"
    >
      <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 border-2 border-amber-300 shadow-lg rounded-3xl overflow-hidden">
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400" />
        
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <div className="bg-amber-200/60 rounded-full p-4 inline-block mb-4">
                <Coffee className="w-16 h-16 text-amber-700" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-amber-900 mb-2">
              Enjoying FutureSeer Comparisons?
            </h3>
            <p className="text-slate-700 leading-relaxed max-w-xl mx-auto">
              You've used your free comparison! Support the innovation experiment 
              to unlock unlimited compatibility reports and help keep FutureSeer accessible to all.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Buy Me a Coffee - Monthly */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <Card className="border-2 border-blue-300 hover:border-blue-400 hover:shadow-xl transition-all duration-300 shadow-md rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 h-full">
                <CardContent className="p-5 text-center flex flex-col items-center justify-between h-full">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="bg-blue-200/60 rounded-full p-3 mb-3">
                      <Coffee className="w-10 h-10 text-blue-700" />
                    </div>
                    <h4 className="font-bold text-blue-900 text-lg mb-2">Coffee</h4>
                    <p className="text-sm text-slate-600 mb-3">Monthly contribution</p>
                    <Badge className="bg-blue-200 text-blue-900 mb-4 text-base px-3 py-1">
                      {pricingDisplay.monthly}/month
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => onSelectPlan('buy-coffee')} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  >
                    Support Monthly
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Treat Me - Quarterly */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Card className="border-2 border-purple-300 hover:border-purple-400 hover:shadow-xl transition-all duration-300 shadow-md rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 h-full">
                <CardContent className="p-5 text-center flex flex-col items-center justify-between h-full">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="bg-purple-200/60 rounded-full p-3 mb-3">
                      <Gift className="w-10 h-10 text-purple-700" />
                    </div>
                    <h4 className="font-bold text-purple-900 text-lg mb-2">Treat</h4>
                    <p className="text-sm text-slate-600 mb-3">Quarterly contribution</p>
                    <Badge className="bg-purple-200 text-purple-900 mb-4 text-base px-3 py-1">
                      {pricingDisplay.quarterly}/3 months
                    </Badge>
                    <Badge variant="secondary" className="bg-green-200 text-green-900 text-xs mb-2">
                      10% savings
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => onSelectPlan('treat-me')} 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                  >
                    Support Quarterly
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Buy a Hamper - Annual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Card className="border-2 border-pink-300 hover:border-pink-400 hover:shadow-xl transition-all duration-300 shadow-md rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 h-full">
                <CardContent className="p-5 text-center flex flex-col items-center justify-between h-full">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="bg-pink-200/60 rounded-full p-3 mb-3">
                      <Sparkles className="w-10 h-10 text-pink-700" />
                    </div>
                    <h4 className="font-bold text-pink-900 text-lg mb-2">Hamper</h4>
                    <p className="text-sm text-slate-600 mb-3">Annual contribution</p>
                    <Badge className="bg-pink-200 text-pink-900 mb-4 text-base px-3 py-1">
                      {pricingDisplay.annual}/year
                    </Badge>
                    <Badge variant="secondary" className="bg-green-200 text-green-900 text-xs mb-2">
                      Best value
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => onSelectPlan('festive-hamper')} 
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl"
                  >
                    Support Annually
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Supporting FutureSeer helps us continue the innovation experiment and keep all tools accessible. 
              Choose the contribution rhythm that feels right for you.
            </p>
            <button 
              onClick={onDismiss}
              className="text-sm text-slate-600 hover:text-slate-800 underline transition-colors"
            >
              Maybe later
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
