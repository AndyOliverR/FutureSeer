import { NextRequest, NextResponse } from 'next/server';
import { createAICompletion } from '@/lib/aiGateway';
import { extractUserContext, buildContextString } from '@/lib/energyHealing/userProfileExtractor';
import { getAllDivinationData } from '@/lib/universalDataAggregator';
import { devLog } from '@/lib/devLogger';

interface EnergyHealingRequest {
  method: 'chakra' | 'aura' | 'reiki' | 'crystal' | 'energy';
  userProfile: any;
  imageUrl?: string;
  question?: string;
}

interface EnergyHealingResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { method, userProfile, imageUrl, question }: EnergyHealingRequest = await request.json();

    if (!method) {
      return NextResponse.json(
        { success: false, error: 'Healing method is required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GROQ_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Extract user context for personalization
    let astroData = null;
    try {
      // Try to fetch astrological data if birth place is available
      if (userProfile?.birthPlace && userProfile?.birthDate) {
        astroData = await getAllDivinationData(userProfile).catch(() => null);
      }
    } catch (error) {
      devLog.warn('⚠️ Could not fetch astrological data, using minimal context:', error, 'energy-healing');
    }

    const userContext = extractUserContext(userProfile, astroData);
    const personalizedContext = buildContextString(userContext, method);

    devLog.info(`✨ Analyzing ${method} with personalized context for ${userContext.age}-year-old ${userContext.gender}`, undefined, 'energy-healing');

    // Build concise prompt based on method
    let basePrompt = '';
    
    switch (method) {
      case 'chakra':
        basePrompt = `Analyze 7 chakras for energy healing. Return JSON only:

CHAKRAS: root, sacral, solarPlexus, heart, throat, thirdEye, crown
Each: balance (0-100), status (balanced/overactive/underactive/blocked), interpretation

OVERALL: overallBalance (0-100), recommendations[]

Use brief interpretations. Return JSON.`;
        break;
        
      case 'aura':
        basePrompt = `Analyze aura layers for personalized energy reading. Return JSON with detailed interpretations.

Required JSON structure:
{
  "layers": [
    {
      "name": "Physical Layer",
      "color": "blue|green|purple|yellow|red|orange|white|pink",
      "thickness": "thin|medium|thick",
      "clarity": "clear|cloudy|vibrant",
      "interpretation": "Detailed personalized interpretation based on user profile"
    },
    {
      "name": "Etheric Layer",
      "color": "blue|green|gray|yellow|red",
      "thickness": "thin|medium|thick",
      "clarity": "clear|cloudy|vibrant",
      "interpretation": "Detailed personalized interpretation"
    },
    {
      "name": "Emotional Layer",
      "color": "pink|red|orange|yellow|blue|green|purple|brown|gray",
      "thickness": "thin|medium|thick",
      "clarity": "clear|cloudy|vibrant",
      "interpretation": "Detailed personalized interpretation"
    },
    {
      "name": "Mental Layer",
      "color": "yellow|blue|green|orange|purple|gray|brown",
      "thickness": "thin|medium|thick",
      "clarity": "clear|cloudy|vibrant",
      "interpretation": "Detailed personalized interpretation"
    }
  ],
  "dominantColor": "primary color",
  "interpretation": "Comprehensive personalized aura interpretation considering astrological influences and user profile",
  "recommendations": ["Specific personalized recommendation 1", "Specific personalized recommendation 2", "Specific personalized recommendation 3"]
}

Provide detailed, personalized interpretations for each layer based on the user's astrological profile and characteristics. Return JSON only.`;
        break;
        
      case 'reiki':
        basePrompt = `Analyze Reiki energy. Return JSON only:

ENERGY: energyLevel (high/medium/low), blockages[], recommendedSymbols[], treatmentAreas[], interpretation, recommendations[]

Use brief interpretations. Return JSON.`;
        break;
        
      case 'crystal':
        basePrompt = `Recommend crystals for energy healing. Return JSON only:

CRYSTALS: array of {name, priority (high/medium/low), reason}
PRIMARY: primaryCrystal name
INTERPRETATION: brief explanation
RECOMMENDATIONS: array of usage tips

Return JSON.`;
        break;
        
      case 'energy':
        basePrompt = `Analyze overall energy balance. Return JSON only:

BALANCE: overallBalance (0-100), chakraBalance (0-100), auraHealth (0-100)
FLOW: energyFlow (excellent/good/needs_attention/blocked)
BLOCKAGES: array of blockage descriptions
RECOMMENDATIONS: array of balancing techniques
TECHNIQUES: array of recommended practices

Return JSON.`;
        break;
    }

    // Append personalized context to prompt
    const analysisPrompt = `${basePrompt}\n\nUser Context: ${personalizedContext}`;

    // Log prompt length for debugging
    const promptLength = analysisPrompt.length;
    devLog.debug(`📏 Prompt length: ${promptLength} characters (~${Math.ceil(promptLength / 4)} tokens)`, undefined, 'energy-healing');

    const result = await createAICompletion({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      maxTokens: method === 'aura' ? 800 : 500, // Allow more tokens for detailed aura analysis
      response_format: { type: 'json_object' }
    });

    const analysisText = result.content || '';
    
    if (!analysisText) {
      throw new Error('Empty response from Groq API');
    }

    // Parse JSON response
    let healingData: any;
    try {
      healingData = JSON.parse(analysisText);
      
      // Log response structure for debugging (especially for aura)
      if (method === 'aura') {
        devLog.debug('📊 Aura API response structure:', {
          hasLayers: !!healingData.layers,
          layersType: typeof healingData.layers,
          isArray: Array.isArray(healingData.layers),
          layersLength: Array.isArray(healingData.layers) ? healingData.layers.length : 'N/A',
          dominantColor: healingData.dominantColor,
          hasInterpretation: !!healingData.interpretation,
          hasRecommendations: !!healingData.recommendations
        }, 'energy-healing');
      }
    } catch (parseError) {
      console.error('Failed to parse Groq response:', parseError);
      devLog.debug('Raw response:', analysisText, 'energy-healing');
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || analysisText.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        healingData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Invalid JSON response from Groq API');
      }
    }

    devLog.info(`✅ ${method} analysis completed successfully`, undefined, 'energy-healing');

    return NextResponse.json({
      success: true,
      data: healingData
    } as EnergyHealingResponse);

  } catch (error: any) {
    // Check for context length errors specifically
    if (error.message?.includes('context_length_exceeded') || 
        error.message?.includes('reduce the length')) {
      console.error('❌ Groq API context length exceeded. Prompt too long.');
      return NextResponse.json(
        {
          success: false,
          error: 'Analysis request too complex. Please try again or simplify the request.'
        },
        { status: 400 }
      );
    }
    
    console.error(`❌ ${method} analysis error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze energy healing'
      },
      { status: 500 }
    );
  }
}
