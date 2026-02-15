'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Sparkles, Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlowRevealText } from '@/components/chat/SlowRevealText';
import { devLog } from '@/lib/devLogger';

interface PsychologicalSeerChatInterfaceProps {
  userId: string;
  userProfile: any;
  westernChartData?: any;
  psychologicalReport?: Record<string, unknown> | { comprehensiveAnalysis?: Record<string, unknown> };
  sessionId?: string;
}

interface Message {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
}

const PSYCHOLOGICAL_STARTER_QUESTIONS = [
  'Why do I react emotionally this way?',
  'What shadow pattern should I integrate?',
  'Why do I keep attracting the same type of partner?',
  'What does my chart say about my emotional triggers?',
  'Why do I feel divided between logic and emotion?',
];

const SEE_MORE_THRESHOLD = 320;
const PREVIEW_LENGTH = 320;

export default function PsychologicalSeerChatInterface({
  userId,
  userProfile,
  westernChartData,
  psychologicalReport,
  sessionId,
}: PsychologicalSeerChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingDisplayLength, setStreamingDisplayLength] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingLengthRef = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!streamingMessageId) return;
    const interval = setInterval(() => {
      setStreamingDisplayLength((prev) =>
        Math.min(prev + 1, streamingLengthRef.current)
      );
    }, 90);
    return () => clearInterval(interval);
  }, [streamingMessageId]);

  const toggleExpanded = (id: string) => {
    setExpandedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sendMessage = async (questionText?: string) => {
    const messageToSend = questionText || question.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: messageToSend,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const aiMessageId = `seer_${Date.now()}`;
    const aiMessage: Message = {
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
      const response = await fetch('/api/ask-psychological-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          question: messageToSend,
          userProfile,
          westernChartData: westernChartData || undefined,
          psychologicalReport: psychologicalReport || undefined,
          sessionId,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

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
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg
            )
          );
        }
      }
      setStreamingMessageId(null);
    } catch (error) {
      devLog.error('Psychological Seer error', error, 'PsychologicalSeerChatInterface');
      setStreamingMessageId(null);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: 'I apologize, but I encountered an error. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      if (!questionText) setQuestion('');
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
        <div className="max-w-[80%] rounded-xl p-4 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 text-slate-700">
          <div className="whitespace-pre-wrap leading-relaxed">
            {isStreaming ? (
              displayContent
            ) : (
              <SlowRevealText
                content={showPreview ? displayContent : message.content}
                minThinkingMs={2000}
                delayPerWord={85}
                thinkingLabel="Reflecting on your inner patterns..."
                className="text-slate-700"
              />
            )}
          </div>
          {!isStreaming && isLong && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 text-teal-700 hover:text-teal-900 hover:bg-teal-100 p-0 h-auto font-normal flex items-center gap-1"
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
    <Card className="flex flex-col h-full bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 shadow-lg transition-all duration-300 min-h-[50vh] max-h-[85vh] overflow-hidden">
      <CardHeader className="border-b border-teal-200 bg-white/80 flex flex-row items-center justify-between gap-2 shrink-0">
        <CardTitle className="text-teal-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-700" />
          Psychological Astrology — Ask the Seer
        </CardTitle>
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-teal-900 hover:bg-teal-100 shrink-0"
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
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-teal-700" />
              <p className="text-teal-900 font-medium mb-2">
                Ask me anything about your inner patterns and emotional dynamics…
              </p>
              <p className="text-slate-700 text-sm mt-1 mb-2">
                I'll interpret your chart to reveal subconscious drives, defense mechanisms,
                relational patterns, and growth psychology.
              </p>
              <p className="text-slate-600 text-sm font-medium mt-3 mb-1 text-left max-w-md mx-auto">
                You can ask about:
              </p>
              <ul className="text-slate-700 text-sm text-left max-w-md mx-auto mb-4 space-y-0.5 list-disc list-inside">
                <li>Why you react or repeat certain patterns</li>
                <li>Emotional triggers and boundaries</li>
                <li>Shadow traits and integration</li>
                <li>Relationship dynamics and attachment</li>
              </ul>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {PSYCHOLOGICAL_STARTER_QUESTIONS.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="text-xs text-teal-800 border-teal-200 hover:bg-teal-100"
                  >
                    {q}
                  </Button>
                ))}
              </div>
              <p className="text-slate-600 text-xs mt-4">
                Inner-pattern insight only; no prediction, timing, or therapy.
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
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
                      Reflecting on your inner patterns...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-teal-200 bg-white/80 p-4">
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
              placeholder="Ask about inner patterns, emotional triggers, or growth..."
              disabled={isLoading}
              className="flex-1 bg-white border-teal-200 text-slate-800 placeholder-slate-500 focus:border-teal-400 focus:ring-teal-200"
            />
            <Button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white"
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
