"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CommunityPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/community/attribution");
  }, [router]);

  return (
    <div className="starfield-ultra-sharp min-h-screen flex items-center justify-center">
      <p className="text-amber-400/80 text-sm">Redirecting to community...</p>
    </div>
  );
}
