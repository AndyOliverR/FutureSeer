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

  return (
    <header
      className="relative z-50 mb-2 rounded-2xl backdrop-blur-md bg-slate-900/40 border border-slate-700/50 shadow-lg card-glow py-3"
      style={{ 
        width: '100vw', 
        marginLeft: 'calc(-50vw + 50%)', 
        marginRight: 'calc(-50vw + 50%)',
        boxSizing: 'border-box',
        paddingLeft: '1rem',
        paddingRight: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
      data-header-inner
    >
      <div className="flex items-center gap-2">
        <Link href="/" className="cursor-pointer">
          <span className="text-2xl font-semibold text-amber-400 tracking-wide hover:scale-105 transition-transform">
            FutureSeer
          </span>
        </Link>
      </div>
      <div className="flex items-center">
        <UserMenuDropdown 
          userName={userName}
          userEmail={userEmail}
          userPhotoURL={userPhotoURL}
        />
      </div>
    </header>
  )
} 