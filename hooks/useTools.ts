import { useState, useMemo } from 'react';

export interface Tool {
  name: string;
  icon: string;
  slug: string;
  category: string;
  description: string;
  isPremium?: boolean;
  isComingSoon?: boolean;
}

export function useTools() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const tools: Tool[] = [
    // Astrological Tools
    { 
      name: "Vedic Astrology", 
      icon: "🕉️", 
      slug: "vedic-astrology",
      category: "Astrology",
      description: "Ancient Indian astrological system",
      isPremium: true
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
      name: "Hellenistic Astrology", 
      icon: "🏛️", 
      slug: "hellenistic-astrology",
      category: "Astrology",
      description: "Ancient Greek astrological traditions",
      isPremium: true
    },
    { 
      name: "13 Signs Zodiac", 
      icon: "🐍", 
      slug: "13-signs-zodiac",
      category: "Astrology",
      description: "Includes Ophiuchus for modern accuracy",
      isPremium: true
    },
    { 
      name: "Synastry", 
      icon: "💕", 
      slug: "synastry",
      category: "Astrology",
      description: "Relationship compatibility analysis",
      isPremium: true
    },
    { 
      name: "Financial Astrology", 
      icon: "💰", 
      slug: "financial-astrology",
      category: "Astrology",
      description: "Market timing and investment guidance",
      isPremium: true
    },
    { 
      name: "Medical Astrology", 
      icon: "🏥", 
      slug: "medical-astrology",
      category: "Astrology",
      description: "Health predictions and medical timing",
      isPremium: true
    },
    { 
      name: "Mundane Astrology", 
      icon: "🌍", 
      slug: "mundane-astrology",
      category: "Astrology",
      description: "World events and global predictions",
      isPremium: true
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
      slug: "iching",
      category: "Divination",
      description: "Chinese Book of Changes"
    },
    { 
      name: "Pendulum", 
      icon: "⏳", 
      slug: "pendulum",
      category: "Divination",
      description: "Dowsing and energy detection"
    },
    { 
      name: "Geomancy", 
      icon: "🌍", 
      slug: "geomancy",
      category: "Divination",
      description: "Earth divination system"
    },
    
    // Reading Tools
    { 
      name: "Palmistry", 
      icon: "🤲", 
      slug: "palmistry",
      category: "Reading",
      description: "Palm reading and hand analysis"
    },
    { 
      name: "Face Reading", 
      icon: "👤", 
      slug: "face-reading",
      category: "Reading",
      description: "Physiognomy and facial analysis"
    },
    { 
      name: "Name Analysis", 
      icon: "📝", 
      slug: "name-analysis",
      category: "Reading",
      description: "Numerological name interpretation"
    },
    { 
      name: "Dream Symbols", 
      icon: "💭", 
      slug: "dream-symbols",
      category: "Reading",
      description: "Dream interpretation and symbolism"
    },
    
    // Analysis Tools
    { 
      name: "Vastu", 
      icon: "🏠", 
      slug: "vastu",
      category: "Analysis",
      description: "Space harmony and architecture"
    }
  ];

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    let filtered = tools;
    
    if (searchTerm) {
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }
    
    return filtered;
  }, [tools, searchTerm, selectedCategory]);

  // Group tools by category
  const toolsByCategory = useMemo(() => {
    const grouped = tools.reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    }, {} as Record<string, Tool[]>);
    
    return grouped;
  }, [tools]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(tools.map(tool => tool.category))];
    return ["all", ...cats];
  }, [tools]);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      "Astrology": "⭐",
      "Numerology": "🔢", 
      "Divination": "🔮",
      "Reading": "📖",
      "Analysis": "🔍",
      "Chinese": "🐉"
    };
    return icons[category] || "✨";
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Astrology": "from-purple-500 to-blue-600",
      "Numerology": "from-cyan-500 to-blue-600",
      "Divination": "from-pink-500 to-purple-600",
      "Reading": "from-green-500 to-emerald-600",
      "Analysis": "from-orange-500 to-red-600",
      "Chinese": "from-red-500 to-orange-600"
    };
    return colors[category] || "from-gray-500 to-slate-600";
  };

  return {
    tools,
    filteredTools,
    toolsByCategory,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    getCategoryIcon,
    getCategoryColor,
  };
} 