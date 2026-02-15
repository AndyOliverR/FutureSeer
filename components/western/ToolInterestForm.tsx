"use client"

import { useState } from 'react'
import { devLog } from '@/lib/devLogger';
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, Send, Sparkles } from 'lucide-react'

interface ToolInterestFormProps {
  techniqueName: string;
  techniqueSlug: string;
  onSuccess?: () => void;
  variant?: 'light' | 'dark';
}

export function ToolInterestForm({ techniqueName, techniqueSlug, onSuccess, variant = 'dark' }: ToolInterestFormProps) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/tools/interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          techniqueName,
          techniqueSlug,
          email: email || user?.email || '',
          message: message.trim() || undefined,
          userId: user?.uid || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit suggestion')
      }

      toast({
        title: "Suggestion received!",
        description: `Thank you for suggesting ${techniqueName}. We'll notify you when this tool becomes available!`,
      })

      // Reset form
      setEmail('')
      setMessage('')
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      devLog.error('Error submitting interest:', error, 'ToolInterestForm')
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLight = variant === 'light'

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 mt-6 pt-6 border-t ${isLight ? 'border-amber-300' : 'border-amber-500/20'}`}>
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
          <Label htmlFor="interest-email" className={isLight ? 'text-amber-900 font-semibold' : 'text-amber-200 font-semibold'}>
            Suggest we implement this tool
          </Label>
        </div>
        <p className={`text-sm mb-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Let us know if you'd like to see {techniqueName} added as a full tool! We'll notify you when it becomes available. Your suggestion helps us prioritize which tools to build next.
        </p>
      </div>

      {!user && (
        <div className="space-y-2">
          <Label htmlFor="interest-email" className={isLight ? 'text-slate-700' : 'text-slate-300'}>
            Email (optional)
          </Label>
          <Input
            id="interest-email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={isLight ? 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-500' : 'bg-slate-800/50 border-slate-700/50 text-slate-200'}
            disabled={isSubmitting}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="interest-message" className={isLight ? 'text-slate-700' : 'text-slate-300'}>
          Additional Comments (optional)
        </Label>
        <Textarea
          id="interest-message"
          placeholder="Tell us what you'd like to see in this tool..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={isLight ? 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-500 min-h-[100px]' : 'bg-slate-800/50 border-slate-700/50 text-slate-200 min-h-[100px]'}
          disabled={isSubmitting}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Suggest this tool
          </>
        )}
      </Button>
    </form>
  )
}

