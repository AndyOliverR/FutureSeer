"use client"

import { useState, useEffect } from 'react'
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
import { updateUserProfile } from '@/lib/firebase'
import { BackButton } from '@/components/navigation/BackButton'

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

    setIsLoading(true)
    
    try {
      // Save profile data to Firebase
      const updateData: any = {
        displayName: profileData.displayName || profileData.fullName,
        fullName: profileData.fullName,
        birthDate: profileData.birthDate,
        birthTime: profileData.birthTime,
        birthPlace: profileData.birthPlace,
      }
      
      // Only add gender if it's selected
      if (profileData.gender) {
        updateData.gender = profileData.gender as 'male' | 'female' | 'non-binary'
      }
      
      await updateUserProfile(user.uid, updateData)
      
      // Generate comprehensive astrological profile with single AstroApp API call
      console.log('🌟 Generating comprehensive astrological profile...')
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
        
        console.log('✅ Comprehensive astrological profile generated:', {
          planets: comprehensiveData.planets.length,
          houses: comprehensiveData.houses.length,
          source: comprehensiveData.metadata.source
        })
        
        toast({
          title: 'Profile Setup Complete! 🌟',
          description: 'Your mystical journey is now personalized with comprehensive astrological data.',
        })
      } catch (astroError) {
        console.warn('AstroApp API call failed, but profile is saved:', astroError)
        toast({
          title: 'Profile Setup Complete! 🌟',
          description: 'Your mystical journey is now personalized. Astrological data will be generated when needed.',
        })
      }
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Profile setup error:', error)
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
              <h2 className="text-2xl font-semibold text-white mb-2">Welcome to FutureSeer</h2>
              <p className="text-gray-300">Let's personalize your mystical journey</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName" className="text-white">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Enter your preferred display name"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-300 mt-1">How you'd like to be addressed in the app (optional)</p>
              </div>
              
              <div>
                <Label htmlFor="fullName" className="text-white">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-300 mt-1">Used for numerological and astrological calculations</p>
              </div>
              
              <div>
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  disabled
                />
                <p className="text-xs text-gray-300 mt-1">Email is managed by your authentication provider</p>
              </div>
              
              <div>
                <Label htmlFor="gender" className="text-white">Gender Identity *</Label>
                <select
                  id="gender"
                  value={profileData.gender}
                  onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'non-binary' | '' }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                >
                  <option value="" className="text-gray-400">Select your gender</option>
                  <option value="male" className="text-white">Male</option>
                  <option value="female" className="text-white">Female</option>
                  <option value="non-binary" className="text-white">Non-binary / Prefer not to specify</option>
                </select>
                <p className="text-xs text-gray-300 mt-1">Used for palm reading: Right palm for men, left palm for women, both palms for non-binary</p>
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
              <h2 className="text-2xl font-semibold text-white mb-2">Birth Details</h2>
              <p className="text-gray-300">Your cosmic blueprint for accurate readings</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="birthDate" className="text-white">Date of Birth *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={profileData.birthDate}
                  onChange={(e) => setProfileData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="birthTime" className="text-white">Time of Birth</Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={profileData.birthTime}
                  onChange={(e) => setProfileData(prev => ({ ...prev, birthTime: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white"
                />
                <p className="text-xs text-gray-300 mt-1">For more accurate astrological readings</p>
              </div>
              
              <div>
                <Label htmlFor="birthPlace" className="text-white">Place of Birth</Label>
                <Input
                  id="birthPlace"
                  value={profileData.birthPlace}
                  onChange={(e) => setProfileData(prev => ({ ...prev, birthPlace: e.target.value }))}
                  placeholder="City, Country"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
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
              <h2 className="text-2xl font-semibold text-white mb-2">Face Photo</h2>
              <p className="text-gray-300">For face reading and personality analysis</p>
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
                    className="text-gray-300"
                  >
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300/60" />
                  <p className="text-gray-300 mb-4">Upload a clear face photo</p>
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
                    <Button variant="outline" className="cursor-pointer">
                      <Camera className="w-4 h-4 mr-2" />
                      Choose Photo
                    </Button>
                  </Label>
                </div>
              )}
              
              <div className="text-xs text-gray-300/60 text-center">
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
              <h2 className="text-2xl font-semibold text-white mb-2">Palm Photo</h2>
              <p className="text-gray-300">
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
                    className="text-gray-300"
                  >
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                  <Hand className="w-12 h-12 mx-auto mb-4 text-gray-300/60" />
                  <p className="text-gray-300 mb-4">Upload a clear palm photo</p>
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
                    <Button variant="outline" className="cursor-pointer">
                      <Camera className="w-4 h-4 mr-2" />
                      Choose Photo
                    </Button>
                  </Label>
                </div>
              )}
              
              <div className="text-xs text-gray-300/60 text-center">
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
              <h2 className="text-2xl font-semibold text-white mb-2">Preferences</h2>
              <p className="text-gray-300">Customize your mystical experience</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-gray-300 mb-3 block">Areas of Interest</Label>
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
                <Label className="text-gray-300 mb-3 block">Experience Level</Label>
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
                <Label className="text-gray-300 mb-3 block">Notification Preferences</Label>
                <div className="space-y-2">
                  {Object.entries(profileData.notificationPreferences).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
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
    <div className="min-h-screen p-4 starfield-ultra-sharp" data-onboarding="profile">
      <div className="max-w-2xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-6">
          <BackButton href="/profile" label="Back to Profile" />
        </div>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Step {currentStep} of {totalSteps}</span>
            <span className="text-gray-300 text-sm">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <Card className="glass-card border-white/10">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="text-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  disabled={!profileData.fullName.trim()}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
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