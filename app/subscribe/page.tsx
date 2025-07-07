"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { trackEvent } from "@/lib/api"

interface PayPalConfig {
  clientId: string | null
  available: boolean
}

export default function SubscribePage() {
  const { user, userProfile } = useAuth()
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfig>({ clientId: null, available: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayPalConfig()
  }, [])

  const fetchPayPalConfig = async () => {
    try {
      const response = await fetch("/api/paypal-config")
      const config = await response.json()
      setPaypalConfig(config)
    } catch (error) {
      console.error("Error fetching PayPal config:", error)
      setPaypalConfig({ clientId: null, available: false })
    } finally {
      setLoading(false)
    }
  }

  const handleSubscriptionClick = (plan: string) => {
    trackEvent("subscription_click", { plan, userId: user?.uid })
  }

  const handleTipClick = (amount: number) => {
    trackEvent("tip_click", { amount, userId: user?.uid })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-24k mx-auto mb-4"></div>
          <p className="text-soft font-light">Loading cosmic payment portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <Link href="/" className="text-soft hover:gold-glow-24k mb-4 inline-block font-light">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-extra-thin gold-text-24k mb-4 tracking-wide">Choose Your Path</h1>
          <p className="text-soft leading-relaxed font-light">Unlock the full power of cosmic wisdom</p>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Monthly Plan */}
          <div className="glass-card rounded-3xl p-8 text-center">
            <h3 className="text-xl gold-text-24k mb-4 font-light">Monthly</h3>
            <div className="mb-6">
              <span className="text-3xl font-light text-soft">$9</span>
              <span className="text-soft/70 text-sm font-light">/month</span>
            </div>
            <ul className="text-soft/80 text-sm space-y-2 mb-8 font-light">
              <li>✨ Unlimited AI readings</li>
              <li>🔮 All 18 divination tools</li>
              <li>📱 Mobile app access</li>
              <li>💫 Daily cosmic insights</li>
            </ul>
            {paypalConfig.available ? (
              <button
                onClick={() => handleSubscriptionClick("monthly")}
                className="w-full py-3 gold-button-24k text-black rounded-2xl font-light hover:scale-105 transition-transform"
              >
                Choose Monthly
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3 bg-gray-600 text-gray-400 rounded-2xl font-light cursor-not-allowed"
              >
                Coming Soon
              </button>
            )}
          </div>

          {/* Quarterly Plan - Most Popular */}
          <div className="glass-card rounded-3xl p-8 text-center relative border-2 border-gold-24k">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gold-24k text-black px-4 py-1 rounded-full text-sm font-light">Most Popular</span>
            </div>
            <h3 className="text-xl gold-text-24k mb-4 font-light">Quarterly</h3>
            <div className="mb-2">
              <span className="text-3xl font-light text-soft">$21</span>
              <span className="text-soft/70 text-sm font-light">/3 months</span>
            </div>
            <div className="mb-6">
              <span className="text-soft/70 text-sm line-through font-light">$27</span>
              <span className="text-green-400 text-sm ml-2 font-light">Save $6</span>
            </div>
            <ul className="text-soft/80 text-sm space-y-2 mb-8 font-light">
              <li>✨ Unlimited AI readings</li>
              <li>🔮 All 18 divination tools</li>
              <li>📱 Mobile app access</li>
              <li>💫 Daily cosmic insights</li>
              <li>🎯 Priority support</li>
            </ul>
            {paypalConfig.available ? (
              <button
                onClick={() => handleSubscriptionClick("quarterly")}
                className="w-full py-3 gold-button-24k text-black rounded-2xl font-light hover:scale-105 transition-transform"
              >
                Choose Quarterly
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3 bg-gray-600 text-gray-400 rounded-2xl font-light cursor-not-allowed"
              >
                Coming Soon
              </button>
            )}
          </div>

          {/* Yearly Plan */}
          <div className="glass-card rounded-3xl p-8 text-center">
            <h3 className="text-xl gold-text-24k mb-4 font-light">Yearly</h3>
            <div className="mb-2">
              <span className="text-3xl font-light text-soft">$72</span>
              <span className="text-soft/70 text-sm font-light">/year</span>
            </div>
            <div className="mb-6">
              <span className="text-soft/70 text-sm line-through font-light">$108</span>
              <span className="text-green-400 text-sm ml-2 font-light">Save $36</span>
            </div>
            <ul className="text-soft/80 text-sm space-y-2 mb-8 font-light">
              <li>✨ Unlimited AI readings</li>
              <li>🔮 All 18 divination tools</li>
              <li>📱 Mobile app access</li>
              <li>💫 Daily cosmic insights</li>
              <li>🎯 Priority support</li>
              <li>🌟 Exclusive content</li>
            </ul>
            {paypalConfig.available ? (
              <button
                onClick={() => handleSubscriptionClick("yearly")}
                className="w-full py-3 gold-button-24k text-black rounded-2xl font-light hover:scale-105 transition-transform"
              >
                Choose Yearly
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3 bg-gray-600 text-gray-400 rounded-2xl font-light cursor-not-allowed"
              >
                Coming Soon
              </button>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="glass-card rounded-3xl p-8 mb-16">
          <h2 className="text-2xl gold-text-24k text-center mb-8 font-light">What You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🔮", title: "AI Oracle", desc: "Advanced AI-powered predictions and insights" },
              { icon: "⭐", title: "18 Tools", desc: "Complete suite of divination methods" },
              { icon: "📱", title: "Mobile Ready", desc: "Seamless experience across all devices" },
              { icon: "💫", title: "Daily Insights", desc: "Personalized cosmic guidance every day" },
              { icon: "🎯", title: "Accurate Readings", desc: "Precision-tuned algorithms for accuracy" },
              { icon: "🌟", title: "Premium Support", desc: "Priority assistance from our team" },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-soft font-light mb-2">{feature.title}</h3>
                <p className="text-soft/70 text-sm font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="glass-card rounded-3xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl gold-text-24k mb-2 font-light">Support FutureSeer</h3>
            <p className="text-soft/70 text-sm font-light">Help us maintain our cosmic connection</p>
          </div>
          <div className="flex justify-center gap-4 mb-6">
            {[5, 10, 25].map((amount) => (
              <button
                key={amount}
                onClick={() => handleTipClick(amount)}
                disabled={!paypalConfig.available}
                className={`px-6 py-3 glass-card gold-border-24k rounded-2xl text-soft transition-all font-light ${
                  paypalConfig.available
                    ? "hover:gold-shimmer-advanced hover:text-black"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                ${amount}
              </button>
            ))}
            <input
              type="number"
              placeholder="Custom"
              disabled={!paypalConfig.available}
              className={`w-24 px-4 py-3 bg-transparent border border-white/20 rounded-2xl text-center text-soft placeholder-white/50 focus:outline-none font-light ${
                paypalConfig.available ? "focus:border-gold-24k" : "opacity-50 cursor-not-allowed"
              }`}
            />
          </div>
          <div className="text-center">
            {paypalConfig.available ? (
              <button
                onClick={() => handleTipClick(0)}
                className="px-8 py-3 gold-button-24k text-black rounded-2xl font-light hover:scale-105 transition-transform"
              >
                🙏 Support Us
              </button>
            ) : (
              <button
                disabled
                className="px-8 py-3 bg-gray-600 text-gray-400 rounded-2xl font-light cursor-not-allowed"
              >
                Payment Coming Soon
              </button>
            )}
          </div>
        </div>

        {/* Payment Status */}
        {!paypalConfig.available && (
          <div className="text-center mt-8">
            <p className="text-soft/70 text-sm font-light">
              🚀 Payment integration is being configured. All features will be available soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
