export type PwaInstallMode = "hidden" | "chrome" | "ios";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function isStandaloneDisplay(input: {
  matchMediaStandalone: boolean;
  navigatorStandalone: boolean;
}): boolean {
  return input.matchMediaStandalone || input.navigatorStandalone;
}

/** iPhone/iPad/iPod, including iPadOS 13+ which reports as Macintosh with touch. */
export function isIosDevice(userAgent: string, maxTouchPoints = 0): boolean {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return true;
  return /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
}

export function shouldShowPwaInstallUi(input: {
  isNativePlatform: boolean;
  isStandalone: boolean;
  isIosDevice: boolean;
  hasInstallPrompt: boolean;
}): PwaInstallMode {
  if (input.isNativePlatform || input.isStandalone) return "hidden";
  if (input.hasInstallPrompt) return "chrome";
  if (input.isIosDevice) return "ios";
  return "hidden";
}
