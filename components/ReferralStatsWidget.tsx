"use client";

import { Gift, Users, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ReferralStatsWidgetProps {
  referralCount?: number;
  freeMonthsRemaining?: number;
  referralCode?: string;
}

export function ReferralStatsWidget({
  referralCount = 0,
  freeMonthsRemaining = 0,
  referralCode = ''
}: ReferralStatsWidgetProps) {
  return (
    <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/30 backdrop-blur-xl hover:border-amber-500/50 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Gift className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Referral Rewards</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-4 h-4 text-amber-400" />
              <div className="text-2xl font-bold text-amber-400">{referralCount}</div>
            </div>
            <div className="text-xs text-white/60">Friends Referred</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-green-400" />
              <div className="text-2xl font-bold text-green-400">{freeMonthsRemaining}</div>
            </div>
            <div className="text-xs text-white/60">Free Months Left</div>
          </div>
        </div>

        {referralCode && (
          <div className="mb-4 p-3 bg-slate-800/50 border border-amber-500/20 rounded-lg">
            <div className="text-xs text-white/60 mb-1">Your Code</div>
            <div className="text-amber-400 font-mono text-sm">{referralCode}</div>
          </div>
        )}

        <Link href="/profile#referral">
          <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm">
            <Gift className="w-4 h-4 mr-2" />
            Share & Earn
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
