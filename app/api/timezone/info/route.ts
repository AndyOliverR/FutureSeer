import { NextRequest, NextResponse } from 'next/server';
import { timezoneService } from '@/services/timezone';

export const dynamic = 'force-static'

export async function POST(request: NextRequest) {
  try {
    const { timezone, dateTime, fromTimezone, toTimezone } = await request.json();

    // Get timezone info
    if (timezone) {
      const timezoneInfo = await timezoneService.getTimezoneInfo(timezone);
      
      return NextResponse.json({
        success: true,
        data: timezoneInfo
      });
    }

    // Convert date/time between timezones
    if (fromTimezone && toTimezone && dateTime) {
      const converted = await timezoneService.convertDateTime(
        dateTime,
        fromTimezone,
        toTimezone
      );
      
      return NextResponse.json({
        success: true,
        data: converted
      });
    }

    return NextResponse.json(
      { error: 'Either timezone or fromTimezone/toTimezone with dateTime is required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Timezone service error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process timezone request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timezone = searchParams.get('tz');
    const action = searchParams.get('action') || 'info';

    if (action === 'list') {
      // Return list of available timezones
      const timezones = timezoneService.getAvailableTimezones();
      
      return NextResponse.json({
        success: true,
        data: { timezones }
      });
    }

    if (action === 'current' && timezone) {
      // Get current time in timezone
      const currentTime = await timezoneService.getCurrentTime(timezone);
      
      return NextResponse.json({
        success: true,
        data: currentTime
      });
    }

    if (action === 'info' && timezone) {
      // Get timezone information
      const timezoneInfo = await timezoneService.getTimezoneInfo(timezone);
      
      return NextResponse.json({
        success: true,
        data: timezoneInfo
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing timezone parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Timezone service error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process timezone request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

