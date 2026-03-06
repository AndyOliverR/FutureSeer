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
import { updateUserProfile, getFirebaseStorage } from '@/lib/firebase'
import { getReturningUserWithReportsDestination } from '@/lib/authRouting'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { devLog } from '@/lib/devLogger';

export default function ProfileSetupPage() {
  const { user, userProfile, refreshProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    displayName: '', fullName: '', gender: '' as any,
    birthDate: '', birthTime: '', birthPlace: '',
    facePhotoUrl: '', palmPhotoUrl: '',
    facePhoto: null as File | null, palmPhoto: null as File | null
  })

  useEffect(() => {
    if (userProfile) {
      setProfileData(prev => ({
        ...prev,
        displayName: userProfile.displayName || '',
        fullName: userProfile.fullName || '',
        birthDate: userProfile.birthDate || '',
        birthTime: userProfile.birthTime || '',
        birthPlace: userProfile.birthPlace || ''
      }))
    }
  }, [userProfile])

  const handleFileUpload = (file: File, type: 'face' | 'palm') => {
    const url = URL.createObjectURL(file)
    setProfileData(prev => ({ ...prev, [`${type}Photo`]: file, [`${type}PhotoUrl`]: url }))
  }

  const handleComplete = async () => {
    if (!user?.uid) return;
    setIsLoading(true)
    try {
      const updateData: any = { ...profileData };
      delete updateData.facePhoto; delete updateData.palmPhoto;
      
      const storage = getFirebaseStorage()
      if (storage && profileData.facePhoto) {
        const faceRef = ref(storage, `users/${user.uid}/face_${Date.now()}`)
        await uploadBytes(faceRef, profileData.facePhoto)
        updateData.facePhotoUrl = await getDownloadURL(faceRef)
      }
      
      await updateUserProfile(user.uid, updateData)
      await refreshProfile()
      toast({ title: 'Cosmic Profile Set! 🌟' })
      router.push('/profile')
    } catch (e) { toast({ title: 'Setup Failed', variant: 'destructive' }) }
    finally { setIsLoading(false) }
  }

  const progress = (currentStep / 4) * 100

  return (
    <div className="min-h-screen bg-surface flex flex-col pt-[env(safe-area-inset-top)] px-4 pb-10">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="py-6 text-center">
          <h1 className="text-3xl font-heading font-bold text-amber-400 mb-2">Cosmic Setup</h1>
          <Progress value={progress} className="h-2 bg-surface-container-low" />
        </div>

        <div className="flex-1 bg-surface-container-high rounded-[32px] p-6 border border-outline-variant shadow-2xl overflow-hidden mb-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center py-4"><div className="text-5xl mb-2">👋</div><h2 className="text-xl font-bold text-white">Identity</h2></div>
                <div className="space-y-4">
                  <Input value={profileData.displayName} onChange={e => setProfileData({...profileData, displayName: e.target.value})} placeholder="Display Name (AnDY)" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4" />
                  <Input value={profileData.fullName} onChange={e => setProfileData({...profileData, fullName: e.target.value})} placeholder="Full Name (for calculations)" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4" />
                  <select value={profileData.gender} onChange={e => setProfileData({...profileData, gender: e.target.value})} className="w-full h-14 bg-surface-container-low border border-outline-variant rounded-2xl px-4 text-white"><option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option></select>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center py-4"><div className="text-5xl mb-2">📅</div><h2 className="text-xl font-bold text-white">Birth Details</h2></div>
                <div className="space-y-4">
                  <Input type="date" value={profileData.birthDate} onChange={e => setProfileData({...profileData, birthDate: e.target.value})} className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4 [color-scheme:dark]" />
                  <Input type="time" value={profileData.birthTime} onChange={e => setProfileData({...profileData, birthTime: e.target.value})} className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4 [color-scheme:dark]" />
                  <Input value={profileData.birthPlace} onChange={e => setProfileData({...profileData, birthPlace: e.target.value})} placeholder="City, Country" className="h-14 bg-surface-container-low border-outline-variant rounded-2xl pl-4" />
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
                    <label className="block text-center"><input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'face')} /><span className="text-[10px] font-bold text-amber-400 uppercase">Face Scan</span></label>
                  </div>
                  <div className="space-y-2">
                    <div className="aspect-square bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden">
                      {profileData.palmPhotoUrl ? <img src={profileData.palmPhotoUrl} className="w-full h-full object-cover" /> : <Hand className="w-8 h-8 opacity-20" />}
                    </div>
                    <label className="block text-center"><input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'palm')} /><span className="text-[10px] font-bold text-amber-400 uppercase">Palm Scan</span></label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-4">
          <Button variant="ghost" disabled={currentStep === 1} onClick={() => setCurrentStep(currentStep - 1)} className="flex-1 h-14 rounded-2xl text-white font-bold">Back</Button>
          {currentStep < 3 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)} className="flex-1 h-14 bg-amber-500 text-slate-900 rounded-2xl font-bold shadow-lg">Next</Button>
          ) : (
            <Button onClick={handleComplete} disabled={isLoading} className="flex-1 h-14 bg-primary text-on-primary rounded-2xl font-bold shadow-lg">
              {isLoading ? <Loader2 className="animate-spin" /> : "Complete"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
