"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Globe,
  AlertCircle,
  CheckCircle,
  Loader2,
  Star,
  Eye,
  EyeOff,
  HelpCircle,
  Info
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export interface BirthData {
  name: string
  birthDate: string
  birthTime: string
  birthPlace: string
  latitude?: number
  longitude?: number
  timezone?: string
  analysisFocus?: string
}

interface PlaceSuggestion {
  name: string
  country: string
  latitude: number
  longitude: number
  timezone: string
}

interface BirthDetailsCardProps {
  birthData: BirthData
  setBirthData: (data: BirthData) => void
  isLoading?: boolean
  error?: string | null
  showAnalysisFocus?: boolean
  className?: string
}

export function BirthDetailsCard({ 
  birthData, 
  setBirthData, 
  isLoading = false, 
  error = null,
  showAnalysisFocus = true,
  className = ""
}: BirthDetailsCardProps) {
  const { toast } = useToast()
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingPlace, setIsLoadingPlace] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Debounced place search
  const searchPlaces = useCallback(async (query: string) => {
    if (query.length < 3) {
      setPlaceSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoadingPlace(true)
    try {
      const response = await fetch(`/api/place/lookup?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setPlaceSuggestions(data.suggestions || [])
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Place search error:', error)
    } finally {
      setIsLoadingPlace(false)
    }
  }, [])

  // Handle place input change
  const handlePlaceChange = (value: string) => {
    setBirthData({ ...birthData, birthPlace: value })
    searchPlaces(value)
  }

  // Select a place suggestion
  const selectPlace = (place: PlaceSuggestion) => {
    setBirthData({
      ...birthData,
      birthPlace: `${place.name}, ${place.country}`,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone
    })
    setShowSuggestions(false)
    setPlaceSuggestions([])
  }

  // Validate birth data
  const validateBirthData = () => {
    const errors: Record<string, string> = {}
    
    if (!birthData.name.trim()) {
      errors.name = "Name is required"
    }
    
    if (!birthData.birthDate) {
      errors.birthDate = "Birth date is required"
    }
    
    if (!birthData.birthPlace.trim()) {
      errors.birthPlace = "Birth place is required"
    }
    
    if (!birthData.birthTime) {
      errors.birthTime = "Birth time is required for accurate readings"
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }


  // Get timezone display
  const getTimezoneDisplay = () => {
    if (birthData.timezone) {
      return birthData.timezone
    }
    if (birthData.latitude && birthData.longitude) {
      return "Timezone will be detected automatically"
    }
    return "Enter place to detect timezone"
  }

  // Check if data is complete
  const isDataComplete = () => {
    return birthData.name && birthData.birthDate && birthData.birthPlace && birthData.birthTime
  }

  return (
    <Card className={`glass-card border-white/10 ${className}`}>
      <CardHeader>
        <CardTitle className="text-2xl gold-glow flex items-center gap-2">
          <Star className="w-6 h-6" />
          Birth Details
        </CardTitle>
        <p className="text-gray-300 text-sm">
          Your cosmic blueprint for accurate astrological readings
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white flex items-center gap-2">
            <User className="w-4 h-4" />
            Full Name *
          </Label>
          <Input
            id="name"
            type="text"
            value={birthData.name}
            onChange={(e) => setBirthData({ ...birthData, name: e.target.value })}
            placeholder="Enter your full name"
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-yellow-400"
          />
          {validationErrors.name && (
            <div className="flex items-center gap-1 text-red-400 text-sm">
              <AlertCircle className="w-3 h-3" />
              {validationErrors.name}
            </div>
          )}
        </div>

        {/* Birth Date Field */}
        <div className="space-y-2">
          <Label htmlFor="birthDate" className="text-white flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date of Birth *
          </Label>
          <Input
            id="birthDate"
            type="date"
            value={birthData.birthDate}
            onChange={(e) => setBirthData({ ...birthData, birthDate: e.target.value })}
            className="bg-white/5 border-white/20 text-white focus:border-yellow-400"
          />
          {validationErrors.birthDate && (
            <div className="flex items-center gap-1 text-red-400 text-sm">
              <AlertCircle className="w-3 h-3" />
              {validationErrors.birthDate}
            </div>
          )}
        </div>

        {/* Birth Time Field */}
        <div className="space-y-2">
          <Label htmlFor="birthTime" className="text-white flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time of Birth *
          </Label>
          <Input
            id="birthTime"
            type="time"
            value={birthData.birthTime}
            onChange={(e) => setBirthData({ ...birthData, birthTime: e.target.value })}
            className="bg-white/5 border-white/20 text-white focus:border-yellow-400"
          />
          <p className="text-xs text-gray-400">
            Required for accurate astrological readings. If unsure, ask family members or check birth records.
          </p>
          {validationErrors.birthTime && (
            <div className="flex items-center gap-1 text-red-400 text-sm">
              <AlertCircle className="w-3 h-3" />
              {validationErrors.birthTime}
            </div>
          )}
        </div>

        {/* Birth Place Field */}
        <div className="space-y-2">
          <Label htmlFor="birthPlace" className="text-white flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Place of Birth *
          </Label>
          <div className="relative">
            <Input
              id="birthPlace"
              type="text"
              value={birthData.birthPlace}
              onChange={(e) => handlePlaceChange(e.target.value)}
              placeholder="City, Country (e.g., Mumbai, India)"
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-yellow-400"
            />
            {isLoadingPlace && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>

          {/* Place Suggestions */}
          <AnimatePresence>
            {showSuggestions && placeSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full mt-1 bg-slate-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                {placeSuggestions.map((place, index) => (
                  <button
                    key={index}
                    onClick={() => selectPlace(place)}
                    className="w-full px-3 py-2 text-left text-white hover:bg-white/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{place.name}</div>
                      <div className="text-sm text-gray-400">{place.country}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {place.latitude.toFixed(2)}, {place.longitude.toFixed(2)}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {validationErrors.birthPlace && (
            <div className="flex items-center gap-1 text-red-400 text-sm">
              <AlertCircle className="w-3 h-3" />
              {validationErrors.birthPlace}
            </div>
          )}
        </div>

        {/* Timezone Display */}
        <div className="space-y-2">
          <Label className="text-white flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Timezone
          </Label>
          <div className="p-3 bg-white/5 border border-white/20 rounded-lg">
            <div className="flex items-center gap-2 text-gray-300">
              <Globe className="w-4 h-4" />
              <span className="text-sm">{getTimezoneDisplay()}</span>
            </div>
          </div>
        </div>

        {/* Analysis Focus (Optional) */}
        {showAnalysisFocus && (
          <div className="space-y-2">
            <Label htmlFor="analysisFocus" className="text-white flex items-center gap-2">
              <Star className="w-4 h-4" />
              Analysis Focus (Optional)
            </Label>
            <Input
              id="analysisFocus"
              type="text"
              value={birthData.analysisFocus || ""}
              onChange={(e) => setBirthData({ ...birthData, analysisFocus: e.target.value })}
              placeholder="e.g., career, relationships, health, spiritual growth"
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-yellow-400"
            />
            <p className="text-xs text-gray-400">
              Specify what areas of life you'd like the reading to focus on
            </p>
          </div>
        )}

        {/* Data Status */}
        <div className="flex items-center justify-between p-3 bg-white/5 border border-white/20 rounded-lg">
          <div className="flex items-center gap-2">
            {isDataComplete() ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Birth details complete</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm">Complete required fields</span>
              </>
            )}
          </div>
          
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
            <span className="ml-2 text-gray-300">Processing birth details...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default BirthDetailsCard
