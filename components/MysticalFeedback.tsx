"use client"

import { useState, useEffect } from 'react'
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
  userAgent: string
  url: string
  timestamp: string
  screenshot?: string
}

export function MysticalFeedback() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug' | 'feature' | 'general'>('suggestion')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  // Handle SSR - only render on client
  useEffect(() => {
    setIsMounted(true)
    console.log('✨ MysticalFeedback mounted on client')
  }, [])

  const feedbackTypes = [
    { type: 'suggestion', icon: <Lightbulb className="w-4 h-4" />, label: 'Suggestion', color: 'bg-blue-500' },
    { type: 'bug', icon: <Bug className="w-4 h-4" />, label: 'Bug Report', color: 'bg-red-500' },
    { type: 'feature', icon: <Star className="w-4 h-4" />, label: 'Feature Request', color: 'bg-purple-500' },
    { type: 'general', icon: <MessageCircle className="w-4 h-4" />, label: 'General', color: 'bg-gray-500' }
  ]

  const captureScreenshot = async () => {
    try {
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
        title: 'Screenshot Captured! 📸',
        description: 'Current page screenshot has been added to your feedback.',
      })
    } catch (error) {
      console.error('Screenshot capture failed:', error)
      toast({
        title: 'Screenshot Failed',
        description: 'Could not capture screenshot. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const removeScreenshot = () => {
    setScreenshot(null)
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
        title: 'Feedback Sent! 🌟',
        description: 'Thank you for your mystical insights. We\'ll review it carefully.',
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
    setFeedbackType('suggestion')
    setScreenshot(null)
  }

  // Don't render anything until mounted on client
  if (!isMounted) {
    return null
  }

  return (
    <>
      {/* Floating Mystical Button - Pure ✨ Emoji Only */}
      <div className="fixed bottom-6 left-6 z-[99999] pointer-events-auto">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <div className="cursor-pointer group">
              <span className="text-4xl hover:scale-110 transition-transform duration-300">✨</span>
            </div>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-6 h-6 text-amber-500" />
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
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Screenshot (Optional)
                </label>
                <div className="space-y-3">
                  {!screenshot ? (
                    <Button
                      variant="outline"
                      onClick={captureScreenshot}
                      className="w-full"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Capture Current Page Screenshot
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <img 
                          src={screenshot} 
                          alt="Screenshot" 
                          className="w-full rounded-lg border border-gray-200 max-h-48 object-cover"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={removeScreenshot}
                          className="absolute top-2 right-2"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Screenshot captured successfully. Click X to remove.
                      </p>
                    </div>
                  )}
                </div>
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
                  className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
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