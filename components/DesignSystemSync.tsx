"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { applyDesignSystemToDocument } from "@/lib/applyPlatformToDocument";

/**
 * Syncs data-design-system and Konsta body classes (auth-aware for Apple ID → konsta-ios).
 * Platform width class is owned by PlatformClassProvider + inline boot script.
 */
export function DesignSystemSync() {
  const { user } = useAuth();

  useEffect(() => {
    const signedInWithApple = Boolean(
      user?.providerData?.some((p) => p?.providerId === "apple.com")
    );

    const apply = () => {
      applyDesignSystemToDocument({
        signedInWithApple,
      });
    };

    apply();

    const onResizeOrOrientation = () => apply();
    window.addEventListener("resize", onResizeOrOrientation);
    window.addEventListener("orientationchange", onResizeOrOrientation);

    return () => {
      window.removeEventListener("resize", onResizeOrOrientation);
      window.removeEventListener("orientationchange", onResizeOrOrientation);
    };
  }, [user]);

  return null;
}
