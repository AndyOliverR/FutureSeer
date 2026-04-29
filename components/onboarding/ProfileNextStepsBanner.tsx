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
          : "Work through the steps in order once, then run Generate Full Report to unlock your first cross-tool mystical profile."}
      </p>
      <ol
        className={cn(
          "list-decimal pl-5 text-sm space-y-1.5",
          isM3 ? "text-on-surface" : "text-amber-100/90"
        )}
      >
        <li>Step 1: Add display name, full name, and gender.</li>
        <li>Step 2: Add birth date, birth place, and birth time (or mark birth time unknown).</li>
        <li>Step 3: Add current residence.</li>
        <li>Step 4: Upload both face and palm photos.</li>
        <li>Tap Generate Full Report once all required fields are complete.</li>
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
          <a href="#profile-personal-data">Jump to required steps</a>
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
