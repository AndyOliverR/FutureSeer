'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Loader2, ChevronDown, ChevronUp, Moon, Trash2 } from 'lucide-react';
import { SlowRevealText } from '@/components/chat/SlowRevealText';
import { devLog } from '@/lib/devLogger';
import type { DreamAnalysis } from '@/lib/dreamSymbolsIntelligence';

interface DreamSymbolsMessage {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
}

interface DreamSymbolsSeerChatInterfaceProps {
  analysis: DreamAnalysis | null | undefined;
  userId?: string;
  userProfile?: any;
  sessionId?: string;
  dreamData?: any;
}

const SEE_MORE_THRESHOLD = 320;
const PREVIEW_LENGTH = 320;
const STREAM_INTERVAL_MS = 90;

const EMPTY_STATE_MESSAGE =
  'Generate Dream Symbols analysis first to use Ask the Seer.';

const REGENERATE_MESSAGE =
  'Generate Dream Symbols analysis first to use Ask the Seer.';

const UNAVAILABLE_MESSAGE =
  "The request didn't go through. Please try again in a moment.";

const RETRY_DELAY_MS = 1500;

const DREAM_SYMBOLS_STARTER_QUESTIONS = [
  'What does my dream about water mean?',
  'Why do I keep dreaming about the same person or place?',
  'What message is this dream trying to show me?',
  'Is my dream reflecting fear or change?',
];

export default function DreamSymbolsSeerChatInterface({
  analysis,
  userId,
  userProfile,
  sessionId,
  dreamData,
}: DreamSymbolsSeerChatInterfaceProps) {
  const [messages, setMessages] = useState<DreamSymbolsMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingDisplayLength, setStreamingDisplayLength] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingLengthRef = useRef(0);

  const hasDescription =
    typeof analysis?.dreamDescription === 'string' &&
    analysis.dreamDescription.trim().length > 0;
  const hasSymbols =
    Array.isArray(analysis?.symbols) && analysis.symbols.length > 0;
  const hasAnalysis = !!analysis && (hasDescription || hasSymbols);

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
    if (!messageToSend || isLoading || !hasAnalysis || !analysis) return;

    const userMessage: DreamSymbolsMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: messageToSend,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    const aiMessageId = `seer_${Date.now()}`;
    const aiMessage: DreamSymbolsMessage = {
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
      dreamSymbolsAnalysis: analysis,
      ...(dreamData && { dreamData }),
      sessionId: sessionId ?? `dream-symbols_${Date.now()}`,
    };

    const performFetch = () =>
      fetch('/api/ask-dream-symbols-seer', {
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
            errorMessage.toLowerCase().includes('analysis') ||
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
              msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg
            )
          );
        }
      }
      setStreamingMessageId(null);
    } catch (err) {
      devLog.error('Dream Symbols Seer error', err, 'DreamSymbolsSeerChatInterface');
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
                msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg
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

  const formatMessage = (message: DreamSymbolsMessage) => {
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

  if (!hasAnalysis) {
    return (
      <Card className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 min-h-[50vh] max-h-[85vh] overflow-hidden">
        <CardHeader className="border-b border-amber-200 bg-white/80 shrink-0">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Moon className="w-5 h-5 text-amber-700" />
            Ask the Seer — Dream Symbols
          </CardTitle>
          <p className="text-sm text-amber-800 mt-1">
            The message, not the future.
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
          <Moon className="w-12 h-12 text-amber-600 mb-4" />
          <p className="text-amber-900 font-medium text-center">
            {EMPTY_STATE_MESSAGE}
          </p>
          <p className="text-sm text-amber-700 mt-2 text-center">
            Run a dream analysis above to get personalized guidance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg min-h-[50vh] max-h-[85vh] overflow-hidden">
      <CardHeader className="border-b border-amber-200 bg-white/80 shrink-0">
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <MessageCircle className="w-5 h-5 text-amber-700" />
          Ask the Seer — Dream Symbols
        </CardTitle>
        <p className="text-sm text-amber-800 mt-1">
          The message, not the future.
        </p>
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
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-amber-600" />
              <p className="text-amber-900 font-medium mb-2">
                Ask me anything about your dreams…
              </p>
              <p className="text-sm text-amber-800 mb-3 max-w-md mx-auto">
                I'll interpret symbols and themes from your dreams to reveal messages from your subconscious and current life state.
              </p>
              <p className="text-amber-900 text-sm font-medium mt-3 mb-1 text-left max-w-md mx-auto">
                You can ask about:
              </p>
              <ul className="text-xs text-amber-800 text-left max-w-md mx-auto mb-3 list-disc list-inside">
                <li>Symbol interpretation (meaning of specific dream symbols, why a dream felt intense or recurring, what a symbol represents in waking life)</li>
                <li>Emotional & mental state (stress, fear, desire, or confusion reflected in dreams; inner conflicts or unresolved thoughts; transitional life phases reflected symbolically)</li>
                <li>Pattern recognition (repeating dreams; nightmares vs guidance dreams; what a dream is urging awareness of)</li>
              </ul>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {DREAM_SYMBOLS_STARTER_QUESTIONS.map((q, i) => (
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
              <p className="text-amber-700 text-xs mt-4">
                Best for: messages from your subconscious and current life state, not the future or timelines.
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
                      Reading the wisdom in your dreams…
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
              placeholder="Ask about symbols, themes, emotions, or what the dream reflects…"
              disabled={isLoading}
              className="flex-1 bg-white border-amber-200 text-slate-800 placeholder-slate-500 focus:border-amber-400 focus:ring-amber-200"
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
