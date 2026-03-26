"use client"

import React, { useState, Suspense, useEffect } from "react"
import { devLog } from '@/lib/devLogger'
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout"
import { signInWithGoogle, signInWithEmail, getAuthErrorMessage, isReturningUser, resetPassword } from "@/lib/firebase"
import { RecaptchaScript } from "@/components/RecaptchaScript"
import { useErrorLogger } from "@/hooks/useErrorLogger"

// Declare grecaptcha for TypeScript (enterprise API)
declare global {
  interface Window {
    grecaptcha?: {
      enterprise: {
        ready: (cb: () => void | Promise<void>) => void;
        execute: (siteKey: string, opts: { action: string }) => Promise<string>;
      };
    };
  }
}

function getSafeRedirect(redirect: string | null): string | null {
  if (!redirect || typeof redirect !== "string") return null
  const trimmed = redirect.trim()
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed
  return null
}

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const isMobileLayout = useIsMobileLayout()
  const didAutoRedirectRef = React.useRef(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = getSafeRedirect(searchParams?.get("redirect") ?? null)
  const { user } = useAuth()
  const { logError } = useErrorLogger({ area: "auth" })

  const RECAPTCHA_SITE_KEY = "6Ld_vmMsAAAAAJzl7DmmVomD3G3BLkovwM0AB8Fz";

  useEffect(() => {
    void logError("view_loaded", "Sign-in screen loaded", "info", {
      isMobileLayout,
      hasRedirect: !!redirectTo,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // After Google redirect (or if already signed in), redirect away from signin immediately.
  // Use full page replace so we don't rely on client router after OAuth redirect.
  useEffect(() => {
    if (!user) return;
    if (didAutoRedirectRef.current) return;
    didAutoRedirectRef.current = true;
    const destination = redirectTo ?? (isReturningUser(user) ? "/tools" : "/profile");
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
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-amber-200/90 font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true); setError(null)
    try {
      await logError("google_clicked", "Google sign-in clicked", "info", { hasRedirect: !!redirectTo })
      const user = await signInWithGoogle()
      const destination = redirectTo ?? (isReturningUser(user) ? "/tools" : "/profile")
      await logError("auth_success", "User signed in", "info", { method: "google", redirectTo: destination })
      router.push(destination)
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      if (!err.message?.includes('Redirect initiated')) {
        const msg = getAuthErrorMessage(err)
        setError(msg)
        await logError("auth_failed", msg, "error", {
          method: "google",
          code: err.code ?? null,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(null); setSuccess(null)

    try {
      await logError("email_submit_clicked", "Email sign-in submitted", "info", { hasRedirect: !!redirectTo })
      let captchaToken = null;
      const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      // Skip reCAPTCHA on localhost (not in reCAPTCHA allowed domains); only run on web, not Android
      if (!isMobileLayout && !isLocalhost && typeof window !== 'undefined') {
        await logError("captcha_started", "Captcha check started", "info")
        const grecaptcha = window.grecaptcha;
        if (!grecaptcha) {
          devLog.warn('reCAPTCHA script not loaded, proceeding without verification', 'signin');
          await logError("captcha_missing_script", "Captcha script missing", "info")
        } else {
          captchaToken = await new Promise((resolve) => {
            grecaptcha.enterprise.ready(async () => {
              try {
                const token = await grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, {action: 'LOGIN'});
                resolve(token);
              } catch (err: unknown) {
                devLog.error('reCAPTCHA execution failed:', err, 'signin');
                void logError("captcha_failed", "Captcha execution failed", "info", {
                  message: err instanceof Error ? err.message : null,
                })
                resolve(null);
              }
            });
          });
        }

        // Verify the token with our backend
        if (captchaToken) {
          const verifyRes = await fetch('/api/auth/verify-captcha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: captchaToken, action: 'LOGIN' }),
          });

          if (!verifyRes.ok) {
            const verifyData = await verifyRes.json();
            await logError("captcha_failed", "Captcha verification failed", "info", { status: verifyRes.status })
            throw new Error(verifyData.error || 'Security check failed. Please try again.');
          }
          await logError("captcha_verified", "Captcha verified", "info")
        }
      }

      const user = await signInWithEmail(email, password)
      const destination = redirectTo ?? (isReturningUser(user) ? "/tools" : "/profile")
      await logError("auth_success", "User signed in", "info", { method: "email", redirectTo: destination })
      router.push(destination)
    } catch (error: unknown) {
      const err = error as { code?: string };
      const msg = getAuthErrorMessage(err)
      setError(msg)
      await logError("auth_failed", msg, "error", {
        method: "email",
        code: err.code ?? null,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    const trimmed = (email || "").trim()
    setError(null); setSuccess(null)
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
            <Button type="button" size="xl" onClick={handleGoogleSignIn} disabled={isLoading} className="w-full gap-3 bg-white text-slate-900 shadow-lg active:scale-[0.98] transition-all">
              <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign in with Google
            </Button>
            <div className="relative my-8 text-center"><span className="bg-surface-container-high px-4 text-xs uppercase tracking-widest text-surface-on-variant font-bold opacity-50">or email</span></div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email Address" autoComplete="email" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4" />
              <div className="relative">
                <Input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Password" autoComplete="current-password" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4 w-full" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-on-variant active:text-amber-400"><Eye className="w-5 h-5" /></button>
              </div>
              <Button type="submit" disabled={isLoading} size="xl" className="w-full bg-amber-500 text-slate-900 shadow-lg active:scale-[0.98] transition-all">Sign In</Button>
            </form>
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
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-[#020617]/80 backdrop-blur-3xl rounded-[40px] border border-amber-500/20 overflow-hidden shadow-2xl glass-effect">
        <div className="p-12 flex flex-col justify-center space-y-8">
          <Link href="/" className="text-amber-400 flex items-center gap-2 font-heading tracking-widest uppercase text-sm mb-4 opacity-60 hover:opacity-100"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
          <h1 className="text-5xl font-heading font-light text-amber-400 leading-tight gold-glow uppercase tracking-widest">Welcome Back, <br/>Seeker.</h1>

          {error && <Alert className="bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl"><AlertDescription className="font-bold">{error}</AlertDescription></Alert>}
          {success && <Alert className="bg-green-500/10 border-green-500/20 text-green-300 rounded-2xl"><AlertDescription className="font-bold">{success}</AlertDescription></Alert>}

          <Button onClick={handleGoogleSignIn} disabled={isLoading} type="button" size="2xl" className="w-full gap-3 bg-white hover:bg-white/90 text-[#020617] shadow-lg">
            <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in with Google
          </Button>
          <div className="relative text-center"><span className="bg-transparent px-4 text-xs uppercase tracking-widest text-amber-200/80 font-bold">or email</span></div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email Address" autoComplete="email" className="h-16 bg-white/5 border-white/10 rounded-2xl focus:border-amber-500 transition-all font-light" />
            <div className="relative">
              <Input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                className="h-16 bg-white/5 border-white/10 rounded-2xl focus:border-amber-500 transition-all font-light pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-200/70 hover:text-amber-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Eye className="w-5 h-5" />
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
            <Button type="submit" disabled={isLoading} size="2xl" className="w-full bg-amber-500 hover:bg-amber-400 text-[#020617] transition-all shadow-xl shadow-amber-500/10">Continue Journey</Button>
          </form>
          <div className="text-center pt-4 border-t border-white/5">
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
    <>
      <RecaptchaScript />
      <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="animate-spin text-amber-400" /></div>}>
        <SignInContent />
      </Suspense>
    </>
  )
}
