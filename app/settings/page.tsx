"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { updateSubscriptionStatus } from "@/lib/firebase"

export default function SettingsPage() {
  const { user, userProfile } = useAuth()
  const [darkMode, setDarkMode] = useState(true)
  const [language, setLanguage] = useState("english")
  const [voiceGuidance, setVoiceGuidance] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Generate invite code based on user ID
  const generateInviteCode = () => {
    if (!user?.uid) return ""
    return `FUTURESEER-${user.uid.slice(0, 8).toUpperCase()}`
  }

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim() || !user?.uid) return
    
    try {
      // Here you would typically send feedback to your backend
      console.log('Feedback submitted:', feedback)
      setFeedback("")
      setShowFeedback(false)
      alert("Thank you for your feedback! 🙏")
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  const handleInviteCodeSubmit = async () => {
    if (!inviteCode.trim() || !user?.uid) return
    
    try {
      // Here you would validate the invite code with your backend
      console.log('Invite code submitted:', inviteCode)
      setInviteCode("")
      setShowInviteModal(false)
      alert("Invite code applied successfully! ✨")
    } catch (error) {
      console.error('Error applying invite code:', error)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <Link href="/dashboard" className="text-soft hover:gold-glow mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-semibold gold-glow mb-4">Settings</h1>
          <p className="text-soft leading-relaxed">Customize your mystical experience</p>
        </div>

        {/* User Info */}
        {userProfile && (
          <div className="glass-card rounded-3xl p-8 mb-8">
            <h2 className="text-xl gold-glow mb-6">Account Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-soft font-medium mb-2">Subscription</h3>
                <div className={`px-3 py-1 rounded-full text-sm inline-block ${
                  userProfile.isSubscribed 
                    ? "bg-green-500/20 text-green-300" 
                    : "bg-yellow-500/20 text-yellow-300"
                }`}>
                  {userProfile.isSubscribed ? "Active" : "Trial"}
                </div>
              </div>
              <div>
                <h3 className="text-soft font-medium mb-2">Member Since</h3>
                <p className="text-soft/70 text-sm">
                  {new Date(userProfile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Appearance */}
          <div className="glass-card rounded-3xl p-8">
            <h2 className="text-xl gold-glow mb-6">Appearance</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-soft font-medium mb-1">Dark Mode</h3>
                <p className="text-soft/70 text-sm">Toggle between light and dark themes</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  darkMode ? "bg-yellow-400" : "bg-white/20"
                }`}
              >
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                    darkMode ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Language */}
          <div className="glass-card rounded-3xl p-8">
            <h2 className="text-xl gold-glow mb-6">Language</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-soft font-medium mb-1">Interface Language</h3>
                <p className="text-soft/70 text-sm">Choose your preferred language</p>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border border-white/20 rounded-2xl p-3 text-soft focus:outline-none focus:border-yellow-400"
              >
                <option value="english" className="bg-gray-800">
                  English
                </option>
                <option value="hindi" className="bg-gray-800">
                  हिंदी
                </option>
                <option value="sanskrit" className="bg-gray-800">
                  संस्कृत
                </option>
              </select>
            </div>
          </div>

          {/* Audio */}
          <div className="glass-card rounded-3xl p-8">
            <h2 className="text-xl gold-glow mb-6">Audio</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-soft font-medium mb-1">Voice Guidance</h3>
                <p className="text-soft/70 text-sm">Enable spoken predictions and guidance</p>
              </div>
              <button
                onClick={() => setVoiceGuidance(!voiceGuidance)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  voiceGuidance ? "bg-yellow-400" : "bg-white/20"
                }`}
              >
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                    voiceGuidance ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Invite System */}
          <div className="glass-card rounded-3xl p-8">
            <h2 className="text-xl gold-glow mb-6">Invite Friends</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-soft font-medium mb-2">Your Invite Code</h3>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={generateInviteCode()}
                    readOnly
                    className="flex-1 bg-transparent border border-white/20 rounded-2xl p-3 text-soft focus:outline-none"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(generateInviteCode())}
                    className="px-4 py-3 glass-card rounded-2xl text-soft hover:bg-white/10"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-soft font-medium mb-2">Apply Invite Code</h3>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 glass-card rounded-2xl text-soft hover:bg-white/10"
                >
                  Enter Code
                </button>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="glass-card rounded-3xl p-8">
            <h2 className="text-xl gold-glow mb-6">Feedback & Support</h2>
            <div className="space-y-4">
              <button
                onClick={() => setShowFeedback(true)}
                className="px-4 py-2 glass-card rounded-2xl text-soft hover:bg-white/10"
              >
                Send Feedback
              </button>
              <button className="px-4 py-2 glass-card rounded-2xl text-soft hover:bg-white/10">
                Contact Support
              </button>
            </div>
          </div>

          {/* Privacy */}
          <div className="glass-card rounded-3xl p-8">
            <h2 className="text-xl gold-glow mb-6">Privacy & Data</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-soft font-medium mb-2">Data Privacy</h3>
                <p className="text-soft/70 text-sm leading-relaxed mb-4">
                  Your personal information and readings are encrypted and stored securely. We never share your data
                  with third parties. All AI processing happens on secure servers with enterprise-grade protection.
                </p>
                <div className="flex space-x-4">
                  <button className="px-4 py-2 glass-card rounded-2xl text-soft text-sm hover:bg-white/10">
                    View Privacy Policy
                  </button>
                  <button className="px-4 py-2 glass-card rounded-2xl text-soft text-sm hover:bg-white/10">
                    Export My Data
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="glass-card rounded-3xl p-8">
            <h2 className="text-xl gold-glow mb-6">Account</h2>
            <div className="space-y-4">
              <Link href="/subscribe" className="w-full py-3 glass-card rounded-2xl text-soft hover:bg-white/10 text-left px-6 block">
                Manage Subscription
              </Link>
              <button className="w-full py-3 glass-card rounded-2xl text-soft hover:bg-white/10 text-left px-6">
                Change Password
              </button>
              <button className="w-full py-3 glass-card rounded-2xl text-red-400 hover:bg-red-500/10 text-left px-6">
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Modal */}
        {showFeedback && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass-card rounded-3xl p-8 max-w-md w-full">
              <h3 className="text-xl gold-glow mb-6">Send Feedback</h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts, suggestions, or report issues..."
                className="w-full h-32 bg-transparent border border-white/20 rounded-2xl p-4 text-soft placeholder-white/50 resize-none focus:outline-none focus:border-yellow-400 mb-6"
              />
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowFeedback(false)}
                  className="flex-1 py-3 glass-card rounded-2xl text-soft hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedback.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-2xl font-semibold disabled:opacity-50"
                >
                  Send Feedback
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invite Code Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass-card rounded-3xl p-8 max-w-md w-full">
              <h3 className="text-xl gold-glow mb-6">Enter Invite Code</h3>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter your invite code..."
                className="w-full bg-transparent border border-white/20 rounded-2xl p-4 text-soft placeholder-white/50 focus:outline-none focus:border-yellow-400 mb-6"
              />
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-3 glass-card rounded-2xl text-soft hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteCodeSubmit}
                  disabled={!inviteCode.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-2xl font-semibold disabled:opacity-50"
                >
                  Apply Code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
