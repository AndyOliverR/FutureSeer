"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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
  Star,
  MessageSquare
} from "lucide-react"

interface UserMenuDropdownProps {
  userName: string
  userEmail?: string
  userPhotoURL?: string
}

export function UserMenuDropdown({ userName, userEmail, userPhotoURL }: UserMenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, userProfile, signOut } = useAuth()
  const router = useRouter()

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
      // Use the signOut from useAuth context which properly clears all state
      // Note: signOut will reload the page automatically, no need for router.push
      await signOut()
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
        className="group flex items-center gap-2 p-1 pr-0 rounded-full hover:bg-[var(--m3-primary-container)] m3-transition-standard m3-ripple focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] focus:ring-offset-2 focus:ring-offset-[var(--m3-surface)]"
        aria-label="User menu"
      >
        <div className="relative">
          {finalPhotoURL ? (
            <img 
              src={finalPhotoURL} 
              alt={userName}
              className="w-9 h-9 rounded-full object-cover border-2 border-[var(--m3-outline-variant)] group-hover:border-[var(--m3-primary)] m3-transition-standard"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onLoad={() => {
                // Image loaded successfully - no need to log
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
            className={`w-9 h-9 rounded-full bg-[var(--m3-primary-container)] border-2 border-[var(--m3-outline-variant)] group-hover:border-[var(--m3-primary)] flex items-center justify-center text-[var(--m3-on-primary-container)] m3-label-medium m3-transition-standard ${finalPhotoURL ? 'hidden' : 'flex'}`}
          >
            {getInitials(userName)}
          </div>
          {isPremium && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--m3-primary)] rounded-full flex items-center justify-center m3-elevation-2">
              <Crown className="w-2.5 h-2.5 text-[var(--m3-on-primary)]" />
            </div>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-[var(--m3-on-surface-variant)] m3-transition-standard ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              ease: [0.2, 0, 0, 1]
            }}
            className="absolute right-0 top-full mt-2 w-80 bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline-variant)] rounded-2xl overflow-hidden z-[9999] m3-elevation-3 m3-elevation-transition m3-gpu-accelerated"
          >
          {/* User Info Header */}
          <div className="p-4 pb-3 border-b border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)]">
            <div className="flex items-center gap-3">
              <div className="relative">
                {finalPhotoURL ? (
                  <img 
                    src={finalPhotoURL} 
                    alt={userName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[var(--m3-primary)]"
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
                  className={`w-12 h-12 rounded-full bg-[var(--m3-primary-container)] border-2 border-[var(--m3-primary)] flex items-center justify-center text-[var(--m3-on-primary-container)] m3-title-small ${finalPhotoURL ? 'hidden' : 'flex'}`}
                >
                  {getInitials(userName)}
                </div>
                {isPremium && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--m3-primary)] rounded-full flex items-center justify-center m3-elevation-2">
                    <Crown className="w-3 h-3 text-[var(--m3-on-primary)]" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="m3-title-large text-[var(--m3-on-surface)]">{userName}</h3>
                {userEmail && (
                  <p className="m3-body-medium text-[var(--m3-on-surface-variant)] truncate">{userEmail}</p>
                )}
                {isPremium ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-[var(--m3-primary)]" />
                    <span className="m3-label-small text-[var(--m3-primary)]">Premium Member</span>
                  </div>
                ) : (
                  <span className="m3-label-small text-[var(--m3-on-surface-variant)]">Free Trial</span>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--m3-primary-container)] m3-transition-standard group rounded-lg"
            >
              <User className="w-5 h-5 text-[var(--m3-on-surface-variant)] group-hover:text-[var(--m3-primary)] m3-transition-standard" />
              <div>
                <div className="m3-label-large text-[var(--m3-on-surface)]">Profile</div>
                <div className="m3-body-small text-[var(--m3-on-surface-variant)]">Manage your account</div>
              </div>
            </Link>

            <Link
              href="/history"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--m3-primary-container)] m3-transition-standard group rounded-lg"
            >
              <History className="w-5 h-5 text-[var(--m3-on-surface-variant)] group-hover:text-[var(--m3-primary)] m3-transition-standard" />
              <div>
                <div className="m3-label-large text-[var(--m3-on-surface)]">Reading History</div>
                <div className="m3-body-small text-[var(--m3-on-surface-variant)]">View past predictions</div>
              </div>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--m3-primary-container)] m3-transition-standard group rounded-lg"
            >
              <Settings className="w-5 h-5 text-[var(--m3-on-surface-variant)] group-hover:text-[var(--m3-primary)] m3-transition-standard" />
              <div>
                <div className="m3-label-large text-[var(--m3-on-surface)]">Settings</div>
                <div className="m3-body-small text-[var(--m3-on-surface-variant)]">Preferences & privacy</div>
              </div>
            </Link>

            {!isPremium && (
              <Link
                href="/subscribe"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 bg-[var(--m3-primary-container)] hover:bg-[var(--m3-primary-container)]/80 m3-transition-standard group rounded-lg border-l-2 border-[var(--m3-primary)]"
              >
                <Crown className="w-5 h-5 text-[var(--m3-primary)] m3-transition-standard" />
                <div>
                  <div className="m3-label-large text-[var(--m3-on-primary-container)]">Upgrade to Premium</div>
                  <div className="m3-body-small text-[var(--m3-primary)]">Unlock all features</div>
                </div>
              </Link>
            )}

            <div className="h-px bg-[var(--m3-outline-variant)] my-1" />

            <Link
              href="/support"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--m3-primary-container)] m3-transition-standard group rounded-lg"
            >
              <HelpCircle className="w-5 h-5 text-[var(--m3-on-surface-variant)] group-hover:text-[var(--m3-primary)] m3-transition-standard" />
              <div>
                <div className="m3-label-large text-[var(--m3-on-surface)]">Help & Support</div>
                <div className="m3-body-small text-[var(--m3-on-surface-variant)]">Get assistance</div>
              </div>
            </Link>

            <Link
              href="/support/tickets"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--m3-primary-container)] m3-transition-standard group rounded-lg"
            >
              <MessageSquare className="w-5 h-5 text-[var(--m3-on-surface-variant)] group-hover:text-[var(--m3-primary)] m3-transition-standard" />
              <div>
                <div className="m3-label-large text-[var(--m3-on-surface)]">My Tickets</div>
                <div className="m3-body-small text-[var(--m3-on-surface-variant)]">View your support queries</div>
              </div>
            </Link>

            <Link
              href="/privacy"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--m3-primary-container)] m3-transition-standard group rounded-lg"
            >
              <Shield className="w-5 h-5 text-[var(--m3-on-surface-variant)] group-hover:text-[var(--m3-primary)] m3-transition-standard" />
              <div>
                <div className="m3-label-large text-[var(--m3-on-surface)]">Privacy Policy</div>
                <div className="m3-body-small text-[var(--m3-on-surface-variant)]">Your data protection</div>
              </div>
            </Link>

            <div className="h-px bg-[var(--m3-outline-variant)] my-1" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--m3-secondary-container)] m3-transition-standard group text-left rounded-lg"
            >
              <LogOut className="w-5 h-5 text-[var(--m3-on-surface-variant)] group-hover:text-[var(--m3-secondary)] m3-transition-standard" />
              <div>
                <div className="m3-label-large text-[var(--m3-on-surface)] group-hover:text-[var(--m3-secondary)] m3-transition-standard">Sign Out</div>
                <div className="m3-body-small text-[var(--m3-on-surface-variant)]">End your session</div>
              </div>
            </button>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
