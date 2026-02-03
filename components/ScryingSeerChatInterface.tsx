"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Loader2,
  Trash2
} from "lucide-react";
import { SlowRevealText } from "@/components/chat/SlowRevealText";

interface Message {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
}

const SCRYING_HINT_QUESTIONS = [
  'What theme is emerging?',
  'What pattern wants attention?',
  'What am I not consciously noticing?',
  'What energy surrounds this matter?',
];

interface ScryingSeerChatInterfaceProps {
  userId: string;
  userProfile?: any;
  scryingVision?: any;
  scryingMethod?: 'crystal-ball' | 'mirror';
}

export default function ScryingSeerChatInterface({ 
  userId, 
  userProfile, 
  scryingVision,
  scryingMethod 
}: ScryingSeerChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const clearChat = () => {
    setMessages([]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      type: 'user',
      content: question,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      if (question.length > 500) {
        throw new Error('Question is too long. Please keep it under 500 characters.');
      }

      const response = await fetch('/api/ask-scrying-seer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          question: question,
          userProfile: userProfile,
          scryingVision: scryingVision,
          scryingMethod: scryingMethod
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;

          // Update message with streaming content
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.type === 'seer') {
              return prev.map(msg => 
                msg.id === lastMessage.id 
                  ? { ...msg, content: fullResponse }
                  : msg
              );
            } else {
              return [...prev, {
                id: `msg_${Date.now()}_seer`,
                type: 'seer',
                content: fullResponse,
                timestamp: Date.now()
              }];
            }
          });
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'I apologize, but I encountered an error. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      const errorMsg: Message = {
        id: `msg_${Date.now()}_error`,
        type: 'seer',
        content: errorMessage,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {messages.length > 0 && (
        <div className="flex justify-end px-4 py-2 border-b border-amber-200">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-amber-900 hover:bg-amber-100"
            onClick={clearChat}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear chat
          </Button>
        </div>
      )}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <p className="text-amber-900 font-medium mb-2">
                Ask about emerging themes, patterns, or what wants attention…
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {SCRYING_HINT_QUESTIONS.map((q, i) => (
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
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white border-2 border-amber-200 text-slate-700'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">
                  {message.type === 'user' ? message.content : (
                    <SlowRevealText content={message.content} minThinkingMs={2000} delayPerWord={85} thinkingLabel="Consulting the stars..." className="text-slate-700" />
                  )}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-amber-200 rounded-2xl px-4 py-3">
                <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t-2 border-amber-200 p-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about emerging themes, patterns, or perception…"
            className="flex-1 border-2 border-amber-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
