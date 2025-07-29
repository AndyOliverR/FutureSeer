"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { 
  User, 
  Heart, 
  Brain, 
  Target, 
  Settings, 
  Save, 
  RefreshCw,
  Star,
  Moon,
  Sun,
  Palette,
  Music,
  BookOpen,
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/use-toast'

interface AdvancedProfile {
  // Personality
  mbtiType: string
  enneagramType: string
  personalityTraits: string[]
  
  // Lifestyle
  sleepSchedule: string
  workStyle: string
  stressLevel: number
  energyLevel: number
  socialPreference: 'introvert' | 'ambivert' | 'extrovert'
  
  // Spiritual
  spiritualBeliefs: string[]
  meditationPractice: boolean
  meditationFrequency: string
  spiritualGoals: string[]
  
  // Goals & Context
  lifeGoals: string[]
  currentChallenges: string[]
  relationshipStatus: string
  careerStage: string
  
  // Preferences
  preferredReadingStyle: 'detailed' | 'concise' | 'visual'
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  notificationPreferences: {
    dailyInsights: boolean
    weeklyReports: boolean
    newFeatures: boolean
    communityUpdates: boolean
    personalizedRemedies: boolean
  }
  
  // Health & Wellness
  healthProfile: {
    diet: string
    exercise: string
    stressManagement: string
    sleepQuality: number
    energyLevels: number
  }
  
  // Customization
  themePreference: 'light' | 'dark' | 'auto'
  languagePreference: string
  timezone: string
}

const mbtiTypes = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
]

const enneagramTypes = [
  'Type 1 - The Reformer', 'Type 2 - The Helper', 'Type 3 - The Achiever',
  'Type 4 - The Individualist', 'Type 5 - The Investigator', 'Type 6 - The Loyalist',
  'Type 7 - The Enthusiast', 'Type 8 - The Challenger', 'Type 9 - The Peacemaker'
]

const spiritualBeliefs = [
  'Buddhism', 'Hinduism', 'Christianity', 'Islam', 'Judaism', 'Taoism',
  'New Age', 'Atheist', 'Agnostic', 'Spiritual but not religious',
  'Paganism', 'Wicca', 'Other'
]

const lifeGoals = [
  'Career Success', 'Financial Freedom', 'Personal Growth', 'Spiritual Development',
  'Healthy Relationships', 'Physical Health', 'Mental Wellness', 'Creative Expression',
  'Travel & Adventure', 'Community Service', 'Learning & Education', 'Family'
]

export default function AdvancedPersonalizationPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [profile, setProfile] = useState<AdvancedProfile>({
    mbtiType: '',
    enneagramType: '',
    personalityTraits: [],
    sleepSchedule: '',
    workStyle: '',
    stressLevel: 5,
    energyLevel: 5,
    socialPreference: 'ambivert',
    spiritualBeliefs: [],
    meditationPractice: false,
    meditationFrequency: '',
    spiritualGoals: [],
    lifeGoals: [],
    currentChallenges: [],
    relationshipStatus: '',
    careerStage: '',
    preferredReadingStyle: 'detailed',
    preferredTimeOfDay: 'morning',
    notificationPreferences: {
      dailyInsights: true,
      weeklyReports: true,
      newFeatures: true,
      communityUpdates: false,
      personalizedRemedies: true
    },
    healthProfile: {
      diet: '',
      exercise: '',
      stressManagement: '',
      sleepQuality: 5,
      energyLevels: 5
    },
    themePreference: 'auto',
    languagePreference: 'English',
    timezone: 'UTC'
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('personality')

  // Load profile data
  useEffect(() => {
    if (user?.uid) {
      loadProfile()
    }
  }, [user?.uid])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/personalization/profile?userId=${user?.uid}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.advancedProfile || profile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfile = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/personalization/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
          advancedProfile: profile
        }),
      })

      if (response.ok) {
        toast({
          title: 'Profile Saved! 🌟',
          description: 'Your advanced personalization settings have been updated.',
        })
      } else {
        throw new Error('Failed to save profile')
      }
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Could not save your profile. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const calculateCompletion = () => {
    const fields = [
      profile.mbtiType,
      profile.enneagramType,
      profile.sleepSchedule,
      profile.workStyle,
      profile.spiritualBeliefs.length,
      profile.lifeGoals.length,
      profile.relationshipStatus,
      profile.careerStage
    ]
    
    const completed = fields.filter(field => 
      typeof field === 'string' ? field !== '' : field > 0
    ).length
    
    return Math.round((completed / fields.length) * 100)
  }

  const completion = calculateCompletion()

  const tabs = [
    { id: 'personality', label: 'Personality', icon: Brain },
    { id: 'lifestyle', label: 'Lifestyle', icon: Heart },
    { id: 'spiritual', label: 'Spiritual', icon: Star },
    { id: 'goals', label: 'Goals & Context', icon: Target },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'health', label: 'Health & Wellness', icon: Sun }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personality':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-soft text-sm mb-3 block">MBTI Type</label>
              <select
                value={profile.mbtiType}
                onChange={(e) => setProfile(prev => ({ ...prev, mbtiType: e.target.value }))}
                className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft"
              >
                <option value="">Select your MBTI type</option>
                {mbtiTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-soft text-sm mb-3 block">Enneagram Type</label>
              <select
                value={profile.enneagramType}
                onChange={(e) => setProfile(prev => ({ ...prev, enneagramType: e.target.value }))}
                className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft"
              >
                <option value="">Select your Enneagram type</option>
                {enneagramTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-soft text-sm mb-3 block">Social Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {['introvert', 'ambivert', 'extrovert'].map((type) => (
                  <Button
                    key={type}
                    variant={profile.socialPreference === type ? "default" : "outline"}
                    onClick={() => setProfile(prev => ({ ...prev, socialPreference: type as any }))}
                    className="capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'lifestyle':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-soft text-sm mb-3 block">Sleep Schedule</label>
              <Input
                value={profile.sleepSchedule}
                onChange={(e) => setProfile(prev => ({ ...prev, sleepSchedule: e.target.value }))}
                placeholder="e.g., 11 PM - 7 AM"
                className="bg-white/5 border-white/20 text-soft"
              />
            </div>

            <div>
              <label className="text-soft text-sm mb-3 block">Work Style</label>
              <Textarea
                value={profile.workStyle}
                onChange={(e) => setProfile(prev => ({ ...prev, workStyle: e.target.value }))}
                placeholder="Describe your work style, schedule, and environment..."
                rows={3}
                className="bg-white/5 border-white/20 text-soft"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-soft text-sm mb-3 block">Stress Level (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={profile.stressLevel}
                  onChange={(e) => setProfile(prev => ({ ...prev, stressLevel: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-soft mt-1">
                  <span>Low</span>
                  <span>{profile.stressLevel}</span>
                  <span>High</span>
                </div>
              </div>

              <div>
                <label className="text-soft text-sm mb-3 block">Energy Level (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={profile.energyLevel}
                  onChange={(e) => setProfile(prev => ({ ...prev, energyLevel: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-soft mt-1">
                  <span>Low</span>
                  <span>{profile.energyLevel}</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'spiritual':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-soft text-sm mb-3 block">Spiritual Beliefs</label>
              <div className="grid grid-cols-2 gap-2">
                {spiritualBeliefs.map((belief) => (
                  <Button
                    key={belief}
                    variant={profile.spiritualBeliefs.includes(belief) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProfile(prev => ({
                      ...prev,
                      spiritualBeliefs: prev.spiritualBeliefs.includes(belief)
                        ? prev.spiritualBeliefs.filter(b => b !== belief)
                        : [...prev.spiritualBeliefs, belief]
                    }))}
                    className="justify-start"
                  >
                    {profile.spiritualBeliefs.includes(belief) && <CheckCircle className="w-3 h-3 mr-1" />}
                    {belief}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-soft text-sm mb-3 block">Meditation Practice</label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={profile.meditationPractice}
                    onCheckedChange={(checked) => setProfile(prev => ({ ...prev, meditationPractice: checked }))}
                  />
                  <span className="text-soft text-sm">
                    {profile.meditationPractice ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {profile.meditationPractice && (
                <div>
                  <label className="text-soft text-sm mb-3 block">Meditation Frequency</label>
                  <Input
                    value={profile.meditationFrequency}
                    onChange={(e) => setProfile(prev => ({ ...prev, meditationFrequency: e.target.value }))}
                    placeholder="e.g., Daily, 3x per week"
                    className="bg-white/5 border-white/20 text-soft"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-soft text-sm mb-3 block">Spiritual Goals</label>
              <Textarea
                value={profile.spiritualGoals.join(', ')}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  spiritualGoals: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                }))}
                placeholder="Enter your spiritual goals, separated by commas..."
                rows={3}
                className="bg-white/5 border-white/20 text-soft"
              />
            </div>
          </div>
        )

      case 'goals':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-soft text-sm mb-3 block">Life Goals</label>
              <div className="grid grid-cols-2 gap-2">
                {lifeGoals.map((goal) => (
                  <Button
                    key={goal}
                    variant={profile.lifeGoals.includes(goal) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProfile(prev => ({
                      ...prev,
                      lifeGoals: prev.lifeGoals.includes(goal)
                        ? prev.lifeGoals.filter(g => g !== goal)
                        : [...prev.lifeGoals, goal]
                    }))}
                    className="justify-start"
                  >
                    {profile.lifeGoals.includes(goal) && <CheckCircle className="w-3 h-3 mr-1" />}
                    {goal}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-soft text-sm mb-3 block">Current Challenges</label>
              <Textarea
                value={profile.currentChallenges.join(', ')}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  currentChallenges: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                }))}
                placeholder="Enter your current challenges, separated by commas..."
                rows={3}
                className="bg-white/5 border-white/20 text-soft"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-soft text-sm mb-3 block">Relationship Status</label>
                <Input
                  value={profile.relationshipStatus}
                  onChange={(e) => setProfile(prev => ({ ...prev, relationshipStatus: e.target.value }))}
                  placeholder="e.g., Single, Married, In a relationship"
                  className="bg-white/5 border-white/20 text-soft"
                />
              </div>

              <div>
                <label className="text-soft text-sm mb-3 block">Career Stage</label>
                <Input
                  value={profile.careerStage}
                  onChange={(e) => setProfile(prev => ({ ...prev, careerStage: e.target.value }))}
                  placeholder="e.g., Student, Early career, Mid-career, Senior"
                  className="bg-white/5 border-white/20 text-soft"
                />
              </div>
            </div>
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-soft text-sm mb-3 block">Preferred Reading Style</label>
              <div className="grid grid-cols-3 gap-2">
                {['detailed', 'concise', 'visual'].map((style) => (
                  <Button
                    key={style}
                    variant={profile.preferredReadingStyle === style ? "default" : "outline"}
                    onClick={() => setProfile(prev => ({ ...prev, preferredReadingStyle: style as any }))}
                    className="capitalize"
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-soft text-sm mb-3 block">Preferred Time of Day</label>
              <div className="grid grid-cols-2 gap-2">
                {['morning', 'afternoon', 'evening', 'night'].map((time) => (
                  <Button
                    key={time}
                    variant={profile.preferredTimeOfDay === time ? "default" : "outline"}
                    onClick={() => setProfile(prev => ({ ...prev, preferredTimeOfDay: time as any }))}
                    className="capitalize"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-soft text-sm mb-3 block">Notification Preferences</label>
              <div className="space-y-3">
                {Object.entries(profile.notificationPreferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-soft capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => setProfile(prev => ({
                        ...prev,
                        notificationPreferences: {
                          ...prev.notificationPreferences,
                          [key]: checked
                        }
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-soft text-sm mb-3 block">Theme Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {['light', 'dark', 'auto'].map((theme) => (
                    <Button
                      key={theme}
                      variant={profile.themePreference === theme ? "default" : "outline"}
                      onClick={() => setProfile(prev => ({ ...prev, themePreference: theme as any }))}
                      className="capitalize"
                    >
                      {theme}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-soft text-sm mb-3 block">Language Preference</label>
                <select
                  value={profile.languagePreference}
                  onChange={(e) => setProfile(prev => ({ ...prev, languagePreference: e.target.value }))}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'health':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-soft text-sm mb-3 block">Diet</label>
              <Input
                value={profile.healthProfile.diet}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  healthProfile: { ...prev.healthProfile, diet: e.target.value }
                }))}
                placeholder="e.g., Vegetarian, Vegan, Mediterranean"
                className="bg-white/5 border-white/20 text-soft"
              />
            </div>

            <div>
              <label className="text-soft text-sm mb-3 block">Exercise Routine</label>
              <Textarea
                value={profile.healthProfile.exercise}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  healthProfile: { ...prev.healthProfile, exercise: e.target.value }
                }))}
                placeholder="Describe your exercise routine and fitness activities..."
                rows={3}
                className="bg-white/5 border-white/20 text-soft"
              />
            </div>

            <div>
              <label className="text-soft text-sm mb-3 block">Stress Management</label>
              <Textarea
                value={profile.healthProfile.stressManagement}
                onChange={(e) => setProfile(prev => ({ 
                  ...prev, 
                  healthProfile: { ...prev.healthProfile, stressManagement: e.target.value }
                }))}
                placeholder="How do you manage stress? (e.g., meditation, exercise, hobbies)"
                rows={3}
                className="bg-white/5 border-white/20 text-soft"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-soft text-sm mb-3 block">Sleep Quality (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={profile.healthProfile.sleepQuality}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    healthProfile: { ...prev.healthProfile, sleepQuality: parseInt(e.target.value) }
                  }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-soft mt-1">
                  <span>Poor</span>
                  <span>{profile.healthProfile.sleepQuality}</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div>
                <label className="text-soft text-sm mb-3 block">Energy Levels (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={profile.healthProfile.energyLevels}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    healthProfile: { ...prev.healthProfile, energyLevels: parseInt(e.target.value) }
                  }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-soft mt-1">
                  <span>Low</span>
                  <span>{profile.healthProfile.energyLevels}</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-amber-400" />
          <p className="text-soft">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 pt-8"
        >
          <h1 className="text-4xl font-bold gold-glow mb-4">Advanced Personalization</h1>
          <p className="text-soft leading-relaxed text-lg mb-6">
            Fine-tune your mystical experience with detailed preferences and insights
          </p>

          {/* Completion Progress */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-soft text-sm">Profile Completion</span>
              <span className="text-soft text-sm">{completion}%</span>
            </div>
            <Progress value={completion} className="h-2" />
            {completion < 100 && (
              <p className="text-xs text-soft/60 mt-2">
                Complete your profile for more personalized insights
              </p>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs */}
          <div className="lg:col-span-1">
            <Card className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="space-y-2">
                  {tabs.map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      onClick={() => setActiveTab(tab.id)}
                      className="w-full justify-start"
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const currentTab = tabs.find(t => t.id === activeTab);
                    return currentTab ? (
                      <>
                        <currentTab.icon className="w-5 h-5" />
                        {currentTab.label}
                      </>
                    ) : null;
                  })()}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>

                {/* Save Button */}
                <div className="flex justify-end mt-8 pt-6 border-t border-white/10">
                  <Button
                    onClick={saveProfile}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 