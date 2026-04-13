"use client"

import { Heart } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SubscriptionStatus } from "@/components/SubscriptionStatus"
import { ReferralCodeCard } from "@/components/ReferralCodeCard"
import type { User } from "firebase/auth"
import type { UserProfile } from "@/lib/firebase"

export type ProfilePlanId = "power-user-trial" | "buy-coffee" | "treat-me" | "festive-hamper"

export type ProfilePlanPaymentSectionProps = {
  variant: "m3" | "devotionist"
  userProfile: UserProfile | null
  user: User | null
  selectedPlanForProfile: ProfilePlanId
  onPlanChange: (plan: ProfilePlanId) => void
  onVerifyPayment: () => void
  onDeferredTrial: () => void
  isSavingPaymentChoice: boolean
  /** When true, "Start free trial" is the primary (solid) CTA and appears first in reading order. */
  deferTrialPrimaryCta: boolean
  showReferralInline: boolean
  onSubscriptionRefresh: () => void
  /** When referral is shown separately, use a clearer card title. */
  cardTitle?: string
}

export function ProfilePlanPaymentSection({
  variant,
  userProfile,
  user,
  selectedPlanForProfile,
  onPlanChange,
  onVerifyPayment,
  onDeferredTrial,
  isSavingPaymentChoice,
  deferTrialPrimaryCta,
  showReferralInline,
  onSubscriptionRefresh,
  cardTitle = "Plan & Referral",
}: ProfilePlanPaymentSectionProps) {
  const isM3 = variant === "m3"

  const shellClass = isM3
    ? "bg-surface-container-high rounded-3xl p-5 border border-outline-variant shadow-lg"
    : "bg-[#020617]/80 backdrop-blur-xl rounded-3xl p-6 border border-amber-500/20 shadow-xl"

  const titleClass = isM3
    ? "font-bold text-white uppercase text-sm tracking-widest"
    : "font-bold text-amber-400 uppercase text-sm tracking-widest"

  const iconWrap = isM3 ? "p-2 bg-primary-container rounded-xl" : "p-2 bg-amber-500/20 rounded-xl"
  const iconColor = isM3 ? "text-primary-on-container" : "text-amber-400"

  const borderDivider = isM3 ? "border-t border-outline-variant" : "border-t border-amber-400/20"

  const helperClass = isM3 ? "text-sm text-amber-100/90 leading-snug" : "text-sm text-amber-100/90 leading-snug"

  const selectClass = isM3
    ? "h-11 w-full rounded-xl border-2 border-amber-500/50 bg-slate-950 px-3 text-amber-50 shadow-inner shadow-black/20 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
    : "h-11 w-full rounded-xl border-2 border-amber-500/50 bg-slate-950 px-3 text-amber-50 shadow-inner shadow-black/20 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"

  const primaryTrial = isM3
    ? "w-full border-2 border-amber-400 bg-amber-500 text-slate-900 font-semibold hover:bg-amber-400"
    : "w-full border-2 border-amber-400 bg-amber-500 hover:bg-amber-400 text-[#020617] font-semibold"

  const secondaryVerify = isM3
    ? "w-full border-2 border-amber-500/70 bg-slate-900 text-amber-100 font-semibold hover:bg-amber-500/15 hover:border-amber-400 hover:text-amber-100"
    : "w-full border-2 border-amber-500/70 bg-slate-900 text-amber-100 font-semibold hover:bg-amber-500/15 hover:border-amber-400 hover:text-amber-100"

  const primaryVerify = isM3
    ? "w-full border-2 border-amber-400 bg-amber-500 text-slate-900 font-semibold hover:bg-amber-400"
    : "w-full border-2 border-amber-400 bg-amber-500 hover:bg-amber-400 text-[#020617] font-semibold"

  const secondaryTrial = isM3
    ? "w-full border-2 border-amber-500/70 bg-slate-900 text-amber-100 font-semibold hover:bg-amber-500/15 hover:border-amber-400 hover:text-amber-100"
    : "w-full border-2 border-amber-500/70 bg-slate-900 text-amber-100 font-semibold hover:bg-amber-500/15 hover:border-amber-400 hover:text-amber-100"

  const trialBtn = (
    <Button
      type="button"
      variant="ghost"
      onClick={onDeferredTrial}
      disabled={isSavingPaymentChoice}
      className={deferTrialPrimaryCta ? primaryTrial : secondaryTrial}
    >
      Start free trial (add card later)
    </Button>
  )

  const verifyBtn = (
    <Button
      type="button"
      variant="ghost"
      onClick={onVerifyPayment}
      disabled={isSavingPaymentChoice}
      className={deferTrialPrimaryCta ? secondaryVerify : primaryVerify}
    >
      Verify payment now
    </Button>
  )

  const paymentBody = (
    <>
      <section id="profile-payment-path" className="scroll-mt-24">
        {userProfile ? (
          <SubscriptionStatus
            userProfile={userProfile}
            onCancel={() => onSubscriptionRefresh()}
            onUpdatePaymentClick={onVerifyPayment}
          />
        ) : null}
        <div className={userProfile ? `mt-4 pt-4 space-y-3 ${borderDivider}` : "space-y-3"}>
          <p className={helperClass}>
            Choose your payment path: verify your payment method now, or continue your free trial and add a card later (free
            month still active).
          </p>
          <select
            value={selectedPlanForProfile}
            onChange={(e) => onPlanChange(e.target.value as ProfilePlanId)}
            style={{ colorScheme: "dark" }}
            className={selectClass}
          >
            <option className="bg-slate-950 text-amber-50" value="power-user-trial">
              Power User Trial
            </option>
            <option className="bg-slate-950 text-amber-50" value="buy-coffee">
              Coffee (Monthly)
            </option>
            <option className="bg-slate-950 text-amber-50" value="treat-me">
              Treat (Quarterly)
            </option>
            <option className="bg-slate-950 text-amber-50" value="festive-hamper">
              Hamper (Annual)
            </option>
          </select>
          <div className={isM3 ? "grid grid-cols-1 gap-2" : "grid grid-cols-1 sm:grid-cols-2 gap-2"}>
            {deferTrialPrimaryCta ? (
              <>
                {trialBtn}
                {verifyBtn}
              </>
            ) : (
              <>
                {verifyBtn}
                {trialBtn}
              </>
            )}
          </div>
        </div>
      </section>
      {showReferralInline && user ? (
        <div className={`mt-4 pt-4 ${borderDivider}`}>
          <ReferralCodeCard userId={user.uid} />
        </div>
      ) : null}
    </>
  )

  if (variant === "devotionist") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={shellClass}>
        <div className="flex items-center gap-3 mb-4">
          <div className={iconWrap}>
            <Heart className={`w-5 h-5 ${iconColor}`} />
          </div>
          <h2 className={titleClass}>{cardTitle}</h2>
        </div>
        {paymentBody}
      </motion.div>
    )
  }

  return (
    <div className={shellClass}>
      <div className="flex items-center gap-3 mb-4">
        <div className={iconWrap}>
          <Heart className={`w-5 h-5 ${iconColor}`} />
        </div>
        <h2 className={titleClass}>{cardTitle}</h2>
      </div>
      {paymentBody}
    </div>
  )
}
