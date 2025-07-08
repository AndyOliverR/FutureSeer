import Link from "next/link"
import { Sparkles, Brain, Moon, Compass } from "lucide-react"
import { CosmicBackground } from "@/components/cosmic-background"
import { AuroraEffect } from "@/components/aurora-effect"
import { ShootingStars } from "@/components/shooting-stars"

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background Layers */}
      <CosmicBackground />
      <AuroraEffect />
      <ShootingStars />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-4xl">
          <h1 className="font-serif text-7xl md:text-9xl font-light mb-8 cosmic-title">FutureSeer</h1>
          <p className="text-xl md:text-2xl font-light leading-relaxed text-slate-200 max-w-2xl mx-auto cosmic-subtitle">
            Unveil the mysteries of your destiny through ancient wisdom and AI insight
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-6 mb-20">
          <Link
            href="/ask"
            className="group px-8 py-4 glassmorphic-button primary-cta rounded-2xl font-medium text-lg transition-all duration-300 hover:scale-105 flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            Ask the Seer
          </Link>
          <Link
            href="/subscribe"
            className="group px-8 py-4 secondary-cta rounded-2xl font-medium text-lg transition-all duration-300 hover:scale-105 flex items-center gap-3"
          >
            <Moon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            Begin Your Trial
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl">
          {[
            { icon: Compass, label: "18 Divination Tools", description: "Ancient systems" },
            { icon: Brain, label: "AI-Powered Insights", description: "Modern wisdom" },
            { icon: Moon, label: "Daily Guidance", description: "Celestial timing" },
            { icon: Sparkles, label: "Sacred Remedies", description: "Healing practices" },
          ].map((feature, i) => (
            <div key={i} className="text-center feature-card group">
              <div className="mb-4 flex justify-center">
                <feature.icon className="w-8 h-8 text-amber-300 group-hover:text-amber-200 transition-colors duration-300 group-hover:scale-110 transform transition-transform" />
              </div>
              <h3 className="text-slate-200 font-medium mb-2 text-sm leading-tight">{feature.label}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
