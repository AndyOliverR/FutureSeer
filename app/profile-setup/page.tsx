"use client"

import { useState, useEffect } from 'react'
import { devLog } from '@/lib/devLogger';
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Calendar, 
  MapPin, 
  Camera, 
  Hand, 
  Heart, 
  Star, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Upload,
  Sparkles
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { updateUserProfile, getFirebaseStorage } from '@/lib/firebase'
import { getReturningUserWithReportsDestination } from '@/lib/authRouting'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

interface ProfileData {
  // Step 1: Basic Info
  displayName: string
  fullName: string
  email: string
  gender: 'male' | 'female' | 'non-binary' | ''
  
  // Step 2: Birth Details
  birthDate: string
  birthTime: string
  birthPlace: string
  
  // Step 3: Face Photo
  facePhoto: File | null
  facePhotoUrl: string
  
  // Step 4: Palm Photo
  palmPhoto: File | null
  palmPhotoUrl: string
  
  // Step 5: Preferences
  interests: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  notificationPreferences: {
    dailyInsights: boolean
    newFeatures: boolean
    communityUpdates: boolean
  }
}

const interests = [
  'Astrology', 'Numerology', 'Tarot', 'Palmistry', 'Face Reading',
  'I Ching', 'Runes', 'Dream Analysis', 'Vastu', 'Feng Shui',
  'Crystal Healing', 'Meditation', 'Spiritual Growth', 'Self-Discovery'
]

export default function ProfileSetupPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '',
    fullName: '',
    email: '',
    gender: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    facePhoto: null,
    facePhotoUrl: '',
    palmPhoto: null,
    palmPhotoUrl: '',
    interests: [],
    experienceLevel: 'beginner',
    notificationPreferences: {
      dailyInsights: true,
      newFeatures: true,
      communityUpdates: false
    }
  })

  // Load existing profile data
  useEffect(() => {
    if (userProfile) {
      setProfileData(prev => ({
        ...prev,
        displayName: userProfile.displayName || '',
        fullName: userProfile.fullName || '',
        email: userProfile.email || '',
        birthDate: userProfile.birthDate || '',
        birthTime: userProfile.birthTime || '',
        birthPlace: userProfile.birthPlace || ''
      }))
    }
  }, [userProfile])

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/signin')
    }
  }, [user, router])

  // Redirect to canonical default if profile and reports already exist (e.g. deep link or back button)
  useEffect(() => {
    if (user && userProfile?.mysticalProfileGenerated === true) {
      router.replace(getReturningUserWithReportsDestination())
    }
  }, [user, userProfile?.mysticalProfileGenerated, router])

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const handleFileUpload = (file: File, type: 'face' | 'palm') => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      if (type === 'face') {
        setProfileData(prev => ({
          ...prev,
          facePhoto: file,
          facePhotoUrl: url
        }))
      } else {
        setProfileData(prev => ({
          ...prev,
          palmPhoto: file,
          palmPhotoUrl: url
        }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleInterestToggle = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!profileData.fullName.trim()) {
        toast({
          title: 'Full Name Required',
          description: 'Please enter your full name to continue.',
          variant: 'destructive'
        })
        return
      }
      if (!profileData.gender) {
        toast({
          title: 'Gender Selection Required',
          description: 'Please select your gender identity to continue.',
          variant: 'destructive'
        })
        return
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    if (!user?.uid) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to complete your profile setup.',
        variant: 'destructive'
      })
      return
    }
    if (!profileData.birthDate?.trim() || !profileData.birthPlace?.trim()) {
      toast({
        title: 'Birth details required',
        description: 'Please enter your date and place of birth to continue.',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    
    try {
      const updateData: Record<string, unknown> = {
        displayName: profileData.displayName || profileData.fullName,
        fullName: profileData.fullName,
        birthDate: profileData.birthDate,
        birthTime: profileData.birthTime,
        birthPlace: profileData.birthPlace,
      }
      
      if (profileData.gender) {
        updateData.gender = profileData.gender as 'male' | 'female' | 'non-binary'
      }

      // Upload face and palm photos to Firebase Storage so generate-mystical can use them
      const storage = getFirebaseStorage()
      if (storage && profileData.facePhoto) {
        try {
          const faceExt = profileData.facePhoto.name.split('.').pop()?.toLowerCase() || 'jpg'
          const facePath = `users/${user.uid}/profile/face_${Date.now()}.${faceExt}`
          const faceRef = ref(storage, facePath)
          await uploadBytes(faceRef, profileData.facePhoto, { contentType: profileData.facePhoto.type })
          const faceUrl = await getDownloadURL(faceRef)
          updateData.facePhotoUrl = faceUrl
        } catch (uploadErr) {
          devLog.warn('Face photo upload failed, profile will save without it:', uploadErr, 'page')
        }
      }
      if (storage && profileData.palmPhoto) {
        try {
          const palmExt = profileData.palmPhoto.name.split('.').pop()?.toLowerCase() || 'jpg'
          const palmPath = `users/${user.uid}/profile/palm_${Date.now()}.${palmExt}`
          const palmRef = ref(storage, palmPath)
          await uploadBytes(palmRef, profileData.palmPhoto, { contentType: profileData.palmPhoto.type })
          const palmUrl = await getDownloadURL(palmRef)
          updateData.palmPhotoUrl = palmUrl
        } catch (uploadErr) {
          devLog.warn('Palm photo upload failed, profile will save without it:', uploadErr, 'page')
        }
      }
      
      await updateUserProfile(user.uid, updateData as Parameters<typeof updateUserProfile>[1])
      
      // Generate comprehensive astrological profile with single AstroApp API call
      devLog.debug('🌟 Generating comprehensive astrological profile...')
      toast({
        title: 'Generating Your Mystical Profile...',
        description: 'Calling AstroApp API to create your comprehensive astrological data.',
      })
      
      try {
        const { getComprehensiveAstroData } = await import('@/lib/astroDataService')
        const comprehensiveData = await getComprehensiveAstroData(
          user.uid,
          profileData.birthDate,
          profileData.birthPlace,
          profileData.birthTime,
          true // Force refresh to get fresh data
        )
        
        devLog.debug('✅ Comprehensive astrological profile generated:', {
          planets: comprehensiveData.planets.length,
          houses: comprehensiveData.houses.length,
          source: comprehensiveData.metadata.source
        })
        
        toast({
          title: 'Profile Setup Complete! 🌟',
          description: 'Your mystical journey is now personalized with comprehensive astrological data.',
        })
      } catch (astroError) {
        devLog.warn('AstroApp API call failed, but profile is saved:', astroError, 'page')
        toast({
          title: 'Profile Setup Complete! 🌟',
          description: 'Your mystical journey is now personalized. Astrological data will be generated when needed.',
        })
      }
      
      router.push('/profile')
    } catch (error) {
      devLog.error('Profile setup error:', error, 'page')
      toast({
        title: 'Setup Failed',
        description: 'Could not save your profile. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">👋</div>
              <h2 className="m3-headline-small font-serif text-amber-400 mb-2">Welcome to FutureSeer</h2>
              <p className="text-white/80 m3-body-medium">Let's personalize your mystical journey</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName" className="text-amber-400 m3-title-medium">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Enter your preferred display name"
                  className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard rounded-lg"
                />
                <p className="m3-body-small text-[var(--m3-on-surface-variant)] mt-1">How you'd like to be addressed in the app (optional)</p>
              </div>
              
              <div>
                <Label htmlFor="fullName" className="text-amber-400 m3-title-medium">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                  className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard rounded-lg"
                />
                <p className="m3-body-small text-[var(--m3-on-surface-variant)] mt-1">Used for numerological and astrological calculations</p>
              </div>
              
              <div>
                <Label htmlFor="email" className="text-amber-400 m3-title-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard rounded-lg"
                  disabled
                />
                <p className="m3-body-small text-[var(--m3-on-surface-variant)] mt-1">Email is managed by your authentication provider</p>
              </div>
              
              <div>
                <Label htmlFor="gender" className="text-amber-400 m3-title-medium">Gender Identity *</Label>
                <select
                  id="gender"
                  value={profileData.gender}
                  onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'non-binary' | '' }))}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard [color-scheme:dark]"
                >
                  <option value="" className="text-[var(--m3-on-surface-variant)]">Select your gender</option>
                  <option value="male" className="text-[var(--m3-on-surface)]">Male</option>
                  <option value="female" className="text-[var(--m3-on-surface)]">Female</option>
                  <option value="non-binary" className="text-[var(--m3-on-surface)]">Non-binary / Prefer not to specify</option>
                </select>
                <p className="m3-body-small text-[var(--m3-on-surface-variant)] mt-1">Used for palm reading: Right palm for men, left palm for women, both palms for non-binary</p>
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🌟</div>
              <h2 className="m3-headline-small font-serif text-amber-400 mb-2">Birth Details</h2>
              <p className="text-white/80 m3-body-medium">Your cosmic blueprint for accurate readings</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="birthDate" className="text-amber-400 m3-title-medium">Date of Birth *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={profileData.birthDate}
                  onChange={(e) => setProfileData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard rounded-lg [color-scheme:dark]"
                />
              </div>
              
              <div>
                <Label htmlFor="birthTime" className="text-amber-400 m3-title-medium">Time of Birth</Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={profileData.birthTime}
                  onChange={(e) => setProfileData(prev => ({ ...prev, birthTime: e.target.value }))}
                  className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard rounded-lg [color-scheme:dark]"
                />
                <p className="m3-body-small text-[var(--m3-on-surface-variant)] mt-1">For more accurate astrological readings</p>
              </div>
              
              <div>
                <Label htmlFor="birthPlace" className="text-amber-400 m3-title-medium">Place of Birth</Label>
                <Input
                  id="birthPlace"
                  value={profileData.birthPlace}
                  onChange={(e) => setProfileData(prev => ({ ...prev, birthPlace: e.target.value }))}
                  placeholder="City, Country"
                  className="bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-input-focus backdrop-blur-sm m3-transition-standard rounded-lg"
                />
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">📸</div>
              <h2 className="m3-headline-small font-serif text-amber-400 mb-2">Face Photo</h2>
              <p className="text-white/80 m3-body-medium">For face reading and personality analysis</p>
            </div>
            
            <div className="space-y-4">
              {profileData.facePhotoUrl ? (
                <div className="text-center">
                  <img
                    src={profileData.facePhotoUrl}
                    alt="Face photo"
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-2 border-amber-400"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setProfileData(prev => ({ ...prev, facePhoto: null, facePhotoUrl: '' }))}
                    className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 rounded-xl"
                  >
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[var(--m3-outline-variant)] rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--m3-on-surface-variant)]" />
                  <p className="text-[var(--m3-on-surface-variant)] mb-4 m3-body-medium">Upload a clear face photo</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'face')
                    }}
                    className="hidden"
                    id="facePhoto"
                  />
                  <Label htmlFor="facePhoto" asChild>
                    <Button variant="outline" className="cursor-pointer bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 rounded-xl">
                      <Camera className="w-4 h-4 mr-2" />
                      Choose Photo
                    </Button>
                  </Label>
                </div>
              )}
              
              <div className="m3-body-small text-[var(--m3-on-surface-variant)] text-center space-y-1">
                <p>• Clear, well-lit photo of your face</p>
                <p>• Used for face reading analysis only</p>
                <p>• Your privacy is protected</p>
              </div>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">🤲</div>
              <h2 className="m3-headline-small font-serif text-amber-400 mb-2">Palm Photo</h2>
              <p className="text-white/80 m3-body-medium">
                {profileData.gender === 'male' && 'Upload your right palm for palmistry analysis'}
                {profileData.gender === 'female' && 'Upload your left palm for palmistry analysis'}
                {profileData.gender === 'non-binary' && 'Upload both palms for comprehensive palmistry analysis'}
                {!profileData.gender && 'For palmistry and life path analysis'}
              </p>
            </div>
            
            <div className="space-y-4">
              {profileData.palmPhotoUrl ? (
                <div className="text-center">
                  <img
                    src={profileData.palmPhotoUrl}
                    alt="Palm photo"
                    className="w-32 h-32 rounded-lg mx-auto mb-4 object-cover border-2 border-amber-400"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setProfileData(prev => ({ ...prev, palmPhoto: null, palmPhotoUrl: '' }))}
                    className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 rounded-xl"
                  >
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[var(--m3-outline-variant)] rounded-lg p-8 text-center">
                  <Hand className="w-12 h-12 mx-auto mb-4 text-[var(--m3-on-surface-variant)]" />
                  <p className="text-[var(--m3-on-surface-variant)] mb-4 m3-body-medium">Upload a clear palm photo</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'palm')
                    }}
                    className="hidden"
                    id="palmPhoto"
                  />
                  <Label htmlFor="palmPhoto" asChild>
                    <Button variant="outline" className="cursor-pointer bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 rounded-xl">
                      <Camera className="w-4 h-4 mr-2" />
                      Choose Photo
                    </Button>
                  </Label>
                </div>
              )}
              
              <div className="m3-body-small text-[var(--m3-on-surface-variant)] text-center space-y-1">
                {profileData.gender === 'male' && (
                  <>
                    <p>• Clear photo of your right palm</p>
                    <p>• Right palm is used for men in palmistry</p>
                  </>
                )}
                {profileData.gender === 'female' && (
                  <>
                    <p>• Clear photo of your left palm</p>
                    <p>• Left palm is used for women in palmistry</p>
                  </>
                )}
                {profileData.gender === 'non-binary' && (
                  <>
                    <p>• Clear photos of both palms recommended</p>
                    <p>• Both palms provide comprehensive analysis</p>
                  </>
                )}
                {!profileData.gender && (
                  <p>• Clear photo of your palm (both hands recommended)</p>
                )}
                <p>• Used for palmistry analysis only</p>
                <p>• Your privacy is protected</p>
              </div>
            </div>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">⚙️</div>
              <h2 className="m3-headline-small font-serif text-amber-400 mb-2">Preferences</h2>
              <p className="text-white/80 m3-body-medium">Customize your mystical experience</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-amber-400 m3-title-medium mb-3 block">Areas of Interest</Label>
                <div className="grid grid-cols-2 gap-2">
                  {interests.map((interest) => (
                    <Button
                      key={interest}
                      variant={profileData.interests.includes(interest) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInterestToggle(interest)}
                      className="justify-start"
                    >
                      {profileData.interests.includes(interest) && <Check className="w-3 h-3 mr-1" />}
                      {interest}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-amber-400 m3-title-medium mb-3 block">Experience Level</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <Button
                      key={level}
                      variant={profileData.experienceLevel === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProfileData(prev => ({ ...prev, experienceLevel: level as any }))}
                      className="capitalize"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-amber-400 m3-title-medium mb-3 block">Notification Preferences</Label>
                <div className="space-y-2">
                  {Object.entries(profileData.notificationPreferences).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-[var(--m3-on-surface-variant)] m3-body-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <Button
                        variant={value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setProfileData(prev => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            [key]: !value
                          }
                        }))}
                      >
                        {value ? 'On' : 'Off'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative min-h-screen overflow-hidden starfield-ultra-sharp pt-16" data-onboarding="profile">
      <div className="relative z-10 px-3 sm:px-4 md:px-6 py-4 max-w-4xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            href="/ask-the-seer"
            className="inline-flex items-center gap-3 text-amber-400 hover:text-amber-400/80 m3-transition-standard group"
          >
            <div className="p-2 rounded-full bg-[var(--m3-primary-container)] border border-[var(--m3-primary)]/20 group-hover:bg-[var(--m3-primary-container)]/80 group-hover:border-[var(--m3-primary)]/40 m3-transition-standard">
              <ArrowLeft className="w-4 h-4 text-[var(--m3-primary)] group-hover:-translate-x-1 m3-transition-standard" />
            </div>
            <span className="m3-label-large">Back</span>
          </Link>
        </div>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="m3-body-small text-[var(--m3-on-surface-variant)]">Step {currentStep} of {totalSteps}</span>
            <span className="m3-body-small text-[var(--m3-on-surface-variant)]">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 rounded-2xl">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-[var(--m3-outline-variant)]">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  disabled={!profileData.fullName.trim()}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl m3-label-large"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={isLoading || !profileData.birthDate?.trim() || !profileData.birthPlace?.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl m3-label-large"
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 