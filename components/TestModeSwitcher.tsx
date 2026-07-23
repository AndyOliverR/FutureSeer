"use client"

import { useState, useEffect, useMemo } from 'react'
import { devLog } from '@/lib/devLogger';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/use-toast'
import { Crown, Shield, User, Zap, LogOut, X } from 'lucide-react'

interface UserMode {
  name: string
  email: string
  description: string
  icon: React.ReactNode
  claims: Record<string, boolean>
  color: string
}

function firstEmail(raw: string | undefined): string {
  if (!raw?.trim()) return ''
  return raw.split(',')[0]?.trim() || ''
}

function buildUserModes(): UserMode[] {
  const god = firstEmail(process.env.NEXT_PUBLIC_SUPERADMIN_EMAILS)
  const mary = firstEmail(process.env.NEXT_PUBLIC_ADMIN_EMAILS)
  const normal = firstEmail(process.env.NEXT_PUBLIC_SPECIAL_USER_EMAILS)
  const test = firstEmail(process.env.NEXT_PUBLIC_TEST_MODE_EMAIL) || 'test@example.com'

  const modes: UserMode[] = []
  if (god) {
    modes.push({
      name: 'God Mode',
      email: god,
      description: 'Full superadmin access to everything',
      icon: <Crown className="w-5 h-5" />,
      claims: {
        superadmin: true, admin: true, support: true, userManagement: true, logs: true,
        codeEditor: true, billing: true, featureFlags: true, dataExport: true,
        impersonate: true, deleteUser: true, testMode: true
      },
      color: 'bg-gradient-to-r from-amber-500 to-yellow-500'
    })
  }
  if (mary) {
    modes.push({
      name: 'Mary Mode',
      email: mary,
      description: 'Limited admin access for support',
      icon: <Shield className="w-5 h-5" />,
      claims: {
        admin: true, support: true, userManagement: false, logs: true,
        codeEditor: false, billing: false, featureFlags: false, dataExport: false,
        impersonate: false, deleteUser: false, testMode: true
      },
      color: 'bg-gradient-to-r from-blue-500 to-purple-500'
    })
  }
  if (normal) {
    modes.push({
      name: 'Normal User',
      email: normal,
      description: 'Regular user with no admin access',
      icon: <User className="w-5 h-5" />,
      claims: {
        admin: false, support: false, userManagement: false, logs: false,
        codeEditor: false, billing: false, featureFlags: false, dataExport: false,
        impersonate: false, deleteUser: false, testMode: false
      },
      color: 'bg-gradient-to-r from-green-500 to-emerald-500'
    })
  }
  modes.push({
    name: 'Test Mode',
    email: test,
    description: 'Quick testing access (dev only)',
    icon: <Zap className="w-5 h-5" />,
    claims: {
      superadmin: true, admin: true, support: true, userManagement: true, logs: true,
      codeEditor: true, billing: true, featureFlags: true, dataExport: true,
      impersonate: true, deleteUser: true, testMode: true
    },
    color: 'bg-gradient-to-r from-red-500 to-pink-500'
  })
  return modes
}

export function TestModeSwitcher() {
  const { user, isSuperadmin } = useAuth()
  const [switching, setSwitching] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [testMode, setTestMode] = useState<string | null>(null)
  const [testModeEmail, setTestModeEmail] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()
  const userModes = useMemo(() => buildUserModes(), [])

  useEffect(() => {
    // Handle SSR - only run on client
    setIsMounted(true)
    
    // Check localStorage only on client side
    const mode = localStorage.getItem('testMode')
    const email = localStorage.getItem('testModeEmail')
    setTestMode(mode)
    setTestModeEmail(email)
    
    // Always show for testing - remove conditional logic
    setIsVisible(true)
    
    devLog.debug('🔄 TestModeSwitcher mounted on client')
  }, [])

  const handleSwitchMode = async (mode: UserMode) => {
    setSwitching(true)
    try {
      localStorage.setItem('testMode', mode.name)
      localStorage.setItem('testModeEmail', mode.email)
      localStorage.setItem('testClaims', JSON.stringify(mode.claims))

      toast({
        title: `Switched to ${mode.name}`,
        description: `Now using: ${mode.email}`,
      })

      setTimeout(() => {
        window.location.reload()
      }, 1000)

    } catch (error: any) {
      toast({
        title: 'Error switching modes',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setSwitching(false)
    }
  }

  const handleExitTestMode = () => {
    localStorage.removeItem('testMode')
    localStorage.removeItem('testModeEmail')
    localStorage.removeItem('testClaims')
    window.location.reload()
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  // Don't render anything until mounted on client
  if (!isMounted) {
    return null
  }

  if (!isVisible) {
    return null
  }

  const currentMode = userModes.find(mode =>
    mode.name === testMode
  ) || userModes[0]

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-2 border-amber-200">
        <CardHeader className="pb-3 relative">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Test Mode
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              DEV
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600 mb-3">
            Current: <span className="font-semibold">{currentMode.name}</span>
            <br />
            <span className="text-xs text-gray-500">{testModeEmail || currentMode.email}</span>
          </div>

          <div className="space-y-2">
            {userModes.map((mode) => (
              <Button
                key={mode.name}
                onClick={() => handleSwitchMode(mode)}
                disabled={switching || mode.name === currentMode.name}
                variant="outline"
                className={`w-full justify-start ${mode.color} text-white border-0 hover:opacity-80`}
              >
                {mode.icon}
                <div className="ml-2 text-left">
                  <div className="font-semibold">{mode.name}</div>
                  <div className="text-xs opacity-90">{mode.email}</div>
                </div>
              </Button>
            ))}
          </div>

          <div className="pt-2 border-t">
            <Button
              onClick={handleExitTestMode}
              variant="ghost"
              size="sm"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Exit Test Mode
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            This will be removed on launch
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 