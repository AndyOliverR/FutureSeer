'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, isReturningUser, getAuthErrorMessage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { CountrySelector } from '@/components/CountrySelector';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { devLog } from '@/lib/devLogger';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup' | 'reset';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'signin' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  
  const { signIn } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    // Prevent multiple clicks
    if (isLoading) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await signInWithGoogle();
      const returning = isReturningUser(user);
      toast({
        title: returning ? "Welcome back! 🌟" : "Welcome to FutureSeer! 🌟",
        description: returning ? "Your mystical journey continues." : "Your mystical journey begins now.",
      });
      onClose();
      router.push(returning ? '/tools' : '/profile');
    } catch (error: any) {
      // Handle "Target ID already exists" error gracefully
      if (error.message?.includes('Target ID already exists') || 
          error.message?.includes('already exists') ||
          error.message?.includes('Sign-in is already in progress')) {
        devLog.debug('Sign-in already in progress', undefined, 'AuthModal');
        return;
      }
      
      if (error.message && error.message.includes('Redirect initiated')) {
        devLog.debug('Redirect authentication initiated', undefined, 'AuthModal');
        return;
      }
      
      const msg = getAuthErrorMessage(error);
      setError(msg);
      toast({
        title: "Sign-in failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithEmail(email, password);
      toast({
        title: "Welcome back! 🌟",
        description: "Your mystical journey continues.",
      });
      onClose();
      router.push('/tools');
    } catch (error: any) {
      const msg = getAuthErrorMessage(error);
      setError(msg);
      toast({
        title: "Sign-in failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !displayName || !selectedCountry) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await signUpWithEmail(email, password, displayName, selectedCountry);
      toast({
        title: "Welcome to FutureSeer! 🌟",
        description: "Your mystical journey begins now.",
      });
      onClose();
      router.push('/profile');
    } catch (error: any) {
      const msg = getAuthErrorMessage(error);
      setError(msg);
      toast({
        title: "Sign-up failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await resetPassword(email);
      toast({
        title: "Password reset email sent! 📧",
        description: "Check your email for reset instructions.",
      });
      setActiveTab('signin');
    } catch (error: any) {
      const msg = getAuthErrorMessage(error);
      setError(msg);
      toast({
        title: "Password reset failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setSelectedCountry('');
    setError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  if (!isOpen) return null;

  return (
    <ModalPortal open={isOpen}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="w-full max-w-md max-h-[min(90dvh,90vh)] overflow-y-auto bg-slate-950/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-300">
         {/* Animated mystical glow effect */}
                   <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 via-transparent to-amber-500/8 rounded-2xl animate-pulse"></div>
                   <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-amber-500/5 rounded-2xl"></div>
         
         {/* Floating particles effect */}
         <div className="absolute inset-0 overflow-hidden">
           <div className="absolute top-4 left-4 w-2 h-2 bg-amber-400/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
           <div className="absolute top-8 right-6 w-1 h-1 bg-blue-300/80 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
           <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-amber-300/70 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
           <div className="absolute bottom-4 right-4 w-1 h-1 bg-blue-400/60 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
         </div>
        
        <div className="relative z-10">
                     <div className="text-center p-8 border-b border-amber-500/30 relative">
             {/* Mystical orb behind title */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
             
             <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-blue-400 to-amber-600 relative z-10 animate-in slide-in-from-top-2 duration-500">
               FutureSeer
             </h2>
             <p className="text-gray-300 mt-3 text-sm font-medium animate-in slide-in-from-bottom-2 duration-500 delay-100">
               Begin your mystical journey with the cosmos ✨
             </p>
           </div>
          
          <div className="p-8">
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value as any);
              resetForm();
            }}>
                             <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-800/60 to-blue-700/60 border border-amber-500/30 rounded-xl p-1 backdrop-blur-sm">
                 <TabsTrigger 
                   value="signin" 
                   className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/20 rounded-lg transition-all duration-300 hover:bg-amber-500/10 hover:text-amber-200"
                 >
                   Sign In
                 </TabsTrigger>
                 <TabsTrigger 
                   value="signup" 
                   className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/20 rounded-lg transition-all duration-300 hover:bg-amber-500/10 hover:text-amber-200"
                 >
                   Sign Up
                 </TabsTrigger>
                 <TabsTrigger 
                   value="reset" 
                   className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/20 rounded-lg transition-all duration-300 hover:bg-amber-500/10 hover:text-amber-200"
                 >
                   Reset
                 </TabsTrigger>
               </TabsList>

              {/* Google Sign In */}
              <div className="mt-8">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-white to-gray-50 text-gray-700 hover:from-gray-50 hover:to-gray-100 border border-gray-300 hover:border-gray-400 shadow-lg hover:shadow-xl font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 hover:-translate-y-0.5"
                  variant="outline"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </div>

                             <div className="relative my-8">
                 <div className="absolute inset-0 flex items-center">
                   <span className="w-full border-t border-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                 </div>
                 <div className="relative flex justify-center text-xs uppercase">
                   <span className="bg-gradient-to-r from-blue-900/90 to-blue-800/90 px-6 py-2 text-amber-300 font-semibold rounded-full border border-amber-500/20 shadow-lg backdrop-blur-sm">
                                          <span className="text-amber-300">✨</span> Or continue with email <span className="text-amber-300">✨</span>
                   </span>
                 </div>
               </div>

              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-900/60 to-red-800/60 border border-red-500/40 rounded-xl backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
                  <p className="text-red-200 text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                    {error}
                  </p>
                </div>
              )}

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                                     <div className="space-y-3">
                                           <Label htmlFor="signin-email" className="text-amber-300 font-medium text-sm">Email</Label>
                      <div className="relative group">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 shrink-0"><Mail className="h-5 w-5 text-amber-400 group-focus-within:text-amber-300 transition-colors duration-200" /></span>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-12 pr-4 py-3 bg-gradient-to-r from-blue-800/60 to-blue-700/60 border border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 rounded-xl backdrop-blur-sm transition-all duration-300 hover:border-amber-500/40"
                          required
                        />
                      </div>
                    </div>
                   
                                      <div className="space-y-3">
                      <Label htmlFor="signin-password" className="text-amber-300 font-medium text-sm">Password</Label>
                      <div className="relative group">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 shrink-0"><Lock className="h-5 w-5 text-amber-400 group-focus-within:text-amber-300 transition-colors duration-200" /></span>
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-12 pr-12 py-3 bg-gradient-to-r from-blue-800/60 to-blue-700/60 border border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 rounded-xl backdrop-blur-sm transition-all duration-300 hover:border-amber-500/40"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 rounded-lg transition-all duration-200"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                         <span className="shrink-0">{showPassword ? (
                           <EyeOff className="h-4 w-4" />
                         ) : (
                           <Eye className="h-4 w-4" />
                         )}</span>
                       </Button>
                     </div>
                   </div>

                                       <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 mt-6" 
                      disabled={isLoading}
                    >
                                            {isLoading ? (
                         <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                       ) : (
                         <span className="flex items-center gap-2">
                           <span className="text-white">✨</span>
                           Sign In
                           <span className="text-white">✨</span>
                         </span>
                       )}
                    </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                                     <div className="space-y-2">
                     <Label htmlFor="signup-name" className="text-amber-300">Display Name</Label>
                     <Input
                       id="signup-name"
                       type="text"
                       placeholder="Enter your name"
                       value={displayName}
                       onChange={(e) => setDisplayName(e.target.value)}
                       className="bg-blue-800/50 border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-500/50"
                       required
                     />
                   </div>

                   <div className="space-y-2">
                     <CountrySelector 
                       value={selectedCountry}
                       onChange={setSelectedCountry}
                       autoDetect={true}
                     />
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="signup-email" className="text-amber-300">Email</Label>
                     <div className="relative">
                       <span className="pointer-events-none absolute left-3 top-3 shrink-0"><Mail className="h-4 w-4 text-amber-400" /></span>
                       <Input
                         id="signup-email"
                         type="email"
                         placeholder="Enter your email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="pl-10 bg-blue-800/50 border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-500/50"
                         required
                       />
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <Label htmlFor="signup-password" className="text-amber-300">Password</Label>
                     <div className="relative">
                       <span className="pointer-events-none absolute left-3 top-3 shrink-0"><Lock className="h-4 w-4 text-amber-400" /></span>
                       <Input
                         id="signup-password"
                         type={showPassword ? "text" : "password"}
                         placeholder="Create a password"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="pl-10 pr-10 bg-blue-800/50 border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-500/50"
                         required
                       />
                       <Button
                         type="button"
                         variant="ghost"
                         size="sm"
                         className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-amber-400"
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
                     <Label htmlFor="signup-confirm-password" className="text-amber-300">Confirm Password</Label>
                     <div className="relative">
                       <span className="pointer-events-none absolute left-3 top-3 shrink-0"><Lock className="h-4 w-4 text-amber-400" /></span>
                       <Input
                         id="signup-confirm-password"
                         type={showConfirmPassword ? "text" : "password"}
                         placeholder="Confirm your password"
                         value={confirmPassword}
                         onChange={(e) => setConfirmPassword(e.target.value)}
                         className="pl-10 pr-10 bg-blue-800/50 border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-500/50"
                         required
                       />
                       <Button
                         type="button"
                         variant="ghost"
                         size="sm"
                         className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-amber-400"
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

                   <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white" disabled={isLoading}>
                     {isLoading ? (
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : null}
                     Create Account
                   </Button>
                </form>
              </TabsContent>

                             {/* Password Reset Tab */}
               <TabsContent value="reset" className="space-y-4">
                 <form onSubmit={handlePasswordReset} className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="reset-email" className="text-amber-300">Email</Label>
                     <div className="relative">
                       <span className="pointer-events-none absolute left-3 top-3 shrink-0"><Mail className="h-4 w-4 text-amber-400" /></span>
                       <Input
                         id="reset-email"
                         type="email"
                         placeholder="Enter your email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="pl-10 bg-blue-800/50 border-amber-500/30 text-white placeholder-gray-400 focus:border-amber-500/50"
                         required
                       />
                     </div>
                   </div>

                   <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white" disabled={isLoading}>
                     {isLoading ? (
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : null}
                     Send Reset Email
                   </Button>
                 </form>
               </TabsContent>
            </Tabs>

                         <div className="mt-8 text-center">
               <Button
                 variant="ghost"
                 onClick={onClose}
                 className="text-sm text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-6 py-2 rounded-lg transition-all duration-300"
               >
                                  <span className="text-amber-200">✨</span> Cancel <span className="text-amber-200">✨</span>
               </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
} 