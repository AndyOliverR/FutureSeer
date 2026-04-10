"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy, Crown, Star, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LeaderboardMember {
  id: string;
  name: string;
  karma: number;
  level: string;
  contributions: number;
}

interface AttributionLeaderboardProps {
  title?: string;
  subtitle?: string;
  showKarmaDelta?: boolean;
}

const leaderboardPreview: LeaderboardMember[] = [
  { id: "preview-1", name: "Power User", karma: 4200, contributions: 127, level: "Grandmaster" },
  { id: "preview-2", name: "Early Adopter", karma: 3100, contributions: 98, level: "Master" },
  { id: "preview-3", name: "Innovator", karma: 2500, contributions: 76, level: "Adept" },
];

export function AttributionLeaderboard({
  title = "Innovation Leaderboard",
  subtitle = "Climb the board by asking thoughtful questions, posting useful replies, and supporting quality threads.",
  showKarmaDelta = false,
}: AttributionLeaderboardProps) {
  const [members, setMembers] = useState<LeaderboardMember[]>(leaderboardPreview);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const response = await fetch("/api/community/members?sortBy=karma&limit=10");
        if (!response.ok) return;
        const data = await response.json();
        if (!data.success || !Array.isArray(data.members)) return;

        const mapped = data.members.map((member: Record<string, unknown>) => ({
          id: String(member.id ?? ""),
          name: String(member.name ?? "Anonymous"),
          karma: Number(member.karma) || 0,
          level: String(member.level ?? "Novice"),
          contributions: Number(member.contributions) || 0,
        }));
        if (mapped.length > 0) {
          setMembers(mapped);
        }
      } catch {
        // Keep preview data as fallback for non-community surfaces.
      }
    };

    void loadLeaderboard();
  }, []);

  const topKarma = useMemo(() => (members.length > 0 ? members[0].karma : 0), [members]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 rounded-2xl p-8 md:p-12 mb-16">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-amber-400" />
        <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
      </div>
      
      <p className="text-center text-white/80 mb-8 max-w-2xl mx-auto">
        {subtitle}
      </p>

      <div className="space-y-4 max-w-md mx-auto">
        {members.slice(0, 5).map((user, index) => (
          <Card
            key={user.id}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                    {index === 0 ? <Crown className="w-5 h-5" /> : index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-semibold">{user.name}</span>
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        {user.level}
                      </Badge>
                    </div>
                    <p className="text-white/80 text-sm">{user.contributions} contributions • {user.karma} karma</p>
                    {showKarmaDelta ? (
                      <p className="text-xs text-amber-300">
                        Next level pace: +{Math.max(10, Math.round((topKarma - user.karma) / 5) || 10)} karma target
                      </p>
                    ) : null}
                  </div>
                </div>
                {index <= 2 && (
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-white/80 text-sm mb-4">
          Stay active this week and move up the board
        </p>
        <div className="flex items-center justify-center gap-2 text-amber-400">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-semibold">Your contribution quality matters</span>
        </div>
      </div>
    </div>
  );
}
