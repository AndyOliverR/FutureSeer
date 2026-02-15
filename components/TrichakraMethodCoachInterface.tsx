'use client';

import { useState, useRef, useEffect } from 'react';
import { useTrichakra } from '@/hooks/use-trichakra';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Send,
  Sparkles,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TrichakraAnalysis } from '@/lib/trichakraIntelligence';
import { devLog } from '@/lib/devLogger';

interface Message {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface TrichakraMethodCoachInterfaceProps {
  trichakraAnalysis?: TrichakraAnalysis;
  onRegenerate?: () => void;
}

const SEE_MORE_THRESHOLD = 320;
const PREVIEW_LENGTH = 320;

const TRICHAKRA_STARTER_QUESTIONS = [
  'What remedies does my Trichakra analysis recommend?',
  'Which area—body, mind, or soul—should I focus on first?',
  'What actions will help me regain balance?',
];

export function TrichakraMethodCoachInterface({
  trichakraAnalysis: propAnalysis,
  onRegenerate
}: TrichakraMethodCoachInterfaceProps = {}) {
  const { analysis: hookAnalysis, userProfile, performTrichakraAnalysis } = useTrichakra();
  const { user } = useAuth();
  const analysis = propAnalysis || hookAnalysis;
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId] = useState<string | undefined>(undefined);
  const [stateUnavailable, setStateUnavailable] = useState(false);
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingDisplayLength, setStreamingDisplayLength] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingLengthRef = useRef(0);

  const handleRegenerate = () => {
    setStateUnavailable(false);
    const fn = onRegenerate ?? performTrichakraAnalysis;
    if (fn) fn();
  };

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (questionText?: string) => {
    const messageToSend = questionText || question.trim();
    if (!messageToSend || isLoading || !user?.uid || !analysis) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: messageToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    if (!questionText) setQuestion('');

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
      const response = await fetch('/api/ask-trichakra-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          question: messageToSend,
          userProfile,
          trichakraAnalysis: analysis,
          sessionId: currentSessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = (errorData?.error ?? '') as string;
        if (
          response.status === 400 &&
          (errorMessage.toLowerCase().includes('unavailable') ||
            errorMessage.toLowerCase().includes('regenerate'))
        ) {
          setStateUnavailable(true);
          setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
          setStreamingMessageId(null);
          setStreamingDisplayLength(0);
          return;
        }
        throw new Error(errorMessage || 'Failed to get response');
      }
      setStateUnavailable(false);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulatedContent = '';
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
      setStreamingDisplayLength(0);
    } catch (error) {
      devLog.error('Trichakra Seer error', error, 'TrichakraMethodCoachInterface');
      setStreamingMessageId(null);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content:
                  'I apologize, but I encountered an error. Please ensure you have a complete profile and try again.'
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!streamingMessageId) return;
    const interval = setInterval(() => {
      setStreamingDisplayLength(prev =>
        Math.min(prev + 1, streamingLengthRef.current)
      );
    }, 90);
    return () => clearInterval(interval);
  }, [streamingMessageId]);

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
    const isLong = message.content.length > SEE_MORE_THRESHOLD;
    const isExpanded = expandedMessageIds.has(message.id);
    const showPreview = !isStreaming && isLong && !isExpanded;
    const displayContent = showPreview
      ? message.content.slice(0, PREVIEW_LENGTH) +
        (message.content.length > PREVIEW_LENGTH ? '…' : '')
      : contentToShow;

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-start"
      >
        <div className="max-w-[80%] rounded-xl p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 text-slate-700">
          <div className="whitespace-pre-wrap leading-relaxed">{displayContent}</div>
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

  const showEmptyState = messages.length === 0 && !isLoading;

  const emptyStateContent = !analysis ? (
    <div className="text-center py-8">
      <Sparkles className="w-12 h-12 mx-auto mb-4 text-amber-700" />
      <p className="text-amber-900 font-medium">Generate your Trichakra analysis to begin</p>
      <p className="text-sm mt-2 text-slate-700">Complete your profile to get personalized remedies</p>
    </div>
  ) : !user?.uid ? (
    <div className="text-center py-8">
      <Sparkles className="w-12 h-12 mx-auto mb-4 text-amber-700" />
      <p className="text-amber-900 font-medium">Please sign in to use Ask the Seer</p>
    </div>
  ) : (
    <div className="text-center py-8">
      <Sparkles className="w-12 h-12 mx-auto mb-4 text-amber-700" />
      <p className="text-amber-900 font-medium mb-2">Welcome to Trichakra Consultation.</p>
      <p className="text-slate-700 text-sm mt-1 mb-2">I'll guide you using remedies for body, mind, and soul based on your analysis.</p>
      <p className="text-slate-600 text-sm font-medium mt-3 mb-1 text-left max-w-md mx-auto">You can ask about:</p>
      <ul className="text-slate-700 text-sm text-left max-w-md mx-auto mb-4 space-y-0.5 list-disc list-inside">
        <li>Practical remedies and corrective actions</li>
        <li>Emotional, mental, or energetic imbalance</li>
        <li>What to strengthen or avoid</li>
        <li>How to realign yourself</li>
      </ul>
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {TRICHAKRA_STARTER_QUESTIONS.map((q, i) => (
          <Button
            key={i}
            type="button"
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
      <p className="text-slate-600 text-xs mt-4">Best for: knowing what to do, not predicting outcomes.</p>
    </div>
  );

  return (
    <Card className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg transition-all duration-300 min-h-[50vh] max-h-[85vh] overflow-hidden">
      <CardHeader className="border-b border-amber-200 bg-white/80 flex flex-row items-center justify-between gap-2 shrink-0">
        <CardTitle className="text-amber-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-700" />
          Trichakra Consultation
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
          {showEmptyState ? (
            emptyStateContent
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
                      Consulting your Trichakra state…
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {stateUnavailable && (
          <div className="mx-4 mb-2 p-4 rounded-xl border-2 border-amber-200 bg-amber-50/90 text-amber-900">
            <p className="text-sm font-medium mb-3">
              Your current Trichakra state is unavailable. Should I regenerate it?
            </p>
            <button
              type="button"
              onClick={handleRegenerate}
              className="px-4 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
            >
              Regenerate
            </button>
          </div>
        )}

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
              placeholder={
                !user?.uid
                  ? 'Sign in to ask questions…'
                  : !analysis
                    ? 'Generate analysis first…'
                    : 'Ask about remedies, body/mind/soul, or action plan…'
              }
              disabled={!user?.uid || !analysis || isLoading}
              className="flex-1 bg-white border-amber-200 text-slate-800 placeholder-slate-500 focus:border-amber-400 focus:ring-amber-200 transition-all duration-300"
            />
            <Button
              type="submit"
              disabled={isLoading || !question.trim() || !user?.uid || !analysis}
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
