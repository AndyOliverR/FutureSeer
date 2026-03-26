"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateUserProfile } from "@/lib/firebase";
import { devLog } from "@/lib/devLogger";

export function SeerNewsHeadlinesToggle({
  userId,
  enabled,
  onUpdated,
}: {
  userId: string;
  enabled: boolean;
  onUpdated: () => void;
}) {
  const [checked, setChecked] = useState(enabled);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setChecked(enabled);
  }, [enabled]);

  const onToggle = async (next: boolean) => {
    setBusy(true);
    try {
      await updateUserProfile(userId, { seerIncludeNewsHeadlines: next });
      setChecked(next);
      onUpdated();
    } catch (e) {
      devLog.error("Failed to update Seer headline preference", e, "SeerNewsHeadlinesToggle");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-500/20 bg-[#020617]/60 p-4">
      <div className="space-y-1">
        <Label htmlFor="seer-news" className="text-amber-200 font-medium">
          Headlines in The Seer
        </Label>
        <p className="text-sm text-slate-400 leading-relaxed">
          When enabled, the main Seer may receive same-day headline titles as optional world context (not predictions).
        </p>
      </div>
      <Switch
        id="seer-news"
        checked={checked}
        onCheckedChange={(v) => onToggle(v)}
        disabled={busy}
        aria-label="Include headlines in The Seer"
      />
    </div>
  );
}
