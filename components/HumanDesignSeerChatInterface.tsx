'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Trash2, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SlowRevealText } from '@/components/chat/SlowRevealText';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          prev.map((m) =>
            m.id === aiMessageId ? { ...m, content: errorMessage } : m
          )
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
            prev.map((m) =>
              m.id === aiMessageId ? { ...m, content: fullResponse } : m
            )
          );
        }
      }
    } catch (err) {
      console.error('Human Design Seer error:', err);
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

  const clearChat = () => setMessages([]);

  const hasChart = hasValidChart(humanDesignChart);

  if (!hasChart) {
    return (
      <div className="h-full flex flex-col bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-amber-900/20 to-slate-900/50">
          <h3 className="text-xl font-bold text-white">Human Design Seer</h3>
          <p className="text-sm text-slate-400 mt-1">
            Ask about your type, strategy, authority, or profile.
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-slate-400 text-center">
            Generate your Human Design report to ask the Seer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-amber-900/20 to-slate-900/50 flex items-center justify-between gap-3 shrink-0">
        <div>
          <h3 className="text-xl font-bold text-white">Human Design Seer</h3>
          <p className="text-sm text-slate-400 mt-1">
            Ask about your type, strategy, authority, or profile.
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-amber-400 hover:bg-slate-700/50 shrink-0"
            onClick={clearChat}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear chat
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-amber-400" />
            <p className="text-white font-medium mb-2">
              Welcome to Ask the Seer — Human Design.
            </p>
            <p className="text-sm text-slate-400 mb-4">
              Ask about your type, strategy, authority, or profile—or pick a
              question below.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {HUMAN_DESIGN_STARTER_QUESTIONS.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                  className="text-slate-200 border-slate-600 hover:bg-amber-500/20 hover:border-amber-500/50"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.type === 'user'
                      ? 'bg-amber-500/20 border border-amber-500/30 text-white'
                      : 'bg-slate-800/50 border border-slate-700/50 text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    {message.type === 'user' ? message.content : message.content ? (
                      <SlowRevealText content={message.content} minThinkingMs={2000} delayPerWord={85} thinkingLabel="Consulting the stars..." className="text-slate-200" />
                    ) : message.type === 'seer' && isLoading ? '…' : ''}
                  </p>
                </div>
              </motion.div>
            ))}
            {isLoading && messages[messages.length - 1]?.type !== 'seer' && (
              <div className="flex justify-start">
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <div
                      className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-700/50 shrink-0">
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about Human Design, your type, strategy, or authority..."
            className="flex-1 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={isLoading || !question.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
