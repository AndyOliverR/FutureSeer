'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Sparkles, Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { devLog } from '@/lib/devLogger';
import { fetchWithFirebaseAuthRequired } from '@/lib/clientFirebaseFetch';
import { stripAttributionForDisplay } from '@/lib/attribution/attributionStamp';
import type { UserProfile } from '@/lib/firebase';
import { SEER_COMPOSER_BAR_CLASS, SEER_COMPOSER_INPUT_CLASS } from '@/lib/ui/seerComposerChrome';

export type VedicSeerFocusLens = 'career' | 'relationships' | 'remedies';

interface VedicSeerChatInterfaceProps {
  userId: string;
  userProfile: UserProfile;
  vedicChartData?: Record<string, unknown> | null;
  vedicNumerologyData?: Record<string, unknown>;
  sessionId?: string;
  /** Ground answers in the career, relationships, or remedies focused report when set. */
  focusLens?: VedicSeerFocusLens | null;
  /** When set, starter questions and the Seer request stay on this graha. */
  planetFocus?: string | null;
}

interface Message {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
}

const VEDIC_STARTER_QUESTIONS_DEFAULT = [
  'When is a favorable period for career or business?',
  'Does my chart show marriage, and when?',
  'Which dasha am I running, and what does it bring?',
  'Why do I face repeated obstacles despite effort?',
];

const VEDIC_STARTER_QUESTIONS_CAREER = [
  'What does my 10th house say about my next career move?',
  'When is the best window to ask for a raise or switch jobs?',
  'Which path in my career report fits me most right now?',
  'What should I focus on in my 7-day action plan?',
];

const VEDIC_STARTER_QUESTIONS_RELATIONSHIPS = [
  'What does my chart say about partnership timing?',
  'How do Venus and Moon shape what I need in connection?',
  'What patterns should I watch in relationships?',
  'When is a supportive window for clarity or commitment?',
];

const VEDIC_STARTER_QUESTIONS_REMEDIES = [
  'Which traditional upayas fit my current dasha without over-strengthening a malefic?',
  'What lifestyle practices should I start with before mantras or gems?',
  'How should I work with a weak planet without treating it as a punishment?',
  'What does my chart say I should avoid in gemstone or ritual work?',
];

function starterQuestionsForPlanet(planet: string): string[] {
  return [
    `What is ${planet} teaching in my Vedic chart right now?`,
    `Which traditional upayas fit my ${planet} placement, and what should I not do?`,
    `How should I work with ${planet} during this dasha without forcing results?`,
    `Does my chart support a ${planet} gemstone, or should I stay with conduct and mantra?`,
  ];
}

function starterQuestionsForLens(focusLens: VedicSeerFocusLens | null, planetFocus: string | null): string[] {
  if (planetFocus) return starterQuestionsForPlanet(planetFocus);
  switch (focusLens) {
    case 'career':
      return VEDIC_STARTER_QUESTIONS_CAREER;
    case 'relationships':
      return VEDIC_STARTER_QUESTIONS_RELATIONSHIPS;
    case 'remedies':
      return VEDIC_STARTER_QUESTIONS_REMEDIES;
    case null:
      return VEDIC_STARTER_QUESTIONS_DEFAULT;
    default: {
      const _exhaustive: never = focusLens;
      return _exhaustive;
    }
  }
}

export default function VedicSeerChatInterface({
  userId,
  userProfile,
  vedicChartData,
  vedicNumerologyData,
  sessionId,
  focusLens = null,
  planetFocus = null,
}: VedicSeerChatInterfaceProps) {
  const starterQuestions = starterQuestionsForLens(focusLens, planetFocus);
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

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: messageToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

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
      const response = await fetchWithFirebaseAuthRequired('/api/ask-vedic-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          question: messageToSend,
          userProfile,
          vedicChartData,
          vedicNumerologyData,
          sessionId: currentSessionId,
          ...(focusLens ? { focusLens } : {}),
          ...(planetFocus ? { planetFocus } : {}),
        })
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const errMsg = (errBody?.error as string) || 'Failed to get response';
        setStreamingMessageId(null);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content:
                    response.status === 400
                      ? 'Generate your Vedic chart with birth time to use Ask the Seer.'
                      : errMsg
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
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId ? { ...msg, content: stripAttributionForDisplay(accumulatedContent) } : msg
            )
          );
        }
      }
      setStreamingMessageId(null);
    } catch (error) {
      devLog.error('Vedic Seer error', error, 'VedicSeerChatInterface');
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
        <div className="max-w-[80%] rounded-xl border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] p-4 text-[var(--m3-on-surface)]">
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
              className="mt-2 h-auto p-0 font-normal flex items-center gap-1 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200"
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
    <Card className="flex h-full min-h-[50vh] max-h-[85vh] flex-col overflow-hidden border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)] transition-all duration-300">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between gap-2 border-b border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)]">
        <CardTitle className="flex items-center gap-2 text-amber-200">
          <Sparkles className="w-5 h-5 text-amber-700" />
          Vedic Consultation
        </CardTitle>
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-[var(--m3-on-surface-variant)] hover:bg-amber-500/10 hover:text-amber-200"
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
              <p className="mb-2 font-medium text-amber-200">Ask me anything about your destiny, timing, and life path…</p>
              <p className="mt-1 mb-2 text-sm text-[var(--m3-on-surface-variant)]">
                I&apos;ll consult your Vedic birth chart, planetary periods, and yogas to reveal outcomes, timing, and karmic patterns.
              </p>
              <p className="text-slate-600 text-sm font-medium mt-3 mb-1 text-left max-w-md mx-auto">You can ask about:</p>
              <ul className="mx-auto mb-4 max-w-md list-inside list-disc space-y-0.5 text-left text-sm text-[var(--m3-on-surface-variant)]">
                <li>Life events and outcomes (marriage, career, health tendencies, wealth, education, relocation)</li>
                <li>Timing (favorable periods, when a phase improves, when to act vs wait, which dasha supports which goal)</li>
                <li>Karmic and pattern questions (why struggles repeat, strengths from past karma, major life themes)</li>
              </ul>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {starterQuestions.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="border-[var(--m3-outline-variant)] text-xs text-amber-200 hover:bg-amber-500/10"
                  >
                    {q}
                  </Button>
                ))}
              </div>
              <p className="text-slate-600 text-xs mt-4">Best for: understanding what will happen and when, within astrological limits.</p>
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
                  <div className="rounded-xl border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] p-4">
                    <div className="flex items-center gap-2 text-[var(--m3-on-surface-variant)]">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                      Consulting your chart…
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <div className={SEER_COMPOSER_BAR_CLASS}>
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
              placeholder="Ask about timing, career, marriage, dashas, or remedies..."
              disabled={isLoading}
              className={SEER_COMPOSER_INPUT_CLASS}
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
