"use client"

import React, { useState, Suspense, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Eye, ArrowLeft, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { signInWithGoogle, signInWithEmail, getAuthErrorMessage, isReturningUser } from "@/lib/firebase"

// Declare grecaptcha for TypeScript
declare global {
  interface Window {
    grecaptcha: any;
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
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isAndroid, setIsAndroid] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = getSafeRedirect(searchParams?.get("redirect") ?? null)

  const RECAPTCHA_SITE_KEY = "6Ld_vmMsAAAAAJzl7DmmVomD3G3BLkovwM0AB8Fz";

  useEffect(() => {
    setIsAndroid(/Android/i.test(navigator.userAgent));
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true); setError(null)
    try {
      const user = await signInWithGoogle()
      router.push(redirectTo ?? (isReturningUser(user) ? "/tools" : "/profile"))
    } catch (error: any) {
      if (!error.message?.includes('Redirect initiated')) setError(getAuthErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(null)

    try {
      let captchaToken = null;

      // Only execute reCAPTCHA on the web platform
      if (!isAndroid && typeof window !== 'undefined' && window.grecaptcha) {
        captchaToken = await new Promise((resolve) => {
          window.grecaptcha.enterprise.ready(async () => {
            try {
              const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, {action: 'LOGIN'});
              resolve(token);
            } catch (err) {
              console.error('reCAPTCHA execution failed:', err);
              resolve(null);
            }
          });
        });

        // Verify the token with our backend
        if (captchaToken) {
          const verifyRes = await fetch('/api/auth/verify-captcha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: captchaToken, action: 'LOGIN' }),
          });

          if (!verifyRes.ok) {
            const verifyData = await verifyRes.json();
            throw new Error(verifyData.error || 'Security check failed. Please try again.');
          }
        }
      }

      await signInWithEmail(email, password)
      router.push(redirectTo ?? "/tools")
    } catch (error: any) {
      setError(error?.message || 'Sign-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  // ANDROID VERSION (Material 3)
  if (isAndroid) {
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
            <Button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full h-14 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all">
              <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign in with Google
            </Button>
            <div className="relative my-8 text-center"><span className="bg-surface-container-high px-4 text-xs uppercase tracking-widest text-surface-on-variant font-bold opacity-50">or email</span></div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email Address" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4" />
              <div className="relative">
                <Input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Password" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4 w-full" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-on-variant active:text-amber-400"><Eye className="w-5 h-5" /></button>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-14 bg-amber-500 text-slate-900 rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all">Sign In</Button>
            </form>
          </div>
        </motion.div>
      </div>
    )
  }

  // WEB VERSION (Original Design)
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-slate-900/80 backdrop-blur-3xl rounded-[40px] border border-amber-500/20 overflow-hidden shadow-2xl glass-effect">
        <div className="p-12 flex flex-col justify-center space-y-8">
          <Link href="/" className="text-amber-400 flex items-center gap-2 font-heading tracking-widest uppercase text-sm mb-4 opacity-60 hover:opacity-100"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
          <h1 className="text-5xl font-heading font-light text-amber-400 leading-tight gold-glow uppercase tracking-widest">Welcome Back, <br/>Seeker.</h1>

          {error && <Alert className="bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl"><AlertDescription className="font-bold">{error}</AlertDescription></Alert>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email Address" className="h-16 bg-white/5 border-white/10 rounded-2xl focus:border-amber-500 transition-all font-light" />
            <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="h-16 bg-white/5 border-white/10 rounded-2xl focus:border-amber-500 transition-all font-light" />
            <Button type="submit" className="w-full h-16 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xl transition-all shadow-xl shadow-amber-500/10">Continue Journey</Button>
          </form>
          <div className="text-center pt-4 border-t border-white/5">
            <p className="text-slate-400 text-sm font-light">New Seeker? <Link href="/signup" className="text-amber-400 font-bold hover:underline ml-1">Create Account</Link></p>
          </div>
        </div>
        <div className="hidden md:block bg-[url('/assets/bg/starfieldn-8k.png')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center p-12 text-center bg-black/20">
            <p className="text-2xl font-heading font-light italic text-amber-200/80 leading-relaxed tracking-widest">"The stars only reveal what the heart is ready to hear."</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="animate-spin text-amber-400" /></div>}>
      <SignInContent />
    </Suspense>
  )
}
