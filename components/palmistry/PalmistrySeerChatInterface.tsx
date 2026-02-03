'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Hand, Loader2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlowRevealText } from '@/components/chat/SlowRevealText';
import { PalmistryAnalysis } from '@/lib/palmistryIntelligence';

interface PalmistrySeerChatInterfaceProps {
  userId: string;
  userProfile: any;
  palmistryAnalysis?: PalmistryAnalysis;
  sessionId?: string;
}

interface Message {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
}

const PALMISTRY_STARTER_QUESTIONS = [
  'What do my hands say about my strengths?',
  'What timing do my lines suggest?',
];

export default function PalmistrySeerChatInterface({
  userId,
  userProfile,
  palmistryAnalysis,
  sessionId,
}: PalmistrySeerChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingDisplayLength, setStreamingDisplayLength] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingLengthRef = useRef(0);

  const SEE_MORE_THRESHOLD = 320;
  const PREVIEW_LENGTH = 320;

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
    }, 90);
    return () => clearInterval(interval);
  }, [streamingMessageId]);

  const sendMessage = async (questionText?: string) => {
    const messageToSend = questionText ?? question.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: messageToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
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
      const response = await fetch('/api/palmistry/ask-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          question: messageToSend,
          palmistryContext: palmistryAnalysis ?? null,
          sessionId,
          userProfile: {
            name: userProfile?.displayName || userProfile?.fullName,
            birthDate: userProfile?.birthDate,
            hand: palmistryAnalysis?.hand,
            dominantHand: palmistryAnalysis?.dominantHand,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Palmistry Seer');
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
    } catch (error) {
      console.error('Palmistry Seer error:', error);
      setStreamingMessageId(null);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content:
                  'Palmistry Seer is unavailable. Please try again.',
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
          <div className="whitespace-pre-wrap leading-relaxed">
            {isStreaming ? displayContent : (
              <SlowRevealText content={message.content} minThinkingMs={2000} delayPerWord={85} thinkingLabel="Consulting the stars..." className="text-slate-700" />
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
    <Card className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg min-h-[50vh] max-h-[85vh] overflow-hidden">
      <CardHeader className="border-b border-amber-200 bg-white/80 shrink-0">
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Hand className="w-5 h-5 text-amber-700" />
          Ask the Palmistry Seer
        </CardTitle>
        <p className="text-sm text-amber-800 mt-1">
          Trait-based guidance from your palm; tendencies and capacities, not events.
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
              <Hand className="w-12 h-12 mx-auto mb-4 text-amber-600" />
              <p className="text-amber-900 font-medium mb-2">
                Ask about your tendencies, strengths, career aptitude, or relationship style.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {PALMISTRY_STARTER_QUESTIONS.map((q, i) => (
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
                      Consulting your palm…
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
              placeholder="Ask about tendencies, strengths, career aptitude, relationship style..."
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
