"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { getAvailableCountries } from '@/lib/pricingConfig';

interface CountrySelectorProps {
  value?: string;
  onChange: (value: string) => void;
  autoDetect?: boolean;
  className?: string;
}

/**
 * Auto-detect user's country from timezone
 */
async function detectUserCountry(): Promise<string> {
  try {
    // Try to detect from timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let countryCode = 'IN'; // Default to India
    
    // Extract country code from timezone (e.g., "America/New_York" -> "US")
    if (timezone.includes('/')) {
      const parts = timezone.split('/');
      if (parts.length > 1) {
        const region = parts[1];
        
        // Map common timezone regions to country codes
        const timezoneToCountry: Record<string, string> = {
          'New_York': 'US',
          'Los_Angeles': 'US',
          'Chicago': 'US',
          'Denver': 'US',
          'Phoenix': 'US',
          'Anchorage': 'US',
          'Honolulu': 'US',
          'London': 'GB',
          'Paris': 'EU',
          'Berlin': 'EU',
          'Rome': 'EU',
          'Madrid': 'EU',
          'Amsterdam': 'EU',
          'Brussels': 'EU',
          'Vienna': 'EU',
          'Toronto': 'CA',
          'Vancouver': 'CA',
          'Montreal': 'CA',
          'Sydney': 'AU',
          'Melbourne': 'AU',
          'Brisbane': 'AU',
          'Perth': 'AU',
          'Singapore': 'SG',
          'Dubai': 'AE',
          'Sao_Paulo': 'BR',
          'Rio_de_Janeiro': 'BR',
          'Mexico_City': 'MX',
          'Buenos_Aires': 'BR',
          'Jakarta': 'ID',
          'Bangkok': 'TH',
          'Manila': 'PH',
          'Ho_Chi_Minh': 'VN',
          'Kuala_Lumpur': 'MY',
          'Karachi': 'PK',
          'Dhaka': 'BD',
          'Colombo': 'LK',
          'Kathmandu': 'NP',
          'Mumbai': 'IN',
          'Delhi': 'IN',
          'Kolkata': 'IN',
          'Chennai': 'IN',
          'Bangalore': 'IN',
          'Johannesburg': 'ZA'
        };
        
        countryCode = timezoneToCountry[region] || countryCode;
      }
    }
    
    // Fallback: Try IP-based detection (optional, requires external API)
    // For now, we'll use timezone-based detection
    
    return countryCode;
  } catch (error) {
    console.warn('Failed to detect country:', error);
    return 'IN'; // Default to India
  }
}

export function CountrySelector({ 
  value, 
  onChange, 
  autoDetect = true,
  className = ''
}: CountrySelectorProps) {
  const [detectedCountry, setDetectedCountry] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState(false);
  const countries = getAvailableCountries();

  useEffect(() => {
    if (autoDetect && !value) {
      setIsDetecting(true);
      detectUserCountry().then(country => {
        setDetectedCountry(country);
        setIsDetecting(false);
        // Auto-select detected country if no value is set
        if (!value) {
          onChange(country);
        }
      });
    }
  }, [autoDetect, value, onChange]);

  const selectedValue = value || detectedCountry || 'IN';

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-white flex items-center gap-2">
        <Globe className="w-4 h-4 text-amber-400" />
        Country
      </label>
      <Select value={selectedValue} onValueChange={onChange} disabled={isDetecting}>
        <SelectTrigger className="w-full bg-transparent border-amber-500/30 text-white hover:border-amber-400/50 m3-input-focus m3-transition-standard">
          <SelectValue placeholder={isDetecting ? "Detecting..." : "Select your country"}>
            {isDetecting ? (
              "Detecting..."
            ) : (
              countries.find(c => c.code === selectedValue)?.name || "Select your country"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gradient-to-br from-[#0a1128] via-[#0d1b35] to-[#0a1128] border-amber-500/30 m3-transition-standard">
          {countries.map((country) => (
            <SelectItem
              key={country.code}
              value={country.code}
              className="text-white hover:bg-amber-500/20 focus:bg-amber-500/20 m3-transition-standard"
            >
              <div className="flex items-center justify-between w-full">
                <span>{country.name}</span>
                <span className="text-xs text-amber-400/70 ml-2">
                  {country.currencySymbol}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {autoDetect && detectedCountry && (
        <p className="text-xs text-white/60">
          Auto-detected: {countries.find(c => c.code === detectedCountry)?.name}
        </p>
      )}
    </div>
  );
}
