"use client";
import { Brain, Sparkles, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Brain,
    title: "See Into Your Future",
    description: "Occult wisdom combined with AI forecasting reveals hidden patterns and genuine glimpses into what lies ahead",
  },
  {
    icon: Sparkles,
    title: "Hidden Data Patterns",
    description: "Predictive analytics powered by ancient divination systems and time series forecasting",
  },
  {
    icon: Zap,
    title: "Innovation Experiment",
    description: "Join as a power user. Your usage improves accuracy and precision for everyone. Join the experiment today.",
  },
]

export function FeatureBlocks() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-transparent" aria-labelledby="features-heading">
      <h2 id="features-heading" className="sr-only">Features</h2>
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="group relative p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-500 hover:bg-white/10 hover:border-amber-500/40 hover:shadow-[0_0_40px_rgba(245,158,11,0.2)] hover:-translate-y-1 cursor-default"
            >
              {/* Internal glow effect on hover */}
              <div className="absolute inset-0 rounded-3xl bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 group-hover:border-amber-500/50 group-hover:scale-110 transition-all duration-500">
                  <feature.icon className="w-8 h-8 text-amber-500 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-all" />
                </div>
                <h3 className="text-xl font-heading text-white group-hover:text-amber-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-light group-hover:text-white transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Why FutureSeer */}
        <motion.div
          className="mt-16 max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-heading text-amber-400 mb-8 uppercase tracking-widest">
            Why FutureSeer
          </h3>
          <ul className="space-y-4 text-left">
            {[
              "You're facing confusion from fragmented divination tools and conflicting interpretations.",
              "FutureSeer unifies 40+ occult systems into one structured platform.",
              "Our synthesis engine correlates multiple outputs into a single coherent insight.",
              "Continuous refinement ensures methodological consistency and increasing precision.",
            ].map((text, i) => (
              <li key={i} className="flex gap-3 items-start group/item">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 group-hover/item:scale-125 transition-transform" />
                <span className="text-slate-300 text-sm leading-relaxed group-hover/item:text-white transition-colors">{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
