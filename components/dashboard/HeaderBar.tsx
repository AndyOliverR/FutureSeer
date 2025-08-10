import React from "react"
import Link from "next/link"
import { UserMenuDropdown } from "@/components/UserMenuDropdown"
import { useAuth } from "@/hooks/use-auth"

export function HeaderBar() {
  const { user, userProfile } = useAuth()
  
  // Get user info for the dropdown
  const userName = userProfile?.displayName || user?.displayName || "Seeker"
  const userEmail = user?.email || undefined
  const userPhotoURL = userProfile?.photoURL || user?.photoURL || undefined
  
  // Debug: Log photo URL sources with enhanced debugging
  React.useEffect(() => {
    console.log('🔍 HeaderBar Photo Debug:', {
      user_photoURL: user?.photoURL,
      userProfile_photoURL: userProfile?.photoURL,
      final_userPhotoURL: userPhotoURL,
      user_displayName: user?.displayName,
      userProfile_displayName: userProfile?.displayName,
      user_email: user?.email,
      provider_data: user?.providerData?.map(p => ({
        providerId: p.providerId,
        photoURL: p.photoURL,
        displayName: p.displayName
      }))
    })
    
    // Additional Google photo diagnostics
    if (user?.photoURL && user.photoURL.includes('googleusercontent.com')) {
      console.log('🔍 Google Photo Analysis:', {
        originalURL: user.photoURL,
        isGooglePhoto: true,
        hasSize: user.photoURL.includes('s96') || user.photoURL.includes('sz='),
        urlLength: user.photoURL.length
      })
    }
  }, [user?.photoURL, userProfile?.photoURL, userPhotoURL, user?.displayName, userProfile?.displayName, user?.email, user?.providerData])

  return (
    <header className="relative z-50 w-full flex items-center justify-between px-4 py-3 rounded-2xl backdrop-blur-md bg-slate-900/40 border border-slate-700/50 shadow-lg mb-2 card-glow">
      <div className="flex items-center gap-2">
        <Link href="/" className="cursor-pointer">
          <span className="text-2xl font-serif font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 tracking-wide hover:scale-105 transition-transform">
            FutureSeer
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <UserMenuDropdown 
          userName={userName}
          userEmail={userEmail}
          userPhotoURL={userPhotoURL}
        />
      </div>
    </header>
  )
} 