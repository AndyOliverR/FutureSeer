"use client"

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Header } from '@/components/header'
import { AffiliateLink } from '@/components/AffiliateLink'
import { getGemstoneAffiliateUrl } from '@/lib/affiliateConfig'

export default function RemediesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedElement, setSelectedElement] = useState('all')
  const [selectedPlanet, setSelectedPlanet] = useState('all')

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

  const renderGemstoneRemedies = () => {
    return Object.entries(GEMSTONE_DATABASE).map(([sign, gemstones]) => (
      <Card key={sign} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl capitalize text-amber-400">
            <Gem className="w-5 h-5 text-blue-500" />
            {sign} Gemstones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gemstones.map((gemstone, index) => (
              <Card key={index} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-amber-400">{gemstone.name}</CardTitle>
                    <Badge variant="secondary" className="bg-blue-500 text-white">
                      {gemstone.planetaryRuler}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-white/80">{gemstone.description}</p>
                  
                  <div>
                    <h5 className="font-semibold text-sm mb-2 text-amber-400">Instructions:</h5>
                    <ul className="text-xs text-white/80 space-y-1">
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
                    <ul className="text-xs text-white/80 space-y-1">
                      {gemstone.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-400 mt-1">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap items-center">
                    <Badge variant="outline" className="text-xs text-gray-300 border-gray-600">
                      {gemstone.element}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-gray-300 border-gray-600">
                      {gemstone.planetaryRuler}
                    </Badge>
                    <AffiliateLink href={getGemstoneAffiliateUrl(gemstone.name)} label="See options" className="ml-auto text-amber-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    ))
  }

  const renderColorTherapy = () => {
    return Object.entries(COLOR_THERAPY).map(([color, therapy]) => (
      <Card key={color} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl capitalize text-amber-400">
            <Palette className="w-5 h-5 text-green-500" />
            {color} Color Therapy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-white/80">{therapy.description}</p>
            
            <div>
              <h5 className="font-semibold text-sm mb-2 text-amber-400">Instructions:</h5>
              <ul className="text-sm text-white/80 space-y-1">
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
              <ul className="text-sm text-white/80 space-y-1">
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
                <Badge key={idx} variant="outline" className="text-xs text-gray-300 border-gray-600">
                  {element}
                </Badge>
              ))}
              {therapy.planetaryRulers?.map((planet, idx) => (
                <Badge key={idx} variant="outline" className="text-xs text-gray-300 border-gray-600">
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
    return Object.entries(MANTRA_DATABASE).map(([mantra, details]) => (
      <Card key={mantra} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-amber-400">
            <BookOpen className="w-5 h-5 text-purple-500" />
            {details.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-white/80">{details.description}</p>
            
            <div>
              <h5 className="font-semibold text-sm mb-2 text-amber-400">Instructions:</h5>
              <ul className="text-sm text-white/80 space-y-1">
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
              <ul className="text-sm text-white/80 space-y-1">
                {details.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs text-gray-300 border-gray-600">
                Duration: {details.duration}
              </Badge>
              <Badge variant="outline" className="text-xs text-gray-300 border-gray-600">
                Difficulty: {details.difficulty}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    ))
  }

  const renderMudras = () => {
    return Object.entries(MUDRA_DATABASE).map(([mudra, details]) => (
      <Card key={mudra} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-amber-400">
            <Heart className="w-5 h-5 text-red-500" />
            {details.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-white/80">{details.description}</p>
            
            <div>
              <h5 className="font-semibold text-sm mb-2 text-amber-400">Instructions:</h5>
              <ul className="text-sm text-white/80 space-y-1">
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
              <ul className="text-sm text-white/80 space-y-1">
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
                <Badge key={idx} variant="outline" className="text-xs text-gray-300 border-gray-600">
                  {element}
                </Badge>
              ))}
              {details.planetaryRulers?.map((planet, idx) => (
                <Badge key={idx} variant="outline" className="text-xs text-gray-300 border-gray-600">
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
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-amber-400">
              <Star className="w-5 h-5 text-yellow-500" />
              Missing Numbers Remedies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(NUMEROLOGY_REMEDIES.missingNumbers).map(([number, remedy]) => (
                <Card key={number} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-amber-400">Number {number}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-white/80">{remedy.description}</p>
                    
                    <div>
                      <h5 className="font-semibold text-sm mb-2 text-amber-400">Instructions:</h5>
                      <ul className="text-xs text-white/80 space-y-1">
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
                      <ul className="text-xs text-white/80 space-y-1">
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

  return (
    <div className="starfield-ultra-sharp min-h-screen py-12 px-4 overflow-hidden">
      <Header />
      <div className="max-w-7xl mx-auto">
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

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search remedies by name, benefit, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 text-white placeholder-gray-400 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-md text-white transition-all duration-300"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedElement}
                onChange={(e) => setSelectedElement(e.target.value)}
                className="px-3 py-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-md text-white transition-all duration-300"
              >
                {elements.map(element => (
                  <option key={element.id} value={element.id}>
                    {element.name}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedPlanet}
                onChange={(e) => setSelectedPlanet(e.target.value)}
                className="px-3 py-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-md text-white transition-all duration-300"
              >
                {planets.map(planet => (
                  <option key={planet.id} value={planet.id}>
                    {planet.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Remedies Content */}
        <Tabs defaultValue="gemstones" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-transparent p-0 gap-2">
            <TabsTrigger 
              value="gemstones" 
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 data-[state=active]:border-amber-500/50 data-[state=active]:text-amber-400 data-[state=inactive]:text-white/80 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Gem className="w-4 h-4" />
              <span className="hidden md:inline">Gemstones</span>
            </TabsTrigger>
            <TabsTrigger 
              value="colors" 
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 data-[state=active]:border-amber-500/50 data-[state=active]:text-amber-400 data-[state=inactive]:text-white/80 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Palette className="w-4 h-4" />
              <span className="hidden md:inline">Colors</span>
            </TabsTrigger>
            <TabsTrigger 
              value="mantras" 
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 data-[state=active]:border-amber-500/50 data-[state=active]:text-amber-400 data-[state=inactive]:text-white/80 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Mantras</span>
            </TabsTrigger>
            <TabsTrigger 
              value="mudras" 
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 data-[state=active]:border-amber-500/50 data-[state=active]:text-amber-400 data-[state=inactive]:text-white/80 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden md:inline">Mudras</span>
            </TabsTrigger>
            <TabsTrigger 
              value="numerology" 
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 data-[state=active]:border-amber-500/50 data-[state=active]:text-amber-400 data-[state=inactive]:text-white/80 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
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
          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <p className="text-white/80 mb-4">
                💫 <strong>Important Note:</strong> These remedies are based on ancient wisdom and spiritual traditions. 
                For personalized recommendations, use our "Ask the Seer" feature which analyzes your unique 
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