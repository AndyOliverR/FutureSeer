"use client";

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/lib/seerChatbot/seerChatbot';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatInput } from './ChatInput';
import { devLog } from '@/lib/devLogger';

interface SeerChatInterfaceProps {
  userId: string;
  sessionId?: string;
  onSessionCreated?: (sessionId: string) => void;
}

export function SeerChatInterface({ userId }: SeerChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const threadToMessages = (thread: Array<{ role: string; content: string }>): ChatMessage[] =>
    thread.map((m, i) => ({
      id: `${m.role}_${i}_${Date.now()}`,
      type: m.role === 'seer' ? 'seer' : 'user',
      content: m.content,
      timestamp: new Date(),
    }));

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const trimmed = content.trim();
    const thread = messages.map((m) => ({ role: m.type, content: m.content }));
    setMessages((prev) => [...prev, { id: `user_${Date.now()}`, type: 'user', content: trimmed, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/seer/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, thread, userId }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to get response from Seer');
      }

      const data = await response.json();
      const newThread = data.thread ?? [];
      setMessages(threadToMessages(newThread));
    } catch (error) {
      devLog.error('Error sending message', error, 'SeerChatInterface');
      setMessages((prev) => [
        ...prev,
        { id: `user_${Date.now()}`, type: 'user', content: content.trim(), timestamp: new Date() },
        {
          id: `error_${Date.now()}`,
          type: 'seer',
          content: 'Sorry, I could not reach the Seer. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

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
          <div className="text-blue-300 animate-pulse text-sm">The Seer is gazing...</div>
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