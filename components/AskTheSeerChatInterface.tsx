"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { isProfileComplete, getProfileCompletionStatus } from "@/lib/firebase";
import Link from "next/link";
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Star,
  Clock,
  Palette,
  Hash,
  Shield,
  Brain,
  Heart,
  Zap,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  AlertCircle,
  CheckCircle,
  Trash2
} from "lucide-react";
import { SlowRevealText } from "@/components/chat/SlowRevealText";

interface Message {
  id: string;
  type: 'user' | 'seer';
  content: string;
  timestamp: number;
  confidence?: number;
  sources?: string[];
  celebrityMatches?: CelebrityMatch[];
  dailyInsight?: DailyInsight;
  protectionGuidance?: ProtectionGuidance;
  spiritualGuidance?: SpiritualGuidance;
  /** When true, content is revealed by streaming throttle; render raw content instead of SlowRevealText */
  streamingReveal?: boolean;
}

interface CelebrityMatch {
  name: string;
  category: string;
  similarity: number;
  reasoning: string;
  sharedPatterns: string[];
  birthData: {
    date: string;
    time: string;
    place: string;
  };
}

interface DailyInsight {
  quote: string;
  dos: string[];
  donts: string[];
  luckyColor: string;
  luckyNumber: number;
  auspiciousTimes: string[];
  inauspiciousTimes: string[];
  planetaryInfluence: string;
  nakshatraEnergy: string;
}

interface ProtectionGuidance {
  doshaDetection: string[];
  protectionMantras: string[];
  cleansingRituals: string[];
  talismans: string[];
  warningSigns: string[];
}

interface SpiritualGuidance {
  chakraStatus: string[];
  meditationAdvice: string[];
  consciousnessLevel: string;
  spiritualPractices: string[];
  karmicLessons: string[];
}

interface AskTheSeerChatInterfaceProps {
  userId: string;
  userProfile?: any;
  contextType?: string;
  contextData?: object;
}

const SUGGESTED_QUESTIONS = [
  "What is my life purpose?",
  "When will I get married?",
  "What career suits me best?",
  "How can I improve my health?",
  "What are my wealth yogas?",
  "How can I protect myself from negative energy?",
  "What is my past life karma?",
  "How can I achieve spiritual growth?",
  "What should I do in this situation?",
  "Are there any unseen forces affecting me?",
  "How can I manifest my goals ethically?",
  "What gemstones should I wear?",
  "What is my current dasha period?",
  "What are my marriage yogas?",
  "How can I develop my consciousness?"
];

const MAIN_STARTER_QUESTIONS = [
  'What is my life purpose?',
  'What should I focus on right now?',
];

const FACE_READING_QUESTIONS = [
  "What do my facial features reveal about my personality?",
  "How can I enhance my natural facial features?",
  "What does my face shape indicate about my character?",
  "What career path aligns with my facial energy?",
  "How can I balance my facial elements?",
  "What does my face reveal about my relationships?",
  "How can I improve my facial energy and confidence?",
  "What does my face say about my life purpose?"
];

const DREAM_SYMBOLS_QUESTIONS = [
  "What do my dream symbols mean?",
  "How can I interpret recurring dreams?",
  "What do Jungian archetypes in my dreams reveal?",
  "What is my subconscious trying to tell me?",
  "How can I work with my dream symbols?",
  "What do my dream symbols say about my life path?",
  "How can I remember my dreams better?",
  "What do lucid dreams mean spiritually?"
];

const FENG_SHUI_QUESTIONS = [
  "How can I arrange my space for better energy flow?",
  "What does my Kua number mean for my home?",
  "How can I enhance my favorable directions?",
  "What colors should I use in my home?",
  "How can I balance the elements in my space?",
  "What is the best room placement for me?",
  "How can I improve my Bagua map areas?",
  "What feng shui cures should I use?"
];

const HUMAN_DESIGN_QUESTIONS = [
  "How should I make decisions according to my type?",
  "What does my strategy mean in daily life?",
  "How can I use my authority correctly?",
  "What does my profile reveal about my life role?",
  "How can I work with my defined centers?",
  "What do my undefined centers teach me?",
  "What is the meaning of my incarnation cross?",
  "How can I live authentically according to my design?"
];

const OGHAM_QUESTIONS = [
  "What does my birth tree mean for me?",
  "How can I work with my Ogham letters?",
  "What does my name in Ogham reveal?",
  "How can I connect with Celtic wisdom?",
  "What guidance do my primary letters offer?",
  "How can I use Ogham for decision-making?",
  "What is the meaning of my Ogham script?",
  "How can I apply Celtic tree wisdom in daily life?"
];

const BIBLIOMANCY_QUESTIONS = [
  "What does my Bibliomancy reading mean?",
  "How should I interpret my selected passages?",
  "What guidance do the sacred texts offer me?",
  "How can I apply the divine message in my life?",
  "What do my life area passages reveal?",
  "How can I work with Bibliomancy for guidance?",
  "What is the meaning of my question reading?",
  "How can I use sacred texts for daily wisdom?"
];

const QUESTION_TEMPLATES = {
  purpose: "What is my purpose in this lifetime?",
  marriage: "When will I get married and what kind of partner suits me?",
  career: "What career path aligns with my dharma and when will I succeed?",
  health: "How can I improve my health and what should I be careful about?",
  wealth: "What are my wealth yogas and when will I achieve financial success?",
  protection: "How can I protect myself from negative energy and spiritual attacks?",
  pastLife: "What is my past life karma and how does it affect me now?",
  spirituality: "How can I achieve spiritual growth and enlightenment?",
  consciousness: "How can I develop my consciousness and chakras?",
  decision: "What should I do in this situation? Please guide me.",
  unseenForces: "Are there any unseen forces or spirits influencing my life?",
  manifestation: "How can I ethically manifest my goals and desires?",
  gemstone: "What gemstones should I wear and when?",
  dasha: "What is my current dasha period and its effects?",
  yoga: "What yogas do I have in my chart?",
  remedies: "What remedies can help me overcome my challenges?"
};

export default function AskTheSeerChatInterface({ userId, userProfile, contextType, contextData }: AskTheSeerChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDevotionist = true;
  const isFaceReading = contextType === 'face-reading';
  const isDreamSymbols = contextType === 'dream-symbols';
  const isFengShui = contextType === 'feng-shui';
  const isHumanDesign = contextType === 'human-design';
  const isOgham = contextType === 'ogham';
  const isBibliomancy = contextType === 'bibliomancy';
  
  // Profile validation
  const profileStatus = getProfileCompletionStatus(userProfile);
  const isProfileReady = isProfileComplete(userProfile);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const clearChat = () => {
    setMessages([]);
    setExpandedSections(new Set());
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return;
    
    // Check profile completeness before sending
    if (!isProfileReady) {
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        type: 'seer',
        content: `I need your complete birth profile to provide accurate predictions. Please complete your profile first. Missing: ${profileStatus.missingFields.join(', ')}.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

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
      // Validate question length
      if (question.length > 500) {
        throw new Error('Question is too long. Please keep it under 500 characters.');
      }

      // Use specialized endpoint if contextType is specified
      const apiEndpoint = isFaceReading 
        ? '/api/ask-face-reading-seer' 
        : isDreamSymbols 
        ? '/api/ask-dream-symbols-seer' 
        : isFengShui
        ? '/api/ask-feng-shui-seer'
        : isHumanDesign
        ? '/api/ask-human-design-seer'
        : isOgham
        ? '/api/ask-ogham-seer'
        : isBibliomancy
        ? '/api/ask-bibliomancy-seer'
        : '/api/ask-the-seer';
      
      // Handle streaming response for specialized seers (similar to tarot seer)
      if (isFaceReading || isDreamSymbols || isFengShui || isHumanDesign || isOgham || isBibliomancy) {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            question: question,
            userProfile: userProfile,
            ...(isFaceReading && { faceReadingAnalysis: contextData?.faceReadingAnalysis }),
            ...(isDreamSymbols && { dreamSymbolsAnalysis: contextData?.dreamSymbolsAnalysis }),
            ...(isFengShui && { fengShuiAnalysis: contextData }),
            ...(isHumanDesign && { humanDesignChart: contextData?.humanDesignChart }),
            ...(isOgham && { oghamReport: contextData?.oghamReport }),
            ...(isBibliomancy && { bibliomancyReading: contextData?.bibliomancyReading })
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Failed to get response: ${response.status}`;
          try {
            const errJson = JSON.parse(errorText);
            if (errJson?.error) errorMessage = errJson.error;
          } catch {
            /* use default */
          }
          throw new Error(errorMessage);
        }

        const aiMessageId = `msg_${Date.now()}_seer`;
        const aiMessage: Message = {
          id: aiMessageId,
          type: 'seer',
          content: '',
          timestamp: Date.now(),
          streamingReveal: true
        };
        setMessages(prev => [...prev, aiMessage]);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const accumulatedRef = { current: '' };
        const streamDoneRef = { current: false };
        const displayedWordCountRef = { current: 0 };
        const MIN_THINKING_MS = 2000;
        const REVEAL_INTERVAL_MS = 120;
        const WORDS_PER_TICK = 2;

        const thinkingTimeoutId = window.setTimeout(() => {
          const intervalId = window.setInterval(() => {
            const full = accumulatedRef.current;
            const words = full.trim() ? full.trim().split(/\s+/) : [];
            if (words.length === 0) return;
            displayedWordCountRef.current = Math.min(
              displayedWordCountRef.current + WORDS_PER_TICK,
              words.length
            );
            const displayed = words.slice(0, displayedWordCountRef.current).join(' ');
            setMessages(prev => prev.map(msg =>
              msg.id === aiMessageId ? { ...msg, content: displayed } : msg
            ));
            if (streamDoneRef.current && displayedWordCountRef.current >= words.length) {
              window.clearInterval(intervalId);
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId ? { ...msg, content: accumulatedRef.current } : msg
              ));
            }
          }, REVEAL_INTERVAL_MS);
          if (streamDoneRef.current && accumulatedRef.current.trim() === '') {
            window.clearInterval(intervalId);
          }
        }, MIN_THINKING_MS);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            accumulatedRef.current += chunk;
          }
          streamDoneRef.current = true;
          if (accumulatedRef.current.trim() === '') {
            window.clearTimeout(thinkingTimeoutId);
            setMessages(prev => prev.map(msg =>
              msg.id === aiMessageId ? { ...msg, content: accumulatedRef.current } : msg
            ));
          }
        } else {
          streamDoneRef.current = true;
          window.clearTimeout(thinkingTimeoutId);
        }
      } else {
        // Handle JSON response for general ask-the-seer
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            question: question,
            userProfile: userProfile
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          const seerMessage: Message = {
            id: `msg_${Date.now()}_seer`,
            type: 'seer',
            content: result.data.answer || 'Response received',
            timestamp: Date.now(),
            confidence: result.data.confidence,
            sources: result.data.sources,
            celebrityMatches: result.data.celebrityMatches,
            dailyInsight: result.data.dailyInsight,
            protectionGuidance: result.data.protectionGuidance,
            spiritualGuidance: result.data.spiritualGuidance
          };

          setMessages(prev => [...prev, seerMessage]);
        } else {
          throw new Error(result.error || 'Failed to get response');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'I apologize, but I encountered an error. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('profile')) {
          errorMessage = 'Please complete your profile first to get accurate predictions.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('too long')) {
          errorMessage = 'Your question is too long. Please keep it under 500 characters.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
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
    sendMessage(inputValue);
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (isDevotionist) {
      if (confidence >= 0.8) return 'text-green-700';
      if (confidence >= 0.6) return 'text-amber-700';
      return 'text-red-700';
    }
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="w-4 h-4" />;
    if (confidence >= 0.6) return <AlertCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const formatMessage = (content: string) => {
    const h2Cls = isDevotionist ? 'text-xl font-bold text-amber-900 mt-6 mb-3' : 'text-xl font-bold text-amber-200 mt-6 mb-3';
    const boldCls = isDevotionist ? 'font-semibold text-amber-900 mb-2' : 'font-semibold text-amber-300 mb-2';
    const liCls = isDevotionist ? 'text-slate-700 ml-4 mb-1' : 'text-slate-300 ml-4 mb-1';
    const pCls = isDevotionist ? 'text-slate-700 mb-2' : 'text-slate-300 mb-2';
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className={h2Cls}>
              {line.replace('## ', '')}
            </h2>
          );
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <p key={index} className={boldCls}>
              {line.replace(/\*\*/g, '')}
            </p>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <li key={index} className={liCls}>
              {line.replace('- ', '')}
            </li>
          );
        }
        if (line.startsWith(`${index + 1}. `)) {
          return (
            <li key={index} className={liCls}>
              {line.replace(/^\d+\. /, '')}
            </li>
          );
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return (
          <p key={index} className={pCls}>
            {line}
          </p>
        );
      });
  };

  return (
    <div className={`flex flex-col h-full ${isDevotionist ? 'bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200 shadow-lg overflow-hidden' : 'bg-slate-900'}`}>
      {/* Header */}
      <CardHeader className={isDevotionist ? 'border-b border-amber-200 bg-white/80' : 'border-b border-slate-700 bg-slate-800'}>
        <CardTitle className={`flex items-center gap-2 ${isDevotionist ? 'text-amber-900' : 'text-amber-200'}`}>
          <MessageCircle className={`w-6 h-6 ${isDevotionist ? 'text-amber-700' : 'text-amber-400'}`} />
          Ask the Seer
          <Badge variant="outline" className={isDevotionist ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/20 text-amber-200 border-amber-500/30'}>
            {isFaceReading ? 'Face Reading Expert' : isDreamSymbols ? 'Dream Symbols Expert' : isFengShui ? 'Feng Shui Expert' : isHumanDesign ? 'Human Design Expert' : isOgham ? 'Ogham Expert' : isBibliomancy ? 'Bibliomancy Expert' : 'Universal Expert'}
          </Badge>
        </CardTitle>
        <p className={isDevotionist ? 'text-slate-700 text-sm' : 'text-slate-400 text-sm'}>
          {isFaceReading 
            ? 'Expert guidance in Face Reading (Physiognomy). Ask me about your facial features, personality traits, and face reading insights.'
            : isDreamSymbols
            ? 'Expert guidance in Dream Symbols and Dream Interpretation. Ask me about your dreams, symbols, Jungian archetypes, and subconscious messages.'
            : isFengShui
            ? 'Expert guidance in Feng Shui, space arrangement, and energy flow. Ask me about your Kua number, favorable directions, element balance, and feng shui practices.'
            : isHumanDesign
            ? 'Expert guidance in Human Design, BodyGraph, and energy types. Ask me about your type, strategy, authority, profile, centers, gates, and incarnation cross.'
            : isOgham
            ? 'Expert guidance in Ogham, Celtic tree alphabet, and Ogham script. Ask me about your birth tree, Ogham letters, name meaning, and Celtic wisdom.'
            : isBibliomancy
            ? 'Expert guidance in Bibliomancy and sacred text divination. Ask me about your Bibliomancy reading, sacred passages, divine messages, and passage interpretation.'
            : 'Ask any question about your life, purpose, relationships, career, health, spirituality, or future. I\'ll analyze your chart using 50+ systems including Vedic astrology, numerology, tarot, and more.'}
        </p>
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={isDevotionist ? 'text-slate-600 hover:text-amber-900 hover:bg-amber-100 shrink-0' : 'text-slate-400 hover:text-amber-200 hover:bg-slate-700 shrink-0'}
            onClick={clearChat}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear chat
          </Button>
        )}
      </CardHeader>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className={`w-12 h-12 mx-auto mb-4 ${isDevotionist ? 'text-amber-700' : 'text-amber-400'}`} />
              <h3 className={`text-xl font-semibold mb-2 ${isDevotionist ? 'text-amber-900' : 'text-amber-200'}`}>
                Welcome to Ask the Seer
              </h3>
              <p className={`mb-6 ${isDevotionist ? 'text-slate-700' : 'text-slate-400'}`}>
                {isFaceReading
                  ? 'Ask about your facial features and their meanings—or pick a question below.'
                  : isDreamSymbols
                  ? 'Ask about your dreams and symbols—or pick a question below.'
                  : isFengShui
                  ? 'Ask about Feng Shui and your space—or pick a question below.'
                  : isHumanDesign
                  ? 'Ask about your Human Design—or pick a question below.'
                  : isOgham
                  ? 'Ask about your Ogham letters and Celtic wisdom—or pick a question below.'
                  : isBibliomancy
                  ? 'Ask about your Bibliomancy reading—or pick a question below.'
                  : 'Ask about life, purpose, relationships, or pick one below.'}
              </p>
              
              {/* Profile Completion Status */}
              {!isProfileReady && (
                <Alert className={isDevotionist ? 'mb-6 max-w-2xl mx-auto bg-amber-100 border-amber-300' : 'mb-6 max-w-2xl mx-auto bg-amber-500/10 border-amber-500/30'}>
                  <AlertCircle className={`h-4 w-4 ${isDevotionist ? 'text-amber-700' : 'text-amber-400'}`} />
                  <AlertDescription className={isDevotionist ? 'text-amber-900' : 'text-amber-200'}>
                    <div className="space-y-2">
                      <p className="font-semibold">Profile {profileStatus.completionPercentage}% Complete</p>
                      <p className={`text-sm ${isDevotionist ? 'text-slate-700' : ''}`}>To provide accurate predictions, I need your complete birth profile:</p>
                      <ul className="text-sm text-left space-y-1">
                        {profileStatus.missingFields.map((field, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className={isDevotionist ? 'text-red-600' : 'text-red-400'}>✗</span>
                            <span>{field}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href="/profile">
                        <Button className="mt-3 bg-amber-600 hover:bg-amber-700 text-white">
                          Complete Profile
                        </Button>
                      </Link>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Conversation starters - Only show if profile is complete */}
              {isProfileReady && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {(isFaceReading
                    ? FACE_READING_QUESTIONS.slice(0, 2)
                    : isDreamSymbols
                    ? DREAM_SYMBOLS_QUESTIONS.slice(0, 2)
                    : isFengShui
                    ? FENG_SHUI_QUESTIONS.slice(0, 2)
                    : isHumanDesign
                    ? HUMAN_DESIGN_QUESTIONS.slice(0, 2)
                    : isOgham
                    ? OGHAM_QUESTIONS.slice(0, 2)
                    : isBibliomancy
                    ? BIBLIOMANCY_QUESTIONS.slice(0, 2)
                    : MAIN_STARTER_QUESTIONS).map((q, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={isDevotionist ? 'text-left justify-start h-auto p-3 bg-white border-amber-200 hover:bg-amber-50 text-slate-700' : 'text-left justify-start h-auto p-3 bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-amber-500/30'}
                      onClick={() => handleSuggestedQuestion(q)}
                    >
                      <Lightbulb className={`w-4 h-4 mr-2 flex-shrink-0 ${isDevotionist ? 'text-amber-700' : 'text-amber-400'}`} />
                      <span className={`text-sm ${isDevotionist ? 'text-slate-700' : 'text-slate-300'}`}>{q}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-4xl rounded-xl ${
                message.type === 'user' 
                  ? (isDevotionist ? 'bg-blue-50 border-2 border-blue-200' : 'bg-blue-600/20 border-blue-500/30')
                  : (isDevotionist ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200' : 'bg-slate-800 border-slate-600')
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {message.type === 'seer' && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDevotionist ? 'bg-amber-100' : 'bg-amber-500/20'}`}>
                        <Sparkles className={`w-4 h-4 ${isDevotionist ? 'text-amber-700' : 'text-amber-400'}`} />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`font-semibold ${isDevotionist ? 'text-amber-900' : 'text-amber-200'}`}>
                          {message.type === 'user' ? 'You' : 'The Seer'}
                        </span>
                        {message.confidence && (
                          <Badge 
                            variant="outline" 
                            className={`${getConfidenceColor(message.confidence)} border-current`}
                          >
                            {getConfidenceIcon(message.confidence)}
                            <span className="ml-1">
                              {Math.round(message.confidence * 100)}% confidence
                            </span>
                          </Badge>
                        )}
                      </div>
                      
                      <div className={isDevotionist ? 'prose max-w-none' : 'prose prose-invert max-w-none'}>
                        {message.streamingReveal ? (
                          message.content ? (
                            formatMessage(message.content)
                          ) : (
                            <span className={isDevotionist ? 'text-slate-700' : 'text-slate-300'}>
                              Consulting the stars...
                            </span>
                          )
                        ) : (
                          <SlowRevealText
                            content={message.content}
                            minThinkingMs={2000}
                            delayPerWord={85}
                            thinkingLabel="Consulting the stars..."
                            className={isDevotionist ? 'text-slate-700' : 'text-slate-300'}
                          />
                        )}
                      </div>

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className={`mt-3 pt-3 border-t ${isDevotionist ? 'border-amber-200' : 'border-slate-600'}`}>
                          <p className={`text-xs mb-2 ${isDevotionist ? 'text-slate-700' : 'text-slate-400'}`}>Sources:</p>
                          <div className="flex flex-wrap gap-1">
                            {message.sources.map((source, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className={isDevotionist ? 'text-xs bg-amber-100 text-amber-900 border-amber-300' : 'text-xs bg-slate-700 border-slate-500 text-slate-300'}
                              >
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Celebrity Matches */}
                      {message.celebrityMatches && message.celebrityMatches.length > 0 && (
                        <div className="mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={isDevotionist ? 'text-amber-700 hover:text-amber-900 p-0 h-auto' : 'text-amber-200 hover:text-amber-100 p-0 h-auto'}
                            onClick={() => toggleSection(`celebrity-${message.id}`)}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Celebrity Matches ({message.celebrityMatches.length})
                            {expandedSections.has(`celebrity-${message.id}`) ? (
                              <ChevronUp className="w-4 h-4 ml-2" />
                            ) : (
                              <ChevronDown className="w-4 h-4 ml-2" />
                            )}
                          </Button>
                          
                          {expandedSections.has(`celebrity-${message.id}`) && (
                            <div className="mt-2 space-y-2">
                              {message.celebrityMatches.map((match, index) => (
                                <Card key={index} className={isDevotionist ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200' : 'bg-slate-700 border-slate-600'}>
                                  <CardContent className="p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className={`font-semibold ${isDevotionist ? 'text-amber-900' : 'text-amber-200'}`}>{match.name}</h4>
                                      <Badge className={isDevotionist ? 'bg-green-100 text-green-900 border-green-300' : 'bg-green-500/20 text-green-200 border-green-500/30'}>
                                        {match.similarity}% match
                                      </Badge>
                                    </div>
                                    <p className={`text-sm mb-2 ${isDevotionist ? 'text-slate-700' : 'text-slate-300'}`}>{match.reasoning}</p>
                                    <div className="flex flex-wrap gap-1">
                                      {match.sharedPatterns.map((pattern, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className={isDevotionist ? 'text-xs bg-amber-100 text-amber-900 border-amber-300' : 'text-xs bg-amber-500/20 text-amber-200 border-amber-500/30'}
                                        >
                                          {pattern}
                                        </Badge>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Daily Insight */}
                      {message.dailyInsight && (
                        <div className="mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={isDevotionist ? 'text-amber-700 hover:text-amber-900 p-0 h-auto' : 'text-amber-200 hover:text-amber-100 p-0 h-auto'}
                            onClick={() => toggleSection(`insight-${message.id}`)}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Daily Insight
                            {expandedSections.has(`insight-${message.id}`) ? (
                              <ChevronUp className="w-4 h-4 ml-2" />
                            ) : (
                              <ChevronDown className="w-4 h-4 ml-2" />
                            )}
                          </Button>
                          
                          {expandedSections.has(`insight-${message.id}`) && (
                            <Card className={isDevotionist ? 'mt-2 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200' : 'mt-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30'}>
                              <CardContent className="p-4">
                                <blockquote className={`italic mb-4 ${isDevotionist ? 'text-amber-900' : 'text-amber-200'}`}>
                                  "{message.dailyInsight.quote}"
                                </blockquote>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <h5 className={`font-semibold mb-2 ${isDevotionist ? 'text-amber-900' : 'text-amber-300'}`}>Do's:</h5>
                                    <ul className="space-y-1">
                                      {message.dailyInsight.dos.map((doItem, index) => (
                                        <li key={index} className={isDevotionist ? 'text-green-700' : 'text-green-300'}>✓ {doItem}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h5 className={`font-semibold mb-2 ${isDevotionist ? 'text-amber-900' : 'text-amber-300'}`}>Don'ts:</h5>
                                    <ul className="space-y-1">
                                      {message.dailyInsight.donts.map((dont, index) => (
                                        <li key={index} className={isDevotionist ? 'text-red-700' : 'text-red-300'}>✗ {dont}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                                
                                <Separator className="my-4" />
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Palette className={`w-4 h-4 ${isDevotionist ? 'text-amber-700' : 'text-amber-400'}`} />
                                    <span className={isDevotionist ? 'text-slate-700' : 'text-slate-300'}>Lucky Color: </span>
                                    <Badge className={isDevotionist ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/20 text-amber-200'}>
                                      {message.dailyInsight.luckyColor}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Hash className={`w-4 h-4 ${isDevotionist ? 'text-amber-700' : 'text-amber-400'}`} />
                                    <span className={isDevotionist ? 'text-slate-700' : 'text-slate-300'}>Lucky Number: </span>
                                    <Badge className={isDevotionist ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/20 text-amber-200'}>
                                      {message.dailyInsight.luckyNumber}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <h6 className={`font-semibold mb-1 ${isDevotionist ? 'text-green-700' : 'text-green-300'}`}>Auspicious Times:</h6>
                                    <p className={isDevotionist ? 'text-slate-700' : 'text-slate-300'}>{message.dailyInsight.auspiciousTimes.join(', ')}</p>
                                  </div>
                                  
                                  <div>
                                    <h6 className={`font-semibold mb-1 ${isDevotionist ? 'text-red-700' : 'text-red-300'}`}>Inauspicious Times:</h6>
                                    <p className={isDevotionist ? 'text-slate-700' : 'text-slate-300'}>{message.dailyInsight.inauspiciousTimes.join(', ')}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}

                      {/* Protection Guidance */}
                      {message.protectionGuidance && (
                        <div className="mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={isDevotionist ? 'text-amber-700 hover:text-amber-900 p-0 h-auto' : 'text-amber-200 hover:text-amber-100 p-0 h-auto'}
                            onClick={() => toggleSection(`protection-${message.id}`)}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Protection Guidance
                            {expandedSections.has(`protection-${message.id}`) ? (
                              <ChevronUp className="w-4 h-4 ml-2" />
                            ) : (
                              <ChevronDown className="w-4 h-4 ml-2" />
                            )}
                          </Button>
                          
                          {expandedSections.has(`protection-${message.id}`) && (
                            <Card className={isDevotionist ? 'mt-2 bg-red-50 border-2 border-red-200' : 'mt-2 bg-red-500/10 border-red-500/30'}>
                              <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <h5 className={`font-semibold mb-2 ${isDevotionist ? 'text-red-900' : 'text-red-300'}`}>Protection Mantras:</h5>
                                    <ul className="space-y-1">
                                      {message.protectionGuidance.protectionMantras.map((mantra, index) => (
                                        <li key={index} className={isDevotionist ? 'text-slate-700' : 'text-slate-300'}>• {mantra}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h5 className={`font-semibold mb-2 ${isDevotionist ? 'text-red-900' : 'text-red-300'}`}>Cleansing Rituals:</h5>
                                    <ul className="space-y-1">
                                      {message.protectionGuidance.cleansingRituals.map((ritual, index) => (
                                        <li key={index} className={isDevotionist ? 'text-slate-700' : 'text-slate-300'}>• {ritual}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}

                      {/* Spiritual Guidance */}
                      {message.spiritualGuidance && (
                        <div className="mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={isDevotionist ? 'text-amber-700 hover:text-amber-900 p-0 h-auto' : 'text-amber-200 hover:text-amber-100 p-0 h-auto'}
                            onClick={() => toggleSection(`spiritual-${message.id}`)}
                          >
                            <Brain className="w-4 h-4 mr-2" />
                            Spiritual Guidance
                            {expandedSections.has(`spiritual-${message.id}`) ? (
                              <ChevronUp className="w-4 h-4 ml-2" />
                            ) : (
                              <ChevronDown className="w-4 h-4 ml-2" />
                            )}
                          </Button>
                          
                          {expandedSections.has(`spiritual-${message.id}`) && (
                            <Card className={isDevotionist ? 'mt-2 bg-purple-50 border-2 border-purple-200' : 'mt-2 bg-purple-500/10 border-purple-500/30'}>
                              <CardContent className="p-4">
                                <div className="space-y-3 text-sm">
                                  <div>
                                    <h5 className={`font-semibold mb-2 ${isDevotionist ? 'text-purple-900' : 'text-purple-300'}`}>Meditation Advice:</h5>
                                    <ul className="space-y-1">
                                      {message.spiritualGuidance.meditationAdvice.map((advice, index) => (
                                        <li key={index} className={isDevotionist ? 'text-slate-700' : 'text-slate-300'}>• {advice}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h5 className={`font-semibold mb-2 ${isDevotionist ? 'text-purple-900' : 'text-purple-300'}`}>Spiritual Practices:</h5>
                                    <ul className="space-y-1">
                                      {message.spiritualGuidance.spiritualPractices.map((practice, index) => (
                                        <li key={index} className={isDevotionist ? 'text-slate-700' : 'text-slate-300'}>• {practice}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h5 className={`font-semibold mb-2 ${isDevotionist ? 'text-purple-900' : 'text-purple-300'}`}>Consciousness Level:</h5>
                                    <p className={isDevotionist ? 'text-slate-700' : 'text-slate-300'}>{message.spiritualGuidance.consciousnessLevel}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}

                      <div className={`text-xs mt-2 ${isDevotionist ? 'text-slate-600' : 'text-slate-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <Card className={isDevotionist ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200' : 'bg-slate-800 border-slate-600'}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDevotionist ? 'bg-amber-100' : 'bg-amber-500/20'}`}>
                      <Sparkles className={`w-4 h-4 animate-pulse ${isDevotionist ? 'text-amber-700' : 'text-amber-400'}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={isDevotionist ? 'text-amber-900' : 'text-amber-200'}>The Seer is thinking...</span>
                      <div className="flex gap-1">
                        <div className={`w-2 h-2 rounded-full animate-bounce ${isDevotionist ? 'bg-amber-600' : 'bg-amber-400'}`}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${isDevotionist ? 'bg-amber-600' : 'bg-amber-400'}`} style={{ animationDelay: '0.1s' }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${isDevotionist ? 'bg-amber-600' : 'bg-amber-400'}`} style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Form */}
      <div className={`border-t p-4 ${isDevotionist ? 'border-amber-200 bg-white/80' : 'border-slate-700 bg-slate-800'}`}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isProfileReady ? 
              (isFaceReading 
                ? "Ask me anything about Face Reading, your facial features, or physiognomy..."
                : isDreamSymbols
                ? "Ask me anything about Dream Symbols, your dreams, or dream interpretation..."
                : isFengShui
                ? "Ask me anything about Feng Shui, space arrangement, or energy flow..."
                : isHumanDesign
                ? "Ask me anything about Human Design, your type, strategy, or authority..."
                : isOgham
                ? "Ask me anything about Ogham, your birth tree, or Celtic wisdom..."
                : isBibliomancy
                ? "Ask me anything about Bibliomancy, your sacred passages, or divine guidance..."
                : "Ask me anything about your life, purpose, relationships, career, health, or future...") :
              "Complete your profile first to ask questions..."
            }
            className={isDevotionist ? 'flex-1 bg-white border-amber-200 text-slate-800 placeholder-slate-500 focus:border-amber-400' : 'flex-1 bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-amber-500'}
            disabled={isLoading || !isProfileReady}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !inputValue.trim() || !isProfileReady}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        {/* Question Templates - Only show if profile is complete */}
        {isProfileReady && (
          <div className="mt-3">
            <p className={`text-xs mb-2 ${isDevotionist ? 'text-slate-700' : 'text-slate-400'}`}>Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(QUESTION_TEMPLATES).slice(0, 6).map(([key, template]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  className={isDevotionist ? 'text-xs bg-white border-amber-200 hover:bg-amber-50 text-slate-700' : 'text-xs bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-amber-500/30 text-slate-300'}
                  onClick={() => handleSuggestedQuestion(template)}
                  disabled={isLoading}
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
