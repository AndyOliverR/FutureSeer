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
  ExternalLink,
  BarChart3
} from 'lucide-react'
import { analyzeNumerologyProfile, NumerologyRemedy, NumerologyProfile } from '@/lib/numerology/numerologyRemedyAnalyzer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'

interface NumerologyRemediesProps {
  numerologyData?: any
  birthDate?: string
  onNavigateToTab?: (tab: string) => void
}

export function NumerologyRemedies({ numerologyData, birthDate, onNavigateToTab }: NumerologyRemediesProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [completedRemedies, setCompletedRemedies] = useState<Set<string>>(new Set())

  // Load completed remedies from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('numerology-remedies-completed')
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
        localStorage.setItem('numerology-remedies-completed', JSON.stringify(array))
      } catch (error) {
        console.error('Failed to save completed remedies to localStorage:', error)
      }
    } else if (typeof window !== 'undefined' && completedRemedies.size === 0) {
      // Clear localStorage if no completed remedies
      try {
        localStorage.removeItem('numerology-remedies-completed')
      } catch (error) {
        console.error('Failed to clear completed remedies from localStorage:', error)
      }
    }
  }, [completedRemedies])

  // Convert numerology data to profile format
  const profile: NumerologyProfile = useMemo(() => {
    if (!numerologyData) return {}
    
    return {
      lifePathNumber: numerologyData.life_path_number || numerologyData.life_path,
      expressionNumber: numerologyData.expression_number,
      destinyNumber: numerologyData.destiny_number,
      soulUrgeNumber: numerologyData.soul_number || numerologyData.soul_urge,
      soulNumber: numerologyData.soul_number || numerologyData.soul_urge,
      personalityNumber: numerologyData.personality_number,
      birthdayNumber: numerologyData.birthday_number,
      maturityNumber: numerologyData.maturity_number,
      personalYearNumber: numerologyData.personal_year_number,
      karmicDebts: numerologyData.karmic_debts || numerologyData.karmicDebts,
      masterNumbers: numerologyData.master_numbers || numerologyData.masterNumbers,
      birthDate: birthDate || numerologyData.birth_date || numerologyData.birthDate
    }
  }, [numerologyData, birthDate])

  // Analyze profile and get remedies
  const analysis = useMemo(() => {
    if (!profile.birthDate) return null
    const currentYear = new Date().getFullYear()
    return analyzeNumerologyProfile(profile, currentYear)
  }, [profile])

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
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/50'
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/50'
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
      case 'low': return 'bg-blue-500/20 text-blue-300 border-blue-500/50'
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/50'
    }
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'missing-number': return <Star className="w-4 h-4" />
      case 'life-path': return <Heart className="w-4 h-4" />
      case 'expression': return <Sparkles className="w-4 h-4" />
      case 'soul-urge': return <Heart className="w-4 h-4" />
      case 'personality': return <TrendingUp className="w-4 h-4" />
      case 'karmic-debt': return <AlertCircle className="w-4 h-4" />
      case 'master-number': return <Star className="w-4 h-4" />
      case 'personal-year': return <Calendar className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  // Get category label
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'missing-number': return 'Missing Numbers'
      case 'life-path': return 'Life Path'
      case 'expression': return 'Expression/Destiny'
      case 'soul-urge': return 'Soul Urge'
      case 'personality': return 'Personality'
      case 'karmic-debt': return 'Karmic Debt'
      case 'master-number': return 'Master Number'
      case 'personal-year': return 'Personal Year'
      default: return category
    }
  }

  if (!analysis || analysis.remedies.length === 0) {
    return (
      <DevotionistStyleCard
        icon={<Sparkles className="w-5 h-5" />}
        title="No Remedies Available"
        summary="Complete your numerology profile to receive personalized remedy recommendations."
        colorScheme="amber"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold gold-glow">Numerology Remedies Summary</h2>
          {onNavigateToTab && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateToTab('numbers')}
              className="border-amber-500/50 text-amber-300 hover:bg-amber-500/20"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Lo Shu Grid
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <DevotionistStyleCard
            icon={<Sparkles className="w-5 h-5" />}
            title={`${analysis.summary.totalRemedies}`}
            summary="Total Remedies"
            colorScheme="amber"
            variant="callout"
          />
          <DevotionistStyleCard
            icon={<AlertCircle className="w-5 h-5" />}
            title={`${analysis.summary.criticalCount}`}
            summary="Critical"
            colorScheme="orange"
            variant="callout"
          />
          <DevotionistStyleCard
            icon={<TrendingUp className="w-5 h-5" />}
            title={`${analysis.summary.highCount}`}
            summary="High Priority"
            colorScheme="orange"
            variant="callout"
          />
          <DevotionistStyleCard
            icon={<Star className="w-5 h-5" />}
            title={`${analysis.summary.mediumCount}`}
            summary="Medium Priority"
            colorScheme="amber"
            variant="callout"
          />
          <DevotionistStyleCard
            icon={<Circle className="w-5 h-5" />}
            title={`${analysis.summary.lowCount}`}
            summary="Low Priority"
            colorScheme="cyan"
            variant="callout"
          />
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-amber-200 shadow-lg rounded-3xl">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
              <Input
                placeholder="Search remedies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-amber-300 text-slate-800 focus:border-amber-500"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px] bg-white border-amber-300 text-slate-800">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {analysis.summary.categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full md:w-[200px] bg-white border-amber-300 text-slate-800">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
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
      <ScrollArea className="h-[calc(100vh-500px)] lg:h-[calc(100vh-400px)]">
        <div className="space-y-4 pr-4">
          {filteredRemedies.length === 0 ? (
            <DevotionistStyleCard
              icon={<Search className="w-5 h-5" />}
              title="No Remedies Found"
              summary="Try adjusting your filters or search terms."
              colorScheme="amber"
            />
          ) : (
            filteredRemedies.map((remedy) => {
              const items = [
                ...remedy.instructions.map(inst => ({ text: inst, icon: <BookOpen className="w-4 h-4" /> })),
                ...remedy.benefits.map(benefit => ({ text: benefit, type: 'positive' as const })),
                ...(remedy.gemstones || []).map(stone => ({ text: `Gemstone: ${stone}`, icon: <Gem className="w-4 h-4" /> })),
                ...(remedy.colors || []).map(color => ({ text: `Color: ${color}`, icon: <Palette className="w-4 h-4" /> })),
                ...(remedy.daysOfWeek || []).map(day => ({ text: `Auspicious Day: ${day}`, icon: <Calendar className="w-4 h-4" /> })),
                ...(remedy.mantras || []).map(mantra => ({ text: mantra, icon: <BookOpen className="w-4 h-4" />, highlight: true }))
              ]

              const colorScheme = remedy.priority === 'critical' ? 'orange' : 
                                 remedy.priority === 'high' ? 'orange' :
                                 remedy.priority === 'medium' ? 'amber' : 'cyan'

              return (
                <div key={remedy.id} className={`relative transition-all ${completedRemedies.has(remedy.id) ? 'opacity-60' : ''}`}>
                  <div className="absolute top-4 right-4 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCompletion(remedy.id)}
                      className="bg-white/80 hover:bg-white text-slate-600 hover:text-slate-800 shadow-sm"
                    >
                      {completedRemedies.has(remedy.id) ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                      )}
                    </Button>
                  </div>
                  <DevotionistStyleCard
                    icon={getCategoryIcon(remedy.category)}
                    title={remedy.title}
                    subtitle={`${getCategoryLabel(remedy.category)}${remedy.number ? ` • #${remedy.number}` : ''} • ${remedy.priority} priority`}
                    summary={remedy.description}
                    items={items}
                    colorScheme={colorScheme as any}
                    variant="callout"
                  />
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

