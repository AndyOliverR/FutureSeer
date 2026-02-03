'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, MapPin, Settings, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ChartMetadata {
  eventType?: string;
  date?: string;
  time?: string;
  timezone?: string;
  location?: string;
  houseSystem?: string;
  zodiacType?: string;
  showMetadata?: boolean;
}

interface ChartMetadataProps {
  metadata: ChartMetadata;
  onToggle?: () => void;
}

export default function ChartMetadataComponent({ metadata, onToggle }: ChartMetadataProps) {
  const {
    eventType = "Natal Chart",
    date = "Nov 5 2025, Wed",
    time = "5:19:14 AM PST",
    timezone = "+8:00",
    location = "San Diego, California",
    houseSystem = "Placidus",
    zodiacType = "Tropical",
    showMetadata = true
  } = metadata;

  if (!showMetadata) {
    return (
      <div className="mb-4">
        <Button
          onClick={onToggle}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-slate-300 hover:bg-white"
        >
          <Eye className="w-4 h-4 mr-2" />
          Show Info
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <Card className="bg-white/95 backdrop-blur-sm border-slate-300 shadow-lg max-w-xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-800">{eventType}</h3>
            {onToggle && (
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-slate-100"
              >
                <EyeOff className="w-3 h-3" />
              </Button>
            )}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span className="font-medium">{date}</span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{time} {timezone}</span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-700">
              <Settings className="w-3 h-3 flex-shrink-0" />
              <span>{houseSystem} • {zodiacType}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
