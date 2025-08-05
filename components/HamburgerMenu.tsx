"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet'
import { 
  Menu, 
  Home, 
  User, 
  Settings, 
  History, 
  LogOut, 
  Crown,
  Sparkles,
  BookOpen,
  Heart,
  Briefcase,
  Activity,
  Plane
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, userProfile, isSuperadmin, isAdmin, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      href: '/dashboard',
      show: !!user
    },
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
      show: !!user
    },
    {
      icon: History,
      label: 'My Journey',
      href: '/history',
      show: !!user
    },
    {
      icon: BookOpen,
      label: 'All Readings',
      href: '/readings',
      show: !!user
    },
    {
      icon: Heart,
      label: 'Love & Relationships',
      href: '/readings?category=love',
      show: !!user
    },
    {
      icon: Briefcase,
      label: 'Career & Money',
      href: '/readings?category=career',
      show: !!user
    },
    {
      icon: Activity,
      label: 'Health & Wellness',
      href: '/readings?category=health',
      show: !!user
    },
    {
      icon: Plane,
      label: 'Travel & Adventure',
      href: '/readings?category=travel',
      show: !!user
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings',
      show: !!user
    }
  ]

  if (!user) {
    return null // Don't show hamburger menu if not signed in
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-slate-900/95 backdrop-blur-xl border-l border-amber-500/30">
        <SheetHeader className="border-b border-amber-500/20 pb-4">
          <SheetTitle className="text-amber-200 font-serif text-xl">
            FutureSeer Menu
          </SheetTitle>
          {userProfile && (
            <div className="text-sm text-amber-300">
              Welcome, {userProfile.displayName || user.email}
            </div>
          )}
          {(isSuperadmin || isAdmin) && (
            <div className="flex items-center gap-2 text-xs text-purple-300">
              <Crown className="h-3 w-3" />
              {isSuperadmin ? 'Super Admin' : 'Admin'}
            </div>
          )}
        </SheetHeader>

        <div className="py-6 space-y-2">
          {menuItems.filter(item => item.show).map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-amber-200 hover:bg-amber-500/10 rounded-lg transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}

          <div className="border-t border-amber-500/20 pt-4 mt-4">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full justify-start text-red-300 hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-center text-xs text-amber-300/60">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Sparkles className="h-3 w-3" />
              <span>Mystical AI Platform</span>
            </div>
            <div className="text-amber-200/40">
              Where ancient wisdom meets AI
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 