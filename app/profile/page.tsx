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
import { normalizeBirthTime } from "@/lib/birthTimeUtils"
import { getOverQuotaMessage } from "@/lib/profileEditQuota"
import { clearComprehensiveMysticalProfileCache, clearPersistentProfileCache, useComprehensiveMysticalProfile } from "@/hooks/useComprehensiveMysticalProfile"
import { ReferralCodeCard } from "@/components/ReferralCodeCard"
import { SubscriptionStatus } from "@/components/SubscriptionStatus"
import { PaymentMethodCapture } from "@/components/PaymentMethodCapture"
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout"
import { RETURNING_USER_WITH_REPORTS_DESTINATION } from "@/lib/authRouting"
import { type BirthTimePeriodId } from "@/lib/birthTimeResolver"

export default function ProfilePage() {
  const { user, userProfile, signOut, loading: authLoading, refreshProfile } = useAuth()
  const { applyGeneratedProfile, refreshProfile: refreshComprehensiveProfile, hasProfile, canViewFullProfile } = useComprehensiveMysticalProfile()
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
  const isMobileLayout = useIsMobileLayout()
  const [uploadingFace, setUploadingFace] = useState(false)
  const [uploadingPalm, setUploadingPalm] = useState(false)
  const [canGenerateMysticalProfile, setCanGenerateMysticalProfile] = useState(true)
  const faceInputRef = useRef<HTMLInputElement>(null)
  const palmInputRef = useRef<HTMLInputElement>(null)

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

  // Fetch edit quota on load so Generate button state is correct
  useEffect(() => {
    if (!user?.uid) return
    let cancelled = false
    const fetchQuota = async () => {
      try {
        const token = await user.getIdToken()
        const res = await fetch('/api/profile/edit-quota', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!cancelled && res.ok) {
          const data = await res.json()
          setCanGenerateMysticalProfile(data.canGenerate !== false)
        }
      } catch {
        if (!cancelled) setCanGenerateMysticalProfile(true)
      }
    }
    fetchQuota()
    return () => { cancelled = true }
  }, [user?.uid])

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

  // Build 24h birth time and profile overrides from current form (so Generate uses latest values even without Save)
  const buildProfileOverridesForGenerate = (): Record<string, string | number | undefined> => {
    let bt24 = formData.birthTime ?? ''
    if (formData.birthTime && formData.birthTimeAMPM) {
      const p = String(formData.birthTime).split(':')
      if (p.length >= 2) {
        let h = parseInt(p[0], 10)
        const m = Math.min(59, Math.max(0, parseInt(p[1], 10) || 0))
        const minStr = m.toString().padStart(2, '0')
        if (h >= 1 && h <= 12) {
          if (formData.birthTimeAMPM === 'PM' && h !== 12) h += 12
          else if (formData.birthTimeAMPM === 'AM' && h === 12) h = 0
          h = Math.max(0, Math.min(23, h))
          bt24 = `${h.toString().padStart(2, '0')}:${minStr}`
          if (p[2] !== undefined) bt24 += `:${String(p[2]).padStart(2, '0')}`
        } else {
          bt24 = `${h.toString().padStart(2, '0')}:${minStr}`
          if (p[2] !== undefined) bt24 += `:${String(p[2]).padStart(2, '0')}`
        }
      }
    }
    const [hh, mm] = (bt24 || '0:0').split(':').map((x) => parseInt(x, 10) || 0)
    if (hh > 23 || hh < 0 || mm > 59 || mm < 0) bt24 = '12:00'
    const overrides: Record<string, string | number | undefined> = {
      birthDate: formData.birthDate || undefined,
      birthTime: normalizeBirthTime(bt24 || '12:00:00') || undefined,
      birthPlace: formData.birthPlace || undefined,
      currentLocation: formData.currentLocation || undefined,
      fullName: formData.fullName || undefined,
      displayName: formData.displayName || undefined,
      gender: formData.gender ?? undefined,
      facePhotoUrl: formData.facePhotoUrl || undefined,
      palmPhotoUrl: formData.palmPhotoUrl || undefined,
    }
    if (typeof userProfile?.birthLatitude === 'number') overrides.birthLatitude = userProfile.birthLatitude
    if (typeof userProfile?.birthLongitude === 'number') overrides.birthLongitude = userProfile.birthLongitude
    return overrides
  }

  const handleSave = async () => {
    if (!user?.uid) return
    const validationError = validateProfileData()
    if (validationError) { setError(validationError); return }
    setIsLoading(true); setError(null); setSuccess(null)
    try {
      let bt24 = formData.birthTime ?? ''
      if (formData.birthTime && formData.birthTimeAMPM) {
        const p = String(formData.birthTime).split(':')
        if (p.length >= 2) {
          let h = parseInt(p[0], 10)
          const m = Math.min(59, Math.max(0, parseInt(p[1], 10) || 0))
          const minStr = m.toString().padStart(2, '0')
          // Hour 1-12 is ambiguous: could be 12h input (10:30 PM) or 24h. Always apply AM/PM for 1-12 so 10:30 PM -> 22:30.
          // Hour 0 or 13-23 is already 24h (e.g. loaded 22:30); use as-is to avoid double-applying PM (22+12=34).
          if (h >= 1 && h <= 12) {
            if (formData.birthTimeAMPM === "PM" && h !== 12) h += 12
            else if (formData.birthTimeAMPM === "AM" && h === 12) h = 0
            h = Math.max(0, Math.min(23, h))
            bt24 = `${h.toString().padStart(2, '0')}:${minStr}`
            if (p[2] !== undefined) bt24 += `:${String(p[2]).padStart(2, '0')}`
          } else {
            bt24 = `${h.toString().padStart(2, '0')}:${minStr}`
            if (p[2] !== undefined) bt24 += `:${String(p[2]).padStart(2, '0')}`
          }
        }
      }
      // Reject invalid stored time (e.g. legacy 34:00)
      const [hh, mm] = (bt24 || '0:0').split(':').map((x) => parseInt(x, 10) || 0)
      if (hh > 23 || hh < 0 || mm > 59 || mm < 0) {
        bt24 = '12:00'
      }

      // Store birth time in 24h HH:mm:ss so downstream charts never see mixed format (e.g. "22:00 PM")
      const birthTimeToStore = normalizeBirthTime(bt24 || '12:00:00')

      // Explicitly type the update data to match UserProfile definition
      const updatePayload: Partial<UserProfile> = {
        displayName: formData.displayName,
        fullName: formData.fullName,
        gender: formData.gender,
        birthDate: formData.birthDate,
        birthTime: birthTimeToStore,
        birthTimeKnown: formData.birthTimeKnown,
        birthTimePeriod: formData.birthTimePeriod as UserProfile['birthTimePeriod'],
        birthTimeNote: formData.birthTimeNote,
        birthPlace: formData.birthPlace,
        currentLocation: formData.currentLocation,
        facePhotoUrl: formData.facePhotoUrl,
        palmPhotoUrl: formData.palmPhotoUrl
      }

      await updateUserProfile(user.uid, updatePayload)

      // Clear stored mystical profile so user can regenerate from updated data
      try {
        const token = await user.getIdToken()
        await fetch('/api/profile/invalidate-cache', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch {
        // Best-effort; profile save already succeeded
      }
      clearComprehensiveMysticalProfileCache(user.uid)
      clearPersistentProfileCache(user.uid)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('futureSeer:profileInvalidated', { detail: { userId: user.uid } }))
      }

      try {
        const token = await user.getIdToken()
        const recordRes = await fetch('/api/profile/record-edit', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (recordRes.ok) {
          const quota = await recordRes.json()
          setCanGenerateMysticalProfile(quota.canGenerate !== false)
        }
      } catch {
        // Best-effort; don't lock user out on network error
      }

      setSuccess("Profile updated successfully!"); setIsEditing(false); setHasUnsavedChanges(false)
      setTimeout(() => refreshProfile(), 500)
    } catch (e) { setError("Failed to save profile.") }
    finally { setIsLoading(false) }
  }

  const handlePhotoUpload = async (file: File, type: "face" | "palm") => {
    if (!user?.uid) return
    const setUploading = type === "face" ? setUploadingFace : setUploadingPalm
    const key = type === "face" ? "facePhotoUrl" : "palmPhotoUrl"
    setUploading(true)
    setError(null)
    try {
      const token = await user.getIdToken()
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)
      const res = await fetch("/api/profile/upload-photo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Upload failed")
      }
      const { url } = await res.json()
      if (!url) throw new Error("No URL returned")
      setFormData((prev) => ({ ...prev, [key]: url }))
      await updateUserProfile(user.uid, { [key]: url })
      setTimeout(() => refreshProfile(), 300)
    } catch (e) {
      setError(type === "face" ? "Face photo upload failed." : "Palm photo upload failed.")
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePhoto = async (type: "face" | "palm") => {
    if (!user?.uid) return
    const key = type === "face" ? "facePhotoUrl" : "palmPhotoUrl"
    try {
      setFormData((prev) => ({ ...prev, [key]: "" }))
      await updateUserProfile(user.uid, { [key]: "" })
      setTimeout(() => refreshProfile(), 300)
    } catch (e) {
      setError(`Failed to remove ${type} photo.`)
    }
  }

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isMobileLayout ? "bg-surface" : "starfield-ultra-sharp"}`}>
        <Loader2 className="animate-spin text-amber-400" />
      </div>
    )
  }

  // Android / Mobile: Material 3 layout
  if (isMobileLayout) {
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

        {hasProfile && !canViewFullProfile && (
          <Alert className="border-amber-500/30 bg-amber-500/10 rounded-2xl">
            <AlertDescription className="text-amber-200 text-sm">
              Your mystical profile is ready. Select a plan above to view your full reports in Tools.
            </AlertDescription>
          </Alert>
        )}

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

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-amber-400 tracking-widest ml-1">Full Name</Label>
              {isEditing ? <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Full name (for numerology & reports)" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl" /> : <p className="text-lg font-bold text-white ml-1">{formData.fullName || "Not set"}</p>}
            </div>

            <div className="space-y-2 relative z-20 overflow-visible">
              <Label className="text-[10px] uppercase font-bold text-amber-400 tracking-widest ml-1">Gender</Label>
              {isEditing ? (
                <select value={formData.gender ?? ''} onChange={e => setFormData({...formData, gender: e.target.value === '' ? undefined : (e.target.value as UserProfile['gender'])})} className="h-14 w-full bg-surface-container-low border border-outline-variant rounded-2xl px-4 text-white [color-scheme:dark]">
                  <option value="">Not set</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              ) : (
                <p className="text-lg font-bold text-white ml-1">{formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1).replace('-', ' ') : "Not set"}</p>
              )}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-amber-400 tracking-widest ml-1">Time of Birth</Label>
                {isEditing ? (
                  <div className="flex gap-2 items-center">
                    <Input type="time" value={formData.birthTime} onChange={e => setFormData({...formData, birthTime: e.target.value})} className="h-14 bg-surface-container-low border-outline-variant rounded-2xl [color-scheme:dark] flex-1" />
                    <select value={formData.birthTimeAMPM} onChange={e => setFormData({...formData, birthTimeAMPM: e.target.value as "AM" | "PM"})} className="h-14 bg-surface-container-low border border-outline-variant rounded-2xl px-3 text-white min-w-[72px]">
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-white ml-1">{formData.birthTime ? `${formData.birthTime} ${formData.birthTimeAMPM}` : "Not set"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-amber-400 tracking-widest ml-1">Current residence</Label>
                {isEditing ? <Input value={formData.currentLocation} onChange={e => setFormData({...formData, currentLocation: e.target.value})} placeholder="City, Country" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl" /> : <p className="text-lg font-bold text-white ml-1">{formData.currentLocation || "Not set"}</p>}
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
                <div className="aspect-square bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden relative">
                  {formData.facePhotoUrl ? <img src={formData.facePhotoUrl} className="w-full h-full object-cover" alt="" /> : <Camera className="w-8 h-8 opacity-20" />}
                  {uploadingFace && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>}
                </div>
                {isEditing && (
                  <div className="flex flex-col gap-1">
                    <input ref={faceInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, "face"); e.target.value = ""; }} />
                    <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => faceInputRef.current?.click()} disabled={uploadingFace}>Upload</Button>
                    {formData.facePhotoUrl && <Button type="button" variant="ghost" size="sm" className="text-xs text-red-400" onClick={() => handleRemovePhoto("face")}>Remove</Button>}
                  </div>
                )}
              </div>
              <div className="space-y-2 text-center">
                <Label className="text-[10px] uppercase font-bold text-amber-400 tracking-widest">Palm Scan</Label>
                <p className="text-[10px] text-white/70">Upload left palm (female) or right palm (male).</p>
                <div className="aspect-square bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden relative">
                  {formData.palmPhotoUrl ? <img src={formData.palmPhotoUrl} className="w-full h-full object-cover" alt="" /> : <Camera className="w-8 h-8 opacity-20" />}
                  {uploadingPalm && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>}
                </div>
                {isEditing && (
                  <div className="flex flex-col gap-1">
                    <input ref={palmInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, "palm"); e.target.value = ""; }} />
                    <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => palmInputRef.current?.click()} disabled={uploadingPalm}>Upload</Button>
                    {formData.palmPhotoUrl && <Button type="button" variant="ghost" size="sm" className="text-xs text-red-400" onClick={() => handleRemovePhoto("palm")}>Remove</Button>}
                  </div>
                )}
              </div>
            </div>

            {!isEditing && (
              <div className="pt-6 border-t border-outline-variant/30">
                <Button
                  onClick={async () => {
                    if (isGeneratingProfile) return
                    if (user?.uid) {
                      clearComprehensiveMysticalProfileCache(user.uid)
                      clearPersistentProfileCache(user.uid)
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('futureSeer:profileInvalidated', { detail: { userId: user.uid } }))
                      }
                    }
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
                      const profileOverrides = buildProfileOverridesForGenerate()
                      const res = await fetch('/api/profile/generate-mystical', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
                        body: JSON.stringify({ profileOverrides }),
                        signal: abort.signal,
                      })
                      if (!res.ok) {
                        const body = await res.json().catch(() => ({}))
                        if (res.status === 403) setCanGenerateMysticalProfile(false)
                        throw new Error(body.error || "Profile generation failed. Please try again.")
                      }
                      const data = await res.json()
                      if (data.failedTools && data.failedTools.length > 0) {
                        devLog.warn(`Some tools had issues: ${data.failedTools.join(', ')}`, 'profile')
                      }
                      if (data.success && data.comprehensiveProfile) {
                        applyGeneratedProfile(data.comprehensiveProfile)
                      } else if (data.success && data.alreadyGenerated) {
                        await refreshComprehensiveProfile()
                      }
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
                  disabled={isGeneratingProfile || !formData.birthDate || !formData.birthPlace || !canGenerateMysticalProfile}
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
                {formData.birthDate && formData.birthPlace && !canGenerateMysticalProfile && !isGeneratingProfile && (
                  <p className="text-center text-amber-400/70 text-xs mt-2">{getOverQuotaMessage(userProfile?.selectedPlan)}</p>
                )}
                {formData.birthDate && formData.birthPlace && canGenerateMysticalProfile && !isGeneratingProfile && (
                  <p className="text-center text-amber-400/50 text-xs mt-2">Your current birth details above will be used for generation.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    )
  }

  // Web: devotionist layout (deep blue + golden yellow, starfield)
  return (
    <div className="min-h-screen starfield-ultra-sharp flex flex-col pb-16 px-4 md:px-8 overflow-x-hidden">
      <div className="max-w-2xl mx-auto w-full py-8">
        <div className="flex items-center justify-between h-14 mb-8">
          <Link href="/tools" className="text-amber-400 flex items-center gap-2 font-heading tracking-widest uppercase text-sm opacity-80 hover:opacity-100"><ArrowLeft className="w-5 h-5" /> Back</Link>
          <h1 className="text-2xl font-heading font-light text-amber-400 gold-glow uppercase tracking-widest">Cosmic Profile</h1>
          <button onClick={() => signOut()} className="p-2 text-amber-200/80 hover:text-red-400 rounded-full transition-colors" aria-label="Sign out"><LogOut className="w-5 h-5" /></button>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#020617]/80 backdrop-blur-xl rounded-3xl p-6 border border-amber-500/20 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/20 rounded-xl"><Heart className="w-5 h-5 text-amber-400" /></div>
              <h2 className="font-bold text-amber-400 uppercase text-sm tracking-widest">Plan & Referral</h2>
            </div>
            {userProfile && <SubscriptionStatus userProfile={userProfile} onCancel={() => refreshProfile()} onUpdatePaymentClick={() => setShowUpdatePaymentModal(true)} />}
            {user && <div className="mt-4 border-t border-amber-400/20 pt-4"><ReferralCodeCard userId={user.uid} /></div>}
          </motion.div>

          {hasProfile && !canViewFullProfile && (
            <Alert className="border-amber-500/30 bg-amber-500/10 rounded-2xl">
              <AlertDescription className="text-amber-200">
                Your mystical profile is ready. Select a plan above to view your full reports in Tools.
              </AlertDescription>
            </Alert>
          )}

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-[#020617]/80 backdrop-blur-xl rounded-3xl p-6 border border-amber-500/20 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-amber-400/20 pb-4">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-amber-400" />
                <h2 className="text-xl font-bold text-white">Personal Data</h2>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="ghost" className="text-amber-400 font-bold uppercase text-xs tracking-widest px-4 h-10 bg-amber-500/10 rounded-full hover:bg-amber-500/20">Edit</Button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSave} className="p-2 bg-amber-500 text-[#020617] rounded-full shadow-lg hover:bg-amber-400"><Save className="w-5 h-5" /></button>
                  <button onClick={() => setIsEditing(false)} className="p-2 bg-white/10 text-white rounded-full border border-amber-400/30 hover:bg-white/20"><X className="w-5 h-5" /></button>
                </div>
              )}
            </div>

            {error && <Alert className="bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl"><AlertDescription className="font-bold">{error}</AlertDescription></Alert>}
            {success && <Alert className="bg-green-500/10 border-green-500/20 text-green-400 rounded-2xl"><AlertDescription className="font-bold">{success}</AlertDescription></Alert>}

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Display Name</Label>
                {isEditing ? <Input value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="h-12 bg-white/5 border-white/10 rounded-2xl focus:border-amber-500" /> : <p className="text-lg font-medium text-white">{formData.displayName || "Not set"}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Full Name</Label>
                {isEditing ? <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Full name (for numerology & reports)" className="h-12 bg-white/5 border-white/10 rounded-2xl focus:border-amber-500" /> : <p className="text-lg font-medium text-white">{formData.fullName || "Not set"}</p>}
              </div>

              <div className="space-y-2 relative z-20 overflow-visible">
                <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Gender</Label>
                {isEditing ? (
                  <select value={formData.gender ?? ''} onChange={e => setFormData({...formData, gender: e.target.value === '' ? undefined : (e.target.value as UserProfile['gender'])})} className="h-12 w-full bg-white/5 border border-white/10 rounded-2xl px-4 text-white focus:border-amber-500 [color-scheme:dark]">
                    <option value="">Not set</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                ) : (
                  <p className="text-lg font-medium text-white">{formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1).replace('-', ' ') : "Not set"}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Birth Date</Label>
                  {isEditing ? <Input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="h-12 bg-white/5 border-white/10 rounded-2xl [color-scheme:dark]" /> : <p className="text-lg font-medium text-white">{formData.birthDate || "Not set"}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Birth Place</Label>
                  {isEditing ? <Input value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} className="h-12 bg-white/5 border-white/10 rounded-2xl focus:border-amber-500" /> : <p className="text-lg font-medium text-white">{formData.birthPlace || "Not set"}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Time of Birth</Label>
                  {isEditing ? (
                    <div className="flex gap-2 items-center">
                      <Input type="time" value={formData.birthTime} onChange={e => setFormData({...formData, birthTime: e.target.value})} className="h-12 bg-white/5 border-white/10 rounded-2xl [color-scheme:dark] flex-1" />
                      <select value={formData.birthTimeAMPM} onChange={e => setFormData({...formData, birthTimeAMPM: e.target.value as "AM" | "PM"})} className="h-12 bg-white/5 border border-amber-400/30 rounded-2xl px-3 text-white min-w-[72px]">
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  ) : (
                    <p className="text-lg font-medium text-white">{formData.birthTime ? `${formData.birthTime} ${formData.birthTimeAMPM}` : "Not set"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Current residence</Label>
                  {isEditing ? <Input value={formData.currentLocation} onChange={e => setFormData({...formData, currentLocation: e.target.value})} placeholder="City, Country" className="h-12 bg-white/5 border-white/10 rounded-2xl focus:border-amber-500" /> : <p className="text-lg font-medium text-white">{formData.currentLocation || "Not set"}</p>}
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
                  <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Face Scan</Label>
                  <div className="aspect-square bg-white/5 rounded-2xl border-2 border-dashed border-amber-400/20 flex items-center justify-center overflow-hidden relative">
                    {formData.facePhotoUrl ? <img src={formData.facePhotoUrl} className="w-full h-full object-cover" alt="" /> : <Camera className="w-8 h-8 text-amber-400/40" />}
                    {uploadingFace && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>}
                  </div>
                  {isEditing && (
                    <div className="flex flex-col gap-1">
                      <input ref={faceInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, "face"); e.target.value = ""; }} />
                      <Button type="button" variant="outline" size="sm" className="text-xs border-amber-400/30 text-amber-400" onClick={() => faceInputRef.current?.click()} disabled={uploadingFace}>Upload</Button>
                      {formData.facePhotoUrl && <Button type="button" variant="ghost" size="sm" className="text-xs text-red-400" onClick={() => handleRemovePhoto("face")}>Remove</Button>}
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-center">
                  <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Palm Scan</Label>
                  <p className="text-xs text-amber-400/70">Upload left palm (female) or right palm (male).</p>
                  <div className="aspect-square bg-white/5 rounded-2xl border-2 border-dashed border-amber-400/20 flex items-center justify-center overflow-hidden relative">
                    {formData.palmPhotoUrl ? <img src={formData.palmPhotoUrl} className="w-full h-full object-cover" alt="" /> : <Camera className="w-8 h-8 text-amber-400/40" />}
                    {uploadingPalm && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>}
                  </div>
                  {isEditing && (
                    <div className="flex flex-col gap-1">
                      <input ref={palmInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, "palm"); e.target.value = ""; }} />
                      <Button type="button" variant="outline" size="sm" className="text-xs border-amber-400/30 text-amber-400" onClick={() => palmInputRef.current?.click()} disabled={uploadingPalm}>Upload</Button>
                      {formData.palmPhotoUrl && <Button type="button" variant="ghost" size="sm" className="text-xs text-red-400" onClick={() => handleRemovePhoto("palm")}>Remove</Button>}
                    </div>
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="pt-6 border-t border-amber-400/20">
                  <Button
                    onClick={async () => {
                      if (isGeneratingProfile) return
                      if (user?.uid) {
                        clearComprehensiveMysticalProfileCache(user.uid)
                        clearPersistentProfileCache(user.uid)
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('futureSeer:profileInvalidated', { detail: { userId: user.uid } }))
                        }
                      }
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
                        const profileOverrides = buildProfileOverridesForGenerate()
                        const res = await fetch('/api/profile/generate-mystical', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
                          body: JSON.stringify({ profileOverrides }),
                          signal: abort.signal,
                        })
                        if (!res.ok) {
                          const body = await res.json().catch(() => ({}))
                          if (res.status === 403) setCanGenerateMysticalProfile(false)
                          throw new Error(body.error || "Profile generation failed. Please try again.")
                        }
                        const data = await res.json()
                        if (data.failedTools && data.failedTools.length > 0) {
                          devLog.warn(`Some tools had issues: ${data.failedTools.join(', ')}`, 'profile')
                        }
                        if (data.success && data.comprehensiveProfile) {
                          applyGeneratedProfile(data.comprehensiveProfile)
                        } else if (data.success && data.alreadyGenerated) {
                          await refreshComprehensiveProfile()
                        }
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
                    disabled={isGeneratingProfile || !formData.birthDate || !formData.birthPlace || !canGenerateMysticalProfile}
                    className="w-full h-14 bg-gradient-to-r from-amber-600 to-yellow-500 text-[#020617] rounded-2xl font-bold shadow-xl hover:opacity-95 transition-opacity"
                  >
                    {isGeneratingProfile ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2" /> Generate Mystical Profile</>}
                  </Button>
                  {isGeneratingProfile && generationStatus && (
                    <p className="text-center text-amber-400/80 text-sm mt-3 animate-pulse">{generationStatus}</p>
                  )}
                  {!formData.birthDate && !isGeneratingProfile && (
                    <p className="text-center text-amber-200/70 text-xs mt-2">Please set your birth date and birth place to generate your profile.</p>
                  )}
                  {formData.birthDate && formData.birthPlace && !canGenerateMysticalProfile && !isGeneratingProfile && (
                    <p className="text-center text-amber-200/80 text-xs mt-2">{getOverQuotaMessage(userProfile?.selectedPlan)}</p>
                  )}
                  {formData.birthDate && formData.birthPlace && canGenerateMysticalProfile && !isGeneratingProfile && (
                    <p className="text-center text-amber-200/60 text-xs mt-2">Your current birth details above will be used for generation.</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
