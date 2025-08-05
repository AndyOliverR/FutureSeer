"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles, User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { signInWithGoogle, signUpWithEmail } from "@/lib/firebase"
import { isAppleDevice } from "@/utils/isAppleDevice"
import { useRef } from "react"


export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [activeProvider, setActiveProvider] = useState<string | null>(null)
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await signInWithGoogle()
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // OAuth providers not yet implemented - keeping only Google OAuth for now
  // TODO: Implement Apple, Facebook, Microsoft OAuth when Firebase configuration is complete

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !confirmPassword || !displayName) {
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
      await signUpWithEmail(email, password, displayName)
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Simplified sign-up options - only Google OAuth implemented
  const signUpButtons = [
    {
      label: 'Continue with Google',
      onClick: handleGoogleSignIn,
      icon: <Mail className="mr-2 h-4 w-4" />,
      className: "w-full bg-white text-gray-900 hover:bg-gray-100 border border-gray-300 font-serif mb-2 focus:ring-2 focus:ring-amber-400",
      aria: 'Sign up with Google',
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
    <div className="min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
           style={{ backgroundImage: "url('/images/starfield-bg.png')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/40" />
        
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
              className="inline-flex items-center gap-2 text-amber-200 hover:text-amber-300 transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-serif">Back to FutureSeer</span>
            </Link>

            <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 shadow-xl card-glow">
              <CardHeader className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-4xl mb-4"
                >
                  🌟
                </motion.div>
                <CardTitle className="text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
                  Begin Your Journey
                </CardTitle>
                <CardDescription className="text-slate-300 font-serif">
                  Create your account and unlock the secrets of the cosmos
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
                    <span className="text-slate-300 font-serif mb-2">Continue with</span>
                    <div className="flex justify-center">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Sign up with Google"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading || activeProvider === 'google'}
                        className="rounded-full border border-gray-300 bg-white text-gray-900 hover:bg-gray-100"
                      >
                        {activeProvider === 'google' ? <Loader2 className="h-5 w-5 animate-spin" /> : <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><g><path d="M21.805 10.023h-9.765v3.954h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.125s2.75-6.125 6.125-6.125c1.922 0 3.211.82 3.953 1.523l2.703-2.633c-1.711-1.57-3.922-2.539-6.656-2.539-5.523 0-10 4.477-10 10s4.477 10 10 10c5.75 0 9.563-4.031 9.563-9.719 0-.656-.07-1.156-.156-1.484z" fill="#4285F4"/><path d="M3.545 7.545l3.25 2.383c.883-1.07 2.125-1.953 3.68-1.953 1.016 0 1.953.352 2.68.938l2.703-2.633c-1.711-1.57-3.922-2.539-6.656-2.539-2.672 0-5.07 1.07-6.844 2.797z" fill="#34A853"/><path d="M12.475 22.25c2.672 0 4.922-.883 6.563-2.406l-3.031-2.484c-.82.57-1.883.914-3.031.914-2.344 0-4.336-1.57-5.047-3.68l-3.242 2.5c1.75 3.477 5.406 5.156 8.788 5.156z" fill="#FBBC05"/><path d="M21.805 10.023h-9.765v3.954h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.125s2.75-6.125 6.125-6.125c1.922 0 3.211.82 3.953 1.523l2.703-2.633c-1.711-1.57-3.922-2.539-6.656-2.539-5.523 0-10 4.477-10 10s4.477 10 10 10c5.75 0 9.563-4.031 9.563-9.719 0-.656-.07-1.156-.156-1.484z" fill="#EA4335"/></g></svg>}
                      </Button>
                    </div>
                  </div>
                </motion.div>
                {/* Divider */}
                <div className="flex items-center my-4">
                  <span className="flex-grow border-t border-slate-600" />
                  <span className="mx-2 text-xs text-slate-400 font-serif">or sign up with email</span>
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
                        {typeof error === 'string' ? error : 'An error occurred. Please try again or use another sign-up method.'}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Email/Password Form */}
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  onSubmit={handleEmailSignUp}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-amber-200 font-serif">Display Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="Enter your name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-10 bg-slate-800/50 border-slate-600 text-amber-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 input-glow"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-amber-200 font-serif">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-slate-800/50 border-slate-600 text-amber-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 input-glow"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-amber-200 font-serif">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min 6 characters)"
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-amber-200 font-serif">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 bg-slate-800/50 border-slate-600 text-amber-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 input-glow"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-amber-200"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
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
                    Create Account
                  </Button>
                </motion.form>

                {/* Terms and Privacy */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="text-center text-xs text-slate-400 font-serif"
                >
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" className="text-amber-300 hover:text-amber-200">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-amber-300 hover:text-amber-200">
                    Privacy Policy
                  </Link>
                </motion.div>

                {/* Sign In Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="text-center pt-4 border-t border-slate-700"
                >
                  <p className="text-slate-300 font-serif">
                    Already have an account?{" "}
                    <Link 
                      href="/signin"
                      className="text-amber-300 hover:text-amber-200 font-semibold transition-colors"
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
    </div>
  )
} 