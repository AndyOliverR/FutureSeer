'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analytics } from '@/lib/analytics';
import {
  fetchWithFirebaseAuthRequired,
  MissingFirebaseAuthError,
} from '@/lib/clientFirebaseFetch';
import { cn } from '@/lib/utils';

const MAIN_SEER_FIRST_SUCCESS_KEY = 'futureseer:mainSeerFirstSuccess';

const MAIN_STARTER_QUESTIONS = [
  'Across my saved readings—Western, Vedic, numerology, tarot—which pattern should I take seriously first?',
  'What should I prioritize this week given my profile?',
  'What does my profile suggest about timing for a meaningful career or relationship move in the next few months?',
];

interface MainSeerChatInterfaceProps {
  userId: string | undefined;
  /** Matches profile CTA pattern: mobile layout vs web (breakpoint 768px). */
  layout?: 'mobile' | 'web';
  userProfile: { birthDate?: string; birthTime?: string; birthPlace?: string } | null;
  /** Consecutive days with Seer activity; optional, calm banner when >= 2 */
  streakDays?: number;
}

type ThreadMessage = { role: 'user' | 'seer'; content: string };
type ResponseStyle = 'concise' | 'balanced' | 'deep';

interface Message {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
}

const SEE_MORE_THRESHOLD = 320;
const PREVIEW_LENGTH = 320;

function threadToMessages(thread: ThreadMessage[]): Message[] {
  return thread.map((m, i) => ({
    id: `${m.role}_${i}`,
    type: m.role,
    content: m.content,
    timestamp: 0,
  }));
}

export default function MainSeerChatInterface({
  userId,
  layout = 'web',
  userProfile,
  streakDays = 0,
}: MainSeerChatInterfaceProps) {
  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());
  const [responseStyle, setResponseStyle] = useState<ResponseStyle>('balanced');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  /** After first successful API reply, we tone down "first session" framing. */
  const [seerFirstSuccessRecorded, setSeerFirstSuccessRecorded] = useState(false);

  const messages = useMemo(() => threadToMessages(thread), [thread]);

  useEffect(() => {
    try {
      setSeerFirstSuccessRecorded(
        typeof window !== 'undefined' && localStorage.getItem(MAIN_SEER_FIRST_SUCCESS_KEY) === '1',
      );
    } catch {
      setSeerFirstSuccessRecorded(false);
    }
  }, []);

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
  }, [messages, isLoading]);

  const sendMessage = async (questionText?: string) => {
    const messageToSend = questionText ?? question.trim();
    if (!messageToSend || isLoading) return;

    setQuestion(questionText ? question : '');
    setIsLoading(true);

    analytics.trackMainSeerChat({
      layout,
      responseStyle: responseStyle,
      interaction: 'message_sent',
    });

    try {
      const res = await fetchWithFirebaseAuthRequired('/api/seer/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          thread,
          responseStyle,
          userId: userId ?? undefined,
          birthProfile: userProfile
            ? {
                birthDate: userProfile.birthDate,
                birthTime: userProfile.birthTime,
                birthPlace: userProfile.birthPlace,
              }
            : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        analytics.trackMainSeerChat({
          layout,
          responseStyle: responseStyle,
          interaction: 'response_error',
          httpStatus: res.status,
          error: typeof data?.error === 'string' ? data.error : 'request_failed',
        });
        setThread((prev) => [
          ...prev,
          { role: 'user', content: messageToSend },
          { role: 'seer', content: data.error || 'The Seer could not respond.' },
        ]);
        return;
      }
      analytics.trackMainSeerChat({
        layout,
        responseStyle: responseStyle,
        interaction: 'response_ok',
        httpStatus: res.status,
      });
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(MAIN_SEER_FIRST_SUCCESS_KEY, '1');
        }
      } catch {
        /* ignore quota / private mode */
      }
      setSeerFirstSuccessRecorded(true);
      setThread(data.thread ?? []);
    } catch (e) {
      analytics.trackMainSeerChat({
        layout,
        responseStyle: responseStyle,
        interaction: 'response_error',
        error: e instanceof MissingFirebaseAuthError ? 'missing_auth' : 'network_or_parse',
      });
      const fallback =
        e instanceof MissingFirebaseAuthError
          ? e.message
          : 'The vision is unclear. Try again.';
      setThread((prev) => [
        ...prev,
        { role: 'user', content: messageToSend },
        { role: 'seer', content: fallback },
      ]);
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

  const clearChat = () => {
    setThread([]);
    setExpandedMessageIds(new Set());
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
            {displayContent}
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

  return (
    <>
      {streakDays >= 2 ? (
        <div
          className="mb-3 rounded-lg border border-amber-300/40 bg-amber-950/40 px-3 py-2 text-center text-xs text-amber-100/90"
          role="status"
        >
          You have consulted the Seer on {streakDays} consecutive days—steady practice builds clarity.
        </div>
      ) : null}
      <Card
        className={cn(
          'flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg transition-all duration-300 min-h-[50vh] max-h-[85vh] overflow-hidden',
          layout === 'mobile' && 'max-h-[calc(100dvh-12rem)]'
        )}
      >
      <CardHeader className="border-b border-amber-200 bg-white/80 flex flex-row items-center justify-between gap-2 shrink-0">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-amber-900 flex items-center gap-2">
            <span className="text-2xl" aria-hidden>🔮</span>
            Ask the Seer
          </CardTitle>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <label htmlFor="seer-response-style" className="text-slate-600">
              Response style
            </label>
            <select
              id="seer-response-style"
              value={responseStyle}
              onChange={(e) => setResponseStyle(e.target.value as ResponseStyle)}
              className="h-8 rounded-md border border-amber-200 bg-white px-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
              aria-label="Response style"
            >
              <option value="balanced">Balanced</option>
              <option value="concise">Concise</option>
              <option value="deep">Deep</option>
            </select>
          </div>
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
        <div
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4"
          role="region"
          aria-label="Conversation with the Seer"
        >
          {messages.length === 0 && !isLoading ? (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="text-6xl mx-auto mb-4 block" aria-hidden>🔮</span>
              <p className="text-amber-900 font-semibold mb-2 font-serif tracking-tight">
                Welcome. This is the cross-tool seat.
              </p>
              <p className="text-slate-700 text-sm mt-1 mb-2 max-w-md mx-auto leading-relaxed">
                The Seer reasons across what you already generated—Western and Vedic lines, tarot, numerology, and the
                rest of your library—so one answer can echo several traditions at once.
              </p>
              {!seerFirstSuccessRecorded ? (
                <p className="text-amber-900/90 text-xs max-w-md mx-auto mb-3 px-1 py-2 rounded-lg bg-amber-100/60 border border-amber-200/80">
                  <span className="font-semibold">First session:</span> use the highlighted question below once. A
                  strong opening reply is the moment this product clicks.
                </p>
              ) : null}
              <p className="text-slate-600 text-sm font-medium mt-1 mb-1 text-left max-w-md mx-auto">You can ask about:</p>
              <ul className="text-slate-700 text-sm text-left max-w-md mx-auto mb-4 space-y-0.5 list-disc list-inside">
                <li>Life purpose, relationships, and compatibility</li>
                <li>Career direction and favorable periods</li>
                <li>Health, spirituality, and personal growth</li>
                <li>Decisions and timing</li>
              </ul>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {MAIN_STARTER_QUESTIONS.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className={cn(
                      'text-xs text-amber-800 border-amber-200 hover:bg-amber-100 max-w-[min(100%,22rem)] whitespace-normal h-auto min-h-9 py-2 text-left justify-start',
                      i === 0 && !seerFirstSuccessRecorded && 'ring-2 ring-amber-500/70 border-amber-400 bg-amber-50',
                    )}
                  >
                    {i === 0 && !seerFirstSuccessRecorded ? (
                      <span className="flex flex-col items-start gap-0.5 w-full">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-amber-900/80">
                          Start here
                        </span>
                        <span>{q}</span>
                      </span>
                    ) : (
                      q
                    )}
                  </Button>
                ))}
              </div>
              <p className="text-slate-600 text-xs mt-4">
                Best for: one-session clarity—pattern, tension, and timing in plain language.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <div key={message.id}>{formatMessage(message)}</div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex justify-start" role="status" aria-live="polite">
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-700" aria-hidden />
                      Consulting the mystical forces...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div
          className={cn(
            'shrink-0 border-t border-amber-200 bg-white/80 p-4',
            layout === 'mobile' && 'pb-[max(1rem,env(safe-area-inset-bottom))]'
          )}
        >
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
              placeholder="Ask how your saved readings agree or disagree on one real decision…"
              disabled={isLoading}
              className="flex-1 bg-white border-amber-200 text-slate-800 placeholder-slate-500 focus:border-amber-400 focus:ring-amber-200 transition-all duration-300"
              aria-label="Your question for the Seer"
            />
            <Button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
              aria-label={isLoading ? 'Sending message' : 'Send message to the Seer'}
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
    </>
  );
}
