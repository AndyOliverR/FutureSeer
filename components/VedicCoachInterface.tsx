'use client';

import { useState, useRef, useEffect } from 'react';
import { devLog } from '@/lib/devLogger';
import { useVedic } from '@/hooks/use-vedic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Clock, 
  TrendingUp,
  Heart,
  Briefcase,
  Users,
  Activity,
  Star,
  Zap
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface CoachingTopic {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
}

export function VedicCoachInterface() {
  const { vedicData } = useVedic();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const coachingTopics: CoachingTopic[] = [
    {
      id: 'career',
      title: 'Career Guidance',
      description: 'Get insights about your professional path and opportunities',
      icon: Briefcase,
      color: 'bg-blue-600'
    },
    {
      id: 'relationships',
      title: 'Relationships',
      description: 'Understand your relationship patterns and compatibility',
      icon: Heart,
      color: 'bg-pink-600'
    },
    {
      id: 'health',
      title: 'Health & Wellness',
      description: 'Learn about health indicators and wellness practices',
      icon: Activity,
      color: 'bg-green-600'
    },
    {
      id: 'spirituality',
      title: 'Spiritual Growth',
      description: 'Explore your spiritual path and inner development',
      icon: Star,
      color: 'bg-purple-600'
    },
    {
      id: 'finances',
      title: 'Financial Prosperity',
      description: 'Discover wealth-building opportunities and financial guidance',
      icon: TrendingUp,
      color: 'bg-yellow-600'
    },
    {
      id: 'life-path',
      title: 'Life Purpose',
      description: 'Understand your life mission and soul purpose',
      icon: Zap,
      color: 'bg-orange-600'
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateAIResponse = async (userMessage: string, context?: string): Promise<string> => {
    // Simulate AI response generation based on Vedic data
    const responses = [
      "Based on your Vedic chart, I can see that you have strong leadership qualities. Your Sun placement indicates natural authority, and your current dasha period is favorable for career advancement.",
      "Your Moon placement suggests emotional intelligence and intuition. This is a great time to trust your instincts and follow your heart in relationships.",
      "The planetary positions in your chart indicate a period of spiritual growth. Consider deepening your meditation practice and exploring ancient wisdom.",
      "Your Mars placement shows courage and determination. Use this energy to overcome challenges and pursue your goals with confidence.",
      "The current planetary transits are favorable for financial growth. Focus on your strengths and be open to new opportunities.",
      "Your Jupiter placement indicates wisdom and learning. This is an excellent time for education and expanding your knowledge."
    ];
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(content, vedicData ? JSON.stringify(vedicData) : undefined);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      devLog.error('Error generating AI response:', error, 'VedicCoachInterface');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicClick = (topic: CoachingTopic) => {
    const question = `Tell me more about ${topic.title.toLowerCase()} based on my Vedic chart.`;
    handleSendMessage(question);
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50 rounded-lg border border-slate-600">
      {/* Header */}
      <div className="p-6 border-b border-slate-600">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Vedic AI Coach</h3>
            <p className="text-sm text-slate-400">
              Get personalized guidance based on your Vedic chart
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Welcome to Your Vedic AI Coach
            </h3>
            <p className="text-slate-400 mb-6">
              Ask me anything about your Vedic chart, life guidance, or spiritual growth.
            </p>
            
            {/* Quick Topics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {coachingTopics.map((topic) => (
                <motion.button
                  key={topic.id}
                  onClick={() => handleTopicClick(topic)}
                  className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg border border-slate-600 hover:bg-slate-700/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-8 h-8 ${topic.color} rounded-full flex items-center justify-center`}>
                    <topic.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">{topic.title}</div>
                    <div className="text-xs text-slate-400">{topic.description}</div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Quick Questions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Quick Questions:</h4>
              {[
                "What does my current dasha period mean for me?",
                "How can I improve my relationships based on my chart?",
                "What career path is best for me?",
                "What remedies should I follow?"
              ].map((question, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="block w-full text-left p-3 bg-slate-800/30 rounded-lg border border-slate-600 hover:bg-slate-700/30 transition-colors text-sm text-slate-300"
                  whileHover={{ x: 5 }}
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' ? 'bg-purple-600' : 'bg-slate-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`rounded-lg p-4 ${
                    message.type === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-700/50 text-white border border-slate-600'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-purple-200' : 'text-slate-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-slate-600">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
            placeholder="Ask your Vedic AI coach anything..."
            className="flex-1 bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={isLoading || !inputValue.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 