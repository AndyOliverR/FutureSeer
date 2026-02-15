import { NextRequest, NextResponse } from 'next/server';
import { convertWesternChartImageToVedic, WesternChartImageData } from '@/lib/westernToVedicImageConverter';
import { devLog } from '@/lib/devLogger';

export const dynamic = 'force-static'

export async function POST(request: NextRequest) {
  try {
    const { westernChartImageData, chartTypes = ['northIndian', 'southIndian', 'nakshatraWheel'] } = await request.json();

    if (!westernChartImageData) {
      return NextResponse.json({
        success: false,
        error: 'Western chart image data is required'
      }, { status: 400 });
    }

    devLog.info('🔄 Converting Western chart image to Vedic formats...', undefined, 'vedic');
    devLog.debug('📊 Input data:', {
      hasImageUrl: !!westernChartImageData.imageUrl,
      planetsCount: westernChartImageData.planetaryPositions?.length || 0,
      housesCount: westernChartImageData.houseCusps?.length || 0,
      ayanamsa: westernChartImageData.metadata?.ayanamsa || 'default'
    }, 'vedic');

    // Convert Western chart image to Vedic formats
    const vedicCharts = convertWesternChartImageToVedic(westernChartImageData as WesternChartImageData);

    const result: any = {
      success: true,
      charts: {},
      metadata: {
        convertedAt: new Date().toISOString(),
        source: 'AstroApp Western Chart Image',
        ayanamsa: westernChartImageData.metadata?.ayanamsa || 23.85
      }
    };

    // Generate requested chart types
    if (chartTypes.includes('northIndian')) {
      result.charts.northIndian = {
        svg: vedicCharts.northIndian.svg,
        metadata: vedicCharts.northIndian.metadata,
        type: 'North Indian Chart',
        description: 'Traditional North Indian square format chart converted from Western chart image'
      };
    }

    if (chartTypes.includes('southIndian')) {
      result.charts.southIndian = {
        svg: vedicCharts.southIndian.svg,
        metadata: vedicCharts.southIndian.metadata,
        type: 'South Indian Chart',
        description: 'Traditional South Indian diamond format chart converted from Western chart image'
      };
    }

    if (chartTypes.includes('nakshatraWheel')) {
      result.charts.nakshatraWheel = {
        svg: vedicCharts.nakshatraWheel.svg,
        metadata: vedicCharts.nakshatraWheel.metadata,
        type: 'Nakshatra Wheel',
        description: 'Nakshatra wheel with 27 lunar mansions converted from Western chart image'
      };
    }

    devLog.info('✅ Chart conversion completed successfully', undefined, 'vedic');
    devLog.debug('📈 Generated charts:', Object.keys(result.charts), 'vedic');

    return NextResponse.json(result);

  } catch (error) {
    devLog.error('❌ Chart conversion failed:', error, 'route');
    
    return NextResponse.json({
      success: false,
      error: 'Failed to convert charts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Vedic Chart Converter API',
    supportedFormats: [
      'North Indian Chart (Square format)',
      'South Indian Chart (Diamond format)', 
      'Nakshatra Wheel (27 lunar mansions)'
    ],
    usage: {
      method: 'POST',
      body: {
        westernChartData: 'Western chart data from AstroApp',
        chartTypes: 'Array of chart types to generate (optional)'
      }
    }
  });
}
