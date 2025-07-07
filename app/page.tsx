import Link from "next/link"
import { ShootingStars } from "@/components/shooting-stars"
import { FloatingParticles } from "@/components/floating-particles"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Cosmic Effects */}
      <ShootingStars />
      <FloatingParticles />
      
      {/* Cosmic Aura */}
      <div className="cosmic-aura"></div>
      
      {/* Main Content */}
      <div className="text-center mb-16 relative z-10">
        <h1 className="text-6xl md:text-8xl font-semibold sacred-logo-restored mb-6">
          FutureSeer
        </h1>
        <p className="text-xl md:text-2xl text-soft max-w-2xl leading-relaxed cosmic-text-refined">
          Unveil the mysteries of your destiny through ancient wisdom and AI insight
        </p>
      </div>

      {/* Primary Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 mb-20 relative z-10">
        <Link
          href="/ask"
          className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-3xl font-semibold text-lg hover:scale-105 transition-transform shadow-lg cosmic-button-primary"
        >
          🔮 Ask the Seer
        </Link>
        <Link
          href="/subscribe"
          className="px-8 py-4 glass-card text-soft rounded-3xl font-semibold text-lg hover:scale-105 transition-transform sacred-button-secondary"
        >
          ✨ Begin Your Trial
        </Link>
      </div>

      {/* Feature Icons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl relative z-10">
        {[
          { icon: "☀️", label: "18 Divination Tools" },
          { icon: "🧠", label: "AI-Powered Insights" },
          { icon: "🌙", label: "Daily Guidance" },
          { icon: "🌟", label: "Sacred Remedies" },
        ].map((feature, i) => (
          <div key={i} className="text-center sacred-feature">
            <div className="text-3xl mb-3 sacred-icon">{feature.icon}</div>
            <p className="text-soft text-sm leading-relaxed">{feature.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
