import { extractIntentAndSlots, QueryAnalysis } from './intentExtractor';
import { devLog } from '@/lib/devLogger';
import { selectRelevantModules, ModuleSelection } from './toolSelector';
import { aggregateEvidence, AggregatedEvidence } from './evidenceAggregator';
import { generateSeerResponse, SeerResponse, SynthesisContext } from './synthesisEngine';

export interface ChatMessage {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    sources?: string[];
    timing?: [string, string];
  };
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  user_profile?: any;
  created_at: Date;
  updated_at: Date;
}

export interface SeerQueryRequest {
  user_id: string;
  query: string;
  context?: {
    birth_data?: any;
    previous_answers?: any[];
    session_id?: string;
  };
}

export interface SeerQueryResponse {
  verdict: string;
  timing_window?: [string, string];
  confidence: number;
  support: Array<{
    module: string;
    summary: string;
    strength: number;
  }>;
  actions: string[];
  clarify?: string | null;
  primary_themes: string[];
  warnings: string[];
  conflicting_signals: boolean;
  source_badges: string[];
  session_id: string;
  processing_time: number;
}

export class SeerChatbot {
  private sessions: Map<string, ChatSession> = new Map();
  
  constructor() {
    // Initialize any required services
  }
  
  async processQuery(request: SeerQueryRequest): Promise<SeerQueryResponse> {
    const startTime = Date.now();
    
    try {
      // Step 1: Extract intent and slots from user query
      const queryAnalysis = extractIntentAndSlots(request.query);
      devLog.debug('Query Analysis:', queryAnalysis);
      
      // Step 2: Select relevant divination modules
      const moduleSelection = selectRelevantModules(queryAnalysis.slots);
      devLog.debug('Module Selection:', moduleSelection);
      
      // Step 3: Aggregate evidence from selected modules
      const allModules = [...moduleSelection.primary_modules, ...moduleSelection.secondary_modules];
      const evidence = await aggregateEvidence(allModules, queryAnalysis.slots.intent, request.context?.birth_data);
      devLog.debug('Aggregated Evidence:', evidence);
      
      // Step 4: Generate comprehensive response
      const synthesisContext: SynthesisContext = {
        user_query: request.query,
        intent_slots: queryAnalysis.slots,
        evidence: evidence,
        user_profile: request.context?.birth_data
      };
      
      const seerResponse = generateSeerResponse(synthesisContext);
      
      // Step 5: Create response object
      const response: SeerQueryResponse = {
        ...seerResponse,
        session_id: request.context?.session_id || this.generateSessionId(),
        processing_time: Date.now() - startTime
      };
      
      // Step 6: Store in session history
      this.storeMessage(request.context?.session_id, request.query, response);
      
      return response;
      
    } catch (error) {
      devLog.error('Error processing query:', error, 'seerChatbot');
      throw new Error(`Failed to process query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private storeMessage(sessionId: string | undefined, userQuery: string, seerResponse: SeerQueryResponse) {
    const session = sessionId ? this.getOrCreateSession(sessionId) : this.createNewSession();
    
    // Add user message
    session.messages.push({
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: userQuery,
      timestamp: new Date()
    });
    
    // Add seer response
    session.messages.push({
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'seer',
      content: this.formatSeerResponse(seerResponse),
      timestamp: new Date(),
      metadata: {
        intent: seerResponse.source_badges[0],
        confidence: seerResponse.confidence,
        sources: seerResponse.source_badges,
        timing: seerResponse.timing_window
      }
    });
    
    session.updated_at = new Date();
  }
  
  private formatSeerResponse(response: SeerQueryResponse): string {
    let formatted = `🔮 **${response.verdict}**\n\n`;
    
    if (response.support.length > 0) {
      formatted += `✨ **Supporting Factors:**\n`;
      response.support.forEach(support => {
        formatted += `• ${support.module}: ${support.summary}\n`;
      });
      formatted += '\n';
    }
    
    if (response.warnings.length > 0) {
      formatted += `⚠️ **Considerations:**\n`;
      response.warnings.forEach(warning => {
        formatted += `• ${warning}\n`;
      });
      formatted += '\n';
    }
    
    if (response.actions.length > 0) {
      formatted += `🎯 **Recommended Actions:**\n`;
      response.actions.forEach(action => {
        formatted += `• ${action}\n`;
      });
      formatted += '\n';
    }
    
    formatted += `📊 **Sources:** ${response.source_badges.join(', ')}`;
    
    if (response.clarify) {
      formatted += `\n\n❓ **Clarification needed:** ${response.clarify}`;
    }
    
    return formatted;
  }
  
  private getOrCreateSession(sessionId: string): ChatSession {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        id: sessionId,
        messages: [],
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    return this.sessions.get(sessionId)!;
  }
  
  private createNewSession(): ChatSession {
    const sessionId = this.generateSessionId();
    const session: ChatSession = {
      id: sessionId,
      messages: [],
      created_at: new Date(),
      updated_at: new Date()
    };
    this.sessions.set(sessionId, session);
    return session;
  }
  
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }
  
  getSessionHistory(sessionId: string): ChatMessage[] {
    const session = this.getSession(sessionId);
    return session ? session.messages : [];
  }
  
  // Test the complete chatbot pipeline
  async testChatbot() {
    const testQueries = [
      "Will the MSME grant arrive in December?",
      "When is the best time for my career breakthrough?",
      "Are we compatible for marriage?",
      "Will my health improve this month?",
      "When should I travel abroad for business?"
    ];
    
    devLog.debug('🧪 Testing Seer Chatbot Pipeline\n');
    
    for (const query of testQueries) {
      devLog.debug(`\n📝 Query: "${query}"`);
      devLog.debug('─'.repeat(50));
      
      try {
        const request: SeerQueryRequest = {
          user_id: 'test_user',
          query: query,
          context: {
            session_id: 'test_session'
          }
        };
        
        const response = await this.processQuery(request);
        
        devLog.debug(`🔮 Verdict: ${response.verdict}`);
        devLog.debug(`📊 Confidence: ${Math.round(response.confidence * 100)}%`);
        devLog.debug(`⏰ Timing: ${response.timing_window ? response.timing_window.join(' to ') : 'Not specified'}`);
        devLog.debug(`🎯 Actions: ${response.actions.slice(0, 2).join(', ')}`);
        devLog.debug(`📋 Sources: ${response.source_badges.join(', ')}`);
        
        if (response.warnings.length > 0) {
          devLog.debug(`⚠️ Warnings: ${response.warnings.join(', ')}`);
        }
        
        if (response.clarify) {
          devLog.debug(`❓ Clarification: ${response.clarify}`);
        }
        
      } catch (error) {
        devLog.error(`❌ Error processing query: ${error}`, undefined, 'seerChatbot');
      }
    }
    
    devLog.debug('\n✅ Chatbot testing completed!');
  }
}

// Export a singleton instance
export const seerChatbot = new SeerChatbot();

// Test function for immediate execution
export async function testSeerChatbot() {
  await seerChatbot.testChatbot();
} 