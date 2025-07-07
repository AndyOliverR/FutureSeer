import Link from "next/link"

export default function ToolsPage() {
  const tools = [
    // Astrological Tools
    { 
      name: "Vedic Astrology", 
      icon: "🕉️", 
      slug: "vedic-astrology",
      category: "Astrology",
      description: "Ancient Indian astrological system"
    },
    { 
      name: "KP Astrology", 
      icon: "⭐", 
      slug: "kp-astrology",
      category: "Astrology", 
      description: "Krishnamurti Paddhati system"
    },
    { 
      name: "Western Astrology", 
      icon: "♈", 
      slug: "western-astrology",
      category: "Astrology",
      description: "Traditional Western zodiac system"
    },
    { 
      name: "Horary Astrology", 
      icon: "⏰", 
      slug: "horary",
      category: "Astrology",
      description: "Answer specific questions with timing"
    },
    { 
      name: "Bazi", 
      icon: "🐉", 
      slug: "bazi",
      category: "Chinese",
      description: "Four Pillars of Destiny"
    },
    
    // Numerology Tools
    { 
      name: "Chaldean Numerology", 
      icon: "🔢", 
      slug: "chaldean-numerology",
      category: "Numerology",
      description: "Ancient Babylonian number system"
    },
    { 
      name: "Kabbalistic Numerology", 
      icon: "✡️", 
      slug: "kabbalistic-numerology",
      category: "Numerology",
      description: "Hebrew mystical number meanings"
    },
    { 
      name: "Angel Numbers", 
      icon: "👼", 
      slug: "angel-numbers",
      category: "Numerology",
      description: "Divine numerical messages"
    },
    
    // Divination Tools
    { 
      name: "Tarot", 
      icon: "🃏", 
      slug: "tarot",
      category: "Divination",
      description: "78-card mystical deck system"
    },
    { 
      name: "Lenormand", 
      icon: "🌸", 
      slug: "lenormand",
      category: "Divination",
      description: "36-card fortune telling system"
    },
    { 
      name: "Runes", 
      icon: "ᚱ", 
      slug: "runes",
      category: "Divination",
      description: "Ancient Norse alphabet divination"
    },
    { 
      name: "I Ching", 
      icon: "☯️", 
      slug: "i-ching",
      category: "Divination",
      description: "Chinese Book of Changes"
    },
    { 
      name: "Pendulum", 
      icon: "🔮", 
      slug: "pendulum",
      category: "Divination",
      description: "Dowsing and energy detection"
    },
    
    // Reading Tools
    { 
      name: "Palmistry", 
      icon: "✋", 
      slug: "palmistry",
      category: "Reading",
      description: "Palm reading and lifeline analysis"
    },
    { 
      name: "Face Reading", 
      icon: "👤", 
      slug: "face-reading",
      category: "Reading",
      description: "Physiognomy and facial features"
    },
    
    // Specialized Tools
    { 
      name: "Name Analysis", 
      icon: "📝", 
      slug: "name-analysis",
      category: "Analysis",
      description: "Numerological name interpretation"
    },
    { 
      name: "Dream Symbols", 
      icon: "💭", 
      slug: "dream-symbols",
      category: "Analysis",
      description: "Dream interpretation and symbols"
    },
    { 
      name: "Vastu", 
      icon: "🏠", 
      slug: "vastu",
      category: "Analysis",
      description: "Indian architectural energy system"
    },
  ]

  const categories = ["Astrology", "Numerology", "Divination", "Reading", "Analysis"]

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <Link href="/" className="text-soft hover:gold-glow mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-semibold gold-glow mb-4">Divination Tools</h1>
          <p className="text-soft leading-relaxed">Choose your path to cosmic wisdom</p>
        </div>

        {/* Tools by Category */}
        {categories.map((category) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl gold-glow mb-6 text-center">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools
                .filter((tool) => tool.category === category)
                .map((tool, i) => (
                  <Link key={i} href={`/tools/${tool.slug}`}>
                    <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
                      <div className="text-center">
                        <div className="text-3xl mb-4">{tool.icon}</div>
                        <h3 className="text-soft font-medium mb-2">{tool.name}</h3>
                        <p className="text-soft/70 text-sm mb-3">{tool.description}</p>
                        <div className="text-yellow-400 text-xs">Explore →</div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        ))}

        {/* Quick Access */}
        <div className="glass-card rounded-3xl p-8 text-center">
          <h3 className="text-xl gold-glow mb-4">Need Quick Guidance?</h3>
          <p className="text-soft/70 mb-6">Get instant insights with our AI-powered Ask the Seer feature</p>
          <Link
            href="/ask"
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-2xl font-semibold hover:scale-105 transition-transform inline-block"
          >
            🔮 Ask the Seer
          </Link>
        </div>
      </div>
    </div>
  )
}
