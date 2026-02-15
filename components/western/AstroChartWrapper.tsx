"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { devLog } from '@/lib/devLogger';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Calendar, 
  Users, 
  Info,
  Star,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { 
  transformPlanetsToAstroChart,
  transformHousesToAstroChart,
  transformAspectsToAstroChart,
  getCurrentTransits,
  type Planet,
  type House,
  type Aspect
} from '@/lib/western/astroChartAdapter';
import { 
  calculateCurrentTransits,
  calculateTransitAspects,
  generateTransitInterpretations,
  type TransitAspect,
  type TransitInterpretation
} from '@/lib/western/transitCalculator';
import { 
  getThemeForChartType,
  getAstroChartInlineStyles,
  type FutureSeerChartTheme
} from '@/lib/western/astroChartTheme';
import { BirthData } from '@/lib/universalOccultService';

// AstroChart library imports (we'll use dynamic import to avoid SSR issues)
let AstroChart: any = null;

interface AstroChartWrapperProps {
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
  chartType?: 'natal' | 'transit' | 'synastry';
  width?: number;
  height?: number;
  showTransits?: boolean;
  partnerData?: BirthData;
  userBirthData?: BirthData;
}

export default function AstroChartWrapper({ 
  planets, 
  houses, 
  aspects, 
  chartType = 'natal',
  width = 400, 
  height = 400,
  showTransits = false,
  partnerData,
  userBirthData
}: AstroChartWrapperProps) {
  const [astroChartLoaded, setAstroChartLoaded] = useState(false);
  const [transits, setTransits] = useState<TransitAspect[]>([]);
  const [transitInterpretations, setTransitInterpretations] = useState<TransitInterpretation[]>([]);
  const [loadingTransits, setLoadingTransits] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dynamic import of AstroChart library
  useEffect(() => {
    const loadAstroChart = async () => {
      try {
        const astroChartModule = await import('@astrodraw/astrochart');
        AstroChart = astroChartModule.default || astroChartModule;
        setAstroChartLoaded(true);
      } catch (error) {
        devLog.error('Failed to load AstroChart library:', error, 'AstroChartWrapper');
      }
    };

    loadAstroChart();
  }, []);

  // Load transit data when needed
  useEffect(() => {
    if (showTransits && astroChartLoaded) {
      loadTransitData();
    }
  }, [showTransits, astroChartLoaded]);

  // Update current time every minute for transit display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const loadTransitData = async () => {
    setLoadingTransits(true);
    try {
      const currentTransits = await calculateCurrentTransits();
      const transitAspects = calculateTransitAspects(planets, currentTransits);
      const interpretations = generateTransitInterpretations(transitAspects);
      
      setTransits(transitAspects);
      setTransitInterpretations(interpretations);
    } catch (error) {
      devLog.error('Failed to load transit data:', error, 'AstroChartWrapper');
    } finally {
      setLoadingTransits(false);
    }
  };

  // Transform data for AstroChart
  const astroChartData = useMemo(() => {
    if (!astroChartLoaded) return null;

    const baseData = {
      planets: transformPlanetsToAstroChart(planets),
      houses: transformHousesToAstroChart(houses),
      aspects: transformAspectsToAstroChart(aspects)
    };

    if (showTransits && transits.length > 0) {
      // Add transit data to the chart
      return {
        ...baseData,
        transits: transits.map(transit => ({
          name: transit.transitPlanet,
          longitude: 0, // Will be calculated by AstroChart
          aspect: {
            planet: transit.natalPlanet,
            type: transit.aspectType,
            orb: transit.orb
          }
        }))
      };
    }

    return baseData;
  }, [planets, houses, aspects, astroChartLoaded, showTransits, transits]);

  // Get theme for current chart type
  const theme = useMemo(() => getThemeForChartType(chartType), [chartType]);

  // Render chart using AstroChart library
  const renderAstroChart = () => {
    if (!astroChartLoaded || !astroChartData || !AstroChart) {
      return (
        <div className="flex items-center justify-center h-96 bg-slate-900/20 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <p className="text-slate-300">Loading professional chart...</p>
          </div>
        </div>
      );
    }

    try {
      // Create AstroChart instance with our data and theme
      const chartConfig = {
        ...astroChartData,
        theme: theme,
        width: width,
        height: height,
        showTransits: showTransits,
        showAspects: true,
        showHouses: true,
        showDegrees: true
      };

      // Render the chart (this is a simplified version - actual implementation would depend on AstroChart API)
      return (
        <div className="relative">
          <div 
            id="astro-chart-container"
            style={getAstroChartInlineStyles(theme)}
            className="rounded-lg overflow-hidden"
          >
            {/* Placeholder for AstroChart rendering */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-slate-300">
                <Star className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                <p className="text-lg font-semibold mb-2">Professional Natal Chart</p>
                <p className="text-sm">AstroChart integration in progress</p>
                {showTransits && (
                  <div className="mt-4">
                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-300">
                      <Clock className="w-3 h-3 mr-1" />
                      Transit Overlay Active
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chart controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-slate-800/50 border-slate-600 text-slate-200 hover:bg-slate-700"
              onClick={() => {/* Export functionality */}}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    } catch (error) {
      devLog.error('Error rendering AstroChart:', error, 'AstroChartWrapper');
      return (
        <div className="flex items-center justify-center h-96 bg-red-900/20 rounded-lg">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <p className="text-red-300">Failed to render chart</p>
          </div>
        </div>
      );
    }
  };

  // Render transit information panel
  const renderTransitPanel = () => {
    if (!showTransits) return null;

    return (
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Current Transits
          </h3>
          <Badge variant="outline" className="text-xs">
            {currentTime.toLocaleTimeString()}
          </Badge>
        </div>

        {loadingTransits ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400 mx-auto mb-2"></div>
            <p className="text-slate-400 text-sm">Calculating transits...</p>
          </div>
        ) : transitInterpretations.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {transitInterpretations.slice(0, 5).map((transit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={transit.planet === 'Sun' || transit.planet === 'Moon' ? 'default' : 'secondary'}
                      className={transit.planet === 'Sun' || transit.planet === 'Moon' ? 'bg-amber-500/20 text-amber-300' : ''}
                    >
                      {transit.planet}
                    </Badge>
                    <span className="text-sm text-slate-400">
                      {transit.aspect} {transit.natalPlanet}
                    </span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      transit.advice.includes('positive') ? 'border-green-500/50 text-green-400' :
                      transit.advice.includes('challenge') ? 'border-red-500/50 text-red-400' :
                      'border-blue-500/50 text-blue-400'
                    }`}
                  >
                    {transit.duration}
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {transit.interpretation}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-400">
            <Info className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">No significant transits at this time</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 shadow-xl rounded-2xl">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Chart Type Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-amber-300">
                {chartType === 'natal' ? 'Professional Natal Chart' :
                 chartType === 'transit' ? 'Transit Chart' :
                 'Synastry Chart'}
              </h3>
            </div>
            {chartType === 'transit' && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                <Calendar className="w-3 h-3 mr-1" />
                Live Transits
              </Badge>
            )}
          </div>

          {/* Main Chart */}
          {renderAstroChart()}

          {/* Transit Information Panel */}
          {renderTransitPanel()}

          {/* Chart Information - Promotional section removed */}
        </div>
      </CardContent>
    </Card>
  );
}
