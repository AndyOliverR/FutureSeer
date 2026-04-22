"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Variant = "m3" | "devotionist"

type ProfileNextStepsBannerProps = {
  variant: Variant
  isConsultantWorkspace: boolean
  className?: string
}

/**
 * Top-of-profile checklist for users who have not yet generated their mystical profile.
 */
export function ProfileNextStepsBanner({
  variant,
  isConsultantWorkspace,
  className,
}: ProfileNextStepsBannerProps) {
  const isM3 = variant === "m3"

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 space-y-3",
        isM3
          ? "border-primary/40 bg-primary-container/30 text-on-surface"
          : "border-amber-500/40 bg-amber-500/10 text-amber-100",
        className
      )}
      role="region"
      aria-label="Profile setup next steps"
    >
      <p className={cn("text-sm font-bold uppercase tracking-widest", isM3 ? "text-primary" : "text-amber-400")}>
        {isConsultantWorkspace ? "Finish this client setup" : "Finish your cosmic setup"}
      </p>
      <p className={cn("text-sm leading-relaxed", isM3 ? "text-surface-on-variant" : "text-amber-200/90")}>
        {isConsultantWorkspace
          ? "Work through the steps in order once, then generate the full mystical profile for this client."
          : "Work through the steps in order once, then generate your mystical profile. That unlocks every tool and your unified readings."}
      </p>
      <ol
        className={cn(
          "list-decimal pl-5 text-sm space-y-1.5",
          isM3 ? "text-on-surface" : "text-amber-100/90"
        )}
      >
        <li>Fill in your profile details (tap Edit if needed) and save.</li>
        <li>Required to generate now: birth date and birth place.</li>
        <li>Optional: add face and palm photos; adjust The Seer headline setting.</li>
        <li>Optional: copy your referral code to share later.</li>
        <li>Tap Generate Mystical Profile — it runs all systems and may take a couple of minutes.</li>
      </ol>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          asChild
          type="button"
          size="sm"
          variant="outline"
          className={
            isM3
              ? "border-outline-variant text-on-surface"
              : "border-amber-500/50 text-amber-200 hover:bg-amber-500/10"
          }
        >
          <a href="#profile-personal-data">Jump to birth details</a>
        </Button>
        <Button
          asChild
          type="button"
          size="sm"
          className={
            isM3
              ? "bg-primary text-primary-foreground"
              : "bg-amber-500 text-slate-900 hover:bg-amber-400"
          }
        >
          <a href="#profile-generate-mystical">Jump to generate</a>
        </Button>
      </div>
    </div>
  )
}
