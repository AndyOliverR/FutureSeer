'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Trash2, MessageCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { SlowRevealText } from '@/components/chat/SlowRevealText';
import { devLog } from '@/lib/devLogger';

interface PendulumSeerChatInterfaceProps {
  userId: string;
  userProfile: any;
  pendulumAnalysis?: any;
  sessionId?: string;
}

interface Message {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
}

const PENDULUM_STARTER_QUESTIONS = [
  'Is it a good idea to proceed with this decision?',
  'Is this opportunity aligned for me right now?',
  'Should I move forward today?',
];

export default function PendulumSeerChatInterface({
  userId,
  userProfile,
  pendulumAnalysis,
  sessionId,
}: PendulumSeerChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (messageText?: string) => {
    const text = (messageText ?? question).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const priorHistory = messages
      .map((m) => ({ type: m.type, content: m.content }))
      .slice(-20);

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask-pendulum-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          question: text,
          userProfile,
          pendulumAnalysis,
          conversationHistory: priorHistory,
          sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const seerMessage: Message = {
        id: Date.now().toString(),
        type: 'seer',
        content: data.response ?? 'No response received.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, seerMessage]);
    } catch (error) {
      devLog.error('Pendulum Seer error', error, 'PendulumSeerChatInterface');
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'seer',
        content:
          error instanceof Error ? error.message : 'An error occurred. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg transition-all duration-300 min-h-[50vh] max-h-[85vh] overflow-hidden">
      <CardHeader className="border-b border-amber-200 bg-white/80 flex flex-row items-center justify-between gap-2 shrink-0">
        <div>
          <CardTitle className="text-amber-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-amber-700" />
            Ask the Seer — Pendulum
          </CardTitle>
          <p className="text-slate-700 text-sm mt-1">
            I&apos;ll use pendulum guidance to provide a direct energetic response.
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-amber-900 hover:bg-amber-100 shrink-0"
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
            <div className="text-center py-8 max-w-lg mx-auto">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-amber-700" />
              <p className="text-amber-900 font-medium mb-2">
                Ask one clear yes/no question…
              </p>
              <p className="text-slate-700 text-sm mb-4">
                I&apos;ll use pendulum guidance to provide a direct energetic response.
              </p>
              <p className="text-slate-600 text-sm font-medium mb-2 text-left">You can ask about:</p>
              <ul className="text-slate-700 text-sm mb-4 text-left list-disc pl-5 space-y-1">
                <li>Binary questions only (Is this the right choice? Should I proceed now? Is this aligned for me? Is this person/situation supportive?)</li>
                <li>Immediate decisions (whether to act or wait, whether something is energetically suitable now)</li>
              </ul>
              <div className="flex flex-wrap gap-2 justify-center">
                {PENDULUM_STARTER_QUESTIONS.map((q, i) => (
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
                Questions must be clear, singular, and answerable by yes/no.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-4 ${
                      message.type === 'user'
                        ? 'bg-blue-50 border-2 border-blue-200 text-slate-800'
                        : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 text-slate-700'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <p className="whitespace-pre-wrap">
                        <SlowRevealText
                          content={message.content}
                          minThinkingMs={2000}
                          delayPerWord={85}
                          thinkingLabel="Consulting the stars..."
                          className="text-slate-700"
                        />
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                      Consulting the pendulum…
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
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="e.g. Should I proceed with this decision now?"
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
