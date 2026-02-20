// Utility functions for localStorage-based tool data management
// This replaces the complex extraction system with simple localStorage access

export interface ToolData {
  [key: string]: any
}

// Load tool data from localStorage
export function loadToolData(userId: string, toolName: string): ToolData | null {
  try {
    const storedData = localStorage.getItem(`futureseer_${userId}_${toolName}`)
    if (storedData) {
      return JSON.parse(storedData)
    }
    return null
  } catch (error) {
    devLog.error(`Error loading ${toolName} data:`, error, 'toolStorageUtils')
    return null
  }
}

// Save tool data to localStorage
export function saveToolData(userId: string, toolName: string, data: ToolData): void {
  try {
    localStorage.setItem(`futureseer_${userId}_${toolName}`, JSON.stringify(data))
    devLog.debug(`✅ ${toolName} data saved to localStorage`)
  } catch (error) {
    devLog.error(`Error saving ${toolName} data:`, error, 'toolStorageUtils')
  }
}

// Clear tool data from localStorage
export function clearToolData(userId: string, toolName: string): void {
  try {
    localStorage.removeItem(`futureseer_${userId}_${toolName}`)
    devLog.debug(`🗑️ ${toolName} data cleared from localStorage`)
  } catch (error) {
    devLog.error(`Error clearing ${toolName} data:`, error, 'toolStorageUtils')
  }
}

// Clear all tool data for a user
export function clearAllToolData(userId: string): void {
  const allTools = [
    'vedicAstrology', 'westernAstrology', 'kpAstrology',
    'medicalAstrology', 'horaryAstrology',
    'synastry', 'numerology', 'kabbalisticNumerology', 'angelNumbers',
    'tarot', 'lenormand', 'runes', 'iching', 'pendulum', 'geomancy',
    'palmistry', 'faceReading', 'nameAnalysis', 'dreamSymbols',
    'bazi', 'thirteenSignsZodiac', 'vastu', 'astroscribe'
  ]
  
  allTools.forEach(toolName => {
    clearToolData(userId, toolName)
  })
  
  devLog.debug(`🗑️ All tool data cleared for user: ${userId}`)
}

// Template hook for tool pages
export function useToolData(userId: string | undefined, toolName: string, hasCompleteDetails: boolean) {
  const [toolData, setToolData] = useState<ToolData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = () => {
      if (!userId || !hasCompleteDetails) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        devLog.debug(`Loading ${toolName} data from localStorage for user:`, userId)
        
        const data = loadToolData(userId, toolName)
        
        if (data) {
          devLog.debug(`✅ ${toolName} data loaded from localStorage:`, data)
          setToolData(data)
        } else {
          devLog.debug(`No ${toolName} data found in localStorage`)
          setToolData(null)
          // Do not set error for "no data" — consumers show Preparing/Generate UI for !toolData
        }
      } catch (err: any) {
        devLog.error(`Error loading ${toolName} data:`, err, 'toolStorageUtils')
        setError(err.message || `Failed to load ${toolName} data`)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId, hasCompleteDetails, toolName])

  const refetch = () => {
    if (!userId || !hasCompleteDetails) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      devLog.debug(`🔄 Reloading ${toolName} data from localStorage...`)
      
      const data = loadToolData(userId, toolName)
      
      if (data) {
        setToolData(data)
        devLog.debug(`✅ ${toolName} data reloaded from localStorage`)
      } else {
        setToolData(null)
        // Do not set error for "no data" — consumers show Preparing/Generate UI for !toolData
      }
    } catch (err: any) {
      devLog.error(`Error refetching ${toolName} data:`, err, 'toolStorageUtils')
      setError(err.message || `Failed to load ${toolName} data`)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    toolData,
    isLoading,
    error,
    refetch
  }
}

// Import useState for the hook
import { useState, useEffect } from 'react'
import { devLog } from '@/lib/devLogger';
