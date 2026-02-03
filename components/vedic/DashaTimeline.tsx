"use client"

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface DashaTimelineProps {
  dashas: Array<{
    planet: string;
    startDate: string;
    endDate: string;
    duration?: number;
  }>;
  currentDate: Date;
}

function calculateDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return Math.round((end - start) / (365.25 * 24 * 60 * 60 * 1000));
}

export function DashaTimeline({ dashas, currentDate }: DashaTimelineProps) {
  const sortedDashas = useMemo(() => {
    return [...dashas].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [dashas]);

  return (
    <Card className="bg-slate-900/50 border-white/10">
      <CardContent className="p-6">
        <div className="relative py-8">
          {/* Timeline Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-600" />
          
          {/* Current Date Marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-4 h-4 bg-amber-400 rounded-full animate-pulse" />
            <p className="text-xs text-amber-200 mt-2 whitespace-nowrap">Now</p>
          </div>
          
          {/* Dasha Markers */}
          <div className="flex justify-between items-center relative">
            {sortedDashas.map((dasha, idx) => {
              const isPast = new Date(dasha.endDate) < currentDate;
              const isCurrent = new Date(dasha.startDate) <= currentDate && new Date(dasha.endDate) >= currentDate;
              const isFuture = new Date(dasha.startDate) > currentDate;
              
              return (
                <div 
                  key={idx}
                  className={`flex flex-col items-center ${
                    isPast ? 'opacity-50' : ''
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full mb-2 ${
                    isCurrent ? 'bg-amber-400 animate-pulse' : 
                    isPast ? 'bg-slate-500' : 'bg-blue-400'
                  }`} />
                  <div className="text-center">
                    <p className={`font-medium text-sm ${
                      isCurrent ? 'text-amber-200' : 'text-slate-300'
                    }`}>
                      {dasha.planet}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(dasha.startDate).getFullYear()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {dasha.duration || calculateDuration(dasha.startDate, dasha.endDate)}y
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
