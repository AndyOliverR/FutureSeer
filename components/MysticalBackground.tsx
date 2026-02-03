"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface MysticalBackgroundProps {
  type?: 'personalized' | 'reading' | 'tool'
  userProfile?: any
  tool?: string
  theme?: string
  className?: string
  children?: React.ReactNode
  fallbackColor?: string
  showOverlay?: boolean
  animated?: boolean
}

export function MysticalBackground({
  type,
  userProfile,
  tool,
  theme,
  className,
  children,
  fallbackColor,
  showOverlay = true,
  animated = true
}: MysticalBackgroundProps) {
  return (
    <div
      className={cn(
        'relative min-h-screen w-full overflow-hidden starfield-ultra-sharp',
        className
      )}
    >
      {/* Overlay */}
      {showOverlay && (
        <div className={cn(
          'absolute inset-0',
          animated ? 'animate-pulse' : '',
          'bg-gradient-to-br from-black/20 via-purple-900/10 to-black/20'
        )} />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Mystical Particles Effect */}
      {animated && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400/30 rounded-full animate-ping" />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-400/30 rounded-full animate-bounce" />
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-green-400/40 rounded-full animate-ping" />
        </div>
      )}
    </div>
  )
}

// Tool Background Component
interface ToolBackgroundProps {
  tool: string
  className?: string
  children?: React.ReactNode
  showOverlay?: boolean
  animated?: boolean
}

export function ToolBackground({
  tool,
  className,
  children,
  showOverlay = true,
  animated = true
}: ToolBackgroundProps) {
  return (
    <MysticalBackground
      type="tool"
      tool={tool}
      className={className}
      showOverlay={showOverlay}
      animated={animated}
    >
      {children}
    </MysticalBackground>
  )
}

// Reading Background Component
interface ReadingBackgroundProps {
  tool: string
  theme?: string
  className?: string
  children?: React.ReactNode
  showOverlay?: boolean
  animated?: boolean
}

export function ReadingBackground({
  tool,
  theme,
  className,
  children,
  showOverlay = true,
  animated = true
}: ReadingBackgroundProps) {
  return (
    <MysticalBackground
      type="reading"
      tool={tool}
      theme={theme}
      className={className}
      showOverlay={showOverlay}
      animated={animated}
    >
      {children}
    </MysticalBackground>
  )
}

// Personalized Background Component
interface PersonalizedBackgroundProps {
  userProfile: any
  tool?: string
  className?: string
  children?: React.ReactNode
  showOverlay?: boolean
  animated?: boolean
}

export function PersonalizedBackground({
  userProfile,
  tool,
  className,
  children,
  showOverlay = true,
  animated = true
}: PersonalizedBackgroundProps) {
  return (
    <MysticalBackground
      type="personalized"
      userProfile={userProfile}
      tool={tool}
      className={className}
      showOverlay={showOverlay}
      animated={animated}
    >
      {children}
    </MysticalBackground>
  )
}

// Mystical Card Component with Background
interface MysticalCardProps {
  tool?: string
  userProfile?: any
  className?: string
  children?: React.ReactNode
  showBackground?: boolean
  showOverlay?: boolean
  animated?: boolean
}

export function MysticalCard({
  tool,
  userProfile,
  className,
  children,
  showBackground = true,
  showOverlay = true,
  animated = true
}: MysticalCardProps) {
  if (!showBackground) {
    return (
      <div className={cn(
        'relative rounded-lg border border-white/10 backdrop-blur-sm bg-white/5',
        className
      )}>
        {children}
      </div>
    )
  }

  return (
    <div className={cn(
      'relative rounded-lg overflow-hidden',
      className
    )}>
      <MysticalBackground
        type={userProfile ? 'personalized' : 'tool'}
        userProfile={userProfile}
        tool={tool}
        showOverlay={showOverlay}
        animated={animated}
      >
        <div className="p-6">
          {children}
        </div>
      </MysticalBackground>
    </div>
  )
} 