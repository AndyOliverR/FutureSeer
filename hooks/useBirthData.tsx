"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { BirthData } from "@/components/BirthDetailsCard"

export function useBirthData() {
  const { userProfile } = useAuth()
  const [birthData, setBirthData] = useState<BirthData>({
    name: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    analysisFocus: ""
  })

  // Load existing profile data
  useEffect(() => {
    if (userProfile) {
      setBirthData(prev => ({
        ...prev,
        name: userProfile.fullName || "",
        birthDate: userProfile.birthDate || "",
        birthTime: userProfile.birthTime || "",
        birthPlace: userProfile.birthPlace || ""
      }))
    }
  }, [userProfile])

  // Validate birth data
  const validateBirthData = () => {
    const errors: string[] = []
    
    if (!birthData.name.trim()) {
      errors.push("Name is required")
    }
    
    if (!birthData.birthDate) {
      errors.push("Birth date is required")
    }
    
    if (!birthData.birthPlace.trim()) {
      errors.push("Birth place is required")
    }
    
    if (!birthData.birthTime) {
      errors.push("Birth time is required for accurate readings")
    }
    
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Check if data is complete
  const isDataComplete = () => {
    return birthData.name && birthData.birthDate && birthData.birthPlace && birthData.birthTime
  }

  // Reset birth data
  const resetBirthData = () => {
    setBirthData({
      name: "",
      birthDate: "",
      birthTime: "",
      birthPlace: "",
      analysisFocus: ""
    })
  }

  // Get formatted birth data for API calls
  const getFormattedBirthData = () => {
    const birthDateTime = birthData.birthDate && birthData.birthTime 
      ? `${birthData.birthDate}T${birthData.birthTime}`
      : birthData.birthDate

    return {
      name: birthData.name,
      birthDateTime,
      birthPlace: birthData.birthPlace,
      analysisFocus: birthData.analysisFocus,
      latitude: birthData.latitude,
      longitude: birthData.longitude,
      timezone: birthData.timezone
    }
  }

  return {
    birthData,
    setBirthData,
    validateBirthData,
    isDataComplete,
    resetBirthData,
    getFormattedBirthData
  }
}
