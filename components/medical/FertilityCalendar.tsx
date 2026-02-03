'use client'

import { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Info, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { FertilityCalendar as FertilityCalendarType, FertileWindow, generateFertilityCalendar, getOptimalConceptionTiming } from '@/lib/medical/fertilityCalculator'

interface FertilityCalendarProps {
  natalDate: string
}

export function FertilityCalendar({ natalDate }: FertilityCalendarProps) {
  const currentDate = new Date()
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())
  
  const calendar = generateFertilityCalendar(natalDate, month, year)
  const optimalTiming = getOptimalConceptionTiming(natalDate)
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (month === 1) {
        setMonth(12)
        setYear(year - 1)
      } else {
        setMonth(month - 1)
      }
    } else {
      if (month === 12) {
        setMonth(1)
        setYear(year + 1)
      } else {
        setMonth(month + 1)
      }
    }
  }
  
  const getDayClassName = (window: FertileWindow) => {
    const baseClasses = "h-12 w-full rounded-lg font-medium text-sm transition-all flex flex-col items-center justify-center relative"
    
    switch (window.type) {
      case 'optimal':
        return `${baseClasses} bg-amber-500 text-white shadow-lg shadow-amber-500/50`
      case 'fertile':
        return `${baseClasses} bg-amber-500/50 text-amber-300 border border-amber-500/30`
      case 'neutral':
        return `${baseClasses} bg-slate-700/30 text-slate-400`
      case 'avoid':
        return `${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`
      default:
        return `${baseClasses} bg-slate-800/50 text-slate-500`
    }
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate()
  }
  
  const daysInMonth = getDaysInMonth(month, year)
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
  
  // Create calendar grid
  const calendarDays: (FertileWindow | null)[] = []
  
  // Add empty slots for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  
  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const window = calendar.fertileWindows.find(w => {
      const dateObj = new Date(w.date)
      return dateObj.getDate() === day
    })
    calendarDays.push(window || null)
  }
  
  return (
    <div className="w-full space-y-6">
      {/* Optimal Timing Banner */}
      {optimalTiming.nextOptimalWindow && (
        <Card className="backdrop-blur-md bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Clock className="w-6 h-6 text-amber-400" />
              <div>
                <p className="font-bold text-white">Next Optimal Window</p>
                <p className="text-sm text-slate-300">
                  {optimalTiming.daysUntilWindow} days away · {new Date(optimalTiming.nextOptimalWindow).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-400">{optimalTiming.confidence}%</p>
              <p className="text-xs text-slate-400">Confidence</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-amber-400" />
        </button>
        
        <h2 className="text-2xl font-bold text-white">
          {monthNames[month - 1]} {year}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-all"
        >
          <ChevronRight className="w-5 h-5 text-amber-400" />
        </button>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day labels */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-slate-400 font-semibold py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((window, idx) => {
          if (!window) {
            return <div key={idx} className="h-12" />
          }
          
          const day = new Date(window.date).getDate()
          
          return (
            <motion.div
              key={idx}
              className={getDayClassName(window)}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {day}
              {window.genderPrediction && (
                <span className="absolute top-1 right-1 text-xs">
                  {window.genderPrediction === 'male' ? '♂' : '♀'}
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded" />
          <span className="text-sm text-slate-300">Optimal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500/50 border border-amber-500/30 rounded" />
          <span className="text-sm text-slate-300">Fertile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-700/30 rounded" />
          <span className="text-sm text-slate-300">Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500/20 border border-red-500/30 rounded" />
          <span className="text-sm text-slate-300">Avoid</span>
        </div>
      </div>
      
      {/* Astrological Info */}
      {calendar.optimalConceptionDates.length > 0 && (
        <Card className="backdrop-blur-md bg-slate-800/20 border border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-300">
              <Info className="w-5 h-5" />
              Astrological Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-slate-400 mb-2">Optimal Conception Dates:</p>
              <div className="flex flex-wrap gap-2">
                {calendar.optimalConceptionDates.map((date, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-amber-500/20 text-amber-300">
                    {new Date(date).toLocaleDateString()}
                  </Badge>
                ))}
              </div>
            </div>
            
            {calendar.genderPredictionWindows.male.length > 0 && (
              <div>
                <p className="text-sm text-slate-400 mb-2">Male-favorable Periods:</p>
                <div className="flex flex-wrap gap-2">
                  {calendar.genderPredictionWindows.male.slice(0, 3).map((date, idx) => (
                    <Badge key={idx} variant="outline" className="border-blue-500/30 text-blue-300">
                      {new Date(date).toLocaleDateString()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {calendar.genderPredictionWindows.female.length > 0 && (
              <div>
                <p className="text-sm text-slate-400 mb-2">Female-favorable Periods:</p>
                <div className="flex flex-wrap gap-2">
                  {calendar.genderPredictionWindows.female.slice(0, 3).map((date, idx) => (
                    <Badge key={idx} variant="outline" className="border-pink-500/30 text-pink-300">
                      {new Date(date).toLocaleDateString()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Badge component
function Badge({ children, className, variant }: { children: React.ReactNode; className?: string; variant?: string }) {
  return (
    <span className={`px-3 py-1 rounded-lg text-xs ${className}`}>
      {children}
    </span>
  )
}

