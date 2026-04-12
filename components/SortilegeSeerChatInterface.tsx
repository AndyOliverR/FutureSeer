'use client';

import React, { useState, useEffect, useRef } from 'react';
import { devLog } from '@/lib/devLogger';
import { fetchWithFirebaseAuthRequired } from '@/lib/clientFirebaseFetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Send, Star, Clock, Zap, Heart, Brain, Sparkles, Wand2, Dice6, Gem, Square, Circle, TreePine, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SortilegeReading } from '@/lib/sortilegeIntelligence';
import { SlowRevealText } from '@/components/chat/SlowRevealText';

interface SortilegeSeerChatInterfaceProps {
  userId: string;
  userProfile: any;
  sortilegeReading?: SortilegeReading;
  sessionId?: string;
}

interface Message {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
  metadata?: {
    confidence?: number;
    castReferences?: {
      method: string;
      symbols: string[];
      values: (number | string)[];
      interpretation: string;
    };
    guidance?: string[];
    followUpQuestions?: string[];
  };
}

const SORTILEGE_QUICK_QUESTIONS = [
  // Cast Interpretation
  "What does my cast mean?",
  "Explain the symbols in my reading",
  "How should I interpret my cast result?",
  "What do the positions reveal?",
  
  // Method-Specific
  "What does my dice cast reveal?",
  "What do the stone symbols mean?",
  "How do I read my card draw?",
  "What do the coin results indicate?",
  "What do the stick symbols reveal?",
  
  // Guidance
  "What guidance does my cast provide?",
  "What should I do based on this reading?",
  "What does the cast advise me?",
  
  // Timing
  "When should I take action?",
  "What timing does the cast suggest?",
  "When is the best time for me?",
  
  // Decision Making
  "Should I proceed with my plan?",
  "What does the cast say about my decision?",
  "How should I choose?",
  
  // Relationships
  "What does this reading say about my relationships?",
  "How do the symbols relate to partnership?",
  
  // Career & Money
  "What guidance does this offer for my career?",
  "What do the cast results reveal about my finances?",
  "Should I make this financial decision?",
  
  // Spiritual & Personal Growth
  "What is the deeper meaning of this reading?",
  "What spiritual lesson does this teach?",
  "How can I grow from this situation?"
];

const SORTILEGE_STARTER_QUESTIONS = [
  'What does my cast mean?',
  'What guidance does this reading offer?',
];

const getMethodIcon = (method: string) => {
  switch (method) {
    case 'dice': return Dice6;
    case 'stones': return Gem;
    case 'cards': return Square;
    case 'coins': return Circle;
    case 'sticks': return TreePine;
    default: return Wand2;
  }
};

const getMethodName = (method: string): string => {
  const methodNames: { [key: string]: string } = {
    'dice': 'Cleromancy (Dice)',
    'stones': 'Lithomancy (Stones)',
    'cards': 'Cartomancy (Cards)',
    'coins': 'Coin Divination',
    'sticks': 'Stick Casting'
  };
  return methodNames[method] || method;
};

export default function SortilegeSeerChatInterface({ 
  userId, 
  userProfile, 
  sortilegeReading,
  sessionId 
}: SortilegeSeerChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (questionText?: string) => {
    const messageToSend = questionText || question.trim();
    if (!messageToSend || isLoading) return;

    if (!sortilegeReading) {
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: messageToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Create placeholder for AI response
    const aiMessageId = `seer_${Date.now()}`;
    const aiMessage: Message = {
      id: aiMessageId,
      type: 'seer',
      content: '',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      const response = await fetchWithFirebaseAuthRequired('/api/ask-sortilege-seer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          question: messageToSend,
          userProfile,
          sortilegeReading,
          sessionId: currentSessionId
        })
      });
      
      if (!response.ok) throw new Error('Failed to get response');
      
      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        let accumulatedContent = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          accumulatedContent += chunk;
          
          // Update message with streaming content (typing effect)
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: accumulatedContent }
              : msg
          ));
        }
      }
    } catch (error) {
      devLog.error('Error:', error, 'SortilegeSeerChatInterface');
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, content: 'I apologize, but I encountered an error. Please try again.' }
          : msg
      ));
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
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-end mb-4"
        >
          <div className="bg-amber-600 text-white p-3 rounded-xl max-w-[80%] shadow-md">
            <p className="text-sm">{message.content}</p>
            <p className="text-xs text-amber-100 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-start mb-4"
      >
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 text-amber-900 p-4 rounded-xl max-w-[90%] shadow-md">
          <div className="flex items-start space-x-2">
            <div className="bg-amber-200 p-1 rounded-full">
              <Wand2 className="w-3 h-3 text-amber-900" />
            </div>
            <div className="flex-1">
              <div className="prose prose-amber max-w-none">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                  <SlowRevealText
                    content={message.content}
                    minThinkingMs={2000}
                    delayPerWord={85}
                    thinkingLabel="Consulting the stars..."
                    className="text-slate-700"
                  />
                </p>
              </div>
              
              {/* Cast References */}
              {message.metadata?.castReferences && (
                <div className="mt-3 pt-3 border-t border-amber-300">
                  <div className="flex flex-wrap gap-1">
                    <Badge className="bg-amber-200 text-amber-900 border-amber-300 text-xs">
                      {getMethodName(message.metadata.castReferences.method)}
                    </Badge>
                    {message.metadata.castReferences.symbols.slice(0, 3).map((symbol, idx) => (
                      <Badge key={idx} className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Guidance */}
              {message.metadata?.guidance && message.metadata.guidance.length > 0 && (
                <div className="mt-3 pt-3 border-t border-amber-300">
                  <h4 className="text-xs font-semibold text-amber-800 mb-2">Guidance:</h4>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {message.metadata.guidance.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <Zap className="w-3 h-3 text-amber-700 mt-0.5 mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow-up Questions */}
              {message.metadata?.followUpQuestions && message.metadata.followUpQuestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-amber-300">
                  <h4 className="text-xs font-semibold text-amber-800 mb-2">You might also ask:</h4>
                  <div className="space-y-1">
                    {message.metadata.followUpQuestions.map((followUp, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(followUp)}
                        className="text-xs text-amber-800 hover:text-amber-900 underline block text-left"
                      >
                        {followUp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-600 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
                {message.metadata?.confidence && (
                  <span className="ml-2">
                    • Confidence: {Math.round(message.metadata.confidence * 100)}%
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (!sortilegeReading) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
        <CardContent className="p-6 text-center">
          <Alert className="bg-amber-100 border-amber-300">
            <AlertDescription className="text-amber-900">
              Please generate a Sortilege reading first to consult the seer.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const MethodIcon = getMethodIcon(sortilegeReading.method);
  const symbols = sortilegeReading.castResult.interpretation.symbols || [];

  return (
    <div className="flex flex-col h-full">
      {/* Sortilege Context */}
      {sortilegeReading && (
        <Card className="mb-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <MethodIcon className="w-4 h-4" />
                  Your Sortilege Reading
                </p>
                <div className="text-sm space-y-1 text-slate-700">
                  <p>• Method: {getMethodName(sortilegeReading.method)}</p>
                  <p>• Primary Meaning: {sortilegeReading.castResult.interpretation.primary}</p>
                  {symbols.length > 0 && (
                    <p>• Key Symbols: {symbols.slice(0, 3).map(s => s.name).join(', ')}</p>
                  )}
                  {sortilegeReading.castResult.cast.totalValue !== undefined && (
                    <p>• Total Value: {sortilegeReading.castResult.cast.totalValue}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-amber-200 text-amber-900 border-amber-300 text-xs">
                  <Brain className="w-3 h-3 mr-1" />
                  Sortilege Expert
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Questions */}
      <Card className="mb-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-amber-900 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-amber-700" />
            Quick Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SORTILEGE_QUICK_QUESTIONS.slice(0, 8).map((quickQuestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(quickQuestion)}
                disabled={isLoading}
                className="text-xs text-left justify-start h-auto p-2 hover:bg-amber-100 bg-white border-amber-200 text-amber-900 rounded-xl"
              >
                <MessageCircle className="w-3 h-3 mr-2 text-amber-700 flex-shrink-0" />
                {quickQuestion}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
        {messages.length === 0 && !isLoading ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-amber-600" />
            <p className="text-amber-900 font-medium mb-2">
              Welcome to Ask the Seer — Sortilege Divination.
            </p>
            <p className="text-sm text-slate-600 mb-4">
              Ask about your cast, symbols, or guidance—or pick one below.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SORTILEGE_STARTER_QUESTIONS.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                  className="text-amber-900 border-amber-200 hover:bg-amber-100 hover:border-amber-300 rounded-xl"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <>
        {messages.length > 0 && (
          <div className="flex justify-end mb-2">
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
          </div>
        )}
        <AnimatePresence>
          {messages.map((message) => (
            <div key={message.id}>
              {formatMessage(message)}
            </div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 text-amber-900 p-4 rounded-xl shadow-md">
              <div className="flex items-center space-x-2">
                <div className="bg-amber-200 p-1 rounded-full">
                  <Wand2 className="w-3 h-3 text-amber-900" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-slate-700">Consulting the lots...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-b-2xl">
        <div className="flex space-x-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask the Sortilege diviner about your cast, symbols, or guidance..."
            disabled={isLoading}
            className="flex-1 bg-white border-amber-200 text-slate-800 placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-amber-500"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={isLoading || !question.trim()}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
