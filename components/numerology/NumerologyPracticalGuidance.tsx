"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Coins, Wrench, ListChecks } from "lucide-react";
import {
  NUMEROLOGY_PRACTICAL_DISCLAIMER,
  powerWordByNumber,
  wealthAttractionByNumber,
  commonBlockByNumber,
  practicalChecklistByNumber,
} from "@/lib/numerology/practicalGuides";

interface NumerologyPracticalGuidanceProps {
  anchorNumber: number | null | undefined;
  heading?: string;
}

export function NumerologyPracticalGuidance({
  anchorNumber,
  heading = "Quick guidance",
}: NumerologyPracticalGuidanceProps) {
  const powerWord = powerWordByNumber(anchorNumber);
  const wealthTips = wealthAttractionByNumber(anchorNumber);
  const block = commonBlockByNumber(anchorNumber);
  const checklist = practicalChecklistByNumber(anchorNumber);

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/60 border-amber-500/40">
        <CardHeader>
          <CardTitle className="text-amber-200 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            {heading}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-300 text-sm">{NUMEROLOGY_PRACTICAL_DISCLAIMER}</p>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-200 border border-amber-400/40">
              Weekly power word
            </Badge>
            <span className="text-amber-100 font-semibold">{powerWord}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-emerald-500/40">
        <CardHeader>
          <CardTitle className="text-emerald-200 flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-300" />
            Wealth attraction habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-slate-200 text-sm">
            {wealthTips.map((tip) => (
              <li key={tip}>- {tip}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-orange-500/40">
        <CardHeader>
          <CardTitle className="text-orange-200 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-300" />
            Common block and remedy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-slate-200">
            <span className="text-orange-200 font-semibold">Block:</span> {block.block}
          </p>
          <p className="text-slate-200">
            <span className="text-orange-200 font-semibold">Remedy:</span> {block.remedy}
          </p>
          <p className="text-slate-300">
            <span className="text-orange-200 font-semibold">Why:</span> {block.why}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-cyan-500/40">
        <CardHeader>
          <CardTitle className="text-cyan-200 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-cyan-300" />
            Action checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-slate-200 text-sm">
            {checklist.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

