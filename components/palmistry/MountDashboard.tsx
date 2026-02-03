"use client"

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PalmMount } from '@/lib/palmistryIntelligence'
import { Crown, Mountain, Sun, Zap, Flame, Heart, Moon } from 'lucide-react'

interface MountDashboardProps {
  mounts: PalmMount[]
}

const mountIcons: { [key: string]: any } = {
  'Mount of Jupiter': Crown,
  'Mount of Saturn': Mountain,
  'Mount of Apollo': Sun,
  'Mount of Mercury': Zap,
  'Mount of Mars': Flame,
  'Mount of Venus': Heart,
  'Mount of Luna': Moon,
}

const mountColors: { [key: string]: { bg: string; border: string; text: string } } = {
  'Mount of Jupiter': { bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-300', text: 'text-yellow-900' },
  'Mount of Saturn': { bg: 'from-gray-50 to-slate-50', border: 'border-gray-300', text: 'text-gray-900' },
  'Mount of Apollo': { bg: 'from-amber-50 to-red-50', border: 'border-amber-300', text: 'text-amber-900' },
  'Mount of Mercury': { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-300', text: 'text-blue-900' },
  'Mount of Mars': { bg: 'from-red-50 to-amber-50', border: 'border-red-300', text: 'text-red-900' },
  'Mount of Venus': { bg: 'from-pink-50 to-rose-50', border: 'border-pink-300', text: 'text-pink-900' },
  'Mount of Luna': { bg: 'from-purple-50 to-indigo-50', border: 'border-purple-300', text: 'text-purple-900' },
}

const getProminenceBadgeColor = (prominence: string) => {
  switch (prominence) {
    case 'very-prominent': return 'bg-red-100 text-red-800 border-red-300'
    case 'prominent': return 'bg-amber-100 text-amber-800 border-amber-300'
    case 'normal': return 'bg-green-100 text-green-800 border-green-300'
    case 'flat': return 'bg-slate-100 text-slate-800 border-slate-300'
    default: return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export const MountDashboard = memo(function MountDashboard({ mounts }: MountDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mounts.map((mount) => {
        const colors = mountColors[mount.name] || mountColors['Mount of Jupiter']
        const Icon = mountIcons[mount.name] || Mountain

        return (
          <motion.div
            key={mount.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Card className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-md hover:shadow-lg transition-shadow duration-200 rounded-2xl`}>
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full bg-white/60 ${colors.text}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className={`font-bold text-sm ${colors.text}`}>
                    {mount.name.replace('Mount of ', '')}
                  </h4>
                </div>
                <Badge className={`${getProminenceBadgeColor(mount.prominence)} text-xs border`}>
                  {mount.prominence}
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="text-slate-500 mb-1">Element</p>
                  <p className={`font-semibold capitalize ${colors.text}`}>{mount.element}</p>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="text-slate-500 mb-1">Energy</p>
                  <p className={`font-semibold ${colors.text}`}>{mount.energy}/10</p>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-slate-600">
                {mount.description}
              </div>

              {/* Interpretation */}
              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-600 mb-1">Reading</p>
                <p className="text-xs text-slate-700 leading-relaxed">{mount.interpretation}</p>
              </div>

              {/* Influence */}
              {mount.influence && (
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-1">Influence</p>
                  <p className="text-xs text-slate-700">{mount.influence}</p>
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>
        )
      })}
    </div>
  )
})
