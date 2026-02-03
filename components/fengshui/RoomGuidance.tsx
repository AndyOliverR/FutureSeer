"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RoomGuidance as RoomGuidanceType } from '@/lib/fengshui/fengShuiIntelligence'
import { Home, ChevronDown, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface RoomGuidanceProps {
  rooms: RoomGuidanceType[]
}

const STATUS_COLORS = {
  'optimal': 'bg-green-100 text-green-900 border-green-300',
  'good': 'bg-amber-100 text-amber-900 border-amber-300',
  'warning': 'bg-orange-100 text-orange-900 border-orange-300',
  'needs-attention': 'bg-red-100 text-red-900 border-red-300'
}

const STATUS_ICONS = {
  'optimal': CheckCircle,
  'good': CheckCircle,
  'warning': AlertTriangle,
  'needs-attention': XCircle
}

export default function RoomGuidance({ rooms }: RoomGuidanceProps) {
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {rooms.map((room, index) => {
        const StatusIcon = STATUS_ICONS[room.status]
        const isExpanded = expandedRoom === room.room

        return (
          <Card
            key={room.room}
            className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <CardContent className="p-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <Home className="w-5 h-5 text-amber-700" />
                    <div>
                      <h3 className="font-semibold text-amber-900 text-lg">{room.room}</h3>
                      <p className="text-sm text-slate-700 mt-1">{room.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_COLORS[room.status]}`}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {room.status.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-amber-900 font-semibold">
                      {room.energyScore}% Energy
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-slate-700 mb-1">
                      <span className="text-amber-900 font-semibold">Ideal Direction:</span> {room.idealDirection}
                    </p>
                    <p className="text-sm text-slate-700">
                      <span className="text-amber-900 font-semibold">Commanding Position:</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-1">{room.commandingPosition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 mb-2">
                      <span className="text-amber-900 font-semibold">Recommended Colors:</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {room.colors.map((color, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded bg-white/95 text-slate-900 border border-slate-300"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={() => setExpandedRoom(isExpanded ? null : room.room)}
                  className="w-full text-left text-sm text-amber-700 hover:text-amber-900 mb-2 flex items-center gap-2"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  {isExpanded ? 'Hide' : 'Show'} Detailed Recommendations
                </motion.button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-3 border-t border-amber-200"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Furniture Placement
                        </h4>
                        <ul className="text-xs text-slate-700 space-y-1 ml-6">
                          {room.furniturePlacement.map((item, i) => (
                            <li key={i} className="list-disc">{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Element Recommendations
                        </h4>
                        <ul className="text-xs text-slate-700 space-y-1 ml-6">
                          {room.elementRecommendations.map((item, i) => (
                            <li key={i} className="list-disc">{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Enhancements
                        </h4>
                        <ul className="text-xs text-slate-700 space-y-1 ml-6">
                          {room.enhancements.map((item, i) => (
                            <li key={i} className="list-disc">{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          Things to Avoid
                        </h4>
                        <ul className="text-xs text-slate-700 space-y-1 ml-6">
                          {room.avoid.map((item, i) => (
                            <li key={i} className="list-disc">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

