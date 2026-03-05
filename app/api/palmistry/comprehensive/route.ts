import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAICompletion } from '@/lib/aiGateway';
import { getAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, palmistryData, userProfile } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!palmistryData) {
      return NextResponse.json(
        { success: false, error: 'Palmistry data is required' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 }
      );
    }

    // Check cache first
    try {
      const cacheRef = adminDb
        .collection('users')
        .doc(userId)
        .collection('palmistry-comprehensive')
        .doc('latest');
      
      const cacheDoc = await cacheRef.get();
      
      if (cacheDoc.exists) {
        const cached = cacheDoc.data();
        // Return cached if less than 7 days old
        if (cached && cached.timestamp && (Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000)) {
          devLog.debug('✅ Returning cached comprehensive palmistry analysis');
          return NextResponse.json({
            success: true,
            data: cached.analysis,
            cached: true
          });
        }
      }
    } catch (cacheError) {
      devLog.warn('Cache check failed, continuing with fresh analysis:', cacheError, 'route');
    }

    devLog.debug('🔮 Generating comprehensive palmistry analysis...');

    // Build comprehensive analysis prompt
    const analysisPrompt = `You are an expert palmist providing a comprehensive palm reading analysis. Analyze the following palm data and provide detailed, insightful interpretations.

Palm Data:
- Hand: ${palmistryData.hand || 'Not specified'}
- Palm Shape: ${palmistryData.palmShape || 'Not specified'}
- Primary Element: ${palmistryData.elements?.primary || 'Not specified'}
- Energy Score: ${palmistryData.energyScore || 0}/100

Lines:
${palmistryData.lines?.map((line: any) => `- ${line.name}: ${line.length} length, ${line.depth} depth, ${line.quality} quality
  Interpretation: ${line.interpretation}`).join('\n') || 'No line data'}

Mounts:
${palmistryData.mounts?.map((mount: any) => `- ${mount.name}: ${mount.prominence} prominence
  Interpretation: ${mount.interpretation}`).join('\n') || 'No mount data'}

Fingers:
${palmistryData.fingers ? Object.entries(palmistryData.fingers).map(([name, data]: [string, any]) => 
  `- ${name}: ${data.length} length, ${data.flexibility} flexibility`).join('\n') : 'No finger data'}

Current Life Phase: ${palmistryData.timing?.currentPhase || 'Not specified'}

Please provide a comprehensive analysis in the following JSON structure:
{
  "overallReading": "A comprehensive 3-4 paragraph overview of the person's palm reading, their core nature, life path, and key characteristics",
  "lifePath": "Detailed analysis of their life journey, purpose, and destiny based on all palm features",
  "strengths": ["List 5-7 key strengths revealed by the palm"],
  "challenges": ["List 5-7 challenges or areas for growth"],
  "relationships": "Detailed analysis of relationship patterns, emotional nature, and love life based on Heart Line and related features",
  "career": "Detailed career guidance based on Head Line, Fate Line, and relevant mounts",
  "health": "Health insights based on Life Line and other relevant indicators",
  "timing": {
    "currentYear": "What to focus on this year based on palm timing",
    "nextThreeYears": "Major themes for the next three years",
    "opportunities": ["List 3-5 upcoming opportunities"],
    "challenges": ["List 3-5 challenges to watch for"]
  },
  "remedies": ["List 5-8 specific remedies, practices, or actions to enhance positive traits and address challenges"],
  "spiritualGuidance": "Spiritual insights and guidance for personal growth",
  "keyInsights": ["List 5-7 most important takeaways from the reading"]
}

Provide only valid JSON in your response.`;

    const result = await createAICompletion({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert palmist with deep knowledge of palmistry traditions. Provide comprehensive, insightful, and practical guidance.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.7,
      maxTokens: 2000,
      response_format: { type: 'json_object' }
    });

    const analysisText = result.content || '{}';
    
    if (!analysisText) {
      throw new Error('Empty response from AI');
    }

    // Parse JSON response
    let comprehensiveAnalysis: any;
    try {
      comprehensiveAnalysis = JSON.parse(analysisText);
    } catch (parseError) {
      devLog.error('Failed to parse AI response:', parseError, 'route');
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || analysisText.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        comprehensiveAnalysis = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    // Validate and provide defaults
    const validatedAnalysis = {
      overallReading: comprehensiveAnalysis.overallReading || 'Your palm reveals a unique combination of traits and potential.',
      lifePath: comprehensiveAnalysis.lifePath || 'Your life path is one of growth and discovery.',
      strengths: comprehensiveAnalysis.strengths || ['Natural abilities', 'Inner strength', 'Adaptability'],
      challenges: comprehensiveAnalysis.challenges || ['Areas for growth', 'Learning opportunities'],
      relationships: comprehensiveAnalysis.relationships || 'Your Heart Line indicates a capacity for deep connections.',
      career: comprehensiveAnalysis.career || 'Your palm suggests various career paths aligned with your talents.',
      health: comprehensiveAnalysis.health || 'Your Life Line indicates vitality and energy.',
      timing: {
        currentYear: comprehensiveAnalysis.timing?.currentYear || 'Focus on personal growth this year.',
        nextThreeYears: comprehensiveAnalysis.timing?.nextThreeYears || 'The coming years bring opportunities for development.',
        opportunities: comprehensiveAnalysis.timing?.opportunities || ['Personal growth', 'New connections', 'Career advancement'],
        challenges: comprehensiveAnalysis.timing?.challenges || ['Patience required', 'Balance needed']
      },
      remedies: comprehensiveAnalysis.remedies || ['Practice mindfulness', 'Develop strengths', 'Address challenges'],
      spiritualGuidance: comprehensiveAnalysis.spiritualGuidance || 'Trust in your unique path and inner wisdom.',
      keyInsights: comprehensiveAnalysis.keyInsights || ['You have unique gifts', 'Growth is continuous', 'Trust your journey']
    };

    // Cache the result
    try {
      const cacheRef = adminDb
        .collection('users')
        .doc(userId)
        .collection('palmistry-comprehensive')
        .doc('latest');
      
      await cacheRef.set({
        analysis: validatedAnalysis,
        timestamp: Date.now(),
        palmDataSnapshot: {
          hand: palmistryData.hand,
          palmShape: palmistryData.palmShape,
          energyScore: palmistryData.energyScore
        }
      });
      
      devLog.debug('✅ Cached comprehensive palmistry analysis');
    } catch (cacheError) {
      devLog.warn('Failed to cache analysis:', cacheError, 'route');
    }

    return NextResponse.json({
      success: true,
      data: validatedAnalysis,
      cached: false,
      _usage: result.usage,
    });

  } catch (error: any) {
    devLog.error('Comprehensive palmistry API error:', error, 'route');
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate comprehensive analysis' 
      },
      { status: 500 }
    );
  }
}
