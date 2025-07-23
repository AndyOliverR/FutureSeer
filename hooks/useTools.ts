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
      description: "Krishnamurti Paddhati system",
      isComingSoon: true
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
      description: "Answer specific questions with timing",
      isComingSoon: true
    },
    { 
      name: "Bazi", 
      icon: "🐉", 
      slug: "bazi",
      category: "Chinese",
      description: "Four Pillars of Destiny",
      isComingSoon: true
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
      description: "Hebrew mystical number meanings",
      isComingSoon: true
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
      description: "36-card fortune telling system",
      isComingSoon: true
    },
    { 
      name: "Runes", 
      icon: "ᚱ", 
      slug: "runes",
      category: "Divination",
      description: "Ancient Norse alphabet divination",
      isComingSoon: true
    },
    { 
      name: "I Ching", 
      icon: "☯️", 
      slug: "iching",
      category: "Divination",
      description: "Chinese Book of Changes"
    },
    { 
      name: "Geomancy", 
      icon: "🌍", 
      slug: "geomancy",
      category: "Divination",
      description: "Medieval earth divination system",
      isPremium: true
    },
    { 
      name: "Pendulum", 
      icon: "🔮", 
      slug: "pendulum",
      category: "Divination",
      description: "Dowsing and energy detection",
      isComingSoon: true
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
      description: "Dream interpretation and symbols",
      isComingSoon: true
    },
    { 
      name: "Vastu", 
      icon: "🏠", 
      slug: "vastu",
      category: "Analysis",
      description: "Indian architectural energy system"
    },
    { 
      name: "AstroScribe", 
      icon: "✍️", 
      slug: "astroscribe",
      category: "Analysis",
      description: "AI-powered astrological interpretation",
      isPremium: true
    },
  ];

  const categories = useMemo(() => {
    const cats = ["all", ...Array.from(new Set(tools.map(tool => tool.category)))];
    return cats;
  }, []);

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [tools, selectedCategory, searchTerm]);

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

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      "Astrology": "⭐",
      "Numerology": "🔢",
      "Divination": "🔮",
      "Reading": "📖",
      "Analysis": "🔍",
      "Chinese": "🐉",
    };
    return icons[category] || "✨";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Astrology": "from-purple-500/20 to-purple-600/20",
      "Numerology": "from-blue-500/20 to-blue-600/20",
      "Divination": "from-pink-500/20 to-pink-600/20",
      "Reading": "from-green-500/20 to-green-600/20",
      "Analysis": "from-yellow-500/20 to-yellow-600/20",
      "Chinese": "from-red-500/20 to-red-600/20",
    };
    return colors[category] || "from-gray-500/20 to-gray-600/20";
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