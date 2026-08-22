'use client'

import React from 'react'
import { devLog } from '@/lib/devLogger';
import { Sun, Orbit, Info } from 'lucide-react'
import ChartMetadataComponent, { ChartMetadata } from './ChartMetadata'
import { UnifiedChartRenderer, createWesternChartData } from '@/components/charts/UnifiedChartRenderer';
import ColorfulWesternChart from './ColorfulWesternChart';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { isUnifiedChartsEnabled } from '@/lib/charts/featureFlags';
import { useIsMobileLayout } from '@/hooks/useIsMobileLayout';

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
  width: _width = 550,
  height: _height = 400,
  natalMetadata,
  transitMetadata
}: DualChartDisplayProps) {
  const isMobileLayout = useIsMobileLayout();
  const chartWidth = isMobileLayout ? 320 : _width;
  const chartHeight = isMobileLayout ? 300 : _height;

  if (process.env.NODE_ENV === 'development') {
    devLog.debug('DualChartDisplay: Received transit planets:', transitPlanets)
    devLog.debug('DualChartDisplay: Received transit houses:', transitHouses)
  }

  const natalChart = isUnifiedChartsEnabled() ? (
    <UnifiedChartRenderer
      chart={createWesternChartData({
        planets: natalPlanets as unknown as Array<Record<string, unknown>>,
        houses: natalHouses as unknown as Array<Record<string, unknown>>,
        aspects: natalAspects as unknown as Array<Record<string, unknown>>,
        title: 'Natal Chart',
      })}
      visualVariant="ivory-manuscript"
    />
  ) : (
    <ColorfulWesternChart
      planets={natalPlanets}
      houses={natalHouses}
      aspects={natalAspects}
      width={chartWidth}
      height={chartHeight}
      title=""
      backgroundColor="#ffffff"
    />
  )

  const transitChart = isUnifiedChartsEnabled() ? (
    <UnifiedChartRenderer
      chart={createWesternChartData({
        planets: transitPlanets as unknown as Array<Record<string, unknown>>,
        houses: transitHouses as unknown as Array<Record<string, unknown>>,
        aspects: [],
        title: 'Transit Chart',
      })}
      visualVariant="ivory-manuscript"
    />
  ) : (
    <ColorfulWesternChart
      planets={transitPlanets}
      houses={transitHouses}
      aspects={[]}
      width={chartWidth}
      height={chartHeight}
      title=""
      backgroundColor="#ffffff"
    />
  )

  return (
    <div className="w-full min-w-0">
      <div className="mb-6 grid grid-cols-1 items-stretch gap-4 sm:gap-6 lg:grid-cols-2">
        <ChartFrame
          title="Natal Chart"
          subtitle="Birth positions"
          header={natalMetadata ? <ChartMetadataComponent metadata={natalMetadata} /> : undefined}
        >
          {natalChart}
        </ChartFrame>
        <ChartFrame
          title="Transit Chart"
          subtitle="Current sky"
          header={transitMetadata ? <ChartMetadataComponent metadata={transitMetadata} /> : undefined}
        >
          {transitChart}
        </ChartFrame>
      </div>

      <div className="rounded-2xl border border-sky-200 bg-white p-4">
        <p className="mb-3 flex items-center justify-center gap-2 font-heading text-sm font-medium tracking-wide text-sky-900">
          <Info className="h-4 w-4" />
          Chart information
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-center">
            <h4 className="mb-1 flex items-center justify-center gap-1.5 font-heading text-sm font-medium tracking-wide text-sky-900">
              <Sun className="h-4 w-4" /> Natal
            </h4>
            <p className="text-xs text-slate-500">
              {natalPlanets.length} planets · {natalHouses.length} houses · {natalAspects.length} aspects
            </p>
          </div>
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-center">
            <h4 className="mb-1 flex items-center justify-center gap-1.5 font-heading text-sm font-medium tracking-wide text-sky-900">
              <Orbit className="h-4 w-4" /> Transits
            </h4>
            <p className="text-xs text-slate-500">
              {transitPlanets.length} planets · {transitHouses.length} houses
            </p>
          </div>
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-center">
            <h4 className="mb-1 font-heading text-sm font-medium tracking-wide text-sky-900">Includes</h4>
            <p className="text-xs text-slate-500">
              Zodiac ring · aspects · retrograde marks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
