"use client";

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, MessageCircle, Flame, Award } from 'lucide-react';
import type { DiscussionThread } from '@/app/community/attribution/page';

interface DiscussionCardProps {
  discussion: DiscussionThread;
  onVote: (threadId: string, voteType: 'up' | 'down') => void;
  userVote?: 'up' | 'down' | null;
  onClick?: () => void;
}

export function DiscussionCard({ discussion, onVote, userVote, onClick }: DiscussionCardProps) {
  const netVotes = discussion.upvotes - discussion.downvotes;

  return (
    <div 
      className="flex gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-amber-500/30 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Voting */}
      <div className="flex flex-col items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onVote(discussion.id, 'up');
          }}
          className={`text-gray-400 hover:text-green-400 ${
            userVote === 'up' ? 'text-green-400' : ''
          }`}
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
        <span className="text-sm font-semibold text-amber-200">{netVotes}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onVote(discussion.id, 'down');
          }}
          className={`text-gray-400 hover:text-red-400 ${
            userVote === 'down' ? 'text-red-400' : ''
          }`}
        >
          <ArrowDown className="w-5 h-5" />
        </Button>
      </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 bg-clip-text text-transparent">{discussion.title}</h3>
                        {discussion.isHot && <Flame className="w-4 h-4 text-red-400" />}
                        {discussion.isSticky && <Award className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <p className="text-purple-200 text-sm mb-3 line-clamp-2">{discussion.content}</p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4">
                          <span className="text-cyan-300">by <span className="text-cyan-200 font-medium">{discussion.author}</span></span>
                          <span className="text-blue-300">{new Date(discussion.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1 text-purple-300">
                            <MessageCircle className="w-3 h-3 text-purple-400" />
                            <span className="font-medium">{discussion.comments}</span> comments
                          </span>
                        </div>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/40 text-purple-200">
              {discussion.category}
            </Badge>
            <Badge variant="outline" className={`text-xs ${
              discussion.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
              discussion.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
              discussion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
              'bg-green-500/20 text-green-400 border-green-500/30'
            }`}>
              {discussion.priority}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

