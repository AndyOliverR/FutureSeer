'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, TrendingUp, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { SlowRevealText } from '@/components/chat/SlowRevealText';
import { devLog } from '@/lib/devLogger';

interface FinancialSeerChatInterfaceProps {
  userId: string;
  userProfile: any;
  financialChartData?: any;
  natalChart?: any;
  sessionId?: string;
}

interface Message {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
}

const FINANCIAL_STARTER_QUESTIONS = [
  'What does my chart say about my financial potential?',
  'Is this a favorable period for improving income?',
  'Do I benefit more from business or stable work?',
  'When should I be cautious financially?',
];

export default function FinancialSeerChatInterface({ 
  userId, 
  userProfile, 
  financialChartData,
  natalChart,
  sessionId 
}: FinancialSeerChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
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
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask-financial-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          question: text,
          userProfile,
          financialChartData,
          natalChart,
          sessionId: currentSessionId
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullResponse += chunk;

          // Update message with streaming content
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.type === 'seer') {
              return [...prev.slice(0, -1), { ...lastMessage, content: fullResponse }];
            }
            return [...prev, {
              id: Date.now().toString(),
              type: 'seer',
              content: fullResponse,
              timestamp: Date.now()
            }];
          });
        }
      }
    } catch (error) {
      devLog.error('Financial Seer error', error, 'FinancialSeerChatInterface');
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'seer',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg transition-all duration-300 min-h-[50vh] max-h-[85vh] overflow-hidden">
      <CardHeader className="border-b border-amber-200 bg-white/80 flex flex-row items-center justify-between gap-2 shrink-0">
        <div>
          <CardTitle className="text-amber-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-700" />
            Ask the Seer — Financial Astrology
          </CardTitle>
          <p className="text-slate-700 text-sm mt-1">I&apos;ll analyze your chart to reveal earning patterns, financial strengths, risk tendencies, and supportive periods.</p>
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
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-amber-700" />
              <p className="text-amber-900 font-medium mb-2">
                Ask me anything about wealth, income, and financial timing…
              </p>
              <p className="text-slate-700 text-sm mb-4">
                I&apos;ll analyze your chart to reveal earning patterns, financial strengths, risk tendencies, and supportive periods.
              </p>
              <p className="text-slate-600 text-sm font-medium mb-2 text-left">You can ask about:</p>
              <ul className="text-slate-700 text-sm mb-4 text-left list-disc pl-5 space-y-1">
                <li>Wealth and income patterns (how you earn best, stable vs fluctuating income, business vs employment strengths)</li>
                <li>Timing and cycles (favorable periods for growth, periods requiring caution, consolidation vs expansion)</li>
                <li>Risk and decision awareness (tendency toward risk or safety, speculation vs long-term accumulation, financial stress triggers)</li>
              </ul>
              <div className="flex flex-wrap gap-2 justify-center">
                {FINANCIAL_STARTER_QUESTIONS.map((q, i) => (
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
                Best for: patterns and timing awareness; not investment advice or guarantees.
              </p>
              <p className="text-slate-600 text-xs mt-1">
                Astrology doesn&apos;t replace financial advice. For investments, consult a qualified financial professional.
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
                    <p className="whitespace-pre-wrap">
                      {message.type === 'user' ? message.content : (
                        <SlowRevealText content={message.content} minThinkingMs={2000} delayPerWord={85} thinkingLabel="Consulting the stars..." className="text-slate-700" />
                      )}
                    </p>
                  </div>
                </motion.div>
              ))}

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
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="e.g. What does my chart say about my financial potential?"
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
          <p className="text-slate-600 text-xs mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Astrological insights only - not financial advice
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

