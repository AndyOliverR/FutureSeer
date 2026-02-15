"use client"

import { useState, useEffect, useMemo } from 'react'
import { devLog } from '@/lib/devLogger';
import { AdditionalProfile } from '@/lib/types/profileTypes'
import { profileManager } from '@/lib/services/profileManager'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdditionalProfileForm } from './AdditionalProfileForm'
import { UserPlus, Edit, Trash2, Users, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ProfileListProps {
  userId: string
  onSelectProfile: (profile: AdditionalProfile) => void
  selectedProfileId?: string
  toolSlug?: string
  onSaveAndGenerate?: (profile: AdditionalProfile) => void
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  'spouse': 'Spouse/Partner',
  'child': 'Child',
  'parent': 'Parent',
  'sibling': 'Sibling',
  'business-partner': 'Business Partner',
  'friend': 'Friend',
  'other': 'Other'
}

export function ProfileList({ userId, onSelectProfile, selectedProfileId, toolSlug, onSaveAndGenerate }: ProfileListProps) {
  const { toast } = useToast()
  const [profiles, setProfiles] = useState<AdditionalProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<AdditionalProfile | null>(null)
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null)

  // Helper function to deduplicate profiles by ID
  const deduplicateProfiles = (profiles: AdditionalProfile[]): AdditionalProfile[] => {
    const profileMap = new Map<string, AdditionalProfile>()
    profiles.forEach((profile) => {
      if (profile.id && !profileMap.has(profile.id)) {
        profileMap.set(profile.id, profile)
      }
    })
    return Array.from(profileMap.values())
  }

  // Deduplicated profiles for rendering
  const uniqueProfiles = useMemo(() => {
    return deduplicateProfiles(profiles)
  }, [profiles])

  const loadProfiles = async () => {
    setIsLoading(true)
    try {
      const data = await profileManager.getAdditionalProfiles(userId)
      // Additional deduplication as safety measure (even though profileManager handles it)
      const uniqueProfiles = deduplicateProfiles(data)
      setProfiles(uniqueProfiles)
    } catch (error) {
      devLog.error('Error loading profiles:', error, 'ProfileList')
      toast({
        title: 'Error',
        description: 'Failed to load profiles. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProfiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const handleDelete = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) {
      return
    }

    setDeletingProfileId(profileId)
    try {
      await profileManager.deleteAdditionalProfile(userId, profileId)
      toast({
        title: 'Profile Deleted',
        description: 'The profile has been removed successfully.',
      })
      loadProfiles()
    } catch (error) {
      devLog.error('Error deleting profile:', error, 'ProfileList')
      toast({
        title: 'Error',
        description: 'Failed to delete profile. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setDeletingProfileId(null)
    }
  }

  const handleEdit = (profile: AdditionalProfile) => {
    setEditingProfile(profile)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    loadProfiles()
    setEditingProfile(null)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingProfile(null)
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    )
  }

  if (uniqueProfiles.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-200 shadow-lg rounded-3xl">
          <CardContent className="p-12 text-center">
            <Users className="w-20 h-20 text-slate-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No Profiles Added Yet</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
              Unlock compatibility insights! Add profiles of family members, partners, 
              or business associates to generate detailed compatibility reports.
            </p>
            <div className="inline-flex flex-col items-center gap-3">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg rounded-2xl shadow-lg"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Add Your First Profile
              </Button>
              <p className="text-sm text-slate-500">
                First comparison is free! Then support innovation with a tip.
              </p>
            </div>
          </CardContent>
        </Card>

        <AdditionalProfileForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          userId={userId}
          toolSlug={toolSlug}
          onSaveAndGenerate={onSaveAndGenerate}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-amber-200">Saved Profiles</h3>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white"
          size="sm"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {uniqueProfiles.map((profile) => (
          <Card
            key={profile.id}
            className={`bg-slate-900/50 border-amber-500/50 backdrop-blur-sm rounded-xl cursor-pointer transition-all hover:border-amber-500/80 ${
              selectedProfileId === profile.id ? 'ring-2 ring-amber-500/50' : ''
            }`}
            onClick={() => onSelectProfile(profile)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-amber-200 mb-1">{profile.name}</h4>
                  <Badge variant="outline" className="border-amber-400/40 text-amber-300 text-xs mb-2">
                    {RELATIONSHIP_LABELS[profile.relationshipType] || profile.relationshipType}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(profile)
                    }}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-amber-400"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(profile.id)
                    }}
                    disabled={deletingProfileId === profile.id}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                  >
                    {deletingProfileId === profile.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-1 text-sm text-slate-400">
                <p>Born: {new Date(profile.dateOfBirth).toLocaleDateString()}</p>
                {profile.timeOfBirth && <p>Time: {profile.timeOfBirth}</p>}
                {profile.birthPlace && <p>Place: {profile.birthPlace}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AdditionalProfileForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        editingProfile={editingProfile}
        userId={userId}
        toolSlug={toolSlug}
        onSaveAndGenerate={onSaveAndGenerate}
      />
    </div>
  )
}

