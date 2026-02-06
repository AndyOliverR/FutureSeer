"use client";

import { useRouter } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { TipJarForm } from "@/components/TipJarForm";
import { Button } from "@/components/ui/button";

export function TipJarPageContent() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const countryCode = userProfile?.country ?? "IN";

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30 rounded-lg"
          aria-label="Close"
        >
          <X className="w-4 h-4 mr-1" />
          Close
        </Button>
      </div>
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
