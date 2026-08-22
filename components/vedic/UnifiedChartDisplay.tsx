"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  EyeOff, 
  Maximize2,
  Star,
  Diamond,
  Grid3X3,
  CircleDot,
} from 'lucide-react';
import { UnifiedChartRenderer, createVedicChartData } from '@/components/charts/UnifiedChartRenderer';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { isUnifiedChartsEnabled } from '@/lib/charts/featureFlags';
import VedicChartNorthPro from '@/components/VedicChartNorthPro';
import VedicChartSouthPro from '@/components/VedicChartSouthPro';
import VedicChartCircular from '@/components/VedicChartCircular';

interface UnifiedChartDisplayProps {
  chart: {
    houses: any[];
    planets: Record<string, any>;
    ascendant?: any;
    metadata?: any;
  };
  name?: string;
  className?: string;
  onPlanetClick?: (planet: string, data: any) => void;
}

export function UnifiedChartDisplay({ 
  chart, 
  name = "vedic-chart",
  className = "",
  onPlanetClick 
}: UnifiedChartDisplayProps) {
  const [activeTab, setActiveTab] = useState("north");
  const [showComparison, setShowComparison] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const chartTabs = [
    { 
      id: "north", 
      label: "North Indian", 
      icon: Diamond,
      description: "Diamond layout with fixed houses"
    },
    { 
      id: "south", 
      label: "South Indian", 
      icon: Grid3X3,
      description: "Grid layout with fixed zodiac"
    },
    { 
      id: "circular", 
      label: "Nakshatra Wheel", 
      icon: CircleDot,
      description: "27 lunar mansions wheel"
    }
  ];

  const renderChart = (type: string) => {
    if (!isUnifiedChartsEnabled()) {
      const commonProps = {
        chart,
        name: `${name}-${type}`,
        className: "h-full w-full",
        onPlanetClick,
      };
      if (type === 'south') return <VedicChartSouthPro {...commonProps} />;
      if (type === 'circular') return <VedicChartCircular {...commonProps} radius={200} />;
      return <VedicChartNorthPro {...commonProps} />;
    }

    const layout = type === 'south' ? 'vedic-south' : type === 'circular' ? 'nakshatra-wheel' : 'vedic-north';
    const unified = createVedicChartData({
      houses: chart.houses,
      planets: chart.planets,
      title: `${name}-${type}`,
      layout,
    });
    return <UnifiedChartRenderer chart={unified} visualVariant="auric-night" />;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="border-sky-200 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="font-heading flex items-center gap-2 tracking-wide text-sky-900">
                <Star className="h-5 w-5" />
                Vedic Astrology Charts
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                {chart.ascendant?.signName} Ascendant · {chart.metadata?.ayanamsha} Ayanamsha
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
                className="border-sky-200 text-sky-700 hover:bg-sky-50"
              >
                {showComparison ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showComparison ? 'Hide' : 'Show'} Comparison
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="border-sky-200 text-sky-700 hover:bg-sky-50"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-sky-200 bg-white">
        <CardContent className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-3 border border-sky-200 bg-sky-50 p-1">
              {chartTabs.map((tab) => {
                const Icon = tab.icon
                return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="text-slate-500 hover:text-sky-700 data-[state=active]:text-sky-800"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              )})}
            </TabsList>

            {chartTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                <div className="mb-4 text-center">
                  <h3 className="mb-1 font-heading text-lg font-medium tracking-wide text-sky-900">
                    {tab.label} Chart
                  </h3>
                  <p className="text-sm text-[var(--m3-on-surface-variant)]">{tab.description}</p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <ChartFrame>
                    {renderChart(tab.id)}
                  </ChartFrame>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {showComparison && (
        <Card className="border-sky-200 bg-white">
          <CardHeader>
            <CardTitle className="font-heading tracking-wide text-sky-900">Chart Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
              {chartTabs.map((tab) => (
                <ChartFrame key={`compare-${tab.id}`} title={tab.label}>
                  {renderChart(tab.id)}
                </ChartFrame>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-sky-200 bg-white">
        <CardHeader>
          <CardTitle className="font-heading tracking-wide text-sky-900">Chart Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div className="space-y-1">
              <h4 className="font-heading font-medium tracking-wide text-sky-900">Ascendant</h4>
              <p className="text-slate-700">
                {chart.ascendant?.signName} {chart.ascendant?.degreeInSign?.toFixed(1)}°
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-heading font-medium tracking-wide text-sky-900">Planets</h4>
              <p className="text-slate-700">
                {Object.keys(chart.planets || {}).length} planets placed
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-heading font-medium tracking-wide text-sky-900">System</h4>
              <p className="text-slate-700">
                {chart.metadata?.system || 'Whole Sign'} · {chart.metadata?.ayanamsha}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
