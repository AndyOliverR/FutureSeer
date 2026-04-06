"use client"

import React, { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Eye, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout"
import {
  signInWithGoogle,
  signInWithApple,
  signUpWithEmail,
  waitForAuthenticatedSession,
  getAuthErrorMessage,
  getFirebaseAuth,
  isReturningUser,
  isUserDismissedAuthError,
  isUnauthorizedDomainAuthError,
  isAuthRedirectInitiatedError,
} from "@/lib/firebase"
import { CountrySelector } from "@/components/CountrySelector"
import { OAuthProviderButtons } from "@/components/auth/OAuthProviderButtons"
import { isAppleSignInEnabledClient } from "@/lib/authFeatureFlags"
import { useErrorLogger } from "@/hooks/useErrorLogger"
import { analytics } from "@/lib/analytics"
import {
  getStoredCampaignAttribution,
  hasCampaignSignal,
  markSignupFunnelFromCampaignTracked,
  wasSignupFunnelFromCampaignTracked,
} from "@/lib/campaignAttribution"
import { getSafeAuthRedirectAfterSignIn } from "@/lib/safeAuthRedirect"
import { RecaptchaScript } from "@/components/RecaptchaScript"
import { RECAPTCHA_ACTIONS } from "@/lib/recaptcha/actions"
import { ensureRecaptchaVerifiedForWebAuth } from "@/lib/recaptchaClient"

type SignupFlowCompleteData = {
  selectedPlan: 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper';
  paymentMethodId: string;
  autoMandateAccepted: boolean;
  subscriptionId?: string;
};

const SignupFlow = dynamic(() => import("@/components/SignupFlow").then(mod => ({ default: mod.SignupFlow })), {
  loading: () => (
    <div className="py-12 text-center">
      <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-amber-400" />
      <p className="text-surface-on-variant font-medium uppercase tracking-widest text-xs">Preparing your path...</p>
    </div>
  )
})

function SignUpPageContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [activeProvider, setActiveProvider] = useState<"google" | "apple" | null>(null)
  const [showSignupFlow, setShowSignupFlow] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const isMobileLayout = useIsMobileLayout()
  const [confirmAge16, setConfirmAge16] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams?.get('plan') as 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper' | null
  const refParam = searchParams?.get('ref')
  const redirectTo = getSafeAuthRedirectAfterSignIn(searchParams?.get("redirect") ?? null)
  const { user } = useAuth()
  const { logError } = useErrorLogger({ area: "auth" })
  
  const didAutoRedirectRef = React.useRef(false)
  const showApple = isAppleSignInEnabledClient()

  useEffect(() => {
    if (refParam) setReferralCode(refParam)
  }, [refParam])

  useEffect(() => {
    if (wasSignupFunnelFromCampaignTracked()) return
    if (!hasCampaignSignal(getStoredCampaignAttribution())) return
    analytics.trackSignupStartedFromCampaign("signup_page")
    markSignupFunnelFromCampaignTracked()
  }, [])

  // After Google redirect (or if already signed in), redirect away immediately.
  // Use full page replace so we don't rely on client router after OAuth redirect.
  useEffect(() => {
    if (!user) return
    setError((prev) => (prev ? null : prev))
    if (didAutoRedirectRef.current) return
    didAutoRedirectRef.current = true
    const destination = redirectTo ?? (isReturningUser(user) ? "/tools" : "/profile")
    if (typeof window !== "undefined") {
      window.location.replace(destination)
    } else {
      router.replace(destination)
    }
  }, [user, router, redirectTo])

  // Show redirecting state as soon as user is set
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-surface-on-variant font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    if (isLoading || activeProvider === 'google') return;
    if (!confirmAge16) {
      setError("You must confirm you are at least 16 years old to use FutureSeer");
      return;
    }
    setIsLoading(true); setError(null); setActiveProvider('google')
    try {
      const user = await signInWithGoogle()
      const returning = isReturningUser(user)
      router.push(redirectTo ?? (returning ? "/tools" : "/profile"))
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      if (isAuthRedirectInitiatedError(error)) return;
      if (isUserDismissedAuthError(err)) {
        const resolvedSession = await waitForAuthenticatedSession(1200)
        if (resolvedSession) {
          await logError("signup_dismissed_recovered", "Popup dismissed but session resolved", "info", {
            provider: "google",
            code: err.code ?? null,
          })
          return
        }
      }
      const msg = getAuthErrorMessage(err)
      setError(msg)
      if (isUserDismissedAuthError(err)) {
        await logError("signup_google_dismissed", msg, "info", {
          provider: "google",
          code: err.code ?? null,
        })
      } else if (isUnauthorizedDomainAuthError(err)) {
        await logError("signup_google_unauthorized_domain", msg, "warning", {
          provider: "google",
          code: err.code ?? null,
          hostname: typeof window !== "undefined" ? window.location.hostname : null,
        })
      } else {
        await logError("signup_google", msg, "error", { provider: "google", code: err.code ?? null })
      }
    } finally {
      setIsLoading(false); setActiveProvider(null)
    }
  }

  const handleAppleSignIn = async () => {
    if (isLoading || activeProvider === "apple") return;
    if (!confirmAge16) {
      setError("You must confirm you are at least 16 years old to use FutureSeer");
      return;
    }
    setIsLoading(true); setError(null); setActiveProvider("apple")
    try {
      const user = await signInWithApple()
      const returning = isReturningUser(user)
      router.push(redirectTo ?? (returning ? "/tools" : "/profile"))
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      if (isAuthRedirectInitiatedError(error)) return;
      if (isUserDismissedAuthError(err)) {
        const resolvedSession = await waitForAuthenticatedSession(1200)
        if (resolvedSession) {
          await logError("signup_dismissed_recovered", "Popup dismissed but session resolved", "info", {
            provider: "apple",
            code: err.code ?? null,
          })
          return
        }
      }
      const msg = getAuthErrorMessage(err)
      setError(msg)
      if (isUserDismissedAuthError(err)) {
        await logError("signup_apple_dismissed", msg, "info", {
          provider: "apple",
          code: err.code ?? null,
        })
      } else if (isUnauthorizedDomainAuthError(err)) {
        await logError("signup_apple_unauthorized_domain", msg, "warning", {
          provider: "apple",
          code: err.code ?? null,
          hostname: typeof window !== "undefined" ? window.location.hostname : null,
        })
      } else {
        await logError("signup_apple", msg, "error", { provider: "apple", code: err.code ?? null })
      }
    } finally {
      setIsLoading(false); setActiveProvider(null)
    }
  }

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !confirmPassword || !displayName || !selectedCountry) {
      setError("Please fill in all fields")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }
    if (!confirmAge16) {
      setError("You must confirm you are at least 16 years old to use FutureSeer")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      setShowSignupFlow(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setError(msg)
      await logError("signup_next_step", msg, "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupFlowComplete = async (data: SignupFlowCompleteData) => {
    setIsLoading(true); setError(null)
    try {
      await ensureRecaptchaVerifiedForWebAuth(isMobileLayout, RECAPTCHA_ACTIONS.SIGNUP, logError)
      await signUpWithEmail(email, password, displayName, selectedCountry, data.selectedPlan, data.paymentMethodId, data.autoMandateAccepted, data.subscriptionId, referralCode || undefined)
      router.push("/profile")
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      const msg = getAuthErrorMessage(err)
      setError(msg)
      let authDomain: string | null = null
      try {
        const a = getFirebaseAuth()
        const d = a?.config?.authDomain
        authDomain = typeof d === "string" ? d : null
      } catch {
        /* ignore */
      }
      await logError("signup_email", typeof err.message === "string" ? err.message : msg, "error", {
        selectedPlan: data.selectedPlan,
        code: err.code ?? null,
        authDomain,
      })
      throw error
    } finally {
      setIsLoading(false)
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

        <motion.div
          className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">✨</div>
            <h1 className="text-3xl font-heading font-bold text-amber-400 mb-2 tracking-widest uppercase">New Journey</h1>
            <p className="text-surface-on-variant text-sm font-medium opacity-70 uppercase tracking-widest leading-none">
              {showSignupFlow ? "Securing your spot" : "Join the innovation experiment"}
            </p>
          </div>

          <div className="w-full bg-surface-container-high rounded-[32px] p-6 sm:p-8 border border-outline-variant shadow-2xl overflow-hidden glass-effect">
            {!showSignupFlow && (
              <>
                <label className="flex items-start gap-3 cursor-pointer text-surface-on-variant text-sm mb-6">
                  <Checkbox checked={confirmAge16} onCheckedChange={(c) => setConfirmAge16(c === true)} className="mt-0.5 border-outline-variant rounded" />
                  <span>
                    I confirm I am at least 16 years old and agree to the{" "}
                    <Link href="/terms" className="text-amber-400 underline">Terms</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-amber-400 underline">Privacy Policy</Link>.
                  </span>
                </label>
                <OAuthProviderButtons
                  variant="mobile"
                  onGoogle={handleGoogleSignIn}
                  onApple={handleAppleSignIn}
                  disabled={isLoading}
                  activeProvider={activeProvider}
                  showApple={showApple}
                  requireAgeOk
                  ageOk={confirmAge16}
                  googleLabel="Continue with Google"
                  appleLabel="Continue with Apple"
                />
                <div className="relative my-8 text-center"><span className="bg-surface-container-high px-4 text-xs uppercase tracking-widest text-surface-on-variant font-bold opacity-50">or email</span></div>
              </>
            )}

            {error && <Alert className="mb-6 bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl"><AlertDescription className="font-bold text-center">{error}</AlertDescription></Alert>}

            {showSignupFlow ? (
              <SignupFlow email={email} password={password} displayName={displayName} selectedCountry={selectedCountry} initialPlan={planParam || undefined} onComplete={handleSignupFlowComplete} onError={setError} />
            ) : (
              <form onSubmit={handleBasicInfoSubmit} className="space-y-5">
                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Full Name" autoComplete="name" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4" />
                <CountrySelector value={selectedCountry} onChange={setSelectedCountry} autoDetect={true} />
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email Address" autoComplete="email" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4" />
                <div className="relative">
                  <Input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Create Password" autoComplete="new-password" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4 w-full" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-on-variant"><Eye className="w-5 h-5" /></button>
                </div>
                <div className="relative">
                  <Input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type={showConfirmPassword ? "text" : "password"} placeholder="Repeat Password" autoComplete="new-password" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4 w-full" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-on-variant"><Eye className="w-5 h-5" /></button>
                </div>
                <Button type="submit" disabled={isLoading || !confirmAge16} size="xl" className="w-full bg-amber-500 text-slate-900 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? <Loader2 className="animate-spin" /> : "Next Step"}
                </Button>
              </form>
            )}
            <div className="mt-8 text-center pt-6 border-t border-outline-variant/30">
              <p className="text-surface-on-variant text-sm font-medium">Already signed up? <Link href="/signin" className="text-amber-400 font-bold hover:underline ml-1">Sign In</Link></p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // WEB VERSION: when in signup flow use single column so tier/payment has full width; quote moves below
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-transparent">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-[1000px] grid bg-slate-900/80 backdrop-blur-3xl rounded-[40px] border border-amber-500/20 overflow-hidden shadow-2xl glass-effect ${showSignupFlow ? "grid-cols-1 max-w-4xl" : "grid-cols-1 md:grid-cols-2"}`}
      >
        <div className="p-12 flex flex-col justify-center space-y-8">
          <Link href="/" className="text-amber-400 flex items-center gap-2 font-heading tracking-widest uppercase text-sm mb-4 opacity-60 hover:opacity-100"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
          {!showSignupFlow && (
            <h1 className="text-5xl font-heading font-light text-amber-400 leading-tight gold-glow uppercase tracking-widest">Start Your <br/>Journey.</h1>
          )}

          {error && <Alert className="bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl"><AlertDescription className="font-bold">{error}</AlertDescription></Alert>}

          {showSignupFlow ? (
            <>
              <h1 className="text-3xl font-heading font-light text-amber-400 leading-tight gold-glow uppercase tracking-widest">Start Your Journey</h1>
              <SignupFlow email={email} password={password} displayName={displayName} selectedCountry={selectedCountry} initialPlan={planParam || undefined} onComplete={handleSignupFlowComplete} onError={setError} />
            </>
          ) : (
            <div className="space-y-6">
              <label className="flex items-start gap-3 cursor-pointer text-white/90 text-sm font-light pb-2 border-b border-white/10">
                <Checkbox checked={confirmAge16} onCheckedChange={(c) => setConfirmAge16(c === true)} className="mt-0.5 border-amber-500/40 rounded data-[state=checked]:bg-amber-500/20 shrink-0" />
                <span>
                  I confirm I am at least 16 years old and agree to the{" "}
                  <Link href="/terms" className="text-amber-400 underline hover:text-amber-300">Terms</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-amber-400 underline hover:text-amber-300">Privacy Policy</Link>.
                </span>
              </label>
              <OAuthProviderButtons
                variant="web"
                onGoogle={handleGoogleSignIn}
                onApple={handleAppleSignIn}
                disabled={isLoading}
                activeProvider={activeProvider}
                showApple={showApple}
                requireAgeOk
                ageOk={confirmAge16}
                googleLabel="Continue with Google"
                appleLabel="Continue with Apple"
              />
              <div className="relative text-center">
                <span className="bg-slate-900/80 px-4 text-xs uppercase tracking-widest text-amber-200/80 font-bold">or register with email</span>
              </div>
              <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display Name" autoComplete="name" className="h-16 bg-white/5 border-white/10 rounded-2xl focus:border-amber-500 transition-all font-light" />
              <CountrySelector value={selectedCountry} onChange={setSelectedCountry} autoDetect={true} />
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email Address" autoComplete="email" className="h-16 bg-white/5 border-white/10 rounded-2xl focus:border-amber-500 transition-all font-light" />
              <Input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Password" autoComplete="new-password" className="h-16 bg-white/5 border-white/10 rounded-2xl focus:border-amber-500 transition-all font-light" />
              <Input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" autoComplete="new-password" className="h-16 bg-white/5 border-white/10 rounded-2xl focus:border-amber-500 transition-all font-light" />
              <Button type="submit" disabled={isLoading || !confirmAge16} size="2xl" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-xl shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? <Loader2 className="animate-spin" /> : "Begin Transformation"}
              </Button>
            </form>
            </div>
          )}
          <div className="pt-6 mt-2 border-t border-white/5 text-center">
            <p className="text-amber-200/80 text-sm font-light">Already have an account? <Link href="/signin" className="text-amber-400 font-bold hover:underline ml-1">Sign In</Link></p>
          </div>
        </div>
        {!showSignupFlow && (
          <div className="hidden md:block bg-glassy-deep relative min-h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-transparent to-transparent opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center p-12 text-center bg-black/20">
              <p className="text-2xl font-heading font-light italic text-amber-200/80 leading-relaxed tracking-widest">&quot;Knowledge is power, but cosmic insight is wisdom.&quot;</p>
            </div>
          </div>
        )}
      </motion.div>
      {showSignupFlow && (
        <p className="w-full max-w-4xl mt-4 text-center text-amber-200/60 font-heading font-light italic text-sm tracking-widest" aria-hidden="true">&quot;Knowledge is power, but cosmic insight is wisdom.&quot;</p>
      )}
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="animate-spin text-amber-400" /></div>}>
      <>
        <RecaptchaScript />
        <SignUpPageContent />
      </>
    </Suspense>
  )
}
