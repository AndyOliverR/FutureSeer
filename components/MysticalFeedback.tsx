"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Sparkles, Camera, Send, X, Star, MessageCircle, Lightbulb, Bug, Zap, Moon, Sun, Gem, Wand, Eye, Heart } from 'lucide-react'
import html2canvas from 'html2canvas'

interface FeedbackData {
  type: 'suggestion' | 'bug' | 'feature' | 'general'
  title: string
  description: string
  userAgent: string
  url: string
  timestamp: string
  screenshot?: string
}

// Floating particles component
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${5 + Math.random() * 6}s`,
          }}
        >
          <div className="w-1 h-1 bg-gradient-to-r from-amber-400 to-purple-500 rounded-full opacity-40 animate-pulse" style={{ animationDuration: '4s' }} />
        </div>
      ))}
    </div>
  )
}

// Mystical background component
function MysticalBackground() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-amber-900/20 rounded-lg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(251,191,36,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.1),transparent_50%)]" />
    </div>
  )
}

export function MysticalFeedback() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug' | 'feature' | 'general'>('suggestion')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const { toast } = useToast()
  const buttonRef = useRef<HTMLDivElement>(null)

  // Handle SSR - only render on client
  useEffect(() => {
    setIsMounted(true)
    console.log('✨ MysticalFeedback mounted on client')
  }, [])

  // Add floating animation to the trigger button
  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.style.animation = 'float 3s ease-in-out infinite'
    }
  }, [])

  const feedbackTypes = [
    { 
      type: 'suggestion', 
      icon: <Lightbulb className="w-5 h-5" />, 
      label: 'Suggestion', 
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      glowColor: 'shadow-blue-500/50'
    },
    { 
      type: 'bug', 
      icon: <Bug className="w-5 h-5" />, 
      label: 'Bug Report', 
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-gradient-to-r from-red-500/20 to-pink-500/20',
      borderColor: 'border-red-500/30',
      glowColor: 'shadow-red-500/50'
    },
    { 
      type: 'feature', 
      icon: <Star className="w-5 h-5" />, 
      label: 'Feature Request', 
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-gradient-to-r from-purple-500/20 to-violet-500/20',
      borderColor: 'border-purple-500/30',
      glowColor: 'shadow-purple-500/50'
    },
    { 
      type: 'general', 
      icon: <MessageCircle className="w-5 h-5" />, 
      label: 'General', 
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20',
      borderColor: 'border-emerald-500/30',
      glowColor: 'shadow-emerald-500/50'
    }
  ]

  const captureScreenshot = async () => {
    setIsCapturing(true)
    try {
      // Add a mystical flash effect
      const flash = document.createElement('div')
      flash.className = 'fixed inset-0 bg-white/20 backdrop-blur-sm z-[999999] pointer-events-none'
      document.body.appendChild(flash)
      
      setTimeout(() => {
        document.body.removeChild(flash)
      }, 300)

      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 1,
        logging: false,
        width: window.innerWidth,
        height: window.innerHeight
      })
      
      const screenshotData = canvas.toDataURL('image/png')
      setScreenshot(screenshotData)
      
      toast({
        title: '✨ Screenshot Captured!',
        description: 'The mystical energies have been preserved in your feedback.',
      })
    } catch (error) {
      console.error('Screenshot capture failed:', error)
      toast({
        title: '🔮 Screenshot Failed',
        description: 'The mystical forces prevented the capture. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsCapturing(false)
    }
  }

  const removeScreenshot = () => {
    setScreenshot(null)
  }

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: '🔮 Missing Information',
        description: 'Please provide both title and description to complete the mystical ritual',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const feedbackData: FeedbackData = {
        type: feedbackType,
        title: title.trim(),
        description: description.trim(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        screenshot: screenshot || undefined
      }

      // Submit feedback to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      toast({
        title: '🌟 Feedback Sent to the Cosmos!',
        description: 'Your mystical insights have been received. The universe thanks you!',
      })

      // Reset form
      setTitle('')
      setDescription('')
      setFeedbackType('suggestion')
      setScreenshot(null)
      setIsOpen(false)

    } catch (error) {
      console.error('Feedback submission failed:', error)
      toast({
        title: '🌙 Submission Failed',
        description: 'The mystical forces are blocking the transmission. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setTitle('')
    setDescription('')
    setFeedbackType('suggestion')
    setScreenshot(null)
  }

  // Don't render anything until mounted on client
  if (!isMounted) {
    return null
  }

  return (
    <>


      {/* Floating Mystical Button */}
      <div className="fixed bottom-6 left-6 z-[99999] pointer-events-auto">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <div 
              ref={buttonRef}
              className="cursor-pointer group relative"
            >
              {/* Main button with cosmic effects */}
              <div className="relative">
                                 <div className="text-5xl hover:scale-110 transition-all duration-500 animate-mystical-glow relative">
                   <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-purple-500 to-pink-500 rounded-full blur-lg opacity-30 scale-150" />
                   <div className="relative z-10">✨</div>
                 </div>
                
                                 {/* Orbiting sparkles */}
                 <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
                   <div className="absolute -top-3 -right-3 text-lg animate-sparkle" style={{ animationDelay: '0s' }}>⭐</div>
                   <div className="absolute -bottom-3 -left-3 text-lg animate-sparkle" style={{ animationDelay: '2.5s' }}>🌟</div>
                   <div className="absolute -top-3 -left-3 text-lg animate-sparkle" style={{ animationDelay: '5s' }}>💫</div>
                 </div>
                
                                 {/* Cosmic pulse ring */}
                 <div className="absolute inset-0 rounded-full animate-cosmic-pulse" style={{ animationDuration: '4s' }} />
                 <div className="absolute inset-0 rounded-full animate-cosmic-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-purple-500/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 blur-xl" />
            </div>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 bg-transparent p-0">
            <div className="relative bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-amber-900/90 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden">
              {/* Mystical background */}
              <MysticalBackground />
              
              {/* Floating particles */}
              <FloatingParticles />
              
              {/* Content */}
              <div className="relative z-10 p-8">
                <DialogHeader className="mb-8">
                  <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    <div className="relative">
                      <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-purple-500 rounded-full blur-lg opacity-50" />
                    </div>
                    Mystical Feedback Portal
                    <div className="ml-auto flex gap-2">
                      <Gem className="w-6 h-6 text-purple-400 animate-bounce" style={{ animationDelay: '0s' }} />
                      <Wand className="w-6 h-6 text-amber-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
                      <Eye className="w-6 h-6 text-pink-400 animate-bounce" style={{ animationDelay: '1s' }} />
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-8">
                  {/* Feedback Type Selection */}
                  <div>
                    <label className="text-lg font-semibold text-amber-200 mb-4 block flex items-center gap-2">
                      <Moon className="w-5 h-5" />
                      What type of mystical insight are you sharing?
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {feedbackTypes.map((type) => (
                        <Button
                          key={type.type}
                          variant="ghost"
                          className={`relative h-16 transition-all duration-300 ${
                            feedbackType === type.type 
                              ? `${type.bgColor} ${type.borderColor} border-2 ${type.glowColor} shadow-lg scale-105` 
                              : 'bg-slate-800/50 border border-slate-600/30 hover:bg-slate-700/50'
                          } group`}
                          onClick={() => setFeedbackType(type.type as 'suggestion' | 'bug' | 'feature' | 'general')}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-r ${type.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg`} />
                          <div className="relative flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${feedbackType === type.type ? 'bg-white/10' : 'bg-slate-700/50'}`}>
                              {type.icon}
                            </div>
                            <span className="font-medium text-slate-200">{type.label}</span>
                          </div>
                          {feedbackType === type.type && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-amber-400 to-purple-500 rounded-full animate-pulse" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Title Input */}
                  <div className="relative">
                    <label className="text-lg font-semibold text-amber-200 mb-3 block flex items-center gap-2">
                      <Sun className="w-5 h-5" />
                      Brief Title *
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="Summarize your mystical insight in a few words..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                        className="bg-slate-800/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-purple-500/50 focus:ring-purple-500/20 h-12 text-lg"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-purple-500 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Description Input */}
                  <div className="relative">
                    <label className="text-lg font-semibold text-amber-200 mb-3 block flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Detailed Description *
                    </label>
                    <div className="relative">
                      <Textarea
                        placeholder="Share your mystical thoughts, cosmic suggestions, or report interdimensional issues..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        maxLength={1000}
                        className="bg-slate-800/50 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-purple-500/50 focus:ring-purple-500/20 resize-none"
                      />
                      <div className="absolute bottom-3 right-3">
                        <div className="text-sm text-slate-400 bg-slate-800/80 px-2 py-1 rounded-full">
                          {description.length}/1000
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Screenshot Section */}
                  <div className="relative">
                    <label className="text-lg font-semibold text-amber-200 mb-3 block flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Mystical Snapshot (Optional)
                    </label>
                    <div className="space-y-4">
                      {!screenshot ? (
                        <Button
                          variant="outline"
                          onClick={captureScreenshot}
                          disabled={isCapturing}
                          className="w-full h-14 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/50 text-slate-200 hover:from-slate-700/50 hover:to-slate-600/50 hover:border-purple-500/50 transition-all duration-300 group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Camera className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                              {isCapturing && (
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-purple-500 rounded-full animate-ping" />
                              )}
                            </div>
                            <span className="text-lg">
                              {isCapturing ? 'Capturing Mystical Energy...' : 'Capture Current Page Screenshot'}
                            </span>
                          </div>
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div className="relative group">
                            <img 
                              src={screenshot} 
                              alt="Screenshot" 
                              className="w-full rounded-xl border-2 border-purple-500/30 max-h-48 object-cover shadow-lg"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={removeScreenshot}
                              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-amber-300 text-center">
                            ✨ Mystical snapshot captured successfully
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1 h-14 bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !title.trim() || !description.trim()}
                      className="flex-1 h-14 bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500 hover:from-amber-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center gap-3">
                        <Send className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        <span>{isSubmitting ? 'Sending to the Cosmos...' : 'Send Mystical Feedback'}</span>
                      </div>
                    </Button>
                  </div>

                  {/* Info Text */}
                  <div className="text-center py-4">
                    <div className="text-sm text-amber-300/80 font-medium">
                      Your feedback helps us channel the mystical energies for everyone ✨
                    </div>
                    <div className="flex justify-center gap-2 mt-2">
                      <div className="w-1 h-1 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                      <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <div className="w-1 h-1 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
} 