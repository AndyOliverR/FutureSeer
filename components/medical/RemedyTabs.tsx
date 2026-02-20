'use client'

import { useState } from 'react'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Gem, Leaf, Activity, Search } from 'lucide-react'
import { medicalDatabaseService, HomeopathicEntry, HerbalEntry, AcupunctureEntry } from '@/lib/medical/medicalDatabaseService'

interface RemedyTabsProps {
  selectedCondition?: string
  bodyPart?: string
  zodiacSign?: string
  precomputedRemedies?: {
    homeopathic?: any[]
    herbal?: any[]
    acupuncture?: any[]
  }
}

export function RemedyTabs({ selectedCondition, bodyPart, zodiacSign, precomputedRemedies }: RemedyTabsProps) {
  const [activeTab, setActiveTab] = useState<'homeopathy' | 'herbal' | 'acupuncture'>('homeopathy')
  const [searchTerm, setSearchTerm] = useState('')

  // Use precomputed remedies if available, otherwise search
  const homeopathicResults = precomputedRemedies?.homeopathic || medicalDatabaseService.searchHomeopathy({
    bodyParts: bodyPart ? [bodyPart] : undefined,
    keywords: searchTerm ? [searchTerm] : undefined
  })

  const herbalResults = precomputedRemedies?.herbal || medicalDatabaseService.searchHerbal({
    bodyParts: bodyPart ? [bodyPart] : undefined,
    keywords: searchTerm ? [searchTerm] : undefined
  })

  const acupunctureResults = precomputedRemedies?.acupuncture || medicalDatabaseService.searchAcupuncture({
    zodiacSigns: zodiacSign ? [zodiacSign] : undefined,
    keywords: searchTerm ? [searchTerm] : undefined
  })

  return (
    <div className="w-full space-y-6">
      {/* Search Bar - green scheme to match Remedies section */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-700" />
        <Input
          type="text"
          placeholder="Search remedies by symptom, planet, or body part..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 bg-green-50/90 border-2 border-green-300 text-slate-800 placeholder:text-slate-500 rounded-xl focus:border-green-400"
        />
      </div>

      {/* Tabs - devotionist style: purple / green / cyan per type */}
      <div className="flex gap-2 border-b border-green-200 pb-4">
        <button
          onClick={() => setActiveTab('homeopathy')}
          className={`px-6 py-3 rounded-xl transition-all font-medium flex items-center ${
            activeTab === 'homeopathy'
              ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-900 shadow-md'
              : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/30'
          }`}
        >
          <Gem className="inline-block mr-2 w-4 h-4" /> Homeopathy ({homeopathicResults.length})
        </button>
        <button
          onClick={() => setActiveTab('herbal')}
          className={`px-6 py-3 rounded-xl transition-all font-medium flex items-center ${
            activeTab === 'herbal'
              ? 'bg-gradient-to-br from-green-100 to-teal-100 text-green-900 shadow-md'
              : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/30'
          }`}
        >
          <Leaf className="inline-block mr-2 w-4 h-4" /> Herbal ({herbalResults.length})
        </button>
        <button
          onClick={() => setActiveTab('acupuncture')}
          className={`px-6 py-3 rounded-xl transition-all font-medium flex items-center ${
            activeTab === 'acupuncture'
              ? 'bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-900 shadow-md'
              : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/30'
          }`}
        >
          <Activity className="inline-block mr-2 w-4 h-4" /> Acupuncture ({acupunctureResults.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'homeopathy' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {homeopathicResults.length > 0 ? (
              homeopathicResults.map((remedy: HomeopathicEntry) => (
                <DevotionistStyleCard
                  key={remedy.id}
                  variant="callout"
                  colorScheme="purple"
                  icon={<Gem className="w-5 h-5" />}
                  title={remedy.name}
                  subtitle={remedy.latinName}
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-700 font-medium mb-1">Keynotes:</p>
                      <div className="flex flex-wrap gap-1">
                        {remedy.keynotes.slice(0, 3).map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs font-medium bg-purple-200 text-purple-900 border border-purple-300">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-slate-800">
                      <strong className="text-purple-900">Modalities:</strong> {remedy.modalities}
                    </div>
                    <div className="text-xs text-slate-800">
                      <strong className="text-purple-900">Dosage:</strong> {remedy.dosage}
                    </div>
                    <div className="pt-2 border-t border-purple-200">
                      <div className="flex gap-2 text-xs text-slate-700">
                        <span>Ruler: {remedy.planetaryRuler}</span>
                        <span>•</span>
                        <span>{remedy.element}</span>
                      </div>
                    </div>
                  </div>
                </DevotionistStyleCard>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-slate-700">No homeopathic remedies found. Try different search terms.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'herbal' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {herbalResults.length > 0 ? (
              herbalResults.map((herb: HerbalEntry) => (
                <DevotionistStyleCard
                  key={herb.id}
                  variant="callout"
                  colorScheme="green"
                  icon={<Leaf className="w-5 h-5" />}
                  title={herb.name}
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-700 font-medium mb-1">Virtues:</p>
                      <div className="flex flex-wrap gap-1">
                        {herb.virtues.map((virtue, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs font-medium bg-green-200 text-green-900 border border-green-300">
                            {virtue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-slate-800">
                      <strong className="text-green-900">Preparation:</strong> {herb.preparation}
                    </div>
                    <div className="text-xs text-slate-800">
                      <strong className="text-green-900">Dosage:</strong> {herb.dosage}
                    </div>
                    <div className="pt-2 border-t border-green-200">
                      <div className="flex gap-2 text-xs text-slate-700">
                        <span>Ruler: {herb.planetaryRuler}</span>
                        <span>•</span>
                        <span>{herb.zodiacSign}</span>
                      </div>
                    </div>
                    {herb.contraindications.length > 0 && (
                      <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                        <strong>Caution:</strong> {herb.contraindications[0]}
                      </div>
                    )}
                  </div>
                </DevotionistStyleCard>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-slate-700">No herbal remedies found. Try different search terms.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'acupuncture' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {acupunctureResults.length > 0 ? (
              acupunctureResults.map((formula: AcupunctureEntry) => (
                <DevotionistStyleCard
                  key={formula.id}
                  variant="callout"
                  colorScheme="cyan"
                  icon={<Activity className="w-5 h-5" />}
                  title={formula.name}
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-900 font-medium mb-1">Meridians:</p>
                      <div className="flex flex-wrap gap-1">
                        {formula.meridians.map((meridian, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs font-medium bg-cyan-200 text-cyan-900 border border-cyan-300">
                            {meridian}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-900 font-medium mb-1">Indications:</p>
                      <div className="flex flex-wrap gap-1">
                        {formula.indications.map((ind, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs font-medium bg-cyan-100 text-slate-900 border border-cyan-300">
                            {ind}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-cyan-200">
                      <div className="text-xs text-slate-800">
                        <strong className="text-cyan-900">Points:</strong> {formula.points.join(', ')}
                      </div>
                    </div>
                  </div>
                </DevotionistStyleCard>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-slate-700">No acupuncture formulas found. Try different search terms.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

