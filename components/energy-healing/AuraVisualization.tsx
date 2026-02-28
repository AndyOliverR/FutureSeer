"use client"

import { motion } from 'framer-motion';
import { AuraReading } from '@/lib/energyHealing/energyHealingImageAnalyzer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Layers, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface AuraVisualizationProps {
  reading: AuraReading;
}

export function AuraVisualization({ reading }: AuraVisualizationProps) {
  // Map color names to actual hex colors
  const getAuraColorHex = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      red: '#EF4444',
      orange: '#F97316',
      yellow: '#EAB308',
      green: '#22C55E',
      blue: '#3B82F6',
      purple: '#A855F7',
      violet: '#A855F7',
      indigo: '#6366F1',
      white: '#F8FAFC',
      pink: '#EC4899',
      gray: '#6B7280',
      grey: '#6B7280',
      brown: '#92400E',
      black: '#1F2937'
    };
    return colorMap[colorName.toLowerCase()] || '#3B82F6'; // Default to blue
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-amber-700" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Aura Health */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-amber-950 font-semibold flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-700" />
            Aura Reading Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-amber-950 font-medium">Dominant Color</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full border-2 border-amber-500 shadow-lg"
                  style={{ backgroundColor: getAuraColorHex(reading.dominantColor ?? '') }}
                />
                <span className="text-amber-950 font-semibold capitalize">{reading.dominantColor ?? '—'}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-amber-950 font-medium">{reading.colorInterpretation ?? '—'}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-amber-300">
              <span className="text-amber-950 font-medium">Overall Health</span>
              <div className="flex items-center gap-2">
                {getHealthIcon(reading.overallHealth ?? '')}
                <Badge variant="outline" className="border-amber-600 text-amber-950 bg-amber-100 font-medium">
                  {(typeof reading.overallHealth === 'string' ? reading.overallHealth : '—').replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aura Layers Visualization */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-amber-950 font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-700" />
            Aura Layers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
              {/* Visual Representation */}
              <div className="relative w-full h-64 flex items-center justify-center mb-6">
                {/* Human silhouette center */}
                <div className="absolute w-24 h-32 bg-amber-100 rounded-full flex items-center justify-center z-10 border-2 border-amber-300">
                  <Sparkles className="w-8 h-8 text-amber-700" />
                </div>
              
              {/* Aura layers */}
              {(Array.isArray(reading.layers) ? reading.layers : []).map((layer, index) => {
                const layerSize = 60 + (index * 30);
                // Adjust opacity based on clarity: vibrant = higher, cloudy = lower
                const baseOpacity = (layer?.clarity === 'vibrant') ? 0.7 : (layer?.clarity === 'cloudy') ? 0.3 : 0.5;
                const opacity = baseOpacity - (index * 0.05);
                const layerColor = getAuraColorHex(layer?.color ?? '');
                const isVibrant = layer?.clarity === 'vibrant';
                
                return (
                  <motion.div
                    key={layer?.name ?? index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className="absolute rounded-full border-2 border-dashed border-amber-500/50"
                    style={{
                      width: layerSize,
                      height: layerSize,
                      backgroundColor: layerColor,
                      opacity: Math.max(0.2, Math.min(0.8, opacity)),
                      zIndex: 9 - index,
                      boxShadow: isVibrant ? `0 0 20px ${layerColor}40` : 'none'
                    }}
                  />
                );
              })}
            </div>

            {/* Layer Details */}
            {(Array.isArray(reading.layers) ? reading.layers : []).map((layer, index) => (
              <motion.div
                key={layer?.name ?? index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl border-2 border-amber-300 bg-amber-100/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-amber-500 shadow-md"
                      style={{ backgroundColor: getAuraColorHex(layer?.color ?? '') }}
                    />
                    <div>
                      <h3 className="text-amber-950 font-semibold">{layer?.name ?? '—'}</h3>
                      <p className="text-sm text-amber-950 font-medium">
                        {(layer?.clarity ?? '').toUpperCase()} • {(layer?.thickness ?? '').toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-amber-950 text-sm font-medium mt-2">{layer?.interpretation ?? '—'}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Meanings */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-amber-950 font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-700" />
            Color Meanings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'white', 'pink'].map((color) => (
              <div key={color} className="flex flex-col items-center gap-2 p-3 bg-amber-100/50 rounded-xl border-2 border-amber-300">
                <div
                  className="w-8 h-8 rounded-full border-2 border-amber-500 shadow-md"
                  style={{ backgroundColor: getAuraColorHex(color) }}
                />
                <span className="text-amber-950 text-xs font-semibold capitalize">{color}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {reading.recommendations && reading.recommendations.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-amber-950 font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-700" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {reading.recommendations.map((rec, index) => (
                <li key={index} className="text-amber-950 font-medium flex items-start gap-2">
                  <span className="text-amber-800 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
