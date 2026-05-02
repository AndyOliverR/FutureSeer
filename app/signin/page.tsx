"use client"

import React, { useState, Suspense, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useOnboardingStallRecovery } from "@/hooks/useOnboardingStallRecovery"
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout"
import {
  signInWithGoogle,
  signInWithApple,
  signInWithEmail,
  recoverOAuthSessionAfterPopupDismiss,
  getAuthErrorMessage,
  isReturningUser,
  resetPassword,
  isUserDismissedAuthError,
  isBenignAuthUserInputError,
  isUnauthorizedDomainAuthError,
  isAuthRedirectInitiatedError,
  AUTH_DISMISS_RECOVERY_WINDOW_MS,
} from "@/lib/firebase"
import { OAuthProviderButtons } from "@/components/auth/OAuthProviderButtons"
import { isAppleSignInEnabledClient } from "@/lib/authFeatureFlags"
import { useErrorLogger } from "@/hooks/useErrorLogger"
import {
  trackAuthAttemptDeferred,
  trackAuthOutcomeDeferred,
  trackSignupStartedFromCampaignDeferred,
} from "@/lib/deferredAnalytics"
import {
  getStoredCampaignAttribution,
  hasCampaignSignal,
  markSigninFunnelFromCampaignTracked,
  wasSigninFunnelFromCampaignTracked,
} from "@/lib/campaignAttribution"
import { getSafeAuthRedirectAfterSignIn } from "@/lib/safeAuthRedirect"
import { getPostAuthDestination } from "@/lib/authRouting"
import { getClientOAuthGuardrailReportDeferred } from "@/lib/deferredOAuthGuardrails"
import { RecaptchaScript } from "@/components/RecaptchaScript"
import { RECAPTCHA_ACTIONS } from "@/lib/recaptcha/actions"
import { ensureRecaptchaVerifiedForWebAuth } from "@/lib/recaptchaClient"

const OnboardingStuckBanner = dynamic(
  () =>
    import("@/components/onboarding/OnboardingStuckBanner").then((mod) => ({
      default: mod.OnboardingStuckBanner,
    })),
  { loading: () => null }
)

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [activeProvider, setActiveProvider] = useState<"google" | "apple" | null>(null)
  const [dismissAuthInfo, setDismissAuthInfo] = useState(false)
  const showApple = isAppleSignInEnabledClient()
  const isMobileLayout = useIsMobileLayout()
  const didAutoRedirectRef = React.useRef(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = getSafeAuthRedirectAfterSignIn(searchParams?.get("redirect") ?? null)
  const { user, signOut } = useAuth()
  const { logError } = useErrorLogger({ area: "auth" })
  const { logError: logOnboarding } = useErrorLogger({ area: "onboarding" })
  const redirectStall = useOnboardingStallRecovery(!!user, {
    surface: "signin_redirect",
    logOnboarding: logOnboarding,
    funnelNewUser: user ? !isReturningUser(user) : null,
  })
  const authCaptchaMode = React.useMemo(() => {
    const explicit = process.env.NEXT_PUBLIC_AUTH_CAPTCHA_MODE
    if (explicit === "adaptive" || explicit === "enforce") return explicit
    if (typeof window === "undefined") return "enforce"
    const host = window.location.hostname
    const isLocal = host === "localhost" || host === "127.0.0.1"
    return isLocal ? "enforce" : "adaptive"
  }, [])

  const isLikelyOAuthDomainMismatch = (code?: string) =>
    code === "auth/unauthorized-domain" ||
    code === "auth/invalid-continue-uri" ||
    code === "auth/invalid-dynamic-link-domain"

  const extractCaptchaMeta = (err: {
    code?: string
    stage?: string
    status?: number
    reason?: string
    preflight?: Record<string, unknown>
  }) => ({
    ...(typeof err.stage === "string" ? { captchaStage: err.stage } : {}),
    ...(typeof err.status === "number" ? { httpStatus: err.status } : {}),
    ...(typeof err.reason === "string" ? { captchaReason: err.reason } : {}),
    ...(err.preflight && typeof err.preflight === "object" ? { captchaPreflight: err.preflight } : {}),
  })

  useEffect(() => {
    void logError("view_loaded", "Sign-in screen loaded", "info", {
      isMobileLayout,
      hasRedirect: !!redirectTo,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (wasSigninFunnelFromCampaignTracked()) return
    if (!hasCampaignSignal(getStoredCampaignAttribution())) return
    trackSignupStartedFromCampaignDeferred("signin_page")
    markSigninFunnelFromCampaignTracked()
  }, [])

  // After Google redirect (or if already signed in), redirect away from signin immediately.
  // Use full page replace so we don't rely on client router after OAuth redirect.
  useEffect(() => {
    if (!user) return;
    setError((prev) => (prev ? null : prev))
    setDismissAuthInfo(false)
    if (didAutoRedirectRef.current) return;
    didAutoRedirectRef.current = true;
    const destination = getPostAuthDestination(redirectTo, isReturningUser(user))
    void logError("auth_success", "User signed in", "info", { method: "existing_session", redirectTo: destination })
    if (typeof window !== "undefined") {
      window.location.replace(destination);
    } else {
      router.replace(destination);
    }
  }, [user, redirectTo, router, logError]);

  // Show redirecting state as soon as user is set (don't wait for profile load)
  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4 pb-12">
        <div className="text-center max-w-md">
          <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-amber-200/90 font-medium">Redirecting...</p>
          <p className="text-surface-on-variant text-sm mt-2">Taking you to your profile or home.</p>
          <OnboardingStuckBanner
            stuck={redirectStall}
            variant="devotionist"
            onSignOutTryAgain={async () => {
              await signOut()
            }}
          />
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    if (isLoading || activeProvider) return
    setIsLoading(true)
    setActiveProvider("google")
    setError(null)
    setDismissAuthInfo(false)
    try {
      await logError("google_clicked", "Google sign-in clicked", "info", { hasRedirect: !!redirectTo })
      trackAuthAttemptDeferred("google", "signin", { hasRedirect: !!redirectTo })
      const user = await signInWithGoogle()
      const destination = getPostAuthDestination(redirectTo, isReturningUser(user))
      await logError("auth_success", "User signed in", "info", { method: "google", redirectTo: destination })
      trackAuthOutcomeDeferred("google", "signin", "success", { redirectTo: destination })
      router.push(destination)
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string }
      if (isAuthRedirectInitiatedError(error)) {
        trackAuthOutcomeDeferred("google", "signin", "redirect_initiated")
        return
      }
      if (isUserDismissedAuthError(err)) {
        setError(null)
        setSuccess("Completing sign-in…")
        const resolvedSession = await recoverOAuthSessionAfterPopupDismiss(AUTH_DISMISS_RECOVERY_WINDOW_MS)
        setSuccess(null)
        if (resolvedSession) {
          await logError("signin_dismissed_recovered", "Popup dismissed but session resolved", "info", {
            method: "google",
            code: err.code ?? null,
            recoveryWindowMs: AUTH_DISMISS_RECOVERY_WINDOW_MS,
          })
          trackAuthOutcomeDeferred("google", "signin", "success", { recoveredAfterDismiss: true })
          return
        }
      }
      const msg = getAuthErrorMessage(err)
      setDismissAuthInfo(isUserDismissedAuthError(err))
      setError(msg)
      if (isUserDismissedAuthError(err)) {
        trackAuthOutcomeDeferred("google", "signin", "dismissed", { code: err.code ?? null })
        await logError("signin_dismissed", msg, "info", {
          method: "google",
          code: err.code ?? null,
          recoveryWindowMs: AUTH_DISMISS_RECOVERY_WINDOW_MS,
        })
        void logOnboarding("oauth_popup_dismissed", "User dismissed Google sign-in popup", "info", {
          surface: "signin",
          code: err.code ?? null,
        })
      } else if (isUnauthorizedDomainAuthError(err)) {
        const oauthGuardrails = await getClientOAuthGuardrailReportDeferred()
        trackAuthOutcomeDeferred("google", "signin", "error", { code: err.code ?? null, reason: "unauthorized_domain" })
        await logError("auth_unauthorized_domain", msg, "warning", {
          method: "google",
          code: err.code ?? null,
          hostname: typeof window !== "undefined" ? window.location.hostname : null,
          oauthGuardrails,
        })
      } else {
        const oauthGuardrails =
          isLikelyOAuthDomainMismatch(err.code)
            ? await getClientOAuthGuardrailReportDeferred()
            : undefined
        trackAuthOutcomeDeferred("google", "signin", "error", { code: err.code ?? null })
        await logError("auth_failed", msg, "error", {
          method: "google",
          code: err.code ?? null,
          ...(oauthGuardrails ? { oauthGuardrails } : {}),
        })
      }
    } finally {
      setIsLoading(false)
      setActiveProvider(null)
    }
  }

  const handleAppleSignIn = async () => {
    if (isLoading || activeProvider) return
    setIsLoading(true)
    setActiveProvider("apple")
    setError(null)
    setDismissAuthInfo(false)
    try {
      await logError("apple_clicked", "Apple sign-in clicked", "info", { hasRedirect: !!redirectTo })
      trackAuthAttemptDeferred("apple", "signin", { hasRedirect: !!redirectTo })
      const user = await signInWithApple()
      const destination = getPostAuthDestination(redirectTo, isReturningUser(user))
      await logError("auth_success", "User signed in", "info", { method: "apple", redirectTo: destination })
      trackAuthOutcomeDeferred("apple", "signin", "success", { redirectTo: destination })
      router.push(destination)
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string }
      if (isAuthRedirectInitiatedError(error)) {
        trackAuthOutcomeDeferred("apple", "signin", "redirect_initiated")
        return
      }
      if (isUserDismissedAuthError(err)) {
        setError(null)
        setSuccess("Completing sign-in…")
        const resolvedSession = await recoverOAuthSessionAfterPopupDismiss(AUTH_DISMISS_RECOVERY_WINDOW_MS)
        setSuccess(null)
        if (resolvedSession) {
          await logError("signin_dismissed_recovered", "Popup dismissed but session resolved", "info", {
            method: "apple",
            code: err.code ?? null,
            recoveryWindowMs: AUTH_DISMISS_RECOVERY_WINDOW_MS,
          })
          trackAuthOutcomeDeferred("apple", "signin", "success", { recoveredAfterDismiss: true })
          return
        }
      }
      const msg = getAuthErrorMessage(err)
      setDismissAuthInfo(isUserDismissedAuthError(err))
      setError(msg)
      if (isUserDismissedAuthError(err)) {
        trackAuthOutcomeDeferred("apple", "signin", "dismissed", { code: err.code ?? null })
        await logError("signin_dismissed", msg, "info", {
          method: "apple",
          code: err.code ?? null,
          recoveryWindowMs: AUTH_DISMISS_RECOVERY_WINDOW_MS,
        })
        void logOnboarding("oauth_popup_dismissed", "User dismissed Apple sign-in popup", "info", {
          surface: "signin",
          code: err.code ?? null,
        })
      } else if (isUnauthorizedDomainAuthError(err)) {
        const oauthGuardrails = await getClientOAuthGuardrailReportDeferred()
        trackAuthOutcomeDeferred("apple", "signin", "error", { code: err.code ?? null, reason: "unauthorized_domain" })
        await logError("auth_unauthorized_domain", msg, "warning", {
          method: "apple",
          code: err.code ?? null,
          hostname: typeof window !== "undefined" ? window.location.hostname : null,
          oauthGuardrails,
        })
      } else {
        const oauthGuardrails =
          isLikelyOAuthDomainMismatch(err.code)
            ? await getClientOAuthGuardrailReportDeferred()
            : undefined
        trackAuthOutcomeDeferred("apple", "signin", "error", { code: err.code ?? null })
        await logError("auth_failed", msg, "error", {
          method: "apple",
          code: err.code ?? null,
          ...(oauthGuardrails ? { oauthGuardrails } : {}),
        })
      }
    } finally {
      setIsLoading(false)
      setActiveProvider(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(null); setSuccess(null); setDismissAuthInfo(false)

    try {
      await logError("email_submit_clicked", "Email sign-in submitted", "info", { hasRedirect: !!redirectTo })
      trackAuthAttemptDeferred("email", "signin", { hasRedirect: !!redirectTo })
      try {
        await ensureRecaptchaVerifiedForWebAuth(isMobileLayout, RECAPTCHA_ACTIONS.LOGIN, logError)
      } catch (captchaError: unknown) {
        const ce = captchaError as {
          code?: string
          stage?: string
          status?: number
          reason?: string
          preflight?: Record<string, unknown>
        }
        if (ce?.code === "fs/captcha-missing-script") {
          // One short retry for slow-network script readiness races.
          await new Promise((resolve) => setTimeout(resolve, 900))
          try {
            await ensureRecaptchaVerifiedForWebAuth(isMobileLayout, RECAPTCHA_ACTIONS.LOGIN, logError)
          } catch (retryError: unknown) {
            const re = retryError as {
              code?: string
              stage?: string
              status?: number
              reason?: string
              preflight?: Record<string, unknown>
            }
            if (authCaptchaMode === "adaptive" && re?.code === "fs/captcha-missing-script") {
              await logError("captcha_adaptive_bypass_used", "Captcha unavailable; adaptive bypass used", "warning", {
                mode: authCaptchaMode,
                reason: "script_unavailable_after_retry",
                ...extractCaptchaMeta(re),
              })
            } else {
              throw retryError
            }
          }
        } else {
          throw captchaError
        }
      }
      const user = await signInWithEmail(email, password)
      const destination = getPostAuthDestination(redirectTo, isReturningUser(user))
      await logError("auth_success", "User signed in", "info", { method: "email", redirectTo: destination })
      trackAuthOutcomeDeferred("email", "signin", "success", { redirectTo: destination })
      router.push(destination)
    } catch (error: unknown) {
      const err = error as {
        code?: string
        stage?: string
        status?: number
        reason?: string
        preflight?: Record<string, unknown>
      };
      const msg = getAuthErrorMessage(err)
      setDismissAuthInfo(false)
      setError(msg)
      const captchaMeta = extractCaptchaMeta(err)
      if (isBenignAuthUserInputError(err)) {
        trackAuthOutcomeDeferred("email", "signin", "error", { code: err.code ?? null, expectedUserInputError: true })
        await logError("auth_failed", msg, "warning", {
          method: "email",
          code: err.code ?? null,
          expectedUserInputError: true,
          ...captchaMeta,
        })
      } else {
        const oauthGuardrails =
          isLikelyOAuthDomainMismatch(err.code)
            ? await getClientOAuthGuardrailReportDeferred()
            : undefined
        trackAuthOutcomeDeferred("email", "signin", "error", { code: err.code ?? null })
        await logError("auth_failed", msg, "error", {
          method: "email",
          code: err.code ?? null,
          ...captchaMeta,
          ...(oauthGuardrails ? { oauthGuardrails } : {}),
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    const trimmed = (email || "").trim()
    setError(null); setSuccess(null); setDismissAuthInfo(false)
    if (!trimmed) {
      setError("Enter your email above, then tap “Forgot password?”")
      return
    }
    setIsResetting(true)
    try {
      await logError("reset_password_clicked", "Password reset clicked", "info")
      await resetPassword(trimmed)
      setSuccess("Password reset email sent. Check your inbox (and spam).")
      await logError("reset_password_sent", "Password reset email sent", "info")
    } catch (e: unknown) {
      const err = e as { code?: string };
      const msg = getAuthErrorMessage(e)
      setError(msg)
      await logError("reset_password_failed", msg, "error", { code: err.code ?? null })
    } finally {
      setIsResetting(false)
    }
  }

  // Mobile layout (Material 3: small screen or native)
  if (isMobileLayout) {
    return (
      <div className="min-h-screen bg-surface flex flex-col pt-[env(safe-area-inset-top)] pb-10 px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-amber-400 py-4 active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Back</span>
        </Link>
        <motion.div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="text-5xl mb-4 drop-shadow-lg">🔮</div>
            <h1 className="text-3xl font-heading font-bold text-amber-400 mb-2 tracking-widest uppercase">Welcome Back</h1>
            <p className="text-surface-on-variant text-sm font-medium opacity-70 uppercase tracking-widest leading-none">The cosmos awaits your return</p>
          </div>
          <div className="w-full bg-surface-container-high rounded-[32px] p-6 border border-outline-variant shadow-2xl overflow-hidden glass-effect">
            {error && (
              <Alert
                className={
                  dismissAuthInfo
                    ? "mb-4 rounded-2xl border-amber-500/40 bg-amber-500/10 text-amber-100"
                    : "mb-4 rounded-2xl bg-red-500/10 border-red-500/20 text-red-300"
                }
              >
                <AlertDescription className="text-sm font-medium leading-relaxed">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 rounded-2xl bg-green-500/10 border-green-500/20 text-green-200">
                <AlertDescription className="text-sm font-medium">{success}</AlertDescription>
              </Alert>
            )}
            <OAuthProviderButtons
              variant="mobile"
              onGoogle={handleGoogleSignIn}
              onApple={handleAppleSignIn}
              disabled={isLoading}
              activeProvider={activeProvider}
              showApple={showApple}
              googleLabel="Sign in with Google"
              appleLabel="Sign in with Apple"
            />
            <div className="relative my-8 text-center"><span className="bg-surface-container-high px-4 text-xs uppercase tracking-widest text-surface-on-variant font-bold opacity-50">or email</span></div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email Address" autoComplete="email" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4" />
              <div className="relative">
                <Input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Password" autoComplete="current-password" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4 w-full" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-on-variant active:text-amber-400"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" aria-hidden /> : <Eye className="w-5 h-5" aria-hidden />}
                </button>
              </div>
              <Button type="submit" disabled={isLoading} size="xl" className="w-full bg-amber-500 text-slate-900 shadow-lg active:scale-[0.98] transition-all">
                Sign In
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-surface-on-variant/80">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-amber-400 underline">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-amber-400 underline">Privacy Policy</Link>.
            </p>
          </div>
          <div className="mt-8 text-center pt-6 border-t border-outline-variant/30">
            <p className="text-surface-on-variant text-sm font-medium">New to FutureSeer? <Link href="/signup" className="text-amber-400 font-bold hover:underline ml-1">Join the Experiment</Link></p>
          </div>
        </motion.div>
      </div>
    )
  }

  // WEB VERSION (Original Design) - Deep blue + golden yellow (devotionist)
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-surface-container-high/90 backdrop-blur-3xl rounded-[40px] border border-outline-variant overflow-hidden shadow-2xl glass-effect">
        <div className="p-12 flex flex-col justify-center space-y-8">
          <Link href="/" className="text-amber-400 flex items-center gap-2 font-heading tracking-widest uppercase text-sm mb-4 opacity-60 hover:opacity-100"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
          <h1 className="text-5xl font-heading font-light text-amber-400 leading-tight gold-glow uppercase tracking-widest">Welcome Back, <br/>Seeker.</h1>

          {error && (
            <Alert
              className={
                dismissAuthInfo
                  ? "rounded-2xl border-amber-500/40 bg-amber-500/10 text-amber-100"
                  : "bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl"
              }
            >
              <AlertDescription className={dismissAuthInfo ? "text-sm font-medium leading-relaxed" : "font-bold"}>
                {error}
              </AlertDescription>
            </Alert>
          )}
          {success && <Alert className="bg-green-500/10 border-green-500/20 text-green-300 rounded-2xl"><AlertDescription className="font-bold">{success}</AlertDescription></Alert>}

          <OAuthProviderButtons
            variant="web"
            onGoogle={handleGoogleSignIn}
            onApple={handleAppleSignIn}
            disabled={isLoading}
            activeProvider={activeProvider}
            showApple={showApple}
            googleLabel="Sign in with Google"
            appleLabel="Sign in with Apple"
          />
          <div className="relative text-center"><span className="bg-transparent px-4 text-xs uppercase tracking-widest text-amber-200/80 font-bold">or email</span></div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email Address" autoComplete="email" className="h-16 bg-surface-container-low border-outline-variant rounded-2xl focus:border-amber-500 transition-all font-light" />
            <div className="relative">
              <Input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                className="h-16 bg-surface-container-low border-outline-variant rounded-2xl focus:border-amber-500 transition-all font-light pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-200/70 hover:text-amber-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="w-5 h-5" aria-hidden /> : <Eye className="w-5 h-5" aria-hidden />}
              </button>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isResetting || isLoading}
              className="text-left text-sm text-amber-200/80 hover:text-amber-300 underline underline-offset-4"
            >
              {isResetting ? "Sending reset email…" : "Forgot password?"}
            </button>
            <Button type="submit" disabled={isLoading} size="2xl" className="w-full bg-amber-500 hover:bg-amber-400 text-primary-foreground transition-all shadow-xl shadow-amber-500/10">
              Continue Journey
            </Button>
          </form>
          <p className="text-center text-xs text-amber-200/70">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-amber-400 underline hover:text-amber-300">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-amber-400 underline hover:text-amber-300">Privacy Policy</Link>.
          </p>
          <div className="text-center pt-4 border-t border-outline-variant/30">
            <p className="text-amber-200/80 text-sm font-light">New Seeker? <Link href="/signup" className="text-amber-400 font-bold hover:underline ml-1">Create Account</Link></p>
          </div>
        </div>
        <div className="hidden md:block bg-glassy-deep relative min-h-full">
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-transparent to-transparent opacity-40" />
          <div className="absolute inset-0 flex items-center justify-center p-12 text-center bg-black/20">
            <p className="text-2xl font-heading font-light italic text-amber-200/80 leading-relaxed tracking-widest">&ldquo;The stars only reveal what the heart is ready to hear.&rdquo;</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="animate-spin text-amber-400" /></div>}>
      <>
        <RecaptchaScript />
        <SignInContent />
      </>
    </Suspense>
  )
}
