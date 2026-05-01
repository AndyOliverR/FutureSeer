"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  User, 
  Calendar, 
  MapPin, 
  Camera, 
  Hand, 
  ArrowRight,
  ArrowLeft, 
  Check,
  Upload,
  Sparkles,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { updateUserProfile, type UserProfile } from '@/lib/firebase'
import {
  getReturningUserWithReportsDestination,
  NEW_USER_ONBOARDING_DESTINATION,
} from '@/lib/authRouting'
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { compressImageFile } from '@/lib/imageCompression'
import { BirthTimeDualFormatSelect } from '@/components/BirthTimeDualFormatSelect'
import { getMissingFirstGenerationFields } from '@/lib/subscriptionConfig'

type UploadPhotoType = "face" | "palm";
type UploadStatus = "idle" | "ready" | "uploading" | "success" | "error";
type UploadState = { status: UploadStatus; error: string | null; uploadedUrl: string | null };

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  const fixed = value >= 100 || i === 0 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(fixed)} ${units[i]}`;
}

function readUploadErrorFields(e: unknown): {
  status: number | null
  detail: unknown
  message: string
  firebaseCode: string | null
} {
  if (e && typeof e === "object") {
    const o = e as Record<string, unknown>
    const status = typeof o.status === "number" ? o.status : null
    const detail = "detail" in o ? o.detail : undefined
    const message = e instanceof Error ? e.message : String(o.message ?? "")
    const firebaseCode = typeof o.code === "string" ? o.code : null
    return { status, detail, message, firebaseCode }
  }
  return { status: null, detail: undefined, message: e instanceof Error ? e.message : "", firebaseCode: null }
}

function toFriendlyUploadError(e: unknown): string {
  const { status, detail, message, firebaseCode } = readUploadErrorFields(e)
  const detailStr = detail !== undefined ? JSON.stringify(detail) : ""

  if (firebaseCode === "permission-denied") {
    return "Saving your profile was blocked. Please try again or sign out and sign back in.";
  }
  if (
    firebaseCode === "not-found" ||
    message.includes("No document to update") ||
    message.includes("not-found")
  ) {
    return "We couldn’t save your profile document. Tap Complete again, or sign out and sign back in.";
  }
  if (firebaseCode === "unavailable" || firebaseCode === "resource-exhausted") {
    return "Service was busy. Please wait a moment and try again.";
  }
  if (firebaseCode === "auth/network-request-failed" || message.includes("Failed to fetch")) {
    return "Network error. Check your connection and retry.";
  }

  if (status === 401) return "Your session expired. Please sign in again, then retry the upload.";
  if (status === 400) {
    if (detailStr.includes("File too large")) return "That image is too large. Please choose a smaller photo (max 10 MB).";
    if (detailStr.includes("Invalid file type")) {
      return "That file type isn’t accepted by our servers. iPhone photos are often HEIC—if this keeps failing, open the image in Photos, export as JPEG, then try again. You can also use JPEG, PNG, WebP, or GIF.";
    }
    return "That image couldn’t be uploaded. Please choose a different photo and try again.";
  }
  if (status === 415) return "Unsupported image type. Please use JPEG, PNG, WebP, or GIF.";
  if (status && status >= 500) return "Upload service had trouble. Please retry in a moment.";

  return "Upload failed. Please retry (or try a smaller image).";
}

type ProfileSetupGender = '' | NonNullable<UserProfile['gender']>

function genderFromSelectValue(raw: string): ProfileSetupGender {
  if (raw === '' || raw === 'male' || raw === 'female' || raw === 'non-binary') return raw
  return ''
}

export default function ProfileSetupPage() {
  const { user, userProfile, refreshProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const { logError } = useErrorLogger({ area: "profile-setup" })

  const [birthTimeUnknown, setBirthTimeUnknown] = useState(false)
  const [profileData, setProfileData] = useState({
    displayName: '', fullName: '', gender: '' as ProfileSetupGender,
    birthDate: '', birthTime: '', birthPlace: '', currentLocation: '',
    birthTimeKnown: true,
    facePhotoUrl: '', palmPhotoUrl: '',
    facePhoto: null as File | null, palmPhoto: null as File | null
  })

  const [uploadState, setUploadState] = useState<Record<UploadPhotoType, UploadState>>({
    face: { status: "idle", error: null, uploadedUrl: null },
    palm: { status: "idle", error: null, uploadedUrl: null },
  })
  const [optimizingState, setOptimizingState] = useState<Record<UploadPhotoType, boolean>>({
    face: false,
    palm: false,
  })

  useEffect(() => {
    if (user === null) {
      router.replace('/signin?redirect=/profile-setup')
      return
    }
    if (userProfile?.mysticalProfileGenerated) {
      router.replace(getReturningUserWithReportsDestination())
      return
    }
    if (userProfile) {
      setBirthTimeUnknown(userProfile.birthTimeKnown === false)
      setProfileData(prev => ({
        ...prev,
        displayName: userProfile.displayName || '',
        fullName: userProfile.fullName || '',
        birthDate: userProfile.birthDate || '',
        birthTime: userProfile.birthTime || '',
        birthPlace: userProfile.birthPlace || '',
        currentLocation: userProfile.currentLocation || '',
        birthTimeKnown: userProfile.birthTimeKnown ?? true,
      }))
    }
  }, [user, userProfile, router])

  const handleFileUpload = (file: File, type: 'face' | 'palm') => {
    const url = URL.createObjectURL(file)
    setProfileData(prev => ({ ...prev, [`${type}Photo`]: file, [`${type}PhotoUrl`]: url }))
    setInlineError(null)
    setUploadState(prev => ({
      ...prev,
      [type]: { status: "ready", error: null, uploadedUrl: null },
    }))
  }

  const uploadViaProxy = async (type: UploadPhotoType, file: File, idToken: string) => {
    const formData = new FormData()
    formData.append("type", type)
    formData.append("file", file)

    const res = await fetch("/api/profile/upload-photo", {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
      body: formData,
    })

    if (!res.ok) {
      let detail: unknown = null
      try {
        detail = await res.json()
      } catch {
        // ignore
      }
      const err = new Error(`Upload failed (${type})`) as Error & { status: number; detail: unknown }
      err.status = res.status
      err.detail = detail
      throw err
    }

    const json = (await res.json()) as { url?: string }
    if (!json?.url) throw new Error(`Upload failed (${type}): missing url`)
    return json.url
  }

  const startUpload = async (type: UploadPhotoType) => {
    const originalFile = type === "face" ? profileData.facePhoto : profileData.palmPhoto
    if (!user?.uid || !originalFile) return null

    setOptimizingState(prev => ({ ...prev, [type]: true }))
    let compressed: Awaited<ReturnType<typeof compressImageFile>>
    try {
      compressed = await compressImageFile(originalFile, {
        maxDimension: 1600,
        quality: 0.82,
        mimeType: "image/jpeg",
      })
    } catch (compErr: unknown) {
      setOptimizingState(prev => ({ ...prev, [type]: false }))
      const msg =
        compErr instanceof Error
          ? compErr.message
          : "Could not process this image. Try a JPEG or PNG, or export from Photos as JPEG."
      setUploadState(prev => ({
        ...prev,
        [type]: { ...prev[type], status: "error", error: msg, uploadedUrl: null },
      }))
      setInlineError(msg)
      await logError("upload_photo", msg, "error", {
        type,
        bytes: originalFile.size,
        mime: originalFile.type,
        phase: "compress",
        proxyStatus: null,
        proxyDetail: null,
        firebaseCode: null,
      })
      return null
    }
    setOptimizingState(prev => ({ ...prev, [type]: false }))
    const file = compressed.file

    setUploadState(prev => ({
      ...prev,
      [type]: { ...prev[type], status: "uploading", error: null, uploadedUrl: null },
    }))
    setInlineError(null)

    try {
      const idToken = await user.getIdToken()
      const url = await uploadViaProxy(type, file, idToken)
      setUploadState(prev => ({
        ...prev,
        [type]: { status: "success", error: null, uploadedUrl: url },
      }))
      return url
    } catch (e: unknown) {
      const friendly = toFriendlyUploadError(e)
      const { status: proxyStatus, detail: proxyDetail, firebaseCode } = readUploadErrorFields(e)
      setUploadState(prev => ({
        ...prev,
        [type]: { status: "error", error: friendly, uploadedUrl: null },
      }))
      setInlineError(friendly)
      await logError("upload_photo", friendly, "error", {
        type,
        bytes: file.size,
        mime: file.type,
        originalBytes: compressed.originalBytes,
        finalBytes: compressed.finalBytes,
        didCompress: compressed.didCompress,
        proxyStatus,
        proxyDetail,
        firebaseCode,
      })
      return null
    }
  }

  useEffect(() => {
    if (currentStep !== 3) return
    if (profileData.facePhoto && uploadState.face.status === "ready") void startUpload("face")
    if (profileData.palmPhoto && uploadState.palm.status === "ready") void startUpload("palm")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, profileData.facePhoto, profileData.palmPhoto, uploadState.face.status, uploadState.palm.status])

  const handleComplete = async () => {
    if (!user?.uid) return;
    setIsLoading(true)
    try {
      const updateData: Partial<UserProfile> = {
        displayName: profileData.displayName,
        fullName: profileData.fullName,
        birthDate: profileData.birthDate,
        birthTime: profileData.birthTime,
        birthTimeKnown: profileData.birthTimeKnown,
        birthPlace: profileData.birthPlace,
        currentLocation: profileData.currentLocation,
        facePhotoUrl: profileData.facePhotoUrl,
        palmPhotoUrl: profileData.palmPhotoUrl,
      }
      if (profileData.gender !== '') {
        updateData.gender = profileData.gender
      }

      setInlineError(null)

      if (profileData.facePhoto) {
        const faceUrl = uploadState.face.uploadedUrl ?? (await startUpload("face"))
        if (!faceUrl) throw new Error("Face photo upload failed")
        updateData.facePhotoUrl = faceUrl
      }
      if (profileData.palmPhoto) {
        const palmUrl = uploadState.palm.uploadedUrl ?? (await startUpload("palm"))
        if (!palmUrl) throw new Error("Palm photo upload failed")
        updateData.palmPhotoUrl = palmUrl
      }

      await updateUserProfile(user.uid, updateData)
      await refreshProfile()
      toast({ title: 'Cosmic Profile Set! 🌟' })
      router.push(NEW_USER_ONBOARDING_DESTINATION)
    } catch (e: unknown) {
      toast({ title: 'Setup Failed', variant: 'destructive' })
      const msg = e instanceof Error ? e.message : 'Profile setup failed'
      const { status: proxyStatus, detail: proxyDetail, firebaseCode } = readUploadErrorFields(e)
      setInlineError(toFriendlyUploadError(e))
      await logError("complete", msg, "error", {
        hasFacePhoto: !!profileData.facePhoto,
        hasPalmPhoto: !!profileData.palmPhoto,
        facePhotoBytes: profileData.facePhoto?.size ?? null,
        palmPhotoBytes: profileData.palmPhoto?.size ?? null,
        facePhotoType: profileData.facePhoto?.type ?? null,
        palmPhotoType: profileData.palmPhoto?.type ?? null,
        proxyStatus,
        proxyDetail,
        firebaseCode,
      })
    }
    finally { setIsLoading(false) }
  }

  const progress = (currentStep / 4) * 100
  const missingFirstGenFields = getMissingFirstGenerationFields(
    {
      displayName: profileData.displayName,
      fullName: profileData.fullName,
      gender: profileData.gender || undefined,
      birthDate: profileData.birthDate,
      birthTime: profileData.birthTime,
      birthTimeKnown: profileData.birthTimeKnown,
      birthPlace: profileData.birthPlace,
      currentLocation: profileData.currentLocation,
      facePhotoUrl: profileData.facePhotoUrl,
      palmPhotoUrl: profileData.palmPhotoUrl,
    },
    { allowUnknownBirthTime: true },
  )
  const faceReady = !!profileData.facePhoto && uploadState.face.status === "success"
  const palmReady = !!profileData.palmPhoto && uploadState.palm.status === "success"
  const canComplete = missingFirstGenFields.length === 0 && faceReady && palmReady && !isLoading

  return (
    <div className="min-h-screen bg-surface flex flex-col pt-[env(safe-area-inset-top)] px-4 pb-10">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="py-6 text-center">
          <h1 className="text-3xl font-heading font-bold text-amber-400 mb-2">Cosmic Setup</h1>
          <Progress value={progress} className="h-2 bg-surface-container-low" />
        </div>

        <div className="flex gap-3 mb-4">
          <Button
            variant="ghost"
            disabled={currentStep === 1 || isLoading}
            onClick={() => setCurrentStep(currentStep - 1)}
            className="flex-1 h-12 rounded-2xl text-white font-bold"
          >
            Back
          </Button>
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={isLoading}
              className="flex-1 h-12 bg-amber-500 text-slate-900 rounded-2xl font-bold shadow-lg"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canComplete}
              className="flex-1 h-12 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </span>
              ) : (
                "Complete"
              )}
            </Button>
          )}
        </div>

        <div className="flex-1 bg-surface-container-high rounded-[32px] p-6 border border-outline-variant shadow-2xl overflow-hidden mb-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center py-4"><div className="text-5xl mb-2">👋</div><h2 className="text-xl font-bold text-white">Identity</h2></div>
                <div className="space-y-4">
                  <Input value={profileData.displayName} onChange={e => setProfileData({...profileData, displayName: e.target.value})} placeholder="Display Name (AnDY)" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4" />
                  <Input value={profileData.fullName} onChange={e => setProfileData({...profileData, fullName: e.target.value})} placeholder="Full Name (for calculations)" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4" />
                  <select
                    value={profileData.gender}
                    onChange={e =>
                      setProfileData({ ...profileData, gender: genderFromSelectValue(e.target.value) })
                    }
                    className="w-full h-14 bg-surface-container-low border border-outline-variant rounded-2xl px-4 text-white [&>option]:bg-white [&>option]:text-slate-900"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center py-4"><div className="text-5xl mb-2">📅</div><h2 className="text-xl font-bold text-white">Birth Details</h2></div>
                <div className="space-y-4">
                  <Input type="date" value={profileData.birthDate} onChange={e => setProfileData({...profileData, birthDate: e.target.value})} className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4 [color-scheme:dark]" />
                  <div className="space-y-1">
                    <Label className="text-white/80 text-sm">Birth time (local)</Label>
                    <BirthTimeDualFormatSelect
                      value={profileData.birthTime || "12:00"}
                      onChange={(next) => setProfileData({ ...profileData, birthTime: next })}
                      showUnknownCheckbox
                      unknownTime={birthTimeUnknown}
                      onUnknownTimeChange={(next) => {
                        setBirthTimeUnknown(next)
                        setProfileData((prev) => ({
                          ...prev,
                          birthTimeKnown: !next,
                          birthTime: next ? '' : prev.birthTime,
                        }))
                      }}
                      showFooterHint={false}
                      selectClassName="flex-1 min-w-0 h-14 bg-surface-container-low border border-outline-variant rounded-2xl px-3 text-white [color-scheme:dark]"
                    />
                  </div>
                  <Input value={profileData.birthPlace} onChange={e => setProfileData({...profileData, birthPlace: e.target.value})} placeholder="City, Country" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4" />
                  <Input value={profileData.currentLocation} onChange={e => setProfileData({...profileData, currentLocation: e.target.value})} placeholder="Current residence (City, Country)" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4" />
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center py-4"><div className="text-5xl mb-2">📸</div><h2 className="text-xl font-bold text-white">Face & Palm</h2></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="aspect-square bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden">
                      {profileData.facePhotoUrl ? <img src={profileData.facePhotoUrl} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 opacity-20" />}
                    </div>
                    <label className="block text-center">
                      <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'face')}
                      />
                      <span className="text-[10px] font-bold text-amber-400 uppercase">Face Scan</span>
                    </label>
                    <div className="text-center">
                      {profileData.facePhoto ? (
                        <div className="text-[10px] text-white/60">{formatBytes(profileData.facePhoto.size)}</div>
                      ) : null}
                      {uploadState.face.status === "uploading" ? (
                        <div className="mt-1 flex items-center justify-center gap-2 text-[10px] text-white/70">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Uploading…
                        </div>
                      ) : optimizingState.face ? (
                        <div className="mt-1 flex items-center justify-center gap-2 text-[10px] text-white/70">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Optimizing…
                        </div>
                      ) : uploadState.face.status === "success" ? (
                        <div className="mt-1 text-[10px] text-emerald-300 font-bold">Uploaded</div>
                      ) : uploadState.face.status === "error" ? (
                        <div className="mt-1 space-y-1">
                          <div className="text-[10px] text-red-300 font-bold">Upload failed</div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-7 px-2 rounded-xl text-[10px] text-amber-300"
                            onClick={() => void startUpload("face")}
                            disabled={!profileData.facePhoto || isLoading}
                          >
                            Retry
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="aspect-square bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden">
                      {profileData.palmPhotoUrl ? <img src={profileData.palmPhotoUrl} className="w-full h-full object-cover" /> : <Hand className="w-8 h-8 opacity-20" />}
                    </div>
                    <label className="block text-center">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'palm')}
                      />
                      <span className="text-[10px] font-bold text-amber-400 uppercase">Palm Scan</span>
                    </label>
                    <div className="text-center">
                      {profileData.palmPhoto ? (
                        <div className="text-[10px] text-white/60">{formatBytes(profileData.palmPhoto.size)}</div>
                      ) : null}
                      {uploadState.palm.status === "uploading" ? (
                        <div className="mt-1 flex items-center justify-center gap-2 text-[10px] text-white/70">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Uploading…
                        </div>
                      ) : optimizingState.palm ? (
                        <div className="mt-1 flex items-center justify-center gap-2 text-[10px] text-white/70">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Optimizing…
                        </div>
                      ) : uploadState.palm.status === "success" ? (
                        <div className="mt-1 text-[10px] text-emerald-300 font-bold">Uploaded</div>
                      ) : uploadState.palm.status === "error" ? (
                        <div className="mt-1 space-y-1">
                          <div className="text-[10px] text-red-300 font-bold">Upload failed</div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-7 px-2 rounded-xl text-[10px] text-amber-300"
                            onClick={() => void startUpload("palm")}
                            disabled={!profileData.palmPhoto || isLoading}
                          >
                            Retry
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {inlineError ? (
          <div className="mb-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <div className="font-bold">Couldn’t finish setup</div>
            <div className="mt-1 text-red-100/90">{inlineError}</div>
          </div>
        ) : null}

        {currentStep === 3 && !canComplete ? (
          <div className="mb-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            <div className="font-bold">Face & Palm required</div>
            <div className="mt-1 text-amber-100/90">
              Please upload both your Face scan and Palm scan to continue.
            </div>
          </div>
        ) : null}

        <div className="flex gap-4">
          <Button variant="ghost" disabled={currentStep === 1} onClick={() => setCurrentStep(currentStep - 1)} size="xl" className="flex-1 text-white font-bold">Back</Button>
          {currentStep < 3 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)} size="xl" className="flex-1 bg-amber-500 text-slate-900 font-bold shadow-lg">Next</Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canComplete}
              className="flex-1 h-14 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </span>
              ) : (
                "Complete"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
