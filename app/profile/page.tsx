"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
import { Loader2, ArrowLeft, User, Save, X, LogOut, Sparkles, Camera, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { updateUserProfile, type UserProfile } from "@/lib/firebase"
import { normalizeBirthTime } from "@/lib/birthTimeUtils"
import { getOverQuotaMessage } from "@/lib/profileEditQuota"
import { clearComprehensiveMysticalProfileCache, clearPersistentProfileCache, useComprehensiveMysticalProfile } from "@/hooks/useComprehensiveMysticalProfile"
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout"
import { SEQ_PROMPT_AFTER_PROFILE_GEN } from "@/lib/metricsSession"
import { type BirthTimePeriodId } from "@/lib/birthTimeResolver"
import { useErrorLogger } from "@/hooks/useErrorLogger"
import { useOnboardingStallRecovery } from "@/hooks/useOnboardingStallRecovery"
import { logUserPain } from "@/lib/painLogging"
import { OnboardingStuckBanner } from "@/components/onboarding/OnboardingStuckBanner"
import { compressImageFile } from "@/lib/imageCompression"
import { PROFILE_PLAN_PRICING_CTA_LABEL, PROFILE_PLAN_REQUIRED_BODY } from "@/lib/accessGatingCopy"
import { analytics, ANALYTICS_EVENTS } from "@/lib/analytics"
import { isGrowthProfileDraftEnabled } from "@/lib/growthFlags"
import { clearProfileDraft, loadProfileDraft, saveProfileDraft } from "@/lib/profileDraftStorage"
import { SeerNewsHeadlinesToggle } from "@/components/integrations/SeerNewsHeadlinesToggle"
import { isClientWorkspaceEmail } from "@/lib/clientWorkspace"
import { getMissingFirstGenerationFields, isTrialActive } from "@/lib/subscriptionConfig"

type BirthTimeAmPm = "AM" | "PM"

function parseBirthTimeAmPm(v: string | undefined | null): BirthTimeAmPm {
  return String(v ?? "").toUpperCase() === "PM" ? "PM" : "AM"
}
import { ONBOARDING_FULL_REPORT_BYPASS_KEY } from "@/lib/authRouting"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const PROFILE_PHOTO_FETCH_ATTEMPTS = 3
const PROFILE_PHOTO_FIRESTORE_ATTEMPTS = 3

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

function normalizeBirthDateForUi(value: string | undefined): string {
  if (!value) return ""
  const isoLike = /^\d{4}-\d{2}-\d{2}$/
  if (isoLike.test(value)) return value
  const dmy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value)
  if (dmy) {
    const [, dd, mm, yyyy] = dmy
    return `${yyyy}-${mm}-${dd}`
  }
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }
  return value
}

const FULL_FIELD_LABELS: Record<string, string> = {
  displayName: "Display name",
  fullName: "Full name",
  gender: "Gender",
  birthDate: "Birth date",
  birthTime: "Birth time",
  birthPlace: "Birth place",
  currentLocation: "Current residence",
  facePhotoUrl: "Face photo",
  palmPhotoUrl: "Palm photo",
}

type RequiredStepId = "identity" | "birth" | "residence" | "media"

const REQUIRED_STEP_FIELDS: Record<RequiredStepId, string[]> = {
  identity: ["displayName", "fullName", "gender"],
  birth: ["birthDate", "birthTime", "birthPlace"],
  residence: ["currentLocation"],
  media: ["facePhotoUrl", "palmPhotoUrl"],
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

const PROFILE_GENDER_UNSET = "__profile_gender_unset__" as const

function ProfileGenderSelect({
  value,
  onChange,
  platform,
  borderClassName,
}: {
  value: UserProfile["gender"] | undefined
  onChange: (next: UserProfile["gender"] | undefined) => void
  platform: "mobile" | "web"
  borderClassName: string
}) {
  const radixValue = value ?? PROFILE_GENDER_UNSET
  const h = platform === "mobile" ? "h-14" : "h-12"
  const bg = platform === "mobile" ? "bg-surface-container-low" : "bg-white/5"
  return (
    <Select
      value={radixValue}
      onValueChange={(v) =>
        onChange(v === PROFILE_GENDER_UNSET ? undefined : (v as UserProfile["gender"]))
      }
    >
      <SelectTrigger
        className={cn(
          `${h} w-full rounded-2xl border px-4 text-white [color-scheme:dark]`,
          bg,
          borderClassName,
          "focus:ring-2 focus:ring-amber-500/30 focus:ring-offset-0",
        )}
      >
        <SelectValue placeholder="Not set" />
      </SelectTrigger>
      <SelectContent className="z-[100]" position="popper">
        <SelectItem value={PROFILE_GENDER_UNSET}>Not set</SelectItem>
        <SelectItem value="male">Male</SelectItem>
        <SelectItem value="female">Female</SelectItem>
        <SelectItem value="non-binary">Non-binary</SelectItem>
      </SelectContent>
    </Select>
  )
}

function ProfileAmPmSelect({
  value,
  onChange,
  disabled,
  platform,
}: {
  value: BirthTimeAmPm
  onChange: (next: BirthTimeAmPm) => void
  disabled: boolean
  platform: "mobile" | "web"
}) {
  const h = platform === "mobile" ? "h-14" : "h-12"
  const bg = platform === "mobile" ? "bg-surface-container-low" : "bg-white/5"
  const border =
    platform === "mobile" ? "border border-outline-variant" : "border border-amber-400/30"
  return (
    <Select value={value} onValueChange={(v) => onChange(v as BirthTimeAmPm)} disabled={disabled}>
      <SelectTrigger
        className={cn(
          h,
          "min-w-[72px] rounded-2xl px-3 text-white",
          bg,
          border,
          "focus:ring-2 focus:ring-amber-500/30 focus:ring-offset-0",
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="z-[100]" position="popper">
        <SelectItem value="AM">AM</SelectItem>
        <SelectItem value="PM">PM</SelectItem>
      </SelectContent>
    </Select>
  )
}

export default function ProfilePage() {
  const { user, userProfile, signOut, loading: authLoading, refreshProfile, isSuperadmin, isAdmin } = useAuth()
  const { applyGeneratedProfile, refreshProfile: refreshComprehensiveProfile, hasProfile, canViewFullProfile } = useComprehensiveMysticalProfile()
  const router = useRouter()

  const isConsultantWorkspace = useMemo(
    () => isClientWorkspaceEmail(user?.email ?? null),
    [user?.email]
  )

  const [isEditing, setIsEditing] = useState(false)
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [acceptedFreeTrialTerms, setAcceptedFreeTrialTerms] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<string>("")
  const generationAbortRef = useRef<AbortController | null>(null)
  const autoEditBootstrappedRef = useRef(false)
  const isMountedRef = useRef(true)
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
  const faceCameraInputRef = useRef<HTMLInputElement>(null)
  const faceUploadInputRef = useRef<HTMLInputElement>(null)
  const palmCameraInputRef = useRef<HTMLInputElement>(null)
  const palmUploadInputRef = useRef<HTMLInputElement>(null)
  const isUploadBusy = uploadingFace || uploadingPalm || optimizingFace || optimizingPalm
  const isSaveDisabled = isLoading || isUploadBusy

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

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
    birthDate: "", birthTime: "", birthTimeAMPM: "AM" as BirthTimeAmPm,
    birthTimeKnown: true,
    birthTimePeriod: undefined as BirthTimePeriodId | undefined,
    birthTimeNote: "", birthPlace: "", currentLocation: "",
    facePhotoUrl: "", palmPhotoUrl: ""
  })

  const fullProfileChecklist = useMemo(() => {
    try {
      const profileForChecklist: Partial<UserProfile> = {
        displayName: formData.displayName || undefined,
        fullName: formData.fullName || undefined,
        gender: formData.gender,
        birthDate: formData.birthDate || undefined,
        birthTime: formData.birthTime || undefined,
        birthTimeKnown: formData.birthTimeKnown,
        birthPlace: formData.birthPlace || undefined,
        currentLocation: formData.currentLocation || undefined,
        facePhotoUrl: formData.facePhotoUrl || undefined,
        palmPhotoUrl: formData.palmPhotoUrl || undefined,
      }
      const missing = getMissingFirstGenerationFields(profileForChecklist, { allowUnknownBirthTime: true })
      return Array.isArray(missing) ? missing.map((f) => FULL_FIELD_LABELS[f] ?? f) : []
    } catch {
      return []
    }
  }, [formData])
  const missingGenerationFieldKeys = useMemo(() => {
    try {
      const profileForChecklist: Partial<UserProfile> = {
        displayName: formData.displayName || undefined,
        fullName: formData.fullName || undefined,
        gender: formData.gender,
        birthDate: formData.birthDate || undefined,
        birthTime: formData.birthTime || undefined,
        birthTimeKnown: formData.birthTimeKnown,
        birthPlace: formData.birthPlace || undefined,
        currentLocation: formData.currentLocation || undefined,
        facePhotoUrl: formData.facePhotoUrl || undefined,
        palmPhotoUrl: formData.palmPhotoUrl || undefined,
      }
      const missing = getMissingFirstGenerationFields(profileForChecklist, { allowUnknownBirthTime: true })
      return Array.isArray(missing) ? missing : []
    } catch {
      return []
    }
  }, [formData])
  const canGenerateFromOnboarding = canGenerateMysticalProfile && missingGenerationFieldKeys.length === 0
  const completedStepsTrackedRef = useRef<Set<RequiredStepId>>(new Set())
  const trialIsActive = isTrialActive(userProfile)
  const isFirstHookUser = !userProfile?.mysticalProfileGenerated
  const retentionSnapshot = useMemo(() => {
    const profileRec = (userProfile ?? null) as (Record<string, unknown> | null)
    const lastActiveRaw = profileRec?.lastActiveAt
    const trialEndsRaw = profileRec?.trialEndsAt
    const lastActiveAt = typeof lastActiveRaw === "number" ? lastActiveRaw : null
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    const daysSinceLast = lastActiveAt ? Math.floor((now - lastActiveAt) / dayMs) : Number.POSITIVE_INFINITY
    const trialDaysLeft =
      typeof trialEndsRaw === "number" ? Math.max(0, Math.ceil((trialEndsRaw - now) / dayMs)) : null
    const nudgeStage = trialDaysLeft !== null && trialDaysLeft <= 3
      ? "trial_ending"
      : daysSinceLast <= 0
        ? "active"
        : daysSinceLast <= 1
          ? "at_risk"
          : "reactivation"
    return {
      currentStreak: typeof profileRec?.streakDays === "number" ? Number(profileRec.streakDays) : 0,
      lastActiveAt,
      loopCompletedToday: daysSinceLast === 0,
      trialDaysLeft,
      nudgeStage,
    } as const
  }, [userProfile])
  const missingLabels = missingGenerationFieldKeys.map((field) => FULL_FIELD_LABELS[field] ?? field)
  const missingFieldSet = useMemo(() => new Set(missingGenerationFieldKeys), [missingGenerationFieldKeys])
  const isFieldMissing = useCallback((fieldKey: string) => missingFieldSet.has(fieldKey), [missingFieldSet])
  const getRequiredFieldClasses = useCallback(
    (fieldKey: string, platform: "mobile" | "web") => {
      const missing = isFieldMissing(fieldKey)
      if (platform === "mobile") {
        return missing
          ? "border-rose-400/70 focus-visible:border-rose-300"
          : "border-outline-variant"
      }
      return missing
        ? "border-rose-400/70 focus-visible:border-rose-300"
        : "border-white/10 focus:border-amber-500"
    },
    [isFieldMissing],
  )

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
      const bt = String(userProfile.birthTime || "")
      let btAMPM: BirthTimeAmPm = "AM"
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
        birthDate: normalizeBirthDateForUi(userProfile.birthDate),
        birthTime: bt,
        birthTimeAMPM: btAMPM,
        birthTimeKnown: userProfile.birthTimeKnown ?? true,
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
    if (autoEditBootstrappedRef.current) return
    if (!userProfile) return
    if (isConsultantWorkspace) return
    if (userProfile.mysticalProfileGenerated) return
    autoEditBootstrappedRef.current = true
    setIsEditing(true)
  }, [userProfile, isConsultantWorkspace])

  useEffect(() => {
    setAcceptedFreeTrialTerms(Boolean(userProfile?.freeTrialTermsAccepted))
  }, [userProfile?.freeTrialTermsAccepted])

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
      birthTimeAMPM: parseBirthTimeAmPm(prev.birthTimeAMPM || d.birthTimeAMPM),
      birthTimeKnown: prev.birthTimeKnown ?? d.birthTimeKnown ?? true,
      birthPlace: prev.birthPlace || d.birthPlace,
      currentLocation: prev.currentLocation || d.currentLocation,
      birthTimeNote: prev.birthTimeNote || d.birthTimeNote,
    }))
    canPersistDraftRef.current = true
  }, [user?.uid, userProfile, isConsultantWorkspace])

  useEffect(() => {
    const stepOrder: RequiredStepId[] = ["identity", "birth", "residence", "media"]
    for (const stepId of stepOrder) {
      const isComplete = !REQUIRED_STEP_FIELDS[stepId].some((field) => missingGenerationFieldKeys.includes(field))
      if (isComplete && !completedStepsTrackedRef.current.has(stepId)) {
        analytics.trackProfileRequiredStepCompleted(stepId, {
          layout: isMobileLayout ? "mobile" : "web",
        })
        completedStepsTrackedRef.current.add(stepId)
      }
    }
  }, [missingGenerationFieldKeys, isMobileLayout])

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
        birthTimeAMPM: "AM" as BirthTimeAmPm,
        birthTimeKnown: true,
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
  const buildProfileOverridesForGenerate = (): Record<string, string | number | boolean | undefined> => {
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
    const normalizedBirthTime = formData.birthTimeKnown === false
      ? "12:00:00"
      : (normalizeBirthTime(bt24 || "12:00:00") || undefined)
    const overrides: Record<string, string | number | boolean | undefined> = {
      birthDate: formData.birthDate || undefined,
      birthTime: normalizedBirthTime,
      birthTimeKnown: formData.birthTimeKnown,
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

  const handleGenerateMysticalProfile = async (surface: string, mode: "preview" | "full" = "full") => {
    if (isGeneratingProfile) return
    if (isEditing) {
      setError("Please save your profile changes before generating the full report.")
      return
    }
    if (missingGenerationFieldKeys.length > 0) {
      const missingLabels = missingGenerationFieldKeys.map((field) => FULL_FIELD_LABELS[field] ?? field)
      analytics.trackProfileGenerateBlockedMissingFields(missingGenerationFieldKeys, { surface, mode })
      setError(`Complete all required profile fields first: ${missingLabels.join(", ")}.`)
      return
    }
    if (!canGenerateMysticalProfile) {
      setError(getOverQuotaMessage(userProfile?.selectedPlan))
      return
    }
    if (user?.uid) {
      clearComprehensiveMysticalProfileCache(user.uid)
      clearPersistentProfileCache(user.uid)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("futureSeer:profileInvalidated", { detail: { userId: user.uid } }))
      }
    }
    setIsGeneratingProfile(true)
    setError(null)
    setGenerationStatus("Preparing your cosmic reading...")
    const abort = new AbortController()
    generationAbortRef.current = abort
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("futureSeer:generationStatus", "in_progress")
        sessionStorage.removeItem("futureSeer:generationError")
      }
      analytics.trackProfileGenerationStarted({ surface })
      const t = await user?.getIdToken()
      if (!t) throw new Error("Please sign in again to continue.")
      if (user?.uid && userProfile?.mysticalProfileGenerated !== true) {
        await updateUserProfile(user.uid, {
          selectedPlan: "power-user-trial",
          subscriptionStatus: "trial",
          freeTrialTermsAccepted: true,
          freeTrialTermsAcceptedAt: Date.now(),
        })
      }
      const profileOverrides = buildProfileOverridesForGenerate()
      const res = await fetch("/api/profile/generate-mystical", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({ profileOverrides, mode }),
        signal: abort.signal,
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 409) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("futureSeer:generationStatus", "in_progress")
          sessionStorage.removeItem("futureSeer:generationError")
        }
        setError(null)
        if (mode === "full") {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(ONBOARDING_FULL_REPORT_BYPASS_KEY, "1")
            window.dispatchEvent(new CustomEvent("futureSeer:onboardingBypassChanged"))
          }
          router.push("/mystical-profile?generating=1")
        }
        return
      }
      if (!res.ok) {
        if (res.status === 403) setCanGenerateMysticalProfile(false)
        const payload = data as { error?: string; blockReason?: string; missingFields?: string[] }
        if (payload.blockReason === "missing_fields" && Array.isArray(payload.missingFields) && payload.missingFields.length > 0) {
          throw new Error(`Complete these fields for full report: ${payload.missingFields.map((f) => FULL_FIELD_LABELS[f] ?? f).join(", ")}`)
        }
        if (payload.blockReason === "payment_required" || payload.blockReason === "trial_expired") {
          throw new Error(`${payload.error ?? "Full report requires payment setup."} Open Settings to complete billing and plan.`)
        }
        if (payload.blockReason === "payment_method_update_required") {
          throw new Error(`${payload.error ?? "Payment method update required."} Open Settings to update billing details.`)
        }
        throw new Error(payload.error || "Profile generation failed. Please try again.")
      }
      setGenerationStatus("Generating readings across all divination systems... This may take up to 2 minutes.")
      if (typeof window !== "undefined" && mode === "full") {
        sessionStorage.setItem(ONBOARDING_FULL_REPORT_BYPASS_KEY, "1")
        window.dispatchEvent(new CustomEvent("futureSeer:onboardingBypassChanged"))
      }
      router.push("/mystical-profile?generating=1")
      if ((data as { inProgress?: boolean }).inProgress) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("futureSeer:generationStatus", "in_progress")
        }
        return
      }
      if (data.success && data.comprehensiveProfile) {
        applyGeneratedProfile(data.comprehensiveProfile)
      } else if (data.success && data.alreadyGenerated) {
        await refreshComprehensiveProfile()
      }
      const generationState = (data as { generationState?: string }).generationState
      const isBackgroundStageRunning = generationState === "stageA_complete_stageB_running"
      if (typeof window !== "undefined") {
        sessionStorage.setItem("futureSeer:generationStatus", isBackgroundStageRunning ? "in_progress" : "completed")
      }
      window.dispatchEvent(
        new CustomEvent("futureSeer:profileGenerationCompleted", {
          detail: {
            success: true,
            pending: isBackgroundStageRunning,
            phase: (data as { phase?: string }).phase,
            completedTools: (data as { completedTools?: number }).completedTools,
            totalTools: (data as { totalTools?: number }).totalTools,
            comprehensiveProfile: data.comprehensiveProfile,
          },
        }),
      )
      analytics.trackProfileGenerationCompleted(true, {
        surface,
        failed_tools_count: Array.isArray(data.failedTools) ? data.failedTools.length : 0,
      })
      if (isFirstHookUser) {
        analytics.trackFirstTimeOnboardingCompleted({
          surface,
          generation_state: generationState ?? "completed",
        })
      }
      if (user?.uid && isGrowthProfileDraftEnabled()) clearProfileDraft(user.uid)
      if (isMountedRef.current) {
        setSuccess(
          "Generation is running—open Mystical profile to watch cards appear, then Ask the Seer for the cross-tool read.",
        )
      }
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(SEQ_PROMPT_AFTER_PROFILE_GEN, "1")
        }
      } catch {
        /* ignore */
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return
      analytics.trackProfileGenerationCompleted(false, {
        surface,
        error: e instanceof Error ? e.message : "unknown",
      })
      const msg = e instanceof Error ? e.message : "Generation failed. Please check your connection and try again."
      if (typeof window !== "undefined") {
        sessionStorage.setItem("futureSeer:generationStatus", "failed")
        sessionStorage.setItem("futureSeer:generationError", msg)
      }
      window.dispatchEvent(
        new CustomEvent("futureSeer:profileGenerationCompleted", {
          detail: { success: false, error: msg },
        }),
      )
      if (isMountedRef.current) {
        setError(msg)
      }
    } finally {
      if (isMountedRef.current) {
        setIsGeneratingProfile(false)
        setGenerationStatus("")
      }
      generationAbortRef.current = null
    }
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
        palmPhotoUrl: formData.palmPhotoUrl,
        freeTrialTermsAccepted: acceptedFreeTrialTerms,
        freeTrialTermsAcceptedAt: acceptedFreeTrialTerms ? Date.now() : userProfile?.freeTrialTermsAcceptedAt
      }
      if (userProfile?.mysticalProfileGenerated !== true) {
        updatePayload.selectedPlan = "power-user-trial"
        updatePayload.subscriptionStatus = "trial"
      }

      await updateUserProfile(user.uid, updatePayload)
      setIsEditing(false)
      setSuccess("Profile updated successfully!")

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

      setTimeout(() => refreshProfile(), 500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save profile.";
      setError("Failed to save profile.");
      void logUserPain({
        area: "profile",
        action: "save_profile",
        message: msg,
        severity: "error",
        user,
        route: "/profile",
      });
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
        {(
          <>
        <Alert className="border-amber-500/40 bg-amber-500/10 rounded-2xl">
          <AlertDescription className="text-amber-100 text-sm space-y-2">
            <p className="font-semibold text-amber-200">Free trial: 1 month</p>
            {retentionSnapshot.nudgeStage === "trial_ending" && retentionSnapshot.trialDaysLeft !== null ? (
              <p className="text-amber-200/90">Trial ends in about {retentionSnapshot.trialDaysLeft} day(s). Finish setup to get full value.</p>
            ) : null}
          </AlertDescription>
        </Alert>

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

          </>
        )}


        <div
          id="profile-personal-data"
          className={`bg-surface-container-high rounded-[32px] p-6 border border-outline-variant shadow-2xl space-y-8 scroll-mt-24 ${isEditing ? "pb-28" : ""}`}
        >
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
              <div className="ml-1 flex items-center justify-between gap-2">
                <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Display Name</Label>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("displayName") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("displayName") ? "Missing" : "Done"}</span>
              </div>
              {isEditing ? <Input value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className={`h-14 bg-surface-container-low rounded-2xl ${getRequiredFieldClasses("displayName", "mobile")}`} /> : <p className="text-lg font-bold text-white ml-1">{formData.displayName || "Not set"}</p>}
            </div>

            <div className="space-y-2">
              <div className="ml-1 flex items-center justify-between gap-2">
                <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Full Name</Label>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("fullName") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("fullName") ? "Missing" : "Done"}</span>
              </div>
              {isEditing ? <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Full name" className={`h-14 bg-surface-container-low rounded-2xl ${getRequiredFieldClasses("fullName", "mobile")}`} /> : <p className="text-lg font-bold text-white ml-1">{formData.fullName || "Not set"}</p>}
            </div>

            <div className="space-y-2 relative z-20 overflow-visible">
              <div className="ml-1 flex items-center justify-between gap-2">
                <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Gender</Label>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("gender") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("gender") ? "Missing" : "Done"}</span>
              </div>
              {isEditing ? (
                <ProfileGenderSelect
                  value={formData.gender}
                  onChange={(gender) => setFormData({ ...formData, gender })}
                  platform="mobile"
                  borderClassName={getRequiredFieldClasses("gender", "mobile")}
                />
              ) : (
                <p className="text-lg font-bold text-white ml-1">{formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1).replace('-', ' ') : "Not set"}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <div className="ml-1 flex items-center justify-between gap-2">
                  <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Birth Date</Label>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("birthDate") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("birthDate") ? "Missing" : "Done"}</span>
                </div>
                {isEditing ? <Input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className={`h-14 bg-surface-container-low rounded-2xl [color-scheme:dark] ${getRequiredFieldClasses("birthDate", "mobile")}`} /> : <p className="text-lg font-bold text-white ml-1">{normalizeBirthDateForUi(formData.birthDate) || "Not set"}</p>}
              </div>
              <div className="space-y-2">
                <div className="ml-1 flex items-center justify-between gap-2">
                  <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Birth Place</Label>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("birthPlace") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("birthPlace") ? "Missing" : "Done"}</span>
                </div>
                {isEditing ? <Input value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} placeholder="Place/Town/Village, City, State, Country" className={`h-14 bg-surface-container-low rounded-2xl ${getRequiredFieldClasses("birthPlace", "mobile")}`} /> : <p className="text-lg font-bold text-white ml-1">{formData.birthPlace || "Not set"}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="ml-1 flex items-center justify-between gap-2">
                  <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Time of Birth</Label>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("birthTime") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("birthTime") ? "Missing" : "Done"}</span>
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <Input type="time" value={formData.birthTime} disabled={!formData.birthTimeKnown} onChange={e => setFormData({...formData, birthTime: e.target.value})} className={`h-14 bg-surface-container-low rounded-2xl [color-scheme:dark] flex-1 ${getRequiredFieldClasses("birthTime", "mobile")}`} />
                      <ProfileAmPmSelect
                        value={formData.birthTimeAMPM}
                        onChange={(birthTimeAMPM) => setFormData({ ...formData, birthTimeAMPM })}
                        disabled={!formData.birthTimeKnown}
                        platform="mobile"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-amber-200/90">
                      <input
                        type="checkbox"
                        checked={!formData.birthTimeKnown}
                        onChange={(e) => {
                          const unknown = e.target.checked
                          setFormData((prev) => ({ ...prev, birthTimeKnown: !unknown, birthTime: unknown ? "" : prev.birthTime }))
                          if (unknown) analytics.trackProfileBirthTimeUnknownSelected({ layout: "mobile" })
                        }}
                      />
                      I do not know my birth time
                    </label>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-white ml-1">{formData.birthTimeKnown === false ? "Unknown (lower-accuracy mode)" : formData.birthTime ? `${formData.birthTime} ${formData.birthTimeAMPM}` : "Not set"}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="ml-1 flex items-center justify-between gap-2">
                  <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Current residence</Label>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("currentLocation") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("currentLocation") ? "Missing" : "Done"}</span>
                </div>
                {isEditing ? <Input value={formData.currentLocation} onChange={e => setFormData({...formData, currentLocation: e.target.value})} placeholder="Place/Town/Village, City, State, Country" className={`h-14 bg-surface-container-low rounded-2xl ${getRequiredFieldClasses("currentLocation", "mobile")}`} /> : <p className="text-lg font-bold text-white ml-1">{formData.currentLocation || "Not set"}</p>}
              </div>
            </div>

            {formData.birthTimeKnown === false && formData.birthDate && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3">
                <p className="text-amber-300 text-xs font-medium">
                  Birth time is marked unknown. We will use a neutral noon default, which lowers accuracy for time-sensitive charts (houses/ascendant).
                </p>
              </div>
            )}

            {(
            <>
            <div className={`grid grid-cols-2 gap-4 ${isEditing ? "pb-20" : ""}`}>
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Face Scan</Label>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("facePhotoUrl") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("facePhotoUrl") ? "Missing" : "Done"}</span>
                </div>
                <div className={`aspect-square bg-surface-container-low rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden relative ${isFieldMissing("facePhotoUrl") ? "border-rose-400/70" : "border-outline-variant"}`}>
                  {formData.facePhotoUrl ? <img src={formData.facePhotoUrl} className="w-full h-full object-cover" alt="" /> : <Camera className="w-8 h-8 opacity-20" />}
                  {uploadingFace && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>}
                </div>
                {isEditing && (
                  <div className="flex flex-col gap-1">
                    <input
                      ref={faceCameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, "face"); e.target.value = ""; }}
                    />
                    <input
                      ref={faceUploadInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, "face"); e.target.value = ""; }}
                    />
                    <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => faceCameraInputRef.current?.click()} disabled={uploadingFace}>
                      Open camera
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => faceUploadInputRef.current?.click()} disabled={uploadingFace}>
                      Upload
                    </Button>
                    {formData.facePhotoUrl && <Button type="button" variant="ghost" size="sm" className="text-xs text-red-400" onClick={() => handleRemovePhoto("face")}>Remove</Button>}
                  </div>
                )}
              </div>
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Palm Scan</Label>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("palmPhotoUrl") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("palmPhotoUrl") ? "Missing" : "Done"}</span>
                </div>
                <div className={`aspect-square bg-surface-container-low rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden relative ${isFieldMissing("palmPhotoUrl") ? "border-rose-400/70" : "border-outline-variant"}`}>
                  {formData.palmPhotoUrl ? <img src={formData.palmPhotoUrl} className="w-full h-full object-cover" alt="" /> : <Camera className="w-8 h-8 opacity-20" />}
                  {uploadingPalm && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>}
                </div>
                {isEditing && (
                  <div className="flex flex-col gap-1">
                    <input
                      ref={palmCameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, "palm"); e.target.value = ""; }}
                    />
                    <input
                      ref={palmUploadInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, "palm"); e.target.value = ""; }}
                    />
                    <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => palmCameraInputRef.current?.click()} disabled={uploadingPalm}>
                      Open camera
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => palmUploadInputRef.current?.click()} disabled={uploadingPalm}>
                      Upload
                    </Button>
                    {formData.palmPhotoUrl && <Button type="button" variant="ghost" size="sm" className="text-xs text-red-400" onClick={() => handleRemovePhoto("palm")}>Remove</Button>}
                  </div>
                )}
              </div>
            </div>

            <div id="profile-generate-mystical" className="pt-6 border-t border-outline-variant/30 scroll-mt-24">
              <div className="mb-3 rounded-xl border border-outline-variant/40 bg-surface-container-low p-4 text-sm text-white/85">
                {missingLabels.length > 0 ? <p>Still needed: {missingLabels.join(", ")}.</p> : <p className="text-emerald-300">All required fields complete.</p>}
              </div>
                <Button
                  onClick={() => void handleGenerateMysticalProfile("profile_primary", "full")}
                  disabled={isGeneratingProfile || isEditing || !canGenerateFromOnboarding}
                  className="w-full h-16 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 rounded-[24px] font-bold text-lg shadow-xl active:scale-95 transition-all"
                >
                  {isGeneratingProfile ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2" /> Generate Full Report</>}
                </Button>
                {trialIsActive ? (
                  <p className="text-center text-amber-300/70 text-xs mt-2">
                    Full Report unlocks when your complete profile and payment details are ready.
                  </p>
                ) : null}
                {fullProfileChecklist.length > 0 ? (
                  <p className="text-center text-amber-300/70 text-xs mt-2">
                    Missing for Full Report: {fullProfileChecklist.join(", ")}
                  </p>
                ) : null}
                {isGeneratingProfile && generationStatus && (
                  <p className="text-center text-amber-400/80 text-sm mt-3 animate-pulse">{generationStatus}</p>
                )}
                {missingLabels.length > 0 && !isGeneratingProfile && (
                  <p className="text-center text-amber-400/60 text-xs mt-2">Complete all required profile fields to unlock Generate.</p>
                )}
                {isEditing && !isGeneratingProfile && (
                  <p className="text-center text-amber-400/60 text-xs mt-2">Save profile changes before generating.</p>
                )}
                {formData.birthDate && formData.birthPlace && !canGenerateMysticalProfile && !isGeneratingProfile && (
                  <p className="text-center text-amber-400/70 text-xs mt-2">{getOverQuotaMessage(userProfile?.selectedPlan)}</p>
                )}
                {canGenerateFromOnboarding && !isGeneratingProfile && <p className="text-center text-emerald-300/70 text-xs mt-2">Ready to generate.</p>}
            </div>
            </>
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
          {(
          <>
          <Alert className="border-amber-500/40 bg-amber-500/10 rounded-2xl">
            <AlertDescription className="text-amber-100 space-y-2">
              <p className="font-semibold text-amber-200">Free trial: 1 month</p>
              {retentionSnapshot.nudgeStage === "trial_ending" && retentionSnapshot.trialDaysLeft !== null ? (
                <p className="text-amber-200/90">Trial ends in about {retentionSnapshot.trialDaysLeft} day(s). Finish setup to get full value.</p>
              ) : null}
            </AlertDescription>
          </Alert>

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

          </>
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
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Display Name</Label>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("displayName") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("displayName") ? "Missing" : "Done"}</span>
                </div>
                {isEditing ? <Input value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className={`h-12 bg-white/5 rounded-2xl ${getRequiredFieldClasses("displayName", "web")}`} /> : <p className="text-lg font-medium text-white">{formData.displayName || "Not set"}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Full Name</Label>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("fullName") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("fullName") ? "Missing" : "Done"}</span>
                </div>
                {isEditing ? <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Full name" className={`h-12 bg-white/5 rounded-2xl ${getRequiredFieldClasses("fullName", "web")}`} /> : <p className="text-lg font-medium text-white">{formData.fullName || "Not set"}</p>}
              </div>

              <div className="space-y-2 relative z-20 overflow-visible">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Gender</Label>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("gender") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("gender") ? "Missing" : "Done"}</span>
                </div>
                {isEditing ? (
                  <ProfileGenderSelect
                    value={formData.gender}
                    onChange={(gender) => setFormData({ ...formData, gender })}
                    platform="web"
                    borderClassName={getRequiredFieldClasses("gender", "web")}
                  />
                ) : (
                  <p className="text-lg font-medium text-white">{formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1).replace('-', ' ') : "Not set"}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Birth Date</Label>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("birthDate") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("birthDate") ? "Missing" : "Done"}</span>
                  </div>
                  {isEditing ? <Input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className={`h-12 bg-white/5 rounded-2xl [color-scheme:dark] ${getRequiredFieldClasses("birthDate", "web")}`} /> : <p className="text-lg font-medium text-white">{normalizeBirthDateForUi(formData.birthDate) || "Not set"}</p>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Birth Place</Label>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("birthPlace") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("birthPlace") ? "Missing" : "Done"}</span>
                  </div>
                  {isEditing ? <Input value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} placeholder="Place/Town/Village, City, State, Country" className={`h-12 bg-white/5 rounded-2xl ${getRequiredFieldClasses("birthPlace", "web")}`} /> : <p className="text-lg font-medium text-white">{formData.birthPlace || "Not set"}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Time of Birth</Label>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("birthTime") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("birthTime") ? "Missing" : "Done"}</span>
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <Input type="time" value={formData.birthTime} disabled={!formData.birthTimeKnown} onChange={e => setFormData({...formData, birthTime: e.target.value})} className={`h-12 bg-white/5 rounded-2xl [color-scheme:dark] flex-1 ${getRequiredFieldClasses("birthTime", "web")}`} />
                        <ProfileAmPmSelect
                          value={formData.birthTimeAMPM}
                          onChange={(birthTimeAMPM) => setFormData({ ...formData, birthTimeAMPM })}
                          disabled={!formData.birthTimeKnown}
                          platform="web"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-xs text-amber-200/90">
                        <input
                          type="checkbox"
                          checked={!formData.birthTimeKnown}
                          onChange={(e) => {
                            const unknown = e.target.checked
                            setFormData((prev) => ({ ...prev, birthTimeKnown: !unknown, birthTime: unknown ? "" : prev.birthTime }))
                            if (unknown) analytics.trackProfileBirthTimeUnknownSelected({ layout: "web" })
                          }}
                        />
                        I do not know my birth time
                      </label>
                    </div>
                  ) : (
                    <p className="text-lg font-medium text-white">{formData.birthTimeKnown === false ? "Unknown (lower-accuracy mode)" : formData.birthTime ? `${formData.birthTime} ${formData.birthTimeAMPM}` : "Not set"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Current residence</Label>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("currentLocation") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("currentLocation") ? "Missing" : "Done"}</span>
                  </div>
                  {isEditing ? <Input value={formData.currentLocation} onChange={e => setFormData({...formData, currentLocation: e.target.value})} placeholder="Place/Town/Village, City, State, Country" className={`h-12 bg-white/5 rounded-2xl ${getRequiredFieldClasses("currentLocation", "web")}`} /> : <p className="text-lg font-medium text-white">{formData.currentLocation || "Not set"}</p>}
                </div>
              </div>
              {formData.birthTimeKnown === false && formData.birthDate && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3">
                  <p className="text-amber-300 text-xs font-medium">
                    Birth time is marked unknown. We will use a neutral noon default, which lowers accuracy for time-sensitive charts (houses/ascendant).
                  </p>
                </div>
              )}

              {(
              <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Face Scan</Label>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("facePhotoUrl") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("facePhotoUrl") ? "Missing" : "Done"}</span>
                  </div>
                  <div className={`aspect-square bg-white/5 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden relative ${isFieldMissing("facePhotoUrl") ? "border-rose-400/70" : "border-amber-400/20"}`}>
                    {formData.facePhotoUrl ? <img src={formData.facePhotoUrl} className="w-full h-full object-cover" alt="" /> : <Camera className="w-8 h-8 text-amber-400/40" />}
                    {uploadingFace && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>}
                  </div>
                  {isEditing && (
                    <div className="flex flex-col gap-1">
                      <input ref={faceCameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, "face"); e.target.value = ""; }} />
                      <input ref={faceUploadInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, "face"); e.target.value = ""; }} />
                      <Button type="button" variant="outline" size="sm" className="text-xs border-amber-400/30 text-amber-400" onClick={() => faceCameraInputRef.current?.click()} disabled={uploadingFace}>Open camera</Button>
                      <Button type="button" variant="outline" size="sm" className="text-xs border-amber-400/30 text-amber-400" onClick={() => faceUploadInputRef.current?.click()} disabled={uploadingFace}>Upload</Button>
                      {formData.facePhotoUrl && <Button type="button" variant="ghost" size="sm" className="text-xs text-red-400" onClick={() => handleRemovePhoto("face")}>Remove</Button>}
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Label className="text-xs uppercase font-bold text-amber-400 tracking-widest">Palm Scan</Label>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFieldMissing("palmPhotoUrl") ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>{isFieldMissing("palmPhotoUrl") ? "Missing" : "Done"}</span>
                  </div>
                  <div className={`aspect-square bg-white/5 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden relative ${isFieldMissing("palmPhotoUrl") ? "border-rose-400/70" : "border-amber-400/20"}`}>
                    {formData.palmPhotoUrl ? <img src={formData.palmPhotoUrl} className="w-full h-full object-cover" alt="" /> : <Camera className="w-8 h-8 text-amber-400/40" />}
                    {uploadingPalm && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>}
                  </div>
                  {isEditing && (
                    <div className="flex flex-col gap-1">
                      <input ref={palmCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, "palm"); e.target.value = ""; }} />
                      <input ref={palmUploadInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, "palm"); e.target.value = ""; }} />
                      <Button type="button" variant="outline" size="sm" className="text-xs border-amber-400/30 text-amber-400" onClick={() => palmCameraInputRef.current?.click()} disabled={uploadingPalm}>Open camera</Button>
                      <Button type="button" variant="outline" size="sm" className="text-xs border-amber-400/30 text-amber-400" onClick={() => palmUploadInputRef.current?.click()} disabled={uploadingPalm}>Upload</Button>
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

              <div id="profile-generate-mystical" className="pt-6 border-t border-amber-400/20 scroll-mt-24">
                <div className="mb-3 rounded-xl border border-amber-400/20 bg-slate-900/30 p-4 text-sm text-amber-100/90">
                  {missingLabels.length > 0 ? <p>Still needed: {missingLabels.join(", ")}.</p> : <p className="text-emerald-300">All required fields complete.</p>}
                </div>
                  <Button
                    onClick={() => void handleGenerateMysticalProfile("profile_secondary", "full")}
                    disabled={isGeneratingProfile || isEditing || !canGenerateFromOnboarding}
                    className="w-full h-14 bg-gradient-to-r from-amber-600 to-yellow-500 text-[#020617] rounded-2xl font-bold shadow-xl hover:opacity-95 transition-opacity"
                  >
                    {isGeneratingProfile ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2" /> Generate Full Report</>}
                  </Button>
                  {trialIsActive ? (
                    <p className="text-center text-amber-200/70 text-xs mt-2">
                      Full Report unlocks when your complete profile and payment details are ready.
                    </p>
                  ) : null}
                  {fullProfileChecklist.length > 0 ? (
                    <p className="text-center text-amber-200/70 text-xs mt-2">
                      Missing for Full Report: {fullProfileChecklist.join(", ")}
                    </p>
                  ) : null}
                  {isGeneratingProfile && generationStatus && (
                    <p className="text-center text-amber-400/80 text-sm mt-3 animate-pulse">{generationStatus}</p>
                  )}
                  {missingLabels.length > 0 && !isGeneratingProfile && (
                    <p className="text-center text-amber-200/80 text-xs mt-2">Complete all required profile fields to unlock Generate.</p>
                  )}
                  {isEditing && !isGeneratingProfile && (
                    <p className="text-center text-amber-200/80 text-xs mt-2">Save profile changes before generating.</p>
                  )}
                  {formData.birthDate && formData.birthPlace && !canGenerateMysticalProfile && !isGeneratingProfile && (
                    <p className="text-center text-amber-200/80 text-xs mt-2">{getOverQuotaMessage(userProfile?.selectedPlan)}</p>
                  )}
                  {canGenerateFromOnboarding && !isGeneratingProfile && <p className="text-center text-emerald-300/70 text-xs mt-2">Ready to generate.</p>}
              </div>
              </>
              )}
            </div>
          </motion.div>

        
        </div>
      </div>
    </div>
    </>
  )
}
