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

interface ProfileData {
  // Step 1: Basic Info
  fullName: string
  email: string
  gender: 'male' | 'female' | 'prefer-not-to-say'
  
  // Step 2: Birth Details
  birthDate: string
  birthTime: string
  birthPlace: string
  
  // Step 3: Face Photo
  facePhoto: File | null
  facePhotoUrl: string
  
  // Step 4: Palm Photo
  leftPalmPhoto: File | null
  leftPalmPhotoUrl: string
  rightPalmPhoto: File | null
  rightPalmPhotoUrl: string
  
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
    fullName: '',
    email: '',
    gender: 'prefer-not-to-say',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    facePhoto: null,
    facePhotoUrl: '',
    leftPalmPhoto: null,
    leftPalmPhotoUrl: '',
    rightPalmPhoto: null,
    rightPalmPhotoUrl: '',
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
        fullName: userProfile.displayName || '',
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

  const handleFileUpload = (file: File, type: 'face' | 'leftPalm' | 'rightPalm') => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      if (type === 'face') {
        setProfileData(prev => ({
          ...prev,
          facePhoto: file,
          facePhotoUrl: url
        }))
      } else if (type === 'leftPalm') {
        setProfileData(prev => ({
          ...prev,
          leftPalmPhoto: file,
          leftPalmPhotoUrl: url
        }))
      } else if (type === 'rightPalm') {
        setProfileData(prev => ({
          ...prev,
          rightPalmPhoto: file,
          rightPalmPhotoUrl: url
        }))
      }
    }
    reader.readAsDataURL(file)
  }

  // Get required palm photos based on gender
  const getRequiredPalmPhotos = () => {
    switch (profileData.gender) {
      case 'male':
        return ['rightPalm']
      case 'female':
        return ['leftPalm']
      case 'prefer-not-to-say':
        return ['leftPalm', 'rightPalm']
      default:
        return ['leftPalm', 'rightPalm']
    }
  }

  // Check if palm photos are complete
  const isPalmPhotosComplete = () => {
    const required = getRequiredPalmPhotos()
    return required.every(type => {
      if (type === 'leftPalm') return profileData.leftPalmPhoto !== null
      if (type === 'rightPalm') return profileData.rightPalmPhoto !== null
      return false
    })
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
    setIsLoading(true)
    
    try {
      // Here you would typically save the profile data
      // For now, we'll simulate the save
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: 'Profile Setup Complete! 🌟',
        description: 'Your mystical journey is now personalized just for you.',
      })
      
      // Check if user profile is complete and redirect to dashboard
      if (userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace) {
        router.push('/dashboard')
      } else {
        // If profile is not complete, stay on profile setup
        router.push('/profile-setup')
      }
    } catch (error) {
      toast({
        title: 'Setup Failed',
        description: 'Could not save your profile. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if current step is complete
  const isCurrentStepComplete = () => {
    switch (currentStep) {
      case 1:
        return profileData.fullName.trim() && profileData.gender
      case 2:
        return profileData.birthDate && profileData.birthTime && profileData.birthPlace
      case 3:
        return profileData.facePhoto !== null
      case 4:
        return isPalmPhotosComplete()
      case 5:
        return profileData.interests.length > 0
      default:
        return false
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
              <p className="text-soft">Let's personalize your mystical journey</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-white font-medium">Full Name *</Label>
                <Input
                  id="fullName"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
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
                <Label className="text-white font-medium">Gender *</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <Button
                    type="button"
                    variant={profileData.gender === 'male' ? 'default' : 'outline'}
                    onClick={() => setProfileData(prev => ({ ...prev, gender: 'male' }))}
                    className={`${
                      profileData.gender === 'male' 
                        ? 'bg-amber-500 text-white hover:bg-amber-600' 
                        : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    Male
                  </Button>
                  <Button
                    type="button"
                    variant={profileData.gender === 'female' ? 'default' : 'outline'}
                    onClick={() => setProfileData(prev => ({ ...prev, gender: 'female' }))}
                    className={`${
                      profileData.gender === 'female' 
                        ? 'bg-amber-500 text-white hover:bg-amber-600' 
                        : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    Female
                  </Button>
                  <Button
                    type="button"
                    variant={profileData.gender === 'prefer-not-to-say' ? 'default' : 'outline'}
                    onClick={() => setProfileData(prev => ({ ...prev, gender: 'prefer-not-to-say' }))}
                    className={`${
                      profileData.gender === 'prefer-not-to-say' 
                        ? 'bg-amber-500 text-white hover:bg-amber-600' 
                        : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    Prefer not to say
                  </Button>
                </div>
                <p className="text-xs text-gray-300 mt-1">This helps determine which palm photos are required for palmistry readings</p>
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
              <p className="text-soft">Your cosmic blueprint for accurate readings</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="birthDate" className="text-white font-medium">Date of Birth *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={profileData.birthDate}
                  onChange={(e) => setProfileData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <Label htmlFor="birthTime" className="text-white font-medium">Time of Birth</Label>
                <div className="flex gap-2">
                  <Input
                    id="birthTime"
                    type="time"
                    value={profileData.birthTime}
                    onChange={(e) => setProfileData(prev => ({ ...prev, birthTime: e.target.value }))}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 flex-1"
                  />
                  <select
                    value={profileData.birthTime.includes('12') ? 'PM' : 'AM'}
                    onChange={(e) => {
                      const time = profileData.birthTime
                      if (time) {
                        const [hours, minutes] = time.split(':')
                        let newHours = parseInt(hours)
                        if (e.target.value === 'PM' && newHours < 12) {
                          newHours += 12
                        } else if (e.target.value === 'AM' && newHours >= 12) {
                          newHours -= 12
                        }
                        const newTime = `${newHours.toString().padStart(2, '0')}:${minutes}`
                        setProfileData(prev => ({ ...prev, birthTime: newTime }))
                      }
                    }}
                    className="bg-white/5 border border-white/20 text-white px-3 py-2 rounded-md"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                <p className="text-xs text-gray-300 mt-1">For more accurate astrological readings</p>
              </div>
              
              <div>
                <Label htmlFor="birthPlace" className="text-white font-medium">Place of Birth</Label>
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
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-white mb-4">Upload a clear face photo</p>
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
                    <Button variant="outline" className="cursor-pointer text-white border-white/20 hover:bg-white/10">
                      <Camera className="w-4 h-4 mr-2" />
                      Choose Photo
                    </Button>
                  </Label>
                </div>
              )}
              
              <div className="text-xs text-gray-300 text-center">
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
              <p className="text-soft">
                {profileData.gender === 'male' ? 'Right palm for men' :
                 profileData.gender === 'female' ? 'Left palm for women' :
                 'Both palms for comprehensive analysis'}
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Show left palm for females and prefer-not-to-say */}
              {(profileData.gender === 'female' || profileData.gender === 'prefer-not-to-say') && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white text-center">Left Palm</h3>
                  {profileData.leftPalmPhotoUrl ? (
                    <div className="text-center">
                      <img
                        src={profileData.leftPalmPhotoUrl}
                        alt="Left Palm photo"
                        className="w-32 h-32 rounded-lg mx-auto mb-4 object-cover border-2 border-amber-400"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setProfileData(prev => ({ ...prev, leftPalmPhoto: null, leftPalmPhotoUrl: '' }))}
                        className="text-soft"
                      >
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                      <Hand className="w-12 h-12 mx-auto mb-4 text-soft/60" />
                      <p className="text-soft mb-4">Upload a clear left palm photo</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, 'leftPalm')
                        }}
                        className="hidden"
                        id="leftPalmPhoto"
                      />
                      <Label htmlFor="leftPalmPhoto" asChild>
                        <Button variant="outline" className="cursor-pointer">
                          <Camera className="w-4 h-4 mr-2" />
                          Choose Photo
                        </Button>
                      </Label>
                    </div>
                  )}
                </div>
              )}

              {/* Show right palm for males and prefer-not-to-say */}
              {(profileData.gender === 'male' || profileData.gender === 'prefer-not-to-say') && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white text-center">Right Palm</h3>
                  {profileData.rightPalmPhotoUrl ? (
                    <div className="text-center">
                      <img
                        src={profileData.rightPalmPhotoUrl}
                        alt="Right Palm photo"
                        className="w-32 h-32 rounded-lg mx-auto mb-4 object-cover border-2 border-amber-400"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setProfileData(prev => ({ ...prev, rightPalmPhoto: null, rightPalmPhotoUrl: '' }))}
                        className="text-soft"
                      >
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                      <Hand className="w-12 h-12 mx-auto mb-4 text-soft/60" />
                      <p className="text-soft mb-4">Upload a clear right palm photo</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, 'rightPalm')
                        }}
                        className="hidden"
                        id="rightPalmPhoto"
                      />
                      <Label htmlFor="rightPalmPhoto" asChild>
                        <Button variant="outline" className="cursor-pointer">
                          <Camera className="w-4 h-4 mr-2" />
                          Choose Photo
                        </Button>
                      </Label>
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-xs text-soft/60 text-center">
                <p>• Clear, well-lit photo of your palm</p>
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
              <p className="text-soft">Customize your mystical experience</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-soft mb-3 block">Areas of Interest</Label>
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
                <Label className="text-soft mb-3 block">Experience Level</Label>
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
                <Label className="text-soft mb-3 block">Notification Preferences</Label>
                <div className="space-y-2">
                  {Object.entries(profileData.notificationPreferences).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-soft capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
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
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-soft text-sm">Step {currentStep} of {totalSteps}</span>
            <span className="text-soft text-sm">{Math.round(progress)}%</span>
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
                className="text-soft"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  disabled={!isCurrentStepComplete()}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={isLoading || !isCurrentStepComplete()}
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