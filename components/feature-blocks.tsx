import { Brain, Sparkles, Zap } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Scientific Precision",
    description: "Advanced AI algorithms analyze patterns with mathematical accuracy",
  },
  {
    icon: Sparkles,
    title: "Symbolic Wisdom",
    description: "Ancient divination systems interpreted through modern intelligence",
  },
  {
    icon: Zap,
    title: "Unified AI Insight",
    description: "Multiple mystical traditions synthesized into personalized guidance",
  },
]

export function FeatureBlocks() {
  return (
    <section className="pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl backdrop-blur-sm bg-slate-900/30 border border-slate-700/50 hover:border-amber-500/50 transition-all duration-500 hover:bg-slate-800/40"
            >
              {/* Glowing ring effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

              <div className="relative z-10 text-center space-y-4">
                {/* Icon with glow */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 group-hover:border-amber-400/60 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-amber-400 group-hover:text-amber-300 transition-colors duration-300" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-serif text-amber-200 group-hover:text-amber-100 transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 