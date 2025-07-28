"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/use-toast'
import { Zap, Eye, EyeOff } from 'lucide-react'

export function TestAuth() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (username === 'TEST' && password === 'TEST') {
      setLoading(true)
      
      // Simulate login delay
      setTimeout(() => {
        // Set test mode in localStorage
        localStorage.setItem('testMode', 'Test Mode')
        localStorage.setItem('testModeEmail', 'test@futureseer.com')
        localStorage.setItem('testClaims', JSON.stringify({
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
        }))
        
        toast({
          title: 'Test Login Successful',
          description: 'You are now in Test Mode with full access',
        })
        
        // Reload the page to apply test mode
        window.location.reload()
      }, 1000)
    } else {
      toast({
        title: 'Invalid Credentials',
        description: 'Please use TEST/TEST to login',
        variant: 'destructive'
      })
    }
  }

  const handleTestLogout = () => {
    localStorage.removeItem('testMode')
    localStorage.removeItem('testModeEmail')
    localStorage.removeItem('testClaims')
    window.location.reload()
  }

  // Show logout button if already in test mode
  if (localStorage.getItem('testMode')) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Card className="w-64 shadow-lg border-2 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-500" />
              Test Mode Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleTestLogout}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              Exit Test Mode
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-64 shadow-lg border-2 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Quick Test Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTestLogin} className="space-y-3">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
            >
              {loading ? 'Logging in...' : 'TEST Login'}
            </Button>
          </form>
          <div className="text-xs text-gray-500 text-center mt-2">
            Use: TEST / TEST
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 