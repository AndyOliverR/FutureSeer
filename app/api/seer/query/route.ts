import { NextRequest, NextResponse } from 'next/server';
import { seerChatbot, SeerQueryRequest } from '@/lib/seerChatbot/seerChatbot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, query, context } = body;

    // Validate required fields
    if (!user_id || !query) {
      return NextResponse.json(
        { error: 'User ID and query are required' },
        { status: 400 }
      );
    }

    // Validate query length
    if (query.length < 3) {
      return NextResponse.json(
        { error: 'Query must be at least 3 characters long' },
        { status: 400 }
      );
    }

    if (query.length > 500) {
      return NextResponse.json(
        { error: 'Query must be less than 500 characters' },
        { status: 400 }
      );
    }

    // Create request object
    const seerRequest: SeerQueryRequest = {
      user_id,
      query: query.trim(),
      context: context || {}
    };

    // Process the query through the Seer chatbot
    const response = await seerChatbot.processQuery(seerRequest);

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Seer API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process your mystical query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get session history
    const history = seerChatbot.getSessionHistory(sessionId);

    return NextResponse.json({
      success: true,
      data: {
        session_id: sessionId,
        history: history
      }
    });

  } catch (error) {
    console.error('Seer History API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve session history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 