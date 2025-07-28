"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/use-toast'
import { Crown, Shield, User, Zap, LogOut } from 'lucide-react'

interface UserMode {
  name: string
  email: string
  description: string
  icon: React.ReactNode
  claims: any
  color: string
}

const userModes: UserMode[] = [
  {
    name: 'God Mode',
    email: 'andyrozario@hotmail.com',
    description: 'Full superadmin access to everything',
    icon: <Crown className="w-5 h-5" />,
    claims: {
      superadmin: true,
      admin: true,
      support: true,
      userManagement: true,
      logs: true,
      codeEditor: true,
      billing: true,
      featureFlags: true,
      dataExport: true,
      impersonate: true,
      deleteUser: true,
      testMode: true
    },
    color: 'bg-gradient-to-r from-amber-500 to-yellow-500'
  },
  {
    name: 'Mary Mode',
    email: 'andyoliverrozario2@gmail.com',
    description: 'Limited admin access for support',
    icon: <Shield className="w-5 h-5" />,
    claims: {
      admin: true,
      support: true,
      userManagement: false,
      logs: true,
      codeEditor: false,
      billing: false,
      featureFlags: false,
      dataExport: false,
      impersonate: false,
      deleteUser: false,
      testMode: true
    },
    color: 'bg-gradient-to-r from-blue-500 to-purple-500'
  },
  {
    name: 'Normal User',
    email: 'andyrozario7@gmail.com',
    description: 'Regular user with no admin access',
    icon: <User className="w-5 h-5" />,
    claims: {
      admin: false,
      support: false,
      userManagement: false,
      logs: false,
      codeEditor: false,
      billing: false,
      featureFlags: false,
      dataExport: false,
      impersonate: false,
      deleteUser: false,
      testMode: false
    },
    color: 'bg-gradient-to-r from-green-500 to-emerald-500'
  },
  {
    name: 'Test Mode',
    email: 'test@futureseer.com',
    description: 'Quick testing access (will be removed on launch)',
    icon: <Zap className="w-5 h-5" />,
    claims: {
      superadmin: true,
      admin: true,
      support: true,
      userManagement: true,
      logs: true,
      codeEditor: true,
      billing: true,
      featureFlags: true,
      dataExport: true,
      impersonate: true,
      deleteUser: true,
      testMode: true
    },
    color: 'bg-gradient-to-r from-red-500 to-pink-500'
  }
]

export function TestModeSwitcher() {
  const { user, isSuperadmin } = useAuth()
  const [switching, setSwitching] = useState(false)
  const { toast } = useToast()

  // Only show in test mode - check if user has test mode access
  // We'll check this by looking for test mode in localStorage or if user is superadmin
  const hasTestModeAccess = isSuperadmin || localStorage.getItem('testMode')

  if (!hasTestModeAccess) {
    return null
  }

  const handleSwitchMode = async (mode: UserMode) => {
    setSwitching(true)
    try {
      // In a real implementation, you would call an API to switch modes
      // For now, we'll simulate the switch by updating localStorage
      localStorage.setItem('testMode', mode.name)
      localStorage.setItem('testModeEmail', mode.email)
      localStorage.setItem('testClaims', JSON.stringify(mode.claims))
      
      toast({
        title: `Switched to ${mode.name}`,
        description: `Now using: ${mode.email}`,
      })

      // Reload the page to apply the new mode
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

  const currentMode = userModes.find(mode => 
    mode.name === localStorage.getItem('testMode')
  ) || userModes[0]

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-2 border-amber-200">
        <CardHeader className="pb-3">
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
            <span className="text-xs text-gray-500">{currentMode.email}</span>
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