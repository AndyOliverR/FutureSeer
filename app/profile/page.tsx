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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, User, Clock, MapPin, Edit3, Save, X, LogOut, Sparkles, Heart, Camera, Calendar } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { usePlan } from "@/hooks/usePlan"
import { updateUserProfile, type UserProfile } from "@/lib/firebase"
import { clearComprehensiveMysticalProfileCache, clearPersistentProfileCache, useComprehensiveMysticalProfile } from "@/hooks/useComprehensiveMysticalProfile"
import { ReferralCodeCard } from "@/components/ReferralCodeCard"
import { SubscriptionStatus } from "@/components/SubscriptionStatus"
import { PaymentMethodCapture } from "@/components/PaymentMethodCapture"
import { RETURNING_USER_WITH_REPORTS_DESTINATION } from "@/lib/authRouting"
import { type BirthTimePeriodId } from "@/lib/birthTimeResolver"

export default function ProfilePage() {
  const { user, userProfile, signOut, loading: authLoading, refreshProfile } = useAuth()
  const { applyGeneratedProfile } = useComprehensiveMysticalProfile()
  const router = useRouter()
  const { t } = useTranslation('common')

  const [isEditing, setIsEditing] = useState(false)
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showUpdatePaymentModal, setShowUpdatePaymentModal] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<string>("")
  const generationAbortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!isGeneratingProfile) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isGeneratingProfile])

  const [formData, setFormData] = useState({
    displayName: "", fullName: "", email: "",
    gender: undefined as UserProfile['gender'],
    birthDate: "", birthTime: "", birthTimeAMPM: "AM",
    birthTimeKnown: false,
    birthTimePeriod: undefined as BirthTimePeriodId | undefined,
    birthTimeNote: "", birthPlace: "", currentLocation: "",
    facePhotoUrl: "", palmPhotoUrl: ""
  })

  useEffect(() => {
    if (userProfile && !isEditing) {
      const bt = String(userProfile.birthTime || ""); let btAMPM = "AM"
      if (bt && !/^\d{13,}$/.test(bt)) {
        const p = bt.split(':')
        if (p.length >= 2) {
          const h = parseInt(p[0])
          if (h >= 12) btAMPM = "PM"
        }
      }
      setFormData({
        displayName: userProfile.displayName || "AnDY",
        fullName: userProfile.fullName || "",
        email: user?.email || userProfile.email || "",
        gender: userProfile.gender,
        birthDate: userProfile.birthDate || "",
        birthTime: bt,
        birthTimeAMPM: btAMPM,
        birthTimeKnown: userProfile.birthTimeKnown || false,
        birthTimePeriod: userProfile.birthTimePeriod as BirthTimePeriodId,
        birthTimeNote: userProfile.birthTimeNote || "",
        birthPlace: userProfile.birthPlace || "",
        currentLocation: userProfile.currentLocation || "",
        facePhotoUrl: userProfile.facePhotoUrl || "",
        palmPhotoUrl: userProfile.palmPhotoUrl || ""
      })
    }
  }, [userProfile, isEditing, user])

  const validateProfileData = (): string | null => {
    if (formData.birthDate) {
      const d = new Date(formData.birthDate)
      if (isNaN(d.getTime())) return "Please enter a valid birth date."
      if (d > new Date()) return "Birth date cannot be in the future."
      if (d.getFullYear() < 1900) return "Please enter a birth year after 1900."
    }
    if (formData.birthPlace && formData.birthPlace.trim().length < 2) {
      return "Please enter a valid birth place (at least 2 characters)."
    }
    if (formData.displayName && formData.displayName.trim().length < 1) {
      return "Please enter a display name."
    }
    return null
  }

  const handleSave = async () => {
    if (!user?.uid) return
    const validationError = validateProfileData()
    if (validationError) { setError(validationError); return }
    setIsLoading(true); setError(null); setSuccess(null)
    try {
      let bt24 = formData.birthTime
      if (formData.birthTime && formData.birthTimeAMPM) {
        const p = String(formData.birthTime).split(':')
        if (p.length >= 2) {
          let h = parseInt(p[0])
          if (formData.birthTimeAMPM === "PM" && h !== 12) h += 12
          else if (formData.birthTimeAMPM === "AM" && h === 12) h = 0
          bt24 = `${h.toString().padStart(2, '0')}:${p[1]}`
        }
      }

      // Explicitly type the update data to match UserProfile definition
      const updatePayload: Partial<UserProfile> = {
        displayName: formData.displayName,
        fullName: formData.fullName,
        gender: formData.gender,
        birthDate: formData.birthDate,
        birthTime: bt24,
        birthTimeKnown: formData.birthTimeKnown,
        birthTimePeriod: formData.birthTimePeriod as UserProfile['birthTimePeriod'],
        birthTimeNote: formData.birthTimeNote,
        birthPlace: formData.birthPlace,
        currentLocation: formData.currentLocation,
        facePhotoUrl: formData.facePhotoUrl,
        palmPhotoUrl: formData.palmPhotoUrl
      }

      await updateUserProfile(user.uid, updatePayload)
      setSuccess("Profile updated successfully!"); setIsEditing(false); setHasUnsavedChanges(false)
      setTimeout(() => refreshProfile(), 500)
    } catch (e) { setError("Failed to save profile.") }
    finally { setIsLoading(false) }
  }

  if (authLoading) return <div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="animate-spin text-amber-400" /></div>

  return (
    <div className="min-h-screen bg-surface flex flex-col pt-[env(safe-area-inset-top)] pb-24 px-4 overflow-x-hidden">
      <div className="flex items-center justify-between h-16 mb-6">
        <Link href="/tools" className="p-2 text-amber-400 active:scale-90 transition-transform"><ArrowLeft className="w-6 h-6" /></Link>
        <h1 className="text-xl font-heading font-bold text-amber-400 uppercase tracking-tight">Cosmic Profile</h1>
        <button onClick={() => signOut()} className="p-2 text-surface-on-variant active:text-red-400"><LogOut className="w-6 h-6" /></button>
      </div>

      <div className="max-w-md mx-auto w-full space-y-6">
        <div className="bg-surface-container-high rounded-3xl p-5 border border-outline-variant shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-container rounded-xl"><Heart className="w-5 h-5 text-on-primary-container" /></div>
            <h2 className="font-bold text-white uppercase text-sm tracking-widest">Plan & Referral</h2>
          </div>
          {userProfile && <SubscriptionStatus userProfile={userProfile} onCancel={() => refreshProfile()} onUpdatePaymentClick={() => setShowUpdatePaymentModal(true)} />}
          {user && <div className="mt-4 border-t border-outline-variant pt-4"><ReferralCodeCard userId={user.uid} /></div>}
        </div>

        <div className="bg-surface-container-high rounded-[32px] p-6 border border-outline-variant shadow-2xl space-y-8">
          <div className="flex items-center justify-between border-b border-outline-variant pb-4">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Personal Data</h2>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="ghost" className="text-amber-400 font-bold uppercase text-xs tracking-widest px-4 h-10 bg-amber-500/10 rounded-full">Edit</Button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} className="p-2 bg-amber-500 text-slate-900 rounded-full shadow-lg active:scale-90"><Save className="w-5 h-5" /></button>
                <button onClick={() => setIsEditing(false)} className="p-2 bg-surface-container-lowest text-white rounded-full border border-outline-variant active:scale-90"><X className="w-5 h-5" /></button>
              </div>
            )}
          </div>

          {error && <Alert className="bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl"><AlertDescription className="font-bold">{error}</AlertDescription></Alert>}
          {success && <Alert className="bg-green-500/10 border-green-500/20 text-green-400 rounded-2xl"><AlertDescription className="font-bold">{success}</AlertDescription></Alert>}

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-amber-400 tracking-widest ml-1">Display Name</Label>
              {isEditing ? <Input value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="h-14 bg-surface-container-low border-outline-variant rounded-2xl" /> : <p className="text-lg font-bold text-white ml-1">{formData.displayName || "Not set"}</p>}
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-amber-400 tracking-widest ml-1">Birth Date</Label>
                {isEditing ? <Input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="h-14 bg-surface-container-low border-outline-variant rounded-2xl [color-scheme:dark]" /> : <p className="text-lg font-bold text-white ml-1">{formData.birthDate || "Not set"}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-amber-400 tracking-widest ml-1">Birth Place</Label>
                {isEditing ? <Input value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} className="h-14 bg-surface-container-low border-outline-variant rounded-2xl" /> : <p className="text-lg font-bold text-white ml-1">{formData.birthPlace || "Not set"}</p>}
              </div>
            </div>

            {!formData.birthTime && formData.birthDate && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3">
                <p className="text-amber-300 text-xs font-medium">
                  ⚠️ Birth time not set — readings will use 12:00 PM (noon) as default, which may reduce accuracy for time-sensitive charts like houses and ascendant.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-center">
                <Label className="text-[10px] uppercase font-bold text-amber-400 tracking-widest">Face Scan</Label>
                <div className="aspect-square bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden">
                  {formData.facePhotoUrl ? <img src={formData.facePhotoUrl} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 opacity-20" />}
                </div>
              </div>
              <div className="space-y-2 text-center">
                <Label className="text-[10px] uppercase font-bold text-amber-400 tracking-widest">Palm Scan</Label>
                <div className="aspect-square bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden">
                  {formData.palmPhotoUrl ? <img src={formData.palmPhotoUrl} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 opacity-20" />}
                </div>
              </div>
            </div>

            {!isEditing && (
              <div className="pt-6 border-t border-outline-variant/30">
                <Button
                  onClick={async () => {
                    if (isGeneratingProfile) return
                    setIsGeneratingProfile(true)
                    setError(null)
                    setGenerationStatus("Preparing your cosmic reading...")
                    const abort = new AbortController()
                    generationAbortRef.current = abort
                    try {
                      setGenerationStatus("Connecting to the celestial realm...")
                      const t = await user?.getIdToken()
                      if (!t) throw new Error("Please sign in again to continue.")
                      setGenerationStatus("Generating readings across all divination systems... This may take up to 2 minutes.")
                      const res = await fetch('/api/profile/generate-mystical', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${t}` },
                        signal: abort.signal,
                      })
                      if (!res.ok) {
                        const body = await res.json().catch(() => ({}))
                        throw new Error(body.error || "Profile generation failed. Please try again.")
                      }
                      const data = await res.json()
                      if (data.failedTools && data.failedTools.length > 0) {
                        devLog.warn(`Some tools had issues: ${data.failedTools.join(', ')}`, 'profile')
                      }
                      applyGeneratedProfile(data.comprehensiveProfile)
                      setSuccess("Mystical Profile Generated!")
                      router.push(RETURNING_USER_WITH_REPORTS_DESTINATION)
                    } catch(e: any) {
                      if (e?.name === 'AbortError') return
                      setError(e?.message || "Generation failed. Please check your connection and try again.")
                    } finally {
                      setIsGeneratingProfile(false)
                      setGenerationStatus("")
                      generationAbortRef.current = null
                    }
                  }}
                  disabled={isGeneratingProfile || !formData.birthDate || !formData.birthPlace}
                  className="w-full h-16 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 rounded-[24px] font-bold text-lg shadow-xl active:scale-95 transition-all"
                >
                  {isGeneratingProfile ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2" /> Generate Mystical Profile</>}
                </Button>
                {isGeneratingProfile && generationStatus && (
                  <p className="text-center text-amber-400/80 text-sm mt-3 animate-pulse">{generationStatus}</p>
                )}
                {!formData.birthDate && !isGeneratingProfile && (
                  <p className="text-center text-amber-400/50 text-xs mt-2">Please set your birth date and birth place to generate your profile.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
