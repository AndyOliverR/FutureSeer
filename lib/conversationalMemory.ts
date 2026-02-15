// Conversational Memory System for Ask the Seer
// Implements Working, Short-term, Long-term, Episodic, and Procedural memory

import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from './firebase';

export interface MemoryMessage {
  id: string;
  timestamp: number;
  type: 'user' | 'seer';
  content: string;
  questionType?: string;
  keywords?: string[];
  confidence?: number;
  sources?: string[];
}

/** Session state for Seer conversation layer (Phase 2). */
export interface SeerSessionState {
  questionType?: string;
  emotionalWeight?: 'low' | 'medium' | 'high';
  certaintyLevel?: 'exploring' | 'confirming' | 'concluding';
  systemConfidence?: number;
  lastThemes?: string[];
  /** Intent router: active intent for this session. */
  activeIntent?: string;
  /** Intent router: active sub-intent (e.g. mudras, launch_date). */
  activeSubIntent?: string;
  /** Hash of last answer (to avoid verbatim repetition). */
  lastAnswerHash?: string;
  /** Consumed entities: dates, remedy sets, options already given. Exclude from next answer. */
  consumedEntities?: string[];
  /** Domains blocked for this session (e.g. gemstones when user asked mudra). */
  blockedDomains?: string[];
  /** When set, next user message that matches expectedValues resolves this and we answer without re-routing. */
  pendingClarification?: {
    intent: string;
    expectedValues: string[];
    clarificationQuestion?: string;
  };
  /** After name-analysis clarification: which name to use (full legal vs public). */
  nameAnalysisNameType?: 'full_legal' | 'public';
  /** After Lenormand situation clarification: the situation to bind for the next Lenormand reading. */
  lenormandSituation?: string;
  /** After Vastu spatial clarification: direction or room/area to bind for the next Vastu answer. */
  vastuSpatialContext?: string;
  /** After Human Design scope clarification: full overview vs authority-only. */
  humanDesignScope?: 'overview' | 'authority';
  /** After Geomancy situation clarification: the situation to bind for the next Geomancy answer. */
  geomancySituation?: string;
  /** After Energy & Healing scope clarification: physical vitality, emotional balance, or spiritual energy. */
  energyHealingClarification?: 'physical_vitality' | 'emotional_balance' | 'spiritual_energy';
  /** After Scrying clarification: focus/situation for "About which situation?". */
  scryingSituation?: string;
  /** After Mundane context clarification: global, political, or economic. */
  mundaneClarification?: 'global' | 'political' | 'economic';
  /** After Akashic area clarification: area of life (e.g. relationship, career, purpose, health, family). */
  akashicClarification?: string;
  /** When user is in a specific tool flow: lock context so follow-ups stay in that tool (e.g. Navaratna). */
  activeTool?: string;
  /** When activeTool is Navaratna: stones already recommended so finger/metal/ratti/day questions use them. */
  remedyGemstoneContext?: { recommendedStones: string[] };
}

export interface WorkingMemory {
  lastExchanges: MemoryMessage[];
  currentContext: string;
  sessionStartTime: number;
  activeTopics: string[];
  seerSessionState?: SeerSessionState;
}

export interface ShortTermMemory {
  sessionId: string;
  concerns: string[];
  goals: string[];
  mood: string;
  lifeSituation: {
    job: string;
    relationship: string;
    health: string;
    financial: string;
  };
  recentQuestions: string[];
  followUpSuggestions: string[];
}

export interface LongTermMemory {
  userId: string;
  lifeEvents: LifeEvent[];
  questionPatterns: QuestionPattern[];
  preferences: UserPreferences;
  outcomes: Outcome[];
  relationships: Relationship[];
  lastUpdated: number;
}

export interface EpisodicMemory {
  timeline: TimelineEvent[];
  majorLifeChanges: LifeChange[];
  spiritualJourney: SpiritualEvent[];
  achievements: Achievement[];
}

export interface ProceduralMemory {
  learnedPatterns: LearnedPattern[];
  userBehavior: UserBehavior[];
  optimalResponses: OptimalResponse[];
  personalization: PersonalizationData[];
}

export interface LifeEvent {
  id: string;
  date: string;
  type: 'career' | 'relationship' | 'health' | 'financial' | 'spiritual' | 'family';
  description: string;
  astrologicalContext: string;
  outcome: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface QuestionPattern {
  pattern: string;
  frequency: number;
  context: string[];
  preferredResponse: string;
  successRate: number;
}

export interface UserPreferences {
  communicationStyle: 'detailed' | 'concise' | 'spiritual' | 'practical';
  interests: string[];
  avoidTopics: string[];
  preferredTime: 'morning' | 'afternoon' | 'evening';
  languageStyle: 'formal' | 'casual' | 'mystical';
}

export interface Outcome {
  questionId: string;
  prediction: string;
  actualOutcome?: string;
  accuracy: number;
  learnedLesson: string;
  date: string;
}

export interface Relationship {
  type: 'romantic' | 'family' | 'friend' | 'professional';
  status: string;
  astrologicalCompatibility: number;
  notes: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
  significance: 'high' | 'medium' | 'low';
  astrologicalTiming: string;
}

export interface LifeChange {
  date: string;
  change: string;
  before: string;
  after: string;
  astrologicalTrigger: string;
}

export interface SpiritualEvent {
  date: string;
  event: string;
  consciousnessLevel: string;
  impact: string;
}

export interface Achievement {
  date: string;
  achievement: string;
  category: string;
  astrologicalSupport: string;
}

export interface LearnedPattern {
  pattern: string;
  context: string;
  successRate: number;
  lastUsed: number;
}

export interface UserBehavior {
  behavior: string;
  frequency: number;
  triggers: string[];
  responses: string[];
}

export interface OptimalResponse {
  questionType: string;
  responseStyle: string;
  successRate: number;
  userSatisfaction: number;
}

export interface PersonalizationData {
  factor: string;
  value: string;
  importance: number;
  lastUpdated: number;
}

export interface ContextSummary {
  id: string;
  sessionId: string;
  timestamp: number;
  summary: string;
  keyTopics: string[];
  keyInsights: string[];
  questionTypes: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  version: number;
}

export interface SessionSummary {
  sessionId: string;
  startTime: number;
  endTime: number;
  totalExchanges: number;
  summary: ContextSummary;
  nextSessionId?: string; // Link to continuation
}

export interface MemoryVersion {
  version: number;
  timestamp: number;
  description?: string;
  changes: {
    type: 'longTerm' | 'episodic' | 'procedural' | 'preferences';
    field: string;
    oldValue?: any;
    newValue: any;
  }[];
  snapshot?: {
    longTerm?: Partial<LongTermMemory>;
    episodic?: Partial<EpisodicMemory>;
    procedural?: Partial<ProceduralMemory>;
  };
}

export interface VersionHistory {
  userId: string;
  versions: MemoryVersion[];
  currentVersion: number;
  lastUpdated: number;
}

export interface MemoryConfig {
  autoSummarizeThreshold: number; // Default: 10 exchanges
  maxSummariesToLoad: number; // Default: 5
  maxVersionsToKeep: number; // Default: 20
  enableVersioning: boolean; // Default: true
  enableAutoSummarization: boolean; // Default: true
}

export interface MemoryStats {
  totalSummaries: number;
  totalVersions: number;
  lastSummaryTime?: number;
  lastVersionTime?: number;
  memorySize: {
    working: number;
    shortTerm: number;
    longTerm: number;
    episodic: number;
    procedural: number;
  };
}

export interface MemoryExport {
  userId: string;
  exportedAt: number;
  longTermMemory?: LongTermMemory;
  episodicMemory?: EpisodicMemory;
  proceduralMemory?: ProceduralMemory;
  summaries?: ContextSummary[];
  versions?: MemoryVersion[];
}

export class ConversationalMemory {
  private workingMemory: WorkingMemory;
  private shortTermMemory: ShortTermMemory;
  private longTermMemory: LongTermMemory | null = null;
  private episodicMemory: EpisodicMemory | null = null;
  private proceduralMemory: ProceduralMemory | null = null;
  private userId: string;
  private db: any;
  private config: MemoryConfig;
  private recentSummaries: ContextSummary[] = [];
  private currentVersion: number = 1;
  
  constructor(userId: string, config?: Partial<MemoryConfig>) {
    this.userId = userId;
    const db = getFirebaseDB();
    // Server-side: client Firestore API is incompatible with Admin Firestore; skip DB to avoid collection() errors
    this.db = typeof window === 'undefined' ? null : db;
    this.config = {
      autoSummarizeThreshold: 10,
      maxSummariesToLoad: 5,
      maxVersionsToKeep: 20,
      enableVersioning: true,
      enableAutoSummarization: true,
      ...config
    };
    
    // Initialize working memory
    this.workingMemory = {
      lastExchanges: [],
      currentContext: '',
      sessionStartTime: Date.now(),
      activeTopics: []
    };
    
    // Initialize short-term memory
    this.shortTermMemory = {
      sessionId: this.generateSessionId(),
      concerns: [],
      goals: [],
      mood: 'neutral',
      lifeSituation: {
        job: 'unknown',
        relationship: 'unknown',
        health: 'unknown',
        financial: 'unknown'
      },
      recentQuestions: [],
      followUpSuggestions: []
    };
  }
  
  // WORKING MEMORY METHODS
  async addExchange(message: MemoryMessage): Promise<void> {
    this.workingMemory.lastExchanges.push(message);
    
    // Keep only last 5 exchanges
    if (this.workingMemory.lastExchanges.length > 5) {
      this.workingMemory.lastExchanges.shift();
    }
    
    // Update current context
    this.updateCurrentContext(message);
    
    // Update active topics
    this.updateActiveTopics(message);
    
    // Auto-summarize if threshold reached
    if (this.config.enableAutoSummarization) {
      await this.autoSummarize();
    }
  }
  
  getWorkingMemory(): WorkingMemory {
    return this.workingMemory;
  }

  /** Update Seer session state (Phase 2). */
  setSeerSessionState(state: Partial<SeerSessionState>): void {
    if (!this.workingMemory.seerSessionState) {
      this.workingMemory.seerSessionState = {};
    }
    Object.assign(this.workingMemory.seerSessionState, state);
  }

  /** Get Seer session state for conversation layer. */
  getSeerSessionState(): SeerSessionState | undefined {
    return this.workingMemory.seerSessionState;
  }

  /** Consume an entity (date, remedy set, etc.) so it is excluded from future answers. */
  consumeEntity(entity: string): void {
    if (!this.workingMemory.seerSessionState) this.workingMemory.seerSessionState = {};
    const consumed = this.workingMemory.seerSessionState.consumedEntities ?? [];
    if (!consumed.includes(entity)) {
      this.workingMemory.seerSessionState.consumedEntities = [...consumed, entity];
    }
  }

  /** Check if entity was already consumed. */
  isEntityConsumed(entity: string): boolean {
    const consumed = this.workingMemory.seerSessionState?.consumedEntities ?? [];
    return consumed.includes(entity);
  }

  /** Get consumed dates (YYYY-MM-DD) for timing exclusion. */
  getConsumedDates(): string[] {
    const consumed = this.workingMemory.seerSessionState?.consumedEntities ?? [];
    return consumed.filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e));
  }

  /** Reset scope when sub-intent changes (e.g. user switches from mudra to gemstone). */
  resetScopeOnSubIntentChange(newSubIntent: string): void {
    const current = this.workingMemory.seerSessionState?.activeSubIntent;
    if (current !== newSubIntent) {
      if (!this.workingMemory.seerSessionState) this.workingMemory.seerSessionState = {};
      this.workingMemory.seerSessionState.consumedEntities = [];
      this.workingMemory.seerSessionState.activeSubIntent = newSubIntent;
    }
  }
  
  private updateCurrentContext(message: MemoryMessage): void {
    const keywords = message.keywords || [];
    const questionType = message.questionType || 'general';
    
    this.workingMemory.currentContext = `Currently discussing ${questionType} topics: ${keywords.join(', ')}`;
  }
  
  private updateActiveTopics(message: MemoryMessage): void {
    if (message.questionType && !this.workingMemory.activeTopics.includes(message.questionType)) {
      this.workingMemory.activeTopics.push(message.questionType);
    }
    
    // Keep only last 3 active topics
    if (this.workingMemory.activeTopics.length > 3) {
      this.workingMemory.activeTopics.shift();
    }
  }
  
  // SHORT-TERM MEMORY METHODS
  updateConcerns(concerns: string[]): void {
    this.shortTermMemory.concerns = concerns;
  }
  
  updateGoals(goals: string[]): void {
    this.shortTermMemory.goals = goals;
  }
  
  updateMood(mood: string): void {
    this.shortTermMemory.mood = mood;
  }
  
  updateLifeSituation(situation: Partial<ShortTermMemory['lifeSituation']>): void {
    this.shortTermMemory.lifeSituation = {
      ...this.shortTermMemory.lifeSituation,
      ...situation
    };
  }
  
  addRecentQuestion(question: string): void {
    this.shortTermMemory.recentQuestions.push(question);
    
    // Keep only last 10 questions
    if (this.shortTermMemory.recentQuestions.length > 10) {
      this.shortTermMemory.recentQuestions.shift();
    }
  }
  
  getShortTermMemory(): ShortTermMemory {
    return this.shortTermMemory;
  }
  
  // LONG-TERM MEMORY METHODS
  async loadLongTermMemory(): Promise<void> {
    try {
      if (!this.db) {
        devLog.warn('⚠️ Firebase not available, using default long-term memory', 'conversationalMemory');
        this.longTermMemory = this.getDefaultLongTermMemory();
        return;
      }
      
      const docRef = doc(this.db, 'users', this.userId, 'memory', 'longTerm');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.longTermMemory = docSnap.data() as LongTermMemory;
        devLog.debug('✅ Loaded long-term memory for user:', this.userId);
      } else {
        this.longTermMemory = this.getDefaultLongTermMemory();
        await this.saveLongTermMemory();
      }
    } catch (error) {
      devLog.error('❌ Error loading long-term memory:', error, 'conversationalMemory');
      this.longTermMemory = this.getDefaultLongTermMemory();
    }
  }
  
  async saveLongTermMemory(): Promise<void> {
    try {
      if (!this.db || !this.longTermMemory) return;
      
      const docRef = doc(this.db, 'users', this.userId, 'memory', 'longTerm');
      await setDoc(docRef, {
        ...this.longTermMemory,
        lastUpdated: Date.now()
      });
      
      devLog.debug('✅ Saved long-term memory for user:', this.userId);
    } catch (error) {
      devLog.error('❌ Error saving long-term memory:', error, 'conversationalMemory');
    }
  }
  
  async addLifeEvent(event: LifeEvent): Promise<void> {
    if (!this.longTermMemory) return;
    
    this.longTermMemory.lifeEvents.push(event);
    
    // Keep only last 50 events
    if (this.longTermMemory.lifeEvents.length > 50) {
      this.longTermMemory.lifeEvents.shift();
    }
    
    // Auto-version on significant life events
    if (this.config.enableVersioning && (event.confidence > 0.7 || event.outcome !== 'neutral')) {
      await this.createVersion(`Life event added: ${event.type}`);
    }
  }
  
  addQuestionPattern(pattern: QuestionPattern): void {
    if (!this.longTermMemory) return;
    
    const existingPattern = this.longTermMemory.questionPatterns.find(p => p.pattern === pattern.pattern);
    
    if (existingPattern) {
      existingPattern.frequency++;
      existingPattern.context.push(...pattern.context);
      existingPattern.successRate = (existingPattern.successRate + pattern.successRate) / 2;
    } else {
      this.longTermMemory.questionPatterns.push(pattern);
    }
  }
  
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    if (!this.longTermMemory) return;
    
    const oldPreferences = { ...this.longTermMemory.preferences };
    this.longTermMemory.preferences = {
      ...this.longTermMemory.preferences,
      ...preferences
    };
    
    // Auto-version on preference changes
    if (this.config.enableVersioning) {
      await this.createVersion('Preferences updated');
    }
  }
  
  addOutcome(outcome: Outcome): void {
    if (!this.longTermMemory) return;
    
    this.longTermMemory.outcomes.push(outcome);
    
    // Keep only last 100 outcomes
    if (this.longTermMemory.outcomes.length > 100) {
      this.longTermMemory.outcomes.shift();
    }
  }
  
  getLongTermMemory(): LongTermMemory | null {
    return this.longTermMemory;
  }
  
  // EPISODIC MEMORY METHODS
  async loadEpisodicMemory(): Promise<void> {
    try {
      if (!this.db) {
        this.episodicMemory = this.getDefaultEpisodicMemory();
        return;
      }
      
      const docRef = doc(this.db, 'users', this.userId, 'memory', 'episodic');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.episodicMemory = docSnap.data() as EpisodicMemory;
      } else {
        this.episodicMemory = this.getDefaultEpisodicMemory();
        await this.saveEpisodicMemory();
      }
    } catch (error) {
      devLog.error('❌ Error loading episodic memory:', error, 'conversationalMemory');
      this.episodicMemory = this.getDefaultEpisodicMemory();
    }
  }
  
  async saveEpisodicMemory(): Promise<void> {
    try {
      if (!this.db || !this.episodicMemory) return;
      
      const docRef = doc(this.db, 'users', this.userId, 'memory', 'episodic');
      await setDoc(docRef, this.episodicMemory);
    } catch (error) {
      devLog.error('❌ Error saving episodic memory:', error, 'conversationalMemory');
    }
  }
  
  addTimelineEvent(event: TimelineEvent): void {
    if (!this.episodicMemory) return;
    
    this.episodicMemory.timeline.push(event);
    
    // Keep only last 200 events
    if (this.episodicMemory.timeline.length > 200) {
      this.episodicMemory.timeline.shift();
    }
  }
  
  addLifeChange(change: LifeChange): void {
    if (!this.episodicMemory) return;
    
    this.episodicMemory.majorLifeChanges.push(change);
    
    // Keep only last 20 changes
    if (this.episodicMemory.majorLifeChanges.length > 20) {
      this.episodicMemory.majorLifeChanges.shift();
    }
  }
  
  addSpiritualEvent(event: SpiritualEvent): void {
    if (!this.episodicMemory) return;
    
    this.episodicMemory.spiritualJourney.push(event);
    
    // Keep only last 30 events
    if (this.episodicMemory.spiritualJourney.length > 30) {
      this.episodicMemory.spiritualJourney.shift();
    }
  }
  
  addAchievement(achievement: Achievement): void {
    if (!this.episodicMemory) return;
    
    this.episodicMemory.achievements.push(achievement);
    
    // Keep only last 25 achievements
    if (this.episodicMemory.achievements.length > 25) {
      this.episodicMemory.achievements.shift();
    }
  }
  
  getEpisodicMemory(): EpisodicMemory | null {
    return this.episodicMemory;
  }
  
  // PROCEDURAL MEMORY METHODS
  async loadProceduralMemory(): Promise<void> {
    try {
      if (!this.db) {
        this.proceduralMemory = this.getDefaultProceduralMemory();
        return;
      }
      
      const docRef = doc(this.db, 'users', this.userId, 'memory', 'procedural');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.proceduralMemory = docSnap.data() as ProceduralMemory;
      } else {
        this.proceduralMemory = this.getDefaultProceduralMemory();
        await this.saveProceduralMemory();
      }
    } catch (error) {
      devLog.error('❌ Error loading procedural memory:', error, 'conversationalMemory');
      this.proceduralMemory = this.getDefaultProceduralMemory();
    }
  }
  
  async saveProceduralMemory(): Promise<void> {
    try {
      if (!this.db || !this.proceduralMemory) return;
      
      const docRef = doc(this.db, 'users', this.userId, 'memory', 'procedural');
      await setDoc(docRef, this.proceduralMemory);
    } catch (error) {
      devLog.error('❌ Error saving procedural memory:', error, 'conversationalMemory');
    }
  }
  
  addLearnedPattern(pattern: LearnedPattern): void {
    if (!this.proceduralMemory) return;
    
    const existingPattern = this.proceduralMemory.learnedPatterns.find(p => p.pattern === pattern.pattern);
    
    if (existingPattern) {
      existingPattern.successRate = (existingPattern.successRate + pattern.successRate) / 2;
      existingPattern.lastUsed = Date.now();
    } else {
      this.proceduralMemory.learnedPatterns.push(pattern);
    }
  }
  
  addUserBehavior(behavior: UserBehavior): void {
    if (!this.proceduralMemory) return;
    
    const existingBehavior = this.proceduralMemory.userBehavior.find(b => b.behavior === behavior.behavior);
    
    if (existingBehavior) {
      existingBehavior.frequency++;
      existingBehavior.triggers.push(...behavior.triggers);
      existingBehavior.responses.push(...behavior.responses);
    } else {
      this.proceduralMemory.userBehavior.push(behavior);
    }
  }
  
  addOptimalResponse(response: OptimalResponse): void {
    if (!this.proceduralMemory) return;
    
    const existingResponse = this.proceduralMemory.optimalResponses.find(r => 
      r.questionType === response.questionType && r.responseStyle === response.responseStyle
    );
    
    if (existingResponse) {
      existingResponse.successRate = (existingResponse.successRate + response.successRate) / 2;
      existingResponse.userSatisfaction = (existingResponse.userSatisfaction + response.userSatisfaction) / 2;
    } else {
      this.proceduralMemory.optimalResponses.push(response);
    }
  }
  
  updatePersonalization(data: PersonalizationData): void {
    if (!this.proceduralMemory) return;
    
    const existingData = this.proceduralMemory.personalization.find(d => d.factor === data.factor);
    
    if (existingData) {
      existingData.value = data.value;
      existingData.importance = data.importance;
      existingData.lastUpdated = Date.now();
    } else {
      this.proceduralMemory.personalization.push(data);
    }
  }
  
  getProceduralMemory(): ProceduralMemory | null {
    return this.proceduralMemory;
  }
  
  // VERSIONING METHODS
  async createVersion(description?: string): Promise<MemoryVersion> {
    if (!this.config.enableVersioning) {
      throw new Error('Versioning is disabled');
    }

    this.currentVersion++;
    const changes: MemoryVersion['changes'] = [];
    
    // Create snapshot
    const snapshot: MemoryVersion['snapshot'] = {
      longTerm: this.longTermMemory ? {
        preferences: this.longTermMemory.preferences,
        questionPatterns: this.longTermMemory.questionPatterns.slice(-10)
      } : undefined,
      episodic: this.episodicMemory ? {
        timeline: this.episodicMemory.timeline.slice(-20),
        achievements: this.episodicMemory.achievements.slice(-10)
      } : undefined,
      procedural: this.proceduralMemory ? {
        learnedPatterns: this.proceduralMemory.learnedPatterns.slice(-10),
        optimalResponses: this.proceduralMemory.optimalResponses.slice(-10)
      } : undefined
    };

    const version: MemoryVersion = {
      version: this.currentVersion,
      timestamp: Date.now(),
      description,
      changes,
      snapshot
    };

    try {
      if (this.db) {
        const docRef = doc(this.db, 'users', this.userId, 'memory', 'versions', version.version.toString());
        await setDoc(docRef, version);
        
        // Update version history
        const historyRef = doc(this.db, 'users', this.userId, 'memory', 'versionHistory');
        const historySnap = await getDoc(historyRef);
        const history: VersionHistory = historySnap.exists() 
          ? (historySnap.data() as VersionHistory)
          : { userId: this.userId, versions: [], currentVersion: 0, lastUpdated: Date.now() };
        
        history.versions.push(version);
        if (history.versions.length > this.config.maxVersionsToKeep) {
          history.versions.shift();
        }
        history.currentVersion = this.currentVersion;
        history.lastUpdated = Date.now();
        
        await setDoc(historyRef, history);
      }
    } catch (error) {
      devLog.error('❌ Error saving version:', error, 'conversationalMemory');
    }

    return version;
  }

  async getVersion(version: number): Promise<MemoryVersion | null> {
    try {
      if (!this.db) return null;
      
      const docRef = doc(this.db, 'users', this.userId, 'memory', 'versions', version.toString());
      const docSnap = await getDoc(docRef);
      
      return docSnap.exists() ? (docSnap.data() as MemoryVersion) : null;
    } catch (error) {
      devLog.error('❌ Error loading version:', error, 'conversationalMemory');
      return null;
    }
  }

  async rollbackToVersion(version: number): Promise<void> {
    const targetVersion = await this.getVersion(version);
    if (!targetVersion || !targetVersion.snapshot) {
      throw new Error(`Version ${version} not found or has no snapshot`);
    }

    const snapshot = targetVersion.snapshot;
    
    if (snapshot.longTerm && this.longTermMemory) {
      if (snapshot.longTerm.preferences) {
        this.longTermMemory.preferences = snapshot.longTerm.preferences as UserPreferences;
      }
      if (snapshot.longTerm.questionPatterns) {
        this.longTermMemory.questionPatterns = snapshot.longTerm.questionPatterns as QuestionPattern[];
      }
    }

    if (snapshot.episodic && this.episodicMemory) {
      if (snapshot.episodic.timeline) {
        this.episodicMemory.timeline = snapshot.episodic.timeline as TimelineEvent[];
      }
      if (snapshot.episodic.achievements) {
        this.episodicMemory.achievements = snapshot.episodic.achievements as Achievement[];
      }
    }

    if (snapshot.procedural && this.proceduralMemory) {
      if (snapshot.procedural.learnedPatterns) {
        this.proceduralMemory.learnedPatterns = snapshot.procedural.learnedPatterns as LearnedPattern[];
      }
      if (snapshot.procedural.optimalResponses) {
        this.proceduralMemory.optimalResponses = snapshot.procedural.optimalResponses as OptimalResponse[];
      }
    }

    this.currentVersion = version;
    await this.saveAllMemory();
    devLog.debug('✅ Rolled back to version:', version);
  }

  async getVersionHistory(limit?: number): Promise<MemoryVersion[]> {
    try {
      if (!this.db) return [];
      
      const historyRef = doc(this.db, 'users', this.userId, 'memory', 'versionHistory');
      const historySnap = await getDoc(historyRef);
      
      if (!historySnap.exists()) return [];
      
      const history = historySnap.data() as VersionHistory;
      const versions = history.versions || [];
      
      return limit ? versions.slice(-limit) : versions;
    } catch (error) {
      devLog.error('❌ Error loading version history:', error, 'conversationalMemory');
      return [];
    }
  }

  // CROSS-SESSION CONTEXT LOADING
  async loadRecentContext(maxSummaries?: number): Promise<ContextSummary[]> {
    return await this.getRecentSummaries(maxSummaries);
  }

  async getCrossSessionContext(): Promise<string> {
    const summaries = await this.getRecentSummaries(this.config.maxSummariesToLoad);
    let context = '';

    // Add recent session summaries
    if (summaries.length > 0) {
      context += 'Recent Conversation Context:\n';
      summaries.forEach((summary, index) => {
        context += `${index + 1}. ${summary.summary}\n`;
        if (summary.keyTopics.length > 0) {
          context += `   Topics: ${summary.keyTopics.join(', ')}\n`;
        }
        if (summary.keyInsights.length > 0) {
          context += `   Insights: ${summary.keyInsights.join(', ')}\n`;
        }
      });
      context += '\n';
    }

    // Add long-term memory context
    if (this.longTermMemory) {
      context += 'User Preferences:\n';
      context += `- Communication Style: ${this.longTermMemory.preferences.communicationStyle}\n`;
      context += `- Language Style: ${this.longTermMemory.preferences.languageStyle}\n`;
      if (this.longTermMemory.preferences.interests.length > 0) {
        context += `- Interests: ${this.longTermMemory.preferences.interests.join(', ')}\n`;
      }
      context += '\n';

      if (this.longTermMemory.questionPatterns.length > 0) {
        const topPatterns = this.longTermMemory.questionPatterns
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 5);
        context += 'Frequent Question Patterns:\n';
        topPatterns.forEach(pattern => {
          context += `- ${pattern.pattern} (asked ${pattern.frequency} times)\n`;
        });
        context += '\n';
      }
    }

    // Add episodic memory highlights
    if (this.episodicMemory && this.episodicMemory.achievements.length > 0) {
      const recentAchievements = this.episodicMemory.achievements.slice(-3);
      context += 'Recent Achievements:\n';
      recentAchievements.forEach(achievement => {
        context += `- ${achievement.achievement} (${achievement.category})\n`;
      });
      context += '\n';
    }

    return context.trim();
  }

  // UTILITY METHODS
  async initializeAllMemory(loadRecentContext: boolean = false): Promise<void> {
    await Promise.all([
      this.loadLongTermMemory(),
      this.loadEpisodicMemory(),
      this.loadProceduralMemory(),
      this.loadSeerSessionState()
    ]);
    
    if (loadRecentContext) {
      await this.loadRecentContext();
    }
    
    // Load version history
    if (this.config.enableVersioning) {
      const history = await this.getVersionHistory(1);
      if (history.length > 0) {
        this.currentVersion = history[history.length - 1].version;
      }
    }
    
    devLog.debug('✅ All memory systems initialized for user:', this.userId);
  }
  
  async saveAllMemory(): Promise<void> {
    await Promise.all([
      this.saveLongTermMemory(),
      this.saveEpisodicMemory(),
      this.saveProceduralMemory(),
      this.saveSeerSessionState()
    ]);
    
    devLog.debug('✅ All memory systems saved for user:', this.userId);
  }

  async saveSeerSessionState(): Promise<void> {
    try {
      if (!this.db || !this.workingMemory.seerSessionState) return;
      const docRef = doc(this.db, 'users', this.userId, 'memory', 'seerSession');
      await setDoc(docRef, {
        ...this.workingMemory.seerSessionState,
        lastUpdated: Date.now()
      });
    } catch (err) {
      devLog.warn('⚠️ saveSeerSessionState failed:', err, 'conversationalMemory');
    }
  }

  async loadSeerSessionState(): Promise<void> {
    try {
      if (!this.db) return;
      const docRef = doc(this.db, 'users', this.userId, 'memory', 'seerSession');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.workingMemory.seerSessionState = docSnap.data() as SeerSessionState;
      }
    } catch (err) {
      devLog.warn('⚠️ loadSeerSessionState failed:', err, 'conversationalMemory');
    }
  }
  
  getContextForQuestion(questionType: string): string {
    let context = '';
    
    // Working memory context
    if (this.workingMemory.activeTopics.includes(questionType)) {
      context += `User is actively discussing ${questionType} topics. `;
    }
    
    // Short-term memory context
    if (this.shortTermMemory.concerns.includes(questionType)) {
      context += `User has expressed concerns about ${questionType}. `;
    }
    
    if (this.shortTermMemory.goals.includes(questionType)) {
      context += `User has goals related to ${questionType}. `;
    }
    
    // Long-term memory context
    if (this.longTermMemory) {
      const relatedEvents = this.longTermMemory.lifeEvents.filter(e => 
        e.type === questionType || e.description.toLowerCase().includes(questionType)
      );
      
      if (relatedEvents.length > 0) {
        context += `User has ${relatedEvents.length} previous experiences with ${questionType}. `;
      }
      
      const preferences = this.longTermMemory.preferences;
      context += `User prefers ${preferences.communicationStyle} communication style. `;
    }
    
    // Episodic memory context
    if (this.episodicMemory) {
      const recentAchievements = this.episodicMemory.achievements
        .filter(a => a.category === questionType)
        .slice(-3);
      
      if (recentAchievements.length > 0) {
        context += `User has recent achievements in ${questionType}. `;
      }
    }
    
    return context.trim();
  }
  
  // CONTEXT SUMMARIZATION METHODS
  async generateAISummary(exchanges: MemoryMessage[]): Promise<ContextSummary> {
    try {
      const { createAICompletion } = await import('./aiGateway');
      
      // Build conversation text
      const conversationText = exchanges.map(ex => 
        `${ex.type === 'user' ? 'User' : 'Seer'}: ${ex.content}`
      ).join('\n');
      
      // Extract question types and keywords
      const questionTypes = [...new Set(exchanges
        .filter(e => e.questionType)
        .map(e => e.questionType!)
      )];
      
      const allKeywords = exchanges
        .flatMap(e => e.keywords || [])
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 10);
      
      // Generate summary using AI
      const prompt = `Summarize this conversation between a user and an AI seer advisor. Extract:
1. A concise summary (2-3 sentences)
2. Key topics discussed (comma-separated list)
3. Key insights or advice given (comma-separated list)
4. Overall sentiment (positive, neutral, or negative)

Conversation:
${conversationText}

Respond in JSON format:
{
  "summary": "concise summary",
  "keyTopics": ["topic1", "topic2"],
  "keyInsights": ["insight1", "insight2"],
  "sentiment": "positive|neutral|negative"
}`;

      const response = await createAICompletion({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes conversations in JSON format.' },
          { role: 'user', content: prompt }
        ],
        maxTokens: 500,
        temperature: 0.3,
        responseFormat: { type: 'json_object' }
      });

      let summaryData: any;
      try {
        summaryData = JSON.parse(response.content);
      } catch {
        // Fallback if JSON parsing fails
        summaryData = {
          summary: response.content,
          keyTopics: allKeywords.slice(0, 5),
          keyInsights: [],
          sentiment: 'neutral' as const
        };
      }

      const summary: ContextSummary = {
        id: `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: this.shortTermMemory.sessionId,
        timestamp: Date.now(),
        summary: summaryData.summary || response.content,
        keyTopics: summaryData.keyTopics || allKeywords.slice(0, 5),
        keyInsights: summaryData.keyInsights || [],
        questionTypes: questionTypes,
        sentiment: summaryData.sentiment || 'neutral',
        version: 1
      };

      return summary;
    } catch (error) {
      devLog.error('Error generating AI summary:', error, 'conversationalMemory');
      // Fallback to simple summary
      return this.createSimpleSummary(exchanges);
    }
  }

  private createSimpleSummary(exchanges: MemoryMessage[]): ContextSummary {
    const questionTypes = [...new Set(exchanges
      .filter(e => e.questionType)
      .map(e => e.questionType!)
    )];
    
    const allKeywords = exchanges
      .flatMap(e => e.keywords || [])
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 10);

    return {
      id: `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.shortTermMemory.sessionId,
      timestamp: Date.now(),
      summary: `Conversation with ${exchanges.length} exchanges covering ${questionTypes.join(', ') || 'general topics'}.`,
      keyTopics: allKeywords.slice(0, 5),
      keyInsights: [],
      questionTypes: questionTypes,
      sentiment: 'neutral',
      version: 1
    };
  }

  async summarizeContext(maxExchanges?: number): Promise<ContextSummary> {
    const exchanges = maxExchanges 
      ? this.workingMemory.lastExchanges.slice(-maxExchanges)
      : this.workingMemory.lastExchanges;
    
    if (exchanges.length === 0) {
      throw new Error('No exchanges to summarize');
    }

    return await this.generateAISummary(exchanges);
  }

  async addContextSummary(summary: ContextSummary): Promise<void> {
    try {
      if (!this.db) {
        devLog.warn('⚠️ Firebase not available, cannot save context summary', 'conversationalMemory');
        return;
      }

      const docRef = doc(this.db, 'users', this.userId, 'memory', 'summaries', summary.id);
      await setDoc(docRef, summary);
      
      // Add to recent summaries cache
      this.recentSummaries.unshift(summary);
      if (this.recentSummaries.length > this.config.maxSummariesToLoad) {
        this.recentSummaries.pop();
      }
      
      devLog.debug('✅ Saved context summary:', summary.id);
    } catch (error) {
      devLog.error('❌ Error saving context summary:', error, 'conversationalMemory');
    }
  }

  async getRecentSummaries(limit?: number): Promise<ContextSummary[]> {
    try {
      if (!this.db) {
        return this.recentSummaries.slice(0, limit || this.config.maxSummariesToLoad);
      }

      const summariesRef = collection(this.db, 'users', this.userId, 'memory', 'summaries');
      const { query, orderBy, limit: limitQuery, getDocs } = await import('firebase/firestore');
      const q = query(summariesRef, orderBy('timestamp', 'desc'), limitQuery(limit || this.config.maxSummariesToLoad));
      const snapshot = await getDocs(q);
      
      const summaries = snapshot.docs.map(doc => doc.data() as ContextSummary);
      this.recentSummaries = summaries;
      return summaries;
    } catch (error) {
      devLog.error('❌ Error loading recent summaries:', error, 'conversationalMemory');
      return this.recentSummaries.slice(0, limit || this.config.maxSummariesToLoad);
    }
  }

  async autoSummarize(): Promise<void> {
    if (!this.config.enableAutoSummarization) {
      return;
    }

    const exchangeCount = this.workingMemory.lastExchanges.length;
    if (exchangeCount >= this.config.autoSummarizeThreshold) {
      try {
        const summary = await this.summarizeContext();
        await this.addContextSummary(summary);
        devLog.debug('✅ Auto-summarized context after', exchangeCount, 'exchanges');
      } catch (error) {
        devLog.error('❌ Error in auto-summarization:', error, 'conversationalMemory');
      }
    }
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private getDefaultLongTermMemory(): LongTermMemory {
    return {
      userId: this.userId,
      lifeEvents: [],
      questionPatterns: [],
      preferences: {
        communicationStyle: 'detailed',
        interests: [],
        avoidTopics: [],
        preferredTime: 'morning',
        languageStyle: 'mystical'
      },
      outcomes: [],
      relationships: [],
      lastUpdated: Date.now()
    };
  }
  
  private getDefaultEpisodicMemory(): EpisodicMemory {
    return {
      timeline: [],
      majorLifeChanges: [],
      spiritualJourney: [],
      achievements: []
    };
  }
  
  private getDefaultProceduralMemory(): ProceduralMemory {
    return {
      learnedPatterns: [],
      userBehavior: [],
      optimalResponses: [],
      personalization: []
    };
  }

  // UTILITY METHODS
  async getMemoryStats(): Promise<MemoryStats> {
    const summaries = await this.getRecentSummaries();
    const versions = await this.getVersionHistory();

    return {
      totalSummaries: summaries.length,
      totalVersions: versions.length,
      lastSummaryTime: summaries.length > 0 ? summaries[0].timestamp : undefined,
      lastVersionTime: versions.length > 0 ? versions[versions.length - 1].timestamp : undefined,
      memorySize: {
        working: this.workingMemory.lastExchanges.length,
        shortTerm: this.shortTermMemory.recentQuestions.length,
        longTerm: this.longTermMemory 
          ? this.longTermMemory.lifeEvents.length + this.longTermMemory.questionPatterns.length
          : 0,
        episodic: this.episodicMemory
          ? this.episodicMemory.timeline.length + this.episodicMemory.achievements.length
          : 0,
        procedural: this.proceduralMemory
          ? this.proceduralMemory.learnedPatterns.length + this.proceduralMemory.optimalResponses.length
          : 0
      }
    };
  }

  async clearOldSummaries(olderThanDays: number): Promise<void> {
    try {
      if (!this.db) return;

      const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
      const summariesRef = collection(this.db, 'users', this.userId, 'memory', 'summaries');
      const { query, where, getDocs, deleteDoc } = await import('firebase/firestore');
      const q = query(summariesRef, where('timestamp', '<', cutoffTime));
      const snapshot = await getDocs(q);

      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      devLog.debug(`✅ Cleared ${snapshot.docs.length} old summaries`);
    } catch (error) {
      devLog.error('❌ Error clearing old summaries:', error, 'conversationalMemory');
    }
  }

  async exportMemory(): Promise<MemoryExport> {
    const summaries = await this.getRecentSummaries(100); // Export last 100 summaries
    const versions = await this.getVersionHistory(100); // Export last 100 versions

    return {
      userId: this.userId,
      exportedAt: Date.now(),
      longTermMemory: this.longTermMemory || undefined,
      episodicMemory: this.episodicMemory || undefined,
      proceduralMemory: this.proceduralMemory || undefined,
      summaries: summaries.length > 0 ? summaries : undefined,
      versions: versions.length > 0 ? versions : undefined
    };
  }

  async importMemory(data: MemoryExport): Promise<void> {
    if (data.userId !== this.userId) {
      throw new Error('Cannot import memory for different user');
    }

    try {
      if (data.longTermMemory) {
        this.longTermMemory = data.longTermMemory;
        await this.saveLongTermMemory();
      }

      if (data.episodicMemory) {
        this.episodicMemory = data.episodicMemory;
        await this.saveEpisodicMemory();
      }

      if (data.proceduralMemory) {
        this.proceduralMemory = data.proceduralMemory;
        await this.saveProceduralMemory();
      }

      if (data.summaries && this.db) {
        for (const summary of data.summaries) {
          const docRef = doc(this.db, 'users', this.userId, 'memory', 'summaries', summary.id);
          await setDoc(docRef, summary);
        }
      }

      if (data.versions && this.db) {
        for (const version of data.versions) {
          const docRef = doc(this.db, 'users', this.userId, 'memory', 'versions', version.version.toString());
          await setDoc(docRef, version);
        }
        
        // Update version history
        if (data.versions.length > 0) {
          const historyRef = doc(this.db, 'users', this.userId, 'memory', 'versionHistory');
          const history: VersionHistory = {
            userId: this.userId,
            versions: data.versions,
            currentVersion: data.versions[data.versions.length - 1].version,
            lastUpdated: Date.now()
          };
          await setDoc(historyRef, history);
          this.currentVersion = history.currentVersion;
        }
      }

      devLog.debug('✅ Memory imported successfully');
    } catch (error) {
      devLog.error('❌ Error importing memory:', error, 'conversationalMemory');
      throw error;
    }
  }
}
