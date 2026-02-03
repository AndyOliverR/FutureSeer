"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard';
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
  Sparkles,
  Gem
} from 'lucide-react';
import { Yoga, getYogaSignificance, getYogaEffects } from '@/lib/enhancedYogaDetection';
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

// Dual terminology mapping for common yogas
const YOGA_SANSKRIT_NAMES: { [key: string]: string } = {
  'Raj Yoga': 'Raja Yoga',
  'Dhana Yoga': 'Dhana Yoga',
  'Gaja Kesari Yoga': 'Gaja Kesari Yoga',
  'Neecha Bhanga Raj Yoga': 'Neecha Bhanga Raja Yoga',
  'Viparita Raja Yoga': 'Viparita Raja Yoga',
  'Pancha Mahapurusha Yoga': 'Pancha Mahapurusha Yoga',
  'Hamsa Yoga': 'Hamsa Yoga',
  'Malavya Yoga': 'Malavya Yoga',
  'Ruchaka Yoga': 'Ruchaka Yoga',
  'Bhadra Yoga': 'Bhadra Yoga',
  'Sasa Yoga': 'Sasa Yoga',
  'Budha Aditya Yoga': 'Budha Aditya Yoga',
  'Chandra Mangala Yoga': 'Chandra Mangala Yoga',
  'Guru Mangala Yoga': 'Guru Mangala Yoga',
  'Adhi Yoga': 'Adhi Yoga',
  'Vasumati Yoga': 'Vasumati Yoga',
  'Amala Yoga': 'Amala Yoga',
  'Parvata Yoga': 'Parvata Yoga',
  'Kahala Yoga': 'Kahala Yoga',
  'Chamara Yoga': 'Chamara Yoga',
  'Sankha Yoga': 'Sankha Yoga',
  'Bheri Yoga': 'Bheri Yoga',
  'Mridanga Yoga': 'Mridanga Yoga',
  'Parijata Yoga': 'Parijata Yoga',
  'Lakshmi Yoga': 'Lakshmi Yoga',
  'Saraswati Yoga': 'Saraswati Yoga',
  'Kemadruma Yoga': 'Kemadruma Yoga',
  'Daridra Yoga': 'Daridra Yoga',
  'Grahan Yoga': 'Grahan Yoga',
  'Kala Sarpa Yoga': 'Kala Sarpa Yoga',
  'Vish Yoga': 'Visha Yoga',
  'Putra Yoga': 'Putra Yoga',
  'Matru Yoga': 'Matru Yoga',
  'Pitru Yoga': 'Pitru Yoga'
};

// Helper function to get dual yoga name
function getDualYogaName(yogaName: string): string {
  const sanskrit = YOGA_SANSKRIT_NAMES[yogaName];
  // If Sanskrit name is the same or not found, just return the original
  if (!sanskrit || sanskrit === yogaName) {
    return yogaName;
  }
  // Return in format: "English (Sanskrit)"
  return `${yogaName} (${sanskrit})`;
}

interface YogaPanelProps {
  yogas: Yoga[];
  dashaData?: DashaData;
  transitData?: TransitData;
  birthData?: BirthData;
  className?: string;
}

export function YogaPanelSimplified({ yogas, dashaData, transitData, birthData, className = "" }: YogaPanelProps) {
  
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
        console.error('❌ Error calculating yoga timing for', yoga.name, ':', error);
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
        console.error('❌ Error generating remedies for', yoga.name, ':', error);
      }
    });
    return remediesMap;
  }, [yogas]);

  // Render remedies for a yoga - simplified
  const renderYogaRemedies = (yoga: Yoga) => {
    try {
      const remedies = yogaRemedies.get(yoga.name);
      
      if (!remedies || (!remedies.remedies.mantras.length && !remedies.remedies.gemstones.length)) {
        return null;
      }
      
      return (
        <div className="mt-4 space-y-3">
          {/* Mantras - Show only first one */}
          {remedies.remedies.mantras.length > 0 && (
            <DevotionistStyleCard
              icon={<Sparkles className="h-4 w-4" />}
              title="Mantra"
              summary={remedies.remedies.mantras[0].description}
              items={[
                { text: `Frequency: ${remedies.remedies.mantras[0].frequency}`, highlight: true }
              ]}
              colorScheme="blue"
            />
          )}
          
          {/* Gemstones - Show only first one */}
          {remedies.remedies.gemstones.length > 0 && (
            <DevotionistStyleCard
              icon={<Gem className="h-4 w-4" />}
              title="Gemstone"
              summary={remedies.remedies.gemstones[0].description}
              colorScheme="purple"
            />
          )}
        </div>
      );
    } catch (error) {
      console.error('Error rendering yoga remedies:', error);
      return null;
    }
  };

  // Render timing information for a yoga - simplified
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

        {/* Active Periods - Simplified */}
        {timing.activationPeriods.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-200">Activation History</span>
            </div>
            <div className="space-y-2">
              {timing.activationPeriods.slice(0, 3).map((period, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      period.strength === 'very_strong' ? 'bg-green-400' :
                      period.strength === 'strong' ? 'bg-blue-400' :
                      period.strength === 'moderate' ? 'bg-yellow-400' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm text-white">{period.planet} {period.type}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatActivationDate(period.startDate)} - {formatActivationDate(period.endDate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (yogas.length === 0) {
    return (
      <DevotionistStyleCard
        icon={<Star className="w-5 h-5" />}
        title="No Yogas Detected"
        summary="No significant yogas were found in your birth chart according to classical Vedic astrology principles."
        colorScheme="amber"
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Card */}
      <DevotionistStyleCard
        icon={<Crown className="h-5 w-5" />}
        title={`Planetary Combinations (${yogas.length} Found)`}
        summary={`Based on classical Vedic astrology calculations, ${yogas.length} significant planetary combination${yogas.length !== 1 ? 's' : ''} ${yogas.length > 0 ? 'have been detected in your birth chart' : 'were detected in your birth chart'}.`}
        colorScheme="amber"
        variant="callout"
      />
      
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
              <div key={type} className="space-y-3">
                <DevotionistStyleCard
                  icon={<Icon className="h-5 w-5" />}
                  title={`${type} (${typeYogas.length})`}
                  summary={`${typeYogas.length} ${type} combination${typeYogas.length !== 1 ? 's' : ''} found in your chart`}
                  colorScheme={type === 'Raj Yoga' ? 'amber' : type === 'Dhana Yoga' ? 'green' : type === 'Kala Yoga' ? 'blue' : type === 'Arishta Yoga' ? 'orange' : 'purple'}
                  variant="callout"
                />
                <div className="space-y-3">
                  {typeYogas.map((yoga, index) => {
                    const timing = getYogaTiming(yoga);
                    const isExpanded = expandedYogas.has(yoga.name);
                    
                    const yogaItems = [
                      ...yoga.effects.slice(0, 3).map((effect, idx) => ({ text: effect, type: 'neutral' as const })),
                      ...(timing?.isActiveNow ? [{ text: '● Active Now', type: 'positive' as const, highlight: true }] : []),
                      ...(timing?.nextActivation && !timing.isActiveNow ? [{ text: `Next Activation: ${new Date(timing.nextActivation).toLocaleDateString()}`, type: 'neutral' as const }] : [])
                    ];
                    
                    return (
                      <DevotionistStyleCard
                        key={`${type}-${yoga.name}-${index}`}
                        icon={<Icon className="h-5 w-5" />}
                        title={yoga.name}
                        summary={`${yoga.type} - ${yoga.strength}`}
                        items={yogaItems}
                        colorScheme={type === 'Raj Yoga' ? 'amber' : type === 'Dhana Yoga' ? 'green' : type === 'Kala Yoga' ? 'blue' : type === 'Arishta Yoga' ? 'orange' : 'purple'}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </TabsContent>
        
        {/* Individual Type Tabs */}
        {existingYogaTypes.map(type => (
          <TabsContent key={type} value={type} className="space-y-4">
            {groupedYogas[type]?.map((yoga, index) => {
              const timing = getYogaTiming(yoga);
              const isExpanded = expandedYogas.has(yoga.name);
              
              const yogaItems = [
                ...yoga.effects.slice(0, 3).map((effect, idx) => ({ text: effect, type: 'neutral' as const })),
                ...(timing?.isActiveNow ? [{ text: '● Active Now', type: 'positive' as const, highlight: true }] : []),
                ...(timing?.nextActivation && !timing.isActiveNow ? [{ text: `Next Activation: ${new Date(timing.nextActivation).toLocaleDateString()}`, type: 'neutral' as const }] : [])
              ];
              
              const Icon = getYogaIcon(type);
              
              return (
                <DevotionistStyleCard
                  key={`${type}-${yoga.name}-${index}`}
                  icon={<Icon className="h-5 w-5" />}
                  title={yoga.name}
                  summary={`${yoga.type} - ${yoga.strength}`}
                  items={yogaItems}
                  colorScheme={type === 'Raj Yoga' ? 'amber' : type === 'Dhana Yoga' ? 'green' : type === 'Kala Yoga' ? 'blue' : type === 'Arishta Yoga' ? 'orange' : 'purple'}
                />
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
