import { NextRequest, NextResponse } from 'next/server';
import { placeLookupService } from '@/services/place';

export const dynamic = 'force-static'

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const { placeName, options } = await request.json();

    if (!placeName || typeof placeName !== 'string') {
      return NextResponse.json(
        { error: 'Place name is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate place name length
    if (placeName.length < 2) {
      return NextResponse.json(
        { error: 'Place name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    if (placeName.length > 100) {
      return NextResponse.json(
        { error: 'Place name must be less than 100 characters' },
        { status: 400 }
      );
    }

    // Look up place
    const placeInfo = await placeLookupService.lookupPlace(placeName, options || {});

    if (!placeInfo) {
      return NextResponse.json(
        { error: 'Place not found. Please try a different search term.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: placeInfo
    });

  } catch (error) {
    console.error('Place lookup error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to lookup place',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeName = searchParams.get('q');

    if (!placeName) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Look up place
    const placeInfo = await placeLookupService.lookupPlace(placeName);

    if (!placeInfo) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: placeInfo
    });

  } catch (error) {
    console.error('Place lookup error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to lookup place',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

