"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useComprehensiveMysticalProfile } from '@/hooks/useComprehensiveMysticalProfile';
import { TopNavBar } from '@/components/TopNavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Sparkles, Clock, AlertTriangle, Target, Zap, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { saveAskHistory } from '@/lib/firebase';
import { SlowRevealText } from '@/components/chat/SlowRevealText';

interface SeerResponse {
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
  /** How we calculated the date (for "See more"). */
  timingDetail?: string;
  /** Functional sorting: primary and supporting systems that drove the answer. */
  primarySecondarySystems?: { primary: string[]; secondary: string[] };
}

interface ChatMessage {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: Date;
  response?: SeerResponse;
}

const ASK_THE_SEER_STARTERS = [
  'What is my life purpose?',
  'What should I focus on right now?',
];

export default function AskTheSeerPage() {
  const { user, userProfile } = useAuth();
  const { profile: comprehensiveProfile } = useComprehensiveMysticalProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [expandedDetailId, setExpandedDetailId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const sendQuestion = async (questionText: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use Ask the Seer.",
        variant: "destructive",
      });
      return;
    }
    if (!questionText.trim() || isLoading) return;

    const userMessage = questionText.trim();
    setInputValue('');
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90_000);

    try {
      const response = await fetch('/api/seer/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.uid,
          query: userMessage,
          context: {
            session_id: sessionId,
            birth_data: userProfile ? { birthDate: userProfile.birthDate, birthTime: userProfile.birthTime, birthPlace: userProfile.birthPlace } : null,
            comprehensiveProfile: comprehensiveProfile ?? undefined,
            conversationHistory: messages.slice(-4).map((m) => ({
              type: m.type,
              content: (typeof m.content === 'string' ? m.content : '').slice(0, 800),
            })),
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const result = await response.json();

      if (!response.ok) {
        const msg = [result.error, result.details].filter(Boolean).join(': ') || 'Failed to get mystical insights';
        throw new Error(msg);
      }

      const seerResponse: SeerResponse = result.data;
      setSessionId(seerResponse.session_id);

      const seerMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'seer',
        content: formatSeerResponse(seerResponse),
        timestamp: new Date(),
        response: seerResponse
      };
      setMessages(prev => [...prev, seerMsg]);

      const ts = Date.now();
      const shortSummary = seerResponse.support?.[0]?.summary
        ?? (seerResponse.primary_themes?.length ? seerResponse.primary_themes.join('. ') : '');
      const aiSummary = [seerResponse.verdict, shortSummary].filter(Boolean).join('\n\n');
      saveAskHistory({
        uid: user.uid,
        question: userMessage,
        aiSummary,
        timestamp: ts,
        symbolicData: { confidence: seerResponse.confidence },
        remedies: seerResponse.actions ?? [],
      }).catch(() => {});

    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Seer API Error:', error);
      const isAbort = error instanceof Error && error.name === 'AbortError';
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'seer',
        content: `🔮 I apologize, but I'm unable to provide mystical insights at the moment. Please try again later or rephrase your question.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      toast({
        title: isAbort ? "Request took too long" : "Mystical Connection Lost",
        description: isAbort ? "Please try again or rephrase your question." : (error instanceof Error ? error.message : "Failed to connect with the mystical realm"),
        variant: "destructive",
      });
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(inputValue.trim());
  };

  const formatSeerResponse = (response: SeerResponse): string => {
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
    
    formatted += `📊 **Sources:** ${(response.source_badges ?? []).join(', ')}`;
    if (response.primarySecondarySystems && (response.primarySecondarySystems.primary?.length > 0 || response.primarySecondarySystems.secondary?.length > 0)) {
      formatted += `\n\n🎯 **Primary:** ${response.primarySecondarySystems.primary?.join(', ') ?? '—'}`;
      if (response.primarySecondarySystems.secondary?.length > 0)
        formatted += ` · **Supporting:** ${response.primarySecondarySystems.secondary.join(', ')}`;
    }
    if (response.clarify) {
      formatted += `\n\n❓ **Clarification needed:** ${response.clarify}`;
    }
    
    return formatted;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (confidence >= 0.6) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <Sparkles className="w-4 h-4" />;
    if (confidence >= 0.6) return <Zap className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const isTimingResponse = (message: ChatMessage): boolean =>
    message.type === 'seer' &&
    !!message.response &&
    (message.response.timing_window != null || message.response.timingDetail != null);

  const hasSeeMoreContent = (response: SeerResponse): boolean =>
    !!(
      response.verdict?.trim() ||
      (response.support?.length ?? 0) > 0 ||
      (response.warnings?.length ?? 0) > 0 ||
      (response.actions?.length ?? 0) > 0 ||
      (response.source_badges?.length ?? 0) > 0 ||
      response.timingDetail?.trim()
    );

  return (
    <div className="starfield-ultra-sharp min-h-screen overflow-hidden">
      <TopNavBar />
      
      <div className="container mx-auto px-4 pt-20 pb-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-8 flex items-center justify-center gap-3">
            <span className="text-4xl">🔮</span>
            <span className="text-amber-400">
              Ask the Seer
            </span>
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Ask me anything about your future, relationships, career, health, or any life path. 
            I'll consult the stars, numbers, and mystical forces to guide you.
          </p>
        </div>

        {/* Chat Interface */}
        <div data-onboarding="ask-seer" className="space-y-6 flex justify-center">
          <div className="w-full max-w-3xl">
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg transition-all duration-300 min-h-[50vh] max-h-[85vh] flex flex-col overflow-hidden">
              <CardHeader className="border-b border-amber-200 bg-white/80 flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-700" />
                  Mystical Consultation
                </CardTitle>
                {messages.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-amber-900 hover:bg-amber-100 shrink-0"
                    onClick={() => {
                      setMessages([]);
                      setExpandedDetailId(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear chat
                  </Button>
                )}
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col min-h-0 p-0">
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-amber-700" />
                      <p className="text-amber-900 font-medium mb-2">Welcome to Ask the Seer.</p>
                      <p className="text-slate-700 text-sm mb-4">Ask about life, purpose, relationships—or pick one below.</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {ASK_THE_SEER_STARTERS.map((q, i) => (
                          <Button
                            key={i}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => sendQuestion(q)}
                            disabled={!user || isLoading}
                            className="text-amber-900 border-amber-200 hover:bg-amber-100 hover:border-amber-300"
                          >
                            {q}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl p-4 ${
                              message.type === 'user'
                                ? 'bg-blue-50 border-2 border-blue-200 text-slate-800'
                                : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 text-slate-700'
                            }`}
                          >
                            {/* For timing responses: show only confidence + date + See more by default; full content inside See more */}
                            {message.type === 'seer' && message.response && isTimingResponse(message) ? (
                              <>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge className={getConfidenceColor(message.response.confidence)}>
                                      {getConfidenceIcon(message.response.confidence)}
                                      {Math.round(message.response.confidence * 100)}% Confidence
                                    </Badge>
                                  </div>
                                  {message.response.timing_window && (
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                      <Clock className="w-4 h-4 text-amber-700" />
                                      {message.response.timing_window[0] === message.response.timing_window[1]
                                        ? new Date(message.response.timing_window[0]).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
                                        : `${new Date(message.response.timing_window[0]).toLocaleDateString()} – ${new Date(message.response.timing_window[1]).toLocaleDateString()}`}
                                    </div>
                                  )}
                                  {hasSeeMoreContent(message.response) && (
                                    <div className="mt-2">
                                      <button
                                        type="button"
                                        onClick={() => setExpandedDetailId((id) => (id === message.id ? null : message.id))}
                                        className="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded px-1"
                                      >
                                        {expandedDetailId === message.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        {expandedDetailId === message.id ? 'See less' : 'See more'}
                                      </button>
                                      {expandedDetailId === message.id && (
                                        <div className="mt-3 pt-3 border-t border-amber-200 space-y-3 text-sm text-slate-700">
                                          {message.response.verdict?.trim() && (
                                            <p className="leading-relaxed whitespace-pre-wrap">{message.response.verdict}</p>
                                          )}
                                          {message.response.support && message.response.support.length > 0 && (
                                            <>
                                              <p className="font-medium text-amber-900">Supporting Factors</p>
                                              <ul className="list-disc list-inside space-y-1">
                                                {message.response.support.map((s, i) => (
                                                  <li key={i}><span className="text-slate-600">{s.module}:</span> {s.summary}</li>
                                                ))}
                                              </ul>
                                            </>
                                          )}
                                          {message.response.warnings && message.response.warnings.length > 0 && (
                                            <>
                                              <p className="font-medium text-amber-900">Considerations</p>
                                              <ul className="list-disc list-inside space-y-1">
                                                {message.response.warnings.map((w, i) => (
                                                  <li key={i}>{w}</li>
                                                ))}
                                              </ul>
                                            </>
                                          )}
                                          {message.response.actions && message.response.actions.length > 0 && (
                                            <>
                                              <p className="font-medium text-amber-900">Recommended Actions</p>
                                              <ul className="list-disc list-inside space-y-1">
                                                {message.response.actions.map((a, i) => (
                                                  <li key={i}>{a}</li>
                                                ))}
                                              </ul>
                                            </>
                                          )}
                                          {message.response.timingDetail?.trim() && (
                                            <p className="leading-relaxed">{message.response.timingDetail}</p>
                                          )}
                                          {message.response.primarySecondarySystems && (message.response.primarySecondarySystems.primary?.length > 0 || message.response.primarySecondarySystems.secondary?.length > 0) && (
                                            <p className="text-slate-700">
                                              <span className="text-amber-900">Primary:</span> {message.response.primarySecondarySystems.primary?.join(', ') || '—'}
                                              {message.response.primarySecondarySystems.secondary?.length > 0 && (
                                                <> · <span className="text-amber-900">Supporting:</span> {message.response.primarySecondarySystems.secondary.join(', ')}</>
                                              )}
                                            </p>
                                          )}
                                          {message.response.source_badges && message.response.source_badges.length > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-1">
                                              <span className="text-slate-600 mr-1">Sources:</span>
                                              {message.response.source_badges.map((badge, index) => (
                                                <Badge key={index} variant="outline" className="text-xs bg-amber-100 text-amber-900 border-amber-300">
                                                  {badge}
                                                </Badge>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                {message.type === 'user' && <div className="whitespace-pre-wrap">{message.content}</div>}
                                {message.type === 'seer' && (
                                  <>
                                    {message.content && (
                                      <div className="whitespace-pre-wrap text-slate-700">
                                        <SlowRevealText
                                          content={message.content}
                                          minThinkingMs={2000}
                                          delayPerWord={85}
                                          thinkingLabel="Consulting the stars..."
                                        />
                                      </div>
                                    )}
                                    {message.response && (
                                  <div className={`space-y-2 ${message.content ? 'mt-3 pt-3 border-t border-amber-200' : ''}`}>
                                    <div className="flex items-center gap-2">
                                      <Badge className={getConfidenceColor(message.response.confidence)}>
                                        {getConfidenceIcon(message.response.confidence)}
                                        {Math.round(message.response.confidence * 100)}% Confidence
                                      </Badge>
                                    </div>
                                    {message.response.timing_window && (
                                      <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <Clock className="w-4 h-4 text-amber-700" />
                                        {message.response.timing_window[0] === message.response.timing_window[1]
                                          ? new Date(message.response.timing_window[0]).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
                                          : `${new Date(message.response.timing_window[0]).toLocaleDateString()} – ${new Date(message.response.timing_window[1]).toLocaleDateString()}`}
                                      </div>
                                    )}
                                    {message.response.timingDetail && (
                                      <div className="mt-2">
                                        <button
                                          type="button"
                                        onClick={() => setExpandedDetailId((id) => (id === message.id ? null : message.id))}
                                        className="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded px-1"
                                      >
                                        {expandedDetailId === message.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        {expandedDetailId === message.id ? 'See less' : 'See more'}
                                      </button>
                                        {expandedDetailId === message.id && (
                                          <>
                                            <p className="mt-2 text-sm text-slate-700 leading-relaxed">{message.response.timingDetail}</p>
                                            {message.response.primarySecondarySystems && (message.response.primarySecondarySystems.primary?.length > 0 || message.response.primarySecondarySystems.secondary?.length > 0) && (
                                              <p className="mt-2 text-sm text-slate-700">
                                                <span className="text-amber-900">Primary:</span> {message.response.primarySecondarySystems.primary?.join(', ') || '—'}
                                                {message.response.primarySecondarySystems.secondary?.length > 0 && (
                                                  <> · <span className="text-amber-900">Supporting:</span> {message.response.primarySecondarySystems.secondary.join(', ')}</>
                                                )}
                                              </p>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    )}
                                    {message.response.primarySecondarySystems && (message.response.primarySecondarySystems.primary?.length > 0 || message.response.primarySecondarySystems.secondary?.length > 0) && (
                                      <p className="text-xs text-slate-600">
                                        Primary: {message.response.primarySecondarySystems.primary?.join(', ') || '—'}
                                        {message.response.primarySecondarySystems.secondary?.length > 0 && <> · Supporting: {message.response.primarySecondarySystems.secondary.join(', ')}</>}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap gap-1">
                                      {(message.response.source_badges ?? []).map((badge, index) => (
                                        <Badge key={index} variant="outline" className="text-xs bg-amber-100 text-amber-900 border-amber-300">
                                          {badge}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-slate-700">
                              <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                              Consulting the mystical forces...
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input bar fixed at bottom of card (chat-style) */}
                <div className="shrink-0 border-t border-amber-200 bg-white/80 p-4">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask me about your future, relationships, career, or any life path..."
                      className="flex-1 bg-white border-amber-200 text-slate-800 placeholder-slate-500 focus:border-amber-400 focus:ring-amber-200 transition-all duration-300"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !inputValue.trim()}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
