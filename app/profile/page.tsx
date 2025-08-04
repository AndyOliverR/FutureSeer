"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, User, Calendar, MapPin, Mail, Edit3, Save, X, LogOut, Crown } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { usePlan } from "@/hooks/usePlan"
import { getUserProfile, updateUserProfile } from "@/lib/firebase"

export default function ProfilePage() {
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
    }
  }, [userProfile])

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
      setSuccess("Profile updated successfully!")
      setIsEditing(false)
    } catch (error: any) {
      setError(error.message || "Failed to update profile")
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
    <div className="min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
         style={{ backgroundImage: "url('/images/starfield-bg.png')" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/40" />
      
      <div className="relative z-10 p-4 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-amber-200 hover:text-amber-300 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-serif">Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
              Your Profile
            </h1>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 shadow-xl card-glow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-serif text-amber-200">Personal Information</CardTitle>
                    <CardDescription className="text-slate-300 font-serif">
                      Update your details for personalized cosmic insights
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="border-amber-400/30 text-amber-300 hover:bg-amber-400/10"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-800/30"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Error/Success Alerts */}
                {error && (
                  <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                    <AlertDescription className="text-red-300 font-serif">{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="border-green-500/30 bg-green-500/10">
                    <AlertDescription className="text-green-300 font-serif">{success}</AlertDescription>
                  </Alert>
                )}

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-amber-200 font-serif flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Display Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="bg-slate-800/50 border-slate-600 text-amber-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 input-glow"
                      placeholder="Enter your display name"
                    />
                  ) : (
                    <div className="p-3 bg-slate-800/30 border border-slate-600 rounded-md text-amber-100 font-serif">
                      {formData.displayName || "Not set"}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 font-serif">Used for display purposes</p>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-amber-200 font-serif flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="bg-slate-800/50 border-slate-600 text-amber-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 input-glow"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="p-3 bg-slate-800/30 border border-slate-600 rounded-md text-amber-100 font-serif">
                      {formData.fullName || "Not set"}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 font-serif">Used for numerological and other calculations</p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-amber-200 font-serif flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <div className="p-3 bg-slate-800/30 border border-slate-600 rounded-md text-amber-100 font-serif w-full">
                    {formData.email}
                  </div>
                  <p className="text-xs text-slate-400 font-serif">Email cannot be changed</p>
                </div>

                {/* Birth Date */}
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-amber-200 font-serif flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Birth Date
                  </Label>
                  {isEditing ? (
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="bg-slate-800/50 border-slate-600 text-amber-100 focus:border-amber-400 focus:ring-amber-400/20 input-glow"
                    />
                  ) : (
                    <div className="p-3 bg-slate-800/30 border border-slate-600 rounded-md text-amber-100 font-serif">
                      {formData.birthDate ? new Date(formData.birthDate).toLocaleDateString() : "Not set"}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 font-serif">Used for accurate astrological readings</p>
                </div>

                {/* Birth Time */}
                <div className="space-y-2">
                  <Label htmlFor="birthTime" className="text-amber-200 font-serif flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Birth Time
                  </Label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        id="birthTime"
                        type="time"
                        value={formData.birthTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
                        className="bg-slate-800/50 border-slate-600 text-amber-100 focus:border-amber-400 focus:ring-amber-400/20 input-glow flex-1"
                      />
                      <select
                        value={formData.birthTimeAMPM}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthTimeAMPM: e.target.value }))}
                        className="bg-slate-800/50 border border-slate-600 text-amber-100 focus:border-amber-400 focus:ring-amber-400/20 rounded-md px-3 py-2"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-800/30 border border-slate-600 rounded-md text-amber-100 font-serif">
                      {formData.birthTime ? `${formData.birthTime} ${formData.birthTimeAMPM}` : "Not set"}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 font-serif">Used for precise astrological calculations</p>
                </div>

                {/* Birth Place */}
                <div className="space-y-2">
                  <Label htmlFor="birthPlace" className="text-amber-200 font-serif flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Birth Place
                  </Label>
                  {isEditing ? (
                    <Input
                      id="birthPlace"
                      value={formData.birthPlace}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
                      className="bg-slate-800/50 border-slate-600 text-amber-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 input-glow"
                      placeholder="City, Country (e.g., New York, USA)"
                    />
                  ) : (
                    <div className="p-3 bg-slate-800/30 border border-slate-600 rounded-md text-amber-100 font-serif">
                      {formData.birthPlace || "Not set"}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 font-serif">Used for precise astrological calculations</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Account Status */}
            <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 shadow-xl card-glow">
              <CardHeader>
                <CardTitle className="text-lg font-serif text-amber-200 flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-serif">Plan:</span>
                  <span className={`font-serif ${isPaid ? 'text-yellow-400' : 'text-amber-300'}`}>
                    {isPaid ? 'Premium' : 'Trial'}
                  </span>
                </div>
                {isTrialActive && trialTimeLeft !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-serif">Trial Time:</span>
                    <span className="text-amber-300 font-serif">
                      {Math.floor(trialTimeLeft / 3600)}h {Math.floor((trialTimeLeft % 3600) / 60)}m
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-serif">Member Since:</span>
                  <span className="text-amber-300 font-serif">
                    {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 shadow-xl card-glow">
              <CardHeader>
                <CardTitle className="text-lg font-serif text-amber-200">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full border-amber-400/30 text-amber-300 hover:bg-amber-400/10">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800/30">
                    Settings
                  </Button>
                </Link>
                <Link href="/subscribe">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400">
                    Upgrade to Premium
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 