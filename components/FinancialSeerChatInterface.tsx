'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Send, TrendingUp, DollarSign, AlertTriangle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { SlowRevealText } from '@/components/chat/SlowRevealText';

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
  'What does my chart suggest for stable vs expansion periods?',
  'When should I be more cautious with money according to my chart?',
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
      console.error('Error:', error);
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
    <div className="h-full flex flex-col bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-amber-900/20 to-slate-900/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex space-x-2">
              <TrendingUp className="w-6 h-6 text-amber-400" />
              <h3 className="text-xl font-bold text-white">Financial Astrology Seer</h3>
            </div>
            <p className="text-sm text-slate-400 mt-1">Personal timing and risk posture, not market advice</p>
          </div>
          {messages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-amber-400 hover:bg-slate-700/50 shrink-0"
              onClick={() => setMessages([])}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear chat
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-amber-400" />
            <p className="text-white font-medium mb-2">
              Welcome to Ask the Seer — Financial Astrology.
            </p>
            <p className="text-sm text-slate-400 mb-4">
              Ask about stable periods, saving vs expansion, or cosmic timing—or pick a question below.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {FINANCIAL_STARTER_QUESTIONS.map((q, i) => (
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
                {message.type === 'user' ? message.content : (
                  <SlowRevealText content={message.content} minThinkingMs={2000} delayPerWord={85} thinkingLabel="Consulting the stars..." className="text-slate-200" />
                )}
              </p>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex space-x-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about stable periods, saving vs expansion, speculation, or caution..."
            className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
          />
          <Button
            onClick={() => handleSend()}
            disabled={isLoading || !question.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Astrological insights only - not financial advice
        </p>
      </div>
    </div>
  );
}

