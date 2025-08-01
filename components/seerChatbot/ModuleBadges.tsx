"use client";

interface ModuleBadgesProps {
  sources: string[];
  maxDisplay?: number;
}

export function ModuleBadges({ sources, maxDisplay = 3 }: ModuleBadgesProps) {
  const displaySources = sources.slice(0, maxDisplay);
  const remainingCount = sources.length - maxDisplay;
  
  // Module icon mapping
  const getModuleIcon = (moduleName: string) => {
    const iconMap: Record<string, string> = {
      'VimshottariDasha': '⏰',
      'TransitSummary': '🌌',
      'RajYogaTiming': '👑',
      'ChandraLagnaMoonWindows': '🌙',
      'NumerologyMoneyCycle': '🔢',
      'StrengthYogas': '💪',
      'NatalComposite': '💕',
      'HouseOverlaps': '🏠',
      'ElementalMatch': '🔥',
      'SynastryScores': '⭐',
      'TarotInsight': '🎴',
      'AngelNumbers': '👼'
    };
    
    return iconMap[moduleName] || '🔮';
  };
  
  // Module color mapping
  const getModuleColor = (moduleName: string) => {
    const colorMap: Record<string, string> = {
      'VimshottariDasha': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'TransitSummary': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'RajYogaTiming': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'ChandraLagnaMoonWindows': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'NumerologyMoneyCycle': 'bg-green-500/20 text-green-300 border-green-500/30',
      'StrengthYogas': 'bg-red-500/20 text-red-300 border-red-500/30',
      'NatalComposite': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'HouseOverlaps': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'ElementalMatch': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      'SynastryScores': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'TarotInsight': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      'AngelNumbers': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    };
    
    return colorMap[moduleName] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };
  
  return (
    <div className="flex flex-wrap items-center gap-1">
      {displaySources.map((source, index) => (
        <span
          key={index}
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getModuleColor(source)}`}
          title={source}
        >
          <span className="mr-1">{getModuleIcon(source)}</span>
          {source.replace(/([A-Z])/g, ' $1').trim()}
        </span>
      ))}
      
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-500/30">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
} 