"use client";

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/lib/seerChatbot/seerChatbot';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatInput } from './ChatInput';
import { ConfidenceMeter } from './ConfidenceMeter';
import { ModuleBadges } from './ModuleBadges';
import { TimingDisplay } from './TimingDisplay';

interface SeerChatInterfaceProps {
  userId: string;
  sessionId?: string;
  onSessionCreated?: (sessionId: string) => void;
}

export function SeerChatInterface({ userId, sessionId, onSessionCreated }: SeerChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/seer/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          query: content.trim(),
          context: {
            session_id: currentSessionId
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Seer');
      }

      const result = await response.json();
      
      if (result.success) {
        const seerResponse = result.data;
        
        // Update session ID if this is the first message
        if (!currentSessionId && seerResponse.session_id) {
          setCurrentSessionId(seerResponse.session_id);
          onSessionCreated?.(seerResponse.session_id);
        }

        // Add Seer response
        const seerMessage: ChatMessage = {
          id: `seer_${Date.now()}`,
          type: 'seer',
          content: formatSeerResponse(seerResponse),
          timestamp: new Date(),
          metadata: {
            intent: seerResponse.source_badges[0],
            confidence: seerResponse.confidence,
            sources: seerResponse.source_badges,
            timing: seerResponse.timing_window
          }
        };

        setMessages(prev => [...prev, seerMessage]);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'seer',
        content: `❌ Sorry, I encountered an error while processing your question. Please try again.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSeerResponse = (response: any): string => {
    let formatted = `🔮 **${response.verdict}**\n\n`;
    
    if (response.support && response.support.length > 0) {
      formatted += `✨ **Supporting Factors:**\n`;
      response.support.forEach((support: any) => {
        formatted += `• ${support.module}: ${support.summary}\n`;
      });
      formatted += '\n';
    }
    
    if (response.warnings && response.warnings.length > 0) {
      formatted += `⚠️ **Considerations:**\n`;
      response.warnings.forEach((warning: string) => {
        formatted += `• ${warning}\n`;
      });
      formatted += '\n';
    }
    
    if (response.actions && response.actions.length > 0) {
      formatted += `🎯 **Recommended Actions:**\n`;
      response.actions.forEach((action: string) => {
        formatted += `• ${action}\n`;
      });
      formatted += '\n';
    }
    
    formatted += `📊 **Sources:** ${response.source_badges.join(', ')}`;
    
    if (response.clarify) {
      formatted += `\n\n❓ **Clarification needed:** ${response.clarify}`;
    }
    
    return formatted;
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentSessionId(undefined);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-sm rounded-lg border border-yellow-700/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-yellow-700/20">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-yellow-200">🔮 Ask the Seer</h3>
        </div>
        <button
          onClick={clearChat}
          className="text-gray-400 hover:text-yellow-200 transition-colors"
          title="Clear chat"
        >
          🗑️
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-4">🔮</div>
            <h3 className="text-lg font-semibold mb-2">Welcome to the Seer</h3>
            <p className="text-sm">
              Ask me anything about your future, timing, compatibility, or guidance.
              <br />
              I'll consult the stars, numbers, and mystical forces for you.
            </p>
            <div className="mt-6 space-y-2 text-xs text-gray-500">
              <p>💡 Try asking:</p>
              <p>"Will my MSME grant arrive in December?"</p>
              <p>"When is the best time for my career breakthrough?"</p>
              <p>"Are we compatible for marriage?"</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              showMetadata={message.type === 'seer'}
            />
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">Consulting the stars...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-yellow-700/20">
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
          placeholder="Ask the Seer about your future..."
        />
      </div>
    </div>
  );
} 