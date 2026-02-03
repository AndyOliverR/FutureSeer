'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BibliomancyReading } from '@/lib/bibliomancyIntelligence';
import { SlowRevealText } from '@/components/chat/SlowRevealText';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const BIBLIOMANCY_HINT_QUESTIONS = [
  'What guidance can I reflect on right now?',
  'What wisdom applies to my situation?',
  'What perspective may help me proceed?',
  'How might this passage apply to my current situation?',
];

interface BibliomancySeerChatInterfaceProps {
  reading: BibliomancyReading;
  userProfile?: any;
  userId?: string;
}

export function BibliomancySeerChatInterface({
  reading,
  userProfile,
  userId,
}: BibliomancySeerChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
  };

  const sendMessage = async (questionText?: string) => {
    const questionToSend = questionText || input.trim();
    if (!questionToSend || isLoading || !reading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: questionToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantId = `assistant_${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/ask-bibliomancy-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionToSend,
          bibliomancyReading: reading,
          userProfile,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorText = (errorData?.error ?? 'Failed to get response') as string;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: errorText } : msg
          )
        );
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: fullResponse } : msg
            )
          );
        }
      }
    } catch (error) {
      console.error('Error calling Bibliomancy Seer API:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content:
                  'I apologize, I encountered an error. Please try again.',
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="flex flex-col bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
        <CardHeader className="border-b border-amber-200 bg-white/80 shrink-0 flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <MessageCircle className="w-5 h-5 text-amber-700" />
              Ask the Seer — Bibliomancy
            </CardTitle>
            <p className="text-sm text-amber-800 mt-1">
              Symbolic wisdom for reflection, not divine instruction or prediction.
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
        <CardContent className="pt-6 flex flex-col min-h-0">
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {messages.length === 0 && !isLoading ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <p className="text-amber-900 font-medium mb-2">
                  Ask about guidance, wisdom, or perspective…
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {BIBLIOMANCY_HINT_QUESTIONS.map((q, i) => (
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
              <>
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-blue-50 border-2 border-blue-200 text-slate-800'
                            : 'bg-white/80 text-slate-800 border-2 border-amber-200'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.role === 'user' ? message.content : (
                            <SlowRevealText content={message.content} minThinkingMs={2000} delayPerWord={85} thinkingLabel="Consulting the stars..." className="text-slate-800" />
                          )}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/80 rounded-xl px-4 py-3 border-2 border-amber-200">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                        Reflecting on passage wisdom…
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="mt-6 flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask about guidance, wisdom, or perspective…"
              className="bg-white border-2 border-amber-200 text-slate-900 placeholder:text-slate-500 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
