"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { devLog } from '@/lib/devLogger';
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, ArrowLeft, User, Clock, MapPin, Edit3, Save, X, LogOut, Sparkles, Heart, Camera, Calendar, Trash2 } from "lucide-react"
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
import { SEQ_PROMPT_AFTER_PROFILE_GEN } from "@/lib/metricsSession"
import { type BirthTimePeriodId } from "@/lib/birthTimeResolver"
import { useErrorLogger } from "@/hooks/useErrorLogger"
import { useOnboardingStallRecovery } from "@/hooks/useOnboardingStallRecovery"
import { OnboardingStuckBanner } from "@/components/onboarding/OnboardingStuckBanner"
import { ProfileNextStepsBanner } from "@/components/onboarding/ProfileNextStepsBanner"
import { compressImageFile } from "@/lib/imageCompression"
import { PROFILE_PLAN_PRICING_CTA_LABEL, PROFILE_PLAN_REQUIRED_BODY } from "@/lib/accessGatingCopy"
import { analytics, ANALYTICS_EVENTS } from "@/lib/analytics"
import { isGrowthProfileDraftEnabled } from "@/lib/growthFlags"
import { clearProfileDraft, loadProfileDraft, saveProfileDraft } from "@/lib/profileDraftStorage"
import { SeerNewsHeadlinesToggle } from "@/components/integrations/SeerNewsHeadlinesToggle"
import { isClientWorkspaceEmail } from "@/lib/clientWorkspace"

const PROFILE_PHOTO_FETCH_ATTEMPTS = 3
const PROFILE_PHOTO_FIRESTORE_ATTEMPTS = 3
type ProfilePlanId = "power-user-trial" | "buy-coffee" | "treat-me" | "festive-hamper"

function readUploadErrorFields(e: unknown): {
  status: number | null
  detail: unknown
  message: string
  firebaseCode: string | null
  apiErrorCode: string | null
} {
  if (e && typeof e === "object") {
    const o = e as Record<string, unknown>
    const status = typeof o.status === "number" ? o.status : null
    const detail = "detail" in o ? o.detail : undefined
    const message = e instanceof Error ? e.message : String(o.message ?? "")
    const firebaseCode = typeof o.code === "string" ? o.code : null
    let apiErrorCode: string | null = null
    if (detail && typeof detail === "object" && typeof (detail as Record<string, unknown>).code === "string") {
      apiErrorCode = (detail as Record<string, unknown>).code as string
    }
    return { status, detail, message, firebaseCode, apiErrorCode }
  }
  return {
    status: null,
    detail: undefined,
    message: e instanceof Error ? e.message : "",
    firebaseCode: null,
    apiErrorCode: null,
  }
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function errorHasHttpStatus(e: unknown): boolean {
  return typeof (e as { status?: number })?.status === "number"
}

function isFetchNetworkFailure(e: unknown): boolean {
  if (errorHasHttpStatus(e)) return false
  if (e instanceof TypeError) return true
  if (e instanceof Error && e.message.includes("Failed to fetch")) return true
  return false
}

function isTransientFirestoreProfileError(e: unknown): boolean {
  const code = (e as { code?: string })?.code
  if (code === "unavailable" || code === "resource-exhausted" || code === "deadline-exceeded") return true
  const msg = e instanceof Error ? e.message : String(e)
  return msg.includes("offline") || msg.includes("Failed to get document")
}

function mapFirebaseCodeToPhotoMessage(firebaseCode: string | null): string | null {
  if (!firebaseCode) return null
  if (firebaseCode === "auth/network-request-failed") {
    return "Network error while refreshing your session. Check your connection, try turning off VPN or ad blockers for this site, then retry."
  }
  if (
    firebaseCode === "auth/user-token-expired" ||
    firebaseCode === "auth/invalid-user-token" ||
    firebaseCode === "auth/id-token-expired"
  ) {
    return "Session expired. Please sign in again and retry the upload."
  }
  if (firebaseCode === "permission-denied") {
    return "Saving your profile was blocked. Please try again or sign out and back in. If this continues, contact support."
  }
  if (firebaseCode === "unavailable" || firebaseCode === "resource-exhausted") {
    return "Our servers were busy. Please wait a moment and try again."
  }
  if (firebaseCode === "not-found") {
    return "Your profile record was not found. Try signing out and signing in again, or contact support."
  }
  if (firebaseCode.startsWith("auth/")) {
    return "Sign-in issue while uploading. Please sign in again and retry."
  }
  return null
}

function mapProfilePhotoProxyMessage(
  status: number | null,
  detailStr: string,
  message: string,
  apiErrorCode: string | null,
): string {
  if (status === 401) return "Session expired. Please sign in again and retry."
  if (status === 400) {
    if (detailStr.includes("File too large")) {
      return "That image is too large. Please try again (we’ll optimize it) or choose a smaller photo."
    }
    if (detailStr.includes("Invalid file type")) {
      return "That file type isn’t accepted by our servers. iPhone photos are often HEIC—if this keeps failing, open the image in Photos, export as JPEG, then try again. You can also use JPEG, PNG, WebP, or GIF."
    }
    return "That photo couldn’t be uploaded. Please try a different image."
  }
  if (status === 503 && apiErrorCode === "STORAGE_CONFIG") {
    return "Photo storage is not configured on the server. Please try again later or contact support."
  }
  if (status && status >= 500) {
    if (apiErrorCode === "SIGNED_URL") {
      return "Upload succeeded but we could not create a view link. Please retry in a moment or contact support."
    }
    if (apiErrorCode === "STORAGE_WRITE") {
      return "Could not store the photo. Please retry in a moment."
    }
    return "Upload service had trouble. Please retry in a moment."
  }
  if (String(message).includes("Failed to fetch")) {
    return "Network error while uploading. Check your connection and retry."
  }
  return "Photo upload failed. Please try again."
}

async function fetchProfilePhotoUploadWithNetworkRetries(
  token: string,
  file: File,
  photoType: "face" | "palm",
): Promise<string> {
  let lastErr: unknown
  for (let attempt = 0; attempt < PROFILE_PHOTO_FETCH_ATTEMPTS; attempt++) {
    const multipart = new FormData()
    multipart.append("file", file)
    multipart.append("type", photoType)
    try {
      const res = await fetch("/api/profile/upload-photo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: multipart,
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
        const err = new Error(typeof data.error === "string" ? data.error : "Upload failed") as Error & {
          status: number
          detail: Record<string, unknown>
        }
        err.status = res.status
        err.detail = data
        throw err
      }
      const json = (await res.json()) as { url?: string }
      if (!json.url) throw new Error("No URL returned")
      return json.url
    } catch (e) {
      lastErr = e
      if (errorHasHttpStatus(e)) throw e
      if (isFetchNetworkFailure(e) && attempt < PROFILE_PHOTO_FETCH_ATTEMPTS - 1) {
        await sleepMs(400 + attempt * 300 + Math.floor(Math.random() * 200))
        continue
      }
      throw e
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Upload failed")
}

async function updateUserProfilePhotoWithRetries(uid: string, key: "facePhotoUrl" | "palmPhotoUrl", url: string): Promise<void> {
  for (let attempt = 0; attempt < PROFILE_PHOTO_FIRESTORE_ATTEMPTS; attempt++) {
    try {
      await updateUserProfile(uid, { [key]: url })
      return
    } catch (e) {
      if (!isTransientFirestoreProfileError(e) || attempt === PROFILE_PHOTO_FIRESTORE_ATTEMPTS - 1) {
        throw e
      }
      await sleepMs(400 + attempt * 250 + Math.floor(Math.random() * 300))
    }
  }
}

export default function ProfilePage() {
  const { user, userProfile, signOut, loading: authLoading, refreshProfile, isSuperadmin, isAdmin } = useAuth()
  const { applyGeneratedProfile, refreshProfile: refreshComprehensiveProfile, hasProfile, canViewFullProfile } = useComprehensiveMysticalProfile()
  const router = useRouter()
  const { t } = useTranslation('common')

  const isConsultantWorkspace = useMemo(
    () => isClientWorkspaceEmail(user?.email ?? null),
    [user?.email]
  )

  const [isEditing, setIsEditing] = useState(false)
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showUpdatePaymentModal, setShowUpdatePaymentModal] = useState(false)
  const [selectedPlanForProfile, setSelectedPlanForProfile] = useState<ProfilePlanId>("power-user-trial")
  const [isSavingPaymentChoice, setIsSavingPaymentChoice] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<string>("")
  const generationAbortRef = useRef<AbortController | null>(null)
  const draftRestoreAttemptedRef = useRef(false)
  const canPersistDraftRef = useRef(false)
  const isMobileLayout = useIsMobileLayout()
  const [uploadingFace, setUploadingFace] = useState(false)
  const [uploadingPalm, setUploadingPalm] = useState(false)
  const [optimizingFace, setOptimizingFace] = useState(false)
  const [optimizingPalm, setOptimizingPalm] = useState(false)
  const [canGenerateMysticalProfile, setCanGenerateMysticalProfile] = useState(true)
  const [isClearingWorkspace, setIsClearingWorkspace] = useState(false)
  const [clearWorkspaceConfirmOpen, setClearWorkspaceConfirmOpen] = useState(false)
  const { logError } = useErrorLogger({ area: "profile" })
  const { logError: logOnboarding } = useErrorLogger({ area: "onboarding" })
  const authLoadingStall = useOnboardingStallRecovery(authLoading, {
    surface: "profile_auth_loading",
    logOnboarding,
  })
  const faceInputRef = useRef<HTMLInputElement>(null)
  const palmInputRef = useRef<HTMLInputElement>(null)
  const isUploadBusy = uploadingFace || uploadingPalm || optimizingFace || optimizingPalm
  const isSaveDisabled = isLoading || isUploadBusy

  useEffect(() => {
    draftRestoreAttemptedRef.current = false
    canPersistDraftRef.current = false
  }, [user?.uid])

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

  const trialDaysRemaining = useMemo(() => {
    const endTs = userProfile?.trialEndDate
    if (!endTs || typeof endTs !== "number") return null
    const nowSec = Math.floor(Date.now() / 1000)
    return Math.max(0, Math.ceil((endTs - nowSec) / (24 * 60 * 60)))
  }, [userProfile?.trialEndDate])

  const hasVerifiedPaymentMethod = useMemo(() => {
    const pm = String(userProfile?.paymentMethodId || "").trim().toLowerCase()
    return !!pm && pm !== "none" && pm !== "no-charge"
  }, [userProfile?.paymentMethodId])

  const showPaymentReminder = useMemo(() => {
    if (!userProfile) return false
    const status = String(userProfile.subscriptionStatus || "").toLowerCase()
    const isTrialLike = !status || status === "trial"
    return isTrialLike && !hasVerifiedPaymentMethod
  }, [userProfile, hasVerifiedPaymentMethod])

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
    if (isConsultantWorkspace) return
    if (!isGrowthProfileDraftEnabled() || !user?.uid || !canPersistDraftRef.current) return
    if (userProfile?.mysticalProfileGenerated) return
    const t = window.setTimeout(() => {
      saveProfileDraft(user.uid, {
        displayName: formData.displayName,
        fullName: formData.fullName,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        birthTimeAMPM: formData.birthTimeAMPM,
        birthTimeKnown: formData.birthTimeKnown,
        birthPlace: formData.birthPlace,
        currentLocation: formData.currentLocation,
        birthTimeNote: formData.birthTimeNote,
      })
    }, 2000)
    return () => window.clearTimeout(t)
  }, [
    formData.displayName,
    formData.fullName,
    formData.birthDate,
    formData.birthTime,
    formData.birthTimeAMPM,
    formData.birthTimeKnown,
    formData.birthPlace,
    formData.currentLocation,
    formData.birthTimeNote,
    user?.uid,
    userProfile?.mysticalProfileGenerated,
    isConsultantWorkspace,
  ])

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
        displayName: userProfile.displayName || "",
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
  }, [userProfile, isEditing, user, isConsultantWorkspace])

  useEffect(() => {
    const selected = userProfile?.selectedPlan
    if (
      selected === "power-user-trial" ||
      selected === "buy-coffee" ||
      selected === "treat-me" ||
      selected === "festive-hamper"
    ) {
      setSelectedPlanForProfile(selected)
      return
    }
    setSelectedPlanForProfile("power-user-trial")
  }, [userProfile?.selectedPlan])

  useEffect(() => {
    if (isConsultantWorkspace) return
    if (!isGrowthProfileDraftEnabled() || !user?.uid || !userProfile) return
    if (userProfile.mysticalProfileGenerated) return
    if (draftRestoreAttemptedRef.current) return
    draftRestoreAttemptedRef.current = true
    const d = loadProfileDraft(user.uid)
    if (!d) {
      canPersistDraftRef.current = true
      return
    }
    setFormData((prev) => ({
      ...prev,
      displayName: prev.displayName || d.displayName,
      fullName: prev.fullName || d.fullName,
      birthDate: prev.birthDate || d.birthDate,
      birthTime: prev.birthTime || d.birthTime,
      birthTimeAMPM: prev.birthTimeAMPM || d.birthTimeAMPM,
      birthTimeKnown: prev.birthTimeKnown || d.birthTimeKnown,
      birthPlace: prev.birthPlace || d.birthPlace,
      currentLocation: prev.currentLocation || d.currentLocation,
      birthTimeNote: prev.birthTimeNote || d.birthTimeNote,
    }))
    canPersistDraftRef.current = true
  }, [user?.uid, userProfile, isConsultantWorkspace])

  const openClearWorkspaceConfirm = () => {
    if (!user?.uid || !isConsultantWorkspace) return
    setClearWorkspaceConfirmOpen(true)
  }

  const performClearWorkspace = useCallback(async () => {
    if (!user?.uid || !isConsultantWorkspace) return
    setIsClearingWorkspace(true)
    setError(null)
    setSuccess(null)
    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/admin/client-workspace/clear", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        throw new Error(typeof body.error === "string" ? body.error : "Failed to clear workspace")
      }
      if (user.uid && isGrowthProfileDraftEnabled()) clearProfileDraft(user.uid)
      clearComprehensiveMysticalProfileCache(user.uid)
      clearPersistentProfileCache(user.uid)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("futureSeer:profileInvalidated", { detail: { userId: user.uid } }))
      }
      setIsEditing(true)
      setFormData({
        displayName: "",
        fullName: "",
        email: user.email || "",
        gender: undefined,
        birthDate: "",
        birthTime: "",
        birthTimeAMPM: "AM",
        birthTimeKnown: false,
        birthTimePeriod: undefined,
        birthTimeNote: "",
        birthPlace: "",
        currentLocation: "",
        facePhotoUrl: "",
        palmPhotoUrl: "",
      })
      await refreshProfile()
      await refreshComprehensiveProfile()
      setSuccess("Workspace cleared. Enter the next client’s details.")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to clear workspace")
    } finally {
      setIsClearingWorkspace(false)
    }
  }, [user, isConsultantWorkspace, refreshProfile, refreshComprehensiveProfile])

  const consultantClearWorkspaceDialog =
    isConsultantWorkspace ? (
      <AlertDialog open={clearWorkspaceConfirmOpen} onOpenChange={setClearWorkspaceConfirmOpen}>
        <AlertDialogContent className="border-violet-500/40 bg-slate-950 text-violet-50 sm:rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Clear client workspace?</AlertDialogTitle>
            <AlertDialogDescription className="text-violet-200/90">
              This removes their profile fields and generated reports from your workspace so you can enter the next
              client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              type="button"
              className="border-violet-400/50 text-violet-100 hover:bg-violet-900/40"
              disabled={isClearingWorkspace}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className="bg-violet-600 text-white hover:bg-violet-600/90 focus-visible:ring-violet-400"
              disabled={isClearingWorkspace || isGeneratingProfile}
              onClick={(e) => {
                e.preventDefault()
                setClearWorkspaceConfirmOpen(false)
                void performClearWorkspace()
              }}
            >
              Clear workspace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ) : null

  const saveDeferredPaymentChoice = async () => {
    if (!user?.uid) return
    setIsSavingPaymentChoice(true)
    setError(null)
    setSuccess(null)
    try {
      await updateUserProfile(user.uid, {
        selectedPlan: selectedPlanForProfile,
        paymentMethodId: "none",
        subscriptionStatus: "trial",
        autoMandateAccepted: false,
      })
      setSuccess("Saved: no payment method for now. You can add it anytime from this section.")
      await refreshProfile()
    } catch {
      setError("Could not save your payment preference. Please try again.")
    } finally {
      setIsSavingPaymentChoice(false)
    }
  }

  const handlePaymentMethodCapturedFromProfile = async (paymentMethodId: string, subscriptionId?: string) => {
    if (!user?.uid) return
    setIsSavingPaymentChoice(true)
    setError(null)
    setSuccess(null)
    try {
      await updateUserProfile(user.uid, {
        selectedPlan: selectedPlanForProfile,
        paymentMethodId,
        subscriptionId,
        subscriptionStatus: "trial",
        autoMandateAccepted: true,
      })
      setShowUpdatePaymentModal(false)
      setSuccess("Payment method verified. Your free month continues, and billing starts only after trial.")
      await refreshProfile()
    } catch {
      setError("Payment method was captured but profile update failed. Please try again.")
    } finally {
      setIsSavingPaymentChoice(false)
    }
  }

  const paymentSetupDialog = user ? (
    <AlertDialog open={showUpdatePaymentModal} onOpenChange={setShowUpdatePaymentModal}>
      <AlertDialogContent className="max-w-xl border-amber-500/40 bg-slate-950 text-amber-50 sm:rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Verify payment method</AlertDialogTitle>
          <AlertDialogDescription className="text-amber-200/90">
            Optional for now during your free month. You can also close this and choose none for now.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <PaymentMethodCapture
          selectedPlan={selectedPlanForProfile}
          userEmail={user.email || userProfile?.email || ""}
          userName={formData.displayName || user.displayName || "FutureSeer User"}
          userCountry={userProfile?.country || "IN"}
          onPaymentMethodCaptured={handlePaymentMethodCapturedFromProfile}
          onError={(message) => setError(message)}
          isSpecialUser={isSuperadmin || isAdmin}
        />
        <AlertDialogFooter>
          <AlertDialogCancel
            type="button"
            className="border-amber-400/50 text-amber-100 hover:bg-amber-900/30"
            disabled={isSavingPaymentChoice}
          >
            Close
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : null

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
    } catch {
      setError("Failed to save profile.")
    }
    finally { setIsLoading(false) }
  }

  const handlePhotoUpload = async (file: File, type: "face" | "palm") => {
    if (!user?.uid) return
    const setUploading = type === "face" ? setUploadingFace : setUploadingPalm
    const setOptimizing = type === "face" ? setOptimizingFace : setOptimizingPalm
    const key = type === "face" ? "facePhotoUrl" : "palmPhotoUrl"
    setUploading(true)
    setError(null)
    try {
      setOptimizing(true)
      const compressed = await compressImageFile(file, { maxDimension: 1600, quality: 0.82, mimeType: "image/jpeg" })
      setOptimizing(false)

      let token: string
      try {
        token = await user.getIdToken()
      } catch (authErr: unknown) {
        const f = readUploadErrorFields(authErr)
        const msg =
          mapFirebaseCodeToPhotoMessage(f.firebaseCode) ??
          "Session issue while preparing upload. Please sign in again and retry."
        setError(type === "face" ? `Face: ${msg}` : `Palm: ${msg}`)
        await logError("upload_photo", msg, "error", {
          type,
          bytes: file.size,
          mime: file.type,
          phase: "auth_token",
          proxyStatus: null,
          proxyDetail: null,
          firebaseCode: f.firebaseCode,
          apiErrorCode: null,
        })
        return
      }

      let url: string
      try {
        url = await fetchProfilePhotoUploadWithNetworkRetries(token, compressed.file, type)
      } catch (proxyErr: unknown) {
        const f = readUploadErrorFields(proxyErr)
        const detailStr = f.detail !== undefined ? JSON.stringify(f.detail) : ""
        const msg = mapProfilePhotoProxyMessage(f.status, detailStr, f.message, f.apiErrorCode)
        setError(type === "face" ? `Face: ${msg}` : `Palm: ${msg}`)
        await logError("upload_photo", typeof f.message === "string" && f.message ? f.message : msg, "error", {
          type,
          bytes: file.size,
          mime: file.type,
          phase: "proxy",
          proxyStatus: f.status,
          proxyDetail: f.detail ?? null,
          firebaseCode: f.firebaseCode,
          apiErrorCode: f.apiErrorCode,
        })
        return
      }

      try {
        setFormData((prev) => ({ ...prev, [key]: url }))
        await updateUserProfilePhotoWithRetries(user.uid, key, url)
        setTimeout(() => refreshProfile(), 300)
      } catch (fsErr: unknown) {
        const f = readUploadErrorFields(fsErr)
        const msg =
          mapFirebaseCodeToPhotoMessage(f.firebaseCode) ??
          "Your photo may have uploaded, but we could not update your profile. Try Save on your profile, or wait and upload again."
        setError(type === "face" ? `Face: ${msg}` : `Palm: ${msg}`)
        await logError("upload_photo_firestore", f.message || msg, "error", {
          type,
          bytes: file.size,
          mime: file.type,
          phase: "firestore",
          proxyStatus: null,
          proxyDetail: null,
          firebaseCode: f.firebaseCode,
          apiErrorCode: null,
        })
      }
    } catch (e: unknown) {
      if (e instanceof Error && /HEIC|iPhone or Mac photo/i.test(e.message)) {
        const msg = e.message
        setError(type === "face" ? `Face: ${msg}` : `Palm: ${msg}`)
        await logError("upload_photo", msg, "error", {
          type,
          bytes: file.size,
          mime: file.type,
          phase: "compress",
          proxyStatus: null,
          proxyDetail: null,
          firebaseCode: null,
          apiErrorCode: null,
        })
      } else {
        const f = readUploadErrorFields(e)
        const detailStr = f.detail !== undefined ? JSON.stringify(f.detail) : ""
        const fromFirebase = mapFirebaseCodeToPhotoMessage(f.firebaseCode)
        const msg =
          fromFirebase ??
          mapProfilePhotoProxyMessage(f.status, detailStr, f.message, f.apiErrorCode)
        setError(type === "face" ? `Face: ${msg}` : `Palm: ${msg}`)
        await logError("upload_photo", f.message || msg, "error", {
          type,
          bytes: file.size,
          mime: file.type,
          phase: "unknown",
          proxyStatus: f.status,
          proxyDetail: f.detail ?? null,
          firebaseCode: f.firebaseCode,
          apiErrorCode: f.apiErrorCode,
        })
      }
    } finally {
      setOptimizing(false)
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
    } catch {
      setError(`Failed to remove ${type} photo.`)
    }
  }

  if (authLoading) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center px-4 pb-16 ${isMobileLayout ? "bg-surface" : "starfield-ultra-sharp"}`}
      >
        <Loader2 className="animate-spin text-amber-400 w-10 h-10" />
        <p className="mt-4 text-sm text-amber-200/80 font-medium">Loading your profile…</p>
        <OnboardingStuckBanner
          stuck={authLoadingStall}
          variant={isMobileLayout ? "m3" : "devotionist"}
          onSignOutTryAgain={async () => {
            await signOut()
          }}
        />
      </div>
    )
  }

  // Android / Mobile: Material 3 layout
  if (isMobileLayout) {
    return (
    <>
      {consultantClearWorkspaceDialog}
      {paymentSetupDialog}
    <div data-onboarding="profile" className="min-h-screen bg-surface flex flex-col pt-[env(safe-area-inset-top)] pb-24 px-4 overflow-x-hidden">
      <div className="flex items-center justify-between h-16 mb-6">
        <Link href="/tools" className="p-2 text-amber-400 active:scale-90 transition-transform"><ArrowLeft className="w-6 h-6" /></Link>
        <h1 className="text-xl font-heading font-bold text-amber-400 uppercase tracking-tight">Cosmic Profile</h1>
        <button onClick={() => signOut()} className="p-2 text-surface-on-variant active:text-red-400"><LogOut className="w-6 h-6" /></button>
      </div>

      <div className="max-w-md mx-auto w-full space-y-6">
        {isConsultantWorkspace && (
          <Alert className="border-violet-500/40 bg-violet-950/40 rounded-2xl">
            <AlertDescription className="text-violet-100 text-sm space-y-3">
              <p className="font-semibold text-white">Consultant client workspace</p>
              <p>
                Enter your client’s birth details and photos here, then generate the full mystical profile like any new user.
                When you are done sharing their report, clear the workspace before the next client.
              </p>
              <p className="text-violet-200/90 text-xs">
                Tip: introduce clients to futureseer.app alongside your in-person offerings.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full border-violet-400/50 text-violet-100 hover:bg-violet-900/40"
                onClick={openClearWorkspaceConfirm}
                disabled={isClearingWorkspace || isGeneratingProfile}
              >
                {isClearingWorkspace ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2 inline" />
                )}
                Clear client workspace
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <div className="bg-surface-container-high rounded-3xl p-5 border border-outline-variant shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-container rounded-xl"><Heart className="w-5 h-5 text-primary-on-container" /></div>
            <h2 className="font-bold text-white uppercase text-sm tracking-widest">Plan & Referral</h2>
          </div>
          {userProfile && <SubscriptionStatus userProfile={userProfile} onCancel={() => refreshProfile()} onUpdatePaymentClick={() => setShowUpdatePaymentModal(true)} />}
          <div className="mt-4 border-t border-outline-variant pt-4 space-y-3">
            <p className="text-xs text-surface-on-variant">
              Choose your payment path now: verify your payment method or pick none for now (free month still active).
            </p>
            <select
              value={selectedPlanForProfile}
              onChange={(e) => setSelectedPlanForProfile(e.target.value as ProfilePlanId)}
              className="h-11 w-full rounded-xl bg-surface-container-low border border-outline-variant px-3 text-white"
            >
              <option value="power-user-trial">Power User Trial</option>
              <option value="buy-coffee">Coffee (Monthly)</option>
              <option value="treat-me">Treat (Quarterly)</option>
              <option value="festive-hamper">Hamper (Annual)</option>
            </select>
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                onClick={() => setShowUpdatePaymentModal(true)}
                disabled={isSavingPaymentChoice}
                className="w-full bg-amber-500 text-slate-900 font-semibold"
              >
                Verify payment now
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={saveDeferredPaymentChoice}
                disabled={isSavingPaymentChoice}
                className="w-full"
              >
                None for now (1 month free)
              </Button>
            </div>
          </div>
          {user && <div className="mt-4 border-t border-outline-variant pt-4"><ReferralCodeCard userId={user.uid} /></div>}
        </div>

        {showPaymentReminder && (
          <Alert className="border-amber-500/40 bg-amber-500/10 rounded-2xl">
            <AlertDescription className="text-amber-100 text-sm space-y-2">
              <p className="font-semibold text-amber-200">Your free month is active.</p>
              <p>
                {trialDaysRemaining != null
                  ? trialDaysRemaining <= 5
                    ? `You have ${trialDaysRemaining} day${trialDaysRemaining === 1 ? "" : "s"} left. Add a payment method now so your access continues smoothly after trial.`
                    : `You have ${trialDaysRemaining} days left. You can keep using FutureSeer now and add your payment method anytime before trial ends.`
                  : "You can keep using FutureSeer now and add your payment method anytime before trial ends."}
              </p>
              <Button
                type="button"
                onClick={() => setShowUpdatePaymentModal(true)}
                className="w-full bg-amber-500 text-slate-900 font-semibold"
              >
                Verify payment method
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {user?.uid && (
          <div className="bg-surface-container-high rounded-3xl p-5 border border-outline-variant shadow-lg space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-container rounded-xl">
                <Sparkles className="w-5 h-5 text-primary-on-container" />
              </div>
              <h2 className="font-bold text-white uppercase text-sm tracking-widest">The Seer</h2>
            </div>
            <SeerNewsHeadlinesToggle
              userId={user.uid}
              enabled={!!userProfile?.seerIncludeNewsHeadlines}
              onUpdated={() => refreshProfile()}
            />
          </div>
        )}

        {hasProfile && !canViewFullProfile && (
          <Alert className="border-amber-500/30 bg-amber-500/10 rounded-2xl">
            <AlertDescription className="text-amber-200 text-sm space-y-3">
              <p>{PROFILE_PLAN_REQUIRED_BODY}</p>
              <Button
                asChild
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-bold hover:from-amber-600 hover:to-yellow-600"
              >
                <Link
                  href="/pricing"
                  onClick={() =>
                    analytics.trackEvent(ANALYTICS_EVENTS.PROFILE_PLAN_CTA_CLICKED, {
                      destination: "/pricing",
                      surface: "profile_plan_alert",
                      layout: "mobile",
                    })
                  }
                >
                  {PROFILE_PLAN_PRICING_CTA_LABEL}
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {userProfile &&
          !userProfile.mysticalProfileGenerated &&
          !isSuperadmin &&
          !isAdmin && (
          <ProfileNextStepsBanner variant="m3" isConsultantWorkspace={isConsultantWorkspace} />
        )}

        <div id="profile-personal-data" className="bg-surface-container-high rounded-[32px] p-6 border border-outline-variant shadow-2xl space-y-8 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-outline-variant pb-4">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold text-white">{isConsultantWorkspace ? "Client details" : "Personal Data"}</h2>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="ghost" className="text-amber-400 font-bold uppercase text-xs tracking-widest px-4 h-10 bg-amber-500/10 rounded-full">Edit</Button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaveDisabled}
                  className={`p-2 bg-amber-500 text-slate-900 rounded-full shadow-lg active:scale-90 ${isSaveDisabled ? "opacity-50 pointer-events-none" : ""}`}
                  aria-disabled={isSaveDisabled}
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                  className={`p-2 bg-surface-container-lowest text-white rounded-full border border-outline-variant active:scale-90 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                  aria-disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {error && <Alert className="bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl"><AlertDescription className="font-bold">{error}</AlertDescription></Alert>}
          {success && <Alert className="bg-green-500/10 border-green-500/20 text-green-400 rounded-2xl"><AlertDescription className="font-bold">{success}</AlertDescription></Alert>}

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest ml-1">Display Name</Label>
              {isEditing ? <Input value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="h-14 bg-surface-container-low border-outline-variant rounded-2xl" /> : <p className="text-lg font-bold text-white ml-1">{formData.displayName || "Not set"}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest ml-1">Full Name</Label>
              {isEditing ? <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Full name (for numerology & reports)" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl" /> : <p className="text-lg font-bold text-white ml-1">{formData.fullName || "Not set"}</p>}
            </div>

            <div className="space-y-2 relative z-20 overflow-visible">
              <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest ml-1">Gender</Label>
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
                <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest ml-1">Birth Date</Label>
                {isEditing ? <Input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="h-14 bg-surface-container-low border-outline-variant rounded-2xl [color-scheme:dark]" /> : <p className="text-lg font-bold text-white ml-1">{formData.birthDate || "Not set"}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest ml-1">Birth Place</Label>
                {isEditing ? <Input value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} className="h-14 bg-surface-container-low border-outline-variant rounded-2xl" /> : <p className="text-lg font-bold text-white ml-1">{formData.birthPlace || "Not set"}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest ml-1">Time of Birth</Label>
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
                <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest ml-1">Current residence</Label>
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
                <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Face Scan</Label>
                <div className="aspect-square bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden relative">
                  {formData.facePhotoUrl ? <img src={formData.facePhotoUrl} className="w-full h-full object-cover" alt="" /> : <Camera className="w-8 h-8 opacity-20" />}
                  {uploadingFace && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>}
                </div>
                {isEditing && (
                  <div className="flex flex-col gap-1">
                    <input
                      ref={faceInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, "face"); e.target.value = ""; }}
                    />
                    <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => faceInputRef.current?.click()} disabled={uploadingFace}>
                      Open camera
                    </Button>
                    {formData.facePhotoUrl && <Button type="button" variant="ghost" size="sm" className="text-xs text-red-400" onClick={() => handleRemovePhoto("face")}>Remove</Button>}
                  </div>
                )}
              </div>
              <div className="space-y-2 text-center">
                <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Palm Scan</Label>
                <p className="text-sm text-white/70">Upload left palm (female) or right palm (male).</p>
                <div className="aspect-square bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden relative">
                  {formData.palmPhotoUrl ? <img src={formData.palmPhotoUrl} className="w-full h-full object-cover" alt="" /> : <Camera className="w-8 h-8 opacity-20" />}
                  {uploadingPalm && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>}
                </div>
                {isEditing && (
                  <div className="flex flex-col gap-1">
                    <input
                      ref={palmInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, "palm"); e.target.value = ""; }}
                    />
                    <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => palmInputRef.current?.click()} disabled={uploadingPalm}>
                      Open camera
                    </Button>
                    {formData.palmPhotoUrl && <Button type="button" variant="ghost" size="sm" className="text-xs text-red-400" onClick={() => handleRemovePhoto("palm")}>Remove</Button>}
                  </div>
                )}
              </div>
            </div>

            {!isEditing && (
              <div id="profile-generate-mystical" className="pt-6 border-t border-outline-variant/30 scroll-mt-24">
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
                      analytics.trackProfileGenerationStarted({ surface: 'profile_primary' })
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
                      analytics.trackProfileGenerationCompleted(true, {
                        surface: 'profile_primary',
                        failed_tools_count: Array.isArray(data.failedTools) ? data.failedTools.length : 0,
                      })
                      if (user?.uid && isGrowthProfileDraftEnabled()) clearProfileDraft(user.uid)
                      setSuccess("Mystical Profile Generated!")
                      try {
                        if (typeof window !== "undefined") {
                          sessionStorage.setItem(SEQ_PROMPT_AFTER_PROFILE_GEN, "1")
                        }
                      } catch {
                        /* ignore */
                      }
                      router.push(RETURNING_USER_WITH_REPORTS_DESTINATION)
                    } catch (e: unknown) {
                      if (e instanceof Error && e.name === "AbortError") return
                      analytics.trackProfileGenerationCompleted(false, {
                        surface: 'profile_primary',
                        error: e instanceof Error ? e.message : 'unknown',
                      })
                      setError(e instanceof Error ? e.message : "Generation failed. Please check your connection and try again.")
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
                  <p className="text-center text-amber-400/50 text-xs mt-2">
                    {isConsultantWorkspace
                      ? "The client’s birth details above will be used for generation."
                      : "Your current birth details above will be used for generation."}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed left-0 right-0 z-[150] bottom-[calc(env(safe-area-inset-bottom)+76px)] px-4">
          <div className="max-w-md mx-auto w-full rounded-2xl border border-outline-variant bg-surface-container-high/95 backdrop-blur px-3 py-3 shadow-2xl">
            {isUploadBusy ? (
              <div className="mb-2 text-xs font-medium text-amber-200/90">
                Finishing upload… you can save once uploads complete.
              </div>
            ) : null}
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaveDisabled}
                className="flex-1 h-12 rounded-2xl bg-amber-500 text-slate-900 font-bold shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </span>
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
                className="flex-1 h-12 rounded-2xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
    )
  }

  // Web: devotionist layout (deep blue + golden yellow, starfield)
  return (
    <>
      {consultantClearWorkspaceDialog}
      {paymentSetupDialog}
    <div data-onboarding="profile" className="min-h-screen starfield-ultra-sharp flex flex-col pb-16 px-4 md:px-8 overflow-x-hidden">
      <div className="max-w-2xl mx-auto w-full py-8">
        <div className="flex items-center justify-between h-14 mb-8">
          <Link href="/tools" className="text-amber-400 flex items-center gap-2 font-heading tracking-widest uppercase text-sm opacity-80 hover:opacity-100"><ArrowLeft className="w-5 h-5" /> Back</Link>
          <h1 className="text-2xl font-heading font-light text-amber-400 gold-glow uppercase tracking-widest">Cosmic Profile</h1>
          <button onClick={() => signOut()} className="p-2 text-amber-200/80 hover:text-red-400 rounded-full transition-colors" aria-label="Sign out"><LogOut className="w-5 h-5" /></button>
        </div>

        <div className="space-y-6">
          {isConsultantWorkspace && (
            <Alert className="border-violet-500/40 bg-violet-950/30 rounded-2xl">
              <AlertDescription className="text-violet-100 text-sm space-y-3">
                <p className="font-semibold text-white">Consultant client workspace</p>
                <p>
                  Enter your client’s birth details and photos here, then generate the full mystical profile like any new user.
                  When you are done sharing their report, clear the workspace before the next client.
                </p>
                <p className="text-violet-200/90 text-xs">
                  Tip: introduce clients to futureseer.app alongside your in-person offerings.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto border-violet-400/50 text-violet-100 hover:bg-violet-900/40"
                  onClick={openClearWorkspaceConfirm}
                  disabled={isClearingWorkspace || isGeneratingProfile}
                >
                  {isClearingWorkspace ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2 inline" />
                  )}
                  Clear client workspace
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#020617]/80 backdrop-blur-xl rounded-3xl p-6 border border-amber-500/20 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/20 rounded-xl"><Heart className="w-5 h-5 text-amber-400" /></div>
              <h2 className="font-bold text-amber-400 uppercase text-sm tracking-widest">Plan & Referral</h2>
            </div>
            {userProfile && <SubscriptionStatus userProfile={userProfile} onCancel={() => refreshProfile()} onUpdatePaymentClick={() => setShowUpdatePaymentModal(true)} />}
            <div className="mt-4 border-t border-amber-400/20 pt-4 space-y-3">
              <p className="text-xs text-amber-200/80">
                Choose your payment path now: verify your payment method or select none for now (free month still active).
              </p>
              <select
                value={selectedPlanForProfile}
                onChange={(e) => setSelectedPlanForProfile(e.target.value as ProfilePlanId)}
                className="h-11 w-full rounded-xl bg-white/5 border border-amber-400/30 px-3 text-white"
              >
                <option value="power-user-trial">Power User Trial</option>
                <option value="buy-coffee">Coffee (Monthly)</option>
                <option value="treat-me">Treat (Quarterly)</option>
                <option value="festive-hamper">Hamper (Annual)</option>
              </select>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={() => setShowUpdatePaymentModal(true)}
                  disabled={isSavingPaymentChoice}
                  className="bg-amber-500 hover:bg-amber-400 text-[#020617] font-semibold"
                >
                  Verify payment now
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveDeferredPaymentChoice}
                  disabled={isSavingPaymentChoice}
                  className="border-amber-400/30 text-white"
                >
                  None for now (1 month free)
                </Button>
              </div>
            </div>
            {user && <div className="mt-4 border-t border-amber-400/20 pt-4"><ReferralCodeCard userId={user.uid} /></div>}
          </motion.div>

          {showPaymentReminder && (
            <Alert className="border-amber-500/40 bg-amber-500/10 rounded-2xl">
              <AlertDescription className="text-amber-100 space-y-2">
                <p className="font-semibold text-amber-200">Your free month is active.</p>
                <p>
                  {trialDaysRemaining != null
                    ? trialDaysRemaining <= 5
                      ? `You have ${trialDaysRemaining} day${trialDaysRemaining === 1 ? "" : "s"} left. Add a payment method now so your access continues smoothly after trial.`
                      : `You have ${trialDaysRemaining} days left. You can keep using FutureSeer now and add your payment method anytime before trial ends.`
                    : "You can keep using FutureSeer now and add your payment method anytime before trial ends."}
                </p>
                <Button
                  type="button"
                  onClick={() => setShowUpdatePaymentModal(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-[#020617] font-semibold"
                >
                  Verify payment method
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {user?.uid && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.02 }}
              className="bg-[#020617]/80 backdrop-blur-xl rounded-3xl p-6 border border-amber-500/20 shadow-xl space-y-3"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-amber-500/20 rounded-xl">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="font-bold text-amber-400 uppercase text-sm tracking-widest">The Seer</h2>
              </div>
              <SeerNewsHeadlinesToggle
                userId={user.uid}
                enabled={!!userProfile?.seerIncludeNewsHeadlines}
                onUpdated={() => refreshProfile()}
              />
            </motion.div>
          )}

          {hasProfile && !canViewFullProfile && (
            <Alert className="border-amber-500/30 bg-amber-500/10 rounded-2xl">
              <AlertDescription className="text-amber-200 space-y-3">
                <p>{PROFILE_PLAN_REQUIRED_BODY}</p>
                <Button
                  asChild
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-bold hover:from-amber-600 hover:to-yellow-600"
                >
                  <Link
                    href="/pricing"
                    onClick={() =>
                      analytics.trackEvent(ANALYTICS_EVENTS.PROFILE_PLAN_CTA_CLICKED, {
                        destination: "/pricing",
                        surface: "profile_plan_alert",
                        layout: "web",
                      })
                    }
                  >
                    {PROFILE_PLAN_PRICING_CTA_LABEL}
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {userProfile &&
            !userProfile.mysticalProfileGenerated &&
            !isSuperadmin &&
            !isAdmin && (
            <ProfileNextStepsBanner variant="devotionist" isConsultantWorkspace={isConsultantWorkspace} />
          )}

          <motion.div
            id="profile-personal-data"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[#020617]/80 backdrop-blur-xl rounded-3xl p-6 border border-amber-500/20 shadow-xl space-y-6 scroll-mt-24"
          >
            <div className="flex items-center justify-between border-b border-amber-400/20 pb-4">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-amber-400" />
                <h2 className="text-xl font-bold text-white">{isConsultantWorkspace ? "Client details" : "Personal Data"}</h2>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="ghost" className="text-amber-400 font-bold uppercase text-xs tracking-widest px-4 h-10 bg-amber-500/10 rounded-full hover:bg-amber-500/20">Edit</Button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaveDisabled}
                    className={`p-2 bg-amber-500 text-[#020617] rounded-full shadow-lg hover:bg-amber-400 ${isSaveDisabled ? "opacity-50 pointer-events-none" : ""}`}
                    aria-disabled={isSaveDisabled}
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                    className={`p-2 bg-white/10 text-white rounded-full border border-amber-400/30 hover:bg-white/20 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                    aria-disabled={isLoading}
                  >
                    <X className="w-5 h-5" />
                  </button>
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

              {isEditing && (
                <div className="pt-4 border-t border-amber-400/20">
                  {isUploadBusy ? (
                    <div className="mb-3 text-xs text-amber-200/80">
                      Finishing upload… you can save once uploads complete.
                    </div>
                  ) : null}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaveDisabled}
                      className="flex-1 h-12 rounded-2xl bg-amber-500 hover:bg-amber-400 text-[#020617] font-bold shadow-xl"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving…
                        </span>
                      ) : (
                        "Save changes"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                      className="flex-1 h-12 rounded-2xl border-amber-400/30 text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {!isEditing && (
                <div id="profile-generate-mystical" className="pt-6 border-t border-amber-400/20 scroll-mt-24">
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
                        analytics.trackProfileGenerationStarted({ surface: 'profile_secondary' })
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
                        analytics.trackProfileGenerationCompleted(true, {
                          surface: 'profile_secondary',
                          failed_tools_count: Array.isArray(data.failedTools) ? data.failedTools.length : 0,
                        })
                        if (user?.uid && isGrowthProfileDraftEnabled()) clearProfileDraft(user.uid)
                        setSuccess("Mystical Profile Generated!")
                        try {
                          if (typeof window !== "undefined") {
                            sessionStorage.setItem(SEQ_PROMPT_AFTER_PROFILE_GEN, "1")
                          }
                        } catch {
                          /* ignore */
                        }
                        router.push(RETURNING_USER_WITH_REPORTS_DESTINATION)
                      } catch (e: unknown) {
                        if (e instanceof Error && e.name === "AbortError") return
                        analytics.trackProfileGenerationCompleted(false, {
                          surface: 'profile_secondary',
                          error: e instanceof Error ? e.message : 'unknown',
                        })
                        setError(e instanceof Error ? e.message : "Generation failed. Please check your connection and try again.")
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
                    <p className="text-center text-amber-200/60 text-xs mt-2">
                      {isConsultantWorkspace
                        ? "The client’s birth details above will be used for generation."
                        : "Your current birth details above will be used for generation."}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    </>
  )
}
