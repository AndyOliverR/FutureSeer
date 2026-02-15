'use client'

import React from 'react'
import { devLog } from '@/lib/devLogger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ColorfulWesternChart from './ColorfulWesternChart'
import ChartMetadataComponent, { ChartMetadata } from './ChartMetadata'

interface Planet {
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  isRetrograde?: boolean;
  sign?: string;
  degree?: number;
  house?: number;
}

interface House {
  number: number;
  sign: string;
  degree: number;
  longitude: number;
  cusp: number;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  strength: number;
  exact: boolean;
}

interface DualChartDisplayProps {
  natalPlanets: Planet[];
  natalHouses: House[];
  natalAspects: Aspect[];
  transitPlanets: Planet[];
  transitHouses: House[];
  width?: number;
  height?: number;
  natalMetadata?: ChartMetadata;
  transitMetadata?: ChartMetadata;
}

export default function DualChartDisplay({
  natalPlanets,
  natalHouses,
  natalAspects,
  transitPlanets,
  transitHouses,
  width = 550,
  height = 400,
  natalMetadata,
  transitMetadata
}: DualChartDisplayProps) {
  // Debug logs only in development
  if (process.env.NODE_ENV === 'development') {
    devLog.debug('DualChartDisplay: Received transit planets:', transitPlanets)
    devLog.debug('DualChartDisplay: Received transit houses:', transitHouses)
  }
  
  return (
    <div className="w-full">
      {/* Dual Chart Display - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Natal Chart */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-lg font-bold text-blue-800 flex items-center justify-center gap-2">
              <span className="text-2xl">☉</span>
              Natal Chart
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
                {/* Natal Chart Metadata */}
                {natalMetadata && (
                  <ChartMetadataComponent 
                    metadata={natalMetadata}
                  />
                )}
                
                <div className="w-full h-full min-h-[400px] flex items-center justify-center">
                  <ColorfulWesternChart
                    planets={natalPlanets}
                    houses={natalHouses}
                    aspects={natalAspects}
                    width={width}
                    height={height}
                    title=""
                    backgroundColor="#f3f4f9"
                  />
                </div>
          </CardContent>
        </Card>

        {/* Transit Chart */}
        <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-lg font-bold text-green-800 flex items-center justify-center gap-2">
              <span className="text-2xl">♅</span>
              Transit Chart
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Transit Chart Metadata */}
            {transitMetadata && (
              <ChartMetadataComponent 
                metadata={transitMetadata}
              />
            )}
            
            <div className="w-full h-full min-h-[400px] flex items-center justify-center">
              <ColorfulWesternChart
                planets={transitPlanets}
                houses={transitHouses}
                aspects={[]} // Transit aspects can be added later
                width={width}
                height={height}
                title=""
                backgroundColor="#f0fdf4"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Information Panel */}
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200">
        <CardHeader>
          <CardTitle className="text-center text-lg font-semibold text-slate-700">
            Chart Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Natal Chart Summary */}
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Natal Chart</h4>
              <p className="text-sm text-blue-600">
                Birth positions of planets and houses
              </p>
              <div className="mt-2 text-xs text-blue-500">
                {natalPlanets.length} planets • {natalHouses.length} houses • {natalAspects.length} aspects
              </div>
            </div>

            {/* Transit Chart Summary */}
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Transit Chart</h4>
              <p className="text-sm text-green-600">
                Current planetary positions
              </p>
              <div className="mt-2 text-xs text-green-500">
                {transitPlanets.length} planets • {transitHouses.length} houses
              </div>
            </div>

            {/* Chart Features */}
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Features</h4>
              <div className="text-xs text-purple-600 space-y-1">
                <div>✨ Vibrant zodiac colors</div>
                <div>📐 Aspect lines</div>
                <div>📏 Degree markers</div>
                <div>🔄 Retrograde indicators</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}