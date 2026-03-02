"use client";

import { Heart, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTipJar } from '@/components/TipJarContext';

interface TipJarCardProps {
  countryCode?: string;
}

export function TipJarCard({ countryCode = 'IN' }: TipJarCardProps) {
  const { open: openTipJar } = useTipJar();

  const features = [
    'One-time payment',
    'Any amount you choose',
    'Show appreciation',
    'Support the mission',
    'Help keep FutureSeer accessible',
    'Pure contribution'
  ];

  return (
    <Card
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300"
    >
      <div className="absolute top-4 right-4 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold z-10">
        Any Amount
      </div>

      <CardHeader className="text-center pb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mb-4 border border-amber-500/30">
          <Heart className="w-8 h-8" />
        </div>
        <CardTitle className="text-2xl font-bold text-amber-400 mb-2">
          Tip Jar
        </CardTitle>
        <p className="text-white/80 text-sm font-light">
          Show appreciation, anytime
        </p>
      </CardHeader>

      <CardContent className="text-center">
        {/* Description */}
        <div className="mb-6">
          <div className="text-xl font-semibold text-amber-400 mb-2">
            Your Choice
          </div>
          <p className="text-white/80 text-sm font-light">
            One-time contribution
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-2 mb-8 text-left text-sm text-white/80">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 font-light">
              <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          onClick={() => openTipJar()}
          className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 text-white font-semibold py-3 transition-all duration-300"
        >
          <Heart className="w-5 h-5 mr-2" />
          Send Tip
        </Button>
      </CardContent>
    </Card>
  );
}
