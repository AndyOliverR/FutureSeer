'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Loader2, ChevronDown, ChevronUp, Trash2, Clock } from 'lucide-react';
import { SlowRevealText } from '@/components/chat/SlowRevealText';
import { devLog } from '@/lib/devLogger';
import { fetchWithFirebaseAuthRequired } from '@/lib/clientFirebaseFetch';
import { stripAttributionForDisplay } from '@/lib/attribution/attributionStamp';
import type { HoraryChartPayload } from '@/lib/horarySeerState';

interface HorarySeerMessage {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
}

interface HorarySeerChatInterfaceProps {
  horaryData: HoraryChartPayload | null | undefined;
  userId?: string;
  userProfile?: any;
  sessionId?: string;
}

const SEE_MORE_THRESHOLD = 320;
const PREVIEW_LENGTH = 320;
const STREAM_INTERVAL_MS = 90;

const EMPTY_STATE_MESSAGE =
  'Generate a horary chart first to use Ask the Seer.';

const REGENERATE_MESSAGE =
  'Generate a horary chart first to use Ask the Seer.';

const UNAVAILABLE_MESSAGE =
  "The request didn't go through. Please try again in a moment.";

const RETRY_DELAY_MS = 1500;

const HORARY_STARTER_QUESTIONS = [
  'Will my app launch succeed if I release it now?',
  'Will this partnership work out?',
  'Will I receive the offer I\'m waiting for?',
];

export default function HorarySeerChatInterface({
  horaryData,
  userId,
  userProfile,
  sessionId,
}: HorarySeerChatInterfaceProps) {
  const [messages, setMessages] = useState<HorarySeerMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingDisplayLength, setStreamingDisplayLength] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingLengthRef = useRef(0);

  const hasBasicInfo =
    horaryData?.basicInfo?.question &&
    horaryData?.basicInfo?.questionTime &&
    horaryData?.basicInfo?.questionPlace;
  const hasSeerState = !!horaryData?.seerState?.ascendantSign;
  const hasChart = !!horaryData && hasBasicInfo && hasSeerState;

  const toggleExpanded = (id: string) => {
    setExpandedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingMessageId(null);
    setStreamingDisplayLength(0);
    setExpandedMessageIds(new Set());
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
    const messageToSend = (questionText ?? question).trim();
    if (!messageToSend || isLoading || !hasChart || !horaryData) return;

    const userMessage: HorarySeerMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: messageToSend,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    const aiMessageId = `seer_${Date.now()}`;
    const aiMessage: HorarySeerMessage = {
      id: aiMessageId,
      type: 'seer',
      content: '',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, aiMessage]);
    setStreamingMessageId(aiMessageId);
    setStreamingDisplayLength(0);
    streamingLengthRef.current = 0;

    const body = {
      userId: userId ?? '',
      question: messageToSend,
      userProfile: userProfile ?? {},
      horaryData,
      sessionId: sessionId ?? `horary_${Date.now()}`,
    };

    const performFetch = () =>
      fetchWithFirebaseAuthRequired('/api/ask-horary-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

    const setUnavailableMessage = () => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, content: UNAVAILABLE_MESSAGE } : msg
        )
      );
    };

    const isRetryableStatus = (status: number) =>
      status === 500 || status >= 502;

    try {
      let response = await performFetch();

      if (!response.ok && isRetryableStatus(response.status)) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        response = await performFetch();
      }

      if (!response.ok) {
        setStreamingMessageId(null);
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = (errorData?.error ?? '') as string;
          if (
            errorMessage.toLowerCase().includes('chart') ||
            errorMessage.toLowerCase().includes('horary') ||
            errorMessage.toLowerCase().includes('generate') ||
            errorMessage.toLowerCase().includes('first')
          ) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId ? { ...msg, content: REGENERATE_MESSAGE } : msg
              )
            );
            return;
          }
        }
        setUnavailableMessage();
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
              msg.id === aiMessageId ? { ...msg, content: stripAttributionForDisplay(accumulatedContent) } : msg
            )
          );
        }
      }
      setStreamingMessageId(null);
    } catch (err) {
      devLog.error('Horary Seer error', err, 'HorarySeerChatInterface');
      setStreamingMessageId(null);
      try {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        const retryResponse = await performFetch();
        if (!retryResponse.ok) {
          setUnavailableMessage();
          return;
        }
        const reader = retryResponse.body?.getReader();
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
                msg.id === aiMessageId ? { ...msg, content: stripAttributionForDisplay(accumulatedContent) } : msg
              )
            );
          }
        }
        setStreamingMessageId(null);
      } catch {
        setUnavailableMessage();
      }
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

  const formatMessage = (message: HorarySeerMessage) => {
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
            {isStreaming ? (
              <SlowRevealText content={displayContent} minThinkingMs={2000} delayPerWord={85} thinkingLabel="Consulting the stars..." className="text-slate-700" />
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

  if (!hasChart) {
    return (
      <Card className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 min-h-[50vh] max-h-[85vh] overflow-hidden">
        <CardHeader className="border-b border-amber-200 bg-white/80 shrink-0">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Clock className="w-5 h-5 text-amber-700" />
            Ask the Seer — Horary Astrology
          </CardTitle>
          <p className="text-sm text-slate-700 mt-1">
            One clear question, one moment.
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
          <Clock className="w-12 h-12 text-amber-700 mb-4" />
          <p className="text-amber-900 font-medium text-center">
            {EMPTY_STATE_MESSAGE}
          </p>
          <p className="text-sm text-slate-700 mt-2 text-center">
            Enter your question, time, and place above and generate your horary chart first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg min-h-[50vh] max-h-[85vh] overflow-hidden">
      <CardHeader className="border-b border-amber-200 bg-white/80 shrink-0 flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <MessageCircle className="w-5 h-5 text-amber-700" />
            Ask the Seer — Horary Astrology
          </CardTitle>
          <p className="text-sm text-slate-700 mt-1">
            One clear question, one moment.
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-amber-900 hover:bg-amber-100 shrink-0"
            onClick={clearChat}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear chat
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4">
          {messages.length === 0 && !isLoading ? (
            <div className="text-center py-8 max-w-lg mx-auto">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-amber-700" />
              <p className="text-amber-900 font-medium mb-2">
                Ask one clear question right now…
              </p>
              <p className="text-sm text-slate-700 mb-4">
                I&apos;ll cast a chart for the moment your question is asked to judge the outcome.
              </p>
              <p className="text-slate-600 text-sm font-medium mb-2 text-left">You can ask about:</p>
              <ul className="text-sm text-slate-700 mb-4 text-left list-disc pl-5 space-y-1">
                <li>Clear, specific outcome questions (Will I get this job? Will the deal go through? Will my app launch smoothly? Will I hear back from them?)</li>
                <li>Short-term timing, conditional (Is it likely soon or delayed? What is blocking progress right now?)</li>
              </ul>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {HORARY_STARTER_QUESTIONS.map((q, i) => (
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
              <p className="text-slate-600 text-xs mt-4">
                Best for: one clear question at one moment; not long-term or multiple outcomes.
              </p>
              <p className="text-slate-600 text-xs mt-1">
                One question at a time. No follow-ups inside the same horary.
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
                      Consulting the chart…
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
              placeholder="e.g. Will my app launch succeed if I release it now?"
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
