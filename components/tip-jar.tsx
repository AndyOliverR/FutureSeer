"use client"

import { useState } from "react"

export function TipJar() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")

  const presetAmounts = [108, 501]

  return (
    <div className="bg-purple-900/20 rounded-2xl p-8 backdrop-blur-sm border border-purple-800/30">
      <div className="text-center mb-6">
        <h3 className="text-xl text-gold font-light mb-2">✨ Did this resonate? Support the Seer.</h3>
        <p className="text-purple-300 text-sm font-light leading-relaxed">
          Your gratitude helps maintain our AI-powered cosmic connection
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {presetAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => setSelectedAmount(amount)}
            className={`px-6 py-3 rounded-full border transition-all ${
              selectedAmount === amount
                ? "bg-gold text-purple-950 border-gold"
                : "border-purple-600 text-gray-200 hover:border-gold"
            }`}
          >
            ₹{amount}
          </button>
        ))}

        <div className="relative">
          <input
            type="number"
            placeholder="Custom"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-24 px-4 py-3 bg-transparent border border-purple-600 rounded-full text-center text-gray-200 placeholder-purple-400 focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      <div className="text-center">
        <button className="bg-gradient-to-r from-gold to-yellow-400 text-purple-950 px-8 py-3 rounded-full font-medium hover:scale-105 transition-transform">
          🙏 Offer Gratitude
        </button>
      </div>
    </div>
  )
}
