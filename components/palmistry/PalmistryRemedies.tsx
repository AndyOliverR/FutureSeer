'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  Circle, 
  Gem, 
  Palette, 
  Calendar, 
  BookOpen,
  Star,
  AlertCircle,
  TrendingUp,
  Heart,
  Hand
} from 'lucide-react'
import { analyzePalmistryProfile, PalmistryRemedy } from '@/lib/palmistry/palmistryRemedyAnalyzer'
import { PalmistryAnalysis } from '@/lib/palmistryIntelligence'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PalmistryRemediesProps {
  palmistryData?: PalmistryAnalysis | null
  onNavigateToTab?: (tab: string) => void
}

export function PalmistryRemedies({ palmistryData, onNavigateToTab }: PalmistryRemediesProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [completedRemedies, setCompletedRemedies] = useState<Set<string>>(new Set())

  // Load completed remedies from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('palmistry-remedies-completed')
        if (saved) {
          const savedArray = JSON.parse(saved) as string[]
          setCompletedRemedies(new Set(savedArray))
        }
      } catch (error) {
        console.error('Failed to load completed remedies from localStorage:', error)
      }
    }
  }, [])

  // Save completed remedies to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && completedRemedies.size > 0) {
      try {
        const array = Array.from(completedRemedies)
        localStorage.setItem('palmistry-remedies-completed', JSON.stringify(array))
      } catch (error) {
        console.error('Failed to save completed remedies to localStorage:', error)
      }
    } else if (typeof window !== 'undefined' && completedRemedies.size === 0) {
      try {
        localStorage.removeItem('palmistry-remedies-completed')
      } catch (error) {
        console.error('Failed to clear completed remedies from localStorage:', error)
      }
    }
  }, [completedRemedies])

  // Analyze palmistry profile and get remedies
  const analysis = useMemo(() => {
    if (!palmistryData) return null
    return analyzePalmistryProfile(palmistryData)
  }, [palmistryData])

  // Filter remedies
  const filteredRemedies = useMemo(() => {
    if (!analysis) return []
    
    return analysis.remedies.filter(remedy => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        remedy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        remedy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        remedy.instructions.some(inst => inst.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || remedy.category === selectedCategory
      
      // Priority filter
      const matchesPriority = selectedPriority === 'all' || remedy.priority === selectedPriority
      
      return matchesSearch && matchesCategory && matchesPriority
    })
  }, [analysis, searchTerm, selectedCategory, selectedPriority])

  // Toggle remedy completion
  const toggleCompletion = (remedyId: string) => {
    setCompletedRemedies(prev => {
      const next = new Set(prev)
      if (next.has(remedyId)) {
        next.delete(remedyId)
      } else {
        next.add(remedyId)
      }
      return next
    })
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-300'
      default: return 'bg-slate-100 text-slate-700 border-slate-300'
    }
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'line': return <TrendingUp className="w-4 h-4" />
      case 'mount': return <Star className="w-4 h-4" />
      case 'hand-shape': return <Hand className="w-4 h-4" />
      case 'finger': return <Hand className="w-4 h-4" />
      case 'marking': return <AlertCircle className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  // Get category label
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'line': return 'Lines'
      case 'mount': return 'Mounts'
      case 'hand-shape': return 'Hand Shape'
      case 'finger': return 'Fingers'
      case 'marking': return 'Markings'
      default: return category
    }
  }

  if (!analysis || analysis.remedies.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl shadow-lg">
        <CardContent className="pt-6 text-center py-8">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-amber-900 font-semibold mb-2">No Remedies Available</h3>
          <p className="text-slate-700 text-sm">
            Complete your palmistry analysis to receive personalized remedy recommendations.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Sparkles className="w-5 h-5 text-amber-600" />
            Palmistry Remedies Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-white border-2 border-amber-200 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-amber-600">{analysis.summary.totalRemedies}</div>
              <div className="text-xs text-slate-600 mt-1">Total Remedies</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-red-600">{analysis.summary.criticalCount}</div>
              <div className="text-xs text-slate-600 mt-1">Critical</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-orange-600">{analysis.summary.highCount}</div>
              <div className="text-xs text-slate-600 mt-1">High</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">{analysis.summary.mediumCount}</div>
              <div className="text-xs text-slate-600 mt-1">Medium</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{analysis.summary.lowCount}</div>
              <div className="text-xs text-slate-600 mt-1">Low</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
              <Input
                placeholder="Search remedies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-purple-200 text-slate-900 placeholder:text-slate-500"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px] bg-white border-purple-200 text-slate-900">
                <Filter className="w-4 h-4 mr-2 text-purple-400" />
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent className="bg-white border-purple-200 text-slate-900">
                <SelectItem value="all">All Categories</SelectItem>
                {analysis.summary.categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {getCategoryLabel(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full md:w-[180px] bg-white border-purple-200 text-slate-900">
                <Star className="w-4 h-4 mr-2 text-purple-400" />
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent className="bg-white border-purple-200 text-slate-900">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Remedies List */}
      <ScrollArea className="h-[calc(100vh-550px)] lg:h-[calc(100vh-450px)] pr-4">
        <div className="space-y-4">
          {filteredRemedies.length === 0 ? (
            <div className="text-center text-slate-600 py-8">
              No remedies found matching your criteria.
            </div>
          ) : (
            filteredRemedies.map(remedy => (
              <Card key={remedy.id} className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-serif text-rose-900 flex items-center gap-2">
                    {getCategoryIcon(remedy.category)}
                    {remedy.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getPriorityColor(remedy.priority)} text-xs border`}>
                      {remedy.priority.charAt(0).toUpperCase() + remedy.priority.slice(1)} Priority
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleCompletion(remedy.id)}
                      className={`rounded-full ${completedRemedies.has(remedy.id) ? 'text-green-600 hover:bg-green-100' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      {completedRemedies.has(remedy.id) ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-slate-700 text-sm">{remedy.description}</p>
                  
                  {remedy.instructions && remedy.instructions.length > 0 && (
                    <div>
                      <h5 className="text-rose-800 font-semibold mb-1">Instructions:</h5>
                      <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
                        {remedy.instructions.map((inst, idx) => (
                          <li key={idx}>{inst}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {remedy.benefits && remedy.benefits.length > 0 && (
                    <div>
                      <h5 className="text-rose-800 font-semibold mb-1">Benefits:</h5>
                      <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
                        {remedy.benefits.map((ben, idx) => (
                          <li key={idx}>{ben}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                    {remedy.gemstones && remedy.gemstones.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Gem className="w-4 h-4 text-rose-600" />
                        <span>Gemstones: {remedy.gemstones.join(', ')}</span>
                      </div>
                    )}
                    {remedy.colors && remedy.colors.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-rose-600" />
                        <span>Colors: {remedy.colors.join(', ')}</span>
                      </div>
                    )}
                    {remedy.timing && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-rose-600" />
                        <span>Timing: {remedy.timing}</span>
                      </div>
                    )}
                    {remedy.frequency && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-rose-600" />
                        <span>Frequency: {remedy.frequency}</span>
                      </div>
                    )}
                    {remedy.mantras && remedy.mantras.length > 0 && (
                      <div className="flex items-center gap-2 col-span-2">
                        <BookOpen className="w-4 h-4 text-rose-600" />
                        <span>Mantras: {remedy.mantras.join(', ')}</span>
                      </div>
                    )}
                    {remedy.practices && remedy.practices.length > 0 && (
                      <div className="flex items-center gap-2 col-span-2">
                        <Sparkles className="w-4 h-4 text-rose-600" />
                        <span>Practices: {remedy.practices.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

