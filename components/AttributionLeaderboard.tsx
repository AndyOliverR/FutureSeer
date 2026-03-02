"use client";

import { Trophy, Crown, Star, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AttributionLeaderboard() {
  // Mock leaderboard data for preview
  const leaderboardPreview = [
    { rank: 1, name: "Power User", contributions: 127, badge: "Grandmaster" },
    { rank: 2, name: "Early Adopter", contributions: 98, badge: "Master" },
    { rank: 3, name: "Innovator", contributions: 76, badge: "Adept" },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 rounded-2xl p-8 md:p-12 mb-16">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-amber-400" />
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Innovation <span className="text-amber-400">Leaderboard</span>
        </h2>
      </div>
      
      <p className="text-center text-white/80 mb-8 max-w-2xl mx-auto">
        Your contributions are recognized and celebrated. Every usage, feedback, and suggestion helps build FutureSeer for everyone.
      </p>

      {/* Leaderboard Preview */}
      <div className="space-y-4 max-w-md mx-auto">
        {leaderboardPreview.map((user) => (
          <Card
            key={user.rank}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                    {user.rank === 1 ? <Crown className="w-5 h-5" /> : user.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-semibold">{user.name}</span>
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        {user.badge}
                      </Badge>
                    </div>
                    <p className="text-white/80 text-sm">{user.contributions} contributions</p>
                  </div>
                </div>
                {user.rank <= 3 && (
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-white/80 text-sm mb-4">
          Join the experiment and see your name on the leaderboard
        </p>
        <div className="flex items-center justify-center gap-2 text-amber-400">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-semibold">Your impact matters</span>
        </div>
      </div>
    </div>
  );
}
