"use client"

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Gem, 
  Palette, 
  Clock, 
  Heart, 
  Shield, 
  Zap, 
  Star, 
  Moon, 
  Sun,
  Search,
  Filter,
  BookOpen,
  Sparkles
} from 'lucide-react'
import { 
  GEMSTONE_DATABASE, 
  NUMEROLOGY_REMEDIES, 
  COLOR_THERAPY, 
  MANTRA_DATABASE, 
  MUDRA_DATABASE 
} from '@/lib/remedyDatabase'
import { getGemstonePhotoPath } from '@/lib/gemstoneImageMap'
import { useIsMobileLayout } from '@/hooks/useIsMobileLayout'

export default function RemediesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedElement, setSelectedElement] = useState('all')
  const [selectedPlanet, setSelectedPlanet] = useState('all')
  const isMobileLayout = useIsMobileLayout()

  const categories = [
    { id: 'all', name: 'All Remedies', icon: Sparkles },
    { id: 'gemstone', name: 'Gemstones', icon: Gem },
    { id: 'color', name: 'Color Therapy', icon: Palette },
    { id: 'mantra', name: 'Mantras', icon: BookOpen },
    { id: 'mudra', name: 'Mudras', icon: Heart },
    { id: 'numerology', name: 'Numerology', icon: Star },
    { id: 'timing', name: 'Timing', icon: Clock }
  ]

  const elements = [
    { id: 'all', name: 'All Elements' },
    { id: 'fire', name: 'Fire' },
    { id: 'earth', name: 'Earth' },
    { id: 'air', name: 'Air' },
    { id: 'water', name: 'Water' }
  ]

  const planets = [
    { id: 'all', name: 'All Planets' },
    { id: 'sun', name: 'Sun' },
    { id: 'moon', name: 'Moon' },
    { id: 'mars', name: 'Mars' },
    { id: 'mercury', name: 'Mercury' },
    { id: 'jupiter', name: 'Jupiter' },
    { id: 'venus', name: 'Venus' },
    { id: 'saturn', name: 'Saturn' }
  ]

  const q = searchTerm.trim().toLowerCase()
  const matchSearch = (text: string) => !q || text.toLowerCase().includes(q)
  const matchElement = (itemEl: string | string[] | undefined) => {
    if (selectedElement === 'all') return true
    if (!itemEl || (Array.isArray(itemEl) && itemEl.length === 0)) return true
    return Array.isArray(itemEl) ? itemEl.some((e: string) => e.toLowerCase() === selectedElement.toLowerCase()) : itemEl.toLowerCase() === selectedElement.toLowerCase()
  }
  const matchPlanet = (itemPlanet: string | string[] | undefined) => {
    if (selectedPlanet === 'all') return true
    if (!itemPlanet || (Array.isArray(itemPlanet) && itemPlanet.length === 0)) return true
    return Array.isArray(itemPlanet) ? itemPlanet.some((p: string) => p.toLowerCase() === selectedPlanet.toLowerCase()) : itemPlanet.toLowerCase() === selectedPlanet.toLowerCase()
  }

  const cardBase = isMobileLayout
    ? 'bg-surface-container-high border border-outline-variant rounded-2xl shadow-sm'
    : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300'
  const cardTitleClass = isMobileLayout ? 'text-xl font-bold text-amber-400' : 'text-xl capitalize text-amber-400'
  const textMuted = isMobileLayout ? 'text-surface-on-variant' : 'text-white/80'
  const badgeOutline = isMobileLayout ? 'border-outline-variant text-surface-on-variant' : 'text-gray-300 border-gray-600'

  const emptyState = (
    <Card className={cardBase}>
      <CardContent className="py-12 text-center">
        <p className={textMuted}>No remedies match your filters. Try changing the filters above or your search.</p>
      </CardContent>
    </Card>
  )

  const renderGemstoneRemedies = () => {
    const rows = Object.entries(GEMSTONE_DATABASE)
      .map(([sign, gemstones]) => {
        const filtered = gemstones.filter((g) => {
          if (!matchElement(g.element)) return false
          if (!matchPlanet(g.planetaryRuler)) return false
          if (q && !matchSearch(g.name) && !matchSearch(g.description) && !g.benefits.some((b: string) => matchSearch(b))) return false
          return true
        })
        return [sign, filtered] as const
      })
      .filter(([, filtered]) => filtered.length > 0)
    if (rows.length === 0) return emptyState
    return rows.map(([sign, gemstones]) => (
      <Card key={sign} className={cardBase}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${cardTitleClass}`}>
            <Gem className="w-5 h-5 text-blue-500" />
            {sign} Gemstones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gemstones.map((gemstone, index) => {
              const photoPath = getGemstonePhotoPath(gemstone.name)
              return (
              <Card key={index} className={cardBase}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {photoPath && (
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-transparent border border-amber-500/10">
                          <img
                            src={photoPath}
                            alt={gemstone.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                          />
                        </div>
                      )}
                      <CardTitle className={`text-lg truncate ${isMobileLayout ? 'text-amber-400 font-semibold' : 'text-amber-400'}`}>{gemstone.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className={isMobileLayout ? 'bg-primary-container text-primary-on-container flex-shrink-0' : 'bg-blue-500 text-white flex-shrink-0'}>
                      {gemstone.planetaryRuler}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className={`text-sm ${textMuted}`}>{gemstone.description}</p>
                  
                  <div>
                    <h5 className="font-semibold text-sm mb-2 text-amber-400">Instructions:</h5>
                    <ul className={`text-xs space-y-1 ${textMuted}`}>
                      {gemstone.instructions.map((instruction, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 mt-1">•</span>
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-sm mb-2 text-amber-400">Benefits:</h5>
                    <ul className={`text-xs space-y-1 ${textMuted}`}>
                      {gemstone.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-400 mt-1">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap items-center">
                    <Badge variant="outline" className={`text-xs border ${badgeOutline}`}>
                      {gemstone.element}
                    </Badge>
                    <Badge variant="outline" className={`text-xs border ${badgeOutline}`}>
                      {gemstone.planetaryRuler}
                    </Badge>
                    <span className="ml-auto text-xs text-amber-500/80 font-medium">
                      Suggested source: local trusted seller
                    </span>
                  </div>
                </CardContent>
              </Card>
            ); })}
          </div>
        </CardContent>
      </Card>
    ))
  }

  const renderColorTherapy = () => {
    const filtered = Object.entries(COLOR_THERAPY).filter(([color, therapy]) => {
      if (!matchElement(therapy.elementalAssociations)) return false
      if (!matchPlanet(therapy.planetaryRulers)) return false
      if (q && !matchSearch(color) && !matchSearch(therapy.title) && !matchSearch(therapy.description) && !therapy.benefits.some((b: string) => matchSearch(b))) return false
      return true
    })
    if (filtered.length === 0) return emptyState
    return filtered.map(([color, therapy]) => (
      <Card key={color} className={cardBase}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${cardTitleClass} capitalize`}>
            <Palette className="w-5 h-5 text-green-500" />
            {color} Color Therapy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className={textMuted}>{therapy.description}</p>
            
            <div>
              <h5 className="font-semibold text-sm mb-2 text-amber-400">Instructions:</h5>
              <ul className={`text-sm space-y-1 ${textMuted}`}>
                {therapy.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-sm mb-2 text-amber-400">Benefits:</h5>
              <ul className={`text-sm space-y-1 ${textMuted}`}>
                {therapy.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-2">
              {therapy.elementalAssociations?.map((element, idx) => (
                <Badge key={idx} variant="outline" className={`text-xs border ${badgeOutline}`}>
                  {element}
                </Badge>
              ))}
              {therapy.planetaryRulers?.map((planet, idx) => (
                <Badge key={idx} variant="outline" className={`text-xs border ${badgeOutline}`}>
                  {planet}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    ))
  }

  const renderMantras = () => {
    const filtered = Object.entries(MANTRA_DATABASE).filter(([, details]) => {
      if (!matchElement((details as { elementalAssociations?: string[] }).elementalAssociations)) return false
      if (!matchPlanet((details as { planetaryRulers?: string[] }).planetaryRulers)) return false
      if (q && !matchSearch(details.title) && !matchSearch(details.description) && !details.benefits.some((b: string) => matchSearch(b))) return false
      return true
    })
    if (filtered.length === 0) return emptyState
    return filtered.map(([mantra, details]) => (
      <Card key={mantra} className={cardBase}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${cardTitleClass}`}>
            <BookOpen className="w-5 h-5 text-purple-500" />
            {details.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className={textMuted}>{details.description}</p>
            
            <div>
              <h5 className="font-semibold text-sm mb-2 text-amber-400">Instructions:</h5>
              <ul className={`text-sm space-y-1 ${textMuted}`}>
                {details.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-sm mb-2 text-amber-400">Benefits:</h5>
              <ul className={`text-sm space-y-1 ${textMuted}`}>
                {details.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className={`text-xs border ${badgeOutline}`}>
                Duration: {details.duration}
              </Badge>
              <Badge variant="outline" className={`text-xs border ${badgeOutline}`}>
                Difficulty: {details.difficulty}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    ))
  }

  const renderMudras = () => {
    const filtered = Object.entries(MUDRA_DATABASE).filter(([, details]) => {
      if (!matchElement(details.elementalAssociations)) return false
      if (!matchPlanet(details.planetaryRulers)) return false
      if (q && !matchSearch(details.title) && !matchSearch(details.description) && !details.benefits.some((b: string) => matchSearch(b))) return false
      return true
    })
    if (filtered.length === 0) return emptyState
    return filtered.map(([mudra, details]) => (
      <Card key={mudra} className={cardBase}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${cardTitleClass}`}>
            <Heart className="w-5 h-5 text-red-500" />
            {details.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className={textMuted}>{details.description}</p>
            
            <div>
              <h5 className="font-semibold text-sm mb-2 text-amber-400">Instructions:</h5>
              <ul className={`text-sm space-y-1 ${textMuted}`}>
                {details.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-sm mb-2 text-amber-400">Benefits:</h5>
              <ul className={`text-sm space-y-1 ${textMuted}`}>
                {details.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-2">
              {details.elementalAssociations?.map((element, idx) => (
                <Badge key={idx} variant="outline" className={`text-xs border ${badgeOutline}`}>
                  {element}
                </Badge>
              ))}
              {details.planetaryRulers?.map((planet, idx) => (
                <Badge key={idx} variant="outline" className={`text-xs border ${badgeOutline}`}>
                  {planet}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    ))
  }

  const renderNumerologyRemedies = () => {
    const numerologyEntries = Object.entries(NUMEROLOGY_REMEDIES.missingNumbers)
      .filter(([number, remedy]) => !q || matchSearch(remedy.title) || matchSearch(remedy.description) || remedy.benefits.some((b: string) => matchSearch(b)) || matchSearch(number))
    if (numerologyEntries.length === 0) return emptyState
    return (
      <div className="space-y-6">
        <Card className={cardBase}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${cardTitleClass}`}>
              <Star className="w-5 h-5 text-yellow-500" />
              Missing Numbers Remedies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {numerologyEntries.map(([number, remedy]) => (
                <Card key={number} className={cardBase}>
                  <CardHeader className="pb-3">
                    <CardTitle className={`text-lg ${isMobileLayout ? 'text-amber-400 font-semibold' : 'text-amber-400'}`}>Number {number}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className={`text-sm ${textMuted}`}>{remedy.description}</p>
                    
                    <div>
                      <h5 className="font-semibold text-sm mb-2 text-amber-400">Instructions:</h5>
                      <ul className={`text-xs space-y-1 ${textMuted}`}>
                        {remedy.instructions.map((instruction, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-400 mt-1">•</span>
                            {instruction}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-sm mb-2 text-amber-400">Benefits:</h5>
                      <ul className={`text-xs space-y-1 ${textMuted}`}>
                        {remedy.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Material 3 layout for mobile / Android
  if (isMobileLayout) {
    return (
      <div className="min-h-screen bg-surface flex flex-col pt-[env(safe-area-inset-top)] pb-24 overflow-x-hidden">
        <div className="px-4 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-heading font-bold text-amber-400 uppercase tracking-tight">Remedies</h1>
            <div className="p-2 bg-primary-container rounded-full text-primary-on-container">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-surface-on-variant">
            Gemstones, mantras, mudras, colors & numerology.
          </p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-on-variant opacity-50" />
            <input
              type="text"
              placeholder="Search remedies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-11 bg-surface-container-high rounded-2xl border border-outline-variant text-surface-on text-sm"
            />
          </div>
        </div>

        <Tabs defaultValue="gemstones" className="flex-1 px-4 pb-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto bg-surface-container-low p-1 rounded-2xl gap-1 mb-8">
            <TabsTrigger value="gemstones" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl text-sm font-medium">
              <Gem className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Gemstones</span>
            </TabsTrigger>
            <TabsTrigger value="colors" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl text-sm font-medium">
              <Palette className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Colors</span>
            </TabsTrigger>
            <TabsTrigger value="mantras" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl text-sm font-medium">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Mantras</span>
            </TabsTrigger>
            <TabsTrigger value="mudras" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl text-sm font-medium">
              <Heart className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Mudras</span>
            </TabsTrigger>
            <TabsTrigger value="numerology" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl text-sm font-medium">
              <Star className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Numerology</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gemstones" className="space-y-4 mt-0">
            {renderGemstoneRemedies()}
          </TabsContent>
          <TabsContent value="colors" className="space-y-4 mt-0">
            {renderColorTherapy()}
          </TabsContent>
          <TabsContent value="mantras" className="space-y-4 mt-0">
            {renderMantras()}
          </TabsContent>
          <TabsContent value="mudras" className="space-y-4 mt-0">
            {renderMudras()}
          </TabsContent>
          <TabsContent value="numerology" className="space-y-4 mt-0">
            {renderNumerologyRemedies()}
          </TabsContent>
        </Tabs>

        <div className="px-4 pb-6">
          <Card className={cardBase}>
            <CardContent className="p-4">
              <p className={`text-sm ${textMuted} mb-4`}>
                For personalized recommendations, use Ask the Seer with your profile.
              </p>
              <Button
                onClick={() => window.location.href = '/ask-the-seer'}
                className="w-full bg-primary text-primary-foreground rounded-xl"
              >
                Get Personalized Remedies
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Devotionist layout for web / large screens
  return (
    <div className="starfield-ultra-sharp min-h-screen py-12 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto pt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Mystical <span className="text-amber-400">Remedies</span> Database
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-4xl mx-auto">
            Explore our comprehensive collection of ancient remedies, gemstones, mantras, mudras, and mystical practices. 
            Each remedy is designed to address specific life challenges and enhance your spiritual journey.
          </p>
        </div>

        {/* Search and Filters - full width to match other containers */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search remedies by name, benefit, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 text-white placeholder-gray-400 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-shrink-0">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[11rem] rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 text-white focus:ring-amber-500/50 data-[state=open]:border-amber-500/50">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-amber-500/30 bg-slate-900 text-white shadow-xl">
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id} className="rounded-lg text-white focus:bg-slate-700 focus:text-white data-[highlighted]:bg-slate-700 data-[highlighted]:text-white [&_svg]:text-white">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedElement} onValueChange={setSelectedElement}>
                <SelectTrigger className="w-[11rem] rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 text-white focus:ring-amber-500/50 data-[state=open]:border-amber-500/50">
                  <SelectValue placeholder="Element" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-amber-500/30 bg-slate-900 text-white shadow-xl">
                  {elements.map(element => (
                    <SelectItem key={element.id} value={element.id} className="rounded-lg text-white focus:bg-slate-700 focus:text-white data-[highlighted]:bg-slate-700 data-[highlighted]:text-white [&_svg]:text-white">
                      {element.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPlanet} onValueChange={setSelectedPlanet}>
                <SelectTrigger className="w-[11rem] rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 text-white focus:ring-amber-500/50 data-[state=open]:border-amber-500/50">
                  <SelectValue placeholder="Planet" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-amber-500/30 bg-slate-900 text-white shadow-xl">
                  {planets.map(planet => (
                    <SelectItem key={planet.id} value={planet.id} className="rounded-lg text-white focus:bg-slate-700 focus:text-white data-[highlighted]:bg-slate-700 data-[highlighted]:text-white [&_svg]:text-white">
                      {planet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Remedies Content */}
        <Tabs defaultValue="gemstones" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto bg-transparent p-0 gap-2 mb-4">
            <TabsTrigger 
              value="gemstones" 
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 data-[state=active]:border-amber-500/50 data-[state=active]:text-amber-400 data-[state=inactive]:text-white/80 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Gem className="w-4 h-4" />
              <span className="hidden md:inline">Gemstones</span>
            </TabsTrigger>
            <TabsTrigger 
              value="colors" 
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 data-[state=active]:border-amber-500/50 data-[state=active]:text-amber-400 data-[state=inactive]:text-white/80 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Palette className="w-4 h-4" />
              <span className="hidden md:inline">Colors</span>
            </TabsTrigger>
            <TabsTrigger 
              value="mantras" 
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 data-[state=active]:border-amber-500/50 data-[state=active]:text-amber-400 data-[state=inactive]:text-white/80 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Mantras</span>
            </TabsTrigger>
            <TabsTrigger 
              value="mudras" 
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 data-[state=active]:border-amber-500/50 data-[state=active]:text-amber-400 data-[state=inactive]:text-white/80 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden md:inline">Mudras</span>
            </TabsTrigger>
            <TabsTrigger 
              value="numerology" 
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 data-[state=active]:border-amber-500/50 data-[state=active]:text-amber-400 data-[state=inactive]:text-white/80 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Star className="w-4 h-4" />
              <span className="hidden md:inline">Numerology</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gemstones" className="space-y-6">
            {renderGemstoneRemedies()}
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            {renderColorTherapy()}
          </TabsContent>

          <TabsContent value="mantras" className="space-y-6">
            {renderMantras()}
          </TabsContent>

          <TabsContent value="mudras" className="space-y-6">
            {renderMudras()}
          </TabsContent>

          <TabsContent value="numerology" className="space-y-6">
            {renderNumerologyRemedies()}
          </TabsContent>
        </Tabs>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
            <CardContent className="p-6">
              <p className="text-white/80 mb-4">
                💫 <strong>Important Note:</strong> These remedies are based on ancient wisdom and spiritual traditions. 
                For personalized recommendations, use our &quot;Ask the Seer&quot; feature which analyzes your unique 
                astrological and numerological profile.
              </p>
              <Button 
                onClick={() => window.location.href = '/ask-the-seer'}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
              >
                Get Personalized Remedies
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 