'use client'

import React from 'react'
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
      <div className="mb-2 flex justify-center">
        <Button
          onClick={onToggle}
          variant="outline"
          size="sm"
          className="border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] text-[var(--m3-on-surface)] hover:bg-[var(--m3-surface-container-high)]"
        >
          <Eye className="mr-2 h-4 w-4" />
          Show Info
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-1 rounded-xl border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] px-3 py-2 text-xs text-[var(--m3-on-surface-variant)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-1.5 truncate">
            <Calendar className="h-3 w-3 shrink-0 text-amber-200" />
            <span className="text-[var(--m3-on-surface)]">{date}</span>
          </p>
          <p className="flex items-center gap-1.5 truncate">
            <Clock className="h-3 w-3 shrink-0 text-amber-200" />
            {time} {timezone}
          </p>
          <p className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3 w-3 shrink-0 text-amber-200" />
            {location}
          </p>
          <p className="flex items-center gap-1.5 truncate">
            <Settings className="h-3 w-3 shrink-0 text-amber-200" />
            {houseSystem} · {zodiacType}
          </p>
        </div>
        {onToggle ? (
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="h-6 w-6 shrink-0 p-0 text-[var(--m3-on-surface-variant)] hover:bg-[var(--m3-surface-container-high)]"
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
