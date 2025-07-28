"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Sparkles, Camera, Send, X, Star, MessageCircle, Lightbulb, Bug } from 'lucide-react'
import html2canvas from 'html2canvas'

interface FeedbackData {
  type: 'suggestion' | 'bug' | 'feature' | 'general'
  title: string
  description: string
  screenshot: string | null
  userAgent: string
  url: string
  timestamp: string
}

export function MysticalFeedback() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug' | 'feature' | 'general'>('suggestion')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const dialogRef = useRef<HTMLDivElement>(null)

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('✨ MysticalFeedback component mounted')
  }, [])

  const feedbackTypes = [
    { type: 'suggestion', icon: <Lightbulb className="w-4 h-4" />, label: 'Suggestion', color: 'bg-blue-500' },
    { type: 'bug', icon: <Bug className="w-4 h-4" />, label: 'Bug Report', color: 'bg-red-500' },
    { type: 'feature', icon: <Star className="w-4 h-4" />, label: 'Feature Request', color: 'bg-purple-500' },
    { type: 'general', icon: <MessageCircle className="w-4 h-4" />, label: 'General', color: 'bg-gray-500' }
  ]

  const captureScreenshot = async () => {
    if (!dialogRef.current) return

    setIsCapturing(true)
    try {
      // Hide the feedback dialog temporarily to avoid capturing it
      const dialog = dialogRef.current
      const originalDisplay = dialog.style.display
      dialog.style.display = 'none'

      // Capture the entire page
      const canvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        scale: 1,
        backgroundColor: null,
        logging: false,
        width: window.innerWidth,
        height: window.innerHeight
      })

      // Restore dialog visibility
      dialog.style.display = originalDisplay

      const screenshotData = canvas.toDataURL('image/png')
      setScreenshot(screenshotData)

      toast({
        title: 'Screenshot Captured! ✨',
        description: 'Current screen has been captured for your feedback',
      })
    } catch (error) {
      console.error('Screenshot capture failed:', error)
      toast({
        title: 'Screenshot Failed',
        description: 'Could not capture screenshot. You can still submit feedback.',
        variant: 'destructive'
      })
    } finally {
      setIsCapturing(false)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both title and description',
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
        screenshot,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
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

      const result = await response.json()

      toast({
        title: 'Feedback Sent! 🌟',
        description: 'Thank you for your mystical insights. We\'ll review it carefully.',
      })

      // Reset form
      setTitle('')
      setDescription('')
      setScreenshot(null)
      setFeedbackType('suggestion')
      setIsOpen(false)

    } catch (error) {
      console.error('Feedback submission failed:', error)
      toast({
        title: 'Submission Failed',
        description: 'Could not send feedback. Please try again.',
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
    setScreenshot(null)
    setFeedbackType('suggestion')
  }

  return (
    <>
      {/* Floating Mystical Button */}
      <div className="fixed bottom-6 left-6 z-[9999]">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="relative group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full w-16 h-16 p-0 border-2 border-white/20"
            >
              <Sparkles className="w-7 h-7 group-hover:animate-pulse" />
              
              {/* Mystical glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30 animate-ping" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-40 animate-pulse" />
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg">
                Share Mystical Feedback ✨
              </div>
            </Button>
          </DialogTrigger>

          <DialogContent ref={dialogRef} className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-6 h-6 text-purple-500" />
                Mystical Feedback Portal
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Feedback Type Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  What type of feedback are you sharing?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {feedbackTypes.map((type) => (
                    <Button
                      key={type.type}
                      variant={feedbackType === type.type ? "default" : "outline"}
                      className={`justify-start ${feedbackType === type.type ? type.color : ''}`}
                      onClick={() => setFeedbackType(type.type as 'suggestion' | 'bug' | 'feature' | 'general')}
                    >
                      {type.icon}
                      <span className="ml-2">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Brief Title *
                </label>
                <Input
                  placeholder="Summarize your feedback in a few words..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Detailed Description *
                </label>
                <Textarea
                  placeholder="Share your thoughts, suggestions, or report issues..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {description.length}/1000 characters
                </div>
              </div>

              {/* Screenshot Section */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Current Screen (Optional)
                </label>
                
                {screenshot ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={screenshot}
                        alt="Screenshot"
                        className="w-full rounded-lg border border-gray-200 max-h-48 object-cover"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => setScreenshot(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Screenshot captured from current page
                    </Badge>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={captureScreenshot}
                    disabled={isCapturing}
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {isCapturing ? 'Capturing...' : 'Capture Current Screen'}
                  </Button>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !title.trim() || !description.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </Button>
              </div>

              {/* Info Text */}
              <div className="text-xs text-gray-500 text-center">
                Your feedback helps us improve the mystical experience for everyone ✨
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
} 