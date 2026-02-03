import { NextRequest, NextResponse } from 'next/server';
import { VedicInterpretationEnhancer } from '@/lib/vedicInterpretationEnhancer';

export async function POST(request: NextRequest) {
  try {
    const { houseNumber, chartData, userId } = await request.json();
    
    if (!userId || !chartData || houseNumber === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const enhancer = new VedicInterpretationEnhancer();
    const interpretation = await enhancer.generateHouseInterpretation(
      houseNumber,
      chartData,
      userId
    );
    
    return NextResponse.json({ interpretation });
  } catch (error) {
    console.error('House interpretation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate interpretation' },
      { status: 500 }
    );
  }
}
