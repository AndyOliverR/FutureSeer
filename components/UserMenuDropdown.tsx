"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { signOutUser } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  History, 
  HelpCircle, 
  Shield, 
  Bell,
  Moon,
  ChevronDown,
  Star
} from "lucide-react"

interface UserMenuDropdownProps {
  userName: string
  userEmail?: string
  userPhotoURL?: string
}

export function UserMenuDropdown({ userName, userEmail, userPhotoURL }: UserMenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, userProfile } = useAuth()
  const router = useRouter()

  // Debug: Log photo URL sources
  React.useEffect(() => {
    console.log('🔍 UserMenuDropdown Photo Debug:', {
      userPhotoURL,
      userProfilePhotoURL: userProfile?.photoURL,
      userPhotoURL_direct: user?.photoURL,
      userName,
      userEmail,
      finalPhotoURL: getPhotoURL(),
      hasPhoto: !!getPhotoURL(),
      photoSources: [
        userPhotoURL,
        userProfile?.photoURL,
        user?.photoURL
      ].filter(Boolean)
    })
  }, [userPhotoURL, userProfile?.photoURL, user?.photoURL, userName, userEmail])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    try {
      await signOutUser()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Get the best available photo URL from multiple sources with Google photo optimization
  const getPhotoURL = () => {
    const photoSources = [
      userPhotoURL,
      userProfile?.photoURL,
      user?.photoURL
    ].filter(Boolean)
    
    console.log('📸 Available photo sources:', photoSources)
    
    // Get the first available URL
    let photoURL = photoSources[0] || null
    
    // Optimize Google profile photo URLs for better loading
    if (photoURL && photoURL.includes('googleusercontent.com')) {
      // Replace s96-c with s400-c for higher resolution
      // Add ?sz=400 parameter for better quality
      if (photoURL.includes('s96-c')) {
        photoURL = photoURL.replace('s96-c', 's400-c')
      } else if (!photoURL.includes('sz=')) {
        photoURL = photoURL + (photoURL.includes('?') ? '&' : '?') + 'sz=400'
      }
      console.log('🔄 Optimized Google photo URL:', photoURL)
    }
    
    return photoURL
  }

  const finalPhotoURL = getPhotoURL()
  const isPremium = userProfile?.subscriptionStatus === 'active'

  return (
    <div className="relative z-[9998]" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 p-1 rounded-full hover:bg-slate-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        aria-label="User menu"
      >
        <div className="relative">
          {finalPhotoURL ? (
            <img 
              src={finalPhotoURL} 
              alt={userName}
              className="w-9 h-9 rounded-full object-cover border-2 border-amber-400/30 group-hover:border-amber-400/60 transition-colors"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onLoad={() => {
                console.log('✅ Avatar image loaded successfully:', finalPhotoURL)
              }}
              onError={(e) => {
                console.error('❌ Avatar image failed to load:', {
                  url: finalPhotoURL,
                  error: e.type,
                  timestamp: new Date().toISOString(),
                  userAgent: navigator.userAgent
                })
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex')
              }}
            />
          ) : null}
          <div 
            className={`w-9 h-9 rounded-full bg-gradient-to-br from-amber-400/30 to-yellow-500/30 border-2 border-amber-400/30 group-hover:border-amber-400/60 flex items-center justify-center text-amber-200 font-serif font-bold text-sm transition-all ${finalPhotoURL ? 'hidden' : 'flex'}`}
          >
            {getInitials(userName)}
          </div>
          {isPremium && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Crown className="w-2.5 h-2.5 text-slate-900" />
            </div>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden z-[9999] animate-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-amber-500/10 to-yellow-500/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                {finalPhotoURL ? (
                  <img 
                    src={finalPhotoURL} 
                    alt={userName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/40"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onLoad={() => {
                      console.log('✅ Header avatar image loaded successfully:', finalPhotoURL)
                    }}
                    onError={(e) => {
                      console.error('❌ Header avatar image failed to load:', {
                        url: finalPhotoURL,
                        error: e.type,
                        timestamp: new Date().toISOString()
                      })
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex')
                    }}
                  />
                ) : null}
                <div 
                  className={`w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/30 to-yellow-500/30 border-2 border-amber-400/40 flex items-center justify-center text-amber-200 font-serif font-bold text-lg ${finalPhotoURL ? 'hidden' : 'flex'}`}
                >
                  {getInitials(userName)}
                </div>
                {isPremium && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                    <Crown className="w-3 h-3 text-slate-900" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-semibold text-amber-200 text-lg">{userName}</h3>
                {userEmail && (
                  <p className="text-slate-400 text-sm truncate">{userEmail}</p>
                )}
                {isPremium ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-400 font-medium">Premium Member</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">Free Trial</span>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors group"
            >
              <User className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
              <div>
                <div className="text-slate-200 font-medium">Profile</div>
                <div className="text-xs text-slate-500">Manage your account</div>
              </div>
            </Link>

            <Link
              href="/history"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors group"
            >
              <History className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              <div>
                <div className="text-slate-200 font-medium">Reading History</div>
                <div className="text-xs text-slate-500">View past predictions</div>
              </div>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors group"
            >
              <Settings className="w-5 h-5 text-slate-400 group-hover:text-green-400 transition-colors" />
              <div>
                <div className="text-slate-200 font-medium">Settings</div>
                <div className="text-xs text-slate-500">Preferences & privacy</div>
              </div>
            </Link>

            {!isPremium && (
              <Link
                href="/subscribe"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-yellow-500/10 transition-colors group border-l-2 border-transparent hover:border-amber-400"
              >
                <Crown className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                <div>
                  <div className="text-amber-200 font-medium">Upgrade to Premium</div>
                  <div className="text-xs text-amber-400">Unlock all features</div>
                </div>
              </Link>
            )}

            <div className="h-px bg-slate-700/50 my-2" />

            <Link
              href="/support"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors group"
            >
              <HelpCircle className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
              <div>
                <div className="text-slate-200 font-medium">Help & Support</div>
                <div className="text-xs text-slate-500">Get assistance</div>
              </div>
            </Link>

            <Link
              href="/privacy"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors group"
            >
              <Shield className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <div>
                <div className="text-slate-200 font-medium">Privacy Policy</div>
                <div className="text-xs text-slate-500">Your data protection</div>
              </div>
            </Link>

            <div className="h-px bg-slate-700/50 my-2" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors group text-left"
            >
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
              <div>
                <div className="text-slate-200 group-hover:text-red-300 font-medium transition-colors">Sign Out</div>
                <div className="text-xs text-slate-500">End your session</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
