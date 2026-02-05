import { useState, useMemo } from 'react';
import { toolManager } from '@/lib/services/toolManager';
import { ToolConfig } from '@/lib/types/toolSchemas';
import { getToolIntroduction } from '@/lib/data/toolIntroductions';

// Keep the existing Tool interface for backward compatibility
export interface Tool {
  name: string;
  icon: string;
  slug: string;
  category: string;
  description: string;
  isPremium?: boolean;
  isComingSoon?: boolean;
  longDescription?: string;
  features?: string[];
  quote?: string;
}

export function useTools() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Convert ToolConfig to Tool interface for backward compatibility
  const tools: Tool[] = useMemo(() => {
    const allTools = toolManager.getAllTools()
      .filter((config) => {
        // Hide tools that redirect to another tool or are marked to hide
        if (config.redirectTo || config.hideFromMainList) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by popularity score (descending) - highest first
        const scoreA = a.popularityScore ?? 0;
        const scoreB = b.popularityScore ?? 0;
        return scoreB - scoreA;
      })
      .map((config): Tool => {
        const intro = getToolIntroduction(config.slug);
        return {
          name: config.name,
          icon: config.icon,
          slug: config.slug,
          category: config.category,
          description: config.description,
          isPremium: config.isPremium,
          isComingSoon: config.isComingSoon,
          longDescription: intro?.overview,
          features: intro?.keyConcepts,
          quote: undefined
        };
      });
    
    // Remove duplicates by slug (safety check)
    const seen = new Set<string>();
    return allTools.filter((tool) => {
      if (seen.has(tool.slug)) {
        console.warn(`Duplicate tool found: ${tool.slug} - ${tool.name}`);
        return false;
      }
      seen.add(tool.slug);
      return true;
    });
  }, []);

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
    
    // Sort tools within each category by popularity (tools are already sorted globally)
    Object.keys(grouped).forEach(category => {
      // Tools are already sorted by popularity, so categories maintain that order
    });
    
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
      "Chinese": "🐉",
      "Indian": "🕉️",
      "Energy": "✨"
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
      "Chinese": "from-red-500 to-orange-600",
      "Indian": "from-orange-500 to-yellow-600",
      "Energy": "from-indigo-500 to-purple-600"
    };
    return colors[category] || "from-gray-500 to-slate-600";
  };

  // New enhanced functions using toolManager
  const getToolConfig = (slug: string): ToolConfig | undefined => {
    return toolManager.getTool(slug);
  };

  const validateToolRequirements = (slug: string, userData: any) => {
    return toolManager.validateToolRequirements(slug, userData);
  };

  const getToolEndpoint = (slug: string): string | null => {
    return toolManager.getToolEndpoint(slug);
  };

  const getToolAnalysisTime = (slug: string): number => {
    return toolManager.getToolAnalysisTime(slug);
  };

  const getToolsCount = (): number => {
    return toolManager.getToolsCount();
  };

  const getPremiumToolsCount = (): number => {
    return toolManager.getPremiumToolsCount();
  };

  const searchToolsAdvanced = (query: string): ToolConfig[] => {
    return toolManager.searchTools(query);
  };

  return {
    // Existing properties for backward compatibility
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
    
    // New enhanced functions
    getToolConfig,
    validateToolRequirements,
    getToolEndpoint,
    getToolAnalysisTime,
    getToolsCount,
    getPremiumToolsCount,
    searchToolsAdvanced,
    
    // Tool manager instance for advanced usage
    toolManager
  };
} 