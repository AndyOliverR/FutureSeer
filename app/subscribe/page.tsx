"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useSubscribe } from "@/hooks/useSubscribe"

export default function SubscribePage() {
  const {
    paypalConfig,
    loading,
    error,
    selectedPlan,
    customTipAmount,
    plans,
    features,
    tipAmounts,
    userProfile,
    setCustomTipAmount,
    handleSubscriptionClick,
    handleTipClick,
    handleCustomTip,
    formatPrice,
    getSavingsPercentage,
  } = useSubscribe()

  // Cosmic Loader Component
  const CosmicLoader = () => (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="text-6xl mb-6"
        >
          💎
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-soft text-lg"
        >
          Loading cosmic payment portal...
        </motion.p>
      </div>
    </div>
  )

  if (loading) {
    return <CosmicLoader />
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 pt-8"
        >
          <Link href="/dashboard" className="text-soft hover:gold-glow mb-4 inline-block transition-all duration-300">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-semibold gold-glow mb-4">Choose Your Path</h1>
          <p className="text-soft leading-relaxed">Unlock the full power of cosmic wisdom</p>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Current Status */}
        {userProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card rounded-3xl p-6 mb-8 border border-white/10"
            >
            <div className="text-center">
              <h3 className="text-xl gold-glow mb-2">Current Status</h3>
              <div className={`inline-block px-4 py-2 rounded-full text-sm ${
                userProfile.isSubscribed 
                  ? "bg-green-500/20 text-green-300 border border-green-500/30" 
                  : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
              }`}>
                {userProfile.isSubscribed ? "✨ Premium Active" : "🌟 Trial Active"}
                </div>
              {!userProfile.isSubscribed && (
                <p className="text-soft/70 text-sm mt-2">
                  Upgrade to unlock all features and remove limitations
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Subscription Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {plans.map((plan, index) => (
                         <PlanCard 
               key={plan.id} 
               plan={plan} 
               index={index}
               isSelected={selectedPlan === plan.id}
               isAvailable={paypalConfig.available}
               onSelect={() => handleSubscriptionClick(plan.id)}
               getSavingsPercentage={getSavingsPercentage}
             />
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card rounded-3xl p-8 mb-16 border border-white/10"
        >
          <h2 className="text-2xl gold-glow text-center mb-8">What You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="text-center group"
              >
                <motion.div 
                  className="text-4xl mb-3"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-soft font-semibold mb-2">{feature.title}</h3>
                <p className="text-soft/70 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card rounded-3xl p-8 border border-white/10"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl gold-glow mb-2">Support FutureSeer</h3>
            <p className="text-soft/70">Help us maintain our cosmic connection</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {tipAmounts.map((amount) => (
              <motion.button
                key={amount}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTipClick(amount)}
                disabled={!paypalConfig.available}
                className={`px-6 py-3 glass-card rounded-2xl text-soft transition-all duration-300 border ${
                  paypalConfig.available
                    ? "border-white/20 hover:border-yellow-400/50 hover:bg-yellow-400/10"
                    : "border-white/10 opacity-50 cursor-not-allowed"
                }`}
              >
                ${amount}
              </motion.button>
            ))}
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="number"
              placeholder="Custom"
              value={customTipAmount || ''}
              onChange={(e) => setCustomTipAmount(Number(e.target.value) || 0)}
              disabled={!paypalConfig.available}
              className={`w-24 px-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-center text-soft placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 ${
                !paypalConfig.available ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
          </div>
          
          <div className="text-center">
            {paypalConfig.available ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCustomTip}
                disabled={customTipAmount <= 0}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🙏 Support Us
              </motion.button>
            ) : (
              <motion.button
                disabled
                className="px-8 py-4 bg-gray-600 text-gray-400 rounded-2xl font-semibold cursor-not-allowed"
              >
                Payment Coming Soon
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Payment Status */}
        {!paypalConfig.available && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-8"
          >
          <p className="text-soft/70 text-sm">
              🚀 Payment integration is being configured. All features will be available soon!
          </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Plan Card Component
function PlanCard({ 
  plan, 
  index, 
  isSelected, 
  isAvailable, 
  onSelect,
  getSavingsPercentage
}: { 
  plan: any; 
  index: number; 
  isSelected: boolean; 
  isAvailable: boolean; 
  onSelect: () => void; 
  getSavingsPercentage: (originalPrice: number, currentPrice: number) => number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`glass-card rounded-3xl p-8 text-center relative border transition-all duration-300 ${
        plan.isPopular ? 'border-2 border-yellow-400/50' : 'border-white/10'
      } ${isSelected ? 'ring-2 ring-yellow-400/50' : ''}`}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2"
        >
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </motion.div>
      )}

      {/* Best Value Badge */}
      {plan.isBestValue && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2"
        >
          <span className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Best Value
          </span>
        </motion.div>
      )}

      <h3 className="text-xl gold-glow mb-4 font-semibold">{plan.name}</h3>
      
      <div className="mb-6">
        <div className="flex items-center justify-center mb-2">
          <span className="text-4xl font-light text-soft">{plan.price}</span>
          <span className="text-soft/70 text-sm font-light ml-1">/{plan.period}</span>
        </div>
        {plan.originalPrice && (
          <div className="flex items-center justify-center space-x-2">
            <span className="text-soft/70 text-sm line-through font-light">
              ${plan.originalPrice}
            </span>
            <span className="text-green-400 text-sm font-semibold">
              Save ${plan.savings} ({getSavingsPercentage(plan.originalPrice, plan.price)}%)
            </span>
          </div>
        )}
      </div>

      <ul className="text-soft/80 text-sm space-y-3 mb-8 font-light">
        {plan.features.map((feature: string, idx: number) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 + idx * 0.05 }}
            className="flex items-center"
          >
            <span className="mr-2">{feature}</span>
          </motion.li>
        ))}
      </ul>

      {isAvailable ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSelect}
          className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 ${
            plan.isPopular
              ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:shadow-xl"
              : "bg-gradient-to-r from-white/10 to-white/5 text-soft hover:bg-white/20"
          }`}
        >
          Choose {plan.name}
        </motion.button>
      ) : (
        <motion.button
          disabled
          className="w-full py-4 bg-gray-600 text-gray-400 rounded-2xl font-semibold cursor-not-allowed"
        >
          Coming Soon
        </motion.button>
      )}
    </motion.div>
  )
}
