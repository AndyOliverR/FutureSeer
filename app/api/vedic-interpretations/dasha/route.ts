import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { VedicInterpretationEnhancer } from '@/lib/vedicInterpretationEnhancer';

export async function POST(request: NextRequest) {
  try {
    const { dashaData, chartData, userId } = await request.json();
    
    if (!userId || !chartData || !dashaData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const enhancer = new VedicInterpretationEnhancer();
    const interpretation = await enhancer.generateDashaInterpretation(
      dashaData,
      chartData,
      userId
    );
    
    return NextResponse.json({ interpretation });
  } catch (error) {
    devLog.error('Dasha interpretation error:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to generate interpretation' },
      { status: 500 }
    );
  }
}
