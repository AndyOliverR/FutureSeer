'use client';

import { useState, useEffect, useRef } from 'react';
import { useAngelNumbersData } from '@/hooks/use-angel-numbers-data';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Feather, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { devLog } from '@/lib/devLogger';

interface AngelNumbersMessage {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
}

interface AngelNumbersCoachInterfaceProps {
  observedNumber?: string;
  angelNumbersContext?: {
    context?: string;
    current_focus?: string;
    emotional_state?: string;
  };
}

export function AngelNumbersCoachInterface({
  observedNumber,
  angelNumbersContext,
}: AngelNumbersCoachInterfaceProps = {}) {
  const { user } = useAuth();
  const { angelNumbersData, loading: loadingData, error } = useAngelNumbersData();
  const [messages, setMessages] = useState<AngelNumbersMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingDisplayLength, setStreamingDisplayLength] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingLengthRef = useRef(0);

  const SEE_MORE_THRESHOLD = 320;
  const PREVIEW_LENGTH = 320;

  const ANGEL_NUMBERS_STARTER_QUESTIONS = [
    'Why do I keep seeing 111 or 444?',
    'What does this number mean for me right now?',
    'Is this number a sign to continue or pause?',
  ];

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
    }, 90);
    return () => clearInterval(interval);
  }, [streamingMessageId]);

  const sendMessage = async (questionText?: string) => {
    const messageToSend = questionText ?? question.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: AngelNumbersMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: messageToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    const aiMessageId = `seer_${Date.now()}`;
    const aiMessage: AngelNumbersMessage = {
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
      const response = await fetch('/api/ask-angel-numbers-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid ?? '',
          question: messageToSend,
          userProfile: {
            name: user?.displayName ?? '',
          },
          angelNumbersContext: {
            observed_number: observedNumber,
            context: angelNumbersContext?.context,
            current_focus: angelNumbersContext?.current_focus,
            emotional_state: angelNumbersContext?.emotional_state,
          },
          angelNumbersData: angelNumbersData
            ? {
                lifePathAngel: angelNumbersData.lifePathAngel,
                destinyAngel: angelNumbersData.destinyAngel,
                soulAngel: angelNumbersData.soulAngel,
                currentDateAngel: angelNumbersData.currentDateAngel,
                personalYearAngel: angelNumbersData.personalYearAngel,
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        setStreamingMessageId(null);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: 'Angel Numbers Seer is unavailable. Please try again.',
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
              msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg
            )
          );
        }
      }
      setStreamingMessageId(null);
    } catch (err) {
      devLog.error('Angel Numbers Seer error', err, 'AngelNumbersCoachInterface');
      setStreamingMessageId(null);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: 'Angel Numbers Seer is unavailable. Please try again.',
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

  const formatMessage = (message: AngelNumbersMessage) => {
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

  if (loadingData) {
    return (
      <Card className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 min-h-[50vh] max-h-[85vh] overflow-hidden">
        <CardContent className="p-8 flex items-center justify-center">
          <div className="flex items-center gap-3 text-amber-800">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading your angel numbers…</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg min-h-[50vh] max-h-[85vh] overflow-hidden">
      <CardHeader className="border-b border-amber-200 bg-white/80 shrink-0">
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Feather className="w-5 h-5 text-amber-700" />
          Ask the Angel Numbers Seer
        </CardTitle>
        <p className="text-sm text-amber-800 mt-1">
          Reassurance and guidance, not prediction.
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4">
          {messages.length === 0 && !isLoading ? (
            <div className="text-center py-8">
              <Feather className="w-12 h-12 mx-auto mb-4 text-amber-600" />
              <p className="text-amber-900 font-medium mb-2">
                Ask me anything about the numbers you keep seeing…
              </p>
              <p className="text-slate-700 text-sm mt-1 mb-2">
                I'll interpret recurring number patterns as guidance, reassurance, and directional messages.
              </p>
              <p className="text-slate-600 text-sm font-medium mt-3 mb-1 text-left max-w-md mx-auto">You can ask about:</p>
              <ul className="text-slate-700 text-sm text-left max-w-md mx-auto mb-4 space-y-0.5 list-disc list-inside">
                <li>Meaning & interpretation (why a number keeps appearing, what a sequence signifies, how to interpret numbers in daily life)</li>
                <li>Direction & reassurance (whether to proceed, pause, or reflect; emotional validation; confirmation during confusion)</li>
                <li>Personal context (what a number means for you right now; how to respond internally or behaviorally)</li>
              </ul>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {ANGEL_NUMBERS_STARTER_QUESTIONS.map((q, i) => (
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
              <p className="text-slate-600 text-xs mt-4">Best for: reassurance and guidance, not prediction or dates.</p>
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
                      Consulting your angel numbers…
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
              onKeyPress={handleKeyPress}
              placeholder="Ask about a number you're seeing, or what it means for you…"
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
