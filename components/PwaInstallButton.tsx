"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import {
  isIosDevice,
  isStandaloneDisplay,
  shouldShowPwaInstallUi,
  type BeforeInstallPromptEvent,
  type PwaInstallMode,
} from "@/lib/pwaInstall";
import { cn } from "@/lib/utils";

type PwaInstallButtonProps = {
  placement?: "hero" | "settings" | "footer";
};

type PwaInstallSnapshot = {
  mode: PwaInstallMode;
  prompt: BeforeInstallPromptEvent | null;
  standalone: boolean;
};

const SERVER_SNAPSHOT: PwaInstallSnapshot = { mode: "hidden", prompt: null, standalone: false };

let capturedPrompt: BeforeInstallPromptEvent | null = null;
let snapshot: PwaInstallSnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();
let windowBound = false;

function readStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const matchMediaStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const navigatorStandalone = Boolean(
    (window.navigator as Navigator & { standalone?: boolean }).standalone,
  );
  return isStandaloneDisplay({ matchMediaStandalone, navigatorStandalone });
}

function computeMode(hasInstallPrompt: boolean): PwaInstallMode {
  if (typeof window === "undefined") return "hidden";
  return shouldShowPwaInstallUi({
    isNativePlatform: false,
    isStandalone: readStandalone(),
    isIosDevice: isIosDevice(window.navigator.userAgent, window.navigator.maxTouchPoints ?? 0),
    hasInstallPrompt,
  });
}

function emit() {
  const next: PwaInstallSnapshot = {
    mode: computeMode(Boolean(capturedPrompt)),
    prompt: capturedPrompt,
    standalone: readStandalone(),
  };
  if (
    next.mode === snapshot.mode &&
    next.prompt === snapshot.prompt &&
    next.standalone === snapshot.standalone
  ) {
    return;
  }
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function ensureWindowListeners() {
  if (windowBound || typeof window === "undefined") return;
  windowBound = true;

  const onBeforeInstallPrompt = (event: Event) => {
    event.preventDefault();
    capturedPrompt = event as BeforeInstallPromptEvent;
    emit();
  };
  const onAppInstalled = () => {
    capturedPrompt = null;
    emit();
  };

  window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
  window.addEventListener("appinstalled", onAppInstalled);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureWindowListeners();
  queueMicrotask(emit);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): PwaInstallSnapshot {
  return snapshot;
}

function getServerSnapshot(): PwaInstallSnapshot {
  return SERVER_SNAPSHOT;
}

export function PwaInstallButton({ placement = "hero" }: PwaInstallButtonProps) {
  const isMobileLayout = useIsMobileLayout();
  const { mode, prompt, standalone } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleInstall = useCallback(async () => {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice.catch(() => undefined);
    capturedPrompt = null;
    emit();
  }, [prompt]);

  const iosHelpId = `pwa-ios-install-help-${placement}`;
  const guideHelpId = `pwa-guide-install-help-${placement}`;

  if (standalone) return null;
  if (mode === "hidden" && placement !== "footer") return null;

  const effectiveMode = mode === "hidden" ? "guide" : mode;

  const chromeButtonClass = isMobileLayout
    ? cn(
        "w-full sm:w-auto rounded-xl border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-high)]",
        "text-[var(--m3-on-surface)] font-semibold tracking-normal",
        placement === "hero" && "px-8 py-6",
      )
    : cn(
        "w-full sm:w-auto rounded-full border border-white/25 bg-transparent",
        "text-white/90 font-light uppercase tracking-[0.2em]",
        placement === "hero" && "px-8 md:px-10 py-6 md:py-7",
      );

  const chromeButton = (
    <Button
      type="button"
      variant="outline"
      size={placement === "hero" ? "lg" : "default"}
      className={chromeButtonClass}
      onClick={() => {
        void handleInstall();
      }}
    >
      <Download className="w-4 h-4" aria-hidden />
      Install app
    </Button>
  );

  const iosBlock = (
    <IosInstallInstructions
      buttonClass={chromeButtonClass}
      isMobileLayout={isMobileLayout}
      placement={placement}
      helpId={iosHelpId}
    />
  );

  const guideBlock = (
    <IosInstallInstructions
      buttonClass={chromeButtonClass}
      isMobileLayout={isMobileLayout}
      placement={placement}
      helpId={guideHelpId}
      label="Install app"
      helpText="Tap Install to add FutureSeer to your device. On Android Chrome or desktop Chrome/Edge, use the Install prompt. On iPhone or iPad, tap Share, then Add to Home Screen."
    />
  );

  const body =
    effectiveMode === "chrome" ? chromeButton : effectiveMode === "ios" ? iosBlock : guideBlock;

  if (placement === "settings") {
    return (
      <section
        className={cn(
          "mb-6 rounded-2xl p-4",
          isMobileLayout
            ? "bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline-variant)] shadow-sm"
            : "bg-transparent border border-white/20",
        )}
        aria-label="Install FutureSeer"
      >
        <h2
          className={cn(
            "mb-1",
            isMobileLayout
              ? "text-[var(--m3-on-surface)] font-sans text-base font-medium tracking-normal"
              : "text-white/90 font-serif text-lg tracking-wide",
          )}
        >
          Install FutureSeer
        </h2>
        <p
          className={cn(
            "mb-3 text-sm",
            isMobileLayout ? "text-[var(--m3-on-surface-variant)]" : "text-white/70",
          )}
        >
          Add the app to your home screen. Same site, no App Store required.
        </p>
        {body}
      </section>
    );
  }

  return body;
}

function IosInstallInstructions({
  buttonClass,
  isMobileLayout,
  placement,
  helpId,
  label = "Add to Home Screen",
  helpText = "Tap Share, then Add to Home Screen. Apple does not allow a one-tap install on iPhone or iPad.",
}: {
  buttonClass: string;
  isMobileLayout: boolean;
  placement: "hero" | "settings" | "footer";
  helpId: string;
  label?: string;
  helpText?: string;
}) {
  return (
    <details className="flex flex-col items-stretch sm:items-start gap-2 w-full sm:w-auto">
      <summary
        className={cn(
          "list-none cursor-pointer inline-flex w-full sm:w-auto [&::-webkit-details-marker]:hidden",
        )}
      >
        <span
          className={cn(
            buttonClass,
            "inline-flex items-center justify-center gap-2",
            placement === "hero" ? "min-h-[52px] px-8" : "min-h-[44px] px-6 text-sm",
          )}
        >
          <Download className="w-4 h-4" aria-hidden />
          {label}
        </span>
      </summary>
      <p
        id={helpId}
        className={cn(
          "text-xs max-w-md mt-2",
          placement === "footer" ? "text-left" : "text-center",
          isMobileLayout ? "text-[var(--m3-on-surface-variant)]" : "text-white/70",
        )}
      >
        {helpText}
      </p>
    </details>
  );
}
