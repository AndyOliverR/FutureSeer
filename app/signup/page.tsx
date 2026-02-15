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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles, User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { signInWithGoogle, signUpWithEmail, getAuthErrorMessage, isReturningUser } from "@/lib/firebase"
import { CountrySelector } from "@/components/CountrySelector"

// Lazy load SignupFlow component - only loaded when user submits basic info
const SignupFlow = dynamic(() => import("@/components/SignupFlow").then(mod => ({ default: mod.SignupFlow })), {
  loading: () => (
    <div className="py-12 text-center">
      <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-[var(--m3-primary)]" />
      <p className="text-[var(--m3-on-primary-container)] font-serif">Loading signup flow...</p>
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
  
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get plan and referral code from URL params
  const planParam = searchParams?.get('plan') as 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper' | null
  const refParam = searchParams?.get('ref')
  
  // Set referral code from URL if present
  useEffect(() => {
    if (refParam) {
      setReferralCode(refParam)
    }
  }, [refParam])

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
      router.push(returning ? "/dashboard" : "/profile-setup")
    } catch (error: any) {
      // Handle specific popup errors with better user feedback
      if (error.message && error.message.includes('Redirect initiated')) {
        // This is expected when redirect method is used
        if (process.env.NODE_ENV === 'development') {
          devLog.debug('Redirect authentication initiated');
        }
        return; // Don't show error for redirect
      }
      
      // Handle "Target ID already exists" error gracefully
      if (error.message?.includes('Target ID already exists') || 
          error.message?.includes('already exists') ||
          error.message?.includes('Sign-in is already in progress')) {
        // Don't show error, just wait - the existing sign-in will complete
        if (process.env.NODE_ENV === 'development') {
          devLog.debug('Sign-in already in progress');
        }
        return;
      }
      
      // Map Firebase error codes to user-friendly messages
      const code = error?.code;
      const fallbackGeneric = 'Something went wrong. Please try again or sign up with email.';
      let errorMessage: string;
      if (code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-up was cancelled. Please try again.';
      } else if (code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up was blocked. Allow pop-ups and try again.';
      } else if (code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Check connection and try again.';
      } else if (code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-up was cancelled. Please try again.';
      } else if (code && code.startsWith('auth/')) {
        // Use getAuthErrorMessage for consistent, actionable messages (handles both wrapped and raw Firebase errors)
        errorMessage = getAuthErrorMessage(error) || fallbackGeneric;
      } else {
        const msg = error?.message || '';
        errorMessage = msg && !msg.includes('auth/') && msg.length <= 120 ? msg : fallbackGeneric;
      }
      // Log to help debug (visible in DevTools when user opens console)
      devLog.warn('[Signup] Google sign-in failed', { code: code || 'no-code', message: error?.message?.slice(0, 80) }, 'signup');
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      setActiveProvider(null)
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

    setError(null)
    // Proceed to signup flow (plan selection, payment, etc.)
    setShowSignupFlow(true)
  }

  const handleSignupFlowComplete = async (data: {
    selectedPlan: 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper';
    paymentMethodId: string;
    autoMandateAccepted: boolean;
    subscriptionId?: string;
  }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Get subscription ID from the payment capture process
      // The subscription was created in PaymentMethodCapture component
      // We need to retrieve it or pass it through the flow
      let subscriptionId = data.subscriptionId;
      
      // If subscription ID is not provided, we need to get it from the payment method
      // For now, we'll create the subscription during signup if needed
      if (!subscriptionId && process.env.NODE_ENV === 'development') {
        // Subscription should have been created during payment capture
        // This is a fallback - in production, ensure subscriptionId is passed through
        devLog.debug('Subscription ID not provided, subscription may need to be created separately');
      }
      
      // Create user account with payment/subscription info
      await signUpWithEmail(
        email,
        password,
        displayName,
        selectedCountry,
        data.selectedPlan,
        data.paymentMethodId,
        data.autoMandateAccepted,
        subscriptionId,
        referralCode || undefined
      )
      router.push("/profile-setup")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden starfield-ultra-sharp relative">
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div 
          className="w-full max-w-md m3-gpu-accelerated"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
        >
          {/* Back to Home */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform m3-transition-standard" />
            <span>Back to <span className="text-amber-400 font-semibold">FutureSeer</span></span>
          </Link>

          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <motion.div 
                role="img" 
                aria-label="Star icon"
                className="text-4xl mb-4 m3-gpu-accelerated"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.2,
                  ease: [0, 0, 0.2, 1]
                }}
              >
                🌟
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.2, 0, 0, 1] }}
              >
                <CardTitle className="text-2xl font-bold font-serif text-amber-400">
                  Join the Innovation Experiment
                </CardTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4, ease: [0.2, 0, 0, 1] }}
              >
                <CardDescription className="text-sm text-white/80 font-serif">
                  {showSignupFlow 
                    ? 'Choose your contribution tier and secure your spot (no charge for 30 days)'
                    : 'Create your account and unlock the secrets of the cosmos'}
                </CardDescription>
              </motion.div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <motion.div 
                className="m3-gpu-accelerated"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0, 0, 0.2, 1] }}
              >
                <div className="flex flex-col items-center mb-2">
                  <span className="text-sm text-amber-400 font-serif mb-2">Continue with</span>
                  <div className="flex justify-center">
                    <Button
                      variant="outlined"
                      aria-label="Sign up with Google"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading || activeProvider === 'google'}
                      className="rounded-full border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] text-[var(--m3-on-surface)] hover:bg-[var(--m3-primary-container)] hover:border-[var(--m3-primary)] m3-transition-standard inline-flex items-center gap-2 px-4 py-2 min-h-[44px]"
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
                <span className="flex-grow border-t border-[var(--m3-outline)]" />
                <span className="mx-2 text-xs text-amber-400 font-serif">or sign up with email</span>
                <span className="flex-grow border-t border-[var(--m3-outline)]" />
              </div>
              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 1, 1] }}
                >
                  <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                    <AlertDescription className="text-red-300 font-serif">
                      {typeof error === 'string' ? error : 'An error occurred. Please try again or use another sign-up method.'}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Show SignupFlow if basic info is submitted, otherwise show form */}
              {showSignupFlow ? (
                <SignupFlow
                  email={email}
                  password={password}
                  displayName={displayName}
                  selectedCountry={selectedCountry}
                  initialPlan={planParam || undefined}
                  onComplete={handleSignupFlowComplete}
                  onError={setError}
                />
              ) : (
                <motion.form
                  onSubmit={handleBasicInfoSubmit}
                  className="space-y-4 m3-gpu-accelerated"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.5,
                      },
                    },
                  }}
                >
                <motion.div 
                  className="space-y-2"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { duration: 0.5, ease: [0, 0, 0.2, 1] }
                    },
                  }}
                >
                  <Label htmlFor="displayName" className="text-sm font-semibold text-amber-400 font-serif">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-[var(--m3-on-surface-variant)]" />
                    <Input
                      id="displayName"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10 bg-[var(--m3-surface-container-low)] border-[var(--m3-outline)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] m3-input-focus"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { duration: 0.5, ease: [0, 0, 0.2, 1] }
                    },
                  }}
                >
                  <CountrySelector 
                    value={selectedCountry}
                    onChange={setSelectedCountry}
                    autoDetect={true}
                  />
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { duration: 0.5, ease: [0, 0, 0.2, 1] }
                    },
                  }}
                >
                  <Label htmlFor="email" className="text-sm font-semibold text-amber-400 font-serif">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-[var(--m3-on-surface-variant)]" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-[var(--m3-surface-container-low)] border-[var(--m3-outline)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] m3-input-focus"
                      required
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { duration: 0.5, ease: [0, 0, 0.2, 1] }
                    },
                  }}
                >
                  <Label htmlFor="password" className="text-sm font-semibold text-amber-400 font-serif">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[var(--m3-on-surface-variant)]" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-[var(--m3-surface-container-low)] border-[var(--m3-outline)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] m3-input-focus"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-primary)] m3-transition-standard"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { duration: 0.5, ease: [0, 0, 0.2, 1] }
                    },
                  }}
                >
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-amber-400 font-serif">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[var(--m3-on-surface-variant)]" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 bg-[var(--m3-surface-container-low)] border-[var(--m3-outline)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] m3-input-focus"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-primary)] m3-transition-standard"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { duration: 0.5, ease: [0, 0, 0.2, 1] }
                    },
                  }}
                >
                  <Label htmlFor="referralCode" className="text-sm font-semibold text-amber-400 font-serif">
                    Referral Code <span className="text-xs text-white/60 font-normal">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Sparkles className="absolute left-3 top-3 h-4 w-4 text-[var(--m3-on-surface-variant)]" />
                    <Input
                      id="referralCode"
                      type="text"
                      autoComplete="off"
                      placeholder="Enter referral code (e.g., FUTURE_ABC123)"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      className="pl-10 bg-[var(--m3-surface-container-low)] border-[var(--m3-outline)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] m3-input-focus"
                    />
                  </div>
                  {referralCode && (
                    <p className="text-xs text-green-400">
                      ✓ You'll get an additional free month when you use this code!
                    </p>
                  )}
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { duration: 0.5, ease: [0.2, 0, 1, 1] }
                    },
                  }}
                >
                  <Button 
                    type="submit"
                    variant="filled"
                    className="w-full bg-[var(--m3-primary)] hover:bg-[var(--m3-primary)]/90 text-[var(--m3-on-primary)] font-semibold m3-transition-emphasized m3-label-large"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Join the Innovation Experiment
                  </Button>
                </motion.div>
              </motion.form>
              )}

              {/* Terms and Privacy */}
              <motion.div 
                className="text-center text-xs text-[var(--m3-on-surface-variant)] font-serif m3-gpu-accelerated"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6, ease: [0.2, 0, 0, 1] }}
              >
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-amber-400 hover:text-amber-300 transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-amber-400 hover:text-amber-300 transition-colors">
                  Privacy Policy
                </Link>
              </motion.div>

              {/* Sign In Link */}
              <motion.div 
                className="text-center pt-4 border-t border-[var(--m3-outline-variant)] m3-gpu-accelerated"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7, ease: [0.2, 0, 0, 1] }}
              >
                <p className="m3-body-medium text-[var(--m3-on-surface-variant)] font-serif">
                  Already have an account?{" "}
                  <Link 
                    href="/signin"
                    className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                  >
                    Sign in here
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

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen overflow-hidden starfield-ultra-sharp relative flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    }>
      <SignUpPageContent />
    </Suspense>
  )
} 