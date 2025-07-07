"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { updateSubscriptionStatus, updateTipStatus } from "@/lib/firebase"
import { trackEvent } from "@/lib/api"

interface PayPalConfig {
  clientId: string
  currency: string
  intent: string
}

function SubscribePageContent({ paypalConfig }: { paypalConfig: PayPalConfig | null }) {
  const { user, userProfile } = useAuth()
  const [timeLeft, setTimeLeft] = useState(0)

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
      await trackEvent("subscription_success", { plan: planId })

      alert("Subscription successful! Welcome to FutureSeer Premium! ✨")
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Error updating subscription:", error)
      alert("Payment successful! Please refresh the page to see your premium features.")
    }
  }

  const handleTipSuccess = async (amount: number) => {
    if (user?.uid) {
      await updateTipStatus(user.uid, amount)
      await trackEvent("tip_success", { amount })
    }
    alert(`Thank you for your generous donation of ₹${amount}! 🙏`)
  }

  const plans = [
    {
      name: "Monthly",
      price: "₹499",
      period: "/month",
      paypalValue: "499.00",
      features: [
        "Unlimited AI predictions",
        "All 18 divination tools",
        "Daily cosmic guidance",
        "Personal notes & history",
        "Priority support",
      ],
    },
    {
      name: "Quarterly",
      price: "₹1,299",
      period: "/3 months",
      paypalValue: "1299.00",
      originalPrice: "₹1,497",
      savings: "Save ₹198",
      popular: true,
      features: [
        "Everything in Monthly",
        "Advanced analytics",
        "Custom remedies",
        "Exclusive content",
        "Early access to features",
      ],
    },
    {
      name: "Yearly",
      price: "₹4,999",
      period: "/year",
      paypalValue: "4999.00",
      originalPrice: "₹5,988",
      savings: "Save ₹989",
      features: [
        "Everything in Quarterly",
        "Personal consultation",
        "VIP community access",
        "Lifetime updates",
        "Dedicated support",
      ],
    },
  ]

  const createPayPalButtons = (plan: (typeof plans)[0]) => {
    if (!paypalConfig?.clientId) {
      return (
        <button className="w-full py-3 rounded-2xl font-light transition-all hover:scale-105 glass-card gold-border-24k text-soft hover:bg-white/10">
          Payment Coming Soon
        </button>
      )
    }

    return (
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  value: plan.paypalValue,
                  currency_code: "USD", // Changed to USD for better PayPal compatibility
                },
                description: `FutureSeer ${plan.name} Subscription`,
              },
            ],
          })
        }}
        onApprove={async (data, actions) => {
          try {
            if (actions.order) {
              const details = await actions.order.capture()
              console.log("Payment successful:", details)
              handleSubscriptionSuccess(plan.name.toLowerCase())
            }
          } catch (error) {
            console.error("Payment error:", error)
            alert("Payment processing failed. Please try again.")
          }
        }}
        onError={(err) => {
          console.error("PayPal error:", err)
          alert("Payment system error. Please try again later.")
        }}
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        }}
      />
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <Link href="/dashboard" className="text-soft hover:gold-glow-24k mb-4 inline-block font-light">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-extra-thin gold-text-24k mb-4 tracking-wide">Choose Your Path</h1>
          <p className="text-soft leading-relaxed font-light">Unlock the full power of mystical AI insights</p>
        </div>

        {/* Trial Banner */}
        {userProfile && !userProfile.isSubscribed && timeLeft > 0 && (
          <div className="glass-card gold-border-24k rounded-3xl p-6 mb-8 text-center">
            <h3 className="text-lg gold-text-24k mb-2 font-light">Trial Period Active</h3>
            <p className="text-soft/70 mb-4 font-light">
              You have <span className="gold-text-24k font-light">{formatTimeLeft(timeLeft)}</span> remaining in your
              trial
            </p>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="gold-shimmer-advanced h-2 rounded-full transition-all duration-1000"
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
                plan.popular ? "gold-border-24k" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="gold-shimmer-advanced text-black px-4 py-1 rounded-full text-sm font-light">
                    Best Value
                  </span>
                </div>
              )}

              {plan.savings && (
                <div className="absolute -top-2 -right-2">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-light">
                    {plan.savings}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl text-soft font-light mb-4">{plan.name}</h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl gold-text-24k font-light">{plan.price}</span>
                  <span className="text-soft/70 ml-1 font-light">{plan.period}</span>
                </div>
                {plan.originalPrice && (
                  <div className="text-soft/50 text-sm line-through font-light">{plan.originalPrice}</div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start text-soft text-sm font-light">
                    <span className="text-gold-24k mr-3 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="min-h-[60px]">{createPayPalButtons(plan)}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h3 className="text-2xl gold-text-24k text-center mb-12 font-light tracking-wide">What You'll Receive</h3>
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
                <h4 className="text-soft font-light mb-2">{feature.title}</h4>
                <p className="text-soft/70 text-sm font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tip Jar */}
        <div className="glass-card gold-border-24k rounded-3xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl gold-text-24k mb-2 font-light">Support Our Mission</h3>
            <p className="text-soft/70 text-sm font-light">Help us maintain and improve our cosmic services</p>
          </div>
          <div className="flex justify-center gap-4 mb-6">
            {[108, 501].map((amount) => (
              <button
                key={amount}
                onClick={() => handleTipSuccess(amount)}
                className="px-6 py-3 glass-card gold-border-24k rounded-2xl text-soft hover:gold-shimmer-advanced hover:text-black transition-all font-light"
              >
                ₹{amount}
              </button>
            ))}
            <input
              type="number"
              placeholder="Custom"
              className="w-24 px-4 py-3 bg-transparent border border-white/20 rounded-2xl text-center text-soft placeholder-white/50 focus:outline-none focus:border-gold-24k font-light"
            />
          </div>
          <div className="text-center">
            <button
              onClick={() => handleTipSuccess(108)}
              className="px-8 py-3 gold-button-24k text-black rounded-2xl font-light hover:scale-105 transition-transform"
            >
              🙏 Make a Donation
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center glass-card rounded-2xl p-6 mt-8">
          <p className="text-soft/70 text-sm font-light">
            All insights and predictions are AI-generated for entertainment purposes. FutureSeer uses advanced
            artificial intelligence to analyze patterns and provide personalized mystical insights.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SubscribePage() {
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch PayPal configuration from server
    fetch("/api/paypal-config")
      .then((res) => res.json())
      .then((config) => {
        setPaypalConfig(config)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching PayPal config:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center pt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-soft mt-4 font-light">Loading payment options...</p>
          </div>
        </div>
      </div>
    )
  }

  // If PayPal config is available and has a valid client ID, use PayPal
  if (paypalConfig?.clientId && paypalConfig.clientId !== "") {
    return (
      <PayPalScriptProvider
        options={{
          clientId: paypalConfig.clientId,
          currency: "USD", // Changed to USD for better compatibility
          intent: "capture",
          components: "buttons",
        }}
      >
        <SubscribePageContent paypalConfig={paypalConfig} />
      </PayPalScriptProvider>
    )
  }

  // Fallback without PayPal integration
  return <SubscribePageContent paypalConfig={null} />
}
