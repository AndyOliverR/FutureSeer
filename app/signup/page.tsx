"use client"

import React, { Suspense, useState, useEffect } from "react"
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
import { signInWithGoogle, signUpWithEmail } from "@/lib/firebase"
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
      await signInWithGoogle()
      router.push("/dashboard")
    } catch (error: any) {
      // Handle specific popup errors with better user feedback
      if (error.message && error.message.includes('Redirect initiated')) {
        // This is expected when redirect method is used
        if (process.env.NODE_ENV === 'development') {
          console.debug('Redirect authentication initiated');
        }
        return; // Don't show error for redirect
      }
      
      // Handle "Target ID already exists" error gracefully
      if (error.message?.includes('Target ID already exists') || 
          error.message?.includes('already exists') ||
          error.message?.includes('Sign-in is already in progress')) {
        // Don't show error, just wait - the existing sign-in will complete
        if (process.env.NODE_ENV === 'development') {
          console.debug('Sign-in already in progress');
        }
        return;
      }
      
      // Use enhanced error handling
      const errorMessage = error.code ? 
        (error.code === 'auth/popup-closed-by-user' ? 'Sign-in was cancelled. Please try again.' :
         error.code === 'auth/popup-blocked' ? 'Pop-up was blocked. Please allow pop-ups for this site or try again.' :
         error.message) : error.message;
      
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
        console.debug('Subscription ID not provided, subscription may need to be created separately');
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
      router.push("/dashboard")
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
                  {showSignupFlow ? 'Join the Innovation Experiment' : 'Begin Your Journey'}
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
                      size="icon"
                      variant="outlined"
                      aria-label="Sign up with Google"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading || activeProvider === 'google'}
                      className="rounded-full border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] text-[var(--m3-on-surface)] hover:bg-[var(--m3-primary-container)] hover:border-[var(--m3-primary)] m3-transition-standard"
                    >
                      {activeProvider === 'google' ? <Loader2 className="h-5 w-5 animate-spin" /> : <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-label="Google logo" role="img"><g><path d="M21.805 10.023h-9.765v3.954h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.125s2.75-6.125 6.125-6.125c1.922 0 3.211.82 3.953 1.523l2.703-2.633c-1.711-1.57-3.922-2.539-6.656-2.539-5.523 0-10 4.477-10 10s4.477 10 10 10c5.75 0 9.563-4.031 9.563-9.719 0-.656-.07-1.156-.156-1.484z" fill="#4285F4"/><path d="M3.545 7.545l3.25 2.383c.883-1.07 2.125-1.953 3.68-1.953 1.016 0 1.953.352 2.68.938l2.703-2.633c-1.711-1.57-3.922-2.539-6.656-2.539-2.672 0-5.07 1.07-6.844 2.797z" fill="#34A853"/><path d="M12.475 22.25c2.672 0 4.922-.883 6.563-2.406l-3.031-2.484c-.82.57-1.883.914-3.031.914-2.344 0-4.336-1.57-5.047-3.68l-3.242 2.5c1.75 3.477 5.406 5.156 8.788 5.156z" fill="#FBBC05"/><path d="M21.805 10.023h-9.765v3.954h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.125s2.75-6.125 6.125-6.125c1.922 0 3.211.82 3.953 1.523l2.703-2.633c-1.711-1.57-3.922-2.539-6.656-2.539-5.523 0-10 4.477-10 10s4.477 10 10 10c5.75 0 9.563-4.031 9.563-9.719 0-.656-.07-1.156-.156-1.484z" fill="#EA4335"/></g></svg>}
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