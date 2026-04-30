"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Save, RefreshCw, Target, Settings } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { devLog } from "@/lib/devLogger"

type AdvancedProfile = {
  lifeGoals: string[]
  currentChallenges: string[]
  relationshipStatus: string
  careerStage: string
  preferredReadingStyle: "detailed" | "concise" | "visual"
  preferredTimeOfDay: "morning" | "afternoon" | "evening" | "night"
  notificationPreferences: {
    dailyInsights: boolean
    weeklyReports: boolean
    newFeatures: boolean
    communityUpdates: boolean
    personalizedRemedies: boolean
  }
}

const lifeGoals = [
  "Career Success", "Financial Freedom", "Personal Growth", "Spiritual Development",
  "Healthy Relationships", "Physical Health", "Mental Wellness", "Creative Expression",
  "Travel & Adventure", "Community Service", "Learning & Education", "Family",
]

const defaultProfile: AdvancedProfile = {
  lifeGoals: [],
  currentChallenges: [],
  relationshipStatus: "",
  careerStage: "",
  preferredReadingStyle: "detailed",
  preferredTimeOfDay: "morning",
  notificationPreferences: {
    dailyInsights: true,
    weeklyReports: true,
    newFeatures: true,
    communityUpdates: false,
    personalizedRemedies: true,
  },
}

export default function AdvancedPersonalizationPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<AdvancedProfile>(defaultProfile)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!user?.uid) return
    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/personalization/profile?userId=${user.uid}`)
        if (!response.ok) return
        const data = await response.json()
        const incoming = (data?.advancedProfile ?? {}) as Partial<AdvancedProfile>
        setProfile({
          ...defaultProfile,
          ...incoming,
          notificationPreferences: {
            ...defaultProfile.notificationPreferences,
            ...(incoming.notificationPreferences ?? {}),
          },
        })
      } catch (error) {
        devLog.error("Error loading profile:", error, "page")
      } finally {
        setIsLoading(false)
      }
    }
    void loadProfile()
  }, [user?.uid])

  const saveProfile = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/personalization/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid, advancedProfile: profile }),
      })
      if (!response.ok) throw new Error("Failed to save profile")
      toast({
        title: "Saved",
        description: "Advanced personalization updated.",
      })
    } catch {
      toast({
        title: "Save failed",
        description: "Could not save your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-amber-400" />
          <p className="text-soft">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold gold-glow mb-2">Advanced Personalization</h1>
        </motion.div>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Goals & Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-soft text-sm mb-3 block">Life Goals</label>
              <div className="grid grid-cols-2 gap-2">
                {lifeGoals.map((goal) => (
                  <Button
                    key={goal}
                    variant={profile.lifeGoals.includes(goal) ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setProfile((prev) => ({
                        ...prev,
                        lifeGoals: prev.lifeGoals.includes(goal)
                          ? prev.lifeGoals.filter((g) => g !== goal)
                          : [...prev.lifeGoals, goal],
                      }))
                    }
                    className="justify-start"
                  >
                    {goal}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-soft text-sm mb-3 block">Current Challenges</label>
              <Textarea
                value={profile.currentChallenges.join(", ")}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    currentChallenges: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  }))
                }
                rows={3}
                className="bg-white/5 border-white/20 text-soft"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-soft text-sm mb-3 block">Relationship Status</label>
                <Input
                  value={profile.relationshipStatus}
                  onChange={(e) => setProfile((prev) => ({ ...prev, relationshipStatus: e.target.value }))}
                  className="bg-white/5 border-white/20 text-soft"
                />
              </div>
              <div>
                <label className="text-soft text-sm mb-3 block">Career Stage</label>
                <Input
                  value={profile.careerStage}
                  onChange={(e) => setProfile((prev) => ({ ...prev, careerStage: e.target.value }))}
                  className="bg-white/5 border-white/20 text-soft"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-soft text-sm mb-3 block">Preferred Reading Style</label>
              <div className="grid grid-cols-3 gap-2">
                {["detailed", "concise", "visual"].map((style) => (
                  <Button
                    key={style}
                    variant={profile.preferredReadingStyle === style ? "default" : "outline"}
                    onClick={() => setProfile((prev) => ({ ...prev, preferredReadingStyle: style as AdvancedProfile["preferredReadingStyle"] }))}
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
                {["morning", "afternoon", "evening", "night"].map((time) => (
                  <Button
                    key={time}
                    variant={profile.preferredTimeOfDay === time ? "default" : "outline"}
                    onClick={() => setProfile((prev) => ({ ...prev, preferredTimeOfDay: time as AdvancedProfile["preferredTimeOfDay"] }))}
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
                    <span className="text-soft capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) =>
                        setProfile((prev) => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            [key]: checked,
                          },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
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
      </div>
    </div>
  )
}