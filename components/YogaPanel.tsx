"use client";

import React, { useState, useMemo } from 'react';
import { devLog } from '@/lib/devLogger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  Star,
  ChevronDown,
  ChevronRight,
  Info,
  Calendar,
  TrendingUp,
  Zap,
  Target,
  Sparkles
} from 'lucide-react';
import { Yoga } from '@/lib/enhancedYogaDetection';
import { getYogaSignificance, getYogaEffects } from '@/lib/yogaDetection';
import { 
  calculateYogaTiming, 
  formatActivationDate, 
  getActivationStatusColor, 
  getActivationStatusBadge,
  type YogaTiming,
  type DashaData,
  type TransitData,
  type BirthData
} from '@/lib/yogaTiming';
import { generateYogaRemedies, type PersonalizedYogaRemedy } from '@/lib/yogaRemedyGenerator';

interface YogaPanelProps {
  yogas: Yoga[];
  dashaData?: DashaData;
  transitData?: TransitData;
  birthData?: BirthData;
  className?: string;
}

function isInGoldenPeriod(_date: Date): boolean {
  return false;
}

export function YogaPanel({ yogas, dashaData, transitData, birthData, className = "" }: YogaPanelProps) {
  
  // State for expanded yoga cards
  const [expandedYogas, setExpandedYogas] = useState<Set<string>>(new Set());

  // Toggle expanded state for a yoga
  const toggleExpanded = (yogaName: string) => {
    setExpandedYogas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(yogaName)) {
        newSet.delete(yogaName);
      } else {
        newSet.add(yogaName);
      }
      return newSet;
    });
  };

  // Group yogas by type - memoized to prevent recalculation
  const groupedYogas = useMemo(() => {
    return yogas.reduce((acc, yoga) => {
      if (!acc[yoga.type]) {
        acc[yoga.type] = [];
      }
      acc[yoga.type].push(yoga);
      return acc;
    }, {} as Record<string, Yoga[]>);
  }, [yogas]);

  // Get unique yoga types that actually exist
  const existingYogaTypes = useMemo(() => {
    const types = new Set(yogas.map(y => y.type));
    return Array.from(types);
  }, [yogas]);
  
  const getYogaIcon = (type: string) => {
    switch (type) {
      case 'Raj Yoga': return Crown;
      case 'Dhana Yoga': return DollarSign;
      case 'Kala Yoga': return Clock;
      case 'Arishta Yoga': return AlertTriangle;
      case 'Special': return Star;
      default: return Star;
    }
  };
  
  const getYogaColor = (type: string) => {
    switch (type) {
      case 'Raj Yoga': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'Dhana Yoga': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'Kala Yoga': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'Arishta Yoga': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'Special': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };
  
  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Very Strong': return 'text-green-400 bg-green-500/20';
      case 'Strong': return 'text-blue-400 bg-blue-500/20';
      case 'Moderate': return 'text-yellow-400 bg-yellow-500/20';
      case 'Weak': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };
  
  // Pre-calculate all yoga timings - memoized to prevent recalculation
  const yogaTimings = useMemo(() => {
    if (!dashaData || !birthData) return new Map<string, YogaTiming | null>();
    
    const timings = new Map<string, YogaTiming | null>();
    yogas.forEach(yoga => {
      try {
        timings.set(yoga.name, calculateYogaTiming(yoga, dashaData, transitData || {}, birthData));
      } catch (error) {
        devLog.error('Error calculating yoga timing', { yoga: yoga.name, error }, 'YogaPanel');
        timings.set(yoga.name, null);
      }
    });
    return timings;
  }, [yogas, dashaData, transitData, birthData]);

  // Get timing for a specific yoga
  const getYogaTiming = (yoga: Yoga): YogaTiming | null => {
    return yogaTimings.get(yoga.name) || null;
  };

  // Pre-calculate all yoga remedies - memoized to prevent recalculation
  const yogaRemedies = useMemo(() => {
    const remediesMap = new Map<string, PersonalizedYogaRemedy>();
    yogas.forEach(yoga => {
      try {
        remediesMap.set(yoga.name, generateYogaRemedies(yoga));
      } catch (error) {
        devLog.error('Error generating remedies', { yoga: yoga.name, error }, 'YogaPanel');
      }
    });
    return remediesMap;
  }, [yogas]);

  // Render remedies for a yoga
  const renderYogaRemedies = (yoga: Yoga) => {
    try {
      const remedies = yogaRemedies.get(yoga.name);
      
      if (!remedies || (!remedies.remedies.mantras.length && !remedies.remedies.gemstones.length)) {
        return null;
      }
      
      return (
        <div className="mt-4 pt-4 border-t border-slate-600 space-y-4">
          <h4 className="font-semibold text-amber-200 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Remedies & Enhancements
          </h4>
          
          {/* Mantras */}
          {remedies.remedies.mantras.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-blue-200">Mantras</h5>
              {remedies.remedies.mantras.slice(0, 2).map((mantra, index) => (
                <div key={index} className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <p className="text-sm font-medium text-blue-200">{mantra.name}</p>
                  <p className="text-xs text-slate-300 mt-1">{mantra.description}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    <strong>Frequency:</strong> {mantra.frequency}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {/* Gemstones */}
          {remedies.remedies.gemstones.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-purple-200">Gemstones</h5>
              {remedies.remedies.gemstones.slice(0, 2).map((gemstone, index) => (
                <div key={index} className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                  <p className="text-sm font-medium text-purple-200">{gemstone.name}</p>
                  <p className="text-xs text-slate-300 mt-1">{gemstone.description}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* Rituals */}
          {remedies.remedies.rituals.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-green-200">Rituals & Practices</h5>
              {remedies.remedies.rituals.slice(0, 2).map((ritual, index) => (
                <div key={index} className="p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                  <p className="text-sm font-medium text-green-200">{ritual.name}</p>
                  <p className="text-xs text-slate-300 mt-1">{ritual.description}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    <strong>Frequency:</strong> {ritual.frequency}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {/* Lifestyle */}
          {remedies.remedies.lifestyle.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-amber-200">Lifestyle Recommendations</h5>
              <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-500/30">
                <ul className="space-y-1">
                  {remedies.remedies.lifestyle.slice(0, 3).map((lifestyle, index) => (
                    <li key={index} className="text-xs text-slate-300 flex items-center gap-2">
                      <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                      {lifestyle.name}: {lifestyle.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Timing */}
          {remedies.timing && (
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600">
              <p className="text-xs text-slate-300">
                <strong className="text-amber-200">Best Timing:</strong> {remedies.timing}
              </p>
            </div>
          )}
        </div>
      );
    } catch (error) {
      devLog.error('Error rendering yoga remedies:', error, 'YogaPanel');
      return null;
    }
  };

  // Render timing information for a yoga
  const renderYogaTiming = (yoga: Yoga, timing: YogaTiming) => {
    return (
      <div className="mt-4 pt-4 border-t border-slate-600 space-y-4">
        {/* Activation Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge 
              className={`${
                timing.isActiveNow 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }`}
            >
              {timing.isActiveNow ? '● Active Now' : '○ Inactive'}
            </Badge>
            <Badge className={getActivationStatusColor(timing.activationScore)}>
              {timing.activationScore}% Activated
            </Badge>
          </div>
          <div className="text-sm text-slate-400">
            {getActivationStatusBadge(timing.activationScore, timing.isActiveNow)}
          </div>
        </div>

        {/* Activation Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Current Activation</span>
            <span className={getActivationStatusColor(timing.activationScore)}>
              {timing.activationScore}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                timing.activationScore >= 80 ? 'bg-green-500' :
                timing.activationScore >= 60 ? 'bg-yellow-500' :
                timing.activationScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${timing.activationScore}%` }}
            />
          </div>
        </div>

        {/* Current Status */}
        {timing.currentStatus && (
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-200">Current Status</span>
            </div>
            <p className="text-sm text-slate-300">{timing.currentStatus}</p>
            {timing.currentPeriod && (
              <p className="text-xs text-slate-400 mt-1">
                Active Period: {timing.currentPeriod}
              </p>
            )}
          </div>
        )}

        {/* Active Periods */}
        {timing.activationPeriods.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-200">Activation History</span>
            </div>
            <div className="space-y-2">
              {timing.activationPeriods.map((period, index) => {
                const startDate = new Date(period.startDate);
                const endDate = new Date(period.endDate);
                const isGolden = isInGoldenPeriod(startDate) || isInGoldenPeriod(endDate);
                
                return (
                  <div key={index} className={`p-3 rounded-lg border ${
                    isGolden 
                      ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-2 border-amber-400' 
                      : 'bg-slate-800/30 border-slate-600'
                  }`}>
                    {isGolden && (
                      <Badge className="mb-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900">
                        ⭐ Golden Period
                      </Badge>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          period.strength === 'very_strong' ? 'bg-green-400' :
                          period.strength === 'strong' ? 'bg-blue-400' :
                          period.strength === 'moderate' ? 'bg-yellow-400' : 'bg-gray-400'
                        }`} />
                        <span className="text-sm text-white font-medium">{period.planet} {period.type}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatActivationDate(period.startDate)} - {formatActivationDate(period.endDate)}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-300">
                      Strength: {period.strength.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Activations */}
        {timing.upcomingActivations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-200">Upcoming Activations</span>
            </div>
            <div className="space-y-2">
              {timing.upcomingActivations.slice(0, 2).map((activation, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                  <div>
                    <p className="text-sm text-white">{activation.description}</p>
                    <p className="text-xs text-slate-400">{activation.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-300">{formatActivationDate(activation.date)}</p>
                    <p className="text-xs text-slate-400">{activation.strength}% strength</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Activation */}
        {timing.nextActivation && (
          <div className="p-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-200">Next Major Activation</span>
            </div>
            <p className="text-sm text-white">
              {formatActivationDate(timing.nextActivation.toISOString())}
            </p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-200">
            <Star className="h-5 w-5" />
            Vedic Yogas ({yogas.length} Found)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 text-sm">
            Classical Vedic astrological combinations that influence your life path and destiny.
          </p>
        </CardContent>
      </Card>
      
      {/* Yoga Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className={`grid w-full grid-cols-${Math.min(existingYogaTypes.length + 1, 5)} bg-slate-800/50`}>
          <TabsTrigger value="all" className="text-slate-300">All ({yogas.length})</TabsTrigger>
          {existingYogaTypes.includes('Raj Yoga') && (
            <TabsTrigger value="Raj Yoga" className="text-yellow-400">Raj ({groupedYogas['Raj Yoga']?.length || 0})</TabsTrigger>
          )}
          {existingYogaTypes.includes('Dhana Yoga') && (
            <TabsTrigger value="Dhana Yoga" className="text-green-400">Dhana ({groupedYogas['Dhana Yoga']?.length || 0})</TabsTrigger>
          )}
          {existingYogaTypes.includes('Kala Yoga') && (
            <TabsTrigger value="Kala Yoga" className="text-blue-400">Kala ({groupedYogas['Kala Yoga']?.length || 0})</TabsTrigger>
          )}
          {existingYogaTypes.includes('Arishta Yoga') && (
            <TabsTrigger value="Arishta Yoga" className="text-red-400">Arishta ({groupedYogas['Arishta Yoga']?.length || 0})</TabsTrigger>
          )}
        </TabsList>
        
        {/* All Yogas */}
        <TabsContent value="all" className="space-y-4">
          {Object.entries(groupedYogas).map(([type, typeYogas]) => {
            const Icon = getYogaIcon(type);
            return (
              <Card key={type} className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-200">
                    <Icon className="h-5 w-5" />
                    {type} ({typeYogas.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {typeYogas.map((yoga) => (
                    <div key={yoga.name} className="border border-slate-600 rounded-lg p-6 bg-slate-800/50">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="font-semibold text-amber-200 text-lg">{yoga.name}</h3>
                        <Badge className={getYogaColor(yoga.type)}>
                          {yoga.type}
                        </Badge>
                        <Badge className={getStrengthColor(yoga.strength)}>
                          {yoga.strength}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-300 mb-3">{yoga.description}</p>
                      <p className="text-xs text-slate-400 mb-4">
                        <Info className="h-3 w-3 inline mr-1" />
                        {yoga.condition}
                      </p>
                      
                      {/* Effects Section - Always Visible */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-amber-200 mb-3">Effects:</h4>
                        <ul className="space-y-2">
                          {yoga.effects.map((effect, index) => (
                            <li key={index} className="text-sm text-slate-300 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                              {effect}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Timing Information - Always Visible */}
                      {(() => {
                        const timing = getYogaTiming(yoga);
                        return timing ? renderYogaTiming(yoga, timing) : (
                          <div className="mt-4 pt-4 border-t border-slate-600">
                            <p className="text-sm text-slate-400">Timing information not available</p>
                          </div>
                        );
                      })()}

                      {/* Remedies Section - Always Visible */}
                      {renderYogaRemedies(yoga)}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
        
        {/* Individual Yoga Type Tabs */}
        {Object.entries(groupedYogas).map(([type, typeYogas]) => {
          const Icon = getYogaIcon(type);
          return (
            <TabsContent key={type} value={type} className="space-y-4">
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-200">
                    <Icon className="h-5 w-5" />
                    {type} Yogas ({typeYogas.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {typeYogas.map((yoga) => (
                    <div key={yoga.name} className="border border-slate-600 rounded-lg p-6 bg-slate-800/50">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="font-semibold text-amber-200 text-lg">{yoga.name}</h3>
                        <Badge className={getYogaColor(yoga.type)}>
                          {yoga.type}
                        </Badge>
                        <Badge className={getStrengthColor(yoga.strength)}>
                          {yoga.strength}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-300 mb-3">{yoga.description}</p>
                      <p className="text-xs text-slate-400 mb-4">
                        <Info className="h-3 w-3 inline mr-1" />
                        {yoga.condition}
                      </p>
                      
                      {/* Effects Section - Always Visible */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-amber-200 mb-3">Effects:</h4>
                        <ul className="space-y-2">
                          {yoga.effects.map((effect, index) => (
                            <li key={index} className="text-sm text-slate-300 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                              {effect}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Timing Information - Always Visible */}
                      {(() => {
                        const timing = getYogaTiming(yoga);
                        return timing ? renderYogaTiming(yoga, timing) : (
                          <div className="mt-4 pt-4 border-t border-slate-600">
                            <p className="text-sm text-slate-400">Timing information not available</p>
                          </div>
                        );
                      })()}

                      {/* Remedies Section - Always Visible */}
                      {renderYogaRemedies(yoga)}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
      
      {/* Summary */}
      {yogas.length === 0 && (
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Star className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-200 mb-2">No Major Yogas Found</h3>
            <p className="text-slate-300">
              Your chart doesn't show any major classical Yogas, which indicates a balanced and neutral influence.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
