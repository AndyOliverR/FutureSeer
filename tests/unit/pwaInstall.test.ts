import {
  isIosDevice,
  isStandaloneDisplay,
  shouldShowPwaInstallUi,
} from "@/lib/pwaInstall"

describe("isStandaloneDisplay", () => {
  it("is true when display-mode is standalone", () => {
    expect(isStandaloneDisplay({ matchMediaStandalone: true, navigatorStandalone: false })).toBe(true)
  })

  it("is true for iOS navigator.standalone", () => {
    expect(isStandaloneDisplay({ matchMediaStandalone: false, navigatorStandalone: true })).toBe(true)
  })

  it("is false in a normal browser tab", () => {
    expect(isStandaloneDisplay({ matchMediaStandalone: false, navigatorStandalone: false })).toBe(false)
  })
})

describe("isIosDevice", () => {
  it("detects iPhone, iPad, and iPod user agents", () => {
    expect(isIosDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(true)
    expect(isIosDevice("Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)")).toBe(true)
    expect(isIosDevice("Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X)")).toBe(true)
  })

  it("detects iPadOS 13+ Macintosh + touch", () => {
    expect(isIosDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 5)).toBe(true)
  })

  it("does not treat desktop Mac or Android as iOS", () => {
    expect(isIosDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 0)).toBe(false)
    expect(isIosDevice("Mozilla/5.0 (Linux; Android 14; Pixel 8)")).toBe(false)
    expect(isIosDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0")).toBe(false)
  })
})

describe("shouldShowPwaInstallUi", () => {
  const webBrowser = {
    isNativePlatform: false,
    isStandalone: false,
    isIosDevice: false,
    hasInstallPrompt: false,
  }

  it("hides on Capacitor native shells", () => {
    expect(shouldShowPwaInstallUi({ ...webBrowser, isNativePlatform: true, hasInstallPrompt: true })).toBe("hidden")
    expect(shouldShowPwaInstallUi({ ...webBrowser, isNativePlatform: true, isIosDevice: true })).toBe("hidden")
  })

  it("hides when already installed (standalone)", () => {
    expect(shouldShowPwaInstallUi({ ...webBrowser, isStandalone: true, hasInstallPrompt: true })).toBe("hidden")
    expect(shouldShowPwaInstallUi({ ...webBrowser, isStandalone: true, isIosDevice: true })).toBe("hidden")
  })

  it("shows Chrome/Edge install when beforeinstallprompt was captured", () => {
    expect(shouldShowPwaInstallUi({ ...webBrowser, hasInstallPrompt: true })).toBe("chrome")
  })

  it("prefers Chrome install over iOS instructions when a prompt exists", () => {
    expect(
      shouldShowPwaInstallUi({
        ...webBrowser,
        isIosDevice: true,
        hasInstallPrompt: true,
      }),
    ).toBe("chrome")
  })

  it("shows iOS Add to Home Screen instructions without an install prompt", () => {
    expect(shouldShowPwaInstallUi({ ...webBrowser, isIosDevice: true })).toBe("ios")
  })

  it("hides on desktop/Android browsers that never fire beforeinstallprompt", () => {
    expect(shouldShowPwaInstallUi(webBrowser)).toBe("hidden")
  })
})
