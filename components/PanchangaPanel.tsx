"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard';
import { 
  Sun, 
  Moon, 
  Star, 
  Clock, 
  Calendar,
  Sunrise,
  Sunset,
  Zap,
  Shield,
  Heart
} from 'lucide-react';
import { AccuratePanchangaData } from '@/lib/enhancedPanchangaCalculator';

interface PanchangaPanelProps {
  birthPanchanga: AccuratePanchangaData | null;
  currentPanchanga: AccuratePanchangaData | null;
  className?: string;
  birthSubtitle?: string;
}

export function PanchangaPanel({ birthPanchanga, currentPanchanga, className = "", birthSubtitle }: PanchangaPanelProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderPanchangaCard = (panchanga: AccuratePanchangaData | null, title: string, subtitle: string) => {
    if (!panchanga) {
      return (
        <DevotionistStyleCard
          icon={<Calendar className="w-5 h-5" />}
          title={title}
          subtitle={subtitle}
          summary="Panchanga data not available"
          colorScheme="amber"
        />
      );
    }

    const items = [
      { text: `Sunrise: ${formatTime(panchanga.sunrise)}`, icon: <Sunrise className="h-4 w-4" /> },
      { text: `Sunset: ${formatTime(panchanga.sunset)}`, icon: <Sunset className="h-4 w-4" /> },
      { text: `Ayanamsa: ${panchanga.ayanamsa.toFixed(2)}°`, icon: <Star className="h-4 w-4" /> },
      { text: `Tithi: ${panchanga.tithi.name} (${panchanga.tithi.number}) - ${panchanga.tithi.paksha} Paksha`, icon: <Moon className="h-4 w-4" />, highlight: true },
      { text: panchanga.tithi.significance },
      { text: `Nakshatra: ${panchanga.nakshatra.name} (${panchanga.nakshatra.number})`, icon: <Star className="h-4 w-4" />, highlight: true },
      { text: `Lord: ${panchanga.nakshatra.lord}` },
      { text: panchanga.nakshatra.significance },
      { text: `Yoga: ${panchanga.yoga.name} (${panchanga.yoga.number})`, icon: <Zap className="h-4 w-4" />, highlight: true },
      { text: panchanga.yoga.significance },
      { text: `Karana: ${panchanga.karana.name} (${panchanga.karana.number})`, icon: <Shield className="h-4 w-4" />, highlight: true },
      { text: `Vara: ${panchanga.vara.name}`, icon: <Heart className="h-4 w-4" />, highlight: true },
      { text: `Ruled by: ${panchanga.vara.lord}` }
    ];

    return (
      <DevotionistStyleCard
        icon={<Calendar className="w-5 h-5" />}
        title={title}
        subtitle={subtitle}
        items={items}
        colorScheme="amber"
      >
        <div className="mt-4 space-y-3">
          {/* Tithi Progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600 font-medium">Tithi Progress</span>
              <span className="text-xs text-slate-600">{panchanga.tithi.progress.toFixed(1)}%</span>
            </div>
            <Progress value={panchanga.tithi.progress} className="h-1.5" />
          </div>
          
          {/* Nakshatra Progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600 font-medium">Nakshatra Progress</span>
              <span className="text-xs text-slate-600">{panchanga.nakshatra.progress.toFixed(1)}%</span>
            </div>
            <Progress value={panchanga.nakshatra.progress} className="h-1.5" />
          </div>
          
          {/* Yoga Progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600 font-medium">Yoga Progress</span>
              <span className="text-xs text-slate-600">{panchanga.yoga.progress.toFixed(1)}%</span>
            </div>
            <Progress value={panchanga.yoga.progress} className="h-1.5" />
          </div>
          
          {/* Karana Progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600 font-medium">Karana Progress</span>
              <span className="text-xs text-slate-600">{panchanga.karana.progress.toFixed(1)}%</span>
            </div>
            <Progress value={panchanga.karana.progress} className="h-1.5" />
          </div>
        </div>
      </DevotionistStyleCard>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Two-column layout for birth and current Panchanga */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderPanchangaCard(
          birthPanchanga, 
          "Panchanga at Birth", 
          birthSubtitle || "Birth date and time"
        )}
        {renderPanchangaCard(
          currentPanchanga, 
          "Current Panchanga", 
          new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        )}
      </div>
    </div>
  );
}