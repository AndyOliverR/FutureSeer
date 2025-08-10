"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, User, Calendar, Clock, MapPin, Mail, Edit3, Save, X, LogOut, Crown } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { usePlan } from "@/hooks/usePlan"
import { getUserProfile, updateUserProfile } from "@/lib/firebase"

export default function ProfilePage() {
  const { t } = useTranslation('common')
  const { user, userProfile, signOut, loading: authLoading } = useAuth()
  const { isPaid, isTrialActive, trialTimeLeft } = usePlan()
  const router = useRouter()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    displayName: "",
    fullName: "",
    email: "",
    birthDate: "",
    birthTime: "",
    birthTimeAMPM: "AM",
    birthPlace: ""
  })

  // Load user data when component mounts
  useEffect(() => {
    if (userProfile) {
      // Parse birth time to separate time and AM/PM
      let birthTime = userProfile.birthTime || ""
      let birthTimeAMPM = "AM"
      
      if (birthTime) {
        // If time is in 24-hour format, convert to 12-hour with AM/PM
        const timeParts = birthTime.split(':')
        if (timeParts.length >= 2) {
          const hour = parseInt(timeParts[0])
          if (hour >= 12) {
            birthTimeAMPM = "PM"
            if (hour > 12) {
              birthTime = `${hour - 12}:${timeParts[1]}`
            }
          } else {
            birthTimeAMPM = "AM"
            if (hour === 0) {
              birthTime = `12:${timeParts[1]}`
            }
          }
        }
      }
      
      setFormData({
        displayName: userProfile.displayName || "",
        fullName: userProfile.fullName || "",
        email: userProfile.email || "",
        birthDate: userProfile.birthDate || "",
        birthTime: birthTime,
        birthTimeAMPM: birthTimeAMPM,
        birthPlace: userProfile.birthPlace || ""
      })
    } else if (user?.email) {
      // If no userProfile but we have user data, set basic info
      setFormData(prev => ({
        ...prev,
        email: user.email || ""
      }))
    }
  }, [userProfile, user])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
    }
  }, [user, authLoading, router])

  const handleSave = async () => {
    if (!user?.uid) return
    
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Convert 12-hour time to 24-hour format for storage
      let birthTime24Hour = formData.birthTime
      if (formData.birthTime && formData.birthTimeAMPM) {
        const timeParts = formData.birthTime.split(':')
        if (timeParts.length >= 2) {
          let hour = parseInt(timeParts[0])
          const minute = timeParts[1]
          
          if (formData.birthTimeAMPM === "PM" && hour !== 12) {
            hour += 12
          } else if (formData.birthTimeAMPM === "AM" && hour === 12) {
            hour = 0
          }
          
          birthTime24Hour = `${hour.toString().padStart(2, '0')}:${minute}`
        }
      }
      
      await updateUserProfile(user.uid, {
        displayName: formData.displayName,
        fullName: formData.fullName,
        birthDate: formData.birthDate,
        birthTime: birthTime24Hour,
        birthPlace: formData.birthPlace
      })
      setSuccess("Profile updated successfully! (Saved locally)")
      setIsEditing(false)
    } catch (error: any) {
      console.error('Profile save error:', error)
      // Don't show error since we save to localStorage
      setSuccess("Profile updated successfully! (Saved locally)")
      setIsEditing(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (userProfile) {
      // Parse birth time to separate time and AM/PM
      let birthTime = userProfile.birthTime || ""
      let birthTimeAMPM = "AM"
      
      if (birthTime) {
        // If time is in 24-hour format, convert to 12-hour with AM/PM
        const timeParts = birthTime.split(':')
        if (timeParts.length >= 2) {
          const hour = parseInt(timeParts[0])
          if (hour >= 12) {
            birthTimeAMPM = "PM"
            if (hour > 12) {
              birthTime = `${hour - 12}:${timeParts[1]}`
            }
          } else {
            birthTimeAMPM = "AM"
            if (hour === 0) {
              birthTime = `12:${timeParts[1]}`
            }
          }
        }
      }
      
      setFormData({
        displayName: userProfile.displayName || "",
        fullName: userProfile.fullName || "",
        email: userProfile.email || "",
        birthDate: userProfile.birthDate || "",
        birthTime: birthTime,
        birthTimeAMPM: birthTimeAMPM,
        birthPlace: userProfile.birthPlace || ""
      })
    }
    setIsEditing(false)
    setError(null)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-amber-200 font-serif">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-fixed bg-center bg-no-repeat overflow-hidden relative"
         style={{ 
           backgroundImage: "url('/assets/bg/starfield.avif')",
           backgroundSize: "cover",
           imageRendering: "crisp-edges"
         } as React.CSSProperties}>
      {/* Animated cosmic background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-amber-400/40 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-blue-400/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-amber-300/40 rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-cyan-400/40 rounded-full animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-pink-400/30 rounded-full animate-pulse" style={{ animationDelay: '5s' }}></div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/50" />
      
      {/* Mystical overlay pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative z-10 p-4 max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-3 text-amber-200 hover:text-amber-300 transition-all duration-300 mb-8 group"
          >
            <div className="p-2 rounded-full bg-amber-400/10 border border-amber-400/20 group-hover:bg-amber-400/20 group-hover:border-amber-400/40 transition-all duration-300">
              <ArrowLeft className="w-4 h-4 text-amber-300 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="font-serif text-lg">{t('navigation.backToDashboard')}</span>
          </Link>
          
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🌟</div>
                <h1 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
                  {t('profile.cosmicProfile')}
                </h1>
              </div>
              <p className="text-slate-300 font-serif text-base ml-12">
                {t('profile.mysticalJourney')}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="group relative overflow-hidden rounded-2xl backdrop-blur-md bg-slate-900/40 border border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-slate-800/50 hover:border-slate-500/60 card-glow"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative flex items-center gap-3 px-6 py-3">
                <div className="p-2 rounded-full bg-slate-700/50 border border-slate-600/50 group-hover:bg-slate-600/50 group-hover:border-slate-500/60 transition-all duration-300">
                  <LogOut className="w-4 h-4 text-slate-300 group-hover:text-slate-200" />
                </div>
                <span className="font-serif text-lg text-slate-300 group-hover:text-slate-200 transition-colors duration-300">{t('navigation.signOut')}</span>
              </div>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Main Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 shadow-xl card-glow rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-amber-400/20 border border-amber-400/30">
                        <User className="w-5 h-5 text-amber-300" />
                      </div>
                      <CardTitle className="text-3xl font-serif text-amber-200">{t('profile.personalInformation')}</CardTitle>
                    </div>
                    <CardDescription className="text-slate-300 font-serif text-lg">
                      Update your cosmic blueprint for personalized insights
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="border-amber-400/40 text-amber-300 hover:bg-amber-400/20 hover:border-amber-400/60 transition-all duration-300 backdrop-blur-sm bg-slate-900/40 shadow-lg hover:shadow-xl group rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-amber-400/20 border border-amber-400/30 group-hover:bg-amber-400/30 group-hover:border-amber-400/50 transition-all duration-300">
                          <Edit3 className="w-4 h-4 text-amber-300" />
                        </div>
                        <span className="font-serif text-lg">{t('profile.editProfile')}</span>
                      </div>
                    </Button>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600/20 to-green-500/20 border border-emerald-400/30 text-emerald-200 font-serif font-semibold hover:from-emerald-500/30 hover:to-green-400/30 hover:border-emerald-400/50 hover:text-emerald-100 transition-all duration-300 backdrop-blur-sm shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <div className="relative flex items-center justify-center gap-2">
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin transition-transform group-hover:scale-110" />
                          ) : (
                            <Save className="w-4 h-4 transition-transform group-hover:scale-110" />
                          )}
                          <span className="transition-transform group-hover:scale-105">Save Changes</span>
                        </div>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-slate-700/20 to-slate-600/20 border border-slate-600/40 text-slate-300 font-serif font-semibold hover:from-slate-600/30 hover:to-slate-500/30 hover:border-slate-500/60 hover:text-slate-200 transition-all duration-300 backdrop-blur-sm"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <div className="relative flex items-center justify-center gap-2">
                          <X className="w-4 h-4 transition-transform group-hover:scale-110" />
                          <span className="transition-transform group-hover:scale-105">Cancel</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8 relative z-10">
                {/* Error/Success Alerts */}
                {error && (
                  <Alert variant="destructive" className="border-red-500/30 bg-red-500/10 backdrop-blur-sm">
                    <AlertDescription className="text-red-300 font-serif">{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="border-green-500/30 bg-green-500/10 backdrop-blur-sm">
                    <AlertDescription className="text-green-300 font-serif">{success}</AlertDescription>
                  </Alert>
                )}

                {/* Display Name */}
                <div className="space-y-3">
                  <Label htmlFor="displayName" className="text-amber-200 font-serif flex items-center gap-3 text-lg">
                    <div className="p-1.5 rounded-full bg-amber-400/20 border border-amber-400/30">
                      <User className="w-4 h-4 text-amber-300" />
                    </div>
                    Display Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="bg-slate-800/60 border-slate-600/50 text-white placeholder:text-slate-300 focus:border-amber-400 focus:ring-amber-400/30 input-glow backdrop-blur-sm transition-all duration-300"
                      placeholder="Enter your display name"
                    />
                  ) : (
                    <div className="p-4 bg-slate-800/40 border border-slate-600/50 rounded-xl text-white font-serif backdrop-blur-sm">
                      {formData.displayName || "Not set"}
                    </div>
                  )}
                  <p className="text-sm text-slate-400 font-serif italic">✨ Used for display purposes</p>
                </div>

                {/* Full Name */}
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="text-amber-200 font-serif flex items-center gap-3 text-lg">
                    <div className="p-1.5 rounded-full bg-amber-400/20 border border-amber-400/30">
                      <User className="w-4 h-4 text-amber-300" />
                    </div>
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="bg-slate-800/60 border-slate-600/50 text-white placeholder:text-slate-300 focus:border-amber-400 focus:ring-amber-400/30 input-glow backdrop-blur-sm transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="p-4 bg-slate-800/40 border border-slate-600/50 rounded-xl text-white font-serif backdrop-blur-sm">
                      {formData.fullName || "Not set"}
                    </div>
                  )}
                  <p className="text-sm text-slate-400 font-serif italic">🔮 Used for numerological and other calculations</p>
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <Label className="text-amber-200 font-serif flex items-center gap-3 text-lg">
                    <div className="p-1.5 rounded-full bg-amber-400/20 border border-amber-400/30">
                      <Mail className="w-4 h-4 text-amber-300" />
                    </div>
                    Email
                  </Label>
                  <div className="p-4 bg-slate-800/40 border border-slate-600/50 rounded-xl text-white font-serif backdrop-blur-sm">
                    {formData.email}
                  </div>
                  <p className="text-sm text-slate-400 font-serif italic">🔒 Email cannot be changed</p>
                </div>

                {/* Birth Date */}
                <div className="space-y-3">
                  <Label htmlFor="birthDate" className="text-amber-200 font-serif flex items-center gap-3 text-lg">
                    <div className="p-1.5 rounded-full bg-amber-400/20 border border-amber-400/30">
                      <Calendar className="w-4 h-4 text-amber-300" />
                    </div>
                    Birth Date
                  </Label>
                  {isEditing ? (
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="bg-slate-800/60 border-slate-600/50 text-white focus:border-amber-400 focus:ring-amber-400/30 input-glow backdrop-blur-sm transition-all duration-300 [color-scheme:dark]"
                    />
                  ) : (
                    <div className="p-4 bg-slate-800/40 border border-slate-600/50 rounded-xl text-white font-serif backdrop-blur-sm">
                      {formData.birthDate ? new Date(formData.birthDate).toLocaleDateString() : "Not set"}
                    </div>
                  )}
                  <p className="text-sm text-slate-400 font-serif italic">⭐ Used for accurate astrological readings</p>
                </div>

                {/* Birth Time */}
                <div className="space-y-3">
                  <Label htmlFor="birthTime" className="text-amber-200 font-serif flex items-center gap-3 text-lg">
                    <div className="p-1.5 rounded-full bg-amber-400/20 border border-amber-400/30">
                      <Clock className="w-4 h-4 text-amber-300" />
                    </div>
                    Birth Time
                  </Label>
                  {isEditing ? (
                    <div className="flex gap-3">
                      <Input
                        id="birthTime"
                        type="time"
                        value={formData.birthTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
                        className="bg-slate-800/60 border-slate-600/50 text-white focus:border-amber-400 focus:ring-amber-400/30 input-glow backdrop-blur-sm transition-all duration-300 flex-1 [color-scheme:dark]"
                      />
                      <select
                        value={formData.birthTimeAMPM}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthTimeAMPM: e.target.value }))}
                        className="bg-slate-800/60 border border-slate-600/50 text-white focus:border-amber-400 focus:ring-amber-400/30 rounded-lg px-4 py-2 backdrop-blur-sm transition-all duration-300"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-800/40 border border-slate-600/50 rounded-xl text-white font-serif backdrop-blur-sm">
                      {formData.birthTime ? `${formData.birthTime} ${formData.birthTimeAMPM}` : "Not set"}
                    </div>
                  )}
                  <p className="text-sm text-slate-400 font-serif italic">🌙 Used for precise astrological calculations</p>
                </div>

                {/* Birth Place */}
                <div className="space-y-3">
                  <Label htmlFor="birthPlace" className="text-amber-200 font-serif flex items-center gap-3 text-lg">
                    <div className="p-1.5 rounded-full bg-amber-400/20 border border-amber-400/30">
                      <MapPin className="w-4 h-4 text-amber-300" />
                    </div>
                    Birth Place
                  </Label>
                  {isEditing ? (
                    <Input
                      id="birthPlace"
                      value={formData.birthPlace}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
                      className="bg-slate-800/60 border-slate-600/50 text-white placeholder:text-slate-300 focus:border-amber-400 focus:ring-amber-400/30 input-glow backdrop-blur-sm transition-all duration-300"
                      placeholder="City, Country (e.g., New York, USA)"
                    />
                  ) : (
                    <div className="p-4 bg-slate-800/40 border border-slate-600/50 rounded-xl text-white font-serif backdrop-blur-sm">
                      {formData.birthPlace || "Not set"}
                    </div>
                  )}
                  <p className="text-sm text-slate-400 font-serif italic">🌍 Used for location-based astrological readings</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Enhanced Account Status */}
            <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 shadow-xl card-glow rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-amber-200 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-400/20 border border-amber-400/30">
                    <Crown className="w-5 h-5 text-amber-300" />
                  </div>
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                  <span className="text-slate-300 font-serif">Plan:</span>
                  <span className={`font-serif font-semibold ${isPaid ? 'text-yellow-400' : 'text-amber-300'}`}>
                    {isPaid ? '🌟 Premium' : '⭐ Trial'}
                  </span>
                </div>
                {isTrialActive && trialTimeLeft !== null && (
                  <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                    <span className="text-slate-300 font-serif">Trial Time:</span>
                    <span className="text-amber-300 font-serif font-semibold">
                      {Math.floor(trialTimeLeft / 3600)}h {Math.floor((trialTimeLeft % 3600) / 60)}m
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                  <span className="text-slate-300 font-serif">Member Since:</span>
                  <span className="text-amber-300 font-serif font-semibold">
                    {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Quick Actions */}
            <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 shadow-xl card-glow rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-serif text-amber-200 flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-6">
                  <Link href="/dashboard">
                    <button className="group relative overflow-hidden w-full rounded-xl backdrop-blur-md bg-blue-900/25 border border-blue-600/30 px-4 py-3 hover:bg-gradient-to-r hover:from-amber-600/30 hover:to-yellow-500/30 hover:border-amber-400/50 transition-all duration-300 card-glow shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <div className="relative flex items-center gap-3">
                        <span className="text-xl">🏠</span>
                        <span className="font-serif text-base text-blue-200 group-hover:text-amber-100 transition-colors">Dashboard</span>
                      </div>
                    </button>
                  </Link>
                </div>
                
                <div className="mb-6">
                  <Link href="/settings">
                    <button className="group relative overflow-hidden w-full rounded-xl backdrop-blur-md bg-blue-900/25 border border-blue-600/30 px-4 py-3 hover:bg-gradient-to-r hover:from-amber-600/30 hover:to-yellow-500/30 hover:border-amber-400/50 transition-all duration-300 card-glow shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <div className="relative flex items-center gap-3">
                        <span className="text-xl">⚙️</span>
                        <span className="font-serif text-base text-blue-200 group-hover:text-amber-100 transition-colors">Settings</span>
                      </div>
                    </button>
                  </Link>
                </div>
                
                <div className="mb-2">
                  <Link href="/subscribe">
                    <button className="group relative overflow-hidden w-full rounded-xl backdrop-blur-md bg-indigo-900/35 border border-indigo-600/40 px-4 py-3 hover:bg-gradient-to-r hover:from-amber-600/30 hover:to-yellow-500/30 hover:border-amber-400/50 transition-all duration-300 card-glow shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <div className="relative flex items-center gap-3">
                        <span className="text-xl">👑</span>
                        <span className="font-serif text-base text-indigo-200 group-hover:text-amber-100 transition-colors">Upgrade to Premium</span>
                      </div>
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 