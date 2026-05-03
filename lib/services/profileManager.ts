// Profile Management Service for Additional Profiles
// Handles CRUD operations for user's additional profiles (family, business partners, etc.)

import { AdditionalProfile } from '@/lib/types/profileTypes'
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from '@/lib/firebase'
import {
  userSubcollectionAdd,
  userSubcollectionListDocuments,
  userSubdocDelete,
  userSubdocGet,
  userSubdocUpdate,
} from '@/lib/userSubcollectionFirestore'

const STORAGE_KEY = 'futureseer_additional_profiles'

class ProfileManager {
  // Helper method to deduplicate profiles by ID
  private deduplicateProfiles(profiles: AdditionalProfile[]): AdditionalProfile[] {
    const profileMap = new Map<string, AdditionalProfile>()
    profiles.forEach((profile) => {
      if (profile.id && !profileMap.has(profile.id)) {
        profileMap.set(profile.id, profile)
      }
    })
    return Array.from(profileMap.values())
  }

  // Get all additional profiles for a user
  async getAdditionalProfiles(userId: string): Promise<AdditionalProfile[]> {
    try {
      // Try localStorage first for quick access
      const localData = this.getLocalProfiles(userId)
      if (localData && localData.length > 0) {
        // Deduplicate local data before returning
        const deduplicated = this.deduplicateProfiles(localData)
        return deduplicated.sort((a, b) => b.updatedAt - a.updatedAt)
      }

      // Fetch from Firebase
      if (!getFirebaseDB()) {
        devLog.warn('Firebase not initialized, using localStorage only', 'profileManager')
        const deduplicated = this.deduplicateProfiles(localData || [])
        return deduplicated.sort((a, b) => b.updatedAt - a.updatedAt)
      }

      const rows = await userSubcollectionListDocuments(userId, 'additionalProfiles')
      const profiles: AdditionalProfile[] = rows.map((row) => ({
        ...row,
        id: row.id,
      })) as AdditionalProfile[]

      // Deduplicate before caching
      const deduplicated = this.deduplicateProfiles(profiles)
      
      // Cache in localStorage
      this.saveLocalProfiles(userId, deduplicated)
      
      return deduplicated.sort((a, b) => b.updatedAt - a.updatedAt)
    } catch (error) {
      devLog.error('Error fetching additional profiles:', error, 'profileManager')
      // Fallback to localStorage
      const localData = this.getLocalProfiles(userId) || []
      const deduplicated = this.deduplicateProfiles(localData)
      return deduplicated.sort((a, b) => b.updatedAt - a.updatedAt)
    }
  }

  // Get a specific profile
  async getAdditionalProfile(userId: string, profileId: string): Promise<AdditionalProfile | null> {
    try {
      const profiles = await this.getAdditionalProfiles(userId)
      return profiles.find(p => p.id === profileId) || null
    } catch (error) {
      devLog.error('Error fetching profile:', error, 'profileManager')
      return null
    }
  }

  // Create a new additional profile
  async createAdditionalProfile(userId: string, profileData: Omit<AdditionalProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<AdditionalProfile> {
    const now = Date.now()
    const newProfile: Omit<AdditionalProfile, 'id'> = {
      userId,
      ...profileData,
      createdAt: now,
      updatedAt: now
    }

    try {
      if (getFirebaseDB()) {
        const newId = await userSubcollectionAdd(userId, 'additionalProfiles', newProfile as unknown as Record<string, unknown>)

        const createdProfile: AdditionalProfile = {
          id: newId,
          ...newProfile
        }

        // Update local cache - check if profile already exists before adding
        const profiles = await this.getAdditionalProfiles(userId)
        const existingIndex = profiles.findIndex(p => p.id === createdProfile.id)
        if (existingIndex === -1) {
          profiles.push(createdProfile)
        } else {
          // Replace if already exists (shouldn't happen, but safety measure)
          profiles[existingIndex] = createdProfile
        }
        // Deduplicate before saving
        const deduplicated = this.deduplicateProfiles(profiles)
        this.saveLocalProfiles(userId, deduplicated)

        return createdProfile
      } else {
        // Fallback to localStorage only
        const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const createdProfile: AdditionalProfile = {
          id,
          ...newProfile
        }

        const profiles = this.getLocalProfiles(userId) || []
        profiles.push(createdProfile)
        this.saveLocalProfiles(userId, profiles)

        return createdProfile
      }
    } catch (error) {
      devLog.error('Error creating profile:', error, 'profileManager')
      // Fallback to localStorage
      const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const createdProfile: AdditionalProfile = {
        id,
        ...newProfile
      }

      const profiles = this.getLocalProfiles(userId) || []
      profiles.push(createdProfile)
      this.saveLocalProfiles(userId, profiles)

      return createdProfile
    }
  }

  // Update an existing profile
  async updateAdditionalProfile(userId: string, profileId: string, updates: Partial<Omit<AdditionalProfile, 'id' | 'userId' | 'createdAt'>>): Promise<AdditionalProfile | null> {
    try {
      if (getFirebaseDB()) {
        await userSubdocUpdate(userId, 'additionalProfiles', profileId, {
          ...(updates as unknown as Record<string, unknown>),
          updatedAt: Date.now(),
        })

        const updatedRow = await userSubdocGet(userId, 'additionalProfiles', profileId)
        if (!updatedRow) {
          return null
        }

        const updatedProfile: AdditionalProfile = {
          id: profileId,
          ...updatedRow,
        } as AdditionalProfile

        // Update local cache
        const profiles = await this.getAdditionalProfiles(userId)
        const index = profiles.findIndex(p => p.id === profileId)
        if (index !== -1) {
          profiles[index] = updatedProfile
        } else {
          // If not found, add it (shouldn't happen, but safety measure)
          profiles.push(updatedProfile)
        }
        // Deduplicate before saving
        const deduplicated = this.deduplicateProfiles(profiles)
        this.saveLocalProfiles(userId, deduplicated)

        return updatedProfile
      } else {
        // Fallback to localStorage
        const profiles = this.getLocalProfiles(userId) || []
        const index = profiles.findIndex(p => p.id === profileId)
        if (index === -1) return null

        const updatedProfile: AdditionalProfile = {
          ...profiles[index],
          ...updates,
          updatedAt: Date.now()
        }

        profiles[index] = updatedProfile
        this.saveLocalProfiles(userId, profiles)

        return updatedProfile
      }
    } catch (error) {
      devLog.error('Error updating profile:', error, 'profileManager')
      return null
    }
  }

  // Delete a profile
  async deleteAdditionalProfile(userId: string, profileId: string): Promise<boolean> {
    try {
      if (getFirebaseDB()) {
        await userSubdocDelete(userId, 'additionalProfiles', profileId)
      }

      // Update local cache
      const profiles = this.getLocalProfiles(userId) || []
      const filtered = profiles.filter(p => p.id !== profileId)
      // Deduplicate before saving (extra safety)
      const deduplicated = this.deduplicateProfiles(filtered)
      this.saveLocalProfiles(userId, deduplicated)

      return true
    } catch (error) {
      devLog.error('Error deleting profile:', error, 'profileManager')
      // Still update localStorage
      const profiles = this.getLocalProfiles(userId) || []
      const filtered = profiles.filter(p => p.id !== profileId)
      // Deduplicate before saving (extra safety)
      const deduplicated = this.deduplicateProfiles(filtered)
      this.saveLocalProfiles(userId, deduplicated)
      return false
    }
  }

  // Local storage helpers
  private getLocalProfiles(userId: string): AdditionalProfile[] {
    try {
      const key = `${STORAGE_KEY}_${userId}`
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch (error) {
      devLog.error('Error reading local profiles:', error, 'profileManager')
      return []
    }
  }

  private saveLocalProfiles(userId: string, profiles: AdditionalProfile[]): void {
    try {
      const key = `${STORAGE_KEY}_${userId}`
      localStorage.setItem(key, JSON.stringify(profiles))
    } catch (error) {
      devLog.error('Error saving local profiles:', error, 'profileManager')
    }
  }
}

export const profileManager = new ProfileManager()

