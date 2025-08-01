"use client";

import { ChatMessage } from '@/lib/seerChatbot/seerChatbot';
import { ConfidenceMeter } from './ConfidenceMeter';
import { ModuleBadges } from './ModuleBadges';
import { TimingDisplay } from './TimingDisplay';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  showMetadata?: boolean;
}

export function ChatMessageBubble({ message, showMetadata = false }: ChatMessageBubbleProps) {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-lg p-4 ${
            isUser
              ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-white'
              : 'bg-slate-800/80 backdrop-blur-sm border border-yellow-700/30 text-yellow-100'
          }`}
        >
          {/* Message Content */}
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
          
          {/* Metadata for Seer messages */}
          {showMetadata && message.metadata && (
            <div className="mt-3 pt-3 border-t border-yellow-700/20 space-y-2">
              {/* Confidence Meter */}
              {message.metadata.confidence && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Confidence:</span>
                  <ConfidenceMeter confidence={message.metadata.confidence} />
                </div>
              )}
              
              {/* Module Badges */}
              {message.metadata.sources && message.metadata.sources.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Sources:</span>
                  <ModuleBadges sources={message.metadata.sources} />
                </div>
              )}
              
              {/* Timing Display */}
              {message.metadata.timing && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Timing:</span>
                  <TimingDisplay timing={message.metadata.timing} />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
        isUser 
          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white order-1 ml-2'
          : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black order-2 mr-2'
      }`}>
        {isUser ? '👤' : '🔮'}
      </div>
    </div>
  );
} 