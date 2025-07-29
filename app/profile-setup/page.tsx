"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Camera, Upload, User, Calendar, MapPin, Clock, Hand, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ProfileData {
  fullName: string
  dateOfBirth: string
  timeOfBirth: string
  placeOfBirth: string
  selfieImage: string | null
  palmImage: string | null
}

export default function ProfileSetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    selfieImage: null,
    palmImage: null
  })

  const selfieRef = useRef<HTMLInputElement>(null)
  const palmRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraType, setCameraType] = useState<'selfie' | 'palm'>('selfie')

  const steps = [
    { id: 1, title: 'Basic Information', icon: User },
    { id: 2, title: 'Birth Details', icon: Calendar },
    { id: 3, title: 'Face Photo', icon: Camera },
    { id: 4, title: 'Palm Photo', icon: Hand },
    { id: 5, title: 'Complete Setup', icon: ImageIcon }
  ]

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (type: 'selfie' | 'palm', file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      if (type === 'selfie') {
        setProfileData(prev => ({ ...prev, selfieImage: imageData }))
      } else {
        setProfileData(prev => ({ ...prev, palmImage: imageData }))
      }
      toast({
        title: `${type === 'selfie' ? 'Face' : 'Palm'} photo uploaded!`,
        description: 'Photo captured successfully for analysis.',
      })
    }
    reader.readAsDataURL(file)
  }

  const startCamera = async (type: 'selfie' | 'palm') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: type === 'selfie' ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setShowCamera(true)
        setCameraType(type)
      }
    } catch (error) {
      toast({
        title: 'Camera access denied',
        description: 'Please allow camera access to take photos.',
        variant: 'destructive'
      })
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        
        if (cameraType === 'selfie') {
          setProfileData(prev => ({ ...prev, selfieImage: imageData }))
        } else {
          setProfileData(prev => ({ ...prev, palmImage: imageData }))
        }
        
        setShowCamera(false)
        toast({
          title: `${cameraType === 'selfie' ? 'Face' : 'Palm'} photo captured!`,
          description: 'Photo saved for mystical analysis.',
        })
      }
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCompleteSetup = async () => {
    setLoading(true)
    
    try {
      // Validate all required fields
      if (!profileData.fullName || !profileData.dateOfBirth || !profileData.timeOfBirth || !profileData.placeOfBirth) {
        throw new Error('Please fill in all required fields')
      }
      
      if (!profileData.selfieImage) {
        throw new Error('Please upload a face photo')
      }
      
      if (!profileData.palmImage) {
        throw new Error('Please upload a palm photo')
      }

      // Save profile data to Firebase (you'll need to implement this)
      // await saveProfileData(profileData)
      
      toast({
        title: 'Profile setup complete! 🌟',
        description: 'Your mystical journey begins now.',
      })
      
      // Redirect to dashboard
      router.push('/dashboard')
      
    } catch (error) {
      toast({
        title: 'Setup incomplete',
        description: error instanceof Error ? error.message : 'Please complete all steps',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="fullName" className="text-lg font-semibold">
                What's your full name? ✨
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your complete name"
                value={profileData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="mt-2 text-lg"
              />
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💫 Your name holds powerful numerological significance. We'll analyze every letter to reveal your destiny numbers and life path.
              </p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="dateOfBirth" className="text-lg font-semibold">
                When were you born? 📅
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="mt-2 text-lg"
              />
            </div>
            
            <div>
              <Label htmlFor="timeOfBirth" className="text-lg font-semibold">
                What time were you born? ⏰
              </Label>
              <Input
                id="timeOfBirth"
                type="time"
                value={profileData.timeOfBirth}
                onChange={(e) => handleInputChange('timeOfBirth', e.target.value)}
                className="mt-2 text-lg"
              />
            </div>
            
            <div>
              <Label htmlFor="placeOfBirth" className="text-lg font-semibold">
                Where were you born? 🌍
              </Label>
              <Input
                id="placeOfBirth"
                type="text"
                placeholder="City, Country"
                value={profileData.placeOfBirth}
                onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                className="mt-2 text-lg"
              />
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                🌟 Your birth details create your unique astrological chart. We'll calculate planetary positions, houses, and cosmic influences.
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">📸 Capture Your Face for Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We'll analyze your facial features for personality insights and compatibility readings.
              </p>
            </div>
            
            {profileData.selfieImage ? (
              <div className="text-center">
                <img 
                  src={profileData.selfieImage} 
                  alt="Face photo" 
                  className="w-64 h-64 object-cover rounded-lg mx-auto border-4 border-green-200"
                />
                <Button 
                  onClick={() => setProfileData(prev => ({ ...prev, selfieImage: null }))}
                  variant="outline"
                  className="mt-4"
                >
                  Retake Photo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => startCamera('selfie')}
                    className="h-32 flex flex-col items-center justify-center gap-2"
                  >
                    <Camera className="w-8 h-8" />
                    <span>Take Photo</span>
                  </Button>
                  
                  <Button 
                    onClick={() => selfieRef.current?.click()}
                    variant="outline"
                    className="h-32 flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="w-8 h-8" />
                    <span>Upload Photo</span>
                  </Button>
                </div>
                
                <input
                  ref={selfieRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload('selfie', file)
                  }}
                  className="hidden"
                />
              </div>
            )}
            
            <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                👁️ Face reading reveals your personality traits, communication style, and hidden talents through facial features and expressions.
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">🤲 Capture Your Palm for Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We'll analyze your palm lines for life path, relationships, and future insights.
              </p>
            </div>
            
            {profileData.palmImage ? (
              <div className="text-center">
                <img 
                  src={profileData.palmImage} 
                  alt="Palm photo" 
                  className="w-64 h-64 object-cover rounded-lg mx-auto border-4 border-green-200"
                />
                <Button 
                  onClick={() => setProfileData(prev => ({ ...prev, palmImage: null }))}
                  variant="outline"
                  className="mt-4"
                >
                  Retake Photo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => startCamera('palm')}
                    className="h-32 flex flex-col items-center justify-center gap-2"
                  >
                    <Camera className="w-8 h-8" />
                    <span>Take Photo</span>
                  </Button>
                  
                  <Button 
                    onClick={() => palmRef.current?.click()}
                    variant="outline"
                    className="h-32 flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="w-8 h-8" />
                    <span>Upload Photo</span>
                  </Button>
                </div>
                
                <input
                  ref={palmRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload('palm', file)
                  }}
                  className="hidden"
                />
              </div>
            )}
            
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                🖐️ Palmistry reveals your life path, relationships, career, and future through the unique lines and patterns on your hands.
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">🌟 Complete Your Mystical Profile</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Review your information and complete your setup to unlock all mystical insights.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Name:</strong> {profileData.fullName}</p>
                  <p><strong>Birth Date:</strong> {profileData.dateOfBirth}</p>
                  <p><strong>Birth Time:</strong> {profileData.timeOfBirth}</p>
                  <p><strong>Birth Place:</strong> {profileData.placeOfBirth}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Analysis Photos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Face Photo: {profileData.selfieImage ? '✅ Uploaded' : '❌ Missing'}
                  </p>
                  <p className="flex items-center gap-2">
                    <Hand className="w-4 h-4" />
                    Palm Photo: {profileData.palmImage ? '✅ Uploaded' : '❌ Missing'}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 p-6 rounded-lg text-center">
              <h4 className="text-lg font-semibold mb-2">🔮 Ready to Begin Your Mystical Journey?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Once complete, you'll have access to all predictive systems, personalized insights, and the exclusive "Ask the Seer" feature.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">Mystical Profile</span>
          </h1>
          <p className="text-xl text-gray-300">
            Set up your profile to unlock personalized mystical insights and predictions
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Step {currentStep} of {steps.length}</span>
            <span className="text-sm text-gray-400">{Math.round((currentStep / steps.length) * 100)}% Complete</span>
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                  currentStep >= step.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-700 text-gray-400'
                }`}
              >
                <step.icon className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-medium">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
            className="px-8"
          >
            Previous
          </Button>
          
          {currentStep < steps.length ? (
            <Button
              onClick={nextStep}
              className="px-8 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
            >
              Next Step
            </Button>
          ) : (
            <Button
              onClick={handleCompleteSetup}
              disabled={loading}
              className="px-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          )}
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg max-w-2xl w-full mx-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold">
                {cameraType === 'selfie' ? '📸 Take Face Photo' : '🤲 Take Palm Photo'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Position your {cameraType === 'selfie' ? 'face' : 'palm'} clearly in the frame
              </p>
            </div>
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg mb-4"
            />
            
            <div className="flex justify-center space-x-4">
              <Button onClick={capturePhoto} className="bg-green-500 hover:bg-green-600">
                Capture Photo
              </Button>
              <Button 
                onClick={() => setShowCamera(false)} 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 