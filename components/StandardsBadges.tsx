"use client";

import React, { useState } from 'react';
import { STANDARDS_CONFIG, getCategoryStandards, getAllCategoryStandards } from '@/lib/standardsConfig';
import { CheckCircle2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { toolManager } from '@/lib/services/toolManager';

interface StandardsBadgesProps {
  variant?: 'compact' | 'detailed' | 'footer';
  showToolCount?: boolean;
}

export function StandardsBadges({ variant = 'compact', showToolCount = true }: StandardsBadgesProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const categories = getAllCategoryStandards();
  const global = STANDARDS_CONFIG.global;

  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    'Astrology': '⭐',
    'Numerology': '🔢',
    'Divination': '🔮',
    'Reading': '📖',
    'Chinese': '🐉',
    'Indian': '🕉️',
    'Energy': '✨',
    'Analysis': '🔍'
  };

  // Category colors - using deep blue tones instead of purple
  const categoryColors: Record<string, string> = {
    'Astrology': 'from-blue-900/20 to-blue-800/20 border-blue-700/30',
    'Numerology': 'from-blue-800/20 to-blue-700/20 border-blue-600/30',
    'Divination': 'from-blue-900/20 to-blue-800/20 border-blue-700/30',
    'Reading': 'from-green-500/20 to-emerald-600/20 border-green-500/30',
    'Chinese': 'from-red-500/20 to-orange-600/20 border-red-500/30',
    'Indian': 'from-orange-500/20 to-yellow-600/20 border-orange-500/30',
    'Energy': 'from-blue-900/20 to-blue-800/20 border-blue-700/30',
    'Analysis': 'from-orange-500/20 to-red-600/20 border-orange-500/30'
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  // Compact variant for footer
  if (variant === 'footer') {
    return (
      <div className="flex flex-wrap gap-3 items-center justify-center">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-white font-light">Swiss Ephemeris</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-700/30">
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-white font-light">NASA JPL Validated</span>
        </div>
        {showToolCount && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-700/30">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-white font-light">{global.totalTools}+ Tools</span>
          </div>
        )}
      </div>
    );
  }

  // Compact variant (default)
  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Global Standards */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-semibold text-white">Swiss Ephemeris</h4>
          </div>
          <p className="text-xs text-slate-300 font-light leading-relaxed">
            {global.swissEphemeris}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
            <h4 className="text-sm font-semibold text-white">NASA Validated</h4>
          </div>
          <p className="text-xs text-slate-300 font-light leading-relaxed">
            {global.nasaValidation}
          </p>
        </div>

        {showToolCount && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">{global.totalTools}+ Tools</h4>
            </div>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              {global.traditionalMethods}
            </p>
          </div>
        )}

        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h4 className="text-sm font-semibold text-white">Traditional</h4>
          </div>
          <p className="text-xs text-slate-300 font-light leading-relaxed">
            Time-tested methods
          </p>
        </div>
      </div>
    );
  }

  // Detailed variant with all categories
  return (
    <div className="space-y-4">
      {/* Global Standards Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0a1128] via-[#0d1b35] to-[#0a1128] border border-amber-500/30 backdrop-blur-xl">
        <h3 className="text-xl font-serif text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-amber-400" />
          Global Standards & Validation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-300 mb-1">Swiss Ephemeris</p>
            <p className="text-xs text-slate-300 font-light">{global.swissEphemeris}</p>
            {global.astronomicalAccuracy && (
              <p className="text-xs text-slate-400 mt-1">{global.astronomicalAccuracy}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-300 mb-1">NASA Validation</p>
            <p className="text-xs text-slate-300 font-light">{global.nasaValidation}</p>
          </div>
        </div>
      </div>

      {/* Category Standards */}
      <div className="space-y-3">
        <h3 className="text-lg font-serif text-white mb-4">Category Standards</h3>
        {Object.entries(categories).map(([categoryName, standard]) => {
          const isExpanded = expandedCategory === categoryName;
          const toolConfigs = standard.tools.map(slug => toolManager.getTool(slug)).filter(Boolean);
          
          return (
            <div
              key={categoryName}
              className={`rounded-xl bg-gradient-to-br ${categoryColors[categoryName] || 'from-slate-500/20 to-slate-600/20 border-slate-500/30'} backdrop-blur-sm border overflow-hidden transition-all duration-300`}
            >
              <button
                onClick={() => toggleCategory(categoryName)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{categoryIcons[categoryName] || '✨'}</span>
                  <div>
                    <h4 className="text-base font-semibold text-white">{categoryName}</h4>
                    <p className="text-xs text-slate-300 font-light mt-0.5">
                      {standard.standard}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {standard.tools.length} {standard.tools.length === 1 ? 'tool' : 'tools'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-white/10 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-amber-300 mb-1">Standard</p>
                      <p className="text-xs text-slate-300 font-light leading-relaxed">
                        {standard.standard}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-300 mb-1">Validation</p>
                      <p className="text-xs text-slate-300 font-light leading-relaxed">
                        {standard.validation}
                      </p>
                    </div>
                  </div>
                  
                  {standard.traditionalRef && (
                    <div>
                      <p className="text-xs font-semibold text-purple-300 mb-1">Traditional Reference</p>
                      <p className="text-xs text-slate-300 font-light leading-relaxed">
                        {standard.traditionalRef}
                      </p>
                    </div>
                  )}

                  {standard.precision && (
                    <div>
                      <p className="text-xs font-semibold text-green-300 mb-1">Precision</p>
                      <p className="text-xs text-slate-300 font-light">{standard.precision}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-white mb-2">Tools in this category:</p>
                    <div className="flex flex-wrap gap-2">
                      {toolConfigs.map((tool) => (
                        <span
                          key={tool?.slug}
                          className="px-2 py-1 rounded-md bg-white/5 text-xs text-slate-300 border border-white/10"
                        >
                          {tool?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}