import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { VedicInterpretationEnhancer } from '@/lib/vedicInterpretationEnhancer';

export async function POST(request: NextRequest) {
  try {
    const { chartData, userId } = await request.json();
    
    if (!userId || !chartData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const enhancer = new VedicInterpretationEnhancer();
    const interpretation = await enhancer.generateEnhancedOverview(chartData, userId);
    
    return NextResponse.json({ interpretation });
  } catch (error) {
    devLog.error('Overview interpretation error:', error, 'route');
    return NextResponse.json(
      { error: 'Failed to generate interpretation' },
      { status: 500 }
    );
  }
}
