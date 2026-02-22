"use client"

import React, { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { signInWithGoogle, signInWithEmail, resetPassword, getAuthErrorMessage, isReturningUser } from "@/lib/firebase"
import { devLog } from "@/lib/devLogger"

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
  const [isResetting, setIsResetting] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [activeProvider, setActiveProvider] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = getSafeRedirect(searchParams?.get("redirect") ?? null)

  const handleGoogleSignIn = async () => {
    if (isLoading || activeProvider === 'google') return;
    setIsLoading(true); setError(null); setActiveProvider('google')
    try {
      const user = await signInWithGoogle()
      const returning = isReturningUser(user)
      router.push(redirectTo ?? (returning ? "/tools" : "/profile"))
    } catch (error: any) {
      if (error.message?.includes('Redirect initiated')) return;
      setError(getAuthErrorMessage(error))
    } finally {
      setIsLoading(false); setActiveProvider(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }
    setIsLoading(true); setError(null)
    try {
      await signInWithEmail(email, password)
      router.push(redirectTo ?? "/tools")
    } catch (error: any) {
      setError(error?.message || 'Sign-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col pt-[env(safe-area-inset-top)] pb-10 px-4">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-2 text-amber-400 py-4 active:scale-95 transition-transform">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-bold uppercase tracking-wider">Back</span>
      </Link>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-4 drop-shadow-lg">🔮</div>
          <h1 className="text-3xl font-heading font-bold text-amber-400 mb-2">Welcome Back</h1>
          <p className="text-surface-on-variant text-sm font-medium opacity-70 uppercase tracking-widest leading-none">The cosmos awaits your return</p>
        </div>

        <div className="w-full bg-surface-container-high rounded-[32px] p-6 sm:p-8 border border-outline-variant shadow-2xl">
          {/* Google Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-14 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all"
          >
            {activeProvider === 'google' ? <Loader2 className="animate-spin" /> : (
              <>
                <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign in with Google
              </>
            )}
          </Button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-outline-variant" /></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-surface-container-high px-4 text-surface-on-variant font-bold opacity-50">or email</span></div>
          </div>

          {error && <Alert className="mb-6 bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl"><AlertDescription className="font-bold text-center">{error}</AlertDescription></Alert>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest ml-1">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-on-variant" />
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="name@example.com" className="h-14 pl-12 bg-surface-container-low border-outline-variant rounded-2xl focus:border-amber-500 transition-all font-medium" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest ml-1">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-on-variant" />
                <Input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="••••••••" className="h-14 pl-12 pr-12 bg-surface-container-low border-outline-variant rounded-2xl focus:border-amber-500 transition-all font-medium" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-on-variant active:text-amber-400"><Eye className="w-5 h-5" /></button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-2xl font-bold text-lg shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 w-5 h-5" />}
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-outline-variant/30">
            <p className="text-surface-on-variant text-sm font-medium">New Seeker? <Link href="/signup" className="text-amber-400 font-bold hover:underline ml-1">Create Account</Link></p>
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
