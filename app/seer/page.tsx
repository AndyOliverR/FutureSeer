"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { TopNavBar } from '@/components/TopNavBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, Clock, AlertTriangle, Target, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
}

interface ChatMessage {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: Date;
  response?: SeerResponse;
}

export default function SeerPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample questions for inspiration
  const sampleQuestions = [
    "Will the MSME grant arrive in December?",
    "When is the best time for my career breakthrough?",
    "Are we compatible for marriage?",
    "Will my health improve this month?",
    "When should I travel abroad for business?",
    "Is this a good time to start a new business?",
    "Will I get the job promotion this year?",
    "When will I find my soulmate?",
    "Should I invest in the stock market now?",
    "Will my relationship issues resolve soon?"
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use The Seer.",
        variant: "destructive",
      });
      return;
    }

    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message immediately
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/seer/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.uid,
          query: userMessage,
          context: {
            session_id: sessionId,
            birth_data: user.birthData || null
          }
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get mystical insights');
      }

      const seerResponse: SeerResponse = result.data;
      setSessionId(seerResponse.session_id);

      // Add seer response
      const seerMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'seer',
        content: formatSeerResponse(seerResponse),
        timestamp: new Date(),
        response: seerResponse
      };

      setMessages(prev => [...prev, seerMsg]);

    } catch (error) {
      console.error('Seer API Error:', error);
      
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'seer',
        content: `🔮 I apologize, but I'm unable to provide mystical insights at the moment. Please try again later or rephrase your question.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMsg]);

      toast({
        title: "Mystical Connection Lost",
        description: error instanceof Error ? error.message : "Failed to connect with the mystical realm",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
    
    formatted += `📊 **Sources:** ${response.source_badges.join(', ')}`;
    
    if (response.clarify) {
      formatted += `\n\n❓ **Clarification needed:** ${response.clarify}`;
    }
    
    return formatted;
  };

  const handleSampleQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
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

  return (
    <div className="min-h-screen bg-slate-950">
      <TopNavBar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
            🔮 The Seer
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Ask me anything about your future, relationships, career, health, or any life path. 
            I'll consult the stars, numbers, and mystical forces to guide you.
          </p>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Messages */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px] flex flex-col">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-purple-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Mystical Consultation
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full p-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Ask me anything about your future...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-4 ${
                              message.type === 'user'
                                ? 'bg-purple-600/20 border border-purple-500/30 text-white'
                                : 'bg-slate-800/50 border border-slate-600/30 text-slate-200'
                            }`}
                          >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            
                            {/* Show response metadata if available */}
                            {message.type === 'seer' && message.response && (
                              <div className="mt-3 pt-3 border-t border-slate-600/30 space-y-2">
                                {/* Confidence */}
                                <div className="flex items-center gap-2">
                                  <Badge className={getConfidenceColor(message.response.confidence)}>
                                    {getConfidenceIcon(message.response.confidence)}
                                    {Math.round(message.response.confidence * 100)}% Confidence
                                  </Badge>
                                </div>
                                
                                {/* Timing */}
                                {message.response.timing_window && (
                                  <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Clock className="w-4 h-4" />
                                    {new Date(message.response.timing_window[0]).toLocaleDateString()} - {new Date(message.response.timing_window[1]).toLocaleDateString()}
                                  </div>
                                )}
                                
                                {/* Source badges */}
                                <div className="flex flex-wrap gap-1">
                                  {message.response.source_badges.map((badge, index) => (
                                    <Badge key={index} variant="outline" className="text-xs bg-slate-700/50 border-slate-600">
                                      {badge}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Consulting the mystical forces...
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me about your future, relationships, career, or any life path..."
                  className="flex-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sample Questions */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-purple-300 text-lg">Sample Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleQuestion(question)}
                      className="w-full text-left p-3 rounded-lg bg-slate-800/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 transition-all text-sm text-slate-300 hover:text-white"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-purple-300 text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300 mt-0.5">
                    1
                  </div>
                  <p>Ask your question about any life aspect</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300 mt-0.5">
                    2
                  </div>
                  <p>I analyze using multiple divination systems</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300 mt-0.5">
                    3
                  </div>
                  <p>Receive detailed insights with timing and actions</p>
                </div>
              </CardContent>
            </Card>

            {/* Divination Systems */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-purple-300 text-lg">Divination Systems</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    'Vimshottari Dasha',
                    'Transit Analysis',
                    'Raj Yoga Timing',
                    'Moon Windows',
                    'Numerology',
                    'Tarot Insight',
                    'Angel Numbers',
                    'Compatibility'
                  ].map((system, index) => (
                    <Badge key={index} variant="outline" className="bg-slate-800/50 border-slate-600 text-slate-300">
                      {system}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 