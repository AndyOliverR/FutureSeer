"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import MainSeerChatInterface from "@/components/MainSeerChatInterface";
import { hasRequiredProfileSetup, PROFILE_SETUP_PATH } from "@/lib/authRouting";

export default function AskTheSeerPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user && userProfile != null && !hasRequiredProfileSetup(userProfile)) {
      router.replace(PROFILE_SETUP_PATH);
    }
  }, [authLoading, user, userProfile, router]);

  if (authLoading || !user) {
    return null;
  }
  if (userProfile != null && !hasRequiredProfileSetup(userProfile)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070d2d] via-[#0b1230] to-[#050914] text-white flex flex-col relative">
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
