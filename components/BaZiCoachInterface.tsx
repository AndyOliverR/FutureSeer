'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import type { BaziReading } from '@/lib/baziIntelligence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle, Loader2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { devLog } from '@/lib/devLogger';
import { fetchWithFirebaseAuthRequired } from '@/lib/clientFirebaseFetch';
import { stripAttributionForDisplay } from '@/lib/attribution/attributionStamp';

interface BaZiMessage {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
}

interface BaZiCoachInterfaceProps {
  reading: BaziReading | null;
}

const SEE_MORE_THRESHOLD = 320;
const PREVIEW_LENGTH = 320;
const STREAM_INTERVAL_MS = 90;

const REGENERATE_MESSAGE =
  'Generate your BaZi reading first to use Ask the Seer.';

const BAZI_STARTER_QUESTIONS = [
  'What does my BaZi chart say about my life structure?',
  'Which phases of my life are more favorable?',
  'How do my luck cycles affect career or wealth?',
  'Why do certain years feel more challenging?',
];

export function BaZiCoachInterface({ reading }: BaZiCoachInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<BaZiMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(
    new Set()
  );
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );
  const [streamingDisplayLength, setStreamingDisplayLength] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingLengthRef = useRef(0);

  const toggleExpanded = (id: string) => {
    setExpandedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!streamingMessageId) return;
    const interval = setInterval(() => {
      setStreamingDisplayLength((prev) =>
        Math.min(prev + 1, streamingLengthRef.current)
      );
    }, STREAM_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [streamingMessageId]);

  const sendMessage = async (questionText?: string) => {
    const messageToSend = questionText ?? question.trim();
    if (!messageToSend || isLoading || !reading) return;

    const userMessage: BaZiMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: messageToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    const aiMessageId = `seer_${Date.now()}`;
    const aiMessage: BaZiMessage = {
      id: aiMessageId,
      type: 'seer',
      content: '',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setStreamingMessageId(aiMessageId);
    setStreamingDisplayLength(0);
    streamingLengthRef.current = 0;

    try {
      const response = await fetchWithFirebaseAuthRequired('/api/ask-bazi-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid ?? '',
          question: messageToSend,
          baziReading: reading,
        }),
      });

      if (!response.ok) {
        setStreamingMessageId(null);
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = (errorData?.error ?? '') as string;
          if (
            errorMessage.toLowerCase().includes('reading') ||
            errorMessage.toLowerCase().includes('generate')
          ) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, content: REGENERATE_MESSAGE }
                  : msg
              )
            );
            return;
          }
        }
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content:
                    'BaZi Seer is unavailable. Please try again.',
                }
              : msg
          )
        );
        return;
      }

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
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: stripAttributionForDisplay(accumulatedContent) }
                : msg
            )
          );
        }
      }
      setStreamingMessageId(null);
    } catch (err) {
      devLog.error('BaZi Seer error', err, 'BaZiCoachInterface');
      setStreamingMessageId(null);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: 'BaZi Seer is unavailable. Please try again.',
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingMessageId(null);
    setStreamingDisplayLength(0);
    streamingLengthRef.current = 0;
  };

  const formatMessage = (message: BaZiMessage) => {
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
          <div className="whitespace-pre-wrap leading-relaxed">
            {displayContent}
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

  if (!reading) {
    return (
      <Card className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 min-h-[50vh] max-h-[85vh] overflow-hidden">
        <CardHeader className="border-b border-amber-200 bg-white/80 shrink-0">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <MessageCircle className="w-5 h-5 text-amber-700" />
            Ask the Seer — BaZi
          </CardTitle>
          <p className="text-sm text-amber-800 mt-1">
            Destiny structure and life cycles, not daily advice.
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
          <MessageCircle className="w-12 h-12 text-amber-600 mb-4" />
          <p className="text-amber-900 font-medium text-center">
            {REGENERATE_MESSAGE}
          </p>
          <p className="text-sm text-amber-700 mt-2 text-center">
            Generate your BaZi reading first to get personalized guidance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg min-h-[50vh] max-h-[85vh] overflow-hidden">
      <CardHeader className="border-b border-amber-200 bg-white/80 shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <MessageCircle className="w-5 h-5 text-amber-700" />
              Ask the Seer — BaZi
            </CardTitle>
            <p className="text-sm text-amber-800 mt-1">
              Destiny structure and life cycles, not daily advice.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearChat}
            disabled={isLoading}
            className="shrink-0 text-amber-700 hover:text-amber-900 hover:bg-amber-100"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear chat
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4">
          {messages.length === 0 && !isLoading ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-amber-600" />
              <p className="text-amber-900 font-medium mb-2">
                Ask me anything about your destiny and life cycles…
              </p>
              <p className="text-sm text-amber-800 mb-3">
                I&apos;ll interpret your Four Pillars of Destiny to reveal life structure, strength phases, and long-term fortune patterns.
              </p>
              <p className="text-xs text-amber-800 font-medium mb-1 text-left max-w-md mx-auto">
                You can ask about:
              </p>
              <ul className="text-xs text-amber-800 text-left max-w-md mx-auto mb-3 list-disc list-inside">
                <li>Life structure &amp; strength</li>
                <li>Luck cycles (good vs difficult periods, which phases support growth)</li>
                <li>Career &amp; wealth structure</li>
                <li>Relationships (structural patterns, compatibility—not dates)</li>
              </ul>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {BAZI_STARTER_QUESTIONS.map((q, i) => (
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
              <p className="text-xs text-amber-700 mt-4">
                Best for: Destiny structure and long-term life cycles, not daily advice or exact dates.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <div key={message.id}>{formatMessage(message)}</div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                      Consulting your Four Pillars…
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <div className="shrink-0 border-t border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)] p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about life structure, luck cycles, career, or wealth…"
              disabled={isLoading}
              className="flex-1 bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] focus:border-amber-400 focus:ring-amber-200"
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
