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
    console.error(`Error loading ${toolName} data:`, error)
    return null
  }
}

// Save tool data to localStorage
export function saveToolData(userId: string, toolName: string, data: ToolData): void {
  try {
    localStorage.setItem(`futureseer_${userId}_${toolName}`, JSON.stringify(data))
    console.log(`✅ ${toolName} data saved to localStorage`)
  } catch (error) {
    console.error(`Error saving ${toolName} data:`, error)
  }
}

// Clear tool data from localStorage
export function clearToolData(userId: string, toolName: string): void {
  try {
    localStorage.removeItem(`futureseer_${userId}_${toolName}`)
    console.log(`🗑️ ${toolName} data cleared from localStorage`)
  } catch (error) {
    console.error(`Error clearing ${toolName} data:`, error)
  }
}

// Clear all tool data for a user
export function clearAllToolData(userId: string): void {
  const allTools = [
    'vedicAstrology', 'westernAstrology', 'kpAstrology',
    'medicalAstrology', 'financialAstrology', 'mundaneAstrology', 'horaryAstrology',
    'synastry', 'numerology', 'kabbalisticNumerology', 'angelNumbers',
    'tarot', 'lenormand', 'runes', 'iching', 'pendulum', 'geomancy',
    'palmistry', 'faceReading', 'nameAnalysis', 'dreamSymbols',
    'bazi', 'thirteenSignsZodiac', 'vastu', 'astroscribe'
  ]
  
  allTools.forEach(toolName => {
    clearToolData(userId, toolName)
  })
  
  console.log(`🗑️ All tool data cleared for user: ${userId}`)
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
        
        console.log(`Loading ${toolName} data from localStorage for user:`, userId)
        
        const data = loadToolData(userId, toolName)
        
        if (data) {
          console.log(`✅ ${toolName} data loaded from localStorage:`, data)
          setToolData(data)
        } else {
          console.log(`No ${toolName} data found in localStorage`)
          setToolData(null)
          // Do not set error for "no data" — consumers show Preparing/Generate UI for !toolData
        }
      } catch (err: any) {
        console.error(`Error loading ${toolName} data:`, err)
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
      
      console.log(`🔄 Reloading ${toolName} data from localStorage...`)
      
      const data = loadToolData(userId, toolName)
      
      if (data) {
        setToolData(data)
        console.log(`✅ ${toolName} data reloaded from localStorage`)
      } else {
        setToolData(null)
        // Do not set error for "no data" — consumers show Preparing/Generate UI for !toolData
      }
    } catch (err: any) {
      console.error(`Error refetching ${toolName} data:`, err)
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
