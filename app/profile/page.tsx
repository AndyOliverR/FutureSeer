"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { devLog } from '@/lib/devLogger';
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, User, Calendar, Clock, MapPin, Mail, Edit3, Save, X, LogOut, Crown, Camera, Hand, Sparkles, Heart, Users } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { TIME_PERIODS, type BirthTimePeriodId } from "@/lib/birthTimeResolver"
import { useAuth } from "@/hooks/use-auth"
import { usePlan } from "@/hooks/usePlan"
import { getUserProfile, updateUserProfile, resetProfileGenerationStatus, hasProfileDataChanged, calculateProfileDataHash, cleanupCorruptedBirthTime, clearUserProfileCache, type UserProfile } from "@/lib/firebase"
import { clearComprehensiveMysticalProfileCache, clearPersistentProfileCache } from "@/hooks/useComprehensiveMysticalProfile"
import { ImageUploadSection } from "@/components/ImageUploadSection"
import { geocodePlace } from "@/services/geocoding"
import { SubscriptionStatus } from "@/components/SubscriptionStatus"
import { PaymentMethodCapture } from "@/components/PaymentMethodCapture"
import { ReferralCodeCard } from "@/components/ReferralCodeCard"
import { Header } from "@/components/header"
import { RETURNING_USER_WITH_REPORTS_DESTINATION } from "@/lib/authRouting"

export default function ProfilePage() {
  const { t } = useTranslation('common')
  const { user, userProfile, signOut, loading: authLoading, refreshProfile } = useAuth()
  const { isPaid, isTrialActive, trialTimeLeft } = usePlan()
  const router = useRouter()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false)
  const [profileGenerationStatus, setProfileGenerationStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [profileDataChanged, setProfileDataChanged] = useState(false)
  const [birthTimeCorrupted, setBirthTimeCorrupted] = useState(false)
  const [profileFetching, setProfileFetching] = useState(false)
  const [showUpdatePaymentModal, setShowUpdatePaymentModal] = useState(false)
  const lastGenerateClickRef = useRef<number>(0)

  // Form state
  const [formData, setFormData] = useState({
    displayName: "",
    fullName: "",
    email: "",
    gender: undefined as 'male' | 'female' | 'non-binary' | undefined,
    birthDate: "",
    birthTime: "",
    birthTimeAMPM: "AM",
    birthTimeKnown: false,
    birthTimePeriod: undefined as BirthTimePeriodId | undefined,
    birthTimeNote: "",
    birthPlace: "",
    currentLocation: "",
    facePhoto: null as File | null,
    facePhotoUrl: "",
    palmPhoto: null as File | null,
    palmPhotoUrl: "",
    // Personal context
    relationshipStatus: undefined as 'single' | 'in-relationship' | 'married' | 'divorced' | 'widowed' | 'prefer-not-to-say' | undefined,
    hasChildren: undefined as boolean | undefined,
    numberOfChildren: undefined as number | undefined,
    // Divination interests
    divinationInterests: [] as string[],
    // Notification preferences
    notificationPreferences: {
      dailyInsights: true,
      weeklyPredictions: true,
      monthlyHoroscope: true,
      communityUpdates: false,
      newFeatures: true
    }
  })

  // Display values for view mode: prefer userProfile so first paint shows data before sync effect runs
  const displayBirthTime = useMemo(() => {
    const raw = userProfile?.birthTime
    if (!raw || /^\d{13,}$/.test(String(raw))) return ""
    let time = String(raw)
    let ampm = "AM"
    const timeParts = time.split(":")
    if (timeParts.length >= 2) {
      const hour = parseInt(timeParts[0], 10)
      if (hour >= 12) {
        ampm = "PM"
        if (hour > 12) time = `${hour - 12}:${timeParts[1]}`
        else time = `12:${timeParts[1]}`
      } else {
        if (hour === 0) time = `12:${timeParts[1]}`
        else time = `${hour}:${timeParts[1]}`
      }
    }
    return time ? `${time} ${ampm}` : ""
  }, [userProfile?.birthTime])

  const displayBirthTimeKnown = userProfile?.birthTimeKnown ?? formData.birthTimeKnown
  const displayBirthTimePeriod = userProfile?.birthTimePeriod ?? formData.birthTimePeriod

  // One-time coordinate migration for existing users
  useEffect(() => {
    if (userProfile?.birthPlace && !userProfile?.birthLatitude && user?.uid) {
      devLog.debug(`📍 Migrating coordinates for existing user: ${userProfile.birthPlace}`);
      geocodePlace(userProfile.birthPlace).then(coords => {
        if (coords) {
          updateUserProfile(user.uid, {
            birthLatitude: coords.latitude,
            birthLongitude: coords.longitude,
            coordinatesResolvedAt: Date.now()
          });
          devLog.debug(`📍 Migration completed for ${userProfile.birthPlace}:`, coords);
        }
      }).catch(error => {
        devLog.warn('📍 Migration failed:', error, 'page');
      });
    }
  }, [userProfile?.birthPlace, userProfile?.birthLatitude, user?.uid]);

  // Always refresh profile data on mount/navigation so the page has fresh data when opened
  useEffect(() => {
    if (user && !authLoading) {
      setProfileFetching(true);
      refreshProfile()
        .catch(err => {
          devLog.error('Failed to refresh profile on mount:', err, 'page');
        })
        .finally(() => setProfileFetching(false));
    }
  }, [user?.uid, authLoading]); // Remove refreshProfile from deps to prevent loops

  // Load user data when component mounts or when userProfile changes (but not when editing)
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    // Load data when profile is available
    if (userProfile && !isEditing) {
      // Parse birth time to separate time and AM/PM
      let birthTime = String(userProfile.birthTime || "")
      let birthTimeAMPM = "AM"
      
      // Detect and clear corrupted timestamp
      if (/^\d{13,}$/.test(birthTime)) {
        devLog.warn('⚠️ Corrupted birth time detected, clearing:', birthTime, 'page');
        setBirthTimeCorrupted(true);
        setError('Your birth time data was corrupted. Please re-enter your birth time.');
        birthTime = '';
        // Auto-save the cleared value
        if (user?.uid) {
          updateUserProfile(user.uid, { birthTime: '' }).catch((error: any) => {
            // Suppress Firestore internal assertion errors
            if (error?.message?.includes('INTERNAL ASSERTION FAILED') || 
                error?.message?.includes('FIRESTORE')) {
              devLog.warn('⚠️ Firestore internal error suppressed during birth time cleanup:', error.message, 'page')
            } else {
              devLog.error('❌ Failed to auto-fix birth time:', error, 'page')
            }
          })
        }
      } else {
        setBirthTimeCorrupted(false);
        setError(null);
      }
      
      if (birthTime) {
        // If time is in 24-hour format, convert to 12-hour with AM/PM
        const timeParts = birthTime.split(':')
        if (timeParts.length >= 2) {
          const hour = parseInt(timeParts[0])
          if (hour >= 12) {
            birthTimeAMPM = "PM"
                      if (hour > 12) {
            birthTime = `${hour - 12}:${timeParts[1]}`
          } else {
            birthTime = `12:${timeParts[1]}`
          }
        } else {
          birthTimeAMPM = "AM"
          if (hour === 0) {
            birthTime = `12:${timeParts[1]}`
          } else {
            birthTime = `${hour}:${timeParts[1]}`
          }
        }
        }
      }
      
      // Ensure display name is properly set - if it's empty or matches full name, use "AnDY"
      let displayName = userProfile.displayName || ""
      if (!displayName || displayName === userProfile.fullName) {
        devLog.debug('🔧 Auto-fixing displayName from full name to "AnDY"');
        displayName = "AnDY"
        // Update Firestore with the fixed display name
        if (user?.uid) {
          updateUserProfile(user.uid, { displayName: "AnDY" }).then(() => {
            devLog.debug('✅ Display name auto-fixed in Firestore');
          }).catch((error: any) => {
            // Suppress Firestore internal assertion errors
            if (error?.message?.includes('INTERNAL ASSERTION FAILED') || 
                error?.message?.includes('FIRESTORE')) {
              devLog.warn('⚠️ Firestore internal error suppressed during display name fix:', error.message, 'page')
            } else {
              devLog.error('❌ Failed to auto-fix display name:', error, 'page');
            }
          });
        }
      }
      
      // Use email from auth user first (more reliable), fallback to profile
      const email = user?.email || userProfile.email || ""
      
      // Debug logging for loaded data
      devLog.debug('🔍 Debug - Loading profile data:', {
        displayName: displayName,
        fullName: userProfile.fullName,
        email: email,
        gender: userProfile.gender,
        birthDate: userProfile.birthDate,
        birthTime: birthTime,
        birthPlace: userProfile.birthPlace,
        currentLocation: userProfile.currentLocation,
        facePhotoUrl: userProfile.facePhotoUrl,
        palmPhotoUrl: userProfile.palmPhotoUrl,
      });

      setFormData({
        displayName: displayName,
        fullName: userProfile.fullName || "",
        email: email,
        gender: userProfile.gender || undefined,
        birthDate: userProfile.birthDate || "",
        birthTime: birthTime,
        birthTimeAMPM: birthTimeAMPM,
        birthTimeKnown: userProfile.birthTimeKnown || false,
        birthTimePeriod: userProfile.birthTimePeriod || undefined,
        birthTimeNote: userProfile.birthTimeNote || "",
        birthPlace: userProfile.birthPlace || "",
        currentLocation: userProfile.currentLocation || "",
        facePhoto: null,
        facePhotoUrl: userProfile.facePhotoUrl || "",
        palmPhoto: null,
        palmPhotoUrl: userProfile.palmPhotoUrl || "",
        // Personal context (will be moved to Settings)
        relationshipStatus: userProfile.relationshipStatus || undefined,
        hasChildren: userProfile.hasChildren || undefined,
        numberOfChildren: userProfile.numberOfChildren || undefined,
        // Divination interests (will be moved to Settings)
        divinationInterests: userProfile.divinationInterests || [],
        // Notification preferences (will be moved to Settings)
        notificationPreferences: {
          dailyInsights: userProfile.notificationPreferences?.dailyInsights ?? true,
          weeklyPredictions: userProfile.notificationPreferences?.weeklyPredictions ?? true,
          monthlyHoroscope: userProfile.notificationPreferences?.monthlyHoroscope ?? true,
          communityUpdates: userProfile.notificationPreferences?.communityUpdates ?? false,
          newFeatures: userProfile.notificationPreferences?.newFeatures ?? true
        }
      })
      setHasUnsavedChanges(false)
    } else if (user?.email && !isEditing) {
      // If no userProfile but we have user data, set basic info
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
        displayName: prev.displayName || "AnDY" // Keep existing or default display name
      }))
    }
  }, [userProfile, user, authLoading, isEditing]) // Remove refreshProfile from deps to prevent loops

  // Check if profile data has changed when form data updates
  useEffect(() => {
    if (userProfile && formData) {
      const hasChanged = hasProfileDataChanged(userProfile, formData as Partial<UserProfile>)
      setProfileDataChanged(hasChanged)
    }
  }, [formData, userProfile])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin")
    }
  }, [user, authLoading, router])

  // Force refresh profile if there are Firebase permission errors
  useEffect(() => {
    // Early return if user is null (e.g., after sign out)
    if (!user || !user.uid) {
      return
    }

    // Don't set up timer if we're in the process of signing out
    if (authLoading) {
      return
    }

    const checkAndRefreshProfile = async () => {
      // Double-check user still exists (may have signed out during delay)
      if (!user || !user.uid || !userProfile) {
        return
      }

      // Check if we have permission errors by trying to fetch fresh data
      try {
        const freshProfile = await getUserProfile(user.uid)
        if (freshProfile && freshProfile.displayName !== userProfile.displayName) {
          devLog.debug('🔄 Profile data mismatch detected, refreshing...')
          await refreshProfile()
        }
      } catch (error: any) {
        // Only handle permission errors if user is still authenticated
        // If user has signed out, don't log or handle the error
        if (!user || !user.uid) {
          return
        }
        
        // Suppress Firestore internal assertion errors
        if (error?.message?.includes('INTERNAL ASSERTION FAILED') || 
            error?.message?.includes('FIRESTORE')) {
          devLog.warn('⚠️ Firestore internal error suppressed during profile check:', error.message, 'page')
          return
        }
        
        if (error.code === 'permission-denied') {
          devLog.debug('⚠️ Firebase permission error detected, using local data')
          // Force refresh to get local data
          try {
            await refreshProfile()
          } catch (refreshError: any) {
            // Suppress Firestore internal assertion errors
            if (refreshError?.message?.includes('INTERNAL ASSERTION FAILED') || 
                refreshError?.message?.includes('FIRESTORE')) {
              devLog.warn('⚠️ Firestore internal error suppressed during refresh:', refreshError.message, 'page')
            }
          }
        }
      }
    }

    // Check after a short delay to ensure initial load is complete
    const timer = setTimeout(checkAndRefreshProfile, 2000)
    return () => clearTimeout(timer)
  }, [user, userProfile, refreshProfile, authLoading])

  const handleSave = async () => {
    if (!user?.uid) return
    
    // Validate time format
    if (formData.birthTime && !/^\d{1,2}:\d{2}$/.test(formData.birthTime)) {
      setError("Please enter birth time in HH:MM format (e.g., 2:15)")
      return
    }
    
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Convert 12-hour time to 24-hour format for storage
      let birthTime24Hour = formData.birthTime
      if (formData.birthTime && formData.birthTimeAMPM) {
        const timeParts = String(formData.birthTime).split(':')
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
      
      // Debug logging for preferences
      devLog.debug('🔍 Debug - Saving profile data:', {
        divinationInterests: formData.divinationInterests,
        notificationPreferences: formData.notificationPreferences,
        relationshipStatus: formData.relationshipStatus,
        hasChildren: formData.hasChildren
      });

      // Geocode birthPlace if it changed
      let birthLatitude = userProfile?.birthLatitude;
      let birthLongitude = userProfile?.birthLongitude;

      if (formData.birthPlace && formData.birthPlace !== userProfile?.birthPlace) {
        try {
          devLog.debug(`📍 Geocoding birth place: ${formData.birthPlace}`);
          const coords = await geocodePlace(formData.birthPlace);
          if (coords) {
            birthLatitude = coords.latitude;
            birthLongitude = coords.longitude;
            devLog.debug(`📍 Geocoded ${formData.birthPlace}:`, coords);
          } else {
            devLog.warn(`📍 Failed to geocode: ${formData.birthPlace}`, undefined, 'page');
          }
        } catch (error) {
          devLog.warn('📍 Geocoding failed, coordinates not updated:', error, 'page');
        }
      }

      try {
        await updateUserProfile(user.uid, {
          displayName: formData.displayName,
          fullName: formData.fullName,
          gender: formData.gender,
          birthDate: formData.birthDate,
          birthTime: birthTime24Hour,
          birthTimeKnown: formData.birthTimeKnown,
          birthTimePeriod: formData.birthTimePeriod as UserProfile['birthTimePeriod'],
          birthTimeNote: formData.birthTimeNote,
          birthPlace: formData.birthPlace,
          birthLatitude,
          birthLongitude,
          coordinatesResolvedAt: birthLatitude ? Date.now() : undefined,
          currentLocation: formData.currentLocation,
          facePhotoUrl: formData.facePhotoUrl,
          palmPhotoUrl: formData.palmPhotoUrl
          // Note: Personal context, divination interests, and notification preferences
          // are now handled in the Settings page
        })
      } catch (firestoreError: any) {
        // Suppress Firestore internal assertion errors
        if (firestoreError?.message?.includes('INTERNAL ASSERTION FAILED') || 
            firestoreError?.message?.includes('FIRESTORE')) {
          devLog.warn('⚠️ Firestore internal error suppressed during profile save:', firestoreError.message, 'page')
          // Still try to continue - the operation may have succeeded
        } else {
          throw firestoreError
        }
      }
      
      // Reset profile generation status if data has changed
      if (profileDataChanged) {
        try {
          await resetProfileGenerationStatus(user.uid)
          devLog.debug('🔄 Profile data changed, resetting generation status')
          
          // Clear localStorage for all tools when profile changes
          const allTools = [
            'vedicAstrology', 'westernAstrology', 'kpAstrology',
            'medicalAstrology', 'financialAstrology', 'mundaneAstrology', 'horaryAstrology',
            'synastry', 'numerology', 'kabbalisticNumerology', 'angelNumbers',
            'tarot', 'lenormand', 'runes', 'iching', 'pendulum', 'geomancy',
            'palmistry', 'faceReading', 'nameAnalysis', 'dreamSymbols',
            'bazi', 'thirteenSignsZodiac', 'vastu', 'astroscribe'
          ]
          
          allTools.forEach(toolName => {
            localStorage.removeItem(`futureseer_${user.uid}_${toolName}`)
          })
          
          devLog.debug(`🗑️ Cleared localStorage for ${allTools.length} tools due to profile changes`)

          try {
            const token = await user.getIdToken()
            await fetch('/api/profile/invalidate-cache', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            })
          } catch (invErr) {
            devLog.warn('Invalidate cache request failed:', invErr, 'page')
          }
          clearUserProfileCache(user.uid)
          clearComprehensiveMysticalProfileCache(user.uid)
          clearPersistentProfileCache(user.uid)
          window.dispatchEvent(new CustomEvent('futureSeer:profileRegenerated'))
        } catch (resetError: any) {
          // Suppress Firestore internal assertion errors
          if (resetError?.message?.includes('INTERNAL ASSERTION FAILED') || 
              resetError?.message?.includes('FIRESTORE')) {
            devLog.warn('⚠️ Firestore internal error suppressed during reset:', resetError.message, 'page')
          } else {
            devLog.error('Error resetting profile generation status:', resetError, 'page')
          }
        }
      }
      
      setSuccess("Profile updated successfully!")
      setIsEditing(false)
      setHasUnsavedChanges(false)
      
      // Refresh profile after a short delay to ensure UI is updated
      // This prevents the form from being reset during the save operation
      setTimeout(async () => {
        try {
          await refreshProfile()
        } catch (refreshError: any) {
          // Suppress Firestore internal assertion errors during refresh
          if (refreshError?.message?.includes('INTERNAL ASSERTION FAILED') || 
              refreshError?.message?.includes('FIRESTORE')) {
            devLog.warn('⚠️ Firestore internal error suppressed during refresh:', refreshError.message, 'page')
          } else {
            devLog.error('Error refreshing profile:', refreshError, 'page')
          }
        }
      }, 500)
    } catch (error: any) {
      devLog.error('Profile save error:', error, 'page')
      // Don't show Firestore internal assertion errors to users
      if (error?.message?.includes('INTERNAL ASSERTION FAILED') || 
          error?.message?.includes('FIRESTORE')) {
        setError("Profile save completed, but there was a minor synchronization issue. Please refresh the page.")
      } else {
        setError("Failed to save profile. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (userProfile) {
      // Parse birth time to separate time and AM/PM
      let birthTime = String(userProfile.birthTime || "")
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
            } else {
              birthTime = `12:${timeParts[1]}`
            }
          } else {
            birthTimeAMPM = "AM"
            if (hour === 0) {
              birthTime = `12:${timeParts[1]}`
            } else {
              birthTime = `${hour}:${timeParts[1]}`
            }
          }
        }
      }
      
      setFormData({
        displayName: userProfile.displayName || "",
        fullName: userProfile.fullName || "",
        email: userProfile.email || "",
        gender: userProfile.gender || undefined,
        birthDate: userProfile.birthDate || "",
        birthTime: birthTime,
        birthTimeAMPM: birthTimeAMPM,
        birthTimeKnown: userProfile.birthTimeKnown || false,
        birthTimePeriod: userProfile.birthTimePeriod || undefined,
        birthTimeNote: userProfile.birthTimeNote || "",
        birthPlace: userProfile.birthPlace || "",
        currentLocation: userProfile.currentLocation || "",
        facePhoto: null,
        facePhotoUrl: userProfile.facePhotoUrl || "",
        palmPhoto: null,
        palmPhotoUrl: userProfile.palmPhotoUrl || "",
        // Personal context
        relationshipStatus: userProfile.relationshipStatus || undefined,
        hasChildren: userProfile.hasChildren || undefined,
        numberOfChildren: userProfile.numberOfChildren || undefined,
        // Divination interests
        divinationInterests: userProfile.divinationInterests || [],
        // Notification preferences
        notificationPreferences: {
          dailyInsights: userProfile.notificationPreferences?.dailyInsights ?? true,
          weeklyPredictions: userProfile.notificationPreferences?.weeklyPredictions ?? true,
          monthlyHoroscope: userProfile.notificationPreferences?.monthlyHoroscope ?? true,
          communityUpdates: userProfile.notificationPreferences?.communityUpdates ?? false,
          newFeatures: userProfile.notificationPreferences?.newFeatures ?? true
        }
      })
    }
    setIsEditing(false)
    setError(null)
    setHasUnsavedChanges(false)
  }

  // Track form changes
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleSignOut = async () => {
    try {
      // signOut will reload the page automatically, no need for router.push
      await signOut()
    } catch (error) {
      devLog.error("Sign out error:", error, 'page')
    }
  }

  const handleGenerateProfile = async () => {
    if (!user?.uid || !userProfile) {
      setError("Please complete your profile first")
      return
    }

    // Check if profile is already generated and data hasn't changed
    if (userProfile.mysticalProfileGenerated && !profileDataChanged) {
      setError("Your mystical profile has already been generated. Edit your profile details to regenerate.")
      return
    }

    // Block duplicate clicks within 3 seconds
    const now = Date.now()
    if (now - lastGenerateClickRef.current < 3000) {
      return
    }
    lastGenerateClickRef.current = now

    setIsGeneratingProfile(true)
    setProfileGenerationStatus("Locking profile generation...")
    setError(null)
    setSuccess(null)

    try {
      devLog.debug('🌟 Generating mystical profile: running ALL tools atomically...')
      setProfileGenerationStatus("Running all tools (Vedic, Tarot, Numerology, and more)...")

      const token = await user.getIdToken()
      const res = await fetch('/api/profile/generate-mystical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Generation failed: ${res.status}`)
      }

      // API returned already-generated (idempotent): no generation ran
      if (data.alreadyGenerated) {
        setProfileGenerationStatus(null)
        setSuccess("Profile already up to date. No regeneration needed.")
        await refreshProfile()
        return
      }

      devLog.debug('✅ Profile generation complete:', data.systemsUsed?.length || 0, 'tools ran')
      if (data.failedTools?.length) {
        devLog.warn('Some tools failed:', data.failedTools, 'page')
      }

      window.dispatchEvent(new CustomEvent('futureSeer:profileRegenerated'))

      setProfileGenerationStatus("✅ Mystical profile generated successfully!")
      setSuccess(
        "Your mystical profile has been generated with insights from all tools. " +
        "Each tool page will show its report when you visit. Ask the Seer has comprehensive data."
      )

      // Refresh profile so UI shows mysticalProfileGenerated
      await refreshProfile()

      setTimeout(() => router.push(RETURNING_USER_WITH_REPORTS_DESTINATION), 2000)
    } catch (error: any) {
      devLog.error('Profile generation error:', error, 'page')
      setError(`Failed to generate mystical profile: ${error.message}`)
      setProfileGenerationStatus(null)
    } finally {
      setIsGeneratingProfile(false)
    }
  }

  // Handle image changes
  const handleFaceImageChange = (file: File, previewUrl: string) => {
    setFormData(prev => ({
      ...prev,
      facePhoto: file,
      facePhotoUrl: previewUrl
    }))
    setHasUnsavedChanges(true)
  }

  const handlePalmImageChange = (file: File, previewUrl: string) => {
    setFormData(prev => ({
      ...prev,
      palmPhoto: file,
      palmPhotoUrl: previewUrl
    }))
    setHasUnsavedChanges(true)
  }

  const handleFaceImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      facePhoto: null,
      facePhotoUrl: ""
    }))
    setHasUnsavedChanges(true)
  }

  const handlePalmImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      palmPhoto: null,
      palmPhotoUrl: ""
    }))
    setHasUnsavedChanges(true)
  }

  if (authLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden starfield-ultra-sharp">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--m3-primary)] mx-auto mb-4"></div>
            <p className="text-[var(--m3-primary)] m3-body-large">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  if (profileFetching) {
    return (
      <div className="relative min-h-screen overflow-hidden starfield-ultra-sharp">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--m3-primary)] mx-auto mb-4"></div>
            <p className="text-[var(--m3-primary)] m3-body-large">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden starfield-ultra-sharp">
      <Header />
      <div className="relative z-10 px-3 sm:px-4 md:px-6 py-4 max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-3 text-amber-400 hover:text-amber-400/80 m3-transition-standard mb-8 group"
          >
            <div className="p-2 rounded-full bg-[var(--m3-primary-container)] border border-[var(--m3-primary)]/20 group-hover:bg-[var(--m3-primary-container)]/80 group-hover:border-[var(--m3-primary)]/40 m3-transition-standard">
              <ArrowLeft className="w-4 h-4 text-[var(--m3-primary)] group-hover:-translate-x-1 m3-transition-standard" />
            </div>
            <span className="m3-label-large">{t('navigation.backToDashboard')}</span>
          </Link>
          
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🌟</div>
                <h1 className="m3-headline-large font-serif text-amber-400">
                  {t('profile.cosmicProfile')}
                </h1>
              </div>
              <p className="text-white/80 m3-body-medium ml-12">
                {t('profile.mysticalJourney')}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative flex items-center gap-3 px-6 py-3">
                <div className="p-2 rounded-full bg-slate-800/50 border border-amber-500/30 group-hover:border-amber-500/50 transition-all duration-300">
                  <LogOut className="w-4 h-4 text-amber-400" />
                </div>
                <span className="m3-label-large text-amber-400 transition-all duration-300">{t('navigation.signOut')}</span>
              </div>
            </button>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Payment & subscription */}
          {userProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="m3-headline-small font-serif text-amber-400 mb-2">Payment & subscription</h2>
              <p className="text-white/80 m3-body-small mb-3">View and manage your contribution plan and payment method</p>
              <SubscriptionStatus
                userProfile={userProfile}
                onCancel={async () => {
                  await refreshProfile();
                }}
                onUpdatePaymentClick={() => setShowUpdatePaymentModal(true)}
              />
            </motion.div>
          )}

          {/* Referral Code Section */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              id="referral"
            >
              <div className="mb-4">
                <h2 className="m3-headline-small font-serif text-amber-400 mb-2">Your Referral Code</h2>
                <p className="text-white/80 m3-body-small">Share with friends and earn free months</p>
              </div>
              <ReferralCodeCard userId={user.uid} />
            </motion.div>
          )}

          {/* Enhanced Main Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card elevation={2} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-[var(--m3-primary-container)] border border-[var(--m3-primary)]/30">
                        <User className="w-5 h-5 text-[var(--m3-primary)]" />
                      </div>
                      <CardTitle className="m3-headline-medium font-serif text-amber-400">{t('profile.personalInformation')}</CardTitle>
                    </div>
                    <CardDescription className="text-white/80 m3-body-large">
                      Update your cosmic blueprint for personalized insights
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <div className="flex gap-3">
                      <Button
                        onClick={async () => {
                          setIsLoading(true)
                          try {
                            await refreshProfile()
                            setSuccess("Profile refreshed successfully!")
                          } catch (error) {
                            setError("Failed to refresh profile")
                          } finally {
                            setIsLoading(false)
                          }
                        }}
                        variant="outline"
                        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 text-amber-400 group rounded-xl"
                        disabled={isLoading}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-slate-800/50 border border-amber-500/30 group-hover:border-amber-500/50 transition-all duration-300">
                            <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''} text-amber-400`} />
                          </div>
                          <span className="m3-label-large">Refresh</span>
                        </div>
                      </Button>
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 text-amber-400 group rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-slate-800/50 border border-amber-500/30 group-hover:border-amber-500/50 transition-all duration-300">
                            <Edit3 className="w-4 h-4 text-amber-400" />
                          </div>
                          <span className="m3-label-large">{t('profile.editProfile')}</span>
                        </div>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      {hasUnsavedChanges && (
                        <div className="flex items-center gap-2 text-[var(--m3-primary)] m3-label-small bg-[var(--m3-primary-container)] px-3 py-1 rounded-lg border border-[var(--m3-primary)]/30">
                          <div className="w-2 h-2 bg-[var(--m3-primary)] rounded-full animate-pulse"></div>
                          Unsaved changes
                        </div>
                      )}
                      <div className="flex gap-4">
                        <button
                          onClick={handleSave}
                          disabled={isLoading || !hasUnsavedChanges}
                          className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 text-amber-400 m3-label-large font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 text-amber-400 m3-label-large font-semibold"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          <div className="relative flex items-center justify-center gap-2">
                            <X className="w-4 h-4 transition-transform group-hover:scale-110" />
                            <span className="transition-transform group-hover:scale-105">Cancel</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8 relative z-10">
                {/* Error/Success Alerts */}
                {error && (
                  <Alert variant="destructive" className="border-[var(--m3-secondary)]/30 bg-[var(--m3-secondary-container)] backdrop-blur-sm">
                    <AlertDescription className="text-[var(--m3-secondary)] m3-body-medium">{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] backdrop-blur-sm">
                    <AlertDescription className="text-[var(--m3-on-surface)] m3-body-medium">{success}</AlertDescription>
                  </Alert>
                )}

                {/* Birth Time Corruption Warning */}
                {birthTimeCorrupted && (
                  <Alert variant="default" className="border-[var(--m3-tertiary)]/30 bg-[var(--m3-tertiary-container)] backdrop-blur-sm">
                    <AlertDescription className="text-[var(--m3-tertiary)] m3-body-medium">
                      ⚠️ Your birth time data needs to be re-entered. Please enter your correct birth time below.
                    </AlertDescription>
                  </Alert>
                )}

                {user && !userProfile ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--m3-primary)] border-t-transparent" />
                    <p className="text-[var(--m3-on-surface-variant)] m3-body-medium">Loading personal information...</p>
                  </div>
                ) : (
                  <>
                {/* Display Name */}
                <div className="space-y-3">
                  <Label htmlFor="displayName" className="text-amber-400 m3-title-medium flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-slate-800/50 border border-amber-500/30">
                      <User className="w-4 h-4 text-amber-400" />
                    </div>
                    Display Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => handleFormChange('displayName', e.target.value)}
                      className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard"
                      placeholder="Enter your display name"
                    />
                  ) : (
                    <div className="p-4 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl text-white/80 m3-body-medium backdrop-blur-sm">
                      {(userProfile?.displayName ?? formData.displayName) || "Not set"}
                    </div>
                  )}
                </div>

                {/* Full Name */}
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="text-amber-400 m3-title-medium flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-slate-800/50 border border-amber-500/30">
                      <User className="w-4 h-4 text-amber-400" />
                    </div>
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleFormChange('fullName', e.target.value)}
                      className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="p-4 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl text-white/80 m3-body-medium backdrop-blur-sm">
                      {(userProfile?.fullName ?? formData.fullName) || "Not set"}
                    </div>
                  )}
                </div>

                {/* Gender Selection */}
                <div className="space-y-3">
                  <Label htmlFor="gender" className="text-amber-400 m3-title-medium flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-slate-800/50 border border-amber-500/30">
                      <User className="w-4 h-4 text-amber-400" />
                    </div>
                    Gender Identity
                  </Label>
                  {isEditing ? (
                    <select
                      id="gender"
                      value={formData.gender || ""}
                      onChange={(e) => handleFormChange('gender', e.target.value as 'male' | 'female' | 'non-binary' | undefined)}
                      className="bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] rounded-lg px-4 py-2 backdrop-blur-sm m3-input-focus m3-transition-standard"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                    </select>
                  ) : (
                    <div className="p-4 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl text-white/80 m3-body-medium backdrop-blur-sm">
                      {(() => {
                        const g = userProfile?.gender ?? formData.gender
                        return g ? g.charAt(0).toUpperCase() + g.slice(1) : "Not set"
                      })()}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <Label className="text-amber-400 m3-title-medium flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-slate-800/50 border border-amber-500/30">
                      <Mail className="w-4 h-4 text-amber-400" />
                    </div>
                    Email
                  </Label>
                  <div className="p-4 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl text-white/80 m3-body-medium backdrop-blur-sm">
                    {(user?.email || userProfile?.email) ?? formData.email}
                  </div>
                  <p className="m3-body-small text-[var(--m3-on-surface-variant)] italic">🔒 Email cannot be changed</p>
                </div>

                {/* Birth Date */}
                <div className="space-y-3">
                  <Label htmlFor="birthDate" className="text-amber-400 m3-title-medium flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-slate-800/50 border border-amber-500/30">
                      <Calendar className="w-4 h-4 text-amber-400" />
                    </div>
                    Birth Date
                  </Label>
                  {isEditing ? (
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleFormChange('birthDate', e.target.value)}
                      className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard [color-scheme:dark]"
                    />
                  ) : (
                    <div className="p-4 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl text-white/80 m3-body-medium backdrop-blur-sm">
                      {(() => {
                        const d = userProfile?.birthDate ?? formData.birthDate
                        return d ? new Date(d).toLocaleDateString() : "Not set"
                      })()}
                    </div>
                  )}
                </div>

                {/* Birth Time Section */}
                <div className="space-y-4">
                  <h3 className="m3-title-medium font-semibold text-amber-400 flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-slate-800/50 border border-amber-500/30">
                      <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    Birth Time
                  </h3>
                  
                  {/* Toggle: Do you know your exact birth time? */}
                  {isEditing && (
                    <div className="flex items-center gap-3 p-4 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl">
                      <Switch
                        checked={formData.birthTimeKnown}
                        onCheckedChange={(checked) => handleFormChange('birthTimeKnown', checked)}
                      />
                      <label className="text-[var(--m3-on-surface-variant)] m3-body-medium">I know my exact birth time</label>
                    </div>
                  )}
                  
                  {/* Exact Time Input (if known) */}
                  {displayBirthTimeKnown && (
                    <div className="space-y-3">
                      <label className="m3-body-small text-[var(--m3-on-surface-variant)]">Exact Birth Time</label>
                      {isEditing ? (
                        <div className="flex gap-3">
                          <Input
                            type="text"
                            value={formData.birthTime}
                            onChange={(e) => {
                              // Only allow valid time format (HH:MM)
                              const value = e.target.value;
                              if (/^\d{0,2}:?\d{0,2}$/.test(value) || value === '') {
                                handleFormChange('birthTime', value);
                              }
                            }}
                            placeholder="HH:MM"
                            className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard flex-1 [color-scheme:dark]"
                          />
                          <select
                            value={formData.birthTimeAMPM}
                            onChange={(e) => handleFormChange('birthTimeAMPM', e.target.value)}
                            className="bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] rounded-lg px-4 py-2 backdrop-blur-sm m3-input-focus m3-transition-standard"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      ) : (
                        <div className="p-4 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl text-white/80 m3-body-medium backdrop-blur-sm">
                          {displayBirthTime || (formData.birthTime ? `${formData.birthTime} ${formData.birthTimeAMPM}` : "") || "Not set"}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Time Period Selection (if time unknown) */}
                  {!displayBirthTimeKnown && (
                    <div className="space-y-4">
                      <label className="m3-body-small text-[var(--m3-on-surface-variant)]">
                        Select the time period when you were born:
                      </label>
                      
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {TIME_PERIODS.map((period) => (
                            <button
                              key={period.id}
                              onClick={() => handleFormChange('birthTimePeriod', period.id)}
                              className={`
                                p-4 rounded-xl border text-left transition-all duration-300
                                ${formData.birthTimePeriod === period.id
                                  ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-amber-500/50 text-amber-400'
                                  : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-amber-500/30 text-white/80 hover:border-amber-500/50 hover:text-amber-400'
                                }
                              `}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">{period.icon}</span>
                                <div className="flex-1">
                                  <div className="font-semibold text-amber-400">
                                    {period.label}
                                  </div>
                                  <div className="m3-body-small text-white/80 mt-1">
                                    {period.description}
                                  </div>
                                  <div className="m3-body-small text-[var(--m3-on-surface-variant)]/70 mt-2">
                                    Technique: {period.vedicTechnique === 'sunrise' ? 'Sunrise Chart' : 
                                               period.vedicTechnique === 'noon' ? 'Noon Chart' :
                                               period.vedicTechnique === 'sunset' ? 'Sunset Chart' : 
                                               'Moon Chart'}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl text-white/80 m3-body-medium backdrop-blur-sm">
                          {(() => {
                            const periodId = displayBirthTimePeriod
                            const period = periodId ? TIME_PERIODS.find(p => p.id === periodId) : null
                            return period ? (
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{period.icon}</span>
                                <div>
                                  <div className="font-semibold">{period.label}</div>
                                  <div className="m3-body-small text-[var(--m3-on-surface-variant)]">{period.description}</div>
                                </div>
                              </div>
                            ) : "Not set"
                          })()}
                        </div>
                      )}
                      
                      <Alert className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)]">
                        <AlertDescription className="text-[var(--m3-on-surface-variant)] m3-body-small">
                          💡 <strong>What's this?</strong> Since you don't know your exact birth time, 
                          we'll use traditional Vedic techniques based on the time period you select. 
                          The chart will still provide valuable insights, though it may be less accurate 
                          for house-based predictions.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  
                  {/* Optional Note */}
                  {isEditing && (
                    <div className="space-y-2">
                      <label className="m3-body-small text-[var(--m3-on-surface-variant)]">Additional Information (Optional)</label>
                      <textarea
                        value={formData.birthTimeNote}
                        onChange={(e) => handleFormChange('birthTimeNote', e.target.value)}
                        placeholder="E.g., 'My mother said it was around breakfast time' or 'Birth certificate says PM but not exact hour'"
                        className="w-full p-3 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-lg text-[var(--m3-on-surface)] m3-body-small m3-input-focus"
                        rows={3}
                      />
                    </div>
                  )}
                  
                  {!isEditing && (userProfile?.birthTimeNote ?? formData.birthTimeNote) && (
                    <div className="space-y-2">
                      <label className="m3-body-small text-[var(--m3-on-surface-variant)]">Additional Information</label>
                      <div className="p-4 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl text-[var(--m3-on-surface)] m3-body-medium backdrop-blur-sm">
                        {userProfile?.birthTimeNote ?? formData.birthTimeNote}
                      </div>
                    </div>
                  )}
                </div>

                {/* Birth Place */}
                <div className="space-y-3">
                  <Label htmlFor="birthPlace" className="text-amber-400 m3-title-medium flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-slate-800/50 border border-amber-500/30">
                      <MapPin className="w-4 h-4 text-amber-400" />
                    </div>
                    Birth Place
                  </Label>
                  {isEditing ? (
                    <Input
                      id="birthPlace"
                      value={formData.birthPlace}
                      onChange={(e) => handleFormChange('birthPlace', e.target.value)}
                      className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard"
                      placeholder="City, Country (e.g., New York, USA)"
                    />
                  ) : (
                    <div className="p-4 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl text-white/80 m3-body-medium backdrop-blur-sm">
                      {(userProfile?.birthPlace ?? formData.birthPlace) || "Not set"}
                    </div>
                  )}
                </div>

                {/* Current Location */}
                <div className="space-y-3">
                  <Label htmlFor="currentLocation" className="text-amber-400 m3-title-medium flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-slate-800/50 border border-amber-500/30">
                      <MapPin className="w-4 h-4 text-amber-400" />
                    </div>
                    Current Location
                  </Label>
                  {isEditing ? (
                    <Input
                      id="currentLocation"
                      value={formData.currentLocation}
                      onChange={(e) => handleFormChange('currentLocation', e.target.value)}
                      className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard"
                      placeholder="City, Country (e.g., New York, USA)"
                    />
                  ) : (
                    <div className="p-4 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl text-white/80 m3-body-medium backdrop-blur-sm">
                      {(userProfile?.currentLocation ?? formData.currentLocation) || "Not set"}
                    </div>
                  )}
                </div>

                {/* Face Photo Upload */}
                <div className="space-y-3">
                  <ImageUploadSection
                    type="face"
                    currentImage={(userProfile?.facePhotoUrl ?? formData.facePhotoUrl) || ""}
                    onImageChange={handleFaceImageChange}
                    onImageRemove={handleFaceImageRemove}
                    gender={userProfile?.gender ?? formData.gender}
                    isEditing={isEditing}
                  />
                </div>

                {/* Palm Photo Upload */}
                <div className="space-y-3">
                  <ImageUploadSection
                    type="palm"
                    currentImage={(userProfile?.palmPhotoUrl ?? formData.palmPhotoUrl) || ""}
                    onImageChange={handlePalmImageChange}
                    onImageRemove={handlePalmImageRemove}
                    gender={userProfile?.gender ?? formData.gender}
                    isEditing={isEditing}
                  />
                </div>

                {/* Generate Mystical Profile Button */}
                {!isEditing && (
                  <div className="space-y-4 pt-6 border-t border-[var(--m3-outline-variant)]">
                    <div className="text-center space-y-3">
                      <h3 className="m3-headline-small font-serif text-amber-400 flex items-center justify-center gap-3">
                        <Sparkles className="w-6 h-6 text-amber-400" />
                        Ready to Generate Your Mystical Profile?
                      </h3>
                    </div>
                    
                    <Button
                      onClick={handleGenerateProfile}
                      disabled={
                        authLoading ||
                        isGeneratingProfile ||
                        !userProfile?.birthDate ||
                        !userProfile?.birthTime ||
                        !userProfile?.birthPlace ||
                        (userProfile?.mysticalProfileGenerated && !profileDataChanged)
                      }
                      className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 text-amber-400 m3-label-large font-semibold py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-center gap-3">
                        {isGeneratingProfile ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Generating Profile...</span>
                          </>
                        ) : userProfile?.mysticalProfileGenerated && !profileDataChanged ? (
                          <>
                            <Sparkles className="w-5 h-5" />
                            <span>✅ Profile Generated</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            <span>Generate My Mystical Profile</span>
                          </>
                        )}
                      </div>
                    </Button>
                    
                    {profileGenerationStatus && (
                      <div className="text-center">
                        <p className="text-amber-400 m3-body-small">{profileGenerationStatus}</p>
                      </div>
                    )}
                    
                    {userProfile?.mysticalProfileGenerated && !profileDataChanged && (
                      <div className="text-center">
                        <p className="text-amber-400 m3-body-small">
                          ✅ Your mystical profile has been generated successfully!
                        </p>
                        <p className="text-white/80 m3-body-small mt-1">
                          Edit your profile details to regenerate your mystical profile
                        </p>
                      </div>
                    )}

                    {(!userProfile?.birthDate || !userProfile?.birthTime || !userProfile?.birthPlace) && (
                      <div className="text-center">
                        <p className="text-white/80 m3-body-small">
                          Please complete your birth date, time, and place to generate your mystical profile
                        </p>
                      </div>
                    )}
                  </div>
                )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Update payment method modal */}
      {showUpdatePaymentModal && user && userProfile && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center starfield-ultra-sharp bg-slate-950/95 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg relative">
            <PaymentMethodCapture
              selectedPlan={userProfile.selectedPlan || 'power-user-trial'}
              userEmail={user.email || userProfile.email || ''}
              userName={userProfile.displayName || user.displayName || ''}
              userCountry={(userProfile.country as string) || 'IN'}
              onPaymentMethodCaptured={async (paymentMethodId, subscriptionId) => {
                try {
                  await updateUserProfile(user.uid, {
                    paymentMethodId,
                    subscriptionId: subscriptionId ?? undefined,
                  })
                  await refreshProfile()
                  setShowUpdatePaymentModal(false)
                } catch (e) {
                  devLog.error('Failed to update payment method:', e, 'page')
                }
              }}
              onError={(msg) => {
                setError(msg)
              }}
            />
            <button
              type="button"
              onClick={() => setShowUpdatePaymentModal(false)}
              className="absolute -top-2 -right-2 rounded-full bg-slate-800 border border-amber-500/30 text-amber-400 p-2 hover:bg-slate-700"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 