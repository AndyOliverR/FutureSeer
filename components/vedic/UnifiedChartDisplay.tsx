"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Eye, 
  EyeOff, 
  Maximize2,
  Star,
  MapPin,
  Calendar
} from 'lucide-react';
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
      icon: "🔷",
      description: "Diamond layout with fixed houses"
    },
    { 
      id: "south", 
      label: "South Indian", 
      icon: "🔸",
      description: "Grid layout with fixed zodiac"
    },
    { 
      id: "circular", 
      label: "Nakshatra Wheel", 
      icon: "🌟",
      description: "27 lunar mansions wheel"
    }
  ];

  const renderChart = (type: string) => {
    const commonProps = {
      chart,
      name: `${name}-${type}`,
      className: "min-h-[500px]",
      onPlanetClick
    };

    switch (type) {
      case "north":
        return <VedicChartNorthPro {...commonProps} />;
      case "south":
        return <VedicChartSouthPro {...commonProps} />;
      case "circular":
        return <VedicChartCircular {...commonProps} radius={200} />;
      default:
        return <VedicChartNorthPro {...commonProps} />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Chart Information Header */}
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Vedic Astrology Charts
              </CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                {chart.ascendant?.signName} Ascendant • {chart.metadata?.ayanamsha} Ayanamsha
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
                className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
              >
                {showComparison ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showComparison ? 'Hide' : 'Show'} Comparison
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Chart Display */}
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-transparent border border-amber-500/20 p-1 mb-6">
              {chartTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:text-amber-400 text-slate-400 hover:text-amber-300 transition-colors"
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {chartTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                {/* Chart Description */}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-amber-200 mb-2">
                    {tab.icon} {tab.label} Chart
                  </h3>
                  <p className="text-sm text-slate-400">{tab.description}</p>
                </div>

                {/* Chart Rendering */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-center"
                >
                  {renderChart(tab.id)}
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Comparison View */}
      {showComparison && (
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-200">Chart Comparison View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {chartTabs.map((tab) => (
                <div key={`compare-${tab.id}`} className="space-y-3">
                  <h4 className="text-center font-semibold text-amber-200">
                    {tab.icon} {tab.label}
                  </h4>
                  <div className="scale-75 origin-center">
                    {renderChart(tab.id)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart Data Summary */}
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-amber-200">Chart Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-200">Ascendant</h4>
              <p className="text-slate-300">
                {chart.ascendant?.signName} {chart.ascendant?.degreeInSign?.toFixed(1)}°
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-200">Planets</h4>
              <p className="text-slate-300">
                {Object.keys(chart.planets || {}).length} planets placed
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-200">System</h4>
              <p className="text-slate-300">
                {chart.metadata?.system || 'Whole Sign'} • {chart.metadata?.ayanamsha}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
