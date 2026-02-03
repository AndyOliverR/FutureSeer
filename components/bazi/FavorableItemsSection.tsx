"use client"

import { BaziReading } from "@/lib/baziIntelligence"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Compass, Palette, Hash } from "lucide-react"

interface FavorableItemsSectionProps {
  favorable: BaziReading['favorable']
}

export function FavorableItemsSection({ favorable }: FavorableItemsSectionProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Elements & Colors */}
      <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-2xl">
        <CardContent className="p-5">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-green-700" />
                <h3 className="text-lg font-bold text-green-900">Favorable Elements</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {favorable.elements.map((element, i) => (
                  <Badge 
                    key={i} 
                    className="bg-green-100 text-green-900 border border-green-300 hover:bg-green-200 transition-colors"
                  >
                    {element}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-2">Strengthen these elements for balance and harmony</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-5 h-5 text-purple-700" />
                <h3 className="text-lg font-bold text-purple-900">Favorable Colors</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {favorable.colors.map((color, i) => (
                  <Badge 
                    key={i} 
                    className="bg-purple-100 text-purple-900 border border-purple-300 hover:bg-purple-200 transition-colors"
                  >
                    {color}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-2">Wear or surround yourself with these colors</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Directions & Numbers */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl">
        <CardContent className="p-5">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Compass className="w-5 h-5 text-blue-700" />
                <h3 className="text-lg font-bold text-blue-900">Favorable Directions</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {favorable.directions.map((direction, i) => (
                  <Badge 
                    key={i} 
                    className="bg-blue-100 text-blue-900 border border-blue-300 hover:bg-blue-200 transition-colors"
                  >
                    {direction}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-2">Face or travel in these directions for luck</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-5 h-5 text-indigo-700" />
                <h3 className="text-lg font-bold text-indigo-900">Favorable Numbers</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {favorable.numbers.map((number, i) => (
                  <Badge 
                    key={i} 
                    className="bg-indigo-100 text-indigo-900 border border-indigo-300 hover:bg-indigo-200 transition-colors text-lg px-3 py-1"
                  >
                    {number}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-2">Use these numbers for important dates and choices</p>
            </div>

            {favorable.seasons && favorable.seasons.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-amber-700" />
                  <h3 className="text-lg font-bold text-amber-900">Favorable Seasons</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {favorable.seasons.map((season, i) => (
                    <Badge 
                      key={i} 
                      className="bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors"
                    >
                      {season}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-2">These seasons bring you enhanced energy</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
