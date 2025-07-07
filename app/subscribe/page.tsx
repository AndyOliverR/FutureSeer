"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { updateSubscriptionStatus, updateTipStatus, getTrialTimeLeft } from "@/lib/firebase"
import { trackEvent } from "@/lib/api"

function SubscribePageContent() {
  const { user, userProfile } = useAuth()
  const [timeLeft, setTimeLeft] = useState(0)
  const [paypalConfig, setPaypalConfig] = useState<any>(null)

  useEffect(() => {
    // Fetch PayPal configuration from server
    fetch('/api/paypal-config')
      .then(res => res.json())
      .then(config => setPaypalConfig(config))
      .catch(err => console.error('Error fetching PayPal config:', err))
  }, [])

  useEffect(() => {
    if (userProfile?.trialEndTime) {
      const interval = setInterval(() => {
        setTimeLeft(getTimeLeft())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [userProfile])

  const getTimeLeft = () => {
    if (!userProfile?.trialEndTime) return 0
    const timeLeft = userProfile.trialEndTime - Date.now()
    return Math.max(0, timeLeft)
  }

  const formatTimeLeft = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const handleSubscriptionSuccess = async (planId: string) => {
    if (!user?.uid) return
    
    try {
      await updateSubscriptionStatus(user.uid, true)
      
      alert("Subscription successful! Welcome to FutureSeer Premium! ✨")
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Error updating subscription:", error)
      alert("Payment successful! Please refresh the page to see your premium features.")
    }
  }

  const handleTipSuccess = async (amount: number) => {
    alert(`Thank you for your generous donation of ₹${amount}! 🙏`)
  }

  const plans = [
    {
      name: "Monthly",
      price: "₹499",
      period: "/month",
      features: [
        "Unlimited AI predictions",
        "All 18 divination tools",
        "Daily cosmic guidance",
        "Personal notes & history",
        "Priority support"
      ]
    },
    {
      name: "Quarterly",
      price: "₹1,299",
      period: "/3 months",
      originalPrice: "₹1,497",
      savings: "Save ₹198",
      popular: true,
      features: [
        "Everything in Monthly",
        "Advanced analytics",
        "Custom remedies",
        "Exclusive content",
        "Early access to features"
      ]
    },
    {
      name: "Yearly",
      price: "₹4,999",
      period: "/year",
      originalPrice: "₹5,988",
      savings: "Save ₹989",
      features: [
        "Everything in Quarterly",
        "Personal consultation",
        "VIP community access",
        "Lifetime updates",
        "Dedicated support"
      ]
    }
  ]

  if (!paypalConfig) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center pt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-soft mt-4">Loading payment options...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <Link href="/dashboard" className="text-soft hover:gold-glow mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-semibold gold-glow mb-4">Choose Your Path</h1>
          <p className="text-soft leading-relaxed">Unlock the full power of mystical AI insights</p>
        </div>

        {/* Trial Banner */}
        {userProfile && !userProfile.isSubscribed && timeLeft > 0 && (
          <div className="glass-card rounded-3xl p-6 mb-8 text-center">
            <h3 className="text-lg gold-glow mb-2">Trial Period Active</h3>
            <p className="text-soft/70 mb-4">
              You have <span className="gold-glow font-semibold">{formatTimeLeft(timeLeft)}</span> remaining in your trial
            </p>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(0, 100 - (timeLeft / (9 * 60 * 60 * 1000)) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}

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
                            value: "1299",
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
                            value: "4999",
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
