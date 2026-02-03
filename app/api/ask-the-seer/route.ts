import { NextRequest, NextResponse } from 'next/server';
import { adminDb, getDocument } from '@/lib/firebase-admin';
import { log } from '@/lib/consoleLogger';
import { devLog } from '@/lib/devLogger';

export async function POST(request: NextRequest) {
  try {
    const { userId, question, userProfile } = await request.json();
    
    if (!userId || !question) {
      return NextResponse.json({
        success: false,
        error: 'Missing userId or question'
      }, { status: 400 });
    }
    
    log.info('🔮 Ask the Seer request', {
      userId,
      questionLength: question.length,
      hasUserProfile: !!userProfile
    }, 'ask-the-seer-api');
    
    // Get fresh profile data if not provided
    let profile = userProfile;
    if (!profile) {
      profile = await getDocument('users', userId);
      if (!profile) {
        return NextResponse.json({
          success: false,
          error: 'User profile not found'
        }, { status: 404 });
      }
    }
    
    // Check if profile has basic required data
    if (!profile.birthDate || !profile.birthTime || !profile.birthPlace) {
      return NextResponse.json({
        success: false,
        error: 'Please complete your birth date, time, and place in your profile to use Ask the Seer'
      }, { status: 400 });
    }
    
    // Retrieve comprehensive mystical profile for richer data
    devLog.debug('🔍 [ASK-SEER] Attempting to fetch comprehensive profile for user:', userId, 'ask-the-seer');
    let comprehensiveProfile = null;
    try {
      if (!adminDb) {
        console.error('❌ [ASK-SEER] Firebase Admin DB not initialized');
        throw new Error('Firebase Admin not available');
      }
      
      devLog.debug('🔍 [ASK-SEER] Using Firebase Admin SDK', undefined, 'ask-the-seer');
      
      const comprehensiveRef = adminDb.collection('comprehensiveMysticalProfiles').doc(userId);
      devLog.debug('🔍 [ASK-SEER] Document reference created for path:', `comprehensiveMysticalProfiles/${userId}`, 'ask-the-seer');
      
      const comprehensiveSnap = await comprehensiveRef.get();
      devLog.debug('🔍 [ASK-SEER] Firestore fetch completed, exists:', comprehensiveSnap.exists, 'ask-the-seer');
      
      if (comprehensiveSnap.exists) {
        comprehensiveProfile = comprehensiveSnap.data();
        const toolCount = comprehensiveProfile ? Object.keys(comprehensiveProfile).filter(k => !['userId', 'lastUpdated', 'userProfile', 'generatedAt', 'dataQuality', 'source', 'cacheExpiry'].includes(k)).length : 0;
        devLog.info('✅ [ASK-SEER] Comprehensive profile loaded with', toolCount, 'ask-the-seer');
        devLog.debug('🔍 [ASK-SEER] Available tools:', comprehensiveProfile ? Object.keys(comprehensiveProfile).filter(k => !['userId', 'lastUpdated', 'userProfile', 'generatedAt', 'dataQuality', 'source', 'cacheExpiry'].includes(k)) : [], 'ask-the-seer');
        
        log.info('✅ Comprehensive profile loaded', { 
          toolsAvailable: toolCount,
          tools: comprehensiveProfile ? Object.keys(comprehensiveProfile).slice(0, 10) : []
        }, 'ask-the-seer-api');
      } else {
        devLog.warn('⚠️ [ASK-SEER] No comprehensive profile found in Firestore for user:', userId, 'ask-the-seer');
        devLog.info('💡 [ASK-SEER] User needs to visit /profile page to generate comprehensive profile', undefined, 'ask-the-seer');
        log.warn('⚠️ No comprehensive profile found - will use basic profile only', { userId }, 'ask-the-seer-api');
      }
    } catch (error) {
      console.error('❌ [ASK-SEER] Failed to load comprehensive profile:', error);
      devLog.debug('❌ [ASK-SEER] Error details:', error instanceof Error ? error.message : error, 'ask-the-seer');
      log.error('Failed to load comprehensive profile', error, 'ask-the-seer-api');
    }
    
    devLog.debug('🔍 [ASK-SEER] Comprehensive profile status:', comprehensiveProfile ? 'LOADED' : 'NULL', 'ask-the-seer');
    
    // Build contextual information for AI
    const contextualInfo = [];
    
    // Personal context
    if (profile.relationshipStatus) {
      switch (profile.relationshipStatus) {
        case 'married':
          contextualInfo.push('User is married - focus on partnership harmony, family life, and existing relationships rather than new romance');
          break;
        case 'in-relationship':
          contextualInfo.push('User is in a relationship - consider both personal growth and relationship dynamics');
          break;
        case 'single':
          contextualInfo.push('User is single - can include romantic guidance and relationship opportunities');
          break;
        case 'divorced':
          contextualInfo.push('User is divorced - focus on healing, personal growth, and future relationships');
          break;
        case 'widowed':
          contextualInfo.push('User is widowed - be sensitive about loss and focus on healing and new beginnings');
          break;
      }
    }
    
    if (profile.hasChildren) {
      contextualInfo.push(`User has ${profile.numberOfChildren || ''} children - include family considerations and parental guidance`);
    }
    
    if (profile.divinationInterests?.length) {
      contextualInfo.push(`User is interested in: ${profile.divinationInterests.join(', ')} - incorporate these tools in responses when relevant`);
    }
    
    // Build comprehensive context for AI
    const context = {
      userProfile: {
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        birthPlace: profile.birthPlace,
        gender: profile.gender,
        fullName: profile.fullName,
        displayName: profile.displayName
      },
      personalContext: contextualInfo,
      question: question.trim()
    };
    
    // Call your internal comprehensive Seer API
    log.info('📡 Calling internal Seer API', { userId }, 'ask-the-seer-api');

    const seerApiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/seer/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        query: question.trim(),
        context: {
          userProfile: profile,  // Send the full profile
          chartData: profile.chartData || null,  // Add this - pass pre-gen chart if available
          comprehensiveProfile: comprehensiveProfile,  // Add this
          personal_context: contextualInfo,
          session_id: `session_${Date.now()}`
        }
      })
    });

    if (!seerApiResponse.ok) {
      const errorText = await seerApiResponse.text();
      throw new Error(`Seer API error: ${seerApiResponse.status} - ${errorText}`);
    }

    const seerResult = await seerApiResponse.json();

    if (!seerResult.success) {
      throw new Error(seerResult.error || 'Seer API failed');
    }

    // Extract the comprehensive response
    const seerData = seerResult.data;
    const answer = seerData.response || seerData.answer || 'I apologize, but I\'m having trouble processing your question right now.';

    // Build response with all the rich data
    const response = {
      answer: answer,
      confidence: seerData.confidence || 0.8,
      sources: seerData.source_badges || seerData.sources || [],
      celebrityMatches: seerData.celebrityMatches,
      dailyInsight: seerData.dailyInsight,
      protectionGuidance: seerData.protectionGuidance,
      spiritualGuidance: seerData.spiritualGuidance,
      timingPredictions: seerData.timingPredictions,
      support: seerData.support,
      actions: seerData.actions,
      warnings: seerData.warnings,
      systemAgreements: seerData.systemAgreements,
      crossSystemValidation: seerData.crossSystemValidation,
      relatedTopics: seerData.relatedTopics,
      followUpSuggestions: seerData.followUpSuggestions,
      relatedTools: profile.divinationInterests || seerData.source_badges,
      timestamp: new Date().toISOString()
    };

    log.success('✅ Ask the Seer response generated from internal API', {
      userId,
      confidence: response.confidence,
      sourcesUsed: response.sources.length,
      hasActions: response.actions?.length > 0,
      hasCelebrityMatches: response.celebrityMatches?.length > 0
    }, 'ask-the-seer-api');
    
    return NextResponse.json({
      success: true,
      data: response
    });
    
  } catch (error: any) {
    log.error('❌ Ask the Seer error', error, 'ask-the-seer-api');
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process question'
    }, { status: 500 });
  }
}
