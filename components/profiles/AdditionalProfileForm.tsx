"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdditionalProfile, RelationshipType } from '@/lib/types/profileTypes'
import { profileManager } from '@/lib/services/profileManager'
import { useToast } from '@/hooks/use-toast'
import { Loader2, UserPlus, Save, Sparkles } from 'lucide-react'

interface AdditionalProfileFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingProfile?: AdditionalProfile | null
  userId: string
  toolSlug?: string
  onSaveAndGenerate?: (profile: AdditionalProfile) => void
}

const RELATIONSHIP_TYPES: { value: RelationshipType; label: string }[] = [
  { value: 'spouse', label: 'Spouse/Partner' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'business-partner', label: 'Business Partner' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' }
]

export function AdditionalProfileForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingProfile,
  userId,
  toolSlug,
  onSaveAndGenerate
}: AdditionalProfileFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    birthPlace: '',
    currentLocation: '',
    relationshipType: 'other' as RelationshipType,
    relationshipNotes: '',
    notes: ''
  })

  useEffect(() => {
    if (editingProfile) {
      setFormData({
        name: editingProfile.name || '',
        dateOfBirth: editingProfile.dateOfBirth || '',
        timeOfBirth: editingProfile.timeOfBirth || '',
        birthPlace: editingProfile.birthPlace || '',
        currentLocation: editingProfile.currentLocation || '',
        relationshipType: editingProfile.relationshipType || 'other',
        relationshipNotes: editingProfile.relationshipNotes || '',
        notes: editingProfile.notes || ''
      })
    } else {
      setFormData({
        name: '',
        dateOfBirth: '',
        timeOfBirth: '',
        birthPlace: '',
        currentLocation: '',
        relationshipType: 'other',
        relationshipNotes: '',
        notes: ''
      })
    }
  }, [editingProfile, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.dateOfBirth) {
      toast({
        title: 'Validation Error',
        description: 'Name and Date of Birth are required.',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      let savedProfile: AdditionalProfile
      
      if (editingProfile) {
        const updated = await profileManager.updateAdditionalProfile(userId, editingProfile.id, formData)
        if (!updated) {
          throw new Error('Failed to update profile')
        }
        savedProfile = updated
        toast({
          title: 'Profile Updated',
          description: 'The profile has been updated successfully.',
        })
      } else {
        savedProfile = await profileManager.createAdditionalProfile(userId, formData)
        toast({
          title: 'Profile Created',
          description: 'The profile has been added successfully.',
        })
      }
      
      onSuccess()
      
      // If onSaveAndGenerate is provided and we have required data, trigger generation
      if (onSaveAndGenerate && savedProfile && !editingProfile) {
        // Check if we have minimum required data for compatibility analysis
        if (savedProfile.dateOfBirth) {
          // Close first, then trigger generation (async)
          onClose()
          // Use requestAnimationFrame to ensure DOM updates are complete
          requestAnimationFrame(() => {
            setTimeout(() => {
              onSaveAndGenerate(savedProfile)
            }, 100)
          })
          return
        }
      }
      
      onClose()
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/95 border-amber-500/50 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-amber-200 flex items-center gap-2">
            {editingProfile ? (
              <>
                <UserPlus className="w-5 h-5" />
                Edit Profile
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Add Additional Profile
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Add information about someone you want to compare compatibility with.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
                className="bg-slate-800/50 border-amber-500/30 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-slate-300">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="bg-slate-800/50 border-amber-500/30 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeOfBirth" className="text-slate-300">Time of Birth</Label>
              <Input
                id="timeOfBirth"
                type="time"
                value={formData.timeOfBirth}
                onChange={(e) => setFormData({ ...formData, timeOfBirth: e.target.value })}
                className="bg-slate-800/50 border-amber-500/30 text-white"
                placeholder="HH:mm"
              />
              <p className="text-xs text-slate-500">Optional - Required for some astrological tools</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationshipType" className="text-slate-300">Relationship Type</Label>
              <Select
                value={formData.relationshipType}
                onValueChange={(value) => setFormData({ ...formData, relationshipType: value as RelationshipType })}
              >
                <SelectTrigger className="bg-slate-800/50 border-amber-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-amber-500/30">
                  {RELATIONSHIP_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-white">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthPlace" className="text-slate-300">Birth Place</Label>
            <Input
              id="birthPlace"
              value={formData.birthPlace}
              onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
              placeholder="City, Country"
              className="bg-slate-800/50 border-amber-500/30 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentLocation" className="text-slate-300">Current Location</Label>
            <Input
              id="currentLocation"
              value={formData.currentLocation}
              onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
              placeholder="City, Country"
              className="bg-slate-800/50 border-amber-500/30 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationshipNotes" className="text-slate-300">Relationship Notes</Label>
            <Textarea
              id="relationshipNotes"
              value={formData.relationshipNotes}
              onChange={(e) => setFormData({ ...formData, relationshipNotes: e.target.value })}
              placeholder="Any additional context about this relationship..."
              className="bg-slate-800/50 border-amber-500/30 text-white min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-300">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any other relevant information..."
              className="bg-slate-800/50 border-amber-500/30 text-white min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-amber-500/30 text-slate-300 hover:bg-slate-800"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {!editingProfile && onSaveAndGenerate && toolSlug ? (
              <Button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Save and Generate
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingProfile ? 'Update Profile' : 'Add Profile'}
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

