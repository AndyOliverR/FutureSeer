'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Sparkles, Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { devLog } from '@/lib/devLogger';

interface NumerologySeerChatInterfaceProps {
  userId: string;
  userProfile: Record<string, unknown>;
  numerologyData: {
    lifePathNumber?: number;
    expressionNumber?: number;
    soulUrgeNumber?: number;
    personalityNumber?: number;
    destinyNumber?: number;
    birthdayNumber?: number;
    maturityNumber?: number;
    personalYearNumber?: number;
  };
  comprehensiveReport?: Record<string, unknown>;
  sessionId?: string;
}

interface Message {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
}

const NUMEROLOGY_STARTER_QUESTIONS = [
  'What is my best power word this week and how should I use it daily?',
  'Which wealth habits fit my life path number without overcomplicating things?',
  'What practical block should I watch this month, and what is the remedy?',
];

export default function NumerologySeerChatInterface({ 
  userId, 
  userProfile, 
  numerologyData,
  comprehensiveReport,
  sessionId 
}: NumerologySeerChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId] = useState(sessionId);
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingDisplayLength, setStreamingDisplayLength] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingLengthRef = useRef(0);

  const SEE_MORE_THRESHOLD = 320;
  const PREVIEW_LENGTH = 320;

  const toggleExpanded = (id: string) => {
    setExpandedMessageIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!streamingMessageId) return;
    const interval = setInterval(() => {
      setStreamingDisplayLength(prev => Math.min(prev + 1, streamingLengthRef.current));
    }, 90);
    return () => clearInterval(interval);
  }, [streamingMessageId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (questionText?: string) => {
    const messageToSend = questionText || question.trim();
    if (!messageToSend || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: messageToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Create placeholder for AI response
    const aiMessageId = `seer_${Date.now()}`;
    const aiMessage: Message = {
      id: aiMessageId,
      type: 'seer',
      content: '',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMessage]);
    setStreamingMessageId(aiMessageId);
    setStreamingDisplayLength(0);
    streamingLengthRef.current = 0;

    try {
      const response = await fetch('/api/ask-numerology-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          question: messageToSend,
          userProfile,
          numerologyData: {
            lifePathNumber: numerologyData.lifePathNumber,
            expressionNumber: numerologyData.expressionNumber,
            soulUrgeNumber: numerologyData.soulUrgeNumber,
            personalityNumber: numerologyData.personalityNumber,
            destinyNumber: numerologyData.destinyNumber,
            birthdayNumber: numerologyData.birthdayNumber,
            maturityNumber: numerologyData.maturityNumber,
            personalYearNumber: numerologyData.personalYearNumber,
            breakdown: (numerologyData as { breakdown?: unknown }).breakdown
          },
          comprehensiveReport: comprehensiveReport || undefined,
          sessionId: currentSessionId
        })
      });
      
      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          accumulatedContent += chunk;
          streamingLengthRef.current = accumulatedContent.length;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg
            )
          );
        }
      }
      setStreamingMessageId(null);
    } catch (error) {
      devLog.error('Numerology Seer error', error, 'NumerologySeerChatInterface');
      setStreamingMessageId(null);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, content: 'I apologize, but I encountered an error. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      if (!questionText) {
        setQuestion('');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (message: Message) => {
    if (message.type === 'user') {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-end"
        >
          <div className="max-w-[80%] rounded-xl p-4 bg-blue-50 border-2 border-blue-200 text-slate-800">
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        </motion.div>
      );
    }

    const isStreaming = message.id === streamingMessageId;
    const contentToShow = isStreaming
      ? message.content.slice(0, streamingDisplayLength)
      : message.content;
    const contentLength = message.content.trim().length;
    const isLong = contentLength > SEE_MORE_THRESHOLD;
    const isExpanded = expandedMessageIds.has(message.id);
    const showPreview = !isStreaming && isLong && !isExpanded;
    const displayContent = showPreview
      ? message.content.slice(0, PREVIEW_LENGTH) +
        (message.content.length > PREVIEW_LENGTH ? '…' : '')
      : contentToShow;

    const truncatedPreview =
      message.content.slice(0, PREVIEW_LENGTH) +
      (message.content.length > PREVIEW_LENGTH ? '…' : '');

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-start"
      >
        <div className="max-w-[80%] rounded-xl p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 text-slate-700">
          <div className="whitespace-pre-wrap leading-relaxed">
            {isStreaming ? (
              displayContent
            ) : isLong && !isExpanded ? (
              truncatedPreview
            ) : (
              displayContent
            )}
          </div>
          {!isStreaming && isLong && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100 p-0 h-auto font-normal flex items-center gap-1"
              onClick={() => toggleExpanded(message.id)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  See less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  See more
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg transition-all duration-300 min-h-[50vh] max-h-[85vh] overflow-hidden">
        <CardHeader className="border-b border-amber-200 bg-white/80 shrink-0 flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Sparkles className="w-5 h-5 text-amber-700" />
            Ask the Seer
          </CardTitle>
          {messages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-amber-900 hover:bg-amber-100 shrink-0"
              onClick={() => setMessages([])}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear chat
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0 p-0">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4">
            {messages.length === 0 && !isLoading ? (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-amber-700" />
                <p className="text-amber-900 font-medium mb-2">Ask me anything about your numerology…</p>
                <p className="text-slate-700 text-sm mt-1 mb-2">I&apos;ll interpret your numbers, cycles, and vibrations to guide timing and alignment.</p>
                <p className="text-slate-600 text-sm font-medium mt-3 mb-1 text-left max-w-md mx-auto">You can ask about:</p>
                <ul className="text-slate-700 text-sm text-left max-w-md mx-auto mb-4 space-y-0.5 list-disc list-inside">
                  <li>Life path and core numbers</li>
                  <li>Favorable dates and days</li>
                  <li>Personal cycles and yearly themes</li>
                  <li>Name or brand alignment</li>
                </ul>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {NUMEROLOGY_STARTER_QUESTIONS.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(q)}
                      disabled={isLoading}
                      className="text-xs text-amber-800 border-amber-200 hover:bg-amber-100"
                    >
                      {q}
                    </Button>
                  ))}
                </div>
                <p className="text-slate-600 text-xs mt-4">Best for: answering when and which timing works best.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map(message => (
                    <div key={message.id}>{formatMessage(message)}</div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                        Consulting your numerology…
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          <div className="shrink-0 border-t border-amber-200 bg-white/80 p-4">
            <form
              onSubmit={e => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about life path, cycles, favorable dates, or name alignment..."
                disabled={isLoading}
                className="flex-1 bg-white border-amber-200 text-slate-800 placeholder-slate-500 focus:border-amber-400 focus:ring-amber-200 transition-all duration-300"
              />
              <Button
                type="submit"
                disabled={isLoading || !question.trim()}
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
  );
}

