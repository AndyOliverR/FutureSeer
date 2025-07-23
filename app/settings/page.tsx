"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useSettings } from "@/hooks/useSettings"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, LogOut, Trash2, CheckCircle, XCircle, Moon, Sun, Bell, Globe, Mic, Mail } from "lucide-react"

export default function SettingsPage() {
  const {
    settings,
    loading,
    error,
    success,
    isEditingProfile,
    profileData,
    userProfile,
    trialStatus,
    updateSetting,
    updateProfile,
    clearMessages,
    setIsEditingProfile,
    setProfileData,
  } = useSettings()

  const [showDelete, setShowDelete] = useState(false)

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden" style={{ backgroundImage: "url('/images/starfield-bg.png')" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/40" />
      <div className="relative z-10 p-4 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 pt-8"
        >
          <Link href="/dashboard" className="text-amber-200 hover:text-amber-300 mb-4 inline-block transition-all duration-300">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-4">Settings</h1>
          <p className="text-slate-300 font-serif leading-relaxed">Manage your preferences, profile, and account</p>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl text-green-300 text-center font-serif flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" /> {success}
              <button onClick={clearMessages} className="ml-2 text-green-200 hover:text-green-100">✕</button>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 text-center font-serif flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" /> {error}
              <button onClick={clearMessages} className="ml-2 text-red-200 hover:text-red-100">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Card */}
        <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 mb-8 card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-200 font-serif text-xl">
              <User className="w-6 h-6" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingProfile ? (
              <form
                className="space-y-4"
                onSubmit={e => {
                  e.preventDefault()
                  updateProfile(profileData)
                }}
              >
                <div>
                  <label className="block text-slate-300 font-serif mb-1">Display Name</label>
                  <Input
                    value={profileData.displayName}
                    onChange={e => setProfileData({ ...profileData, displayName: e.target.value })}
                    className="input-glow"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-serif mb-1">Birth Date</label>
                    <Input
                      type="date"
                      value={profileData.birthDate}
                      onChange={e => setProfileData({ ...profileData, birthDate: e.target.value })}
                      className="input-glow"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-serif mb-1">Birth Time</label>
                    <Input
                      type="time"
                      value={profileData.birthTime}
                      onChange={e => setProfileData({ ...profileData, birthTime: e.target.value })}
                      className="input-glow"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-300 font-serif mb-1">Birth Place</label>
                    <Input
                      value={profileData.birthPlace}
                      onChange={e => setProfileData({ ...profileData, birthPlace: e.target.value })}
                      className="input-glow"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <Button type="submit" className="bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 button-glow">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)} className="border-slate-600 text-slate-300">Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-serif">Name:</span>
                  <span className="text-amber-100 font-serif">{userProfile?.displayName || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-serif">Birth Date:</span>
                  <span className="text-amber-100 font-serif">{userProfile?.birthDate || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-serif">Birth Time:</span>
                  <span className="text-amber-100 font-serif">{userProfile?.birthTime || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-serif">Birth Place:</span>
                  <span className="text-amber-100 font-serif">{userProfile?.birthPlace || "-"}</span>
                </div>
                <Button onClick={() => setIsEditingProfile(true)} className="mt-4 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 button-glow">Edit Profile</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 mb-8 card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-200 font-serif text-xl">
              <Moon className="w-6 h-6" /> Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-300" />
                  <span className="text-slate-300 font-serif">Dark Mode</span>
                </div>
                <Switch checked={settings.darkMode} onCheckedChange={v => updateSetting('darkMode', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-300" />
                  <span className="text-slate-300 font-serif">Notifications</span>
                </div>
                <Switch checked={settings.notifications} onCheckedChange={v => updateSetting('notifications', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-yellow-200" />
                  <span className="text-slate-300 font-serif">Email Updates</span>
                </div>
                <Switch checked={settings.emailUpdates} onCheckedChange={v => updateSetting('emailUpdates', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-blue-300" />
                  <span className="text-slate-300 font-serif">Voice Guidance</span>
                </div>
                <Switch checked={settings.voiceGuidance} onCheckedChange={v => updateSetting('voiceGuidance', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-300" />
                  <span className="text-slate-300 font-serif">Language</span>
                </div>
                <select
                  value={settings.language}
                  onChange={e => updateSetting('language', e.target.value)}
                  className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-amber-100 font-serif focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                >
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trial/Subscription Status */}
        <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 mb-8 card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-200 font-serif text-xl">
              <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900">Trial</Badge>
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trialStatus ? (
              <div className="flex items-center gap-4">
                {trialStatus.isActive ? (
                  <span className="text-green-400 font-serif">Active ({trialStatus.daysLeft} days left)</span>
                ) : (
                  <span className="text-red-400 font-serif">Expired</span>
                )}
                <span className="text-slate-400 font-serif">Upgrade coming soon</span>
              </div>
            ) : (
              <span className="text-slate-400 font-serif">No trial info</span>
            )}
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="backdrop-blur-md bg-slate-900/40 border border-slate-700/50 mb-8 card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-200 font-serif text-xl">
              <LogOut className="w-6 h-6" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button variant="outline" className="border-slate-600 text-slate-300 flex items-center gap-2 justify-center">
                <LogOut className="w-5 h-5" /> Sign Out
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-2 justify-center"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="w-5 h-5" /> Delete Account
              </Button>
              <AnimatePresence>
                {showDelete && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-center font-serif"
                  >
                    <div className="mb-2">Are you sure you want to delete your account? This action cannot be undone.</div>
                    <div className="flex gap-4 justify-center mt-4">
                      <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => setShowDelete(false)}>Cancel</Button>
                      <Button variant="destructive" className="bg-red-600 text-white" disabled>Delete (Coming Soon)</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
