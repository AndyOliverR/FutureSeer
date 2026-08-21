// Individual Tool Data API
// Fetches comprehensive profile data for specific tools

import { NextRequest, NextResponse } from 'next/server';
import { isAdminAvailable, getDocument } from '@/lib/firebase-admin';
import { log } from '@/lib/consoleLogger';
import { verifyUserRequest, resolveOwnedUserId } from '@/lib/userApiAuth';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const toolName = searchParams.get('toolName');
    
    if (!userId || !toolName) {
      return NextResponse.json({
        success: false,
        error: 'Missing userId or toolName parameter'
      }, { status: 400 });
    }

    const auth = await verifyUserRequest(request, 'tool-data-api');
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const ownedUserId = resolveOwnedUserId(userId, auth.uid);
    if (!ownedUserId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    
    log.info('🔍 Fetching tool data from comprehensive profile', {
      userId: ownedUserId,
      toolName
    }, 'tool-data-api');
    
    // Get comprehensive profile from Firebase
    if (!isAdminAvailable()) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin not available'
      }, { status: 500 });
    }
    
    const profile = await getDocument('comprehensiveMysticalProfiles', ownedUserId);
    
    if (!profile) {
      return NextResponse.json({
        success: false,
        error: 'No comprehensive profile found. Please generate your mystical profile first.'
      }, { status: 404 });
    }
    
    // Extract tool-specific data
    const toolData = profile[toolName];
    
    if (!toolData) {
      return NextResponse.json({
        success: false,
        error: `Tool '${toolName}' not found in comprehensive profile`
      }, { status: 404 });
    }
    
    log.success(`✅ Tool data fetched successfully`, {
      userId: ownedUserId,
      toolName,
      hasData: !!toolData,
      dataKeys: toolData ? Object.keys(toolData) : []
    }, 'tool-data-api');
    
    return NextResponse.json({
      success: true,
      data: toolData,
      metadata: {
        toolName,
        userId: ownedUserId,
        generatedAt: profile.lastUpdated,
        dataQuality: profile.dataQuality,
        source: profile.source
      }
    });
    
  } catch (error: any) {
    log.error('❌ Error fetching tool data', error, 'tool-data-api');
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Helper function to get all available tools for a user
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyUserRequest(request, 'tool-data-api');
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing userId'
      }, { status: 400 });
    }

    const ownedUserId = resolveOwnedUserId(userId, auth.uid);
    if (!ownedUserId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    
    log.info('🔍 Fetching available tools for user', { userId: ownedUserId }, 'tool-data-api');
    
    const profile = await getDocument('comprehensiveMysticalProfiles', ownedUserId);
    
    if (!profile) {
      return NextResponse.json({
        success: false,
        error: 'No comprehensive profile found'
      }, { status: 404 });
    }
    
    // Extract all tool names (excluding metadata fields)
    const toolNames = Object.keys(profile).filter(key => 
      !['userId', 'lastUpdated', 'userProfile', 'dataQuality', 'source', 'cacheExpiry', 'toolsCount', 'successfulTools', 'failedTools', 'generationTime'].includes(key)
    );
    
    const availableTools = toolNames.map(toolName => ({
      name: toolName,
      hasData: !!profile[toolName],
      hasError: !!(profile[toolName]?.error),
      dataKeys: profile[toolName] ? Object.keys(profile[toolName]) : [],
      metadata: profile[toolName]?.metadata || {}
    }));
    
    log.success(`✅ Available tools fetched`, {
      userId: ownedUserId,
      toolsCount: availableTools.length,
      successfulTools: availableTools.filter(t => !t.hasError).length
    }, 'tool-data-api');
    
    return NextResponse.json({
      success: true,
      tools: availableTools,
      metadata: {
        userId: ownedUserId,
        totalTools: availableTools.length,
        successfulTools: availableTools.filter(t => !t.hasError).length,
        failedTools: availableTools.filter(t => t.hasError).length,
        lastUpdated: profile.lastUpdated,
        dataQuality: profile.dataQuality
      }
    });
    
  } catch (error: any) {
    log.error('❌ Error fetching available tools', error, 'tool-data-api');
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
