"use client";

import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { TipJarForm } from "@/components/TipJarForm";

export function TipJarPageContent() {
  const { userProfile } = useAuth();
  const countryCode = userProfile?.country ?? "IN";

  return (
    <>
      <div className="flex flex-col items-center text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
          <Sparkles className="w-7 h-7 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-amber-400 mb-2">
          Tip Jar
        </h1>
        <p className="text-white/80 text-sm font-light">
          Show your appreciation
        </p>
      </div>
      <TipJarForm countryCode={countryCode} />
    </>
  );
}
