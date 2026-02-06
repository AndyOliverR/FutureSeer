'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Trash2, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SlowRevealText } from '@/components/chat/SlowRevealText';

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
  'What does the pendulum suggest about my current path?',
  'Should I proceed with this decision, or wait for better alignment?',
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
      console.error('Error:', error);
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
    <div className="h-full flex flex-col bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-amber-900/20 to-slate-900/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Pendulum Seer</h3>
            <p className="text-sm text-slate-400 mt-1">
              Confirmation only—alignment, not destiny
            </p>
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
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-amber-400" />
            <p className="text-white font-medium mb-2">
              Welcome to Ask the Seer — Pendulum Divination.
            </p>
            <p className="text-sm text-slate-400 mb-4">
              Ask a clear yes/no alignment question—or pick one below.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {PENDULUM_STARTER_QUESTIONS.map((q, i) => (
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
              {message.type === 'user' ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <p className="whitespace-pre-wrap">
                  <SlowRevealText
                    content={message.content}
                    minThinkingMs={2000}
                    delayPerWord={85}
                    thinkingLabel="Consulting the stars..."
                    className="text-slate-200"
                  />
                </p>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
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
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask a clear yes/no alignment question..."
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
      </div>
    </div>
  );
}
