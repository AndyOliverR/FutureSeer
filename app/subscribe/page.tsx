"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { updateSubscriptionStatus, updateTipStatus, getTrialTimeLeft } from "@/lib/firebase"
import { trackEvent } from "@/lib/api"

function SubscribePageContent() {
  const { user, userProfile } = useAuth()
  const [trialTimeLeft, setTrialTimeLeft] = useState<number>(0)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [customTip, setCustomTip] = useState<number>(0)

  // Calculate trial time left
  useEffect(() => {
    if (userProfile?.trialEndTime) {
      const timeLeft = getTrialTimeLeft(userProfile.trialEndTime)
      setTrialTimeLeft(timeLeft)
    }
  }, [userProfile])

  const formatTimeLeft = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const handleSubscriptionSuccess = async (planId: string) => {
    if (user?.uid) {
      await updateSubscriptionStatus(user.uid, true)
      trackEvent('subscription_purchased', { plan: planId })
    }
  }

  const handleTipSuccess = async (amount: number) => {
    if (user?.uid) {
      await updateTipStatus(user.uid, true)
      trackEvent('tip_given', { amount })
    }
  }

  const plans = [
    {
      name: "Monthly",
      price: "₹99",
      period: "/month",
      features: [
        "Unlimited AI consultations",
        "All 18 tools access",
        "Daily guidance",
        "Basic remedies",
        "Priority support",
      ],
      popular: false,
    },
    {
      name: "Quarterly",
      price: "₹299",
      period: "/quarter",
      originalPrice: "₹297",
      features: [
        "Everything in Monthly",
        "Early feature access",
        "Advanced remedies",
        "Personalized insights",
        "Priority support",
      ],
      popular: true,
      savings: "Save ₹198",
    },
    {
      name: "Yearly",
      price: "₹999",
      period: "/year",
      originalPrice: "₹1,188",
      features: [
        "Best value plan",
        "Custom remedy creation",
        "Priority delivery",
        "Unlimited consultations",
        "Early access",
      ],
      popular: false,
      savings: "Save ₹189",
    },
  ]

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 pt-8">
          <Link href="/" className="text-soft hover:gold-glow mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-semibold gold-glow mb-4">Choose Your Journey</h1>
          <p className="text-soft leading-relaxed mb-8">Unlock the full power of AI-driven divine wisdom</p>

          {/* Trial Banner */}
          <div className="glass-card rounded-2xl p-4 max-w-md mx-auto">
            <p className="text-soft text-sm">
              🎁 <span className="font-medium">
                {trialTimeLeft > 0 
                  ? `${formatTimeLeft(trialTimeLeft)} remaining in trial`
                  : 'Trial expired - Subscribe to continue'
                }
              </span>
            </p>
            {trialTimeLeft > 0 && (
              <div className="mt-2">
                <div className="w-full bg-purple-800/30 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, (trialTimeLeft / (9 * 60 * 60 * 1000)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative glass-card rounded-3xl p-8 hover:scale-105 transition-transform ${
                plan.popular ? "ring-2 ring-yellow-400" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-1 rounded-full text-sm font-medium">
                    Best Value
                  </span>
                </div>
              )}

              {plan.savings && (
                <div className="absolute -top-2 -right-2">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {plan.savings}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl text-soft font-medium mb-4">{plan.name}</h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl gold-glow font-semibold">{plan.price}</span>
                  <span className="text-soft/70 ml-1">{plan.period}</span>
                </div>
                {plan.originalPrice && <div className="text-soft/50 text-sm line-through">{plan.originalPrice}</div>}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start text-soft text-sm">
                    <span className="text-yellow-400 mr-3 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.name === "Monthly" && (
                <PayPalButtons
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [
                        {
                          amount: {
                            value: "499",
                            currency_code: "INR"
                          },
                          description: "FutureSeer Monthly Subscription"
                        }
                      ]
                    })
                  }}
                  onApprove={async (data, actions) => {
                    if (actions.order) {
                      await actions.order.capture()
                      handleSubscriptionSuccess('monthly')
                    }
                  }}
                  style={{ layout: "vertical" }}
                />
              )}
              
              {plan.name === "Quarterly" && (
                <PayPalButtons
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [
                        {
                          amount: {
                            value: "299",
                            currency_code: "INR"
                          },
                          description: "FutureSeer Quarterly Subscription"
                        }
                      ]
                    })
                  }}
                  onApprove={async (data, actions) => {
                    if (actions.order) {
                      await actions.order.capture()
                      handleSubscriptionSuccess('quarterly')
                    }
                  }}
                  style={{ layout: "vertical" }}
                />
              )}
              
              {plan.name === "Yearly" && (
                <PayPalButtons
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [
                        {
                          amount: {
                            value: "999",
                            currency_code: "INR"
                          },
                          description: "FutureSeer Yearly Subscription"
                        }
                      ]
                    })
                  }}
                  onApprove={async (data, actions) => {
                    if (actions.order) {
                      await actions.order.capture()
                      handleSubscriptionSuccess('yearly')
                    }
                  }}
                  style={{ layout: "vertical" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h3 className="text-2xl gold-glow text-center mb-12">What You'll Receive</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "🔮", title: "18 Divination Tools", desc: "Complete mystical toolkit" },
              { icon: "🤖", title: "Advanced AI Insights", desc: "Cutting-edge analysis" },
              { icon: "📱", title: "Mobile Optimized", desc: "Perfect for on-the-go guidance" },
              { icon: "🌟", title: "Daily Guidance", desc: "Fresh wisdom every day" },
              { icon: "💎", title: "Sacred Remedies", desc: "Personalized healing practices" },
              { icon: "🎯", title: "Precision Accuracy", desc: "Highly accurate predictions" },
            ].map((feature, i) => (
              <div key={i} className="text-center glass-card rounded-2xl p-6">
                <div className="text-2xl mb-4">{feature.icon}</div>
                <h4 className="text-soft font-medium mb-2">{feature.title}</h4>
                <p className="text-soft/70 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tip Jar */}
        <div className="glass-card rounded-3xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl gold-glow mb-2">Support Our Mission</h3>
            <p className="text-soft/70 text-sm">Help us maintain and improve our cosmic services</p>
          </div>
          <div className="flex justify-center gap-4 mb-6">
            {[108, 501].map((amount) => (
              <button
                key={amount}
                className="px-6 py-3 glass-card rounded-2xl text-soft hover:bg-yellow-400 hover:text-black transition-colors"
              >
                ₹{amount}
              </button>
            ))}
            <input
              type="number"
              placeholder="Custom"
              className="w-24 px-4 py-3 bg-transparent border border-white/20 rounded-2xl text-center text-soft placeholder-white/50 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div className="text-center">
            <button className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-2xl font-semibold hover:scale-105 transition-transform">
              🙏 Make a Donation
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center glass-card rounded-2xl p-6 mt-8">
          <p className="text-soft/70 text-sm">
            All insights and predictions are AI-generated for entertainment purposes. FutureSeer uses advanced
            artificial intelligence to analyze patterns and provide personalized mystical insights.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SubscribePage() {
  return (
    <PayPalScriptProvider options={{
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
      currency: "INR",
      intent: "capture"
    }}>
      <SubscribePageContent />
    </PayPalScriptProvider>
  )
}
