// Profile Management Service for Additional Profiles
// Handles CRUD operations for user's additional profiles (family, business partners, etc.)

import { AdditionalProfile } from '@/lib/types/profileTypes'
import { getFirebaseDB } from '@/lib/firebase'

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
      const db = getFirebaseDB()
      if (!db) {
        console.warn('Firebase not initialized, using localStorage only')
        const deduplicated = this.deduplicateProfiles(localData || [])
        return deduplicated.sort((a, b) => b.updatedAt - a.updatedAt)
      }

      const { collection, query, where, getDocs } = await import('firebase/firestore')
      const profilesRef = collection(db, 'users', userId, 'additionalProfiles')
      const snapshot = await getDocs(profilesRef)
      
      const profiles: AdditionalProfile[] = []
      snapshot.forEach((doc) => {
        profiles.push({
          id: doc.id,
          ...doc.data()
        } as AdditionalProfile)
      })

      // Deduplicate before caching
      const deduplicated = this.deduplicateProfiles(profiles)
      
      // Cache in localStorage
      this.saveLocalProfiles(userId, deduplicated)
      
      return deduplicated.sort((a, b) => b.updatedAt - a.updatedAt)
    } catch (error) {
      console.error('Error fetching additional profiles:', error)
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
      console.error('Error fetching profile:', error)
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
      const db = getFirebaseDB()
      if (db) {
        const { collection, addDoc } = await import('firebase/firestore')
        const profilesRef = collection(db, 'users', userId, 'additionalProfiles')
        const docRef = await addDoc(profilesRef, newProfile)
        
        const createdProfile: AdditionalProfile = {
          id: docRef.id,
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
      console.error('Error creating profile:', error)
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
      const db = getFirebaseDB()
      if (db) {
        const { doc, updateDoc, getDoc } = await import('firebase/firestore')
        const profileRef = doc(db, 'users', userId, 'additionalProfiles', profileId)
        
        await updateDoc(profileRef, {
          ...updates,
          updatedAt: Date.now()
        })

        const updatedDoc = await getDoc(profileRef)
        if (!updatedDoc.exists()) {
          return null
        }

        const updatedProfile: AdditionalProfile = {
          id: updatedDoc.id,
          ...updatedDoc.data()
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
      console.error('Error updating profile:', error)
      return null
    }
  }

  // Delete a profile
  async deleteAdditionalProfile(userId: string, profileId: string): Promise<boolean> {
    try {
      const db = getFirebaseDB()
      if (db) {
        const { doc, deleteDoc } = await import('firebase/firestore')
        const profileRef = doc(db, 'users', userId, 'additionalProfiles', profileId)
        await deleteDoc(profileRef)
      }

      // Update local cache
      const profiles = this.getLocalProfiles(userId) || []
      const filtered = profiles.filter(p => p.id !== profileId)
      // Deduplicate before saving (extra safety)
      const deduplicated = this.deduplicateProfiles(filtered)
      this.saveLocalProfiles(userId, deduplicated)

      return true
    } catch (error) {
      console.error('Error deleting profile:', error)
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
      console.error('Error reading local profiles:', error)
      return []
    }
  }

  private saveLocalProfiles(userId: string, profiles: AdditionalProfile[]): void {
    try {
      const key = `${STORAGE_KEY}_${userId}`
      localStorage.setItem(key, JSON.stringify(profiles))
    } catch (error) {
      console.error('Error saving local profiles:', error)
    }
  }
}

export const profileManager = new ProfileManager()

