"use client"

import React, { Suspense, useState, useEffect } from "react"
import { devLog } from '@/lib/devLogger';
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles, User } from "lucide-react"
import { signInWithGoogle, signUpWithEmail, getAuthErrorMessage, isReturningUser } from "@/lib/firebase"
import { CountrySelector } from "@/components/CountrySelector"

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
  const [activeProvider, setActiveProvider] = useState<string | null>(null)
  const [showSignupFlow, setShowSignupFlow] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [isAndroid, setIsAndroid] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams?.get('plan') as 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper' | null
  const refParam = searchParams?.get('ref')
  
  const RECAPTCHA_SITE_KEY = "REDACTED_RECAPTCHA_SITE_KEY";

  useEffect(() => {
    setIsAndroid(/Android/i.test(navigator.userAgent));
    if (refParam) setReferralCode(refParam)
  }, [refParam])

  const handleGoogleSignIn = async () => {
    if (isLoading || activeProvider === 'google') return;
    setIsLoading(true); setError(null); setActiveProvider('google')
    try {
      const user = await signInWithGoogle()
      const returning = isReturningUser(user)
      router.push(returning ? "/tools" : "/profile-setup")
    } catch (error: any) {
      if (error.message?.includes('Redirect initiated')) return;
      setError(getAuthErrorMessage(error))
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

    setIsLoading(true)
    setError(null)

    try {
      let captchaToken = null;

      // Only execute reCAPTCHA on the web platform
      if (!isAndroid && typeof window !== 'undefined') {
        if (!(window as any).grecaptcha) {
          devLog.warn('reCAPTCHA script not loaded, proceeding without verification', 'signup');
        } else {
          captchaToken = await new Promise((resolve) => {
            (window as any).grecaptcha.enterprise.ready(async () => {
              try {
                const token = await (window as any).grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, {action: 'SIGNUP'});
                resolve(token);
              } catch (err) {
                devLog.error('reCAPTCHA signup execution failed:', err, 'signup');
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
            body: JSON.stringify({ token: captchaToken, action: 'SIGNUP' }),
          });

          if (!verifyRes.ok) {
            const verifyData = await verifyRes.json();
            throw new Error(verifyData.error || 'Security check failed. Please try again.');
          }
        }
      }

      // If captcha passes or we're on mobile, proceed to next step
      setShowSignupFlow(true)
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during security check.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupFlowComplete = async (data: any) => {
    setIsLoading(true); setError(null)
    try {
      await signUpWithEmail(email, password, displayName, selectedCountry, data.selectedPlan, data.paymentMethodId, data.autoMandateAccepted, data.subscriptionId, referralCode || undefined)
      router.push("/profile-setup")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // ANDROID VERSION
  if (isAndroid) {
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
                <Button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full h-14 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all">
                  <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </Button>
                <div className="relative my-8 text-center"><span className="bg-surface-container-high px-4 text-xs uppercase tracking-widest text-surface-on-variant font-bold opacity-50">or email</span></div>
              </>
            )}

            {error && <Alert className="mb-6 bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl"><AlertDescription className="font-bold text-center">{error}</AlertDescription></Alert>}

            {showSignupFlow ? (
              <SignupFlow email={email} password={password} displayName={displayName} selectedCountry={selectedCountry} initialPlan={planParam || undefined} onComplete={handleSignupFlowComplete} onError={setError} />
            ) : (
              <form onSubmit={handleBasicInfoSubmit} className="space-y-5">
                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Full Name" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4" />
                <CountrySelector value={selectedCountry} onChange={setSelectedCountry} autoDetect={true} />
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email Address" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4" />
                <div className="relative">
                  <Input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Create Password" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4 w-full" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-on-variant"><Eye className="w-5 h-5" /></button>
                </div>
                <div className="relative">
                  <Input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type={showConfirmPassword ? "text" : "password"} placeholder="Repeat Password" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4 w-full" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-on-variant"><Eye className="w-5 h-5" /></button>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-14 bg-amber-500 text-slate-900 rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all">
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

  // WEB VERSION
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-slate-900/80 backdrop-blur-3xl rounded-[40px] border border-amber-500/20 overflow-hidden shadow-2xl glass-effect">
        <div className="p-12 flex flex-col justify-center space-y-8">
          <Link href="/" className="text-amber-400 flex items-center gap-2 font-heading tracking-widest uppercase text-sm mb-4 opacity-60 hover:opacity-100"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
          <h1 className="text-5xl font-heading font-light text-amber-400 leading-tight gold-glow uppercase tracking-widest">Start Your <br/>Journey.</h1>

          {error && <Alert className="bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl"><AlertDescription className="font-bold">{error}</AlertDescription></Alert>}

          {showSignupFlow ? (
            <SignupFlow email={email} password={password} displayName={displayName} selectedCountry={selectedCountry} initialPlan={planParam || undefined} onComplete={handleSignupFlowComplete} onError={setError} />
          ) : (
            <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display Name" className="h-16 bg-white/5 border-white/10 rounded-2xl focus:border-amber-500 transition-all font-light" />
              <CountrySelector value={selectedCountry} onChange={setSelectedCountry} autoDetect={true} />
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email Address" className="h-16 bg-white/5 border-white/10 rounded-2xl focus:border-amber-500 transition-all font-light" />
              <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="h-16 bg-white/5 border-white/10 rounded-2xl focus:border-amber-500 transition-all font-light" />
              <Button type="submit" disabled={isLoading} className="w-full h-16 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xl transition-all shadow-xl shadow-amber-500/10">
                {isLoading ? <Loader2 className="animate-spin" /> : "Begin Transformation"}
              </Button>
            </form>
          )}
        </div>
        <div className="hidden md:block bg-[url('/assets/bg/starfieldn-8k.png')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center p-12 text-center bg-black/20">
            <p className="text-2xl font-heading font-light italic text-amber-200/80 leading-relaxed tracking-widest">"Knowledge is power, but cosmic insight is wisdom."</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="animate-spin text-amber-400" /></div>}>
      <SignUpPageContent />
    </Suspense>
  )
}
