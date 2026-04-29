"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardData } from "@/hooks/useDashboardData";
import MainSeerChatInterface from "@/components/MainSeerChatInterface";
import { SeqEaseMicroSurvey } from "@/components/metrics/SeqEaseMicroSurvey";
import {
  getReturningPaymentCommitDestination,
  hasRequiredGenerationProfileSetup,
  hasRequiredProfileSetup,
  NEW_USER_ONBOARDING_DESTINATION,
  PROFILE_SETUP_PATH,
} from "@/lib/authRouting";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import { analytics } from "@/lib/analytics";

export default function AskTheSeerPage() {
  const { user, userProfile, loading: authLoading, isSuperadmin, isAdmin, requiresReturningPaymentCommit } = useAuth();
  const { streakDays, retentionSnapshot } = useDashboardData();
  const router = useRouter();
  const isMobileLayout = useIsMobileLayout();
  const layout = isMobileLayout ? "mobile" : "web";
  const gateTrackedRef = useRef(false);
  const bypassTrackedRef = useRef(false);
  const needsFirstGenerationSetup =
    Boolean(userProfile) &&
    !Boolean(userProfile?.mysticalProfileGenerated) &&
    !hasRequiredGenerationProfileSetup(userProfile);

  useEffect(() => {
    if (
      !authLoading &&
      user &&
      userProfile != null &&
      !hasRequiredProfileSetup(userProfile) &&
      !isSuperadmin &&
      !isAdmin
    ) {
      router.replace(PROFILE_SETUP_PATH);
    }
  }, [authLoading, user, userProfile, router, isSuperadmin, isAdmin]);

  useEffect(() => {
    if (
      !authLoading &&
      user &&
      needsFirstGenerationSetup &&
      !isSuperadmin &&
      !isAdmin
    ) {
      router.replace(NEW_USER_ONBOARDING_DESTINATION);
    }
  }, [authLoading, user, needsFirstGenerationSetup, router, isSuperadmin, isAdmin]);

  useEffect(() => {
    if (!authLoading && user && requiresReturningPaymentCommit && !isSuperadmin && !isAdmin) {
      if (!gateTrackedRef.current) {
        analytics.trackReturnGateViewed({ surface: "ask_seer_route", destination: "/subscribe" });
        gateTrackedRef.current = true;
      }
      const attempted =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/ask-the-seer";
      router.replace(getReturningPaymentCommitDestination(attempted));
    }
  }, [authLoading, user, requiresReturningPaymentCommit, router, isSuperadmin, isAdmin]);

  useEffect(() => {
    if (!authLoading && user && !requiresReturningPaymentCommit && !isSuperadmin && !isAdmin && !bypassTrackedRef.current) {
      analytics.trackReturnGateBypassedActiveSubscriber({ surface: "ask_seer_route" });
      bypassTrackedRef.current = true;
    }
  }, [authLoading, user, requiresReturningPaymentCommit, isSuperadmin, isAdmin]);

  useEffect(() => {
    if (!user?.uid || authLoading) return;
    if (retentionSnapshot.nudgeStage === "reactivation") return;
    const dayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `futureseer:habit_loop_completed:${user.uid}:${dayKey}`;
    if (typeof window !== "undefined" && window.localStorage.getItem(storageKey) === "1") return;
    analytics.trackHabitLoopCompleted({
      surface: "ask_seer_route",
      nudge_stage: retentionSnapshot.nudgeStage,
      streak_days: retentionSnapshot.currentStreak,
    });
    if (typeof window !== "undefined") window.localStorage.setItem(storageKey, "1");
  }, [user?.uid, authLoading, retentionSnapshot.nudgeStage, retentionSnapshot.currentStreak]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070d2d] via-[#0b1230] to-[#050914] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-amber-500/30 rounded-full animate-spin border-t-amber-400" />
          <p className="text-amber-400/70 text-sm animate-pulse">Connecting to the Seer...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070d2d] via-[#0b1230] to-[#050914] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-amber-400 text-lg font-serif">Please sign in to consult the Seer</p>
          <Link href="/signin" className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-bold rounded-xl">Sign In</Link>
        </div>
      </div>
    );
  }
  if (userProfile != null && !hasRequiredProfileSetup(userProfile) && !isSuperadmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070d2d] via-[#0b1230] to-[#050914] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-amber-400 text-lg font-serif">Complete your profile to consult the Seer</p>
          <a href={PROFILE_SETUP_PATH} className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-bold rounded-xl">Complete Profile</a>
        </div>
      </div>
    );
  }
  if (needsFirstGenerationSetup && !isSuperadmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070d2d] via-[#0b1230] to-[#050914] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-amber-400 text-lg font-serif">Finish your profile steps to consult the Seer</p>
          <a
            href={NEW_USER_ONBOARDING_DESTINATION}
            className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-bold rounded-xl"
          >
            Continue Setup
          </a>
        </div>
      </div>
    );
  }
  if (user && requiresReturningPaymentCommit && !isSuperadmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#070d2d] via-[#0b1230] to-[#050914] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-amber-400 text-lg font-serif">Redirecting you to complete your plan commitment…</p>
        </div>
      </div>
    );
  }

  return (
    <div data-onboarding="ask-seer" className="min-h-screen bg-gradient-to-b from-[#070d2d] via-[#0b1230] to-[#050914] text-white flex flex-col relative">
      <SeqEaseMicroSurvey userId={user?.uid ?? null} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 30%, rgba(90, 60, 160, 0.25), transparent 60%)",
        }}
      />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative">
        <div className="w-full max-w-2xl h-[85vh] min-h-[50vh]">
          <MainSeerChatInterface
            userId={user?.uid}
            layout={layout}
            streakDays={streakDays}
            userProfile={
              userProfile
                ? {
                    birthDate: userProfile.birthDate,
                    birthTime: userProfile.birthTime,
                    birthPlace: userProfile.birthPlace,
                  }
                : null
            }
          />
        </div>
      </main>
    </div>
  );
}
