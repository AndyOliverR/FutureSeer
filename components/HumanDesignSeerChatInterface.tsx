'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Trash2, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlowRevealText } from '@/components/chat/SlowRevealText';
import { devLog } from '@/lib/devLogger';

interface HumanDesignSeerChatInterfaceProps {
  userId: string;
  userProfile?: any;
  humanDesignChart?: any;
  sessionId?: string;
}

interface Message {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
}

const HUMAN_DESIGN_STARTER_QUESTIONS = [
  'How should I make decisions according to my type?',
  'How can I live authentically according to my design?',
];

const SEE_MORE_THRESHOLD = 320;
const PREVIEW_LENGTH = 320;

function hasValidChart(chart: any): boolean {
  return !!chart && !!chart.type && !!chart.authority;
}

export default function HumanDesignSeerChatInterface({
  userId,
  userProfile,
  humanDesignChart,
  sessionId,
}: HumanDesignSeerChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleExpanded = (id: string) => {
    setExpandedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async (messageText?: string) => {
    const text = (messageText ?? question).trim();
    if (!text || isLoading || !hasValidChart(humanDesignChart)) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const aiMessageId = `seer_${Date.now()}`;
    const aiMessage: Message = {
      id: aiMessageId,
      type: 'seer',
      content: '',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask-human-design-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          question: text,
          userProfile: userProfile ?? {},
          humanDesignChart,
          sessionId: sessionId ?? `human_design_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Request failed (${response.status}).`;
        try {
          const errJson = JSON.parse(errorText);
          if (errJson?.error) errorMessage = errJson.error;
        } catch {
          if (errorText) errorMessage = errorText.slice(0, 200);
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMessageId ? { ...m, content: errorMessage } : m))
        );
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullResponse += chunk;
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMessageId ? { ...m, content: fullResponse } : m))
          );
        }
      }
    } catch (err) {
      devLog.error('Human Design Seer error', err, 'HumanDesignSeerChatInterface');
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? {
                ...m,
                content:
                  err instanceof Error
                    ? err.message
                    : 'An error occurred. Please try again.',
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => setMessages([]);

  const hasChart = hasValidChart(humanDesignChart);

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

    const isLong = message.content.length > SEE_MORE_THRESHOLD;
    const isExpanded = expandedMessageIds.has(message.id);
    const showPreview = isLong && !isExpanded;
    const displayContent = showPreview
      ? message.content.slice(0, PREVIEW_LENGTH) + (message.content.length > PREVIEW_LENGTH ? '…' : '')
      : message.content;

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-start"
      >
        <div className="max-w-[80%] rounded-xl p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 text-slate-700">
          <div className="whitespace-pre-wrap leading-relaxed">
            <SlowRevealText
              content={displayContent}
              minThinkingMs={2000}
              delayPerWord={85}
              thinkingLabel="Consulting the stars..."
              className="text-slate-700"
            />
          </div>
          {isLong && (
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

  const cardClassName =
    'flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg transition-all duration-300 min-h-[50vh] max-h-[85vh] overflow-hidden';

  if (!hasChart) {
    return (
      <Card className={cardClassName}>
        <CardHeader className="border-b border-amber-200 bg-white/80 shrink-0">
          <CardTitle className="text-amber-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-700" />
            Ask the Seer — Human Design
          </CardTitle>
          <p className="text-sm text-slate-700 mt-1">
            Ask about your type, strategy, authority, or profile.
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-8">
          <p className="text-slate-700 text-center">
            Generate your Human Design report to ask the Seer.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClassName}>
      <CardHeader className="border-b border-amber-200 bg-white/80 flex flex-row items-center justify-between gap-2 shrink-0">
        <CardTitle className="text-amber-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-700" />
          Ask the Seer — Human Design
        </CardTitle>
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
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-amber-700" />
              <p className="text-amber-900 font-medium mb-2">
                Ask me anything about your Human Design…
              </p>
              <p className="text-slate-700 text-sm mt-1 mb-2">
                I'll use your chart to explain your Type, Strategy, Authority, and how to make
                decisions in alignment with your energy.
              </p>
              <p className="text-slate-600 text-sm font-medium mt-3 mb-1 text-left max-w-md mx-auto">
                You can ask about:
              </p>
              <ul className="text-slate-700 text-sm text-left max-w-md mx-auto mb-4 space-y-0.5 list-disc list-inside">
                <li>Type, Strategy, and Authority</li>
                <li>Profile and defined/undefined centers</li>
                <li>Decision-making and when you feel drained</li>
                <li>Work style, burnout, and respond vs initiate</li>
              </ul>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {HUMAN_DESIGN_STARTER_QUESTIONS.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSend(q)}
                    disabled={isLoading}
                    className="text-xs text-amber-800 border-amber-200 hover:bg-amber-100"
                  >
                    {q}
                  </Button>
                ))}
              </div>
              <p className="text-slate-600 text-xs mt-4">
                Best for: decision mechanics and energy alignment.
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
                      Consulting the mystical forces...
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
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about Human Design, your type, strategy, or authority..."
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
