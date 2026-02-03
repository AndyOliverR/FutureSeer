import { NextRequest, NextResponse } from 'next/server';
import { seerChatbot, SeerQueryRequest } from '@/lib/seerChatbot/seerChatbot';
import { getUserProfile, isProfileComplete } from '@/lib/firebase';
import { getDocument } from '@/lib/firebase-admin';
import { getAllDivinationData, getCachedDivinationData, setCachedDivinationData } from '@/lib/universalDataAggregator';
import { ComprehensiveSeerEngine } from '@/lib/comprehensiveSeerEngine';
import { decomposeQuery } from '@/lib/universalSeerDecomposition';
import { devLog } from '@/lib/devLogger';
import { ConversationalMemory, MemoryMessage } from '@/lib/conversationalMemory';
import { createAICompletion } from '@/lib/aiGateway';

/** Stub for recording timing predictions for future Brier/Log loss or calibration. No persistence in this step. */
function recordPredictionForScoring(_payload: { userId: string; queryId?: string; recommendedDate: string; confidenceBand?: { low: number; high: number }; timestamp: number }) {
  // When outcome collection and scoring are added, persist _payload and later compute Brier/Log loss.
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, query, context } = body;
    const providedProfile = context?.userProfile || context?.birth_data;

    devLog.info('🔮 Comprehensive Seer API: Processing query for user:', user_id, 'seer');
    devLog.debug('📝 Query:', query, 'seer');

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

    // Use provided profile or fetch from Firebase Admin
    let userProfile = providedProfile;

    if (!userProfile) {
      devLog.debug('📂 No profile provided, fetching from Firebase Admin...', undefined, 'seer');
      userProfile = await getUserProfile(user_id);
      if (!userProfile) {
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        );
      }
    } else {
      devLog.info('✅ Using provided user profile from context', undefined, 'seer');
    }

    if (!isProfileComplete(userProfile)) {
      return NextResponse.json(
        { error: 'Complete birth profile required. Please complete your profile first.' },
        { status: 400 }
      );
    }

    devLog.info('✅ Profile validation passed', undefined, 'seer');

    // Question decomposition: intent, scope, timeframe, risk_level, domains_required (for jurisdiction filter)
    const decomposed = decomposeQuery(query);
    devLog.debug('📐 Decomposed query:', { intent: decomposed.intent, scope: decomposed.scope, domains_required: decomposed.domains_required }, 'seer');

    // Comprehensive profile: from context or fetch from Firestore so main Seer and expert aggregation always have user data when it exists
    let comprehensiveProfileForEngine = context?.comprehensiveProfile ?? undefined;

    // Get comprehensive divination data
    let universalData = getCachedDivinationData(user_id);
    
    if (!universalData) {
      devLog.info('🔄 [SEER-API] Generating fresh comprehensive data...', undefined, 'seer');
      devLog.debug('🔍 [SEER-API] Context has comprehensiveProfile?', !!context?.comprehensiveProfile, 'seer');

      let comprehensiveData = comprehensiveProfileForEngine;
      if (!comprehensiveData && user_id) {
        try {
          const fetched = await getDocument('comprehensiveMysticalProfiles', user_id);
          if (fetched) {
            comprehensiveData = fetched as Record<string, unknown>;
            comprehensiveProfileForEngine = comprehensiveData;
            devLog.info('✅ [SEER-API] Using comprehensive profile fetched from Firestore', undefined, 'seer');
          }
        } catch (err) {
          devLog.warn('⚠️ [SEER-API] Failed to fetch comprehensive profile from Firestore', err instanceof Error ? err.message : err, 'seer');
        }
      }

      // Build universalData from comprehensive profile (provided or fetched)
      if (comprehensiveData) {
        devLog.info('✅ [SEER-API] Using provided or fetched comprehensive profile', undefined, 'seer');
        const availableTools = Object.keys(comprehensiveData).filter(k => !['userId', 'lastUpdated', 'profile', 'userProfile', 'generatedAt', 'dataQuality', 'source', 'cacheExpiry'].includes(k));
        devLog.debug('🔍 [SEER-API] Comprehensive profile tools:', availableTools, 'seer');
        
        devLog.debug('🔍 [SEER-API] Raw comprehensive profile keys:', Object.keys(comprehensiveData), 'seer');
        devLog.debug('🔍 [SEER-API] Vedic data exists?', !!comprehensiveData.vedic, 'seer');
        devLog.debug('🔍 [SEER-API] Interpretations exist?', !!comprehensiveData.interpretations, 'seer');
        if (comprehensiveData.interpretations && typeof comprehensiveData.interpretations === 'object') {
          devLog.debug('🔍 [SEER-API] Interpretations structure:', Object.keys(comprehensiveData.interpretations as object), 'seer');
        }

        // Convert comprehensive profile to UniversalDivinationData format
        const vedic = comprehensiveData.vedic || {};
        // Derive currentDasha from dasha array when missing so engine can use TimingAnalyzer
        const hasCurrentDashaWithDates = vedic.currentDasha && typeof vedic.currentDasha.startDate === 'string' && typeof vedic.currentDasha.endDate === 'string';
        let derivedCurrentDasha = hasCurrentDashaWithDates ? vedic.currentDasha : null;
        if (!derivedCurrentDasha && Array.isArray(vedic.dasha) && vedic.dasha.length > 0) {
          const current = vedic.dasha.find((d: { isCurrent?: boolean }) => d.isCurrent === true)
            ?? vedic.dasha.find((d: { startDate?: string; endDate?: string }) => {
              if (!d.startDate || !d.endDate) return false;
              const today = new Date().toISOString().split('T')[0];
              return d.startDate <= today && today <= d.endDate;
            });
          if (current && current.startDate && current.endDate) {
            derivedCurrentDasha = {
              startDate: current.startDate,
              endDate: current.endDate,
              planet: current.planet ?? current.lord,
              mahadasha: current.planet ?? current.lord
            };
          }
        }
        const dashasPayload = vedic.dashas ?? (derivedCurrentDasha || vedic.dasha ? { currentDasha: derivedCurrentDasha ?? vedic.currentDasha, dasha: vedic.dasha } : undefined);
        universalData = {
          profile: userProfile,
          // Map 'vedic' from storage to 'vedicAstrology' for API (engine expects .dashas and .transits)
          vedicAstrology: {
            ...vedic,
            dashas: dashasPayload,
            transits: vedic.transits,
            // Map 'interpretations' to the vedicAstrology.reading structure
            ...(comprehensiveData.interpretations && {
              reading: {
                ...comprehensiveData.interpretations,
                // Map lifePurpose to karma for Seer engine compatibility
                karma: comprehensiveData.interpretations.lifePurpose || null
              }
            })
          },
          // Future systems (not yet implemented) - map from storage format
          westernAstrology: comprehensiveData.western || comprehensiveData['Western Astrology'] || {},
          kpAstrology: comprehensiveData.kp || comprehensiveData['KP Astrology'] || {},
          numerology: comprehensiveData.numerology || comprehensiveData['Numerology'] || {},
          tarot: comprehensiveData.tarot || comprehensiveData['Tarot'] || {},
          palmistry: comprehensiveData.palmistry || comprehensiveData['Palmistry'] || {},
          faceReading: comprehensiveData.faceReading || comprehensiveData['Face Reading'] || {},
          runes: comprehensiveData.runes || comprehensiveData['Runes'] || {},
          iching: comprehensiveData.iching || comprehensiveData['I Ching'] || {},
          vastuShastra: comprehensiveData.vastuShastra || comprehensiveData['Vastu Shastra'] || {},
          baziFourPillars: comprehensiveData.baziFourPillars || comprehensiveData['BaZi Four Pillars'] || {},
          humanDesign: comprehensiveData.humanDesign || comprehensiveData['Human Design'] || {},
          chaldeanNumerology: comprehensiveData.chaldeanNumerology || comprehensiveData['Chaldean Numerology'] || {},
          angelNumbers: comprehensiveData.angelNumbers || comprehensiveData['Angel Numbers'] || {},
          medicalAstrology: comprehensiveData.medicalAstrology || comprehensiveData['Medical Astrology'] || {},
          financialAstrology: comprehensiveData.financialAstrology || comprehensiveData['Financial Astrology'] || {},
          mundaneAstrology: comprehensiveData.mundaneAstrology || comprehensiveData['Mundane Astrology'] || {},
          horaryAstrology: comprehensiveData.horaryAstrology || comprehensiveData['Horary Astrology'] || {},
          synastry: comprehensiveData.synastry || comprehensiveData['Synastry'] || {},
          kabbalisticNumerology: comprehensiveData.kabbalisticNumerology || comprehensiveData['Kabbalistic Numerology'] || {},
          lenormand: comprehensiveData.lenormand || comprehensiveData['Lenormand'] || {},
          pendulum: comprehensiveData.pendulum || comprehensiveData['Pendulum'] || {},
          geomancy: comprehensiveData.geomancy || comprehensiveData['Geomancy'] || {},
          nameAnalysis: comprehensiveData.nameAnalysis || comprehensiveData['Name Analysis'] || {},
          dreamSymbols: comprehensiveData.dreamSymbols || comprehensiveData['Dream Symbols'] || {},
          vastu: comprehensiveData.vastu || comprehensiveData['Vastu'] || {},
          bazi: comprehensiveData.bazi || comprehensiveData['BaZi'] || {},
          systemsUsed: Object.keys(comprehensiveData)
            .filter(k => !['userId', 'lastUpdated', 'birthDate', 'birthPlace', 'birthTime', 'metadata'].includes(k))
            .map(k => {
              // Map storage keys to display names
              const nameMap: Record<string, string> = {
                'vedic': 'Vedic Astrology',
                'western': 'Western Astrology',
                'kp': 'KP Astrology',
                'numerology': 'Numerology',
                'tarot': 'Tarot',
                'palmistry': 'Palmistry',
                'faceReading': 'Face Reading',
                'runes': 'Runes',
                'iching': 'I Ching',
                'vastuShastra': 'Vastu Shastra',
                'baziFourPillars': 'BaZi Four Pillars',
                'humanDesign': 'Human Design',
                'chaldeanNumerology': 'Chaldean Numerology',
                'angelNumbers': 'Angel Numbers',
                'medicalAstrology': 'Medical Astrology',
                'financialAstrology': 'Financial Astrology',
                'mundaneAstrology': 'Mundane Astrology',
                'horaryAstrology': 'Horary Astrology',
                'synastry': 'Synastry',
                'kabbalisticNumerology': 'Kabbalistic Numerology',
                'lenormand': 'Lenormand',
                'pendulum': 'Pendulum',
                'geomancy': 'Geomancy',
                'nameAnalysis': 'Name Analysis',
                'dreamSymbols': 'Dream Symbols',
                'vastu': 'Vastu',
                'bazi': 'BaZi',
                'interpretations': 'Vedic Interpretations'
              };
              return nameMap[k] || k;
            }),
          confidenceScore: 0.95,
          generatedAt: new Date().toISOString(),
          dataVersion: '1.0.0'
        };
        
        devLog.debug('✅ [SEER-API] UniversalData created with systems:', universalData.systemsUsed, 'seer');
        devLog.debug('🔍 [SEER-API] UniversalData vedicAstrology has reading?', !!universalData.vedicAstrology?.reading, 'seer');
        devLog.debug('🔍 [SEER-API] UniversalData vedicAstrology has karma?', !!universalData.vedicAstrology?.reading?.karma, 'seer');
      } else {
        devLog.warn('⚠️ [SEER-API] No comprehensive profile provided or found, falling back to getAllDivinationData', undefined, 'seer');
        devLog.debug('🔍 [SEER-API] Has chartData?', !!context?.chartData, 'seer');

        // Fallback to generating data
        universalData = await getAllDivinationData(
          userProfile,
          query,
          context?.chartData
        );

        devLog.info('✅ [SEER-API] getAllDivinationData completed', undefined, 'seer');
        devLog.debug('🔍 [SEER-API] Generated systems:', universalData.systemsUsed, 'seer');
      }
      
      setCachedDivinationData(user_id, universalData);
      devLog.info('💾 [SEER-API] Cached divination data for user:', user_id, 'seer');
    } else {
      devLog.info('📦 [SEER-API] Using cached comprehensive data', undefined, 'seer');
      devLog.debug('🔍 [SEER-API] Cached systems:', universalData.systemsUsed, 'seer');
    }

    // Initialize conversational memory with cross-session context loading (non-fatal on server)
    let crossSessionContext: string | null = null;
    let memoryRef: ConversationalMemory | null = null;
    try {
      const memory = new ConversationalMemory(user_id);
      await memory.initializeAllMemory(true); // Load recent context summaries
      crossSessionContext = await memory.getCrossSessionContext();
      memoryRef = memory;
      devLog.debug('📚 [SEER-API] Cross-session context loaded', crossSessionContext ? 'Yes' : 'No', 'seer');
    } catch (memoryError) {
      console.warn('⚠️ ConversationalMemory failed (non-fatal, continuing without memory):', memoryError);
      if (memoryError instanceof Error && memoryError.stack) console.error(memoryError.stack);
    }

    // Process through comprehensive seer engine with expert aggregation
    const seerEngine = new ComprehensiveSeerEngine(
      universalData,
      user_id,
      comprehensiveProfileForEngine
    );
    
    // Enhance query with in-session conversation history and/or cross-session context
    const conversationHistory = context?.conversationHistory as Array<{ type: 'user' | 'seer'; content: string }> | undefined;
    const hasConversationHistory = Array.isArray(conversationHistory) && conversationHistory.length > 0;
    const conversationBlock = hasConversationHistory
      ? conversationHistory.map((m) => `${m.type === 'user' ? 'User' : 'Seer'}: ${(m.content || '').trim()}`).join('\n')
      : '';
    const enhancedQuery = conversationBlock
      ? `Previous conversation:\n${conversationBlock}\n\nCurrent question: ${query}`
      : crossSessionContext
        ? `${query}\n\nPrevious Context:\n${crossSessionContext}`
        : query;

    // Engine receives current question and optional decomposed query (jurisdiction + synthesis-without-collapse)
    if (hasConversationHistory) devLog.debug('📚 [SEER-API] Conversation context (for logging):', enhancedQuery?.slice(0, 200), 'seer');
    const comprehensiveResponse = await seerEngine.answerQuestion(query, decomposed);

    // Optional Groq synthesis: turn engine output into a short, analytical answer (keep recommendedDate, sources, confidence)
    // Skip Groq for remedy/gemstone answers so engine's confident referral or concrete recommendation is preserved
    let answerForResponse: string = comprehensiveResponse.answer ?? '';
    const skipGroqForRemedy = (comprehensiveResponse as { remedyAnswer?: boolean }).remedyAnswer === true;
    if (!skipGroqForRemedy && process.env.GROQ_API_KEY && typeof comprehensiveResponse.answer === 'string' && comprehensiveResponse.answer.trim().length > 0) {
      try {
        const universalSeerSystemPrompt = [
          'You are the Universal Seer: a concise mystical advisor that synthesizes multiple symbolic systems.',
          'Prime Law: No system may answer outside its epistemic jurisdiction. Contradiction only exists when context is missing; your role is to restore context.',
          'Given the user question and the analysis data below, write a short (2–4 sentences) answer that cites only the reasons stated in the data.',
          'Do not invent reasons or favorability. Do not choose a winner, vote, average answers, or say "ignore X". Use language like "This system addresses…", "In contrast…", "Together, this suggests…".',
          'If the analysis says we cannot calculate or rate something (e.g. missing chart), say so; do not claim favorability when the data did not calculate it.',
          'Frame confidence as a probability band; do not claim deterministic prediction. Tone: calm, explanatory, layered, non-absolute. Be direct and concise.'
        ].join(' ');
        const groqResult = await createAICompletion({
          model: 'groq/llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: universalSeerSystemPrompt
            },
            {
              role: 'user',
              content: `User question: ${query}\n\nAnalysis data:\n${comprehensiveResponse.answer}${comprehensiveResponse.recommendedDate ? `\nRecommended date: ${comprehensiveResponse.recommendedDate}` : ''}\nSources: ${(comprehensiveResponse.sources || []).join(', ')}.`
            }
          ],
          maxTokens: 400,
          temperature: 0.5
        });
        const groqContent = groqResult?.content?.trim();
        if (groqContent) answerForResponse = groqContent;
      } catch (_err) {
        // Keep engine answer on Groq failure
      }
    }

    // Store conversation in memory (only if memory initialized)
    const userMessage: MemoryMessage = {
      id: `msg_${Date.now()}_user`,
      timestamp: Date.now(),
      type: 'user',
      content: query,
      questionType: 'general', // Placeholder - will be determined by seer engine
      keywords: query.split(' ').slice(0, 5) // Simple keyword extraction
    };

    const seerMessage: MemoryMessage = {
      id: `msg_${Date.now()}_seer`,
      timestamp: Date.now(),
      type: 'seer',
      content: answerForResponse,
      questionType: userMessage.questionType,
      confidence: comprehensiveResponse.confidence,
      sources: comprehensiveResponse.sources
    };

    if (memoryRef) {
      try {
        await memoryRef.addExchange(userMessage);
        await memoryRef.addExchange(seerMessage);
        memoryRef.addRecentQuestion(query);
        await memoryRef.saveAllMemory();
      } catch (saveErr) {
        console.warn('⚠️ ConversationalMemory save failed (non-fatal):', saveErr);
      }
    }

    // Also process through legacy seer chatbot for compatibility
    const seerRequest: SeerQueryRequest = {
      user_id,
      query: query.trim(),
      context: {
        ...context,
        session_id: context?.session_id || `comprehensive_${Date.now()}`,
        birth_data: userProfile,
        universal_data: universalData
      }
    };

    const legacyResponse = await seerChatbot.processQuery(seerRequest);

    const hasComprehensiveAnswer = answerForResponse.trim().length > 0;
    const useComprehensiveForVerdict = hasComprehensiveAnswer;

    const verdict = useComprehensiveForVerdict
      ? (answerForResponse.length > 500
          ? answerForResponse.split(/\n\n+/)[0]?.trim() || answerForResponse.slice(0, 500)
          : answerForResponse)
      : legacyResponse.verdict;

    const support = useComprehensiveForVerdict && Array.isArray(comprehensiveResponse.sources)
      ? comprehensiveResponse.sources.map((s: string, i: number) => ({
          module: s,
          summary: (comprehensiveResponse as { supportSummaries?: string[] }).supportSummaries?.[i] ?? s,
          strength: comprehensiveResponse.confidence ?? 0.8
        }))
      : legacyResponse.support;

    const timingWindow = useComprehensiveForVerdict && (comprehensiveResponse as { recommendedDate?: string }).recommendedDate
      ? [(comprehensiveResponse as { recommendedDate: string }).recommendedDate, (comprehensiveResponse as { recommendedDate: string }).recommendedDate] as [string, string]
      : legacyResponse.timing_window;

    const actions = useComprehensiveForVerdict && Array.isArray(comprehensiveResponse.followUpSuggestions)
      ? comprehensiveResponse.followUpSuggestions.slice(0, 4)
      : legacyResponse.actions;
    const warnings = useComprehensiveForVerdict ? [] : legacyResponse.warnings;

    // Combine responses for maximum compatibility
    const combinedResponse = {
      ...legacyResponse,
      verdict,
      support,
      timing_window: timingWindow,
      actions,
      warnings,
      response: answerForResponse,
      answer: answerForResponse,
      confidence: comprehensiveResponse.confidence,
      source_badges: comprehensiveResponse.sources,
      sources: comprehensiveResponse.sources,
      celebrityMatches: comprehensiveResponse.celebrityMatches,
      dailyInsight: comprehensiveResponse.dailyInsight,
      protectionGuidance: comprehensiveResponse.protectionGuidance,
      spiritualGuidance: comprehensiveResponse.spiritualGuidance,
      systemAgreements: comprehensiveResponse.systemAgreements,
      timingPredictions: comprehensiveResponse.timingPredictions,
      crossSystemValidation: comprehensiveResponse.crossSystemValidation,
      relatedTopics: comprehensiveResponse.relatedTopics,
      followUpSuggestions: comprehensiveResponse.followUpSuggestions,
      timingDetail: (comprehensiveResponse as { timingDetail?: string }).timingDetail,
      recommendedDate: (comprehensiveResponse as { recommendedDate?: string }).recommendedDate,
      confidenceBand: (comprehensiveResponse as { confidenceBand?: { low: number; high: number } }).confidenceBand,
      primarySecondarySystems: (comprehensiveResponse as { primarySecondarySystems?: { primary: string[]; secondary: string[] } }).primarySecondarySystems,
      // Expert aggregation data
      expertResponses: comprehensiveResponse.expertResponses,
      expertConsensus: comprehensiveResponse.expertConsensus,
      primaryExpert: comprehensiveResponse.primaryExpert,
      metadata: {
        systemsUsed: universalData.systemsUsed,
        dataConfidence: universalData.confidenceScore,
        processingTime: Date.now(),
        memoryContext: memoryRef?.getContextForQuestion(userMessage.questionType || 'general') ?? null,
        expertCount: comprehensiveResponse.expertResponses?.length || 0,
        userProfile: {
          name: userProfile.fullName,
          birthDate: userProfile.birthDate,
          birthTime: userProfile.birthTime,
          birthPlace: userProfile.birthPlace
        }
      }
    };

    if ((comprehensiveResponse as { recommendedDate?: string }).recommendedDate) {
      recordPredictionForScoring({
        userId: user_id,
        recommendedDate: (comprehensiveResponse as { recommendedDate: string }).recommendedDate,
        confidenceBand: (comprehensiveResponse as { confidenceBand?: { low: number; high: number } }).confidenceBand,
        timestamp: Date.now()
      });
    }

    devLog.info('✅ Comprehensive response generated with confidence:', comprehensiveResponse.confidence, 'seer');

    return NextResponse.json({
      success: true,
      data: combinedResponse
    });

  } catch (error) {
    console.error('❌ Comprehensive Seer API Error:', error);
    if (error instanceof Error && error.stack) console.error(error.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to process your mystical query',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
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