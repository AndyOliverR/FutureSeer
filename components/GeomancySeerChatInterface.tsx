'use client';

import React, { useState, useEffect, useRef } from 'react';
import { devLog } from '@/lib/devLogger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Send, Loader2, Zap, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlowRevealText } from '@/components/chat/SlowRevealText';

interface GeomancySeerChatInterfaceProps {
  userId: string;
  userProfile: any;
  geomancyAnalysis?: any;
  sessionId?: string;
}

interface Message {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
  metadata?: {
    confidence?: number;
    figureReferences?: {
      primaryFigures: string[];
      houses: number[];
      elements: string[];
      planets: string[];
    };
    guidance?: string[];
    followUpQuestions?: string[];
  };
}

const GEOMANCY_HINT_QUESTIONS = [
  'Will this proceed?',
  'Is there obstruction?',
  'Is this stable?',
  'What does the Judge indicate?',
  'What should I adjust?',
];

export default function GeomancySeerChatInterface({
  userId,
  userProfile,
  geomancyAnalysis,
  sessionId,
}: GeomancySeerChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId] = useState(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearChat = () => {
    setMessages([]);
  };

  const sendMessage = async (questionText?: string) => {
    const messageToSend = questionText || question.trim();
    if (!messageToSend || isLoading) return;

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

    try {
      const response = await fetch('/api/ask-geomancy-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          question: messageToSend,
          userProfile,
          geomancyAnalysis,
          sessionId: currentSessionId,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulatedContent = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          accumulatedContent += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, content: accumulatedContent } : msg
            )
          );
        }
      }
    } catch (error) {
      devLog.error('Error:', error, 'GeomancySeerChatInterface');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: 'I apologize, but I encountered an error. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      if (!questionText) {
        setQuestion('');
      }
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

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-start"
      >
        <div className="max-w-[80%] rounded-xl p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 text-slate-700">
          <div className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>

          {message.metadata?.figureReferences && (
            <div className="mt-3 pt-3 border-t border-amber-200">
              <div className="flex flex-wrap gap-1">
                {message.metadata.figureReferences.primaryFigures.map((figure, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {figure}
                  </Badge>
                ))}
                {message.metadata.figureReferences.elements?.map((element, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {element}
                  </Badge>
                ))}
                {message.metadata.figureReferences.planets?.map((planet, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {planet}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {message.metadata?.guidance && message.metadata.guidance.length > 0 && (
            <div className="mt-3 pt-3 border-t border-amber-200">
              <h4 className="text-xs font-semibold text-amber-800 mb-2">Guidance:</h4>
              <ul className="text-xs text-slate-600 space-y-1">
                {message.metadata.guidance.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Zap className="w-3 h-3 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {message.metadata?.followUpQuestions &&
            message.metadata.followUpQuestions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-200">
                <h4 className="text-xs font-semibold text-amber-800 mb-2">You might also ask:</h4>
                <div className="space-y-1">
                  {message.metadata.followUpQuestions.map((followUp, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(followUp)}
                      className="text-xs text-amber-700 hover:text-amber-900 underline block text-left"
                    >
                      {followUp}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
      </motion.div>
    );
  };

  if (!geomancyAnalysis) {
    return (
      <Alert className="bg-yellow-500/10 border-yellow-500/30">
        <AlertDescription className="text-slate-300">
          Please generate a geomancy reading first to consult the seer.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="flex flex-col h-full bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg min-h-[50vh] max-h-[85vh] overflow-hidden">
      <CardHeader className="border-b border-amber-200 bg-white/80 shrink-0 flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <MessageCircle className="w-5 h-5 text-amber-700" />
            Ask the Seer — Geomancy
          </CardTitle>
          <p className="text-sm text-amber-800 mt-1">
            Condition and outcome tendency, not inner life or destiny.
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
      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4">
          {messages.length === 0 && !isLoading ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-amber-600" />
              <p className="text-amber-900 font-medium">
                Ask about condition, outcome tendency, obstruction, or stability…
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {GEOMANCY_HINT_QUESTIONS.map((q, i) => (
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
                      Consulting the earth…
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
              onKeyDown={handleKeyPress}
              placeholder="Ask about condition, outcome tendency, obstruction, or stability…"
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
