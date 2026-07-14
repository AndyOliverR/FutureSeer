/**
 * PERFORMANCE ARCHITECTURE — Single source for platform / design-system DOM attributes.
 * Used by PlatformClassProvider (resize) and DesignSystemSync (auth-aware design system).
 * Inline boot script in app/layout.tsx sets platform class only for first-paint FOUC guard.
 */
import {
  getClientPlatformSnapshot,
  getDesignSystem,
  getIsMacOS,
  type DesignSystem,
} from "@/lib/platformDetection";

export type ApplyPlatformOptions = {
  isNativePlatform?: boolean;
  signedInWithApple?: boolean;
};

export function applyPlatformClassToDocument(options?: ApplyPlatformOptions): void {
  if (typeof document === "undefined") return;

  const snapshot = getClientPlatformSnapshot({
    isNativePlatform: options?.isNativePlatform,
  });
  const cls = snapshot.platformClass;
  document.body.classList.remove("platform-android", "platform-web");
  document.body.classList.add(cls);
  document.documentElement.setAttribute("data-platform", snapshot.dataPlatform);
  document.documentElement.setAttribute("data-mobile-os", snapshot.mobileOS);
}

export function applyDesignSystemToDocument(options?: ApplyPlatformOptions): DesignSystem {
  if (typeof document === "undefined") return "devotionist";

  const snapshot = getClientPlatformSnapshot({
    isNativePlatform: options?.isNativePlatform,
  });
  const mobileOS =
    snapshot.mobileOS === "ios"
      ? ("ios" as const)
      : snapshot.mobileOS === "android"
        ? ("android" as const)
        : null;

  const designSystem = getDesignSystem({
    isMobile: snapshot.isMobile,
    mobileOS,
    isMacOS: getIsMacOS(),
    signedInWithApple: options?.signedInWithApple ?? false,
  });

  document.documentElement.setAttribute("data-design-system", designSystem);
  document.documentElement.setAttribute(
    "data-apple-id",
    options?.signedInWithApple ? "true" : "false"
  );

  const body = document.body;
  body.classList.remove("k-ios", "k-material");
  if (designSystem === "konsta-ios") {
    body.classList.add("k-ios");
  } else if (designSystem === "material") {
    body.classList.add("k-material");
  }

  return designSystem;
}

export function applyFullPlatformSnapshot(options?: ApplyPlatformOptions): void {
  applyPlatformClassToDocument(options);
  applyDesignSystemToDocument(options);
}
