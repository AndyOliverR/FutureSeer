"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      />
    </svg>
  );
}

export type OAuthProviderButtonsProps = {
  onGoogle: () => void | Promise<void>;
  onApple: () => void | Promise<void>;
  disabled?: boolean;
  activeProvider: "google" | "apple" | null;
  /** Age/terms gate for signup */
  requireAgeOk?: boolean;
  ageOk?: boolean;
  googleLabel?: string;
  appleLabel?: string;
  /** Devotionist (web) vs Material (mobile) */
  variant: "web" | "mobile";
  /** When false, Apple button is hidden (default until Apple Developer + Firebase are configured). */
  showApple?: boolean;
};

export function OAuthProviderButtons({
  onGoogle,
  onApple,
  disabled = false,
  activeProvider,
  requireAgeOk = false,
  ageOk = true,
  googleLabel = "Continue with Google",
  appleLabel = "Continue with Apple",
  variant,
  showApple = false,
}: OAuthProviderButtonsProps) {
  const gate = requireAgeOk && !ageOk;
  const busy = disabled || gate;
  const clickLockRef = useRef(false);

  const runWithShortClickLock = async (action: () => void | Promise<void>) => {
    if (clickLockRef.current) return;
    clickLockRef.current = true;
    try {
      await action();
    } finally {
      // Prevent rapid double taps that can trigger cancelled popup requests.
      window.setTimeout(() => {
        clickLockRef.current = false;
      }, 700);
    }
  };

  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-3 w-full">
        <Button
          type="button"
          size="xl"
          onClick={() => void runWithShortClickLock(onGoogle)}
          disabled={busy || activeProvider === "google"}
          className="w-full gap-3 bg-white text-slate-900 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-busy={activeProvider === "google"}
        >
          {activeProvider === "google" ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <GoogleGlyph className="w-6 h-6 shrink-0" />
          )}
          {googleLabel}
        </Button>
        {showApple ? (
          <Button
            type="button"
            size="xl"
            onClick={() => void runWithShortClickLock(onApple)}
            disabled={busy || activeProvider === "apple"}
            className="w-full gap-3 bg-black text-white border border-white/10 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-busy={activeProvider === "apple"}
          >
            {activeProvider === "apple" ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <AppleGlyph className="w-6 h-6 shrink-0" />
            )}
            {appleLabel}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <Button
        type="button"
        onClick={() => void runWithShortClickLock(onGoogle)}
        disabled={busy || activeProvider === "google"}
        size="2xl"
        className="w-full gap-3 bg-white hover:bg-white/90 text-[#020617] shadow-lg disabled:opacity-50"
        aria-busy={activeProvider === "google"}
      >
        {activeProvider === "google" ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <GoogleGlyph className="w-6 h-6 shrink-0" />
        )}
        {googleLabel}
      </Button>
      {showApple ? (
        <Button
          type="button"
          onClick={() => void runWithShortClickLock(onApple)}
          disabled={busy || activeProvider === "apple"}
          size="2xl"
          className="w-full gap-3 bg-black hover:bg-black/90 text-white border border-white/10 shadow-lg disabled:opacity-50"
          aria-busy={activeProvider === "apple"}
        >
          {activeProvider === "apple" ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <AppleGlyph className="w-6 h-6 shrink-0" />
          )}
          {appleLabel}
        </Button>
      ) : null}
    </div>
  );
}
