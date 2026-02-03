"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { CastResult, CastingMethod } from "@/lib/sortilegeIntelligence"
import { getTarotCardImageByName } from "@/lib/tarotApiService"
import { 
  Dice6, 
  Gem, 
  Square, 
  Circle, 
  TreePine,
  Sparkles,
  Target,
  AlertTriangle
} from "lucide-react"

interface SortilegeCastingInterfaceProps {
  castResult: CastResult
  isAnimating?: boolean
}

export function SortilegeCastingInterface({ 
  castResult, 
  isAnimating = false 
}: SortilegeCastingInterfaceProps) {
  // Validate castResult
  if (!castResult) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-red-200 rounded-2xl shadow-md">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-amber-900 font-semibold mb-2">No Cast Result</h3>
          <p className="text-slate-700">Cast result data is missing.</p>
        </CardContent>
      </Card>
    )
  }

  const { method, cast, interpretation } = castResult

  // Validate required fields
  if (!method || !cast || !interpretation) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-yellow-200 rounded-2xl shadow-md">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-amber-900 font-semibold mb-2">Incomplete Cast Data</h3>
          <p className="text-slate-700">Some cast data is missing. Please try generating a new reading.</p>
        </CardContent>
      </Card>
    )
  }

  const getMethodIcon = () => {
    switch (method) {
      case 'dice':
        return <Dice6 className="w-8 h-8" />
      case 'stones':
        return <Gem className="w-8 h-8" />
      case 'cards':
        return <Square className="w-8 h-8" />
      case 'coins':
        return <Circle className="w-8 h-8" />
      case 'sticks':
        return <TreePine className="w-8 h-8" />
      default:
        return <Target className="w-8 h-8" />
    }
  }

  const getMethodColor = () => {
    switch (method) {
      case 'dice':
        return 'text-amber-400 border-amber-500/30 bg-amber-600/10'
      case 'stones':
        return 'text-blue-400 border-blue-500/30 bg-blue-600/10'
      case 'cards':
        return 'text-purple-400 border-purple-500/30 bg-purple-600/10'
      case 'coins':
        return 'text-yellow-400 border-yellow-500/30 bg-yellow-600/10'
      case 'sticks':
        return 'text-green-400 border-green-500/30 bg-green-600/10'
      default:
        return 'text-slate-400 border-slate-500/30 bg-slate-600/10'
    }
  }

  /**
   * Get stick styling based on symbol
   */
  const getStickStyle = (symbol: string) => {
    const stickMap: { [key: string]: { emoji: string; gradient: string; shadow: string; border: string; color: string } } = {
      'Growth': {
        emoji: '🌱',
        gradient: 'from-green-400 via-emerald-500 to-green-600',
        shadow: 'shadow-green-500/50',
        border: 'border-green-400/60',
        color: 'text-green-300'
      },
      'Protection': {
        emoji: '🛡️',
        gradient: 'from-blue-400 via-indigo-500 to-blue-600',
        shadow: 'shadow-blue-500/50',
        border: 'border-blue-400/60',
        color: 'text-blue-300'
      },
      'Wisdom': {
        emoji: '📜',
        gradient: 'from-purple-400 via-violet-500 to-purple-600',
        shadow: 'shadow-purple-500/50',
        border: 'border-purple-400/60',
        color: 'text-purple-300'
      },
      'Change': {
        emoji: '🔄',
        gradient: 'from-orange-400 via-amber-500 to-orange-600',
        shadow: 'shadow-orange-500/50',
        border: 'border-orange-400/60',
        color: 'text-orange-300'
      },
      'Stability': {
        emoji: '🏔️',
        gradient: 'from-stone-400 via-gray-500 to-stone-600',
        shadow: 'shadow-stone-500/50',
        border: 'border-stone-400/60',
        color: 'text-stone-300'
      },
      'Journey': {
        emoji: '🛤️',
        gradient: 'from-cyan-400 via-teal-500 to-cyan-600',
        shadow: 'shadow-cyan-500/50',
        border: 'border-cyan-400/60',
        color: 'text-cyan-300'
      }
    }

    return stickMap[symbol] || {
      emoji: '🌿',
      gradient: 'from-slate-400 via-slate-500 to-slate-600',
      shadow: 'shadow-slate-500/50',
      border: 'border-slate-400/60',
      color: 'text-slate-300'
    }
  }

  /**
   * Get gemstone styling based on symbol
   */
  const getGemstoneStyle = (symbol: string) => {
    const gemstoneMap: { [key: string]: { emoji: string; gradient: string; shadow: string; border: string } } = {
      'Sun': {
        emoji: '💎',
        gradient: 'from-yellow-400 via-amber-500 to-yellow-600',
        shadow: 'shadow-yellow-500/50',
        border: 'border-yellow-400/60'
      },
      'Moon': {
        emoji: '🔮',
        gradient: 'from-slate-200 via-blue-100 to-slate-300',
        shadow: 'shadow-blue-300/50',
        border: 'border-slate-300/60'
      },
      'Star': {
        emoji: '✨',
        gradient: 'from-white via-blue-50 to-white',
        shadow: 'shadow-white/40',
        border: 'border-white/50'
      },
      'Tree': {
        emoji: '💚',
        gradient: 'from-emerald-400 via-green-500 to-emerald-600',
        shadow: 'shadow-emerald-500/50',
        border: 'border-emerald-400/60'
      },
      'Water': {
        emoji: '💧',
        gradient: 'from-blue-300 via-cyan-400 to-blue-500',
        shadow: 'shadow-blue-400/50',
        border: 'border-blue-400/60'
      },
      'Fire': {
        emoji: '🔥',
        gradient: 'from-red-400 via-orange-500 to-red-600',
        shadow: 'shadow-red-500/50',
        border: 'border-red-400/60'
      },
      'Earth': {
        emoji: '🟤',
        gradient: 'from-amber-600 via-orange-700 to-amber-800',
        shadow: 'shadow-amber-700/50',
        border: 'border-amber-600/60'
      },
      'Air': {
        emoji: '💜',
        gradient: 'from-purple-300 via-violet-400 to-purple-500',
        shadow: 'shadow-purple-400/50',
        border: 'border-purple-400/60'
      }
    }

    return gemstoneMap[symbol] || {
      emoji: '💎',
      gradient: 'from-slate-400 via-slate-500 to-slate-600',
      shadow: 'shadow-slate-500/50',
      border: 'border-slate-400/60'
    }
  }

  /**
   * Render dice face with proper pip patterns
   */
  const renderDiceFace = (value: number) => {
    const pipSize = 6
    const pipColor = '#1a1a2e'
    const positions: { [key: number]: Array<{ x: number; y: number }> } = {
      1: [{ x: 50, y: 50 }], // Center
      2: [{ x: 25, y: 25 }, { x: 75, y: 75 }], // Diagonal corners
      3: [{ x: 25, y: 25 }, { x: 50, y: 50 }, { x: 75, y: 75 }], // Diagonal line
      4: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 75 }, { x: 75, y: 75 }], // Four corners
      5: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 50, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }], // Four corners + center
      6: [{ x: 25, y: 20 }, { x: 75, y: 20 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 25, y: 80 }, { x: 75, y: 80 }] // Two columns of three
    }

    const pips = positions[value] || positions[1]

    return (
      <div className="relative w-full h-full">
        {pips.map((pip, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-slate-800"
            style={{
              width: `${pipSize}px`,
              height: `${pipSize}px`,
              left: `${pip.x}%`,
              top: `${pip.y}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}
          />
        ))}
      </div>
    )
  }

  const renderDice = () => {
    if (method !== 'dice') return null

    return (
      <div className="relative w-full h-64 flex flex-col items-center justify-center">
        {/* Circle */}
        {cast.circle && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ duration: 0.5 }}
            className="absolute border-2 border-amber-400/50 rounded-full"
            style={{
              width: `${cast.circle.radius * 2}%`,
              height: `${cast.circle.radius * 2}%`,
              left: `${cast.circle.center.x - cast.circle.radius}%`,
              top: `${cast.circle.center.y - cast.circle.radius}%`
            }}
          />
        )}

        {/* Inside Circle Indicator - Above dice */}
        {cast.insideCircle !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 }}
            className="mb-4 relative z-10"
          >
            <div className="bg-amber-100 border border-amber-300 rounded-xl px-4 py-2">
              <span className="text-amber-800 text-sm font-medium">
                {cast.insideCircle} of {cast.objects.length} inside circle
              </span>
            </div>
          </motion.div>
        )}

        {/* Dice - Displayed in a row */}
        <div className="flex items-center justify-center gap-6 relative z-10">
          {cast.objects.map((obj, index) => {
            const diceValue = obj.value || 1
            const clampedValue = Math.max(1, Math.min(6, Math.floor(diceValue)))
            
            return (
              <motion.div
                key={obj.id}
                initial={{ 
                  scale: 0, 
                  rotate: -180,
                  y: -50
                }}
                animate={{ 
                  scale: 1,
                  rotate: obj.orientation || 0,
                  y: 0
                }}
                transition={{ 
                  duration: 0.8,
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 120
                }}
                className="relative"
              >
                {/* Proper Dice Face */}
                <div 
                  className="w-16 h-16 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-400 rounded-lg shadow-lg relative overflow-hidden"
                  style={{
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                  }}
                >
                  {renderDiceFace(clampedValue)}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Total Value - Below dice */}
        {cast.totalValue !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mt-4 relative z-10"
          >
            <div className="bg-amber-100 border border-amber-300 rounded-xl px-4 py-2">
              <span className="text-amber-800 font-semibold">Total: {cast.totalValue}</span>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  const renderStones = () => {
    if (method !== 'stones') return null

    return (
      <div className="relative w-full flex flex-col items-center justify-center py-8">
        {/* Stones - Displayed in a row */}
        <div className="flex items-center justify-center gap-6 flex-wrap relative z-10">
          {cast.objects.map((stone, index) => {
            const gemstoneStyle = getGemstoneStyle(stone.symbol || '')
            
            return (
              <motion.div
                key={stone.id}
                initial={{ 
                  scale: 0, 
                  rotate: -180,
                  y: -50
                }}
                animate={{ 
                  scale: 1,
                  rotate: stone.orientation || 0,
                  y: 0
                }}
                transition={{ 
                  duration: 0.8,
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 120
                }}
                className="flex flex-col items-center gap-2"
              >
                {/* Gemstone Visual */}
                <div 
                  className={`relative w-20 h-20 rounded-full border-2 ${gemstoneStyle.border} bg-gradient-to-br ${gemstoneStyle.gradient} flex items-center justify-center shadow-xl ${gemstoneStyle.shadow}`}
                  style={{
                    boxShadow: `0 8px 16px rgba(0, 0, 0, 0.3), 0 0 20px ${gemstoneStyle.shadow.replace('shadow-', '').replace('/50', '')}40, inset 0 2px 4px rgba(255, 255, 255, 0.3)`
                  }}
                >
                  {/* Shine effect */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-30"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), transparent 60%)'
                    }}
                  />
                  {/* Gemstone emoji */}
                  <div className="relative z-10 text-2xl">
                    {gemstoneStyle.emoji}
                  </div>
                </div>
                {/* Symbol name */}
                <div className="text-center">
                  <div className="text-xs font-semibold text-amber-900">
                    {stone.symbol}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderCards = () => {
    if (method !== 'cards') return null

    return (
      <div className="relative w-full flex items-center justify-center gap-6 py-8">
        {cast.objects.map((card, index) => {
          const isReversed = card.orientation === 180
          const cardImage = getTarotCardImageByName(card.symbol || '')
          
          return (
            <motion.div
              key={card.id}
              initial={{ 
                scale: 0, 
                rotate: -180,
                y: -100
              }}
              animate={{ 
                scale: 1,
                rotate: 0,
                y: 0
              }}
              transition={{ 
                duration: 0.6,
                delay: index * 0.2,
                type: "spring",
                stiffness: 120
              }}
              className="flex flex-col items-center gap-3"
            >
              {/* Card Image */}
              <div className="relative">
                <div className={`relative w-32 h-48 rounded-lg overflow-hidden border-2 border-amber-500/50 ${isReversed ? 'transform rotate-180' : ''}`}>
                  <img
                    src={cardImage}
                    alt={card.symbol || 'Tarot Card'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/tarot/major_00_the_fool.png.png'
                    }}
                  />
                </div>
                {isReversed && (
                  <div className="absolute top-2 right-2 bg-red-500/80 text-white text-xs px-2 py-1 rounded">
                    Reversed
                  </div>
                )}
              </div>
              {/* Card Name */}
              <div className="text-center">
                <div className="text-sm font-semibold text-amber-900 mb-1">
                  {card.symbol}
                </div>
                <div className="text-xs text-slate-600">
                  {isReversed ? 'Reversed' : 'Upright'}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  const renderCoins = () => {
    if (method !== 'coins') return null

    return (
      <div className="relative w-full flex flex-col items-center justify-center py-8">
        {/* Coins - Displayed in a row */}
        <div className="flex items-center justify-center gap-6 relative z-10">
          {cast.objects.map((coin, index) => {
            const isHeads = coin.symbol === 'Heads'
            const isFlipped = coin.orientation === 180
            
            return (
              <motion.div
                key={coin.id}
                initial={{ 
                  scale: 0, 
                  rotate: -180,
                  y: -50
                }}
                animate={{ 
                  scale: 1,
                  rotate: 0,
                  y: 0
                }}
                transition={{ 
                  duration: 0.8,
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 120
                }}
                className="flex flex-col items-center gap-2"
              >
                {/* Traditional I Ching Coin - Round with square hole */}
                <div 
                  className={`relative w-20 h-20 rounded-full border-4 ${
                    isHeads 
                      ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border-amber-500/80 shadow-amber-500/50' 
                      : 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 border-slate-400/80 shadow-slate-400/50'
                  } flex items-center justify-center shadow-xl`}
                  style={{
                    boxShadow: `0 8px 16px rgba(0, 0, 0, 0.4), 0 0 20px ${isHeads ? 'rgba(245, 158, 11, 0.3)' : 'rgba(148, 163, 184, 0.3)'}, inset 0 2px 4px rgba(255, 255, 255, 0.4)`
                  }}
                >
                  {/* Shine effect */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-40"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.7), transparent 60%)'
                    }}
                  />
                  
                  {/* Square hole in center (traditional Chinese coin style) */}
                  <div 
                    className={`absolute w-8 h-8 ${
                      isHeads ? 'bg-amber-700/30' : 'bg-slate-600/30'
                    } transform rotate-45`}
                    style={{
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                  
                  {/* Symbol - Yang (☰) for Heads, Yin (☷) for Tails */}
                  <div className="relative z-10 text-2xl font-bold">
                    {isHeads ? '☰' : '☷'}
                  </div>
                </div>
                
                {/* Coin result label */}
                <div className="text-center">
                  <div className="text-xs font-semibold text-amber-900">
                    {isHeads ? 'Yang' : 'Yin'}
                  </div>
                  <div className="text-xs text-slate-600">
                    {isHeads ? 'Heads' : 'Tails'}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Total Value - Below coins */}
        {cast.totalValue !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="mt-4 relative z-10"
            >
              <div className="bg-amber-100 border border-amber-300 rounded-xl px-4 py-2">
                <span className="text-amber-800 font-semibold">Total: {cast.totalValue}</span>
              </div>
            </motion.div>
        )}
      </div>
    )
  }

  const renderSticks = () => {
    if (method !== 'sticks') return null

    return (
      <div className="relative w-full flex flex-col items-center justify-center py-8">
        {/* Sticks - Displayed in a row */}
        <div className="flex items-center justify-center gap-6 flex-wrap relative z-10">
          {cast.objects.map((stick, index) => {
            const stickStyle = getStickStyle(stick.symbol || '')
            
            return (
              <motion.div
                key={stick.id}
                initial={{ 
                  scale: 0, 
                  rotate: -90,
                  y: -50
                }}
                animate={{ 
                  scale: 1,
                  rotate: 0,
                  y: 0
                }}
                transition={{ 
                  duration: 0.8,
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 120
                }}
                className="flex flex-col items-center gap-2"
              >
                {/* Stick Visual - Elongated with rounded ends */}
                <div 
                  className={`relative w-4 h-20 rounded-full border-2 ${stickStyle.border} bg-gradient-to-b ${stickStyle.gradient} flex items-center justify-center shadow-xl ${stickStyle.shadow}`}
                  style={{
                    boxShadow: `0 6px 12px rgba(0, 0, 0, 0.3), 0 0 15px ${stickStyle.shadow.replace('shadow-', '').replace('/50', '')}40, inset 0 2px 4px rgba(255, 255, 255, 0.3)`
                  }}
                >
                  {/* Shine effect */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-30"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%, rgba(0, 0, 0, 0.2) 100%)'
                    }}
                  />
                  {/* Symbol emoji */}
                  <div className="relative z-10 text-lg">
                    {stickStyle.emoji}
                  </div>
                </div>
                
                {/* Symbol name */}
                <div className="text-center">
                  <div className={`text-xs font-semibold ${stickStyle.color}`}>
                    {stick.symbol}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
      <CardContent className="p-6">
        {/* Method Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="text-amber-700">
            {getMethodIcon()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-amber-900 capitalize">
              {method} Casting
            </h3>
            <p className="text-sm text-slate-600">
              {interpretation.primary}
            </p>
          </div>
        </div>

        {/* Casting Visualization */}
        <div className="mb-6">
          <AnimatePresence mode="wait">
            {isAnimating ? (
              <motion.div
                key="animating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-64 relative"
              >
                {/* Static Wand Icon */}
                <div className={getMethodColor().split(' ')[0]}>
                  {getMethodIcon()}
                </div>
                
                {/* Twinkling Sparkles around the wand */}
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 360) / 8
                  const radius = 60
                  const x = Math.cos((angle * Math.PI) / 180) * radius
                  const y = Math.sin((angle * Math.PI) / 180) * radius
                  
                  return (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 1.5 + (i * 0.2),
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-amber-700" />
                    </motion.div>
                  )
                })}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {renderDice()}
                {renderStones()}
                {renderCards()}
                {renderCoins()}
                {renderSticks()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Interpretation */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              Interpretation
            </h4>
            <p className="text-slate-700 text-sm leading-relaxed">
              {interpretation.detailed}
            </p>
          </div>

          {/* Symbols */}
          {interpretation.symbols.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-amber-800 mb-2">Symbols</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {interpretation.symbols.map((symbol, index) => (
                  <div
                    key={index}
                    className="bg-white border border-amber-200 rounded-xl p-3"
                  >
                    <div className="font-semibold text-sm text-amber-900 mb-1">
                      {symbol.name}
                    </div>
                    <div className="text-xs text-slate-700">
                      {symbol.meaning}
                    </div>
                    <div className="text-xs text-slate-600 mt-1 italic">
                      {symbol.significance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

