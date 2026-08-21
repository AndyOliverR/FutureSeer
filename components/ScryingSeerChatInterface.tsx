'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlowRevealText } from '@/components/chat/SlowRevealText';
import { devLog } from '@/lib/devLogger';
import { fetchWithFirebaseAuthRequired } from '@/lib/clientFirebaseFetch';
import { stripAttributionForDisplay } from '@/lib/attribution/attributionStamp';

interface Message {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
}

const SCRYING_HINT_QUESTIONS = [
  'What do my dominant symbols suggest right now?',
  'How can I use the strategic guidance in my situation?',
  'What do the risk and opportunity indicators mean for me?',
  'How does the archetypal pattern apply to my path?',
];

const SEE_MORE_THRESHOLD = 320;
const PREVIEW_LENGTH = 320;

interface ScryingSeerChatInterfaceProps {
  report: Record<string, unknown>;
  userProfile?: Record<string, unknown>;
  userId?: string;
}

export function ScryingSeerChatInterface({
  report,
  userProfile,
  userId,
}: ScryingSeerChatInterfaceProps) {
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
    if (!messageToSend || isLoading || !report) return;

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
      const response = await fetchWithFirebaseAuthRequired('/api/ask-scrying-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: messageToSend,
          scryingReport: report,
          userProfile,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorText = (errorData?.error ?? 'Failed to get response') as string;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: errorText } : msg
          )
        );
        setStreamingMessageId(null);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
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
    } catch (error) {
      devLog.error('Scrying Seer error', error, 'ScryingSeerChatInterface');
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
          <div className="max-w-[80%] rounded-xl p-4 bg-purple-50 border-2 border-purple-200 text-slate-800">
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
        <div className="max-w-[80%] rounded-xl p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 text-slate-700">
          <div className="whitespace-pre-wrap leading-relaxed">
            {isStreaming ? (
              <SlowRevealText
                content={displayContent}
                minThinkingMs={2000}
                delayPerWord={85}
                thinkingLabel="Reflecting on your symbols…"
                className="text-slate-700"
              />
            ) : (
              displayContent
            )}
          </div>
          {!isStreaming && isLong && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 text-purple-700 hover:text-purple-900 hover:bg-purple-100 p-0 h-auto font-normal flex items-center gap-1"
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
    <Card className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 shadow-lg transition-all duration-300 min-h-[50vh] max-h-[85vh] overflow-hidden">
      <CardHeader className="border-b border-purple-200 bg-white/80 flex flex-row items-center justify-between gap-2 shrink-0">
        <CardTitle className="text-purple-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-700" />
          Ask the Seer — Scrying
        </CardTitle>
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-purple-900 hover:bg-purple-100 shrink-0"
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
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-700" />
              <p className="text-purple-900 font-medium mb-2">
                Ask me anything about your scrying report and symbols…
              </p>
              <p className="text-slate-700 text-sm mt-1 mb-2">
                I&apos;ll interpret your dominant themes, elemental balance, archetypal pattern, and strategic guidance
                based on your generated report. Symbolic introspection only; not predictive certainty.
              </p>
              <p className="text-slate-600 text-sm font-medium mt-3 mb-1 text-left max-w-md mx-auto">
                You can ask about:
              </p>
              <ul className="text-slate-700 text-sm text-left max-w-md mx-auto mb-4 space-y-0.5 list-disc list-inside">
                <li>Dominant symbols and themes</li>
                <li>Risk and opportunity indicators</li>
                <li>Archetypal pattern and life phase</li>
                <li>Strategic guidance and timing</li>
              </ul>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {SCRYING_HINT_QUESTIONS.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="text-xs text-purple-800 border-purple-200 hover:bg-purple-100"
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
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-700" />
                      Reflecting on your symbols…
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-purple-200 bg-white/80 p-4">
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
              placeholder="Ask about your symbols, themes, or guidance…"
              disabled={isLoading}
              className="flex-1 bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] focus:border-purple-400 focus:ring-purple-200 transition-all duration-300"
            />
            <Button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
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
