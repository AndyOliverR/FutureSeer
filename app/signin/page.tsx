"use client"

import React, { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { signInWithGoogle, signInWithEmail, resetPassword, getAuthErrorMessage, isReturningUser } from "@/lib/firebase"
import { isAppleDevice } from "@/utils/isAppleDevice"
import { useRef } from "react"
import { devLog } from "@/lib/devLogger"

/** Safe redirect path: must start with / and not be protocol-relative (//). */
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
  
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = getSafeRedirect(searchParams?.get("redirect") ?? null)

  const handleGoogleSignIn = async () => {
    // Prevent multiple clicks
    if (isLoading || activeProvider === 'google') {
      return;
    }
    
    setIsLoading(true)
    setError(null)
    setActiveProvider('google')
    
    try {
      const user = await signInWithGoogle()
      const returning = isReturningUser(user)
      const next = redirectTo ?? (returning ? "/dashboard" : "/profile-setup")
      router.push(next)
    } catch (error: any) {
      // Handle specific popup errors with better user feedback
      if (error.message && error.message.includes('Redirect initiated')) {
        devLog.debug('Redirect authentication initiated', undefined, 'signin');
        return; // Don't show error for redirect
      }
      
      // Handle "Target ID already exists" error gracefully
      if (error.message?.includes('Target ID already exists') || 
          error.message?.includes('already exists') ||
          error.message?.includes('Sign-in is already in progress')) {
        devLog.debug('Sign-in already in progress', undefined, 'signin');
        return;
      }
      
      // Map Firebase error codes to user-friendly messages
      const code = error?.code;
      const fallbackGeneric = 'Something went wrong. Please try again or use email sign-in.';
      let errorMessage: string;
      if (code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up was blocked. Allow pop-ups and try again.';
      } else if (code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Check connection and try again.';
      } else if (code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email. Try signing in with email.';
      } else if (code && code.startsWith('auth/')) {
        // Use getAuthErrorMessage for consistent, actionable messages
        errorMessage = getAuthErrorMessage(error) || fallbackGeneric;
      } else {
        const msg = error?.message || '';
        errorMessage = msg && !msg.includes('auth/') && msg.length <= 120 ? msg : fallbackGeneric;
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      setActiveProvider(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    // Regular Firebase authentication
    setIsLoading(true)
    setError(null)
    
    try {
      await signInWithEmail(email, password)
      const next = redirectTo ?? "/dashboard"
      router.push(next)
    } catch (error: any) {
      const msg = error?.message;
      setError(typeof msg === 'string' && msg.length > 0 ? msg : 'Sign-in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsResetting(true)
    setError(null)
    
    try {
      await resetPassword(email)
      setResetSent(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsResetting(false)
    }
  }

  // OAuth providers not yet implemented - keeping only Google OAuth for now
  // TODO: Implement Apple, Facebook, Microsoft OAuth when Firebase configuration is complete

  // Removed Apple device detection since we only support Google OAuth

  // Simplified sign-in options - only Google OAuth implemented
  const signInButtons = [
    {
      label: 'Continue with Google',
      onClick: handleGoogleSignIn,
      icon: <Mail className="mr-2 h-4 w-4" />,
      className: "w-full bg-white text-gray-900 hover:bg-gray-100 border border-gray-300 font-serif mb-2 focus:ring-2 focus:ring-amber-400",
      aria: 'Sign in with Google',
      key: 'google',
    },
  ];

  // Button click handler wrapper
  const handleProviderClick = async (btn: any) => {
    setActiveProvider(btn.key)
    await btn.onClick()
    setActiveProvider(null)
  }

  return (
    <div className="relative min-h-screen overflow-hidden starfield-ultra-sharp">
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Back to Home */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to <span className="text-amber-400 font-semibold">FutureSeer</span></span>
          </Link>

          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl mb-4"
              >
                🔮
              </motion.div>
              <CardTitle className="text-2xl font-bold font-serif text-amber-400">
                Welcome Back, Seeker
              </CardTitle>
              <CardDescription className="text-sm text-white/80 font-serif">
                Continue your mystical journey with the cosmos
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Debug message for device detection */}
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex flex-col items-center mb-2">
                  <span className="text-sm text-amber-400 font-serif mb-2">Continue with</span>
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      aria-label="Sign in with Google"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading || activeProvider === 'google'}
                      className="rounded-full border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 inline-flex items-center gap-2 px-4 py-2 min-h-[44px]"
                    >
                      {activeProvider === 'google' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden="true">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                          <span>Google</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
              {/* Divider */}
              <div className="flex items-center my-4">
                <span className="flex-grow border-t border-slate-600" />
                <span className="mx-2 text-xs text-amber-400 font-serif">or sign in with email</span>
                <span className="flex-grow border-t border-slate-600" />
              </div>
              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                    <AlertDescription className="text-red-300 font-serif">
                      {error}
                    </AlertDescription>
                    {error.includes('pop-up was blocked') && (
                      <div className="mt-2 text-xs text-red-200">
                        💡 Tip: Try refreshing the page or check your browser's popup settings.
                      </div>
                    )}
                  </Alert>
                </motion.div>
              )}

              {/* Success Alert for Password Reset */}
              {resetSent && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="border-green-500/30 bg-green-500/10">
                    <AlertDescription className="text-green-300 font-serif">
                      Password reset email sent! Check your inbox for instructions.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Email/Password Form */}
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-amber-400 font-serif">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-600 text-amber-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 input-glow"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-amber-400 font-serif">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-slate-800/50 border-slate-600 text-amber-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 input-glow"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-amber-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Password Reset Link */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={isResetting}
                    className="text-sm text-amber-400 hover:text-amber-300 font-serif transition-colors"
                  >
                    {isResetting ? (
                      <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                    ) : null}
                    Forgot your password?
                  </button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900 font-semibold button-glow"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Sign In
                </Button>
              </motion.form>

              {/* Sign Up Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-center pt-4 border-t border-slate-700"
              >
                <p className="text-slate-300 font-serif">
                  Don't have an account?{" "}
                  <Link 
                    href="/signup"
                    className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                  >
                    Sign up here
                  </Link>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="text-amber-400">Loading...</div></div>}>
      <SignInContent />
    </Suspense>
  )
} 